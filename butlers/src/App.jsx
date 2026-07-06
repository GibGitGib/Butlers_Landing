import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence, useScroll, useSpring, useTransform, useInView } from "framer-motion";
import Diagnosis from "./Diagnosis.jsx";
import ChatBot from "./ChatBot.jsx";
import "./App.css";

/* ================= content ================= */

const IMG = {
  heroButler: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1600&q=75&auto=format&fit=crop",
  jim: "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=640&q=70&auto=format&fit=crop",
  janet: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=640&q=70&auto=format&fit=crop",
  allen: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=640&q=70&auto=format&fit=crop",
  butler: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=640&q=70&auto=format&fit=crop",
  team: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=1200&q=70&auto=format&fit=crop",
};

const PAIN_CARDS = [
  {
    id: "A",
    name: "Jim",
    tag: "Leads go cold",
    emoji: "📞",
    photo: IMG.jim,
    photoAlt: "Jim, mid-service, plating dishes under kitchen heat lamps",
    body: "Jim runs a catering service. When he's on an event, it's all hands on deck. Leads come in. Nobody answers. By the time he surfaces, they've gone cold. His pipeline freezes every time he does his actual job.",
  },
  {
    id: "B",
    name: "Janet",
    tag: "Feast or famine",
    emoji: "📊",
    photo: IMG.janet,
    photoAlt: "Janet at her office window, laptop in hand",
    body: "Janet uses AI. Has the tools. But somehow she's still either overstaffed on a slow week or drowning on a busy one. The pattern never levels out. She can't predict demand, so she can't schedule for it.",
  },
  {
    id: "C",
    name: "Allen",
    tag: "AI that rusts",
    emoji: "🤖",
    photo: IMG.allen,
    photoAlt: "Allen hunched over a workbench of tools and diagrams",
    body: "Allen got AI. It worked. For a while. Now he spends his time either teaching it new tricks or begging it to work like it did on day one. He bought the future and it's already rusting.",
  },
];

const ACKNOWLEDGE = {
  A: "You're not alone. Most owners lose leads to silence, not competitors. The phone rings. Nobody's there. The lead dies. That's what we fix.",
  B: "You're not alone. The feast-or-famine cycle isn't a staffing problem. It's a visibility problem. You can't schedule what you can't see. That's what we fix.",
  C: "You're not alone. Most AI degrades without support. You bought a solution and inherited a maintenance job. That's not the deal. That's what we fix.",
};

const STEPS = {
  "Revenue Up": { icon: "↗", blurb: "Every lead answered in seconds, routed to the right person, followed up until it closes. Nothing dies in silence anymore.", num: "01" },
  "Waste Down": { icon: "◎", blurb: "See demand before it hits. Staff for the week you're actually going to have — not the one you're afraid of.", num: "02" },
  "Same Hours": { icon: "◷", blurb: "The system runs while you work. No new dashboards to babysit, no second job as your own IT department.", num: "03" },
  "More Life": { icon: "☀", blurb: "Predictable months mean plannable weekends. The business finally works for you, not the other way around.", num: "04" },
};

const STEP_ORDER = {
  A: ["Revenue Up", "Waste Down", "Same Hours", "More Life"],
  B: ["Waste Down", "Same Hours", "Revenue Up", "More Life"],
  C: ["Waste Down", "More Life", "Revenue Up", "Same Hours"],
  default: ["Revenue Up", "Waste Down", "Same Hours", "More Life"],
};

const ENGINES = ["Products / Inventory", "Services / Advice", "50/50 Both"];
const VISIBILITY = ["I check at close", "Gut feel", "I track but still leaking"];

const VERTICALS = {
  "Products / Inventory": ["Retail & E-commerce", "Food & Beverage", "Auto & Parts", "Building & Trade Supply", "Other products"],
  "Services / Advice": ["Catering & Events", "Home Services", "Health & Wellness", "Professional Services", "Creative & Agency", "Other services"],
  "50/50 Both": ["Restaurant & Café", "Salon & Spa", "Repair & Install", "Fitness & Studio", "Other hybrid"],
};

const AUDIT_ITEMS = [
  "Every lead gets a reply in minutes",
  "I can predict next month's revenue",
  "Staffing matches actual demand",
  "My tools maintain themselves",
  "I know my most profitable work",
  "Follow-ups happen without me",
  "I take real time off",
];

const AUDIT_STATES = [
  null,
  { key: "want", label: "Want", icon: "⬡", color: "var(--blue)" },
  { key: "needs", label: "Needs improving", icon: "⚡", color: "var(--orange)" },
  { key: "done", label: "Satisfied", icon: "✓", color: "var(--green)" },
];

/* ================= SVG pieces ================= */

function WaveDivider({ flip = false, color = "var(--bg)" }) {
  return (
    <div className={flip ? "wave-bottom" : "wave-top"}>
      <svg viewBox="0 0 1440 48" preserveAspectRatio="none">
        <path d="M0 24 C360 48 720 0 1080 24 C1260 36 1380 12 1440 24 L1440 48 L0 48Z" fill={color} />
      </svg>
    </div>
  );
}

function RadarSweep({ size = 120 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" className="opacity-20">
      <circle cx="60" cy="60" r="55" fill="none" stroke="var(--line)" strokeWidth="1" />
      <circle cx="60" cy="60" r="38" fill="none" stroke="var(--line)" strokeWidth="0.5" strokeDasharray="3 3" />
      <circle cx="60" cy="60" r="20" fill="none" stroke="var(--line)" strokeWidth="0.5" />
      <line x1="60" y1="5" x2="60" y2="115" stroke="var(--line)" strokeWidth="0.5" opacity="0.4" />
      <line x1="5" y1="60" x2="115" y2="60" stroke="var(--line)" strokeWidth="0.5" opacity="0.4" />
      <motion.line
        x1="60" y1="60" x2="60" y2="8"
        stroke="var(--accent)"
        strokeWidth="1.5"
        strokeLinecap="round"
        style={{ transformOrigin: "60px 60px" }}
        animate={{ rotate: 360 }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
      />
      <circle cx="60" cy="60" r="3" fill="var(--accent)" />
    </svg>
  );
}

function GaugeArc({ pct = 0.7, label = "" }) {
  const r = 42;
  const circ = 2 * Math.PI * r;
  const dashLen = circ * 0.75;
  return (
    <div className="relative inline-flex flex-col items-center">
      <svg width="100" height="80" viewBox="0 0 100 90">
        <path d="M10 75 A42 42 0 1 1 90 75" fill="none" stroke="var(--line)" strokeWidth="4" strokeLinecap="round" opacity="0.3" />
        <motion.path
          d="M10 75 A42 42 0 1 1 90 75"
          fill="none"
          stroke="var(--accent)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={dashLen}
          initial={{ strokeDashoffset: dashLen }}
          whileInView={{ strokeDashoffset: dashLen * (1 - pct) }}
          viewport={{ once: true }}
          transition={{ duration: 1.5, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
      {label && <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--ink-faint)] -mt-2">{label}</span>}
    </div>
  );
}

/* ================= animation helpers ================= */

const ease = [0.22, 1, 0.36, 1];

function Reveal({ children, delay = 0, className = "", blur = false }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, filter: blur ? "blur(6px)" : "blur(0px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.8, delay, ease }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function WordReveal({ text, className = "", delay = 0 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const words = text.split(" ");
  return (
    <span ref={ref} className={className}>
      {words.map((w, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 14, filter: "blur(3px)" }}
          animate={inView ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
          transition={{ duration: 0.45, delay: delay + i * 0.055, ease }}
          className="inline-block mr-[0.25em]"
        >
          {w}
        </motion.span>
      ))}
    </span>
  );
}

function Parallax({ children, speed = 0.15, className = "" }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [speed * 100, speed * -100]);
  return (
    <motion.div ref={ref} style={{ y }} className={className}>
      {children}
    </motion.div>
  );
}

function ScaleIn({ children, delay = 0, className = "" }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85, filter: "blur(8px)" }}
      whileInView={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, delay, ease }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function SlideIn({ children, delay = 0, from = "left", className = "" }) {
  const x = from === "left" ? -50 : 50;
  return (
    <motion.div
      initial={{ opacity: 0, x, filter: "blur(4px)" }}
      whileInView={{ opacity: 1, x: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, delay, ease }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function Kicker({ n, children }) {
  return (
    <SlideIn from="left">
      <div className="relative mb-6">
        <span className="big-number -left-3 -top-10 sm:-left-8">{String(n).padStart(2, "0")}</span>
        <p className="font-mono relative text-[11px] uppercase tracking-[0.25em] text-[var(--ink-faint)]">
          {children}
        </p>
      </div>
    </SlideIn>
  );
}

function EmailCapture({ prompt = "Want the full breakdown? Drop your email.", compact = false }) {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  if (done)
    return (
      <motion.p initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-[13px] font-medium text-[var(--green)]">
        ✓ You're in. Breakdown incoming.
      </motion.p>
    );
  return (
    <form
      onSubmit={(e) => { e.preventDefault(); if (/.+@.+\..+/.test(email)) setDone(true); }}
      className={compact ? "" : "mt-3"}
    >
      <p className="mb-2 text-[13px] text-[var(--ink-soft)]">{prompt}</p>
      <div className="flex gap-2">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@business.com"
          className="min-w-0 flex-1 rounded-xl border border-[var(--line)] bg-[var(--bg-raised)] px-3 py-2.5 text-sm outline-none focus:border-[var(--accent)] focus:shadow-[0_0_0_3px_var(--accent-glow)]"
        />
        <button className="btn-primary shrink-0 rounded-xl px-4 py-2.5 text-sm font-semibold">Send it</button>
      </div>
    </form>
  );
}

/* ================= app ================= */

export default function App() {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem("bb-theme");
    if (saved) return saved;
    return matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("bb-theme", theme);
  }, [theme]);

  const [pain, setPain] = useState(null);
  const [engine, setEngine] = useState(null);
  const [visibility, setVisibility] = useState(null);
  const [vertical, setVertical] = useState(null);
  const [audit, setAudit] = useState({});
  const [skipped, setSkipped] = useState(false);

  const profile = { pain, engine, visibility, vertical, audit };
  const stepOrder = STEP_ORDER[pain] ?? STEP_ORDER.default;
  const painCard = PAIN_CARDS.find((c) => c.id === pain);

  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 90, damping: 26 });

  const breadcrumbs = [painCard && painCard.tag, engine, visibility, vertical].filter(Boolean);

  const insight = useMemo(() => {
    if (!engine || !visibility) return null;
    const painLine = {
      A: "leads dying while you're heads-down",
      B: "staffing a week you can't see coming",
      C: "maintaining AI instead of using it",
      null: "an invisible pattern eating your margin",
    }[pain ?? null];
    const visLine = {
      "I check at close": "You look back at the day when it's already over — that's a rear-view mirror, not a windshield.",
      "Gut feel": "Your gut got you this far. But gut feel doesn't scale, and it doesn't take vacations.",
      "I track but still leaking": "You have numbers. What you don't have is the pattern behind them — that's the leak.",
    }[visibility];
    return {
      headline: `${vertical ?? engine}, running on ${visibility.toLowerCase()}`,
      body: `${visLine} Pair that with ${painLine}, and the fix isn't working harder — it's finally seeing the pattern. That's step one of four.`,
    };
  }, [pain, engine, visibility, vertical]);

  const auditCounts = useMemo(() => {
    const c = { want: 0, needs: 0, done: 0 };
    Object.values(audit).forEach((s) => { if (s) c[AUDIT_STATES[s].key]++; });
    return c;
  }, [audit]);

  const heroRef = useRef(null);
  const { scrollYProgress: heroScroll } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(heroScroll, [0, 1], [0, 180]);
  const heroOpacity = useTransform(heroScroll, [0, 0.6], [1, 0]);
  const heroScale = useTransform(heroScroll, [0, 1], [1, 0.88]);

  return (
    <div className="grain">
      {/* scroll progress */}
      <motion.div
        className="fixed left-0 top-0 z-50 h-[3px] w-full origin-left"
        style={{
          scaleX: progress,
          background: "linear-gradient(90deg, var(--accent), var(--accent-bright), var(--tan))",
        }}
      />

      {/* header — glass morphism */}
      <header className="fixed top-0 z-40 flex w-full items-center justify-between px-5 py-3">
        <a
          href="#top"
          className="font-display rounded-full border border-[var(--line)] bg-[var(--bg)]/80 px-4 py-2 text-sm font-semibold tracking-wide backdrop-blur-md"
        >
          Business <span className="hand-underline italic text-[var(--accent)]">Butlers</span>
        </a>
        <button
          onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
          aria-label="Toggle color theme"
          className="chip flex h-10 w-10 items-center justify-center text-base backdrop-blur-md"
        >
          {theme === "dark" ? "☀" : "☾"}
        </button>
      </header>

      {/* sticky breadcrumbs */}
      <AnimatePresence>
        {breadcrumbs.length > 0 && (
          <motion.div
            initial={{ y: -40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -40, opacity: 0 }}
            className="fixed top-14 z-40 flex w-full justify-center px-5"
          >
            <div
              className="flex max-w-full items-center gap-2 overflow-x-auto rounded-full border border-[var(--line)] bg-[var(--bg)]/85 px-4 py-2 backdrop-blur-md"
              style={{ boxShadow: "var(--shadow)" }}
            >
              {breadcrumbs.map((b, i) => (
                <motion.span
                  key={b}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.35, delay: i * 0.06, type: "spring", stiffness: 300 }}
                  className="flex shrink-0 items-center gap-1.5 text-[11px] font-medium text-[var(--ink-soft)]"
                >
                  {i > 0 && <span className="text-[var(--line)]">/</span>}
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--accent)]" /> {b}
                </motion.span>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main id="top">
        {/* ═══════ 1 — HERO ═══════ */}
        <section ref={heroRef} className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden px-5 text-center">
          {/* cinematic photo backdrop — the butler, composed and ready */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <motion.img
              src={IMG.heroButler}
              alt=""
              aria-hidden
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{ duration: 2.2, delay: 0.4 }}
              className="photo-grade ken-burns h-full w-full object-cover"
            />
            {/* fade the photo into the page so type stays readable */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(180deg, var(--bg) 0%, transparent 30%, transparent 55%, var(--bg) 92%), radial-gradient(ellipse 90% 70% at 50% 52%, color-mix(in srgb, var(--bg) 72%, transparent) 30%, transparent 100%)",
              }}
            />
          </div>
          {/* background glow */}
          <div className="pointer-events-none absolute inset-0" style={{ background: "var(--hero-gradient)" }} />
          {/* floating radar */}
          <div className="pointer-events-none absolute right-6 top-24 sm:right-16 sm:top-20 opacity-40">
            <Parallax speed={-0.2}><RadarSweep size={140} /></Parallax>
          </div>
          {/* floating blobs */}
          <div className="blob blob-accent absolute -left-20 top-1/4 h-64 w-64" />
          <div className="blob blob-tan absolute -right-16 bottom-1/3 h-48 w-48" />

          <motion.div style={{ y: heroY, opacity: heroOpacity, scale: heroScale }}>
            <motion.p
              initial={{ opacity: 0, letterSpacing: "0.6em" }}
              animate={{ opacity: 1, letterSpacing: "0.3em" }}
              transition={{ delay: 0.2, duration: 1.4, ease }}
              className="font-mono mb-8 text-[10px] uppercase text-[var(--ink-faint)] sm:text-[11px]"
            >
              for owners who do the actual work
            </motion.p>
            <h1 className="font-display max-w-4xl text-[clamp(2.8rem,11vw,6rem)] leading-[0.92] font-black tracking-tight">
              {["Don't", "simply", "own"].map((w, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, y: 60, rotateX: 50, filter: "blur(10px)" }}
                  animate={{ opacity: 1, y: 0, rotateX: 0, filter: "blur(0px)" }}
                  transition={{ delay: 0.3 + i * 0.15, duration: 0.9, ease }}
                  className="mr-[0.2em] inline-block"
                  style={{ perspective: 800 }}
                >
                  {w}
                </motion.span>
              ))}
              <br className="sm:hidden" />
              <motion.span
                initial={{ opacity: 0, y: 60, filter: "blur(10px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ delay: 0.75, duration: 0.9, ease }}
                className="inline-block font-extralight italic text-[var(--ink-soft)]"
              >
                your business.
              </motion.span>
              <br />
              <motion.span
                initial={{ opacity: 0, scale: 1.2, filter: "blur(16px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                transition={{ delay: 1.3, duration: 1.2, ease }}
                className="text-outline mt-3 inline-block"
              >
                Become the{" "}
                <span className="hand-underline">master.</span>
              </motion.span>
            </h1>

            {/* gauges beneath hero text */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2, duration: 0.8, ease }}
              className="mt-10 flex items-center justify-center gap-6 sm:gap-10"
            >
              <GaugeArc pct={0.3} label="leads" />
              <GaugeArc pct={0.45} label="demand" />
              <GaugeArc pct={0.25} label="uptime" />
            </motion.div>
          </motion.div>

          <motion.a
            href="#empathy"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.5 }}
            className="float-y absolute bottom-8 text-lg text-[var(--ink-faint)]"
            aria-label="Scroll down"
          >
            ↓
          </motion.a>
        </section>

        {/* ═══════ 2 — EMPATHY ═══════ */}
        <section id="empathy" className="relative overflow-hidden py-20 sm:py-32">
          <div className="blob blob-accent absolute -left-32 top-0 h-80 w-80" />
          <div className="mx-auto max-w-2xl px-5">
            <Kicker n={2}>we've seen your months</Kicker>
            <div className="font-display space-y-5 text-[clamp(1.6rem,7vw,2.8rem)] leading-[1.05] font-bold">
              <Parallax speed={0.06}>
                <Reveal blur><p><WordReveal text="Feast or famine months." /></p></Reveal>
              </Parallax>
              <Parallax speed={0.1}>
                <Reveal delay={0.15} blur><p className="text-[var(--ink-soft)] font-normal"><WordReveal text="No, you're not bad at business." delay={0.15} /></p></Reveal>
              </Parallax>
              <Parallax speed={0.14}>
                <Reveal delay={0.3} blur>
                  <p className="italic text-[var(--accent)]">
                    <span className="hand-underline"><WordReveal text="Just flying blind." delay={0.3} /></span>
                  </p>
                </Reveal>
              </Parallax>
            </div>
          </div>
          {/* scan line */}
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.5, delay: 0.8, ease }}
            className="scan-line mx-auto mt-16 max-w-md origin-left"
          />
        </section>

        {/* ═══════ 3 — ANSWER ═══════ */}
        <section id="answer" className="relative overflow-hidden bg-[var(--bg-soft)] py-20 sm:py-28">
          <WaveDivider color="var(--bg)" />
          <WaveDivider flip color="var(--bg)" />
          <div className="blob blob-tan absolute right-0 top-1/4 h-72 w-72" />
          <div className="pointer-events-none absolute inset-0" style={{ background: "var(--section-glow)" }} />

          <div className="relative mx-auto max-w-2xl px-5">
            <Kicker n={3}>the answer</Kicker>
            <Reveal blur>
              <p className="font-display text-[clamp(1.2rem,4.5vw,1.7rem)] leading-relaxed font-medium">
                <WordReveal text="Some months you swim. Some months you sweat. The work never changed." />
                {" "}
                <em className="font-semibold text-[var(--accent)]"><WordReveal text="The pattern was always invisible. Until now." delay={0.6} /></em>
              </p>
            </Reveal>
            <SlideIn from="left" delay={0.25}>
              <p className="mt-8 max-w-lg text-[15px] leading-relaxed text-[var(--ink-soft)]">
                The answer is simple, not easy, but you already knew that. We'll take you through our
                four-step Business Butler process.
              </p>
            </SlideIn>

            {/* four pillars — bold typographic treatment */}
            <Reveal delay={0.35}>
              <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {["Revenue up.", "Waste down.", "Same hours.", "More life."].map((t, i) => (
                  <motion.div
                    key={t}
                    initial={{ opacity: 0, y: 16, scale: 0.9 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5 + i * 0.15, duration: 0.5, ease }}
                    className="card flex flex-col items-center justify-center p-4 text-center"
                    style={{ boxShadow: "var(--shadow-sm)" }}
                  >
                    <span className="font-display text-2xl font-black text-[var(--accent)] sm:text-3xl">{STEPS[Object.keys(STEPS)[i]].icon}</span>
                    <span className="font-mono mt-1 text-[10px] font-bold uppercase tracking-widest text-[var(--ink-soft)]">{t}</span>
                  </motion.div>
                ))}
              </div>
            </Reveal>
            <Reveal delay={0.6}>
              <p className="mt-6 text-center text-[14px] italic text-[var(--ink-faint)]">That's the system.</p>
            </Reveal>
          </div>
        </section>

        {/* ═══════ 4 — CHANGE ═══════ */}
        <section id="change" className="relative overflow-hidden py-20 sm:py-28">
          <div className="blob blob-accent absolute -right-24 top-12 h-72 w-72" />
          <div className="mx-auto max-w-2xl px-5">
            <Kicker n={4}>find yourself below</Kicker>
            <Reveal blur>
              <h2 className="font-display mb-3 text-[clamp(1.8rem,8vw,3rem)] font-black leading-tight sm:mb-4">
                Click what you need to{" "}
                <span className="hand-underline italic text-[var(--accent)]">master:</span>
              </h2>
            </Reveal>

            {/* cards — staggered, with emoji accent and visual depth */}
            <div className="mt-8 space-y-5">
              {PAIN_CARDS.map((c, i) => (
                <SlideIn key={c.id} delay={i * 0.1} from={i % 2 === 0 ? "left" : "right"}>
                  <button
                    onClick={() => setPain(c.id)}
                    className={`card card-tap group relative w-full overflow-hidden p-6 text-left ${pain === c.id ? "card-selected" : pain ? "opacity-40" : ""}`}
                    aria-pressed={pain === c.id}
                  >
                    {/* big bg emoji */}
                    <span className="pointer-events-none absolute -right-3 -top-2 text-[5rem] opacity-[0.06] transition-opacity group-hover:opacity-[0.12]">
                      {c.emoji}
                    </span>
                    <div className="relative">
                      <div className="mb-3 flex items-center gap-3">
                        <span className="photo-frame h-14 w-14 shrink-0 rounded-2xl border border-[var(--line)]" style={{ boxShadow: "var(--shadow-sm)" }}>
                          <img src={c.photo} alt={c.photoAlt} loading="lazy" className="photo-portrait h-full w-full object-cover" />
                        </span>
                        <div>
                          <span className="font-display block text-xl font-bold leading-none">{c.name}</span>
                          <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--ink-faint)]">owner · operator</span>
                        </div>
                        <span className="chip ml-auto px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--ink-faint)]">
                          {c.tag}
                        </span>
                      </div>
                      <p className="text-[14px] leading-relaxed text-[var(--ink-soft)]">{c.body}</p>
                      {pain === c.id && (
                        <motion.div
                          layout
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: "auto" }}
                          className="font-mono mt-3 inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-[var(--accent-ink)]"
                        >
                          <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--accent-ink)]" /> this is me
                        </motion.div>
                      )}
                    </div>
                  </button>
                </SlideIn>
              ))}
            </div>

            <Diagnosis pain={pain} />
          </div>
        </section>

        {/* ═══════ 5 — ACKNOWLEDGE ═══════ */}
        <AnimatePresence>
          {pain && (
            <motion.section
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="relative overflow-hidden"
            >
              <div className="mx-auto max-w-2xl px-5 py-12 sm:py-16">
                <motion.div
                  key={pain}
                  initial={{ opacity: 0, x: -40, filter: "blur(8px)" }}
                  animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                  transition={{ duration: 0.8, ease }}
                  className="relative rounded-2xl border-l-4 border-[var(--accent)] bg-[var(--accent-soft)] p-6 sm:p-8"
                  style={{ boxShadow: "var(--shadow)" }}
                >
                  <span className="big-number -right-2 -top-6 text-[var(--accent)]" style={{ opacity: 0.06 }}>!</span>
                  <div className="relative flex items-start gap-4 sm:gap-5">
                    <motion.span
                      initial={{ opacity: 0, scale: 0.6, rotate: -6 }}
                      animate={{ opacity: 1, scale: 1, rotate: -3 }}
                      transition={{ delay: 0.3, type: "spring", stiffness: 200, damping: 16 }}
                      className="photo-frame mt-1 hidden h-20 w-20 shrink-0 rounded-2xl border-2 border-[var(--bg-raised)] sm:block"
                      style={{ boxShadow: "var(--shadow)" }}
                    >
                      <img src={painCard?.photo} alt={painCard?.photoAlt} loading="lazy" className="photo-grade h-full w-full object-cover" />
                    </motion.span>
                    <p className="font-display text-xl leading-relaxed sm:text-2xl">
                      <WordReveal text={ACKNOWLEDGE[pain]} />
                    </p>
                  </div>
                </motion.div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* ═══════ 6 — WALKTHROUGH ═══════ */}
        <section id="steps" className="relative overflow-hidden bg-[var(--bg-soft)] py-20 sm:py-28">
          <WaveDivider color="var(--bg)" />
          <WaveDivider flip color="var(--bg)" />
          <div className="pointer-events-none absolute inset-0" style={{ background: "var(--section-glow)" }} />

          <div className="relative mx-auto max-w-2xl px-5">
            <Kicker n={6}>the four steps{pain ? " — ordered for you" : ""}</Kicker>
            <Reveal blur>
              <h2 className="font-display mb-10 text-[clamp(1.8rem,8vw,3rem)] font-black leading-tight">
                The Butler <span className="hand-underline italic text-[var(--accent)]">process.</span>
              </h2>
            </Reveal>
            <div className="space-y-6">
              <AnimatePresence mode="popLayout">
                {stepOrder.map((title, i) => (
                  <motion.div
                    layout
                    key={title}
                    initial={{ opacity: 0, y: 40, scale: 0.93, filter: "blur(5px)" }}
                    whileInView={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{ duration: 0.7, delay: i * 0.08, layout: { duration: 0.5, ease } }}
                    className="card group relative overflow-hidden p-6"
                    style={{ boxShadow: "var(--shadow-sm)" }}
                  >
                    {/* big step number watermark */}
                    <span className="big-number -right-2 -top-4">{STEPS[title].num}</span>
                    <div className="relative flex items-start gap-5">
                      <motion.div
                        initial={{ rotate: -180, scale: 0 }}
                        whileInView={{ rotate: 0, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.15 + i * 0.08, type: "spring", stiffness: 200 }}
                        className="gauge-ring flex h-14 w-14 shrink-0 items-center justify-center text-xl"
                        style={{ borderColor: "var(--accent)" }}
                      >
                        <span className="font-display text-2xl text-[var(--accent)]">{STEPS[title].icon}</span>
                      </motion.div>
                      <div className="min-w-0 flex-1">
                        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--ink-faint)]">
                          step {i + 1}{pain && i === 0 ? " · your biggest lever" : ""}
                        </p>
                        <h3 className="font-display text-2xl font-bold">{title}</h3>
                        <p className="mt-2 text-[14px] leading-relaxed text-[var(--ink-soft)]">{STEPS[title].blurb}</p>
                        <details className="group mt-4">
                          <summary className="cursor-pointer list-none text-[12px] font-semibold text-[var(--accent)] underline decoration-wavy underline-offset-4">
                            Not ready to talk? Get this step by email instead
                          </summary>
                          <div className="mt-3"><EmailCapture compact /></div>
                        </details>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </section>

        {/* ═══════ 7 — PERSONALIZE (placeholder) ═══════ */}
        <section id="personalize" className="py-12 sm:py-16">
          <div className="mx-auto max-w-2xl px-5">
            <ScaleIn>
              <div className="card relative flex items-center gap-5 overflow-hidden border-dashed p-6" style={{ boxShadow: "var(--shadow-sm)" }}>
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ type: "spring", stiffness: 300, damping: 18 }}
                  className="photo-frame relative h-16 w-16 shrink-0 rounded-full border-2 border-[var(--accent)]"
                  style={{ boxShadow: "var(--shadow)" }}
                >
                  <img src={IMG.butler} alt="Your Butler" loading="lazy" className="photo-grade h-full w-full rounded-full object-cover" />
                  <span className="absolute -bottom-1 -right-1 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-[var(--accent)] text-[10px] text-[var(--accent-ink)]">▶</span>
                </motion.div>
                <div>
                  <p className="font-display text-lg font-bold">
                    A word from a Butler{" "}
                    <span className="ml-1 inline-block rounded-full bg-[var(--tan-soft)] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--tan)]">coming soon</span>
                  </p>
                  <p className="mt-1 text-[13px] text-[var(--ink-soft)]">60-second audio walkthrough tailored to what you tapped above.</p>
                </div>
              </div>
            </ScaleIn>
          </div>
        </section>

        {/* ═══════ 8 — QUALIFY HARVEST ═══════ */}
        <section id="qualify" className="relative overflow-hidden bg-[var(--bg-soft)] py-20 sm:py-28">
          <WaveDivider color="var(--bg)" />
          <WaveDivider flip color="var(--bg)" />
          <div className="blob blob-accent absolute left-1/2 top-0 h-96 w-96 -translate-x-1/2" />
          <div className="pointer-events-none absolute inset-0" style={{ background: "var(--section-glow)" }} />

          <div className="relative mx-auto max-w-2xl px-5">
            <Kicker n={8}>90 seconds · zero typing</Kicker>
            <Reveal blur>
              <h2 className="font-display mb-2 text-[clamp(1.8rem,8vw,3rem)] font-black leading-tight">
                Tell us by <span className="hand-underline italic text-[var(--accent)]">tapping.</span>
              </h2>
              <p className="mb-10 max-w-md text-[14px] text-[var(--ink-soft)]">
                Everything you tap carries into your assessment — so you never repeat yourself.{" "}
                {!skipped && (
                  <button onClick={() => setSkipped(true)} className="text-[var(--accent)] underline decoration-wavy underline-offset-4">
                    or skip straight to the buttons ↓
                  </button>
                )}
              </p>
            </Reveal>

            {!skipped && (
              <div className="space-y-12">
                {/* 8a */}
                <SlideIn from="left">
                  <p className="font-display mb-4 text-xl font-bold">What's your engine?</p>
                  <div className="flex flex-wrap gap-3">
                    {ENGINES.map((e, i) => (
                      <motion.button
                        key={e}
                        initial={{ opacity: 0, y: 12 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 + i * 0.08, duration: 0.4 }}
                        onClick={() => { setEngine(e); setVertical(null); }}
                        className={`chip px-5 py-3 text-[13px] font-semibold ${engine === e ? "chip-on" : ""}`}
                      >
                        {e}
                      </motion.button>
                    ))}
                  </div>
                </SlideIn>

                {/* 8b */}
                <AnimatePresence>
                  {engine && (
                    <motion.div initial={{ opacity: 0, y: 24, filter: "blur(4px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} transition={{ duration: 0.5, ease }}>
                      <p className="font-display mb-4 text-xl font-bold">How do you see your numbers today?</p>
                      <div className="flex flex-wrap gap-3">
                        {VISIBILITY.map((v, i) => (
                          <motion.button
                            key={v}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.05 + i * 0.08, duration: 0.4 }}
                            onClick={() => setVisibility(v)}
                            className={`chip px-5 py-3 text-[13px] font-semibold ${visibility === v ? "chip-on" : ""}`}
                          >
                            {v}
                          </motion.button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* 8c */}
                <AnimatePresence>
                  {engine && visibility && (
                    <motion.div initial={{ opacity: 0, y: 24, filter: "blur(4px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} transition={{ duration: 0.5, ease }}>
                      <p className="font-display mb-4 text-xl font-bold">Which is closest to your world?</p>
                      <div className="flex flex-wrap gap-3">
                        {VERTICALS[engine].map((v, i) => (
                          <motion.button
                            key={v}
                            initial={{ opacity: 0, scale: 0.85 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.03 + i * 0.06, duration: 0.35 }}
                            onClick={() => setVertical(v)}
                            className={`chip px-5 py-3 text-[13px] font-semibold ${vertical === v ? "chip-on" : ""}`}
                          >
                            {v}
                          </motion.button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* 8d — insight card */}
                <AnimatePresence>
                  {insight && vertical && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9, y: 24, filter: "blur(10px)" }}
                      animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
                      transition={{ duration: 0.7, ease }}
                      className="card relative overflow-hidden border-[var(--accent)] p-6"
                      style={{ boxShadow: "var(--shadow-lg)" }}
                    >
                      <div className="pointer-events-none absolute inset-0" style={{ background: "var(--section-glow)" }} />
                      <div className="relative">
                        <div className="mb-3 flex items-center gap-3">
                          <RadarSweep size={48} />
                          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[var(--accent)]">◈ what we're seeing</p>
                        </div>
                        <p className="font-display text-xl font-bold">{insight.headline}</p>
                        <p className="mt-2 text-[14px] leading-relaxed text-[var(--ink-soft)]">{insight.body}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* 8e — self-audit */}
                <AnimatePresence>
                  {vertical && (
                    <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease }}>
                      <p className="font-display mb-2 text-xl font-bold">Last one — tap each line to rate it.</p>
                      <p className="mb-5 text-[12px] text-[var(--ink-faint)]">
                        Tap cycles: <span style={{ color: "var(--blue)" }}>⬡ Want</span> →{" "}
                        <span style={{ color: "var(--orange)" }}>⚡ Needs improving</span> →{" "}
                        <span style={{ color: "var(--green)" }}>✓ Satisfied</span>
                      </p>
                      <div className="space-y-2.5">
                        {AUDIT_ITEMS.map((item, idx) => {
                          const s = audit[idx] ?? 0;
                          const st = AUDIT_STATES[s];
                          return (
                            <motion.button
                              key={item}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: idx * 0.06, duration: 0.4, ease }}
                              onClick={() => setAudit((a) => ({ ...a, [idx]: ((a[idx] ?? 0) + 1) % 4 }))}
                              className="card card-tap flex w-full items-center justify-between gap-3 px-5 py-3.5 text-left"
                              style={st ? { borderColor: st.color, boxShadow: `0 0 0 1px ${st.color}22` } : undefined}
                            >
                              <span className="text-[14px] font-medium">{item}</span>
                              <AnimatePresence mode="wait">
                                <motion.span
                                  key={s}
                                  initial={{ scale: 0.3, opacity: 0, rotate: -30 }}
                                  animate={{ scale: 1, opacity: 1, rotate: 0 }}
                                  exit={{ scale: 0.3, opacity: 0, rotate: 30 }}
                                  transition={{ duration: 0.2, type: "spring", stiffness: 350 }}
                                  className="font-mono shrink-0 text-[12px] font-bold"
                                  style={{ color: st?.color ?? "var(--ink-faint)" }}
                                >
                                  {st ? `${st.icon} ${st.label}` : "· tap ·"}
                                </motion.span>
                              </AnimatePresence>
                            </motion.button>
                          );
                        })}
                      </div>
                      {auditCounts.want + auditCounts.needs + auditCounts.done > 2 && (
                        <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-5 text-[13px] text-[var(--ink-soft)]">
                          {auditCounts.want + auditCounts.needs > 0 ? (
                            <>
                              That's <strong className="text-[var(--accent)]">{auditCounts.want + auditCounts.needs} areas</strong>{" "}
                              the assessment will map for you — in about five minutes. ↓
                            </>
                          ) : (
                            <>All satisfied? Then let's protect it. The assessment shows you what to watch. ↓</>
                          )}
                        </motion.p>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </section>

        {/* ═══════ 9 — CTA HUB ═══════ */}
        <section id="cta" className="relative overflow-hidden py-20 pb-36 sm:py-28 sm:pb-40">
          <div className="blob blob-accent absolute left-1/2 top-8 h-80 w-80 -translate-x-1/2" />
          <div className="blob blob-tan absolute -right-16 bottom-0 h-64 w-64" />

          <div className="relative mx-auto max-w-2xl px-5">
            <Kicker n={9}>your move</Kicker>
            <Reveal blur>
              <h2 className="font-display mb-3 text-[clamp(2rem,9vw,3.5rem)] font-black leading-tight">
                Stop <span className="text-outline">flying</span>{" "}
                <span className="hand-underline italic text-[var(--accent)]">blind.</span>
              </h2>
            </Reveal>

            {/* the lean team — real people, not a queue */}
            <ScaleIn delay={0.1}>
              <div className="photo-frame mb-6 h-36 rounded-2xl border border-[var(--line)] sm:h-44" style={{ boxShadow: "var(--shadow)" }}>
                <motion.img
                  src={IMG.team}
                  alt="The Butlers team working side by side in a kitchen"
                  loading="lazy"
                  initial={{ scale: 1.12 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.6, ease }}
                  className="photo-grade h-full w-full object-cover"
                />
                <span className="font-mono absolute bottom-2.5 left-3 z-10 rounded-full bg-[var(--bg)]/85 px-3 py-1 text-[9px] uppercase tracking-[0.2em] text-[var(--ink-soft)] backdrop-blur-sm">
                  the actual humans behind your butler
                </span>
              </div>
            </ScaleIn>

            <Reveal delay={0.15}>
              <p className="mb-10 max-w-md text-[15px] text-[var(--ink-soft)]">
                We're a lean team on purpose — every client gets a Butler, not a queue.{" "}
                <strong className="text-[var(--ink)]">Limited slots this week.</strong>
              </p>
            </Reveal>

            <div className="space-y-5">
              <ScaleIn>
                <a
                  href="../intake-form.html"
                  className="btn-primary pulse-ring relative block overflow-hidden rounded-2xl p-7 text-center"
                  style={{ boxShadow: "var(--shadow-lg)" }}
                >
                  <motion.span
                    initial={{ opacity: 0, y: -10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3, type: "spring" }}
                    className="absolute -top-2.5 right-4 rounded-full bg-[var(--orange)] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-md"
                  >
                    Limited slots this week
                  </motion.span>
                  <span className="font-display block text-2xl font-black">Take Assessment Now</span>
                  <span className="mt-1 block text-[13px] opacity-80">5 minutes · your taps above carry over</span>
                </a>
              </ScaleIn>
              <SlideIn from="right" delay={0.1}>
                <a href="../intake-form.html" className="card card-tap block p-6 text-center" style={{ boxShadow: "var(--shadow-sm)" }}>
                  <span className="font-display block text-xl font-bold">Book For Later</span>
                  <span className="mt-1 block text-[13px] text-[var(--ink-soft)]">Pick a slot that fits around the actual work</span>
                </a>
              </SlideIn>
              <Reveal delay={0.2}>
                <a
                  href="../demo-report.html"
                  className="block p-4 text-center text-[14px] font-semibold text-[var(--ink-soft)] underline decoration-wavy underline-offset-4 hover:text-[var(--accent)]"
                >
                  Self Discovery — browse the breakdown on your own
                </a>
              </Reveal>
              <ScaleIn delay={0.25}>
                <div className="card p-6" style={{ boxShadow: "var(--shadow-sm)" }}>
                  <EmailCapture prompt="Not today? Take the four-step breakdown with you." />
                </div>
              </ScaleIn>
            </div>

            {/* footer mark */}
            <Reveal delay={0.3}>
              <div className="mt-20 flex flex-col items-center gap-3">
                <div className="flex items-center gap-3 opacity-30">
                  <div className="h-px w-12 bg-[var(--line)]" />
                  <RadarSweep size={32} />
                  <div className="h-px w-12 bg-[var(--line)]" />
                </div>
                <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-[var(--ink-faint)]">
                  Business Butlers · revenue up · waste down · same hours · more life
                </p>
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      <ChatBot profile={profile} />
    </div>
  );
}
