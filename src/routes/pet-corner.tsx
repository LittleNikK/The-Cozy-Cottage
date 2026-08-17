import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { Room } from "@/components/cottage/CottageChrome";
import { Fox, type FoxMood, type FoxAccessory } from "@/components/cottage/Fox";
import { useCottage, spring } from "@/lib/cottage";

export const Route = createFileRoute("/pet-corner")({
  head: () => ({
    meta: [
      { title: "Pet Corner — Meet Pip | The Cozy Cottage" },
      {
        name: "description",
        content:
          "Feed, pet and play with Pip the fox in a little hand-drawn diorama with a firefly mood jar.",
      },
      { property: "og:title", content: "Pet Corner — Meet Pip" },
      {
        property: "og:description",
        content: "A virtual cottage companion who blinks, yawns and swishes his tail.",
      },
    ],
  }),
  component: PetCorner,
});

const ACCESSORY_DETAILS: Record<FoxAccessory, { name: string; emoji: string; desc: string }> = {
  none: { name: "No Accessory", emoji: "🦊", desc: "Just Pip, in his natural coat." },
  scarf: { name: "Cozy Scarf", emoji: "🧣", desc: "A red woolly scarf knitted by the hearth." },
  crown: { name: "Daisy Crown", emoji: "👑", desc: "A delicate ring of fresh meadow flowers." },
  coat: { name: "Rain Coat", emoji: "🧥", desc: "A bright yellow coat for splashing in puddles." },
  hat: { name: "Starry Hat", emoji: "🧙", desc: "A pointed wizard hat that smells of stardust." },
};

function PetCorner() {
  const {
    play,
    inventory,
    addInventoryItem,
    removeInventoryItem,
    pipAccessory,
    setPipAccessory,
    pipEnergy,
    setPipEnergy,
    unlockedAccessories,
    unlockAccessory,
  } = useCottage();

  const [mood, setMood] = useState<FoxMood>("calm");
  const [sparkles, setSparkles] = useState<{ id: number; x: number; icon: string }[]>([]);
  const [say, setSay] = useState("Pip is watching a beetle cross the path.");

  // Foraging game states
  const [foragingActive, setForagingActive] = useState(false);
  const [foragingStep, setForagingStep] = useState<"intro" | "search" | "loot">("intro");
  const [foragingCooldown, setForagingCooldown] = useState(false);
  const [bushes, setBushes] = useState<
    { id: number; shook: boolean; loot: { type: string; label: string; icon: string } }[]
  >([]);
  const [foundLoot, setFoundLoot] = useState<{ type: string; label: string; icon: string }[]>([]);

  // Slow energy decay over time
  useEffect(() => {
    const t = setInterval(() => {
      setPipEnergy((e) => Math.max(1, e - 1));
      setMood((m) => (m === "excited" ? "happy" : m === "happy" ? "calm" : "sleepy"));
    }, 18000);
    return () => clearInterval(t);
  }, [setPipEnergy]);

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
    if (kind === "feed") {
      // Deduct berry
      if (inventory.berries < 1) {
        play("rustle");
        setSay("Oh! You don't have any berries left in your pocket. Go forage in the forest!");
        return;
      }
      removeInventoryItem("berries", 1);
      play("pop");
      setMood("happy");
      setPipEnergy((e) => Math.min(10, e + 3));
      burst("🫐");
      setSay("Pip crunches a berry and does a tiny happy stomp.");
    } else if (kind === "pet") {
      play("pop");
      setMood("shy");
      setPipEnergy((e) => Math.min(10, e + 1));
      burst("💗");
      setSay("Pip squeaks, hides his nose, then leans right back in.");
    } else {
      // play
      if (pipEnergy <= 2) {
        play("rustle");
        setSay("Pip is too tired to chase leaves right now. Feed him or let him rest.");
        setMood("sleepy");
        return;
      }
      play("chirp");
      setMood("excited");
      setPipEnergy((e) => Math.max(1, e - 2));
      burst("🍃");

      // Random chance of catching a firefly
      if (Math.random() > 0.6) {
        addInventoryItem("fireflies", 1);
        setSay("Success! Pip pounces on a leaf and catches a glowing firefly for your jar!");
      } else {
        setSay("Pip pounces on a leaf and misses. Twice. But he looks pleased.");
      }
    }
  };

  // Foraging logic
  const startForaging = () => {
    if (foragingCooldown) return;
    play("rustle");
    setForagingActive(true);
    setForagingStep("intro");
    setFoundLoot([]);

    // Populate 3 random bushes
    const lootPool = [
      { type: "berry", label: "Sweet Berries", icon: "🫐" },
      { type: "berry", label: "Sweet Berries", icon: "🫐" },
      { type: "firefly", label: "Firefly", icon: "💡" },
      { type: "clover", label: "Clover Seed", icon: "☘️" },
    ];

    // Check if there are accessories to unlock
    const locked = (["scarf", "crown", "coat", "hat"] as FoxAccessory[]).filter(
      (a) => !unlockedAccessories.includes(a),
    );

    const activeBushes = Array.from({ length: 3 }, (_, i) => {
      let lootItem = lootPool[Math.floor(Math.random() * lootPool.length)]!;

      // 30% chance of finding an accessory if there are locked ones
      if (i === 1 && locked.length > 0 && Math.random() > 0.65) {
        const item = locked[Math.floor(Math.random() * locked.length)]!;
        lootItem = { type: "accessory", label: ACCESSORY_DETAILS[item].name, icon: "🎁" };
      }

      return {
        id: i,
        shook: false,
        loot: lootItem,
      };
    });

    setBushes(activeBushes);
  };

  const handleBushClick = (id: number) => {
    play("rustle");
    setBushes((prev) =>
      prev.map((b) => {
        if (b.id === id) {
          if (b.shook) return b;
          // Add to loot list
          setFoundLoot((l) => [...l, b.loot]);
          return { ...b, shook: true };
        }
        return b;
      }),
    );
  };

  const finishForaging = () => {
    play("chime");

    // Claim items
    foundLoot.forEach((loot) => {
      if (loot.type === "berry") {
        addInventoryItem("berries", 3);
      } else if (loot.type === "firefly") {
        addInventoryItem("fireflies", 1);
      } else if (loot.type === "clover") {
        addInventoryItem("clover", 1);
      } else if (loot.type === "accessory") {
        // Find which accessory matches the label
        const acc = (["scarf", "crown", "coat", "hat"] as FoxAccessory[]).find(
          (a) => ACCESSORY_DETAILS[a].name === loot.label,
        );
        if (acc) {
          unlockAccessory(acc);
        }
      }
    });

    setForagingActive(false);
    setForagingCooldown(true);
    setSay("Pip comes trotting back from the trees, dropping the items into your pocket!");

    // Cooldown 15 seconds
    setTimeout(() => {
      setForagingCooldown(false);
    }, 15000);
  };

  return (
    <Room title="pet">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-hand text-5xl">The Pet Corner</h1>
          <p className="max-w-prose text-muted-foreground">
            Pip lives here between the pond and the plant pots. Play with him, customize his
            outfits, or send him foraging.
          </p>
        </div>
        <button
          type="button"
          disabled={foragingCooldown}
          onClick={startForaging}
          className={`px-5 py-2.5 rounded-full wobble-border font-semibold shadow-sm hover:-translate-y-0.5 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
            foragingCooldown ? "bg-card text-muted-foreground border-bark/20" : "bg-honey text-bark"
          }`}
        >
          {foragingCooldown ? "Pip is resting (forest cooldown)..." : "🍂 Send Pip Foraging"}
        </button>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        {/* Left Card: Diorama & Interaction */}
        <div className="paper wobble-border relative overflow-hidden rounded-3xl p-6 min-h-[360px]">
          {/* Diorama Background */}
          <svg viewBox="0 0 400 200" className="absolute inset-x-0 bottom-0 w-full" aria-hidden>
            <ellipse cx="200" cy="190" rx="220" ry="60" fill="var(--sage-light)" />
            <ellipse
              cx="86"
              cy="168"
              rx="52"
              ry="18"
              fill="oklch(0.82 0.06 220)"
              stroke="var(--bark)"
              strokeWidth="3"
            />
            <g className="animate-sway">
              <path d="M330 180v-40" stroke="var(--bark)" strokeWidth="5" strokeLinecap="round" />
              <circle
                cx="330"
                cy="132"
                r="16"
                fill="var(--rose)"
                stroke="var(--bark)"
                strokeWidth="3"
              />
            </g>
            <path
              d="M348 182h40l-6 16h-28z"
              fill="var(--secondary)"
              stroke="var(--bark)"
              strokeWidth="3"
            />
          </svg>

          {/* Sparkles & Mascot drawing */}
          <div className="relative flex min-h-[290px] items-end justify-center">
            <AnimatePresence>
              {sparkles.map((s) => (
                <motion.span
                  key={s.id}
                  initial={{ opacity: 0, y: 0, x: s.x }}
                  animate={{ opacity: 1, y: -90, x: s.x * 1.3 }}
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
              <Fox
                mood={mood}
                size={230}
                accessory={pipAccessory}
                title={`Pip the fox, feeling ${mood}`}
              />
            </motion.div>
          </div>

          <p className="font-hand relative mt-3 text-center text-2xl" aria-live="polite">
            “{say}”
          </p>
        </div>

        {/* Right Column: Energy meter, Action Buttons, Closet */}
        <div className="space-y-4">
          <div className="paper wobble-border rounded-3xl p-5">
            <h2 className="font-hand text-3xl">Firefly jar</h2>
            <p className="text-sm text-muted-foreground">Pip's energy, one firefly at a time.</p>
            <FireflyJar level={pipEnergy} />
          </div>

          {/* Play/Feed Actions */}
          <div className="paper wobble-border grid gap-2.5 rounded-3xl p-5">
            <h3 className="font-semibold text-sm mb-1 text-muted-foreground">Pet Actions</h3>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => act("feed")}
                className="py-2.5 px-4 rounded-xl border-2 border-bark/30 bg-secondary font-semibold hover:-translate-y-0.5 transition cursor-pointer text-left flex justify-between items-center"
              >
                <span>🫐 Feed Sweet Berries</span>
                <span className="text-xs bg-bark/10 px-2 py-0.5 rounded font-mono">
                  Stock: {inventory.berries}
                </span>
              </button>
              <button
                type="button"
                onClick={() => act("pet")}
                className="py-2.5 px-4 rounded-xl border-2 border-bark/30 bg-secondary font-semibold hover:-translate-y-0.5 transition cursor-pointer text-left"
              >
                <span>🤍 Pet gently</span>
              </button>
              <button
                type="button"
                onClick={() => act("play")}
                disabled={pipEnergy <= 2}
                className="py-2.5 px-4 rounded-xl border-2 border-bark/30 bg-secondary font-semibold hover:-translate-y-0.5 transition cursor-pointer text-left disabled:opacity-40 disabled:cursor-not-allowed flex justify-between items-center"
              >
                <span>🍃 Play chase (Costs energy)</span>
                <span className="text-xs text-muted-foreground">Chance of 💡</span>
              </button>
            </div>
          </div>

          {/* Pip's Closet Dresser */}
          <div className="paper wobble-border rounded-3xl p-5">
            <h2 className="font-hand text-3xl mb-1">Pip's Closet</h2>
            <p className="text-sm text-muted-foreground">
              Equip unlocked outfits found in the forest.
            </p>

            <div className="mt-3 grid grid-cols-2 gap-2">
              {(["none", "scarf", "crown", "coat", "hat"] as FoxAccessory[]).map((acc) => {
                const isUnlocked = unlockedAccessories.includes(acc);
                const info = ACCESSORY_DETAILS[acc];

                return (
                  <button
                    key={acc}
                    type="button"
                    disabled={!isUnlocked}
                    onClick={() => {
                      play("pop");
                      setPipAccessory(acc);
                      setSay(
                        `Pip tries on the ${info.name}. ${acc === "none" ? "He feels light!" : "Looking good!"}`,
                      );
                    }}
                    className={`p-2 rounded-2xl border-2 text-left cursor-pointer transition flex items-center gap-2 ${
                      !isUnlocked
                        ? "border-dashed border-bark/10 opacity-40 cursor-not-allowed bg-bark/5"
                        : pipAccessory === acc
                          ? "border-bark bg-secondary scale-102 font-semibold"
                          : "border-bark/15 bg-card hover:border-bark/30"
                    }`}
                  >
                    <span className="text-2xl" role="img" aria-label={info.name}>
                      {isUnlocked ? info.emoji : "🔒"}
                    </span>
                    <div className="min-w-0">
                      <span className="block text-xs truncate leading-snug">{info.name}</span>
                      <span className="text-[10px] text-muted-foreground block truncate">
                        {isUnlocked ? "Equip" : "Locked"}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Foraging Mini-Game Overlay */}
      <AnimatePresence>
        {foragingActive && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-bark/45 px-4 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="paper wobble-border w-full max-w-xl rounded-3xl p-6 relative overflow-hidden"
            >
              {/* Forest trees background illustration */}
              <div
                aria-hidden
                className="absolute inset-0 bg-gradient-to-b from-sage-light/20 to-sage/40 pointer-events-none"
              />

              <h2 className="font-hand text-4xl mb-1 flex items-center gap-2">
                <span>🍂</span> Foraging in the Ferns
              </h2>

              {foragingStep === "intro" ? (
                <div className="space-y-4 py-4 text-center">
                  <p className="text-lg">
                    Pip is adjusting his whiskers and preparing to sniff out the bushes. What will
                    he discover?
                  </p>

                  <div className="flex justify-center py-2 animate-float">
                    <Fox mood="excited" size={130} accessory={pipAccessory} />
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      play("rustle");
                      setForagingStep("search");
                    }}
                    className="px-6 py-2.5 bg-primary text-primary-foreground font-semibold rounded-full hover:bg-primary/95 transition cursor-pointer text-lg"
                  >
                    🌳 Search the Forest
                  </button>
                </div>
              ) : foragingStep === "search" ? (
                <div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Tap the shaking bushes to see what Pip finds hidden in the roots!
                  </p>

                  <div className="grid grid-cols-3 gap-4 py-8">
                    {bushes.map((bush) => (
                      <div key={bush.id} className="flex flex-col items-center">
                        <motion.button
                          type="button"
                          onClick={() => handleBushClick(bush.id)}
                          animate={!bush.shook ? { rotate: [-2, 2, -2, 2, 0] } : {}}
                          transition={{ repeat: Infinity, duration: 1.5 }}
                          className={`h-24 w-24 rounded-full flex items-center justify-center border-2 transition cursor-pointer ${
                            bush.shook
                              ? "border-bark/10 bg-secondary/40 text-3xl"
                              : "border-bark/30 bg-sage hover:bg-sage/90 text-2xl shadow-sm active:scale-95"
                          }`}
                        >
                          {bush.shook ? bush.loot.icon : "🍃"}
                        </motion.button>
                        <span className="text-xs font-semibold mt-2">
                          {bush.shook ? bush.loot.label : "Shaking Bush"}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end pt-4 border-t border-bark/10">
                    <button
                      type="button"
                      disabled={bushes.some((b) => !b.shook)}
                      onClick={() => setForagingStep("loot")}
                      className="px-5 py-2 bg-primary text-primary-foreground font-semibold rounded-full disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer text-sm"
                    >
                      Retrieve Loot →
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 py-4 text-center">
                  <h3 className="font-hand text-3xl">Loot Gathered!</h3>
                  <p className="text-sm text-muted-foreground">
                    Pip drops his findings. Here is what is added to your pockets:
                  </p>

                  <div className="flex flex-wrap justify-center gap-3 py-3">
                    {foundLoot.map((loot, idx) => (
                      <div
                        key={idx}
                        className="flex flex-col items-center bg-card p-3 rounded-2xl border border-bark/10 min-w-[100px] shadow-sm"
                      >
                        <span className="text-3xl">{loot.icon}</span>
                        <span className="text-xs font-bold mt-1">{loot.label}</span>
                        {loot.type === "berry" && (
                          <span className="text-[10px] text-muted-foreground">+3 Berries</span>
                        )}
                        {loot.type === "accessory" && (
                          <span className="text-[10px] text-rose font-bold">UNLOCKED! 🔓</span>
                        )}
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={finishForaging}
                    className="px-6 py-2.5 bg-honey text-bark font-bold rounded-full hover:scale-102 transition cursor-pointer text-lg"
                  >
                    🐾 Return to Cottage
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
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
        <rect
          x="42"
          y="8"
          width="36"
          height="14"
          rx="4"
          fill="var(--secondary)"
          stroke="var(--bark)"
          strokeWidth="4"
        />
        <path
          d="M30 30h60c8 26 8 88 0 118H30c-8-30-8-92 0-118z"
          fill="oklch(0.9 0.04 200 / 0.45)"
          stroke="var(--bark)"
          strokeWidth="4"
        />
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
