"""
CrewAI Video Generation API

This module provides API endpoints for generating videos using CrewAI agents.
"""

from fastapi import APIRouter, BackgroundTasks, HTTPException, Depends
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
import uuid
import datetime
import json
import os
import databutton as db
import re

from app.crewai.crew import VideoForgeCrew

router = APIRouter(prefix="/crewai-video", tags=["crewai-video"])

# Models
class VideoCreationRequest(BaseModel):
    topic: str = Field(..., description="The topic of the video")
    duration_minutes: int = Field(5, description="Target duration in minutes", ge=1, le=30)
    style: str = Field("professional", description="Style of the video (professional, conversational, dramatic)")
    voice_gender: str = Field("neutral", description="Preferred gender of the voice (male, female, neutral)")
    voice_tone: str = Field("professional", description="Preferred tone of the voice (professional, conversational, dramatic)")

class VideoCreationResponse(BaseModel):
    id: str = Field(..., description="Unique identifier for the video creation job")
    topic: str = Field(..., description="Topic of the video")
    status: str = Field(..., description="Current status of the creation process")
    created_at: str = Field(..., description="Timestamp when the job was created")
    completed_at: Optional[str] = Field(None, description="Timestamp when the job was completed")
    result: Optional[Dict[str, Any]] = Field(None, description="Result of the video creation process")

# Helper functions
def sanitize_storage_key(key: str) -> str:
    """Sanitize storage key to only allow alphanumeric and ._- symbols"""
    return re.sub(r'[^a-zA-Z0-9._-]', '', key)

def get_video_jobs_for_user(user_id: str) -> List[Dict[str, Any]]:
    """Get all video creation jobs for a specific user"""
    try:
        jobs_data = db.storage.json.get(f"crewai-video-jobs-{sanitize_storage_key(user_id)}", default=[])
        return jobs_data
    except Exception as e:
        print(f"Error retrieving video jobs for user {user_id}: {e}")
        return []

def save_video_jobs_for_user(user_id: str, jobs: List[Dict[str, Any]]) -> None:
    """Save video creation jobs for a specific user"""
    try:
        db.storage.json.put(f"crewai-video-jobs-{sanitize_storage_key(user_id)}", jobs)
    except Exception as e:
        print(f"Error saving video jobs for user {user_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to save job data") from e

def update_video_job_status(user_id: str, job_id: str, status: str, result: Optional[Dict[str, Any]] = None) -> None:
    """Update the status of a video creation job"""
    try:
        jobs = get_video_jobs_for_user(user_id)
        for job in jobs:
            if job["id"] == job_id:
                job["status"] = status
                if result:
                    job["result"] = result
                job["completed_at"] = datetime.datetime.now().isoformat()
                break
        save_video_jobs_for_user(user_id, jobs)
    except Exception as e:
        print(f"Error updating job status for user {user_id}, job {job_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to update job status") from e

# Background task function
async def create_video_background(user_id: str, job_id: str, request: VideoCreationRequest):
    """Background task to create a video using CrewAI"""
    try:
        # Create the crew
        crew = VideoForgeCrew(verbose=True)
        
        # Execute the video creation process
        result = crew.create_video(
            topic=request.topic,
            duration_minutes=request.duration_minutes,
            style=request.style,
            gender=request.voice_gender,
            tone=request.voice_tone
        )
        
        # Update the job status
        update_video_job_status(user_id, job_id, "completed", result)
        
    except Exception as e:
        print(f"Error in video creation background task: {str(e)}")
        update_video_job_status(user_id, job_id, "failed", {"error": str(e)})

# API Endpoints
@router.post("/create", response_model=VideoCreationResponse)
async def create_video(request: VideoCreationRequest, background_tasks: BackgroundTasks, user_id: str = "default_user"):
    """
    Create a new video using CrewAI agents.
    
    This endpoint initiates a background task that uses CrewAI agents to:
    1. Generate a script based on the provided topic
    2. Find relevant media for each section of the script
    3. Curate and organize the media
    4. Select an appropriate voice for the video
    
    The process runs asynchronously, and the status can be checked using the /status endpoint.
    """
    # Create a new job
    job_id = str(uuid.uuid4())
    job = {
        "id": job_id,
        "topic": request.topic,
        "status": "processing",
        "created_at": datetime.datetime.now().isoformat(),
        "completed_at": None,
        "result": None
    }
    
    # Save the job
    jobs = get_video_jobs_for_user(user_id)
    jobs.append(job)
    save_video_jobs_for_user(user_id, jobs)
    
    # Start the background task
    background_tasks.add_task(create_video_background, user_id, job_id, request)
    
    return VideoCreationResponse(**job)

@router.get("/status/{job_id}", response_model=VideoCreationResponse)
async def get_video_status(job_id: str, user_id: str = "default_user"):
    """
    Get the status of a video creation job.
    """
    jobs = get_video_jobs_for_user(user_id)
    for job in jobs:
        if job["id"] == job_id:
            return VideoCreationResponse(**job)
    
    raise HTTPException(status_code=404, detail="Job not found")

@router.get("/list", response_model=List[VideoCreationResponse])
async def list_videos(user_id: str = "default_user"):
    """
    List all video creation jobs for a user.
    """
    jobs = get_video_jobs_for_user(user_id)
    return [VideoCreationResponse(**job) for job in jobs]
