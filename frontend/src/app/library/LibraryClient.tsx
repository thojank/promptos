"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseBrowser";
import { LibraryKind, LibraryItemRow } from "../../lib/libraryTypes";
import LibraryControls from "../../components/library/LibraryControls";
import LibraryItemFormModal from "../../components/library/LibraryItemFormModal";
import LibraryDeleteConfirm from "../../components/library/LibraryDeleteConfirm";
import { Button, Badge, Card } from "@/components/ui";

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
    <div className="max-w-4xl mx-auto py-10 px-4">
      <h1 className="text-4xl font-bold mb-8">Library Übersicht</h1>
      <LibraryControls availableTags={[]} />
      {/* Styles Section */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Styles</h2>
          <Button onClick={() => openCreate("styles")} variant="primary">
            + Neu
          </Button>
        </div>
        {styles.length === 0 && (
          <div className="text-center py-12 text-sm opacity-60">Keine Styles gefunden.</div>
        )}
        {styles.length > 0 && (
          <ul className="space-y-4">
            {styles.map((item) => (
              <li key={item.id}>
                <Card title={item.title}>
                  {item.description && (
                    <p className="text-sm opacity-75 mb-3">{item.description}</p>
                  )}
                  
                  {item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {item.tags.map((tag) => (
                        <Badge key={tag} color="info" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                  
                  <div className="text-xs opacity-50 mb-5">
                    Zuletzt geändert: {new Date(item.updated_at).toLocaleString()}
                  </div>
                  
                  {item.is_public && (
                    <div className="mb-3">
                      <Badge color="success">Public</Badge>
                    </div>
                  )}
                  
                  <div className="flex gap-2 pt-4 border-t border-base-300">
                    <Button
                      onClick={() => openEdit("styles", item)}
                      variant="secondary"
                      size="sm"
                    >
                      Bearbeiten
                    </Button>
                    <Button
                      onClick={() => openDelete("styles", item)}
                      variant="error"
                      size="sm"
                    >
                      Löschen
                    </Button>
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>
      {/* Environments Section */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Environments</h2>
          <Button onClick={() => openCreate("environments")} variant="primary">
            + Neu
          </Button>
        </div>
        {environments.length === 0 && (
          <div className="text-center py-12 text-sm opacity-60">Keine Environments gefunden.</div>
        )}
        {environments.length > 0 && (
          <ul className="space-y-4">
            {environments.map((item) => (
              <li key={item.id}>
                <Card title={item.title}>
                  {item.description && (
                    <p className="text-sm opacity-75 mb-3">{item.description}</p>
                  )}
                  
                  {item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {item.tags.map((tag) => (
                        <Badge key={tag} color="info" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                  
                  <div className="text-xs opacity-50 mb-5">
                    Zuletzt geändert: {new Date(item.updated_at).toLocaleString()}
                  </div>
                  
                  {item.is_public && (
                    <div className="mb-3">
                      <Badge color="success">Public</Badge>
                    </div>
                  )}
                  
                  <div className="flex gap-2 pt-4 border-t border-base-300">
                    <Button
                      onClick={() => openEdit("environments", item)}
                      variant="secondary"
                      size="sm"
                    >
                      Bearbeiten
                    </Button>
                    <Button
                      onClick={() => openDelete("environments", item)}
                      variant="error"
                      size="sm"
                    >
                      Löschen
                    </Button>
                  </div>
                </Card>
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
