
import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import dynamic from "next/dynamic";

export const metadata: Metadata = {
  title: "Z-Image-Turbo Prompt Platform",
  description: "Modular prompt engineering for Z-Image-Turbo photorealistic AI",
};


export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  const AuthNav = dynamic(() => import("@/components/AuthNav"), { ssr: false });

  return (
    <html lang="en" data-theme="valentine">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Geist:wght@100..900&family=Scope+One&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased">
        <header className="sticky top-0 z-50 border-b border-base-300 bg-base-100/80 backdrop-blur">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3">
            <Link href="/" className="headline-scope btn btn-ghost text-lg font-semibold">
              Z-Image-Turbo Prompt Platform
            </Link>
            <nav className="flex items-center gap-2 text-sm">
              <Link href="/prompt" className="btn btn-ghost btn-sm">
                Prompt
              </Link>
              <Link href="/character" className="btn btn-ghost btn-sm">
                Charaktere
              </Link>
              <Link href="/styles" className="btn btn-ghost btn-sm">
                Styles
              </Link>
              <Link href="/environments" className="btn btn-ghost btn-sm">
                Environments
              </Link>
              {user ? (
                <Link href="/library" className="btn btn-ghost btn-sm">
                  Library
                </Link>
              ) : null}
              <AuthNav user={user} />
            </nav>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
