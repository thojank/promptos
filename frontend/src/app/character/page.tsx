"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";
import { Button, Input, Badge, Card } from "@/components/ui";

const initialState = {
  name: "",
  identity_name: "",
  identity_age: "",
  identity_background: "",
  skin_tone: "",
  hair: "",
  facial_structure: "",
  eyes: "",
  additional_features: "",
  clothing: "",
  special_notes: ""
};

export default function CharacterBuilder() {
  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [characters, setCharacters] = useState<any[]>([]);

  useEffect(() => {
    fetchCharacters();
  }, []);

  async function fetchCharacters() {
    const { data, error } = await supabase
      .from("prompt_character_profiles")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) setError(error.message);
    else setCharacters(data || []);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    const { error } = await supabase
      .from("prompt_character_profiles")
      .insert([
        {
          ...form,
          identity_age: Number(form.identity_age)
        }
      ]);
    if (error) setError(error.message);
    else {
      setSuccess(true);
      setForm(initialState);
      fetchCharacters();
    }
    setLoading(false);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  return (
    <div className="min-h-screen bg-base-200 py-10 px-4">
      <div className="w-full max-w-5xl mx-auto">
        <form className="card bg-base-100 shadow w-full max-w-lg mx-auto mb-8" onSubmit={handleSubmit}>
          <div className="card-body">
            <h1 className="headline-scope text-2xl font-bold text-center">Charakter anlegen</h1>
            <Input name="name" value={form.name} onChange={handleChange} placeholder="Charakter-Name" required />
            <Input name="identity_name" value={form.identity_name} onChange={handleChange} placeholder="Identität (z.B. Valentina Ruiz)" required />
            <Input name="identity_age" value={form.identity_age} onChange={handleChange} placeholder="Alter" type="number" min="1" max="120" required />
            <Input name="identity_background" value={form.identity_background} onChange={handleChange} placeholder="Herkunft / Background" required />
            <Input name="skin_tone" value={form.skin_tone} onChange={handleChange} placeholder="Hautfarbe" />
            <Input name="hair" value={form.hair} onChange={handleChange} placeholder="Haare" />
            <Input name="facial_structure" value={form.facial_structure} onChange={handleChange} placeholder="Gesichtsform" />
            <Input name="eyes" value={form.eyes} onChange={handleChange} placeholder="Augen" />
            <Input name="additional_features" value={form.additional_features} onChange={handleChange} placeholder="Weitere Merkmale" />
            <Input name="clothing" value={form.clothing} onChange={handleChange} placeholder="Kleidung" />
            <Input name="special_notes" value={form.special_notes} onChange={handleChange} placeholder="Besondere Hinweise" />
            <Button type="submit" variant="primary" loading={loading} disabled={loading}>
              {loading ? "Wird gespeichert..." : "Charakter speichern"}
            </Button>
            {error && <Badge color="error">{error}</Badge>}
            {success && <Badge color="success">Erfolgreich gespeichert!</Badge>}
          </div>
        </form>

        <div className="w-full max-w-2xl mx-auto">
          <h2 className="headline-scope text-xl font-bold mb-4">Gespeicherte Charaktere</h2>
          <ul className="space-y-4">
            {characters.map((char) => (
              <li key={char.id}>
                <Card title={`${char.identity_name} (${char.identity_age})`}>
                  <div className="text-sm opacity-70">{char.identity_background}</div>
                  <div className="text-xs mt-2">Haut: {char.skin_tone} | Haare: {char.hair} | Gesicht: {char.facial_structure} | Augen: {char.eyes}</div>
                  <div className="text-xs">Kleidung: {char.clothing}</div>
                  {char.special_notes && <div className="text-xs italic">Hinweis: {char.special_notes}</div>}
                </Card>
              </li>
            ))}
            {characters.length === 0 && <li className="text-sm opacity-60">Noch keine Charaktere gespeichert.</li>}
          </ul>
        </div>
      </div>
    </div>
  );
}
