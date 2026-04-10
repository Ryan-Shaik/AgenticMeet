import { NextResponse } from "next/server";
import { WebhookReceiver } from "livekit-server-sdk";

const receiver = new WebhookReceiver(
  process.env.LIVEKIT_API_KEY!,
  process.env.LIVEKIT_API_SECRET!
);

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const authorization = req.headers.get("Authorization");

    if (!authorization) {
      return NextResponse.json({ error: "No authorization header" }, { status: 401 });
    }

    const event = await receiver.receive(rawBody, authorization);

    console.log(`[LiveKit Webhook] Received event: ${event.event}`, {
      room: event.room?.name,
      id: event.id
    });

    // Detect when meeting ends
    if (event.event === "room_finished") {
      const roomName = event.room?.name;
      if (roomName) {
        console.log(`[LiveKit Webhook] Room finished: ${roomName}. Triggering summary...`);
        
        // Trigger the summarization engine
        // In a real production app, you might want to do this asynchronously
        // via a queue (e.g. Inngest, Upstash QStash) to avoid blocking the webhook.
        // For now, we'll just call our internal API.
        
        const host = req.headers.get("host");
        const protocol = host?.includes("localhost") ? "http" : "https";
        
        // Fire and forget or await? 
        // Better to not await if it takes long, but Phase 1 is just a shell.
        fetch(`${protocol}://${host}/api/meetings/summarize`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ meetingId: roomName }),
        }).catch(err => console.error("[Webhook] Failed to trigger summary:", err));
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[LiveKit Webhook] Error processing webhook:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
