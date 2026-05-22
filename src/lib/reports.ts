import { supabase } from "@/integrations/supabase/client";
import type { ReportRow } from "@/components/ReportCard";
import type { ReportStatus } from "@/components/StatusBadge";

export type TabKey = "latest" | "open" | "in_progress" | "fixed";
export type SortKey = "created_at" | "updated_at" | "title" | "votes" | "comments";

export type ReportsQuery = {
  tab?: TabKey;
  q?: string;
  building?: string;
  category?: string;
  sort?: SortKey;
  dir?: "asc" | "desc";
  onlyMine?: boolean;
};

export async function fetchReports(opts: ReportsQuery): Promise<ReportRow[]> {
  let query = supabase
    .from("reports")
    .select(`
      id, title, description, status, created_at, updated_at,
      buildings ( name ),
      categories ( name ),
      votes ( value ),
      comments ( id )
    `);

  if (opts.tab === "open") query = query.eq("status", "open");
  else if (opts.tab === "in_progress") query = query.eq("status", "in_progress");
  else if (opts.tab === "fixed") query = query.in("status", ["fixed", "not_a_problem", "duplicate"]);

  if (opts.q) query = query.or(`title.ilike.%${opts.q}%,description.ilike.%${opts.q}%`);
  if (opts.building) query = query.eq("building_id", opts.building);
  if (opts.category) query = query.eq("category_id", opts.category);
  if (opts.onlyMine) {
    const { data: u } = await supabase.auth.getUser();
    if (u.user) query = query.eq("user_id", u.user.id); else return [];
  }

  const sortCol = opts.sort && opts.sort !== "votes" && opts.sort !== "comments" ? opts.sort : "created_at";
  query = query.order(sortCol, { ascending: opts.dir === "asc" }).limit(60);

  const { data, error } = await query;
  if (error) throw error;
  const rows = (data ?? []).map((r: any) => ({
    id: r.id,
    title: r.title,
    description: r.description,
    status: r.status as ReportStatus,
    created_at: r.created_at,
    buildings: r.buildings,
    categories: r.categories,
    vote_count: (r.votes ?? []).reduce((s: number, v: { value: number }) => s + v.value, 0),
    comment_count: (r.comments ?? []).length,
  })) as ReportRow[];

  if (opts.sort === "votes") rows.sort((a, b) => (opts.dir === "asc" ? a.vote_count - b.vote_count : b.vote_count - a.vote_count));
  if (opts.sort === "comments") rows.sort((a, b) => (opts.dir === "asc" ? a.comment_count - b.comment_count : b.comment_count - a.comment_count));
  return rows;
}

export async function fetchBuildings() {
  const { data, error } = await supabase.from("buildings").select("id, name").order("name");
  if (error) throw error;
  return data;
}
export async function fetchCategories() {
  const { data, error } = await supabase.from("categories").select("id, name, slug").order("name");
  if (error) throw error;
  return data;
}
