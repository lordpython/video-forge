# AI Video Creator - Specification

This is a more technical description of how the application should work.

## Technology Stack

*   **Frontend:** React/Vue (or similar JavaScript framework)
*   **Backend:** Python/Flask or Node.js/Express
*   **Database:** PostgreSQL/MongoDB (or similar)
*   **Task Queue:** Celery/Redis Queue/BullMQ
*   **AI Agents:** CrewAI framework
*   **APIs:**
    *   Serper API (search)
    *   Pexels API (media)
    *   ElevenLabs API (voiceover)
    *   (Optional: RunwayML/Pictory API for advanced editing)
*   **Video Processing:** FFmpeg (command-line tool or library)

## Workflow

1.  **User Input:** User provides video topic and parameters via a web form.
2.  **Backend Request:** Frontend sends a request to the backend API with user inputs.
3.  **Task Queuing:** Backend queues a video generation task.
4.  **CrewAI Orchestration (Background Task):**
    *   **Script Architect Agent:** Generates a video script (JSON).
    *   **Media Researcher Agent:** Searches and downloads copyright-safe media (Serper, Pexels).
    *   **Media Curator Agent:** Organizes downloaded media.
    *   **ElevenLabs Voiceover:** Generates voiceover based on the script and user voice preferences.
    5.  **Video Assembly:** FFmpeg assembles video using script, media, and voiceover.
    6.  **Status Updates:** Backend updates task status in the database, and frontend polls or uses WebSockets to display progress.
    7.  **Video Output:**  Generated video is stored (e.g., in cloud storage), and a download link is provided to the user in the frontend.

## Key Features

*   User-friendly web interface with input forms.
*   AI-powered script generation.
*   Automated copyright-safe media sourcing.
*   AI voiceover generation with voice and tone selection.
*   Automatic video assembly.
*   Progress tracking and user feedback.
*   Video download functionality.
*   Copyright safeguards implemented.
*   Error handling and logging.