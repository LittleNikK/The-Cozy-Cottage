import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { Room } from "@/components/cottage/CottageChrome";
import { useCottage } from "@/lib/cottage";

export const Route = createFileRoute("/recipe-nook")({
  head: () => ({
    meta: [
      { title: "Recipe Nook — A Cottagecore Cookbook | The Cozy Cottage" },
      {
        name: "description",
        content: "Turn the pages of a hand-drawn cookbook: honey oat scones, nettle soup, plum jam and lavender milk.",
      },
      { property: "og:title", content: "Recipe Nook — A Cottagecore Cookbook" },
      { property: "og:description", content: "A page-flipping recipe book with steaming mugs and inky herb drawings." },
    ],
  }),
  component: RecipeNook,
});

const RECIPES = [
  {
    title: "Honey Oat Scones",
    time: "25 minutes · makes 8",
    icon: "jar" as const,
    lines: ["2 cups oat flour", "1/3 cup wildflower honey", "cold butter, cubed small", "a splash of buttermilk"],
    note: "Bake until the tops look like little sunlit stones.",
  },
  {
    title: "Nettle & Potato Soup",
    time: "40 minutes · serves 4",
    icon: "herb" as const,
    lines: ["a basket of young nettles (gloves!)", "3 waxy potatoes", "one soft onion", "cream, if the day is grey"],
    note: "Tastes like the first warm week of spring.",
  },
  {
    title: "Slow Plum Jam",
    time: "2 hours · 3 jars",
    icon: "jar" as const,
    lines: ["1kg dark plums, halved", "600g sugar", "one strip of lemon peel", "a whole star anise"],
    note: "Stir it while you think about nothing in particular.",
  },
  {
    title: "Lavender Steamed Milk",
    time: "8 minutes · one mug",
    icon: "cup" as const,
    lines: ["a mug of whole milk", "1 tsp dried lavender", "half a spoon of honey", "the smallest pinch of salt"],
    note: "For evenings the lantern is already lit.",
  },
];

function RecipeNook() {
  const { play } = useCottage();
  const [page, setPage] = useState(0);
  const [dir, setDir] = useState(1);

  const go = (d: number) => {
    const next = Math.min(RECIPES.length - 1, Math.max(0, page + d));
    if (next === page) return;
    setDir(d);
    setPage(next);
    play("flip");
  };

  const r = RECIPES[page]!;

  return (
    <Room title="recipes">
      <h1 className="font-hand text-5xl">The Recipe Nook</h1>
      <p className="max-w-prose text-muted-foreground">Sticky pages, a ribbon bookmark, and nothing measured too exactly.</p>

      <div className="relative mx-auto mt-6 max-w-3xl" style={{ perspective: 1600 }}>
        <span aria-hidden className="absolute -top-4 right-14 z-20 h-24 w-6 rounded-b-md bg-secondary shadow-md" />
        <div className="paper relative min-h-[26rem] overflow-hidden rounded-3xl border-4 border-bark/30 p-6 sm:p-10">
          <AnimatePresence mode="wait" initial={false}>
            <motion.article
              key={page}
              initial={{ rotateY: dir > 0 ? 85 : -85, opacity: 0 }}
              animate={{ rotateY: 0, opacity: 1 }}
              exit={{ rotateY: dir > 0 ? -85 : 85, opacity: 0 }}
              transition={{ type: "spring", stiffness: 110, damping: 16 }}
              style={{ transformOrigin: dir > 0 ? "left center" : "right center" }}
              className="grid gap-6 sm:grid-cols-[1fr_auto]"
            >
              <div>
                <h2 className="font-hand text-4xl">{r.title}</h2>
                <p className="text-sm tracking-wide text-muted-foreground uppercase">{r.time}</p>
                <ul className="mt-4 space-y-2">
                  {r.lines.map((l) => (
                    <li key={l} className="flex items-start gap-2 text-lg">
                      <span aria-hidden className="mt-2 h-2 w-2 shrink-0 rounded-full bg-sage" />
                      {l}
                    </li>
                  ))}
                </ul>
                <p className="font-hand mt-5 text-2xl text-muted-foreground">{r.note}</p>
              </div>
              <Doodle kind={r.icon} />
            </motion.article>
          </AnimatePresence>

          <div className="mt-8 flex items-center justify-between">
            <button
              type="button"
              onClick={() => go(-1)}
              disabled={page === 0}
              className="focus-visible:ring-ring rounded-full border-2 border-bark/30 px-4 py-2 font-semibold disabled:opacity-40 focus-visible:ring-2 focus-visible:outline-none"
            >
              ← Previous page
            </button>
            <p className="font-hand text-2xl" aria-live="polite">
              page {page + 1} of {RECIPES.length}
            </p>
            <button
              type="button"
              onClick={() => go(1)}
              disabled={page === RECIPES.length - 1}
              className="focus-visible:ring-ring rounded-full border-2 border-bark/30 px-4 py-2 font-semibold disabled:opacity-40 focus-visible:ring-2 focus-visible:outline-none"
            >
              Next page →
            </button>
          </div>
        </div>
      </div>
    </Room>
  );
}

function Doodle({ kind }: { kind: "jar" | "herb" | "cup" }) {
  const label =
    kind === "jar" ? "A hand-drawn preserving jar" : kind === "herb" ? "A hand-drawn sprig of herbs" : "A hand-drawn steaming teacup";
  return (
    <div className="relative mx-auto w-40">
      {kind === "cup" && (
        <span aria-hidden className="animate-steam absolute top-2 left-1/2 h-8 w-4 -translate-x-1/2 rounded-full bg-white/60" />
      )}
      <svg viewBox="0 0 120 140" className="w-full" role="img" aria-label={label}>
        <title>{label}</title>
        {kind === "jar" && (
          <>
            <rect x="38" y="12" width="44" height="14" rx="4" fill="var(--secondary)" stroke="var(--bark)" strokeWidth="4" />
            <path d="M30 32h60c7 30 7 70 0 96H30c-7-26-7-66 0-96z" fill="var(--rose)" stroke="var(--bark)" strokeWidth="4" />
            <path d="M36 78h48" stroke="var(--bark)" strokeWidth="3" strokeDasharray="6 6" />
          </>
        )}
        {kind === "herb" && (
          <>
            <path d="M60 130V26" stroke="var(--bark)" strokeWidth="4" strokeLinecap="round" />
            {[40, 60, 80, 100].map((y, i) => (
              <g key={y}>
                <path d={`M60 ${y}c-18-6-26-16-26-24 12-2 22 8 26 24z`} fill="var(--sage)" stroke="var(--bark)" strokeWidth="3" transform={`translate(0 ${i * 2})`} />
                <path d={`M60 ${y + 8}c18-6 26-16 26-24-12-2-22 8-26 24z`} fill="var(--sage-light)" stroke="var(--bark)" strokeWidth="3" />
              </g>
            ))}
          </>
        )}
        {kind === "cup" && (
          <>
            <path d="M26 56h64c2 34-10 52-32 52S24 90 26 56z" fill="var(--cream)" stroke="var(--bark)" strokeWidth="4" />
            <path d="M90 66c14-4 20 12 6 20-4 3-8 4-10 3" fill="none" stroke="var(--bark)" strokeWidth="4" />
            <path d="M20 116h80" stroke="var(--bark)" strokeWidth="4" strokeLinecap="round" />
            <circle cx="58" cy="76" r="8" fill="var(--honey)" />
          </>
        )}
      </svg>
    </div>
  );
}