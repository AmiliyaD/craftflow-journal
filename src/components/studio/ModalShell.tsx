import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";

export function ModalShell({
  open,
  onClose,
  eyebrow,
  title,
  children,
  label,
}: {
  open: boolean;
  onClose: () => void;
  eyebrow: string;
  title: string;
  label: string;
  children: ReactNode;
}) {
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

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 py-10 md:items-center">
      <button
        aria-label="Close"
        onClick={onClose}
        className="fixed inset-0 bg-background/70 backdrop-blur-sm"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={label}
        className="glass animate-in fade-in zoom-in-95 relative w-full max-w-xl rounded-3xl p-7 duration-300 md:p-8"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="eyebrow">{eyebrow}</p>
            <h2 className="display-title mt-2 text-3xl">{title}</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-full border border-border p-2 text-muted-foreground transition-colors hover:border-border-strong hover:text-foreground"
          >
            <X size={15} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
