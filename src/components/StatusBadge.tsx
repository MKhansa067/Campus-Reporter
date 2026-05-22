import { cn } from "@/lib/utils";

export type ReportStatus = "open" | "in_progress" | "fixed" | "not_a_problem" | "duplicate";

const META: Record<ReportStatus, { label: string; cls: string }> = {
  open:          { label: "Open",         cls: "bg-status-open/15 text-status-open border-status-open/30" },
  in_progress:   { label: "In Progress",  cls: "bg-status-progress/15 text-status-progress border-status-progress/30" },
  fixed:         { label: "Fixed",        cls: "bg-status-fixed/15 text-status-fixed border-status-fixed/30" },
  not_a_problem: { label: "Not a Problem",cls: "bg-status-notproblem/15 text-status-notproblem border-status-notproblem/30" },
  duplicate:     { label: "Duplicate",    cls: "bg-status-duplicate/15 text-status-duplicate border-status-duplicate/30" },
};

export function StatusBadge({ status, className }: { status: ReportStatus; className?: string }) {
  const m = META[status];
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium tracking-wide uppercase",
      m.cls, className,
    )}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {m.label}
    </span>
  );
}
