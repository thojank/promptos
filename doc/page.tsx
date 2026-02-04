'use client';

import React, { useState } from 'react';
import PromptInputForm from '@/components/ui/PromptInputForm';
import ImageUploadForm from '@/components/ui/ImageUploadForm';

type Mode = 'text-to-prompt' | 'image-to-json';

export default function Home() {
  const [mode, setMode] = useState<Mode>('text-to-prompt');

  const getTabClass = (tabMode: Mode) => {
    return mode === tabMode
      ? 'bg-primary text-primary-foreground'
      : 'bg-card hover:bg-foreground/5';
  };

  return (
    <main className="min-h-screen bg-background flex flex-col items-center p-4 sm:p-8">
      <div className="w-full max-w-4xl">
        <div className="mb-8 flex justify-center">
          <div className="inline-flex rounded-lg border border-border p-1">
            <button onClick={() => setMode('text-to-prompt')} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${getTabClass('text-to-prompt')}`}>
              Text zu Prompt
            </button>
            <button onClick={() => setMode('image-to-json')} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${getTabClass('image-to-json')}`}>
              Bild zu JSON
            </button>
          </div>
        </div>
        {mode === 'text-to-prompt' && <PromptInputForm />}
        {mode === 'image-to-json' && <ImageUploadForm />}
      </div>
    </main>
  );
}