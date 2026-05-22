import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { fetchBuildings, fetchCategories } from "@/lib/reports";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, X } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/submit")({
  component: SubmitPage,
  head: () => ({ meta: [{ title: "Report a Problem · SIAP LAPOR" }] }),
});

const Schema = z.object({
  title: z.string().trim().min(5, "Title must be at least 5 characters").max(120),
  description: z.string().trim().min(15, "Description must be at least 15 characters").max(4000),
  building_id: z.string().uuid(),
  category_id: z.string().uuid(),
  floor: z.string().max(20).optional(),
  room: z.string().max(40).optional(),
});

function SubmitPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { data: buildings } = useQuery({ queryKey: ["buildings"], queryFn: fetchBuildings });
  const { data: categories } = useQuery({ queryKey: ["categories"], queryFn: fetchCategories });

  const [form, setForm] = useState({ title: "", description: "", building_id: "", category_id: "", floor: "", room: "" });
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);

  if (!loading && !user) {
    return (
      <div className="mx-auto max-w-md text-center px-4 py-20">
        <h1 className="font-display text-2xl font-semibold">Sign in to submit a report</h1>
        <Button asChild className="mt-4"><Link to="/login">Sign in</Link></Button>
      </div>
    );
  }

  const onFiles = (list: FileList | null) => {
    if (!list) return;
    const valid: File[] = [];
    for (const f of Array.from(list)) {
      if (!f.type.startsWith("image/")) { toast.error(`${f.name}: only images allowed`); continue; }
      if (f.size > 5 * 1024 * 1024) { toast.error(`${f.name}: max 5MB`); continue; }
      valid.push(f);
    }
    setFiles((prev) => [...prev, ...valid].slice(0, 5));
  };

  const submit = async () => {
    const parsed = Schema.safeParse(form);
    if (!parsed.success) { toast.error(parsed.error.issues[0].message); return; }
    if (!user) return;
    setBusy(true);

    const { data: report, error } = await supabase.from("reports").insert({
      user_id: user.id,
      title: parsed.data.title,
      description: parsed.data.description,
      building_id: parsed.data.building_id,
      category_id: parsed.data.category_id,
      floor: parsed.data.floor || null,
      room: parsed.data.room || null,
    }).select("id").single();

    if (error || !report) { setBusy(false); toast.error(error?.message ?? "Failed"); return; }

    for (const file of files) {
      const path = `${user.id}/${report.id}/${Date.now()}-${file.name}`;
      const { error: upErr } = await supabase.storage.from("report-media").upload(path, file);
      if (upErr) { toast.error(upErr.message); continue; }
      const { data: { publicUrl } } = supabase.storage.from("report-media").getPublicUrl(path);
      await supabase.from("report_media").insert({ report_id: report.id, url: publicUrl, media_type: "image" });
    }

    toast.success("Report submitted!");
    navigate({ to: "/reports/$id", params: { id: report.id } });
  };

  return (
    <div className="mx-auto max-w-2xl px-4 md:px-6">
      <h1 className="font-display text-3xl font-bold mb-2">Report a Problem</h1>
      <p className="text-sm text-muted-foreground mb-6">Help the faculty fix what's broken. Be specific — clear reports get resolved faster.</p>

      <div className="rounded-3xl glass p-6 space-y-5">
        <Field label="Title">
          <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="e.g. Projector in 3.05 won't turn on" className="bg-white/5 border-border" />
        </Field>

        <Field label="Description">
          <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="What's wrong, when did you notice it, any context…" rows={5} className="bg-white/5 border-border" />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Building">
            <Select value={form.building_id} onValueChange={(v) => setForm({ ...form, building_id: v })}>
              <SelectTrigger className="bg-white/5 border-border"><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>{buildings?.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="Category">
            <Select value={form.category_id} onValueChange={(v) => setForm({ ...form, category_id: v })}>
              <SelectTrigger className="bg-white/5 border-border"><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>{categories?.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="Floor (optional)">
            <Input value={form.floor} onChange={(e) => setForm({ ...form, floor: e.target.value })} className="bg-white/5 border-border" />
          </Field>
          <Field label="Room (optional)">
            <Input value={form.room} onChange={(e) => setForm({ ...form, room: e.target.value })} className="bg-white/5 border-border" />
          </Field>
        </div>

        <Field label="Photos (max 5 · 5MB each)">
          <label className="block rounded-xl border border-dashed border-border hover:border-primary/60 transition bg-white/[0.02] p-6 text-center cursor-pointer">
            <Upload className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Click or drop images</span>
            <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => onFiles(e.target.files)} />
          </label>
          {files.length > 0 && (
            <div className="mt-3 grid grid-cols-3 sm:grid-cols-5 gap-2">
              {files.map((f, i) => (
                <div key={i} className="relative group aspect-square rounded-lg overflow-hidden bg-black/30">
                  <img src={URL.createObjectURL(f)} alt="" className="w-full h-full object-cover" />
                  <button onClick={() => setFiles(files.filter((_, j) => j !== i))}
                    className="absolute top-1 right-1 bg-black/60 rounded-full p-1 opacity-0 group-hover:opacity-100 transition">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </Field>

        <div className="flex justify-end pt-2">
          <Button onClick={submit} disabled={busy} size="lg" className="shadow-lg shadow-primary/25">
            {busy ? "Submitting…" : "Submit report"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label className="text-xs uppercase tracking-wider text-muted-foreground">{label}</Label>{children}</div>;
}
