'use client';

import React, { useState } from 'react';
import { generateJsonFromImage, ImageAnalysisResult } from '@/lib/api';
import ClipboardIcon from '@/components/ui/ClipboardIcon';

const ImageUploadForm = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ImageAnalysisResult | null>(null);
  const [copiedJson, setCopiedJson] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setIsLoading(true);
    setError(null);
    setResult(null);
    setCopiedJson(false);

    try {
      const data = await generateJsonFromImage(file);
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-card p-8 rounded-xl border border-border shadow-sm">
        <h2 className="text-2xl font-serif text-foreground mb-4">Bild zu JSON</h2>
        <p className="text-foreground/70 mb-6 font-sans">
          Laden Sie ein Bild hoch. Die KI analysiert es und erstellt ein detailliertes JSON-Schema der visuellen Elemente.
        </p>
        <form onSubmit={handleSubmit}>
          <div className="flex items-center justify-center w-full">
            <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-40 border-2 border-border border-dashed rounded-lg cursor-pointer bg-background hover:bg-foreground/5 transition-colors">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <svg className="w-8 h-8 mb-4 text-foreground/40" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/></svg>
                <p className="mb-2 text-sm text-foreground/60"><span className="font-semibold">Klicken zum Hochladen</span> oder Bild hierher ziehen</p>
                <p className="text-xs text-foreground/50">PNG, JPG, GIF</p>
              </div>
              <input id="dropzone-file" type="file" className="hidden" onChange={handleFileChange} accept="image/png, image/jpeg, image/gif" />
            </label>
          </div>
          {file && <p className="mt-4 text-sm text-center text-foreground/80">Ausgewählte Datei: {file.name}</p>}
          <div className="mt-6 flex justify-end">
            <button type="submit" className="bg-primary text-primary-foreground font-sans font-semibold px-8 py-3 rounded-lg shadow-sm hover:bg-primary/90 transition-colors disabled:bg-primary/50 disabled:cursor-not-allowed flex items-center" disabled={!file || isLoading}>
              {isLoading && (<svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>)}
              {isLoading ? 'Analysiere...' : 'JSON generieren'}
            </button>
          </div>
        </form>
      </div>

      {error && <div className="mt-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">{error}</div>}

      {result && (
        <div className="mt-8">
          <div className="bg-card p-6 rounded-xl border border-border">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-serif text-xl">Analyse-Ergebnis (JSON)</h3>
              <button onClick={() => handleCopy(JSON.stringify(result, null, 2))} className="text-foreground/60 hover:text-primary transition-colors text-sm font-sans flex items-center">
                {copiedJson ? 'Kopiert!' : <><ClipboardIcon className="h-4 w-4 mr-2" /> Kopieren</>}
              </button>
            </div>
            <pre className="text-sm bg-background p-4 rounded-lg overflow-x-auto max-h-[600px]"><code>{JSON.stringify(result, null, 2)}</code></pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploadForm;