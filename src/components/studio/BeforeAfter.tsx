import { useCallback, useRef, useState } from "react";
import { MoveHorizontal } from "lucide-react";
import before from "@/assets/art-before.jpg";
import after from "@/assets/art-after.jpg";

export function BeforeAfter() {
  const [pos, setPos] = useState(50);
  const ref = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const move = useCallback((clientX: number) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setPos(Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100)));
  }, []);

  return (
    <section>
      <p className="eyebrow">Before / after</p>
      <h2 className="display-title mt-2 text-3xl md:text-4xl">Look how far you&apos;ve come.</h2>
      <p className="mt-2 max-w-xl text-sm text-muted-foreground">
        Progress is easier to see when you put the past next to the present.
      </p>

      <div
        ref={ref}
        onPointerDown={(e) => {
          dragging.current = true;
          e.currentTarget.setPointerCapture(e.pointerId);
          move(e.clientX);
        }}
        onPointerMove={(e) => dragging.current && move(e.clientX)}
        onPointerUp={() => (dragging.current = false)}
        className="relative mt-6 aspect-[16/10] w-full touch-none select-none overflow-hidden rounded-3xl border border-border"
      >
        <img
          src={after}
          alt="Recent portrait painting"
          loading="lazy"
          width={1200}
          height={900}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div
          className="absolute inset-0"
          style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
        >
          <img
            src={before}
            alt="Early portrait sketch"
            loading="lazy"
            width={1200}
            height={900}
            className="h-full w-full object-cover"
          />
          <span className="absolute left-4 top-4 rounded-full border border-border-strong bg-background/70 px-3 py-1 text-[0.68rem] tracking-widest uppercase backdrop-blur-md">
            2024
          </span>
        </div>

        <span className="absolute right-4 top-4 rounded-full border border-border-strong bg-background/70 px-3 py-1 text-[0.68rem] tracking-widest uppercase backdrop-blur-md">
          2026
        </span>

        <div
          className="absolute inset-y-0 w-px bg-accent/70"
          style={{ left: `${pos}%` }}
          aria-hidden
        >
          <span className="absolute top-1/2 left-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize items-center justify-center rounded-full border border-border-strong bg-background/80 backdrop-blur-md">
            <MoveHorizontal size={15} strokeWidth={1.6} className="text-accent" />
          </span>
        </div>
      </div>
    </section>
  );
}
