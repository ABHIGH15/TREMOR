import { useState, useCallback, useEffect } from 'react';
import rawDataset from './data/dataset.json';
import { SystemDataset, SystemNode, LayerType } from './types/dataset';
import { Navbar } from './components/Navbar';
import { GraphCanvas } from './components/GraphCanvas';
import { GraphLegend } from './components/GraphLegend';
import { NodeDetailPanel } from './components/NodeDetailPanel';
import { AgentDrawer } from './components/AgentDrawer';
import { registerCoreReadTools } from './webmcp/tools';

const dataset = rawDataset as SystemDataset;

export default function App() {
  const [selectedNode, setSelectedNode] = useState<SystemNode | null>(null);
  const [selectedLayer, setSelectedLayer] = useState<LayerType | 'all'>('all');
  const [resetTrigger, setResetTrigger] = useState(0);
  const [impactedNodeIds, setImpactedNodeIds] = useState<string[]>([]);

  // Hero node selection helper
  const handleSelectHeroNode = useCallback(() => {
    const hero = dataset.nodes.find(n => n.id === 'auth-service') || null;
    setSelectedLayer('all');
    setSelectedNode(hero);
    setImpactedNodeIds([]);
  }, []);

  const handleResetView = useCallback(() => {
    setResetTrigger(prev => prev + 1);
    setImpactedNodeIds([]);
  }, []);

  const handleClearHighlights = useCallback(() => {
    setImpactedNodeIds([]);
  }, []);

  // Register WebMCP Core Tools on mount
  useEffect(() => {
    registerCoreReadTools(dataset, {
      onHighlightImpactZone: (nodeIds, targetNode) => {
        setImpactedNodeIds(nodeIds);
        setSelectedNode(targetNode);
      },
      onSelectNode: node => {
        setSelectedNode(node);
      },
    });

    console.log('🚀 [TREMOR Cockpit] WebMCP runtime & Core Read Tools initialized');
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
            impactedNodeIds={impactedNodeIds}
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
      <AgentDrawer onClearHighlights={handleClearHighlights} />
    </div>
  );
}
