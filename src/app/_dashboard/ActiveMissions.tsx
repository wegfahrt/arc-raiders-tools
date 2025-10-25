"use client";

import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { questsApi } from "@/lib/services/api";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { User, Target } from "lucide-react";

export function ActiveMissions() {
  const { data: quests = [] } = useQuery({
    queryKey: ['quests'],
    queryFn: questsApi.getAll
  });

  const activeQuests = quests.filter(q => q.status === "active").slice(0, 2);

  return (
    <section>
      <h2 className="text-2xl font-bold text-cyan-400 mb-6 flex items-center gap-2">
        <Target className="text-cyan-400" size={24} />
        Active Missions
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {activeQuests.map((quest, index) => (
          <motion.div
            key={quest.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
          >
            <Card className="bg-slate-900/50 border-cyan-500/20 hover:border-cyan-500/40 transition-all duration-300 p-6 hover:shadow-[0_0_20px_rgba(6,182,212,0.15)]">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-cyan-300">{quest.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <User size={14} className="text-slate-400" />
                      <span className="text-sm text-slate-400">{quest.trader}</span>
                    </div>
                  </div>
                  <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
                    {quest.xp} XP
                  </Badge>
                </div>

                <div className="space-y-2">
                  {quest.objectives.slice(0, 2).map((objective, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-slate-300">
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                      {objective}
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Progress</span>
                    <span className="text-cyan-400">50%</span>
                  </div>
                  <Progress value={50} className="h-2" />
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
