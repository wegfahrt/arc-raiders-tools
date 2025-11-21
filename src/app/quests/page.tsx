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
import { useLocalizedText } from "~/lib/utils";
import QuestFlowChart from "./QuestFlowChart";
import QuestDetailModal from "./QuestDetailModal";
import QuestCard from "./QuestCard";
import type { QuestWithStatus, QuestStatus } from "@/lib/types";


export default function Quests() {
  const localizeText = useLocalizedText(); 
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"cards" | "flowchart">("cards");
  const [activeTab, setActiveTab] = useState<"all" | "active" | "locked" | "completed">("active");
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
      const matchesSearch = localizeText(quest.name).toLowerCase().includes(searchQuery.toLowerCase()); // ✅ Use localizeText function
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
            <TabsTrigger 
              value="all"
              className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-300 data-[state=active]:border-cyan-500/50 data-[state=active]:shadow-[0_0_10px_rgba(6,182,212,0.3)] hover:bg-slate-800/50 hover:text-cyan-400 transition-all duration-200"
            >
              All ({statusCounts.all})
            </TabsTrigger>
          </TabsList>
          )}

          <TabsContent value={activeTab} className="mt-6">
            {viewMode === "cards" ? (
              <div className="space-y-4">
                {filteredQuests.map((quest, index) => (
                  <QuestCard 
                    key={quest.id} 
                    quest={quest} 
                    index={index}
                    allQuests={questsData}
                    isCompleted={completedQuests.includes(quest.id)}
                    onToggleComplete={() => toggleQuest(quest.id, questsData)}
                    onQuestNavigate={handleQuestClick}
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
