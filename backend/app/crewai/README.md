# Video Forge CrewAI Implementation

This directory contains a CrewAI-based implementation for the Video Forge project. It uses a team of AI agents to automate the video creation process.

## Components

### Agents

The implementation uses four specialized agents:

1. **Script Architect** - Creates engaging and structured video scripts based on user topics
2. **Media Researcher** - Finds copyright-safe visuals for each scene in the script
3. **Media Curator** - Organizes and prepares media assets for video assembly
4. **Voice Selector** - Selects the most appropriate voice for the video based on content and user preferences

### Tools

The agents use several tools to perform their tasks:

1. **PexelsSearchTool** - Searches for images and videos on Pexels
2. **MediaDownloadTool** - Downloads media files from URLs
3. **FFmpegTool** - Executes FFmpeg commands for video processing

### Workflow

The video creation process follows these steps:

1. The Script Architect generates a script based on the provided topic
2. The Media Researcher finds relevant media for each section of the script
3. The Media Curator organizes and prepares the media assets
4. The Voice Selector chooses an appropriate voice for the video

## Usage

### API Integration

The CrewAI implementation is integrated with the FastAPI backend through the `/crewai-video` endpoints:

- `POST /crewai-video/create` - Create a new video
- `GET /crewai-video/status/{job_id}` - Get the status of a video creation job
- `GET /crewai-video/list` - List all video creation jobs

### Example Script

You can run the example script to test the functionality:

```bash
cd backend
source venv/bin/activate
python -m app.crewai.example
```

### Environment Variables

The implementation requires the following environment variables:

- `OPENAI_API_KEY` - OpenAI API key for the language models
- `PEXELS_API_KEY` - Pexels API key for media search (optional, mock data will be used if not provided)

## Customization

You can customize the implementation by:

1. Adding more tools to the agents
2. Modifying the agent prompts and backstories
3. Adjusting the task descriptions
4. Extending the workflow with additional steps

## Future Improvements

Potential improvements to the implementation:

1. Add more specialized agents (e.g., Video Editor, Quality Assurance)
2. Integrate with more media sources
3. Implement more advanced video editing capabilities
4. Add user feedback loops during the creation process
