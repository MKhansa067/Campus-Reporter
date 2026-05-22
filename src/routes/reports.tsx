import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { useMemo, useState } from "react";
import { fetchReports, type TabKey, type SortKey } from "@/lib/reports";
import { ReportCard } from "@/components/ReportCard";
import { FilterBar, type FilterState } from "@/components/FilterBar";
import { cn } from "@/lib/utils";

const schema = z.object({
  tab: fallback(z.enum(["latest", "open", "in_progress", "fixed"]), "latest").default("latest"),
});

export const Route = createFileRoute("/reports")({
  validateSearch: zodValidator(schema),
  component: ReportsPage,
  head: () => ({ meta: [{ title: "Reports · SIAP LAPOR" }] }),
});

const TABS: { key: TabKey; label: string }[] = [
  { key: "latest", label: "Latest" },
  { key: "open", label: "Open" },
  { key: "in_progress", label: "In Progress" },
  { key: "fixed", label: "Fixed / Closed" },
];

function ReportsPage() {
  const { tab } = Route.useSearch();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<FilterState>({
    q: "", building: undefined, category: undefined, sort: "created_at" as SortKey, dir: "desc",
  });

  const queryKey = useMemo(() => ["reports", { tab, ...filter }], [tab, filter]);
  const { data, isLoading } = useQuery({
    queryKey,
    queryFn: () => fetchReports({ tab, q: filter.q, building: filter.building, category: filter.category, sort: filter.sort, dir: filter.dir }),
  });

  return (
    <div className="mx-auto max-w-5xl px-4 md:px-6">
      <header className="mb-6">
        <h1 className="font-display text-3xl font-bold">Reports</h1>
        <p className="text-sm text-muted-foreground">Browse, search, and prioritize campus issues.</p>
      </header>

      <div className="rounded-2xl glass p-1.5 mb-4 flex overflow-x-auto">
        {TABS.map((t) => (
          <Link
            key={t.key}
            to="/reports"
            search={{ tab: t.key }}
            className={cn(
              "px-4 py-2 text-sm rounded-xl whitespace-nowrap transition",
              tab === t.key ? "bg-primary text-primary-foreground shadow" : "hover:bg-white/5 text-muted-foreground"
            )}
          >
            {t.label}
          </Link>
        ))}
      </div>

      <div className="mb-5">
        <FilterBar value={filter} onChange={setFilter} />
      </div>

      <div className="grid gap-3">
        {isLoading && Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="rounded-2xl glass p-5 h-28 animate-pulse" />
        ))}
        {data?.map((r) => <ReportCard key={r.id} r={r} />)}
        {data?.length === 0 && !isLoading && (
          <div className="rounded-2xl glass p-12 text-center text-muted-foreground">
            No reports match these filters.
          </div>
        )}
      </div>
    </div>
  );
}
