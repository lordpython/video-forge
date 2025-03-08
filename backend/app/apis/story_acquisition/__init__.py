from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field
from typing import Optional, List
import uuid
import datetime
import databutton as db
import os
import json
import re
import ssl
import urllib3

# For development environment only - disable SSL verification warnings
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# Development mode flag
DEV_MODE = True

router = APIRouter()

class StoryRequest(BaseModel):
    topic: str = Field(..., description="The main topic or idea for the video")
    genre: str = Field(..., description="The genre of the video")
    target_audience: str = Field(..., description="The target audience for the video")
    tone: str = Field(..., description="The tone of the video")
    additional_details: Optional[str] = Field(None, description="Additional details or requirements")
    research_keywords: Optional[List[str]] = Field(None, description="Keywords to guide web research for the video content")
    target_video_length: Optional[str] = Field(None, description="Target length of the video in minutes")
    video_style: Optional[str] = Field(None, description="Style of the video (e.g., Animated, Live Action)")
    story_type: Optional[str] = Field(None, description="Type of real story (e.g., True Crime, Success Story)")

class StoryResponse(BaseModel):
    id: str = Field(..., description="Unique identifier for the story")
    topic: str = Field(..., description="The main topic or idea for the video")
    genre: str = Field(..., description="The genre of the video")
    target_audience: str = Field(..., description="The target audience for the video")
    tone: str = Field(..., description="The tone of the video")
    additional_details: Optional[str] = Field(None, description="Additional details or requirements")
    research_keywords: Optional[List[str]] = Field(None, description="Keywords to guide web research for the video content")
    target_video_length: Optional[str] = Field(None, description="Target length of the video in minutes")
    video_style: Optional[str] = Field(None, description="Style of the video (e.g., Animated, Live Action)")
    story_type: Optional[str] = Field(None, description="Type of real story (e.g., True Crime, Success Story)")
    created_at: str = Field(..., description="Timestamp when the story was created")
    status: str = Field(..., description="Current status of the story generation process")

class StoriesListResponse(BaseModel):
    stories: List[StoryResponse] = Field(..., description="List of stories")

def sanitize_storage_key(key: str) -> str:
    """Sanitize storage key to only allow alphanumeric and ._- symbols"""
    return re.sub(r'[^a-zA-Z0-9._-]', '', key)

# Fallback storage for development
dev_storage = {}

def get_stories_for_user(user_id: str) -> List[StoryResponse]:
    """Get all stories for a specific user"""
    try:
        if not DEV_MODE:
            # Production mode - use databutton storage
            try:
                stories_data = db.storage.json.get(f"stories-{sanitize_storage_key(user_id)}", default=[])
                print(f"Retrieved stories from databutton storage: {stories_data}")
                return [StoryResponse(**story) for story in stories_data]
            except Exception as e:
                print(f"Databutton storage retrieval failed: {e}")
                return []
        else:
            # Development mode - use local storage
            if user_id in dev_storage:
                print(f"DEV MODE: Retrieving from dev storage for user {user_id}")
                return [StoryResponse(**story) for story in dev_storage[user_id]]
            else:
                print(f"DEV MODE: No stories found for user {user_id}")
                return []
    except Exception as e:
        print(f"Error retrieving stories for user {user_id}: {e}")
        return []

def save_stories_for_user(user_id: str, stories: List[dict]) -> None:
    """Save stories for a specific user"""
    try:
        if not DEV_MODE:
            # Production mode - use databutton storage
            try:
                print(f"Attempting to save to databutton storage: {stories}")
                db.storage.json.put(f"stories-{sanitize_storage_key(user_id)}", stories)
                print("Successfully saved to databutton storage")
            except Exception as e:
                print(f"Databutton storage save failed: {e}")
                raise HTTPException(status_code=500, detail="Failed to save story in production mode") from e
        else:
            # Development mode - use local storage
            print(f"DEV MODE: Saving to dev storage for user {user_id}")
            dev_storage[user_id] = stories
            print(f"Dev storage now contains stories for user {user_id}")
    except Exception as e:
        print(f"Error saving stories for user {user_id}: {e}")
        if not DEV_MODE:
            raise HTTPException(status_code=500, detail="Failed to save story") from e

@router.post("/stories", response_model=StoryResponse)
async def create_story(request: StoryRequest, user_id: str = Query(..., description="User ID for authentication")) -> StoryResponse:
    """Create a new story based on user input"""
    try:
        # Generate a unique ID for the story
        story_id = str(uuid.uuid4())
        current_time = datetime.datetime.now().isoformat()
        
        # Create story object
        story = {
            "id": story_id,
            "topic": request.topic,
            "genre": request.genre,
            "target_audience": request.target_audience,
            "tone": request.tone,
            "additional_details": request.additional_details,
            "research_keywords": request.research_keywords,
            "target_video_length": request.target_video_length,
            "video_style": request.video_style,
            "story_type": request.story_type,
            "created_at": current_time,
            "status": "pending"  # Initial status
        }
        
        # Get existing stories for the user
        existing_stories = get_stories_for_user(user_id)
        existing_stories_dict = [s.dict() for s in existing_stories]
        
        # Add the new story
        existing_stories_dict.append(story)
        
        # Save updated stories list
        save_stories_for_user(user_id, existing_stories_dict)
        
        return StoryResponse(**story)
    except Exception as e:
        print(f"Error creating story: {e}")
        raise HTTPException(status_code=500, detail="Failed to create story") from e

@router.get("/stories", response_model=StoriesListResponse)
async def list_stories(user_id: str = Query(..., description="User ID for authentication")) -> StoriesListResponse:
    """List all stories for the authenticated user"""
    try:
        stories = get_stories_for_user(user_id)
        return StoriesListResponse(stories=stories)
    except Exception as e:
        print(f"Error listing stories: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve stories") from e

@router.get("/stories/{story_id}", response_model=StoryResponse)
async def get_story(story_id: str, user_id: str = Query(..., description="User ID for authentication")) -> StoryResponse:
    """Get a specific story by ID"""
    try:
        stories = get_stories_for_user(user_id)
        for story in stories:
            if story.id == story_id:
                return story
        raise HTTPException(status_code=404, detail="Story not found")
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error retrieving story: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve story") from e
