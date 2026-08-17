import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { ImageIcon, Plus } from "lucide-react";
import { Shell } from "@/components/studio/Shell";
import { ArtworkCard } from "@/components/studio/ArtworkCard";
import { ArtworkModal } from "@/components/studio/ArtworkModal";
import { ArtworkDetailModal } from "@/components/studio/ArtworkDetailModal";
import { ConfirmDialog } from "@/components/studio/ConfirmDialog";
import { EmptyState } from "@/components/studio/EmptyState";
import { PrimaryButton } from "@/components/studio/form";
import { formatArtworkTime, useArtworks, type Artwork } from "@/lib/artworks";

export const Route = createFileRoute("/artwork")({
  head: () => ({
    meta: [
      { title: "Artwork Gallery — ART//PROGRESS" },
      {
        name: "description",
        content: "Every study, portrait and character design collected in one calm gallery.",
      },
      { property: "og:title", content: "Artwork Gallery — ART//PROGRESS" },
      {
        property: "og:description",
        content: "Browse your studies with durations, dates and skill tags.",
      },
    ],
  }),
  component: ArtworkPage,
});

function ArtworkPage() {
  const { artworks, ready, createArtwork, editArtwork, deleteArtwork } = useArtworks();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Artwork | null>(null);
  const [detail, setDetail] = useState<Artwork | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Artwork | null>(null);

  const totalMs = artworks.reduce((acc, a) => acc + a.durationMs, 0);

  const openNew = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (art: Artwork) => {
    setDetail(null);
    setEditing(art);
    setFormOpen(true);
  };

  return (
    <Shell>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Portfolio</p>
          <h1 className="display-title mt-3 text-4xl md:text-5xl">Artwork</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {artworks.length} {artworks.length === 1 ? "piece" : "pieces"} ·{" "}
            {formatArtworkTime(totalMs)} of recorded practice
          </p>
        </div>
        <PrimaryButton onClick={openNew}>
          <Plus size={15} /> Add artwork
        </PrimaryButton>
      </div>

      {ready && artworks.length === 0 ? (
        <div className="mt-10">
          <EmptyState
            icon={ImageIcon}
            title="No artworks yet"
            description="Upload your first artwork or save the result of a drawing session."
            action={
              <PrimaryButton onClick={openNew}>
                <Plus size={15} /> Add artwork
              </PrimaryButton>
            }
          />
        </div>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {artworks.map((a, i) => (
            <ArtworkCard
              key={a.id}
              index={i}
              art={a}
              onOpen={() => setDetail(a)}
              onEdit={() => openEdit(a)}
              onDelete={() => setPendingDelete(a)}
            />
          ))}
        </div>
      )}

      <ArtworkModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        initial={editing}
        onSubmit={async (input) => {
          if (editing) {
            await editArtwork(editing.id, input);
            toast.success("Artwork updated");
          } else {
            await createArtwork(input);
            toast.success("Artwork saved");
          }
        }}
      />

      <ArtworkDetailModal
        artwork={detail}
        onClose={() => setDetail(null)}
        onEdit={() => detail && openEdit(detail)}
        onDelete={() => {
          setPendingDelete(detail);
          setDetail(null);
        }}
      />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(null)}
        title="Delete artwork"
        description={`“${pendingDelete?.title ?? ""}” and its image will be permanently removed.`}
        onConfirm={() => {
          if (pendingDelete) {
            void deleteArtwork(pendingDelete.id);
            toast("Artwork deleted");
          }
        }}
      />
    </Shell>
  );
}
