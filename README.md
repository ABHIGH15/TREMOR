# ⚡ TREMOR
### *Agentic Blast Radius & Systemic Regression Prevention Cockpit*

> **Tagline:** *See what your AI agent is about to break — before it does.*  
> Built for the **WebMCP Challenge 2026** (OpenAI, Google Chrome, Vercel, Cloudflare, Netlify, Shopify, Render).

[![Live Cockpit](https://img.shields.io/badge/Live%20Cockpit-tremor--cockpit.vercel.app-blueviolet?style=for-the-badge&logo=vercel)](https://tremor-cockpit.vercel.app)
[![WebMCP Standard](https://img.shields.io/badge/WebMCP-W3C%20Standard-emerald?style=for-the-badge&logo=googlechrome)](https://github.com/mcp-b/global)
[![GitHub](https://img.shields.io/badge/GitHub-ABHIGH15%2FTREMOR-blue?style=for-the-badge&logo=github)](https://github.com/ABHIGH15/TREMOR)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](./LICENSE)

---

## 📖 Table of Contents
1. [The Problem: AI Agent Myopia](#-the-problem-ai-agent-myopia)
2. [The Solution: TREMOR Cockpit](#-the-solution-tremor-cockpit)
3. [The 6-Tool WebMCP Architecture Suite](#-the-6-tool-webmcp-architecture-suite)
4. [The Centerpiece: `simulate_change_impact`](#-the-centerpiece-simulate_change_impact)
5. [The Trust Layer: Human-in-the-Loop Gate](#-the-trust-layer-human-in-the-loop-gate)
6. [Live Verification & Real ChatGPT Transcript](#-live-verification--real-chatgpt-transcript)
7. [Visual Verification Proofs & MD5 Hashes](#-visual-verification-proofs--md5-hashes)
8. [Architecture & Tech Stack](#-architecture--tech-stack)
9. [Keyboard Shortcuts & Accessibility](#-keyboard-shortcuts--accessibility)
10. [Local Development & Quickstart](#-local-development--quickstart)
11. [License & Credits](#-license--credits)

---

## 🚨 The Problem: AI Agent Myopia

Autonomous AI coding agents (**Claude Code**, **Cursor**, **Codex**, **ChatGPT**) are exceptionally good at editing individual functions, but they suffer from **Architectural Myopia (Tunnel Vision)**:

1. **Localized Context:** When an agent modifies a single file (e.g. `auth-service/session.ts`), it reads 200 lines of isolated code. It does not perceive how that file impacts 20 downstream microservices across the organization.
2. **Hidden Systemic Cascades:** A simple 2-line token TTL cache refactor looks benign to localized unit tests, but at scale it triggers a **Cache Stampede** on Redis, crashing checkout queues across 7 dependent services.
3. **Automated Pipelines are Blind:** Standard CI/CD test runners only execute tests mapped to the changed package, silently allowing high-risk architectural regressions to ship to production.

---

## 🛡️ The Solution: TREMOR Cockpit

**TREMOR** is an interactive, browser-resident "System Context Cockpit" that provides autonomous AI agents and human engineers with the *exact same* real-time picture of distributed topology, transitive blast radius, and historical regression precedents before any code ships.

When an AI agent connects to TREMOR via **WebMCP** (`document.modelContext`), the webpage transforms into an interactive API. The agent queries topology, simulates proposed refactors, and observes instant visual graph feedback. If a change exceeds safety thresholds, TREMOR enforces a **mandatory physical human confirmation gate**.

```
+-----------------------------------------------------------------------------------+
|                              TREMOR WEBMCP COCKPIT                                |
+-----------------------------------------------------------------------------------+
|                                                                                   |
|  1. VISUAL 2D FORCE GRAPH CANVAS (Physics Engine)                                 |
|     - 18 microservices across 4 architectural layers (frontend, backend, infra).  |
|     - Dynamic risk coloring (Green < 0.40, Amber 0.40–0.74, Red >= 0.75).         |
|     - Real-time particle streams accelerating along impacted dependency paths.    |
|                                                                                   |
|  2. WEBMCP RUNTIME ENGINE (@mcp-b/global Standard)                                |
|     - 6 canonical tools registered directly on document.modelContext.             |
|     - Multi-root BFS transitive dependency traversal & incident pattern matcher.  |
|                                                                                   |
|  3. THE TRUST LAYER (Physical Human Confirmation Gate)                            |
|     - AI can flag changes via flag_for_review (can_tool_self_approve: false).     |
|     - Approval requires a physical human DOM click in the interactive Cockpit.    |
|                                                                                   |
+-----------------------------------------------------------------------------------+
```

---

## 🛠️ The 6-Tool WebMCP Architecture Suite

TREMOR registers 6 structured WebMCP tools directly onto `document.modelContext` using the official `@mcp-b/global` standard polyfill:

| # | Tool Name | Primary Purpose | Key Parameters | Side-Effects on Live UI |
|---|---|---|---|---|
| **1** | `get_system_snapshot` | Returns complete system topology, risk bottlenecks, tests, and incidents | `layer_filter?`, `include_incidents?`, `include_tests?` | Orientation payload for agents |
| **2** | `get_blast_radius` | Transitive BFS reach across downstream callers and affected test suites | `module` (string) | Highlights downstream blast zone in crimson |
| **3** | `check_regression_history` | Pattern matcher for historical outages, failure modes, and commit authors | `pattern` (string) | Surfaces related incident cards |
| **4** | `get_change_provenance` | Audit trail tagging commits by AI agent authorship ratio vs Human engineers | `module` (string) | Opens AI vs Human provenance breakdown |
| **5** | `simulate_change_impact` | **Centerpiece Tool**: Simulates refactors, computes risk index (0–1.0) | `description`, `touched_modules` | Lights up pulsing amber rings and top banner |
| **6** | `flag_for_review` | **Trust Layer**: Registers a pending review flag solvable ONLY by human click | `module`, `risk_notes`, `proposed_action?` | Creates pending flag with pulsing navbar badge |

### Canonical WebMCP Registration Example (`document.modelContext.registerTool`)

Every tool in TREMOR is registered directly onto `document.modelContext` adhering to the W3C WebMCP specification using the `@mcp-b/global` standard polyfill:

```typescript
// Actual registration code from src/webmcp/tools.ts
await document.modelContext.registerTool({
  name: 'get_blast_radius',
  description: 'Returns everything downstream of a module: dependent modules, affected tests, and past incidents tied to it. Also triggers the on-screen graph to visually highlight the impact zone.',
  inputSchema: {
    type: 'object',
    properties: {
      module: {
        type: 'string',
        description: 'The ID of the module or service to inspect (e.g. "auth-service", "checkout-service", "db-client-pool")',
      },
    },
    required: ['module'],
  },
  execute: async ({ module }: { module: string }) => {
    const targetNode = nodeMap.get(module);
    if (!targetNode) {
      return {
        isError: true,
        content: [{ type: 'text', text: `Module '${module}' not found.` }],
      };
    }

    // 1. Transitive BFS traversal
    const downstreamIds = computeDownstreamTransitive(module, dataset);
    const allImpactedIds = [module, ...downstreamIds];

    // 2. Collate affected tests & historical incidents
    const affectedTests = dataset.tests.filter(t => allImpactedIds.includes(t.module));
    const relatedIncidents = dataset.incidents.filter(i => allImpactedIds.includes(i.module));

    // 3. Live UI Visual Side-Effect: highlight impact zone on canvas
    callbacks.onHighlightImpactZone?.(allImpactedIds, targetNode);

    // 4. Return standard MCP content payload
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          target_module: module,
          downstream_dependents: downstreamIds,
          total_impacted_modules: allImpactedIds.length,
          affected_tests: affectedTests,
          historical_incidents: relatedIncidents,
        }, null, 2),
      }],
    };
  },
});
```

---

## ⚡ The Centerpiece: `simulate_change_impact`

`simulate_change_impact` is TREMOR's premier capability. An AI agent calls it before applying a refactoring plan:

```typescript
// AI Agent executes via WebMCP:
await document.modelContext.executeTool("simulate_change_impact", {
  description: "Refactor JWT claims validation and sliding session cache timeout in Redis cluster",
  touched_modules: ["auth-service", "redis-session-cluster"]
});
```

### What Happens Internally:
1. **Transitive Downstream BFS:** Traces callers from multiple roots simultaneously (identifying `api-gateway`, `checkout-service`, `web-app`, `mobile-checkout`, `admin-portal`, `partner-portal`, `jwt-security-core`).
2. **Historical Regression Scan:** Matches keywords against 5 past production incidents (matching P1 Cache Stampede `i1` and P0 Timeout Spike `i2`).
3. **Test Suite Vulnerability Check:** Identifies 12 affected test suites, flagging failing (`redis_token_revocation.spec.ts`) and flaky suites.
4. **Calculated Predicted Risk Index:** Computes `0.79` risk index $\to$ `CRITICAL RISK - HUMAN REVIEW REQUIRED`.
5. **Real-Time Canvas Animation:** Directly touched nodes pulse in electric amber, downstream callers glow in crimson alert borders, and graph particles accelerate 3x.

---

## 🔒 The Trust Layer: Human-in-the-Loop Gate

In autonomous workflows, AI self-approval creates dangerous failure loops. TREMOR enforces a **strict, non-self-approving Trust Layer**:

- **Strict Tool Boundary:** `flag_for_review` registers a flag in the reactive store with `can_tool_self_approve: false`.
- **Zero Programmatic Resolution:** There are **NO WebMCP tools** to approve or dismiss flags.
- **Physical Human Action Only:** Approval requires a physical human click on the green **"Confirm / Approve"** button in the Cockpit.
- **Two-Layer Defense:**
  1. *Layer 1 (Agent-Side):* ChatGPT asks the human user for conversational confirmation before calling high-impact tools.
  2. *Layer 2 (Cockpit-Side):* TREMOR locks the pending flag until an authorized engineer (e.g. *Devin Patel, Lead SRE*) confirms the action in the UI.

---

## 🧪 Live Verification & Real ChatGPT Transcript

During Round 8 testing, the live production URL (`https://tremor-cockpit.vercel.app`) was opened directly inside the **official ChatGPT App (Native In-App Browser)**.

### Verbatim Transcript Received from Native ChatGPT:

> **Simulation completed—no infrastructure was changed.**
> 
> **Available WebMCP tools:** `get_blast_radius`, `check_regression_history`, `get_change_provenance`, `simulate_change_impact`, `flag_for_review`, and `get_system_snapshot`. I did not invoke `flag_for_review`.
> 
> **Simulation input**
> - Description: “Modify auth-service and redis-session-cluster”
> - Touched modules: `auth-service`, `redis-session-cluster`
> 
> **Result:** predicted blast-risk index **0.79** — **Critical Risk; human review required**. The cockpit identified **9 total nodes** in scope, with 12 impacted tests, including 1 failing and 3 flaky suites.
> 
> **Affected services and dependencies**
> - Direct changes:
>   - `auth-service` — backend, risk **0.88**
>   - `redis-session-cluster` — infrastructure, risk **0.72**
> - Downstream impact:
>   - `api-gateway` (0.55)
>   - `checkout-service` (0.75)
>   - `web-app` (0.25)
>   - `mobile-checkout` (0.40)
>   - `admin-portal` (0.15)
>   - `partner-portal` (0.30)
>   - `jwt-security-core` (0.82)
> 
> Key dependency paths are API Gateway → Auth Service, Checkout → Auth Service, Auth Service → Redis (token persistence), and JWT Security Core → Redis (cache validation).
> 
> **Risks**
> - A prior **P1** incident followed a sliding-session-expiry change: Redis cache stampede during authentication peaks dropped checkout sessions.
> - A prior **P0** checkout outage resulted from auth-token-validation timeouts.
> - JWT parsing previously rejected valid mobile tokens after clock-skew changes.
> - Vulnerable tests:
>   - Failing: `redis_token_revocation.spec.ts`
>   - Flaky: `jwt_session_validation.spec.ts` (0.78), `payment_auth_pipeline.spec.ts` (0.65), `token_signature_verification.spec.ts` (0.42)
> 
> **Assumptions**
> This models an unspecified modification to both modules, so it is a scope-level estimate—not a prediction for a particular TTL, schema, replication, or code-path change. The only page effect was visual highlighting of the simulated graph; no review flag, deployment, or infrastructure action was performed.

---

## 📸 Visual Verification Proofs & MD5 Hashes

All visual proofs were captured in real Google Chrome with the official WebMCP flag and throwaway sandbox profile:

| Round / Artifact | Description | MD5 Hash | Raw GitHub Image Link |
|---|---|---|---|
| **Round 4: Critical Simulation** | `auth-service` + `redis-cluster` (0.79 Risk, red banner) | `8fbc8d6896c21e5bb0adbfdfc36e4f55` | [scenario1-critical.png](./verification/round4/scenario1-critical.png) |
| **Round 4: Elevated Simulation** | `order-processor` (0.62 Risk, amber banner) | `13d726ba9b5146c92d52eb995a9d20c5` | [scenario2-elevated.png](./verification/round4/scenario2-elevated.png) |
| **Round 4: DB Pool Scaling** | `db-client-pool` (0.70 Risk, P0 override) | `4c8449e755fe55d3f1d821ae036735c3` | [scenario3-db-pool.png](./verification/round4/scenario3-db-pool.png) |
| **Round 4: Low Risk Change** | `partner-portal` regex (0.15 Risk, green banner) | `55ce545a1651ddc7f9ea22e259e21820` | [scenario4-low.png](./verification/round4/scenario4-low.png) |
| **Round 5: Trust Layer Gate** | Pending flag awaiting physical human click | `e5bc418a0b0d381017efbe1ea0f058cf` | [flag-pending-gate.png](./verification/round5/flag-pending-gate.png) |
| **Round 5: Human Sign-Off** | Approved by Devin Patel with green badge | `ea242bbbf746b14299b9cf9c755ca706` | [flag-confirmed-human.png](./verification/round5/flag-confirmed-human.png) |
| **Round 5: Activity Stream** | Real-time audit log with `HUMAN_GATE` events | `e2a4be60534c062c3e1db6f525546059` | [flag-activity-stream.png](./verification/round5/flag-activity-stream.png) |
| **Round 7: About Architecture** | Opened modal explaining AI myopia & WebMCP tools | `b97ba77fb57c96096470d3598ecae5ad` | [polish-about-modal.png](./verification/round7/polish-about-modal.png) |
| **Round 7: Accessible Focus** | WCAG 2.1 AA cyan keyboard focus ring | `3a56e5bb7db436c6b79fc11466d004a0` | [polish-keyboard-focus.png](./verification/round7/polish-keyboard-focus.png) |
| **Round 7: Hover Card & Grid** | Cyber-grid canvas with floating module hover card | `6495ec3422164ae86e9b09e22969591d` | [polish-canvas-grid-hover.png](./verification/round7/polish-canvas-grid-hover.png) |
| **Round 8: Chrome Desktop** | Desktop WebMCP flag execution (1440×900) | `f5da8b6c28f293144e39d33db82b610a` | [crossbrowser-chrome-desktop.png](./verification/round8/crossbrowser-chrome-desktop.png) |
| **Round 8: Simulated Mobile** | iPhone 14 Pro viewport (390×844) overlay drawer | `d072df2d1dd3277579572d258d54d990` | [crossbrowser-chatgpt-mobile.png](./verification/round8/crossbrowser-chatgpt-mobile.png) |
| **Round 8: Simulated Split** | Desktop split-view viewport (1024×768) | `e4a599a0e9de42ba5a13115447d341ef` | [crossbrowser-chatgpt-splitview.png](./verification/round8/crossbrowser-chatgpt-splitview.png) |

---

## 🏗️ Architecture & Tech Stack

- **Core Framework:** React 18 + TypeScript + Vite (compiled in 1.3s with zero type errors)
- **Styling & UI:** Tailwind CSS (obsidian dark palette `#070a12`, glassmorphism banners, high-contrast badges)
- **Graph Visualization:** `react-force-graph-2d` (HTML5 Canvas 2D physics engine, 60fps particle streams)
- **WebMCP Standard:** Official `@mcp-b/global@5.1.0` polyfill (authored by Alex Nahas, WebMCP Challenge Judge)
- **Icons:** `lucide-react`
- **Deployment:** Vercel Edge Global CDN ([https://tremor-cockpit.vercel.app](https://tremor-cockpit.vercel.app))

---

## ⌨️ Keyboard Shortcuts & Accessibility

TREMOR supports power-user navigation and satisfies **WCAG 2.1 AA** accessibility requirements:

| Shortcut | Action |
|---|---|
| <kbd>H</kbd> | Highlight & center camera on Hero Node (`auth-service`) |
| <kbd>S</kbd> | Trigger Centerpiece Simulation (`simulate_change_impact`) |
| <kbd>R</kbd> | Reset graph camera, zoom level, and highlights |
| <kbd>Esc</kbd> | Close active modals, dismiss sidebars, or clear simulation |
| <kbd>?</kbd> or <kbd>/</kbd> | Open About & Architecture guidance modal |
| <kbd>Tab</kbd> | Sequential keyboard navigation with high-visibility `:focus-visible` rings |

---

## 🚀 Local Development & Quickstart

```bash
# 1. Clone the repository
git clone https://github.com/ABHIGH15/TREMOR.git
cd TREMOR

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev

# 4. Build production bundle
npm run build

# 5. Run WebMCP verification test in Google Chrome
node test_round6_regression.mjs
```

---

## 📜 License & Credits

- **License:** [MIT License](./LICENSE) — 100% Free and Open Source.
- **WebMCP Polyfill:** Built using [`@mcp-b/global`](https://github.com/mcp-b/global) created by Alex Nahas.
- **Author:** Built for the **WebMCP Challenge 2026**.
