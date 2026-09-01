import React from 'react';

export const GraphLegend: React.FC = () => {
  return (
    <div className="absolute bottom-4 left-4 z-20 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl p-3 shadow-xl max-w-xs text-xs space-y-2 pointer-events-auto">
      <div className="flex items-center justify-between text-slate-400 border-b border-slate-800/80 pb-1.5 font-semibold text-[11px]">
        <span>Risk & Topology Legend</span>
        <span className="text-[10px] text-indigo-400 font-mono">18 NODES</span>
      </div>

      {/* Risk Color Scale */}
      <div className="space-y-1">
        <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Risk Score</div>
        <div className="grid grid-cols-3 gap-1.5 text-[10px]">
          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>&lt; 0.40</span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-amber-500/10 border border-amber-500/20 text-amber-300">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            <span>0.4 - 0.7</span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-red-500/10 border border-red-500/20 text-red-300">
            <span className="w-2 h-2 rounded-full bg-red-500"></span>
            <span>&gt; 0.70</span>
          </div>
        </div>
      </div>

      {/* Badges and Rings */}
      <div className="pt-1 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-300">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full border-2 border-amber-500 bg-amber-500/30"></span>
          <span className="text-[10px]">Active Incident History</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping"></span>
          <span className="text-[10px]">Selected / Hero</span>
        </div>
      </div>
    </div>
  );
};
