import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { Room } from "@/components/cottage/CottageChrome";
import { Fox, type FoxMood } from "@/components/cottage/Fox";
import { useCottage, spring } from "@/lib/cottage";

export const Route = createFileRoute("/pet-corner")({
  head: () => ({
    meta: [
      { title: "Pet Corner — Meet Pip | The Cozy Cottage" },
      {
        name: "description",
        content: "Feed, pet and play with Pip the fox in a little hand-drawn diorama with a firefly mood jar.",
      },
      { property: "og:title", content: "Pet Corner — Meet Pip" },
      { property: "og:description", content: "A virtual cottage companion who blinks, yawns and swishes his tail." },
    ],
  }),
  component: PetCorner,
});

function PetCorner() {
  const { play } = useCottage();
  const [mood, setMood] = useState<FoxMood>("calm");
  const [energy, setEnergy] = useState(5);
  const [sparkles, setSparkles] = useState<{ id: number; x: number; icon: string }[]>([]);
  const [say, setSay] = useState("Pip is watching a beetle cross the path.");

  useEffect(() => {
    const t = setInterval(() => {
      setEnergy((e) => Math.max(1, e - 1));
      setMood((m) => (m === "excited" ? "happy" : m === "happy" ? "calm" : "sleepy"));
    }, 16000);
    return () => clearInterval(t);
  }, []);

  const burst = (icon: string) => {
    const items = Array.from({ length: 6 }, (_, i) => ({
      id: Date.now() + i,
      x: -60 + i * 24,
      icon,
    }));
    setSparkles((s) => [...s, ...items]);
    setTimeout(() => setSparkles((s) => s.slice(items.length)), 1200);
  };

  const act = (kind: "feed" | "pet" | "play") => {
    play(kind === "play" ? "chirp" : "pop");
    if (kind === "feed") {
      setMood("happy");
      setEnergy((e) => Math.min(10, e + 3));
      burst("🫐");
      setSay("Pip crunches a berry and does a tiny happy stomp.");
    } else if (kind === "pet") {
      setMood("shy");
      setEnergy((e) => Math.min(10, e + 1));
      burst("💗");
      setSay("Pip squeaks, hides his nose, then leans right back in.");
    } else {
      setMood("excited");
      setEnergy((e) => Math.max(1, e - 1));
      burst("🍃");
      setSay("Pip pounces on a leaf and misses. Twice.");
    }
  };

  return (
    <Room title="pet">
      <h1 className="font-hand text-5xl">The Pet Corner</h1>
      <p className="max-w-prose text-muted-foreground">
        Pip lives here between the pond and the plant pots. He's real enough to get sleepy.
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="paper relative overflow-hidden rounded-3xl border-2 border-bark/25 p-6">
          {/* diorama */}
          <svg viewBox="0 0 400 200" className="absolute inset-x-0 bottom-0 w-full" aria-hidden>
            <ellipse cx="200" cy="190" rx="220" ry="60" fill="var(--sage-light)" />
            <ellipse cx="86" cy="168" rx="52" ry="18" fill="oklch(0.82 0.06 220)" stroke="var(--bark)" strokeWidth="3" />
            <g className="animate-sway">
              <path d="M330 180v-40" stroke="var(--bark)" strokeWidth="5" strokeLinecap="round" />
              <circle cx="330" cy="132" r="16" fill="var(--rose)" stroke="var(--bark)" strokeWidth="3" />
            </g>
            <path d="M348 182h40l-6 16h-28z" fill="var(--secondary)" stroke="var(--bark)" strokeWidth="3" />
          </svg>

          <div className="relative flex min-h-[300px] items-end justify-center">
            <AnimatePresence>
              {sparkles.map((s) => (
                <motion.span
                  key={s.id}
                  initial={{ opacity: 0, y: 0, x: s.x }}
                  animate={{ opacity: 1, y: -90, x: s.x * 1.4 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.1, ease: "easeOut" }}
                  className="absolute bottom-32 text-2xl"
                  aria-hidden
                >
                  {s.icon}
                </motion.span>
              ))}
            </AnimatePresence>
            <motion.div animate={{ scale: mood === "excited" ? 1.05 : 1 }} transition={spring}>
              <Fox mood={mood} size={230} title={`Pip the fox, feeling ${mood}`} />
            </motion.div>
          </div>

          <p className="font-hand relative mt-2 text-center text-2xl" aria-live="polite">
            {say}
          </p>
        </div>

        <div className="space-y-4">
          <div className="paper rounded-3xl border-2 border-bark/25 p-5">
            <h2 className="font-hand text-3xl">Firefly jar</h2>
            <p className="text-sm text-muted-foreground">Pip's energy, one firefly at a time.</p>
            <FireflyJar level={energy} />
          </div>
          <div className="paper grid gap-3 rounded-3xl border-2 border-bark/25 p-5">
            {(["feed", "pet", "play"] as const).map((k) => (
              <motion.button
                key={k}
                type="button"
                whileTap={{ scale: 0.94 }}
                whileHover={{ y: -3 }}
                onClick={() => act(k)}
                className="focus-visible:ring-ring rounded-2xl border-2 border-bark/30 bg-secondary px-4 py-3 text-lg font-semibold capitalize focus-visible:ring-2 focus-visible:outline-none"
              >
                {k === "feed" ? "🫐 Feed berries" : k === "pet" ? "🤍 Pet gently" : "🍃 Play chase"}
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </Room>
  );
}

function FireflyJar({ level }: { level: number }) {
  return (
    <div
      role="meter"
      aria-valuemin={0}
      aria-valuemax={10}
      aria-valuenow={level}
      aria-label="Pip's energy"
      className="mx-auto mt-3 w-32"
    >
      <svg viewBox="0 0 120 160" className="w-full">
        <rect x="42" y="8" width="36" height="14" rx="4" fill="var(--secondary)" stroke="var(--bark)" strokeWidth="4" />
        <path d="M30 30h60c8 26 8 88 0 118H30c-8-30-8-92 0-118z" fill="oklch(0.9 0.04 200 / 0.45)" stroke="var(--bark)" strokeWidth="4" />
        {Array.from({ length: level }).map((_, i) => (
          <circle
            key={i}
            cx={44 + ((i * 13) % 34)}
            cy={132 - i * 9}
            r="5"
            fill="var(--honey)"
            className="animate-twinkle"
            style={{ animationDelay: `${i * 0.25}s`, filter: "drop-shadow(0 0 6px var(--honey))" }}
          />
        ))}
      </svg>
      <p className="font-hand text-center text-2xl">{level}/10 fireflies</p>
    </div>
  );
}