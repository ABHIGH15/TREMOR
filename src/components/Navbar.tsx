import React, { useState, useEffect } from 'react';
import { ShieldAlert, Sparkles, RefreshCw, AlertTriangle, ShieldCheck, HelpCircle, GitBranch, Search, Loader2 } from 'lucide-react';
import { SystemDataset, LayerType } from '../types/dataset';
import { webMCPRegistry } from '../webmcp/runtime';

interface NavbarProps {
  dataset: SystemDataset;
  selectedLayer: LayerType | 'all';
  onSelectLayer: (layer: LayerType | 'all') => void;
  onResetView: () => void;
  onSelectHeroNode: () => void;
  onOpenAboutModal?: () => void;
  // Live Repo Ingestion Props
  mode: 'demo' | 'live_repo';
  onToggleMode: (mode: 'demo' | 'live_repo') => void;
  currentRepo: string;
  onLoadRepo: (repo: string) => void;
  isLoadingRepo?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  dataset,
  selectedLayer,
  onSelectLayer,
  onResetView,
  onSelectHeroNode,
  onOpenAboutModal,
  mode,
  onToggleMode,
  currentRepo,
  onLoadRepo,
  isLoadingRepo = false,
}) => {
  const [pendingCount, setPendingCount] = useState(0);
  const [repoInputValue, setRepoInputValue] = useState(currentRepo);

  useEffect(() => {
    setRepoInputValue(currentRepo);
  }, [currentRepo]);

  useEffect(() => {
    const unsub = webMCPRegistry.onFlagsChanged(flags => {
      setPendingCount(flags.filter(f => f.status === 'PENDING').length);
    });
    return unsub;
  }, []);

  const handleRepoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (repoInputValue.trim()) {
      onLoadRepo(repoInputValue.trim());
    }
  };

  const highRiskCount = dataset.nodes.filter(n => n.risk_score >= 0.7).length;
  const incidentCount = dataset.incidents.length;

  return (
    <header className="h-16 border-b border-slate-800 bg-[#0b0f19]/90 backdrop-blur-md px-3 sm:px-5 flex items-center justify-between z-30 shrink-0 select-none gap-3">
      {/* Brand & Tagline */}
      <div className="flex items-center gap-2.5 shrink-0">
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
          <p className="text-[11px] text-slate-400 hidden lg:block">
            See what your AI agent is about to break — <span className="text-slate-300">before it does.</span>
          </p>
        </div>
      </div>

      {/* Center: Mode Switcher (Demo vs Live Repo) */}
      <div className="flex items-center gap-2">
        <div className="flex items-center bg-slate-900/90 border border-slate-800 p-1 rounded-xl text-xs shadow-inner">
          <button
            onClick={() => onToggleMode('demo')}
            aria-pressed={mode === 'demo'}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
              mode === 'demo'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <span>🏢 Demo Scenario</span>
          </button>
          <button
            onClick={() => onToggleMode('live_repo')}
            aria-pressed={mode === 'live_repo'}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
              mode === 'live_repo'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span>🌐 Live GitHub Ingestion</span>
          </button>
        </div>

        {/* Live Repo Input Bar when in Live Repo Mode */}
        {mode === 'live_repo' && (
          <form onSubmit={handleRepoSubmit} className="hidden sm:flex items-center gap-1.5">
            <div className="relative flex items-center">
              <input
                type="text"
                value={repoInputValue}
                onChange={e => setRepoInputValue(e.target.value)}
                placeholder="owner/repo (e.g. ABHIGH15/TREMOR)"
                className="w-52 px-2.5 py-1 text-xs bg-slate-950 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>
            <button
              type="submit"
              disabled={isLoadingRepo}
              className="px-2.5 py-1 text-xs font-semibold bg-cyan-600/30 hover:bg-cyan-600/50 border border-cyan-500/50 text-cyan-300 rounded-lg flex items-center gap-1 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isLoadingRepo ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
              <span>Ingest</span>
            </button>
          </form>
        )}

        {/* Layer Filter Tabs (Available in both modes) */}
        <nav aria-label="Architectural Layer Filters" className="hidden xl:flex items-center bg-slate-900/80 p-1 rounded-xl border border-slate-800 text-xs">
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
                aria-pressed={isActive}
                aria-label={`Filter by ${label}`}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  isActive
                    ? 'bg-slate-700 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                {label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Right Controls & Quick Actions */}
      <div className="flex items-center gap-2.5">
        {/* Pending Review Badge if Active */}
        {pendingCount > 0 && (
          <div aria-live="polite" className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-semibold animate-pulse shadow-sm">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>{pendingCount} Pending Approval</span>
          </div>
        )}

        {/* Hero / Central Node Quick Trigger */}
        <button
          onClick={onSelectHeroNode}
          aria-label={mode === 'demo' ? "Inspect Hero Risky Node auth-service (Shortcut: H)" : "Inspect Most Central File (Shortcut: H)"}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-300 text-xs font-medium transition-all shadow-sm shrink-0"
          title="Inspect Most Central Node [Key: H]"
        >
          <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
          <span className="hidden sm:inline">{mode === 'demo' ? 'Hero:' : 'Central:'}</span>
          <span className="font-mono font-bold truncate max-w-[120px]">
            {mode === 'demo' ? 'auth-service' : (dataset.nodes[0]?.label || 'core')}
          </span>
        </button>

        {/* Stats Pill */}
        <div aria-label="System Metrics Summary" className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 shrink-0">
          {mode === 'demo' ? (
            <>
              <span className="flex items-center gap-1 text-red-400">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                {highRiskCount} High Risk
              </span>
              <span className="text-slate-600">•</span>
              <span className="flex items-center gap-1 text-amber-400">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                {incidentCount} Incidents
              </span>
            </>
          ) : (
            <>
              <span className="flex items-center gap-1 text-cyan-400">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                {dataset.nodes.length} Files
              </span>
              <span className="text-slate-600">•</span>
              <span className="flex items-center gap-1 text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                {dataset.edges.length} Real Imports
              </span>
            </>
          )}
        </div>

        {/* Reset Camera Button */}
        <button
          onClick={onResetView}
          aria-label="Reset Graph Zoom and Center Camera (Shortcut: R)"
          className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 transition-all cursor-pointer"
          title="Reset Graph Zoom & Center [Key: R]"
        >
          <RefreshCw className="w-4 h-4" />
        </button>

        {/* About & Shortcuts Modal Trigger */}
        {onOpenAboutModal && (
          <button
            onClick={onOpenAboutModal}
            aria-label="Open About TREMOR and Shortcuts Guide (Shortcut: ?)"
            className="p-2 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 hover:text-indigo-200 transition-all cursor-pointer"
            title="About TREMOR & Shortcuts [Key: ?]"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        )}
      </div>
    </header>
  );
};
