
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "../../lib/supabaseServer";

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

export default async function LibraryListPage() {
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

  const styles: LibraryItem[] = stylesRes.data || [];
  const environments: LibraryItem[] = envRes.data || [];

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-8">Library Übersicht</h1>
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
