import React from 'react';
import { SimulationResult } from '../types/dataset';
import { ShieldAlert, AlertTriangle, CheckCircle, X, Sparkles, Activity } from 'lucide-react';

interface SimulationBannerProps {
  simulation: SimulationResult;
  onClear: () => void;
}

export const SimulationBanner: React.FC<SimulationBannerProps> = ({ simulation, onClear }) => {
  const isCritical = simulation.safety_rating.includes('CRITICAL');
  const isElevated = simulation.safety_rating.includes('ELEVATED');

  return (
    <div className="absolute top-16 left-1/2 transform -translate-x-1/2 z-20 w-11/12 max-w-4xl animate-fadeIn">
      <div className={`rounded-xl border backdrop-blur-md shadow-2xl p-4 transition-all duration-300 ${
        isCritical
          ? 'bg-red-950/80 border-red-500/50 shadow-red-950/50'
          : isElevated
          ? 'bg-amber-950/80 border-amber-500/50 shadow-amber-950/50'
          : 'bg-emerald-950/80 border-emerald-500/50 shadow-emerald-950/50'
      }`}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className={`p-2 rounded-lg mt-0.5 shrink-0 ${
              isCritical
                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                : isElevated
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
            }`}>
              {isCritical ? <ShieldAlert className="w-5 h-5 animate-pulse" /> : isElevated ? <AlertTriangle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-bold tracking-wider uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  <Sparkles className="w-3 h-3 animate-spin" />
                  WebMCP Live Simulation
                </span>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                  isCritical
                    ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                    : isElevated
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                }`}>
                  {simulation.safety_rating}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  Risk Index: <strong className="text-white">{(simulation.risk_index * 100).toFixed(0)}%</strong>
                </span>
              </div>

              <p className="text-sm font-medium text-slate-100 mt-1.5 truncate">
                "{simulation.description}"
              </p>

              <div className="flex items-center gap-4 mt-2 text-xs text-slate-300 flex-wrap">
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                  <span className="text-amber-300 font-semibold">{simulation.touched_modules.length}</span> Direct
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-red-400"></span>
                  <span className="text-red-300 font-semibold">{simulation.downstream_impacted_modules.length}</span> Downstream Ripple
                </div>
                <div className="flex items-center gap-1">
                  <Activity className="w-3.5 h-3.5 text-blue-400" />
                  <span className="text-blue-300 font-semibold">{simulation.affected_test_count}</span> Tests Affected ({simulation.failing_test_count} failing)
                </div>
                {simulation.historical_incident_count > 0 && (
                  <div className="flex items-center gap-1 text-red-400 font-medium">
                    ⚠️ <span>{simulation.historical_incident_count} Historical Outages Matched</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={onClear}
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition-colors shrink-0"
            title="Exit Simulation Mode"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
