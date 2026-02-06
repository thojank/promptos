"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseBrowser";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    supabase.auth
      .getSession()
      .then(() => router.replace("/library"))
      .catch(() => router.replace("/login"));
  }, [router]);

  return (
    <div className="max-w-xl mx-auto py-10 px-4">
      <h1 className="text-xl font-semibold">Login wird abgeschlossen…</h1>
      <p className="text-zinc-500 mt-2">Du wirst gleich weitergeleitet.</p>
    </div>
  );
}