"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useGameStore } from "@/lib/stores/game-store";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ItemTooltip } from "@/components/ui/item-tooltip";
import { Search, Grid3x3, GitBranch, User, CheckCircle2, CircleHelp } from "lucide-react";
import type { QuestWithRelations } from "@/lib/types";
import { getAllQuests } from "~/server/db/queries/quests";
import { getLocalizedText } from "~/lib/utils";
import QuestFlowChart from "./QuestFlowChart";
import QuestDetailModal from "./QuestDetailModal";

type QuestStatus = "active" | "locked" | "completed";

interface QuestWithStatus extends QuestWithRelations {
  status: QuestStatus;
  previousQuestIds: string[];
  nextQuestIds: string[];
}

export default function Quests() {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"cards" | "flowchart">("cards");
  const [activeTab, setActiveTab] = useState<"all" | "active" | "locked" | "completed">("all");
  const [selectedQuest, setSelectedQuest] = useState<QuestWithStatus | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: questsData = [] } = useQuery({
    queryKey: ['quests'],
    queryFn: getAllQuests,
  });

  const { completedQuests, toggleQuest } = useGameStore();

  // Handler for opening quest details modal
  const handleQuestClick = (quest: QuestWithStatus) => {
    setSelectedQuest(quest);
    setIsModalOpen(true);
  };

  // Handler for closing modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedQuest(null);
  };

  // Add status to quests based on completedQuests
  const quests: QuestWithStatus[] = questsData.map(quest => {
    // Extract previous and next quest IDs from relations
    const previousQuestIds = quest.previousQuests?.map(pq => pq.previousQuestId) ?? [];
    const nextQuestIds = quest.nextQuests?.map(nq => nq.questId) ?? [];

    let status: QuestStatus = "locked";
    if (completedQuests.includes(quest.id)) {
      status = "completed";
    } else {
      // Check if all prerequisites are met or if it is a starting quest
      const prerequisitesMet = previousQuestIds.every(prereqId => completedQuests.includes(prereqId));
      status = prerequisitesMet ? "active" : "locked";
    }
    
    return { 
      ...quest, 
      status,
      previousQuestIds,
      nextQuestIds
    };
  });

  const filteredQuests = quests
    .filter(quest => {
      const matchesSearch = getLocalizedText(quest.name).toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTab = 
        activeTab === "all" || 
        (activeTab === "active" && quest.status === "active") ||
        (activeTab === "locked" && quest.status === "locked") ||
        (activeTab === "completed" && quest.status === "completed");
      return matchesSearch && matchesTab;
    })
    .sort((a, b) => {
      // Calculate combined content length for each quest
      const aLength = 
        a.objectives.length + 
        (a.requirements?.length || 0) + 
        (a.rewards?.length || 0);
      const bLength = 
        b.objectives.length + 
        (b.requirements?.length || 0) + 
        (b.rewards?.length || 0);

      // Sort in ascending order (shortest first)
      return aLength - bLength;
    });

  const statusCounts = {
    active: quests.filter(q => q.status === "active").length,
    locked: quests.filter(q => q.status === "locked").length,
    completed: quests.filter(q => q.status === "completed").length,
    all: quests.length
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-3xl font-bold text-cyan-400">Quests</h1>
          <div className="flex gap-2">
            <Button
              variant={viewMode === "cards" ? "outline" : "default"}
              size="sm"
              onClick={() => setViewMode("cards")}
              className="gap-2"
            >
              <Grid3x3 size={16} />
              Cards
            </Button>
            <Button
              variant={viewMode === "flowchart" ? "outline" : "default"}
              size="sm"
              onClick={() => setViewMode("flowchart")}
              className="gap-2"
            >
              <GitBranch size={16} />
              Flowchart
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <Input
            placeholder="Search quests..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-slate-900/50 border-cyan-500/20"
          />
        </div>

        {/* Tabs */}
        
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          {viewMode === "cards" && (
          <TabsList className="bg-slate-900/50 border border-cyan-500/20">
            <TabsTrigger 
              value="all"
              className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-300 data-[state=active]:border-cyan-500/50 data-[state=active]:shadow-[0_0_10px_rgba(6,182,212,0.3)] hover:bg-slate-800/50 hover:text-cyan-400 transition-all duration-200"
            >
              All ({statusCounts.all})
            </TabsTrigger>
            <TabsTrigger 
              value="active"
              className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-300 data-[state=active]:border-cyan-500/50 data-[state=active]:shadow-[0_0_10px_rgba(6,182,212,0.3)] hover:bg-slate-800/50 hover:text-cyan-400 transition-all duration-200"
            >
              Active ({statusCounts.active})
            </TabsTrigger>
            <TabsTrigger 
              value="locked"
              className="data-[state=active]:bg-orange-500/20 data-[state=active]:text-orange-300 data-[state=active]:border-orange-500/50 data-[state=active]:shadow-[0_0_10px_rgba(249,115,22,0.3)] hover:bg-slate-800/50 hover:text-orange-400 transition-all duration-200"
            >
              Locked ({statusCounts.locked})
            </TabsTrigger>
            <TabsTrigger 
              value="completed"
              className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-300 data-[state=active]:border-blue-500/50 data-[state=active]:shadow-[0_0_10px_rgba(59,130,246,0.3)] hover:bg-slate-800/50 hover:text-blue-400 transition-all duration-200"
            >
              Completed ({statusCounts.completed})
            </TabsTrigger>
          </TabsList>
          )}

          <TabsContent value={activeTab} className="mt-6">
            {viewMode === "cards" ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredQuests.map((quest, index) => (
                  <QuestCard 
                    key={quest.id} 
                    quest={quest} 
                    index={index}
                    allQuests={questsData}
                    isCompleted={completedQuests.includes(quest.id)}
                    onToggleComplete={() => toggleQuest(quest.id, questsData)}
                  />
                ))}
              </div>
            ) : (
              <QuestFlowChart
                quests={quests}
                searchQuery={searchQuery}
                onQuestClick={handleQuestClick}
                onToggleComplete={(questId) => toggleQuest(questId, questsData)}
              />
            )}
          </TabsContent>
        </Tabs>

        {/* Quest Detail Modal */}
        <QuestDetailModal
          quest={selectedQuest}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onToggleComplete={(questId) => toggleQuest(questId, questsData)}
          onQuestNavigate={handleQuestClick}
          allQuests={questsData}
        />
      </div>
    </div>
  );
}

function QuestCard({ 
  quest, 
  index,
  allQuests,
  isCompleted,
  onToggleComplete
}: { 
  quest: QuestWithStatus; 
  index: number;
  allQuests: QuestWithRelations[];
  isCompleted: boolean;
  onToggleComplete: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <Card className="bg-slate-900/50 border-cyan-500/20 hover:border-cyan-500/40 transition-all duration-300 p-6 hover:shadow-[0_0_20px_rgba(6,182,212,0.15)]">
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-cyan-300">{getLocalizedText(quest.name)}</h3>
              <div className="flex items-center gap-2 mt-1">
                <User size={14} className="text-slate-400" />
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
                  {/* Number Badge */}
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center border flex-shrink-0 bg-cyan-500/10 border-cyan-500/20">
                    <span className="text-cyan-400 font-bold text-sm">{i + 1}</span>
                  </div>

                  {/* Objective Text */}
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

                          {/* Item Info */}
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

                          {/* Quantity */}
                          <div className="text-right">
                            <p className="text-sm font-bold text-orange-400">
                              {req.quantity}x
                            </p>
                          </div>
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
                          {/* Item Icon */}
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

                          {/* Item Info */}
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

                          {/* Quantity */}
                          <div className="text-right">
                            <p className="text-sm font-bold text-emerald-400">
                              {reward.quantity}x
                            </p>
                          </div>
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
