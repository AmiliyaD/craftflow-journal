import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/studio/Shell";
import { ThemeToggle } from "@/components/studio/ThemeToggle";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — ART//PROGRESS" },
      { name: "description", content: "Studio preferences, session tracking and reminders." },
      { property: "og:title", content: "Settings — ART//PROGRESS" },
      { property: "og:description", content: "Tune how your practice is tracked and displayed." },
    ],
  }),
  component: SettingsPage,
});

const rows = [
  ["Daily practice goal", "1h 30m"],
  ["Session reminder", "19:00"],
  ["Week starts on", "Monday"],
  ["Measurement", "Hours & minutes"],
];

function SettingsPage() {
  return (
    <Shell>
      <p className="eyebrow">Preferences</p>
      <h1 className="display-title mt-3 text-4xl md:text-5xl">Settings</h1>

      <div className="glass mt-10 max-w-2xl divide-y divide-border rounded-2xl">
        <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-5 transition-colors duration-300 hover:bg-secondary/30">
          <span className="text-sm text-muted-foreground">Appearance</span>
          <ThemeToggle withLabels />
        </div>
        {rows.map(([label, value]) => (
          <div
            key={label}
            className="flex items-center justify-between px-6 py-5 transition-colors duration-300 hover:bg-secondary/30"
          >
            <span className="text-sm text-muted-foreground">{label}</span>
            <span className="text-sm">{value}</span>
          </div>
        ))}
      </div>
    </Shell>
  );
}
