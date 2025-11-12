import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ItemTooltip } from "@/components/ui/item-tooltip";
import { User, CheckCircle2, CircleHelp } from "lucide-react";
import type { QuestWithRelations } from "@/lib/types";
import { getLocalizedText } from "~/lib/utils";
import type { QuestWithStatus } from "@/lib/types";
import { useGameStore } from "~/lib/stores/game-store";

export default function QuestCard({ 
  quest, 
  index,
  allQuests,
  isCompleted,
  onToggleComplete,
  onQuestNavigate
}: { 
  quest: QuestWithStatus; 
  index: number;
  allQuests: QuestWithRelations[];
  isCompleted: boolean;
  onToggleComplete: () => void;
  onQuestNavigate?: (quest: QuestWithStatus) => void;
}) {
  const { completedQuests } = useGameStore();

  // Handle quest navigation
  const handleQuestClick = (questId: string) => {
    const targetQuest = allQuests.find(q => q.id === questId);
    if (targetQuest && onQuestNavigate) {
      // Create QuestWithStatus from the found quest
      const previousQuestIds = targetQuest.previousQuests?.map(pq => pq.previousQuestId) ?? [];
      const nextQuestIds = targetQuest.nextQuests?.map(nq => nq.questId) ?? [];
      
      let status: "active" | "locked" | "completed" = "locked";
      if (completedQuests.includes(targetQuest.id)) {
        status = "completed";
      } else {
        const prerequisitesMet = previousQuestIds.every(prereqId => completedQuests.includes(prereqId));
        status = prerequisitesMet ? "active" : "locked";
      }
      
      const questWithStatus: QuestWithStatus = {
        ...targetQuest,
        status,
        previousQuestIds,
        nextQuestIds
      };
      
      onQuestNavigate(questWithStatus);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <Card className="bg-slate-900/50 border-cyan-500/20 hover:border-cyan-500/40 transition-all duration-300 p-6 hover:shadow-[0_0_20px_rgba(6,182,212,0.15)]">
        <div className="space-y-6">
          {/* Header Section */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-cyan-300 mb-2">{getLocalizedText(quest.name)}</h3>
              <div className="flex items-center gap-2">
                <User size={16} className="text-slate-400" />
                <span className="text-sm text-slate-400">{quest.trader}</span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Badge className={statusColors[quest.status]}>
                {quest.status}
              </Badge>
              <Badge variant="outline" className="text-cyan-400 border-cyan-500/30">
                {quest.xp} XP
              </Badge>
            </div>
          </div>

          {/* Quest Chain Info */}
          {(quest.previousQuestIds.length > 0 || quest.nextQuestIds.length > 0) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Prerequisites */}
              <div>
                {quest.previousQuestIds.length > 0 && (
                  <div className="p-3 rounded-lg bg-slate-800/30 border border-slate-700/50">
                    <h4 className="text-xs font-semibold text-slate-300 flex items-center gap-2 mb-2">
                      <span className="w-1 h-3 bg-blue-400 rounded-full" />
                      Prerequisites
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {quest.previousQuestIds.map(prevId => {
                        const prevQuest = allQuests.find(q => q.id === prevId);
                        const isPrevCompleted = completedQuests.includes(prevId);
                        return prevQuest ? (
                          <Badge 
                            key={prevId} 
                            variant="outline" 
                            className={`cursor-pointer transition-all ${
                              isPrevCompleted 
                                ? statusColors.completed
                                : statusColors.completed.replace('border-blue-500/50', 'border-blue-500/30')
                            } hover:bg-blue-500/30`}
                            onClick={() => handleQuestClick(prevId)}
                          >
                            {isPrevCompleted && <CheckCircle2 size={12} className="mr-1" />}
                            {getLocalizedText(prevQuest.name)}
                          </Badge>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Unlocks */}
              <div>
                {quest.nextQuestIds.length > 0 && (
                  <div className="p-3 rounded-lg bg-slate-800/30 border border-slate-700/50">
                    <h4 className="text-xs font-semibold text-slate-300 flex items-center gap-2 mb-2">
                      <span className="w-1 h-3 bg-orange-400 rounded-full" />
                      Unlocks
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {quest.nextQuestIds.map(nextId => {
                        const nextQuest = allQuests.find(q => q.id === nextId);
                        const isNextCompleted = completedQuests.includes(nextId);
                        return nextQuest ? (
                          <Badge 
                            key={nextId} 
                            variant="outline" 
                            className={`cursor-pointer transition-all ${
                              isNextCompleted 
                                ? statusColors.completed
                                : statusColors.locked
                            } hover:bg-orange-500/30`}
                            onClick={() => handleQuestClick(nextId)}
                          >
                            {isNextCompleted && <CheckCircle2 size={12} className="mr-1" />}
                            {getLocalizedText(nextQuest.name)}
                          </Badge>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}


          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Objectives & Requirements */}
            <div className="space-y-6">
              {/* Objectives */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                  <span className="w-1 h-4 bg-cyan-400 rounded-full" />
                  Objectives ({quest.objectives.length})
                </h4>
                
                <div className="grid grid-cols-1 gap-2">
                  {quest.objectives.map((objective, i) => (
                    <div 
                      key={i} 
                      className="flex items-start gap-3 p-3 rounded-lg border transition-all bg-cyan-500/5 border-cyan-500/20 hover:border-cyan-500/40"
                    >
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center border flex-shrink-0 bg-cyan-500/10 border-cyan-500/20">
                        <span className="text-cyan-400 font-bold text-sm">{i + 1}</span>
                      </div>
                      <div className="flex-1 min-w-0 pt-1">
                        <p className="text-sm text-slate-200">
                          {getLocalizedText(objective)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Requirements */}
              {quest.requirements && quest.requirements.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                    <span className="w-1 h-4 bg-orange-400 rounded-full" />
                    Required Items
                  </h4>
                  
                  <div className="grid grid-cols-1 gap-2">
                    <TooltipProvider delayDuration={300}>
                      {quest.requirements.map((req, i) => (
                        <Tooltip key={i}>
                          <TooltipTrigger asChild>
                            <div 
                              className="flex items-center gap-3 p-3 rounded-lg border transition-all bg-orange-500/5 border-orange-500/20 hover:border-orange-500/40 cursor-pointer"
                            >
                              <div className="w-10 h-10 rounded-lg flex items-center justify-center border flex-shrink-0 bg-orange-500/10 border-orange-500/20">
                                {req.item?.type === "Unknown" ? (
                                  <CircleHelp className="text-orange-400" size={20} />
                                ) : req.item?.imageFilename ? (
                                  <img 
                                    src={req.item.imageFilename} 
                                    alt={req.item ? getLocalizedText(req.item.name) : req.itemId} 
                                    className="w-full h-full object-cover rounded-lg" 
                                  />
                                ) : (
                                  <span className="text-orange-600 text-xl">📦</span>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-slate-200 truncate">
                                  {req.item ? getLocalizedText(req.item.name) : req.itemId}
                                </p>
                                {req.item?.type && (
                                  <p className="text-xs text-slate-400">
                                    {req.item.type}
                                  </p>
                                )}
                              </div>
                              <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/40 flex-shrink-0">
                                x{req.quantity}
                              </Badge>
                            </div>
                          </TooltipTrigger>
                          {req.item && req.item.type !== "Unknown" && (
                            <TooltipContent side="right" align="start" className="p-0 border-0 bg-transparent">
                              <ItemTooltip item={req.item} />
                            </TooltipContent>
                          )}
                        </Tooltip>
                      ))}
                    </TooltipProvider>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Rewards */}
            <div className="space-y-6">
              {/* Rewards */}
              {quest.rewards && quest.rewards.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                    <span className="w-1 h-4 bg-emerald-400 rounded-full" />
                    Rewards
                  </h4>
                  
                  <div className="grid grid-cols-1 gap-2">
                    <TooltipProvider delayDuration={300}>
                      {quest.rewards.map((reward, i) => (
                        <Tooltip key={i}>
                          <TooltipTrigger asChild>
                            <div 
                              className="flex items-center gap-3 p-3 rounded-lg border transition-all bg-emerald-500/5 border-emerald-500/20 hover:border-emerald-500/40 cursor-pointer"
                            >
                              <div className="w-10 h-10 rounded-lg flex items-center justify-center border flex-shrink-0 bg-emerald-500/10 border-emerald-500/20">
                                {reward.item?.type === "Unknown" ? (
                                  <CircleHelp className="text-orange-400" size={20} />
                                ) : reward.item?.imageFilename ? (
                                  <img 
                                    src={reward.item.imageFilename} 
                                    alt={reward.item ? getLocalizedText(reward.item.name) : reward.itemId} 
                                    className="w-full h-full object-cover rounded-lg" 
                                  />
                                ) : (
                                  <span className="text-orange-600 text-xl">📦</span>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-slate-200 truncate">
                                  {reward.item ? getLocalizedText(reward.item.name) : reward.itemId}
                                </p>
                                {reward.item?.type && (
                                  <p className="text-xs text-slate-400">
                                    {reward.item.type}
                                  </p>
                                )}
                              </div>
                              <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 flex-shrink-0">
                                x{reward.quantity}
                              </Badge>
                            </div>
                          </TooltipTrigger>
                          {reward.item && reward.item.type !== "Unknown" && (
                            <TooltipContent side="right" align="start" className="p-0 border-0 bg-transparent">
                              <ItemTooltip item={reward.item} />
                            </TooltipContent>
                          )}
                        </Tooltip>
                      ))}
                    </TooltipProvider>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quest Completion Toggle */}
          <Button
            onClick={onToggleComplete}
            className={`w-full ${
              isCompleted
                ? "bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border-blue-500/50"
                : "bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 border-cyan-500/50"
            } border`}
          >
            <CheckCircle2 size={16} className="mr-2" />
            {isCompleted ? "Mark as Incomplete" : "Mark as Complete"}
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}

const statusColors = {
  active: "bg-cyan-500/20 text-cyan-400 border-cyan-500/50",
  locked: "bg-orange-500/20 text-orange-400 border-orange-500/50",
  completed: "bg-blue-500/20 text-blue-400 border-blue-500/50"
};
