"""
Example script for using the Video Forge CrewAI implementation.

This script demonstrates how to use the CrewAI implementation to generate a video.
Run this script directly to test the functionality.
"""

import os
import json
from dotenv import load_dotenv
from .crew import VideoForgeCrew

# Load environment variables
load_dotenv()

def main():
    """
    Main function to demonstrate the Video Forge CrewAI implementation.
    """
    # Check if API keys are set
    openai_key = os.getenv("OPENAI_API_KEY")
    pexels_key = os.getenv("PEXELS_API_KEY")
    
    if not openai_key:
        print("Warning: OPENAI_API_KEY is not set. The script will not work properly.")
        print("Please set the OPENAI_API_KEY environment variable and try again.")
        return
    
    if not pexels_key:
        print("Warning: PEXELS_API_KEY is not set. Mock data will be used for media search.")
    
    print("Starting Video Forge CrewAI example...")
    
    # Create a VideoForgeCrew instance
    crew = VideoForgeCrew(verbose=True)
    
    # Example parameters
    topic = "The Benefits of Meditation for Mental Health"
    duration_minutes = 3
    style = "conversational"
    gender = "female"
    tone = "calming"
    
    print(f"\nGenerating video for topic: {topic}")
    print(f"Parameters: {duration_minutes} minutes, {style} style, {gender} voice, {tone} tone")
    
    # Execute the video creation process
    result = crew.create_video(
        topic=topic,
        duration_minutes=duration_minutes,
        style=style,
        gender=gender,
        tone=tone
    )
    
    # Print the result
    print("\nVideo creation process completed!")
    print(f"Status: {result['status']}")
    
    # Save the result to a file for inspection
    with open("video_creation_result.json", "w") as f:
        json.dump(result, f, indent=2)
    
    print("\nResult saved to video_creation_result.json")
    print("You can inspect this file to see the output of each step in the process.")

if __name__ == "__main__":
    main()
