# TREMOR

> **Tagline:** *See what your AI agent is about to break — before it does.*  
> Built for the **WebMCP Challenge 2026** (OpenAI, Google Chrome, Vercel, Cloudflare, Netlify, Shopify, Render).

🌐 **Live URL:** [https://tremor-cockpit.vercel.app](https://tremor-cockpit.vercel.app)  
📦 **GitHub:** [https://github.com/ABHIGH15/TREMOR](https://github.com/ABHIGH15/TREMOR)  
📜 **License:** [MIT](./LICENSE)

---

## Overview

**Tremor** is a live, browser-based "system context cockpit" that lets an AI coding agent and a human engineer see the *same* real-time picture of a codebase's dependency graph, change history, and past regressions — via **WebMCP tools** — before a risky AI-generated change ships.

When an AI coding agent plans or executes a refactor, it calls WebMCP tools registered directly on the page via `document.modelContext.registerTool(...)`. The interactive dependency graph highlights impacted nodes, flags high-risk cascades, and surfaces historical regression incidents in real time.

---

## WebMCP Tool Registration

Tremor registers structured browser tools directly to the agent's context:

```typescript
// WebMCP Tool Registration in TREMOR
await document.modelContext.registerTool({
  name: "get_blast_radius",
  description: "Returns everything downstream of a module: dependent modules, affected tests, and past incidents tied to it.",
  inputSchema: {
    type: "object",
    properties: {
      module: { type: "string", description: "The ID of the module or service to inspect" }
    },
    required: ["module"]
  },
  async execute({ module }) {
    // Look up in dependency graph, highlight impact zone in UI
    const result = computeBlastRadius(module);
    highlightGraphNodes(result.impactedNodes);
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
    };
  }
});
```

---

## Tech Stack

- **Framework:** React 18 + TypeScript + Vite
- **Styling:** Tailwind CSS
- **Visualization:** `react-force-graph-2d`
- **WebMCP:** Native `document.modelContext` / `navigator.modelContext` with shim fallback
- **License:** MIT (Fully Open Source)

---

## Getting Started

```bash
# Install dependencies
npm install

# Start local dev server
npm run dev

# Build for production
npm run build
```

---

## License

[MIT License](./LICENSE)
