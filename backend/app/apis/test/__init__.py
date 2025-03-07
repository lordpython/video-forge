from fastapi import APIRouter
from pydantic import BaseModel, Field
from typing import Optional, List
import uuid
import datetime

router = APIRouter()

class TestResponse(BaseModel):
    id: str = Field(..., description="Test ID")
    message: str = Field(..., description="Test message")
    timestamp: str = Field(..., description="Timestamp")

@router.get("/test", response_model=TestResponse)
async def test_endpoint():
    """Simple test endpoint that doesn't use Databutton storage"""
    return TestResponse(
        id=str(uuid.uuid4()),
        message="API test successful! This endpoint works without authentication.",
        timestamp=datetime.datetime.now().isoformat()
    )
