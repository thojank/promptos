"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

const initialState = {
  title: "",
  description: "",
  jsonText: "",
};

export default function EnvironmentsLibraryPage() {
  const [form, setForm] = useState(initialState);
  const [environments, setEnvironments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchEnvironments();
  }, []);

  async function fetchEnvironments() {
    const { data, error } = await supabase
      .from("environments")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) setError(error.message);
    else setEnvironments(data || []);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    let parsedJson: any;
    try {
      parsedJson = JSON.parse(form.jsonText);
    } catch (err) {
      setError("JSON ist ungültig. Bitte prüfe die Syntax.");
      setLoading(false);
      return;
    }

    const { error } = await supabase
      .from("environments")
      .insert([
        {
          title: form.title,
          description: form.description || null,
          environment_json: parsedJson,
        },
      ]);

    if (error) setError(error.message);
    else {
      setSuccess(true);
      setForm(initialState);
      fetchEnvironments();
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="headline-scope text-3xl font-bold mb-6 text-center">Environment Library</h1>
        <p className="text-center text-zinc-600 dark:text-zinc-300 mb-8">
          Speichere wiederverwendbare Umgebungen als JSON‑Bausteine.
        </p>

        <form className="bg-white dark:bg-zinc-800 p-6 rounded-xl shadow mb-8" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Titel (z.B. Mediterranean Coastal Cafe)"
              className="border rounded px-3 py-2"
              required
            />
            <input
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Kurzbeschreibung (optional)"
              className="border rounded px-3 py-2"
            />
          </div>
          <textarea
            name="jsonText"
            value={form.jsonText}
            onChange={handleChange}
            placeholder='Environment JSON (z.B. { "location": "historic piazza in Bari", "atmosphere": "warm, relaxed afternoon" })'
            className="w-full h-40 border rounded px-3 py-2 mt-4 resize-none"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="mt-4 w-full bg-zinc-900 text-white py-3 rounded hover:bg-zinc-700 transition disabled:opacity-50"
          >
            {loading ? "Wird gespeichert..." : "Environment speichern"}
          </button>
          {error && <p className="text-red-500 text-sm text-center mt-3">{error}</p>}
          {success && <p className="text-green-600 text-sm text-center mt-3">Erfolgreich gespeichert!</p>}
        </form>

        <div className="space-y-4">
          {environments.map((item) => (
            <div key={item.id} className="bg-white dark:bg-zinc-800 p-4 rounded shadow">
              <div className="font-semibold">{item.title}</div>
              {item.description && <div className="text-sm text-zinc-500">{item.description}</div>}
              <pre className="mt-3 bg-zinc-100 dark:bg-zinc-900 p-3 rounded text-xs overflow-x-auto">
                {JSON.stringify(item.environment_json, null, 2)}
              </pre>
            </div>
          ))}
          {environments.length === 0 && (
            <div className="text-zinc-400 text-sm">Noch keine Environments gespeichert.</div>
          )}
        </div>
      </div>
    </div>
  );
}
