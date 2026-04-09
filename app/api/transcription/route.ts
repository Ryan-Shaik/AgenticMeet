import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { transcripts as transcriptsTable } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { meetingId, speakerId, speakerName, content, timestamp } = body;

    if (!meetingId || !content) {
      return NextResponse.json(
        { error: 'meetingId and content are required' },
        { status: 400 }
      );
    }

    const transcriptId = crypto.randomUUID();
    const now = new Date();

    await db.insert(transcriptsTable).values({
      id: transcriptId,
      meetingId,
      speakerId: speakerId || null,
      speakerName: speakerName || null,
      content,
      timestamp: timestamp ? new Date(timestamp) : now,
      createdAt: now,
    });

    return NextResponse.json({ id: transcriptId, success: true });
  } catch (error) {
    console.error('Error saving transcript:', error);
    return NextResponse.json(
      { error: 'Failed to save transcript' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const meetingId = searchParams.get('meetingId');

    if (!meetingId) {
      return NextResponse.json(
        { error: 'meetingId is required' },
        { status: 400 }
      );
    }

    const meetingTranscripts = await db
      .select()
      .from(transcriptsTable)
      .where(eq(transcriptsTable.meetingId, meetingId))
      .orderBy(desc(transcriptsTable.timestamp));

    return NextResponse.json({ transcripts: meetingTranscripts });
  } catch (error) {
    console.error('Error fetching transcripts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transcripts' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'id is required' },
        { status: 400 }
      );
    }

    await db.delete(transcriptsTable).where(eq(transcriptsTable.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting transcript:', error);
    return NextResponse.json(
      { error: 'Failed to delete transcript' },
      { status: 500 }
    );
  }
}