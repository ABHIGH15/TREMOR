# ⚡ TREMOR — Devpost Submission Package
### *WebMCP Challenge 2026 Submission*

> **Project Name:** TREMOR — Agentic Blast Radius & Systemic Regression Prevention Cockpit  
> **Tagline:** *See what your AI agent is about to break — before it does.*  
> **Live Cockpit:** [https://tremor-cockpit.vercel.app](https://tremor-cockpit.vercel.app)  
> **GitHub Repository:** [https://github.com/ABHIGH15/TREMOR](https://github.com/ABHIGH15/TREMOR)  
> **Open Source License:** MIT  
> **Demo Video (YouTube):** *[Insert Demo Video Link]*  
> *(Note: TREMOR is an independent project built for the WebMCP Challenge 2026 and is not affiliated with the @tremor/react UI library or tremor-runtime.)*

---

## 🏆 Key Submission Criteria: The Core Questions

### 1. Why WebMCP fits this use case (and why backend MCP cannot solve this)
In 2026, engineering teams are formally tracking **"AI-Specific Change Failure Rate" (AI-CFR)**. While autonomous coding agents generate diffs 4x faster, unverified multi-module ripple effects cause severe cascading outages. 

Today, multiple backend MCP servers exist to analyze codebase dependencies (e.g. `code-impact-mcp`, `code-review-graph`, `Port.io`, `codebase-memory-mcp`). However, every single one of them suffers from the same fundamental limitation: **they run silently inside a terminal CLI, outputting raw text back to an LLM.** 

To a human engineer overseeing an agent, terminal text provides zero real-time situational awareness and no visual verification.

**WebMCP fundamentally transforms this dynamic:**
- **Zero-Install, In-Browser Runtime:** Tools are registered directly onto `document.modelContext` via the `@mcp-b/global` standard polyfill. No local socket setup, background daemons, or complex configuration.
- **Bi-Directional Feedback Loop:** When an agent queries `simulate_change_impact`, the browser's 2D canvas dynamically illuminates the blast zone at 60fps. Both the human and the AI agent look at the exact same live visual impact graph in the same tab.
- **Enforceable Browser Gates:** Because WebMCP runs in the user's browser, high-risk actions can be locked behind real UI event handlers that the agent cannot programmatically bypass.
- **Ecosystem Extensibility:** Platforms like **Vercel** or **Netlify** could expose their own deploy-preview dependency graphs and monorepo build pipelines through a WebMCP tool built exactly this way, catching systemic breaks before code even reaches staging.

> *"Backend MCP tools already hand agents blast-radius data as text in a terminal. TREMOR is browser-native — a human and their agent look at the same live impact graph in the same tab, and nothing risky ships without a human clicking Confirm."*

---

### 2. The Quality of the Human-Agent Experience (UX)
OpenAI's core lens for WebMCP is the quality of collaboration between human and agent. Traditional agent workflows oscillate between **dangerous opacity** (the agent edits files blindly) and **alert fatigue** (walls of terminal text).

TREMOR redefines this experience:
1. **Shared Visual Reality:** When an agent analyzes a change, touched nodes pulse in electric amber, downstream callers glow in crimson alert borders, and directional particles accelerate along affected edges. The engineer immediately understands what the agent is reasoning about in 2 seconds.
2. **The Propose-Then-Confirm Safety Loop:**
   - *Agent-Side Confirmation (ChatGPT):* ChatGPT's agent mode prompts the user conversationally before executing consequential tools.
   - *Cockpit-Side Confirmation (TREMOR):* The `flag_for_review` tool creates a pending review item with `can_tool_self_approve: false`. The agent has **no tool to approve its own changes**; only an authorized human engineer clicking **Confirm / Approve** in the cockpit unlocks the review.
3. **Ergonomic Micro-Interactions:** Fully compliant with **WCAG 2.1 AA**, featuring high-contrast `:focus-visible` rings, power-user keyboard shortcuts (<kbd>H</kbd> for Hero, <kbd>S</kbd> for Simulation, <kbd>R</kbd> for Reset, <kbd>?</kbd> for Help), floating canvas zoom/fit controls, and responsive overlay drawers for mobile/tablet viewports.

---

### 3. What is newly possible together
Before WebMCP, autonomous coding agents suffered from **"Architectural Myopia"**: an LLM editing a single file (like `auth-service/session.ts`) reads 200 lines of isolated code, completely blind to the 20 downstream microservices that depend on that token schema. A 2-line cache TTL refactor passes local unit tests, but under peak traffic causes a Redis cache stampede that knocks out the checkout pipeline.

**TREMOR intervenes at the exact adopter moment:**
> **Used at the exact moment Claude Code, Cursor, or Codex proposes a diff spanning shared modules — before the PR opens, not after CI fails.**

**Together with WebMCP, TREMOR makes newly possible:**
1. **Pre-Execution Multi-Service Simulation:** AI agents simulate transitive blast radius, flaky test vulnerabilities, and historical outage precedents *before* writing or merging code.
2. **Grounded Live Repository Telemetry:** `get_change_provenance` connects directly to the GitHub REST API (`ABHIGH15/TREMOR`), fetching live repository commits alongside architectural authorship ratios (AI agent contributions vs human staff engineers).
3. **Unbreakable Human-in-the-Loop Governance:** High-risk refactors are automatically halted until human engineers review the blast radius in the cockpit.

---

### 4. How it was implemented & Architectural Depth
- **WebMCP Standard Polyfill:** Built on official `@mcp-b/global@5.1.0` (authored by Alex Nahas, W3C WebMCP contributor).
- **The 6-Tool WebMCP Architecture Suite:**
  1. `get_system_snapshot`: Returns full topology (18 nodes, 28 edges), top risk bottlenecks (`auth-service 0.88`, `jwt-security-core 0.82`, `checkout-service 0.75`), incident index, and test suite health summary.
  2. `get_blast_radius`: Multi-root transitive BFS traversal mapping downstream callers and flaky tests.
  3. `check_regression_history`: Regex/keyword incident pattern matcher surfacing past outage root causes.
  4. `get_change_provenance`: Live GitHub API commit telemetry combined with AI vs Human authorship auditing.
  5. `simulate_change_impact`: Centerpiece simulator computing composite predicted risk index (0.0–1.0) and driving real-time canvas particle acceleration.
  6. `flag_for_review`: Non-self-approving Trust Layer gate generating pending review cards in the UI.
- **Frontend & Physics:** React 18, TypeScript, Tailwind CSS, and `react-force-graph-2d` for 60fps canvas physics.
- **Native ChatGPT In-App Browser Verification:** Verified live inside the official native ChatGPT app, with full tool discovery, autonomous simulation execution, and accurate 0.79 Critical Risk reporting.

---

## 📝 Complete Devpost Submission Fields

### Project Title
TREMOR — Agentic Blast Radius & Systemic Regression Prevention Cockpit

### Tagline
See what your AI agent is about to break — before it does.

### Built With
`react`, `typescript`, `vite`, `tailwindcss`, `webmcp`, `@mcp-b/global`, `react-force-graph-2d`, `lucide-react`, `vercel`, `github-api`

### Try It Out
- **Live Cockpit:** [https://tremor-cockpit.vercel.app](https://tremor-cockpit.vercel.app)
- **GitHub Repository:** [https://github.com/ABHIGH15/TREMOR](https://github.com/ABHIGH15/TREMOR)

---

### Challenges We Ran Into & How We Solved Them
1. **Strict Read-Only Properties in ChatGPT's Native In-App Browser:**
   - *Challenge:* In ChatGPT's native in-app browser, the host defines `document.modelContext` with `writable: false`. An early debug assignment (`doc.modelContext.getTools = ...`) threw a runtime `TypeError` that halted script execution on page load.
   - *Solution:* We eliminated all direct property mutations, moved convenience helpers to `window.__tremor_webMCP`, and registered tools cleanly via standard `document.modelContext.registerTool({...})`. ChatGPT immediately discovered all 6 tools!
2. **Multi-Root Transitive BFS Traversal:**
   - *Challenge:* Simulating changes touching multiple services simultaneously (`auth-service` + `redis-session-cluster`) required deduplicating cyclic dependencies and aggregating risk metrics without freezing the UI thread.
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
