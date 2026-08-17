import { Link, useRouterState } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import { useEffect, useState } from "react";
import { Fox } from "./Fox";
import { useCottage, spring } from "@/lib/cottage";

const ROOMS = [
  { to: "/", label: "Entryway" },
  { to: "/garden", label: "Greenhouse" },
  { to: "/pet-corner", label: "Pet Corner" },
  { to: "/scrapbook", label: "Scrapbook Wall" },
  { to: "/recipe-nook", label: "Recipe Nook" },
  { to: "/guestbook", label: "Guestbook" },
  { to: "/music-box", label: "Music Box" },
] as const;

const GUIDE: Record<string, string> = {
  "/": "Welcome in — shoes off, kettle's on!",
  "/garden": "Water the seedlings? They grow so fast in here.",
  "/pet-corner": "This is Pip. He likes berries and belly rubs.",
  "/scrapbook": "Move the photos around, I never mind.",
  "/recipe-nook": "Careful, the page corners are jammy.",
  "/guestbook": "Sign it? I read every single one.",
  "/music-box": "Ah, close your eyes and listen to the forest.",
};

export function LanternSwitch() {
  const { soundOn, toggleSound, play } = useCottage();
  return (
    <button
      type="button"
      onClick={() => {
        toggleSound();
        setTimeout(() => play("chime"), 20);
      }}
      aria-pressed={soundOn}
      aria-label={soundOn ? "Turn cottage sounds off" : "Turn cottage sounds on"}
      className="focus-visible:ring-ring group flex items-center gap-2 rounded-full border-2 border-bark/30 bg-card/80 px-3 py-1.5 text-xs font-semibold backdrop-blur transition focus-visible:ring-2 focus-visible:outline-none"
    >
      <svg viewBox="0 0 24 32" className="h-6 w-5" aria-hidden>
        <path d="M8 4h8M12 1v3" stroke="var(--bark)" strokeWidth="2" strokeLinecap="round" />
        <path
          d="M6 8h12l2 18H4z"
          fill={soundOn ? "var(--honey)" : "var(--muted)"}
          stroke="var(--bark)"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        {soundOn && (
          <circle cx="12" cy="18" r="4" fill="oklch(0.98 0.09 92)" className="animate-twinkle" />
        )}
      </svg>
      {soundOn ? "Lantern lit" : "Lantern out"}
    </button>
  );
}

export function CottageNav() {
  const { play, timeOfDay, toggleTime } = useCottage();
  return (
    <header className="sticky top-0 z-30 mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
      <Link
        to="/"
        className="font-hand text-3xl leading-none text-foreground drop-shadow-sm sm:text-4xl"
        onClick={() => play("chirp")}
      >
        The Cozy Cottage
      </Link>
      <nav aria-label="Cottage rooms" className="flex flex-wrap items-center gap-1.5">
        {ROOMS.map((room) => (
          <Link
            key={room.to}
            to={room.to}
            onClick={() => play("rustle")}
            className="focus-visible:ring-ring rounded-full border-2 border-transparent px-3 py-1.5 text-sm font-semibold transition hover:-translate-y-0.5 hover:border-bark/20 hover:bg-card/80 focus-visible:ring-2 focus-visible:outline-none"
            activeProps={{ className: "border-bark/30 bg-card shadow-[var(--shadow-paper)]" }}
            activeOptions={{ exact: room.to === "/" }}
          >
            {room.label}
          </Link>
        ))}
        <button
          type="button"
          onClick={toggleTime}
          className="focus-visible:ring-ring rounded-full border-2 border-bark/25 bg-card/80 px-3 py-1.5 text-sm focus-visible:ring-2 focus-visible:outline-none"
          aria-label={
            timeOfDay === "day" ? "Switch the cottage to evening" : "Switch the cottage to daytime"
          }
        >
          {timeOfDay === "day" ? "☀️" : "🌙"}
        </button>
        <LanternSwitch />
      </nav>
    </header>
  );
}

/** The fox that follows you between rooms with a dialogue bubble. */
export function MascotGuide() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [line, setLine] = useState(GUIDE["/"]!);
  const [open, setOpen] = useState(true);
  const { play, pipAccessory } = useCottage();

  useEffect(() => {
    setLine(GUIDE[pathname] ?? "Wander wherever you like.");
    setOpen(true);
    const t = setTimeout(() => setOpen(false), 6000);
    return () => clearTimeout(t);
  }, [pathname]);

  return (
    <div className="fixed right-3 bottom-3 z-40 flex items-end gap-2">
      <AnimatePresence>
        {open && (
          <motion.p
            initial={{ opacity: 0, y: 12, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            transition={spring}
            className="paper font-hand max-w-[13rem] rounded-2xl rounded-br-sm border-2 border-bark/25 px-3 py-2 text-lg leading-tight"
          >
            {line}
          </motion.p>
        )}
      </AnimatePresence>
      <button
        type="button"
        aria-label="Talk to Pip the fox"
        onClick={() => {
          setOpen((o) => !o);
          play("chirp");
        }}
        className="focus-visible:ring-ring rounded-full focus-visible:ring-2 focus-visible:outline-none cursor-pointer"
      >
        <Fox
          size={86}
          waving
          mood="happy"
          accessory={pipAccessory}
          title="Pip the fox, waving hello"
        />
      </button>
    </div>
  );
}

/** Door-open transition wrapper used by every room. */
export function Room({ children, title }: { children: React.ReactNode; title: string }) {
  const { reducedMotion } = useCottage();
  return (
    <motion.main
      key={title}
      initial={reducedMotion ? { opacity: 0 } : { opacity: 0, rotateY: -78, scale: 0.94 }}
      animate={reducedMotion ? { opacity: 1 } : { opacity: 1, rotateY: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 90, damping: 15 }}
      style={{ transformOrigin: "left center", perspective: 1200 }}
      className="mx-auto w-full max-w-6xl px-4 pt-2 pb-28"
    >
      {children}
    </motion.main>
  );
}
