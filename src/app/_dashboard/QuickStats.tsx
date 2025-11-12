"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Target, Package, Hammer, Calculator } from "lucide-react";
import { getAllQuests } from "~/server/db/queries/quests";
import { getAllItems } from "~/server/db/queries/items";
import { getAllHideoutModules } from "~/server/db/queries/workstations";
import { useGameStore } from "@/lib/stores/game-store";
import Link from "next/link";

export function QuickStats() {
  const { data: quests = [] } = useQuery({
    queryKey: ['quests'],
    queryFn: getAllQuests
  });

  const { data: items = [] } = useQuery({
    queryKey: ['items'],
    queryFn: getAllItems
  });

  const { data: workstations = [] } = useQuery({
    queryKey: ['workstations'],
    queryFn: getAllHideoutModules
  });

  const { completedQuests, workstationLevels, trackedItems } = useGameStore();

  const totalWorkstationLevels = workstations.reduce((total, ws) => {
    return total + ws.levels.length;
  }, 0);

  const completedWorkstationLevels = Object.values(workstationLevels).reduce((sum, level) => sum + level, 0);

  const stats = [
    {
      label: "Quests",
      value: `${completedQuests.length}/${quests.length}`,
      icon: Target,
      color: "cyan",
      href: "/quests",
      progress: quests.length > 0 ? (completedQuests.length / quests.length) * 100 : 0
    },
    {
      label: "Items Tracked",
      value: trackedItems.length,
      icon: Package,
      color: "purple",
      href: "/items"
    },
    {
      label: "Workstations",
      value: `${completedWorkstationLevels}/${totalWorkstationLevels}`,
      icon: Hammer,
      color: "blue",
      href: "/workstations"
    },
    {
      label: "Total Items",
      value: items.length,
      icon: Calculator,
      color: "green",
      href: "/calculator"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
          >
            <Link href={stat.href}>
              <Card className={`
                bg-slate-900/50 border-cyan-500/20 p-6 
                hover:border-cyan-500/40 hover:shadow-[0_0_20px_rgba(6,182,212,0.2)]
                transition-all duration-300 cursor-pointer
              `}>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-slate-400">{stat.label}</p>
                    <p className="text-2xl font-bold text-cyan-300 mt-1">
                      {stat.value}
                    </p>

                  </div>
                  <div className={`p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/30`}>
                    <Icon className="text-cyan-400" size={24} />
                  </div>
                </div>
              </Card>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}
