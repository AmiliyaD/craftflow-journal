import { ModalShell } from "./ModalShell";

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  eyebrow = "Confirm",
  title,
  description,
  confirmLabel = "Delete",
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  eyebrow?: string;
  title: string;
  description: string;
  confirmLabel?: string;
}) {
  return (
    <ModalShell open={open} onClose={onClose} eyebrow={eyebrow} title={title} label={title}>
      <p className="mt-5 text-sm text-muted-foreground">{description}</p>
      <div className="mt-8 flex items-center justify-end gap-3">
        <button
          onClick={onClose}
          className="rounded-full px-4 py-2.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          Cancel
        </button>
        <button
          onClick={() => {
            onConfirm();
            onClose();
          }}
          className="rounded-full border border-destructive/40 bg-destructive/10 px-5 py-2.5 text-sm text-destructive transition-colors hover:bg-destructive/20"
        >
          {confirmLabel}
        </button>
      </div>
    </ModalShell>
  );
}
