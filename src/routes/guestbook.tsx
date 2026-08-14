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
        content: "What I'm up to now, plus a guestbook you can sign with an animated quill before you head back out.",
      },
      { property: "og:title", content: "Guestbook & Now — Sign the Book" },
      { property: "og:description", content: "Leave a note by the door of the cozy cottage." },
    ],
  }),
  component: Guestbook,
});

type Entry = { id: number; name: string; note: string };

const SEED: Entry[] = [
  { id: 1, name: "Wren", note: "The plum jam recipe worked. My kitchen smells like autumn." },
  { id: 2, name: "Tomas", note: "Pip yawned at me and I felt personally understood." },
];

function Guestbook() {
  const { play } = useCottage();
  const [entries, setEntries] = useState<Entry[]>(SEED);
  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  const [signing, setSigning] = useState(false);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !note.trim()) return;
    setSigning(true);
    play("chime");
    setTimeout(() => {
      setEntries((list) => [{ id: Date.now(), name: name.trim(), note: note.trim() }, ...list]);
      setName("");
      setNote("");
      setSigning(false);
    }, 900);
  };

  return (
    <Room title="guestbook">
      <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr]">
        <section>
          <h1 className="font-hand text-5xl">Now, by the door</h1>
          <div className="paper mt-4 rounded-3xl border-2 border-bark/25 p-5">
            <ul className="space-y-3 text-lg">
              <li>🌱 Coaxing three stubborn tomato seedlings through a cold spring.</li>
              <li>🧶 Knitting a scarf that has been "nearly done" since November.</li>
              <li>📖 Rereading old nature diaries and copying out the good lines.</li>
              <li>🫖 Trying to make the perfect cup of lavender milk. Attempt 41.</li>
            </ul>
            <p className="font-hand mt-4 text-2xl text-muted-foreground">Updated whenever the season shifts.</p>
          </div>
          <div className="mt-6 flex items-end gap-3">
            <Fox mood="calm" size={120} title="Pip the fox sitting beside the guestbook" />
            <p className="paper font-hand rounded-2xl rounded-bl-sm border-2 border-bark/25 px-3 py-2 text-xl">
              Thanks for wandering all the way here.
            </p>
          </div>
        </section>

        <section>
          <h2 className="font-hand text-4xl">Sign the guestbook</h2>
          <p className="text-sm text-muted-foreground">Kept for this visit only — nothing leaves the cottage.</p>
          <form onSubmit={submit} className="paper mt-3 space-y-3 rounded-3xl border-2 border-bark/25 p-5">
            <label className="block">
              <span className="font-semibold">Your name</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="focus-visible:ring-ring mt-1 w-full rounded-xl border-2 border-bark/25 bg-card px-3 py-2 focus-visible:ring-2 focus-visible:outline-none"
                placeholder="a name, or a nickname"
              />
            </label>
            <label className="block">
              <span className="font-semibold">A note</span>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                required
                rows={3}
                className="focus-visible:ring-ring mt-1 w-full rounded-xl border-2 border-bark/25 bg-card px-3 py-2 focus-visible:ring-2 focus-visible:outline-none"
                placeholder="something small and kind"
              />
            </label>
            <div className="flex items-center gap-3">
              <motion.button
                type="submit"
                whileTap={{ scale: 0.95 }}
                className="focus-visible:ring-ring rounded-full border-2 border-bark/30 bg-primary px-5 py-2.5 font-semibold text-primary-foreground focus-visible:ring-2 focus-visible:outline-none"
              >
                🪶 Sign with the quill
              </motion.button>
              <AnimatePresence>
                {signing && (
                  <motion.span
                    aria-hidden
                    initial={{ x: -10, rotate: -20, opacity: 0 }}
                    animate={{ x: 90, rotate: 10, opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.85 }}
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
              {entries.map((entry, i) => (
                <motion.li
                  key={entry.id}
                  initial={{ opacity: 0, y: -14, rotate: -3 }}
                  animate={{ opacity: 1, y: 0, rotate: i % 2 ? 0.8 : -0.8 }}
                  transition={spring}
                  className="paper rounded-2xl border-2 border-bark/20 px-4 py-3"
                >
                  <p className="font-hand text-2xl">{entry.name}</p>
                  <p className="text-muted-foreground">{entry.note}</p>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        </section>
      </div>
    </Room>
  );
}