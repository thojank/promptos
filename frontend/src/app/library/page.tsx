
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "../../lib/supabaseServer";
import LibraryControls from "../../components/library/LibraryControls";

interface LibraryItem {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  content: any;
  tags: string[];
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

// Helper functions for filtering and sorting
function filterItems(items: LibraryItem[], searchTerm: string, tag: string): LibraryItem[] {
  let filtered = items;

  // Search filter
  if (searchTerm) {
    const lowerSearch = searchTerm.toLowerCase();
    filtered = filtered.filter((item) => {
      const titleMatch = item.title.toLowerCase().includes(lowerSearch);
      const descMatch = item.description?.toLowerCase().includes(lowerSearch);
      return titleMatch || descMatch;
    });
  }

  // Tag filter
  if (tag) {
    filtered = filtered.filter((item) => item.tags.includes(tag));
  }

  return filtered;
}

function sortItems(items: LibraryItem[], sortOption: string): LibraryItem[] {
  const sorted = [...items];

  switch (sortOption) {
    case "updated_asc":
      sorted.sort((a, b) => new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime());
      break;
    case "title_asc":
      sorted.sort((a, b) => a.title.localeCompare(b.title));
      break;
    case "title_desc":
      sorted.sort((a, b) => b.title.localeCompare(a.title));
      break;
    case "updated_desc":
    default:
      sorted.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
      break;
  }

  return sorted;
}

function getUniqueTags(styles: LibraryItem[], environments: LibraryItem[]): string[] {
  const allTags = new Set<string>();
  
  [...styles, ...environments].forEach((item) => {
    item.tags.forEach((tag) => allTags.add(tag));
  });

  return Array.from(allTags).sort();
}

export default async function LibraryListPage({ searchParams }: PageProps) {
  // Server-side Session Check
  const supabase = createSupabaseServerClient();
  const { data } = await supabase.auth.getSession();
  if (!data.session) {
    redirect("/login");
  }

  // Fetch both tables in parallel (server-side)
  const [stylesRes, envRes] = await Promise.all([
    supabase
      .from("promptos_styles")
      .select("*")
      .order("updated_at", { ascending: false }),
    supabase
      .from("promptos_environments")
      .select("*")
      .order("updated_at", { ascending: false }),
  ]);


  if (stylesRes.error) {
    throw new Error("Fehler beim Laden der Styles: " + stylesRes.error.message);
  }
  if (envRes.error) {
    throw new Error("Fehler beim Laden der Environments: " + envRes.error.message);
  }

  const stylesRaw: LibraryItem[] = stylesRes.data || [];
  const environmentsRaw: LibraryItem[] = envRes.data || [];

  // Get search params
  const params = await searchParams;
  const searchTerm = typeof params.q === "string" ? params.q : "";
  const selectedTag = typeof params.tag === "string" ? params.tag : "";
  const sortOption = typeof params.sort === "string" ? params.sort : "updated_desc";

  // Get all unique tags
  const availableTags = getUniqueTags(stylesRaw, environmentsRaw);

  // Apply filters and sorting
  const styles = sortItems(filterItems(stylesRaw, searchTerm, selectedTag), sortOption);
  const environments = sortItems(filterItems(environmentsRaw, searchTerm, selectedTag), sortOption);

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-8">Library Übersicht</h1>
      
      {/* Filter Controls */}
      <LibraryControls availableTags={availableTags} />
      
      {/* Styles Section */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-3">Styles</h2>
        {styles.length === 0 && (
          <div className="text-gray-400">Keine Styles gefunden.</div>
        )}
        {styles.length > 0 && (
          <ul className="space-y-3">
            {styles.map((item) => (
              <li
                key={item.id}
                className="border rounded p-4 bg-white dark:bg-zinc-800 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-lg">{item.title}</span>
                  {item.is_public && (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded ml-2">
                      Public
                    </span>
                  )}
                </div>
                {item.description && (
                  <div className="text-gray-500 text-sm mt-1">{item.description}</div>
                )}
                {item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {item.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-0.5 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                <div className="text-xs text-gray-400 mt-2">
                  Zuletzt geändert: {new Date(item.updated_at).toLocaleString()}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Environments Section */}
      <section>
        <h2 className="text-xl font-semibold mb-3">Environments</h2>
        {environments.length === 0 && (
          <div className="text-gray-400">Keine Environments gefunden.</div>
        )}
        {environments.length > 0 && (
          <ul className="space-y-3">
            {environments.map((item) => (
              <li
                key={item.id}
                className="border rounded p-4 bg-white dark:bg-zinc-800 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-lg">{item.title}</span>
                  {item.is_public && (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded ml-2">
                      Public
                    </span>
                  )}
                </div>
                {item.description && (
                  <div className="text-gray-500 text-sm mt-1">{item.description}</div>
                )}
                {item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {item.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-0.5 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                <div className="text-xs text-gray-400 mt-2">
                  Zuletzt geändert: {new Date(item.updated_at).toLocaleString()}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
