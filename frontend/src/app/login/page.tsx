"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseBrowser";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);


  useEffect(() => {
    let unsub: (() => void) | undefined;
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.email) {
        setUserEmail(data.user.email);
        // Sofort redirect, wenn schon eingeloggt
        router.replace("/library");
      }
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user?.email ?? null);
      if (session?.user?.email) {
        router.replace("/library");
      }
    });
    unsub = () => sub.subscription.unsubscribe();
    return () => { unsub && unsub(); };
  }, [router]);

  const signInWithGoogle = async () => {
    const redirectTo = `${window.location.origin}/auth/callback`;
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });
    if (error) alert(error.message);
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);


    let authError = null;
    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      authError = error;
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      authError = error;
    }
    setLoading(false);
    if (authError) {
      setError(authError.message);
      return;
    }
    router.push("/library");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-md p-6">
      {userEmail && (
        <div className="mb-4 rounded-md border border-green-300 bg-green-50 p-3 text-sm text-green-800 dark:border-green-900 dark:bg-green-950/40 dark:text-green-200">
          Eingeloggt als <b>{userEmail}</b>
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              className="rounded-md bg-green-600 px-3 py-2 text-xs font-medium text-white hover:bg-green-700"
              onClick={() => {
                router.push("/library");
                router.refresh();
              }}
            >
              Weiter zu Library
            </button>
            <button
              type="button"
              className="rounded-md px-3 py-2 text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800"
              onClick={async () => {
                 await supabase.auth.signOut();
                 setUserEmail(null);
                 router.push("/login");
                 router.refresh();
              }}
            >
              Logout
            </button>
          </div>
        </div>
      )}

      <h1 className="mb-2 text-2xl font-semibold">Login</h1>
      <p className="mb-6 text-sm text-zinc-500">
        {mode === "login" ? "Melde dich an." : "Account erstellen."}
      </p>

      <button
        onClick={signInWithGoogle}
        className="mb-6 w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
      >
        Mit Google anmelden
      </button>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm">Email</label>
          <input
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm">Password</label>
          <input
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            required
          />
        </div>

        {error && (
          <div className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {loading ? "…" : mode === "login" ? "Login" : "Sign up"}
        </button>

        <button
          type="button"
          onClick={() => setMode(mode === "login" ? "signup" : "login")}
          className="w-full rounded-md px-4 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800"
        >
          {mode === "login" ? "Neu hier? Sign up" : "Schon Account? Login"}
        </button>
      </form>
    </div>
  );
}