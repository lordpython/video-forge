# AI Video Creator - Prompt Library

This file contains the prompts for configuring and using various AI tools and agents within the AI Video Creator application.

## 1. CrewAI Agent Setup Prompts

### A. Script Architect Agent
```markdown
**Role**: Script Architect
**Goal**: Transform raw text into structured video scripts with scene descriptions.
**Prompt**:
"Act as a video script expert. Convert this text into a 3-scene YouTube script. For each scene:
1. Write concise voiceover narration (1-2 sentences).
2. Specify required visuals (e.g., 'B-roll of beaches at sunset').
3. Define scene duration (5-10 seconds).
Format as JSON. Text: [INSERT YOUR TOPIC]"