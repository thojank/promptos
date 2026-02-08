"use client";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseBrowser";
import { useState } from "react";

export function getInitials(user: any): string {
  if (user?.user_metadata?.full_name) {
    const words: string[] = user.user_metadata.full_name.split(" ").filter((w: string) => Boolean(w));
    return words.slice(0, 2).map((w: string) => w[0].toUpperCase()).join("");
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
        className="btn btn-ghost btn-sm"
      >
        Login
      </a>
    );
  }

  const avatarUrl = user.user_metadata?.avatar_url;
  const initials = getInitials(user);

  return (
    <div className="dropdown dropdown-end">
      <button
        className="btn btn-circle btn-ghost avatar"
        onClick={() => setOpen((v) => !v)}
        title={user.email}
        type="button"
      >
        {avatarUrl ? (
          <div className="w-9 rounded-full">
            <img
              src={avatarUrl}
              alt="Avatar"
              className="w-9 h-9 rounded-full object-cover"
            />
          </div>
        ) : (
          <span className="font-bold">{initials}</span>
        )}
      </button>
      {open && (
        <ul className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-48">
          <li>
            <span className="text-xs opacity-70 truncate">{user.email}</span>
          </li>
          <li>
            <button
              onClick={async () => {
                await supabase.auth.signOut();
                setOpen(false);
                window.location.href = "/login";
              }}
            >
              Logout
            </button>
          </li>
        </ul>
      )}
    </div>
  );
}
