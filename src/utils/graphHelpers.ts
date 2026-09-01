import { SystemDataset, SystemNode, LayerType } from '../types/dataset';

export function getRiskColor(riskScore: number): string {
  if (riskScore >= 0.7) return '#ef4444'; // Red (High risk)
  if (riskScore >= 0.4) return '#f59e0b'; // Amber (Medium risk)
  return '#10b981'; // Emerald (Low risk)
}

export function getRiskLabel(riskScore: number): { label: string; bg: string; text: string; border: string } {
  if (riskScore >= 0.7) {
    return { label: 'HIGH RISK', bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/30' };
  }
  if (riskScore >= 0.4) {
    return { label: 'MED RISK', bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' };
  }
  return { label: 'LOW RISK', bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' };
}

export function getLayerColor(layer: LayerType): { bg: string; text: string; border: string; badge: string } {
  switch (layer) {
    case 'frontend':
      return { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30', badge: 'FE' };
    case 'backend':
      return { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30', badge: 'BE' };
    case 'shared-lib':
      return { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/30', badge: 'LIB' };
    case 'infra':
      return { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30', badge: 'INFRA' };
  }
}

export interface NodeDependencies {
  upstream: SystemNode[];   // nodes that this node depends on (target of outgoing edges)
  downstream: SystemNode[]; // nodes that depend on this node (source of incoming edges)
}

export function getNodeDependencies(nodeId: string, dataset: SystemDataset): NodeDependencies {
  const nodeMap = new Map(dataset.nodes.map(n => [n.id, n]));

  // Downstream: nodes that call/depend on this nodeId (i.e. edge.target === nodeId, so edge.source depends on it)
  // or edge.source === nodeId depending on edge convention.
  // In our dataset:
  // "web-app" -> "api-gateway" (source: web-app, target: api-gateway)
  // "api-gateway" -> "auth-service" (source: api-gateway, target: auth-service)
  // "checkout-service" -> "auth-service" (source: checkout-service, target: auth-service)
  // Therefore, if auth-service breaks:
  // Downstream callers: api-gateway, checkout-service (edges where target === "auth-service")
  // Upstream dependencies: jwt-security-core, redis-session-cluster, postgres-primary (edges where source === "auth-service")
  
  const downstreamIds = new Set<string>();
  const upstreamIds = new Set<string>();

  dataset.edges.forEach(edge => {
    const src = typeof edge.source === 'object' ? (edge.source as any).id : edge.source;
    const tgt = typeof edge.target === 'object' ? (edge.target as any).id : edge.target;

    if (tgt === nodeId) {
      downstreamIds.add(src);
    }
    if (src === nodeId) {
      upstreamIds.add(tgt);
    }
  });

  return {
    downstream: Array.from(downstreamIds).map(id => nodeMap.get(id)!).filter(Boolean),
    upstream: Array.from(upstreamIds).map(id => nodeMap.get(id)!).filter(Boolean),
  };
}
