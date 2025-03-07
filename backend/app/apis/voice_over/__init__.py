from pydantic import BaseModel, Field
from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional, Dict, Any
import time
from datetime import datetime
import databutton as db
import json
import uuid
from elevenlabs import ElevenLabs
import base64
from app.auth import AuthorizedUser  # Assuming this is your custom auth
from fastapi.responses import Response


router = APIRouter()

# --- Models ---

class VoiceSettingsModel(BaseModel):
    stability: float = Field(0.5, ge=0.0, le=1.0, description="How stable/consistent the voice is")
    similarity_boost: float = Field(0.75, ge=0.0, le=1.0, description="How much to prioritize sounding like the original voice")
    style: float = Field(0.0, ge=0.0, le=1.0, description="Speaking style adjustment")
    use_speaker_boost: bool = Field(True, description="Boost the speaker clarity and target speaker voice")

class VoiceModel(BaseModel):
    voice_id: str = Field(..., description="Unique identifier for the voice")
    name: str = Field(..., description="Name of the voice")
    category: Optional[str] = Field(None, description="Category of the voice (e.g., professional, conversational)")
    description: Optional[str] = Field(None, description="Description of the voice characteristics")
    labels: Optional[Dict[str, Any]] = Field(None, description="Additional labels/metadata for the voice")
    samples: Optional[List[Dict[str, Any]]] = Field(None, description="Sample audio clips of the voice")  # Consider a more specific type if possible
    settings: Optional[VoiceSettingsModel] = Field(None, description="Voice settings")

class VoiceListResponse(BaseModel):
    voices: List[VoiceModel] = Field(..., description="List of available voices")

class VoiceOverRequest(BaseModel):
    script_id: str = Field(..., description="ID of the script to generate voice-over for")
    voice_id: str = Field(..., description="ID of the voice to use")
    settings: Optional[VoiceSettingsModel] = Field(None, description="Voice settings to override defaults")
    speed: float = Field(1.0, ge=0.5, le=2.0, description="Speed multiplier for the voice-over")

class VoiceOverResponse(BaseModel):
    id: str = Field(..., description="Unique identifier for the voice-over")
    script_id: str = Field(..., description="ID of the script used")
    story_id: str = Field(..., description="ID of the original story")
    voice_id: str = Field(..., description="ID of the voice used")
    settings: Optional[VoiceSettingsModel] = Field(None, description="Voice settings used")
    speed: float = Field(..., description="Speed used for the voice-over")
    status: str = Field(..., description="Current status of the voice-over generation")
    audio_url: Optional[str] = Field(None, description="URL to the generated audio file")
    created_at: str = Field(..., description="Timestamp when the voice-over was created")
    completed_at: Optional[str] = Field(None, description="Timestamp when the voice-over was completed")

class VoiceOverPreviewRequest(BaseModel):
    text: str = Field(..., description="Text to generate voice-over preview for")
    voice_id: str = Field(..., description="ID of the voice to use")
    settings: Optional[VoiceSettingsModel] = Field(None, description="Voice settings to override defaults")
    speed: float = Field(1.0, ge=0.5, le=2.0, description="Speed multiplier for the voice-over")

class VoiceOverPreviewResponse(BaseModel):
    audio_data: str = Field(..., description="Base64 encoded audio data")

# --- Helper Functions ---

def sanitize_storage_key(key: str) -> str:
    """Sanitize storage key to only allow alphanumeric and ._- symbols"""
    import re
    return re.sub(r'[^a-zA-Z0-9._-]', '', key)

def get_script(script_id: str):
    """Retrieve a script by ID from storage"""
    try:
        scripts = db.storage.json.get(f"scripts_{script_id[:8]}", dict())
        if scripts and script_id in scripts:
            return scripts[script_id]
    except Exception as e:
        print(f"Error retrieving script: {e}")
    return None

def save_voice_over(voice_over: VoiceOverResponse, audio_data: bytes):
    """Save voice over metadata and audio data"""
    try:
        # Save metadata
        voice_overs = db.storage.json.get(f"voice_overs_{voice_over.id[:8]}", dict())
        voice_overs[voice_over.id] = voice_over.dict()
        db.storage.json.put(sanitize_storage_key(f"voice_overs_{voice_over.id[:8]}"), voice_overs)
        
        # Save audio data
        audio_key = sanitize_storage_key(f"voice_over_audio_{voice_over.id}")
        db.storage.binary.put(audio_key, audio_data)
        
        # Update audio URL  (Important:  This now reflects the storage key, NOT a full URL)
        voice_over.audio_url = audio_key
        voice_overs[voice_over.id] = voice_over.dict()
        db.storage.json.put(sanitize_storage_key(f"voice_overs_{voice_over.id[:8]}"), voice_overs)
        
        return True
    except Exception as e:
        print(f"Error saving voice over: {e}")
        return False

def get_voice_over(voice_over_id: str):
    """Retrieve voice over metadata by ID"""
    try:
        voice_overs = db.storage.json.get(f"voice_overs_{voice_over_id[:8]}", dict())
        if voice_overs and voice_over_id in voice_overs:
            return VoiceOverResponse(**voice_overs[voice_over_id])
    except Exception as e:
        print(f"Error retrieving voice over: {e}")
    return None

def get_voice_over_audio(voice_over_id: str):
    """Retrieve voice over audio data by ID"""
    try:
        audio_key = sanitize_storage_key(f"voice_over_audio_{voice_over_id}")
        return db.storage.binary.get(audio_key)
    except Exception as e:
        print(f"Error retrieving voice over audio: {e}")
    return None

def list_voice_overs_by_script(script_id: str):
    """List all voice overs for a specific script"""
    results = []
    try:
        # This is inefficient but works for now - in a real system you'd use a database with proper indexing
        prefixes = [f"voice_overs_{i}" for i in range(10)]  # Check prefixes 0-9
        for prefix in prefixes:
            voice_overs = db.storage.json.get(prefix, dict())
            for vo_id, vo_data in voice_overs.items():
                if vo_data.get("script_id") == script_id:
                    results.append(VoiceOverResponse(**vo_data))
    except Exception as e:
        print(f"Error listing voice overs: {e}")
    return results

# --- Endpoints ---

@router.get("/voices", response_model=VoiceListResponse)
def list_voices(user: AuthorizedUser) -> VoiceListResponse:
    """List all available voices from ElevenLabs."""
    try:
        api_key = db.secrets.get("ELEVENLABS_API_KEY")
        if not api_key:
            raise HTTPException(status_code=500, detail="ElevenLabs API key not configured")

        client = ElevenLabs(api_key=api_key)
        elevenlabs_voices = client.voices.get_all()

        voice_models = []
        for voice in elevenlabs_voices:
            settings = None
            if hasattr(voice, 'settings') and voice.settings:
                settings = VoiceSettingsModel(
                    stability=getattr(voice.settings, 'stability', 0.5),
                    similarity_boost=getattr(voice.settings, 'similarity_boost', 0.75),
                    style=getattr(voice.settings, 'style', 0.0),
                    use_speaker_boost=getattr(voice.settings, 'use_speaker_boost', True)
                )

            voice_model = VoiceModel(
                voice_id=voice.voice_id,
                name=voice.name,
                category=getattr(voice, 'category', None),
                description=getattr(voice, 'description', None),
                labels=getattr(voice, 'labels', None),
                samples=getattr(voice, 'samples', None),
                settings=settings
            )
            voice_models.append(voice_model)

        return VoiceListResponse(voices=voice_models)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve voices: {str(e)}")


@router.post("/preview", response_model=VoiceOverPreviewResponse)
def create_voice_over_preview(request: VoiceOverPreviewRequest, user: AuthorizedUser) -> VoiceOverPreviewResponse:
    """Generate a voice-over preview for a small amount of text."""
    try:
        api_key = db.secrets.get("ELEVENLABS_API_KEY")
        if not api_key:
            raise HTTPException(status_code=500, detail="ElevenLabs API key not configured")

        client = ElevenLabs(api_key=api_key)

        voice_settings = None
        if request.settings:
            voice_settings = {
                "stability": request.settings.stability,
                "similarity_boost": request.settings.similarity_boost,
                "style": request.settings.style,
                "use_speaker_boost": request.settings.use_speaker_boost
            }

        # Use the new client API to generate audio
        audio_data = client.text_to_speech.convert(
            text=request.text,
            voice_id=request.voice_id,
            model_id="eleven_multilingual_v2",
            voice_settings=voice_settings
        )

        audio_base64 = base64.b64encode(audio_data).decode("utf-8")
        return VoiceOverPreviewResponse(audio_data=audio_base64)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate voice-over preview: {str(e)}")


@router.post("/generate", response_model=VoiceOverResponse)
def generate_voice_over(request: VoiceOverRequest, user: AuthorizedUser) -> VoiceOverResponse:
    """Generate a voice-over for a script."""
    try:
        script = get_script(request.script_id)
        if not script:
            raise HTTPException(status_code=404, detail=f"Script with ID {request.script_id} not found")

        voice_over_id = str(uuid.uuid4())
        now = datetime.now().isoformat()

        voice_over = VoiceOverResponse(
            id=voice_over_id,
            script_id=request.script_id,
            story_id=script["story_id"],
            voice_id=request.voice_id,
            settings=request.settings,
            speed=request.speed,
            status="generating",
            created_at=now,
            completed_at=None,
            audio_url=None
        )

        api_key = db.secrets.get("ELEVENLABS_API_KEY")
        if not api_key:
            raise HTTPException(status_code=500, detail="ElevenLabs API key not configured")

        client = ElevenLabs(api_key=api_key)

        voice_settings = None
        if request.settings:
            voice_settings = {
                "stability": request.settings.stability,
                "similarity_boost": request.settings.similarity_boost,
                "style": request.settings.style,
                "use_speaker_boost": request.settings.use_speaker_boost
            }

        script_text = ""
        if "sections" in script:
            for section in script["sections"]:
                script_text += section["content"] + "\n\n"
        else:
            script_text = script.get("content", "")

        # Use the new client API to generate audio
        audio_data = client.text_to_speech.convert(
            text=script_text,
            voice_id=request.voice_id,
            model_id="eleven_multilingual_v2",
            voice_settings=voice_settings
        )

        voice_over.status = "completed"
        voice_over.completed_at = datetime.now().isoformat()
        save_voice_over(voice_over, audio_data)

        return voice_over

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate voice-over: {str(e)}")


@router.get("/list/{script_id}", response_model=List[VoiceOverResponse])
def list_voice_overs(script_id: str, user: AuthorizedUser) -> List[VoiceOverResponse]:
    """List all voice-overs for a script."""
    try:
        voice_overs = list_voice_overs_by_script(script_id)
        return voice_overs
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list voice-overs: {str(e)}")

@router.get("/{voice_over_id}", response_model=VoiceOverResponse)
def get_voice_over_metadata(voice_over_id: str, user: AuthorizedUser) -> VoiceOverResponse:
    """Get metadata for a voice-over."""
    try:
        voice_over = get_voice_over(voice_over_id)
        if not voice_over:
            raise HTTPException(status_code=404, detail=f"Voice-over with ID {voice_over_id} not found")
        return voice_over
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get voice-over metadata: {str(e)}")

@router.get("/audio/{voice_over_id}")
def get_voice_over_audio_data(voice_over_id: str, user: AuthorizedUser):
    """Get the audio data for a voice-over."""
    try:
        audio_data = get_voice_over_audio(voice_over_id)
        if not audio_data:
            raise HTTPException(status_code=404, detail=f"Audio for voice-over with ID {voice_over_id} not found")
        return Response(content=audio_data, media_type="audio/mpeg")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get voice-over audio: {str(e)}")