
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
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Geist:wght@100..900&family=Scope+One&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased">
        <header className="sticky top-0 z-50 border-b border-zinc-200/60 dark:border-zinc-800/60 bg-white/80 dark:bg-zinc-950/80 backdrop-blur">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3">
            <Link href="/" className="headline-scope text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              Z-Image-Turbo Prompt Platform
            </Link>
            <nav className="flex items-center gap-2 text-sm">
              <Link href="/prompt" className="rounded-full px-3 py-1.5 text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800 transition">
                Prompt
              </Link>
              <Link href="/character" className="rounded-full px-3 py-1.5 text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800 transition">
                Charaktere
              </Link>
              <Link href="/styles" className="rounded-full px-3 py-1.5 text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800 transition">
                Styles
              </Link>
              <Link href="/environments" className="rounded-full px-3 py-1.5 text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800 transition">
                Environments
              </Link>
              <AuthNav user={user} />
            </nav>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
