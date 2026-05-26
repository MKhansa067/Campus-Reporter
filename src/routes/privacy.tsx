import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — SIAP LAPOR" },
      { name: "description", content: "Privacy policy for SIAP LAPOR platform." },
      { property: "og:title", content: "Privacy Policy — SIAP LAPOR" },
      { property: "og:description", content: "Privacy policy for SIAP LAPOR platform." },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <div className="min-h-[60vh] px-4 md:px-6 py-12 max-w-3xl mx-auto">
      <h1 className="text-3xl font-display font-bold tracking-tight mb-6">Privacy Policy</h1>
      <div className="space-y-6 text-muted-foreground leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">1. Information We Collect</h2>
          <p>
            We collect the information you provide when creating reports, including descriptions, photos, and location data. We also collect your email address for account management.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">2. How We Use Your Information</h2>
          <p>
            Your information is used to process facility reports, communicate updates, and improve campus services. We do not sell or share your personal data with third parties.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">3. Data Security</h2>
          <p>
            We implement appropriate technical and organizational measures to protect your data. All data is stored securely and access is limited to authorized personnel.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">4. Contact Us</h2>
          <p>
            If you have any questions about this privacy policy, please contact us through the Contact page.
          </p>
        </section>
      </div>
    </div>
  );
}
