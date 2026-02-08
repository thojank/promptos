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
    <div className="min-h-screen bg-base-200 py-10 px-4">
      <div className="max-w-xl mx-auto card bg-base-100 shadow">
        <div className="card-body">
          <h1 className="text-xl font-semibold">Login wird abgeschlossen...</h1>
          <p className="text-base-content/70">Du wirst gleich weitergeleitet.</p>
        </div>
      </div>
    </div>
  );
}