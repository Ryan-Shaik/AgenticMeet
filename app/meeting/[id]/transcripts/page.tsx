import { Suspense } from 'react';
import { SavedTranscripts } from '@/components/SavedTranscripts';

interface SavedPageProps {
  params: Promise<{ id: string }>;
}

export default async function SavedTranscriptsPage({ params }: SavedPageProps) {
  const { id } = await params;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <Suspense fallback={<div className="text-gray-400">Loading...</div>}>
          <SavedTranscripts meetingId={id} />
        </Suspense>
      </div>
    </div>
  );
}