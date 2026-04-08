import * as dotenv from 'dotenv';
dotenv.config();

import {
  type JobContext,
  type JobProcess,
  ServerOptions,
  cli,
  defineAgent,
  voice,
} from '@livekit/agents';
import * as google from '@livekit/agents-plugin-google';
import * as silero from '@livekit/agents-plugin-silero';
import { fileURLToPath } from 'node:url';

/**
 * AgenticMeet AI Assistant
 * This agent joins AgenticMeet video conferences and provides real-time intelligent interaction.
 */
class AgenticMeetAssistant extends voice.Agent {
  async onEnter() {
    // Initial greeting when the agent enters the room
    this.session.generateReply({
      instructions: "Greet the participants warmly and introduce yourself as the AgenticMeet AI Assistant. Mention that you're here to help with notes, summaries, and real-time support.",
    });
  }

  static create() {
    return new AgenticMeetAssistant({
      instructions: `You are the AgenticMeet AI Assistant, a core member of the meeting. 
      Your persona is professional, ultra-intelligent, and helpful. 
      Active tasks:
      1. Listen to the conversation and provide context-aware responses.
      2. Keep track of discussion points for the summary (which we will build in Phase 4).
      3. Be concise and allow natural human flow; don't dominate the conversation.
      4. If a user interrupts you, stop speaking and listen.`,
    });
  }
}

export default defineAgent({
  prewarm: async (proc: JobProcess) => {
    // Pre-load VAD to reduce join latency
    proc.userData.vad = await silero.VAD.load();
  },
  entry: async (ctx: JobContext) => {
    try {
      await ctx.connect();
      console.log('Starting AgenticMeet Assistant for room:', ctx.room.name);

      const session = new voice.AgentSession({
        aecWarmupDuration: 500,
        llm: new google.beta.realtime.RealtimeModel({
          model: "gemini-2.5-flash-native-audio-preview-12-2025",
          voice: "Puck",
          realtimeInputConfig: {
            automaticActivityDetection: {
              silenceDurationMs: 200, // Lower value = faster response
            },
          },
          thinkingConfig: { 
            includeThoughts: false,
            thinkingBudget: 0 // Disable thinking for absolute minimum latency
          },
        }),
      });

      await session.start({
        agent: AgenticMeetAssistant.create(),
        room: ctx.room,
      });

      console.log('Agent session started successfully.');

      await new Promise<void>((resolve) => {
        ctx.room.on('disconnected', () => resolve());
      });
    } catch (error) {
      console.error('Final Agent Error:', error);
    }
  },
});

const __filename = fileURLToPath(import.meta.url);

// Run the agent server
cli.runApp(new ServerOptions({ 
  agent: __filename,
  apiKey: process.env.LIVEKIT_API_KEY,
  apiSecret: process.env.LIVEKIT_API_SECRET,
  wsURL: process.env.LIVEKIT_URL,
  numIdleProcesses: 0,
  initializeProcessTimeout: 60000,
}));
