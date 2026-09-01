import React from 'react';
import {
  AlertTriangle,
  GitCommit,
  CheckCircle2,
  Clock,
  User,
  Bot,
  ArrowRight,
  ArrowLeft,
  X,
  Layers,
  Flame,
  Info,
  Sparkles,
  ShieldAlert,
  Activity,
} from 'lucide-react';
import { SystemDataset, SystemNode, SimulationResult } from '../types/dataset';
import { getRiskColor, getRiskLabel, getLayerColor, getNodeDependencies } from '../utils/graphHelpers';

interface NodeDetailPanelProps {
  node: SystemNode | null;
  dataset: SystemDataset;
  onSelectNode: (node: SystemNode | null) => void;
  onSelectHeroNode: () => void;
  simulation?: SimulationResult | null;
  onClearSimulation?: () => void;
}

export const NodeDetailPanel: React.FC<NodeDetailPanelProps> = ({
  node,
  dataset,
  onSelectNode,
  onSelectHeroNode,
  simulation = null,
  onClearSimulation,
}) => {
  // If simulation is active and no single node is clicked, show full Simulation Report
  if (!node && simulation) {
    const isCritical = simulation.safety_rating.includes('CRITICAL');
    const isElevated = simulation.safety_rating.includes('ELEVATED');

    return (
      <aside className="w-full lg:w-96 bg-[#0b0f19]/95 border-l border-slate-800 flex flex-col h-full overflow-y-auto shrink-0 z-20 animate-fadeIn">
        {/* Simulation Header */}
        <div className="p-5 border-b border-slate-800 sticky top-0 bg-[#0b0f19]/95 backdrop-blur-md z-10 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3 animate-spin" />
                Live WebMCP Simulation
              </span>
            </div>

            {onClearSimulation && (
              <button
                onClick={onClearSimulation}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
                title="Exit simulation view"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div>
            <h2 className="text-base font-bold text-white tracking-tight">Proposed Change Impact</h2>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed bg-slate-900/90 p-2.5 rounded-lg border border-slate-800 italic">
              "{simulation.description}"
            </p>
          </div>

          <div className={`p-2.5 rounded-xl border flex items-center gap-2.5 ${
            isCritical
              ? 'bg-red-500/15 border-red-500/30 text-red-300'
              : isElevated
              ? 'bg-amber-500/15 border-amber-500/30 text-amber-300'
              : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
          }`}>
            {isCritical ? <ShieldAlert className="w-5 h-5 text-red-400 shrink-0" /> : <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />}
            <div>
              <div className="text-[11px] font-bold tracking-wide">{simulation.safety_rating}</div>
              <div className="text-[10px] text-slate-400">Predicted Blast Risk: <strong>{(simulation.risk_index * 100).toFixed(0)}%</strong></div>
            </div>
          </div>
        </div>

        <div className="p-5 space-y-6 flex-1 text-xs">
          {/* Key Findings */}
          <div className="space-y-2">
            <div className="font-semibold text-slate-300 uppercase tracking-wider text-[11px]">
              AI Safety Analysis Findings
            </div>
            <div className="space-y-1.5">
              {simulation.key_findings.map((finding, idx) => (
                <div key={idx} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 leading-relaxed text-[11px]">
                  {finding}
                </div>
              ))}
            </div>
          </div>

          {/* Directly Touched Modules */}
          <div className="space-y-2">
            <div className="font-semibold text-amber-400 flex items-center justify-between">
              <span>⚡ Directly Modified ({simulation.touched_modules.length})</span>
            </div>
            <div className="space-y-1.5">
              {simulation.touched_modules.map(modId => {
                const nodeObj = dataset.nodes.find(n => n.id === modId);
                return (
                  <button
                    key={modId}
                    onClick={() => nodeObj && onSelectNode(nodeObj)}
                    className="w-full p-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 flex items-center justify-between text-left transition-all group"
                  >
                    <div>
                      <div className="font-semibold text-white group-hover:text-amber-200">{nodeObj?.label || modId}</div>
                      <div className="font-mono text-[10px] text-slate-400">{modId}</div>
                    </div>
                    <span className="font-mono text-[10px] text-amber-400 font-bold">
                      {nodeObj?.risk_score || '0.5'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Downstream Impact Modules */}
          <div className="space-y-2">
            <div className="font-semibold text-red-400 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <ArrowRight className="w-3.5 h-3.5" /> Downstream Ripple Impact ({simulation.downstream_impacted_modules.length})
              </span>
            </div>
            <div className="space-y-1.5">
              {simulation.downstream_impacted_modules.map(modId => {
                const nodeObj = dataset.nodes.find(n => n.id === modId);
                return (
                  <button
                    key={modId}
                    onClick={() => nodeObj && onSelectNode(nodeObj)}
                    className="w-full p-2 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-800 flex items-center justify-between text-left transition-all hover:border-slate-700 group"
                  >
                    <div>
                      <div className="font-medium text-slate-200 group-hover:text-red-300">{nodeObj?.label || modId}</div>
                      <div className="font-mono text-[10px] text-slate-500">{modId}</div>
                    </div>
                    <span className="font-mono text-[10px] text-red-400 font-semibold">
                      {nodeObj?.risk_score || '0.5'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Test Coverage Vulnerabilities */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <div className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-blue-400" />
              Impacted Tests ({simulation.affected_test_count})
            </div>
            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1 text-slate-300">
              <div className="flex justify-between">
                <span>Failing Test Suites:</span>
                <span className="font-bold text-red-400">{simulation.failing_test_count}</span>
              </div>
              <div className="flex justify-between">
                <span>Historical Outages Matched:</span>
                <span className="font-bold text-amber-400">{simulation.historical_incident_count}</span>
              </div>
            </div>
          </div>
        </div>
      </aside>
    );
  }

  // Default empty state
  if (!node) {
    return (
      <aside className="w-full lg:w-96 bg-[#0b0f19]/95 border-l border-slate-800 p-6 flex flex-col justify-between overflow-y-auto shrink-0 z-20">
        <div className="space-y-6">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <Info className="w-4 h-4 text-indigo-400" />
            Module Inspector
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-slate-200 text-sm">No Module Selected</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Click any service or infrastructure node on the graph to inspect its blast radius, test suite flakiness, regression history, and AI change provenance.
            </p>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Quick Deep-Dive
            </div>
            
            <button
              onClick={onSelectHeroNode}
              className="w-full p-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-left transition-all group"
            >
              <div className="flex items-center justify-between text-xs text-red-400 font-bold">
                <span className="flex items-center gap-1.5">
                  <Flame className="w-4 h-4" /> Hero Risky Node
                </span>
                <span className="font-mono bg-red-500/20 px-1.5 py-0.5 rounded">0.88 Risk</span>
              </div>
              <div className="text-sm font-semibold text-white mt-1 group-hover:text-red-200">
                Auth & Session Service
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                4 AI commits • 2 past incidents • 2 flaky/failing tests
              </div>
            </button>

            <button
              onClick={() => {
                const checkout = dataset.nodes.find(n => n.id === 'checkout-service');
                if (checkout) onSelectNode(checkout);
              }}
              className="w-full p-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-left transition-all group"
            >
              <div className="flex items-center justify-between text-xs text-amber-400 font-bold">
                <span className="flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" /> Critical Dependent
                </span>
                <span className="font-mono bg-amber-500/20 px-1.5 py-0.5 rounded">0.75 Risk</span>
              </div>
              <div className="text-sm font-semibold text-white mt-1 group-hover:text-amber-200">
                Checkout & Billing Service
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Directly depends on Auth Service • 1 P0 outage history
              </div>
            </button>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800/80 text-[11px] text-slate-500 space-y-1">
          <div className="font-mono text-slate-400">WebMCP Ground Truth</div>
          <p>
            When an AI agent invokes <code className="text-indigo-400 font-mono">simulate_change_impact</code>, this cockpit highlights the entire blast radius.
          </p>
        </div>
      </aside>
    );
  }

  const riskMeta = getRiskLabel(node.risk_score);
  const layerMeta = getLayerColor(node.layer);
  const { upstream, downstream } = getNodeDependencies(node.id, dataset);

  const nodeCommits = dataset.commits.filter(c => c.module === node.id);
  const nodeIncidents = dataset.incidents.filter(i => i.module === node.id);
  const nodeTests = dataset.tests.filter(t => t.module === node.id);

  return (
    <aside className="w-full lg:w-96 bg-[#0b0f19]/95 border-l border-slate-800 flex flex-col h-full overflow-y-auto shrink-0 z-20">
      {/* Header */}
      <div className="p-5 border-b border-slate-800 sticky top-0 bg-[#0b0f19]/95 backdrop-blur-md z-10 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${layerMeta.bg} ${layerMeta.text} ${layerMeta.border}`}>
              {layerMeta.badge} • {node.layer}
            </span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${riskMeta.bg} ${riskMeta.text} ${riskMeta.border}`}>
              {riskMeta.label}
            </span>
          </div>

          <button
            onClick={() => onSelectNode(null)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
            title="Close panel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">{node.label}</h2>
          <span className="font-mono text-xs text-slate-400">{node.id}</span>
        </div>

        {node.description && (
          <p className="text-xs text-slate-300 leading-relaxed">{node.description}</p>
        )}

        {node.owner && (
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <span className="text-slate-500 font-medium">Owner:</span>
            <span className="text-slate-300">{node.owner}</span>
          </div>
        )}

        {/* Risk Score Progress Bar */}
        <div className="space-y-1 pt-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium">Calculated Risk Index</span>
            <span className={`font-mono font-bold ${riskMeta.text}`}>
              {Math.round(node.risk_score * 100)}% ({node.risk_score})
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${node.risk_score * 100}%`,
                backgroundColor: getRiskColor(node.risk_score),
              }}
            />
          </div>
        </div>
      </div>

      <div className="p-5 space-y-6 flex-1 text-xs">
        {/* Downstream & Upstream Dependents */}
        <div className="space-y-3">
          <div className="font-semibold text-slate-300 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-rose-400">
              <ArrowRight className="w-3.5 h-3.5" /> Downstream Blast Impact ({downstream.length})
            </span>
            <span className="text-[10px] text-slate-500">Callers</span>
          </div>

          {downstream.length === 0 ? (
            <div className="text-[11px] text-slate-500 italic p-2 rounded-lg bg-slate-900/40 border border-slate-800/60">
              No direct downstream callers (edge leaf node)
            </div>
          ) : (
            <div className="space-y-1.5">
              {downstream.map(d => (
                <button
                  key={d.id}
                  onClick={() => onSelectNode(d)}
                  className="w-full p-2 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-800 flex items-center justify-between text-left transition-all hover:border-slate-700 group"
                >
                  <div>
                    <div className="font-medium text-slate-200 group-hover:text-indigo-300">{d.label}</div>
                    <div className="font-mono text-[10px] text-slate-500">{d.id}</div>
                  </div>
                  <span className="font-mono text-[10px] text-red-400 font-semibold">
                    {d.risk_score}
                  </span>
                </button>
              ))}
            </div>
          )}

          <div className="font-semibold text-slate-300 flex items-center justify-between pt-2">
            <span className="flex items-center gap-1.5 text-cyan-400">
              <ArrowLeft className="w-3.5 h-3.5" /> Upstream Dependencies ({upstream.length})
            </span>
            <span className="text-[10px] text-slate-500">Dependencies</span>
          </div>

          {upstream.length === 0 ? (
            <div className="text-[11px] text-slate-500 italic p-2 rounded-lg bg-slate-900/40 border border-slate-800/60">
              No upstream dependencies
            </div>
          ) : (
            <div className="space-y-1.5">
              {upstream.map(u => (
                <button
                  key={u.id}
                  onClick={() => onSelectNode(u)}
                  className="w-full p-2 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-800 flex items-center justify-between text-left transition-all hover:border-slate-700 group"
                >
                  <div>
                    <div className="font-medium text-slate-200 group-hover:text-cyan-300">{u.label}</div>
                    <div className="font-mono text-[10px] text-slate-500">{u.id}</div>
                  </div>
                  <span className="font-mono text-[10px] text-slate-400">
                    {u.risk_score}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Historical Incidents */}
        <div className="space-y-3 pt-3 border-t border-slate-800">
          <div className="font-semibold text-slate-300 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-amber-400">
              <AlertTriangle className="w-3.5 h-3.5" /> Historical Regressions ({nodeIncidents.length})
            </span>
          </div>

          {nodeIncidents.length === 0 ? (
            <div className="text-[11px] text-slate-500 italic p-2 rounded-lg bg-slate-900/40 border border-slate-800/60 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> No recorded outage incidents
            </div>
          ) : (
            <div className="space-y-2">
              {nodeIncidents.map(inc => (
                <div
                  key={inc.id}
                  className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold text-[10px]">
                      {inc.severity}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {inc.date}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-200 leading-relaxed">{inc.description}</p>
                  {inc.related_commit_id && (
                    <div className="text-[10px] font-mono text-amber-400/90 pt-0.5">
                      Caused by commit: <span className="underline">{inc.related_commit_id}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Test Suite Coverage & Flakiness */}
        <div className="space-y-3 pt-3 border-t border-slate-800">
          <div className="font-semibold text-slate-300 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-indigo-400">
              <CheckCircle2 className="w-3.5 h-3.5" /> Test Suites ({nodeTests.length})
            </span>
          </div>

          {nodeTests.length === 0 ? (
            <div className="text-[11px] text-slate-500 italic p-2 rounded-lg bg-slate-900/40 border border-slate-800/60">
              No dedicated test suites mapped
            </div>
          ) : (
            <div className="space-y-1.5">
              {nodeTests.map((t, idx) => {
                const isFail = t.status === 'failing';
                const isFlaky = t.status === 'flaky';
                return (
                  <div
                    key={idx}
                    className="p-2 rounded-lg bg-slate-900 border border-slate-800 space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[11px] text-slate-200 truncate" title={t.test_name}>
                        {t.test_name}
                      </span>
                      <span
                        className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider ${
                          isFail
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : isFlaky
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        }`}
                      >
                        {t.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                      <span>Flakiness: {Math.round(t.flakiness_score * 100)}%</span>
                      {t.coverage && <span>Coverage: {t.coverage}</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Change Provenance & Recent Commits */}
        <div className="space-y-3 pt-3 border-t border-slate-800">
          <div className="font-semibold text-slate-300 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <GitCommit className="w-3.5 h-3.5" /> Recent Change Provenance ({nodeCommits.length})
            </span>
          </div>

          {nodeCommits.length === 0 ? (
            <div className="text-[11px] text-slate-500 italic p-2 rounded-lg bg-slate-900/40 border border-slate-800/60">
              No recent changes recorded
            </div>
          ) : (
            <div className="space-y-2">
              {nodeCommits.map(c => {
                const isAI = c.author_type === 'ai';
                return (
                  <div
                    key={c.id}
                    className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                          isAI
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                            : 'bg-slate-800 text-slate-300 border border-slate-700'
                        }`}
                      >
                        {isAI ? <Bot className="w-3 h-3" /> : <User className="w-3 h-3" />}
                        {isAI ? c.agent_name || 'AI Agent' : c.author_name || 'Engineer'}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">{c.date}</span>
                    </div>
                    <p className="text-[11px] text-slate-200 leading-relaxed font-mono">{c.message}</p>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                      <span>Commit: {c.id}</span>
                      {c.risk_impact && (
                        <span
                          className={
                            c.risk_impact === 'high'
                              ? 'text-red-400 font-semibold'
                              : c.risk_impact === 'medium'
                              ? 'text-amber-400'
                              : 'text-slate-400'
                          }
                        >
                          {c.risk_impact.toUpperCase()} IMPACT
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
