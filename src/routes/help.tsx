import { createFileRoute } from "@tanstack/react-router";
import { HelpCircle, FileText, MessageSquare, Shield } from "lucide-react";

export const Route = createFileRoute("/help")({
  head: () => ({
    meta: [
      { title: "Help Center — SIAP LAPOR" },
      { name: "description", content: "Help center and FAQ for SIAP LAPOR platform." },
      { property: "og:title", content: "Help Center — SIAP LAPOR" },
      { property: "og:description", content: "Help center and FAQ for SIAP LAPOR platform." },
    ],
  }),
  component: HelpPage,
});

function HelpPage() {
  const faqs = [
    {
      icon: FileText,
      q: "How do I submit a report?",
      a: "Click the \"Report a Problem\" button, fill in the details about the facility issue, attach photos if available, and submit. Your report will be visible to the admin team.",
    },
    {
      icon: Shield,
      q: "Do I need an account to report?",
      a: "Yes, you need to sign in to submit reports and vote. This ensures accountability and allows us to update you on your report status.",
    },
    {
      icon: MessageSquare,
      q: "Can I comment on other reports?",
      a: "Yes, you can add comments to any report to provide additional information or updates. Comments are visible to all users.",
    },
    {
      icon: HelpCircle,
      q: "How do I know when my report is fixed?",
      a: "Report status is updated by administrators and visible on the report detail page. You can also check \"My Reports\" to see all your submissions.",
    },
  ];

  return (
    <div className="min-h-[60vh] px-4 md:px-6 py-12 max-w-3xl mx-auto">
      <h1 className="text-3xl font-display font-bold tracking-tight mb-2">Help Center</h1>
      <p className="text-muted-foreground mb-8">Frequently asked questions and guidance for using SIAP LAPOR.</p>

      <div className="space-y-4">
        {faqs.map((faq) => (
          <div key={faq.q} className="glass-strong rounded-2xl p-6">
            <div className="flex items-start gap-3">
              <faq.icon className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <div>
                <h3 className="font-semibold mb-1">{faq.q}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
