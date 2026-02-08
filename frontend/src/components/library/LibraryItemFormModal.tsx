"use client";

import { useState, useEffect } from "react";
import { isValidJSON, parseJSON } from "../../lib/libraryContent";
import { LibraryKind, LibraryItemRow } from "../../lib/libraryTypes";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseBrowser";
import TagInput from "./TagInput";
import { Modal, Button, Input, Badge, Textarea } from "../ui";

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

  return (
    <Modal open={open} title={isEdit ? "Bearbeiten" : "Neu anlegen"} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Titel *"
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
        />
        <Textarea
          label="Beschreibung"
          value={description}
          onChange={e => setDescription(e.target.value)}
          rows={2}
        />
        <div>
          <label className="label">
            <span className="label-text">Tags</span>
          </label>
          <TagInput
            value={tags}
            onChange={setTags}
            suggestions={tagSuggestions}
            placeholder="Tag hinzufügen"
          />
        </div>
        <Textarea
          label="Content (JSON) *"
          value={content}
          onChange={e => setContent(e.target.value)}
          className={`font-mono ${!isValidJSON(content) ? "textarea-error" : "textarea-success"}`}
          rows={6}
          required
          error={!isValidJSON(content) ? "Ungültiges JSON" : undefined}
        />
        {error && <Badge color="error">{error}</Badge>}
        <div className="flex justify-end gap-2 mt-4">
          <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>Abbrechen</Button>
          <Button type="submit" variant="primary" loading={loading} disabled={!title.trim()}>{isEdit ? "Speichern" : "Anlegen"}</Button>
        </div>
      </form>
    </Modal>
  );
}
