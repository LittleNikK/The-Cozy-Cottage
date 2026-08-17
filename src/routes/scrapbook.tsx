import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import { useRef, useState } from "react";
import { Room } from "@/components/cottage/CottageChrome";
import { useCottage, type ScrapbookItem } from "@/lib/cottage";

export const Route = createFileRoute("/scrapbook")({
  head: () => ({
    meta: [
      { title: "Scrapbook Wall — Drag the Memories | The Cozy Cottage" },
      {
        name: "description",
        content:
          "A draggable corkboard of polaroids, washi tape, sticky notes, pressed flowers and handwritten postcards.",
      },
      { property: "og:title", content: "Scrapbook Wall — Drag the Memories" },
      {
        property: "og:description",
        content: "Rearrange the cottage's photo wall however you like.",
      },
    ],
  }),
  component: Scrapbook,
});

function Scrapbook() {
  const { play, scrapbookItems, setScrapbookItems, inventory, removeInventoryItem } = useCottage();
  const board = useRef<HTMLDivElement>(null);
  const [top, setTop] = useState("f");

  // Custom item inputs
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [kind, setKind] = useState<"polaroid" | "note" | "postcard" | "flower">("polaroid");
  const [caption, setCaption] = useState("");
  const [hue, setHue] = useState("var(--sage-light)");
  const [selectedFlower, setSelectedFlower] = useState<
    "lavender" | "sunflower" | "daisy" | "clover"
  >("clover");

  const HUES = [
    { value: "var(--sage-light)", label: "Sage" },
    { value: "var(--honey)", label: "Honey" },
    { value: "var(--rose)", label: "Rose" },
    { value: "var(--parchment)", label: "Parchment" },
  ];

  const handleDragEnd = (id: string, event: unknown) => {
    if (!board.current) return;

    const target = (event as { target?: unknown })?.target;
    if (!(target instanceof HTMLElement)) return;
    const container = target.closest(".scrapbook-item") as HTMLElement;
    if (!container) return;

    const boardRect = board.current.getBoundingClientRect();
    const elementRect = container.getBoundingClientRect();

    // Convert coordinates to percentages relative to board
    let newX = ((elementRect.left - boardRect.left) / boardRect.width) * 100;
    let newY = ((elementRect.top - boardRect.top) / boardRect.height) * 100;

    // Clamp coordinates so elements stay fully on the board
    newX = Math.max(0, Math.min(82, newX));
    newY = Math.max(0, Math.min(80, newY));

    setScrapbookItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, x: newX, y: newY } : item)),
    );
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let itemCaption = caption.trim();
    let itemHue = hue;

    // Greenhouse item deduction logic
    if (kind === "flower") {
      const flowerName = selectedFlower;
      if (inventory[flowerName] < 1) {
        alert(`You don't have any harvested ${flowerName} in your Greenhouse pocket to press!`);
        return;
      }

      removeInventoryItem(flowerName, 1);
      itemCaption = `pressed ${flowerName}, ${new Date().toLocaleDateString("en-US", { month: "short" })}`;

      // Select appropriate color for flower card background
      if (flowerName === "lavender") itemHue = "oklch(0.88 0.04 285)";
      else if (flowerName === "sunflower") itemHue = "var(--honey)";
      else if (flowerName === "daisy") itemHue = "var(--cream)";
      else itemHue = "var(--sage-light)";
    }

    if (!itemCaption && kind !== "flower") return;

    const newItem: ScrapbookItem = {
      id: Date.now().toString(),
      kind,
      caption: itemCaption,
      x: 10 + Math.random() * 60,
      y: 10 + Math.random() * 50,
      rot: -10 + Math.random() * 20,
      hue: itemHue,
    };

    setScrapbookItems((prev) => [...prev, newItem]);
    setCaption("");
    play("chime");
    setShowAddPanel(false);
  };

  const handleDeleteItem = (id: string) => {
    play("pop");
    setScrapbookItems((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <Room title="scrapbook">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-hand text-5xl">The Scrapbook Wall</h1>
          <p className="max-w-prose text-muted-foreground">
            Everything here is pinned loosely on purpose — drag a photo anywhere it looks happier.
            (Double click / tab & press backspace to pin/unpin).
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            play("pop");
            setShowAddPanel((o) => !o);
          }}
          className="px-5 py-2.5 rounded-full wobble-border bg-honey font-semibold text-bark shadow-sm hover:-translate-y-0.5 transition cursor-pointer"
        >
          📌 Pin something new
        </button>
      </div>

      {/* Add Scrapbook Item Panel */}
      <AnimatePresence>
        {showAddPanel && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="paper wobble-border mt-4 overflow-hidden rounded-3xl p-5"
          >
            <h2 className="font-hand text-3xl mb-2">Pin a new memory</h2>
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {(["polaroid", "note", "postcard", "flower"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => {
                      play("click");
                      setKind(t);
                    }}
                    className={`px-3 py-1.5 rounded-xl border-2 text-sm font-semibold capitalize cursor-pointer transition ${
                      kind === t
                        ? "border-bark bg-secondary"
                        : "border-bark/15 bg-card hover:border-bark/30"
                    }`}
                  >
                    {t === "polaroid"
                      ? "📸 Polaroid"
                      : t === "note"
                        ? "📝 Note"
                        : t === "postcard"
                          ? "✉️ Postcard"
                          : "🌸 Pressed Flower"}
                  </button>
                ))}
              </div>

              {kind !== "flower" ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block">
                    <span className="font-semibold text-sm">
                      {kind === "polaroid"
                        ? "Photo Caption"
                        : kind === "note"
                          ? "Note Message"
                          : "Postcard Message"}
                    </span>
                    <input
                      required
                      value={caption}
                      onChange={(e) => setCaption(e.target.value)}
                      className="mt-1 w-full rounded-xl border-2 border-bark/20 bg-card px-3 py-2 focus:outline-none focus:border-bark"
                      placeholder={
                        kind === "polaroid"
                          ? "e.g. sunset on the hills"
                          : kind === "note"
                            ? "e.g. sourdough turns 3 days old"
                            : "e.g. greetings from the forest!"
                      }
                    />
                  </label>
                  <label className="block">
                    <span className="font-semibold text-sm">Paper Color</span>
                    <div className="mt-1.5 flex gap-2">
                      {HUES.map((h) => (
                        <button
                          key={h.value}
                          type="button"
                          onClick={() => {
                            play("click");
                            setHue(h.value);
                          }}
                          style={{ backgroundColor: h.value }}
                          className={`h-8 w-8 rounded-full border-2 cursor-pointer transition ${
                            hue === h.value
                              ? "border-bark scale-110 shadow-sm"
                              : "border-transparent opacity-85"
                          }`}
                          title={h.label}
                          aria-label={`Select ${h.label} color`}
                        />
                      ))}
                    </div>
                  </label>
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block">
                    <span className="font-semibold text-sm">Select Flower from Pocket</span>
                    <select
                      onChange={(e) =>
                        setSelectedFlower(
                          e.target.value as "lavender" | "sunflower" | "daisy" | "clover",
                        )
                      }
                      className="mt-1 w-full rounded-xl border-2 border-bark/20 bg-card px-3 py-2 focus:outline-none focus:border-bark cursor-pointer"
                    >
                      <option value="clover">☘️ Clover (Stock: {inventory.clover})</option>
                      <option value="lavender">🪻 Lavender (Stock: {inventory.lavender})</option>
                      <option value="sunflower">🌻 Sunflower (Stock: {inventory.sunflower})</option>
                      <option value="daisy">🌼 Daisy (Stock: {inventory.daisy})</option>
                    </select>
                  </label>
                  <div className="flex items-center">
                    <p className="text-xs text-muted-foreground mt-4">
                      🌸 Flowers can be planted, watered, and harvested inside the **Greenhouse**.
                      Pinned flowers will use 1 harvested flower.
                    </p>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddPanel(false)}
                  className="px-4 py-2 rounded-full border-2 border-bark/30 font-semibold cursor-pointer hover:bg-muted text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={kind === "flower" && inventory[selectedFlower] < 1}
                  className="px-5 py-2 rounded-full bg-primary text-primary-foreground font-semibold cursor-pointer hover:bg-primary/95 disabled:opacity-40 disabled:cursor-not-allowed text-sm"
                >
                  Pin to Wall
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Corkboard Scrapbook Wall */}
      <div
        ref={board}
        className="relative mt-6 h-[36rem] w-full overflow-hidden rounded-3xl border-4 border-bark/35 shadow-[var(--shadow-cozy)]"
        style={{
          background:
            "repeating-linear-gradient(45deg, oklch(0.74 0.06 70), oklch(0.74 0.06 70) 6px, oklch(0.71 0.06 66) 6px, oklch(0.71 0.06 66) 12px)",
        }}
      >
        <AnimatePresence>
          {scrapbookItems.map((item) => (
            <ScrapItem
              key={item.id}
              item={item}
              constraints={board}
              z={top === item.id ? 30 : 5}
              onGrab={() => {
                setTop(item.id);
                play("rustle");
              }}
              onDragEnd={(event) => handleDragEnd(item.id, event)}
              onDelete={() => handleDeleteItem(item.id)}
            />
          ))}
        </AnimatePresence>
      </div>
    </Room>
  );
}

function ScrapItem({
  item,
  constraints,
  z,
  onGrab,
  onDragEnd,
  onDelete,
}: {
  item: ScrapbookItem;
  constraints: React.RefObject<HTMLDivElement | null>;
  z: number;
  onGrab: () => void;
  onDragEnd: (event: unknown, info: unknown) => void;
  onDelete: () => void;
}) {
  const [nudge, setNudge] = useState({ x: 0, y: 0 });

  return (
    <motion.div
      drag
      dragConstraints={constraints}
      dragMomentum={false}
      onDragStart={onGrab}
      onDragEnd={onDragEnd}
      whileDrag={{ scale: 1.05, rotate: item.rot + 2, boxShadow: "0 22px 35px rgba(0,0,0,0.3)" }}
      whileHover={{ scale: 1.02 }}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Backspace" || e.key === "Delete") {
          e.preventDefault();
          onDelete();
          return;
        }
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
      className="scrapbook-item focus-visible:ring-ring w-44 cursor-grab rounded-sm bg-card p-2.5 active:cursor-grabbing focus-visible:ring-4 focus-visible:outline-none select-none relative group border border-bark/10"
    >
      {/* Delete Pin button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="absolute -top-2.5 -right-2.5 h-6 w-6 rounded-full bg-rose border border-bark/30 text-bark font-bold text-xs flex items-center justify-center cursor-pointer shadow-sm opacity-0 group-hover:opacity-100 transition-opacity z-40 hover:scale-110 active:scale-95"
        title="Unpin from wall"
      >
        ✖
      </button>

      {/* Decorative Washi Tape */}
      <span
        aria-hidden
        className="absolute -top-3.5 left-1/2 h-6 w-16 -translate-x-1/2 -rotate-3 opacity-80"
        style={{ background: item.hue, boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.08)" }}
      />

      {item.kind === "polaroid" && (
        <div
          className="aspect-square w-full rounded-sm overflow-hidden"
          style={{ background: item.hue }}
        >
          <svg viewBox="0 0 100 100" className="h-full w-full" role="img" aria-label={item.caption}>
            <title>{item.caption}</title>
            {/* Draw a wobbly landscape */}
            <circle cx="74" cy="26" r="11" fill="var(--honey)" />
            <path
              d="M0 78c12-16 24-4 36-18s24-2 32-10 18-4 26 6v40H0z"
              fill="var(--sage)"
              opacity="0.8"
            />
            <path d="M14 82c0-8 5-13 12-13s12 5 12 13z" fill="var(--cream)" opacity="0.9" />
          </svg>
        </div>
      )}

      {item.kind === "note" && (
        <div
          className="flex aspect-[4/3] items-center justify-center p-2 text-center rounded-sm"
          style={{ background: item.hue }}
        >
          <p className="font-hand text-xl text-bark leading-tight">{item.caption}</p>
        </div>
      )}

      {item.kind === "postcard" && (
        <div
          className="aspect-[3/2] p-2 rounded-sm border-r-2 border-dashed border-bark/20"
          style={{ background: item.hue }}
        >
          <p className="font-hand text-lg leading-tight text-bark">{item.caption}</p>
          <div className="mt-2 flex justify-between items-end">
            <span aria-hidden className="text-[10px] text-muted-foreground font-hand">
              post stamp
            </span>
            <span
              aria-hidden
              className="inline-block rotate-6 border border-dashed border-bark/30 px-1.5 py-0.5 text-xs text-bark/60 font-semibold bg-white/20"
            >
              ✉︎
            </span>
          </div>
        </div>
      )}

      {item.kind === "flower" && (
        <div className="flex aspect-square items-center justify-center rounded-sm bg-card/65 border border-bark/5 py-1">
          <FlowerDrawing caption={item.caption} />
        </div>
      )}

      {item.kind !== "note" && (
        <p className="font-hand mt-1.5 text-center text-lg leading-tight text-bark">
          {item.caption}
        </p>
      )}
    </motion.div>
  );
}

function FlowerDrawing({ caption }: { caption: string }) {
  const lowercase = caption.toLowerCase();

  if (lowercase.includes("lavender")) {
    return (
      <svg viewBox="0 0 80 80" className="h-20 w-20" role="img" aria-label="Pressed Lavender">
        <path d="M40 70V20" stroke="var(--bark)" strokeWidth="3" strokeLinecap="round" />
        <path
          d="M40 32c-3-3-6 0-3 3s6 0 3-3z"
          fill="oklch(0.7 0.12 285)"
          stroke="var(--bark)"
          strokeWidth="1.5"
        />
        <path
          d="M40 40c-3-3-6 0-3 3s6 0 3-3z"
          fill="oklch(0.7 0.12 285)"
          stroke="var(--bark)"
          strokeWidth="1.5"
        />
        <path
          d="M40 24c-2.5-2.5-5 0-2.5 2.5S40 24 40 24z"
          fill="oklch(0.6 0.15 285)"
          stroke="var(--bark)"
          strokeWidth="1.5"
        />
        {/* Leaves */}
        <path
          d="M40 55c-8-2-10-5-10-5 0 0 5 5 10 5z"
          fill="var(--sage)"
          stroke="var(--bark)"
          strokeWidth="1.2"
        />
        <path
          d="M40 50c8-2 10-5 10-5 0 0-5 5-10 5z"
          fill="var(--sage)"
          stroke="var(--bark)"
          strokeWidth="1.2"
        />
      </svg>
    );
  }

  if (lowercase.includes("sunflower")) {
    return (
      <svg viewBox="0 0 80 80" className="h-20 w-20" role="img" aria-label="Pressed Sunflower">
        {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((a) => (
          <ellipse
            key={a}
            cx="40"
            cy="23"
            rx="5"
            ry="13"
            fill="var(--honey)"
            stroke="var(--bark)"
            strokeWidth="1.5"
            transform={`rotate(${a} 40 40)`}
          />
        ))}
        <circle
          cx="40"
          cy="40"
          r="11"
          fill="oklch(0.35 0.04 60)"
          stroke="var(--bark)"
          strokeWidth="2.2"
        />
      </svg>
    );
  }

  if (lowercase.includes("daisy")) {
    return (
      <svg viewBox="0 0 80 80" className="h-20 w-20" role="img" aria-label="Pressed Daisy">
        {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
          <ellipse
            key={a}
            cx="40"
            cy="24"
            rx="5.5"
            ry="11.5"
            fill="var(--cream)"
            stroke="var(--bark)"
            strokeWidth="1.5"
            transform={`rotate(${a} 40 40)`}
          />
        ))}
        <circle
          cx="40"
          cy="40"
          r="9.5"
          fill="var(--honey)"
          stroke="var(--bark)"
          strokeWidth="1.8"
        />
      </svg>
    );
  }

  // Fallback: Clover drawing
  return (
    <svg viewBox="0 0 80 80" className="h-20 w-20" role="img" aria-label="Pressed Clover">
      {[0, 90, 180, 270].map((a) => (
        <ellipse
          key={a}
          cx="40"
          cy="27"
          rx="8"
          ry="10"
          fill="var(--sage)"
          stroke="var(--bark)"
          strokeWidth="1.5"
          transform={`rotate(${a} 40 40)`}
        />
      ))}
      <path
        d="M40 40c2 10 8 16 14 18"
        fill="none"
        stroke="var(--bark)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
