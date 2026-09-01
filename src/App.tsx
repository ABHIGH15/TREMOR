import { ShieldAlert, Cpu, Sparkles, Terminal } from 'lucide-react';

export default function App() {
  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col items-center justify-center p-6">
      <div className="max-w-2xl w-full text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          WebMCP Challenge 2026
        </div>
        
        <div className="flex items-center justify-center gap-3">
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-2xl">
            <ShieldAlert className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            BLAST RADIUS
          </h1>
        </div>

        <p className="text-lg text-slate-400 font-medium">
          See what your AI agent is about to break — <span className="text-slate-200">before it does.</span>
        </p>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-left font-mono text-xs text-slate-300 space-y-2">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-slate-400 font-sans font-semibold">
            <span className="flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-indigo-400" /> System Cockpit Skeleton
            </span>
            <span className="text-emerald-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              ROUND 0 READY
            </span>
          </div>
          <p className="text-slate-400">// Next step: Load dependency graph and WebMCP tool runtime</p>
          <div className="text-indigo-300">
            document.modelContext.registerTool({'{'} name: 'get_blast_radius', ... {'}'})
          </div>
        </div>

        <div className="flex items-center justify-center gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-slate-400" /> React 18 + TS + Tailwind
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
