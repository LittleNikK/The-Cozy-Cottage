import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { useState, type FormEvent } from "react";
import { Room } from "@/components/cottage/CottageChrome";
import { Fox } from "@/components/cottage/Fox";
import { useCottage, spring } from "@/lib/cottage";

export const Route = createFileRoute("/guestbook")({
  head: () => ({
    meta: [
      { title: "Guestbook & Now — Sign the Book | The Cozy Cottage" },
      {
        name: "description",
        content:
          "What I'm up to now, plus a guestbook you can sign with an animated quill before you head back out.",
      },
      { property: "og:title", content: "Guestbook & Now — Sign the Book" },
      { property: "og:description", content: "Leave a note by the door of the cozy cottage." },
    ],
  }),
  component: Guestbook,
});

const INK_COLORS = [
  { value: "var(--bark)", name: "Oak Bark" },
  { value: "var(--rose)", name: "Berry Pink" },
  { value: "var(--sage)", name: "Moss Green" },
  { value: "oklch(0.31 0.05 275)", name: "Night Sky" },
];

const STAMPS = [
  { value: "none", label: "No Stamp", emoji: "✖️" },
  { value: "snail", label: "Snail", emoji: "🐌" },
  { value: "mushroom", label: "Mushroom", emoji: "🍄" },
  { value: "acorn", label: "Acorn", emoji: "🌰" },
  { value: "clover", label: "Clover", emoji: "☘️" },
];

function Guestbook() {
  const { play, guestbookEntries, addGuestbookEntry, pipAccessory } = useCottage();
  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  const [inkColor, setInkColor] = useState("var(--bark)");
  const [stamp, setStamp] = useState("none");
  const [signing, setSigning] = useState(false);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !note.trim()) return;
    setSigning(true);
    play("chime");

    // Simulate quill writing duration
    setTimeout(() => {
      addGuestbookEntry(name.trim(), note.trim(), inkColor, stamp);
      setName("");
      setNote("");
      setStamp("none");
      setSigning(false);
    }, 1200);
  };

  return (
    <Room title="guestbook">
      <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr]">
        <section>
          <h1 className="font-hand text-5xl">Now, by the door</h1>
          <div className="paper wobble-border mt-4 rounded-3xl p-5">
            <ul className="space-y-3 text-lg">
              <li>🌱 Coaxing three stubborn tomato seedlings through a cold spring.</li>
              <li>🧶 Knitting a scarf that has been "nearly done" since November.</li>
              <li>📖 Rereading old nature diaries and copying out the good lines.</li>
              <li>🫖 Trying to make the perfect cup of lavender milk. Attempt 41.</li>
            </ul>
            <p className="font-hand mt-4 text-2xl text-muted-foreground">
              Updated whenever the season shifts.
            </p>
          </div>
          <div className="mt-6 flex items-end gap-3">
            <Fox
              mood="calm"
              size={120}
              accessory={pipAccessory}
              title="Pip the fox sitting beside the guestbook"
            />
            <p className="paper wobble-border font-hand rounded-2xl rounded-bl-sm px-3 py-2 text-xl max-w-[16rem]">
              Thanks for wandering all the way here.
            </p>
          </div>
        </section>

        <section>
          <h2 className="font-hand text-4xl">Sign the guestbook</h2>
          <p className="text-sm text-muted-foreground">
            Kept for this visit only — nothing leaves the cottage.
          </p>
          <form onSubmit={submit} className="paper wobble-border mt-3 space-y-4 rounded-3xl p-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="font-semibold text-sm">Your name</span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="focus-visible:ring-ring mt-1 w-full rounded-xl border-2 border-bark/25 bg-card px-3 py-2 focus-visible:ring-2 focus-visible:outline-none"
                  placeholder="a name, or a nickname"
                />
              </label>

              <label className="block">
                <span className="font-semibold text-sm">Ink Color</span>
                <div className="mt-1 flex gap-2">
                  {INK_COLORS.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => {
                        play("click");
                        setInkColor(color.value);
                      }}
                      title={color.name}
                      style={{ backgroundColor: color.value }}
                      className={`h-8 w-8 rounded-full border-2 cursor-pointer transition ${
                        inkColor === color.value
                          ? "border-bark scale-110 shadow-sm"
                          : "border-transparent opacity-75"
                      }`}
                      aria-label={`Select ${color.name} ink`}
                    />
                  ))}
                </div>
              </label>
            </div>

            <label className="block">
              <span className="font-semibold text-sm">Select a Stamp</span>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {STAMPS.map((s) => (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => {
                      play("click");
                      setStamp(s.value);
                    }}
                    className={`px-3 py-1.5 rounded-xl border-2 text-sm font-medium cursor-pointer transition ${
                      stamp === s.value
                        ? "border-bark bg-secondary text-foreground scale-102"
                        : "border-bark/20 bg-card text-muted-foreground hover:border-bark/40"
                    }`}
                  >
                    <span className="mr-1">{s.emoji}</span>
                    {s.label}
                  </button>
                ))}
              </div>
            </label>

            <label className="block">
              <span className="font-semibold text-sm">A note</span>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                required
                rows={3}
                style={{ color: inkColor }}
                className="focus-visible:ring-ring mt-1 w-full rounded-xl border-2 border-bark/25 bg-card px-3 py-2 focus-visible:ring-2 focus-visible:outline-none transition-colors"
                placeholder="something small and kind"
              />
            </label>

            <div className="flex items-center gap-3">
              <motion.button
                type="submit"
                whileTap={{ scale: 0.95 }}
                className="focus-visible:ring-ring rounded-full border-2 border-bark/30 bg-primary px-5 py-2.5 font-semibold text-primary-foreground focus-visible:ring-2 focus-visible:outline-none cursor-pointer"
              >
                🪶 Sign with the quill
              </motion.button>
              <AnimatePresence>
                {signing && (
                  <motion.span
                    aria-hidden
                    initial={{ x: -10, rotate: -25, opacity: 0 }}
                    animate={{
                      x: [0, 40, 80, 120],
                      y: [0, -6, 0, -6],
                      rotate: [-25, -5, -25, -5],
                      opacity: [0, 1, 1, 0],
                    }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.1, ease: "easeInOut" }}
                    className="text-2xl"
                  >
                    ✒️
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </form>

          <ul className="mt-5 space-y-3" aria-live="polite">
            <AnimatePresence initial={false}>
              {guestbookEntries.map((entry, index) => (
                <motion.li
                  key={entry.id}
                  initial={{ opacity: 0, y: -14, rotate: -3 }}
                  animate={{ opacity: 1, y: 0, rotate: index % 2 ? 0.7 : -0.7 }}
                  transition={spring}
                  className="paper wobble-border rounded-2xl px-4 py-3 flex gap-3 items-center justify-between"
                >
                  <div className="flex-1">
                    <p className="font-hand text-2xl" style={{ color: entry.color }}>
                      {entry.name}
                    </p>
                    <p
                      className="text-muted-foreground mt-0.5"
                      style={{ color: entry.color + "d0" }}
                    >
                      {entry.note}
                    </p>
                    <span className="text-xs text-muted-foreground/60 block mt-1">
                      {entry.date}
                    </span>
                  </div>
                  <StampRenderer stamp={entry.stamp} color={entry.color} />
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        </section>
      </div>
    </Room>
  );
}

function StampRenderer({ stamp, color }: { stamp: string; color: string }) {
  if (stamp === "none") return null;
  if (stamp === "snail") return <StampSnail color={color} />;
  if (stamp === "mushroom") return <StampMushroom color={color} />;
  if (stamp === "acorn") return <StampAcorn color={color} />;
  if (stamp === "clover") return <StampClover color={color} />;
  return null;
}

function StampSnail({ color = "var(--bark)" }: { color?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      className="h-10 w-10 shrink-0 rotate-3 opacity-80"
      style={{ color }}
      role="img"
      aria-label="Snail stamp"
    >
      <ellipse cx="20" cy="24" rx="9" ry="6" fill="none" stroke="currentColor" strokeWidth="2.5" />
      <path
        d="M10 27h20c3 0 4-2 3-4s-3-2-5-2"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path d="M27 23v-6M29 22v-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="27" cy="16" r="1.2" fill="currentColor" />
      <circle cx="29" cy="15.8" r="1.2" fill="currentColor" />
    </svg>
  );
}

function StampMushroom({ color = "var(--bark)" }: { color?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      className="h-10 w-10 shrink-0 -rotate-3 opacity-80"
      style={{ color }}
      role="img"
      aria-label="Mushroom stamp"
    >
      <path
        d="M10 20c0-6 4.5-9 10-9s10 3 10 9v1.5H10z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path
        d="M17 21.5v8c0 1.5 6 1.5 6 0v-8"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <circle cx="15" cy="15" r="1.2" fill="currentColor" />
      <circle cx="25" cy="16" r="1.2" fill="currentColor" />
    </svg>
  );
}

function StampAcorn({ color = "var(--bark)" }: { color?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      className="h-10 w-10 shrink-0 rotate-6 opacity-80"
      style={{ color }}
      role="img"
      aria-label="Acorn stamp"
    >
      <path
        d="M13 18c0 6 3.5 11 7 11s7-5 7-11H13z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path
        d="M11 18c3-3.5 15-3.5 18 0H11z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path d="M20 14.5v-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function StampClover({ color = "var(--bark)" }: { color?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      className="h-10 w-10 shrink-0 -rotate-6 opacity-80"
      style={{ color }}
      role="img"
      aria-label="Clover stamp"
    >
      <path
        d="M20 20c-2.5-2.5-6-2.5-6 0s3.5 2.5 6 0M20 20c2.5-2.5 6-2.5 6 0s-3.5 2.5-6 0M20 20c-2.5 2.5-2.5 6 0 6s2.5-3.5 0-6M20 20c2.5 2.5 2.5 6 0 6s-2.5-3.5 0-6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M20 20c1.5 3.5 3.5 8 5.5 10"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}
