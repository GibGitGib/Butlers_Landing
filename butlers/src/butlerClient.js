const SESSION_ID_KEY = "bb-session-id-v1";

export function getSessionId() {
  let id = sessionStorage.getItem(SESSION_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(SESSION_ID_KEY, id);
  }
  return id;
}

export function getBackendBase() {
  const configured = import.meta.env.VITE_DASCB_BASE_URL?.trim();
  if (configured) return configured.replace(/\/$/, "");
  return import.meta.env.DEV ? `${location.protocol}//${location.hostname}:3001` : "";
}

export function getWebSocketUrl(sessionId) {
  const base = getBackendBase();
  if (!base) return "";
  const url = new URL("/api/ws", base);
  url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
  url.searchParams.set("session", sessionId);
  return url.toString();
}

export function sanitizeProfile(profile = {}) {
  return {
    pain: ["A", "B", "C"].includes(profile.pain) ? profile.pain : null,
    engine: profile.engine || null,
    visibility: profile.visibility || null,
    vertical: profile.vertical || null,
    audit: profile.audit && typeof profile.audit === "object" ? profile.audit : {},
  };
}

export async function submitLead({ intent, contact, profile, assessment, source, startedAt, website = "" }) {
  const base = getBackendBase();
  if (!base) throw new Error("The assessment service is not configured yet.");
  const submissionId = crypto.randomUUID();
  const response = await fetch(`${base}/api/leads`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      schemaVersion: 1,
      submissionId,
      sessionId: getSessionId(),
      intent,
      contact,
      profile: sanitizeProfile(profile),
      assessment,
      context: {
        source,
        pagePath: location.pathname,
        referrerOrigin: document.referrer || undefined,
        submittedAt: new Date().toISOString(),
        startedAt,
        website,
      },
    }),
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok || !body.ok) {
    throw new Error(body.error === "submission_too_fast" ? "Please wait a moment and try again." : "We couldn't send that yet. Please retry.");
  }
  return body;
}
