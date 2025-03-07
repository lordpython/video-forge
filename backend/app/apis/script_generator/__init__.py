from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
import uuid
import datetime
import databutton as db
import re
import traceback
from openai import OpenAI
from app.apis.story_acquisition import get_stories_for_user
from app.apis.story_generator import get_generated_stories_for_user

router = APIRouter()

class ScriptRequest(BaseModel):
    story_id: str = Field(..., description="ID of the story to generate a script for")
    content_override: Optional[str] = Field(None, description="Override the story content for script generation")
    script_style: Optional[str] = Field("professional", description="Style of the script (professional, conversational, dramatic)")
    include_b_roll: bool = Field(True, description="Whether to include B-roll suggestions")
    max_duration_minutes: Optional[int] = Field(5, description="Target maximum duration in minutes")

class ScriptSection(BaseModel):
    type: str = Field(..., description="Section type (hook, main_content, outro, etc.)")
    content: str = Field(..., description="Content for this section")
    estimated_duration: Optional[str] = Field(None, description="Estimated duration for this section")
    b_roll_suggestions: Optional[List[str]] = Field(None, description="Suggestions for B-roll footage")

class GeneratedScript(BaseModel):
    id: str = Field(..., description="Unique identifier for the generated script")
    story_id: str = Field(..., description="ID of the original story")
    title: str = Field(..., description="Title of the script")
    sections: List[ScriptSection] = Field(..., description="Sections of the script")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Additional metadata about the generated script")
    created_at: str = Field(..., description="Timestamp when the script was generated")
    modified_at: Optional[str] = Field(None, description="Timestamp when the script was last modified")
    approved: bool = Field(False, description="Whether the script has been approved by the user")

class ScriptGenerationResponse(BaseModel):
    id: str = Field(..., description="Unique identifier for the generation job")
    story_id: str = Field(..., description="ID of the story being processed")
    status: str = Field(..., description="Current status of the generation process")
    message: Optional[str] = Field(None, description="Additional message about the generation process")
    created_at: str = Field(..., description="Timestamp when the generation was started")
    completed_at: Optional[str] = Field(None, description="Timestamp when the generation was completed")

class ScriptGenerationsListResponse(BaseModel):
    generations: List[ScriptGenerationResponse] = Field(..., description="List of script generation jobs")

class GeneratedScriptListResponse(BaseModel):
    scripts: List[GeneratedScript] = Field(..., description="List of generated scripts")

class ScriptUpdateRequest(BaseModel):
    title: Optional[str] = Field(None, description="Updated title of the script")
    sections: Optional[List[ScriptSection]] = Field(None, description="Updated sections of the script")
    approved: Optional[bool] = Field(None, description="Whether the script has been approved by the user")

def sanitize_storage_key(key: str) -> str:
    """Sanitize storage key to only allow alphanumeric and ._- symbols"""
    return re.sub(r'[^a-zA-Z0-9._-]', '', key)

def get_script_generations_for_user(user_id: str) -> List[ScriptGenerationResponse]:
    """Get all script generation jobs for a specific user"""
    try:
        generations_data = db.storage.json.get(f"script-generations-{sanitize_storage_key(user_id)}", default=[])
        return [ScriptGenerationResponse(**gen) for gen in generations_data]
    except Exception as e:
        print(f"Error retrieving script generations for user {user_id}: {e}")
        return []

def save_script_generations_for_user(user_id: str, generations: List[dict]) -> None:
    """Save script generation jobs for a specific user"""
    try:
        db.storage.json.put(f"script-generations-{sanitize_storage_key(user_id)}", generations)
    except Exception as e:
        print(f"Error saving script generations for user {user_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to save generation data") from e

def get_generated_scripts_for_user(user_id: str) -> List[GeneratedScript]:
    """Get all generated scripts for a specific user"""
    try:
        scripts_data = db.storage.json.get(f"generated-scripts-{sanitize_storage_key(user_id)}", default=[])
        return [GeneratedScript(**script) for script in scripts_data]
    except Exception as e:
        print(f"Error retrieving generated scripts for user {user_id}: {e}")
        return []

def save_generated_scripts_for_user(user_id: str, scripts: List[dict]) -> None:
    """Save generated scripts for a specific user"""
    try:
        db.storage.json.put(f"generated-scripts-{sanitize_storage_key(user_id)}", scripts)
    except Exception as e:
        print(f"Error saving generated scripts for user {user_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to save generated script") from e

def update_script_generation_status(user_id: str, generation_id: str, status: str, message: str, completed_at: Optional[str] = None):
    """Update the status of a script generation job"""
    try:
        generations = get_script_generations_for_user(user_id)
        generations_dict = [g.dict() for g in generations]
        
        for gen in generations_dict:
            if gen["id"] == generation_id:
                gen["status"] = status
                gen["message"] = message
                if completed_at:
                    gen["completed_at"] = completed_at
                break
        
        save_script_generations_for_user(user_id, generations_dict)
    except Exception as e:
        print(f"Error updating script generation status: {e}")

async def generate_script_with_openai(user_id: str, story_id: str, generation_id: str, request: ScriptRequest):
    """Generate a script using OpenAI in the background"""
    try:
        # Update generation status to in-progress
        update_script_generation_status(user_id, generation_id, "in-progress", "Script generation has started")
        
        # Retrieve OpenAI API key from secrets
        openai_api_key = db.secrets.get("OPENAI_API_KEY")
        if not openai_api_key:
            raise Exception("OpenAI API key not found in secrets")
        
        # Initialize OpenAI client
        client = OpenAI(api_key=openai_api_key)
        
        # Get the story and generated story content
        stories = get_stories_for_user(user_id)
        story = next((s for s in stories if s.id == story_id), None)
        
        if not story:
            raise Exception(f"Story {story_id} not found for user {user_id}")
        
        # Get the generated story content if available and not using override
        story_content = request.content_override
        if not story_content:
            generated_stories = get_generated_stories_for_user(user_id)
            generated_story = next((gs for gs in generated_stories if gs.story_id == story_id), None)
            
            if not generated_story:
                raise Exception(f"No generated story found for story ID {story_id}")
            
            story_content = generated_story.content
        
        # Determine script style prompting
        style_instructions = ""
        if request.script_style == "professional":
            style_instructions = "Create a professional, informative script with clear sections and formal language."
        elif request.script_style == "conversational":
            style_instructions = "Create a conversational, engaging script with a friendly tone as if talking directly to the viewer."
        elif request.script_style == "dramatic":
            style_instructions = "Create a dramatic, emotionally engaging script with powerful language and narrative tension."
        
        # Prepare b-roll instructions
        b_roll_instructions = ""
        if request.include_b_roll:
            b_roll_instructions = "For each section, include detailed B-roll suggestions that would visually enhance the content. Specify exact visuals, camera movements, and visual elements that would complement the narration."
        
        # Generate the script using OpenAI
        update_script_generation_status(user_id, generation_id, "in-progress", "Generating script with AI...")
        
        duration_instruction = ""
        if request.max_duration_minutes:
            duration_instruction = f"The final video should be approximately {request.max_duration_minutes} minutes long. Provide an estimated duration for each section."
        
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": f"""
                You are a professional video scriptwriter specializing in creating structured video scripts 
                from story content. {style_instructions}
                
                Create a video script with the following clearly marked sections:
                1. HOOK (10-15 seconds): A compelling opening that immediately grabs attention
                2. INTRO (20-30 seconds): Brief introduction to the topic and what viewers will learn
                3. MAIN CONTENT (Split into 3-5 logical segments): The core information, organized in a clear structure
                4. OUTRO (20-30 seconds): Conclusion that summarizes key points and includes a call to action
                
                {duration_instruction}
                
                {b_roll_instructions}
                
                Format the script like a professional video production script, with:
                - Clear section headings ([HOOK], [INTRO], [MAIN - SECTION 1], etc.)
                - Narration text that will be spoken
                - Camera directions and visual notes in [brackets]
                - Estimated duration for each section
                
                Your output should be formatted as clear sections that can be easily parsed.
                Each section should be structured like this:
                
                ##SECTION_TYPE## (e.g., ##HOOK##, ##INTRO##, ##MAIN_1##, etc.)
                Content text goes here...
                
                ##DURATION##
                Estimated duration in seconds/minutes
                
                ##B_ROLL##
                - B-roll suggestion 1
                - B-roll suggestion 2
                
                Make sure each section is clearly demarcated with these exact formatting markers.
                """},
                {"role": "user", "content": f"Story Topic: {story.topic}\n\nGenre: {story.genre}\n\nTarget Audience: {story.target_audience}\n\nTone: {story.tone}\n\nContent:\n{story_content}"}
            ],
            temperature=0.7,
            max_tokens=4000
        )
        
        # Process the response to extract the script
        script_content = response.choices[0].message.content
        
        # Parse the script into sections
        sections = parse_script_sections(script_content)
        
        # Calculate metadata
        word_count = sum(len(section["content"].split()) for section in sections)
        
        # Create the script object
        current_time = datetime.datetime.now().isoformat()
        script_id = str(uuid.uuid4())
        
        # Extract title from the story topic or first line if available
        title = story.topic
        if "\n" in script_content and script_content.split("\n")[0].strip().startswith("#"):
            potential_title = script_content.split("\n")[0].strip().lstrip("#").strip()
            if potential_title:
                title = potential_title
        
        # Create structured script sections
        structured_sections = []
        for section in sections:
            structured_sections.append({
                "type": section["type"],
                "content": section["content"],
                "estimated_duration": section.get("duration"),
                "b_roll_suggestions": section.get("b_roll", [])
            })
        
        script = {
            "id": script_id,
            "story_id": story_id,
            "title": title,
            "sections": structured_sections,
            "metadata": {
                "generation_id": generation_id,
                "word_count": word_count,
                "script_style": request.script_style,
                "max_duration_minutes": request.max_duration_minutes,
                "include_b_roll": request.include_b_roll,
                "generated_with": "openai-gpt4o-mini"
            },
            "created_at": current_time,
            "modified_at": None,
            "approved": False
        }
        
        # Save the generated script
        existing_scripts = get_generated_scripts_for_user(user_id)
        existing_scripts_dict = [s.dict() for s in existing_scripts]
        existing_scripts_dict.append(script)
        save_generated_scripts_for_user(user_id, existing_scripts_dict)
        
        # Update the generation status to complete
        update_script_generation_status(
            user_id, 
            generation_id, 
            "completed", 
            "Script generation completed successfully", 
            completed_at=current_time
        )
        
    except Exception as e:
        print(f"Error in script generation process: {str(e)}")
        traceback.print_exc()
        update_script_generation_status(user_id, generation_id, "failed", f"Script generation failed: {str(e)}")

def parse_script_sections(script_content: str) -> List[Dict[str, Any]]:
    """Parse the script content into structured sections"""
    sections = []
    current_section = None
    current_type = None
    current_content = []
    current_duration = None
    current_b_roll = []
    parsing_b_roll = False
    
    # Define section type mapping
    section_type_map = {
        "HOOK": "hook",
        "INTRO": "intro",
        "INTRODUCTION": "intro",
        "MAIN": "main_content",
        "MAIN_CONTENT": "main_content",
        "MAIN_1": "main_content_1",
        "MAIN_2": "main_content_2",
        "MAIN_3": "main_content_3",
        "MAIN_4": "main_content_4",
        "MAIN_5": "main_content_5",
        "SEGMENT_1": "main_content_1",
        "SEGMENT_2": "main_content_2",
        "SEGMENT_3": "main_content_3",
        "SEGMENT_4": "main_content_4",
        "SEGMENT_5": "main_content_5",
        "OUTRO": "outro",
        "CONCLUSION": "outro",
        "CTA": "call_to_action"
    }
    
    # Handle different formatting patterns
    lines = script_content.split("\n")
    
    for line in lines:
        line = line.strip()
        if not line:
            continue
        
        # Check for section markers
        if line.startswith("##") and line.endswith("##"):
            marker = line.strip("#").strip().upper()
            
            # Handle content section ending
            if current_type and marker != current_type:
                if current_type in ("DURATION", "B_ROLL"):
                    continue  # These are processed separately
                    
                # Save previous section if we're starting a new one
                if current_content:
                    if current_section is None:
                        current_section = {}
                    
                    mapped_type = section_type_map.get(current_type, current_type.lower())
                    current_section["type"] = mapped_type
                    current_section["content"] = "\n".join(current_content).strip()
                    
                    if current_duration:
                        current_section["duration"] = current_duration
                    
                    if current_b_roll:
                        current_section["b_roll"] = current_b_roll
                    
                    sections.append(current_section)
                    
                    # Reset for new section
                    current_section = None
                    current_content = []
                    current_duration = None
                    current_b_roll = []
            
            # Set current section type
            if marker == "DURATION":
                parsing_b_roll = False
                continue  # Duration will be captured in the next line
            elif marker == "B_ROLL":
                parsing_b_roll = True
                continue  # B-roll will be captured in subsequent lines
            else:
                current_type = marker
                parsing_b_roll = False
            
        # Handle content based on current state
        elif parsing_b_roll:
            if line.startswith("-"):
                current_b_roll.append(line.lstrip("-").strip())
            else:
                current_b_roll.append(line)
        elif current_type == "DURATION" or (current_type and not current_duration and line.lower().startswith("duration")):
            current_duration = line
            current_type = "CONTENT"  # Reset to capturing content
        elif current_type:
            current_content.append(line)
    
    # Handle the last section
    if current_type and current_content:
        if current_section is None:
            current_section = {}
        
        mapped_type = section_type_map.get(current_type, current_type.lower())
        current_section["type"] = mapped_type
        current_section["content"] = "\n".join(current_content).strip()
        
        if current_duration:
            current_section["duration"] = current_duration
        
        if current_b_roll:
            current_section["b_roll"] = current_b_roll
        
        sections.append(current_section)
    
    # Fallback parsing if the above didn't work
    if not sections:
        # Try alternative parsing logic for different formatting
        sections = fallback_parse_script(script_content)
    
    return sections

def fallback_parse_script(script_content: str) -> List[Dict[str, Any]]:
    """Fallback parsing method for scripts that don't follow the expected format"""
    sections = []
    lines = script_content.split("\n")
    
    # Initialize variables for parsing
    current_type = None
    current_content = []
    
    # Patterns to recognize section headers
    section_patterns = [
        (r"\[?HOOK\]?", "hook"),
        (r"\[?INTRO(DUCTION)?\]?", "intro"),
        (r"\[?MAIN[\s_-]?(CONTENT)?[\s_-]?(\d+)?\]?", "main_content"),
        (r"\[?SEGMENT[\s_-]?(\d+)?\]?", "main_content"),
        (r"\[?OUTRO\]?", "outro"),
        (r"\[?CONCLUSION\]?", "outro"),
        (r"\[?CTA\]?", "call_to_action")
    ]
    
    for line in lines:
        line = line.strip()
        if not line:
            continue
        
        # Check if line is a section header
        is_header = False
        for pattern, section_type in section_patterns:
            import re
            if re.search(pattern, line, re.IGNORECASE):
                # Save previous section if there is one
                if current_type and current_content:
                    sections.append({
                        "type": current_type,
                        "content": "\n".join(current_content).strip()
                    })
                
                # Start new section
                current_type = section_type
                current_content = []
                is_header = True
                break
        
        if not is_header and current_type:
            current_content.append(line)
    
    # Add the last section
    if current_type and current_content:
        sections.append({
            "type": current_type,
            "content": "\n".join(current_content).strip()
        })
    
    # If we still couldn't parse any sections, create a single section with all content
    if not sections:
        sections.append({
            "type": "full_script",
            "content": script_content.strip()
        })
    
    return sections

@router.post("/scripts/generate", response_model=ScriptGenerationResponse)
async def generate_script(background_tasks: BackgroundTasks, request: ScriptRequest, user_id: str) -> ScriptGenerationResponse:
    """Start the script generation process for a specific story"""
    try:
        # Check if the story exists
        stories = get_stories_for_user(user_id)
        story = next((s for s in stories if s.id == request.story_id), None)
        
        if not story:
            raise HTTPException(status_code=404, detail="Story not found")
        
        # Check if there's already a script generation in progress
        generations = get_script_generations_for_user(user_id)
        for gen in generations:
            if gen.story_id == request.story_id and gen.status in ["pending", "in-progress"]:
                return gen
        
        # Create a new generation job
        generation_id = str(uuid.uuid4())
        current_time = datetime.datetime.now().isoformat()
        
        generation = {
            "id": generation_id,
            "story_id": request.story_id,
            "status": "pending",
            "message": "Script generation queued",
            "created_at": current_time,
            "completed_at": None
        }
        
        # Save the generation job
        generations_dict = [g.dict() for g in generations]
        generations_dict.append(generation)
        save_script_generations_for_user(user_id, generations_dict)
        
        # Start the generation process in the background
        background_tasks.add_task(generate_script_with_openai, user_id, request.story_id, generation_id, request)
        
        return ScriptGenerationResponse(**generation)
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error starting script generation: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Failed to start script generation") from e

@router.get("/scripts/generations/{story_id}", response_model=ScriptGenerationsListResponse)
async def list_script_generations(story_id: str, user_id: str) -> ScriptGenerationsListResponse:
    """List all script generation jobs for a specific story"""
    try:
        all_generations = get_script_generations_for_user(user_id)
        story_generations = [gen for gen in all_generations if gen.story_id == story_id]
        return ScriptGenerationsListResponse(generations=story_generations)
    except Exception as e:
        print(f"Error listing script generations: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve generation jobs") from e

@router.get("/scripts/{story_id}", response_model=GeneratedScriptListResponse)
async def list_generated_scripts(story_id: str, user_id: str) -> GeneratedScriptListResponse:
    """List all generated scripts for a specific story"""
    try:
        all_scripts = get_generated_scripts_for_user(user_id)
        story_scripts = [script for script in all_scripts if script.story_id == story_id]
        return GeneratedScriptListResponse(scripts=story_scripts)
    except Exception as e:
        print(f"Error listing generated scripts: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve generated scripts") from e

@router.get("/scripts/{story_id}/{script_id}", response_model=GeneratedScript)
async def get_script(story_id: str, script_id: str, user_id: str) -> GeneratedScript:
    """Get a specific generated script by ID"""
    try:
        all_scripts = get_generated_scripts_for_user(user_id)
        for script in all_scripts:
            if script.id == script_id and script.story_id == story_id:
                return script
        raise HTTPException(status_code=404, detail="Script not found")
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error retrieving script: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve script") from e

@router.patch("/scripts/{story_id}/{script_id}", response_model=GeneratedScript)
async def update_script(story_id: str, script_id: str, request: ScriptUpdateRequest, user_id: str) -> GeneratedScript:
    """Update a specific generated script"""
    try:
        all_scripts = get_generated_scripts_for_user(user_id)
        scripts_dict = [s.dict() for s in all_scripts]
        
        script_index = None
        for i, script in enumerate(scripts_dict):
            if script["id"] == script_id and script["story_id"] == story_id:
                script_index = i
                break
        
        if script_index is None:
            raise HTTPException(status_code=404, detail="Script not found")
        
        # Update the script
        if request.title is not None:
            scripts_dict[script_index]["title"] = request.title
        
        if request.sections is not None:
            scripts_dict[script_index]["sections"] = [
                {
                    "type": section.type,
                    "content": section.content,
                    "estimated_duration": section.estimated_duration,
                    "b_roll_suggestions": section.b_roll_suggestions or []
                }
                for section in request.sections
            ]
        
        if request.approved is not None:
            scripts_dict[script_index]["approved"] = request.approved
        
        # Update modified timestamp
        scripts_dict[script_index]["modified_at"] = datetime.datetime.now().isoformat()
        
        # Save the updated scripts
        save_generated_scripts_for_user(user_id, scripts_dict)
        
        # Return the updated script
        return GeneratedScript(**scripts_dict[script_index])
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error updating script: {e}")
        raise HTTPException(status_code=500, detail="Failed to update script") from e
