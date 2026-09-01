import React, { useState, useEffect } from 'react';
import {
  Terminal,
  ShieldCheck,
  ChevronUp,
  ChevronDown,
  Bot,
  Play,
  Copy,
  Check,
  Flame,
  Search,
  GitBranch,
  Sparkles,
  Zap,
  ShieldAlert,
  CheckCircle,
  XCircle,
  Clock,
  UserCheck
} from 'lucide-react';
import { webMCPRegistry, WebMCPActivityLogItem, WebMCPToolDefinition } from '../webmcp/runtime';
import { PendingReviewFlag } from '../types/dataset';

interface AgentDrawerProps {
  onClearHighlights?: () => void;
  onSelectFlaggedModule?: (moduleId: string) => void;
}

export const AgentDrawer: React.FC<AgentDrawerProps> = ({
  onClearHighlights,
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<'tester' | 'activity' | 'pending'>('tester');
  const [tools, setTools] = useState<WebMCPToolDefinition[]>([]);
  const [activityLogs, setActivityLogs] = useState<WebMCPActivityLogItem[]>([]);
  const [pendingFlags, setPendingFlags] = useState<PendingReviewFlag[]>([]);
  const [selectedToolName, setSelectedToolName] = useState('flag_for_review');
  const [inputParam, setInputParam] = useState('auth-service');
  const [customDesc, setCustomDesc] = useState('Refactor sliding session token TTL to 15m and add Redis cluster replication');
  const [customNotes, setCustomNotes] = useState('High-risk session change touches core auth and Redis cluster; past incident i1 cache stampede hazard');
  const [isExecuting, setIsExecuting] = useState(false);
  const [lastResponse, setLastResponse] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const unsubTools = webMCPRegistry.onToolsChanged(setTools);
    const unsubActivity = webMCPRegistry.onActivity(item => {
      setActivityLogs(prev => [item, ...prev].slice(0, 30));
    });
    const unsubFlags = webMCPRegistry.onFlagsChanged(flags => {
      setPendingFlags(flags);
    });

    return () => {
      unsubTools();
      unsubActivity();
      unsubFlags();
    };
  }, []);

  const pendingCount = pendingFlags.filter(f => f.status === 'PENDING').length;

  const handleExecuteTool = async (toolName: string, param: string, desc?: string, notes?: string) => {
    setIsExecuting(true);
    let payload: any = {};
    if (toolName === 'simulate_change_impact') {
      const touched = param.split(',').map(s => s.trim()).filter(Boolean);
      payload = {
        description: desc || customDesc || 'Proposed system modification',
        touched_modules: touched.length > 0 ? touched : ['auth-service'],
      };
    } else if (toolName === 'flag_for_review') {
      payload = {
        module: param || 'auth-service',
        risk_notes: notes || customNotes || 'Proposed modification flagged for human security and architectural review',
        proposed_action: desc || customDesc || 'Apply proposed code refactor and schema migration',
      };
    } else if (toolName === 'get_blast_radius') {
      payload = { module: param };
    } else if (toolName === 'check_regression_history') {
      payload = { pattern: param };
    } else if (toolName === 'get_change_provenance') {
      payload = { module: param };
    } else {
      payload = { module: param };
    }

    try {
      const res = await webMCPRegistry.executeTool(toolName, payload);
      const text = res.content?.[0]?.text || JSON.stringify(res, null, 2);
      setLastResponse(text);

      // If it was a flag_for_review, automatically switch to Pending tab to show the gate
      if (toolName === 'flag_for_review') {
        setActiveTab('pending');
        setIsOpen(true);
      }
    } catch (err: any) {
      setLastResponse(JSON.stringify({ error: err?.message || 'Execution error' }, null, 2));
    } finally {
      setIsExecuting(false);
    }
  };

  const handleHumanConfirm = (flagId: string) => {
    webMCPRegistry.confirmFlagByHuman(flagId, 'Devin Patel (Lead SRE)');
  };

  const handleHumanDismiss = (flagId: string) => {
    webMCPRegistry.dismissFlagByHuman(flagId, 'Devin Patel (Lead SRE)');
  };

  const handleCopy = () => {
    if (!lastResponse) return;
    navigator.clipboard.writeText(lastResponse);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="border-t border-slate-800 bg-[#0b0f19]/95 backdrop-blur-md z-30 transition-all duration-300 select-none">
      {/* Top Header Bar */}
      <div className="px-4 py-2 flex items-center justify-between border-b border-slate-800/80 bg-slate-900/60 text-xs">
        <div className="flex items-center gap-3">
          <div
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 cursor-pointer hover:text-white transition-all text-indigo-400 font-semibold font-mono"
          >
            <Bot className="w-4 h-4 text-indigo-400" />
            <span>WEBMCP RUNTIME</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              {tools.length} Tools Registered
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-[11px]">
            <button
              onClick={() => {
                setIsOpen(true);
                setActiveTab('tester');
              }}
              className={`px-2.5 py-1 rounded-md transition-all ${
                activeTab === 'tester' && isOpen
                  ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Interactive Tool Runner
            </button>
            <button
              onClick={() => {
                setIsOpen(true);
                setActiveTab('activity');
              }}
              className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1.5 ${
                activeTab === 'activity' && isOpen
                  ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>Activity Stream</span>
              {activityLogs.length > 0 && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              )}
            </button>
            <button
              onClick={() => {
                setIsOpen(true);
                setActiveTab('pending');
              }}
              className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1.5 ${
                activeTab === 'pending' && isOpen
                  ? 'bg-amber-600 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Pending Review</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                pendingCount > 0
                  ? 'bg-red-500 text-white animate-pulse'
                  : 'bg-slate-800 text-slate-400'
              }`}>
                {pendingCount}
              </span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 text-slate-400">
          {onClearHighlights && (
            <button
              onClick={onClearHighlights}
              className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all"
            >
              Reset Simulation & Highlights
            </button>
          )}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-all"
            title={isOpen ? 'Collapse panel' : 'Expand panel'}
          >
            {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expandable Body */}
      {isOpen && (
        <div className="p-4 grid grid-cols-1 lg:grid-cols-12 gap-4 max-h-80 overflow-y-auto text-xs">
          {activeTab === 'tester' && (
            <>
              {/* Quick Preset Buttons & Input */}
              <div className="lg:col-span-5 space-y-3 font-mono">
                <div className="flex items-center justify-between text-slate-300 font-sans font-semibold">
                  <span className="flex items-center gap-1.5 text-indigo-400">
                    <Sparkles className="w-3.5 h-3.5" /> Execute WebMCP Tool Live
                  </span>
                  <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    Ready
                  </span>
                </div>

                {/* Quick Presets */}
                <div className="space-y-1.5">
                  <div className="text-[10px] text-slate-400 font-sans uppercase font-semibold tracking-wider flex items-center justify-between">
                    <span>1-Click Scenarios</span>
                    <span className="text-amber-400 font-bold">Round 5 Trust Gate</span>
                  </div>
                  
                  {/* Round 5 Trust Gate Preset */}
                  <button
                    onClick={() => {
                      setSelectedToolName('flag_for_review');
                      setInputParam('auth-service');
                      const notes = 'Sliding session expiry change touches P1 incident path (cache stampede) and 2 failing tests. Mandatory human review required.';
                      const action = 'Refactor JWT claims validation and sliding session cache timeout in Redis';
                      setCustomNotes(notes);
                      setCustomDesc(action);
                      handleExecuteTool('flag_for_review', 'auth-service', action, notes);
                    }}
                    className="w-full p-2.5 rounded-lg bg-amber-950/40 hover:bg-amber-900/50 border border-amber-500/40 text-left text-[11px] text-amber-200 flex items-center justify-between transition-all group shadow-sm"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0 animate-pulse" />
                      <div className="truncate">
                        <span className="font-bold text-white">🚨 flag_for_review(auth-service)</span>
                        <span className="text-[10px] text-amber-300 block truncate">Create pending human review flag for JWT refactor</span>
                      </div>
                    </div>
                    <Play className="w-3 h-3 text-amber-400 opacity-80 group-hover:opacity-100 shrink-0" />
                  </button>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                    <button
                      onClick={() => {
                        setSelectedToolName('simulate_change_impact');
                        setInputParam('auth-service,redis-session-cluster');
                        const desc = 'Refactor JWT claims validation and sliding session cache timeout in Redis cluster';
                        setCustomDesc(desc);
                        handleExecuteTool('simulate_change_impact', 'auth-service,redis-session-cluster', desc);
                      }}
                      className="p-2 rounded-lg bg-red-950/30 hover:bg-red-900/40 border border-red-500/30 text-left text-[11px] text-red-300 flex items-center justify-between transition-all group"
                    >
                      <span className="flex items-center gap-1 truncate">
                        <Zap className="w-3 h-3 text-red-400 shrink-0" /> simulate(auth+redis)
                      </span>
                      <Play className="w-2.5 h-2.5 opacity-60 group-hover:opacity-100 shrink-0" />
                    </button>

                    <button
                      onClick={() => {
                        setSelectedToolName('simulate_change_impact');
                        setInputParam('order-processor');
                        const desc = 'Refactor order state transition engine to asynchronous webhook dispatch';
                        setCustomDesc(desc);
                        handleExecuteTool('simulate_change_impact', 'order-processor', desc);
                      }}
                      className="p-2 rounded-lg bg-amber-950/30 hover:bg-amber-900/40 border border-amber-500/30 text-left text-[11px] text-amber-300 flex items-center justify-between transition-all group"
                    >
                      <span className="flex items-center gap-1 truncate">
                        <Flame className="w-3 h-3 text-amber-400 shrink-0" /> simulate(orders)
                      </span>
                      <Play className="w-2.5 h-2.5 opacity-60 group-hover:opacity-100 shrink-0" />
                    </button>

                    <button
                      onClick={() => {
                        setSelectedToolName('get_blast_radius');
                        setInputParam('auth-service');
                        handleExecuteTool('get_blast_radius', 'auth-service');
                      }}
                      className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-left text-[11px] text-slate-300 flex items-center justify-between transition-all group"
                    >
                      <span className="flex items-center gap-1 truncate">
                        <GitBranch className="w-3 h-3 text-cyan-400 shrink-0" /> blast_radius(auth)
                      </span>
                      <Play className="w-2.5 h-2.5 opacity-60 group-hover:opacity-100 shrink-0" />
                    </button>

                    <button
                      onClick={() => {
                        setSelectedToolName('check_regression_history');
                        setInputParam('session expiry');
                        handleExecuteTool('check_regression_history', 'session expiry');
                      }}
                      className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-left text-[11px] text-slate-300 flex items-center justify-between transition-all group"
                    >
                      <span className="flex items-center gap-1 truncate">
                        <Search className="w-3 h-3 text-indigo-400 shrink-0" /> regression("session")
                      </span>
                      <Play className="w-2.5 h-2.5 opacity-60 group-hover:opacity-100 shrink-0" />
                    </button>
                  </div>
                </div>

                {/* Custom Tool Form */}
                <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <select
                      value={selectedToolName}
                      onChange={e => setSelectedToolName(e.target.value)}
                      className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-[11px] text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                    >
                      <option value="flag_for_review">flag_for_review(module, notes)</option>
                      <option value="simulate_change_impact">simulate_change_impact(desc, modules)</option>
                      <option value="get_blast_radius">get_blast_radius(module)</option>
                      <option value="check_regression_history">check_regression_history(pattern)</option>
                      <option value="get_change_provenance">get_change_provenance(module)</option>
                    </select>

                    <input
                      type="text"
                      value={inputParam}
                      onChange={e => setInputParam(e.target.value)}
                      placeholder="Module ID (e.g. auth-service)..."
                      className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-[11px] text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
                    />

                    <button
                      onClick={() => handleExecuteTool(selectedToolName, inputParam, customDesc, customNotes)}
                      disabled={isExecuting}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-sans font-semibold flex items-center gap-1.5 transition-all shrink-0 shadow-sm"
                    >
                      <Play className="w-3 h-3" />
                      <span>Run</span>
                    </button>
                  </div>

                  {selectedToolName === 'flag_for_review' && (
                    <input
                      type="text"
                      value={customNotes}
                      onChange={e => setCustomNotes(e.target.value)}
                      placeholder="Safety justification / risk notes..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-[10px] text-slate-300 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-sans"
                    />
                  )}

                  {selectedToolName === 'simulate_change_impact' && (
                    <input
                      type="text"
                      value={customDesc}
                      onChange={e => setCustomDesc(e.target.value)}
                      placeholder="Proposed change description..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-[10px] text-slate-300 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-sans"
                    />
                  )}
                </div>
              </div>

              {/* Live JSON Result Payload */}
              <div className="lg:col-span-7 p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col font-mono text-[11px] h-full min-h-[180px]">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-1.5 text-slate-400 font-sans">
                  <span className="flex items-center gap-1.5">
                    <Terminal className="w-3 h-3 text-indigo-400" /> WebMCP Tool Result Payload
                  </span>
                  {lastResponse && (
                    <button
                      onClick={handleCopy}
                      className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-white transition-all font-mono"
                    >
                      {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      {copied ? 'Copied' : 'Copy JSON'}
                    </button>
                  )}
                </div>

                <div className="flex-1 overflow-y-auto mt-2 text-slate-300">
                  {lastResponse ? (
                    <pre className="text-[10px] leading-relaxed text-indigo-300 whitespace-pre-wrap">
                      {lastResponse}
                    </pre>
                  ) : (
                    <div className="h-full flex items-center justify-center text-slate-500 italic text-center p-4">
                      Click any 1-Click trigger on the left to execute a WebMCP tool and inspect structured JSON return data.
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {activeTab === 'activity' && (
            <div className="col-span-12 space-y-2 font-mono">
              <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-1 text-xs">
                <span>Timestamp & Origin</span>
                <span>Payload / Confirmation Telemetry</span>
              </div>
              {activityLogs.length === 0 ? (
                <div className="text-slate-500 italic text-center py-6">
                  No WebMCP agent tool invocations recorded yet.
                </div>
              ) : (
                <div className="space-y-1.5">
                  {activityLogs.map(log => {
                    const isHuman = log.status === 'human_action';
                    const isPending = log.status === 'pending_human';

                    return (
                      <div
                        key={log.id}
                        className={`p-2 rounded-lg border flex items-center justify-between text-[11px] ${
                          isHuman
                            ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                            : isPending
                            ? 'bg-amber-950/30 border-amber-500/30 text-amber-200'
                            : 'bg-slate-900 border-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-slate-500">[{log.timestamp}]</span>
                          {isHuman ? (
                            <span className="font-bold text-emerald-400 flex items-center gap-1">
                              <UserCheck className="w-3.5 h-3.5" /> HUMAN_GATE
                            </span>
                          ) : (
                            <span className="font-bold text-indigo-400">{log.toolName}</span>
                          )}
                          <span className="text-slate-400">({JSON.stringify(log.input)})</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="truncate max-w-md">{log.outputPreview}</span>
                          <span className={`font-bold ${isHuman ? 'text-emerald-400' : 'text-slate-400'}`}>
                            {log.durationMs}ms
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'pending' && (
            <div className="col-span-12 space-y-3 font-sans">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div>
                  <h3 className="font-bold text-white text-sm flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                    Human Review Gate (Trust Layer)
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    AI agents can declare intent and flag high-risk operations, but <strong>cannot self-approve</strong>. A human engineer must physically confirm or dismiss each flag.
                  </p>
                </div>
                <div className="text-xs font-mono text-slate-400">
                  Pending: <strong className="text-amber-400">{pendingCount}</strong>
                </div>
              </div>

              {pendingFlags.length === 0 ? (
                <div className="p-8 rounded-xl bg-slate-900/40 border border-slate-800 text-center space-y-2">
                  <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto opacity-80" />
                  <div className="font-semibold text-slate-200 text-sm">All Operational Surfaces Clear</div>
                  <p className="text-slate-400 text-xs max-w-md mx-auto">
                    Zero pending review flags. When an AI agent invokes <code className="text-amber-400 font-mono">flag_for_review</code>, the request will block here until you confirm or dismiss.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {pendingFlags.map(flag => {
                    const isPending = flag.status === 'PENDING';
                    const isConfirmed = flag.status === 'CONFIRMED';

                    return (
                      <div
                        key={flag.id}
                        className={`p-3.5 rounded-xl border transition-all ${
                          isPending
                            ? 'bg-amber-950/25 border-amber-500/40 shadow-sm'
                            : isConfirmed
                            ? 'bg-emerald-950/20 border-emerald-500/30 opacity-90'
                            : 'bg-slate-900/60 border-slate-800 opacity-60'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1.5 flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-mono text-xs font-bold text-white bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                                {flag.id}
                              </span>
                              <span className="font-bold text-amber-300 text-xs">
                                {flag.module_label || flag.module} ({flag.module})
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                                <Clock className="w-3 h-3" /> Flagged at {flag.timestamp}
                              </span>
                              <span className={`px-2 py-0.2 rounded text-[10px] font-bold uppercase tracking-wider ${
                                isPending
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
                                  : isConfirmed
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                  : 'bg-red-500/20 text-red-300 border border-red-500/40'
                              }`}>
                                {flag.status}
                              </span>
                            </div>

                            <p className="text-xs text-slate-200 bg-slate-950/60 p-2 rounded-lg border border-slate-800/80 leading-relaxed font-sans">
                              <strong className="text-amber-400 font-medium">Agent Risk Justification:</strong> {flag.risk_notes}
                            </p>

                            {flag.proposed_action && (
                              <p className="text-[11px] text-slate-400 italic">
                                Proposed Action: "{flag.proposed_action}"
                              </p>
                            )}

                            {flag.resolved_at && (
                              <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1 pt-1">
                                {isConfirmed ? (
                                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                                    <CheckCircle className="w-3 h-3" /> Approved by {flag.resolved_by} at {flag.resolved_at}
                                  </span>
                                ) : (
                                  <span className="text-red-400 font-semibold flex items-center gap-1">
                                    <XCircle className="w-3 h-3" /> Rejected by {flag.resolved_by} at {flag.resolved_at}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Physical Human-Only Action Buttons */}
                          {isPending && (
                            <div className="flex items-center gap-2 shrink-0 pt-1">
                              <button
                                onClick={() => handleHumanConfirm(flag.id)}
                                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md hover:shadow-emerald-900/50 transition-all cursor-pointer"
                                title="Explicit Human Engineer Approval"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Confirm / Approve</span>
                              </button>

                              <button
                                onClick={() => handleHumanDismiss(flag.id)}
                                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-red-950/80 hover:border-red-500/50 border border-slate-700 text-slate-300 hover:text-red-300 font-medium text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                                title="Reject and Dismiss"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                <span>Dismiss</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
