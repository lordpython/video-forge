# Video Forge API Test Plan

## API Overview

Based on the analysis of http://127.0.0.1:8000/docs and the direct test endpoint, this API provides functionality for:

1. **Story Acquisition** - Creating and managing story concepts
2. **Story Generation** - Generating story content based on concepts
3. **Script Generation** - Creating scripts from stories
4. **Voice Over** - Generating voice-overs from scripts

## Authentication

The API uses Firebase Authentication. Most endpoints require a valid Firebase authentication token in the `authorization` header (Bearer token format).

## Test Environment Requirements

To fully test this API, you would need:

1. A Firebase account with credentials for this project (project ID: project-soul-448918)
2. A valid authentication token obtained through Firebase Auth
3. Tools like Postman, cURL, or a custom script to make authenticated requests

## Test Workflow Sequence

A complete test workflow would follow this sequence:

1. **Authentication**: Obtain a Firebase token using the Firebase SDK
2. **Story Creation**: Create a new story concept with topic, genre, audience, and tone
3. **Story Generation**: Generate story content based on the concept
4. **Script Generation**: Create a script from the generated story
5. **Script Editing**: Optionally update the script content
6. **Voice Selection**: List available voices
7. **Voice Over Generation**: Create voice-overs from the script
8. **Voice Over Retrieval**: Fetch the audio data

## Core Endpoints to Test

### Story Workflow
- `POST /routes/stories` - Create a new story concept
- `GET /routes/stories` - List user's stories
- `GET /routes/stories/{story_id}` - Get a specific story
- `POST /routes/stories/{story_id}/generate` - Generate story content
- `GET /routes/stories/{story_id}/generations` - Check generation status
- `GET /routes/stories/{story_id}/generated` - Get generated stories

### Script Workflow
- `POST /routes/scripts/generate` - Generate a script from a story
- `GET /routes/scripts/generations/{story_id}` - Check script generation status
- `GET /routes/scripts/{story_id}` - List generated scripts
- `GET /routes/scripts/{story_id}/{script_id}` - Get a specific script
- `PATCH /routes/scripts/{story_id}/{script_id}` - Update a script

### Voice Over Workflow
- `GET /routes/voices` - List available voices
- `POST /routes/preview` - Create a voice-over preview
- `POST /routes/generate` - Generate a full voice-over
- `GET /routes/list/{script_id}` - List voice-overs for a script
- `GET /routes/{voice_over_id}` - Get voice-over metadata
- `GET /routes/audio/{voice_over_id}` - Get voice-over audio data

## Testing Method

To test without Firebase authentication, you would need to:

1. Modify the `routers.json` to set `disableAuth: true` for each router
2. Restart the server
3. Then follow the workflow sequence above using tools like cURL or Postman

### Sample Test Command (with Authentication Disabled)

```bash
# Create a story
curl -X POST "http://127.0.0.1:8000/routes/stories?user_id=test_user" \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "Artificial Intelligence",
    "genre": "Educational",
    "target_audience": "Developers",
    "tone": "Professional",
    "additional_details": "Focus on recent breakthroughs"
  }'
```

## Authentication Test Command (with Firebase Auth)

```bash
# Get a list of stories with authentication
curl -X GET "http://127.0.0.1:8000/routes/stories?user_id=test_user" \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN"
```

## API Integration Issues

During testing, we encountered SSL certificate issues with Databutton storage:
- SSL certificate verification failed when trying to store data
- This appears to be a local development environment issue

## Recommendations

1. **Mock Storage**: For testing, consider implementing a mock storage layer that doesn't require Databutton
2. **Environment Variables**: Add environment variable options to disable authentication for testing
3. **Test Suite**: Develop a comprehensive test suite that can run automated tests across all endpoints
4. **API Documentation**: Add more details to the Swagger documentation, including examples
