import { useState, useCallback, useEffect } from 'react';
import rawDataset from './data/dataset.json';
import { SystemDataset, SystemNode, LayerType, SimulationResult } from './types/dataset';
import { Navbar } from './components/Navbar';
import { GraphCanvas } from './components/GraphCanvas';
import { GraphLegend } from './components/GraphLegend';
import { NodeDetailPanel } from './components/NodeDetailPanel';
import { AgentDrawer } from './components/AgentDrawer';
import { SimulationBanner } from './components/SimulationBanner';
import { AboutModal } from './components/AboutModal';
import { registerCoreTools } from './webmcp/tools';
import { webMCPRegistry } from './webmcp/runtime';

const dataset = rawDataset as SystemDataset;

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

  // Counterfactual Replay Listener: triggered on human sign-off
  useEffect(() => {
    return webMCPRegistry.onFlagConfirmed((flag) => {
      const inc = dataset.incidents.find(i => i.module === flag.module) || dataset.incidents[0];
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
  }, []);

  // Hero node selection helper
  const handleSelectHeroNode = useCallback(() => {
    const hero = dataset.nodes.find(n => n.id === 'auth-service') || null;
    setSelectedLayer('all');
    setSelectedNode(hero);
    setImpactedNodeIds([]);
    setSimulation(null);
  }, []);

  const handleResetView = useCallback(() => {
    setImpactedNodeIds([]);
    setSimulation(null);
    setSelectedNode(null);
  }, []);

  const handleClearHighlights = useCallback(() => {
    setImpactedNodeIds([]);
    setSimulation(null);
  }, []);

  // Register WebMCP Core Tools on mount
  useEffect(() => {
    registerCoreTools(dataset, {
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

    console.log('🚀 [TREMOR Cockpit] WebMCP runtime & Core Tools initialized');
  }, []);

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
        // Execute Centerpiece simulation
        webMCPRegistry.executeTool('simulate_change_impact', {
          description: 'Refactor JWT claims validation and sliding session cache timeout in Redis cluster',
          touched_modules: ['auth-service', 'redis-session-cluster'],
        });
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
  }, [handleSelectHeroNode, handleResetView, handleClearHighlights]);

  return (
    <div className="h-screen w-screen flex flex-col bg-[#070a12] text-slate-100 overflow-hidden select-none font-sans">
      {/* Top Navigation */}
      <Navbar
        dataset={dataset}
        selectedLayer={selectedLayer}
        onSelectLayer={setSelectedLayer}
        onResetView={handleResetView}
        onSelectHeroNode={handleSelectHeroNode}
        onOpenAboutModal={() => setIsAboutModalOpen(true)}
      />

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
            dataset={dataset}
            selectedNode={selectedNode}
            activeLayer={selectedLayer}
            onSelectNode={setSelectedNode}
            impactedNodeIds={impactedNodeIds}
            simulation={simulation}
            onSelectHeroNode={handleSelectHeroNode}
          />
          {/* Floating Graph Legend */}
          <GraphLegend />
        </main>

        {/* Right Sidebar: Selected Node Detail Panel & Simulation Breakdown */}
        <NodeDetailPanel
          node={selectedNode}
          dataset={dataset}
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
