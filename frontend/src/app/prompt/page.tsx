"use client";
import { useState } from "react";
import {
  isEmpty,
  flattenObjectPaths,
  hasDefaultApplied,
  getValidationStatus,
  groupBasePromptSections,
} from "../../lib/promptHelpers";

type ModelType = "z-image-turbo" | "banana-pro";

// Badge Component
function ValidationBadge({
  status,
  label,
}: {
  status: "default" | "missing" | "empty" | "set" | "warning";
  label: string;
}) {
  const colors: Record<string, string> = {
    default: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    missing: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    empty: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    set: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    warning: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  };

  return (
    <span className={`text-xs font-semibold px-2 py-1 rounded ${colors[status]}`}>
      {label}
    </span>
  );
}

// Copy Button
function CopyButton({ text, label }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="text-sm bg-zinc-700 text-white px-3 py-1 rounded hover:bg-zinc-600 transition"
    >
      {copied ? "✓ Kopiert" : label || "Kopieren"}
    </button>
  );
}

export default function PromptGenerator() {
  const [input, setInput] = useState("");
  const [model, setModel] = useState<ModelType>("z-image-turbo");
  const [basePromptResponse, setBasePromptResponse] = useState<any>(null);
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

  // Extract BasePrompt from response (handle both direct and envelope format)
  const basePrompt = basePromptResponse?.base_prompt ||
    basePromptResponse?.data ||
    basePromptResponse;

  async function handleGenerate() {
    if (!input.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/generate-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: input, model }),
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
    setBasePromptResponse(null);
    setAdapterOutput(null);

    try {
      const response = await fetch(`${backendUrl}/api/text-to-base`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: input }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || err.error || "API Fehler");
      }

      const data = await response.json();
      setBasePromptResponse(data);
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
        body: JSON.stringify(basePrompt),
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
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              model === "z-image-turbo"
                ? "Z.B.: Ein blondes Mädchen, 18 Jahre alt, aus Iowa, sitzt in einer Bibliothek und liest ein Buch..."
                : "Z.B.: Ein Porträt mit warmen Farben, natürlichem Licht von links, Hintergrund mit Pflanzen..."
            }
            className="w-full h-40 border rounded px-3 py-2 resize-none dark:bg-zinc-700 dark:border-zinc-600 dark:text-white"
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
              {/* Warnings Section */}
              {(basePromptResponse?.meta?.warnings?.length > 0 ||
                basePromptResponse?.warnings?.length > 0) && (
                <div className="bg-orange-50 dark:bg-orange-900 border border-orange-200 dark:border-orange-700 rounded p-4">
                  <h4 className="font-semibold text-orange-900 dark:text-orange-100 mb-2">
                    ⚠️ Warnungen
                  </h4>
                  <ul className="space-y-1">
                    {(basePromptResponse?.meta?.warnings ||
                      basePromptResponse?.warnings ||
                      []).map((w: string, i: number) => (
                      <li
                        key={i}
                        className="text-sm text-orange-800 dark:text-orange-200"
                      >
                        • {w}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Defaults Applied Info */}
              {basePromptResponse?.defaults_applied?.length > 0 && (
                <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded p-3">
                  <p className="text-xs text-blue-900 dark:text-blue-100">
                    <strong>Defaults angewendet:</strong>{" "}
                    {basePromptResponse.defaults_applied.join(", ")}
                  </p>
                </div>
              )}

              {/* Sections Render */}
              {(() => {
                const sections = groupBasePromptSections(basePrompt);
                const defaultsApplied = basePromptResponse?.defaults_applied || [];

                return (
                  <div className="space-y-4">
                    {/* Subject(s) Section */}
                    {sections.subjects.length > 0 && (
                      <div className="border rounded p-4 bg-zinc-50 dark:bg-zinc-700">
                        <h3 className="font-bold text-lg mb-3">👤 Subjekt/e</h3>
                        <div className="space-y-3">
                          {sections.subjects.map((subject: any, idx: number) => (
                            <div
                              key={idx}
                              className="border-l-4 border-zinc-300 dark:border-zinc-600 pl-3"
                            >
                              <div className="flex items-start gap-2 mb-2">
                                <span className="font-semibold">
                                  {idx > 0
                                    ? `Subjekt ${idx + 1}`
                                    : "Beschreibung"}
                                </span>
                                {subject.description ? (
                                  <ValidationBadge
                                    status={getValidationStatus(
                                      subject.description,
                                      defaultsApplied,
                                      `subject${idx > 0 ? `s[${idx}]` : ""}.description`,
                                      true
                                    )}
                                    label={
                                      hasDefaultApplied(
                                        `subject${idx > 0 ? `s[${idx}]` : ""}.description`,
                                        defaultsApplied
                                      )
                                        ? "Default"
                                        : "Set"
                                    }
                                  />
                                ) : (
                                  <ValidationBadge
                                    status="missing"
                                    label="Missing"
                                  />
                                )}
                              </div>
                              <p className="text-sm text-zinc-700 dark:text-zinc-300">
                                {subject.description || "(keine Beschreibung)"}
                              </p>

                              {subject.attributes?.length > 0 && (
                                <div className="mt-2">
                                  <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                                    Attribute:
                                  </p>
                                  <div className="flex flex-wrap gap-2">
                                    {subject.attributes.map((attr: string, aidx: number) => (
                                      <span
                                        key={aidx}
                                        className="text-xs bg-zinc-200 dark:bg-zinc-600 px-2 py-1 rounded"
                                      >
                                        {attr}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Environment Section */}
                    {sections.environment && (
                      <div className="border rounded p-4 bg-zinc-50 dark:bg-zinc-700">
                        <h3 className="font-bold text-lg mb-3">🌍 Umgeung</h3>
                        <div className="space-y-2 text-sm">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold">Ort:</span>
                              {sections.environment.location ? (
                                <ValidationBadge
                                  status={getValidationStatus(
                                    sections.environment.location,
                                    defaultsApplied,
                                    "environment.location",
                                    true
                                  )}
                                  label={
                                    hasDefaultApplied(
                                      "environment.location",
                                      defaultsApplied
                                    )
                                      ? "Default"
                                      : "Set"
                                  }
                                />
                              ) : (
                                <ValidationBadge
                                  status="missing"
                                  label="Missing"
                                />
                              )}
                            </div>
                            <p className="text-zinc-700 dark:text-zinc-300">
                              {sections.environment.location ||
                                "(keine Angabe)"}
                            </p>
                          </div>

                          {sections.environment.atmosphere && (
                            <div>
                              <p className="font-semibold">Atmosphäre:</p>
                              <p className="text-zinc-700 dark:text-zinc-300">
                                {sections.environment.atmosphere}
                              </p>
                            </div>
                          )}

                          {sections.environment.weather && (
                            <div>
                              <p className="font-semibold">Wetter:</p>
                              <p className="text-zinc-700 dark:text-zinc-300">
                                {sections.environment.weather}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Style Section */}
                    {sections.style && (
                      <div className="border rounded p-4 bg-zinc-50 dark:bg-zinc-700">
                        <h3 className="font-bold text-lg mb-3">🎨 Stil</h3>
                        <div className="space-y-2 text-sm">
                          {sections.style.lighting && (
                            <div>
                              <p className="font-semibold">Beleuchtung:</p>
                              <p className="text-zinc-700 dark:text-zinc-300">
                                {sections.style.lighting}
                              </p>
                            </div>
                          )}

                          {sections.style.camera && (
                            <div>
                              <p className="font-semibold">Kamera/Framing:</p>
                              <p className="text-zinc-700 dark:text-zinc-300">
                                {sections.style.camera}
                              </p>
                            </div>
                          )}

                          {sections.style.film_stock && (
                            <div>
                              <p className="font-semibold">Film-Stil:</p>
                              <p className="text-zinc-700 dark:text-zinc-300">
                                {sections.style.film_stock}
                              </p>
                            </div>
                          )}

                          {sections.style.aesthetics?.length > 0 && (
                            <div>
                              <p className="font-semibold">Ästhetik:</p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {sections.style.aesthetics.map(
                                  (aes: string, i: number) => (
                                    <span
                                      key={i}
                                      className="text-xs bg-purple-200 dark:bg-purple-700 px-2 py-1 rounded"
                                    >
                                      {aes}
                                    </span>
                                  )
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Technical Section */}
                    {sections.technical && (
                      <div className="border rounded p-4 bg-zinc-50 dark:bg-zinc-700">
                        <h3 className="font-bold text-lg mb-3">⚙️ Technische Parameter</h3>
                        <div className="space-y-2 text-sm">
                          {sections.technical.aspect_ratio && (
                            <div>
                              <p className="font-semibold">Seitenverhältnis:</p>
                              <p className="text-zinc-700 dark:text-zinc-300">
                                {sections.technical.aspect_ratio}
                              </p>
                            </div>
                          )}

                          {sections.technical.seed !== null &&
                            sections.technical.seed !== undefined && (
                              <div>
                                <p className="font-semibold">Seed:</p>
                                <p className="text-zinc-700 dark:text-zinc-300">
                                  {sections.technical.seed}
                                </p>
                              </div>
                            )}

                          {sections.technical.cfg_scale && (
                            <div>
                              <p className="font-semibold">CFG Scale:</p>
                              <p className="text-zinc-700 dark:text-zinc-300">
                                {sections.technical.cfg_scale}
                              </p>
                            </div>
                          )}

                          {sections.technical.steps && (
                            <div>
                              <p className="font-semibold">Steps:</p>
                              <p className="text-zinc-700 dark:text-zinc-300">
                                {sections.technical.steps}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Correlation ID */}
                    {basePromptResponse?.correlation_id && (
                      <div className="border-t pt-3 mt-3 flex items-center justify-between text-xs text-zinc-500">
                        <span>
                          Correlation: <code>{basePromptResponse.correlation_id}</code>
                        </span>
                        <CopyButton
                          text={basePromptResponse.correlation_id}
                          label="ID Kopieren"
                        />
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Adapter Section */}
              <div className="flex flex-col md:flex-row gap-3 items-center pt-4 border-t">
                <select
                  value={adapterModel}
                  onChange={(e) => setAdapterModel(e.target.value)}
                  className="border rounded px-3 py-2 w-full md:w-60 dark:bg-zinc-700 dark:border-zinc-600"
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
                <div>
                  <h3 className="font-bold text-lg mb-2">Adapter Output</h3>
                  {adapterOutput?.meta?.warnings?.length > 0 && (
                    <div className="bg-orange-50 dark:bg-orange-900 border border-orange-200 dark:border-orange-700 rounded p-3 mb-3">
                      <p className="text-xs text-orange-900 dark:text-orange-100">
                        <strong>Adapter Warnungen:</strong>{" "}
                        {adapterOutput.meta.warnings.join("; ")}
                      </p>
                    </div>
                  )}
                  <pre className="bg-zinc-100 dark:bg-zinc-900 p-4 rounded overflow-x-auto text-xs">
                    {JSON.stringify(adapterOutput, null, 2)}
                  </pre>
                </div>
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
                <CopyButton
                  text={JSON.stringify(result.json_structure, null, 2)}
                  label="Kopieren"
                />
              </div>
              <pre className="bg-zinc-100 dark:bg-zinc-900 p-4 rounded overflow-x-auto text-xs">
                {JSON.stringify(result.json_structure, null, 2)}
              </pre>
            </div>

            {result.full_prompt_text && (
              <div className="bg-white dark:bg-zinc-800 rounded-xl shadow p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">Finaler Prompt (600-1000 Wörter)</h2>
                  <CopyButton
                    text={result.full_prompt_text}
                    label="Kopieren"
                  />
                </div>
                <div className="bg-zinc-100 dark:bg-zinc-900 p-4 rounded text-sm whitespace-pre-wrap">
                  {result.full_prompt_text}
                </div>
                <div className="mt-4 text-sm text-zinc-500">
                  Wörter: {result.word_count} | Validierung:{" "}
                  {result.validation_passed ? "✅ Bestanden" : "❌ Fehlgeschlagen"}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
