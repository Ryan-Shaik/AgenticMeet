require('dotenv').config({ path: '../.env' });
const { WebSocketServer } = require('ws');
const port = process.env.PORT || process.env.WS_PORT || 5001;

const wss = new WebSocketServer({ port });

const meetings = new Map();

console.log(`WebSocket server started on port ${port}`);

wss.on('connection', (ws) => {
  console.log('Client connected');

  ws.meetingId = null;
  ws.speakerName = null;

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString());
      
      if (data.type === 'join') {
        ws.meetingId = data.meetingId;
        ws.speakerName = data.speakerName || 'Unknown';
        
        if (!meetings.has(data.meetingId)) {
          meetings.set(data.meetingId, new Set());
        }
        meetings.get(data.meetingId).add(ws);
        
        console.log(`User ${ws.speakerName} joined meeting ${data.meetingId}`);
        
        ws.send(JSON.stringify({
          type: 'joined',
          meetingId: data.meetingId,
          message: 'Successfully joined the meeting'
        }));
      }
      
      if (data.type === 'transcription') {
        console.log('Received transcription:', {
          speaker: data.speaker,
          text: data.text,
          meetingId: data.meetingId,
          timestamp: data.timestamp
        });

        const processed = processTranscription(data.text);

        const broadcastMessage = JSON.stringify({
          type: 'transcription',
          speaker: data.speaker,
          text: data.text,
          meetingId: data.meetingId,
          timestamp: data.timestamp,
          processed: processed
        });

        broadcastToMeeting(data.meetingId, broadcastMessage, ws);
      }
    } catch (err) {
      console.error('Error processing message:', err);
    }
  });

  ws.on('close', () => {
    if (ws.meetingId && meetings.has(ws.meetingId)) {
      meetings.get(ws.meetingId).delete(ws);
      console.log(`User ${ws.speakerName} left meeting ${ws.meetingId}`);
      
      broadcastToMeeting(ws.meetingId, JSON.stringify({
        type: 'user_left',
        speaker: ws.speakerName,
        timestamp: new Date().toISOString()
      }));
      
      if (meetings.get(ws.meetingId).size === 0) {
        console.log(`[WS Server] Last user left ${ws.meetingId}. Triggering automatic summary...`);
        meetings.delete(ws.meetingId);

        // Auto-trigger summarization (Development automation)
        // This bypasses the need for webhooks during local testing
        const apiUrl = process.env.BETTER_AUTH_URL || 'http://localhost:3000';
        console.log(`[WS Server] Sending summarize request for ${ws.meetingId} to: ${apiUrl}/api/meetings/summarize`);
        
        fetch(`${apiUrl}/api/meetings/summarize`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'x-api-key': process.env.INTERNAL_API_SECRET || 'dev-secret-key'
          },
          body: JSON.stringify({ meetingId: ws.meetingId })
        }).then(async r => {
          const resText = await r.text();
          console.log(`[WS Server] Auto-summary result for ${ws.meetingId}: HTTP ${r.status}`, resText);
        })
          .catch(err => console.error(`[WS Server] Auto-summary error for ${ws.meetingId}:`, err.message));
      }
    }
    console.log('Client disconnected');
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

function broadcastToMeeting(meetingId, message, excludeClient = null) {
  if (!meetings.has(meetingId)) return;
  
  meetings.get(meetingId).forEach((client) => {
    if (client !== excludeClient && client.readyState === 1) {
      client.send(message);
    }
  });
}

function processTranscription(text) {
  const words = text.trim().split(/\s+/);
  
  return {
    wordCount: words.length,
    charCount: text.length,
    timestamp: new Date().toISOString()
  };
}