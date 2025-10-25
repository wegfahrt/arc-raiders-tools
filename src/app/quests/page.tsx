"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { questsApi } from "@/lib/services/api";
import { useGameStore } from "@/lib/stores/game-store";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Search, Grid3x3, GitBranch, ChevronDown, User } from "lucide-react";
import type { Quest } from "@/lib/types";

export default function Quests() {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"cards" | "flowchart">("cards");
  const [activeTab, setActiveTab] = useState<"all" | "active" | "locked" | "completed">("all");

  const { data: quests = [] } = useQuery({
    queryKey: ['quests'],
    queryFn: questsApi.getAll
  });

  const { questProgress, toggleQuestObjective } = useGameStore();

  const filteredQuests = quests.filter(quest => {
    const matchesSearch = quest.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === "all" || quest.status === activeTab;
    return matchesSearch && matchesTab;
  });

  const statusCounts = {
    active: quests.filter(q => q.status === "active").length,
    locked: quests.filter(q => q.status === "locked").length,
    completed: quests.filter(q => q.status === "completed").length,
    all: quests.length
  };

  const statusColors = {
    active: "bg-cyan-500/20 text-cyan-400 border-cyan-500/50",
    locked: "bg-orange-500/20 text-orange-400 border-orange-500/50",
    completed: "bg-blue-500/20 text-blue-400 border-blue-500/50"
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-3xl font-bold text-cyan-400">Quests</h1>
          <div className="flex gap-2">
            <Button
              variant={viewMode === "cards" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("cards")}
              className="gap-2"
            >
              <Grid3x3 size={16} />
              Cards
            </Button>
            <Button
              variant={viewMode === "flowchart" ? "default" : "outline"}
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
          <TabsList className="bg-slate-900/50 border border-cyan-500/20">
            <TabsTrigger value="all">All ({statusCounts.all})</TabsTrigger>
            <TabsTrigger value="active">Active ({statusCounts.active})</TabsTrigger>
            <TabsTrigger value="locked">Locked ({statusCounts.locked})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({statusCounts.completed})</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            {viewMode === "cards" ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredQuests.map((quest, index) => (
                  <QuestCard 
                    key={quest.id} 
                    quest={quest} 
                    index={index}
                    onToggleObjective={toggleQuestObjective}
                    progress={questProgress[quest.id]}
                  />
                ))}
              </div>
            ) : (
              <Card className="bg-slate-900/50 border-cyan-500/20 p-8 min-h-[400px] flex items-center justify-center">
                <div className="text-center text-slate-400">
                  <GitBranch size={48} className="mx-auto mb-4 opacity-50" />
                  <p>Flowchart view coming soon!</p>
                </div>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function QuestCard({ 
  quest, 
  index, 
  onToggleObjective,
  progress 
}: { 
  quest: Quest; 
  index: number;
  onToggleObjective: (questId: string, objectiveIndex: number) => void;
  progress?: { completed: boolean; objectives: Record<number, boolean> };
}) {
  const [isOpen, setIsOpen] = useState(false);
  
  const completedObjectives = Object.values(progress?.objectives || {}).filter(Boolean).length;
  const progressPercentage = quest.objectives.length > 0 
    ? (completedObjectives / quest.objectives.length) * 100 
    : 0;

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
              <h3 className="text-lg font-semibold text-cyan-300">{quest.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <User size={14} className="text-slate-400" />
                <span className="text-sm text-slate-400">{quest.trader}</span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Badge className={quest.status ? statusColors[quest.status] : ""}>
                {quest.status}
              </Badge>
              <Badge variant="outline" className="text-cyan-400 border-cyan-500/30">
                {quest.xp} XP
              </Badge>
            </div>
          </div>

          <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between text-cyan-400 hover:text-cyan-300">
                <span>Objectives ({completedObjectives}/{quest.objectives.length})</span>
                <ChevronDown className={`transition-transform ${isOpen ? "rotate-180" : ""}`} size={16} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-2 mt-2">
              {quest.objectives.map((objective, i) => (
                <div key={i} className="flex items-start gap-3 p-2 rounded hover:bg-slate-800/50">
                  <Checkbox
                    checked={progress?.objectives?.[i] || false}
                    onCheckedChange={() => onToggleObjective(quest.id, i)}
                    className="mt-0.5"
                  />
                  <span className="text-sm text-slate-300 flex-1">{objective}</span>
                </div>
              ))}
            </CollapsibleContent>
          </Collapsible>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Progress</span>
              <span className="text-cyan-400">{Math.round(progressPercentage)}%</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>

          {quest.requiredItemIds && quest.requiredItemIds.length > 0 && (
            <Collapsible>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="w-full justify-between text-slate-400 hover:text-cyan-400">
                  Requirements
                  <ChevronDown size={14} />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2 space-y-1">
                {quest.requiredItemIds.map((req, i) => (
                  <div key={i} className="text-sm text-slate-300 pl-4">
                    • {req.quantity}x {req.itemId}
                  </div>
                ))}
              </CollapsibleContent>
            </Collapsible>
          )}

          {quest.rewardItemIds && quest.rewardItemIds.length > 0 && (
            <Collapsible>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="w-full justify-between text-slate-400 hover:text-cyan-400">
                  Rewards
                  <ChevronDown size={14} />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2 space-y-1">
                {quest.rewardItemIds.map((reward, i) => (
                  <div key={i} className="text-sm text-slate-300 pl-4">
                    • {reward.quantity}x {reward.itemId}
                  </div>
                ))}
              </CollapsibleContent>
            </Collapsible>
          )}
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
