"""
CrewAI Tasks for Video Forge

This module defines the tasks that each agent will perform in the video creation process.
"""

from crewai import Task
from .agents import script_architect, media_researcher, media_curator, voice_selector

def create_script_task(topic, duration_minutes=5, style="professional", research_keywords=None):
    """
    Create a task for the Script Architect to generate a video script.
    
    Args:
        topic (str): The topic of the video
        duration_minutes (int): The target duration of the video in minutes
        style (str): The style of the script (professional, conversational, dramatic)
        research_keywords (list): Optional list of keywords to guide web research
        
    Returns:
        Task: A CrewAI task for script generation
    """
    # Prepare research instructions if keywords are provided
    research_instructions = ""
    if research_keywords and len(research_keywords) > 0:
        research_instructions = f"""
        Research the following keywords to gather accurate and up-to-date information for the script:
        {', '.join(research_keywords)}
        
        Use the SerperSearch tool to find relevant information about these topics before writing the script.
        Incorporate the research findings into your script to ensure accuracy and depth.
        """
    
    return Task(
        description=f"""
        Create a compelling video script about "{topic}" with the following requirements:
        - Target duration: {duration_minutes} minutes
        - Style: {style}
        - Structure should include a hook, main content sections, and an outro
        - Each section should have an estimated duration
        - Include suggestions for B-roll footage for each section
        {research_instructions}
        - Format the output as a JSON object with the following structure:
          {{
            "title": "Video Title",
            "target_duration_minutes": {duration_minutes},
            "style": "{style}",
            "research_sources": ["URL 1", "URL 2"],  # Include sources from your research
            "sections": [
              {{
                "type": "hook",
                "content": "Script content for this section",
                "estimated_duration_seconds": 30,
                "b_roll_suggestions": ["Suggestion 1", "Suggestion 2"]
              }},
              ...
            ]
          }}
        """,
        agent=script_architect,
        expected_output="A complete, well-structured video script in JSON format"
    )

def research_media_task(script_json, max_images_per_section=2, max_videos_per_section=1):
    """
    Create a task for the Media Researcher to find media for each script section.
    
    Args:
        script_json (str): The JSON string containing the script
        max_images_per_section (int): Maximum number of images to find per section
        max_videos_per_section (int): Maximum number of videos to find per section
        
    Returns:
        Task: A CrewAI task for media research
    """
    # Add instructions for using the Serper search tool
    return Task(
        description=f"""
        Find copyright-safe visuals for each section of the script:
        
        {script_json}
        
        For each section:
        - First, use the SerperSearch tool to find relevant and high-quality visual content related to the section topic
        - Then use the PexelsSearch tool to find specific media assets
        - Find {max_images_per_section} high-quality images that match the content and B-roll suggestions
        - Find {max_videos_per_section} short video clip (max 15 seconds) that matches the content
        - Ensure all media is copyright-safe (Creative Commons or similar license)
        - Prioritize HD quality
        
        Format the output as a JSON object with the following structure:
        {{
          "section_1": {{
            "images": [
              {{
                "url": "https://example.com/image1.jpg",
                "license": "CC0",
                "source": "Pexels"
              }},
              ...
            ],
            "videos": [
              {{
                "url": "https://example.com/video1.mp4",
                "license": "Creative Commons",
                "source": "Pexels",
                "duration_seconds": 12
              }},
              ...
            ]
          }},
          ...
        }}
        """,
        agent=media_researcher,
        expected_output="A JSON object containing URLs and metadata for copyright-safe images and videos for each script section"
    )

def curate_media_task(media_json):
    """
    Create a task for the Media Curator to organize and prepare media assets.
    
    Args:
        media_json (str): The JSON string containing the media information
        
    Returns:
        Task: A CrewAI task for media curation
    """
    return Task(
        description=f"""
        Organize and prepare the media assets for video assembly:
        
        {media_json}
        
        For each media asset:
        1. Verify that the URL is accessible
        2. Check that the file format is compatible (jpg, png, mp4, etc.)
        3. Confirm that the resolution is sufficient for video production (at least 720p)
        4. Organize the assets into a structured format for the video assembly process
        
        Format the output as a JSON object with the following structure:
        {{
          "section_1": {{
            "images": [
              {{
                "url": "https://example.com/image1.jpg",
                "filename": "section1_image1.jpg",
                "resolution": "1920x1080",
                "status": "verified"
              }},
              ...
            ],
            "videos": [
              {{
                "url": "https://example.com/video1.mp4",
                "filename": "section1_video1.mp4",
                "resolution": "1280x720",
                "duration_seconds": 12,
                "status": "verified"
              }},
              ...
            ]
          }},
          ...
        }}
        """,
        agent=media_curator,
        expected_output="A JSON object containing organized and verified media assets for each script section"
    )

def select_voice_task(script_json, gender="neutral", tone="professional"):
    """
    Create a task for the Voice Selector to choose an appropriate voice.
    
    Args:
        script_json (str): The JSON string containing the script
        gender (str): Preferred gender of the voice (male, female, neutral)
        tone (str): Preferred tone of the voice (professional, conversational, dramatic)
        
    Returns:
        Task: A CrewAI task for voice selection
    """
    return Task(
        description=f"""
        Select the most appropriate voice for this video script:
        
        {script_json}
        
        Requirements:
        - Gender preference: {gender}
        - Tone preference: {tone}
        - The voice should match the content and style of the script
        - Consider the target audience and the message being conveyed
        
        Format the output as a JSON object with the following structure:
        {{
          "voice_id": "unique_voice_id",
          "name": "Voice Name",
          "gender": "{gender}",
          "tone": "{tone}",
          "description": "Description of the voice characteristics",
          "sample_text": "A short sample of how the voice would sound with this script"
        }}
        """,
        agent=voice_selector,
        expected_output="A JSON object containing the selected voice information"
    )
