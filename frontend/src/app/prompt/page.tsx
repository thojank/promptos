"use client";
import { useState } from "react";

type ModelType = "z-image-turbo" | "banana-pro";

export default function PromptGenerator() {
  const [input, setInput] = useState("");
  const [model, setModel] = useState<ModelType>("z-image-turbo");
  const [basePrompt, setBasePrompt] = useState<any>(null);
  const [adapterModel, setAdapterModel] = useState("flux");
  const [adapterOutput, setAdapterOutput] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [baseLoading, setBaseLoading] = useState(false);
  const [adapterLoading, setAdapterLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [baseError, setBaseError] = useState<string | null>(null);
  const [adapterError, setAdapterError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8001";

  async function handleGenerate() {
    if (!input.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/generate-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: input, model })
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "API Fehler");
      }

      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerateBasePrompt() {
    if (!input.trim()) return;
    setBaseLoading(true);
    setBaseError(null);
    setBasePrompt(null);
    setAdapterOutput(null);

    try {
      const response = await fetch(`${backendUrl}/api/text-to-base`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: input })
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || err.error || "API Fehler");
      }

      const data = await response.json();
      setBasePrompt(data.base_prompt || data);
    } catch (err: any) {
      setBaseError(err.message);
    } finally {
      setBaseLoading(false);
    }
  }

  async function handleAdapt() {
    if (!basePrompt) return;
    setAdapterLoading(true);
    setAdapterError(null);
    setAdapterOutput(null);

    try {
      const response = await fetch(`${backendUrl}/api/adapt/${adapterModel}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(basePrompt)
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || err.error || "API Fehler");
      }

      const data = await response.json();
      setAdapterOutput(data);
    } catch (err: any) {
      setAdapterError(err.message);
    } finally {
      setAdapterLoading(false);
    }
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    alert("In Zwischenablage kopiert!");
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="headline-scope text-3xl font-bold mb-6 text-center">Text → JSON Prompt Generator</h1>
        <p className="text-center text-zinc-600 dark:text-zinc-300 mb-8">
          Beschreibe deine Szene. Die KI erstellt daraus ein optimales JSON für dein gewähltes Modell.
        </p>

        <div className="bg-white dark:bg-zinc-800 rounded-xl shadow p-6 mb-6">
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Modell auswählen</label>
            <div className="flex gap-4">
              <button
                onClick={() => setModel("z-image-turbo")}
                className={`flex-1 py-2 px-4 rounded transition ${
                  model === "z-image-turbo"
                    ? "bg-zinc-900 text-white"
                    : "bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-300 dark:hover:bg-zinc-600"
                }`}
              >
                Z-Image Turbo
              </button>
              <button
                onClick={() => setModel("banana-pro")}
                className={`flex-1 py-2 px-4 rounded transition ${
                  model === "banana-pro"
                    ? "bg-zinc-900 text-white"
                    : "bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-300 dark:hover:bg-zinc-600"
                }`}
              >
                Google Banana Pro
              </button>
            </div>
          </div>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={
              model === "z-image-turbo"
                ? "Z.B.: Ein blondes Mädchen, 18 Jahre alt, aus Iowa, sitzt in einer Bibliothek und liest ein Buch..."
                : "Z.B.: Ein Porträt mit warmen Farben, natürlichem Licht von links, Hintergrund mit Pflanzen..."
            }
            className="w-full h-40 border rounded px-3 py-2 resize-none"
          />
          <button
            onClick={handleGenerate}
            disabled={loading || !input.trim()}
            className="mt-4 w-full bg-zinc-900 text-white py-3 rounded hover:bg-zinc-700 transition disabled:opacity-50"
          >
            {loading ? "Generiere..." : "JSON Prompt erstellen"}
          </button>
        </div>

        <div className="bg-white dark:bg-zinc-800 rounded-xl shadow p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Universal BasePrompt</h2>
            <button
              onClick={handleGenerateBasePrompt}
              disabled={baseLoading || !input.trim()}
              className="bg-zinc-900 text-white py-2 px-4 rounded hover:bg-zinc-700 transition disabled:opacity-50"
            >
              {baseLoading ? "Generiere..." : "BasePrompt erzeugen"}
            </button>
          </div>

          {baseError && (
            <div className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 p-3 rounded mb-4">
              <strong>Fehler:</strong> {baseError}
            </div>
          )}

          {basePrompt && (
            <div className="space-y-4">
              <pre className="bg-zinc-100 dark:bg-zinc-900 p-4 rounded overflow-x-auto text-xs">
                {JSON.stringify(basePrompt, null, 2)}
              </pre>

              <div className="flex flex-col md:flex-row gap-3 items-center">
                <select
                  value={adapterModel}
                  onChange={e => setAdapterModel(e.target.value)}
                  className="border rounded px-3 py-2 w-full md:w-60"
                >
                  <option value="flux">Flux</option>
                  <option value="banana-pro">Banana Pro</option>
                </select>
                <button
                  onClick={handleAdapt}
                  disabled={adapterLoading}
                  className="w-full md:w-auto bg-zinc-700 text-white py-2 px-4 rounded hover:bg-zinc-600 transition disabled:opacity-50"
                >
                  {adapterLoading ? "Adaptiere..." : "Adapter anwenden"}
                </button>
              </div>

              {adapterError && (
                <div className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 p-3 rounded">
                  <strong>Fehler:</strong> {adapterError}
                </div>
              )}

              {adapterOutput && (
                <pre className="bg-zinc-100 dark:bg-zinc-900 p-4 rounded overflow-x-auto text-xs">
                  {JSON.stringify(adapterOutput, null, 2)}
                </pre>
              )}
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 p-4 rounded mb-6">
            <strong>Fehler:</strong> {error}
          </div>
        )}

        {result && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-zinc-800 rounded-xl shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Strukturiertes JSON</h2>
                <button
                  onClick={() => copyToClipboard(JSON.stringify(result.json_structure, null, 2))}
                  className="text-sm bg-zinc-700 text-white px-3 py-1 rounded hover:bg-zinc-600 transition"
                >
                  Kopieren
                </button>
              </div>
              <pre className="bg-zinc-100 dark:bg-zinc-900 p-4 rounded overflow-x-auto text-xs">
                {JSON.stringify(result.json_structure, null, 2)}
              </pre>
            </div>

            {result.full_prompt_text && (
              <div className="bg-white dark:bg-zinc-800 rounded-xl shadow p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">Finaler Prompt (600-1000 Wörter)</h2>
                  <button
                    onClick={() => copyToClipboard(result.full_prompt_text)}
                    className="text-sm bg-zinc-700 text-white px-3 py-1 rounded hover:bg-zinc-600 transition"
                  >
                    Kopieren
                  </button>
                </div>
                <div className="bg-zinc-100 dark:bg-zinc-900 p-4 rounded text-sm whitespace-pre-wrap">
                  {result.full_prompt_text}
                </div>
                <div className="mt-4 text-sm text-zinc-500">
                  Wörter: {result.word_count} | Validierung: {result.validation_passed ? "✅ Bestanden" : "❌ Fehlgeschlagen"}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
