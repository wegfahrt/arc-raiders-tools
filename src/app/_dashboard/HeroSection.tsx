"use client";

import { motion } from "framer-motion";
import { Target, CheckCircle2, Package } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { questsApi } from "@/lib/services/api";
import { useGameStore } from "@/lib/stores/game-store";

export function HeroSection() {
  const { data: quests = [] } = useQuery({
    queryKey: ['quests'],
    queryFn: questsApi.getAll
  });

  const { questProgress } = useGameStore();

  const totalQuests = quests.length;
  const completedQuests = quests.filter(q => q.status === "completed").length;
  const completionPercentage = totalQuests > 0 ? Math.round((completedQuests / totalQuests) * 100) : 0;

  const stats = [
    {
      icon: Target,
      label: "Quest Progress",
      value: `${completedQuests}/${totalQuests}`,
      color: "cyan"
    },
    {
      icon: CheckCircle2,
      label: "Completion Rate",
      value: `${completionPercentage}%`,
      color: "blue"
    },
    {
      icon: Package,
      label: "Inventory Value",
      value: "Coming Soon",
      color: "purple"
    }
  ];

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-b border-cyan-500/20">
      {/* Animated particles background */}
      {/* <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-cyan-400/30 rounded-full"
            initial={{ 
              x: Math.random() * 100 + "%", 
              y: Math.random() * 100 + "%",
              scale: Math.random() * 0.5 + 0.5
            }}
            animate={{ 
              y: [null, Math.random() * -100 + "%"],
              opacity: [0.3, 0.8, 0.3]
            }}
            transition={{ 
              duration: Math.random() * 5 + 5, 
              repeat: Infinity,
              ease: "linear"
            }}
          />
        ))}
      </div> */}

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-4 mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-cyan-400 text-glow">
            Welcome, Raider
          </h1>
          <p className="text-slate-300 text-lg">
            Track your progress and optimize your loadout
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-slate-900/50 backdrop-blur-sm border border-cyan-500/20 rounded-lg p-6 hover:border-cyan-500/40 transition-all duration-300 hover:shadow-[0_0_20px_rgba(6,182,212,0.2)]"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg bg-${stat.color}-500/10 border border-${stat.color}-500/30`}>
                    <Icon className={`text-${stat.color}-400`} size={24} />
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">{stat.label}</p>
                    <motion.p 
                      className="text-2xl font-bold text-cyan-300"
                      initial={{ scale: 1 }}
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 0.3, delay: index * 0.1 + 0.6 }}
                    >
                      {stat.value}
                    </motion.p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
