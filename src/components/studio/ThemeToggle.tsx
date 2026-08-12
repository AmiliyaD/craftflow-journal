import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme, type Theme } from "@/lib/theme";

const options: { key: Theme; icon: typeof Sun; label: string }[] = [
  { key: "light", icon: Sun, label: "Light" },
  { key: "dark", icon: Moon, label: "Dark" },
  { key: "system", icon: Monitor, label: "System" },
];

export function ThemeToggle({ withLabels = false }: { withLabels?: boolean }) {
  const { theme, setTheme } = useTheme();

  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-border p-1">
      {options.map((o) => {
        const active = theme === o.key;
        const Icon = o.icon;
        return (
          <button
            key={o.key}
            onClick={() => setTheme(o.key)}
            aria-label={`${o.label} theme`}
            aria-pressed={active}
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs tracking-wide transition-colors duration-300 ${
              active
                ? "bg-accent-soft text-accent"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon size={14} strokeWidth={1.7} />
            {withLabels && <span>{o.label}</span>}
          </button>
        );
      })}
    </div>
  );
}
