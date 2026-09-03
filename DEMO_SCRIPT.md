# 🎬 TREMOR — Demo Video Recording Script
### *Total Target Duration: 2 Minutes 30 Seconds (< 3 min limit)*

---

## ⏱️ Video Structure Breakdown

| Segment | Timing | Scene / Visual | Narration / Voiceover |
|---|---|---|---|
| **Act 1: The Hook & The Problem** | 0:00 – 0:35 | Fullscreen slides or webcam + screen showing an IDE with an AI agent refactoring code. | The problem of "AI Agent Myopia" & silent production outages. |
| **Act 2: The Cockpit & WebMCP** | 0:35 – 1:15 | Screen recording of TREMOR Cockpit (`https://tremor-cockpit.vercel.app`). Mouse hovering over nodes, switching layer tabs, opening About modal. | Introducing TREMOR, 2D force-directed graph, and the 6 WebMCP tools. |
| **Act 3: The Centerpiece Simulation** | 1:15 – 2:00 | Triggering `simulate_change_impact` on `auth-service` + `redis-session-cluster`. | Live visual explosion: amber pulsing modified nodes, crimson ripple on 7 downstream services, 79% Critical Risk report. |
| **Act 4: Trust Layer & Native ChatGPT** | 2:00 – 2:40 | Opening Human Review Gate with pending flag, clicking green "Confirm / Approve" button, and showing native ChatGPT in-app browser transcript. | Explaining the non-self-approving human gate and native ChatGPT verification. |
| **Outro** | 2:40 – 2:50 | TREMOR logo + GitHub link on screen. | Call to action & concluding pitch. |

---

## 🎙️ Verbatim Voiceover Script

### [0:00 – 0:35] Act 1: The Hook & The Problem
> **[Voiceover]:**  
> "Autonomous AI coding agents like Claude Code, Cursor, and ChatGPT are writing more production code than ever before. But they operate with a dangerous blind spot: **Architectural Myopia**.  
> When an AI agent refactors a single backend service—say, changing a token session timeout in an auth service—it only sees that isolated file. It has no idea that seven downstream microservices rely on that token format. At scale, that innocent two-line change triggers a Redis cache stampede and crashes the checkout pipeline.  
> Today, existing backend MCP tools hand agents blast-radius data as raw text in a terminal. But terminal text is invisible to humans and creates zero shared understanding.  
> TREMOR intervenes at the exact moment an agent proposes a diff spanning shared modules — before the PR opens, not after CI fails."

---

### [0:35 – 1:15] Act 2: The Cockpit & The WebMCP Difference
> **[Voiceover]:**  
> *"TREMOR is browser-native: a human engineer and their agent look at the exact same live impact graph in the exact same tab.  
> Here in the cockpit, our entire 18-microservice topology runs on an interactive 2D physics engine, dynamically color-coded by calculated risk index—from safe green to critical red.  
> Using the official `@mcp-b/global` polyfill created by hackathon judge Alex Nahas, TREMOR registers **six canonical WebMCP tools** directly onto `document.modelContext`. When an AI agent connects, this webpage becomes an interactive safety toolkit."*

---

### [1:15 – 2:00] Act 3: The Live Simulation Centerpiece
> **[Voiceover]:**  
> *"Let's see this in action. Suppose an AI agent wants to refactor JWT claims and sliding session timeouts. Instead of editing code blindly, it calls `simulate_change_impact`.  
> Look at the screen:  
> Instantly, the graph comes alive! The directly touched modules—`auth-service` and `redis-session-cluster`—pulse with electric amber halos. The 7 downstream affected services—including checkout, order processing, and mobile checkout—light up with crimson danger borders, and directional particles accelerate along the blast path.  
> In the sidebar, TREMOR computes a **79% Critical Risk Index**, matches a historical P1 Redis cache stampede outage, and flags 12 impacted test suites including flaky token validation tests."*

---

### [2:00 – 2:40] Act 4: The Trust Layer & Native ChatGPT Live Testing
> **[Voiceover]:**  
> *"Because this change is rated Critical, the agent invokes `flag_for_review`.  
> Here is TREMOR's core safety principle: **The AI agent cannot self-approve.**  
> In the cockpit navbar, a pulsing amber badge alerts the on-call engineer. In the Review Gate panel, Lead SRE Devin Patel inspects the AI's risk justification and clicks **Confirm / Approve**. Only this physical human mouse click unlocks the operation, and the confirmation is audited live in the activity stream.  
> Best of all, this was tested live inside **ChatGPT's native in-app browser**. ChatGPT discovered all 6 WebMCP tools, simulated the change, and cited the exact blast radius and historical incidents in real time."*

---

### [2:40 – 2:50] Outro & Call to Action
> **[Voiceover]:**  
> *"TREMOR bridges the gap between autonomous AI velocity and enterprise architectural safety.  
> Try it live today at `tremor-cockpit.vercel.app` or check out the open-source code on GitHub.  
> Thank you!"*

---

## 🎥 Recording Checklist for Presenter

1. **Browser Tab 1:** Open `https://tremor-cockpit.vercel.app` in Fullscreen (Chrome).
2. **Audio:** High-quality microphone, clean quiet environment.
3. **Actions to perform on screen during recording:**
   - [ ] 0:40: Hover over `auth-service` to show floating hover card and risk gauge.
   - [ ] 0:55: Click layer filter buttons (`Frontend`, `Backend`, `Shared Libs`, `Infra`) and press `?` to show the About & Architecture modal.
   - [ ] 1:20: Press key <kbd>S</kbd> or click **"Simulate Blast"** on `auth-service` to trigger the centerpiece simulation. Show the top amber banner and crimson graph ripple.
   - [ ] 2:10: Click the **"Pending Review"** tab in the bottom drawer, show the review card, and click the green **"Confirm / Approve"** button. Show the green `HUMAN_GATE` audit log entry in the Activity Stream.
   - [ ] 2:30: Show screenshot of the verbatim ChatGPT in-app browser response.
