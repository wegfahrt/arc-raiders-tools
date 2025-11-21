
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ItemTooltip } from "@/components/ui/item-tooltip";
import { Star } from "lucide-react";
import type { Item } from "~/lib/types";
import { useLocalizedText } from "~/lib/utils";

export default function ItemCard({ 
  item, 
  index, 
  viewMode,
  isTracked,
  onToggleTrack,
  rarityColors
}: { 
  item: Item; 
  index: number;
  viewMode: "grid" | "list";
  isTracked: boolean;
  onToggleTrack: () => void;
  rarityColors: Record<string, string>;
}) {
  const localizeText = useLocalizedText();
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: index * 0.02 }}
    >
      <Card className={`
        bg-slate-900/50 border-cyan-500/20 hover:border-cyan-500/40 transition-all duration-300 
        hover:scale-105 hover:shadow-[0_0_20px_rgba(6,182,212,0.2)]
        ${viewMode === "grid" ? "p-4" : "p-4 flex items-center gap-4"}
      `}>
        <div className={viewMode === "grid" ? "space-y-3" : "flex items-center gap-4 flex-1"}>
          {/* Image with tooltip */}
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className={`
                  bg-slate-800/50 rounded-lg flex items-center justify-center border border-cyan-500/10
                  cursor-pointer hover:border-cyan-500/30 transition-colors
                  ${viewMode === "grid" ? "aspect-square" : "w-16 h-16 flex-shrink-0"}
                `}>
                  {item.imageFilename ? (
                    <img src={item.imageFilename} alt={localizeText(item.name)} className="w-full h-full object-cover rounded-lg" />
                  ) : (
                    <span className="text-slate-600 text-2xl">?</span>
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent side="right" align="start" className="p-0 border-0 bg-transparent">
                <ItemTooltip item={item} />
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <div className="flex-1 space-y-2">
            <div className="flex items-start justify-between gap-2">
                {localizeText(item.name)}
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleTrack}
                className="p-1 h-auto"
              >
                <Star 
                  size={16} 
                  className={isTracked ? "fill-yellow-400 text-yellow-400" : "text-slate-400"} 
                />
              </Button>
            </div>
            {viewMode === "list" && (
              <p className="text-sm text-slate-400 line-clamp-2">{localizeText(item.description)}</p>
            )}
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="text-xs border-cyan-500/30 text-cyan-400">
                {item.type}
              </Badge>
              {item.rarity && (
                <Badge className={`text-xs ${rarityColors[item.rarity]}`}>
                  {item.rarity}
                </Badge>
              )}
              {item.foundIn && (
                <Badge variant="outline" className="text-xs bg-[oklch(0.85_0.17_85)]/20 text-[oklch(0.85_0.17_85)] border-[oklch(0.85_0.17_85)]/30">
                  {item.foundIn}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
