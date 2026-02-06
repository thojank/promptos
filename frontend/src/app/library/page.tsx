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

  // Client Wrapper
  const LibraryClient = (await import("./LibraryClient")).default;
  return <LibraryClient initialStyles={styles} initialEnvironments={environments} />;
}
