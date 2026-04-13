# Implementation Plan: Real-Time AI Conversational Video Participant

This document outlines the step-by-step technical plan to implement the **"Real-Time AI Conversational Response Engine"** in the AgenticMeet platform. This feature enables a live AI participant to join the video conference, listen to human participants, and engage in bidirectional voice conversation.

## 1. Architectural Overview

Since the project tech stack is strictly **TypeScript** and **Next.js**, we will use a split architecture:
1.  **Frontend (Next.js client-side):** Manages the user interface, video rendering, and LiveKit room connection using `@livekit/components-react`.
2.  **Next.js API Routes (Server-side):** Generates secure connection tokens for users to join the LiveKit room.
3.  **Agent Backend (Node.js/TypeScript Worker):** A separate worker process (using `@livekit/agents` for Node.js) that joins the room as an AI participant. It utilizes the **Gemini Live API** for native multimodal interaction—receiving audio directly from WebRTC and outputting synthesized speech without requiring separate STT or TTS services.

## 2. Prerequisites & Setup

*   **LiveKit Cloud Project:** Create a project on LiveKit Cloud to get the API Key, API Secret, and WebSocket URL.
*   **Gemini API Key:** For the multimodal Live API (obtainable from Google AI Studio).
*   **Environment Variables:** Add keys to `.env` (`LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`, `LIVEKIT_URL`, `GOOGLE_API_KEY`). Note: The LiveKit Google plugin specifically looks for `GOOGLE_API_KEY`.

## 3. Implementation Steps

### Phase 1: LiveKit Infrastructure & Token Generation
1.  **Install LiveKit Server SDK:** `npm install livekit-server-sdk`
2.  **Create Auth Route:** Create a Next.js API route (`app/api/livekit/get-token/route.ts`) to generate an `AccessToken`. The token requires the participant's name, room name, and standard video/publish/subscribe permissions.

### Phase 2: Frontend (Next.js UI components)
1.  **Install React Components:** `npm install @livekit/components-react @livekit/components-styles livekit-client`
2.  **Create the Video Room Component:** Create a client component that wraps the `LiveKitRoom` provider. Pass the generated token and `LIVEKIT_URL` to connect to the LiveKit server.
3.  **Implement Participant Grid:** Use the `<VideoConference />` or build a custom grid with `<ParticipantTile />` to show the human users and the AI avatar.
4.  **Implement Audio/Video Controls:** Add standard mute/unmute and camera toggles using LiveKit components like `<ControlBar />`.
5.  **Agent Visualization:** specifically style the remote participant who has the identity "AI_Agent" to display an audio visualizer (e.g., `<BarVisualizer />`) when speaking.

### Phase 3: AI Voice Agent Worker (Typescript/Node Backend)
1.  **Initialize the Agent Project:** Set up a separate script or microservice in the monorepo to run the agent worker using the `@livekit/agents` and `@livekit/agents-plugin-google` packages.
2.  **Implement the Agent Pipeline:**
    *   **Native Multimodal Processing:** Use the `google.beta.realtime.RealtimeModel`. This model handles audio input and output natively.
    *   **VAD (Voice Activity Detection):** Utilize Gemini's built-in turn detection or Silero VAD for low-latency interruptions.
    *   **LLM Configuration:** Set the persona ("AgenticMeet AI Assistant") via the `instructions` parameter and choose a voice (e.g., "Puck" or "Fenrir").
    *   **No Separate STT/TTS:** Audio streams are sent directly to the model, and the model streams back audio tokens, dramatically reducing latency compared to traditional cascaded pipelines.
3.  **VoicePipelineAgent Setup:** Use the `VoicePipelineAgent` class to orchestrate the VAD -> STT -> LLM -> TTS flow seamlessly. Handle interruption logic (if a user talks over the AI, the AI must stop speaking and listen).
4.  **Launch Worker:** The agent worker connects to the LiveKit Cloud environment and listens for new room creations, automatically deploying the AI participant into the active room.

### Phase 4: Integration & UX Polish
1.  **Bi-directional Communication:** Ensure the delay between a user speaking and the AI responding is minimal (targeting <1s latency). Provide UI cues (e.g., "AI is thinking...") using custom events if necessary.
2.  **Design Alignment:** Style the UI components using TailwindCSS and Shadcn UI to adhere to the requested *glassmorphism/neo-brutalist* high-fidelity aesthetic outlined in the project overview.

## 4. Execution Workflow

1.  We will start by laying down the Next.js `generate-token` API route.
2.  Next, we will structure the Next.js frontend to enter a Mock LiveKit room.
3.  Then, we will build out the TypeScript Agent Worker.
4.  Finally, we will do end-to-end testing with audio inputs and outputs.
