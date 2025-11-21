"use client";

import { motion } from "framer-motion";
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
import { ArrowRight, Layers, TrendingUp, Coins } from "lucide-react";
import type { RecyclingPath } from "@/lib/types";
import { useLocalizedText } from "~/lib/utils";

interface RecyclingPathCardProps {
  path: RecyclingPath;
  index: number;
  onViewFlowchart?: (itemId: string) => void;
}

export default function RecyclingPathCard({
  path,
  index,
  onViewFlowchart,
}: RecyclingPathCardProps) {
  const localizeText = useLocalizedText();
  const efficiencyColor =
    path.efficiency >= 80
      ? "text-green-400 border-green-500/50 bg-green-500/10"
      : path.efficiency >= 50
      ? "text-yellow-400 border-yellow-500/50 bg-yellow-500/10"
      : "text-orange-400 border-orange-500/50 bg-orange-500/10";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <Card className="bg-slate-900/50 border-cyan-500/20 hover:border-cyan-500/40 transition-all duration-300 p-6 hover:shadow-[0_0_20px_rgba(6,182,212,0.15)]">
        <div className="space-y-4">
          {/* Header: Source → Target */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1">
              <TooltipProvider delayDuration={300}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-2 cursor-help">
                      {path.sourceItem.imageFilename && (
                        <img
                          src={path.sourceItem.imageFilename}
                          alt={localizeText(path.sourceItem.name)}
                          className="w-10 h-10 object-cover rounded border-2 border-slate-700"
                        />
                      )}
                      <div>
                        <div className="font-semibold text-slate-200">
                          {localizeText(path.sourceItem.name)}
                        </div>
                        <div className="text-xs text-slate-400">
                          {path.sourceItem.type}
                        </div>
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="p-0">
                    <ItemTooltip item={path.sourceItem} />
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <ArrowRight className="text-cyan-400" size={20} />

              <TooltipProvider delayDuration={300}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-2 cursor-help">
                      {path.targetMaterial.imageFilename && (
                        <img
                          src={path.targetMaterial.imageFilename}
                          alt={localizeText(path.targetMaterial.name)}
                          className="w-10 h-10 object-cover rounded border-2 border-cyan-500/50"
                        />
                      )}
                      <div>
                        <div className="font-semibold text-cyan-300">
                          {localizeText(path.targetMaterial.name)}
                        </div>
                        <div className="text-xs text-slate-400">
                          x{path.finalQuantity}
                        </div>
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="p-0">
                    <ItemTooltip item={path.targetMaterial} />
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            {/* Metrics Badges */}
            <div className="flex gap-2">
              <Badge className={efficiencyColor}>
                <TrendingUp size={14} className="mr-1" />
                {path.efficiency}%
              </Badge>
            </div>
          </div>

          {/* Recycling Steps */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-slate-300 flex items-center gap-2">
              <Layers size={14} className="text-cyan-400" />
              Recycling Steps ({path.totalSteps})
            </h4>
            <div className="space-y-1.5 pl-4 border-l-2 border-cyan-500/20">
              {path.steps.map((step, stepIndex) => (
                <div
                  key={stepIndex}
                  className="flex items-start gap-2 text-sm"
                >
                  <div className="flex items-center justify-center w-5 h-5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-xs text-cyan-400 font-semibold mt-0.5">
                    {step.stepNumber}
                  </div>
                  <div className="flex-1">
                    <div className="text-slate-300">
                      Recycle{" "}
                      <span className="font-medium text-slate-200">
                        {localizeText(step.input.name)}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {Object.entries(step.outputs).map(([matId, qty]) => (
                        <Badge
                          key={matId}
                          variant="outline"
                          className="text-xs border-slate-600 text-slate-400"
                        >
                          {matId}: {qty}x
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer: Additional Info and Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-700/50">
            <div className="flex gap-3 text-sm">
              <div className="flex items-center gap-1.5">
                <Coins size={14} className="text-amber-400" />
                <span className="text-slate-400">Value:</span>
                <span className="text-amber-400 font-semibold">
                  {path.totalValueCost}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Layers size={14} className="text-slate-400" />
                <span className="text-slate-400">Steps:</span>
                <span className="text-slate-300 font-semibold">
                  {path.totalSteps}
                </span>
              </div>
            </div>

            {onViewFlowchart && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onViewFlowchart(path.sourceItem.id)}
                className="border-cyan-500/30 hover:border-cyan-500/50 hover:bg-cyan-500/10 text-cyan-400"
              >
                View Chain
              </Button>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
