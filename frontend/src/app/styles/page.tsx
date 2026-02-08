"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button, Input, Textarea, Badge, Card } from "@/components/ui";

const initialState = {
  title: "",
  description: "",
  jsonText: "",
};

export default function StylesLibraryPage() {
  const [form, setForm] = useState(initialState);
  const [styles, setStyles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchStyles();
  }, []);

  async function fetchStyles() {
    const { data, error } = await supabase
      .from("styles")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) setError(error.message);
    else setStyles(data || []);
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
      .from("styles")
      .insert([
        {
          title: form.title,
          description: form.description || null,
          style_json: parsedJson,
        },
      ]);

    if (error) setError(error.message);
    else {
      setSuccess(true);
      setForm(initialState);
      fetchStyles();
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-base-200 py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="headline-scope text-3xl font-bold mb-6 text-center">Style Library</h1>
        <p className="text-center text-base-content/70 mb-8">
          Speichere wiederverwendbare Style-Presets als JSON-Bausteine.
        </p>

        <form className="card bg-base-100 shadow mb-8" onSubmit={handleSubmit}>
          <div className="card-body">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Titel (z.B. Analog Film Noir)"
                required
              />
              <Input
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Kurzbeschreibung (optional)"
              />
            </div>
            <Textarea
              name="jsonText"
              value={form.jsonText}
              onChange={handleChange}
              placeholder='Style JSON (z.B. { "lighting": "soft daylight", "film_stock": "Kodak Portra 400" })'
              rows={6}
              required
            />
            <Button
              type="submit"
              disabled={loading}
              loading={loading}
              className="w-full"
            >
              {loading ? "Wird gespeichert..." : "Style speichern"}
            </Button>
            {error && <Badge color="error">{error}</Badge>}
            {success && <Badge color="success">Erfolgreich gespeichert!</Badge>}
          </div>
        </form>

        <div className="space-y-4">
          {styles.map((item) => (
            <Card key={item.id} title={item.title}>
              {item.description && <div className="text-sm opacity-70">{item.description}</div>}
              <pre className="mt-3 bg-base-200 p-3 rounded text-xs overflow-x-auto">
                {JSON.stringify(item.style_json, null, 2)}
              </pre>
            </Card>
          ))}
          {styles.length === 0 && (
            <div className="text-sm opacity-60">Noch keine Styles gespeichert.</div>
          )}
        </div>
      </div>
    </div>
  );
}
