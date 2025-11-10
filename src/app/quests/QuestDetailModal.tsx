"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '~/components/ui/dialog';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { CheckCircle2, CircleHelp, User, X } from 'lucide-react';
import type { QuestWithRelations } from '~/lib/types';
import { getLocalizedText } from '~/lib/utils';

type QuestStatus = "active" | "locked" | "completed";

interface QuestWithStatus extends QuestWithRelations {
  status: QuestStatus;
  previousQuestIds: string[];
  nextQuestIds: string[];
}

interface QuestDetailModalProps {
  quest: QuestWithStatus | null;
  isOpen: boolean;
  onClose: () => void;
  onToggleComplete: (questId: string) => void;
  allQuests: QuestWithRelations[];
}

const statusColors = {
  active: "bg-cyan-500/20 text-cyan-400 border-cyan-500/50",
  locked: "bg-orange-500/20 text-orange-400 border-orange-500/50",
  completed: "bg-blue-500/20 text-blue-400 border-blue-500/50"
};

export default function QuestDetailModal({
  quest,
  isOpen,
  onClose,
  onToggleComplete,
  allQuests,
}: QuestDetailModalProps) {
  if (!quest) return null;

  const isCompleted = quest.status === 'completed';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto bg-slate-900 border-cyan-500/30">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-2xl font-bold text-cyan-300">
                {getLocalizedText(quest.name)}
              </DialogTitle>
              <DialogDescription className="flex items-center gap-2 mt-2">
                <User size={14} className="text-slate-400" />
                <span className="text-slate-400">{quest.trader}</span>
              </DialogDescription>
            </div>
            <div className="flex flex-col items-end gap-2 m-2">
              <Badge className={statusColors[quest.status]}>
                {quest.status}
              </Badge>
              <Badge variant="outline" className="text-cyan-400 border-cyan-500/30">
                {quest.xp} XP
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
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
                  {quest.requirements.map((req, i) => (
                        <div 
                          className="flex items-center gap-3 p-3 rounded-lg border transition-all bg-orange-500/5 border-orange-500/20 hover:border-orange-500/40 cursor-pointer "
                        >
                            {/* Item Icon */}
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
                            <p className="text-xs text-slate-500">Required</p>
                          </div>

                          <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/40 flex-shrink-0">
                            x{req.quantity}
                          </Badge>
                        </div>
                  ))}
              </div>
            </div>
          )}

          {/* Rewards */}
          {quest.rewards && quest.rewards.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                <span className="w-1 h-4 bg-emerald-400 rounded-full" />
                Rewards
              </h4>
              
              <div className="grid grid-cols-1 gap-2">
                  {quest.rewards.map((reward, i) => (
                        <div 
                          className="flex items-center gap-3 p-3 rounded-lg border transition-all bg-emerald-500/5 border-emerald-500/20 hover:border-emerald-500/40 cursor-pointer"
                        >
                          <div className="w-10 h-10 bg-slate-800/50 rounded flex items-center justify-center border border-emerald-500/20 flex-shrink-0">
                            {/* Item Icon */}
                          <div className="w-10 h-10 rounded-lg flex items-center justify-center border flex-shrink-0 bg-orange-500/10 border-orange-500/20">
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
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-200 truncate">
                              {reward.item ? getLocalizedText(reward.item.name) : reward.itemId}
                            </p>
                            <p className="text-xs text-slate-500">Reward</p>
                          </div>

                          <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 flex-shrink-0">
                            x{reward.quantity}
                          </Badge>
                        </div>
                  ))}
              </div>
            </div>
          )}

          {/* Quest Chain Info */}
          {(quest.previousQuestIds.length > 0 || quest.nextQuestIds.length > 0) && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                <span className="w-1 h-4 bg-purple-400 rounded-full" />
                Quest Chain
              </h4>
              
              {quest.previousQuestIds.length > 0 && (
                <div className="p-3 rounded-lg bg-slate-800/30 border border-slate-700/50">
                  <p className="text-xs text-slate-400 mb-2">Prerequisites:</p>
                  <div className="flex flex-wrap gap-2">
                    {quest.previousQuestIds.map(prevId => {
                      const prevQuest = allQuests.find(q => q.id === prevId);
                      return prevQuest ? (
                        <Badge key={prevId} variant="outline" className="text-purple-400 border-purple-500/30">
                          {getLocalizedText(prevQuest.name)}
                        </Badge>
                      ) : null;
                    })}
                  </div>
                </div>
              )}

              {quest.nextQuestIds.length > 0 && (
                <div className="p-3 rounded-lg bg-slate-800/30 border border-slate-700/50">
                  <p className="text-xs text-slate-400 mb-2">Unlocks:</p>
                  <div className="flex flex-wrap gap-2">
                    {quest.nextQuestIds.map(nextId => {
                      const nextQuest = allQuests.find(q => q.id === nextId);
                      return nextQuest ? (
                        <Badge key={nextId} variant="outline" className="text-purple-400 border-purple-500/30">
                          {getLocalizedText(nextQuest.name)}
                        </Badge>
                      ) : null;
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action Button */}
          <Button
            onClick={() => onToggleComplete(quest.id)}
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
      </DialogContent>
    </Dialog>
  );
}
