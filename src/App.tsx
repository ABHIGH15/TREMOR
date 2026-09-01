import { useEffect } from 'react';
import { ShieldAlert, Cpu, Sparkles, Terminal, Activity, Layers, GitCommit, AlertTriangle, CheckCircle2 } from 'lucide-react';
import rawDataset from './data/dataset.json';
import { SystemDataset } from './types/dataset';

const dataset = rawDataset as SystemDataset;

export default function App() {
  useEffect(() => {
    console.log('🚀 [TREMOR] System Dataset loaded successfully:', {
      nodesCount: dataset.nodes.length,
      edgesCount: dataset.edges.length,
      commitsCount: dataset.commits.length,
      incidentsCount: dataset.incidents.length,
      testsCount: dataset.tests.length,
      heroNode: dataset.nodes.find(n => n.id === 'auth-service'),
    });
  }, []);

  const heroNode = dataset.nodes.find(n => n.id === 'auth-service');
  const aiCommitsCount = dataset.commits.filter(c => c.author_type === 'ai').length;
  const humanCommitsCount = dataset.commits.filter(c => c.author_type === 'human').length;

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col items-center justify-center p-6">
      <div className="max-w-3xl w-full text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          WebMCP Challenge 2026
        </div>
        
        <div className="flex items-center justify-center gap-3">
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-2xl shadow-lg shadow-red-500/10">
            <ShieldAlert className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            TREMOR
          </h1>
        </div>

        <p className="text-lg text-slate-400 font-medium max-w-xl mx-auto">
          See what your AI agent is about to break — <span className="text-slate-200">before it does.</span>
        </p>

        {/* Dataset Stats Matrix */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-left">
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
              <Layers className="w-3.5 h-3.5 text-indigo-400" /> Nodes
            </div>
            <div className="text-xl font-bold text-white mt-1">{dataset.nodes.length}</div>
            <div className="text-[10px] text-slate-500">4 Architecture Layers</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
              <Activity className="w-3.5 h-3.5 text-cyan-400" /> Edges
            </div>
            <div className="text-xl font-bold text-white mt-1">{dataset.edges.length}</div>
            <div className="text-[10px] text-slate-500">Dependency Links</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
              <GitCommit className="w-3.5 h-3.5 text-emerald-400" /> Commits
            </div>
            <div className="text-xl font-bold text-white mt-1">{dataset.commits.length}</div>
            <div className="text-[10px] text-emerald-400/80">{aiCommitsCount} AI / {humanCommitsCount} Human</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> Incidents
            </div>
            <div className="text-xl font-bold text-white mt-1">{dataset.incidents.length}</div>
            <div className="text-[10px] text-amber-400/80">Historical Regressions</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 col-span-2 sm:col-span-1">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-rose-400" /> Test Suites
            </div>
            <div className="text-xl font-bold text-white mt-1">{dataset.tests.length}</div>
            <div className="text-[10px] text-rose-400/80">Flaky & Failing Included</div>
          </div>
        </div>

        {/* Hero Node Card */}
        {heroNode && (
          <div className="p-4 rounded-xl bg-slate-900/60 border border-red-500/20 text-left space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-red-400 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5" /> Hero Risky Module Configured
              </span>
              <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-300 font-mono font-bold">
                Risk Score: {heroNode.risk_score}
              </span>
            </div>
            <div className="text-sm font-semibold text-slate-200">
              {heroNode.label} <span className="font-mono text-xs text-slate-500">({heroNode.id})</span>
            </div>
            <p className="text-xs text-slate-400">{heroNode.description}</p>
          </div>
        )}

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-left font-mono text-xs text-slate-300 space-y-2">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-slate-400 font-sans font-semibold">
            <span className="flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-indigo-400" /> Data Layer Runtime
            </span>
            <span className="text-emerald-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              ROUND 1 VERIFIED
            </span>
          </div>
          <p className="text-slate-400">// dataset.json loaded & validated with TypeScript schema</p>
          <div className="text-indigo-300">
            console.log('[TREMOR] 18 nodes, 28 edges, 20 commits, 5 incidents, 16 tests')
          </div>
        </div>

        <div className="flex items-center justify-center gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-slate-400" /> Typed Dataset Schema
          </span>
          <span>•</span>
          <span>Zero Auth</span>
          <span>•</span>
          <span>MIT License</span>
        </div>
      </div>
    </div>
  );
}
