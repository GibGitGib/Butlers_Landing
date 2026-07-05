import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const REPLIES = {
  what: {
    label: "What is this?",
    text: "Business Butlers is a done-with-you system that makes the invisible patterns in your business visible — lead response, demand forecasting, and AI that stays maintained. Four steps: Revenue Up · Waste Down · Same Hours · More Life.",
    followups: ["assessment", "pricing", "newsletter"],
  },
  pricing: {
    label: "Pricing?",
    text: "Pricing depends on your engine type and where you're leaking. That's exactly what the 5-minute assessment figures out — no obligation, and you keep the diagnosis either way.",
    followups: ["assessment", "book", "what"],
  },
  assessment: {
    label: "Take the assessment",
    text: "Great call. It takes about 5 minutes and everything you tapped on this page carries over — no repeating yourself.",
    cta: { label: "Start assessment →", href: "#cta" },
    followups: ["book", "pricing"],
  },
  book: {
    label: "Book a call for later",
    text: "No rush. Grab a slot whenever suits — we're a lean team, so slots are limited each week, but the calendar's honest.",
    cta: { label: "Open booking →", href: "#cta" },
    followups: ["assessment", "newsletter"],
  },
  newsletter: {
    label: "Newsletter instead",
    text: "Low commitment, high signal. Drop your email below and we'll send the full four-step breakdown.",
    email: true,
    followups: ["assessment", "what"],
  },
};

const OPENING = ["what", "assessment", "book", "pricing"];

export default function ChatBot({ profile }) {
  const [open, setOpen] = useState(false);
  const [seen, setSeen] = useState(false);
  const [msgs, setMsgs] = useState([]);
  const [options, setOptions] = useState(OPENING);
  const [typing, setTyping] = useState(false);
  const [email, setEmail] = useState("");
  const [emailDone, setEmailDone] = useState(false);
  const [showEmail, setShowEmail] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (open && msgs.length === 0) {
      setTyping(true);
      const hint = profile.pain
        ? " I saw what you tapped above — the assessment will already know."
        : "";
      const t = setTimeout(() => {
        setTyping(false);
        setMsgs([{ from: "bot", text: `Hey — I'm the Butler. Ask me anything, or pick one below.${hint}` }]);
      }, 900);
      return () => clearTimeout(t);
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 99999, behavior: "smooth" });
  }, [msgs, typing, showEmail]);

  function pick(key) {
    const r = REPLIES[key];
    setMsgs((m) => [...m, { from: "user", text: r.label }]);
    setOptions([]);
    setShowEmail(false);
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMsgs((m) => [...m, { from: "bot", text: r.text, cta: r.cta }]);
      if (r.email) setShowEmail(true);
      setOptions(r.followups);
    }, 800 + Math.random() * 500);
  }

  function submitEmail(e) {
    e.preventDefault();
    if (!/.+@.+\..+/.test(email)) return;
    setEmailDone(true);
    setShowEmail(false);
    setMsgs((m) => [
      ...m,
      { from: "user", text: email },
      { from: "bot", text: "You're on the list. First breakdown lands this week. 🤝" },
    ]);
  }

  return (
    <>
      {/* bubble */}
      <motion.button
        aria-label={open ? "Close chat" : "Open chat"}
        onClick={() => { setOpen((o) => !o); setSeen(true); }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1.2, type: "spring", stiffness: 260, damping: 18 }}
        className="btn-primary fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-lg"
        style={{ boxShadow: "var(--shadow)" }}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={open ? "x" : "chat"}
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 90, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="text-xl"
          >
            {open ? "✕" : "🎩"}
          </motion.span>
        </AnimatePresence>
        {!open && !seen && (
          <span className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-[var(--orange)]" />
        )}
      </motion.button>

      {/* panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="card fixed bottom-24 right-4 left-4 z-50 flex flex-col overflow-hidden sm:left-auto sm:w-[360px]"
            style={{ height: "min(480px, 65vh)", boxShadow: "var(--shadow)" }}
          >
            <div className="flex items-center gap-3 border-b border-[var(--line)] bg-[var(--accent)] px-4 py-3 text-[var(--accent-ink)]">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--accent-ink)]/15 text-lg">🎩</span>
              <div>
                <p className="font-display text-sm font-semibold">The Butler</p>
                <p className="text-[11px] opacity-80">Always on. Never pushy.</p>
              </div>
            </div>

            <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
              {msgs.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed ${
                    m.from === "bot"
                      ? "bg-[var(--bg-soft)] text-[var(--ink)] rounded-bl-sm"
                      : "btn-primary ml-auto rounded-br-sm"
                  }`}
                >
                  {m.text}
                  {m.cta && (
                    <a
                      href={m.cta.href}
                      onClick={() => setOpen(false)}
                      className="mt-2 block rounded-lg bg-[var(--accent)] px-3 py-2 text-center text-[12px] font-semibold text-[var(--accent-ink)]"
                    >
                      {m.cta.label}
                    </a>
                  )}
                </motion.div>
              ))}

              {typing && (
                <div className="flex w-14 items-center justify-center gap-1 rounded-2xl bg-[var(--bg-soft)] px-3 py-3">
                  {[0, 1, 2].map((d) => (
                    <span key={d} className="typing-dot h-1.5 w-1.5 rounded-full bg-[var(--ink-soft)]" />
                  ))}
                </div>
              )}

              {showEmail && !emailDone && (
                <form onSubmit={submitEmail} className="flex gap-2">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@business.com"
                    className="min-w-0 flex-1 rounded-xl border border-[var(--line)] bg-[var(--bg-raised)] px-3 py-2 text-[13px] outline-none focus:border-[var(--accent)]"
                  />
                  <button className="btn-primary rounded-xl px-3 py-2 text-[13px] font-semibold">Join</button>
                </form>
              )}
            </div>

            {options.length > 0 && !typing && (
              <div className="flex flex-wrap gap-2 border-t border-[var(--line)] px-4 py-3">
                {options.map((k) => (
                  <button key={k} onClick={() => pick(k)} className="chip px-3 py-1.5 text-[12px] font-medium">
                    {REPLIES[k].label}
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
