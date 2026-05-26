import { createFileRoute } from "@tanstack/react-router";
import { Mail, MapPin, Phone } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Us — SIAP LAPOR" },
      { name: "description", content: "Contact information for SIAP LAPOR support." },
      { property: "og:title", content: "Contact Us — SIAP LAPOR" },
      { property: "og:description", content: "Contact information for SIAP LAPOR support." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <div className="min-h-[60vh] px-4 md:px-6 py-12 max-w-3xl mx-auto">
      <h1 className="text-3xl font-display font-bold tracking-tight mb-2">Contact Us</h1>
      <p className="text-muted-foreground mb-8">Have questions or need assistance? Get in touch with our team.</p>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="glass-strong rounded-2xl p-6">
          <Mail className="h-6 w-6 text-primary mb-3" />
          <h3 className="font-semibold mb-1">Email</h3>
          <p className="text-sm text-muted-foreground">support@siaplapor.fst.uinsgd.ac.id</p>
        </div>
        <div className="glass-strong rounded-2xl p-6">
          <Phone className="h-6 w-6 text-primary mb-3" />
          <h3 className="font-semibold mb-1">Phone</h3>
          <p className="text-sm text-muted-foreground">+62 22 7800525</p>
        </div>
        <div className="glass-strong rounded-2xl p-6 sm:col-span-2">
          <MapPin className="h-6 w-6 text-primary mb-3" />
          <h3 className="font-semibold mb-1">Address</h3>
          <p className="text-sm text-muted-foreground">
            Faculty of Science and Technology<br />
            UIN Sunan Gunung Djati Bandung<br />
            Jalan A.H. Nasution No. 105, Cibiru, Bandung 40614
          </p>
        </div>
      </div>
    </div>
  );
}
