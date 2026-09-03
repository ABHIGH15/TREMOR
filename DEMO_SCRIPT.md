# 🎬 TREMOR — Demo Video Recording Script
### *Target Duration: 2 Minutes 15 Seconds (Hard Limit: 3:00 — 45s Safety Buffer)*
### *Total Spoken Words: ~265 words (Comfortable, authoritative ~120 WPM pace)*

---

## ⏱️ Video Structure Breakdown

| Segment | Timing | Scene / Visual Action | Spoken Focus | Words |
|---|---|---|---|---|
| **Act 1: The Problem** | 0:00 – 0:25 | IDE / diff screenshot showing AI agent editing single auth service | AI Agent Myopia & why terminal MCP fails | ~58 words |
| **Act 2: The Cockpit & WebMCP** | 0:25 – 0:55 | Screen recording: hovering `auth-service`, toggling layer tabs, opening About modal | Shared browser canvas & 6 WebMCP tools | ~52 words |
| **Act 3: Live Simulation** | 0:55 – 1:35 | Press <kbd>S</kbd> or click "Simulate Blast": amber pulse, crimson downstream ripple, 79% risk | Centerpiece simulation & outage matching | ~67 words |
| **Act 4: Human Gate & ChatGPT** | 1:35 – 2:05 | Open review drawer, show 5-tool lock, click Confirm, show Counterfactual Replay + ChatGPT transcript | Non-self-approving gate & live ChatGPT proof | ~69 words |
| **Outro** | 2:05 – 2:15 | Cockpit view + live URL & GitHub repo link | Closing pitch & call to action | ~17 words |

---

## 🎙️ Verbatim Voiceover Script

### [0:00 – 0:25] Act 1: The Hook & The Problem (~58 words, 25s)
> **[Voiceover]:**  
> "Autonomous coding agents are writing more production code than ever. But they operate with a dangerous blind spot: **Architectural Myopia**.  
> An agent refactoring a token timeout only sees one file—blind to the seven downstream microservices that depend on it.  
> Terminal MCP tools dump raw text back to an LLM. TREMOR intervenes in the browser before the PR opens, not after CI fails."

---

### [0:25 – 0:55] Act 2: The Cockpit & The WebMCP Difference (~52 words, 30s)
> **[Voiceover]:**  
> "TREMOR gives humans and AI agents a shared visual canvas.  
> Our 18-microservice topology runs on an interactive 2D physics engine, dynamically color-coded by systemic risk.  
> Using `@mcp-b/global`, TREMOR registers six canonical WebMCP tools directly onto `document.modelContext`. When an AI agent connects, this browser tab becomes an active safety cockpit."

---

### [0:55 – 1:35] Act 3: The Live Simulation Centerpiece (~67 words, 40s)
> **[Voiceover]:**  
> "When an agent refactors JWT session timeouts, it calls `simulate_change_impact`.  
> Instantly, the graph illuminates the blast radius. `auth-service` and `redis-session-cluster` pulse in amber, while seven downstream services light up in crimson danger borders.  
> The sidebar calculates a **79% Critical Risk Index**, surfaces a matching P1 cache stampede outage, and flags flaky test suites before any code is committed."

---

### [1:35 – 2:05] Act 4: The Human Review Gate & Live ChatGPT Proof (~69 words, 30s)
> **[Voiceover]:**  
> "Because risk is critical, the agent invokes `flag_for_review`.  
> The agent cannot self-approve, and its simulation capability is locked out. An authorized engineer inspects the justification and clicks **Confirm / Approve**.  
> A human click unlocks the change, triggering a counterfactual replay of the averted incident.  
> In real ChatGPT in-app testing, ChatGPT called these exact tools and accurately identified the 0.79 critical risk."

---

### [2:05 – 2:15] Outro & Call to Action (~17 words, 10s)
> **[Voiceover]:**  
> "TREMOR bridges AI velocity with human architectural safety. Try it live at `tremor-cockpit.vercel.app`. Thank you."

---

## 🎥 Recording Checklist for Presenter

1. **Browser Tab 1:** Open `https://tremor-cockpit.vercel.app` in Fullscreen (Chrome).
2. **Audio:** High-quality microphone, clean quiet environment.
3. **Actions to perform on screen during recording:**
   - [ ] 0:30: Hover over `auth-service` to show floating hover card and risk gauge.
   - [ ] 0:45: Click layer filter buttons (`Frontend`, `Backend`, `Shared Libs`, `Infra`) and press `?` to show the About & Architecture modal.
   - [ ] 1:00: Press key <kbd>S</kbd> or click **"Simulate Blast"** on `auth-service` to trigger the centerpiece simulation. Show the top amber banner and crimson graph ripple.
   - [ ] 1:40: Open the bottom drawer to show the pending flag and 5-tool lock, then click the green **"Confirm / Approve"** button. Show the Counterfactual Replay banner and restored 6 tools.
   - [ ] 2:00: Show screenshot of the verbatim ChatGPT in-app browser response ([`verification/chatgpt-transcript.md`](./verification/chatgpt-transcript.md)).
