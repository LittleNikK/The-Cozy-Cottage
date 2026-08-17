import { motion } from "motion/react";

export type FoxMood = "happy" | "sleepy" | "excited" | "shy" | "calm";
export type FoxAccessory = "none" | "scarf" | "crown" | "coat" | "hat";

/** Hand-drawn style fox, built from wobbly SVG paths, now with accessories. */
export function Fox({
  mood = "calm",
  size = 120,
  waving = false,
  accessory = "none",
  className = "",
  title = "A small hand-drawn fox with a fluffy tail",
}: {
  mood?: FoxMood;
  size?: number;
  waving?: boolean;
  accessory?: FoxAccessory;
  className?: string;
  title?: string;
}) {
  const eyeClosed = mood === "sleepy" || mood === "shy";
  return (
    <motion.svg
      role="img"
      aria-label={title}
      viewBox="0 0 200 200"
      width={size}
      height={size}
      className={className}
      animate={{ y: mood === "excited" ? [0, -10, 0] : [0, -4, 0] }}
      transition={{
        duration: mood === "excited" ? 0.6 : 3.2,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      <title>{title}</title>
      {/* tail */}
      <motion.g
        style={{ originX: "135px", originY: "150px" }}
        animate={{ rotate: mood === "sleepy" ? [0, 3, 0] : [0, -14, 10, 0] }}
        transition={{ duration: mood === "excited" ? 0.9 : 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <path
          d="M132 148c22 6 42-8 44-30 2-20-12-34-24-30-14 5-6 22-20 30-10 6-14 16-0 30z"
          fill="var(--honey)"
          stroke="var(--bark)"
          strokeWidth="4"
          strokeLinejoin="round"
        />
        <path
          d="M158 92c8 2 14 12 12 24-1 9-7 16-14 19 6-14 8-30 2-43z"
          fill="var(--cream)"
          stroke="var(--bark)"
          strokeWidth="3"
        />
      </motion.g>

      {/* body */}
      <g>
        <path
          d="M62 152c-6-26 8-46 38-46s38 21 33 46c-2 10-14 14-35 14s-34-5-36-14z"
          fill="var(--honey)"
          stroke="var(--bark)"
          strokeWidth="4"
          strokeLinejoin="round"
        />
        <path
          d="M80 160c2-14 10-20 20-20s18 6 20 20c-8 6-32 6-40 0z"
          fill="var(--cream)"
          stroke="var(--bark)"
          strokeWidth="3"
        />

        {/* Yellow Raincoat overlay */}
        {accessory === "coat" && (
          <g>
            <path
              d="M61 154c-5-28 7-48 39-48s39 20 34 48c-2 9-14 12-34 12s-37-3-39-12z"
              fill="var(--honey)"
              stroke="var(--bark)"
              strokeWidth="4.5"
              strokeLinejoin="round"
            />
            {/* Coat toggles/buttons */}
            <path d="M95 124h10" stroke="var(--bark)" strokeWidth="3" strokeLinecap="round" />
            <path d="M95 138h10" stroke="var(--bark)" strokeWidth="3" strokeLinecap="round" />
            <circle cx="100" cy="124" r="2.5" fill="var(--bark)" />
            <circle cx="100" cy="138" r="2.5" fill="var(--bark)" />
            {/* Pockets */}
            <path
              d="M72 146h12v10h-12z"
              fill="none"
              stroke="var(--bark)"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            <path
              d="M116 146h12v10h-12z"
              fill="none"
              stroke="var(--bark)"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
          </g>
        )}
      </g>

      {/* waving paw */}
      <motion.path
        d="M64 132c-8-4-16-2-19 4"
        stroke="var(--bark)"
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
        style={{ originX: "64px", originY: "132px" }}
        animate={waving ? { rotate: [0, -35, -5, -35, 0] } : { rotate: 0 }}
        transition={{ duration: 1.1, repeat: waving ? Infinity : 0, repeatDelay: 2 }}
      />

      {/* head */}
      <motion.g
        style={{ originX: "100px", originY: "96px" }}
        animate={{ rotate: mood === "shy" ? [-8, -6, -8] : [-2, 2, -2] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      >
        <path
          d="M64 84 58 44l32 18z"
          fill="var(--honey)"
          stroke="var(--bark)"
          strokeWidth="4"
          strokeLinejoin="round"
        />
        <path
          d="M136 84l6-40-32 18z"
          fill="var(--honey)"
          stroke="var(--bark)"
          strokeWidth="4"
          strokeLinejoin="round"
        />
        <path
          d="M100 52c26 0 42 18 40 40-2 20-18 32-40 32S62 112 60 92c-2-22 14-40 40-40z"
          fill="var(--honey)"
          stroke="var(--bark)"
          strokeWidth="4"
        />
        <path
          d="M100 84c14 0 22 8 22 18 0 12-10 20-22 20s-22-8-22-20c0-10 8-18 22-18z"
          fill="var(--cream)"
          stroke="var(--bark)"
          strokeWidth="3"
        />
        {eyeClosed ? (
          <>
            <path
              d="M80 86c4 5 10 5 14 0"
              stroke="var(--bark)"
              strokeWidth="4"
              fill="none"
              strokeLinecap="round"
            />
            <path
              d="M106 86c4 5 10 5 14 0"
              stroke="var(--bark)"
              strokeWidth="4"
              fill="none"
              strokeLinecap="round"
            />
          </>
        ) : (
          <motion.g
            animate={{ scaleY: [1, 1, 0.1, 1] }}
            transition={{ duration: 0.3, repeat: Infinity, repeatDelay: 3.4 }}
            style={{ originY: "88px" }}
          >
            <circle cx="86" cy="88" r="5.5" fill="var(--bark)" />
            <circle cx="114" cy="88" r="5.5" fill="var(--bark)" />
          </motion.g>
        )}
        <circle cx="100" cy="102" r="6" fill="var(--bark)" />
        <path
          d={mood === "sleepy" ? "M92 114h16" : "M92 112c4 6 12 6 16 0"}
          stroke="var(--bark)"
          strokeWidth="3.5"
          fill="none"
          strokeLinecap="round"
        />
        <circle cx="72" cy="100" r="7" fill="var(--rose)" opacity="0.65" />
        <circle cx="128" cy="100" r="7" fill="var(--rose)" opacity="0.65" />

        {/* Head-mounted accessories (moves with head rotation) */}
        {accessory === "crown" && (
          <g>
            {/* Crown base */}
            <path
              d="M78 62c10-5 34-5 44 0"
              fill="none"
              stroke="var(--sage)"
              strokeWidth="4.5"
              strokeLinecap="round"
            />
            {/* Daisies */}
            <g>
              <circle
                cx="84"
                cy="58"
                r="6.5"
                fill="var(--cream)"
                stroke="var(--bark)"
                strokeWidth="1.5"
              />
              <circle cx="84" cy="58" r="2.5" fill="var(--honey)" />
            </g>
            <g>
              <circle
                cx="100"
                cy="54"
                r="8"
                fill="var(--cream)"
                stroke="var(--bark)"
                strokeWidth="2"
              />
              <circle cx="100" cy="54" r="3" fill="var(--honey)" />
            </g>
            <g>
              <circle
                cx="116"
                cy="58"
                r="6.5"
                fill="var(--cream)"
                stroke="var(--bark)"
                strokeWidth="1.5"
              />
              <circle cx="116" cy="58" r="2.5" fill="var(--honey)" />
            </g>
          </g>
        )}

        {accessory === "hat" && (
          <g>
            {/* Hat brim */}
            <ellipse
              cx="100"
              cy="52"
              rx="42"
              ry="8"
              fill="oklch(0.38 0.08 285)"
              stroke="var(--bark)"
              strokeWidth="4"
            />
            {/* Hat cone */}
            <path
              d="M74 48c10-24 16-36 32-42 4 18 10 30 18 42z"
              fill="oklch(0.38 0.08 285)"
              stroke="var(--bark)"
              strokeWidth="4"
              strokeLinejoin="round"
            />
            {/* Hat band */}
            <path
              d="M73 47c16-3 38-3 54 0l1 5c-18-3-40-3-54 0z"
              fill="var(--honey)"
              stroke="var(--bark)"
              strokeWidth="2"
            />
            {/* Buckle */}
            <rect
              x="94"
              y="44"
              width="12"
              height="7"
              rx="1"
              fill="var(--cream)"
              stroke="var(--bark)"
              strokeWidth="1.5"
            />
            {/* Star details */}
            <path
              d="M106 25l1 2 2 0.5-1.5 1 0.5 2-2-1-2 1 0.5-2-1.5-1 2-0.5z"
              fill="var(--honey)"
            />
          </g>
        )}

        {/* Scarf overlay (wraps around neck area) */}
        {accessory === "scarf" && (
          <g>
            {/* Scarf neck wrap */}
            <path
              d="M76 114c12 5 36 5 48 0 4 8-4 14-24 14s-28-6-24-14z"
              fill="var(--rose)"
              stroke="var(--bark)"
              strokeWidth="4"
              strokeLinejoin="round"
            />
            {/* Scarf tail hanging down */}
            <path
              d="M104 122c1 10 7 24 4 30-5 3-9-6-10-18z"
              fill="var(--rose)"
              stroke="var(--bark)"
              strokeWidth="3.5"
              strokeLinejoin="round"
            />
            {/* Fringe details */}
            <path d="M98 152v3M101 153v3M103 151v3" stroke="var(--bark)" strokeWidth="2" />
          </g>
        )}
      </motion.g>

      {mood === "sleepy" && (
        <motion.text
          x="150"
          y="60"
          fontFamily="var(--font-hand)"
          fontSize="26"
          fill="var(--bark)"
          animate={{ y: [60, 40], opacity: [0, 1, 0] }}
          transition={{ duration: 2.6, repeat: Infinity }}
        >
          z
        </motion.text>
      )}
    </motion.svg>
  );
}
