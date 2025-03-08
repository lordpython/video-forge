"""
CrewAI Crew for Video Forge

This module defines the crew that orchestrates the agents and tasks for video creation.
"""

from crewai import Crew, Process
from .agents import script_architect, media_researcher, media_curator, voice_selector
from .tasks import create_script_task, research_media_task, curate_media_task, select_voice_task
import json

class VideoForgeCrew:
    """
    A class to manage the CrewAI crew for video creation.
    """
    
    def __init__(self, verbose=True):
        """
        Initialize the VideoForgeCrew.
        
        Args:
            verbose (bool): Whether to output detailed logs during execution
        """
        self.verbose = verbose
        
    def create_video(self, story_data, duration_minutes=5, style="professional", 
                    gender="neutral", research_keywords=None):
        """
        Execute the full video creation process based on story data from the frontend.
        
        Args:
            story_data (dict): Dictionary containing story information including topic, genre, etc.
            duration_minutes (int): The target duration of the video in minutes
            style (str): The style of the script (professional, conversational, dramatic)
            gender (str): Preferred gender of the voice (male, female, neutral)
            research_keywords (list): Optional list of keywords to guide web research (overrides story_data keywords)
            
        Returns:
            dict: A dictionary containing the results of each step of the process
        """
        # Extract relevant data from story_data
        topic = story_data.get("topic", "")
        tone = story_data.get("tone", "professional")
        
        # Extract research keywords
        keywords = []
        
        # Use explicit research_keywords if provided as parameter
        if research_keywords:
            keywords.extend(research_keywords)
        # Otherwise use keywords from story_data if available
        elif story_data.get("research_keywords"):
            keywords.extend(story_data["research_keywords"])
        # Finally, if no keywords yet, try to extract from additional_details
        elif len(keywords) == 0 and story_data.get("additional_details"):
            import re
            details = story_data["additional_details"]
            extra_keywords = [word.strip() for word in re.split(r'[,.;\s]+', details) if len(word.strip()) > 3][:5]
            keywords.extend(extra_keywords)
            
        # Ensure topic is always included in keywords
        if topic and topic not in keywords:
            keywords.insert(0, topic)
        
        # Create the tasks with processed keywords
        script_task = create_script_task(topic, duration_minutes, style, research_keywords=keywords)
        
        # Create the crew
        crew = Crew(
            agents=[script_architect, media_researcher, media_curator, voice_selector],
            tasks=[script_task],
            verbose=self.verbose,
            process=Process.sequential  # Execute tasks sequentially
        )
        
        # Execute the first task (script creation)
        script_result = crew.kickoff()
        
        try:
            # Parse the script result
            script_json = self._extract_json(script_result)
            
            # Add the media research task
            media_task = research_media_task(json.dumps(script_json, indent=2))
            crew.tasks.append(media_task)
            media_result = crew.kickoff()
            
            # Parse the media result
            media_json = self._extract_json(media_result)
            
            # Add the media curation task
            curation_task = curate_media_task(json.dumps(media_json, indent=2))
            crew.tasks.append(curation_task)
            curation_result = crew.kickoff()
            
            # Parse the curation result
            curation_json = self._extract_json(curation_result)
            
            # Add the voice selection task
            voice_task = select_voice_task(json.dumps(script_json, indent=2), gender, tone)
            crew.tasks.append(voice_task)
            voice_result = crew.kickoff()
            
            # Parse the voice result
            voice_json = self._extract_json(voice_result)
            
            # Return the combined results
            return {
                "script": script_json,
                "media": media_json,
                "curated_media": curation_json,
                "voice": voice_json,
                "status": "completed"
            }
            
        except Exception as e:
            if self.verbose:
                print(f"Error in video creation process: {str(e)}")
            return {
                "script": script_result,
                "status": "error",
                "error": str(e)
            }
    
    def _extract_json(self, text):
        """
        Extract JSON from text that may contain additional content.
        
        Args:
            text (str): Text that may contain JSON
            
        Returns:
            dict: Extracted JSON as a Python dictionary
        """
        try:
            # First try to parse the entire text as JSON
            return json.loads(text)
        except json.JSONDecodeError:
            # If that fails, try to find JSON within the text
            import re
            json_pattern = r'```json\s*([\s\S]*?)\s*```'
            match = re.search(json_pattern, text)
            if match:
                try:
                    return json.loads(match.group(1))
                except json.JSONDecodeError:
                    pass
            
            # Try another common pattern
            json_pattern = r'({[\s\S]*})'
            match = re.search(json_pattern, text)
            if match:
                try:
                    return json.loads(match.group(1))
                except json.JSONDecodeError:
                    pass
            
            # If all else fails, return the original text
            raise ValueError(f"Could not extract JSON from result: {text[:100]}...")
