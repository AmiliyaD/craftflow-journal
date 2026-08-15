import { Check } from "lucide-react";

/** Accessible, animated checkbox used for challenge task rows. */
export function TaskCheckbox({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-[6px] border transition-all duration-300 focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:outline-none ${
        checked
          ? "border-accent/60 bg-accent-soft shadow-[0_0_0_3px_color-mix(in_oklab,var(--accent)_10%,transparent)]"
          : "border-border-strong hover:border-accent/50 hover:bg-secondary/60"
      }`}
    >
      <Check
        size={13}
        strokeWidth={2.4}
        className={`text-accent transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          checked ? "scale-100 opacity-100" : "scale-50 opacity-0"
        }`}
      />
    </button>
  );
}
