import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ArrowRight, ShieldCheck, Vote, MessagesSquare, ClipboardList } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchReports } from "@/lib/reports";
import { ReportCard } from "@/components/ReportCard";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "SIAP LAPOR · Report Campus Facility Issues" },
      { name: "description", content: "Submit, vote on, and track facility reports across the Faculty of Science and Technology, UIN SGD Bandung." },
    ],
  }),
});

function Index() {
  const { data: latest } = useQuery({
    queryKey: ["reports", { tab: "latest" }],
    queryFn: () => fetchReports({ tab: "latest" }),
  });

  return (
    <div className="mx-auto max-w-7xl px-4 md:px-6">
      {/* Hero */}
      <section className="pt-10 pb-16 md:pt-20 md:pb-24 text-center">
        <span className="inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-xs uppercase tracking-widest text-gold">
          <span className="h-1.5 w-1.5 rounded-full bg-gold" /> Faculty of Science & Technology · UIN SGD Bandung
        </span>
        <h1 className="mt-6 font-display font-bold text-5xl md:text-7xl tracking-tight">
          See a problem? <span className="text-primary">Report it.</span>
        </h1>
        <p className="mt-5 mx-auto max-w-2xl text-lg text-muted-foreground">
          SIAP LAPOR is the campus-wide platform for raising and tracking facility issues —
          from broken projectors to leaky taps. Voted by students, fixed by the faculty.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button asChild size="lg" className="h-12 px-6 shadow-xl shadow-primary/25">
            <Link to="/submit">Report a problem <ArrowRight className="h-4 w-4 ml-2" /></Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="h-12 px-6 bg-white/5 border-border">
            <Link to="/reports" search={{ tab: "latest" }}>Browse reports</Link>
          </Button>
        </div>

        <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto">
          {[
            { icon: ClipboardList, label: "Submit", text: "Photo + location" },
            { icon: Vote, label: "Vote", text: "Boost priority" },
            { icon: MessagesSquare, label: "Discuss", text: "Comment thread" },
            { icon: ShieldCheck, label: "Track", text: "Live status updates" },
          ].map((f) => (
            <div key={f.label} className="rounded-2xl glass p-4 text-left">
              <f.icon className="h-5 w-5 text-primary" />
              <div className="mt-2 font-medium text-sm">{f.label}</div>
              <div className="text-xs text-muted-foreground">{f.text}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Latest reports */}
      <section className="pb-10">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="font-display text-2xl font-semibold">Latest reports</h2>
            <p className="text-sm text-muted-foreground">Newest issues from across campus.</p>
          </div>
          <Link to="/reports" search={{ tab: "latest" }} className="text-sm text-primary hover:underline">
            View all →
          </Link>
        </div>
        <div className="grid gap-3">
          {(latest ?? []).slice(0, 6).map((r) => <ReportCard key={r.id} r={r} />)}
          {latest && latest.length === 0 && (
            <div className="rounded-2xl glass p-10 text-center text-muted-foreground">
              No reports yet — be the first to <Link to="/submit" className="text-primary hover:underline">submit one</Link>.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
