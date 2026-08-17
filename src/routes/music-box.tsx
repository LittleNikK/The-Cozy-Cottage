import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";
import { Room } from "@/components/cottage/CottageChrome";
import { useCottage, type MusicVolumes } from "@/lib/cottage";

export const Route = createFileRoute("/music-box")({
  head: () => ({
    meta: [
      { title: "Cozy Music Box — Procedural Soundscape | The Cozy Cottage" },
      {
        name: "description",
        content:
          "A cozy music room where you can mix rain, wind, fireplace crackles and soft procedural synthesized chimes.",
      },
      { property: "og:title", content: "Cozy Music Box — Procedural Soundscape" },
      {
        property: "og:description",
        content:
          "Blend ambient sounds and relax to soft procedural chimes synthesized in your browser.",
      },
    ],
  }),
  component: MusicBoxPage,
});

function MusicBoxPage() {
  const {
    play,
    soundOn,
    toggleSound,
    musicPlaying,
    setMusicPlaying,
    musicVolumes,
    setMusicVolume,
  } = useCottage();

  const [activeNotes, setActiveNotes] = useState<{ id: number; scale: number }[]>([]);

  // Spawn visual chimes/pulses when chimes are active
  useEffect(() => {
    if (!musicPlaying || !soundOn) {
      setActiveNotes([]);
      return;
    }

    const interval = setInterval(() => {
      const newNote = {
        id: Date.now() + Math.random(),
        scale: 0.5 + Math.random() * 0.8,
      };
      setActiveNotes((prev) => [...prev.slice(-4), newNote]);
    }, 2500);

    return () => clearInterval(interval);
  }, [musicPlaying, soundOn]);

  const handleSliderChange = (channel: keyof MusicVolumes, val: number) => {
    setMusicVolume(channel, val);
  };

  const handleToggleMusic = () => {
    if (!soundOn) {
      toggleSound();
    }
    setMusicPlaying(!musicPlaying);
    play("chime");
  };

  return (
    <Room title="music-box">
      <h1 className="font-hand text-5xl">The Music Box</h1>
      <p className="max-w-prose text-muted-foreground">
        Sit back, rest your eyes, and blend your own cozy soundscape. These ambient tracks are
        synthesized procedurally in real-time.
      </p>

      <div className="mt-8 grid gap-8 md:grid-cols-[1.2fr_1fr]">
        {/* Left Column: The Vintage Music Box Diorama */}
        <div className="paper wobble-border rounded-3xl p-6 flex flex-col items-center justify-center min-h-[26rem] relative overflow-hidden bg-card/75">
          {/* Animated floating musical notes */}
          <div aria-hidden className="absolute inset-0 pointer-events-none">
            <AnimatePresence>
              {activeNotes.map((n) => (
                <motion.span
                  key={n.id}
                  initial={{ y: 220, x: 120 + (n.id % 80) - 40, opacity: 0, scale: 0.5 }}
                  animate={{ y: 40, opacity: [0, 0.85, 0.85, 0], scale: n.scale }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 5.5, ease: "easeOut" }}
                  className="absolute text-3xl text-honey"
                >
                  🎵
                </motion.span>
              ))}
            </AnimatePresence>
          </div>

          {/* Vintage Radio Graphic */}
          <div className="relative w-64 h-64 flex flex-col items-center justify-center">
            {/* Spinning spindle wheels when music is playing */}
            {musicPlaying && soundOn && (
              <div className="absolute top-[82px] flex gap-12 z-20">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                  className="w-12 h-12 rounded-full border-4 border-dashed border-bark/30 flex items-center justify-center text-bark/20 font-bold"
                >
                  ✿
                </motion.div>
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                  className="w-12 h-12 rounded-full border-4 border-dashed border-bark/30 flex items-center justify-center text-bark/20 font-bold"
                >
                  ✿
                </motion.div>
              </div>
            )}

            {/* Brass Radio Outline */}
            <svg
              viewBox="0 0 200 200"
              className="w-full h-full drop-shadow-[0_12px_22px_rgba(0,0,0,0.15)]"
              onClick={handleToggleMusic}
              role="img"
              aria-label="Click to play music box"
            >
              {/* Radio cabinet body */}
              <rect
                x="20"
                y="40"
                width="160"
                height="130"
                rx="20"
                fill="oklch(0.5 0.06 50)"
                stroke="var(--bark)"
                strokeWidth="5"
              />
              {/* Glass Dial background */}
              <rect
                x="36"
                y="58"
                width="128"
                height="50"
                rx="10"
                fill="var(--parchment)"
                stroke="var(--bark)"
                strokeWidth="4"
              />

              {/* Dial line indicators */}
              <path
                d="M46 80h108"
                stroke="var(--bark)"
                strokeWidth="2.5"
                strokeDasharray="3 4"
                opacity="0.4"
              />

              {/* Spinning tape reels centers background */}
              <circle
                cx="60"
                cy="80"
                r="20"
                fill="var(--muted)"
                stroke="var(--bark)"
                strokeWidth="3"
              />
              <circle
                cx="140"
                cy="80"
                r="20"
                fill="var(--muted)"
                stroke="var(--bark)"
                strokeWidth="3"
              />

              {/* Speaker Grille slats */}
              <rect x="40" y="122" width="120" height="24" rx="4" fill="var(--bark)" />
              {[48, 64, 80, 96, 112, 132, 148].map((x) => (
                <rect key={x} x={x} y="126" width="4" height="16" rx="1" fill="var(--honey)" />
              ))}

              {/* Power light indicator */}
              <circle
                cx="100"
                cy="148"
                r="4.5"
                fill={soundOn ? "var(--rose)" : "var(--muted)"}
                stroke="var(--bark)"
                strokeWidth="1.5"
              />
            </svg>
          </div>

          {/* Player controls */}
          <div className="mt-6 flex flex-col items-center gap-3 w-full">
            <button
              type="button"
              onClick={handleToggleMusic}
              className={`w-44 py-3 px-6 rounded-full wobble-border font-bold text-lg shadow-sm transition cursor-pointer ${
                musicPlaying && soundOn
                  ? "bg-rose text-white scale-102"
                  : "bg-honey text-bark hover:-translate-y-0.5"
              }`}
            >
              {musicPlaying && soundOn ? "⏸ Pause Music" : "▶ Play Music Box"}
            </button>
            <p className="text-xs text-muted-foreground text-center">
              Requires the general **Lantern lit** sound toggle to be active.
            </p>
          </div>
        </div>

        {/* Right Column: Audio Sliders */}
        <div className="space-y-6">
          <div className="paper wobble-border rounded-3xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-hand text-3xl">Ambient Mixer</h2>
              <button
                type="button"
                onClick={() => {
                  play("chime");
                  toggleSound();
                }}
                className={`px-3 py-1 rounded-full text-xs font-semibold border-2 transition cursor-pointer ${
                  soundOn
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-bark/20 text-muted-foreground hover:border-bark/40"
                }`}
              >
                {soundOn ? "🔊 Sounds Enabled" : "🔇 Sounds Disabled"}
              </button>
            </div>

            <p className="text-xs text-muted-foreground mt-[-8px]">
              Set the values to blend your perfect rain or fireside background loop.
            </p>

            <div className="space-y-4 pt-2">
              {/* Rain Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-sm font-semibold">
                  <span>🌧 Rain on Roof</span>
                  <span className="font-mono text-xs">{Math.round(musicVolumes.rain * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1.0"
                  step="0.05"
                  value={musicVolumes.rain}
                  onChange={(e) => handleSliderChange("rain", parseFloat(e.target.value))}
                  className="w-full accent-bark cursor-pointer"
                  aria-label="Rain volume"
                />
              </div>

              {/* Fire Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-sm font-semibold">
                  <span>🔥 Fireplace Crackle</span>
                  <span className="font-mono text-xs">{Math.round(musicVolumes.fire * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1.0"
                  step="0.05"
                  value={musicVolumes.fire}
                  onChange={(e) => handleSliderChange("fire", parseFloat(e.target.value))}
                  className="w-full accent-bark cursor-pointer"
                  aria-label="Fireplace volume"
                />
              </div>

              {/* Wind Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-sm font-semibold">
                  <span>🍃 Forest Wind</span>
                  <span className="font-mono text-xs">{Math.round(musicVolumes.wind * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1.0"
                  step="0.05"
                  value={musicVolumes.wind}
                  onChange={(e) => handleSliderChange("wind", parseFloat(e.target.value))}
                  className="w-full accent-bark cursor-pointer"
                  aria-label="Wind volume"
                />
              </div>

              {/* Music Chimes Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-sm font-semibold">
                  <span>🔔 Music Box Chimes</span>
                  <span className="font-mono text-xs">{Math.round(musicVolumes.music * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1.0"
                  step="0.05"
                  value={musicVolumes.music}
                  onChange={(e) => handleSliderChange("music", parseFloat(e.target.value))}
                  className="w-full accent-bark cursor-pointer"
                  aria-label="Music box volume"
                />
              </div>
            </div>
          </div>

          {/* Synth Info Card */}
          <div className="paper wobble-border rounded-3xl p-5 bg-honey/10 text-bark text-sm leading-snug">
            <h3 className="font-hand text-2xl mb-1">Synthesizer Engine</h3>
            <p>This room uses the browser's **Web Audio API** oscillator and gain nodes.</p>
            <p className="mt-2">
              The fireplace uses custom high-pass clicks, the wind runs sweeping band-pass noise
              filters, and the chimes are procedurally chosen C-major pentatonic notes ringed out
              through simulated delay lines. Zero static recordings or heavy loops are loaded!
            </p>
          </div>
        </div>
      </div>
    </Room>
  );
}
