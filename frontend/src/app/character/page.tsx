"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";

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
    <div className="min-h-screen flex flex-col items-center bg-zinc-50 dark:bg-zinc-900 py-10">
      <form className="bg-white dark:bg-zinc-800 p-8 rounded-xl shadow w-full max-w-lg flex flex-col gap-4 mb-8" onSubmit={handleSubmit}>
        <h1 className="headline-scope text-2xl font-bold mb-2 text-center">Charakter anlegen</h1>
        <input name="name" value={form.name} onChange={handleChange} placeholder="Charakter-Name" className="border rounded px-3 py-2" required />
        <input name="identity_name" value={form.identity_name} onChange={handleChange} placeholder="Identität (z.B. Valentina Ruiz)" className="border rounded px-3 py-2" required />
        <input name="identity_age" value={form.identity_age} onChange={handleChange} placeholder="Alter" type="number" min="1" max="120" className="border rounded px-3 py-2" required />
        <input name="identity_background" value={form.identity_background} onChange={handleChange} placeholder="Herkunft / Background" className="border rounded px-3 py-2" required />
        <input name="skin_tone" value={form.skin_tone} onChange={handleChange} placeholder="Hautfarbe" className="border rounded px-3 py-2" />
        <input name="hair" value={form.hair} onChange={handleChange} placeholder="Haare" className="border rounded px-3 py-2" />
        <input name="facial_structure" value={form.facial_structure} onChange={handleChange} placeholder="Gesichtsform" className="border rounded px-3 py-2" />
        <input name="eyes" value={form.eyes} onChange={handleChange} placeholder="Augen" className="border rounded px-3 py-2" />
        <input name="additional_features" value={form.additional_features} onChange={handleChange} placeholder="Weitere Merkmale" className="border rounded px-3 py-2" />
        <input name="clothing" value={form.clothing} onChange={handleChange} placeholder="Kleidung" className="border rounded px-3 py-2" />
        <input name="special_notes" value={form.special_notes} onChange={handleChange} placeholder="Besondere Hinweise" className="border rounded px-3 py-2" />
        <button type="submit" className="bg-zinc-900 text-white py-2 rounded hover:bg-zinc-700 transition" disabled={loading}>
          {loading ? "Wird gespeichert..." : "Charakter speichern"}
        </button>
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        {success && <p className="text-green-600 text-sm text-center">Erfolgreich gespeichert!</p>}
      </form>
      <div className="w-full max-w-2xl">
        <h2 className="headline-scope text-xl font-bold mb-4">Gespeicherte Charaktere</h2>
        <ul className="space-y-4">
          {characters.map((char) => (
            <li key={char.id} className="bg-white dark:bg-zinc-800 p-4 rounded shadow">
              <div className="font-bold">{char.identity_name} ({char.identity_age})</div>
              <div className="text-sm text-zinc-500">{char.identity_background}</div>
              <div className="text-xs mt-2">Haut: {char.skin_tone} | Haare: {char.hair} | Gesicht: {char.facial_structure} | Augen: {char.eyes}</div>
              <div className="text-xs">Kleidung: {char.clothing}</div>
              {char.special_notes && <div className="text-xs italic">Hinweis: {char.special_notes}</div>}
            </li>
          ))}
          {characters.length === 0 && <li className="text-zinc-400">Noch keine Charaktere gespeichert.</li>}
        </ul>
      </div>
    </div>
  );
}
