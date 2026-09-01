import React from 'react';
import { ShieldAlert, Sparkles, RefreshCw, AlertTriangle } from 'lucide-react';
import { SystemDataset, LayerType } from '../types/dataset';

interface NavbarProps {
  dataset: SystemDataset;
  selectedLayer: LayerType | 'all';
  onSelectLayer: (layer: LayerType | 'all') => void;
  onResetView: () => void;
  onSelectHeroNode: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  dataset,
  selectedLayer,
  onSelectLayer,
  onResetView,
  onSelectHeroNode,
}) => {
  const highRiskCount = dataset.nodes.filter(n => n.risk_score >= 0.7).length;
  const incidentCount = dataset.incidents.length;

  return (
    <header className="h-16 border-b border-slate-800 bg-[#0b0f19]/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between z-30 shrink-0 select-none">
      {/* Brand & Tagline */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/10">
          <ShieldAlert className="w-5 h-5 text-red-400" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold tracking-tight text-white text-lg">TREMOR</span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-[10px] font-semibold text-indigo-400">
              <Sparkles className="w-2.5 h-2.5" /> WebMCP Cockpit
            </span>
          </div>
          <p className="text-[11px] text-slate-400 hidden sm:block">
            See what your AI agent is about to break — <span className="text-slate-300">before it does.</span>
          </p>
        </div>
      </div>

      {/* Layer Filter Tabs */}
      <div className="hidden md:flex items-center bg-slate-900/80 p-1 rounded-xl border border-slate-800 text-xs">
        {(['all', 'frontend', 'backend', 'shared-lib', 'infra'] as const).map(layer => {
          const isActive = selectedLayer === layer;
          const label =
            layer === 'all'
              ? 'All Layers'
              : layer === 'shared-lib'
              ? 'Shared Libs'
              : layer.charAt(0).toUpperCase() + layer.slice(1);

          return (
            <button
              key={layer}
              onClick={() => onSelectLayer(layer)}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Right Controls & Quick Actions */}
      <div className="flex items-center gap-2.5">
        {/* Hero Node Quick Trigger */}
        <button
          onClick={onSelectHeroNode}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-300 text-xs font-medium transition-all shadow-sm"
          title="Inspect Hero Risky Node (auth-service)"
        >
          <AlertTriangle className="w-3.5 h-3.5 text-red-400 animate-pulse" />
          <span className="hidden sm:inline">Hero Node:</span>
          <span className="font-mono font-bold">auth-service</span>
        </button>

        {/* Stats Pill */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300">
          <span className="flex items-center gap-1 text-red-400">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
            {highRiskCount} High Risk
          </span>
          <span className="text-slate-600">•</span>
          <span className="flex items-center gap-1 text-amber-400">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
            {incidentCount} Incidents
          </span>
        </div>

        {/* Reset Camera Button */}
        <button
          onClick={onResetView}
          className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 transition-all"
          title="Reset Graph Zoom & Center"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
