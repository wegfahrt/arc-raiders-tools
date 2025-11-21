"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ItemTooltip } from "@/components/ui/item-tooltip";
import { ChevronDown, ChevronUp, Package, Coins } from "lucide-react";
import type { Item } from "@/lib/types";
import { useLocalizedText } from "~/lib/utils";

interface TerminalMaterialsSummaryProps {
  terminalMaterials: Record<string, number>;
  items: Item[];
  sourceItemName?: string;
  className?: string;
}

export default function TerminalMaterialsSummary({
  terminalMaterials,
  items,
  sourceItemName,
  className = "",
}: TerminalMaterialsSummaryProps) {
  const localizeText = useLocalizedText();
  const [isExpanded, setIsExpanded] = useState(true);

  // Convert terminal materials to array with item data
  const materialsArray = Object.entries(terminalMaterials).map(
    ([materialId, quantity]) => {
      const material = items.find((item) => item.id === materialId);
      return {
        id: materialId,
        material,
        quantity,
        totalValue: material ? material.value * quantity : 0,
      };
    }
  );

  // Calculate totals
  const totalMaterials = materialsArray.length;
  const totalQuantity = materialsArray.reduce(
    (sum, mat) => sum + mat.quantity,
    0
  );
  const totalValue = materialsArray.reduce((sum, mat) => sum + mat.totalValue, 0);

  // Group materials by type
  const materialsByType = materialsArray.reduce((acc, mat) => {
    if (!mat.material) return acc;
    const type = mat.material.type || "Other";
    if (!acc[type]) acc[type] = [];
    acc[type]!.push(mat);
    return acc;
  }, {} as Record<string, typeof materialsArray>);

  return (
    <Card className={`bg-slate-900/50 border-cyan-500/20 ${className}`}>
      {/* Header */}
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-800/30 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
            <Package size={20} className="text-cyan-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-cyan-300">
              Terminal Materials
            </h3>
            {sourceItemName && (
              <p className="text-xs text-slate-400">
                From recycling {sourceItemName}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-sm text-slate-400">
              {totalMaterials} types • {totalQuantity} total
            </div>
            <div className="flex items-center gap-1 text-sm text-amber-400 font-semibold justify-end">
              <Coins size={14} />
              {totalValue}
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-cyan-400 hover:text-cyan-300"
          >
            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </Button>
        </div>
      </div>

      {/* Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-4">
              {/* Materials grouped by type */}
              {Object.entries(materialsByType).map(([type, materials]) => (
                <div key={type} className="space-y-2">
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wide flex items-center gap-2">
                    <span className="w-1 h-3 bg-cyan-400 rounded-full" />
                    {type}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {materials.map((mat) =>
                      mat.material ? (
                        <TooltipProvider key={mat.id} delayDuration={300}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/30 border border-slate-700/50 hover:border-cyan-500/30 transition-colors cursor-help">
                                {mat.material.imageFilename && (
                                  <img
                                    src={mat.material.imageFilename}
                                    alt={localizeText(mat.material.name)}
                                    className="w-10 h-10 object-cover rounded border border-slate-600"
                                  />
                                )}
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium text-slate-200 truncate">
                                    {localizeText(mat.material.name)}
                                  </div>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    <Badge
                                      variant="outline"
                                      className="text-xs border-cyan-500/30 text-cyan-400"
                                    >
                                      x{mat.quantity}
                                    </Badge>
                                    <span className="text-xs text-amber-400 flex items-center gap-0.5">
                                      <Coins size={10} />
                                      {mat.totalValue}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent side="right" className="p-0">
                              <ItemTooltip
                                item={mat.material}
                                additionalContent={
                                  <div className="pt-2 border-t border-cyan-500/20 text-sm">
                                    <div className="flex justify-between items-center">
                                      <span className="text-slate-400">
                                        Quantity obtained:
                                      </span>
                                      <span className="text-cyan-400 font-semibold">
                                        {mat.quantity}x
                                      </span>
                                    </div>
                                    <div className="flex justify-between items-center mt-1">
                                      <span className="text-slate-400">
                                        Total value:
                                      </span>
                                      <span className="text-amber-400 font-semibold">
                                        {mat.totalValue}
                                      </span>
                                    </div>
                                  </div>
                                }
                              />
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ) : null
                    )}
                  </div>
                </div>
              ))}

              {/* Summary Footer */}
              <div className="pt-3 border-t border-slate-700/50">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-2 rounded bg-slate-800/20">
                    <div className="text-xs text-slate-400 mb-1">Types</div>
                    <div className="text-lg font-bold text-cyan-400">
                      {totalMaterials}
                    </div>
                  </div>
                  <div className="p-2 rounded bg-slate-800/20">
                    <div className="text-xs text-slate-400 mb-1">Items</div>
                    <div className="text-lg font-bold text-cyan-400">
                      {totalQuantity}
                    </div>
                  </div>
                  <div className="p-2 rounded bg-slate-800/20">
                    <div className="text-xs text-slate-400 mb-1">Value</div>
                    <div className="text-lg font-bold text-amber-400 flex items-center justify-center gap-1">
                      <Coins size={16} />
                      {totalValue}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
