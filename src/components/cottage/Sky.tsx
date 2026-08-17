import { useCottage } from "@/lib/cottage";

/** Parallax cottage sky: clouds by day, fireflies + stars at dusk. */
export function Sky() {
  const { timeOfDay } = useCottage();
  const dusk = timeOfDay === "dusk";

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div
        className="absolute inset-0 transition-colors duration-1000"
        style={{
          background: "linear-gradient(to bottom, var(--sky-top), var(--sky-bottom))",
        }}
      />
      {!dusk && (
        <div
          className="absolute inset-0 opacity-40"
          style={{
            background:
              "conic-gradient(from 200deg at 78% -8%, transparent 0deg, oklch(0.98 0.09 92 / 0.8) 12deg, transparent 26deg, oklch(0.98 0.09 92 / 0.6) 38deg, transparent 55deg)",
          }}
        />
      )}
      {dusk &&
        Array.from({ length: 40 }).map((_, i) => (
          <span
            key={`s${i}`}
            className="animate-twinkle absolute rounded-full"
            style={{
              top: `${(i * 37) % 60}%`,
              left: `${(i * 53) % 100}%`,
              width: 3,
              height: 3,
              background: "oklch(0.97 0.06 92)",
              animationDelay: `${(i % 7) * 0.4}s`,
            }}
          />
        ))}
      {dusk &&
        Array.from({ length: 14 }).map((_, i) => (
          <span
            key={`f${i}`}
            className="animate-float absolute rounded-full"
            style={{
              top: `${45 + ((i * 17) % 45)}%`,
              left: `${(i * 71) % 100}%`,
              width: 7,
              height: 7,
              background: "var(--honey)",
              boxShadow: "0 0 12px 4px oklch(0.85 0.14 82 / 0.7)",
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${4 + (i % 4)}s`,
            }}
          />
        ))}
      {!dusk &&
        [0, 1, 2].map((i) => (
          <svg
            key={`c${i}`}
            viewBox="0 0 200 80"
            className="absolute h-16 w-40 opacity-80"
            style={{
              top: `${8 + i * 12}%`,
              animation: `cozy-drift ${70 + i * 25}s linear infinite`,
              animationDelay: `${i * -20}s`,
            }}
          >
            <path
              d="M30 60c-16 0-26-10-24-22 2-11 14-16 24-13 4-14 20-20 32-13 8-12 28-10 34 4 16-3 28 8 26 22-2 13-14 22-30 22z"
              fill="oklch(1 0 0 / 0.85)"
              stroke="var(--bark)"
              strokeOpacity="0.15"
              strokeWidth="3"
            />
          </svg>
        ))}
      {/* hills */}
      <svg viewBox="0 0 1440 320" className="absolute bottom-0 w-full" preserveAspectRatio="none">
        <path
          d="M0 220c180-70 320 20 520-10s300-90 480-40 260 60 440 30v120H0z"
          fill="var(--sage-light)"
          opacity="0.75"
        />
        <path
          d="M0 260c220-40 360 30 560 10s340-60 520-20 200 40 360 20v60H0z"
          fill="var(--sage)"
          opacity="0.8"
        />
      </svg>
      {/* swaying trees */}
      <svg
        viewBox="0 0 120 160"
        className="animate-sway absolute bottom-0 left-[4%] h-40 w-28 opacity-80"
      >
        <path d="M58 150V96" stroke="var(--bark)" strokeWidth="8" strokeLinecap="round" />
        <path
          d="M60 12c26 8 36 30 30 48-4 12-16 18-30 18s-27-6-31-18c-6-19 5-40 31-48z"
          fill="var(--sage)"
          stroke="var(--bark)"
          strokeWidth="4"
        />
      </svg>
      <svg
        viewBox="0 0 120 160"
        className="animate-sway absolute right-[6%] bottom-0 h-32 w-24 opacity-70"
      >
        <path d="M60 150V90" stroke="var(--bark)" strokeWidth="7" strokeLinecap="round" />
        <circle
          cx="60"
          cy="60"
          r="36"
          fill="var(--sage-light)"
          stroke="var(--bark)"
          strokeWidth="4"
        />
      </svg>
    </div>
  );
}
