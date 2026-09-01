import { SystemDataset, SystemNode } from '../types/dataset';
import { webMCPRegistry, WebMCPToolDefinition } from './runtime';

export interface ToolCallbacks {
  onHighlightImpactZone?: (impactedNodeIds: string[], targetNode: SystemNode) => void;
  onSelectNode?: (node: SystemNode) => void;
}

/**
 * Computes transitive downstream dependents (BFS)
 */
function computeDownstreamTransitive(rootId: string, dataset: SystemDataset): string[] {
  const visited = new Set<string>();
  const queue = [rootId];

  while (queue.length > 0) {
    const current = queue.shift()!;
    // Find all nodes that call/depend on current (edges where target === current)
    dataset.edges.forEach(edge => {
      const src = typeof edge.source === 'object' ? (edge.source as any).id : edge.source;
      const tgt = typeof edge.target === 'object' ? (edge.target as any).id : edge.target;

      if (tgt === current && !visited.has(src)) {
        visited.add(src);
        queue.push(src);
      }
    });
  }

  return Array.from(visited);
}

/**
 * Register Round 3 Core Read Tools
 */
export async function registerCoreReadTools(dataset: SystemDataset, callbacks: ToolCallbacks = {}) {
  const nodeMap = new Map(dataset.nodes.map(n => [n.id, n]));

  // Tool 1: get_blast_radius
  const getBlastRadiusTool: WebMCPToolDefinition = {
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
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                error: `Module '${module}' not found in system dataset. Available modules: ${Array.from(nodeMap.keys()).join(', ')}`,
              }, null, 2),
            },
          ],
        };
      }

      // Compute transitive downstream reach
      const downstreamIds = computeDownstreamTransitive(module, dataset);
      const allImpactedIds = [module, ...downstreamIds];
      const impactedNodes = allImpactedIds.map(id => nodeMap.get(id)!).filter(Boolean);

      // Collect tests for target and all downstream modules
      const affectedTests = dataset.tests.filter(t => allImpactedIds.includes(t.module));
      const failingOrFlakyTests = affectedTests.filter(t => t.status !== 'passing');

      // Collect historical incidents
      const relatedIncidents = dataset.incidents.filter(i => allImpactedIds.includes(i.module));

      // Calculate composite blast risk
      const avgDownstreamRisk =
        impactedNodes.reduce((acc, n) => acc + n.risk_score, 0) / (impactedNodes.length || 1);
      const hasCriticalOutage = relatedIncidents.some(i => i.severity.startsWith('P0') || i.severity.startsWith('P1'));

      const result = {
        target_module: {
          id: targetNode.id,
          label: targetNode.label,
          layer: targetNode.layer,
          risk_score: targetNode.risk_score,
          owner: targetNode.owner,
        },
        blast_radius_summary: {
          total_impacted_services: impactedNodes.length,
          downstream_dependents_count: downstreamIds.length,
          downstream_modules: downstreamIds.map(id => {
            const n = nodeMap.get(id);
            return { id, label: n?.label, layer: n?.layer, risk_score: n?.risk_score };
          }),
          composite_blast_risk: Number(avgDownstreamRisk.toFixed(2)),
          critical_outage_risk: hasCriticalOutage ? 'CRITICAL' : 'MODERATE',
        },
        affected_tests_summary: {
          total_tests: affectedTests.length,
          failing_or_flaky_count: failingOrFlakyTests.length,
          tests: affectedTests.map(t => ({
            module: t.module,
            test_name: t.test_name,
            status: t.status,
            flakiness_score: t.flakiness_score,
          })),
        },
        historical_incidents: relatedIncidents.map(i => ({
          id: i.id,
          module: i.module,
          severity: i.severity,
          date: i.date,
          description: i.description,
          related_commit_id: i.related_commit_id,
        })),
      };

      // Trigger UI Highlights
      if (callbacks.onHighlightImpactZone) {
        callbacks.onHighlightImpactZone(allImpactedIds, targetNode);
      }
      if (callbacks.onSelectNode) {
        callbacks.onSelectNode(targetNode);
      }

      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    },
  };

  // Tool 2: check_regression_history
  const checkRegressionHistoryTool: WebMCPToolDefinition = {
    name: 'check_regression_history',
    description: 'Returns past incidents and historical regressions matching a described pattern, module, or failure mode.',
    inputSchema: {
      type: 'object',
      properties: {
        pattern: {
          type: 'string',
          description: 'Keyword, error symptom, or module name to query (e.g. "auth-service", "rate limiter", "500", "redis", "token")',
        },
      },
      required: ['pattern'],
    },
    execute: async ({ pattern }: { pattern: string }) => {
      const lower = pattern.toLowerCase();
      const matchedIncidents = dataset.incidents.filter(
        i =>
          i.module.toLowerCase().includes(lower) ||
          i.description.toLowerCase().includes(lower) ||
          i.severity.toLowerCase().includes(lower) ||
          (i.related_commit_id && i.related_commit_id.toLowerCase().includes(lower))
      );

      // Enhance with commit details if available
      const enriched = matchedIncidents.map(inc => {
        const commit = inc.related_commit_id
          ? dataset.commits.find(c => c.id === inc.related_commit_id)
          : null;
        return {
          incident_id: inc.id,
          module: inc.module,
          severity: inc.severity,
          date: inc.date,
          description: inc.description,
          root_cause_commit: commit
            ? {
                id: commit.id,
                author_type: commit.author_type,
                agent_or_author: commit.agent_name || commit.author_name,
                message: commit.message,
              }
            : inc.related_commit_id,
        };
      });

      const result = {
        query_pattern: pattern,
        total_matches: enriched.length,
        has_critical_matches: enriched.some(i => i.severity.startsWith('P0') || i.severity.startsWith('P1')),
        incidents: enriched,
      };

      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    },
  };

  // Tool 3: get_change_provenance
  const getChangeProvenanceTool: WebMCPToolDefinition = {
    name: 'get_change_provenance',
    description: 'Returns recent commits touching a module, each tagged AI or human with agent name, author, date, and risk impact.',
    inputSchema: {
      type: 'object',
      properties: {
        module: {
          type: 'string',
          description: 'The ID of the module (e.g. "auth-service", "jwt-security-core", "db-client-pool", or "all")',
        },
      },
      required: ['module'],
    },
    execute: async ({ module }: { module: string }) => {
      let filteredCommits = dataset.commits;
      if (module !== 'all') {
        filteredCommits = dataset.commits.filter(c => c.module.toLowerCase() === module.toLowerCase());
      }

      const aiCommits = filteredCommits.filter(c => c.author_type === 'ai');
      const humanCommits = filteredCommits.filter(c => c.author_type === 'human');

      const result = {
        target_module: module,
        total_commits_inspected: filteredCommits.length,
        ai_authored_count: aiCommits.length,
        human_authored_count: humanCommits.length,
        ai_authorship_ratio: `${Math.round((aiCommits.length / (filteredCommits.length || 1)) * 100)}%`,
        commits: filteredCommits.map(c => ({
          id: c.id,
          module: c.module,
          author_type: c.author_type,
          author: c.author_type === 'ai' ? c.agent_name : c.author_name,
          date: c.date,
          message: c.message,
          risk_impact: c.risk_impact || 'medium',
        })),
      };

      const target = nodeMap.get(module);
      if (target && callbacks.onSelectNode) {
        callbacks.onSelectNode(target);
      }

      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    },
  };

  // Register in WebMCP registry (which updates document.modelContext & navigator.modelContext)
  await webMCPRegistry.registerTool(getBlastRadiusTool);
  await webMCPRegistry.registerTool(checkRegressionHistoryTool);
  await webMCPRegistry.registerTool(getChangeProvenanceTool);
}
