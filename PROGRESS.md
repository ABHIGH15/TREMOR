# TREMOR — Build Progress Tracker

**WebMCP Challenge 2026 Submission**

---

## Round Checklist & Status

| Round | Title | Status | Completed At | Notes |
|---|---|---|---|---|
| **ROUND 0** | Project Setup & Live Skeleton | ✅ Complete | 2026-09-01 | Initial skeleton, MIT License, build verified |
| **ROUND 0.5**| Branding Update to TREMOR | ✅ Complete | 2026-09-01 | Live at [https://tremor-cockpit.vercel.app](https://tremor-cockpit.vercel.app) & [GitHub Repo](https://github.com/ABHIGH15/TREMOR) |
| **ROUND 1** | Data Layer (`dataset.json`) | ✅ Complete | 2026-09-01 | 18 nodes, 28 edges, 20 commits (60% AI), 5 incidents, 16 tests, hero: `auth-service` (0.88 risk) |
| **ROUND 2** | Graph Visualization (`react-force-graph-2d`) | ✅ Complete | 2026-09-01 | Interactive 2D force graph, risk coloring, legend, layer filtering, full node detail sidebar |
| **ROUND 3** | WebMCP Core Read Tools | ✅ Complete | 2026-09-01 | Registered `get_blast_radius`, `check_regression_history`, `get_change_provenance` on `document.modelContext` + Interactive Tool Runner + Activity Stream |
| **ROUND 4** | Centerpiece: `simulate_change_impact` | ✅ Complete | 2026-09-01 | Registered `simulate_change_impact` tool on `document.modelContext`, built floating `SimulationBanner`, dynamic particle graph simulation, full sidebar breakdown, verified across 3 scenarios in real Chrome |
| **ROUND 5** | Trust Layer: `flag_for_review` | ⏳ Pending | — | Pending review panel with human-only Confirm/Dismiss |
| **ROUND 6** | `get_system_snapshot` & Regression Pass | ⏳ Pending | — | Full 6-tool suite validation |
| **ROUND 7** | Visual & UX Polish Pass | ⏳ Pending | — | High-contrast theme, smooth animations, empty/loading states |
| **ROUND 8** | Cross-Browser Live Testing | ⏳ Pending | — | ChatGPT in-app browser & Chrome WebMCP flag testing |
| **ROUND 9** | Documentation & Repo Finalization | ⏳ Pending | — | Full docs, license verification, code snippets |
| **ROUND 10**| Demo Video & Submission | ⏳ Pending | — | <3 min demo video, Devpost submission |

---

## Detailed Round Logs

### ROUND 0 — Project Setup & Live Skeleton (Completed)
- Scaffolded project with React 18, TypeScript, Tailwind CSS, and Vite.
- Added root `LICENSE` (MIT) and initial config.
- Verified build and zero-error deployment.

### ROUND 0.5 — Rename Project to TREMOR (Completed)
- Renamed `package.json` name to `tremor`.
- Updated `index.html`, `src/App.tsx`, `LICENSE`, `README.md`, and `PROGRESS.md` with TREMOR branding.
- Renamed GitHub repository to `https://github.com/ABHIGH15/TREMOR` via `gh repo rename`.
- Deployed to Vercel production at `https://tremor-cockpit.vercel.app`.

### ROUND 1 — Data Layer (Completed)
- **Created:** `src/types/dataset.ts` with strict TypeScript interfaces (`SystemDataset`, `SystemNode`, `SystemEdge`, `Commit`, `Incident`, `SystemTest`).
- **Created:** `src/data/dataset.json` with 18 nodes across 4 layers, 28 edges, 20 commits (60% AI / 40% Human), 5 historical incidents, and 16 test suites.
- **Hero Risky Node:** Designed `auth-service` (0.88 risk score, 5 commits with 4 AI authors, 2 critical past incidents, 2 flaky/failing tests, core hub in dependency tree).
- **Verified:** Clean build, typed schema validation, console logging on app mount.

### ROUND 2 — Graph Visualization (Completed)
- **Implemented:** Interactive Force-Directed 2D canvas with `react-force-graph-2d` and custom canvas renderer.
- **Loading & Empty States:** Added deliberate physics simulation loading skeleton with radar pulse, plus guided empty state.
- **Node & Edge Styling:** Dynamic risk coloring (Green < 0.4, Amber 0.4–0.7, Red > 0.7), active incident dashed rings, hero glow pulses, animated link directional particles, and layer badges.
- **Node Detail Sidebar:** Complete deep-dive inspector with calculated risk index progress bar, upstream/downstream dependency links, historical regression incident cards, test suite flakiness meters, and AI/Human change provenance logs.
- **Verified:** Zero compilation errors, clean bundle build, and live deployment.

### ROUND 3 — WebMCP Core Read Tools (Completed)
- **WebMCP Runtime Layer:** Created `src/webmcp/runtime.ts` polyfilling `document.modelContext` / `navigator.modelContext` with tool registration, discovery, event emissions, and execution timing using official `@mcp-b/global@5.1.0`.
- **Core Read Tools (`src/webmcp/tools.ts`):**
  1. `get_blast_radius({ module })`: Transitive BFS reach computation across all downstream callers, affected test collection, incident collation, composite risk indexing, and real-time graph impact zone highlighting.
  2. `check_regression_history({ pattern })`: Keyword/module/error pattern matcher surfacing past outages, severity, and root-cause commit attribution.
  3. `get_change_provenance({ module })`: Change audit logging AI agent authorship ratios (Claude Code, Cursor, Codex) vs. human staff engineer commits.
- **Interactive In-Cockpit Tool Runner (`src/components/AgentDrawer.tsx`):**
  - Added 1-Click quick scenario trigger buttons (`blast_radius(auth-service)`, `blast_radius(checkout)`, `regression("session expiry")`, `provenance(auth-service)`).
  - Form for running any custom parameter with instant syntax-highlighted JSON output preview and clipboard copy.
  - Real-time **Agent Activity Stream** with timestamps, tool names, inputs, output snippets, and execution latencies.
- **Verified:** Unit tests passed across 4 module scenarios; production bundle built cleanly with 0 errors.

### ROUND 4 — The Centerpiece: `simulate_change_impact` (Completed)
- **WebMCP Tool Registration (`simulate_change_impact`):**
  - Input Schema: `{ description: string, touched_modules: string[] }`
  - Logic: Computes transitive downstream blast across all touched services, scans historical incidents for keyword/module regression precedents, aggregates affected test suites (failing/flaky), calculates predicted blast risk index (0.0–1.0), and assigns safety ratings (`CRITICAL RISK - HUMAN REVIEW REQUIRED`, `ELEVATED RISK - REVIEW RECOMMENDED`, `LOW RISK - SAFE FOR AUTOMATION`).
- **Live On-Screen Visual Simulation Canvas:**
  - Directly touched modules pulse with electric amber/yellow rings and `⚡ MODIFIED` badges.
  - Downstream ripple services light up with crimson alert borders.
  - Non-impacted services dim to 0.15 opacity.
  - Graph edges connecting the blast zone accelerate to 3x directional particle speed with amber/red styling.
- **Centerpiece UI Components:**
  - `SimulationBanner.tsx`: Floating top glassmorphism banner displaying live simulation status, proposed change description, risk index meter, direct vs downstream service count, and 1-click exit button.
  - `NodeDetailPanel.tsx` (Simulation Breakdown): Dedicated view displaying AI Safety Analysis Findings, directly modified vs ripple services, test suite coverage vulnerabilities, and outage warnings.
  - `AgentDrawer.tsx`: Added 1-Click Centerpiece simulation triggers with custom parameter inputs.
- **Verified in Real Chrome (`test_round4_chrome.mjs` & Visual Screenshots in `verification/round4/`):**
  - Scenario 1 (Hero Node `auth-service` + `redis-session-cluster` token refactor): **79% Risk** (`CRITICAL RISK - HUMAN REVIEW REQUIRED`), 7 nodes impacted, 2 P0/P1 incidents matched, 3 flaky/failing tests ([screenshot](https://raw.githubusercontent.com/ABHIGH15/TREMOR/main/verification/round4/scenario1-critical.png)).
  - Scenario 2 (Order Processor `order-processor` async webhooks): **62% Risk** (`ELEVATED RISK - REVIEW RECOMMENDED`), 4 nodes impacted, amber banner ([screenshot](https://raw.githubusercontent.com/ABHIGH15/TREMOR/main/verification/round4/scenario2-elevated.png)).
  - Scenario 3 (DB Pool `db-client-pool` scaling): **70% Risk** (`CRITICAL RISK - HUMAN REVIEW REQUIRED`), 9 nodes impacted, 3 incidents matched with P0 override ([screenshot](https://raw.githubusercontent.com/ABHIGH15/TREMOR/main/verification/round4/scenario3-db-pool.png)).
  - Scenario 4 (Edge UI `partner-portal` regex): **15% Risk** (`LOW RISK - SAFE FOR AUTOMATION`), 1 node impacted, 0 incidents, 0 failing tests ([screenshot](https://raw.githubusercontent.com/ABHIGH15/TREMOR/main/verification/round4/scenario4-low.png)).
- **Live Deployment:** Live and verified at [https://tremor-cockpit.vercel.app](https://tremor-cockpit.vercel.app).
