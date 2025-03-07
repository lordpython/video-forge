#!/usr/bin/env python3
"""
Video Forge API Test Script

This script provides a comprehensive test suite for the Video Forge API.
It can test individual endpoints or run a complete workflow test.

Usage:
  python api_test.py --test-direct     # Test the direct test endpoint
  python api_test.py --test-stories    # Test story endpoints with auth disabled
  python api_test.py --test-all        # Test complete workflow (requires auth disabled)
  python api_test.py --test-auth       # Test with Firebase auth (requires token)
"""

import argparse
import json
import os
import requests
import time
import uuid
from pprint import pprint
from typing import Dict, List, Optional, Any, Tuple

# API Configuration
BASE_URL = "http://127.0.0.1:8000"
TEST_USER_ID = "test_user"

# Colors for terminal output
class Colors:
    HEADER = '\033[95m'
    BLUE = '\033[94m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    END = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'


def print_header(text: str) -> None:
    """Print a header with color."""
    print(f"\n{Colors.HEADER}{Colors.BOLD}{'=' * 80}{Colors.END}")
    print(f"{Colors.HEADER}{Colors.BOLD}{text.center(80)}{Colors.END}")
    print(f"{Colors.HEADER}{Colors.BOLD}{'=' * 80}{Colors.END}\n")


def print_result(success: bool, message: str, data: Optional[Any] = None) -> None:
    """Print a test result with color."""
    if success:
        print(f"{Colors.GREEN}✓ {message}{Colors.END}")
    else:
        print(f"{Colors.RED}✗ {message}{Colors.END}")
    
    if data:
        print(f"{Colors.BLUE}Response:{Colors.END}")
        if isinstance(data, str):
            print(data)
        else:
            pprint(data)
        print("")


def make_request(
    method: str,
    endpoint: str,
    params: Optional[Dict] = None,
    data: Optional[Dict] = None,
    headers: Optional[Dict] = None,
    auth_token: Optional[str] = None,
    user_id: Optional[str] = None
) -> Tuple[bool, Any]:
    """Make an HTTP request to the API."""
    url = f"{BASE_URL}{endpoint}"
    
    if not headers:
        headers = {}
    
    headers["Content-Type"] = "application/json"
    
    if auth_token:
        headers["Authorization"] = f"Bearer {auth_token}"
    
    if user_id and params is None:
        params = {"user_id": user_id}
    elif user_id:
        params["user_id"] = user_id
    
    try:
        response = requests.request(
            method=method,
            url=url,
            params=params,
            json=data,
            headers=headers
        )
        
        # Try to parse JSON response
        try:
            response_data = response.json()
        except:
            response_data = response.text
        
        # Check if request was successful
        if response.status_code >= 200 and response.status_code < 300:
            return True, response_data
        else:
            return False, response_data
    
    except Exception as e:
        return False, str(e)


def test_direct_endpoint() -> bool:
    """Test the direct test endpoint."""
    print_header("Testing Direct Test Endpoint")
    
    success, response = make_request("GET", "/test-direct")
    print_result(
        success, 
        "Direct test endpoint is accessible",
        response if success else f"Error: {response}"
    )
    
    return success


def test_story_endpoints(user_id: str, auth_token: Optional[str] = None) -> Tuple[bool, Optional[str]]:
    """Test the story creation and retrieval endpoints."""
    print_header("Testing Story Endpoints")
    
    # Test story creation
    story_data = {
        "topic": f"Test Story {str(uuid.uuid4())[:8]}",
        "genre": "Test",
        "target_audience": "API Testers",
        "tone": "Technical",
        "additional_details": "This is a test story created by the API test script."
    }
    
    success, response = make_request(
        "POST", 
        "/routes/stories", 
        data=story_data,
        auth_token=auth_token,
        user_id=user_id
    )
    
    print_result(
        success, 
        "Created a new story",
        response
    )
    
    if not success:
        return False, None
    
    # Save the story ID
    story_id = response.get("id")
    
    # Test get story endpoint
    success, response = make_request(
        "GET", 
        f"/routes/stories/{story_id}",
        auth_token=auth_token,
        user_id=user_id
    )
    
    print_result(
        success, 
        f"Retrieved story with ID {story_id}",
        response
    )
    
    # Test list stories endpoint
    success, response = make_request(
        "GET", 
        "/routes/stories",
        auth_token=auth_token,
        user_id=user_id
    )
    
    print_result(
        success, 
        "Retrieved list of stories",
        response
    )
    
    return success, story_id


def test_story_generation(story_id: str, user_id: str, auth_token: Optional[str] = None) -> Tuple[bool, Optional[str]]:
    """Test the story generation endpoints."""
    print_header("Testing Story Generation Endpoints")
    
    # Start story generation
    success, response = make_request(
        "POST", 
        f"/routes/stories/{story_id}/generate",
        auth_token=auth_token,
        user_id=user_id
    )
    
    print_result(
        success, 
        f"Started generation for story {story_id}",
        response
    )
    
    if not success:
        return False, None
    
    generation_id = response.get("id")
    
    # Check generations list
    success, response = make_request(
        "GET", 
        f"/routes/stories/{story_id}/generations",
        auth_token=auth_token,
        user_id=user_id
    )
    
    print_result(
        success, 
        "Retrieved list of generations",
        response
    )
    
    # In a real test, we would poll until generation is complete
    print(f"{Colors.YELLOW}Note: In a real test, we would poll until generation completes{Colors.END}")
    print(f"{Colors.YELLOW}Skipping wait for story generation to complete...{Colors.END}")
    
    # Check generated stories
    success, response = make_request(
        "GET", 
        f"/routes/stories/{story_id}/generated",
        auth_token=auth_token,
        user_id=user_id
    )
    
    print_result(
        success, 
        "Retrieved list of generated stories",
        response if success else f"Error: {response}"
    )
    
    # For the purpose of this test, we'll assume this worked
    # and return a mock generated story ID
    return success, "generated_story_123" if success else None


def test_script_endpoints(story_id: str, user_id: str, auth_token: Optional[str] = None) -> Tuple[bool, Optional[str]]:
    """Test the script generation endpoints."""
    print_header("Testing Script Generation Endpoints")
    
    # Start script generation
    script_data = {
        "story_id": story_id,
        "script_style": "professional",
        "include_b_roll": True,
        "max_duration_minutes": 5
    }
    
    success, response = make_request(
        "POST", 
        "/routes/scripts/generate",
        data=script_data,
        auth_token=auth_token,
        user_id=user_id
    )
    
    print_result(
        success, 
        f"Started script generation for story {story_id}",
        response
    )
    
    if not success:
        return False, None
    
    # Check script generations
    success, response = make_request(
        "GET", 
        f"/routes/scripts/generations/{story_id}",
        auth_token=auth_token,
        user_id=user_id
    )
    
    print_result(
        success, 
        "Retrieved list of script generations",
        response
    )
    
    # In a real test, we would poll until generation is complete
    print(f"{Colors.YELLOW}Note: In a real test, we would poll until generation completes{Colors.END}")
    print(f"{Colors.YELLOW}Skipping wait for script generation to complete...{Colors.END}")
    
    # For the purpose of this test, we'll assume a script was generated
    # and use a mock script ID
    script_id = "script_xyz_123"
    
    # Test script update
    script_update = {
        "title": "Updated Test Script",
        "sections": [
            {
                "type": "hook",
                "content": "This is an updated test hook section.",
                "b_roll_suggestions": ["Test footage A", "Test footage B"]
            },
            {
                "type": "main_content",
                "content": "This is updated test main content.",
                "b_roll_suggestions": ["Test footage C", "Test footage D"]
            }
        ],
        "approved": True
    }
    
    success, response = make_request(
        "PATCH", 
        f"/routes/scripts/{story_id}/{script_id}",
        data=script_update,
        auth_token=auth_token,
        user_id=user_id
    )
    
    print_result(
        success, 
        f"Updated script {script_id}",
        response if success else f"Error: {response}"
    )
    
    return success, script_id


def test_voice_endpoints(script_id: str, auth_token: Optional[str] = None) -> bool:
    """Test the voice-over endpoints."""
    print_header("Testing Voice-Over Endpoints")
    
    # List voices
    success, response = make_request(
        "GET", 
        "/routes/voices",
        auth_token=auth_token
    )
    
    print_result(
        success, 
        "Retrieved list of voices",
        response
    )
    
    # Use a mock voice ID since we can't get a real one
    voice_id = "mock_voice_123"
    
    # Test voice preview
    preview_data = {
        "text": "This is a test voice-over preview.",
        "voice_id": voice_id,
        "speed": 1.0
    }
    
    success, response = make_request(
        "POST", 
        "/routes/preview",
        data=preview_data,
        auth_token=auth_token
    )
    
    print_result(
        success, 
        "Created voice-over preview",
        "Voice preview response (truncated)..." if success else f"Error: {response}"
    )
    
    # Test voice-over generation
    voice_over_data = {
        "script_id": script_id,
        "voice_id": voice_id,
        "speed": 1.0
    }
    
    success, response = make_request(
        "POST", 
        "/routes/generate",
        data=voice_over_data,
        auth_token=auth_token
    )
    
    print_result(
        success, 
        "Started voice-over generation",
        response if success else f"Error: {response}"
    )
    
    return success


def run_full_workflow_test(auth_token: Optional[str] = None) -> None:
    """Run a complete workflow test from story creation to voice-over generation."""
    print_header("Running Complete Workflow Test")
    
    # Step 1: Create a story
    success, story_id = test_story_endpoints(TEST_USER_ID, auth_token)
    if not success or not story_id:
        print(f"{Colors.RED}Failed at story creation step. Stopping test.{Colors.END}")
        return
    
    # Step 2: Generate story content
    success, generated_story_id = test_story_generation(story_id, TEST_USER_ID, auth_token)
    if not success:
        print(f"{Colors.RED}Failed at story generation step. Stopping test.{Colors.END}")
        return
    
    # Step 3: Generate and update script
    success, script_id = test_script_endpoints(story_id, TEST_USER_ID, auth_token)
    if not success or not script_id:
        print(f"{Colors.RED}Failed at script generation step. Stopping test.{Colors.END}")
        return
    
    # Step 4: Test voice endpoints
    success = test_voice_endpoints(script_id, auth_token)
    if not success:
        print(f"{Colors.RED}Failed at voice-over step.{Colors.END}")
        return
    
    print(f"\n{Colors.GREEN}{Colors.BOLD}Complete workflow test finished successfully!{Colors.END}")


def main():
    """Main function to parse arguments and run tests."""
    parser = argparse.ArgumentParser(description="Video Forge API Test Script")
    parser.add_argument("--test-direct", action="store_true", help="Test the direct test endpoint")
    parser.add_argument("--test-stories", action="store_true", help="Test story endpoints")
    parser.add_argument("--test-all", action="store_true", help="Test complete workflow")
    parser.add_argument("--test-auth", action="store_true", help="Test with Firebase auth")
    parser.add_argument("--token", help="Firebase auth token for authenticated tests")
    parser.add_argument("--user-id", default=TEST_USER_ID, help="User ID for tests")
    
    args = parser.parse_args()
    
    # If no arguments provided, show help
    if not any(vars(args).values()):
        parser.print_help()
        return
    
    # Check if we're testing with auth
    auth_token = args.token if args.test_auth else None
    
    if args.test_auth and not args.token:
        print(f"{Colors.RED}Error: --test-auth requires --token{Colors.END}")
        return
    
    # Run requested tests
    if args.test_direct:
        test_direct_endpoint()
    
    if args.test_stories:
        test_story_endpoints(args.user_id, auth_token)
    
    if args.test_all:
        run_full_workflow_test(auth_token)


if __name__ == "__main__":
    main()
