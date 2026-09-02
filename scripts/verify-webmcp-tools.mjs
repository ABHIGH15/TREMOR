import { JSDOM } from 'jsdom';
import { readFileSync } from 'fs';

// Setup browser DOM environment
const dom = new JSDOM('<!DOCTYPE html><html><body><div id="root"></div></body></html>', {
  url: 'https://tremor-cockpit.vercel.app',
  referrer: 'https://tremor-cockpit.vercel.app',
  contentType: 'text/html',
  includeNodeLocations: true,
});

for (const key of Object.getOwnPropertyNames(dom.window)) {
  if (!(key in globalThis) && typeof dom.window[key] !== 'undefined') {
    try {
      Object.defineProperty(globalThis, key, { value: dom.window[key], writable: true, configurable: true });
    } catch (_) {}
  }
}
Object.defineProperty(globalThis, 'window', { value: dom.window, writable: true, configurable: true });
Object.defineProperty(globalThis, 'document', { value: dom.window.document, writable: true, configurable: true });
Object.defineProperty(globalThis, 'navigator', { value: dom.window.navigator, writable: true, configurable: true });
Object.defineProperty(globalThis, 'location', { value: dom.window.location, writable: true, configurable: true });
Object.defineProperty(globalThis, 'performance', { value: dom.window.performance, writable: true, configurable: true });
Object.defineProperty(globalThis, 'self', { value: dom.window, writable: true, configurable: true });
Object.defineProperty(globalThis, 'isSecureContext', { value: true, writable: true, configurable: true });

// Initialize official @mcp-b/global
const { initializeWebModelContext } = await import('@mcp-b/global');
initializeWebModelContext({ installTestingShim: true });

console.log('\n--- 1. Testing WebMCP Object Attachment ---');
console.log('document.modelContext:', typeof document.modelContext);
console.log('navigator.modelContext:', typeof navigator.modelContext);
console.log('navigator.modelContextTesting:', typeof navigator.modelContextTesting);

// Load dataset
const dataset = JSON.parse(readFileSync('./src/data/dataset.json', 'utf8'));

function computeDownstreamTransitive(rootId, dataset) {
  const visited = new Set();
  const queue = [rootId];

  while (queue.length > 0) {
    const current = queue.shift();
    dataset.edges.forEach(edge => {
      const src = typeof edge.source === 'object' ? edge.source.id : edge.source;
      const tgt = typeof edge.target === 'object' ? edge.target.id : edge.target;

      if (tgt === current && !visited.has(src)) {
        visited.add(src);
        queue.push(src);
      }
    });
  }

  return Array.from(visited);
}

// Register Tool 1: get_blast_radius
await document.modelContext.registerTool({
  name: 'get_blast_radius',
  description: 'Returns everything downstream of a module: dependent modules, affected tests, and past incidents tied to it.',
  inputSchema: {
    type: 'object',
    properties: {
      module: { type: 'string', description: 'The ID of the module or service to inspect' },
    },
    required: ['module'],
  },
  execute: async ({ module }) => {
    const nodeMap = new Map(dataset.nodes.map(n => [n.id, n]));
    const targetNode = nodeMap.get(module);
    if (!targetNode) {
      return { content: [{ type: 'text', text: JSON.stringify({ error: 'Not found' }) }] };
    }
    const downstreamIds = computeDownstreamTransitive(module, dataset);
    const allImpactedIds = [module, ...downstreamIds];
    const impactedNodes = allImpactedIds.map(id => nodeMap.get(id)).filter(Boolean);
    const affectedTests = dataset.tests.filter(t => allImpactedIds.includes(t.module));
    const relatedIncidents = dataset.incidents.filter(i => allImpactedIds.includes(i.module));

    const result = {
      target_module: targetNode,
      blast_radius_summary: {
        total_impacted_services: impactedNodes.length,
        downstream_dependents: downstreamIds,
      },
      affected_tests: affectedTests,
      historical_incidents: relatedIncidents,
    };
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  },
});

// Register Tool 2: check_regression_history
await document.modelContext.registerTool({
  name: 'check_regression_history',
  description: 'Returns past incidents and historical regressions matching a described pattern, module, or failure mode.',
  inputSchema: {
    type: 'object',
    properties: {
      pattern: { type: 'string', description: 'Keyword or module name to query' },
    },
    required: ['pattern'],
  },
  execute: async ({ pattern }) => {
    const lower = pattern.toLowerCase();
    const matched = dataset.incidents.filter(
      i => i.module.toLowerCase().includes(lower) || i.description.toLowerCase().includes(lower)
    );
    return { content: [{ type: 'text', text: JSON.stringify({ matches: matched }, null, 2) }] };
  },
});

// Register Tool 3: get_change_provenance
await document.modelContext.registerTool({
  name: 'get_change_provenance',
  description: 'Returns recent commits touching a module, each tagged AI or human with agent name, author, date, and risk impact.',
  inputSchema: {
    type: 'object',
    properties: {
      module: { type: 'string', description: 'Module ID' },
    },
    required: ['module'],
  },
  execute: async ({ module }) => {
    const commits = dataset.commits.filter(c => c.module.toLowerCase() === module.toLowerCase());
    return { content: [{ type: 'text', text: JSON.stringify({ commits }, null, 2) }] };
  },
});

console.log('\n--- 2. Querying navigator.modelContextTesting.listTools() ---');
const tools = navigator.modelContextTesting ? navigator.modelContextTesting.listTools() : [];
console.log('Discovered Tools Count:', tools.length);
console.log('Tools:');
tools.forEach(t => console.log(`  - [${t.name}]: ${t.description}`));

console.log('\n--- 3. Executing Tool via WebMCP Testing Protocol ---');
if (navigator.modelContextTesting?.executeTool) {
  const resultStr = await navigator.modelContextTesting.executeTool(
    'get_blast_radius',
    JSON.stringify({ module: 'auth-service' })
  );
  console.log('Result from navigator.modelContextTesting.executeTool("get_blast_radius", {"module":"auth-service"}):');
  console.log(resultStr);
}

console.log('\n✅ E2E WebMCP Protocol verification complete!');
