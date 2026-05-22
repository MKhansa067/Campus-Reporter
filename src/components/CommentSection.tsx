import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatDistanceToNow } from "date-fns";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Link } from "@tanstack/react-router";

type CommentRow = {
  id: string; content: string; created_at: string; user_id: string;
  profiles: { display_name: string | null } | null;
};

export function CommentSection({ reportId }: { reportId: string }) {
  const { user, isAdmin } = useAuth();
  const [comments, setComments] = useState<CommentRow[]>([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const { data } = await supabase
      .from("comments")
      .select("id, content, created_at, user_id, profiles ( display_name )")
      .eq("report_id", reportId)
      .order("created_at", { ascending: true });
    setComments((data ?? []) as any);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [reportId]);

  useEffect(() => {
    const ch = supabase
      .channel(`comments-${reportId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "comments", filter: `report_id=eq.${reportId}` }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
    // eslint-disable-next-line
  }, [reportId]);

  const submit = async () => {
    if (!user || !text.trim()) return;
    setBusy(true);
    const { error } = await supabase.from("comments").insert({ report_id: reportId, user_id: user.id, content: text.trim() });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    setText("");
  };

  const del = async (id: string) => {
    const { error } = await supabase.from("comments").delete().eq("id", id);
    if (error) toast.error(error.message);
  };

  return (
    <section className="space-y-5">
      <h2 className="font-display text-xl font-semibold">Comments · {comments.length}</h2>

      {user ? (
        <div className="rounded-xl glass p-4 space-y-3">
          <Textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Add a constructive comment…" rows={3} className="bg-transparent border-border" />
          <div className="flex justify-end">
            <Button onClick={submit} disabled={busy || !text.trim()}>Post comment</Button>
          </div>
        </div>
      ) : (
        <div className="rounded-xl glass p-4 text-sm text-muted-foreground">
          <Link to="/login" className="text-primary hover:underline">Sign in</Link> to leave a comment.
        </div>
      )}

      <div className="space-y-3">
        {comments.map((c) => {
          const name = c.profiles?.display_name ?? "User";
          const canDelete = user && (user.id === c.user_id || isAdmin);
          return (
            <div key={c.id} className="rounded-xl glass p-4 flex gap-3">
              <Avatar className="h-9 w-9"><AvatarFallback className="bg-primary/20 text-primary text-xs">{name.slice(0,2).toUpperCase()}</AvatarFallback></Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="text-foreground font-medium">{name}</span>
                  <span>·</span>
                  <span>{formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}</span>
                  {canDelete && (
                    <button onClick={() => del(c.id)} className="ml-auto text-muted-foreground hover:text-destructive">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
                <p className="mt-1 text-sm whitespace-pre-wrap">{c.content}</p>
              </div>
            </div>
          );
        })}
        {comments.length === 0 && <div className="text-sm text-muted-foreground text-center py-8">Be the first to comment.</div>}
      </div>
    </section>
  );
}
