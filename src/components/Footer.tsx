export function Footer() {
  return (
    <footer className="mt-16 border-t border-border bg-background/80 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 md:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
        <div>© {new Date().getFullYear()} SIAP LAPOR · Faculty of Science and Technology, UIN Sunan Gunung Djati Bandung</div>
        <nav className="flex gap-5">
          <a href="#" className="hover:text-foreground transition">Privacy</a>
          <a href="#" className="hover:text-foreground transition">Terms</a>
          <a href="#" className="hover:text-foreground transition">Contact</a>
          <a href="#" className="hover:text-foreground transition">Help</a>
        </nav>
      </div>
    </footer>
  );
}
