"use client";

import { useState } from "react";
import { LibraryKind, LibraryItemRow } from "../../lib/libraryTypes";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseBrowser";


interface Props {
  open: boolean;
  onClose: () => void;
  onDelete: () => void;
  kind: LibraryKind;
  item: LibraryItemRow;
}

export default function LibraryDeleteConfirm({ open, onClose, onDelete, kind, item }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-bold mb-4">Löschen bestätigen</h2>
        <p className="mb-4">Bist du sicher, dass du <span className="font-semibold">{item.title}</span> löschen möchtest?</p>
        {error && <div className="text-red-600 mb-2 text-sm">{error}</div>}
        <div className="flex justify-end gap-2 mt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200"
            disabled={loading}
          >
            Abbrechen
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="px-4 py-2 rounded bg-red-600 text-white font-semibold"
          >
            Löschen
          </button>
        </div>
      </div>
    </div>
  );
}
