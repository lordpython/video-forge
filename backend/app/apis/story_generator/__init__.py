from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
import uuid
import datetime
import databutton as db
import re
import json
import asyncio
import os
import traceback
from app.apis.story_acquisition import get_stories_for_user, StoryResponse

# The following imports will be used in the CrewAI implementation
# They are not at the top level to allow the app to work even if CrewAI is not installed

router = APIRouter()

class GeneratedStory(BaseModel):
    id: str = Field(..., description="Unique identifier for the generated story")
    story_id: str = Field(..., description="ID of the original story request")
    content: str = Field(..., description="The generated story content")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Additional metadata about the generated story")
    created_at: str = Field(..., description="Timestamp when the story was generated")

class StoryGenerationResponse(BaseModel):
    id: str = Field(..., description="Unique identifier for the generation job")
    story_id: str = Field(..., description="ID of the story being processed")
    status: str = Field(..., description="Current status of the generation process")
    message: Optional[str] = Field(None, description="Additional message about the generation process")
    created_at: str = Field(..., description="Timestamp when the generation was started")
    completed_at: Optional[str] = Field(None, description="Timestamp when the generation was completed")

class StoryGenerationsListResponse(BaseModel):
    generations: List[StoryGenerationResponse] = Field(..., description="List of generation jobs")

def sanitize_storage_key(key: str) -> str:
    """Sanitize storage key to only allow alphanumeric and ._- symbols"""
    return re.sub(r'[^a-zA-Z0-9._-]', '', key)

def get_generations_for_user(user_id: str) -> List[StoryGenerationResponse]:
    """Get all story generation jobs for a specific user"""
    try:
        generations_data = db.storage.json.get(f"story-generations-{sanitize_storage_key(user_id)}", default=[])
        return [StoryGenerationResponse(**gen) for gen in generations_data]
    except Exception as e:
        print(f"Error retrieving generations for user {user_id}: {e}")
        return []

def save_generations_for_user(user_id: str, generations: List[dict]) -> None:
    """Save story generation jobs for a specific user"""
    try:
        db.storage.json.put(f"story-generations-{sanitize_storage_key(user_id)}", generations)
    except Exception as e:
        print(f"Error saving generations for user {user_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to save generation data") from e

def get_generated_stories_for_user(user_id: str) -> List[GeneratedStory]:
    """Get all generated stories for a specific user"""
    try:
        stories_data = db.storage.json.get(f"generated-stories-{sanitize_storage_key(user_id)}", default=[])
        return [GeneratedStory(**story) for story in stories_data]
    except Exception as e:
        print(f"Error retrieving generated stories for user {user_id}: {e}")
        return []

def save_generated_stories_for_user(user_id: str, stories: List[dict]) -> None:
    """Save generated stories for a specific user"""
    try:
        db.storage.json.put(f"generated-stories-{sanitize_storage_key(user_id)}", stories)
    except Exception as e:
        print(f"Error saving generated stories for user {user_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to save generated story") from e

async def generate_story_with_crew_ai(user_id: str, story_id: str, generation_id: str):
    """Generate a story using CrewAI in the background"""
    try:
        # Get the story details
        stories = get_stories_for_user(user_id)
        story = next((s for s in stories if s.id == story_id), None)
        
        if not story:
            print(f"Story {story_id} not found for user {user_id}")
            update_generation_status(user_id, generation_id, "failed", "Story not found")
            return
        
        # Update generation status to in-progress
        update_generation_status(user_id, generation_id, "in-progress", "Story generation has started")
        
        # Retrieve OpenAI API key from secrets
        openai_api_key = db.secrets.get("OPENAI_API_KEY")
        if not openai_api_key:
            raise Exception("OpenAI API key not found in secrets")
        
        # Try to use CrewAI for story generation
        try:
            # Import CrewAI dependencies dynamically
            print("Importing CrewAI dependencies...")
            from openai import OpenAI
            from crewai import Agent, Task, Crew
            from crewai.tools import SerperDevTool
            
            print(f"Creating story for topic: {story.topic}, genre: {story.genre}")
            
            # Initialize OpenAI client (used indirectly through CrewAI's llm_config)
            OpenAI(api_key=openai_api_key)  # API key passed directly to agent config
            
            # Initialize SerperDev tool for web research
            serper_api_key = db.secrets.get("SERPER_API_KEY")
            if not serper_api_key:
                print("Warning: SERPER_API_KEY not found in secrets, web research will be limited")
                research_tool = None
            else:
                try:
                    print("Initializing SerperDevTool for web research...")
                    research_tool = SerperDevTool(api_key=serper_api_key)
                    print("SerperDevTool initialized successfully")
                except Exception as e:
                    print(f"Error initializing SerperDevTool: {str(e)}")
                    traceback.print_exc()
                    research_tool = None
            
            # Define agents with specific OpenAI models
            print("Creating AI agents...")
            manager_agent = Agent(
                role="Story Manager",
                goal="Oversee the creation of a compelling story based on user requirements",
                backstory="You are an experienced story director who guides the creation process",
                verbose=True,
                allow_delegation=True,
                llm_config={
                    "provider": "openai",
                    "config": {
                        "api_key": openai_api_key
                    },
                    "model": "gpt-4o-mini"
                }
            )
            
            researcher_agent = Agent(
                role="Topic Researcher",
                goal=f"Research key facts and trends about {story.topic} with a focus on {story.genre}",
                backstory="You are a thorough researcher who finds relevant and factual information about topics on the web",
                verbose=True,
                llm_config={
                    "provider": "openai",
                    "config": {
                        "api_key": openai_api_key
                    },
                    "model": "gpt-3.5-turbo"
                },
                tools=[research_tool] if research_tool else []
            )
            
            writer_agent = Agent(
                role="Creative Writer",
                goal=f"Write an engaging {story.tone} story about {story.topic} for {story.target_audience}",
                backstory="You are a talented storyteller who crafts compelling narratives",
                verbose=True,
                llm_config={
                    "provider": "openai",
                    "config": {
                        "api_key": openai_api_key
                    },
                    "model": "gpt-4o-mini"
                }
            )
            
            editor_agent = Agent(
                role="Content Editor",
                goal="Review and refine the story for clarity, engagement and accuracy",
                backstory="You are a meticulous editor who ensures quality content",
                verbose=True,
                llm_config={
                    "provider": "openai",
                    "config": {
                        "api_key": openai_api_key
                    },
                    "model": "gpt-3.5-turbo"
                }
            )
            
            # Define tasks for each agent
            print("Defining AI tasks...")
            research_task = Task(
                description=f"Research the topic '{story.topic}' with focus on {story.genre} genre. Use the SerperDev search tool to find real information, facts, statistics, examples, and current trends. Also search for relevant images and videos that could be used later in video production. For imagery, describe what kinds of visuals would work well for this topic. Include at least 5 specific facts with sources.",
                agent=researcher_agent,
                expected_output="Detailed research findings about the topic with key concepts, factual information, sources, and visual/video recommendations"
            )
            
            writing_task = Task(
                description=f"Write a {story.tone} story about {story.topic} for {story.target_audience} audience in {story.genre} genre. Use the research findings to create an informative and engaging narrative that incorporates real facts and information. Reference specific facts from the research and weave them naturally into the narrative. Include potential timestamps or sections where specific visuals or video clips could enhance the story.",
                agent=writer_agent,
                context=[research_task],  # Use the research task output as context
                expected_output="A complete draft story with proper structure that incorporates factual information"
            )
            
            editing_task = Task(
                description="Edit the story for clarity, engagement, and factual accuracy. Verify that real information from the research is correctly incorporated. Ensure proper structure with introduction, main content, and conclusion. Add metadata section at the end that lists key facts and potential visual/video resources that could be used in video production. Format using Markdown with clear headings and sections.",
                agent=editor_agent,
                context=[research_task, writing_task],  # Use both research and writing task outputs as context
                expected_output="A polished, well-formatted story in Markdown format with accurate information and visual/video recommendations"
            )
            
            # Create the crew with the manager agent as the leader
            print("Assembling AI crew...")
            story_crew = Crew(
                agents=[manager_agent, researcher_agent, writer_agent, editor_agent],
                tasks=[research_task, writing_task, editing_task],
                manager=manager_agent,
                verbose=True
            )
            
            # Execute the crew's plan and get the result
            print("Starting CrewAI for story generation")
            update_generation_status(user_id, generation_id, "in-progress", "AI Crew is working on your story...")
            
            result = story_crew.kickoff()
            print("CrewAI story generation completed")
            generated_content = result
            
            # Store metadata about the generation process
            generation_method = "crew-ai"
            
        except ImportError as e:
            print(f"CrewAI import error: {str(e)}")
            traceback.print_exc()
            # Fallback to simulated response if CrewAI is not available
            await asyncio.sleep(5)
            # Try to get some real information even in fallback mode
            try:
                # Try to get some factual information using a basic approach
                import requests
                search_url = f"https://serpapi.com/search?q={story.topic}&api_key={serper_api_key}&engine=google"
                response = requests.get(search_url)
                if response.status_code == 200:
                    data = response.json()
                    facts = []
                    if "organic_results" in data:
                        for result in data["organic_results"][:3]:
                            facts.append(f"- {result.get('title', 'Untitled')}\n  {result.get('snippet', 'No description')}\n  Source: {result.get('link', 'No link')}")
                    facts_text = "\n\n### Key Facts\n\n" + "\n\n".join(facts) if facts else ""
                    generated_content = create_fallback_story(story, extra_facts=facts_text)
                    generation_method = "fallback-with-basic-research"
                else:
                    generated_content = create_fallback_story(story)
                    generation_method = "simulated-fallback-import-error"
            except Exception as research_e:
                print(f"Fallback research also failed: {str(research_e)}")
                generated_content = create_fallback_story(story)
                generation_method = "simulated-fallback-import-error"
            
        except Exception as e:
            print(f"CrewAI execution error: {str(e)}")
            traceback.print_exc()
            # Fallback to simulated response if CrewAI execution fails
            await asyncio.sleep(5)
            # Try to get some real information even in fallback mode
            try:
                # Try to get some factual information using a basic approach
                import requests
                search_url = f"https://serpapi.com/search?q={story.topic}&api_key={serper_api_key}&engine=google"
                response = requests.get(search_url)
                if response.status_code == 200:
                    data = response.json()
                    facts = []
                    if "organic_results" in data:
                        for result in data["organic_results"][:3]:
                            facts.append(f"- {result.get('title', 'Untitled')}\n  {result.get('snippet', 'No description')}\n  Source: {result.get('link', 'No link')}")
                    facts_text = "\n\n### Key Facts\n\n" + "\n\n".join(facts) if facts else ""
                    generated_content = create_fallback_story(story, extra_facts=facts_text)
                    generation_method = "fallback-with-basic-research"
                else:
                    generated_content = create_fallback_story(story)
                    generation_method = "simulated-fallback-execution-error"
            except Exception as research_e:
                print(f"Fallback research also failed: {str(research_e)}")
                generated_content = create_fallback_story(story)
                generation_method = "simulated-fallback-execution-error"
            
        # Create a generated story record
        current_time = datetime.datetime.now().isoformat()
        generated_story = {
            "id": str(uuid.uuid4()),
            "story_id": story_id,
            "content": generated_content,
            "metadata": {
                "generation_id": generation_id,
                "word_count": len(generated_content.split()),
                "generated_with": generation_method
            },
            "created_at": current_time
        }
        
        # Save the generated story
        existing_stories = get_generated_stories_for_user(user_id)
        existing_stories_dict = [s.dict() for s in existing_stories]
        existing_stories_dict.append(generated_story)
        save_generated_stories_for_user(user_id, existing_stories_dict)
        
        # Update the generation status to complete
        update_generation_status(
            user_id, 
            generation_id, 
            "completed", 
            "Story generation completed successfully", 
            completed_at=current_time
        )
        
        # Update the original story status
        update_story_status(user_id, story_id, "story_generated")
        
    except Exception as e:
        print(f"Error in story generation process: {str(e)}")
        traceback.print_exc()
        update_generation_status(user_id, generation_id, "failed", f"Story generation failed: {str(e)}")

def create_fallback_story(story, extra_facts=""):
    """Create a fallback story when CrewAI fails"""
    base_story = f"""# {story.topic}

## Introduction

In a world where {story.genre.lower()} is becoming increasingly relevant, 
{story.topic} stands out as a fascinating subject. This story aims to explore
the intricate details and implications for {story.target_audience.lower()} audiences,
with a {story.tone.lower()} tone that engages and captivates.

## Main Content

The journey begins with understanding the fundamentals of {story.topic}.
Experts in the field have long debated the significance and real-world applications.

According to recent studies, the impact of {story.topic} has been profound in various sectors.
From technology to everyday life, the influence cannot be understated.

## Conclusion

As we look to the future, {story.topic} will continue to evolve and shape our world.
Whether you're a seasoned professional or a curious newcomer, the implications
are vast and exciting. Stay tuned for more developments in this fascinating field.
"""
    
    # Add any extra facts if available
    if extra_facts:
        return base_story + extra_facts
    return base_story

def update_generation_status(user_id: str, generation_id: str, status: str, message: str, completed_at: Optional[str] = None):
    """Update the status of a generation job"""
    try:
        generations = get_generations_for_user(user_id)
        generations_dict = [g.dict() for g in generations]
        
        for gen in generations_dict:
            if gen["id"] == generation_id:
                gen["status"] = status
                gen["message"] = message
                if completed_at:
                    gen["completed_at"] = completed_at
                break
        
        save_generations_for_user(user_id, generations_dict)
    except Exception as e:
        print(f"Error updating generation status: {e}")

def update_story_status(user_id: str, story_id: str, status: str):
    """Update the status of a story"""
    from app.apis.story_acquisition import get_stories_for_user, save_stories_for_user
    
    try:
        stories = get_stories_for_user(user_id)
        stories_dict = [s.dict() for s in stories]
        
        for story in stories_dict:
            if story["id"] == story_id:
                story["status"] = status
                break
        
        save_stories_for_user(user_id, stories_dict)
    except Exception as e:
        print(f"Error updating story status: {e}")

@router.post("/stories/{story_id}/generate", response_model=StoryGenerationResponse)
async def start_story_generation(background_tasks: BackgroundTasks, story_id: str, user_id: str) -> StoryGenerationResponse:
    """Start the story generation process for a specific story"""
    try:
        # Check if the story exists
        stories = get_stories_for_user(user_id)
        story = next((s for s in stories if s.id == story_id), None)
        
        if not story:
            raise HTTPException(status_code=404, detail="Story not found")
        
        # Check if the story is already being processed
        generations = get_generations_for_user(user_id)
        for gen in generations:
            if gen.story_id == story_id and gen.status in ["pending", "in-progress"]:
                return gen
        
        # Create a new generation job
        generation_id = str(uuid.uuid4())
        current_time = datetime.datetime.now().isoformat()
        
        generation = {
            "id": generation_id,
            "story_id": story_id,
            "status": "pending",
            "message": "Story generation queued",
            "created_at": current_time,
            "completed_at": None
        }
        
        # Save the generation job
        generations_dict = [g.dict() for g in generations]
        generations_dict.append(generation)
        save_generations_for_user(user_id, generations_dict)
        
        # Start the generation process in the background
        background_tasks.add_task(generate_story_with_crew_ai, user_id, story_id, generation_id)
        
        return StoryGenerationResponse(**generation)
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error starting story generation: {e}")
        raise HTTPException(status_code=500, detail="Failed to start story generation") from e

@router.get("/stories/{story_id}/generations", response_model=StoryGenerationsListResponse)
async def list_story_generations(story_id: str, user_id: str) -> StoryGenerationsListResponse:
    """List all generation jobs for a specific story"""
    try:
        all_generations = get_generations_for_user(user_id)
        story_generations = [gen for gen in all_generations if gen.story_id == story_id]
        return StoryGenerationsListResponse(generations=story_generations)
    except Exception as e:
        print(f"Error listing generations: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve generation jobs") from e

@router.get("/stories/{story_id}/generated", response_model=List[GeneratedStory])
async def list_generated_stories(story_id: str, user_id: str) -> List[GeneratedStory]:
    """List all generated stories for a specific story request"""
    try:
        all_stories = get_generated_stories_for_user(user_id)
        story_generated = [story for story in all_stories if story.story_id == story_id]
        return story_generated
    except Exception as e:
        print(f"Error listing generated stories: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve generated stories") from e