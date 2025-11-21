"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Panel,
  type Node,
  type Edge,
  Position,
  MarkerType,
} from "reactflow";
import "reactflow/dist/style.css";
import dagre from "dagre";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Layers, Package } from "lucide-react";
import type { Item, RecyclingNode as RecyclingNodeType } from "@/lib/types";
import { useLocalizedText } from "~/lib/utils";
import { buildRecyclingChain } from "~/lib/utils/recycling-calculator";
import RecyclingNodeComponent from "~/app/recycling/RecyclingNode";

const nodeTypes = {
  recyclingNode: RecyclingNodeComponent,
};

interface RecyclingFlowChartProps {
  itemId: string;
  items: Item[];
  onNodeClick?: (item: Item) => void;
}

export default function RecyclingFlowChart({
  itemId,
  items,
  onNodeClick,
}: RecyclingFlowChartProps) {
  const [direction] = useState<"TB" | "LR">("TB");

  // Build recycling chain
  const recyclingChain = useMemo(
    () => buildRecyclingChain(itemId, items),
    [itemId, items]
  );

  const localizeText = useLocalizedText();

  // Transform recycling chain to React Flow nodes and edges
  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
    if (!recyclingChain) return { nodes: [], edges: [] };
    return transformRecyclingToFlow(recyclingChain, items, direction);
  }, [recyclingChain, items, direction]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Update nodes and edges when itemId changes
  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  // Handle node clicks
  const onNodeClickHandler = useCallback(
    (event: React.MouseEvent, node: Node) => {
      const item = items.find((i) => i.id === node.id);
      if (item && onNodeClick) {
        onNodeClick(item);
      }
    },
    [items, onNodeClick]
  );

  // Calculate stats
  const stats = useMemo(() => {
    if (!recyclingChain) return { totalNodes: 0, maxDepth: 0, terminalMaterials: 0 };

    let maxDepth = 0;
    let terminalMaterials = 0;

    function traverse(node: RecyclingNodeType) {
      maxDepth = Math.max(maxDepth, node.depth);
      if (node.children.length === 0) {
        terminalMaterials++;
      }
      node.children.forEach(traverse);
    }

    traverse(recyclingChain);

    return {
      totalNodes: nodes.length,
      maxDepth,
      terminalMaterials,
    };
  }, [recyclingChain, nodes]);

  if (!recyclingChain) {
    return (
      <Card className="bg-slate-900/50 border-cyan-500/20 p-12">
        <div className="text-center space-y-4">
          <Package size={48} className="mx-auto text-slate-600" />
          <div>
            <h3 className="text-xl font-semibold text-slate-400 mb-2">
              No Recycling Data
            </h3>
            <p className="text-slate-500">
              This item cannot be recycled or has no recycling chain.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="w-full h-[calc(100vh-240px)] min-h-[600px] rounded-lg overflow-hidden border border-cyan-500/20 bg-slate-950">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClickHandler}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2, maxZoom: 1 }}
        minZoom={0.1}
        maxZoom={1.5}
        defaultEdgeOptions={{
          type: "smoothstep",
        }}
      >
        <Background color="#334155" gap={16} size={1} />
        <Controls className="!bg-slate-900/90 !border-cyan-500/30 [&>button]:!bg-slate-800 [&>button]:!border-cyan-500/30 [&>button:hover]:!bg-cyan-500/20" />
        <MiniMap
          nodeColor={(node) => {
            const depth = node.data.depth as number;
            // Color gradient based on depth
            if (depth === 0) return "#06b6d4"; // Source item
            if (node.data.isTerminal) return "#22c55e"; // Terminal materials
            return "#64748b"; // Intermediate materials
          }}
          className="!bg-slate-900/90 !border-cyan-500/30"
          maskColor="rgb(15, 23, 42, 0.8)"
        />

        {/* Legend Panel */}
        <Panel
          position="top-left"
          className="bg-slate-900/95 backdrop-blur-sm p-4 rounded-lg border border-cyan-500/30 shadow-lg"
        >
          <div className="space-y-3">
            <h3 className="font-bold text-cyan-400 text-sm mb-3">
              Recycling Chain Legend
            </h3>

            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-cyan-500 rounded border-2 border-cyan-400"></div>
              <span className="text-xs text-slate-300">Source Item</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-slate-600 rounded border-2 border-slate-500"></div>
              <span className="text-xs text-slate-300">
                Intermediate Material
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded border-2 border-green-400"></div>
              <span className="text-xs text-slate-300">Terminal Material</span>
            </div>

            <div className="pt-2 border-t border-slate-700">
              <div className="flex items-center gap-2">
                <Layers size={14} className="text-cyan-400" />
                <span className="text-xs text-slate-400">
                  Click nodes for details
                </span>
              </div>
            </div>
          </div>
        </Panel>

        {/* Stats Panel */}
        <Panel
          position="top-right"
          className="bg-slate-900/95 backdrop-blur-sm p-4 rounded-lg border border-cyan-500/30 shadow-lg"
        >
          <div className="space-y-2">
            <h3 className="font-bold text-cyan-400 text-sm mb-2">
              Chain Stats
            </h3>
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs text-slate-400">Total Materials:</span>
              <Badge
                variant="outline"
                className="text-cyan-400 border-cyan-500/30"
              >
                {stats.totalNodes}
              </Badge>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs text-slate-400">Max Depth:</span>
              <Badge
                variant="outline"
                className="text-cyan-400 border-cyan-500/30"
              >
                {stats.maxDepth}
              </Badge>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs text-slate-400">Terminal Materials:</span>
              <Badge className="bg-green-500/20 text-green-400 border-green-500/50">
                {stats.terminalMaterials}
              </Badge>
            </div>
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
}

/**
 * Transform recycling chain to React Flow nodes and edges
 */
function transformRecyclingToFlow(
  chain: RecyclingNodeType,
  items: Item[],
  direction: "TB" | "LR" = "TB"
): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  // Recursively traverse the chain and create nodes/edges
  function traverse(node: RecyclingNodeType, parentId?: string) {
    const isTerminal = node.children.length === 0;
    const isSource = node.depth === 0;
    const nodeId = node.path; // Use unique path as node ID

    nodes.push({
      id: nodeId,
      type: "recyclingNode",
      data: {
        item: node.item,
        quantity: node.quantity,
        depth: node.depth,
        isTerminal,
        isSource,
      },
      position: { x: 0, y: 0 }, // Will be calculated by dagre
    });

    // Create edge from parent
    if (parentId) {
      edges.push({
        id: `${parentId}-${nodeId}`,
        source: parentId,
        target: nodeId,
        type: "smoothstep",
        animated: false,
        label: `x${node.quantity}`,
        labelStyle: {
          fill: "#06b6d4",
          fontWeight: 600,
          fontSize: 12,
        },
        labelBgStyle: {
          fill: "#0f172a",
          fillOpacity: 0.9,
        },
        style: {
          stroke: isTerminal ? "#22c55e" : "#64748b",
          strokeWidth: 2,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: isTerminal ? "#22c55e" : "#64748b",
        },
      });
    }

    // Recurse through children
    node.children.forEach((child) => traverse(child, nodeId));
  }

  traverse(chain);

  // Apply dagre layout
  return getLayoutedElements(nodes, edges, direction);
}

/**
 * Calculate node positions using dagre layout algorithm
 */
function getLayoutedElements(
  nodes: Node[],
  edges: Edge[],
  direction: "TB" | "LR" = "TB"
): { nodes: Node[]; edges: Edge[] } {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  const nodeWidth = 240;
  const nodeHeight = 100;

  // Configure graph layout
  dagreGraph.setGraph({
    rankdir: direction,
    nodesep: 100,
    ranksep: 150,
    marginx: 20,
    marginy: 20,
  });

  // Add nodes to dagre graph
  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  // Add edges to dagre graph
  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  // Calculate layout
  dagre.layout(dagreGraph);

  // Apply calculated positions to nodes
  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);

    return {
      ...node,
      targetPosition: direction === "TB" ? Position.Top : Position.Left,
      sourcePosition: direction === "TB" ? Position.Bottom : Position.Right,
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
}
