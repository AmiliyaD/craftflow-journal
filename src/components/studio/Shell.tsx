import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutGrid,
  Images,
  Sparkles,
  Target,
  NotebookPen,
  Settings,
  type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";

const nav: { to: string; label: string; icon: LucideIcon }[] = [
  { to: "/", label: "Dashboard", icon: LayoutGrid },
  { to: "/artwork", label: "Artwork", icon: Images },
  { to: "/skills", label: "Skills", icon: Sparkles },
  { to: "/challenges", label: "Challenges", icon: Target },
  { to: "/journal", label: "Journal", icon: NotebookPen },
];

function NavItem({ to, label, icon: Icon }: { to: string; label: string; icon: LucideIcon }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const active = to === "/" ? pathname === "/" : pathname.startsWith(to);

  return (
    <Link
      to={to}
      className={`group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors duration-300 ${
        active
          ? "bg-accent-soft text-foreground"
          : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
      }`}
    >
      <span
        className={`absolute left-0 top-1/2 h-5 w-px -translate-y-1/2 rounded-full bg-accent transition-opacity duration-300 ${
          active ? "opacity-100" : "opacity-0"
        }`}
      />
      <Icon size={17} strokeWidth={1.6} className={active ? "text-accent" : ""} />
      <span className="tracking-tight">{label}</span>
    </Link>
  );
}

export function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <aside className="sticky top-0 hidden h-screen w-[248px] shrink-0 flex-col border-r border-border px-5 py-7 md:flex">
        <Link to="/" className="mb-10 block px-2">
          <span className="display-title text-2xl">ART</span>
          <span className="display-title text-2xl text-accent">//</span>
          <span className="display-title text-2xl">PROGRESS</span>
          <p className="eyebrow mt-2">Personal studio</p>
        </Link>

        <nav className="flex flex-col gap-1">
          {nav.map((n) => (
            <NavItem key={n.to} {...n} />
          ))}
        </nav>

        <div className="mt-auto flex flex-col gap-1 border-t border-border pt-4">
          <NavItem to="/settings" label="Settings" icon={Settings} />
          <Link
            to="/profile"
            className="mt-1 flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors duration-300 hover:bg-secondary/50"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-border-strong bg-secondary text-xs tracking-wide">
              EM
            </span>
            <span className="leading-tight">
              <span className="block text-sm">Emily Marsh</span>
              <span className="block text-xs text-muted-foreground">Illustrator</span>
            </span>
          </Link>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <div className="border-b border-border px-5 py-4 md:hidden">
          <span className="display-title text-xl">
            ART<span className="text-accent">//</span>PROGRESS
          </span>
          <nav className="mt-3 flex gap-1 overflow-x-auto pb-1">
            {[...nav, { to: "/settings", label: "Settings", icon: Settings }].map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className="whitespace-nowrap rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground"
              >
                {n.label}
              </Link>
            ))}
          </nav>
        </div>

        <main className="px-5 py-8 md:px-6 md:py-10 lg:px-12">
          <div className="mx-auto max-w-[1180px] animate-in fade-in duration-500">{children}</div>
        </main>
      </div>
    </div>
  );
}
