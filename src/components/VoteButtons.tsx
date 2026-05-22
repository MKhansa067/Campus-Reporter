import { ArrowBigUp, ArrowBigDown } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function VoteButtons({ reportId }: { reportId: string }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [score, setScore] = useState(0);
  const [myVote, setMyVote] = useState<-1 | 0 | 1>(0);

  const load = async () => {
    const { data } = await supabase.from("votes").select("user_id, value").eq("report_id", reportId);
    const total = (data ?? []).reduce((s, v) => s + v.value, 0);
    setScore(total);
    const mine = data?.find((v) => v.user_id === user?.id);
    setMyVote((mine?.value as -1 | 1) ?? 0);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [reportId, user?.id]);

  const vote = async (val: -1 | 1) => {
    if (!user) { navigate({ to: "/login" }); return; }
    const next = myVote === val ? 0 : val;
    setMyVote(next);
    setScore((s) => s - myVote + next);
    if (next === 0) {
      await supabase.from("votes").delete().eq("report_id", reportId).eq("user_id", user.id);
    } else {
      const { error } = await supabase.from("votes").upsert({ report_id: reportId, user_id: user.id, value: next }, { onConflict: "report_id,user_id" });
      if (error) toast.error(error.message);
    }
  };

  return (
    <div className="inline-flex items-center gap-1 rounded-full glass px-1 py-1">
      <button onClick={() => vote(1)} className={cn("p-2 rounded-full hover:bg-primary/15 transition", myVote === 1 && "bg-primary/20 text-primary")}>
        <ArrowBigUp className="h-5 w-5" />
      </button>
      <span className="px-2 text-sm font-semibold tabular-nums min-w-[2ch] text-center">{score}</span>
      <button onClick={() => vote(-1)} className={cn("p-2 rounded-full hover:bg-destructive/15 transition", myVote === -1 && "bg-destructive/20 text-destructive")}>
        <ArrowBigDown className="h-5 w-5" />
      </button>
    </div>
  );
}
