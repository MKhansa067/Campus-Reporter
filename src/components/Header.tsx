import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Menu, X, LogOut, User as UserIcon, ShieldCheck, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/reports", search: { tab: "latest" as const }, label: "Latest" },
  { to: "/reports", search: { tab: "open" as const }, label: "Open" },
  { to: "/reports", search: { tab: "in_progress" as const }, label: "In Progress" },
  { to: "/reports", search: { tab: "fixed" as const }, label: "Fixed / Closed" },
];

export function Header() {
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 inset-x-0 z-50 glass-strong">
      <div className="mx-auto max-w-7xl px-4 md:px-6 h-16 flex items-center gap-4">
        <Link to="/" className="flex items-center gap-2.5 shrink-0">
          <div className="h-9 w-9 rounded-xl bg-primary/90 grid place-items-center font-display font-bold text-primary-foreground">SL</div>
          <div className="hidden sm:block leading-tight">
            <div className="font-display font-bold tracking-tight">SIAP LAPOR</div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">FST · UIN SGD</div>
          </div>
        </Link>

        <nav className="hidden lg:flex items-center gap-1 ml-4">
          {NAV.map((n) => (
            <Link
              key={n.label}
              to={n.to}
              search={n.search}
              className="px-3 py-1.5 text-sm rounded-md text-muted-foreground hover:text-foreground hover:bg-white/5 transition"
              activeProps={{ className: "text-foreground bg-white/5" }}
            >
              {n.label}
            </Link>
          ))}
          {user && (
            <Link to="/my-reports" className="px-3 py-1.5 text-sm rounded-md text-muted-foreground hover:text-foreground hover:bg-white/5 transition"
              activeProps={{ className: "text-foreground bg-white/5" }}>
              My Reports
            </Link>
          )}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Button asChild size="sm" className="hidden sm:inline-flex gap-2 shadow-lg shadow-primary/20">
            <Link to="/submit"><Plus className="h-4 w-4" /> Report a Problem</Link>
          </Button>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="rounded-full ring-1 ring-border hover:ring-primary transition">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-primary/20 text-primary text-xs">
                      {(user.email ?? "?").slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="truncate">{user.email}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate({ to: "/my-reports" })}>
                  <UserIcon className="h-4 w-4 mr-2" /> My Reports
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem onClick={() => navigate({ to: "/admin" })}>
                    <ShieldCheck className="h-4 w-4 mr-2" /> Admin
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut}>
                  <LogOut className="h-4 w-4 mr-2" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild variant="ghost" size="sm">
              <Link to="/login"><LogIn className="h-4 w-4 mr-2" /> Sign in</Link>
            </Button>
          )}

          <button onClick={() => setOpen(!open)} className="lg:hidden p-2 rounded-md hover:bg-white/5">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <div className={cn("lg:hidden overflow-hidden transition-all", open ? "max-h-96" : "max-h-0")}>
        <nav className="px-4 pb-4 flex flex-col gap-1 border-t border-border">
          {NAV.map((n) => (
            <Link key={n.label} to={n.to} search={n.search} onClick={() => setOpen(false)}
              className="px-3 py-2 text-sm rounded-md hover:bg-white/5">{n.label}</Link>
          ))}
          {user && (
            <Link to="/my-reports" onClick={() => setOpen(false)} className="px-3 py-2 text-sm rounded-md hover:bg-white/5">My Reports</Link>
          )}
          <Link to="/submit" onClick={() => setOpen(false)} className="sm:hidden px-3 py-2 mt-1 rounded-md bg-primary text-primary-foreground text-sm font-medium text-center">
            Report a Problem
          </Link>
        </nav>
      </div>
    </header>
  );
}
