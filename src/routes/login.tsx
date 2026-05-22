import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({ meta: [{ title: "Sign in · SIAP LAPOR" }] }),
});

function LoginPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => { if (user) navigate({ to: "/" }); }, [user, navigate]);

  const signIn = async () => {
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) toast.error(error.message); else toast.success("Welcome back!");
  };

  const signUp = async () => {
    setBusy(true);
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { emailRedirectTo: window.location.origin, data: { display_name: name || email.split("@")[0] } },
    });
    setBusy(false);
    if (error) toast.error(error.message);
    else toast.success("Check your email to confirm your account.");
  };

  const google = async () => {
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (r.error) toast.error(String(r.error));
  };

  return (
    <div className="mx-auto max-w-md px-4 md:px-6">
      <div className="rounded-3xl glass p-8">
        <Link to="/" className="block text-center mb-6">
          <div className="mx-auto h-12 w-12 rounded-2xl bg-primary grid place-items-center font-display font-bold text-primary-foreground text-lg">SL</div>
          <div className="mt-3 font-display text-xl font-bold">SIAP LAPOR</div>
          <div className="text-xs text-muted-foreground uppercase tracking-widest">FST · UIN SGD Bandung</div>
        </Link>

        <Tabs defaultValue="signin">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="signin">Sign in</TabsTrigger>
            <TabsTrigger value="signup">Sign up</TabsTrigger>
          </TabsList>

          <TabsContent value="signin" className="space-y-4 mt-5">
            <Field label="Email"><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-white/5 border-border" /></Field>
            <Field label="Password"><Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="bg-white/5 border-border" /></Field>
            <Button onClick={signIn} disabled={busy} className="w-full">Sign in</Button>
          </TabsContent>

          <TabsContent value="signup" className="space-y-4 mt-5">
            <Field label="Name"><Input value={name} onChange={(e) => setName(e.target.value)} className="bg-white/5 border-border" /></Field>
            <Field label="Email"><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-white/5 border-border" /></Field>
            <Field label="Password"><Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="bg-white/5 border-border" /></Field>
            <Button onClick={signUp} disabled={busy} className="w-full">Create account</Button>
          </TabsContent>
        </Tabs>

        <div className="my-5 flex items-center gap-3 text-xs uppercase tracking-widest text-muted-foreground">
          <div className="h-px bg-border flex-1" /> or <div className="h-px bg-border flex-1" />
        </div>
        <Button onClick={google} variant="outline" className="w-full bg-white/5 border-border">
          Continue with Google
        </Button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label className="text-xs uppercase tracking-wider text-muted-foreground">{label}</Label>{children}</div>;
}
