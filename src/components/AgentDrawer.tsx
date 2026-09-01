import React, { useState } from 'react';
import { Terminal, ShieldCheck, ChevronUp, ChevronDown, Bot } from 'lucide-react';

export const AgentDrawer: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-t border-slate-800 bg-[#0b0f19]/95 backdrop-blur-md z-20 transition-all duration-300">
      {/* Bottom Bar Header / Toggle */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2.5 flex items-center justify-between cursor-pointer hover:bg-slate-800/40 select-none text-xs"
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-indigo-400 font-semibold font-mono">
            <Bot className="w-4 h-4" />
            <span>WEBMCP AGENT RUNTIME</span>
          </div>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400 flex items-center gap-1.5 text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Standing by for Agent Tool Calls (Rounds 3–5)
          </span>
        </div>

        <div className="flex items-center gap-2 text-slate-400">
          <span className="text-[11px] font-mono">
            {isOpen ? 'Collapse Cockpit Feed' : 'Expand Cockpit Feed'}
          </span>
          {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </div>
      </div>

      {/* Expandable Drawer Content */}
      {isOpen && (
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-800/60 max-h-48 overflow-y-auto text-xs font-mono">
          {/* Activity Log Placeholder */}
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-slate-400 font-sans font-semibold border-b border-slate-800 pb-1.5">
              <span className="flex items-center gap-1.5 text-indigo-300">
                <Terminal className="w-3.5 h-3.5" /> Live Agent Activity Log
              </span>
              <span className="text-[10px] text-slate-500">Real-time Stream</span>
            </div>
            <div className="text-slate-500 text-[11px] space-y-1">
              <div>[00:00:00] WebMCP runtime initialized. Ready to expose 6 browser tools.</div>
              <div className="text-indigo-400/80">
                // Calling `get_blast_radius`, `simulate_change_impact` will stream here in real time.
              </div>
            </div>
          </div>

          {/* Pending Review Placeholder */}
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-slate-400 font-sans font-semibold border-b border-slate-800 pb-1.5">
              <span className="flex items-center gap-1.5 text-amber-300">
                <ShieldCheck className="w-3.5 h-3.5" /> Pending Human Confirmation Gate
              </span>
              <span className="text-[10px] text-slate-500">Human-In-The-Loop</span>
            </div>
            <div className="text-slate-500 text-[11px] space-y-1">
              <div>No pending agent review flags.</div>
              <div className="text-amber-400/80">
                // When agent invokes `flag_for_review`, only explicit human Confirm/Dismiss resolves it.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
