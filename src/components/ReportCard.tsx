import { Link } from "@tanstack/react-router";
import { ArrowBigUp, MessageSquare, MapPin, Clock } from "lucide-react";
import { StatusBadge, type ReportStatus } from "./StatusBadge";
import { formatDistanceToNow } from "date-fns";

export type ReportRow = {
  id: string;
  title: string;
  description: string;
  status: ReportStatus;
  created_at: string;
  buildings: { name: string } | null;
  categories: { name: string } | null;
  vote_count: number;
  comment_count: number;
};

export function ReportCard({ r }: { r: ReportRow }) {
  return (
    <Link
      to="/reports/$id"
      params={{ id: r.id }}
      className="group block rounded-2xl glass p-5 hover:bg-white/[0.06] hover:border-primary/40 transition shadow-lg shadow-black/20"
    >
      <div className="flex items-start gap-4">
        <div className="hidden sm:flex flex-col items-center w-12 shrink-0 rounded-xl bg-white/5 py-2.5 border border-border">
          <ArrowBigUp className="h-5 w-5 text-primary" />
          <span className="text-sm font-semibold">{r.vote_count}</span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-1.5">
            <StatusBadge status={r.status} />
            {r.categories?.name && (
              <span className="text-xs text-muted-foreground">· {r.categories.name}</span>
            )}
          </div>
          <h3 className="font-display font-semibold text-lg leading-tight group-hover:text-primary transition truncate">
            {r.title}
          </h3>
          <p className="mt-1.5 text-sm text-muted-foreground line-clamp-2">{r.description}</p>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            {r.buildings?.name && (
              <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{r.buildings.name}</span>
            )}
            <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{formatDistanceToNow(new Date(r.created_at), { addSuffix: true })}</span>
            <span className="inline-flex items-center gap-1"><MessageSquare className="h-3.5 w-3.5" />{r.comment_count}</span>
            <span className="inline-flex items-center gap-1 sm:hidden"><ArrowBigUp className="h-3.5 w-3.5" />{r.vote_count}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
