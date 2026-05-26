import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service — SIAP LAPOR" },
      { name: "description", content: "Terms of service for SIAP LAPOR platform." },
      { property: "og:title", content: "Terms of Service — SIAP LAPOR" },
      { property: "og:description", content: "Terms of service for SIAP LAPOR platform." },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <div className="min-h-[60vh] px-4 md:px-6 py-12 max-w-3xl mx-auto">
      <h1 className="text-3xl font-display font-bold tracking-tight mb-6">Terms of Service</h1>
      <div className="space-y-6 text-muted-foreground leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">1. Acceptance of Terms</h2>
          <p>
            By using SIAP LAPOR, you agree to these Terms of Service. If you do not agree, please do not use the platform.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">2. User Responsibilities</h2>
          <p>
            Users must provide accurate information when submitting reports. False or misleading reports are prohibited and may result in account suspension.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">3. Acceptable Use</h2>
          <p>
            The platform is intended for reporting campus facility issues only. Off-topic content, harassment, or inappropriate material will be removed.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">4. Changes to Terms</h2>
          <p>
            We reserve the right to update these terms at any time. Continued use of the platform constitutes acceptance of the revised terms.
          </p>
        </section>
      </div>
    </div>
  );
}
