import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useRef,
  type ReactNode,
} from "react";

export type TimeOfDay = "day" | "dusk";
export type Sfx = "chirp" | "rustle" | "flip" | "pop" | "chime" | "splish" | "bubble" | "click";

export type Inventory = {
  berries: number;
  fireflies: number;
  lavender: number;
  sunflower: number;
  daisy: number;
  clover: number;
};

export type PipAccessory = "none" | "scarf" | "crown" | "coat" | "hat";

export type PotState = {
  id: number;
  seed: "lavender" | "sunflower" | "daisy" | "clover" | null;
  watered: boolean;
  growth: number; // 0 to 100
  lastWatered: number; // timestamp
};

export type ScrapbookItem = {
  id: string;
  kind: "polaroid" | "note" | "postcard" | "flower";
  caption: string;
  x: number;
  y: number;
  rot: number;
  hue: string;
};

export type GuestbookEntry = {
  id: number;
  name: string;
  note: string;
  color: string;
  stamp: "none" | "snail" | "mushroom" | "acorn" | "clover";
  date: string;
};

export type CustomRecipe = {
  title: string;
  time: string;
  icon: "jar" | "herb" | "cup";
  lines: string[];
  note: string;
};

export type MusicVolumes = {
  rain: number;
  fire: number;
  wind: number;
  steam: number;
  music: number;
};

type CottageValue = {
  timeOfDay: TimeOfDay;
  toggleTime: () => void;
  soundOn: boolean;
  toggleSound: () => void;
  play: (sfx: Sfx) => void;
  reducedMotion: boolean;
  // Shared Inventory
  inventory: Inventory;
  addInventoryItem: (item: keyof Inventory, amount: number) => void;
  removeInventoryItem: (item: keyof Inventory, amount: number) => boolean;
  // Pip's State
  pipAccessory: PipAccessory;
  setPipAccessory: (acc: PipAccessory) => void;
  pipEnergy: number;
  setPipEnergy: React.Dispatch<React.SetStateAction<number>>;
  unlockedAccessories: PipAccessory[];
  unlockAccessory: (acc: PipAccessory) => void;
  // Garden
  gardenState: PotState[];
  updatePot: (id: number, fields: Partial<PotState>) => void;
  // Scrapbook
  scrapbookItems: ScrapbookItem[];
  setScrapbookItems: React.Dispatch<React.SetStateAction<ScrapbookItem[]>>;
  // Recipes
  customRecipes: CustomRecipe[];
  addCustomRecipe: (recipe: CustomRecipe) => void;
  // Guestbook
  guestbookEntries: GuestbookEntry[];
  addGuestbookEntry: (name: string, note: string, color: string, stamp: string) => void;
  // Music Box Ambient
  musicVolumes: MusicVolumes;
  setMusicVolume: (channel: keyof MusicVolumes, value: number) => void;
  musicPlaying: boolean;
  setMusicPlaying: (playing: boolean) => void;
};

const CottageContext = createContext<CottageValue | null>(null);

const RECIPES: Record<Sfx, { freq: number[]; dur: number; type: OscillatorType }> = {
  chirp: { freq: [1180, 1560, 1320], dur: 0.09, type: "sine" },
  rustle: { freq: [320, 210], dur: 0.07, type: "triangle" },
  flip: { freq: [520, 300], dur: 0.12, type: "triangle" },
  pop: { freq: [420, 780], dur: 0.08, type: "sine" },
  chime: { freq: [660, 880, 1320], dur: 0.16, type: "sine" },
  splish: { freq: [380, 220, 100], dur: 0.12, type: "sine" },
  bubble: { freq: [220, 310, 260, 480], dur: 0.06, type: "sine" },
  click: { freq: [560], dur: 0.03, type: "sine" },
};

const DEFAULT_SCRAPBOOK_ITEMS: ScrapbookItem[] = [
  {
    id: "a",
    kind: "polaroid",
    caption: "first frost on the kale",
    x: 2,
    y: 4,
    rot: -5,
    hue: "var(--sage-light)",
  },
  {
    id: "b",
    kind: "polaroid",
    caption: "bread that finally rose",
    x: 32,
    y: 12,
    rot: 4,
    hue: "var(--honey)",
  },
  {
    id: "c",
    kind: "note",
    caption: "buy more yarn (again)",
    x: 63,
    y: 2,
    rot: -3,
    hue: "var(--honey)",
  },
  {
    id: "d",
    kind: "postcard",
    caption: "greetings from the mossy woods — wish you were here, P.",
    x: 8,
    y: 46,
    rot: 3,
    hue: "var(--parchment)",
  },
  {
    id: "e",
    kind: "flower",
    caption: "pressed clover, June",
    x: 52,
    y: 42,
    rot: -8,
    hue: "var(--rose)",
  },
  {
    id: "f",
    kind: "polaroid",
    caption: "Pip asleep in the basil",
    x: 72,
    y: 50,
    rot: 6,
    hue: "var(--rose)",
  },
  {
    id: "g",
    kind: "note",
    caption: "the plum jam wants 3 more days",
    x: 36,
    y: 68,
    rot: 5,
    hue: "var(--sage-light)",
  },
];

const DEFAULT_GUESTBOOK_ENTRIES: GuestbookEntry[] = [
  {
    id: 1,
    name: "Wren",
    note: "The plum jam recipe worked. My kitchen smells like autumn.",
    color: "var(--rose)",
    stamp: "mushroom",
    date: "August 12",
  },
  {
    id: 2,
    name: "Tomas",
    note: "Pip yawned at me and I felt personally understood.",
    color: "var(--sage)",
    stamp: "snail",
    date: "August 14",
  },
];

const DEFAULT_GARDEN_STATE: PotState[] = [
  { id: 1, seed: null, watered: false, growth: 0, lastWatered: 0 },
  { id: 2, seed: null, watered: false, growth: 0, lastWatered: 0 },
  { id: 3, seed: null, watered: false, growth: 0, lastWatered: 0 },
  { id: 4, seed: null, watered: false, growth: 0, lastWatered: 0 },
];

export function CottageProvider({ children }: { children: ReactNode }) {
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>("day");
  const [soundOn, setSoundOn] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  // Expanded Cottage state
  const [inventory, setInventory] = useState<Inventory>({
    berries: 5,
    fireflies: 3,
    lavender: 0,
    sunflower: 0,
    daisy: 0,
    clover: 0,
  });
  const [pipAccessory, setPipAccessory] = useState<PipAccessory>("none");
  const [pipEnergy, setPipEnergy] = useState<number>(5);
  const [unlockedAccessories, setUnlockedAccessories] = useState<PipAccessory[]>(["none"]);
  const [gardenState, setGardenState] = useState<PotState[]>(DEFAULT_GARDEN_STATE);
  const [scrapbookItems, setScrapbookItems] = useState<ScrapbookItem[]>(DEFAULT_SCRAPBOOK_ITEMS);
  const [customRecipes, setCustomRecipes] = useState<CustomRecipe[]>([]);
  const [guestbookEntries, setGuestbookEntries] =
    useState<GuestbookEntry[]>(DEFAULT_GUESTBOOK_ENTRIES);

  // Music Box states
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [musicVolumes, setMusicVolumes] = useState<MusicVolumes>({
    rain: 0.2,
    fire: 0.2,
    wind: 0.15,
    steam: 0.2,
    music: 0.35,
  });

  const engineRef = useRef<{
    ctx: AudioContext;
    rainGain: GainNode;
    windGain: GainNode;
    fireGain: GainNode;
    fireStop: () => void;
    musicTimeout: number | null;
  } | null>(null);

  // Load from localStorage on mount (prevents hydration mismatches in TanStack Start)
  useEffect(() => {
    const hour = new Date().getHours();
    setTimeOfDay(hour >= 18 || hour < 6 ? "dusk" : "day");

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onChange = () => setReducedMotion(mq.matches);
    mq.addEventListener("change", onChange);

    // LocalStorage loading
    try {
      const getLocal = <T,>(key: string, fallback: T): T => {
        const item = localStorage.getItem(`cottage_${key}`);
        return item ? JSON.parse(item) : fallback;
      };

      setSoundOn(getLocal("soundOn", false));
      setInventory(
        getLocal("inventory", {
          berries: 5,
          fireflies: 3,
          lavender: 0,
          sunflower: 0,
          daisy: 0,
          clover: 0,
        }),
      );
      setPipAccessory(getLocal("pipAccessory", "none"));
      setPipEnergy(getLocal("pipEnergy", 5));
      setUnlockedAccessories(getLocal("unlockedAccessories", ["none"]));
      setGardenState(getLocal("gardenState", DEFAULT_GARDEN_STATE));
      setScrapbookItems(getLocal("scrapbookItems", DEFAULT_SCRAPBOOK_ITEMS));
      setCustomRecipes(getLocal("customRecipes", []));
      setGuestbookEntries(getLocal("guestbookEntries", DEFAULT_GUESTBOOK_ENTRIES));
      setMusicVolumes(
        getLocal("musicVolumes", { rain: 0.2, fire: 0.2, wind: 0.15, steam: 0.2, music: 0.35 }),
      );
    } catch (e) {
      console.warn("Could not read cottage localStorage state", e);
    }

    return () => mq.removeEventListener("change", onChange);
  }, []);

  // Save states to localStorage when they change
  useEffect(() => {
    if (typeof window === "undefined") return;
    const setLocal = (key: string, val: unknown) => {
      localStorage.setItem(`cottage_${key}`, JSON.stringify(val));
    };

    setLocal("soundOn", soundOn);
    setLocal("inventory", inventory);
    setLocal("pipAccessory", pipAccessory);
    setLocal("pipEnergy", pipEnergy);
    setLocal("unlockedAccessories", unlockedAccessories);
    setLocal("gardenState", gardenState);
    setLocal("scrapbookItems", scrapbookItems);
    setLocal("customRecipes", customRecipes);
    setLocal("guestbookEntries", guestbookEntries);
    setLocal("musicVolumes", musicVolumes);
  }, [
    soundOn,
    inventory,
    pipAccessory,
    pipEnergy,
    unlockedAccessories,
    gardenState,
    scrapbookItems,
    customRecipes,
    guestbookEntries,
    musicVolumes,
  ]);

  useEffect(() => {
    document.documentElement.dataset["time"] = timeOfDay;
  }, [timeOfDay]);

  // Audio SFX Engine
  const play = useCallback(
    (sfx: Sfx) => {
      if (!soundOn || typeof window === "undefined") return;
      const Ctor =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return;

      const ctx = engineRef.current?.ctx ?? new Ctor();
      const recipe = RECIPES[sfx];

      recipe.freq.forEach((f, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = recipe.type;
        osc.frequency.value = f;
        const start = ctx.currentTime + i * recipe.dur;
        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.exponentialRampToValueAtTime(0.07, start + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + recipe.dur);
        osc.connect(gain).connect(ctx.destination);
        osc.start(start);
        osc.stop(start + recipe.dur + 0.02);
      });
    },
    [soundOn],
  );

  // Helper generators for ambient sounds
  const createNoiseBuffer = (ctx: AudioContext) => {
    const bufferSize = 2 * ctx.sampleRate;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    return noiseBuffer;
  };

  const setupRain = (ctx: AudioContext, noiseBuffer: AudioBuffer) => {
    const source = ctx.createBufferSource();
    source.buffer = noiseBuffer;
    source.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 850;
    const gain = ctx.createGain();
    gain.gain.value = 0;
    source.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    source.start();
    return gain;
  };

  const setupWind = (ctx: AudioContext, noiseBuffer: AudioBuffer) => {
    const source = ctx.createBufferSource();
    source.buffer = noiseBuffer;
    source.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.Q.value = 1.8;
    filter.frequency.value = 350;
    const gain = ctx.createGain();
    gain.gain.value = 0;

    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.value = 0.09;
    const oscGain = ctx.createGain();
    oscGain.gain.value = 180;

    osc.connect(oscGain);
    oscGain.connect(filter.frequency);
    osc.start();

    source.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    source.start();
    return gain;
  };

  const setupFire = (ctx: AudioContext) => {
    const gain = ctx.createGain();
    gain.gain.value = 0;
    gain.connect(ctx.destination);

    let intervalId: number | undefined;
    const startCrackles = () => {
      intervalId = window.setInterval(() => {
        if (gain.gain.value < 0.01) return;
        if (Math.random() > 0.45) {
          const osc = ctx.createOscillator();
          const clickGain = ctx.createGain();
          osc.type = "triangle";
          osc.frequency.value = 180 + Math.random() * 1600;
          clickGain.gain.setValueAtTime(0.0001, ctx.currentTime);
          clickGain.gain.exponentialRampToValueAtTime(
            0.02 * gain.gain.value,
            ctx.currentTime + 0.003,
          );
          clickGain.gain.exponentialRampToValueAtTime(
            0.0001,
            ctx.currentTime + 0.01 + Math.random() * 0.02,
          );
          osc.connect(clickGain).connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.05);
        }
      }, 160);
    };

    startCrackles();
    return {
      gain,
      stop: () => {
        if (intervalId) window.clearInterval(intervalId);
      },
    };
  };

  const playMusicNote = (ctx: AudioContext, volume: number) => {
    const notes = [
      261.63, // C4
      293.66, // D4
      329.63, // E4
      392.0, // G4
      440.0, // A4
      523.25, // C5
      587.33, // D5
      659.25, // E5eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeZ
      783.99, // G5
      880.0, // A5
    ];
    const freq = notes[Math.floor(Math.random() * notes.length)] ?? 261.63;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;

    const now = ctx.currentTime;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.05 * volume, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.0);

    const delay = ctx.createDelay();
    delay.delayTime.value = 0.45;
    const feedback = ctx.createGain();
    feedback.gain.value = 0.25;

    osc.connect(gain);
    gain.connect(ctx.destination);

    gain.connect(delay);
    delay.connect(feedback);
    feedback.connect(delay);
    delay.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 2.8);
  };

  // Main coordinator for procedural audio engine
  const updateEngine = useCallback(() => {
    if (typeof window === "undefined") return;

    if (!soundOn) {
      if (engineRef.current) {
        engineRef.current.rainGain.gain.setValueAtTime(0, engineRef.current.ctx.currentTime);
        engineRef.current.windGain.gain.setValueAtTime(0, engineRef.current.ctx.currentTime);
        engineRef.current.fireGain.gain.setValueAtTime(0, engineRef.current.ctx.currentTime);
        if (engineRef.current.musicTimeout) {
          window.clearTimeout(engineRef.current.musicTimeout);
          engineRef.current.musicTimeout = null;
        }
      }
      return;
    }

    if (!engineRef.current) {
      const Ctor =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return;
      const ctx = new Ctor();
      const noise = createNoiseBuffer(ctx);
      const rainGain = setupRain(ctx, noise);
      const windGain = setupWind(ctx, noise);
      const fireSetup = setupFire(ctx);

      engineRef.current = {
        ctx,
        rainGain,
        windGain,
        fireGain: fireSetup.gain,
        fireStop: fireSetup.stop,
        musicTimeout: null,
      };
    }

    const engine = engineRef.current;
    if (engine.ctx.state === "suspended") {
      engine.ctx.resume();
    }

    // Set volumes smoothly
    const now = engine.ctx.currentTime;
    engine.rainGain.gain.setTargetAtTime(musicVolumes.rain * 0.45, now, 0.1);
    engine.windGain.gain.setTargetAtTime(musicVolumes.wind * 0.22, now, 0.1);
    engine.fireGain.gain.setTargetAtTime(musicVolumes.fire * 0.8, now, 0.1);

    // Handle background music interval
    if (musicPlaying) {
      if (!engine.musicTimeout) {
        const scheduleNext = () => {
          if (!engineRef.current || !musicPlaying || !soundOn) return;
          playMusicNote(engine.ctx, musicVolumes.music);
          const nextDelay = 1800 + Math.random() * 1500;
          engine.musicTimeout = window.setTimeout(scheduleNext, nextDelay);
        };
        scheduleNext();
      }
    } else {
      if (engine.musicTimeout) {
        window.clearTimeout(engine.musicTimeout);
        engine.musicTimeout = null;
      }
    }
  }, [soundOn, musicVolumes, musicPlaying]);

  useEffect(() => {
    updateEngine();
  }, [updateEngine]);

  useEffect(() => {
    return () => {
      if (engineRef.current) {
        if (engineRef.current.musicTimeout) {
          window.clearTimeout(engineRef.current.musicTimeout);
        }
        engineRef.current.fireStop();
        engineRef.current.ctx.close().catch(() => {});
        engineRef.current = null;
      }
    };
  }, []);

  // Shared state helpers
  const addInventoryItem = useCallback(
    (item: keyof Inventory, amount: number) => {
      setInventory((prev) => ({
        ...prev,
        [item]: prev[item] + amount,
      }));
      play("pop");
    },
    [play],
  );

  const removeInventoryItem = useCallback((item: keyof Inventory, amount: number) => {
    let success = false;
    setInventory((prev) => {
      if (prev[item] >= amount) {
        success = true;
        return {
          ...prev,
          [item]: prev[item] - amount,
        };
      }
      return prev;
    });
    return success;
  }, []);

  const unlockAccessory = useCallback((acc: PipAccessory) => {
    setUnlockedAccessories((prev) => {
      if (prev.includes(acc)) return prev;
      return [...prev, acc];
    });
  }, []);

  const updatePot = useCallback((id: number, fields: Partial<PotState>) => {
    setGardenState((prev) => prev.map((pot) => (pot.id === id ? { ...pot, ...fields } : pot)));
  }, []);

  const addCustomRecipe = useCallback(
    (recipe: CustomRecipe) => {
      setCustomRecipes((prev) => [...prev, recipe]);
      play("chime");
    },
    [play],
  );

  const addGuestbookEntry = useCallback(
    (name: string, note: string, color: string, stamp: string) => {
      const newEntry: GuestbookEntry = {
        id: Date.now(),
        name: name.trim(),
        note: note.trim(),
        color,
        stamp: stamp as GuestbookEntry["stamp"],
        date: new Date().toLocaleDateString("en-US", { month: "long", day: "numeric" }),
      };
      setGuestbookEntries((prev) => [newEntry, ...prev]);
      play("chime");
    },
    [play],
  );

  const setMusicVolume = useCallback((channel: keyof MusicVolumes, value: number) => {
    setMusicVolumes((prev) => ({
      ...prev,
      [channel]: value,
    }));
  }, []);

  const value = useMemo<CottageValue>(
    () => ({
      timeOfDay,
      toggleTime: () => setTimeOfDay((t) => (t === "day" ? "dusk" : "day")),
      soundOn,
      toggleSound: () => setSoundOn((s) => !s),
      play,
      reducedMotion,
      inventory,
      addInventoryItem,
      removeInventoryItem,
      pipAccessory,
      setPipAccessory,
      pipEnergy,
      setPipEnergy,
      unlockedAccessories,
      unlockAccessory,
      gardenState,
      updatePot,
      scrapbookItems,
      setScrapbookItems,
      customRecipes,
      addCustomRecipe,
      guestbookEntries,
      addGuestbookEntry,
      musicVolumes,
      setMusicVolume,
      musicPlaying,
      setMusicPlaying,
    }),
    [
      timeOfDay,
      soundOn,
      play,
      reducedMotion,
      inventory,
      addInventoryItem,
      removeInventoryItem,
      pipAccessory,
      pipEnergy,
      unlockedAccessories,
      unlockAccessory,
      gardenState,
      updatePot,
      scrapbookItems,
      customRecipes,
      addCustomRecipe,
      guestbookEntries,
      addGuestbookEntry,
      musicVolumes,
      setMusicVolume,
      musicPlaying,
      setMusicPlaying,
    ],
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
