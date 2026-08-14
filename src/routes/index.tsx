import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import { useEffect, useState } from "react";
import { Room } from "@/components/cottage/CottageChrome";
import { useCottage, spring } from "@/lib/cottage";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "The Cozy Cottage — Come In, Kettle's On" },
      {
        name: "description",
        content:
          "The entryway of a hand-drawn cottagecore website: a fox guide, drifting clouds and four little rooms to wander.",
      },
      { property: "og:title", content: "The Cozy Cottage — Come In, Kettle's On" },
      {
        property: "og:description",
        content: "A warm, lived-in digital cabin with a fox, a pet corner, a scrapbook and a recipe book.",
      },
    ],
  }),
  component: Entryway,
});

const GREETINGS = [
  "Oh! You found the path through the ferns.",
  "Come in, come in — mind the sleepy bees.",
  "I put the kettle on the moment I heard you.",
  "There's jam on the table and no rush at all.",
  "The moss said someone lovely was coming.",
];

const DOORS = [
  { to: "/pet-corner", label: "Pet Corner", note: "Pip's little diorama", emoji: "🌿" },
  { to: "/scrapbook", label: "Scrapbook Wall", note: "Drag the polaroids", emoji: "📸" },
  { to: "/recipe-nook", label: "Recipe Nook", note: "Turn the jammy pages", emoji: "🫖" },
  { to: "/guestbook", label: "Guestbook", note: "Sign with the quill", emoji: "🪶" },
] as const;

function Entryway() {
  const { timeOfDay, play } = useCottage();
  const [i, setI] = useState(0);
  const [knocks, setKnocks] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % GREETINGS.length), 5200);
    return () => clearInterval(t);
  }, []);

  return (
    <Room title="entryway">
      <section className="grid items-center gap-8 py-8 md:grid-cols-2">
        <div>
          <p className="font-hand text-2xl text-muted-foreground">
            {timeOfDay === "day" ? "a bright, breezy afternoon" : "lantern-light and firefly hour"}
          </p>
          <h1 className="font-hand text-6xl leading-[0.95] sm:text-7xl">
            The Cozy
            <br />
            Cottage
          </h1>
          <div className="mt-4 h-16">
            <AnimatePresence mode="wait">
              <motion.p
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={spring}
                className="max-w-sm text-lg font-medium text-muted-foreground"
              >
                “{GREETINGS[i]}”
              </motion.p>
            </AnimatePresence>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/pet-corner"
              onClick={() => play("pop")}
              className="focus-visible:ring-ring rounded-full border-2 border-bark/30 bg-primary px-6 py-3 font-semibold text-primary-foreground shadow-[var(--shadow-cozy)] transition hover:-translate-y-1 focus-visible:ring-2 focus-visible:outline-none"
            >
              Follow the fox inside
            </Link>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 120, damping: 12 }}
          className="relative mx-auto w-full max-w-md"
        >
          <CottageArt lit={timeOfDay === "dusk"} knocks={knocks} onKnock={() => {
            play("rustle");
            setKnocks((k) => k + 1);
          }} />
          <AnimatePresence>
            {knocks >= 3 && (
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="paper font-hand mt-3 rounded-xl border-2 border-bark/20 px-3 py-2 text-center text-xl"
              >
                🐌 A snail answered the door. He says hello and asks for lettuce.
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>
      </section>

      <section aria-labelledby="rooms" className="pt-4">
        <h2 id="rooms" className="font-hand text-4xl">
          Four doors, no wrong one
        </h2>
        <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {DOORS.map((d, idx) => (
            <motion.li
              key={d.to}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 * idx, type: "spring", stiffness: 160, damping: 14 }}
              whileHover={{ y: -8, rotate: idx % 2 ? 1.5 : -1.5 }}
            >
              <Link
                to={d.to}
                onClick={() => play("flip")}
                className="focus-visible:ring-ring paper block h-full rounded-2xl border-2 border-bark/25 p-4 focus-visible:ring-2 focus-visible:outline-none"
              >
                <span className="text-3xl" aria-hidden>
                  {d.emoji}
                </span>
                <span className="font-hand mt-1 block text-3xl">{d.label}</span>
                <span className="block text-sm text-muted-foreground">{d.note}</span>
              </Link>
            </motion.li>
          ))}
        </ul>
      </section>
    </Room>
  );
}

function CottageArt({ lit, knocks, onKnock }: { lit: boolean; knocks: number; onKnock: () => void }) {
  return (
    <svg viewBox="0 0 400 320" className="w-full drop-shadow-[0_18px_28px_rgba(0,0,0,0.18)]" role="img" aria-label="A hand-drawn stone cottage with a mossy roof, round door and smoking chimney">
      <title>A hand-drawn stone cottage with a mossy roof and a smoking chimney</title>
      <g className="animate-steam" style={{ transformOrigin: "300px 70px" }}>
        <circle cx="300" cy="70" r="9" fill="oklch(1 0 0 / 0.6)" />
      </g>
      <rect x="288" y="78" width="26" height="44" rx="4" fill="var(--rose)" stroke="var(--bark)" strokeWidth="4" />
      <path d="M60 150c-4-16 30-52 78-64 12-3 22-3 34 0 46 12 78 46 74 64z" fill="var(--sage)" stroke="var(--bark)" strokeWidth="5" strokeLinejoin="round" />
      <path d="M64 150h182c6 60 2 96-6 100H72c-8-6-12-42-8-100z" fill="var(--parchment)" stroke="var(--bark)" strokeWidth="5" strokeLinejoin="round" />
      <rect x="88" y="176" width="46" height="40" rx="6" fill={lit ? "var(--honey)" : "oklch(0.85 0.06 220)"} stroke="var(--bark)" strokeWidth="4" />
      <path d="M111 176v40M88 196h46" stroke="var(--bark)" strokeWidth="3" />
      <g onClick={onKnock} role="button" tabIndex={0} aria-label="Knock on the cottage door" className="cursor-pointer"
         onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onKnock(); } }}>
        <path d="M164 250v-38c0-16 12-26 26-26s26 10 26 26v38z" fill="var(--secondary)" stroke="var(--bark)" strokeWidth="5" />
        <circle cx="206" cy="228" r="4" fill="var(--bark)" />
        {knocks > 0 && <circle cx="190" cy="200" r={4 + knocks} fill="var(--honey)" opacity="0.5" />}
      </g>
      <path d="M40 250h320" stroke="var(--bark)" strokeWidth="5" strokeLinecap="round" />
      {[50, 78, 300, 330, 356].map((x, i) => (
        <g key={x} className="animate-sway" style={{ animationDelay: `${i * 0.6}s`, transformOrigin: `${x}px 250px` }}>
          <path d={`M${x} 250v-22`} stroke="var(--sage)" strokeWidth="4" strokeLinecap="round" />
          <circle cx={x} cy={224} r="7" fill={i % 2 ? "var(--rose)" : "var(--honey)"} stroke="var(--bark)" strokeWidth="3" />
        </g>
      ))}
    </svg>
  );
}
