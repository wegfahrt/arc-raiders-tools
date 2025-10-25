"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Package, Hammer, TrendingUp } from "lucide-react";

export function DashboardPanels() {
  const materials = [
    { name: "Metal Parts", current: 25, needed: 50, progress: 50 },
    { name: "Fabric", current: 10, needed: 30, progress: 33 },
    { name: "Tick Pod", current: 3, needed: 5, progress: 60 }
  ];

  const upgrades = [
    { name: "Weapon Bench", level: 1, maxLevel: 3 },
    { name: "Armor Station", level: 0, maxLevel: 3 }
  ];

  const recentLoot = [
    { name: "Sentinel Core", rarity: "Epic" },
    { name: "Metal Parts", rarity: "Common" },
    { name: "Herbal Bandages", rarity: "Common" }
  ];

  const rarityColors = {
    Common: "bg-slate-500/20 text-slate-400 border-slate-500/30",
    Uncommon: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
    Epic: "bg-purple-500/20 text-purple-400 border-purple-500/30"
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Resource Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <Card className="bg-slate-900/50 border-cyan-500/20 p-6">
          <h3 className="text-lg font-semibold text-cyan-400 mb-4 flex items-center gap-2">
            <Package size={20} />
            Resource Status
          </h3>
          <div className="space-y-4">
            {materials.map((material, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-300">{material.name}</span>
                  <span className="text-cyan-400">
                    {material.current}/{material.needed}
                  </span>
                </div>
                <Progress value={material.progress} className="h-2" />
              </div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Facility Upgrades */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <Card className="bg-slate-900/50 border-cyan-500/20 p-6">
          <h3 className="text-lg font-semibold text-cyan-400 mb-4 flex items-center gap-2">
            <Hammer size={20} />
            Facility Upgrades
          </h3>
          <div className="space-y-4">
            {upgrades.map((upgrade, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-300 text-sm">{upgrade.name}</span>
                  <span className="text-xs text-slate-400">
                    Lvl {upgrade.level}/{upgrade.maxLevel}
                  </span>
                </div>
                <Button 
                  size="sm" 
                  className="w-full bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                  disabled={upgrade.level === upgrade.maxLevel}
                >
                  {upgrade.level === upgrade.maxLevel ? "Max Level" : "Upgrade"}
                </Button>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Recent Loot */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
      >
        <Card className="bg-slate-900/50 border-cyan-500/20 p-6">
          <h3 className="text-lg font-semibold text-cyan-400 mb-4 flex items-center gap-2">
            <TrendingUp size={20} />
            Recent Loot
          </h3>
          <div className="space-y-3">
            {recentLoot.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-slate-300 text-sm">{item.name}</span>
                <Badge className={rarityColors[item.rarity as keyof typeof rarityColors]}>
                  {item.rarity}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
