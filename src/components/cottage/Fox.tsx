import { motion } from "motion/react";

export type FoxMood = "happy" | "sleepy" | "excited" | "shy" | "calm";

/** Hand-drawn style fox, built from wobbly SVG paths. */
export function Fox({
  mood = "calm",
  size = 120,
  waving = false,
  className = "",
  title = "A small hand-drawn fox with a fluffy tail",
}: {
  mood?: FoxMood;
  size?: number;
  waving?: boolean;
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
        <path d="M64 84 58 44l32 18z" fill="var(--honey)" stroke="var(--bark)" strokeWidth="4" strokeLinejoin="round" />
        <path d="M136 84l6-40-32 18z" fill="var(--honey)" stroke="var(--bark)" strokeWidth="4" strokeLinejoin="round" />
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
            <path d="M80 86c4 5 10 5 14 0" stroke="var(--bark)" strokeWidth="4" fill="none" strokeLinecap="round" />
            <path d="M106 86c4 5 10 5 14 0" stroke="var(--bark)" strokeWidth="4" fill="none" strokeLinecap="round" />
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