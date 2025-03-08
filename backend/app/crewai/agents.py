"""
CrewAI Agents for Video Forge

This module defines the agents used in the video creation process:
1. Script Architect - Creates the video script
2. Media Researcher - Finds relevant media assets
3. Media Curator - Organizes and prepares media assets
4. Voice Selector - Selects appropriate voice for the content
"""

from crewai import Agent
from langchain_openai import ChatOpenAI
from .tools import PexelsSearchTool, MediaDownloadTool, FFmpegTool, SerperSearchTool
import os

# Get API keys from environment
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
PEXELS_API_KEY = os.getenv("PEXELS_API_KEY", "")
SERPER_API_KEY = os.getenv("SERPER_API_KEY", "")

# Initialize tools
pexels_search_tool = PexelsSearchTool(api_key=PEXELS_API_KEY)
media_download_tool = MediaDownloadTool(download_dir=os.path.join(os.getcwd(), "downloads"))
ffmpeg_tool = FFmpegTool()
serper_search_tool = SerperSearchTool(api_key=SERPER_API_KEY)

# Base LLM for all agents
llm = ChatOpenAI(
    model="gpt-4",
    temperature=0.7,
    api_key=OPENAI_API_KEY
)

# Script Architect Agent
script_architect = Agent(
    role="Script Architect",
    goal="Create engaging and structured video scripts based on user topics",
    backstory="""You are an expert scriptwriter with years of experience in creating 
    engaging video content. You know how to structure videos to capture attention 
    and deliver information effectively. You understand how to create hooks that grab 
    viewers' attention, develop content that maintains engagement, and craft strong 
    conclusions that leave an impression. You research topics thoroughly to ensure 
    accuracy and depth in your scripts.""",
    verbose=True,
    llm=llm,
    tools=[serper_search_tool]  # Now the Script Architect can research topics
)

# Media Researcher Agent
media_researcher = Agent(
    role="Media Researcher",
    goal="Find copyright-safe visuals for each scene in the script",
    backstory="""You are a skilled researcher who knows how to find the perfect 
    copyright-safe images and videos for any topic. You have a keen eye for 
    visual quality and relevance. You understand copyright laws and always ensure 
    that media is properly licensed for commercial use. You know how to craft search 
    queries that yield the most relevant results. You can research topics deeply to 
    find the most appropriate and compelling visual content.""",
    verbose=True,
    llm=llm,
    tools=[pexels_search_tool, serper_search_tool]  # Now can also do web research
)

# Media Curator Agent
media_curator = Agent(
    role="Media Curator",
    goal="Organize and prepare media assets for video assembly",
    backstory="""You are a detail-oriented media curator who ensures all assets 
    are properly organized and prepared for video assembly. You verify file integrity 
    and ensure all assets meet quality standards. You know how to organize files 
    in a logical structure and can identify and fix common issues with media files.""",
    verbose=True,
    llm=llm,
    tools=[media_download_tool, ffmpeg_tool]
)

# Voice Selection Agent
voice_selector = Agent(
    role="Voice Selector",
    goal="Select the most appropriate voice for the video based on content and user preferences",
    backstory="""You are an expert in voice selection with a deep understanding of 
    how different voices affect audience perception. You know how to match voices 
    to content for maximum impact. You understand the nuances of tone, pace, and 
    accent, and how they influence the effectiveness of a voiceover for different 
    types of content and audiences.""",
    verbose=True,
    llm=llm,
    tools=[]  # Voice selector doesn't need tools for now
)
