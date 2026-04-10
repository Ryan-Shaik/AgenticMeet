import { NextResponse } from "next/server";
import { db } from "@/db";
import { meetings } from "@/db/schema";

export async function POST(req: Request) {
  try {
    const { id, title } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "Meeting ID is required" }, { status: 400 });
    }

    await db.insert(meetings).values({
      id,
      title: title || `Meeting ${id}`,
      status: "active",
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[Create Meeting] Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
