import { useEffect, useState, type ReactNode } from "react";
import { X } from "lucide-react";

const EXIT_MS = 180;

export function ModalShell({
  open,
  onClose,
  eyebrow,
  title,
  children,
  label,
  size = "md",
}: {
  open: boolean;
  onClose: () => void;
  eyebrow: string;
  title: string;
  label: string;
  size?: "md" | "lg";
  children: ReactNode;
}) {
  // Keep the modal mounted briefly so the closing animation can play.
  const [mounted, setMounted] = useState(open);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (open) {
      setMounted(true);
      setClosing(false);
      return;
    }
    if (!mounted) return;
    setClosing(true);
    const t = window.setTimeout(() => {
      setMounted(false);
      setClosing(false);
    }, EXIT_MS);
    return () => window.clearTimeout(t);
  }, [open, mounted]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 py-10 md:items-center">
      <button
        aria-label="Close"
        onClick={onClose}
        className={`fixed inset-0 bg-background/70 backdrop-blur-sm ${
          closing ? "motion-overlay-exit" : "motion-overlay"
        }`}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={label}
        className={`glass relative w-full ${size === "lg" ? "max-w-3xl" : "max-w-xl"} rounded-3xl p-7 md:p-8 ${
          closing ? "motion-surface-exit" : "motion-surface"
        }`}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="eyebrow">{eyebrow}</p>
            <h2 className="display-title mt-2 text-3xl">{title}</h2>
          </div>
          <button
            onClick={onClose}
            className="press-sm rounded-full border border-border p-2 text-muted-foreground hover:border-border-strong hover:text-foreground"
          >
            <X size={15} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
