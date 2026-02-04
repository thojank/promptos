'use client';

import React, { useState } from 'react';
import { generatePromptFromText, PromptGenerationResult } from '@/lib/api';
import ClipboardIcon from '@/components/ui/ClipboardIcon';

const PromptInputForm = () => {
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PromptGenerationResult | null>(null);
  const [copiedJson, setCopiedJson] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      setCopiedJson(false);
      setCopiedText(false);
      const data = await generatePromptFromText(text);
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (content: string, type: 'json' | 'text') => {
    navigator.clipboard.writeText(content);
    if (type === 'json') {
      setCopiedJson(true);
      setCopiedText(false); // Reset other button
      setTimeout(() => setCopiedJson(false), 2000);
    } else {
      setCopiedText(true);
      setCopiedJson(false); // Reset other button
      setTimeout(() => setCopiedText(false), 2000);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-card p-8 rounded-xl border border-border shadow-sm">
        <h2 className="text-2xl font-serif text-foreground mb-4">Idee zu Prompt</h2>
      <p className="text-foreground/70 mb-6 font-sans">
        Beschreiben Sie Ihre Idee in einfachen Worten. Die KI wandelt sie in ein strukturiertes JSON und einen detaillierten Prompt um.
      </p>
      <form onSubmit={handleSubmit}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="z.B. Ein Cyberpunk-Detektiv im Regen, düster..."
          className="w-full h-40 p-4 rounded-lg bg-background border border-border focus:ring-2 focus:ring-primary focus:outline-none transition-shadow font-sans"
        />
        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            className="bg-primary text-primary-foreground font-sans font-semibold px-8 py-3 rounded-lg shadow-sm hover:bg-primary/90 transition-colors disabled:bg-primary/50 disabled:cursor-not-allowed flex items-center"
            disabled={!text.trim() || isLoading}
          >
            {isLoading && (
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            )}
            {isLoading ? 'Generiere...' : 'Prompt generieren'}
          </button>
        </div>
      </form>
      </div>

      {error && <div className="mt-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">{error}</div>}

      {result && (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-card p-6 rounded-xl border border-border">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-serif text-xl">Strukturiertes JSON</h3>
              <button
                onClick={() =>
                  handleCopy(JSON.stringify(result.json_structure, null, 2), 'json')
                }
                className="text-foreground/60 hover:text-primary transition-colors text-sm font-sans flex items-center"
              >
                {copiedJson ? (
                  'Kopiert!'
                ) : (
                  <><ClipboardIcon className="h-4 w-4 mr-2" /> Kopieren</>
                )}
              </button>
            </div>
            <pre className="text-sm bg-background p-4 rounded-lg overflow-x-auto"><code>{JSON.stringify(result.json_structure, null, 2)}</code></pre>
          </div>
          <div className="bg-card p-6 rounded-xl border border-border">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-serif text-xl">Finaler Prompt ({result.word_count} Wörter)</h3>
              <button
                onClick={() => handleCopy(result.prompt_text, 'text')}
                className="text-foreground/60 hover:text-primary transition-colors text-sm font-sans flex items-center"
              >
                {copiedText ? (
                  'Kopiert!'
                ) : (
                  <><ClipboardIcon className="h-4 w-4 mr-2" /> Kopieren</>
                )}
              </button>
            </div>
            <p className="font-sans text-foreground/90 whitespace-pre-wrap">{result.prompt_text}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PromptInputForm;