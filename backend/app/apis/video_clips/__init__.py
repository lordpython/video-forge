from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
import uuid
import json
import os
from datetime import datetime
from pathlib import Path

router = APIRouter(prefix="/video-clips", tags=["video-clips"])

# Models
class VideoClip(BaseModel):
    id: str
    title: str
    thumbnail_url: str
    duration: float
    tags: List[str]
    source: str
    url: str

class VideoClipSearchRequest(BaseModel):
    query: str
    tags: Optional[List[str]] = None
    max_duration: Optional[float] = None
    min_duration: Optional[float] = None

class VideoClipListResponse(BaseModel):
    clips: List[VideoClip]

class ScriptSegmentClip(BaseModel):
    segment_id: str
    clip_id: str
    start_time: float
    end_time: float
    
class VideoGenerationRequest(BaseModel):
    script_id: str
    voice_over_id: str
    segment_clips: List[ScriptSegmentClip]
    
class VideoGenerationResponse(BaseModel):
    id: str
    script_id: str
    voice_over_id: str
    status: str
    message: Optional[str] = None
    created_at: str
    completed_at: Optional[str] = None
    url: Optional[str] = None
    thumbnail_url: Optional[str] = None

class FinalVideo(BaseModel):
    id: str
    title: str
    description: str
    duration: float
    url: str
    thumbnail_url: str
    created_at: str
    story_id: str
    script_id: str
    voice_over_id: str
    status: str
    resolution: str
    file_size: int

class FinalVideoUpdateRequest(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None

# Helper functions
def sanitize_storage_key(key: str) -> str:
    """Sanitize a key for storage (remove special characters, etc.)"""
    return "".join(c if c.isalnum() or c in ['-', '_'] else '_' for c in key)

def get_video_clips_path() -> Path:
    """Get the path to the video clips storage directory"""
    base_dir = Path(os.environ.get("STORAGE_DIR", "/tmp/video_app"))
    clips_dir = base_dir / "video_clips"
    clips_dir.mkdir(parents=True, exist_ok=True)
    return clips_dir

def get_final_videos_path() -> Path:
    """Get the path to the final videos storage directory"""
    base_dir = Path(os.environ.get("STORAGE_DIR", "/tmp/video_app"))
    videos_dir = base_dir / "final_videos"
    videos_dir.mkdir(parents=True, exist_ok=True)
    return videos_dir

def get_video_clips() -> List[VideoClip]:
    """Get all available video clips"""
    # In a real implementation, this would query a database
    # For now, we'll return mock data
    return [
        VideoClip(
            id="clip1",
            title="Business Meeting",
            thumbnail_url="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80",
            duration=15.0,
            tags=["business", "meeting", "office", "professional"],
            source="stock",
            url="https://example.com/videos/business-meeting.mp4"
        ),
        VideoClip(
            id="clip2",
            title="Technology Interface",
            thumbnail_url="https://images.unsplash.com/photo-1581090700227-8e3b68af7d70?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80",
            duration=12.0,
            tags=["technology", "interface", "digital", "futuristic"],
            source="stock",
            url="https://example.com/videos/tech-interface.mp4"
        ),
        VideoClip(
            id="clip3",
            title="Medical Research",
            thumbnail_url="https://images.unsplash.com/photo-1579154204601-01588f351e67?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80",
            duration=18.0,
            tags=["medical", "research", "science", "laboratory"],
            source="stock",
            url="https://example.com/videos/medical-research.mp4"
        ),
        VideoClip(
            id="clip4",
            title="Nature Landscape",
            thumbnail_url="https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80",
            duration=20.0,
            tags=["nature", "landscape", "outdoors", "scenic"],
            source="stock",
            url="https://example.com/videos/nature-landscape.mp4"
        ),
        VideoClip(
            id="clip5",
            title="Urban City",
            thumbnail_url="https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80",
            duration=15.0,
            tags=["urban", "city", "buildings", "architecture"],
            source="stock",
            url="https://example.com/videos/urban-city.mp4"
        ),
        VideoClip(
            id="clip6",
            title="Digital Marketing",
            thumbnail_url="https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80",
            duration=14.0,
            tags=["marketing", "digital", "business", "analytics"],
            source="stock",
            url="https://example.com/videos/digital-marketing.mp4"
        )
    ]

def search_video_clips(query: str, tags: Optional[List[str]] = None, 
                       max_duration: Optional[float] = None, 
                       min_duration: Optional[float] = None) -> List[VideoClip]:
    """Search for video clips based on criteria"""
    clips = get_video_clips()
    
    # Filter by query
    if query:
        query = query.lower()
        clips = [clip for clip in clips if 
                query in clip.title.lower() or 
                any(query in tag.lower() for tag in clip.tags)]
    
    # Filter by tags
    if tags:
        clips = [clip for clip in clips if 
                any(tag in clip.tags for tag in tags)]
    
    # Filter by duration
    if max_duration is not None:
        clips = [clip for clip in clips if clip.duration <= max_duration]
    
    if min_duration is not None:
        clips = [clip for clip in clips if clip.duration >= min_duration]
    
    return clips

def get_final_videos_for_user(user_id: str) -> List[FinalVideo]:
    """Get all final videos for a user"""
    videos_path = get_final_videos_path() / f"{sanitize_storage_key(user_id)}_videos.json"
    
    if not videos_path.exists():
        return []
    
    with open(videos_path, "r") as f:
        videos_data = json.load(f)
    
    return [FinalVideo(**video) for video in videos_data]

def save_final_videos_for_user(user_id: str, videos: List[Dict[str, Any]]) -> None:
    """Save final videos for a user"""
    videos_path = get_final_videos_path() / f"{sanitize_storage_key(user_id)}_videos.json"
    
    with open(videos_path, "w") as f:
        json.dump(videos, f, indent=2)

def get_final_video(user_id: str, video_id: str) -> Optional[FinalVideo]:
    """Get a specific final video for a user"""
    videos = get_final_videos_for_user(user_id)
    for video in videos:
        if video.id == video_id:
            return video
    return None

def update_final_video(user_id: str, video_id: str, update_data: Dict[str, Any]) -> Optional[FinalVideo]:
    """Update a final video's metadata"""
    videos = get_final_videos_for_user(user_id)
    updated_videos = []
    updated_video = None
    
    for video in videos:
        if video.id == video_id:
            # Update the video data
            video_dict = video.dict()
            video_dict.update(update_data)
            updated_video = FinalVideo(**video_dict)
            updated_videos.append(updated_video.dict())
        else:
            updated_videos.append(video.dict())
    
    if updated_video:
        save_final_videos_for_user(user_id, updated_videos)
    
    return updated_video

# API Endpoints
@router.get("/clips", response_model=VideoClipListResponse)
async def list_video_clips(
    query: str = Query(None, description="Search query"),
    tags: List[str] = Query(None, description="Filter by tags"),
    max_duration: float = Query(None, description="Maximum duration in seconds"),
    min_duration: float = Query(None, description="Minimum duration in seconds")
):
    """List available video clips with optional filtering"""
    clips = search_video_clips(query, tags, max_duration, min_duration)
    return VideoClipListResponse(clips=clips)

@router.post("/generate", response_model=VideoGenerationResponse)
async def generate_video(
    request: VideoGenerationRequest,
    user_id: str = Query(..., description="User ID")
):
    """Generate a final video from script, voice-over, and clips"""
    # In a real implementation, this would start a video generation job
    # For now, we'll simulate it with a mock response
    
    video_id = f"video-{uuid.uuid4()}"
    now = datetime.now().isoformat()
    
    # Create a new video generation response
    video_generation = VideoGenerationResponse(
        id=video_id,
        script_id=request.script_id,
        voice_over_id=request.voice_over_id,
        status="processing",
        message="Video generation started",
        created_at=now,
        completed_at=None,
        url=None,
        thumbnail_url=None
    )
    
    # In a real implementation, we would start a background job here
    # For demo purposes, we'll create a "completed" video right away
    
    # Get existing videos
    videos = get_final_videos_for_user(user_id)
    video_dicts = [v.dict() for v in videos]
    
    # Create a new final video
    final_video = FinalVideo(
        id=video_id,
        title="How AI is Revolutionizing Content Creation",
        description="An in-depth look at how artificial intelligence is transforming the way we create and consume content in the digital age.",
        duration=180.0,  # 3 minutes
        url=f"/api/final-videos/{video_id}/video",
        thumbnail_url="https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
        created_at=now,
        story_id=request.script_id.split("-")[0],  # Assuming script_id format is "story_id-script_id"
        script_id=request.script_id,
        voice_over_id=request.voice_over_id,
        status="completed",
        resolution="1080p",
        file_size=45600000  # ~45.6 MB
    )
    
    # Add to user's videos
    video_dicts.append(final_video.dict())
    save_final_videos_for_user(user_id, video_dicts)
    
    return video_generation

@router.get("/videos/{video_id}", response_model=FinalVideo)
async def get_final_video_metadata(
    video_id: str,
    user_id: str = Query(..., description="User ID")
):
    """Get metadata for a final video"""
    video = get_final_video(user_id, video_id)
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
    return video

@router.patch("/videos/{video_id}", response_model=FinalVideo)
async def update_final_video_metadata(
    video_id: str,
    update_request: FinalVideoUpdateRequest,
    user_id: str = Query(..., description="User ID")
):
    """Update metadata for a final video"""
    # Check if video exists
    video = get_final_video(user_id, video_id)
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
    
    # Update video metadata
    update_data = {k: v for k, v in update_request.dict().items() if v is not None}
    updated_video = update_final_video(user_id, video_id, update_data)
    
    if not updated_video:
        raise HTTPException(status_code=500, detail="Failed to update video metadata")
    
    return updated_video

@router.get("/videos", response_model=List[FinalVideo])
async def list_final_videos(
    user_id: str = Query(..., description="User ID")
):
    """List all final videos for a user"""
    videos = get_final_videos_for_user(user_id)
    return videos
