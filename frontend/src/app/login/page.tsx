"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseBrowser";
import { Button, Input, Badge } from "@/components/ui";

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
        <div className="mb-4">
          <Badge color="success">Eingeloggt als <b>{userEmail}</b></Badge>
          <div className="mt-2 flex gap-2">
            <Button size="sm" variant="primary" onClick={() => { router.push("/library"); router.refresh(); }}>Weiter zu Library</Button>
            <Button size="sm" variant="secondary" onClick={async () => { await supabase.auth.signOut(); setUserEmail(null); router.push("/login"); router.refresh(); }}>Logout</Button>
          </div>
        </div>
      )}

      <h1 className="mb-2 text-2xl font-semibold">Login</h1>
      <p className="mb-6 text-sm text-base-content/70">
        {mode === "login" ? "Melde dich an." : "Account erstellen."}
      </p>

      <Button variant="primary" size="md" className="mb-6 w-full" onClick={signInWithGoogle}>Mit Google anmelden</Button>

      <form onSubmit={onSubmit} className="space-y-4">
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          autoComplete="email"
          required
        />
        <Input
          label="Password"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          required
        />
        {error && <Badge color="error">{error}</Badge>}
        <Button type="submit" variant="primary" size="md" loading={loading} className="w-full">
          {mode === "login" ? "Login" : "Sign up"}
        </Button>
        <Button type="button" variant="ghost" size="md" className="w-full" onClick={() => setMode(mode === "login" ? "signup" : "login")}> 
          {mode === "login" ? "Neu hier? Sign up" : "Schon Account? Login"}
        </Button>
      </form>
    </div>
  );
}