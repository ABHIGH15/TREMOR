# ⚡ TREMOR: The Beginner's Complete Guide
### *Everything you need to know about TREMOR, WebMCP, and Agentic Safety — Explained from Scratch*

---

## 📖 Table of Contents
1. [What is TREMOR in Simple Words?](#1-what-is-tremor-in-simple-words)
2. [The Real-World Problem: Why AI Agents Break Things](#2-the-real-world-problem-why-ai-agents-break-things)
3. [What is an MCP & What is WebMCP? (The Toolbox Analogy)](#3-what-is-an-mcp--what-is-webmcp-the-toolbox-analogy)
4. [How TREMOR Works: A 30,000-Foot View](#4-how-tremor-works-a-30000-foot-view)
5. [The 6 Tools of TREMOR (Explained with Analogies)](#5-the-6-tools-of-tremor-explained-with-analogies)
6. [The "Trust Layer" & Why AI Cannot Self-Approve](#6-the-trust-layer--why-ai-cannot-self-approve)
7. [The Tech Stack Under the Hood (No Jargon)](#7-the-tech-stack-under-the-hood-no-jargon)
8. [Step-by-Step Story: How an AI Agent Uses TREMOR](#8-step-by-step-story-how-an-ai-agent-uses-tremor)
9. [The Dataset & The "Hero Node" (`auth-service`)](#9-the-dataset--the-hero-node-auth-service)
10. [Glossary of Terms](#10-glossary-of-terms)

---

## 1. What is TREMOR in Simple Words?

Imagine you have an autonomous robotic handyman inside a giant 100-story skyscraper. You tell the robot: *"Please replace the water valve on the 4th floor."*

- **Without TREMOR:** The robot turns off the valve immediately without looking at blueprints. Suddenly, the emergency sprinklers in the bank vault on floor 2 lose pressure, the heating system shuts down on floors 10 through 50, and the fire alarms go off across the entire building.
- **With TREMOR:** Before touching the valve, the robot connects to **TREMOR**. It runs a digital simulation: *"If I touch this valve on floor 4, what else is connected to it? Has this valve caused leaks in the past? What alarms will trip?"* 
  TREMOR lights up a visual building blueprint in bright red: *"Warning: 7 critical downstream systems will fail, and a past P0 outage happened here. You are not allowed to turn this valve alone. A human chief engineer must approve this first."*

**TREMOR is an interactive web cockpit and AI toolkit that lets autonomous AI coding agents simulate the "blast radius" of their code changes before touching production systems.**

---

## 2. The Real-World Problem: Why AI Agents Break Things

Today, software engineering teams are using AI coding agents (like **Claude Code**, **Cursor**, **Codex**, and **ChatGPT**) to write, refactor, and deploy code automatically.

AI agents are very smart at writing individual functions, but they suffer from **"Architectural Myopia" (Tunnel Vision)**:
1. **They only see what is directly in front of them:** When an AI agent edits a single file (e.g. `auth-service/session.ts`), it reads that file's 200 lines of code. It does not naturally understand how that file connects to 20 other microservices across the company.
2. **A 2-line fix can cause a massive outage:** Changing a cache timeout from 30 minutes to 15 minutes seems innocent. But if 100,000 users are logged in, that change can trigger a **"Cache Stampede"** on the database, crashing the checkout service and losing millions of dollars.
3. **Automated pipelines are blind:** If unit tests pass for that one file, the agent might deploy it directly to the cloud.

---

## 3. What is an MCP & What is WebMCP? (The Toolbox Analogy)

To understand TREMOR, you need to understand **MCP** and **WebMCP**.

### What is MCP (Model Context Protocol)?
Normally, an AI (like ChatGPT) is just a text box. It cannot look at your databases, run terminal commands, or check your server health unless you give it **tools**.

**MCP** is an open standard invented by Anthropic that acts like a **standardized USB cable between an AI and external tools**. When a tool speaks MCP, any AI can plug in and use it.

### What is WebMCP?
**WebMCP** is the brand-new web standard (and the subject of this global hackathon!).
- **Traditional MCP:** Ran as background server processes on your local computer.
- **WebMCP:** Brings tools directly **inside your web browser** (`document.modelContext`). When an AI opens a webpage (like ChatGPT's in-app browser or Chrome), the webpage itself gives the AI a rich set of interactive tools!

> **Key Takeaway:** With WebMCP, the website is no longer just text for humans to read — **the website becomes a programmable API and cockpit for AI agents.**

---

## 4. How TREMOR Works: A 30,000-Foot View

TREMOR is made up of three interconnected layers:

```
+-------------------------------------------------------------------------+
|                         TREMOR COCKPIT                                 |
+-------------------------------------------------------------------------+
|                                                                         |
|  1. VISUAL GRAPH CANVAS (2D Physics Simulation)                         |
|     - 18 microservices floating in dark space.                          |
|     - Color-coded: Green (Safe), Amber (Elevated Risk), Red (Critical).  |
|     - Animated glowing particles show data streaming between services.  |
|                                                                         |
|  2. WEBMCP RUNTIME ENGINE (The AI Brain Bridge)                          |
|     - Exposes 6 standard tools to any connecting AI agent.               |
|     - When an agent calls a tool, the visual graph instantly animates!   |
|                                                                         |
|  3. THE TRUST LAYER (The Human Safety Gate)                             |
|     - If a change is too risky, the agent is BLOCKED.                   |
|     - Only a real human clicking "Confirm" in the UI can unlock it.     |
|                                                                         |
+-------------------------------------------------------------------------+
```

---

## 5. The 6 Tools of TREMOR (Explained with Analogies)

TREMOR registers **6 specialized tools** on the browser's `document.modelContext`. Here is what each one does:

### 🛠️ 1. `get_system_snapshot` (The Satellite Map)
- **What it does:** Returns the complete architecture blueprint in one call: all 18 services, 28 connections, top dangerous bottlenecks, and test health.
- **Analogy:** Taking an aerial satellite photograph of the entire city before planning a road trip.

### 🛠️ 2. `get_blast_radius` (The Ripple Detector)
- **What it does:** Calculates everything downstream of a specific service using a mathematical algorithm called **Breadth-First Search (BFS)**. It also highlights the affected zone in bright red on the live graph screen.
- **Analogy:** Dropping a stone in a pond and mapping every single wave that will hit the shore.

### 🛠️ 3. `check_regression_history` (The Archive of Past Mistakes)
- **What it does:** Searches through past production outages and incidents to see if a similar change has caused a disaster before. It tells the agent the root-cause commit and who made it.
- **Analogy:** Checking hospital medical records to see if a patient is allergic to penicillin before prescribing it.

### 🛠️ 4. `get_change_provenance` (The Authorship Audit)
- **What it does:** Looks at recent code commits touching a service and calculates what percentage was written by **AI Agents (Claude Code, Cursor, Codex)** vs. **Human Staff Engineers**.
- **Analogy:** Checking the security log to see if an autonomous robot or a human mechanic was the last person who worked on the engine.

### 🛠️ 5. `simulate_change_impact` (The Flight Simulator — *Centerpiece Tool*)
- **What it does:** The AI passes a proposed change description and list of files. TREMOR calculates a **Predicted Blast Risk Index (0% to 100%)**, checks test vulnerabilities, scans outage precedents, and lights up the on-screen canvas with pulsing amber rings on modified services and crimson alert borders on ripple services.
- **Analogy:** Testing an airplane design in a virtual wind tunnel before manufacturing the real wings.

### 🛠️ 6. `flag_for_review` (The Red Safety Phone — *Trust Layer*)
- **What it does:** When risk is too high, the agent creates a **Pending Human Review Flag**. This appears in the cockpit navbar with a flashing badge.
- **Analogy:** Pulling the emergency brake on a train.

---

## 6. The "Trust Layer" & Why AI Cannot Self-Approve

In many automated systems, AI agents have the power to approve their own actions. This creates a dangerous loop where a rogue or mistaken AI can bypass safeguards.

**In TREMOR, the Trust Layer has a strict, unbreakable rule:**
- The AI agent has a tool to **flag** a problem (`flag_for_review`).
- The AI agent **has ZERO tools to approve or dismiss a flag**.
- Approval is wired **strictly as a physical mouse click (`onClick`)** on the human engineer's screen.

Until a human engineer (like *Devin Patel, Lead SRE*) reads the agent's justification and clicks the green **"Confirm / Approve"** button, the operation remains locked in `PENDING_HUMAN_REVIEW`.

---

## 7. The Tech Stack Under the Hood (No Jargon)

We built TREMOR using modern, high-performance web technologies:

| Technology | What it is | Why we chose it for TREMOR |
|---|---|---|
| **React 18 & TypeScript** | UI framework & type-safe language | Ensures zero runtime type errors and rapid reactive UI updates. |
| **Vite** | Modern web build tool | Compiles the entire application in 1.3 seconds with instant hot-reloading. |
| **Tailwind CSS** | Styling framework | Powers the high-contrast obsidian dark theme, glowing alert badges, and glassmorphism banners. |
| **`react-force-graph-2d`** | Canvas physics visualization | Renders 18 nodes and 28 edges with 60 frames-per-second real-time physics and animated particle streams. |
| **`@mcp-b/global`** | Official WebMCP polyfill | Authored by Alex Nahas (WebMCP Challenge Judge); bridges W3C `document.modelContext` across Chrome and ChatGPT. |
| **Vercel** | Edge cloud hosting | Deploys the production build worldwide with instant SSL and global CDN (`https://tremor-cockpit.vercel.app`). |

---

## 8. Step-by-Step Story: How an AI Agent Uses TREMOR

Here is a real scenario demonstrating how an AI agent interacts with TREMOR in production:

```
[Agent: Claude / ChatGPT]
      │
      ├─► 1. AI connects to TREMOR Cockpit via WebMCP
      │      Calls `get_system_snapshot()`
      │      "Ah, this system has 18 microservices. The mean risk is 0.48."
      │
      ├─► 2. User asks AI: "Refactor JWT claims validation and sliding session cache timeout"
      │
      ├─► 3. AI tests proposed change BEFORE writing code:
      │      Calls `simulate_change_impact(auth-service, redis-session-cluster)`
      │      TREMOR computes:
      │        - Touched nodes: 2
      │        - Downstream affected callers: 7
      │        - Historical P1 incident matched: i1 (Cache Stampede Outage)
      │        - Failing/flaky tests detected: 3
      │        - Predicted Blast Risk: 79% (CRITICAL RISK - HUMAN REVIEW REQUIRED)
      │      On-screen graph lights up in pulsing amber & crimson!
      │
      ├─► 4. AI sees Critical Risk rating:
      │      Calls `flag_for_review(auth-service, "Sliding token change risks P1 cache stampede")`
      │      TREMOR queues a Pending Review Card in the cockpit.
      │
      ├─► 5. Human SRE (Devin Patel) receives alert in Cockpit:
      │      Inspects the blast radius and clicks "Confirm / Approve".
      │
      └─► 6. Action recorded in real-time Activity Stream audit log. AI proceeds safely!
```

---

## 9. The Dataset & The "Hero Node" (`auth-service`)

To make the demonstration realistic, TREMOR comes preloaded with a production-grade enterprise dataset:
- **18 Microservices:** Divided across 4 architectural layers:
  - `frontend`: `checkout-web-ui`, `partner-portal`, `mobile-gateway`
  - `backend`: `auth-service`, `order-processor`, `inventory-service`, `billing-engine`
  - `shared-lib`: `jwt-security-core`, `payment-sdk`, `logger-lib`
  - `infra`: `redis-session-cluster`, `db-client-pool`, `kafka-event-bus`
- **20 Recent Commits:** 60% authored by AI agents (`Claude Code`, `Cursor`, `Codex`) and 40% by human engineers.
- **5 Past Outage Incidents:** Including a P0 checkout outage and a P1 Redis cache stampede.
- **16 Automated Test Suites:** Including passing, flaky, and failing tests.

### 🌟 The "Hero Node": `auth-service`
The centerpiece service in the graph is `auth-service`:
- Highest Risk Score: **0.88 (88%)**
- Authorship: 80% AI commits
- Downstream Callers: Directly impacts `checkout-service`, `order-processor`, `billing-engine`, `partner-portal`, and `mobile-gateway`.
- Incidents: Tied to 2 historical outages (P1 cache stampede and P0 timeout spike).

---

## 10. Glossary of Terms

- **Blast Radius:** The total number of downstream services, APIs, databases, and users that will be affected if a single piece of code breaks.
- **Microservices:** A software architecture where an application is split into dozens of small, independent services (like Auth, Billing, Inventory) that communicate over a network.
- **Breadth-First Search (BFS):** A graph traversal algorithm used by TREMOR to find every dependent service connected directly or indirectly downstream.
- **WebMCP:** The Web Model Context Protocol — a standard that allows websites in a browser to provide interactive tools directly to AI agents.
- **Polyfill (`@mcp-b/global`):** A piece of code that adds modern WebMCP features to browsers that do not yet have native support built-in.
- **Cache Stampede:** A critical failure where thousands of user requests hit a database at the exact same millisecond because a cache expired, crashing the database.
- **Trust Layer / Human-in-the-Loop:** A security architecture where high-risk automated actions are paused until a real human reviews and signs off.

---

### 🌐 Live Links
- **Live Cockpit:** [https://tremor-cockpit.vercel.app](https://tremor-cockpit.vercel.app)
- **Public GitHub Repository:** [https://github.com/ABHIGH15/TREMOR](https://github.com/ABHIGH15/TREMOR)
- **Hackathon:** WebMCP Challenge (Deadline: 4 September 2026)
