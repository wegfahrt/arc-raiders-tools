import { memo } from "react";
import type { NodeProps } from "reactflow";
import { Handle, Position } from "reactflow";
import { Badge } from "../../components/ui/badge";
import { Package, Leaf } from "lucide-react";
import type { Item } from "@/lib/types";
import { getLocalizedText } from "~/lib/utils";

interface RecyclingNodeData {
  item: Item;
  quantity: number;
  depth: number;
  isTerminal: boolean;
  isSource: boolean;
}

export const RecyclingNode = memo(({ data }: NodeProps<RecyclingNodeData>) => {
  const { item, quantity, depth, isTerminal, isSource } = data;

  // Determine node styling based on type
  const borderColor = isSource
    ? "border-cyan-500/40"
    : isTerminal
    ? "border-green-500/40"
    : "border-slate-600/40";

  const glowColor = isSource
    ? "shadow-[0_0_15px_rgba(6,182,212,0.3)]"
    : isTerminal
    ? "shadow-[0_0_15px_rgba(34,197,94,0.3)]"
    : "shadow-[0_0_10px_rgba(100,116,139,0.2)]";

  const bgColor = isSource
    ? "bg-cyan-500/10"
    : isTerminal
    ? "bg-green-500/10"
    : "bg-slate-800/50";

  return (
    <div
      className={`
        relative px-4 py-3 rounded-lg border-2 
        ${bgColor} backdrop-blur-sm
        min-w-[240px] max-w-[240px]
        ${borderColor}
        ${glowColor}
        transition-all duration-200
        hover:scale-105
        cursor-pointer
      `}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-cyan-400 !w-2 !h-2 !border-2 !border-slate-900"
      />

      <div className="space-y-2">
        {/* Item Image and Name */}
        <div className="flex items-center gap-2">
          {item.imageFilename && (
            <img
              src={item.imageFilename}
              alt={getLocalizedText(item.name)}
              className="w-10 h-10 object-cover rounded border border-slate-600"
            />
          )}
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm text-slate-200 truncate">
              {getLocalizedText(item.name)}
            </div>
            <div className="text-xs text-slate-400">{item.type}</div>
          </div>
        </div>

        {/* Badges */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Quantity Badge */}
          <Badge
            variant="outline"
            className="text-xs border-cyan-500/30 text-cyan-400"
          >
            x{quantity}
          </Badge>

          {/* Depth Badge */}
          {!isSource && (
            <Badge
              variant="outline"
              className="text-xs border-slate-600 text-slate-400"
            >
              Depth {depth}
            </Badge>
          )}

          {/* Terminal Badge */}
          {isTerminal && (
            <Badge className="text-xs bg-green-500/20 text-green-400 border-green-500/50">
              <Leaf size={10} className="mr-0.5" />
              Terminal
            </Badge>
          )}

          {/* Source Badge */}
          {isSource && (
            <Badge className="text-xs bg-cyan-500/20 text-cyan-400 border-cyan-500/50">
              <Package size={10} className="mr-0.5" />
              Source
            </Badge>
          )}
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-cyan-400 !w-2 !h-2 !border-2 !border-slate-900"
      />
    </div>
  );
});

RecyclingNode.displayName = "RecyclingNode";

export default RecyclingNode;
