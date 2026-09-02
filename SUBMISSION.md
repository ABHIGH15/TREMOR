# ⚡ TREMOR — Devpost Submission Package
### *WebMCP Challenge 2026 Submission*

> **Project Name:** TREMOR — Agentic Blast Radius & Systemic Regression Prevention Cockpit  
> **Tagline:** *See what your AI agent is about to break — before it does.*  
> **Live Cockpit:** [https://tremor-cockpit.vercel.app](https://tremor-cockpit.vercel.app)  
> **GitHub Repository:** [https://github.com/ABHIGH15/TREMOR](https://github.com/ABHIGH15/TREMOR)  
> **Open Source License:** MIT  
> **Demo Video (YouTube):** *[Insert Demo Video Link]*  
> *(Note: TREMOR is an independent safety cockpit built for the WebMCP Challenge 2026 and is not affiliated with the @tremor/react UI library or tremor-runtime.)*

---

## 🏆 Key Submission Criteria: The 4 Core Questions

### 1. Why WebMCP fits this use case
Autonomous AI coding agents (Claude Code, Cursor, Codex, ChatGPT) operate inside the browser and developer tools, but traditional backend MCP servers require complex local socket configurations and cannot interact with the developer's live visual screen.

**WebMCP is the ideal fit because it turns the web browser into an interactive, zero-install bridge:**
- The cockpit registers tools directly onto `document.modelContext` via the `@mcp-b/global` standard.
- When an AI agent connects via ChatGPT's in-app browser or Chrome, it immediately discovers standard tools (`get_blast_radius`, `simulate_change_impact`, `flag_for_review`).
- Crucially, WebMCP creates a **bi-directional feedback loop**: when the AI calls `simulate_change_impact`, the browser's 2D canvas dynamically illuminates the blast zone, giving the human engineer and AI agent the *exact same* situational awareness in real time.

---

### 2. How it creates a better user experience (UX)
Traditional agent workflows suffer from either **dangerous opacity** (the AI changes files blindly) or **alert fatigue** (endless raw terminal text).

TREMOR delivers a superior UX through:
- **Instant Visual Synchronization:** When the AI evaluates a refactor, touched modules pulse with amber rings while downstream callers glow in crimson alert borders at 60fps.
- **Dual-Layer Trust Defense:**
  1. *Layer 1 (Conversational):* ChatGPT asks the human user for conversational confirmation before executing high-impact actions.
  2. *Layer 2 (Physical Human Gate):* TREMOR's `flag_for_review` tool creates a pending flag with `can_tool_self_approve: false`. The AI **cannot self-approve**; only an authorized human engineer (*Devin Patel, Lead SRE*) clicking the green "Confirm / Approve" button in the Cockpit can unlock the change.
- **Micro-Ergonomics & Accessibility:** WCAG 2.1 AA keyboard focus rings, power-user shortcuts (<kbd>H</kbd> for Hero, <kbd>S</kbd> for Simulation, <kbd>R</kbd> for Reset, <kbd>?</kbd> for Help), floating canvas zoom toolbar, and responsive slide-over drawers for mobile/tablet viewports.

---

### 3. What is newly possible together
Before WebMCP, an AI coding agent modifying backend microservices had **"Architectural Myopia"**—it could only see the 200 lines of code in the file it was editing. A 2-line cache TTL fix in `auth-service` would pass local unit tests but trigger a **Cache Stampede** across 7 downstream microservices, causing a P0 checkout outage.

**Together with WebMCP, TREMOR makes newly possible:**
1. **Pre-Execution Blast Simulation:** AI agents can now simulate multi-service transitive ripple effects (BFS reach, flaky test exposure, past outage precedent matching) *before* applying code modifications.
2. **Authorship Provenance Auditing:** Agents and SREs can instantly audit recent commits by AI agent authorship ratio (Claude Code, Cursor, Codex) vs. human staff engineer commits.
3. **Unbreakable Human-in-the-Loop Governance:** High-risk refactors are automatically halted until human engineers review the blast radius in the cockpit.

---

### 4. How it was implemented & Architectural Depth
- **WebMCP Standard Polyfill:** Implemented using official `@mcp-b/global@5.1.0` (authored by WebMCP Challenge Judge Alex Nahas).
- **The 6-Tool WebMCP Suite:**
  1. `get_system_snapshot`: Complete topology (18 nodes, 28 edges), top risk bottlenecks (`auth-service 0.88`, `jwt-security-core 0.82`, `checkout-service 0.75`), incident index, and test suite health summary.
  2. `get_blast_radius`: Multi-root transitive BFS traversal mapping downstream callers and flaky tests.
  3. `check_regression_history`: Regex/keyword incident pattern matcher surfacing past outage root causes.
  4. `get_change_provenance`: Commit authorship analyzer tagging AI vs Human contribution ratios.
  5. `simulate_change_impact`: Centerpiece simulator computing composite predicted risk index (0.0–1.0) and driving real-time canvas particle acceleration.
  6. `flag_for_review`: Non-self-approving Trust Layer gate generating pending review cards in the UI.
- **Frontend & Physics:** React 18, TypeScript, Tailwind CSS, and `react-force-graph-2d` for 60fps canvas physics.
- **Verified in Native ChatGPT:** Tested and verified live in the official native ChatGPT In-App Browser, discovering all 6 tools and executing the 0.79 Critical Risk simulation cleanly.

---

## 📝 Complete Devpost Submission Fields

### Project Title
TREMOR — Agentic Blast Radius & Systemic Regression Prevention Cockpit

### Tagline
See what your AI agent is about to break — before it does.

### Built With
`react`, `typescript`, `vite`, `tailwindcss`, `webmcp`, `@mcp-b/global`, `react-force-graph-2d`, `lucide-react`, `vercel`

### Try It Out
- **Live Cockpit:** [https://tremor-cockpit.vercel.app](https://tremor-cockpit.vercel.app)
- **GitHub Repository:** [https://github.com/ABHIGH15/TREMOR](https://github.com/ABHIGH15/TREMOR)

---

### Challenges We Ran Into & How We Solved Them
1. **Strict Read-Only Properties in ChatGPT's Native In-App Browser:**
   - *Challenge:* When testing inside the native ChatGPT app, ChatGPT's runtime enforces strict W3C WebMCP read-only property definitions on `document.modelContext`. An early debug assignment (`doc.modelContext.getTools = ...`) threw a runtime `TypeError` halting script execution on initial page load.
   - *Solution:* We eliminated all direct property mutations, moved convenience helpers to `window.__tremor_webMCP`, and registered tools cleanly via standard `document.modelContext.registerTool({...})`. ChatGPT immediately discovered all 6 tools!
2. **Multi-Root Transitive BFS Traversal:**
   - *Challenge:* Simulating changes touching multiple services simultaneously (`auth-service` + `redis-session-cluster`) required deduplicating cyclic dependencies and aggregating risk metrics without freezing the UI.
   - *Solution:* Built an asynchronous BFS graph engine in TypeScript that computes downstream reach, flakiness penalties, and P0 incident overrides in sub-millisecond time.

---

### Accomplishments That We're Proud Of
- **100% Live Native ChatGPT Verification:** Verified in the real ChatGPT app with full tool discovery, autonomous simulation execution, and accurate 0.79 Critical Risk reporting.
- **Interactive Visual Feedback Loop:** Calling a WebMCP tool doesn't just return JSON to the AI — it triggers real-time visual canvas physics on the human's screen.
- **Strict Human-in-the-Loop Enforcement:** Created an unbreakable Trust Layer where autonomous agents cannot bypass human sign-offs.

---

### What We Learned
WebMCP fundamentally shifts the web paradigm: websites are no longer passive documents for human eyes — **they are interactive, programmable environments where AI agents and humans collaborate safely in real time.**

---

### What's Next for TREMOR
1. **GitHub PR Webhook Integration:** Automatically running TREMOR blast simulations on incoming agent-created PRs.
2. **OpenTelemetry Live Traces:** Ingesting live Jaeger / Datadog distributed traces to update edge weights dynamically.
3. **Multi-Agent Quorum Approval:** Requiring consensus between specialized verification agents before presenting flags to human SREs.
