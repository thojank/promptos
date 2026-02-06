"use client";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseBrowser";
import { useState } from "react";

export function getInitials(user: any): string {
  if (user?.user_metadata?.full_name) {
    const words = user.user_metadata.full_name.split(" ").filter(Boolean);
    return words.slice(0, 2).map((w) => w[0].toUpperCase()).join("");
  }
  if (user?.email) return user.email[0].toUpperCase();
  return "?";
}

export default function AuthNav({ user }: { user: any }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  if (!user) {
    return (
      <a
        href="/login"
        className="rounded-full px-3 py-1.5 text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800 transition"
      >
        Login
      </a>
    );
  }

  const avatarUrl = user.user_metadata?.avatar_url;
  const initials = getInitials(user);

  return (
    <div className="relative">
      <button
        className="flex items-center justify-center w-9 h-9 rounded-full bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-100 font-bold text-base focus:outline-none"
        onClick={() => setOpen((v) => !v)}
        title={user.email}
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt="Avatar"
            className="w-9 h-9 rounded-full object-cover"
          />
        ) : (
          <span>{initials}</span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded shadow-lg z-50">
          <div className="px-4 py-2 text-xs text-zinc-500 truncate">{user.email}</div>
          <button
            className="w-full text-left px-4 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800"
            onClick={async () => {
                await supabase.auth.signOut();
                setOpen(false);
                window.location.href = "/login";
            }}
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
