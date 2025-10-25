"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { questsApi, workstationsApi } from "@/lib/services/api";
import { getItemById } from "@/lib/data/mock-data";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Calculator as CalcIcon, Download, Save, ChevronDown, Plus, X, Package } from "lucide-react";
import type { RequirementItem } from "@/lib/types";

export default function Calculator() {
  const [selectedQuests, setSelectedQuests] = useState<string[]>([]);
  const [selectedUpgrades, setSelectedUpgrades] = useState<string[]>([]);
  const [customMaterials, setCustomMaterials] = useState<RequirementItem[]>([]);

  const { data: quests = [] } = useQuery({
    queryKey: ['quests'],
    queryFn: questsApi.getAll
  });

  const { data: workstations = [] } = useQuery({
    queryKey: ['workstations'],
    queryFn: workstationsApi.getAll
  });

  const toggleQuest = (questId: string) => {
    setSelectedQuests(prev => 
      prev.includes(questId) 
        ? prev.filter(id => id !== questId)
        : [...prev, questId]
    );
  };

  const toggleUpgrade = (upgradeId: string) => {
    setSelectedUpgrades(prev => 
      prev.includes(upgradeId) 
        ? prev.filter(id => id !== upgradeId)
        : [...prev, upgradeId]
    );
  };

  // Calculate total materials needed
  const calculateMaterials = () => {
    const materials: Record<string, { itemId: string; category: string; quantity: number }> = {};

    // helper: ensure a material entry exists and return it
    const ensureMaterial = (itemId: string, fallbackCategory?: string) => {
      if (!materials[itemId]) {
        const item = getItemById(itemId);
        materials[itemId] = {
          itemId,
          category: item?.type ?? (fallbackCategory ?? "Unknown"),
          quantity: 0
        };
      }
      return materials[itemId];
    };
    
    // Add quest requirements
    selectedQuests.forEach(questId => {
      const quest = quests.find(q => q.id === questId);
      quest?.requiredItemIds?.forEach(req => {
        if (!req?.itemId) return; // defensive
        const mat = ensureMaterial(req.itemId);
        mat.quantity += req.quantity ?? 0;
      });
    });

    // Add workstation upgrade requirements
    selectedUpgrades.forEach(upgradeId => {
      const [workstationId, levelStr] = upgradeId.split('-level-');
      const workstation = workstations.find(w => w.id === workstationId);
      const level = parseInt(levelStr ?? "0", 10);
      const levelData = workstation?.levels?.[level]; // safer indexing
      
      levelData?.requirementItemIds?.forEach(req => {
        if (!req?.itemId) return; // defensive
        const mat = ensureMaterial(req.itemId);
        mat.quantity += req.quantity ?? 0;
      });
    });

    // Add custom materials
    customMaterials.forEach(mat => {
      if (!mat?.itemId) return; // defensive
      const entry = ensureMaterial(mat.itemId, "Custom");
      entry.quantity += mat.quantity ?? 0;
    });

    // Group by category
    type MaterialEntry = { itemId: string; category: string; quantity: number };
    const grouped: Record<string, Record<string, MaterialEntry>> = {};
    Object.values(materials).forEach(mat => {
      const cat = mat.category;
      let bucket = grouped[cat];
      if (!bucket) {
        bucket = {};
        grouped[cat] = bucket;
      }
      bucket[mat.itemId] = mat;
    });

    return grouped;
  };

  const materialsByCategory = calculateMaterials();
  const hasSelections = selectedQuests.length > 0 || selectedUpgrades.length > 0 || customMaterials.length > 0;

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-cyan-400 mb-6 flex items-center gap-2">
          <CalcIcon size={32} />
          Material Calculator
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Selections */}
          <div className="lg:col-span-1 space-y-6">
            {/* Quests */}
            <Card className="bg-slate-900/50 border-cyan-500/20 p-6">
              <h2 className="text-lg font-semibold text-cyan-300 mb-4">Select Quests</h2>
              <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar">
                {quests.map(quest => (
                  <div key={quest.id} className="flex items-start gap-3 p-2 rounded hover:bg-slate-800/50">
                    <Checkbox
                      checked={selectedQuests.includes(quest.id)}
                      onCheckedChange={() => toggleQuest(quest.id)}
                      className="mt-0.5"
                    />
                    <div className="flex-1">
                      <p className="text-sm text-slate-300">{quest.name}</p>
                      <p className="text-xs text-slate-500">{quest.trader}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Workstation Upgrades */}
            <Card className="bg-slate-900/50 border-cyan-500/20 p-6">
              <h2 className="text-lg font-semibold text-cyan-300 mb-4">Select Upgrades</h2>
              <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar">
                {workstations.map(ws => (
                  <Collapsible key={ws.id}>
                    <CollapsibleTrigger className="flex items-center justify-between w-full p-2 rounded hover:bg-slate-800/50 text-left">
                      <span className="text-sm text-slate-300">{ws.name}</span>
                      <ChevronDown size={16} className="text-slate-400" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pl-4 space-y-2 mt-2">
                      {ws.levels.map((level, idx) => {
                        const upgradeId = `${ws.id}-level-${idx}`;
                        return (
                          <div key={idx} className="flex items-center gap-3 p-2 rounded hover:bg-slate-800/30">
                            <Checkbox
                              checked={selectedUpgrades.includes(upgradeId)}
                              onCheckedChange={() => toggleUpgrade(upgradeId)}
                            />
                            <span className="text-xs text-slate-400">Level {level.level}</span>
                          </div>
                        );
                      })}
                    </CollapsibleContent>
                  </Collapsible>
                ))}
              </div>
            </Card>

            {/* Custom Materials */}
            <Card className="bg-slate-900/50 border-cyan-500/20 p-6">
              <h2 className="text-lg font-semibold text-cyan-300 mb-4">Custom Materials</h2>
              <div className="space-y-3">
                {customMaterials.map((mat, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Input 
                      value={mat.itemId} 
                      onChange={(e) => {
                        // use functional update to avoid indexing into a stale/undefined array
                        const newValue = e.target.value;
                        setCustomMaterials(prev => prev.map((m, i) => i === idx ? { ...m, itemId: newValue } : m));
                      }}
                      placeholder="Item name"
                      className="flex-1 bg-slate-800/50 border-cyan-500/20 text-sm"
                    />
                    <Input 
                      type="number" 
                      value={mat.quantity}
                      onChange={(e) => {
                        const qty = parseInt(e.target.value, 10) || 0;
                        setCustomMaterials(prev => prev.map((m, i) => i === idx ? { ...m, quantity: qty } : m));
                      }}
                      placeholder="Qty"
                      className="w-20 bg-slate-800/50 border-cyan-500/20 text-sm"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCustomMaterials(customMaterials.filter((_, i) => i !== idx))}
                      className="p-2"
                    >
                      <X size={16} />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCustomMaterials([...customMaterials, { itemId: "", quantity: 1 }])}
                  className="w-full border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
                >
                  <Plus size={16} className="mr-2" />
                  Add Material
                </Button>
              </div>
            </Card>
          </div>

          {/* Right Panel - Results */}
          <div className="lg:col-span-2">
            <Card className="bg-slate-900/50 border-cyan-500/20 p-6 min-h-[600px]">
              {hasSelections ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-cyan-300">Required Materials</h2>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="gap-2">
                        <Download size={16} />
                        Export
                      </Button>
                      <Button variant="outline" size="sm" className="gap-2">
                        <Save size={16} />
                        Save
                      </Button>
                    </div>
                  </div>

                  {Object.entries(materialsByCategory).map(([category, materials]) => (
                    <Collapsible key={category} defaultOpen>
                      <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded bg-slate-800/50 hover:bg-slate-800 transition-colors">
                        <span className="font-medium text-cyan-400">{category}</span>
                        <ChevronDown size={20} className="text-cyan-400" />
                      </CollapsibleTrigger>
                      <CollapsibleContent className="mt-2 space-y-2">
                        {Object.values(materials).map(mat => {
                          const item = getItemById(mat.itemId);
                          const have = 0; // Would come from inventory
                          const deficit = Math.max(0, mat.quantity - have);

                          return (
                            <div key={mat.itemId} className="flex items-center justify-between p-3 rounded bg-slate-800/30">
                              <div className="flex-1">
                                <p className="text-slate-300">{item?.name || mat.itemId}</p>
                                <p className="text-xs text-slate-500">
                                  Have: {have} / Need: {mat.quantity}
                                </p>
                              </div>
                              {deficit > 0 && (
                                <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                                  -{deficit}
                                </Badge>
                              )}
                              {deficit === 0 && (
                                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                                  Complete
                                </Badge>
                              )}
                            </div>
                          );
                        })}
                      </CollapsibleContent>
                    </Collapsible>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <Package size={64} className="text-slate-600 mb-4" />
                  <h3 className="text-xl font-semibold text-slate-400 mb-2">No Selections</h3>
                  <p className="text-slate-500">
                    Select quests, upgrades, or add custom materials to see the total requirements
                  </p>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
