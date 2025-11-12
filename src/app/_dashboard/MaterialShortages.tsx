"use client";

import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Package } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ItemTooltip } from "@/components/ui/item-tooltip";
import { getAllQuests } from "~/server/db/queries/quests";
import { getAllHideoutModules } from "~/server/db/queries/workstations";
import { getAllItems } from "~/server/db/queries/items";
import { getLocalizedText } from "~/lib/utils";
import { useGameStore } from "@/lib/stores/game-store";
import Link from "next/link";
import type { WorkstationLevel, Item } from "~/lib/types";

interface MaterialSource {
  type: 'quest' | 'workstation';
  name: string;
  quantity: number;
  id: string;
}

export function MaterialShortages() {
  const { data: quests = [] } = useQuery({
    queryKey: ['quests'],
    queryFn: getAllQuests
  });

  const { data: workstations = [] } = useQuery({
    queryKey: ['workstations'],
    queryFn: getAllHideoutModules
  });

  const { data: items = [] } = useQuery({
    queryKey: ['items'],
    queryFn: getAllItems
  });

  const { completedQuests, workstationLevels } = useGameStore();

  // Calculate most needed materials with sources
  const materialNeeds: Record<string, { total: number; sources: MaterialSource[] }> = {};

  // From active quests
  quests
    .filter(q => !completedQuests.includes(q.id))
    .forEach(quest => {
      quest.requirements?.forEach(req => {
        if (!materialNeeds[req.itemId]) {
          materialNeeds[req.itemId] = { total: 0, sources: [] };
        }
        materialNeeds[req.itemId].total += req.quantity;
        materialNeeds[req.itemId].sources.push({
          type: 'quest',
          name: getLocalizedText(quest.name),
          quantity: req.quantity,
          id: quest.id
        });
      });
    });

  // From next workstation upgrades
  workstations.forEach(ws => {
    const currentLevel = workstationLevels[ws.id] || 0;
    const nextLevel = ws.levels.find((level: WorkstationLevel) => level.level === currentLevel + 1);
    if (nextLevel) {
      nextLevel.requirements?.forEach(req => {
        if (!materialNeeds[req.itemId]) {
          materialNeeds[req.itemId] = { total: 0, sources: [] };
        }
        materialNeeds[req.itemId].total += req.quantity;
        materialNeeds[req.itemId].sources.push({
          type: 'workstation',
          name: `${getLocalizedText(ws.name)} Lvl ${nextLevel.level}`,
          quantity: req.quantity,
          id: ws.id
        });
      });
    }
  });

  // Get top 5 most needed materials
  const topMaterials = Object.entries(materialNeeds)
    .sort(([, a], [, b]) => b.total - a.total)
    .slice(0, 5)
    .map(([itemId, data]) => {
      const item = items.find(i => i.id === itemId);
      return { itemId, quantity: data.total, sources: data.sources, item };
    })
    .filter(m => m.item);

  if (topMaterials.length === 0) {
    return (
      <Card className="bg-slate-900/50 border-cyan-500/20 p-6">
        <div className="flex items-center gap-2 mb-4">
          <AlertCircle className="text-cyan-400" size={20} />
          <h3 className="text-lg font-semibold text-cyan-400">Most Needed Materials</h3>
        </div>
        <p className="text-center text-slate-500 py-8">
          No active quests or upgrades. You're all set!
        </p>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-900/50 border-cyan-500/20 p-6">
      <div className="flex items-center gap-2 mb-4">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <AlertCircle className="text-orange-400 cursor-help" size={20} />
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs">
              <p className="text-sm">
                Shows the top 5 materials needed across all active (incomplete) quests and next workstation upgrades.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <h3 className="text-lg font-semibold text-cyan-400">Most Needed Materials</h3>
      </div>
      
      <div className="space-y-2">
        <TooltipProvider delayDuration={300}>
          {topMaterials.map(({ itemId, quantity, sources, item }) => (
            <Tooltip key={itemId}>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-3 p-3 rounded-lg border transition-all bg-orange-500/5 border-orange-500/20 hover:border-orange-500/40 cursor-pointer">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center border flex-shrink-0 bg-orange-500/10 border-orange-500/20">
                    {item?.imageFilename ? (
                      <img 
                        src={item.imageFilename} 
                        alt={getLocalizedText(item.name)} 
                        className="w-full h-full object-cover rounded-lg" 
                      />
                    ) : (
                      <Package className="text-orange-400" size={20} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-200 truncate">
                      {item ? getLocalizedText(item.name) : itemId}
                    </p>
                    {item?.type && (
                      <p className="text-xs text-slate-400">
                        {item.type}
                      </p>
                    )}
                  </div>
                  <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/40 flex-shrink-0">
                    x{quantity}
                  </Badge>
                </div>
              </TooltipTrigger>
              {item && (
                <TooltipContent side="right" align="start" className="p-0 border-0 bg-transparent">
                  <ItemTooltip 
                    item={item} 
                    additionalContent={
                      <div className="mt-3 pt-3 border-t border-slate-700/50">
                        <h4 className="text-sm font-semibold text-orange-400 mb-2 flex items-center gap-2">
                          <AlertCircle size={14} />
                          Needed For
                        </h4>
                        <div className="space-y-2">
                          {sources.map((source, idx) => (
                            <div key={idx} className="flex items-start gap-2 text-xs">
                              <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1 ${
                                source.type === 'quest' ? 'bg-cyan-400' : 'bg-blue-400'
                              }`} />
                              <div className="flex-1 min-w-0">
                                <p className="text-slate-300 font-medium truncate">{source.name}</p>
                                <p className="text-slate-500">
                                  {source.type === 'quest' ? 'Quest' : 'Workstation'} • x{source.quantity}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="mt-2 pt-2 border-t border-slate-700/50">
                          <p className="text-xs text-slate-400">
                            Total needed: <span className="text-orange-300 font-semibold">x{quantity}</span>
                          </p>
                        </div>
                      </div>
                    }
                  />
                </TooltipContent>
              )}
            </Tooltip>
          ))}
        </TooltipProvider>
      </div>
      
      <Link 
        href="/calculator" 
        className="block mt-4 text-center text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
      >
        View Full Calculator →
      </Link>
    </Card>
  );
}
