import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { fetchReports } from "@/lib/reports";
import { ReportCard } from "@/components/ReportCard";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/my-reports")({
  component: MyReports,
  head: () => ({ meta: [{ title: "My Reports · SIAP LAPOR" }] }),
});

function MyReports() {
  const { user, loading } = useAuth();
  const { data } = useQuery({
    queryKey: ["my-reports", user?.id],
    queryFn: () => fetchReports({ onlyMine: true }),
    enabled: !!user,
  });

  if (!loading && !user) {
    return (
      <div className="mx-auto max-w-md text-center px-4 py-20">
        <h1 className="font-display text-2xl font-semibold">Sign in to see your reports</h1>
        <Button asChild className="mt-4"><Link to="/login">Sign in</Link></Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 md:px-6">
      <h1 className="font-display text-3xl font-bold mb-1">My Reports</h1>
      <p className="text-sm text-muted-foreground mb-6">All reports you've submitted.</p>
      <div className="grid gap-3">
        {data?.map((r) => <ReportCard key={r.id} r={r} />)}
        {data && data.length === 0 && (
          <div className="rounded-2xl glass p-12 text-center text-muted-foreground">
            You haven't submitted any reports yet. <Link to="/submit" className="text-primary hover:underline">Create one →</Link>
          </div>
        )}
      </div>
    </div>
  );
}
