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
          "The entryway of a hand-drawn cottagecore website: a fox guide, drifting clouds and six little rooms to wander.",
      },
      { property: "og:title", content: "The Cozy Cottage — Come In, Kettle's On" },
      {
        property: "og:description",
        content:
          "A warm, lived-in digital cabin with a fox, a pet corner, a scrapbook, a garden and a recipe book.",
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
  { to: "/garden", label: "Greenhouse", note: "Grow & harvest flowers", emoji: "🌻" },
  { to: "/pet-corner", label: "Pet Corner", note: "Pip's little diorama", emoji: "🌿" },
  { to: "/scrapbook", label: "Scrapbook Wall", note: "Drag the polaroids", emoji: "📸" },
  { to: "/recipe-nook", label: "Recipe Nook", note: "Turn the jammy pages", emoji: "🫖" },
  { to: "/guestbook", label: "Guestbook", note: "Sign with the quill", emoji: "🪶" },
  { to: "/music-box", label: "Music Box", note: "Relax to cozy chimes", emoji: "📻" },
] as const;

type SmokePuff = {
  id: number;
  size: number;
  drift: number;
};

function Entryway() {
  const { timeOfDay, play, addInventoryItem } = useCottage();
  const [i, setI] = useState(0);
  const [knocks, setKnocks] = useState(0);
  const [windowLit, setWindowLit] = useState(timeOfDay === "dusk");
  const [smokePuffs, setSmokePuffs] = useState<SmokePuff[]>([]);
  const [matShaking, setMatShaking] = useState(false);
  const [matOpened, setMatOpened] = useState(false);
  const [matHarvested, setMatHarvested] = useState(false);
  const [matMessage, setMatMessage] = useState("");

  // Sync window light with dusk time changes, but let users override
  useEffect(() => {
    setWindowLit(timeOfDay === "dusk");
  }, [timeOfDay]);

  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % GREETINGS.length), 5200);
    return () => clearInterval(t);
  }, []);

  const handleKnock = () => {
    play("rustle");
    setKnocks((k) => k + 1);
  };

  const handleAddSmoke = () => {
    play("pop");
    const newPuff = {
      id: Date.now() + Math.random(),
      size: 6 + Math.random() * 8,
      drift: -40 + Math.random() * 80,
    };
    setSmokePuffs((prev) => [...prev, newPuff]);
  };

  const handleMatClick = () => {
    if (matHarvested) return;
    play("rustle");
    setMatShaking(true);
    setTimeout(() => setMatShaking(false), 300);

    if (!matOpened) {
      setMatOpened(true);
      setMatMessage("Look! There is a tiny glowing seed hidden underneath the welcome mat...");
    }
  };

  const handleHarvestMatItem = () => {
    play("chime");
    addInventoryItem("clover", 1);
    setMatHarvested(true);
    setMatMessage("You picked up a sleepy clover seed! Added to your Greenhouse inventory.");
    setTimeout(() => setMatMessage(""), 5000);
  };

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
              to="/garden"
              onClick={() => play("pop")}
              className="focus-visible:ring-ring rounded-full wobble-border bg-primary px-6 py-3 font-semibold text-primary-foreground shadow-[var(--shadow-cozy)] transition hover:-translate-y-1 focus-visible:ring-2 focus-visible:outline-none cursor-pointer"
            >
              Follow the path inside
            </Link>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 120, damping: 12 }}
          className="relative mx-auto w-full max-w-md"
        >
          <CottageArt
            lit={windowLit}
            knocks={knocks}
            smokePuffs={smokePuffs}
            matShaking={matShaking}
            matOpened={matOpened}
            matHarvested={matHarvested}
            onKnock={handleKnock}
            onWindowToggle={() => {
              play("click");
              setWindowLit((l) => !l);
            }}
            onAddSmoke={handleAddSmoke}
            onMatClick={handleMatClick}
            onHarvestMatItem={handleHarvestMatItem}
          />
          <AnimatePresence>
            {knocks >= 3 && (
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="paper wobble-border font-hand mt-3 rounded-xl px-3 py-2 text-center text-xl"
              >
                🐌 A snail answered the door. He says hello and asks for lettuce.
              </motion.p>
            )}
            {matMessage && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="paper wobble-border font-hand mt-3 rounded-xl px-3 py-2 text-center text-xl flex flex-col items-center gap-2"
              >
                <p>{matMessage}</p>
                {matOpened && !matHarvested && (
                  <button
                    type="button"
                    onClick={handleHarvestMatItem}
                    className="px-3 py-1 bg-honey text-bark font-semibold rounded-full text-sm hover:-translate-y-0.5 transition cursor-pointer"
                  >
                    ☘️ Collect Seed
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </section>

      <section aria-labelledby="rooms" className="pt-4">
        <h2 id="rooms" className="font-hand text-4xl">
          Six doors, wander wherever you like
        </h2>
        <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {DOORS.map((d, idx) => (
            <motion.li
              key={d.to}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.06 * idx, type: "spring", stiffness: 160, damping: 14 }}
              whileHover={{ y: -6, rotate: idx % 2 ? 1.2 : -1.2 }}
            >
              <Link
                to={d.to}
                onClick={() => play("flip")}
                className="focus-visible:ring-ring paper wobble-border block h-full rounded-2xl p-4 focus-visible:ring-2 focus-visible:outline-none"
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

interface CottageArtProps {
  lit: boolean;
  knocks: number;
  smokePuffs: SmokePuff[];
  matShaking: boolean;
  matOpened: boolean;
  matHarvested: boolean;
  onKnock: () => void;
  onWindowToggle: () => void;
  onAddSmoke: () => void;
  onMatClick: () => void;
  onHarvestMatItem: () => void;
}

function CottageArt({
  lit,
  knocks,
  smokePuffs,
  matShaking,
  matOpened,
  matHarvested,
  onKnock,
  onWindowToggle,
  onAddSmoke,
  onMatClick,
  onHarvestMatItem,
}: CottageArtProps) {
  return (
    <svg
      viewBox="0 0 400 320"
      className="w-full drop-shadow-[0_18px_28px_rgba(0,0,0,0.18)]"
      role="img"
      aria-label="A hand-drawn stone cottage with a mossy roof, round door, welcoming mat and smoking chimney"
    >
      <title>A hand-drawn stone cottage with a mossy roof, round door and smoking chimney</title>

      {/* Chimney smoke */}
      <g className="animate-steam" style={{ transformOrigin: "300px 70px" }}>
        <circle cx="300" cy="70" r="9" fill="oklch(1 0 0 / 0.6)" />
      </g>
      {smokePuffs.map((p) => (
        <motion.circle
          key={p.id}
          cx={300}
          cy={70}
          r={p.size}
          fill="oklch(1 0 0 / 0.55)"
          initial={{ y: 0, x: 0, opacity: 0.8, scale: 0.7 }}
          animate={{ y: -80, x: p.drift, opacity: 0, scale: 1.9 }}
          transition={{ duration: 2.5, ease: "easeOut" }}
        />
      ))}

      {/* Chimney */}
      <g
        onClick={onAddSmoke}
        role="button"
        aria-label="Stoke the chimney"
        className="cursor-pointer"
      >
        <rect
          x="288"
          y="78"
          width="26"
          height="44"
          rx="4"
          fill="var(--rose)"
          stroke="var(--bark)"
          strokeWidth="4"
        />
      </g>

      {/* Roof */}
      <path
        d="M60 150c-4-16 30-52 78-64 12-3 22-3 34 0 46 12 78 46 74 64z"
        fill="var(--sage)"
        stroke="var(--bark)"
        strokeWidth="5"
        strokeLinejoin="round"
      />

      {/* Walls */}
      <path
        d="M64 150h182c6 60 2 96-6 100H72c-8-6-12-42-8-100z"
        fill="var(--parchment)"
        stroke="var(--bark)"
        strokeWidth="5"
        strokeLinejoin="round"
      />

      {/* Interactive Window */}
      <g
        onClick={onWindowToggle}
        role="button"
        aria-label="Toggle window light"
        className="cursor-pointer"
      >
        <rect
          x="88"
          y="176"
          width="46"
          height="40"
          rx="6"
          fill={lit ? "var(--honey)" : "oklch(0.85 0.06 220 / 0.85)"}
          stroke="var(--bark)"
          strokeWidth="4"
        />
        <path d="M111 176v40M88 196h46" stroke="var(--bark)" strokeWidth="3" />
        {lit && (
          // warm window light reflection glow
          <polygon
            points="88,216 68,260 154,260 134,216"
            fill="var(--honey)"
            opacity="0.15"
            className="pointer-events-none"
          />
        )}
      </g>

      {/* Door */}
      <g
        onClick={onKnock}
        role="button"
        tabIndex={0}
        aria-label="Knock on the cottage door"
        className="cursor-pointer"
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onKnock();
          }
        }}
      >
        <path
          d="M164 250v-38c0-16 12-26 26-26s26 10 26 26v38z"
          fill="var(--secondary)"
          stroke="var(--bark)"
          strokeWidth="5"
        />
        <circle cx="206" cy="228" r="4" fill="var(--bark)" />
        {knocks > 0 && (
          <circle cx="190" cy="200" r={4 + knocks} fill="var(--honey)" opacity="0.5" />
        )}
      </g>

      {/* Ground Line */}
      <path d="M40 250h320" stroke="var(--bark)" strokeWidth="5" strokeLinecap="round" />

      {/* Welcome Mat (Interactive seed spot!) */}
      <g onClick={onMatClick} className="cursor-pointer" role="button" aria-label="Welcome mat">
        <motion.g
          animate={matShaking ? { rotate: [-2, 2, -2, 2, 0], y: [-1, 1, -1, 0] } : {}}
          transition={{ duration: 0.25 }}
          style={{ transformOrigin: "200px 252px" }}
        >
          {/* mat backing */}
          <path
            d="M165 249h50v6h-50z"
            fill="var(--bark)"
            stroke="var(--bark)"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          {/* mat center */}
          <path d="M168 250h44v3h-44z" fill="var(--parchment)" />
        </motion.g>
      </g>

      {/* Seed revealed under the mat */}
      {matOpened && !matHarvested && (
        <g
          onClick={onHarvestMatItem}
          role="button"
          aria-label="Collect seed"
          className="cursor-pointer"
        >
          <circle cx="190" cy="257" r="3.5" fill="var(--honey)" className="animate-twinkle" />
          <path d="M188 259c1-2 2-2 3 0" stroke="var(--sage)" strokeWidth="1" />
        </g>
      )}

      {/* Swaying flowers */}
      {[50, 78, 300, 330, 356].map((x, i) => (
        <g
          key={x}
          className="animate-sway"
          style={{ animationDelay: `${i * 0.6}s`, transformOrigin: `${x}px 250px` }}
        >
          <path d={`M${x} 250v-22`} stroke="var(--sage)" strokeWidth="4" strokeLinecap="round" />
          <circle
            cx={x}
            cy={224}
            r="7"
            fill={i % 2 ? "var(--rose)" : "var(--honey)"}
            stroke="var(--bark)"
            strokeWidth="3"
          />
        </g>
      ))}
    </svg>
  );
}
