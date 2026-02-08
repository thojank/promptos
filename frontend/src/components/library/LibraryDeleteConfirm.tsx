"use client";

import { useState } from "react";
import { LibraryKind, LibraryItemRow } from "../../lib/libraryTypes";
import { Modal, Button, Badge } from "../ui";


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

  return (
    <Modal open={open} title="Löschen bestätigen" onClose={onClose}>
      <div className="mb-4">Bist du sicher, dass du <span className="font-semibold">{item.title}</span> löschen möchtest? Diese Aktion kann nicht rückgängig gemacht werden.</div>
      {error && <Badge color="error">{error}</Badge>}
      <div className="flex justify-end gap-2 mt-6">
        <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>Abbrechen</Button>
        <Button type="button" variant="error" onClick={onDelete} loading={loading}>Löschen</Button>
      </div>
    </Modal>
  );
}
