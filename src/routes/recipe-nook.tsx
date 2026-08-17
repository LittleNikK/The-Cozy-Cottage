import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { Room } from "@/components/cottage/CottageChrome";
import { useCottage, spring } from "@/lib/cottage";

export const Route = createFileRoute("/recipe-nook")({
  head: () => ({
    meta: [
      { title: "Recipe Nook — A Cottagecore Cookbook | The Cozy Cottage" },
      {
        name: "description",
        content:
          "Turn the pages of a hand-drawn cookbook: honey oat scones, nettle soup, plum jam and lavender milk.",
      },
      { property: "og:title", content: "Recipe Nook — A Cottagecore Cookbook" },
      {
        property: "og:description",
        content: "A page-flipping recipe book with steaming mugs and inky herb drawings.",
      },
    ],
  }),
  component: RecipeNookPage,
});

const DEFAULT_RECIPES = [
  {
    title: "Honey Oat Scones",
    time: "25 minutes · makes 8",
    icon: "jar" as const,
    lines: [
      "2 cups oat flour",
      "1/3 cup wildflower honey",
      "cold butter, cubed small",
      "a splash of buttermilk",
    ],
    note: "Bake until the tops look like little sunlit stones.",
  },
  {
    title: "Nettle & Potato Soup",
    time: "40 minutes · serves 4",
    icon: "herb" as const,
    lines: [
      "a basket of young nettles (gloves!)",
      "3 waxy potatoes",
      "one soft onion",
      "cream, if the day is grey",
    ],
    note: "Tastes like the first warm week of spring.",
  },
  {
    title: "Slow Plum Jam",
    time: "2 hours · 3 jars",
    icon: "jar" as const,
    lines: [
      "1kg dark plums, halved",
      "600g sugar",
      "one strip of lemon peel",
      "a whole star anise",
    ],
    note: "Stir it while you think about nothing in particular.",
  },
  {
    title: "Lavender Steamed Milk",
    time: "8 minutes · one mug",
    icon: "cup" as const,
    lines: [
      "a mug of whole milk",
      "1 tsp dried lavender",
      "half a spoon of honey",
      "the smallest pinch of salt",
    ],
    note: "For evenings the lantern is already lit.",
  },
];

function RecipeNookPage() {
  const { play, customRecipes, addCustomRecipe, inventory, removeInventoryItem } = useCottage();
  const [page, setPage] = useState(0);
  const [dir, setDir] = useState(1);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form states
  const [newTitle, setNewTitle] = useState("");
  const [newTime, setNewTime] = useState("");
  const [newIcon, setNewIcon] = useState<"jar" | "herb" | "cup">("jar");
  const [newIngredients, setNewIngredients] = useState("");
  const [newNote, setNewNote] = useState("");

  // Stove states
  const [stoveState, setStoveState] = useState<"cold" | "heating" | "boiling">("cold");
  const [steamPuffs, setSteamPuffs] = useState<{ id: number; x: number }[]>([]);
  const [brewingTea, setBrewingTea] = useState(false);
  const [hearthMsg, setHearthMsg] = useState("");

  const allRecipes = [...DEFAULT_RECIPES, ...customRecipes];
  const r = allRecipes[page] ?? allRecipes[0]!;

  const go = (d: number) => {
    const next = Math.min(allRecipes.length - 1, Math.max(0, page + d));
    if (next === page) return;
    setDir(d);
    setPage(next);
    play("flip");
  };

  const handleAddRecipeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newIngredients.trim()) return;

    const ingredientsList = newIngredients
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    const recipe = {
      title: newTitle.trim(),
      time: newTime.trim() || "unmeasured",
      icon: newIcon,
      lines: ingredientsList,
      note: newNote.trim() || "Baked with love.",
    };

    addCustomRecipe(recipe);
    setNewTitle("");
    setNewTime("");
    setNewIcon("jar");
    setNewIngredients("");
    setNewNote("");
    setShowAddForm(false);

    // flip to the new recipe page
    setDir(1);
    setPage(allRecipes.length);
  };

  // Stove boiling logic
  const handleStoveClick = () => {
    if (stoveState !== "cold") return;
    setStoveState("heating");
    setHearthMsg("The kettle starts to hiss on the stove...");
    play("rustle");

    setTimeout(() => {
      setStoveState("boiling");
      setHearthMsg("The kettle is whistling! It's boiling hot.");
      play("chime");

      // Spawn periodic steam puffs
      const interval = setInterval(() => {
        setSteamPuffs((p) => [
          ...p,
          { id: Date.now() + Math.random(), x: -10 + Math.random() * 20 },
        ]);
      }, 400);

      // Stop boiling after 7 seconds
      setTimeout(() => {
        clearInterval(interval);
        setStoveState("cold");
        setHearthMsg("");
        setSteamPuffs([]);
      }, 7000);
    }, 3000);
  };

  const handleBrewTea = () => {
    if (inventory.lavender < 1) return;
    if (brewingTea) return;

    play("bubble");
    removeInventoryItem("lavender", 1);
    setBrewingTea(true);
    setHearthMsg("Brewing dried lavender into steaming milk...");

    setTimeout(() => {
      play("chime");
      setBrewingTea(false);
      setHearthMsg("Mmm! A warm mug of Lavender Steamed Milk is ready. Smells wonderful.");
      setTimeout(() => setHearthMsg(""), 5000);
    }, 4000);
  };

  return (
    <Room title="recipes">
      <h1 className="font-hand text-5xl">The Recipe Nook</h1>
      <p className="max-w-prose text-muted-foreground">
        Sticky pages, a ribbon bookmark, and nothing measured too exactly.
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        {/* Left Column: The Cookbook */}
        <div>
          <div className="relative mx-auto max-w-2xl" style={{ perspective: 1600 }}>
            <span
              aria-hidden
              className="absolute -top-4 right-14 z-20 h-24 w-6 rounded-b-md bg-secondary shadow-md"
            />
            <div className="paper wobble-border relative min-h-[28rem] overflow-hidden rounded-3xl p-6 sm:p-10">
              <AnimatePresence mode="wait" initial={false}>
                <motion.article
                  key={page}
                  initial={{ rotateY: dir > 0 ? 80 : -80, opacity: 0 }}
                  animate={{ rotateY: 0, opacity: 1 }}
                  exit={{ rotateY: dir > 0 ? -80 : 80, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 100, damping: 15 }}
                  style={{ transformOrigin: dir > 0 ? "left center" : "right center" }}
                  className="grid gap-6 sm:grid-cols-[1fr_auto]"
                >
                  <div className="min-h-[18rem]">
                    <h2 className="font-hand text-4xl">{r.title}</h2>
                    <p className="text-sm tracking-wide text-muted-foreground uppercase">
                      {r.time}
                    </p>
                    <ul className="mt-4 space-y-2">
                      {r.lines.map((l) => (
                        <li key={l} className="flex items-start gap-2 text-lg">
                          <span
                            aria-hidden
                            className="mt-2 h-2 w-2 shrink-0 rounded-full bg-sage"
                          />
                          {l}
                        </li>
                      ))}
                    </ul>
                    <p className="font-hand mt-5 text-2xl text-muted-foreground">“{r.note}”</p>
                  </div>
                  <div className="flex flex-col justify-start">
                    <Doodle kind={r.icon} />
                  </div>
                </motion.article>
              </AnimatePresence>

              <div className="mt-8 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => go(-1)}
                  disabled={page === 0}
                  className="focus-visible:ring-ring rounded-full border-2 border-bark/30 px-4 py-2 font-semibold disabled:opacity-40 focus-visible:ring-2 focus-visible:outline-none cursor-pointer"
                >
                  ← Previous
                </button>
                <p className="font-hand text-2xl" aria-live="polite">
                  page {page + 1} of {allRecipes.length}
                </p>
                <button
                  type="button"
                  onClick={() => go(1)}
                  disabled={page === allRecipes.length - 1}
                  className="focus-visible:ring-ring rounded-full border-2 border-bark/30 px-4 py-2 font-semibold disabled:opacity-40 focus-visible:ring-2 focus-visible:outline-none cursor-pointer"
                >
                  Next →
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Pocket & Hearth Stove */}
        <div className="space-y-6">
          {/* Inventory Card */}
          <div className="paper wobble-border rounded-3xl p-5">
            <h2 className="font-hand text-3xl">Your Cottage Pocket</h2>
            <p className="text-sm text-muted-foreground">
              Ingredients harvested from your Greenhouse garden.
            </p>
            <div className="mt-3 grid grid-cols-3 gap-2">
              <div className="bg-card/50 p-2 rounded-2xl border border-bark/10 text-center">
                <span className="text-2xl">🪻</span>
                <span className="block text-xs font-semibold text-muted-foreground mt-1">
                  Lavender
                </span>
                <span className="font-hand text-xl font-bold">{inventory.lavender}</span>
              </div>
              <div className="bg-card/50 p-2 rounded-2xl border border-bark/10 text-center">
                <span className="text-2xl">🌻</span>
                <span className="block text-xs font-semibold text-muted-foreground mt-1">
                  Sunflower
                </span>
                <span className="font-hand text-xl font-bold">{inventory.sunflower}</span>
              </div>
              <div className="bg-card/50 p-2 rounded-2xl border border-bark/10 text-center">
                <span className="text-2xl">🌼</span>
                <span className="block text-xs font-semibold text-muted-foreground mt-1">
                  Daisy
                </span>
                <span className="font-hand text-xl font-bold">{inventory.daisy}</span>
              </div>
            </div>
          </div>

          {/* Hearth Stove Card */}
          <div className="paper wobble-border rounded-3xl p-5 relative overflow-hidden">
            <h2 className="font-hand text-3xl">Cozy Hearth & Stove</h2>
            <p className="text-sm text-muted-foreground">
              Click the copper kettle to boil water on the stove.
            </p>

            <div className="relative mt-4 flex justify-center items-end h-40 bg-bark/5 rounded-2xl border border-bark/10 p-4">
              {/* Steam animations */}
              <AnimatePresence>
                {steamPuffs.map((puff) => (
                  <motion.circle
                    key={puff.id}
                    cx={100 + puff.x}
                    cy={70}
                    r={6 + Math.random() * 8}
                    fill="oklch(1 0 0 / 0.45)"
                    initial={{ y: 0, opacity: 0.8, scale: 0.8 }}
                    animate={{ y: -60, x: puff.x * 2.5, opacity: 0, scale: 1.8 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.8, ease: "easeOut" }}
                  />
                ))}
                {brewingTea && (
                  <motion.g
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute top-8 text-3xl"
                  >
                    🪻💨
                  </motion.g>
                )}
              </AnimatePresence>

              {/* Hand-drawn style Kettle Stove illustration */}
              <svg
                viewBox="0 0 160 120"
                className="w-40 cursor-pointer"
                onClick={handleStoveClick}
                role="img"
                aria-label="Click to boil kettle"
              >
                {/* Stove base burner */}
                <rect x="20" y="90" width="120" height="15" rx="3" fill="var(--bark)" />
                <ellipse
                  cx="80"
                  cy="90"
                  rx="30"
                  ry="6"
                  fill={stoveState !== "cold" ? "var(--rose)" : "var(--muted)"}
                />

                {/* Kettle */}
                <g className={stoveState === "boiling" ? "animate-float" : ""}>
                  <path
                    d="M50 86c-4-26 12-42 30-42s34 16 30 42z"
                    fill="oklch(0.65 0.1 50)"
                    stroke="var(--bark)"
                    strokeWidth="3"
                  />
                  <path
                    d="M80 44c8-10 16-10 24-4"
                    fill="none"
                    stroke="var(--bark)"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                  {/* Spout */}
                  <path
                    d="M110 68l16-16-4-4-12 16"
                    fill="oklch(0.65 0.1 50)"
                    stroke="var(--bark)"
                    strokeWidth="3"
                    strokeLinejoin="round"
                  />
                  {/* Lid */}
                  <ellipse cx="80" cy="46" rx="14" ry="4" fill="var(--bark)" />
                  <circle
                    cx="80"
                    cy="40"
                    r="3.5"
                    fill="var(--honey)"
                    stroke="var(--bark)"
                    strokeWidth="1.5"
                  />
                </g>
              </svg>
            </div>

            {hearthMsg && (
              <p
                className="font-hand text-center text-xl mt-3 text-bark animate-pulse"
                aria-live="polite"
              >
                {hearthMsg}
              </p>
            )}

            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={handleStoveClick}
                disabled={stoveState !== "cold"}
                className="flex-1 py-2 px-3 rounded-full border-2 border-bark/30 text-sm font-semibold hover:border-bark bg-secondary cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                🔥 Boil Kettle
              </button>
              <button
                type="button"
                onClick={handleBrewTea}
                disabled={inventory.lavender < 1 || brewingTea}
                className="flex-1 py-2 px-3 rounded-full border-2 border-bark/30 text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/95 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                🪻 Brew Lavender Tea
              </button>
            </div>
          </div>

          {/* Add Recipe Button */}
          <button
            type="button"
            onClick={() => {
              play("pop");
              setShowAddForm(true);
            }}
            className="w-full py-3.5 px-4 rounded-3xl wobble-border bg-honey font-bold text-bark shadow-sm hover:-translate-y-0.5 transition cursor-pointer"
          >
            🪶 Write in your own recipe
          </button>
        </div>
      </div>

      {/* Write Recipe Modal */}
      <AnimatePresence>
        {showAddForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-bark/40 px-4 py-6 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="paper wobble-border w-full max-w-lg rounded-3xl p-6 relative"
            >
              <button
                type="button"
                onClick={() => {
                  play("click");
                  setShowAddForm(false);
                }}
                className="absolute right-4 top-4 font-bold text-bark hover:scale-115 transition cursor-pointer text-xl"
                aria-label="Close"
              >
                ✖️
              </button>

              <h2 className="font-hand text-4xl mb-3">Add to the cookbook</h2>
              <form onSubmit={handleAddRecipeSubmit} className="space-y-3.5">
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block">
                    <span className="font-semibold text-sm">Recipe Title</span>
                    <input
                      required
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="mt-1 w-full rounded-xl border-2 border-bark/20 bg-card px-3 py-1.5 focus:outline-none focus:border-bark"
                      placeholder="e.g. Grandma's Apple Tart"
                    />
                  </label>
                  <label className="block">
                    <span className="font-semibold text-sm">Cooking Time & Portions</span>
                    <input
                      value={newTime}
                      onChange={(e) => setNewTime(e.target.value)}
                      className="mt-1 w-full rounded-xl border-2 border-bark/20 bg-card px-3 py-1.5 focus:outline-none focus:border-bark"
                      placeholder="e.g. 45 minutes · 6 slices"
                    />
                  </label>
                </div>

                <div className="block">
                  <span className="font-semibold text-sm block mb-1">Cookbook Illustration</span>
                  <div className="flex gap-2">
                    {(["jar", "herb", "cup"] as const).map((iconType) => (
                      <button
                        key={iconType}
                        type="button"
                        onClick={() => {
                          play("click");
                          setNewIcon(iconType);
                        }}
                        className={`flex-1 py-1.5 px-3 rounded-xl border-2 text-sm font-semibold capitalize cursor-pointer transition ${
                          newIcon === iconType
                            ? "border-bark bg-secondary"
                            : "border-bark/15 bg-card hover:border-bark/30"
                        }`}
                      >
                        {iconType === "jar" ? "🫙 Jar" : iconType === "herb" ? "🌿 Herb" : "🍵 Cup"}
                      </button>
                    ))}
                  </div>
                </div>

                <label className="block">
                  <span className="font-semibold text-sm">Ingredients (one per line)</span>
                  <textarea
                    required
                    rows={4}
                    value={newIngredients}
                    onChange={(e) => setNewIngredients(e.target.value)}
                    className="mt-1 w-full rounded-xl border-2 border-bark/20 bg-card px-3 py-1.5 focus:outline-none focus:border-bark"
                    placeholder="2 sweet apples&#10;1 sheet pastry&#10;1 spoon honey"
                  />
                </label>

                <label className="block">
                  <span className="font-semibold text-sm">Whimsical Baker's Note</span>
                  <textarea
                    rows={2}
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    className="mt-1 w-full rounded-xl border-2 border-bark/20 bg-card px-3 py-1.5 focus:outline-none focus:border-bark"
                    placeholder="e.g. Serve it warm with cold cream on grey Sundays."
                  />
                </label>

                <div className="flex gap-2 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-4 py-2 rounded-full border-2 border-bark/30 font-semibold cursor-pointer hover:bg-muted text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-full bg-primary text-primary-foreground font-semibold cursor-pointer hover:bg-primary/95 text-sm"
                  >
                    Pin into book
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </Room>
  );
}

function Doodle({ kind }: { kind: "jar" | "herb" | "cup" }) {
  const label =
    kind === "jar"
      ? "A hand-drawn preserving jar"
      : kind === "herb"
        ? "A hand-drawn sprig of herbs"
        : "A hand-drawn steaming teacup";
  return (
    <div className="relative mx-auto w-36 sm:w-40">
      {kind === "cup" && (
        <span
          aria-hidden
          className="animate-steam absolute top-2 left-1/2 h-8 w-4 -translate-x-1/2 rounded-full bg-white/60"
        />
      )}
      <svg viewBox="0 0 120 140" className="w-full" role="img" aria-label={label}>
        <title>{label}</title>
        {kind === "jar" && (
          <>
            <rect
              x="38"
              y="12"
              width="44"
              height="14"
              rx="4"
              fill="var(--secondary)"
              stroke="var(--bark)"
              strokeWidth="4"
            />
            <path
              d="M30 32h60c7 30 7 70 0 96H30c-7-26-7-66 0-96z"
              fill="var(--rose)"
              stroke="var(--bark)"
              strokeWidth="4"
            />
            <path d="M36 78h48" stroke="var(--bark)" strokeWidth="3" strokeDasharray="6 6" />
          </>
        )}
        {kind === "herb" && (
          <>
            <path d="M60 130V26" stroke="var(--bark)" strokeWidth="4" strokeLinecap="round" />
            {[40, 60, 80, 100].map((y, i) => (
              <g key={y}>
                <path
                  d={`M60 ${y}c-18-6-26-16-26-24 12-2 22 8 26 24z`}
                  fill="var(--sage)"
                  stroke="var(--bark)"
                  strokeWidth="3"
                  transform={`translate(0 ${i * 2})`}
                />
                <path
                  d={`M60 ${y + 8}c18-6 26-16 26-24-12-2-22 8-26 24z`}
                  fill="var(--sage-light)"
                  stroke="var(--bark)"
                  strokeWidth="3"
                />
              </g>
            ))}
          </>
        )}
        {kind === "cup" && (
          <>
            <path
              d="M26 56h64c2 34-10 52-32 52S24 90 26 56z"
              fill="var(--cream)"
              stroke="var(--bark)"
              strokeWidth="4"
            />
            <path
              d="M90 66c14-4 20 12 6 20-4 3-8 4-10 3"
              fill="none"
              stroke="var(--bark)"
              strokeWidth="4"
            />
            <path d="M20 116h80" stroke="var(--bark)" strokeWidth="4" strokeLinecap="round" />
            <circle cx="58" cy="76" r="8" fill="var(--honey)" />
          </>
        )}
      </svg>
    </div>
  );
}
