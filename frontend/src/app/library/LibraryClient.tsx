"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseBrowser";
import { LibraryKind, LibraryItemRow } from "../../lib/libraryTypes";
import LibraryControls from "../../components/library/LibraryControls";
import LibraryItemFormModal from "../../components/library/LibraryItemFormModal";
import LibraryDeleteConfirm from "../../components/library/LibraryDeleteConfirm";

interface Props {
  initialStyles: LibraryItemRow[];
  initialEnvironments: LibraryItemRow[];
}

export default function LibraryClient({ initialStyles, initialEnvironments }: Props) {
  const router = useRouter();

  const [styles, setStyles] = useState(initialStyles);
  const [environments, setEnvironments] = useState(initialEnvironments);
  const [activeSection, setActiveSection] = useState<LibraryKind | null>(null);
  const [activeItem, setActiveItem] = useState<LibraryItemRow | null>(null);
  const [modal, setModal] = useState<"create" | "edit" | "delete" | null>(null);

  // Modal open handlers
  const openCreate = (section: LibraryKind) => {
    setActiveSection(section);
    setActiveItem(null);
    setModal("create");
  };
  const openEdit = (section: LibraryKind, item: LibraryItemRow) => {
    setActiveSection(section);
    setActiveItem(item);
    setModal("edit");
  };
  const openDelete = (section: LibraryKind, item: LibraryItemRow) => {
    setActiveSection(section);
    setActiveItem(item);
    setModal("delete");
  };
  const closeModal = () => {
    setModal(null);
    setActiveSection(null);
    setActiveItem(null);
  };

  // Mutations - State Updates
  const handleSave = (savedItem: LibraryItemRow) => {
    if (!activeSection) return;
    const isEdit = !!activeItem;
    
    if (activeSection === "styles") {
      if (isEdit) {
        setStyles(prev => prev.map(item => item.id === savedItem.id ? savedItem : item));
      } else {
        setStyles(prev => [savedItem, ...prev]);
      }
    } else {
      if (isEdit) {
        setEnvironments(prev => prev.map(item => item.id === savedItem.id ? savedItem : item));
      } else {
        setEnvironments(prev => [savedItem, ...prev]);
      }
    }
  };

  const handleDelete = async () => {
    if (!activeSection || !activeItem) return;
    const res = await supabase.from(`promptos_${activeSection}`).delete().eq("id", activeItem.id);
    if (res.error) return res.error.message;
    
    // Update state sofort (nicht auf router.refresh() warten)
    if (activeSection === "styles") {
      setStyles(styles.filter(item => item.id !== activeItem.id));
    } else {
      setEnvironments(environments.filter(item => item.id !== activeItem.id));
    }
    
    closeModal();
    return null;
  };

  // UI
  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-8">Library Übersicht</h1>
      <LibraryControls availableTags={[]} />
      {/* Styles Section */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-semibold">Styles</h2>
          <button className="px-3 py-1.5 rounded bg-blue-600 text-white font-semibold" onClick={() => openCreate("styles")}>+ Neu</button>
        </div>
        {styles.length === 0 && (
          <div className="text-gray-400">Keine Styles gefunden.</div>
        )}
        {styles.length > 0 && (
          <ul className="space-y-3">
            {styles.map((item) => (
              <li key={item.id} className="border rounded p-4 bg-white dark:bg-zinc-800 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-lg">{item.title}</span>
                  {item.is_public && (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded ml-2">Public</span>
                  )}
                  <div className="flex gap-2">
                    <button className="px-2 py-1 rounded bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200" onClick={() => openEdit("styles", item)}>Bearbeiten</button>
                    <button className="px-2 py-1 rounded bg-red-600 text-white" onClick={() => openDelete("styles", item)}>Löschen</button>
                  </div>
                </div>
                {item.description && (<div className="text-gray-500 text-sm mt-1">{item.description}</div>)}
                {item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {item.tags.map((tag) => (
                      <span key={tag} className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-0.5 rounded">{tag}</span>
                    ))}
                  </div>
                )}
                <div className="text-xs text-gray-400 mt-2">Zuletzt geändert: {new Date(item.updated_at).toLocaleString()}</div>
              </li>
            ))}
          </ul>
        )}
      </section>
      {/* Environments Section */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-semibold">Environments</h2>
          <button className="px-3 py-1.5 rounded bg-blue-600 text-white font-semibold" onClick={() => openCreate("environments")}>+ Neu</button>
        </div>
        {environments.length === 0 && (
          <div className="text-gray-400">Keine Environments gefunden.</div>
        )}
        {environments.length > 0 && (
          <ul className="space-y-3">
            {environments.map((item) => (
              <li key={item.id} className="border rounded p-4 bg-white dark:bg-zinc-800 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-lg">{item.title}</span>
                  {item.is_public && (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded ml-2">Public</span>
                  )}
                  <div className="flex gap-2">
                    <button className="px-2 py-1 rounded bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200" onClick={() => openEdit("environments", item)}>Bearbeiten</button>
                    <button className="px-2 py-1 rounded bg-red-600 text-white" onClick={() => openDelete("environments", item)}>Löschen</button>
                  </div>
                </div>
                {item.description && (<div className="text-gray-500 text-sm mt-1">{item.description}</div>)}
                {item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {item.tags.map((tag) => (
                      <span key={tag} className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-0.5 rounded">{tag}</span>
                    ))}
                  </div>
                )}
                <div className="text-xs text-gray-400 mt-2">Zuletzt geändert: {new Date(item.updated_at).toLocaleString()}</div>
              </li>
            ))}
          </ul>
        )}
      </section>
      {/* Modals */}
      {modal === "create" && (
        <LibraryItemFormModal
          open={true}
          onClose={closeModal}
          onSave={handleSave}
          kind={activeSection!}
          item={undefined}
        />
      )}
      {modal === "edit" && activeItem && (
        <LibraryItemFormModal
          open={true}
          onClose={closeModal}
          onSave={handleSave}
          kind={activeSection!}
          item={activeItem}
        />
      )}
      {modal === "delete" && activeItem && (
        <LibraryDeleteConfirm
          open={true}
          onClose={closeModal}
          kind={activeSection!}
          item={activeItem}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
