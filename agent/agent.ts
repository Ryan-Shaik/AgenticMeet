import 'dotenv/config';

import {
  type JobContext,
  ServerOptions,
  cli,
  defineAgent,
  voice,
} from '@livekit/agents';
import * as google from '@livekit/agents-plugin-google';
import { fileURLToPath } from 'node:url';

class AgenticMeetAssistant extends voice.Agent {
  async onEnter() {
    console.log('[AgenticMeet] Agent joined meeting');
    this.session.generateReply({
      instructions: "Say hello to everyone. Introduce yourself as the AgenticMeet AI Assistant. Let them know you're here to help take notes and answer questions.",
    });
  }

  static create() {
    return new AgenticMeetAssistant({
      instructions: `You are the AgenticMeet AI Assistant. 
Your job is to:
1. Listen to the conversation
2. When asked questions, respond helpfully
3. Offer to take notes or summarize when appropriate
4. Keep responses short and natural`,
    });
  }
}

export default defineAgent({
  entry: async (ctx: JobContext) => {
    try {
      console.log('[AgenticMeet] Joining room:', ctx.room.name);
      await ctx.connect();

      const model = new google.beta.realtime.RealtimeModel({
        model: "gemini-2.0-flash-preview",
        voice: "Puck",
      });

      const session = new voice.AgentSession({
        llm: model,
      });

      console.log('[AgenticMeet] Starting session...');
      
      await session.start({
        agent: AgenticMeetAssistant.create(),
        room: ctx.room,
      });

      console.log('[AgenticMeet] Agent is now active');

      await new Promise<void>((resolve) => {
        ctx.room.on('disconnected', () => resolve());
      });
      
      console.log('[AgenticMeet] Meeting ended');
    } catch (error) {
      console.error('[AgenticMeet] Failed:', error);
    }
  },
});

const __filename = fileURLToPath(import.meta.url);

cli.runApp(new ServerOptions({ 
  agent: __filename,
  apiKey: process.env.LIVEKIT_API_KEY!,
  apiSecret: process.env.LIVEKIT_API_SECRET!,
  wsURL: process.env.LIVEKIT_URL!,
  numIdleProcesses: 0,
  initializeProcessTimeout: 60000,
}));