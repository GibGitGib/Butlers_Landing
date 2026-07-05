# Business Butlers — Landing Page Wireframe

> **FOR:** Design Team  
> **PHASE:** Soft Launch — Landing Page  
> **CREATIVE FREEDOM:** Full. This document defines structure + interaction + locked copy only. Visual direction, color, typography, animation style, illustration — all yours.

---

## PAGE STRUCTURE (scroll order)

```
┌─────────────────────────────┐
│ 1. HERO                     │  ← full viewport, large type
├─────────────────────────────┤
│ 2. EMPATHY                  │  ← 3 lines, bridges to answer
├─────────────────────────────┤
│ 3. ANSWER                   │  ← 4-step teaser, transition
├─────────────────────────────┤
│ 4. CHANGE (interactive)     │  ← 3 tap cards → visual diagnosis
├─────────────────────────────┤
│ 5. ACKNOWLEDGE              │  ← tailored text (depends on tap)
├─────────────────────────────┤
│ 6. 4-STEP WALKTHROUGH       │  ← 4 cards, ranked by their pain
│    [opt-out at each step]   │
├─────────────────────────────┤
│ 7. PERSONALIZE (placeholder)│  ← audio/slide card, TBD
├─────────────────────────────┤
│ 8. QUALIFY HARVEST          │
│    8a. Engine type (3 taps) │
│    8b. Visibility (3 taps)  │
│    8c. Vertical (filtered)  │
│    8d. Breadcrumb insight   │
│    8e. Self-audit 3-state    │
│        (Want→Needs→Satisfied)│
│    [skip path available]    │
├─────────────────────────────┤
│ 9. CTA HUB                  │
│    [Take Assessment Now] ←──┼─ HIGHLIGHTED
│    [Book For Later]         │
│    [Self Discovery]         │
│    [chat widget: bottom-rt] │
└─────────────────────────────┘
```

---

## LOCKED COPY (do not change)

### 1. HERO
> You're not bad at business.  
> You're just flying blind.

### 2. EMPATHY
> Feast or famine months.  
> No, you're not bad at business.  
> Just flying blind.

### 3. ANSWER
> Some months you swim. Some months you sweat.  
> The work never changed.  
> The pattern was always invisible. Until now.

> The answer is simple, not easy, but you already knew that.  
> We'll take you through our four-step Business Butler process.  
> Revenue up. Waste down. Same hours. More life. That's the system.

### 4. CHANGE — 3 tap cards
**Prompt:** "Click what you need to master:"

**Card A:**  
Jim runs a catering service. When he's on an event, it's all hands on deck. Leads come in. Nobody answers. By the time he surfaces, they've gone cold. His pipeline freezes every time he does his actual job.

**Card B:**  
Janet uses AI. Has the tools. But somehow she's still either overstaffed on a slow week or drowning on a busy one. The pattern never levels out. She can't predict demand, so she can't schedule for it.

**Card C:**  
Allen got AI. It worked. For a while. Now he spends his time either teaching it new tricks or begging it to work like it did on day one. He bought the future and it's already rusting.

### 5. ACKNOWLEDGE (3 variants, shown based on tap)

**If tapped A:** You're not alone. Most owners lose leads to silence, not competitors. The phone rings. Nobody's there. The lead dies. That's what we fix.

**If tapped B:** You're not alone. The feast-or-famine cycle isn't a staffing problem. It's a visibility problem. You can't schedule what you can't see. That's what we fix.

**If tapped C:** You're not alone. Most AI degrades without support. You bought a solution and inherited a maintenance job. That's not the deal. That's what we fix.

### CTA HUB
- **Take Assessment Now** (highlighted primary)
- **Book For Later** (secondary)
- **Self Discovery** (tertiary)

---

## INTERACTION REQUIREMENTS (non-negotiable)

### 4. CHANGE — Tap → Visual Diagnosis

**What must happen:** User taps a card (A/B/C). The UI builds a visual diagnosis in real time. Cards stack, flow charts animate, timelines draw. They watch the system understand their problem.

**Tap A → Flow chart builds left-to-right:**
```
[Lead comes in] → [Nobody available] → [Lead goes cold] → [Revenue: $0]
                                                              ↓
                                         [AI captures instantly] → [Routes to best rep] → [Lead converts]
```

**Tap B → Cards stack vertically, then flip:**
```
[Busy week → overstaffed → margins crushed]
              ↕
[Slow week → understaffed → leads lost]
              ↓
[Same revenue. No predictability.]

────────── FLIP ──────────

[Demand forecast → right staff, right time]
              ↕
[Busy week → ready. Slow week → lean.]
              ↓
[Margins hold. Every month.]
```

**Tap C → Timeline builds horizontally:**
```
[Bought AI] ──▶ [Worked great] ──▶ [Started slipping] ──▶ [Now I'm the IT guy]
                                                   ↓
                         [Bought AI] ──▶ [Works great] ──▶ [Stays great]
                                        [Ongoing support + updates + monitoring]
```

**Creative freedom:** How you animate this. Cards, flow arrows, timeline dots, whatever fits the visual language. Just make it feel like the system is diagnosing them — not playing a pre-recorded animation. Stagger. Delay. Make it feel alive.

### 6. 4-STEP WALKTHROUGH

**What must happen:** 4 steps shown in order determined by their pain tap. Each step has an opt-out. Scroll tracking determines priority.

**Ranking matrix:**

| Pain Tap | Step 1 | Step 2 | Step 3 | Step 4 |
|----------|--------|--------|--------|--------|
| A | Revenue Up | Waste Down | Same Hours | More Life |
| B | Waste Down | Same Hours | Revenue Up | More Life |
| C | Waste Down | More Life | Revenue Up | Same Hours |

**Step titles (locked):** Revenue Up · Waste Down · Same Hours · More Life

**Opt-out at every step:** "Want the full breakdown? Drop your email." → newsletter capture.

**Creative freedom:** Step descriptions are placeholder. You can refine the one-liners while keeping the titles.

### 8. QUALIFY HARVEST

**What must happen:** 5 micro-steps, zero typing, all tap-based. Previous selections persist as visible breadcrumbs. Skip path available.

**8a. Engine type:** Products/Inventory · Services/Advice · 50/50 Both  
**8b. Visibility:** I check at close · Gut feel · I track but still leaking  
**8c. Vertical:** Pre-filtered list based on engine pick (see blueprint Section 8c)  
**8d. Breadcrumb:** Auto-generated insight card based on all selections  
**8e. Self-audit:** 7 items, tap to cycle through 3 states: Want (⬡ blue) → Needs Improving (⚡ orange) → Satisfied (✓ green) → unset. Inclusive entry — starts aspirational, not dismissive.

### 9. CTA HUB

**What must happen:** 3 cards, stacked. "Take Assessment Now" is visually highlighted as primary. Badge: "Limited slots this week." Urgency message about lean team.

**Fallback:** Chat widget (bottom-right bubble). Opens into conversation panel. Bot handles: "what is this" → explainer, newsletter signup, booking redirect, pricing questions. No idle timer — always available, never intrusive.

---

## CREATIVE FREEDOM ZONES

These are yours to define:

- **Color palette, typography, spacing** — full control
- **Visual style** — dark/light, gradients, minimalist, bold — your call
- **Animation style** — the diagnosis animations (Section 4), card transitions, scroll reveals
- **Iconography/illustration** — for the 3 pain tap cards, step icons, CTA cards
- **Layout details** — card sizing, grid vs stack, spacing rhythm
- **Micro-interactions** — hover states, tap feedback, selection highlights
- **"Butler" brand identity** — how "mastery" and "butler" translate visually

---

## CONSTRAINTS

- **Single HTML file.** No frameworks. Vanilla HTML/CSS/JS.
- **Mobile-first.** Primary canvas is a phone screen (portrait). Desktop is secondary.
- **Tap targets ≥ 48px.**
- **Sub-3-second load on 4G.**
- **No navigation.** No menu, no header, no footer. Pure scroll.
- **Chat widget is built-in.** Floating bubble bottom-right — not Intercom-style in-page. Bot handles newsletter + booking redirect.
- **Newsletter capture via chat widget.** Don't let anyone leave empty-handed.

---

## FULL REFERENCE

`C:\Users\email\CoreTech_Sr\business-butlers\landing-page-blueprint.md` — complete architecture, all branches, nut system, aggregate intelligence. Read this for deeper context on any section.

`C:\Users\email\CoreTech_Sr\business-butlers\copy-archive-master.md` — all copy. Only ✅-tagged is locked. 📦 is preserved for future.
