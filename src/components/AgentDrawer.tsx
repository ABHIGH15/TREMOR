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
  Zap
} from 'lucide-react';
import { webMCPRegistry, WebMCPActivityLogItem, WebMCPToolDefinition } from '../webmcp/runtime';

interface AgentDrawerProps {
  onClearHighlights?: () => void;
}

export const AgentDrawer: React.FC<AgentDrawerProps> = ({ onClearHighlights }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<'tester' | 'activity' | 'pending'>('tester');
  const [tools, setTools] = useState<WebMCPToolDefinition[]>([]);
  const [activityLogs, setActivityLogs] = useState<WebMCPActivityLogItem[]>([]);
  const [selectedToolName, setSelectedToolName] = useState('simulate_change_impact');
  const [inputParam, setInputParam] = useState('auth-service,redis-session-cluster');
  const [customDesc, setCustomDesc] = useState('Refactor JWT sliding session expiry and distributed cache cluster');
  const [isExecuting, setIsExecuting] = useState(false);
  const [lastResponse, setLastResponse] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const unsubTools = webMCPRegistry.onToolsChanged(setTools);
    const unsubActivity = webMCPRegistry.onActivity(item => {
      setActivityLogs(prev => [item, ...prev].slice(0, 30));
    });
    return () => {
      unsubTools();
      unsubActivity();
    };
  }, []);

  const handleExecuteTool = async (toolName: string, param: string, desc?: string) => {
    setIsExecuting(true);
    let payload: any = {};
    if (toolName === 'simulate_change_impact') {
      const touched = param.split(',').map(s => s.trim()).filter(Boolean);
      payload = {
        description: desc || customDesc || 'Proposed system modification',
        touched_modules: touched.length > 0 ? touched : ['auth-service'],
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
    } catch (err: any) {
      setLastResponse(JSON.stringify({ error: err?.message || 'Execution error' }, null, 2));
    } finally {
      setIsExecuting(false);
    }
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
              className={`px-2.5 py-1 rounded-md transition-all ${
                activeTab === 'pending' && isOpen
                  ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Pending Review (0)
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
                    <span className="text-cyan-400">Round 4 Centerpiece</span>
                  </div>
                  
                  {/* Round 4 Centerpiece Presets */}
                  <button
                    onClick={() => {
                      setSelectedToolName('simulate_change_impact');
                      setInputParam('auth-service,redis-session-cluster');
                      const desc = 'Refactor JWT claims validation and sliding session cache timeout in Redis cluster';
                      setCustomDesc(desc);
                      handleExecuteTool('simulate_change_impact', 'auth-service,redis-session-cluster', desc);
                    }}
                    className="w-full p-2.5 rounded-lg bg-red-950/40 hover:bg-red-900/50 border border-red-500/40 text-left text-[11px] text-red-200 flex items-center justify-between transition-all group shadow-sm"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0 animate-pulse" />
                      <div className="truncate">
                        <span className="font-bold text-white">⚡ simulate(auth + redis)</span>
                        <span className="text-[10px] text-red-300 block truncate">High risk token TTL refactor (P1 incident risk)</span>
                      </div>
                    </div>
                    <Play className="w-3 h-3 text-red-400 opacity-80 group-hover:opacity-100 shrink-0" />
                  </button>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                    <button
                      onClick={() => {
                        setSelectedToolName('simulate_change_impact');
                        setInputParam('db-client-pool');
                        const desc = 'Increase PostgreSQL connection pool limit from 50 to 200 without replica split';
                        setCustomDesc(desc);
                        handleExecuteTool('simulate_change_impact', 'db-client-pool', desc);
                      }}
                      className="p-2 rounded-lg bg-amber-950/30 hover:bg-amber-900/40 border border-amber-500/30 text-left text-[11px] text-amber-300 flex items-center justify-between transition-all group"
                    >
                      <span className="flex items-center gap-1 truncate">
                        <Flame className="w-3 h-3 text-amber-400 shrink-0" /> simulate(db-pool)
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

                    <button
                      onClick={() => {
                        setSelectedToolName('get_change_provenance');
                        setInputParam('auth-service');
                        handleExecuteTool('get_change_provenance', 'auth-service');
                      }}
                      className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-left text-[11px] text-slate-300 flex items-center justify-between transition-all group"
                    >
                      <span className="flex items-center gap-1 truncate">
                        <Bot className="w-3 h-3 text-purple-400 shrink-0" /> provenance(auth)
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
                      <option value="simulate_change_impact">simulate_change_impact(desc, modules)</option>
                      <option value="get_blast_radius">get_blast_radius(module)</option>
                      <option value="check_regression_history">check_regression_history(pattern)</option>
                      <option value="get_change_provenance">get_change_provenance(module)</option>
                    </select>

                    <input
                      type="text"
                      value={inputParam}
                      onChange={e => setInputParam(e.target.value)}
                      placeholder="Module IDs (comma-separated)..."
                      className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-[11px] text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
                    />

                    <button
                      onClick={() => handleExecuteTool(selectedToolName, inputParam, customDesc)}
                      disabled={isExecuting}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-sans font-semibold flex items-center gap-1.5 transition-all shrink-0 shadow-sm"
                    >
                      <Play className="w-3 h-3" />
                      <span>Run</span>
                    </button>
                  </div>

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
                <span>Timestamp & Tool</span>
                <span>Payload Preview / Latency</span>
              </div>
              {activityLogs.length === 0 ? (
                <div className="text-slate-500 italic text-center py-6">
                  No WebMCP agent tool invocations recorded yet.
                </div>
              ) : (
                <div className="space-y-1.5">
                  {activityLogs.map(log => (
                    <div
                      key={log.id}
                      className="p-2 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between text-[11px]"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500">[{log.timestamp}]</span>
                        <span className="font-bold text-indigo-400">{log.toolName}</span>
                        <span className="text-slate-400">({JSON.stringify(log.input)})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-300 truncate max-w-md">{log.outputPreview}</span>
                        <span className="text-emerald-400 font-bold">{log.durationMs}ms</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'pending' && (
            <div className="col-span-12 p-6 rounded-xl bg-slate-900/60 border border-slate-800 text-center space-y-2">
              <ShieldCheck className="w-8 h-8 text-amber-400 mx-auto opacity-70" />
              <div className="font-semibold text-slate-200">Trust Layer (Round 5 Target)</div>
              <p className="text-slate-400 max-w-md mx-auto text-xs">
                When an AI agent calls <code className="text-amber-400">flag_for_review</code>, pending security and blast flags will be queued here for mandatory human Confirm / Dismiss resolution.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
