import { NextResponse } from "next/server";
import { db } from "@/db";
import { meetings } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { checkAccess } from "@/lib/subscription";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, title } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "Meeting ID is required" }, { status: 400 });
    }

    // Enforce Module 1/2 limits
    const access = await checkAccess(session.user.id, "meeting");
    if (!access.allowed) {
      return NextResponse.json({ error: access.reason }, { status: 403 });
    }

    await db.insert(meetings).values({
      id,
      title: title || `Meeting ${id}`,
      hostId: session.user.id,
      status: "active",
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[Create Meeting] Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
