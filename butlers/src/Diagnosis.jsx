import { motion, AnimatePresence } from "framer-motion";

/* Shared bits ---------------------------------------------------------- */

const nodeVariant = {
  hidden: { opacity: 0, y: 14, scale: 0.92 },
  show: (i) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { delay: 0.55 * i, duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  }),
};

function Node({ i, tone = "neutral", children, className = "" }) {
  const tones = {
    neutral: "border-[var(--line)] bg-[var(--bg-raised)] text-[var(--ink)]",
    bad: "border-[var(--danger)]/60 bg-[var(--bg-raised)] text-[var(--danger)]",
    good: "border-[var(--green)]/70 bg-[var(--accent-soft)] text-[var(--ink)]",
  };
  return (
    <motion.div
      custom={i}
      variants={nodeVariant}
      initial="hidden"
      animate="show"
      className={`rounded-xl border px-3 py-2 text-[13px] leading-snug font-medium shadow-sm ${tones[tone]} ${className}`}
    >
      {children}
    </motion.div>
  );
}

function Arrow({ i, down = false, good = false }) {
  return (
    <motion.div
      custom={i}
      variants={nodeVariant}
      initial="hidden"
      animate="show"
      className={`flex items-center justify-center ${down ? "py-0.5" : "px-0.5"}`}
      aria-hidden
    >
      <svg
        width={down ? 14 : 22}
        height={down ? 22 : 14}
        viewBox={down ? "0 0 14 22" : "0 0 22 14"}
        className="overflow-visible"
      >
        {down ? (
          <>
            <line x1="7" y1="1" x2="7" y2="15" className="flow-line" stroke={good ? "var(--green)" : "var(--ink-faint)"} strokeWidth="2" />
            <path d="M2 13 L7 20 L12 13" fill="none" stroke={good ? "var(--green)" : "var(--ink-faint)"} strokeWidth="2" strokeLinecap="round" />
          </>
        ) : (
          <>
            <line x1="1" y1="7" x2="15" y2="7" className="flow-line" stroke={good ? "var(--green)" : "var(--ink-faint)"} strokeWidth="2" />
            <path d="M13 2 L20 7 L13 12" fill="none" stroke={good ? "var(--green)" : "var(--ink-faint)"} strokeWidth="2" strokeLinecap="round" />
          </>
        )}
      </svg>
    </motion.div>
  );
}

function ScanLabel({ text }) {
  return (
    <motion.p
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 1, 1, 0.6] }}
      transition={{ duration: 1.6 }}
      className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--ink-faint)] mb-4"
    >
      <span className="inline-block h-2 w-2 rounded-full bg-[var(--accent)] mr-2 animate-pulse" />
      {text}
    </motion.p>
  );
}

/* A — lead-response flow chart, builds left to right ------------------- */

function DiagnosisA() {
  return (
    <div>
      <ScanLabel text="diagnosing · lead response gap" />
      <div className="flex flex-wrap items-center gap-y-2">
        <Node i={0} tone="bad">Lead comes in</Node>
        <Arrow i={0.6} />
        <Node i={1.2} tone="bad">Nobody available</Node>
        <Arrow i={1.8} />
        <Node i={2.4} tone="bad">Lead goes cold</Node>
        <Arrow i={3} />
        <Node i={3.6} tone="bad" className="font-mono">Revenue: $0</Node>
      </div>
      <div className="flex justify-center"><Arrow i={4.4} down good /></div>
      <div className="flex flex-wrap items-center gap-y-2">
        <Node i={5} tone="good">AI captures instantly</Node>
        <Arrow i={5.6} good />
        <Node i={6.2} tone="good">Routes to best rep</Node>
        <Arrow i={6.8} good />
        <Node i={7.4} tone="good">Lead converts ✓</Node>
      </div>
    </div>
  );
}

/* B — stacked cards that flip ------------------------------------------ */

function DiagnosisB() {
  return (
    <div>
      <ScanLabel text="diagnosing · demand blindness" />
      <div className="relative" style={{ perspective: 1100 }}>
        <motion.div
          initial={{ rotateX: 0 }}
          animate={{ rotateX: 180 }}
          transition={{ delay: 4.6, duration: 1, ease: [0.7, 0, 0.3, 1] }}
          style={{ transformStyle: "preserve-3d" }}
          className="relative"
        >
          {/* front — the problem */}
          <div style={{ backfaceVisibility: "hidden" }} className="flex flex-col items-stretch gap-0">
            <Node i={0} tone="bad">Busy week → overstaffed → margins crushed</Node>
            <div className="flex justify-center"><Arrow i={0.7} down /></div>
            <Node i={1.4} tone="bad">Slow week → understaffed → leads lost</Node>
            <div className="flex justify-center"><Arrow i={2.1} down /></div>
            <Node i={2.8} tone="bad" className="text-center">Same revenue. No predictability.</Node>
          </div>
          {/* back — the fix */}
          <div
            style={{ backfaceVisibility: "hidden", transform: "rotateX(180deg)" }}
            className="absolute inset-0 flex flex-col items-stretch justify-between"
          >
            <Node i={8.6} tone="good">Demand forecast → right staff, right time</Node>
            <div className="flex justify-center"><Arrow i={9} down good /></div>
            <Node i={9.4} tone="good">Busy week → ready. Slow week → lean.</Node>
            <div className="flex justify-center"><Arrow i={9.8} down good /></div>
            <Node i={10.2} tone="good" className="text-center">Margins hold. Every month. ✓</Node>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

/* C — horizontal timeline ---------------------------------------------- */

function DiagnosisC() {
  return (
    <div>
      <ScanLabel text="diagnosing · unsupported AI decay" />
      <div className="flex flex-wrap items-center gap-y-2">
        <Node i={0}>Bought AI</Node>
        <Arrow i={0.6} />
        <Node i={1.2}>Worked great</Node>
        <Arrow i={1.8} />
        <Node i={2.4} tone="bad">Started slipping</Node>
        <Arrow i={3} />
        <Node i={3.6} tone="bad">Now I'm the IT guy</Node>
      </div>
      <div className="flex justify-center"><Arrow i={4.4} down good /></div>
      <div className="flex flex-wrap items-center gap-y-2">
        <Node i={5} tone="good">Bought AI</Node>
        <Arrow i={5.6} good />
        <Node i={6.2} tone="good">Works great</Node>
        <Arrow i={6.8} good />
        <Node i={7.4} tone="good">Stays great ✓</Node>
      </div>
      <Node i={8.2} tone="good" className="mt-2 text-center font-mono text-[11px]!">
        ongoing support + updates + monitoring
      </Node>
    </div>
  );
}

/* Wrapper --------------------------------------------------------------- */

export default function Diagnosis({ pain }) {
  return (
    <AnimatePresence mode="wait">
      {pain && (
        <motion.div
          key={pain}
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.4 }}
          className="overflow-hidden"
        >
          <div className="card mt-6 p-5 sm:p-7" style={{ boxShadow: "var(--shadow)" }}>
            {pain === "A" && <DiagnosisA />}
            {pain === "B" && <DiagnosisB />}
            {pain === "C" && <DiagnosisC />}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
