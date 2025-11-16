"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ItemTooltip } from "@/components/ui/item-tooltip";
import { ArrowRight, Leaf, Package } from "lucide-react";
import type { Item } from "@/lib/types";
import { getLocalizedText } from "~/lib/utils";
import { buildRecyclingChain } from "~/lib/utils/recycling-calculator";
import type { RecyclingNode } from "~/lib/utils/recycling-calculator";

interface RecyclingChainListProps {
  itemId: string;
  items: Item[];
  onItemClick?: (itemId: string) => void;
}

export default function RecyclingChainList({
  itemId,
  items,
  onItemClick,
}: RecyclingChainListProps) {
  // Build recycling chain
  const chain = useMemo(
    () => buildRecyclingChain(itemId, items),
    [itemId, items]
  );

  if (!chain) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400">
          No recycling chain available for this item.
        </p>
      </div>
    );
  }

  // Flatten the chain into a list grouped by depth
  const flattenedChain = useMemo(() => {
    const groups: Record<number, RecyclingNode[]> = {};

    function traverse(node: RecyclingNode) {
      if (!groups[node.depth]) {
        groups[node.depth] = [];
      }
      groups[node.depth]!.push(node);
      node.children.forEach(traverse);
    }

    traverse(chain);
    return groups;
  }, [chain]);

  const maxDepth = Math.max(...Object.keys(flattenedChain).map(Number));

  return (
    <div className="space-y-6">
      <div className="text-sm text-slate-400 mb-4">
        Showing {Object.values(flattenedChain).flat().length} materials across {maxDepth + 1} levels
      </div>

      {Object.entries(flattenedChain)
        .sort(([a], [b]) => Number(a) - Number(b))
        .map(([depth, nodes]) => (
          <motion.div
            key={depth}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Number(depth) * 0.1 }}
            className="space-y-3"
          >
            {/* Level Header */}
            <div className="flex items-center gap-3">
              <Badge
                variant="outline"
                className="text-cyan-400 border-cyan-500/30"
              >
                Level {depth}
              </Badge>
              <div className="flex-1 h-px bg-gradient-to-r from-cyan-500/30 to-transparent" />
              {Number(depth) === 0 && (
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Package size={12} />
                  Source
                </span>
              )}
              {Number(depth) === maxDepth && (
                <span className="text-xs text-green-400 flex items-center gap-1">
                  <Leaf size={12} />
                  Terminal
                </span>
              )}
            </div>

            {/* Items at this level */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {nodes.map((node, index) => (
                <TooltipProvider key={`${node.item.id}-${index}`} delayDuration={300}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        className={`
                          p-4 rounded-lg border cursor-pointer
                          transition-all duration-200 hover:scale-105
                          ${
                            Number(depth) === 0
                              ? "bg-cyan-500/10 border-cyan-500/30 hover:border-cyan-500/50"
                              : node.children.length === 0
                              ? "bg-green-500/10 border-green-500/30 hover:border-green-500/50"
                              : "bg-slate-800/30 border-slate-600/30 hover:border-slate-500/50"
                          }
                        `}
                        onClick={() => onItemClick?.(node.item.id)}
                      >
                        <div className="flex items-center gap-3">
                          {node.item.imageFilename && (
                            <img
                              src={node.item.imageFilename}
                              alt={getLocalizedText(node.item.name)}
                              className="w-12 h-12 object-cover rounded border border-slate-600"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-sm text-slate-200 truncate">
                              {getLocalizedText(node.item.name)}
                            </div>
                            <div className="text-xs text-slate-400 mt-0.5">
                              {node.item.type}
                            </div>
                            <div className="flex items-center gap-1.5 mt-1">
                              <Badge
                                variant="outline"
                                className="text-xs border-cyan-500/30 text-cyan-400"
                              >
                                x{node.quantity}
                              </Badge>
                              {Number(depth) === 0 && (
                                <Badge className="text-xs bg-cyan-500/20 text-cyan-400 border-cyan-500/50">
                                  <Package size={10} className="mr-0.5" />
                                  Source
                                </Badge>
                              )}
                              {node.children.length === 0 && Number(depth) > 0 && (
                                <Badge className="text-xs bg-green-500/20 text-green-400 border-green-500/50">
                                  <Leaf size={10} className="mr-0.5" />
                                  Terminal
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Show what this produces if not terminal */}
                        {node.children.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-slate-700/50">
                            <div className="text-xs text-slate-400 mb-2 flex items-center gap-1">
                              Produces
                              <ArrowRight size={12} />
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {Object.entries(node.produces).map(([matId, qty]) => (
                                <Badge
                                  key={matId}
                                  variant="outline"
                                  className="text-xs border-slate-600 text-slate-300"
                                >
                                  {matId}: {qty}x
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="p-0">
                      <ItemTooltip item={node.item} />
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
          </motion.div>
        ))}
    </div>
  );
}
