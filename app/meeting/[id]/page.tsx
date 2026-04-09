import { Suspense } from 'react';
import { LiveTranscript } from '@/components/LiveTranscript';

interface MeetingPageProps {
  params: Promise<{ id: string }>;
}

export default async function MeetingPage({ params }: MeetingPageProps) {
  const { id } = await params;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Meeting Room</h1>
        <p className="text-gray-400 mb-4">Meeting ID: {id}</p>
        
        <div className="grid grid-cols-1 gap-6">
          <div className="bg-gray-800 rounded-lg p-4 aspect-video flex items-center justify-center">
            <p className="text-gray-500">Meeting Video/Screen</p>
          </div>
          
          <Suspense fallback={<div className="text-gray-400">Loading transcript...</div>}>
            <LiveTranscript meetingId={id} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}