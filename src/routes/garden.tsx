import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { useState, useEffect } from "react";
import { Room } from "@/components/cottage/CottageChrome";
import { useCottage, type PotState } from "@/lib/cottage";

export const Route = createFileRoute("/garden")({
  head: () => ({
    meta: [
      { title: "The Greenhouse Garden — Plant & Grow | The Cozy Cottage" },
      {
        name: "description",
        content:
          "A warm, sunlit greenhouse where you can plant seeds, water pots with a copper can, and harvest lavender and sunflowers.",
      },
      { property: "og:title", content: "The Greenhouse Garden — Plant & Grow" },
      {
        property: "og:description",
        content: "Water clay pots and watch flowers bloom in a cozy cottage greenhouse.",
      },
    ],
  }),
  component: Garden,
});

type WaterDrip = {
  id: number;
  x: number;
  y: number;
};

function Garden() {
  const { play, gardenState, updatePot, inventory, removeInventoryItem, addInventoryItem } =
    useCottage();
  const [wateringCanActive, setWateringCanActive] = useState(false);
  const [drips, setDrips] = useState<Record<number, WaterDrip[]>>({});
  const [plantingPotId, setPlantingPotId] = useState<number | null>(null);

  // Growth tick timer - slowly grows watered plants
  useEffect(() => {
    const interval = setInterval(() => {
      gardenState.forEach((pot) => {
        if (pot.seed && pot.watered && pot.growth < 100) {
          // Increase growth
          const nextGrowth = Math.min(100, pot.growth + 10);
          updatePot(pot.id, {
            growth: nextGrowth,
            // Dry out the soil once it reaches the next major stage
            watered: nextGrowth % 30 !== 0,
          });
        }
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [gardenState, updatePot]);

  const handleWaterPot = (id: number) => {
    const pot = gardenState.find((p) => p.id === id);
    if (!pot || !pot.seed || pot.growth >= 100) return;

    play("splish");

    // Trigger water drips
    const newDrips = Array.from({ length: 6 }, (_, i) => ({
      id: Date.now() + i,
      x: -15 + i * 6 + Math.random() * 4,
      y: 0,
    }));
    setDrips((prev) => ({ ...prev, [id]: newDrips }));

    // Update growth
    updatePot(id, {
      watered: true,
      growth: Math.min(100, pot.growth + 20),
    });

    // Clear drips
    setTimeout(() => {
      setDrips((prev) => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
    }, 1200);
  };

  const handlePlantSeed = (
    potId: number,
    seedType: "lavender" | "sunflower" | "daisy" | "clover",
  ) => {
    // Deduct clover seed if chosen
    if (seedType === "clover") {
      const success = removeInventoryItem("clover", 1);
      if (!success) {
        alert(
          "You don't have any Clover seeds! Search under the welcome mat or let Pip go foraging.",
        );
        return;
      }
    }

    play("rustle");
    updatePot(potId, {
      seed: seedType,
      growth: 10,
      watered: false,
    });
    setPlantingPotId(null);
  };

  const handleHarvest = (id: number, seed: string) => {
    play("chime");
    addInventoryItem(seed as keyof typeof inventory, 1);
    updatePot(id, {
      seed: null,
      growth: 0,
      watered: false,
    });
  };

  return (
    <Room title="garden">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-hand text-5xl">The Greenhouse</h1>
          <p className="max-w-prose text-muted-foreground">
            A sunlit sanctuary. Select the watering can to nourish the soil, or click a pot to plant
            seeds. Harvested flowers go to your pocket!
          </p>
        </div>

        {/* Watering Can Toggle button */}
        <button
          type="button"
          onClick={() => {
            play("pop");
            setWateringCanActive((a) => !a);
          }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full wobble-border font-semibold transition cursor-pointer shadow-sm ${
            wateringCanActive
              ? "bg-primary text-primary-foreground scale-102"
              : "bg-card text-foreground border-bark/30 hover:border-bark/50 hover:bg-card/90"
          }`}
        >
          <span>🚿</span>
          {wateringCanActive ? "Putting Watering Can away..." : "Use Watering Can"}
        </button>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.5fr_1fr]">
        {/* Left Column: Garden Shelf & Pots */}
        <div className="relative paper wobble-border rounded-3xl p-6 min-h-[30rem] flex flex-col justify-end bg-card/60">
          {/* Glass panes background detail */}
          <div
            aria-hidden
            className="absolute inset-0 opacity-15 pointer-events-none"
            style={{
              backgroundImage:
                "linear-gradient(45deg, var(--bark) 1px, transparent 1px), linear-gradient(-45deg, var(--bark) 1px, transparent 1px)",
              backgroundSize: "60px 100px",
            }}
          />

          {/* Sunbeams overlay */}
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-tr from-transparent via-honey/10 to-honey/5 pointer-events-none"
          />

          {/* Wooden Shelf Diorama */}
          <div className="relative z-10 grid grid-cols-2 gap-x-12 gap-y-16 pb-12">
            {gardenState.map((pot) => (
              <div key={pot.id} className="relative flex flex-col items-center justify-end h-56">
                {/* Drips animation */}
                {drips[pot.id] && (
                  <div className="absolute top-8 pointer-events-none flex flex-col items-center z-20">
                    {drips[pot.id]?.map((d) => (
                      <motion.circle
                        key={d.id}
                        cx={d.x}
                        cy={d.y}
                        r="2.5"
                        fill="oklch(0.65 0.1 220)"
                        initial={{ y: 0, opacity: 0.9 }}
                        animate={{ y: 55, opacity: 0 }}
                        transition={{ duration: 0.9, ease: "easeIn" }}
                        className="absolute"
                      />
                    ))}
                  </div>
                )}

                {/* Plant drawing */}
                <div className="mb-[-10px] z-10 flex items-center justify-center min-h-[100px]">
                  {pot.seed && (
                    <motion.div
                      initial={{ scale: 0.8, y: 10 }}
                      animate={{ scale: 1, y: 0 }}
                      className="cursor-pointer"
                      onClick={() => {
                        if (pot.growth >= 100) {
                          handleHarvest(pot.id, pot.seed!);
                        } else if (wateringCanActive) {
                          handleWaterPot(pot.id);
                        }
                      }}
                    >
                      <PlantRenderer seed={pot.seed} growth={pot.growth} />
                    </motion.div>
                  )}
                </div>

                {/* Clay Pot */}
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    if (wateringCanActive && pot.seed) {
                      handleWaterPot(pot.id);
                    } else if (!pot.seed) {
                      play("pop");
                      setPlantingPotId(pot.id);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      if (!pot.seed) setPlantingPotId(pot.id);
                    }
                  }}
                  className={`w-32 relative cursor-pointer group transition-transform hover:scale-102 ${
                    wateringCanActive && pot.seed ? "active:scale-98" : ""
                  }`}
                  aria-label={`Clay pot ${pot.id}. ${
                    pot.seed
                      ? `${pot.seed} is growing, stage ${Math.floor(pot.growth)}%`
                      : "Empty soil"
                  }`}
                >
                  <svg viewBox="0 0 100 60" className="w-full">
                    {/* Dirt soil */}
                    <ellipse
                      cx="50"
                      cy="8"
                      rx="38"
                      ry="8"
                      fill={pot.watered ? "oklch(0.25 0.04 60)" : "oklch(0.38 0.04 60)"}
                    />
                    {/* Pot body */}
                    <path
                      d="M10 6 L90 6 L80 54 L20 54 Z"
                      fill="oklch(0.68 0.1 42)"
                      stroke="var(--bark)"
                      strokeWidth="4"
                      strokeLinejoin="round"
                    />
                    {/* Rim */}
                    <rect
                      x="6"
                      y="2"
                      width="88"
                      height="6"
                      rx="2"
                      fill="oklch(0.72 0.11 44)"
                      stroke="var(--bark)"
                      strokeWidth="3"
                    />
                  </svg>

                  {/* Status Indicator */}
                  <div className="absolute inset-x-0 bottom-2 text-center pointer-events-none">
                    {pot.seed ? (
                      <span className="bg-bark/85 text-cream px-2 py-0.5 rounded-full text-xs font-semibold">
                        {pot.growth >= 100
                          ? "Harvest! 🌻"
                          : `${pot.growth}% ${pot.watered ? "💦" : "🌱"}`}
                      </span>
                    ) : (
                      <span className="bg-bark/30 text-cream px-2 py-0.5 rounded-full text-xs font-semibold group-hover:bg-bark/60">
                        Plant Seed +
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Wooden Shelf plank */}
          <div className="absolute bottom-6 left-0 right-0 h-4 bg-bark/80 border-t-2 border-bark/95 rounded-sm z-0" />
        </div>

        {/* Right Column: Inventory & Seed planting options */}
        <div className="space-y-6">
          {/* Seed Shop / Inventory Card */}
          <div className="paper wobble-border rounded-3xl p-5">
            <h2 className="font-hand text-3xl">Greenhouse Seeds</h2>
            <p className="text-sm text-muted-foreground">
              Select a pot to plant one of these seeds.
            </p>

            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between p-3 bg-card/60 rounded-2xl border border-bark/10">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🪻</span>
                  <div>
                    <h3 className="font-bold text-lg">Lavender Seed</h3>
                    <p className="text-xs text-muted-foreground">
                      Brews into relaxing Lavender Steamed Milk.
                    </p>
                  </div>
                </div>
                <span className="bg-sage/20 text-sage px-3 py-1 rounded-full text-xs font-bold">
                  Infinite
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-card/60 rounded-2xl border border-bark/10">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🌻</span>
                  <div>
                    <h3 className="font-bold text-lg">Sunflower Seed</h3>
                    <p className="text-xs text-muted-foreground">
                      Spreads golden cheer across the scrapbook wall.
                    </p>
                  </div>
                </div>
                <span className="bg-sage/20 text-sage px-3 py-1 rounded-full text-xs font-bold">
                  Infinite
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-card/60 rounded-2xl border border-bark/10">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🌼</span>
                  <div>
                    <h3 className="font-bold text-lg">Daisy Seed</h3>
                    <p className="text-xs text-muted-foreground">
                      A cheerful white flower with a golden honey center.
                    </p>
                  </div>
                </div>
                <span className="bg-sage/20 text-sage px-3 py-1 rounded-full text-xs font-bold">
                  Infinite
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-card/60 rounded-2xl border border-bark/10">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">☘️</span>
                  <div>
                    <h3 className="font-bold text-lg">Witch's Clover Seed</h3>
                    <p className="text-xs text-muted-foreground">
                      Rare. Search the welcome mat or go foraging.
                    </p>
                  </div>
                </div>
                <span className="bg-honey/20 text-bark px-3 py-1 rounded-full text-xs font-bold font-hand text-sm">
                  Pocket: {inventory.clover}
                </span>
              </div>
            </div>
          </div>

          {/* Watering Guide */}
          <div className="paper wobble-border rounded-3xl p-5 bg-honey/10">
            <h2 className="font-hand text-2xl">Greenhouse Guide</h2>
            <ul className="mt-2 space-y-2 text-sm text-bark list-disc pl-4 leading-snug">
              <li>Pots must be **watered** (💦) to grow. If the soil dries, growth stops.</li>
              <li>Hovering or clicking a pot with the Watering Can selected will water it.</li>
              <li>Watering increases growth instantly by 20%, and keeps the soil damp.</li>
              <li>Once growth hits 100%, click the plant to **Harvest** it directly!</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Plant Seed Modal */}
      <AnimatePresence>
        {plantingPotId !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-bark/40 px-4 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="paper wobble-border w-full max-w-sm rounded-3xl p-5 relative"
            >
              <button
                type="button"
                onClick={() => setPlantingPotId(null)}
                className="absolute right-4 top-4 font-bold text-bark hover:scale-110 transition cursor-pointer text-lg"
              >
                ✖️
              </button>
              <h2 className="font-hand text-3xl mb-3">Plant a seed in Pot {plantingPotId}</h2>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => handlePlantSeed(plantingPotId, "lavender")}
                  className="w-full text-left p-3 rounded-2xl bg-card hover:bg-secondary border border-bark/10 transition flex items-center gap-3 font-semibold cursor-pointer"
                >
                  <span className="text-2xl">🪻</span>
                  Plant Lavender Seed
                </button>
                <button
                  type="button"
                  onClick={() => handlePlantSeed(plantingPotId, "sunflower")}
                  className="w-full text-left p-3 rounded-2xl bg-card hover:bg-secondary border border-bark/10 transition flex items-center gap-3 font-semibold cursor-pointer"
                >
                  <span className="text-2xl">🌻</span>
                  Plant Sunflower Seed
                </button>
                <button
                  type="button"
                  onClick={() => handlePlantSeed(plantingPotId, "daisy")}
                  className="w-full text-left p-3 rounded-2xl bg-card hover:bg-secondary border border-bark/10 transition flex items-center gap-3 font-semibold cursor-pointer"
                >
                  <span className="text-2xl">🌼</span>
                  Plant Daisy Seed
                </button>
                <button
                  type="button"
                  disabled={inventory.clover < 1}
                  onClick={() => handlePlantSeed(plantingPotId, "clover")}
                  className="w-full text-left p-3 rounded-2xl bg-card hover:bg-secondary border border-bark/10 transition flex items-center gap-3 font-semibold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <span className="text-2xl">☘️</span>
                  Plant Clover Seed (Stock: {inventory.clover})
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </Room>
  );
}

function PlantRenderer({ seed, growth }: { seed: string; growth: number }) {
  // Sprout stage (growth < 30)
  if (growth < 30) {
    return (
      <svg viewBox="0 0 60 60" className="h-14 w-14">
        {/* Soil mound */}
        <path
          d="M10 50c5-5 35-5 40 0z"
          fill="oklch(0.35 0.04 60)"
          stroke="var(--bark)"
          strokeWidth="1.5"
        />
        {/* Tiny sprout */}
        <path d="M30 50V35" stroke="var(--sage)" strokeWidth="3.5" strokeLinecap="round" />
        <path
          d="M30 38c-3-2-6 0-3 3s6 0 3-3z"
          fill="var(--sage-light)"
          stroke="var(--bark)"
          strokeWidth="1.2"
        />
      </svg>
    );
  }

  // Bud stage (growth < 70)
  if (growth < 70) {
    const budColor =
      seed === "lavender"
        ? "oklch(0.7 0.1 285)"
        : seed === "sunflower"
          ? "var(--honey)"
          : seed === "daisy"
            ? "var(--cream)"
            : "var(--sage-light)";
    return (
      <svg viewBox="0 0 60 80" className="h-20 w-16">
        {/* stem */}
        <path d="M30 70V28" stroke="var(--sage)" strokeWidth="4.2" strokeLinecap="round" />
        <path
          d="M30 45c-6-1-8-3-8-3 0 0 4 4 8 3z"
          fill="var(--sage-light)"
          stroke="var(--bark)"
          strokeWidth="1.5"
        />
        <path
          d="M30 35c6-1 8-3 8-3 0 0-4 4-8 3z"
          fill="var(--sage-light)"
          stroke="var(--bark)"
          strokeWidth="1.5"
        />
        {/* bud */}
        <circle cx="30" cy="24" r="7.5" fill={budColor} stroke="var(--bark)" strokeWidth="2.5" />
      </svg>
    );
  }

  // Blooming stage (growth < 100)
  if (growth < 100) {
    return (
      <motion.div
        animate={{ scale: [0.93, 1, 0.93] }}
        transition={{ repeat: Infinity, duration: 2.2 }}
      >
        <FlowerSVG seed={seed} size={80} fullyGrown={false} />
      </motion.div>
    );
  }

  // Fully grown (growth >= 100) - swaying animation!
  return (
    <motion.div
      className="animate-sway cursor-pointer"
      style={{ transformOrigin: "bottom center" }}
    >
      <FlowerSVG seed={seed} size={105} fullyGrown={true} />
    </motion.div>
  );
}

function FlowerSVG({
  seed,
  size,
  fullyGrown,
}: {
  seed: string;
  size: number;
  fullyGrown: boolean;
}) {
  if (seed === "lavender") {
    return (
      <svg viewBox="0 0 80 120" width={size} height={size + 20} role="img" aria-label="Lavender">
        <path d="M40 100V30" stroke="var(--sage)" strokeWidth="4.5" strokeLinecap="round" />
        {/* Lavender flower buds */}
        {[30, 42, 54, 66].map((y, i) => (
          <g key={y} className="animate-pulse" style={{ animationDelay: `${i * 0.3}s` }}>
            <circle
              cx="33"
              cy={y}
              r="5.5"
              fill="oklch(0.7 0.12 285)"
              stroke="var(--bark)"
              strokeWidth="1.5"
            />
            <circle
              cx="47"
              cy={y}
              r="5.5"
              fill="oklch(0.7 0.12 285)"
              stroke="var(--bark)"
              strokeWidth="1.5"
            />
            <circle
              cx="40"
              cy={y - 4}
              r="4.5"
              fill="oklch(0.6 0.15 285)"
              stroke="var(--bark)"
              strokeWidth="1.2"
            />
          </g>
        ))}
        {fullyGrown && (
          <text
            x="40"
            y="20"
            fontSize="11"
            fill="var(--honey)"
            fontFamily="var(--font-hand)"
            textAnchor="middle"
            className="animate-twinkle"
          >
            ✨
          </text>
        )}
      </svg>
    );
  }

  if (seed === "sunflower") {
    return (
      <svg viewBox="0 0 80 120" width={size} height={size + 20} role="img" aria-label="Sunflower">
        <path d="M40 100V45" stroke="var(--sage)" strokeWidth="5.5" strokeLinecap="round" />
        {/* Leaves */}
        <path
          d="M40 70c-14-3-18-8-18-8 0 0 8 8 18 8z"
          fill="var(--sage)"
          stroke="var(--bark)"
          strokeWidth="1.5"
        />
        <path
          d="M40 60c14-3 18-8 18-8 0 0-8 8-18 8z"
          fill="var(--sage)"
          stroke="var(--bark)"
          strokeWidth="1.5"
        />

        {/* Sunflower head */}
        <g style={{ transformOrigin: "40px 40px" }} className={fullyGrown ? "animate-twinkle" : ""}>
          {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((a) => (
            <ellipse
              key={a}
              cx="40"
              cy="20"
              rx="6"
              ry="16"
              fill="var(--honey)"
              stroke="var(--bark)"
              strokeWidth="1.8"
              transform={`rotate(${a} 40 40)`}
            />
          ))}
          <circle
            cx="40"
            cy="40"
            r="14"
            fill="oklch(0.35 0.04 60)"
            stroke="var(--bark)"
            strokeWidth="2.5"
          />
        </g>
      </svg>
    );
  }

  if (seed === "daisy") {
    return (
      <svg viewBox="0 0 80 120" width={size} height={size + 20} role="img" aria-label="Daisy">
        <path d="M40 100V44" stroke="var(--sage)" strokeWidth="4.5" strokeLinecap="round" />
        {/* Daisy petals */}
        <g style={{ transformOrigin: "40px 40px" }}>
          {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
            <ellipse
              key={a}
              cx="40"
              cy="22"
              rx="6.5"
              ry="14"
              fill="var(--cream)"
              stroke="var(--bark)"
              strokeWidth="1.8"
              transform={`rotate(${a} 40 40)`}
            />
          ))}
          <circle
            cx="40"
            cy="40"
            r="10.5"
            fill="var(--honey)"
            stroke="var(--bark)"
            strokeWidth="2"
          />
        </g>
      </svg>
    );
  }

  // Clover
  return (
    <svg viewBox="0 0 80 120" width={size} height={size + 20} role="img" aria-label="Clover">
      <path d="M40 100V52" stroke="var(--sage)" strokeWidth="4.5" strokeLinecap="round" />
      {/* 4 clover leaves */}
      <g style={{ transformOrigin: "40px 48px" }}>
        {[0, 90, 180, 270].map((a) => (
          <ellipse
            key={a}
            cx="40"
            cy="34"
            rx="10"
            ry="12"
            fill="var(--sage)"
            stroke="var(--bark)"
            strokeWidth="1.8"
            transform={`rotate(${a} 40 48)`}
          />
        ))}
      </g>
    </svg>
  );
}
