import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { Radio, Plus, Minus, Maximize2, Crosshair } from 'lucide-react';
import { SystemDataset, SystemNode, LayerType, SimulationResult } from '../types/dataset';
import { getRiskColor, getNodeDependencies, getRiskLabel } from '../utils/graphHelpers';

interface GraphCanvasProps {
  dataset: SystemDataset;
  selectedNode: SystemNode | null;
  onSelectNode: (node: SystemNode | null) => void;
  activeLayer: LayerType | 'all';
  impactedNodeIds?: string[];
  simulation?: SimulationResult | null;
  onSelectHeroNode?: () => void;
}

export const GraphCanvas: React.FC<GraphCanvasProps> = ({
  dataset,
  selectedNode,
  onSelectNode,
  activeLayer,
  impactedNodeIds = [],
  simulation = null,
  onSelectHeroNode,
}) => {
  const fgRef = useRef<any>(null);
  const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [hoveredNode, setHoveredNode] = useState<SystemNode | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // Resize handler
  useEffect(() => {
    const handleResize = () => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Filter nodes & edges by active layer
  const graphData = useMemo(() => {
    let filteredNodes = dataset.nodes;
    if (activeLayer !== 'all') {
      filteredNodes = dataset.nodes.filter(n => n.layer === activeLayer);
    }
    const nodeIds = new Set(filteredNodes.map(n => n.id));
    const filteredEdges = dataset.edges.filter(
      e => {
        const src = typeof e.source === 'object' ? (e.source as any).id : e.source;
        const tgt = typeof e.target === 'object' ? (e.target as any).id : e.target;
        return nodeIds.has(src) && nodeIds.has(tgt);
      }
    );

    return {
      nodes: filteredNodes.map(n => ({ ...n })),
      links: filteredEdges.map(e => ({ ...e })),
    };
  }, [dataset, activeLayer]);

  // Selected node dependencies for local dimming
  const localDependencies = useMemo(() => {
    if (!selectedNode) return null;
    return getNodeDependencies(selectedNode.id, dataset);
  }, [selectedNode, dataset]);

  // Handle center zoom on node selection or simulation
  useEffect(() => {
    if (simulation && simulation.touched_modules.length > 0 && fgRef.current) {
      const firstTouched = dataset.nodes.find(n => n.id === simulation.touched_modules[0]);
      if (firstTouched && (firstTouched as any).x !== undefined) {
        fgRef.current.centerAt((firstTouched as any).x, (firstTouched as any).y, 800);
        fgRef.current.zoom(1.8, 800);
      }
    } else if (selectedNode && fgRef.current) {
      const nodeObj = graphData.nodes.find(n => n.id === selectedNode.id);
      if (nodeObj && (nodeObj as any).x !== undefined) {
        fgRef.current.centerAt((nodeObj as any).x, (nodeObj as any).y, 600);
        fgRef.current.zoom(1.8, 600);
      }
    }
  }, [selectedNode, simulation, graphData.nodes, dataset.nodes]);

  // Set timeout to clear loading skeleton and auto-fit graph
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitializing(false);
      if (fgRef.current) {
        fgRef.current.zoomToFit(600, 80);
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [dataset.nodes.length]);

  // Zoom controls
  const handleZoomIn = () => {
    if (fgRef.current) fgRef.current.zoom(fgRef.current.zoom() * 1.3, 400);
  };

  const handleZoomOut = () => {
    if (fgRef.current) fgRef.current.zoom(fgRef.current.zoom() / 1.3, 400);
  };

  const handleFitView = () => {
    if (fgRef.current) {
      fgRef.current.zoomToFit(400, 60);
    }
  };

  // Custom node canvas renderer
  const drawNode = useCallback(
    (node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
      const isSelected = selectedNode?.id === node.id;
      const isHovered = hoveredNode?.id === node.id;
      const isHero = node.id === 'auth-service';

      // Simulation checks
      const isSimulationActive = !!simulation;
      const isDirectlyTouched = simulation?.touched_modules.includes(node.id) ?? false;
      const isDownstreamImpacted = simulation?.downstream_impacted_modules.includes(node.id) ?? false;

      // WebMCP tool impact checks
      const isToolImpacted = impactedNodeIds.includes(node.id);

      // Connected in selection mode
      const isConnected =
        !localDependencies ||
        node.id === selectedNode?.id ||
        localDependencies.upstream.includes(node.id) ||
        localDependencies.downstream.includes(node.id);

      // Determine opacity
      let opacity = 1.0;
      if (isSimulationActive) {
        opacity = isDirectlyTouched || isDownstreamImpacted ? 1.0 : 0.15;
      } else if (impactedNodeIds.length > 0) {
        opacity = isToolImpacted ? 1.0 : 0.2;
      } else if (selectedNode && !isConnected) {
        opacity = 0.25;
      }

      ctx.save();
      ctx.globalAlpha = opacity;

      const baseRadius = 6 + (node.risk_score || 0.5) * 6; // 6 to 12 radius
      const riskColor = getRiskColor(node.risk_score);

      // 1. Draw Simulation / Hero Pulses
      if (isDirectlyTouched) {
        // Glowing electric amber halo for touched modules
        ctx.beginPath();
        ctx.arc(node.x, node.y, baseRadius + 8, 0, 2 * Math.PI, false);
        ctx.fillStyle = 'rgba(245, 158, 11, 0.25)';
        ctx.fill();
        ctx.lineWidth = 2 / globalScale;
        ctx.strokeStyle = '#f59e0b';
        ctx.setLineDash([4, 2]);
        ctx.stroke();
        ctx.setLineDash([]);
      } else if (isDownstreamImpacted) {
        // Red alert ring for downstream ripple nodes
        ctx.beginPath();
        ctx.arc(node.x, node.y, baseRadius + 6, 0, 2 * Math.PI, false);
        ctx.fillStyle = 'rgba(239, 68, 68, 0.2)';
        ctx.fill();
        ctx.lineWidth = 2 / globalScale;
        ctx.strokeStyle = '#ef4444';
        ctx.stroke();
      } else if (isHero) {
        // Hero pulse halo
        ctx.beginPath();
        ctx.arc(node.x, node.y, baseRadius + 4, 0, 2 * Math.PI, false);
        ctx.fillStyle = 'rgba(239, 68, 68, 0.15)';
        ctx.fill();
        ctx.lineWidth = 1.5 / globalScale;
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.6)';
        ctx.stroke();
      }

      // 2. Incident indicator ring
      const hasIncidents = dataset.incidents.some(i => i.module === node.id);
      if (hasIncidents && !isDirectlyTouched && !isDownstreamImpacted) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, baseRadius + 3, 0, 2 * Math.PI, false);
        ctx.strokeStyle = '#f87171';
        ctx.lineWidth = 1.5 / globalScale;
        ctx.setLineDash([3, 2]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // 3. Selection / Hover Outer Glow Ring
      if (isSelected || isHovered) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, baseRadius + 4, 0, 2 * Math.PI, false);
        ctx.strokeStyle = isSelected ? '#38bdf8' : '#94a3b8';
        ctx.lineWidth = 2.5 / globalScale;
        ctx.stroke();
      }

      // 4. Main Node Body
      ctx.beginPath();
      ctx.arc(node.x, node.y, baseRadius, 0, 2 * Math.PI, false);
      ctx.fillStyle = isDirectlyTouched ? '#f59e0b' : riskColor;
      ctx.fill();
      ctx.lineWidth = 1.5 / globalScale;
      ctx.strokeStyle = isDirectlyTouched ? '#ffffff' : '#0f172a';
      ctx.stroke();

      // 5. Node Text Label
      const fontSize = Math.max(10 / globalScale, 3);
      ctx.font = `${isDirectlyTouched || isSelected ? 'bold ' : ''}${fontSize}px Inter, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';

      // Label background pill
      const label = node.label || node.id;
      const textWidth = ctx.measureText(label).width;
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.fillRect(
        node.x - textWidth / 2 - 2 / globalScale,
        node.y + baseRadius + 3 / globalScale,
        textWidth + 4 / globalScale,
        fontSize + 3 / globalScale
      );

      ctx.fillStyle = isDirectlyTouched ? '#fef08a' : isSelected ? '#38bdf8' : '#f1f5f9';
      ctx.fillText(label, node.x, node.y + baseRadius + 4 / globalScale);

      // Simulation Direct Badge
      if (isDirectlyTouched) {
        const badgeFont = Math.max(8 / globalScale, 2.5);
        ctx.font = `bold ${badgeFont}px Inter, sans-serif`;
        ctx.fillStyle = '#f59e0b';
        ctx.fillText('⚡ MODIFIED', node.x, node.y - baseRadius - 10 / globalScale);
      }

      ctx.restore();
    },
    [selectedNode, hoveredNode, localDependencies, dataset.incidents, impactedNodeIds, simulation]
  );

  // Custom link renderer with directional arrows and particle speeds
  const linkColor = useCallback(
    (link: any) => {
      const isSimulationActive = !!simulation;
      const srcId = typeof link.source === 'object' ? link.source.id : link.source;
      const tgtId = typeof link.target === 'object' ? link.target.id : link.target;

      if (isSimulationActive) {
        const isTouchedEdge =
          simulation.touched_modules.includes(srcId) ||
          simulation.touched_modules.includes(tgtId) ||
          (simulation.all_affected_node_ids.includes(srcId) && simulation.all_affected_node_ids.includes(tgtId));

        return isTouchedEdge ? '#f59e0b' : 'rgba(51, 65, 85, 0.15)';
      }

      if (impactedNodeIds.length > 0) {
        const isImpactedEdge = impactedNodeIds.includes(srcId) && impactedNodeIds.includes(tgtId);
        return isImpactedEdge ? '#ef4444' : 'rgba(51, 65, 85, 0.15)';
      }

      if (selectedNode) {
        const isSelectedLink =
          srcId === selectedNode.id || tgtId === selectedNode.id;
        return isSelectedLink ? '#38bdf8' : 'rgba(51, 65, 85, 0.25)';
      }

      return 'rgba(71, 85, 105, 0.45)';
    },
    [selectedNode, impactedNodeIds, simulation]
  );

  const linkWidth = useCallback(
    (link: any) => {
      const srcId = typeof link.source === 'object' ? link.source.id : link.source;
      const tgtId = typeof link.target === 'object' ? link.target.id : link.target;

      if (simulation) {
        const isTouchedEdge =
          simulation.all_affected_node_ids.includes(srcId) &&
          simulation.all_affected_node_ids.includes(tgtId);
        return isTouchedEdge ? 2.5 : 0.5;
      }

      if (impactedNodeIds.length > 0) {
        const isImpactedEdge = impactedNodeIds.includes(srcId) && impactedNodeIds.includes(tgtId);
        return isImpactedEdge ? 2.5 : 0.5;
      }

      if (selectedNode) {
        return srcId === selectedNode.id || tgtId === selectedNode.id ? 2.0 : 0.6;
      }
      return 1.0;
    },
    [selectedNode, impactedNodeIds, simulation]
  );

  return (
    <div className="relative w-full h-full bg-[#070a12] overflow-hidden select-none">
      {/* Background Cyber Grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Loading Skeleton */}
      {isInitializing && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-slate-950/90 backdrop-blur-sm">
          <div className="relative flex items-center justify-center">
            <div className="w-16 h-16 rounded-full border-2 border-cyan-500/20 border-t-cyan-500 animate-spin" />
            <Radio className="absolute w-6 h-6 text-cyan-400 animate-pulse" />
          </div>
          <p className="mt-4 text-xs font-mono tracking-wider text-cyan-300 uppercase">
            Simulating System Topology Physics...
          </p>
        </div>
      )}

      {/* Floating Hover Tooltip Card */}
      {hoveredNode && !selectedNode && (
        <div className="absolute top-4 left-4 z-20 pointer-events-none p-3 rounded-xl bg-slate-900/95 border border-slate-700 shadow-2xl backdrop-blur-md space-y-1.5 animate-fadeIn max-w-xs">
          <div className="flex items-center justify-between gap-2">
            <span className="font-bold text-white text-xs truncate">{hoveredNode.label}</span>
            <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase border ${getRiskLabel(hoveredNode.risk_score).bg} ${getRiskLabel(hoveredNode.risk_score).text} ${getRiskLabel(hoveredNode.risk_score).border}`}>
              {Math.round(hoveredNode.risk_score * 100)}% Risk
            </span>
          </div>
          <div className="font-mono text-[10px] text-slate-400 flex items-center gap-1">
            <span>ID: {hoveredNode.id}</span>
            <span>•</span>
            <span className="capitalize">{hoveredNode.layer}</span>
          </div>
          {hoveredNode.description && (
            <p className="text-[11px] text-slate-300 line-clamp-2">{hoveredNode.description}</p>
          )}
        </div>
      )}

      {/* Floating Canvas Controls Overlay */}
      <div role="toolbar" aria-label="Graph Canvas Controls" className="absolute bottom-4 left-4 z-20 flex items-center gap-1.5 p-1 rounded-xl bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-md text-xs">
        <button
          onClick={handleZoomIn}
          aria-label="Zoom In Graph"
          className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
          title="Zoom In"
        >
          <Plus className="w-4 h-4" />
        </button>
        <button
          onClick={handleZoomOut}
          aria-label="Zoom Out Graph"
          className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
          title="Zoom Out"
        >
          <Minus className="w-4 h-4" />
        </button>
        <div className="w-px h-4 bg-slate-700 mx-0.5" />
        <button
          onClick={handleFitView}
          aria-label="Fit Graph to Screen"
          className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
          title="Fit Graph to Screen"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
        {onSelectHeroNode && (
          <button
            onClick={onSelectHeroNode}
            aria-label="Center Camera on Hero Node auth-service"
            className="p-1.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-950/40 transition-all cursor-pointer flex items-center gap-1"
            title="Center on Hero Node (auth-service)"
          >
            <Crosshair className="w-3.5 h-3.5" />
            <span className="font-mono text-[10px] hidden sm:inline">Hero</span>
          </button>
        )}
      </div>

      {/* Force Graph */}
      <ForceGraph2D
        ref={fgRef}
        width={dimensions.width}
        height={dimensions.height}
        graphData={graphData}
        nodeCanvasObject={drawNode}
        nodePointerAreaPaint={(node: any, color, ctx) => {
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(node.x, node.y, 14, 0, 2 * Math.PI, false);
          ctx.fill();
        }}
        linkColor={linkColor}
        linkWidth={linkWidth}
        linkDirectionalParticles={simulation ? 4 : impactedNodeIds.length > 0 ? 3 : 2}
        linkDirectionalParticleSpeed={simulation ? 0.015 : impactedNodeIds.length > 0 ? 0.01 : 0.005}
        linkDirectionalParticleWidth={simulation ? 2.5 : 1.8}
        linkDirectionalParticleColor={linkColor}
        linkDirectionalArrowLength={3.5}
        linkDirectionalArrowRelPos={1}
        onNodeClick={(node: any) => {
          const raw = dataset.nodes.find(n => n.id === node.id);
          if (raw) onSelectNode(raw);
        }}
        onNodeHover={(node: any) => {
          if (node) {
            const raw = dataset.nodes.find(n => n.id === node.id);
            setHoveredNode(raw || null);
          } else {
            setHoveredNode(null);
          }
        }}
        onBackgroundClick={() => onSelectNode(null)}
        cooldownTicks={100}
        d3AlphaDecay={0.02}
        d3VelocityDecay={0.3}
      />
    </div>
  );
};
