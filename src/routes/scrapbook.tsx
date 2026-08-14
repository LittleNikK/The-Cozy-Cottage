import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useRef, useState } from "react";
import { Room } from "@/components/cottage/CottageChrome";
import { useCottage } from "@/lib/cottage";

export const Route = createFileRoute("/scrapbook")({
  head: () => ({
    meta: [
      { title: "Scrapbook Wall — Drag the Memories | The Cozy Cottage" },
      {
        name: "description",
        content: "A draggable corkboard of polaroids, washi tape, sticky notes, pressed flowers and handwritten postcards.",
      },
      { property: "og:title", content: "Scrapbook Wall — Drag the Memories" },
      { property: "og:description", content: "Rearrange the cottage's photo wall however you like." },
    ],
  }),
  component: Scrapbook,
});

type Item = {
  id: string;
  kind: "polaroid" | "note" | "postcard" | "flower";
  caption: string;
  x: number;
  y: number;
  rot: number;
  hue: string;
};

const ITEMS: Item[] = [
  { id: "a", kind: "polaroid", caption: "first frost on the kale", x: 2, y: 4, rot: -5, hue: "var(--sage-light)" },
  { id: "b", kind: "polaroid", caption: "bread that finally rose", x: 32, y: 12, rot: 4, hue: "var(--honey)" },
  { id: "c", kind: "note", caption: "buy more yarn (again)", x: 63, y: 2, rot: -3, hue: "var(--honey)" },
  { id: "d", kind: "postcard", caption: "greetings from the mossy woods — wish you were here, P.", x: 8, y: 46, rot: 3, hue: "var(--parchment)" },
  { id: "e", kind: "flower", caption: "pressed clover, June", x: 52, y: 42, rot: -8, hue: "var(--rose)" },
  { id: "f", kind: "polaroid", caption: "Pip asleep in the basil", x: 72, y: 50, rot: 6, hue: "var(--rose)" },
  { id: "g", kind: "note", caption: "the plum jam wants 3 more days", x: 36, y: 68, rot: 5, hue: "var(--sage-light)" },
];

function Scrapbook() {
  const { play } = useCottage();
  const board = useRef<HTMLDivElement>(null);
  const [top, setTop] = useState("f");

  return (
    <Room title="scrapbook">
      <h1 className="font-hand text-5xl">The Scrapbook Wall</h1>
      <p className="max-w-prose text-muted-foreground">
        Everything here is pinned loosely on purpose — drag a photo anywhere it looks happier. (Keyboard: tab to a
        card and use the arrow keys.)
      </p>

      <div
        ref={board}
        className="relative mt-6 h-[34rem] w-full overflow-hidden rounded-3xl border-4 border-bark/35"
        style={{
          background:
            "repeating-linear-gradient(45deg, oklch(0.74 0.06 70), oklch(0.74 0.06 70) 6px, oklch(0.71 0.06 66) 6px, oklch(0.71 0.06 66) 12px)",
        }}
      >
        {ITEMS.map((item) => (
          <ScrapItem
            key={item.id}
            item={item}
            constraints={board}
            z={top === item.id ? 20 : 1}
            onGrab={() => {
              setTop(item.id);
              play("rustle");
            }}
          />
        ))}
      </div>
    </Room>
  );
}

function ScrapItem({
  item,
  constraints,
  z,
  onGrab,
}: {
  item: Item;
  constraints: React.RefObject<HTMLDivElement | null>;
  z: number;
  onGrab: () => void;
}) {
  const [nudge, setNudge] = useState({ x: 0, y: 0 });

  return (
    <motion.div
      drag
      dragConstraints={constraints}
      dragMomentum={false}
      onDragStart={onGrab}
      whileDrag={{ scale: 1.06, rotate: item.rot + 2, boxShadow: "0 26px 40px rgba(0,0,0,0.35)" }}
      whileHover={{ scale: 1.03 }}
      tabIndex={0}
      onKeyDown={(e) => {
        const step = 16;
        const map: Record<string, { x: number; y: number }> = {
          ArrowLeft: { x: -step, y: 0 },
          ArrowRight: { x: step, y: 0 },
          ArrowUp: { x: 0, y: -step },
          ArrowDown: { x: 0, y: step },
        };
        const d = map[e.key];
        if (d) {
          e.preventDefault();
          onGrab();
          setNudge((n) => ({ x: n.x + d.x, y: n.y + d.y }));
        }
      }}
      animate={{ x: nudge.x, y: nudge.y }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      style={{
        position: "absolute",
        left: `${item.x}%`,
        top: `${item.y}%`,
        rotate: item.rot,
        zIndex: z,
        boxShadow: "var(--shadow-paper)",
      }}
      className="focus-visible:ring-ring w-44 cursor-grab rounded-sm bg-card p-2 active:cursor-grabbing focus-visible:ring-4 focus-visible:outline-none"
    >
      <span
        aria-hidden
        className="absolute -top-3 left-1/2 h-6 w-16 -translate-x-1/2 -rotate-3 opacity-80"
        style={{ background: item.hue, boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.08)" }}
      />
      {item.kind === "polaroid" && (
        <div className="aspect-square w-full rounded-sm" style={{ background: item.hue }}>
          <svg viewBox="0 0 100 100" className="h-full w-full" role="img" aria-label={item.caption}>
            <title>{item.caption}</title>
            <circle cx="72" cy="26" r="12" fill="var(--honey)" />
            <path d="M0 78c14-18 26-6 38-20s26-4 34-12 20-6 28 4v50H0z" fill="var(--sage)" opacity="0.85" />
            <path d="M18 82c0-10 6-16 14-16s14 6 14 16z" fill="var(--cream)" />
          </svg>
        </div>
      )}
      {item.kind === "note" && (
        <div className="flex aspect-[4/3] items-center justify-center p-2 text-center" style={{ background: item.hue }}>
          <p className="font-hand text-xl text-bark">{item.caption}</p>
        </div>
      )}
      {item.kind === "postcard" && (
        <div className="aspect-[3/2] p-2" style={{ background: item.hue }}>
          <p className="font-hand text-lg leading-tight text-bark">{item.caption}</p>
          <div className="mt-1 flex justify-end">
            <span aria-hidden className="inline-block rotate-6 border-2 border-dashed border-bark/40 px-2 text-xs">
              ✉︎
            </span>
          </div>
        </div>
      )}
      {item.kind === "flower" && (
        <div className="flex aspect-square items-center justify-center">
          <svg viewBox="0 0 100 100" className="h-24 w-24" role="img" aria-label={item.caption}>
            <title>{item.caption}</title>
            {[0, 72, 144, 216, 288].map((a) => (
              <ellipse key={a} cx="50" cy="30" rx="11" ry="19" fill={item.hue} stroke="var(--bark)" strokeWidth="2" transform={`rotate(${a} 50 50)`} />
            ))}
            <circle cx="50" cy="50" r="9" fill="var(--honey)" stroke="var(--bark)" strokeWidth="2" />
          </svg>
        </div>
      )}
      {item.kind !== "note" && <p className="font-hand mt-1 text-center text-lg leading-tight">{item.caption}</p>}
    </motion.div>
  );
}