import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { Radio } from 'lucide-react';
import { SystemDataset, SystemNode, LayerType } from '../types/dataset';
import { getRiskColor, getNodeDependencies } from '../utils/graphHelpers';

interface GraphCanvasProps {
  dataset: SystemDataset;
  selectedNode: SystemNode | null;
  selectedLayer: LayerType | 'all';
  onSelectNode: (node: SystemNode | null) => void;
  resetTrigger: number;
  impactedNodeIds?: string[];
}

export const GraphCanvas: React.FC<GraphCanvasProps> = ({
  dataset,
  selectedNode,
  selectedLayer,
  onSelectNode,
  resetTrigger,
  impactedNodeIds = [],
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const fgRef = useRef<any>(undefined);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [hoverNode, setHoverNode] = useState<SystemNode | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // Resize observer to maintain fluid canvas
  useEffect(() => {
    if (!containerRef.current) return;
    const updateDims = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };
    updateDims();
    const observer = new ResizeObserver(updateDims);
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Filter nodes & edges by layer if selected
  const graphData = useMemo(() => {
    let nodes = dataset.nodes;
    if (selectedLayer !== 'all') {
      nodes = nodes.filter(n => n.layer === selectedLayer);
    }
    const nodeIds = new Set(nodes.map(n => n.id));
    const links = dataset.edges.filter(
      e =>
        nodeIds.has(typeof e.source === 'object' ? (e.source as any).id : e.source) &&
        nodeIds.has(typeof e.target === 'object' ? (e.target as any).id : e.target)
    );

    return {
      nodes: nodes.map(n => ({ ...n })),
      links: links.map(l => ({ ...l })),
    };
  }, [dataset, selectedLayer]);

  // Set of incident module IDs
  const incidentModules = useMemo(() => {
    return new Set(dataset.incidents.map(i => i.module));
  }, [dataset.incidents]);

  const impactedSet = useMemo(() => new Set(impactedNodeIds), [impactedNodeIds]);

  // Connected node IDs if a node is selected or hovered
  const highlightNodeIds = useMemo(() => {
    if (impactedSet.size > 0) return impactedSet;
    const active = selectedNode || hoverNode;
    if (!active) return new Set<string>();
    const deps = getNodeDependencies(active.id, dataset);
    return new Set([active.id, ...deps.downstream.map(n => n.id), ...deps.upstream.map(n => n.id)]);
  }, [selectedNode, hoverNode, dataset, impactedSet]);

  // Handle simulation initialization / loading state
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitializing(false);
      fgRef.current?.zoomToFit(400, 60);
    }, 450);
    return () => clearTimeout(timer);
  }, []);

  // Reset view on trigger or layer change
  useEffect(() => {
    if (fgRef.current) {
      setTimeout(() => {
        fgRef.current?.zoomToFit(400, 60);
      }, 300);
    }
  }, [resetTrigger, selectedLayer]);

  // Node drawing callback
  const paintNode = useCallback(
    (node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
      const isSelected = selectedNode?.id === node.id;
      const isHovered = hoverNode?.id === node.id;
      const isImpacted = impactedSet.has(node.id);
      const isHighlighted = highlightNodeIds.has(node.id);
      const hasIncident = incidentModules.has(node.id);
      const isHero = node.id === 'auth-service';

      const riskColor = getRiskColor(node.risk_score);
      const radius = isSelected || isHero || isImpacted ? 9 : 7;

      // Dim non-highlighted nodes when a selection or impact is active
      const isDimmed = (selectedNode || hoverNode || impactedSet.size > 0) && !isHighlighted;
      ctx.save();
      ctx.globalAlpha = isDimmed ? 0.22 : 1.0;

      // Outer Selection / WebMCP Impact Zone Pulse Glow
      if (isSelected || isImpacted || isHero || isHovered) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius + (isSelected || isImpacted ? 7 : 4), 0, 2 * Math.PI, false);
        ctx.fillStyle = isImpacted
          ? 'rgba(239, 68, 68, 0.4)'
          : isSelected
          ? 'rgba(99, 102, 241, 0.35)'
          : 'rgba(239, 68, 68, 0.25)';
        ctx.fill();
        ctx.strokeStyle = isImpacted ? '#ef4444' : isSelected ? '#818cf8' : '#ef4444';
        ctx.lineWidth = 2 / globalScale;
        ctx.stroke();
      }

      // Active Incident Ring
      if (hasIncident) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius + 2.5, 0, 2 * Math.PI, false);
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 1.8 / globalScale;
        ctx.setLineDash([2, 2]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Main Node Circle
      ctx.beginPath();
      ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI, false);
      ctx.fillStyle = isImpacted ? '#ef4444' : riskColor;
      ctx.fill();
      ctx.strokeStyle = isSelected || isImpacted ? '#ffffff' : '#0f172a';
      ctx.lineWidth = 1.5 / globalScale;
      ctx.stroke();

      // Node Label (rendered when scaled or highlighted)
      if (globalScale > 0.75 || isSelected || isHero || isHighlighted || isImpacted) {
        const fontSize = Math.max(10 / globalScale, 3);
        ctx.font = `600 ${fontSize}px "Plus Jakarta Sans", sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';

        // Text background pill for maximum legibility
        const text = node.label;
        const textWidth = ctx.measureText(text).width;
        const bgPadding = 2 / globalScale;
        const textY = node.y + radius + 3 / globalScale;

        ctx.fillStyle = isImpacted ? 'rgba(153, 27, 27, 0.9)' : 'rgba(11, 15, 25, 0.85)';
        ctx.fillRect(
          node.x - textWidth / 2 - bgPadding,
          textY - 1 / globalScale,
          textWidth + bgPadding * 2,
          fontSize + bgPadding * 2
        );

        ctx.fillStyle = isSelected || isImpacted ? '#ffffff' : '#e2e8f0';
        ctx.fillText(text, node.x, textY);

        // Layer sub-badge
        if (globalScale > 1.2 || isSelected || isImpacted) {
          const subFontSize = Math.max(8 / globalScale, 2.5);
          ctx.font = `500 ${subFontSize}px "JetBrains Mono", monospace`;
          ctx.fillStyle = isImpacted ? '#fca5a5' : '#94a3b8';
          ctx.fillText(`[${node.layer}]`, node.x, textY + fontSize + 2 / globalScale);
        }
      }

      ctx.restore();
    },
    [selectedNode, hoverNode, highlightNodeIds, incidentModules, impactedSet]
  );

  return (
    <div ref={containerRef} className="relative w-full h-full bg-[#070a12] overflow-hidden">
      {/* Loading Skeleton & Physics Initializing State */}
      {isInitializing && (
        <div className="absolute inset-0 z-30 bg-[#070a12]/95 backdrop-blur-md flex flex-col items-center justify-center gap-3 select-none">
          <div className="relative flex items-center justify-center">
            <div className="w-14 h-14 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin"></div>
            <Radio className="w-6 h-6 text-indigo-400 absolute animate-pulse" />
          </div>
          <div className="text-center space-y-1">
            <div className="text-xs font-bold text-slate-200 uppercase tracking-widest font-mono">
              Simulating System Topology Physics
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              Layouting 18 architecture nodes & 28 dependency links...
            </div>
          </div>
        </div>
      )}

      <ForceGraph2D
        ref={fgRef}
        width={dimensions.width}
        height={dimensions.height}
        graphData={graphData}
        nodeLabel={(node: any) => `
          <div style="background:#0f172a; color:#f8fafc; padding:8px 12px; border-radius:8px; font-family:sans-serif; font-size:12px; border:1px solid #334155; box-shadow:0 10px 15px -3px rgba(0,0,0,0.5);">
            <div style="font-weight:700; color:#fff;">${node.label}</div>
            <div style="color:#94a3b8; font-size:11px; font-family:monospace;">${node.id}</div>
            <div style="margin-top:4px; font-size:11px;">
              <span style="color:${getRiskColor(node.risk_score)}; font-weight:bold;">Risk Score: ${node.risk_score}</span>
              &nbsp;•&nbsp;
              <span style="text-transform:uppercase; color:#818cf8;">${node.layer}</span>
            </div>
            ${incidentModules.has(node.id) ? '<div style="margin-top:4px; color:#f59e0b; font-weight:600; font-size:10px;">⚠️ Active Incident History</div>' : ''}
          </div>
        `}
        nodeCanvasObject={paintNode}
        nodePointerAreaPaint={(node: any, color, ctx) => {
          ctx.beginPath();
          ctx.arc(node.x, node.y, 14, 0, 2 * Math.PI, false);
          ctx.fillStyle = color;
          ctx.fill();
        }}
        linkColor={(link: any) => {
          const srcId = typeof link.source === 'object' ? link.source.id : link.source;
          const tgtId = typeof link.target === 'object' ? link.target.id : link.target;
          if (impactedSet.has(srcId) && impactedSet.has(tgtId)) {
            return 'rgba(239, 68, 68, 0.85)'; // Highlighted Red Impact link
          }
          if (selectedNode) {
            if (srcId === selectedNode.id || tgtId === selectedNode.id) {
              return '#818cf8'; // Highlighted Indigo
            }
            return 'rgba(51, 65, 85, 0.15)'; // Dimmed
          }
          if (link.critical) return 'rgba(239, 68, 68, 0.45)';
          return 'rgba(71, 85, 105, 0.4)';
        }}
        linkWidth={(link: any) => {
          const srcId = typeof link.source === 'object' ? link.source.id : link.source;
          const tgtId = typeof link.target === 'object' ? link.target.id : link.target;
          if (impactedSet.has(srcId) && impactedSet.has(tgtId)) {
            return 3;
          }
          if (selectedNode && (srcId === selectedNode.id || tgtId === selectedNode.id)) {
            return 2.5;
          }
          return link.critical ? 1.8 : 1.2;
        }}
        linkDirectionalArrowLength={4}
        linkDirectionalArrowRelPos={0.9}
        linkDirectionalParticles={(link: any) => {
          const srcId = typeof link.source === 'object' ? link.source.id : link.source;
          const tgtId = typeof link.target === 'object' ? link.target.id : link.target;
          if (impactedSet.has(srcId) && impactedSet.has(tgtId)) {
            return 4;
          }
          if (selectedNode && (srcId === selectedNode.id || tgtId === selectedNode.id)) {
            return 3;
          }
          return link.critical ? 1 : 0;
        }}
        linkDirectionalParticleSpeed={0.007}
        linkDirectionalParticleWidth={2.5}
        onNodeClick={(node: any) => {
          onSelectNode(node as SystemNode);
        }}
        onNodeHover={(node: any) => {
          setHoverNode(node ? (node as SystemNode) : null);
        }}
        onBackgroundClick={() => {
          onSelectNode(null);
        }}
        cooldownTicks={120}
        d3AlphaDecay={0.02}
        d3VelocityDecay={0.3}
      />
    </div>
  );
};
