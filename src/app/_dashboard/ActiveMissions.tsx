"use client";

import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { getAllQuests } from "~/server/db/queries/quests";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Target, CheckCircle2, Lock } from "lucide-react";
import { useGameStore } from "@/lib/stores/game-store";
import { getLocalizedText } from "~/lib/utils";
import Link from "next/link";
import type { QuestStatus } from "~/lib/types";

export function ActiveMissions() {
  const { data: quests = [] } = useQuery({
    queryKey: ['quests'],
    queryFn: getAllQuests
  });

  const { completedQuests } = useGameStore();

  // Calculate quest status
  const questsWithStatus = quests.map(quest => {
    const previousQuestIds = quest.previousQuests?.map(pq => pq.previousQuestId) ?? [];
    
    let status: QuestStatus = "locked";
    if (completedQuests.includes(quest.id)) {
      status = "completed";
    } else {
      const prerequisitesMet = previousQuestIds.every(prereqId => completedQuests.includes(prereqId));
      status = prerequisitesMet ? "active" : "locked";
    }
    
    return { ...quest, status };
  });

  const activeQuests = questsWithStatus.filter(q => q.status === "active").slice(0, 4);

  if (activeQuests.length === 0) {
    return (
      <section>
        <h2 className="text-2xl font-bold text-cyan-400 mb-6 flex items-center gap-2">
          <Target className="text-cyan-400" size={24} />
          Active Missions
        </h2>
        
        <Card className="bg-slate-900/50 border-cyan-500/20 p-6">
          <p className="text-center text-slate-500 py-8">
            No active missions. Complete prerequisite quests to unlock more!
          </p>
          <Link 
            href="/quests" 
            className="block mt-4 text-center text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            View All Quests →
          </Link>
        </Card>
      </section>
    );
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-cyan-400 flex items-center gap-2">
          <Target className="text-cyan-400" size={24} />
          Active Missions
        </h2>
        <Link 
          href="/quests" 
          className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
        >
          View All →
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {activeQuests.map((quest, index) => (
          <motion.div
            key={quest.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
          >
            <Link href="/quests">
              <Card className="bg-slate-900/50 border-cyan-500/20 hover:border-cyan-500/40 transition-all duration-300 p-6 hover:shadow-[0_0_20px_rgba(6,182,212,0.15)] cursor-pointer h-full">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-cyan-300 truncate">
                        {getLocalizedText(quest.name)}
                      </h3>
                    </div>
                    <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30 flex-shrink-0 ml-2">
                      <CheckCircle2 size={12} className="mr-1" />
                      Active
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    {quest.objectives.slice(0, 2).map((objective, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm text-slate-300">
                        <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 flex-shrink-0 mt-1.5" />
                        <span className="line-clamp-1">{getLocalizedText(objective)}</span>
                      </div>
                    ))}
                    {quest.objectives.length > 2 && (
                      <p className="text-xs text-slate-500 ml-3.5">
                        +{quest.objectives.length - 2} more objectives
                      </p>
                    )}
                  </div>

                  {quest.requirements && quest.requirements.length > 0 && (
                    <div className="pt-2 border-t border-slate-800">
                      <p className="text-xs text-slate-500">
                        {quest.requirements.length} items required
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
