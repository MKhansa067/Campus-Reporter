import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { StatusBadge, type ReportStatus } from "@/components/StatusBadge";
import { VoteButtons } from "@/components/VoteButtons";
import { CommentSection } from "@/components/CommentSection";
import { MapPin, Calendar, User as UserIcon, Building2 } from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export const Route = createFileRoute("/reports/$id")({
  component: ReportDetail,
});

type Report = {
  id: string; title: string; description: string;
  status: ReportStatus; floor: string | null; room: string | null;
  created_at: string; updated_at: string; user_id: string;
  buildings: { name: string } | null;
  categories: { name: string } | null;
  profiles: { display_name: string | null } | null;
  report_media: { id: string; url: string }[];
};

function ReportDetail() {
  const { id } = Route.useParams();
  const { isAdmin } = useAuth();
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const { data } = await supabase
      .from("reports")
      .select(`
        id, title, description, status, floor, room, created_at, updated_at, user_id,
        buildings ( name ), categories ( name ),
        profiles ( display_name ),
        report_media ( id, url )
      `)
      .eq("id", id)
      .maybeSingle();
    setReport(data as any);
    setLoading(false);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [id]);

  const setStatus = async (s: ReportStatus) => {
    const { error } = await supabase.from("reports").update({ status: s }).eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Status updated"); load(); }
  };

  if (loading) return <div className="mx-auto max-w-4xl px-4 md:px-6"><div className="rounded-2xl glass h-96 animate-pulse" /></div>;
  if (!report) return (
    <div className="mx-auto max-w-4xl px-4 md:px-6 text-center py-20">
      <p className="text-muted-foreground">Report not found.</p>
      <Link to="/reports" search={{ tab: "latest" }} className="text-primary hover:underline">← Back to reports</Link>
    </div>
  );

  return (
    <article className="mx-auto max-w-4xl px-4 md:px-6 space-y-6">
      <Link to="/reports" search={{ tab: "latest" }} className="text-sm text-muted-foreground hover:text-foreground">← Back to reports</Link>

      {/* Gallery */}
      {report.report_media.length > 0 && (
        <div className="rounded-3xl overflow-hidden glass">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-1 bg-black/40">
            {report.report_media.slice(0, 4).map((m) => (
              <img key={m.id} src={m.url} alt="" loading="lazy" className="w-full h-64 md:h-80 object-cover" />
            ))}
          </div>
        </div>
      )}

      <header className="space-y-3">
        <div className="flex items-center gap-3 flex-wrap">
          <StatusBadge status={report.status} />
          {report.categories?.name && <span className="text-xs text-muted-foreground uppercase tracking-wider">{report.categories.name}</span>}
        </div>
        <h1 className="font-display text-3xl md:text-4xl font-bold leading-tight">{report.title}</h1>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <VoteButtons reportId={report.id} />
          {isAdmin && (
            <Select onValueChange={(v) => setStatus(v as ReportStatus)} value={report.status}>
              <SelectTrigger className="w-[180px] bg-white/5 border-border"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="fixed">Fixed</SelectItem>
                <SelectItem value="not_a_problem">Not a Problem</SelectItem>
                <SelectItem value="duplicate">Duplicate</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
      </header>

      {/* Details grid */}
      <div className="grid sm:grid-cols-2 gap-3">
        <DetailItem icon={Building2} label="Building" value={report.buildings?.name ?? "—"} />
        <DetailItem icon={MapPin} label="Location" value={[report.floor && `Floor ${report.floor}`, report.room && `Room ${report.room}`].filter(Boolean).join(" · ") || "—"} />
        <DetailItem icon={Calendar} label="Reported" value={format(new Date(report.created_at), "PPP")} />
        <DetailItem icon={UserIcon} label="Reported by" value={report.profiles?.display_name ?? "Anonymous"} />
      </div>

      {/* Description */}
      <section className="rounded-2xl glass p-6">
        <h2 className="font-display text-lg font-semibold mb-3">Description</h2>
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">{report.description}</p>
      </section>

      <CommentSection reportId={report.id} />
    </article>
  );
}

function DetailItem({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="rounded-xl glass p-4 flex items-start gap-3">
      <Icon className="h-4 w-4 mt-0.5 text-primary" />
      <div className="min-w-0">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className="text-sm font-medium truncate">{value}</div>
      </div>
    </div>
  );
}
