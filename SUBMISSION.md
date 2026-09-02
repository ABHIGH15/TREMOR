# ⚡ TREMOR — Devpost Submission Package
### *WebMCP Challenge 2026 Submission*

---

## 📌 Project Overview
- **Project Title:** TREMOR — Agentic Blast Radius & Systemic Regression Prevention Cockpit
- **Tagline:** *See what your AI agent is about to break — before it does.*
- **Live Cockpit URL:** [https://tremor-cockpit.vercel.app](https://tremor-cockpit.vercel.app)
- **GitHub Repository:** [https://github.com/ABHIGH15/TREMOR](https://github.com/ABHIGH15/TREMOR)
- **License:** MIT Open Source
- **Demo Video (YouTube):** *[Insert Demo Video Link]*

---

## 🎯 Devpost Submission Q&A

### 1. Elevator Pitch: What is TREMOR?
TREMOR is a real-time web cockpit and WebMCP tool suite that lets autonomous AI coding agents (Claude Code, Cursor, Codex, ChatGPT) and human SREs see the *same* live dependency graph, calculate transitive blast radius, query past regression history, and enforce mandatory human approval gates before risky changes ship.

---

### 2. Inspiration: The Problem of "AI Agent Myopia"
As software teams increasingly adopt autonomous AI coding agents, agents are given permission to edit repositories and open pull requests autonomously.

However, AI agents suffer from **"Architectural Myopia" (Tunnel Vision)**:
- When an AI agent modifies a single file (like `auth-service/session.ts`), it reads 200 lines of isolated code. It has zero intrinsic awareness of the 20 downstream microservices that depend on that token structure.
- A benign 2-line cache TTL refactor can pass local unit tests, but at scale it triggers a **Cache Stampede** on Redis, dropping checkouts and causing a P0 production outage.
- Traditional CI/CD pipelines only run unit tests mapped to the modified folder, allowing systemic architectural regressions to ship silently.

We asked: **What if the web browser itself became an interactive safety cockpit that gave AI agents the tools to simulate their blast radius and query outage history before touching code?**

---

### 3. What It Does
TREMOR registers **6 canonical WebMCP tools** onto `document.modelContext` using the official `@mcp-b/global` standard polyfill:

1. **`get_system_snapshot`**: Returns full architecture topology (18 nodes, 28 edges), top risk bottlenecks (`auth-service 0.88`, `jwt-security-core 0.82`, `checkout-service 0.75`), incident index, and test health summary.
2. **`get_blast_radius`**: Uses Breadth-First Search (BFS) to compute transitive downstream callers and affected test suites, while highlighting the impact zone in real time on the live graph canvas.
3. **`check_regression_history`**: Pattern matcher searching historical outages for keyword/module precedents and root-cause commit attribution.
4. **`get_change_provenance`**: Audits recent commits tagging AI agent authorship ratios (Claude Code, Cursor, Codex) vs. human staff engineer commits.
5. **`simulate_change_impact` (The Centerpiece)**: The AI agent passes a proposed change description and touched files. TREMOR calculates a Predicted Blast Risk Index (0–1.0), scans past incident precedents, identifies vulnerable test suites, and illuminates the live 2D force graph with pulsing amber rings on modified services and crimson alert borders on ripple callers.
6. **`flag_for_review` (The Trust Layer)**: When a change exceeds risk thresholds, the agent creates a Pending Human Review Flag. **The AI agent cannot self-approve;** only a physical human click on the green "Confirm / Approve" button in the Cockpit can unlock the change.

---

### 4. Two Independent Trust Layers Reinforcing Each Other
A critical UX innovation in TREMOR is its multi-layer defense:
1. **Agent-Side Confirmation (ChatGPT):** When evaluating high-impact actions, ChatGPT's agent mode prompts the human user for conversational confirmation before calling tools.
2. **Cockpit-Side Confirmation (TREMOR):** `flag_for_review` explicitly sets `can_tool_self_approve: false`. There are **no WebMCP tools** for approving or dismissing flags. Approval is wired strictly to physical DOM `onClick` event handlers executed by an authorized human engineer (*Devin Patel, Lead SRE*).

---

### 5. How We Built It
- **Frontend Framework:** React 18 + TypeScript + Vite (builds in 1.3s with zero type errors).
- **Styling & Aesthetics:** Tailwind CSS with a cyberpunk obsidian theme (`#070a12`), glassmorphism simulation banners, and high-contrast risk badges.
- **Graph Visualization:** `react-force-graph-2d` rendering 18 nodes and 28 edges with 60fps real-time physics, dynamic node scaling, and directional particle streams.
- **WebMCP Standard:** Integrated official `@mcp-b/global@5.1.0` standard polyfill created by Alex Nahas (WebMCP Challenge Judge).
- **Accessibility:** Full WCAG 2.1 AA compliance with high-contrast `:focus-visible` styling (`outline: 2px solid #38bdf8`) and keyboard shortcuts (`H`, `S`, `R`, `ESC`, `?`, `Tab`).
- **Deployment:** Vercel Global Edge CDN ([https://tremor-cockpit.vercel.app](https://tremor-cockpit.vercel.app)).

---

### 6. Challenges We Ran Into & How We Solved Them
1. **Strict Read-Only Properties in ChatGPT's Native In-App Browser:**
   - *Challenge:* When testing inside the native ChatGPT iOS/Desktop app, ChatGPT's environment enforces strict W3C WebMCP read-only property definitions on `document.modelContext`. An early debug assignment (`doc.modelContext.getTools = ...`) threw a runtime `TypeError` that halted script execution on page load.
   - *Solution:* We eliminated direct property mutations, moved convenience helpers to `window.__tremor_webMCP`, and registered tools cleanly via standard `document.modelContext.registerTool({...})`. ChatGPT immediately discovered all 6 tools!
2. **Multi-Root Transitive BFS Traversal:**
   - *Challenge:* Simulating refactors touching multiple services simultaneously (e.g. `auth-service` + `redis-session-cluster`) required deduplicating cyclic graphs and aggregating composite risk scores without freezing the UI thread.
   - *Solution:* Built an asynchronous BFS graph engine in TypeScript that computes downstream reach, flakiness penalties, and P0 incident overrides in sub-millisecond time.

---

### 7. Accomplishments That We're Proud Of
- **100% Live Native ChatGPT Verification:** Verified in the real ChatGPT app with full tool discovery, autonomous simulation execution, and accurate 0.79 Critical Risk reporting.
- **Interactive Visual Feedback Loop:** Calling a WebMCP tool doesn't just return JSON to the AI — it triggers real-time visual canvas physics on the human's screen.
- **Strict Human-in-the-Loop Enforcement:** Created an unbreakable Trust Layer where autonomous agents cannot bypass human sign-offs.

---

### 8. What We Learned
WebMCP fundamentally shifts the web paradigm: websites are no longer passive documents for human eyes — **they are interactive, programmable environments where AI agents and humans collaborate safely in real time.**

---

### 9. What's Next for TREMOR
1. **GitHub PR Webhook Integration:** Automatically running TREMOR blast simulations on incoming agent-created PRs.
2. **OpenTelemetry Live Traces:** Ingesting live Jaeger / Datadog distributed traces to update edge weights dynamically.
3. **Multi-Agent Quorum Approval:** Requiring consensus between specialized verification agents before presenting flags to human SREs.
