import React from 'react';
import { X, Sparkles, Bot, ShieldCheck, Zap, Terminal, ExternalLink } from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn select-none">
      <div className="relative w-full max-w-2xl max-h-[85vh] bg-[#0b0f19] border border-slate-700/80 rounded-2xl shadow-2xl overflow-y-auto flex flex-col font-sans">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-[#0b0f19]/95 backdrop-blur-md z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/10 border border-indigo-500/30 rounded-xl">
              <Sparkles className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                About TREMOR
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  WebMCP Cockpit v0.1.0
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Agentic Blast Radius & Systemic Regression Prevention Cockpit
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 text-xs text-slate-300 leading-relaxed">
          {/* Mission Statement */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-950/40 to-slate-900 border border-indigo-500/30 space-y-2">
            <div className="text-white font-semibold text-sm flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              The Problem: AI Agent Myopia
            </div>
            <p className="text-slate-300 text-xs">
              When autonomous AI coding agents (Claude Code, Cursor, Codex) refactor backend services, they inspect single files or localized functions without systemic blast awareness. A 2-line token TTL refactor can quietly trigger a cache stampede across 7 downstream microservices and drop production checkouts.
            </p>
            <p className="text-cyan-300 font-medium text-xs">
              <strong>TREMOR solves this</strong> by giving browser-resident AI agents a native <strong>WebMCP toolkit</strong> to simulate blast radius, query outage precedent, and respect mandatory human confirmation gates before modifying code.
            </p>
          </div>

          {/* WebMCP Tool Suite */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Terminal className="w-4 h-4 text-indigo-400" />
              The 6-Tool WebMCP Architecture Suite
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 space-y-1">
                <span className="font-mono font-bold text-cyan-400 text-[11px]">1. get_blast_radius(module)</span>
                <p className="text-slate-400 text-[11px]">Transitive BFS reach across downstream callers, affected test suites, and incident history.</p>
              </div>

              <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 space-y-1">
                <span className="font-mono font-bold text-indigo-400 text-[11px]">2. check_regression_history(pattern)</span>
                <p className="text-slate-400 text-[11px]">Pattern matcher for historical outages, failure modes, and root-cause commit attribution.</p>
              </div>

              <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 space-y-1">
                <span className="font-mono font-bold text-purple-400 text-[11px]">3. get_change_provenance(module)</span>
                <p className="text-slate-400 text-[11px]">Audit trail tagging commits by AI agent authorship ratio (Claude Code, Cursor, Codex) vs Human.</p>
              </div>

              <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 space-y-1">
                <span className="font-mono font-bold text-amber-400 text-[11px]">4. simulate_change_impact(desc, modules)</span>
                <p className="text-slate-400 text-[11px]">Centerpiece simulation computing predicted risk index and illuminating live graph physics.</p>
              </div>

              <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 space-y-1">
                <span className="font-mono font-bold text-rose-400 text-[11px]">5. flag_for_review(module, notes)</span>
                <p className="text-slate-400 text-[11px]">Trust Layer gate that registers pending flags solvable ONLY by physical human click.</p>
              </div>

              <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 space-y-1">
                <span className="font-mono font-bold text-emerald-400 text-[11px]">6. get_system_snapshot(options)</span>
                <p className="text-slate-400 text-[11px]">Instant orientation payload returning topology, critical bottlenecks, tests, and incidents.</p>
              </div>
            </div>
          </div>

          {/* Keyboard Shortcuts */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Bot className="w-4 h-4 text-emerald-400" />
              Cockpit Keyboard Shortcuts
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 font-mono text-[11px]">
              <div className="p-2 rounded bg-slate-900 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">Hero Node:</span>
                <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-white font-bold border border-slate-700">H</kbd>
              </div>

              <div className="p-2 rounded bg-slate-900 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">Centerpiece Sim:</span>
                <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-white font-bold border border-slate-700">S</kbd>
              </div>

              <div className="p-2 rounded bg-slate-900 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">Reset View:</span>
                <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-white font-bold border border-slate-700">R</kbd>
              </div>

              <div className="p-2 rounded bg-slate-900 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">Close / Clear:</span>
                <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-white font-bold border border-slate-700">ESC</kbd>
              </div>

              <div className="p-2 rounded bg-slate-900 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">Help / About:</span>
                <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-white font-bold border border-slate-700">?</kbd>
              </div>
            </div>
          </div>

          {/* Credits & Standards */}
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Built with official <code className="text-white font-mono">@mcp-b/global</code> standard polyfill</span>
            </div>
            <a
              href="https://github.com/ABHIGH15/TREMOR"
              target="_blank"
              rel="noreferrer"
              className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold"
            >
              <span>GitHub Repo</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
