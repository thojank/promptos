"use client";

import { useState, useEffect } from "react";
import { isValidJSON, parseJSON } from "../../lib/libraryContent";
import { LibraryKind, LibraryItemRow } from "../../lib/libraryTypes";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseBrowser";
import TagInput from "./TagInput";

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (item: LibraryItemRow) => void;
  kind: LibraryKind;
  item?: LibraryItemRow | undefined;
}

export default function LibraryItemFormModal({ open, onClose, onSave, kind, item }: Props) {
  const router = useRouter();

  const [title, setTitle] = useState(item?.title || "");
  const [description, setDescription] = useState(item?.description || "");
  const [tags, setTags] = useState(item?.tags || []);
  const [tagSuggestions, setTagSuggestions] = useState<string[]>([]);
  const [content, setContent] = useState(item ? JSON.stringify(item.content, null, 2) : "{}");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isEdit = !!item;

  // Tags laden beim Mount (nur aktuelle Sektion)
  useEffect(() => {
    async function loadTags() {
      const table = kind === "styles" ? "promptos_styles" : "promptos_environments";
      const { data } = await supabase.from(table).select("tags");
      if (data && Array.isArray(data)) {
        const allTags = data.flatMap((row: any) => Array.isArray(row.tags) ? row.tags : [])
          .map(t => t.trim())
          .filter(Boolean);
        const uniqueTags = Array.from(new Set(allTags.map(t => t.toLowerCase())));
        setTagSuggestions(uniqueTags.sort((a, b) => a.localeCompare(b)));
      }
    }
    loadTags();
  }, [kind]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!title.trim()) {
      setError("Titel ist erforderlich.");
      return;
    }
    if (!isValidJSON(content)) {
      setError("Content muss gültiges JSON sein.");
      return;
    }
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError("Nicht eingeloggt.");
        setLoading(false);
        return;
      }
      const payload = {
        title,
        description: description || null,
        tags,
        content: parseJSON(content),
        user_id: user.id,
      };
      let res;
      if (isEdit) {
        res = await supabase
          .from(`promptos_${kind}`)
          .update(payload)
          .eq("id", item!.id)
          .select()
          .single();
      } else {
        res = await supabase
          .from(`promptos_${kind}`)
          .insert([payload])
          .select()
          .single();
      }
      if (res.error) {
        setError(res.error.message);
        setLoading(false);
        return;
      }
      if (res.data) {
        onSave(res.data as LibraryItemRow);
      }
      onClose();
    } catch (err: any) {
      setError("Fehler beim Speichern.");
      setLoading(false);
    }
    setLoading(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-6 w-full max-w-md"
      >
        <h2 className="text-lg font-bold mb-4">{isEdit ? "Bearbeiten" : "Neu anlegen"} ({kind === "styles" ? "Style" : "Environment"})</h2>
        <div className="mb-3">
          <label className="block text-sm mb-1">Titel *</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full px-3 py-2 border rounded bg-white dark:bg-zinc-800"
            required
          />
        </div>
        <div className="mb-3">
          <label className="block text-sm mb-1">Beschreibung</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="w-full px-3 py-2 border rounded bg-white dark:bg-zinc-800"
            rows={2}
          />
        </div>
        <div className="mb-3">
          <label className="block text-sm mb-1">Tags</label>
          <TagInput
            value={tags}
            onChange={setTags}
            suggestions={tagSuggestions}
            placeholder="Tag hinzufügen"
          />
        </div>
        <div className="mb-3">
          <label className="block text-sm mb-1">Content (JSON) *</label>
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            className={`w-full px-3 py-2 border rounded bg-white dark:bg-zinc-800 font-mono ${
              !isValidJSON(content) ? "border-red-500" : "border-green-500"
            }`}
            rows={6}
            required
          />
          {!isValidJSON(content) && (
            <div className="text-red-600 text-xs mt-1">Ungültiges JSON</div>
          )}
        </div>
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
            type="submit"
            className="px-4 py-2 rounded bg-blue-600 text-white font-semibold disabled:opacity-50"
            disabled={loading || !title.trim()}
          >
            {loading ? "Speichern..." : isEdit ? "Speichern" : "Anlegen"}
          </button>
        </div>
      </form>
    </div>
  );
}
