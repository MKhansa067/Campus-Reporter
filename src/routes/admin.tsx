import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { StatusBadge, type ReportStatus } from "@/components/StatusBadge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Trash2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
  head: () => ({ meta: [{ title: "Admin · SIAP LAPOR" }] }),
});

type Row = { id: string; title: string; status: ReportStatus; created_at: string; buildings: { name: string } | null };

function AdminPage() {
  const { user, isAdmin, loading } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);
  const [stats, setStats] = useState({ total: 0, open: 0, progress: 0, fixed: 0, dup: 0 });

  const load = async () => {
    const { data } = await supabase.from("reports")
      .select("id, title, status, created_at, buildings ( name )")
      .order("created_at", { ascending: false }).limit(100);
    setRows((data ?? []) as any);
    const s = { total: 0, open: 0, progress: 0, fixed: 0, dup: 0 };
    (data ?? []).forEach((r: any) => {
      s.total++;
      if (r.status === "open") s.open++;
      if (r.status === "in_progress") s.progress++;
      if (r.status === "fixed") s.fixed++;
      if (r.status === "duplicate") s.dup++;
    });
    setStats(s);
  };

  useEffect(() => { if (isAdmin) load(); }, [isAdmin]);

  if (loading) return null;
  if (!user) return <Gate text="Sign in required" link="/login" cta="Sign in" />;
  if (!isAdmin) return (
    <div className="mx-auto max-w-md text-center px-4 py-20">
      <ShieldCheck className="h-10 w-10 mx-auto text-muted-foreground" />
      <h1 className="mt-3 font-display text-2xl font-semibold">Admin access required</h1>
      <p className="text-sm text-muted-foreground mt-2">Your account doesn't have the admin role.</p>
    </div>
  );

  const setStatus = async (id: string, s: ReportStatus) => {
    const { error } = await supabase.from("reports").update({ status: s }).eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Updated"); load(); }
  };

  const del = async (id: string) => {
    if (!confirm("Delete this report?")) return;
    const { error } = await supabase.from("reports").delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Deleted"); load(); }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 md:px-6">
      <h1 className="font-display text-3xl font-bold mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        <Stat label="Total" value={stats.total} />
        <Stat label="Open" value={stats.open} />
        <Stat label="In Progress" value={stats.progress} />
        <Stat label="Fixed" value={stats.fixed} />
        <Stat label="Duplicate" value={stats.dup} />
      </div>

      <div className="rounded-2xl glass overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-white/[0.03] text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="text-left p-3">Report</th>
              <th className="text-left p-3 hidden md:table-cell">Building</th>
              <th className="text-left p-3 hidden md:table-cell">Date</th>
              <th className="text-left p-3">Status</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-border hover:bg-white/[0.02]">
                <td className="p-3">
                  <Link to="/reports/$id" params={{ id: r.id }} className="font-medium hover:text-primary">{r.title}</Link>
                </td>
                <td className="p-3 hidden md:table-cell text-muted-foreground">{r.buildings?.name ?? "—"}</td>
                <td className="p-3 hidden md:table-cell text-muted-foreground">{format(new Date(r.created_at), "MMM d")}</td>
                <td className="p-3">
                  <Select value={r.status} onValueChange={(v) => setStatus(r.id, v as ReportStatus)}>
                    <SelectTrigger className="h-8 w-[140px] bg-white/5 border-border text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="fixed">Fixed</SelectItem>
                      <SelectItem value="not_a_problem">Not a Problem</SelectItem>
                      <SelectItem value="duplicate">Duplicate</SelectItem>
                    </SelectContent>
                  </Select>
                </td>
                <td className="p-3 text-right">
                  <Button size="icon" variant="ghost" onClick={() => del(r.id)} className="hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={5} className="p-12 text-center text-muted-foreground">No reports yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl glass p-4">
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="font-display text-3xl font-bold mt-1">{value}</div>
    </div>
  );
}

function Gate({ text, link, cta }: { text: string; link: string; cta: string }) {
  return (
    <div className="mx-auto max-w-md text-center px-4 py-20">
      <h1 className="font-display text-2xl font-semibold">{text}</h1>
      <Button asChild className="mt-4"><Link to={link}>{cta}</Link></Button>
    </div>
  );
}
