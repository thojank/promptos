export type LibraryKind = "styles" | "environments";

export interface LibraryItemRow {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  content: unknown;
  tags: string[];
  is_public: boolean;
  created_at: string;
  updated_at: string;
}
