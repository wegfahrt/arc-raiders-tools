"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useGameStore } from "@/lib/stores/game-store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ItemTooltip } from "@/components/ui/item-tooltip";
import { Hammer, Check, Lock, Info, Zap, Wrench, Egg, Shield, Bomb, Cross, Package, Briefcase, Atom, Cog } from "lucide-react";
import { getLocalizedText } from "~/lib/utils";
import { getAllHideoutModules } from "~/server/db/queries/workstations";
import type { RequirementItem, Workstation, WorkstationLevel } from "~/lib/types";

// Map workstation IDs to appropriate icons
const workstationIcons: Record<string, React.ElementType> = {
  scrappy: Egg,        // Rooster - using footprints as a playful reference
  weapon_bench: Hammer,        // Weapons - hammer for crafting
  equipment_bench: Shield,     // Equipment/armor
  explosives_bench: Bomb,      // Explosives
  med_station: Cross,          // Medical
  refiner: Atom,              // Refining/chemistry
  stash: Package,              // Storage
  utility_bench: Briefcase,    // Utility items
  workbench: Cog,              // General workbench
};

export default function Workstations() {
  const { data: workstations = [] } = useQuery({
    queryKey: ['workstations'],
    queryFn: getAllHideoutModules,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  console.log('Workstations:', workstations);

  const { workstationLevels, upgradeWorkstation, inventory } = useGameStore();

  // Calculate the maximum height needed across ALL workstations to prevent layout shifts
  const maxRequirementsHeight = useMemo(() => {
    let maxHeight = 0;
    workstations.forEach(workstation => {
      workstation.levels.forEach((level: WorkstationLevel) => {
        const reqCount = level.requirements.length;
        const otherReqCount = level.otherRequirements?.length || 0;
        // Each requirement item ~64px, other requirements ~36px, plus headers and spacing
        const height = (reqCount * 64) + (otherReqCount * 36) + 120;
        maxHeight = Math.max(maxHeight, height);
        // Add the height of the upgrade button if applicable
        const currentLevel = workstationLevels[workstation.id] ?? 0;
        if (currentLevel === level.level && currentLevel < workstation.maxLevel) {
          maxHeight += 22;
        }
      });
    });
    return maxHeight;
  }, [workstations, workstationLevels]);

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
              maxHeight={maxRequirementsHeight}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function WorkstationCard({ 
  workstation, 
  index, 
  currentLevel,
  onUpgrade,
  inventory,
  maxHeight
}: {
  workstation: Workstation;
  index: number;
  currentLevel: number;
  onUpgrade: () => void;
  inventory: Record<string, number>;
  maxHeight: number;
}) {
  // Default to current level tab
  const [selectedLevel, setSelectedLevel] = useState(currentLevel.toString());
  
  // Get the appropriate icon for this workstation
  const WorkstationIcon = workstationIcons[workstation.id] || Wrench;

  const handleUpgrade = () => {
    onUpgrade();
    // Switch to the new level tab after upgrade
    setSelectedLevel((currentLevel + 1).toString());
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <Card className="bg-slate-900/50 border-cyan-500/20 hover:border-cyan-500/40 transition-all duration-300 overflow-hidden">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-cyan-500/20">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-cyan-500/10 rounded-lg border border-cyan-500/30">
              <WorkstationIcon className="text-cyan-400" size={24} />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-cyan-300">{getLocalizedText(workstation.name)}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs border-cyan-500/30 text-cyan-400">
                  Level {currentLevel}/{workstation.maxLevel}
                </Badge>
                <Progress 
                  value={(currentLevel / (workstation.maxLevel ?? 1)) * 100} 
                  className="h-1.5 flex-1 max-w-[120px]" 
                />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs 
          value={selectedLevel} 
          onValueChange={setSelectedLevel}
          className="w-full"
        >
          {/* Tab List - Cleaner, more spaced design */}
          <div className="border-b border-slate-700/30 bg-slate-800/20">
            <TabsList className="w-full h-auto p-0 bg-transparent rounded-none flex overflow-x-auto">
              {workstation.levels.map((level: WorkstationLevel, levelIndex: number) => {
                const isCompleted = levelIndex < currentLevel;
                const isCurrent = levelIndex === currentLevel;
                const isLocked = levelIndex > currentLevel;

                return (
                  <TabsTrigger
                    key={levelIndex}
                    value={levelIndex.toString()}
                    className={`
                      flex-1 min-w-0 px-3 sm:px-4 py-3 text-sm font-medium transition-all
                      flex flex-col items-center gap-1.5 justify-center
                      bg-transparent border-b-2 border-transparent rounded-none
                      data-[state=active]:bg-slate-800/40
                      hover:bg-slate-800/30
                      ${isCompleted ? "text-blue-400" : ""}
                      ${isCurrent ? "text-cyan-400 data-[state=active]:border-cyan-400" : ""}
                      ${isLocked ? "text-slate-500" : ""}
                    `}
                  >
                    {/* Status Icon */}
                    <div className={`
                      w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-xs
                      border-2 transition-all
                      ${isCompleted ? "bg-blue-500/10 border-blue-400/60" : ""}
                      ${isCurrent ? "bg-cyan-500/10 border-cyan-400/60" : ""}
                      ${isLocked ? "bg-slate-700/10 border-slate-600/40" : ""}
                    `}>
                      {isCompleted ? (
                        <Check size={14} className="sm:w-4 sm:h-4" />
                      ) : isLocked ? (
                        <Lock size={10} className="sm:w-3 sm:h-3" />
                      ) : (
                        <span className="font-bold text-xs">{level.level}</span>
                      )}
                    </div>
                    
                    {/* Level Text - Hidden on mobile for compactness */}
                    <span className="hidden sm:block text-xs whitespace-nowrap">
                      Lvl {level.level}
                    </span>
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>

          {/* Tab Content - Fixed height to prevent shifts */}
          <div className="p-6 flex flex-col" style={{ minHeight: `${maxHeight}px`}}>
            {workstation.maxLevel === 0 ? (
              <div className="flex items-center justify-center flex-1 h-">
                <div className="text-center space-y-2">
                  <h3 className="text-lg font-semibold text-cyan-300">This workstation cannot be upgraded.</h3>
                  <p className="text-sm text-slate-400">This is a base facility with no upgrade levels available.</p>
                </div>
              </div>
            ) : (
              workstation.levels.map((level: WorkstationLevel, levelIndex: number) => {
                const isCurrent = levelIndex === currentLevel;
                const isCompleted = levelIndex < currentLevel;

                return (
                  <TabsContent 
                    key={levelIndex} 
                    value={levelIndex.toString()}
                    className="mt-0 flex flex-col flex-1"
                  >
                  {/* Content wrapper with flex-grow to push button down */}
                  <div className="flex-grow space-y-4">
                    {/* Status Banner */}
                    {isCompleted && (
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
                        <Check className="text-blue-400" size={18} />
                        <span className="text-sm text-blue-300 font-medium">Level Completed</span>
                      </div>
                    )}

                    {/* Requirements Section */}
                    {level.requirements.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                        <span className="w-1 h-4 bg-cyan-400 rounded-full" />
                        Required Materials
                      </h4>
                      
                      <div className="grid grid-cols-1 gap-2">
                        <TooltipProvider delayDuration={300}>
                          {level.requirements.map((req: RequirementItem, i: number) => {
                            const have = inventory[req.itemId] || 0;
                            const hasEnough = have >= req.quantity;

                            return (
                              <Tooltip key={i}>
                                <TooltipTrigger asChild>
                                  <div className={`
                                    flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer
                                    ${hasEnough 
                                      ? "bg-green-500/5 border-green-500/20 hover:border-green-500/40" 
                                      : "bg-slate-800/30 border-slate-700/30 hover:border-slate-600/50"
                                    }
                                  `}>
                                    {/* Item Icon */}
                                    <div className={`
                                      w-12 h-12 rounded-lg flex items-center justify-center border flex-shrink-0
                                      ${hasEnough ? "bg-green-500/10 border-green-500/20" : "bg-slate-800/50 border-slate-700/20"}
                                    `}>
                                      {req.item.imageFilename ? (
                                        <img 
                                          src={req.item.imageFilename} 
                                          alt={getLocalizedText(req.item.name)} 
                                          className="w-full h-full object-cover rounded-lg" 
                                        />
                                      ) : (
                                        <span className="text-slate-600 text-xl">?</span>
                                      )}
                                    </div>

                                    {/* Item Info */}
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium text-slate-200 truncate">
                                        {getLocalizedText(req.item.name)}
                                      </p>
                                      <p className="text-xs text-slate-400">
                                        {req.item.type}
                                      </p>
                                    </div>

                                    {/* Quantity */}
                                    <div className="text-right">
                                      <p className={`text-sm font-bold ${hasEnough ? "text-green-400" : "text-red-400"}`}>
                                        {have}/{req.quantity}
                                      </p>
                                      {!hasEnough && (
                                        <p className="text-xs text-slate-500">
                                          Need {req.quantity - have} more
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent side="right" align="start" className="p-0 border-0 bg-transparent">
                                  <ItemTooltip item={req.item} />
                                </TooltipContent>
                              </Tooltip>
                            );
                          })}
                        </TooltipProvider>
                      </div>
                    </div>
                  )}

                  {/* Other Requirements */}
                  {level.otherRequirements && level.otherRequirements.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                        <span className="w-1 h-4 bg-purple-400 rounded-full" />
                        Additional Requirements
                      </h4>
                      <div className="space-y-2">
                        {level.otherRequirements.map((req: string, i: number) => (
                          <div 
                            key={i} 
                            className="flex items-center gap-2 text-sm text-slate-300 p-2 rounded bg-slate-800/20"
                          >
                            <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                            {req}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  </div>

                  {/* Upgrade Button - Floating for current level at the bottom of its card */}
                  {isCurrent && !isCompleted && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="pb-4"
                    >
                      <Button 
                        className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold shadow-lg shadow-cyan-500/20 border-0"
                        onClick={handleUpgrade}
                        size="lg"
                      >
                        <Zap className="mr-2" size={18} />
                        Upgrade to Level {level.level}
                      </Button>
                    </motion.div>
                  )}
                </TabsContent>
              );
            })
            )}
          </div>
        </Tabs>
      </Card>
    </motion.div>
  );
}
