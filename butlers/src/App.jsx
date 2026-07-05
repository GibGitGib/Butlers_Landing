import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence, useScroll, useSpring } from "framer-motion";
import Diagnosis from "./Diagnosis.jsx";
import ChatBot from "./ChatBot.jsx";
import "./App.css";

/* ================= content ================= */

const PAIN_CARDS = [
  {
    id: "A",
    name: "Jim",
    tag: "Leads go cold",
    body: "Jim runs a catering service. When he's on an event, it's all hands on deck. Leads come in. Nobody answers. By the time he surfaces, they've gone cold. His pipeline freezes every time he does his actual job.",
  },
  {
    id: "B",
    name: "Janet",
    tag: "Feast or famine",
    body: "Janet uses AI. Has the tools. But somehow she's still either overstaffed on a slow week or drowning on a busy one. The pattern never levels out. She can't predict demand, so she can't schedule for it.",
  },
  {
    id: "C",
    name: "Allen",
    tag: "AI that rusts",
    body: "Allen got AI. It worked. For a while. Now he spends his time either teaching it new tricks or begging it to work like it did on day one. He bought the future and it's already rusting.",
  },
];

const ACKNOWLEDGE = {
  A: "You're not alone. Most owners lose leads to silence, not competitors. The phone rings. Nobody's there. The lead dies. That's what we fix.",
  B: "You're not alone. The feast-or-famine cycle isn't a staffing problem. It's a visibility problem. You can't schedule what you can't see. That's what we fix.",
  C: "You're not alone. Most AI degrades without support. You bought a solution and inherited a maintenance job. That's not the deal. That's what we fix.",
};

const STEPS = {
  "Revenue Up": { icon: "↗", blurb: "Every lead answered in seconds, routed to the right person, followed up until it closes. Nothing dies in silence anymore." },
  "Waste Down": { icon: "◎", blurb: "See demand before it hits. Staff for the week you're actually going to have — not the one you're afraid of." },
  "Same Hours": { icon: "◷", blurb: "The system runs while you work. No new dashboards to babysit, no second job as your own IT department." },
  "More Life": { icon: "☀", blurb: "Predictable months mean plannable weekends. The business finally works for you, not the other way around." },
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

/* ================= helpers ================= */

function Section({ id, children, className = "" }) {
  return (
    <section id={id} className={`relative mx-auto w-full max-w-xl px-5 py-16 sm:py-24 ${className}`}>
      {children}
    </section>
  );
}

function Reveal({ children, delay = 0, className = "" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function Kicker({ n, children }) {
  return (
    <Reveal>
      <p className="font-mono mb-5 text-[11px] uppercase tracking-[0.25em] text-[var(--ink-faint)]">
        <span className="mr-2 text-[var(--accent)]">{String(n).padStart(2, "0")}</span>
        {children}
      </p>
    </Reveal>
  );
}

function EmailCapture({ prompt = "Want the full breakdown? Drop your email.", compact = false }) {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  if (done)
    return (
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[13px] font-medium text-[var(--green)]">
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
          className="min-w-0 flex-1 rounded-xl border border-[var(--line)] bg-[var(--bg-raised)] px-3 py-2.5 text-sm outline-none focus:border-[var(--accent)]"
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

  return (
    <div className="grain">
      {/* scroll progress */}
      <motion.div className="fixed left-0 top-0 z-50 h-[3px] w-full origin-left bg-[var(--accent)]" style={{ scaleX: progress }} />

      {/* header */}
      <header className="fixed top-0 z-40 flex w-full items-center justify-between px-5 py-4">
        <a href="#top" className="chip font-display px-3 py-1.5 text-sm font-semibold tracking-wide">
          Business <span className="italic text-[var(--accent)]">Butlers</span>
        </a>
        <button
          onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
          aria-label="Toggle color theme"
          className="chip flex h-9 w-9 items-center justify-center text-sm"
        >
          {theme === "dark" ? "☀" : "☾"}
        </button>
      </header>

      {/* sticky breadcrumbs of choices made so far */}
      <AnimatePresence>
        {breadcrumbs.length > 0 && (
          <motion.div
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -30, opacity: 0 }}
            className="fixed top-14 z-40 flex w-full justify-center px-5"
          >
            <div className="card flex max-w-full items-center gap-1.5 overflow-x-auto rounded-full px-3 py-1.5" style={{ boxShadow: "var(--shadow)" }}>
              {breadcrumbs.map((b, i) => (
                <span key={b} className="flex shrink-0 items-center gap-1.5 text-[11px] font-medium text-[var(--ink-soft)]">
                  {i > 0 && <span className="text-[var(--ink-faint)]">·</span>}
                  <span className="text-[var(--accent)]">✓</span> {b}
                </span>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main id="top">
        {/* 1 — HERO */}
        <section className="relative flex min-h-svh flex-col items-center justify-center px-5 text-center">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="font-mono mb-6 text-[11px] uppercase tracking-[0.3em] text-[var(--ink-faint)]"
          >
            for owners who do the actual work
          </motion.p>
          <h1 className="font-display max-w-3xl text-[clamp(2.6rem,10vw,5.5rem)] leading-[0.98] font-semibold tracking-tight">
            {["You're", "not", "bad"].map((w, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 40, rotate: 2 }}
                animate={{ opacity: 1, y: 0, rotate: 0 }}
                transition={{ delay: 0.3 + i * 0.12, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="mr-[0.22em] inline-block"
              >
                {w}
              </motion.span>
            ))}
            <motion.span
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.66, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="inline-block font-light italic"
            >
              at business.
            </motion.span>
            <br />
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.15, duration: 0.9 }}
              className="text-outline mt-2 inline-block"
            >
              You're just flying blind.
            </motion.span>
          </h1>
          <motion.a
            href="#empathy"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.9 }}
            className="float-y absolute bottom-8 text-[var(--ink-faint)]"
            aria-label="Scroll down"
          >
            ↓
          </motion.a>
        </section>

        {/* 2 — EMPATHY */}
        <Section id="empathy">
          <Kicker n={2}>we've seen your months</Kicker>
          <div className="font-display space-y-3 text-[clamp(1.5rem,6vw,2.4rem)] leading-tight font-medium">
            <Reveal><p>Feast or famine months.</p></Reveal>
            <Reveal delay={0.15}><p className="text-[var(--ink-soft)]">No, you're not bad at business.</p></Reveal>
            <Reveal delay={0.3}><p className="italic text-[var(--accent)]">Just flying blind.</p></Reveal>
          </div>
        </Section>

        {/* 3 — ANSWER */}
        <Section id="answer" className="max-w-none border-y border-[var(--line)] bg-[var(--bg-soft)]/60">
          <div className="mx-auto max-w-xl">
            <Kicker n={3}>the answer</Kicker>
            <Reveal>
              <p className="font-display text-xl leading-relaxed sm:text-2xl">
                Some months you swim. Some months you sweat. The work never changed.{" "}
                <em className="text-[var(--accent)]">The pattern was always invisible. Until now.</em>
              </p>
            </Reveal>
            <Reveal delay={0.15}>
              <p className="mt-6 leading-relaxed text-[var(--ink-soft)]">
                The answer is simple, not easy, but you already knew that. We'll take you through our
                four-step Business Butler process.
              </p>
            </Reveal>
            <Reveal delay={0.25}>
              <p className="font-mono mt-6 flex flex-wrap gap-x-2 gap-y-1 text-[13px] font-semibold uppercase tracking-wide">
                {["Revenue up.", "Waste down.", "Same hours.", "More life."].map((t, i) => (
                  <motion.span
                    key={t}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 + i * 0.25 }}
                    className={i % 2 ? "text-[var(--tan)]" : "text-[var(--accent)]"}
                  >
                    {t}
                  </motion.span>
                ))}
                <span className="font-normal normal-case text-[var(--ink-soft)]">That's the system.</span>
              </p>
            </Reveal>
          </div>
        </Section>

        {/* 4 — CHANGE */}
        <Section id="change">
          <Kicker n={4}>find yourself below</Kicker>
          <Reveal>
            <h2 className="font-display mb-8 text-3xl font-semibold sm:text-4xl">
              Click what you need to <em className="italic text-[var(--accent)]">master:</em>
            </h2>
          </Reveal>
          <div className="space-y-4">
            {PAIN_CARDS.map((c, i) => (
              <Reveal key={c.id} delay={i * 0.1}>
                <button
                  onClick={() => setPain(c.id)}
                  className={`card card-tap w-full p-5 text-left ${pain === c.id ? "card-selected" : pain ? "opacity-50" : ""}`}
                  aria-pressed={pain === c.id}
                >
                  <div className="mb-2 flex items-center justify-between">
                    <span className="font-display text-lg font-semibold">{c.name}</span>
                    <span className="chip pointer-events-none px-2.5 py-1 text-[11px] font-medium text-[var(--ink-soft)]">
                      {c.tag}
                    </span>
                  </div>
                  <p className="text-[14px] leading-relaxed text-[var(--ink-soft)]">{c.body}</p>
                  {pain === c.id && (
                    <motion.p layout className="font-mono mt-3 text-[11px] uppercase tracking-widest text-[var(--accent)]">
                      ✓ this is me
                    </motion.p>
                  )}
                </button>
              </Reveal>
            ))}
          </div>

          <Diagnosis pain={pain} />
        </Section>

        {/* 5 — ACKNOWLEDGE */}
        <AnimatePresence>
          {pain && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Section id="acknowledge" className="py-10 sm:py-14">
                <motion.blockquote
                  key={pain}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="border-l-4 border-[var(--accent)] pl-5"
                >
                  <p className="font-display text-xl leading-relaxed sm:text-2xl">{ACKNOWLEDGE[pain]}</p>
                </motion.blockquote>
              </Section>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 6 — WALKTHROUGH */}
        <Section id="steps">
          <Kicker n={6}>the four steps{pain ? " — ordered for you" : ""}</Kicker>
          <Reveal>
            <h2 className="font-display mb-8 text-3xl font-semibold sm:text-4xl">The Butler process.</h2>
          </Reveal>
          <div className="space-y-5">
            <AnimatePresence mode="popLayout">
              {stepOrder.map((title, i) => (
                <motion.div
                  layout
                  key={title}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.55, layout: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } }}
                  className="card p-5"
                >
                  <div className="flex items-start gap-4">
                    <span className="font-display flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--accent-soft)] text-lg text-[var(--accent)]">
                      {STEPS[title].icon}
                    </span>
                    <div className="min-w-0">
                      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--ink-faint)]">
                        step {i + 1}{pain && i === 0 ? " · your biggest lever" : ""}
                      </p>
                      <h3 className="font-display text-xl font-semibold">{title}</h3>
                      <p className="mt-1.5 text-[14px] leading-relaxed text-[var(--ink-soft)]">{STEPS[title].blurb}</p>
                      <details className="group mt-3">
                        <summary className="cursor-pointer list-none text-[12px] font-medium text-[var(--accent)] underline underline-offset-4">
                          Not ready to talk? Get this step by email instead
                        </summary>
                        <div className="mt-2"><EmailCapture compact /></div>
                      </details>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </Section>

        {/* 7 — PERSONALIZE (placeholder) */}
        <Section id="personalize" className="py-10 sm:py-14">
          <Reveal>
            <div className="card flex items-center gap-4 border-dashed p-5 opacity-80">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--accent-soft)] text-xl">▶</span>
              <div>
                <p className="font-display font-semibold">
                  A word from a Butler{" "}
                  <span className="chip ml-1 px-2 py-0.5 text-[10px] text-[var(--ink-faint)]">coming soon</span>
                </p>
                <p className="text-[13px] text-[var(--ink-soft)]">60-second audio walkthrough tailored to what you tapped above.</p>
              </div>
            </div>
          </Reveal>
        </Section>

        {/* 8 — QUALIFY HARVEST */}
        <Section id="qualify" className="max-w-none border-y border-[var(--line)] bg-[var(--bg-soft)]/60">
          <div className="mx-auto max-w-xl">
            <Kicker n={8}>90 seconds · zero typing</Kicker>
            <Reveal>
              <h2 className="font-display mb-2 text-3xl font-semibold sm:text-4xl">Tell us by tapping.</h2>
              <p className="mb-8 text-[14px] text-[var(--ink-soft)]">
                Everything you tap carries into your assessment — so you never repeat yourself.{" "}
                {!skipped && (
                  <button onClick={() => setSkipped(true)} className="text-[var(--ink-faint)] underline underline-offset-4">
                    or skip straight to the buttons ↓
                  </button>
                )}
              </p>
            </Reveal>

            {!skipped && (
              <div className="space-y-10">
                {/* 8a */}
                <Reveal>
                  <p className="font-display mb-3 text-lg font-semibold">What's your engine?</p>
                  <div className="flex flex-wrap gap-2">
                    {ENGINES.map((e) => (
                      <button
                        key={e}
                        onClick={() => { setEngine(e); setVertical(null); }}
                        className={`chip px-4 py-2.5 text-[13px] font-medium ${engine === e ? "chip-on" : ""}`}
                      >
                        {e}
                      </button>
                    ))}
                  </div>
                </Reveal>

                {/* 8b */}
                <AnimatePresence>
                  {engine && (
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
                      <p className="font-display mb-3 text-lg font-semibold">How do you see your numbers today?</p>
                      <div className="flex flex-wrap gap-2">
                        {VISIBILITY.map((v) => (
                          <button
                            key={v}
                            onClick={() => setVisibility(v)}
                            className={`chip px-4 py-2.5 text-[13px] font-medium ${visibility === v ? "chip-on" : ""}`}
                          >
                            {v}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* 8c */}
                <AnimatePresence>
                  {engine && visibility && (
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
                      <p className="font-display mb-3 text-lg font-semibold">Which is closest to your world?</p>
                      <div className="flex flex-wrap gap-2">
                        {VERTICALS[engine].map((v) => (
                          <button
                            key={v}
                            onClick={() => setVertical(v)}
                            className={`chip px-4 py-2.5 text-[13px] font-medium ${vertical === v ? "chip-on" : ""}`}
                          >
                            {v}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* 8d — insight card */}
                <AnimatePresence>
                  {insight && vertical && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.96, y: 16 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                      className="card border-[var(--accent)]/50 p-5"
                      style={{ boxShadow: "var(--shadow)" }}
                    >
                      <p className="font-mono mb-2 text-[10px] uppercase tracking-[0.25em] text-[var(--accent)]">
                        ◈ what we're seeing
                      </p>
                      <p className="font-display text-lg font-semibold">{insight.headline}</p>
                      <p className="mt-2 text-[14px] leading-relaxed text-[var(--ink-soft)]">{insight.body}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* 8e — self-audit */}
                <AnimatePresence>
                  {vertical && (
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
                      <p className="font-display mb-1 text-lg font-semibold">Last one — tap each line to rate it.</p>
                      <p className="mb-4 text-[12px] text-[var(--ink-faint)]">
                        Tap cycles: <span style={{ color: "var(--blue)" }}>⬡ Want</span> →{" "}
                        <span style={{ color: "var(--orange)" }}>⚡ Needs improving</span> →{" "}
                        <span style={{ color: "var(--green)" }}>✓ Satisfied</span>
                      </p>
                      <div className="space-y-2">
                        {AUDIT_ITEMS.map((item, idx) => {
                          const s = audit[idx] ?? 0;
                          const st = AUDIT_STATES[s];
                          return (
                            <button
                              key={item}
                              onClick={() => setAudit((a) => ({ ...a, [idx]: ((a[idx] ?? 0) + 1) % 4 }))}
                              className="card card-tap flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
                              style={st ? { borderColor: st.color } : undefined}
                            >
                              <span className="text-[14px] font-medium">{item}</span>
                              <AnimatePresence mode="wait">
                                <motion.span
                                  key={s}
                                  initial={{ scale: 0.4, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  exit={{ scale: 0.4, opacity: 0 }}
                                  transition={{ duration: 0.15 }}
                                  className="font-mono shrink-0 text-[12px] font-semibold"
                                  style={{ color: st?.color ?? "var(--ink-faint)" }}
                                >
                                  {st ? `${st.icon} ${st.label}` : "· tap ·"}
                                </motion.span>
                              </AnimatePresence>
                            </button>
                          );
                        })}
                      </div>
                      {auditCounts.want + auditCounts.needs + auditCounts.done > 2 && (
                        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 text-[13px] text-[var(--ink-soft)]">
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
        </Section>

        {/* 9 — CTA HUB */}
        <Section id="cta" className="pb-32">
          <Kicker n={9}>your move</Kicker>
          <Reveal>
            <h2 className="font-display mb-2 text-3xl font-semibold sm:text-4xl">Stop flying blind.</h2>
            <p className="mb-8 text-[14px] text-[var(--ink-soft)]">
              We're a lean team on purpose — every client gets a Butler, not a queue.{" "}
              <strong className="text-[var(--ink)]">Limited slots this week.</strong>
            </p>
          </Reveal>
          <div className="space-y-4">
            <Reveal>
              <a
                href="../intake-form.html"
                className="btn-primary pulse-ring relative block rounded-2xl p-5 text-center"
                style={{ boxShadow: "var(--shadow)" }}
              >
                <span className="absolute -top-2.5 right-4 rounded-full bg-[var(--orange)] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                  Limited slots this week
                </span>
                <span className="font-display block text-xl font-semibold">Take Assessment Now</span>
                <span className="text-[13px] opacity-85">5 minutes · your taps above carry over</span>
              </a>
            </Reveal>
            <Reveal delay={0.1}>
              <a href="../intake-form.html" className="card card-tap block p-5 text-center">
                <span className="font-display block text-lg font-semibold">Book For Later</span>
                <span className="block text-[13px] text-[var(--ink-soft)]">Pick a slot that fits around the actual work</span>
              </a>
            </Reveal>
            <Reveal delay={0.18}>
              <a
                href="../demo-report.html"
                className="block p-4 text-center text-[14px] font-medium text-[var(--ink-soft)] underline underline-offset-4"
              >
                Self Discovery — browse the breakdown on your own
              </a>
            </Reveal>
            <Reveal delay={0.25}>
              <div className="card mt-6 p-5">
                <EmailCapture prompt="Not today? Take the four-step breakdown with you." />
              </div>
            </Reveal>
          </div>
          <p className="font-mono mt-16 text-center text-[10px] uppercase tracking-[0.25em] text-[var(--ink-faint)]">
            Business Butlers · revenue up · waste down · same hours · more life
          </p>
        </Section>
      </main>

      <ChatBot profile={profile} />
    </div>
  );
}
