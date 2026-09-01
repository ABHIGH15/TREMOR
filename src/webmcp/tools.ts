import { SystemDataset, SystemNode, SimulationResult, PendingReviewFlag, LayerType } from '../types/dataset';
import { webMCPRegistry, WebMCPToolDefinition } from './runtime';

export interface ToolCallbacks {
  onHighlightImpactZone?: (impactedNodeIds: string[], targetNode?: SystemNode) => void;
  onSelectNode?: (node: SystemNode) => void;
  onSimulateChangeImpact?: (simulation: SimulationResult) => void;
  onFlagCreated?: (flag: PendingReviewFlag) => void;
}

/**
 * Computes transitive downstream dependents (BFS)
 */
function computeDownstreamTransitive(rootId: string, dataset: SystemDataset): string[] {
  const visited = new Set<string>();
  const queue = [rootId];

  while (queue.length > 0) {
    const current = queue.shift()!;
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
 * Register Full Suite of 6 WebMCP Tools (Rounds 3, 4, 5, 6)
 */
export async function registerCoreTools(dataset: SystemDataset, callbacks: ToolCallbacks = {}) {
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

      const downstreamIds = computeDownstreamTransitive(module, dataset);
      const allImpactedIds = [module, ...downstreamIds];
      const impactedNodes = allImpactedIds.map(id => nodeMap.get(id)!).filter(Boolean);

      const affectedTests = dataset.tests.filter(t => allImpactedIds.includes(t.module));
      const failingOrFlakyTests = affectedTests.filter(t => t.status !== 'passing');
      const relatedIncidents = dataset.incidents.filter(i => allImpactedIds.includes(i.module));

      const directCallers = dataset.edges
        .filter(e => {
          const tgt = typeof e.target === 'object' ? (e.target as any).id : e.target;
          return tgt === module;
        })
        .map(e => {
          const src = typeof e.source === 'object' ? (e.source as any).id : e.source;
          return nodeMap.get(src);
        })
        .filter(Boolean) as SystemNode[];

      const directRiskSum = directCallers.reduce((acc, n) => acc + n.risk_score, 0);
      const avgDirectRisk = directCallers.length > 0 ? directRiskSum / directCallers.length : targetNode.risk_score;
      const compositeBlastRisk = Number(((targetNode.risk_score * 0.6) + (avgDirectRisk * 0.4)).toFixed(2));
      const hasCriticalOutage = relatedIncidents.some(i => i.severity.startsWith('P0') || i.severity.startsWith('P1'));

      let outageRiskLabel: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW' = 'LOW';
      if (compositeBlastRisk >= 0.70 || hasCriticalOutage) {
        outageRiskLabel = 'CRITICAL';
      } else if (compositeBlastRisk >= 0.50) {
        outageRiskLabel = 'HIGH';
      } else if (compositeBlastRisk >= 0.30) {
        outageRiskLabel = 'MODERATE';
      }

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
          composite_blast_risk: compositeBlastRisk,
          critical_outage_risk: outageRiskLabel,
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

  // Tool 4: simulate_change_impact (Centerpiece Tool)
  const simulateChangeImpactTool: WebMCPToolDefinition = {
    name: 'simulate_change_impact',
    description: 'Simulates the systemic blast impact of a proposed code refactor, schema change, or architectural alteration across touched modules. Computes downstream risk ripple effects, affected test suites, regression precedents, and visually illuminates the live graph simulation.',
    inputSchema: {
      type: 'object',
      properties: {
        description: {
          type: 'string',
          description: 'Natural language summary of the proposed change (e.g. "Refactor sliding session token TTL to 15m and add Redis multi-region replication")',
        },
        touched_modules: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of module IDs directly modified by this proposed change (e.g. ["auth-service", "redis-session-cluster"])',
        },
      },
      required: ['description', 'touched_modules'],
    },
    execute: async ({ description, touched_modules }: { description: string; touched_modules: string[] }) => {
      if (!Array.isArray(touched_modules) || touched_modules.length === 0) {
        return {
          isError: true,
          content: [{ type: 'text', text: JSON.stringify({ error: 'touched_modules array must contain at least one valid module ID' }) }],
        };
      }

      const downstreamSet = new Set<string>();
      touched_modules.forEach(modId => {
        const ds = computeDownstreamTransitive(modId, dataset);
        ds.forEach(d => {
          if (!touched_modules.includes(d)) {
            downstreamSet.add(d);
          }
        });
      });

      const downstreamList = Array.from(downstreamSet);
      const allAffectedIds = Array.from(new Set([...touched_modules, ...downstreamList]));
      const allAffectedNodes = allAffectedIds.map(id => nodeMap.get(id)!).filter(Boolean);

      const descLower = description.toLowerCase();
      const relevantIncidents = dataset.incidents.filter(inc => {
        const modMatch = allAffectedIds.includes(inc.module);
        const descMatch = descLower.split(' ').some(word => word.length > 3 && inc.description.toLowerCase().includes(word));
        return modMatch || descMatch;
      });

      const affectedTests = dataset.tests.filter(t => allAffectedIds.includes(t.module));
      const failingTests = affectedTests.filter(t => t.status === 'failing');
      const flakyTests = affectedTests.filter(t => t.status === 'flaky');

      const touchedNodes = touched_modules.map(id => nodeMap.get(id)!).filter(Boolean);
      const touchedAvgRisk = touchedNodes.reduce((acc, n) => acc + n.risk_score, 0) / (touchedNodes.length || 1);
      const downstreamNodes = downstreamList.map(id => nodeMap.get(id)!).filter(Boolean);
      const downstreamAvgRisk = downstreamNodes.length > 0
        ? downstreamNodes.reduce((acc, n) => acc + n.risk_score, 0) / downstreamNodes.length
        : 0;

      const hasCriticalIncident = relevantIncidents.some(i => i.severity.startsWith('P0') || i.severity.startsWith('P1'));
      const incidentPenalty = hasCriticalIncident ? 0.15 : relevantIncidents.length > 0 ? 0.05 : 0;
      const testPenalty = failingTests.length > 0 ? 0.1 : flakyTests.length > 0 ? 0.05 : 0;
      const calculatedRisk = Math.min(1.0, Number(((touchedAvgRisk * 0.5) + (downstreamAvgRisk * 0.3) + incidentPenalty + testPenalty).toFixed(2)));

      let safetyRating: 'CRITICAL RISK - HUMAN REVIEW REQUIRED' | 'ELEVATED RISK - REVIEW RECOMMENDED' | 'LOW RISK - SAFE FOR AUTOMATION' = 'LOW RISK - SAFE FOR AUTOMATION';
      if (calculatedRisk >= 0.75 || (hasCriticalIncident && calculatedRisk >= 0.70)) {
        safetyRating = 'CRITICAL RISK - HUMAN REVIEW REQUIRED';
      } else if (calculatedRisk >= 0.40) {
        safetyRating = 'ELEVATED RISK - REVIEW RECOMMENDED';
      } else {
        safetyRating = 'LOW RISK - SAFE FOR AUTOMATION';
      }

      const keyFindings: string[] = [
        `Directly alters ${touched_modules.length} module(s): ${touched_modules.join(', ')}`,
        `Propagates downstream to ${downstreamList.length} dependent service(s): ${downstreamList.slice(0, 4).join(', ')}${downstreamList.length > 4 ? ` (+${downstreamList.length - 4} more)` : ''}`,
      ];

      if (relevantIncidents.length > 0) {
        keyFindings.push(`⚠️ Historical regression hazard: ${relevantIncidents.length} related past incident(s) detected (e.g. ${relevantIncidents[0].id} - ${relevantIncidents[0].description.substring(0, 60)}...)`);
      }
      if (failingTests.length > 0 || flakyTests.length > 0) {
        keyFindings.push(`🧪 Test suite vulnerability: ${failingTests.length} failing and ${flakyTests.length} flaky test suites in blast path`);
      }

      const simulationData: SimulationResult = {
        description,
        touched_modules,
        downstream_impacted_modules: downstreamList,
        all_affected_node_ids: allAffectedIds,
        risk_index: calculatedRisk,
        safety_rating: safetyRating,
        affected_test_count: affectedTests.length,
        failing_test_count: failingTests.length,
        historical_incident_count: relevantIncidents.length,
        key_findings: keyFindings,
      };

      if (callbacks.onSimulateChangeImpact) {
        callbacks.onSimulateChangeImpact(simulationData);
      } else if (callbacks.onHighlightImpactZone) {
        callbacks.onHighlightImpactZone(allAffectedIds, touchedNodes[0]);
      }

      const result = {
        simulation_status: 'SUCCESS',
        proposed_change: description,
        risk_assessment: {
          predicted_blast_risk_index: calculatedRisk,
          safety_rating: safetyRating,
          requires_human_approval_gate: safetyRating.includes('REQUIRED'),
        },
        impact_scope: {
          directly_touched_modules: touched_modules.map(id => {
            const n = nodeMap.get(id);
            return { id, label: n?.label, layer: n?.layer, risk_score: n?.risk_score };
          }),
          downstream_affected_services: downstreamList.map(id => {
            const n = nodeMap.get(id);
            return { id, label: n?.label, layer: n?.layer, risk_score: n?.risk_score };
          }),
          total_blast_radius_nodes: allAffectedNodes.length,
        },
        regression_risk: {
          matching_incidents_count: relevantIncidents.length,
          incidents: relevantIncidents.map(i => ({ id: i.id, severity: i.severity, module: i.module, description: i.description })),
        },
        test_coverage_status: {
          total_impacted_tests: affectedTests.length,
          failing_tests: failingTests.map(t => ({ module: t.module, test: t.test_name })),
          flaky_tests: flakyTests.map(t => ({ module: t.module, test: t.test_name, flakiness: t.flakiness_score })),
        },
        key_findings: keyFindings,
      };

      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    },
  };

  // Tool 5: flag_for_review (Trust Layer Tool)
  const flagForReviewTool: WebMCPToolDefinition = {
    name: 'flag_for_review',
    description: 'Flags a high-risk module or proposed change for mandatory human engineer review and sign-off before code modifications can be merged or deployed. This tool ONLY creates a pending review flag in the Tremor Cockpit; it CANNOT approve, dismiss, or resolve flags (resolution requires a physical human click).',
    inputSchema: {
      type: 'object',
      properties: {
        module: {
          type: 'string',
          description: 'The ID of the module being flagged for human engineer review (e.g. "auth-service", "db-client-pool")',
        },
        risk_notes: {
          type: 'string',
          description: 'Specific safety justification, downstream hazards, or test failure warnings for the human reviewer',
        },
        proposed_action: {
          type: 'string',
          description: 'Optional brief description of what the agent intends to do if approved by human engineer',
        },
      },
      required: ['module', 'risk_notes'],
    },
    execute: async ({ module, risk_notes, proposed_action }: { module: string; risk_notes: string; proposed_action?: string }) => {
      const targetNode = nodeMap.get(module);
      const flagId = `flag_${Math.random().toString(36).substring(2, 8)}`;
      const now = new Date();
      const timestamp = now.toTimeString().split(' ')[0];

      const flag: PendingReviewFlag = {
        id: flagId,
        module,
        module_label: targetNode?.label || module,
        risk_notes,
        proposed_action: proposed_action || 'Proposed modification pending human sign-off',
        risk_score: targetNode?.risk_score || 0.65,
        timestamp,
        status: 'PENDING',
      };

      webMCPRegistry.addPendingFlag(flag);

      if (callbacks.onFlagCreated) {
        callbacks.onFlagCreated(flag);
      }
      if (targetNode && callbacks.onSelectNode) {
        callbacks.onSelectNode(targetNode);
      }

      const responsePayload = {
        status: 'PENDING_HUMAN_REVIEW',
        flag_id: flagId,
        flagged_module: module,
        module_name: targetNode?.label || module,
        risk_score: targetNode?.risk_score || 0.65,
        risk_notes: risk_notes,
        proposed_action: flag.proposed_action,
        human_approval_status: 'AWAITING_PHYSICAL_CLICK',
        can_tool_self_approve: false,
        message: `Security review flag '${flagId}' created in Tremor Cockpit. A human engineer must explicitly click 'Confirm / Approve Change' or 'Dismiss / Reject Change' in the UI before any irreversible action can proceed.`,
      };

      return {
        content: [{ type: 'text', text: JSON.stringify(responsePayload, null, 2) }],
      };
    },
  };

  // Tool 6: get_system_snapshot (System Orientation Tool)
  const getSystemSnapshotTool: WebMCPToolDefinition = {
    name: 'get_system_snapshot',
    description: 'Returns the full system architecture topology snapshot in a single call: all system nodes, cross-service dependency edges, high-risk bottlenecks, active test health summary, and historical incident index. Allows agents to get complete system orientation without making multiple separate calls.',
    inputSchema: {
      type: 'object',
      properties: {
        layer_filter: {
          type: 'string',
          description: 'Optional layer filter: "all", "frontend", "backend", "shared-lib", "infra"',
          enum: ['all', 'frontend', 'backend', 'shared-lib', 'infra'],
        },
        include_incidents: {
          type: 'boolean',
          description: 'Whether to include full historical incident index (default: true)',
        },
        include_tests: {
          type: 'boolean',
          description: 'Whether to include test suite health summary (default: true)',
        },
      },
    },
    execute: async (input: { layer_filter?: LayerType | 'all'; include_incidents?: boolean; include_tests?: boolean } = {}) => {
      const layer = input?.layer_filter || 'all';
      const inc = input?.include_incidents !== false;
      const tst = input?.include_tests !== false;

      let filteredNodes = dataset.nodes;
      if (layer !== 'all') {
        filteredNodes = dataset.nodes.filter(n => n.layer === layer);
      }
      const nodeIds = new Set(filteredNodes.map(n => n.id));
      const filteredEdges = dataset.edges.filter(
        e => {
          const src = typeof e.source === 'object' ? (e.source as any).id : e.source;
          const tgt = typeof e.target === 'object' ? (e.target as any).id : e.target;
          return nodeIds.has(src) && nodeIds.has(tgt);
        }
      );

      const highRiskNodes = filteredNodes
        .filter(n => n.risk_score >= 0.70)
        .sort((a, b) => b.risk_score - a.risk_score);

      const failingTests = dataset.tests.filter(t => t.status === 'failing');
      const flakyTests = dataset.tests.filter(t => t.status === 'flaky');

      const result = {
        system_name: 'TREMOR Production Ecosystem',
        topology_summary: {
          total_nodes: filteredNodes.length,
          total_edges: filteredEdges.length,
          active_layer_filter: layer,
          high_risk_node_count: highRiskNodes.length,
          system_wide_mean_risk: Number((filteredNodes.reduce((acc, n) => acc + n.risk_score, 0) / (filteredNodes.length || 1)).toFixed(2)),
        },
        top_critical_risk_nodes: highRiskNodes.map(n => ({
          id: n.id,
          label: n.label,
          layer: n.layer,
          risk_score: n.risk_score,
          owner: n.owner,
        })),
        nodes: filteredNodes.map(n => ({
          id: n.id,
          label: n.label,
          layer: n.layer,
          risk_score: n.risk_score,
          owner: n.owner,
        })),
        edges: filteredEdges.map(e => ({
          source: typeof e.source === 'object' ? (e.source as any).id : e.source,
          target: typeof e.target === 'object' ? (e.target as any).id : e.target,
          type: e.type,
        })),
        ...(inc && {
          incidents_summary: {
            total_incidents: dataset.incidents.length,
            critical_outages_count: dataset.incidents.filter(i => i.severity.startsWith('P0') || i.severity.startsWith('P1')).length,
            incidents: dataset.incidents,
          },
        }),
        ...(tst && {
          tests_health_summary: {
            total_tests: dataset.tests.length,
            failing_count: failingTests.length,
            flaky_count: flakyTests.length,
            passing_count: dataset.tests.length - failingTests.length - flakyTests.length,
            vulnerable_test_suites: [...failingTests, ...flakyTests],
          },
        }),
      };

      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    },
  };

  // Register in WebMCP registry (All 6 tools)
  await webMCPRegistry.registerTool(getBlastRadiusTool);
  await webMCPRegistry.registerTool(checkRegressionHistoryTool);
  await webMCPRegistry.registerTool(getChangeProvenanceTool);
  await webMCPRegistry.registerTool(simulateChangeImpactTool);
  await webMCPRegistry.registerTool(flagForReviewTool);
  await webMCPRegistry.registerTool(getSystemSnapshotTool);
}
