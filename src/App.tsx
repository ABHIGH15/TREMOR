import { useState, useCallback, useEffect } from 'react';
import rawDataset from './data/dataset.json';
import { SystemDataset, SystemNode, LayerType } from './types/dataset';
import { Navbar } from './components/Navbar';
import { GraphCanvas } from './components/GraphCanvas';
import { GraphLegend } from './components/GraphLegend';
import { NodeDetailPanel } from './components/NodeDetailPanel';
import { AgentDrawer } from './components/AgentDrawer';

const dataset = rawDataset as SystemDataset;

export default function App() {
  const [selectedNode, setSelectedNode] = useState<SystemNode | null>(null);
  const [selectedLayer, setSelectedLayer] = useState<LayerType | 'all'>('all');
  const [resetTrigger, setResetTrigger] = useState(0);

  // Hero node selection helper
  const handleSelectHeroNode = useCallback(() => {
    const hero = dataset.nodes.find(n => n.id === 'auth-service') || null;
    setSelectedLayer('all');
    setSelectedNode(hero);
  }, []);

  const handleResetView = useCallback(() => {
    setResetTrigger(prev => prev + 1);
  }, []);

  useEffect(() => {
    console.log('🚀 [TREMOR Cockpit] Graph visualization initialized with', {
      nodes: dataset.nodes.length,
      edges: dataset.edges.length,
      heroNode: 'auth-service',
    });
  }, []);

  return (
    <div className="h-screen w-screen flex flex-col bg-[#070a12] text-slate-100 overflow-hidden select-none font-sans">
      {/* Top Navigation */}
      <Navbar
        dataset={dataset}
        selectedLayer={selectedLayer}
        onSelectLayer={setSelectedLayer}
        onResetView={handleResetView}
        onSelectHeroNode={handleSelectHeroNode}
      />

      {/* Main Workspace: Graph Canvas + Right Sidebar */}
      <div className="flex-1 flex flex-col lg:flex-row relative overflow-hidden">
        {/* Central Graph Visualization Canvas */}
        <main className="flex-1 relative h-full w-full overflow-hidden">
          <GraphCanvas
            dataset={dataset}
            selectedNode={selectedNode}
            selectedLayer={selectedLayer}
            onSelectNode={setSelectedNode}
            resetTrigger={resetTrigger}
          />
          {/* Floating Graph Legend */}
          <GraphLegend />
        </main>

        {/* Right Sidebar: Selected Node Detail Panel */}
        <NodeDetailPanel
          node={selectedNode}
          dataset={dataset}
          onSelectNode={setSelectedNode}
          onSelectHeroNode={handleSelectHeroNode}
        />
      </div>

      {/* Bottom Drawer: WebMCP Agent Activity & Trust Layer */}
      <AgentDrawer />
    </div>
  );
}
