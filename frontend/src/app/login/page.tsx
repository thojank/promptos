"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
    }
    setLoading(false);
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-900">
      <form className="bg-white dark:bg-zinc-800 p-8 rounded-xl shadow w-full max-w-sm flex flex-col gap-4" onSubmit={handleLogin}>
        <h1 className="headline-scope text-2xl font-bold mb-2 text-center">Login</h1>
        <input
          type="email"
          placeholder="E-Mail"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="border rounded px-3 py-2"
          required
        />
        <input
          type="password"
          placeholder="Passwort"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="border rounded px-3 py-2"
          required
        />
        <button type="submit" className="bg-zinc-900 text-white py-2 rounded hover:bg-zinc-700 transition" disabled={loading}>
          {loading ? "Wird geladen..." : "Login"}
        </button>
        <button type="button" className="bg-zinc-700 text-white py-2 rounded hover:bg-zinc-900 transition" onClick={handleSignup} disabled={loading}>
          {loading ? "Wird geladen..." : "Registrieren"}
        </button>
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        {success && <p className="text-green-600 text-sm text-center">Erfolgreich!</p>}
      </form>
    </div>
  );
}
