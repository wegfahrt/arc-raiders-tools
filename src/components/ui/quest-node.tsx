import { memo } from 'react';
import type { NodeProps } from 'reactflow';
import { Handle, Position } from 'reactflow';
import { Badge } from './badge';
import { CheckCircle2, Lock, User } from 'lucide-react';

type QuestStatus = "active" | "locked" | "completed";

interface QuestNodeData {
  label: string;
  trader: string;
  status: QuestStatus;
  quest: {
    id: string;
    xp: number;
    objectives: string[];
  };
}

const statusColors = {
  active: "bg-cyan-500/20 text-cyan-400 border-cyan-500/50",
  locked: "bg-orange-500/20 text-orange-400 border-orange-500/50",
  completed: "bg-blue-500/20 text-blue-400 border-blue-500/50"
};

const statusBorderColors = {
  active: "border-cyan-500/40",
  locked: "border-orange-500/40",
  completed: "border-blue-500/40"
};

const statusGlowColors = {
  active: "shadow-[0_0_15px_rgba(6,182,212,0.3)]",
  locked: "shadow-[0_0_15px_rgba(249,115,22,0.2)]",
  completed: "shadow-[0_0_15px_rgba(59,130,246,0.3)]"
};

export const QuestNode = memo(({ data }: NodeProps<QuestNodeData>) => {
  const status = data.status;

  return (
    <div
      className={`
        relative px-4 py-3 rounded-lg border-2 
        bg-slate-900/95 backdrop-blur-sm
        min-w-[220px] max-w-[220px]
        transition-all duration-300
        hover:scale-105
        ${statusBorderColors[status]}
        ${statusGlowColors[status]}
      `}
    >
      {/* Top Handle */}
      <Handle 
        type="target" 
        position={Position.Top} 
        className="w-3 h-3 !bg-cyan-400 !border-2 !border-slate-900"
      />
      <div className="mb-3 flex justify-between items-start">
        {/* Quest Name */}
        <div className="font-bold text-sm mb-2 text-cyan-300 line-clamp-2 pr-2">
          {data.label}
        </div>

        {/* Status Badge */}
        <div className="-mr-1">
          <Badge className={`text-xs px-2 py-0.5 ${statusColors[status]}`}>
            {status === 'completed' && <CheckCircle2 size={12} className="mr-1" />}
            {status === 'locked' && <Lock size={12} className="mr-1" />}
            {status}
          </Badge>
        </div>
      </div>

      {/* Trader Info */}
      <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-2">
        <User size={12} />
        <span className="truncate">{data.trader}</span>
      </div>

      {/* Quest Stats */}
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-500">
          {data.quest.objectives.length} objective{data.quest.objectives.length !== 1 ? 's' : ''}
        </span>
        <Badge variant="outline" className="text-cyan-400 border-cyan-500/30 px-1.5 py-0">
          {data.quest.xp} XP
        </Badge>
      </div>

      {/* Completion Checkmark for completed quests */}
      {status === 'completed' && (
        <div className="absolute -bottom-2 -left-2 bg-blue-500 rounded-full p-1 border-2 border-slate-900">
          <CheckCircle2 size={16} className="text-white" />
        </div>
      )}

      {/* Bottom Handle */}
      <Handle 
        type="source" 
        position={Position.Bottom} 
        className="w-3 h-3 !bg-cyan-400 !border-2 !border-slate-900"
      />
    </div>
  );
});

QuestNode.displayName = 'QuestNode';
