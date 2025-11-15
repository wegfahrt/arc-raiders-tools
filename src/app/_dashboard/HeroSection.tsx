"use client";

import { motion } from "framer-motion";
import { Target, Package, TrendingUp, Hammer } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getAllQuests } from "~/server/db/queries/quests";
import { getAllHideoutModules } from "~/server/db/queries/workstations";
import { useGameStore } from "@/lib/stores/game-store";
import type { WorkstationLevel } from "~/lib/types";
import Link from "next/link";

export function HeroSection() {
  const { data: quests = [] } = useQuery({
    queryKey: ['quests'],
    queryFn: getAllQuests
  });

  const { data: workstations = [] } = useQuery({
    queryKey: ['workstations'],
    queryFn: getAllHideoutModules
  });

  const { completedQuests, workstationLevels } = useGameStore();

  const totalQuests = quests.length;
  const completedQuestsCount = completedQuests.length;

  // Calculate total workstation levels across all workstations
  const totalWorkstationLevels = workstations.reduce((total, ws) => {
    return total + ws.levels.length;
  }, 0);

  const completedWorkstationLevels = Object.values(workstationLevels).reduce((sum, level) => sum + level, 0);

  // Calculate overall completion rate
  // Each quest completion = 1 point, each workstation level = 1 point
  // This structure makes it easy to add project phases in the future
  const totalProgressPoints = totalQuests + totalWorkstationLevels; // Add project phases here in future
  const completedProgressPoints = completedQuestsCount + completedWorkstationLevels; // Add completed project phases here in future
  const overallCompletionPercentage = totalProgressPoints > 0 
    ? Math.round((completedProgressPoints / totalProgressPoints) * 100) 
    : 0;

  const questCompletionPercentage = totalQuests > 0 ? Math.round((completedQuestsCount / totalQuests) * 100) : 0;
  const workstationCompletionPercentage = totalWorkstationLevels > 0 ? Math.round((completedWorkstationLevels / totalWorkstationLevels) * 100) : 0;

  const stats = [
    {
      icon: Target,
      label: "Quest Progress",
      value: `${completedQuestsCount}/${totalQuests}`,
      subValue: `${questCompletionPercentage}% Complete`,
      color: "cyan",
      link: "/quests"
    },
    {
      icon: Hammer,
      label: "Workstations",
      value: `${completedWorkstationLevels}/${totalWorkstationLevels}`,
      subValue: `${workstationCompletionPercentage}% Complete`,
      color: "blue",
      link: "/workstations"
    },
    {
      icon: Package,
      label: "Stash Value",
      value: "Coming Soon",
      subValue: "Inventory worth",
      color: "purple",
      link: "/items"
    },
    {
      icon: TrendingUp,
      label: "Overall Progress",
      value: `${overallCompletionPercentage}%`,
      subValue: `${completedProgressPoints}/${totalProgressPoints} milestones`,
      color: "green"
    }
  ];

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-b border-cyan-500/20">

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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            const cardContent = (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="bg-slate-900/50 backdrop-blur-sm border border-cyan-500/20 rounded-lg p-6 hover:border-cyan-500/40 transition-all duration-300 h-full"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
                    <Icon className="text-cyan-400" size={24} />
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">{stat.label}</p>
                    <p className="text-2xl font-bold text-cyan-300">{stat.value}</p>
                    <p className="text-xs text-slate-500 mt-1">{stat.subValue}</p>
                  </div>
                </div>
              </motion.div>
            );

            return stat.link ? (
              <Link key={stat.label} href={stat.link} className="block">
                {cardContent}
              </Link>
            ) : (
              cardContent
            );
          })}
        </div>
      </div>
    </div>
  );
}
