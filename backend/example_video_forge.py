"""
Standalone example script for using the Video Forge CrewAI implementation.

This script demonstrates how to use the CrewAI implementation to generate a video.
Run this script directly to test the functionality.
"""

import os
import json
import sys
from dotenv import load_dotenv

# Add the backend directory to the path so we can import the app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app.crewai.crew import VideoForgeCrew

# Load environment variables
load_dotenv()

def main():
    """
    Main function to demonstrate the Video Forge CrewAI implementation.
    """
    # Check if API keys are set
    openai_key = os.getenv("OPENAI_API_KEY")
    pexels_key = os.getenv("PEXELS_API_KEY")
    serper_key = os.getenv("SERPER_API_KEY")
    
    if not openai_key:
        print("Warning: OPENAI_API_KEY is not set. The script will not work properly.")
        print("Please set the OPENAI_API_KEY environment variable and try again.")
        return
    
    if not pexels_key:
        print("Warning: PEXELS_API_KEY is not set. Mock data will be used for media search.")
        
    if not serper_key:
        print("Warning: SERPER_API_KEY is not set. Mock data will be used for web search.")
    
    print("Starting Video Forge CrewAI example...")
    
    # Create a VideoForgeCrew instance
    crew = VideoForgeCrew(verbose=True)
    
    # Example parameters
    topic = "The Benefits of Meditation for Mental Health"
    duration_minutes = 3
    style = "conversational"
    gender = "female"
    tone = "calming"
    
    # You can also provide research keywords to guide the web search
    research_keywords = [
        "meditation benefits scientific research",
        "mindfulness impact on stress reduction",
        "meditation techniques for beginners",
        "mental health improvement through meditation"
    ]
    
    print(f"\nGenerating video for topic: {topic}")
    print(f"Parameters: {duration_minutes} minutes, {style} style, {gender} voice, {tone} tone")
    
    # Execute the video creation process
    result = crew.create_video(
        topic=topic,
        duration_minutes=duration_minutes,
        style=style,
        gender=gender,
        tone=tone,
        research_keywords=research_keywords  # Add research keywords for Serper search
    )
    
    # Print the result
    print("\nVideo creation process completed!")
    print(f"Status: {result['status']}")
    
    # Save the result to a file for inspection
    output_file = os.path.join(os.path.dirname(os.path.abspath(__file__)), "video_creation_result.json")
    with open(output_file, "w") as f:
        json.dump(result, f, indent=2)
    
    print(f"\nResult saved to {output_file}")
    print("You can inspect this file to see the output of each step in the process.")

if __name__ == "__main__":
    main()
