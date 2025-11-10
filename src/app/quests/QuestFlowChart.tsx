"use client";

import { useCallback, useMemo, useState } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Panel,
  type Node,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { QuestNode } from '~/components/ui/quest-node';
import { transformQuestsToFlow } from '~/lib/utils/questFlowTransform';
import type { QuestWithRelations } from '~/lib/types';
import { Card } from '~/components/ui/card';
import { Badge } from '~/components/ui/badge';
import { CheckCircle2, Lock, Zap } from 'lucide-react';

type QuestStatus = "active" | "locked" | "completed";

interface QuestWithStatus extends QuestWithRelations {
  status: QuestStatus;
  previousQuestIds: string[];
  nextQuestIds: string[];
}

const nodeTypes = {
  questNode: QuestNode,
};

interface QuestFlowChartProps {
  quests: QuestWithStatus[];
  searchQuery?: string;
  onQuestClick?: (quest: QuestWithStatus) => void;
  onToggleComplete?: (questId: string) => void;
}

export default function QuestFlowChart({ 
  quests, 
  searchQuery = '',
  onQuestClick,
  onToggleComplete 
}: QuestFlowChartProps) {
  const [direction, setDirection] = useState<'TB' | 'LR'>('TB');

  // Transform and layout quests
  const { nodes: initialNodes, edges: initialEdges } = useMemo(
    () => transformQuestsToFlow(quests, direction),
    [quests, direction]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Update nodes with search highlighting
  useMemo(() => {
    const updatedNodes = initialNodes.map(node => {
      const questName = node.data.label.toLowerCase();
      const traderName = node.data.trader.toLowerCase();
      const search = searchQuery.toLowerCase();
      
      const isHighlighted = !searchQuery || 
                           questName.includes(search) || 
                           traderName.includes(search);
      
      return {
        ...node,
        data: {
          ...node.data,
          searchQuery,
          isHighlighted,
        },
      };
    });
    setNodes(updatedNodes);
  }, [initialNodes, searchQuery, setNodes]);

  // Handle node clicks
  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    const quest = quests.find(q => q.id === node.id);
    if (quest && onQuestClick) {
      onQuestClick(quest);
    }
  }, [quests, onQuestClick]);

  // Calculate stats
  const stats = useMemo(() => {
    const active = quests.filter(q => q.status === 'active').length;
    const locked = quests.filter(q => q.status === 'locked').length;
    const completed = quests.filter(q => q.status === 'completed').length;
    
    // Calculate search matches
    const searchMatches = searchQuery 
      ? quests.filter(q => {
          const questName = (typeof q.name === 'string' ? q.name : q.name.en).toLowerCase();
          const traderName = q.trader.toLowerCase();
          const search = searchQuery.toLowerCase();
          return questName.includes(search) || traderName.includes(search);
        }).length
      : quests.length;
    
    return { active, locked, completed, total: quests.length, searchMatches };
  }, [quests, searchQuery]);

  return (
    <div className="w-full h-[calc(100vh-240px)] min-h-[600px] rounded-lg overflow-hidden border border-cyan-500/20 bg-slate-950">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2, maxZoom: 1 }}
        minZoom={0.1}
        maxZoom={1.5}
        defaultEdgeOptions={{
          type: 'smoothstep',
        }}
      >
        <Background 
          color="#334155" 
          gap={16} 
          size={1}
        />
        <Controls 
          className="!bg-slate-900/90 !border-cyan-500/30 [&>button]:!bg-slate-800 [&>button]:!border-cyan-500/30 [&>button:hover]:!bg-cyan-500/20"
        />
        <MiniMap 
          nodeColor={(node) => {
            const status = node.data.status as QuestStatus;
            switch (status) {
              case 'completed': return '#3b82f6';
              case 'active': return '#06b6d4';
              case 'locked': return '#f97316';
              default: return '#64748b';
            }
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
            <h3 className="font-bold text-cyan-400 text-sm mb-3">Quest Status Legend</h3>
            
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-cyan-500 rounded border-2 border-cyan-400"></div>
              <span className="text-xs text-slate-300">Active ({stats.active})</span>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-500 rounded border-2 border-orange-400"></div>
              <span className="text-xs text-slate-300">Locked ({stats.locked})</span>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded border-2 border-blue-400"></div>
              <span className="text-xs text-slate-300">Completed ({stats.completed})</span>
            </div>

            {searchQuery && (
              <div className="flex items-center gap-2 pt-2 border-t border-slate-700">
                <div className="w-4 h-4 bg-yellow-400 rounded border-2 border-yellow-300"></div>
                <span className="text-xs text-slate-300">Search Match</span>
              </div>
            )}

            <div className="pt-2 border-t border-slate-700">
              <div className="flex items-center gap-2">
                <Zap size={14} className="text-cyan-400" />
                <span className="text-xs text-slate-400">Click nodes for details</span>
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
            <h3 className="font-bold text-cyan-400 text-sm mb-2">Progress</h3>
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs text-slate-400">Completion:</span>
              <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/50">
                {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
              </Badge>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs text-slate-400">Total Quests:</span>
              <Badge variant="outline" className="text-cyan-400 border-cyan-500/30">
                {stats.total}
              </Badge>
            </div>
            {searchQuery && (
              <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-700">
                <span className="text-xs text-slate-400">Search Results:</span>
                <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/50">
                  {stats.searchMatches}
                </Badge>
              </div>
            )}
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
}
