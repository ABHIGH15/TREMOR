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
  Sparkles
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
  const [selectedToolName, setSelectedToolName] = useState('get_blast_radius');
  const [inputParam, setInputParam] = useState('auth-service');
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

  const handleExecuteTool = async (toolName: string, param: string) => {
    setIsExecuting(true);
    let payload: any = {};
    if (toolName === 'get_blast_radius') {
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
              Clear Graph Highlights
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
        <div className="p-4 grid grid-cols-1 lg:grid-cols-12 gap-4 max-h-72 overflow-y-auto text-xs">
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
                  <div className="text-[10px] text-slate-400 font-sans uppercase font-semibold tracking-wider">
                    Quick Scenario Triggers (1-Click)
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    <button
                      onClick={() => {
                        setSelectedToolName('get_blast_radius');
                        setInputParam('auth-service');
                        handleExecuteTool('get_blast_radius', 'auth-service');
                      }}
                      className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-left text-[11px] text-red-300 flex items-center justify-between transition-all group"
                    >
                      <span className="flex items-center gap-1">
                        <Flame className="w-3 h-3 text-red-400" /> blast_radius(auth-service)
                      </span>
                      <Play className="w-2.5 h-2.5 opacity-60 group-hover:opacity-100" />
                    </button>

                    <button
                      onClick={() => {
                        setSelectedToolName('get_blast_radius');
                        setInputParam('checkout-service');
                        handleExecuteTool('get_blast_radius', 'checkout-service');
                      }}
                      className="p-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-left text-[11px] text-amber-300 flex items-center justify-between transition-all group"
                    >
                      <span className="flex items-center gap-1">
                        <GitBranch className="w-3 h-3 text-amber-400" /> blast_radius(checkout)
                      </span>
                      <Play className="w-2.5 h-2.5 opacity-60 group-hover:opacity-100" />
                    </button>

                    <button
                      onClick={() => {
                        setSelectedToolName('check_regression_history');
                        setInputParam('session expiry');
                        handleExecuteTool('check_regression_history', 'session expiry');
                      }}
                      className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-left text-[11px] text-slate-300 flex items-center justify-between transition-all group"
                    >
                      <span className="flex items-center gap-1">
                        <Search className="w-3 h-3 text-indigo-400" /> regression("session expiry")
                      </span>
                      <Play className="w-2.5 h-2.5 opacity-60 group-hover:opacity-100" />
                    </button>

                    <button
                      onClick={() => {
                        setSelectedToolName('get_change_provenance');
                        setInputParam('auth-service');
                        handleExecuteTool('get_change_provenance', 'auth-service');
                      }}
                      className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-left text-[11px] text-slate-300 flex items-center justify-between transition-all group"
                    >
                      <span className="flex items-center gap-1">
                        <Bot className="w-3 h-3 text-purple-400" /> provenance(auth-service)
                      </span>
                      <Play className="w-2.5 h-2.5 opacity-60 group-hover:opacity-100" />
                    </button>
                  </div>
                </div>

                {/* Custom Tool Form */}
                <div className="pt-2 border-t border-slate-800/80 flex items-center gap-2">
                  <select
                    value={selectedToolName}
                    onChange={e => setSelectedToolName(e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-[11px] text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                  >
                    <option value="get_blast_radius">get_blast_radius(module)</option>
                    <option value="check_regression_history">check_regression_history(pattern)</option>
                    <option value="get_change_provenance">get_change_provenance(module)</option>
                  </select>

                  <input
                    type="text"
                    value={inputParam}
                    onChange={e => setInputParam(e.target.value)}
                    placeholder="Parameter value..."
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-[11px] text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
                  />

                  <button
                    onClick={() => handleExecuteTool(selectedToolName, inputParam)}
                    disabled={isExecuting}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-sans font-semibold flex items-center gap-1.5 transition-all shrink-0 shadow-sm"
                  >
                    <Play className="w-3 h-3" />
                    <span>Run</span>
                  </button>
                </div>
              </div>

              {/* Live JSON Result Payload */}
              <div className="lg:col-span-7 p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col font-mono text-[11px] h-full min-h-[160px]">
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
