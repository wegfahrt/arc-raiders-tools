"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useGameStore } from "@/lib/stores/game-store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Hammer, Check, Lock, ChevronDown, Info } from "lucide-react";
import { getLocalizedText } from "~/lib/utils";
import { getAllHideoutModules } from "~/server/db/queries/workstations";
import type { RequirementItem, Workstation, WorkstationLevel } from "~/lib/types";

export default function Workstations() {
  const { data: workstations = [] } = useQuery({
    queryKey: ['workstations'],
    queryFn: getAllHideoutModules
  });

  console.log('Workstations:', workstations);

  const { workstationLevels, upgradeWorkstation, inventory } = useGameStore();

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-cyan-400">Workstations</h1>
        </div>

        {/* Info Banner */}
        <Card className="bg-blue-500/10 border-blue-500/30 p-4">
          <div className="flex gap-3">
            <Info className="text-blue-400 flex-shrink-0" size={20} />
            <p className="text-sm text-blue-200">
              Upgrade workstations to unlock new crafting options and enhance your capabilities. 
              Collect required materials and meet prerequisites to advance each level.
            </p>
          </div>
        </Card>

        {/* Workstations Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {workstations.map((workstation, index) => (
            <WorkstationCard
              key={workstation.id}
              workstation={workstation}
              index={index}
              currentLevel={workstationLevels[workstation.id] || 0}
              onUpgrade={() => upgradeWorkstation(workstation.id)}
              inventory={inventory}
            />
          ))}
        </div>

        {/* Summary Card */}
        <Card className="bg-slate-900/50 border-cyan-500/20 p-6">
          <h2 className="text-xl font-semibold text-cyan-400 mb-4">Progress Summary</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {workstations.map(ws => {
              const current = workstationLevels[ws.id] || 0;
              const progress = (current / (ws.maxLevel ?? 1)) * 100;
              return (
                <div key={ws.id} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-300">{getLocalizedText(ws.name)}</span>
                    <span className="text-cyan-400">Lvl {current}/{ws.maxLevel}</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}

function WorkstationCard({ 
  workstation, 
  index, 
  currentLevel,
  onUpgrade,
  inventory
}: {
  workstation: Workstation;
  index: number;
  currentLevel: number;
  onUpgrade: () => void;
  inventory: Record<string, number>;
}) {

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <Card className="bg-slate-900/50 border-cyan-500/20 hover:border-cyan-500/40 transition-all duration-300 p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start gap-4">
            <div className="p-3 bg-cyan-500/10 rounded-lg border border-cyan-500/30">
              <Hammer className="text-cyan-400" size={24} />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-cyan-300">{getLocalizedText(workstation.name)}</h3>
            </div>
          </div>

          {/* Overall Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Overall Progress</span>
              <span className="text-cyan-400">Level {currentLevel}/{workstation.maxLevel}</span>
            </div>
          </div>

          {/* Levels */}
          <Accordion type="multiple" className="space-y-2">
            {workstation.levels.map((level: WorkstationLevel, levelIndex: number) => {
              const isCompleted = levelIndex < currentLevel;
              const isCurrent = levelIndex === currentLevel;
              const isLocked = levelIndex > currentLevel;

              return (
                <AccordionItem 
                  key={levelIndex} 
                  value={`level-${levelIndex}`}
                  className={`
                    border rounded-lg transition-all
                    ${isCompleted ? "border-blue-500/30 bg-blue-500/5" : ""}
                    ${isCurrent ? "border-cyan-500/50 bg-cyan-500/5" : ""}
                    ${isLocked ? "border-slate-700/30 bg-slate-800/20" : ""}
                  `}
                >
                  <AccordionTrigger className="px-4 hover:no-underline">
                    <div className="flex items-center gap-3">
                      <div className={`
                        w-8 h-8 rounded-full flex items-center justify-center border-2
                        ${isCompleted ? "bg-blue-500 border-blue-400" : ""}
                        ${isCurrent ? "bg-cyan-500/20 border-cyan-400" : ""}
                        ${isLocked ? "bg-slate-800 border-slate-600" : ""}
                      `}>
                        {isCompleted ? (
                          <Check size={16} className="text-white" />
                        ) : isLocked ? (
                          <Lock size={16} className="text-slate-400" />
                        ) : (
                          <span className="text-cyan-400 text-sm font-bold">{level.level}</span>
                        )}
                      </div>
                      <span className={`
                        font-medium
                        ${isCompleted ? "text-blue-300" : ""}
                        ${isCurrent ? "text-cyan-300" : ""}
                        ${isLocked ? "text-slate-400" : ""}
                      `}>
                        Level {level.level}
                      </span>
                    </div>
                  </AccordionTrigger>

                  <AccordionContent className="px-4 pb-4">
                    <div className="space-y-3 pt-2">
                      {/* Materials */}
                      {level.requirements.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-slate-300">Required Materials:</p>
                          {level.requirements.map((req: RequirementItem, i: number) => {
                            const have = inventory[req.itemId] || 0;
                            const hasEnough = have >= req.quantity;

                            return (
                              <div key={i} className="flex items-center justify-between text-sm pl-4">
                                <span className="text-slate-300">
                                  {getLocalizedText(req.item.name)}
                                </span>
                                <span className={hasEnough ? "text-green-400" : "text-red-400"}>
                                  {have}/{req.quantity}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Other Requirements */}
                      {level.otherRequirements && level.otherRequirements.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-slate-300">Additional Requirements:</p>
                          {level.otherRequirements.map((req: string, i: number) => (
                            <div key={i} className="text-sm text-slate-400 pl-4">
                              • {req}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Upgrade Button */}
                      {isCurrent && (
                        <Button 
                          className="w-full mt-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                          onClick={onUpgrade}
                        >
                          Upgrade to Level {level.level + 1}
                        </Button>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </div>
      </Card>
    </motion.div>
  );
}
