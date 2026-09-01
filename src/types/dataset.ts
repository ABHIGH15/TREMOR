export type LayerType = 'frontend' | 'backend' | 'shared-lib' | 'infra';

export interface SystemNode {
  id: string;
  label: string;
  layer: LayerType;
  risk_score: number; // 0.0 to 1.0
  description?: string;
  owner?: string;
}

export interface SystemEdge {
  source: string;
  target: string;
  type: string;
  critical?: boolean;
}

export interface Commit {
  id: string;
  module: string;
  author_type: 'ai' | 'human';
  agent_name?: string;
  author_name?: string;
  date: string;
  message: string;
  risk_impact?: 'low' | 'medium' | 'high';
}

export interface Incident {
  id: string;
  module: string;
  description: string;
  date: string;
  related_commit_id?: string;
  severity: 'P0 - Outage' | 'P1 - Critical' | 'P2 - Degraded' | 'P3 - Minor';
}

export interface SystemTest {
  module: string;
  test_name: string;
  status: 'passing' | 'flaky' | 'failing';
  flakiness_score: number; // 0.0 to 1.0
  coverage?: string;
}

export interface SystemDataset {
  nodes: SystemNode[];
  edges: SystemEdge[];
  commits: Commit[];
  incidents: Incident[];
  tests: SystemTest[];
}

export interface SimulationResult {
  description: string;
  touched_modules: string[];
  downstream_impacted_modules: string[];
  all_affected_node_ids: string[];
  risk_index: number;
  safety_rating: 'CRITICAL RISK - HUMAN REVIEW REQUIRED' | 'ELEVATED RISK - REVIEW RECOMMENDED' | 'LOW RISK - SAFE FOR AUTOMATION';
  affected_test_count: number;
  failing_test_count: number;
  historical_incident_count: number;
  key_findings: string[];
}

export interface PendingReviewFlag {
  id: string;
  module: string;
  module_label?: string;
  risk_notes: string;
  proposed_action?: string;
  risk_score: number;
  timestamp: string;
  status: 'PENDING' | 'CONFIRMED' | 'DISMISSED';
  resolved_at?: string;
  resolved_by?: string;
}
