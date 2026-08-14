import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type TimeOfDay = "day" | "dusk";
export type Sfx = "chirp" | "rustle" | "flip" | "pop" | "chime";

type CottageValue = {
  timeOfDay: TimeOfDay;
  toggleTime: () => void;
  soundOn: boolean;
  toggleSound: () => void;
  play: (sfx: Sfx) => void;
  reducedMotion: boolean;
};

const CottageContext = createContext<CottageValue | null>(null);

const RECIPES: Record<Sfx, { freq: number[]; dur: number; type: OscillatorType }> = {
  chirp: { freq: [1180, 1560, 1320], dur: 0.09, type: "sine" },
  rustle: { freq: [320, 210], dur: 0.07, type: "triangle" },
  flip: { freq: [520, 300], dur: 0.12, type: "triangle" },
  pop: { freq: [420, 780], dur: 0.08, type: "sine" },
  chime: { freq: [660, 880, 1320], dur: 0.16, type: "sine" },
};

export function CottageProvider({ children }: { children: ReactNode }) {
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>("day");
  const [soundOn, setSoundOn] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const hour = new Date().getHours();
    setTimeOfDay(hour >= 18 || hour < 6 ? "dusk" : "day");
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onChange = () => setReducedMotion(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    document.documentElement.dataset["time"] = timeOfDay;
  }, [timeOfDay]);

  const play = useCallback(
    (sfx: Sfx) => {
      if (!soundOn || typeof window === "undefined") return;
      const Ctor =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!Ctor) return;
      const ctx = new Ctor();
      const recipe = RECIPES[sfx];
      recipe.freq.forEach((f, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = recipe.type;
        osc.frequency.value = f;
        const start = ctx.currentTime + i * recipe.dur;
        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.exponentialRampToValueAtTime(0.08, start + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + recipe.dur);
        osc.connect(gain).connect(ctx.destination);
        osc.start(start);
        osc.stop(start + recipe.dur + 0.02);
      });
      window.setTimeout(() => void ctx.close(), 1200);
    },
    [soundOn],
  );

  const value = useMemo<CottageValue>(
    () => ({
      timeOfDay,
      toggleTime: () => setTimeOfDay((t) => (t === "day" ? "dusk" : "day")),
      soundOn,
      toggleSound: () => setSoundOn((s) => !s),
      play,
      reducedMotion,
    }),
    [timeOfDay, soundOn, play, reducedMotion],
  );

  return <CottageContext.Provider value={value}>{children}</CottageContext.Provider>;
}

export function useCottage(): CottageValue {
  const ctx = useContext(CottageContext);
  if (!ctx) throw new Error("useCottage must be used inside CottageProvider");
  return ctx;
}

export const spring = { type: "spring" as const, stiffness: 260, damping: 18 };
export const springSoft = { type: "spring" as const, stiffness: 140, damping: 16 };