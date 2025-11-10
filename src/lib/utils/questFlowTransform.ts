import dagre from 'dagre';
import type { Node, Edge } from 'reactflow';
import { Position, MarkerType } from 'reactflow';

type QuestStatus = "active" | "locked" | "completed";

interface QuestWithStatus {
  id: string;
  name: { en: string } | string;
  trader: string;
  status: QuestStatus;
  previousQuestIds: string[];
  nextQuestIds: string[];
  objectives: string[];
  xp: number;
}

export interface QuestFlowNode extends Node {
  data: {
    label: string;
    trader: string;
    status: QuestStatus;
    quest: QuestWithStatus;
  };
}

export type QuestFlowEdge = Edge;

/**
 * Transform quest data into React Flow nodes and edges with automatic layout
 */
export function transformQuestsToFlow(
  quests: QuestWithStatus[],
  direction: 'TB' | 'LR' = 'TB'
): { nodes: QuestFlowNode[]; edges: QuestFlowEdge[] } {
  // Create nodes from quests
  const nodes: QuestFlowNode[] = quests.map(quest => ({
    id: quest.id,
    type: 'questNode',
    data: {
      label: typeof quest.name === 'string' ? quest.name : quest.name.en,
      trader: quest.trader,
      status: quest.status,
      quest: quest,
    },
    position: { x: 0, y: 0 }, // Will be calculated by dagre
  }));

  // Create edges from quest relationships
  const edges: QuestFlowEdge[] = [];
  quests.forEach(quest => {
    quest.nextQuestIds.forEach(nextId => {
      // Only create edge if both nodes exist
      if (quests.some(q => q.id === nextId)) {
        edges.push({
          id: `${quest.id}-${nextId}`,
          source: quest.id,
          target: nextId,
          type: 'smoothstep',
          animated: quest.status === 'completed',
          style: {
            stroke: quest.status === 'completed' ? '#22d3ee' : '#64748b',
            strokeWidth: 2,
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: quest.status === 'completed' ? '#22d3ee' : '#64748b',
          },
        });
      }
    });
  });

  // Apply dagre layout
  return getLayoutedElements(nodes, edges, direction);
}

/**
 * Calculate node positions using dagre layout algorithm
 */
function getLayoutedElements(
  nodes: QuestFlowNode[],
  edges: QuestFlowEdge[],
  direction: 'TB' | 'LR' = 'TB'
): { nodes: QuestFlowNode[]; edges: QuestFlowEdge[] } {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  const nodeWidth = 220;
  const nodeHeight = 120;

  // Configure graph layout
  dagreGraph.setGraph({
    rankdir: direction, // TB (top-bottom) or LR (left-right)
    nodesep: 80, // Horizontal spacing between nodes
    ranksep: 100, // Vertical spacing between ranks
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
      targetPosition: direction === 'TB' ? Position.Top : Position.Left,
      sourcePosition: direction === 'TB' ? Position.Bottom : Position.Right,
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
}

/**
 * Group quests by trader for visualization
 */
export function groupQuestsByTrader(quests: QuestWithStatus[]): Record<string, QuestWithStatus[]> {
  return quests.reduce((acc, quest) => {
    if (!acc[quest.trader]) {
      acc[quest.trader] = [];
    }
    acc[quest.trader]!.push(quest);
    return acc;
  }, {} as Record<string, QuestWithStatus[]>);
}

/**
 * Find root quests (quests with no prerequisites)
 */
export function findRootQuests(quests: QuestWithStatus[]): QuestWithStatus[] {
  return quests.filter(quest => 
    !quest.previousQuestIds || quest.previousQuestIds.length === 0
  );
}

/**
 * Find leaf quests (quests with no subsequent quests)
 */
export function findLeafQuests(quests: QuestWithStatus[]): QuestWithStatus[] {
  return quests.filter(quest => 
    !quest.nextQuestIds || quest.nextQuestIds.length === 0
  );
}
