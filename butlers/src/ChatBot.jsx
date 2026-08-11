import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getBackendBase, getSessionId, getWebSocketUrl, sanitizeProfile } from "./butlerClient.js";

const SNAPSHOT_KEY = "bb-chat-snapshot-v2";
const AUTO_OPENED_KEY = "bb-chat-auto-opened-v2";
const PROTOCOL_VERSION = 1;

function ServiceBellIcon({ close = false, className = "h-7 w-7" }) {
  if (close) {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <path d="M6 6l12 12M18 6 6 18" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={className} fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8.25 21.25h15.5" />
      <path d="M10.25 20.75c.35-5.25 2.35-8.15 5.75-8.15s5.4 2.9 5.75 8.15" />
      <path d="M14.35 11.25c.4-.75.95-1.15 1.65-1.15s1.25.4 1.65 1.15" />
      <path d="M6.5 23.75h19" />
      <path d="M12.35 25.75h7.3" />
    </svg>
  );
}

function readSnapshot() {
  try {
    return JSON.parse(sessionStorage.getItem(SNAPSHOT_KEY) || "null");
  } catch {
    return null;
  }
}

function eventEnvelope(sessionId, eventName, section, metadata = {}) {
  return {
    protocolVersion: PROTOCOL_VERSION,
    type: "page.analytics",
    sessionId,
    payload: {
      schemaVersion: 1,
      eventId: crypto.randomUUID(),
      sessionId,
      eventName,
      occurredAt: new Date().toISOString(),
      section,
      metadata,
    },
  };
}

export default function ChatBot({ profile }) {
  const sessionId = useMemo(() => getSessionId(), []);
  const initialSnapshot = useMemo(() => readSnapshot(), []);
  const [messages, setMessages] = useState(initialSnapshot?.transcript ?? []);
  const [open, setOpen] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(() => window.scrollY > 0);
  const [typing, setTyping] = useState(false);
  const [draft, setDraft] = useState("");
  const [status, setStatus] = useState("connecting");
  const [notice, setNotice] = useState("");
  const socketRef = useRef(null);
  const queueRef = useRef([]);
  const retryRef = useRef(0);
  const reconnectRef = useRef(null);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  const profileRef = useRef(sanitizeProfile(profile));

  const persistSnapshot = useCallback((next) => {
    setMessages(next?.transcript ?? []);
    if (next) sessionStorage.setItem(SNAPSHOT_KEY, JSON.stringify(next));
  }, []);

  const send = useCallback((envelope) => {
    const ws = socketRef.current;
    if (ws?.readyState === WebSocket.OPEN) ws.send(JSON.stringify(envelope));
    else queueRef.current.push(envelope);
  }, []);

  const track = useCallback((name, section, metadata) => {
    send(eventEnvelope(sessionId, name, section, metadata));
  }, [send, sessionId]);

  const beginConversation = useCallback((source) => {
    if (sessionStorage.getItem(AUTO_OPENED_KEY) === "1") return false;
    sessionStorage.setItem(AUTO_OPENED_KEY, "1");
    send({ protocolVersion: PROTOCOL_VERSION, type: "bot.trigger", sessionId, payload: { section: "qualify" } });
    track(source === "auto" ? "bot_auto_opened" : "bot_manually_started", "qualify");
    return true;
  }, [send, sessionId, track]);

  useEffect(() => {
    if (!getBackendBase()) {
      setStatus("unavailable");
      return undefined;
    }
    let disposed = false;
    const connect = () => {
      if (disposed) return;
      const ws = new WebSocket(getWebSocketUrl(sessionId));
      socketRef.current = ws;
      ws.addEventListener("open", () => {
        retryRef.current = 0;
        setStatus("connected");
        ws.send(JSON.stringify({
          protocolVersion: PROTOCOL_VERSION,
          type: "session.resume",
          sessionId,
          payload: { snapshot: readSnapshot() ?? undefined, profile: profileRef.current },
        }));
        for (const item of queueRef.current.splice(0)) ws.send(JSON.stringify(item));
      });
      ws.addEventListener("message", (event) => {
        try {
          const envelope = JSON.parse(event.data);
          if (envelope.type === "session.ready") persistSnapshot(envelope.payload.snapshot);
          if (envelope.type === "chat.message.sent") {
            setTyping(false);
            persistSnapshot(envelope.payload.snapshot);
          }
          if (envelope.type === "lead.submission.result") {
            setTyping(false);
          }
          if (envelope.type === "error") {
            setTyping(false);
            setNotice(envelope.payload.message);
          }
        } catch {
          setNotice("The Butler received an unreadable response. Please reconnect.");
        }
      });
      ws.addEventListener("close", () => {
        if (disposed) return;
        setStatus("reconnecting");
        const delay = Math.min(1000 * (2 ** retryRef.current), 30000);
        retryRef.current += 1;
        reconnectRef.current = window.setTimeout(connect, delay);
      });
      ws.addEventListener("error", () => setStatus("reconnecting"));
    };
    connect();
    return () => {
      disposed = true;
      if (reconnectRef.current) window.clearTimeout(reconnectRef.current);
      socketRef.current?.close();
    };
  }, [persistSnapshot, sessionId]);

  useEffect(() => {
    profileRef.current = sanitizeProfile(profile);
    send({ protocolVersion: PROTOCOL_VERSION, type: "profile.updated", sessionId, payload: { profile: profileRef.current } });
  }, [profile, send, sessionId]);

  useEffect(() => {
    track("session_started", undefined, { path: location.pathname });
    const dwellTimers = new Map();
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        const section = entry.target.id || "unnamed";
        if (entry.isIntersecting) {
          track("section_reached", section);
          const timers = [5, 15].map((seconds) => window.setTimeout(() => track("section_dwell", section, { seconds }), seconds * 1000));
          dwellTimers.set(entry.target, timers);
        } else {
          track("section_left", section);
          for (const timer of dwellTimers.get(entry.target) ?? []) window.clearTimeout(timer);
          dwellTimers.delete(entry.target);
        }
      }
    }, { threshold: 0.25 });
    const sections = [...document.querySelectorAll("main section[id]")];
    for (const section of sections) observer.observe(section);

    const fired = new Set();
    const onScroll = () => {
      if (scrollY > 0) setHasScrolled(true);

      const scrollable = Math.max(document.documentElement.scrollHeight - innerHeight, 1);
      const depth = Math.min(1, Math.max(0, scrollY / scrollable));
      for (const threshold of [0.5, 0.8]) {
        if (depth >= threshold && !fired.has(threshold)) {
          fired.add(threshold);
          track("scroll_depth", undefined, { depth: threshold });
        }
      }

      const qualifySection = document.getElementById("qualify");
      if (qualifySection?.getBoundingClientRect().bottom <= 0 && beginConversation("auto")) {
        setOpen(true);
      }
    };
    addEventListener("scroll", onScroll, { passive: true });
    return () => {
      observer.disconnect();
      removeEventListener("scroll", onScroll);
      for (const timers of dwellTimers.values()) for (const timer of timers) window.clearTimeout(timer);
    };
  }, [beginConversation, track]);

  useEffect(() => {
    const openAssessment = (event) => {
      const intent = event.detail?.intent ?? "assessment";
      beginConversation("manual");
      setOpen(true);
      window.setTimeout(() => {
        send({
          protocolVersion: PROTOCOL_VERSION,
          type: "chat.message.received",
          sessionId,
          payload: {
            text: intent === "booking" ? "BOOK" : "ASSESSMENT",
            displayText: intent === "booking" ? "Book a call" : "Take the assessment",
          },
        });
        setTyping(true);
      }, 50);
    };
    addEventListener("business-butlers:open-assessment", openAssessment);
    return () => removeEventListener("business-butlers:open-assessment", openAssessment);
  }, [beginConversation, send, sessionId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    if (open) inputRef.current?.focus({ preventScroll: true });
  }, [messages, typing, open]);

  const lastBot = [...messages].reverse().find((message) => message.role === "bot");
  const options = typing ? [] : (lastBot?.options ?? []);
  const input = typing ? null : lastBot?.input;

  const sendMessage = useCallback((text, displayText = text) => {
    const clean = text.trim();
    if (!clean || typing) return;
    setMessages((current) => [...current, { id: `pending-${crypto.randomUUID()}`, role: "visitor", text: displayText.trim() || clean }]);
    setDraft("");
    setNotice("");
    setTyping(true);
    send({ protocolVersion: PROTOCOL_VERSION, type: "chat.message.received", sessionId, payload: { text: clean, displayText: displayText.trim() || clean } });
    track("chat_message_sent", "qualify", { inputType: input?.type ?? "option" });
  }, [input?.type, send, sessionId, track, typing]);

  const choose = (option) => {
    if (option.link) {
      const target = new URL(option.link, location.origin);
      track("handoff_link_clicked", "qualify", { destination: target.origin === location.origin ? target.pathname : target.hostname });
      if (target.origin === location.origin) location.assign(target.href);
      else window.open(target.href, "_blank", "noopener,noreferrer");
    }
    sendMessage(option.value, option.label);
  };

  const toggle = () => {
    const next = !open;
    if (next) beginConversation("manual");
    setOpen(next);
    track(next ? "bot_opened" : "bot_closed", "qualify");
  };

  return (
    <>
      <motion.button
        aria-label={open ? "Close Business Butlers chat" : "Open Business Butlers chat"}
        aria-expanded={open}
        aria-controls="business-butlers-chat"
        onClick={toggle}
        initial={{ scale: 0 }} animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 18 }}
        className={`butler-launcher btn-primary fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-lg ${hasScrolled && !open ? "butler-launcher-glow" : ""}`}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span key={open ? "x" : "bell"} initial={{ rotate: -18, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 18, opacity: 0 }}>
            <ServiceBellIcon close={open} />
          </motion.span>
        </AnimatePresence>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.section
            id="business-butlers-chat" role="dialog" aria-label="Business Butlers assistant"
            initial={{ opacity: 0, y: 24, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="card fixed bottom-24 right-4 left-4 z-50 flex flex-col overflow-hidden sm:left-auto sm:w-[380px]"
            style={{ height: "min(560px, 72vh)", boxShadow: "var(--shadow)" }}
            onKeyDown={(event) => { if (event.key === "Escape") setOpen(false); }}
          >
            <header className="flex items-center gap-3 border-b border-[var(--line)] bg-[var(--accent)] px-4 py-3 text-[var(--accent-ink)]">
              <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--accent-ink)]/35 bg-black/10">
                <ServiceBellIcon className="h-6 w-6" />
                <span className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[var(--accent)] ${status === "connected" ? "bg-[#5ede7a]" : "bg-[var(--orange)]"}`} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-display text-sm font-semibold">Ian, your Butler</p>
                <p className="truncate text-[11px] opacity-80">{status === "connected" ? "Ready when you are." : status === "reconnecting" ? "Reconnecting…" : "Assessment service unavailable"}</p>
              </div>
              <button onClick={() => setOpen(false)} aria-label="Close chat" className="rounded-lg px-2 py-1 text-lg hover:bg-black/10">×</button>
            </header>

            <div ref={scrollRef} aria-live="polite" className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
              {messages.map((message) => (
                <motion.div key={message.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed ${message.role === "bot" ? "bg-[var(--bg-soft)] text-[var(--ink)] rounded-bl-sm" : "btn-primary ml-auto rounded-br-sm"}`}>
                  {message.text}
                </motion.div>
              ))}
              {typing && <div aria-label="The Butler is responding" className="flex w-14 items-center justify-center gap-1 rounded-2xl bg-[var(--bg-soft)] px-3 py-3">{[0, 1, 2].map((dot) => <span key={dot} className="typing-dot h-1.5 w-1.5 rounded-full bg-[var(--ink-soft)]" />)}</div>}
              {notice && <p className="rounded-xl border border-[var(--line)] bg-[var(--bg-raised)] px-3 py-2 text-[12px] text-[var(--ink-soft)]">{notice}</p>}
              {status === "unavailable" && messages.length === 0 && (
                <div className="rounded-2xl bg-[var(--bg-soft)] p-4 text-[13px]">
                  Chat is temporarily unavailable. <a className="font-semibold text-[var(--accent)] underline" href="/intake-form.html">Use the assessment form</a> or email <a className="underline" href="mailto:privacy@coretechlabs.app">CoreTech Studios</a>.
                </div>
              )}
            </div>

            {options.length > 0 && (
              <div className="flex flex-wrap gap-2 border-t border-[var(--line)] px-4 py-3">
                {options.map((option) => <button key={`${option.value}-${option.label}`} onClick={() => choose(option)} className="chip px-3 py-1.5 text-[12px] font-medium">{option.label}</button>)}
              </div>
            )}
            {input && (
              <form onSubmit={(event) => { event.preventDefault(); sendMessage(draft || (input.optional ? "SKIP" : "")); }} className="flex gap-2 border-t border-[var(--line)] p-3">
                <input ref={inputRef} type={input.type} required={!input.optional} value={draft} onChange={(event) => setDraft(event.target.value)} placeholder={input.placeholder} className="min-w-0 flex-1 rounded-xl border border-[var(--line)] bg-[var(--bg-raised)] px-3 py-2 text-[13px] outline-none focus:border-[var(--accent)]" />
                <button className="btn-primary rounded-xl px-3 py-2 text-[13px] font-semibold">Send</button>
              </form>
            )}
          </motion.section>
        )}
      </AnimatePresence>
    </>
  );
}
