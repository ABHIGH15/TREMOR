import { useState, useCallback, useEffect } from 'react';
import rawDataset from './data/dataset.json';
import { SystemDataset, SystemNode, LayerType, SimulationResult } from './types/dataset';
import { fetchLiveRepoDataset, IngestionResult } from './services/githubIngestion';
import { Navbar } from './components/Navbar';
import { GraphCanvas } from './components/GraphCanvas';
import { GraphLegend } from './components/GraphLegend';
import { NodeDetailPanel } from './components/NodeDetailPanel';
import { AgentDrawer } from './components/AgentDrawer';
import { SimulationBanner } from './components/SimulationBanner';
import { AboutModal } from './components/AboutModal';
import { registerCoreTools } from './webmcp/tools';
import { webMCPRegistry } from './webmcp/runtime';

export default function App() {
  const [selectedNode, setSelectedNode] = useState<SystemNode | null>(null);
  const [selectedLayer, setSelectedLayer] = useState<LayerType | 'all'>('all');
  const [impactedNodeIds, setImpactedNodeIds] = useState<string[]>([]);
  const [simulation, setSimulation] = useState<SimulationResult | null>(null);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [counterfactualReplay, setCounterfactualReplay] = useState<{
    incidentId: string;
    description: string;
    nodes: string[];
  } | null>(null);

  // Live Repo Ingestion State
  const [mode, setMode] = useState<'demo' | 'live_repo'>('demo');
  const [currentRepo, setCurrentRepo] = useState<string>('ABHIGH15/TREMOR');
  const [isLoadingRepo, setIsLoadingRepo] = useState<boolean>(false);
  const [liveIngestionResult, setLiveIngestionResult] = useState<IngestionResult | null>(null);

  // Dynamic Active Dataset based on mode
  const activeDataset: SystemDataset =
    mode === 'demo'
      ? (rawDataset as SystemDataset)
      : (liveIngestionResult?.dataset || (rawDataset as SystemDataset));

  // Handler to load a live GitHub repository
  const handleLoadRepo = useCallback(async (repo: string) => {
    setIsLoadingRepo(true);
    setCurrentRepo(repo);
    try {
      const res = await fetchLiveRepoDataset(repo);
      setLiveIngestionResult(res);
      setSelectedNode(null);
      setImpactedNodeIds([]);
      setSimulation(null);
    } finally {
      setIsLoadingRepo(false);
    }
  }, []);

  // Handler to toggle between Demo Scenario and Live Repo Mode
  const handleToggleMode = useCallback(async (newMode: 'demo' | 'live_repo') => {
    setMode(newMode);
    setSelectedNode(null);
    setImpactedNodeIds([]);
    setSimulation(null);
    setSelectedLayer('all');

    if (newMode === 'live_repo' && !liveIngestionResult) {
      await handleLoadRepo(currentRepo);
    }
  }, [liveIngestionResult, currentRepo, handleLoadRepo]);

  // Counterfactual Replay Listener: triggered on human sign-off
  useEffect(() => {
    return webMCPRegistry.onFlagConfirmed((flag) => {
      const inc = activeDataset.incidents.find(i => i.module === flag.module) || activeDataset.incidents[0];
      const avertedNodes = ['auth-service', 'redis-session-cluster', 'checkout-service', 'api-gateway'];

      setCounterfactualReplay({
        incidentId: inc?.id || 'i1',
        description: inc?.description || 'Redis cache stampede cascade averted by human confirmation',
        nodes: avertedNodes,
      });
      setImpactedNodeIds(avertedNodes);

      const timer = setTimeout(() => {
        setCounterfactualReplay(null);
        setImpactedNodeIds([]);
      }, 5000);
      return () => clearTimeout(timer);
    });
  }, [activeDataset]);

  // Hero / Central node selection helper
  const handleSelectHeroNode = useCallback(() => {
    const hero = mode === 'demo'
      ? (activeDataset.nodes.find(n => n.id === 'auth-service') || activeDataset.nodes[0] || null)
      : (activeDataset.nodes[0] || null);
    setSelectedLayer('all');
    setSelectedNode(hero);
    setImpactedNodeIds([]);
    setSimulation(null);
  }, [activeDataset, mode]);

  const handleResetView = useCallback(() => {
    setImpactedNodeIds([]);
    setSimulation(null);
    setSelectedNode(null);
  }, []);

  const handleClearHighlights = useCallback(() => {
    setImpactedNodeIds([]);
    setSimulation(null);
  }, []);

  // Register WebMCP Core Tools on mount and whenever active dataset changes
  useEffect(() => {
    registerCoreTools(activeDataset, {
      onHighlightImpactZone: (nodeIds, targetNode) => {
        setImpactedNodeIds(nodeIds);
        if (targetNode) setSelectedNode(targetNode);
      },
      onSelectNode: node => {
        setSelectedNode(node);
      },
      onSimulateChangeImpact: sim => {
        setSimulation(sim);
        setSelectedNode(null); // Open full simulation breakdown view
        setImpactedNodeIds(sim.all_affected_node_ids);
      },
    });

    console.log(`🚀 [TREMOR Cockpit] WebMCP runtime synced (Mode: ${mode}, Nodes: ${activeDataset.nodes.length}, Edges: ${activeDataset.edges.length})`);
  }, [activeDataset, mode]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid capturing shortcuts if user is typing in an input
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.key === 'h' || e.key === 'H') {
        e.preventDefault();
        handleSelectHeroNode();
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        handleResetView();
      } else if (e.key === 's' || e.key === 'S') {
        e.preventDefault();
        if (mode === 'demo') {
          webMCPRegistry.executeTool('simulate_change_impact', {
            description: 'Refactor JWT claims validation and sliding session cache timeout in Redis cluster',
            touched_modules: ['auth-service', 'redis-session-cluster'],
          });
        } else if (activeDataset.nodes.length > 0) {
          const topNode = activeDataset.nodes[0];
          webMCPRegistry.executeTool('simulate_change_impact', {
            description: `Simulate refactoring blast radius for central module ${topNode.id}`,
            touched_modules: [topNode.id],
          });
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setIsAboutModalOpen(false);
        handleClearHighlights();
      } else if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        e.preventDefault();
        setIsAboutModalOpen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSelectHeroNode, handleResetView, handleClearHighlights, mode, activeDataset]);

  return (
    <div className="h-screen w-screen flex flex-col bg-[#070a12] text-slate-100 overflow-hidden select-none font-sans">
      {/* Top Navigation */}
      <Navbar
        dataset={activeDataset}
        selectedLayer={selectedLayer}
        onSelectLayer={setSelectedLayer}
        onResetView={handleResetView}
        onSelectHeroNode={handleSelectHeroNode}
        onOpenAboutModal={() => setIsAboutModalOpen(true)}
        mode={mode}
        onToggleMode={handleToggleMode}
        currentRepo={currentRepo}
        onLoadRepo={handleLoadRepo}
        isLoadingRepo={isLoadingRepo}
      />

      {/* Live Ingestion Informative Status Banner */}
      {mode === 'live_repo' && (
        <div className="bg-cyan-950/90 border-b border-cyan-500/30 px-4 py-2 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-cyan-200 z-20 shrink-0 gap-1.5 shadow-md">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shrink-0" />
            <span>
              <strong>Live Ingestion Mode:</strong> Parsed real <code>import</code> dependency graph for <strong className="text-white">{currentRepo}</strong> ({liveIngestionResult?.parsedFilesCount || 15} central files of {liveIngestionResult?.totalSourceFiles || 17} source files).
            </span>
          </div>
          <span className="text-cyan-400 font-mono text-[11px] shrink-0">
            {liveIngestionResult?.statusMessage || 'Analyzing repository imports...'}
          </span>
        </div>
      )}

      {/* Main Workspace: Graph Canvas + Right Sidebar */}
      <div className="flex-1 flex flex-col lg:flex-row relative overflow-hidden">
        {/* Central Graph Visualization Canvas */}
        <main className="flex-1 relative h-full w-full overflow-hidden">
          {/* Floating Simulation Centerpiece Banner */}
          {simulation && (
            <SimulationBanner
              simulation={simulation}
              onClear={handleClearHighlights}
            />
          )}

          {/* Floating Counterfactual Replay Banner */}
          {counterfactualReplay && !simulation && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 bg-purple-950/90 border border-purple-500/60 rounded-xl px-5 py-2.5 shadow-2xl backdrop-blur-md flex items-center gap-3 text-sm animate-pulse max-w-xl text-center">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-ping shrink-0" />
              <div className="flex flex-col sm:flex-row items-baseline gap-1.5 text-left">
                <span className="text-purple-300 font-semibold tracking-wide uppercase text-xs shrink-0">
                  ⏪ Counterfactual Replay
                </span>
                <span className="text-purple-100 text-xs">
                  Simulating averted cascade: {counterfactualReplay.description.substring(0, 80)}...
                </span>
              </div>
            </div>
          )}

          <GraphCanvas
            dataset={activeDataset}
            selectedNode={selectedNode}
            activeLayer={selectedLayer}
            onSelectNode={setSelectedNode}
            impactedNodeIds={impactedNodeIds}
            simulation={simulation}
            onSelectHeroNode={handleSelectHeroNode}
          />
          {/* Floating Graph Legend */}
          <GraphLegend nodeCount={activeDataset.nodes.length} />
        </main>

        {/* Right Sidebar: Selected Node Detail Panel & Simulation Breakdown */}
        <NodeDetailPanel
          node={selectedNode}
          dataset={activeDataset}
          onSelectNode={setSelectedNode}
          onSelectHeroNode={handleSelectHeroNode}
          simulation={simulation}
          onClearSimulation={handleClearHighlights}
        />
      </div>

      {/* Bottom Drawer: WebMCP Agent Activity & Interactive Runner */}
      <AgentDrawer onClearHighlights={handleClearHighlights} />

      {/* About & Shortcuts Modal */}
      <AboutModal
        isOpen={isAboutModalOpen}
        onClose={() => setIsAboutModalOpen(false)}
      />
    </div>
  );
}
