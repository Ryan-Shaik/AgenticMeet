import { AccessToken } from "livekit-server-sdk";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { meetings } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { sql } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const room = req.nextUrl.searchParams.get("room");
  const username = req.nextUrl.searchParams.get("username");

  if (!room) {
    return NextResponse.json(
      { error: 'Missing "room" query parameter' },
      { status: 400 }
    );
  } else if (!username) {
    return NextResponse.json(
      { error: 'Missing "username" query parameter' },
      { status: 400 }
    );
  }

  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;
  const wsUrl = process.env.LIVEKIT_URL;

  if (!apiKey || !apiSecret || !wsUrl) {
    return NextResponse.json(
      { error: "Server misconfigured" },
      { status: 500 }
    );
  }

  // Upsert meeting row so transcript FK constraints never fail.
  // We do this here because get-token is called before any participant
  // speaks — it is the earliest reliable point in the meeting lifecycle.
  try {
    const session = await getSession();
    const hostId = session?.user?.id ?? null;

    await db
      .insert(meetings)
      .values({
        id: room,
        title: room,
        hostId,
        status: "active",
      })
      .onConflictDoNothing();
  } catch (err) {
    // Non-fatal: if the upsert fails the token is still returned.
    // The transcription route has its own safety-net upsert.
    console.error("[get-token] Failed to upsert meeting row:", err);
  }

  const at = new AccessToken(apiKey, apiSecret, {
    identity: username,
    name: username,
  });

  at.addGrant({
    roomJoin: true,
    room: room,
    canPublish: true,
    canSubscribe: true,
  });

  return NextResponse.json({
    token: await at.toJwt(),
  });
}
