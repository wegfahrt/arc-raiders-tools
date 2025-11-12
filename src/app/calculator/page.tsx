"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Calculator as CalcIcon, Download, Save, ChevronDown, Plus, X, Package, Search, Check, ChevronsUpDown, FolderOpen, Trash2 } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { RequirementItem } from "@/lib/types";
import { getAllQuests } from "~/server/db/queries/quests";
import { getAllHideoutModules} from "~/server/db/queries/workstations";
import { getAllItems } from "~/server/db/queries/items";
import { getAllProjects } from "~/server/db/queries/projects";
import { getLocalizedText } from "~/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "~/components/ui/tooltip";
import { ItemTooltip } from "~/components/ui/item-tooltip";

interface SavedCalculation {
  id: string;
  name: string;
  timestamp: number;
  selectedQuests: string[];
  selectedUpgrades: string[];
  selectedProjectPhases: string[];
  customMaterials: RequirementItem[];
}

export default function Calculator() {
  const [selectedQuests, setSelectedQuests] = useState<string[]>([]);
  const [selectedUpgrades, setSelectedUpgrades] = useState<string[]>([]);
  const [selectedProjectPhases, setSelectedProjectPhases] = useState<string[]>([]);
  const [customMaterials, setCustomMaterials] = useState<RequirementItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [openComboboxIndex, setOpenComboboxIndex] = useState<number | null>(null);
  const [savedCalculations, setSavedCalculations] = useState<SavedCalculation[]>([]);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [loadDialogOpen, setLoadDialogOpen] = useState(false);
  const [saveName, setSaveName] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [loadTargetId, setLoadTargetId] = useState<string | null>(null);

  const { data: quests = [], isLoading: isLoadingQuests } = useQuery({
    queryKey: ['quests'],
    queryFn: getAllQuests
  });

  const { data: allWorkstations = [], isLoading: isLoadingWorkstations } = useQuery({
    queryKey: ['workstations'],
    queryFn: getAllHideoutModules
  });

  const workstations = allWorkstations.filter(ws => ws.id != "workbench" && ws.id != "stash");

  const { data: allItems = [], isLoading: isLoadingItems } = useQuery({
    queryKey: ['items'],
    queryFn: getAllItems,
    staleTime: 1000 * 60 * 10 // 10 minutes
  });

  const { data: allProjects = [], isLoading: isLoadingProjects } = useQuery({
    queryKey: ['projects'],
    queryFn: getAllProjects,
    staleTime: 1000 * 60 * 10 // 10 minutes
  });

  // Load saved calculations from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('arc-calculator-saves');
      if (saved) {
        const parsed = JSON.parse(saved) as SavedCalculation[];
        // Validate that saved calculations have valid structure
        const validated = parsed.filter(calc => 
          calc.id && 
          calc.name && 
          Array.isArray(calc.selectedQuests) &&
          Array.isArray(calc.selectedUpgrades) &&
          Array.isArray(calc.selectedProjectPhases) &&
          Array.isArray(calc.customMaterials)
        );
        setSavedCalculations(validated);
      }
    } catch (error) {
      console.error('Failed to load saved calculations:', error);
    }
  }, []);

  // Track unsaved changes
  useEffect(() => {
    setHasUnsavedChanges(
      selectedQuests.length > 0 || 
      selectedUpgrades.length > 0 || 
      selectedProjectPhases.length > 0 || 
      customMaterials.length > 0
    );
  }, [selectedQuests, selectedUpgrades, selectedProjectPhases, customMaterials]);

  if (isLoadingQuests || isLoadingWorkstations || isLoadingItems || isLoadingProjects) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-500">Loading...</p>
      </div>
    );
  }

  // Create a lookup function for items
  const getItemFromCache = (itemId: string) => {
    return allItems.find(item => item.id === itemId);
  };

  const toggleQuest = (questId: string) => {
    setSelectedQuests(prev => 
      prev.includes(questId) 
        ? prev.filter(id => id !== questId)
        : [...prev, questId]
    );
  };

  const toggleAllQuests = () => {
    if (selectedQuests.length === quests.length) {
      // If all selected, deselect all
      setSelectedQuests([]);
    } else {
      // Select all
      setSelectedQuests(quests.map(q => q.id));
    }
  };

  const toggleUpgrade = (upgradeId: string) => {
    setSelectedUpgrades(prev => 
      prev.includes(upgradeId) 
        ? prev.filter(id => id !== upgradeId)
        : [...prev, upgradeId]
    );
  };

  const toggleAllUpgrades = () => {
    // Get all possible upgrade IDs
    const allUpgradeIds = workstations.flatMap(ws => 
      ws.levels.map((level, idx) => `${ws.id}-level-${idx}`)
    );

    if (selectedUpgrades.length === allUpgradeIds.length) {
      // If all selected, deselect all
      setSelectedUpgrades([]);
    } else {
      // Select all
      setSelectedUpgrades(allUpgradeIds);
    }
  };

  const toggleProjectPhase = (phaseId: string) => {
    setSelectedProjectPhases(prev => 
      prev.includes(phaseId) 
        ? prev.filter(id => id !== phaseId)
        : [...prev, phaseId]
    );
  };

  const toggleAllProjectPhases = () => {
    // Get all possible phase IDs
    const allPhaseIds = allProjects.flatMap(project => 
      project.phases.map(phase => `${project.id}-phase-${phase.phase}`)
    );

    if (selectedProjectPhases.length === allPhaseIds.length) {
      // If all selected, deselect all
      setSelectedProjectPhases([]);
    } else {
      // Select all
      setSelectedProjectPhases(allPhaseIds);
    }
  };

  // Validate that selected items still exist in the data
  const validateSavedCalculation = (calc: SavedCalculation): boolean => {
    const validQuests = calc.selectedQuests.filter(id => 
      quests.some(q => q.id === id)
    );
    const validUpgrades = calc.selectedUpgrades.filter(id => {
      const [wsId] = id.split('-level-');
      return workstations.some(ws => ws.id === wsId);
    });
    const validPhases = calc.selectedProjectPhases.filter(id => {
      const [projId] = id.split('-phase-');
      return allProjects.some(p => p.id === projId);
    });
    const validMaterials = calc.customMaterials.filter(mat => 
      allItems.some(item => item.id === mat.itemId)
    );

    // Return true if at least some data is valid
    return validQuests.length > 0 || 
           validUpgrades.length > 0 || 
           validPhases.length > 0 || 
           validMaterials.length > 0;
  };

  // Save current state
  const saveCalculation = () => {
    if (!saveName.trim()) {
      return;
    }

    const newSave: SavedCalculation = {
      id: crypto.randomUUID(),
      name: saveName.trim(),
      timestamp: Date.now(),
      selectedQuests,
      selectedUpgrades,
      selectedProjectPhases,
      customMaterials
    };

    try {
      const updated = [...savedCalculations, newSave];
      setSavedCalculations(updated);
      localStorage.setItem('arc-calculator-saves', JSON.stringify(updated));
      setSaveDialogOpen(false);
      setSaveName("");
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Failed to save calculation:', error);
      alert('Failed to save calculation. Storage may be full.');
    }
  };

  // Load a saved calculation
  const loadCalculation = (calc: SavedCalculation) => {
    if (!validateSavedCalculation(calc)) {
      alert('This saved calculation contains items that no longer exist and cannot be loaded.');
      return;
    }

    // Filter out any items that no longer exist
    const validQuests = calc.selectedQuests.filter(id => 
      quests.some(q => q.id === id)
    );
    const validUpgrades = calc.selectedUpgrades.filter(id => {
      const [wsId] = id.split('-level-');
      return workstations.some(ws => ws.id === wsId);
    });
    const validPhases = calc.selectedProjectPhases.filter(id => {
      const [projId] = id.split('-phase-');
      return allProjects.some(p => p.id === projId);
    });
    const validMaterials = calc.customMaterials.filter(mat => 
      allItems.some(item => item.id === mat.itemId)
    );

    setSelectedQuests(validQuests);
    setSelectedUpgrades(validUpgrades);
    setSelectedProjectPhases(validPhases);
    setCustomMaterials(validMaterials);
    setLoadDialogOpen(false);
    setLoadTargetId(null);
    setHasUnsavedChanges(false);
  };

  // Handle load with unsaved changes warning
  const handleLoadClick = (calcId: string) => {
    const calc = savedCalculations.find(c => c.id === calcId);
    if (calc) loadCalculation(calc);
  };

  // Delete a saved calculation
  const deleteCalculation = (id: string) => {
    try {
      const updated = savedCalculations.filter(s => s.id !== id);
      setSavedCalculations(updated);
      localStorage.setItem('arc-calculator-saves', JSON.stringify(updated));
      setDeleteConfirmId(null);
    } catch (error) {
      console.error('Failed to delete calculation:', error);
    }
  };

  // Get summary of a saved calculation
  const getCalculationSummary = (calc: SavedCalculation) => {
    const parts: string[] = [];
    if (calc.selectedQuests.length > 0) {
      parts.push(`${calc.selectedQuests.length} quest${calc.selectedQuests.length !== 1 ? 's' : ''}`);
    }
    if (calc.selectedUpgrades.length > 0) {
      parts.push(`${calc.selectedUpgrades.length} upgrade${calc.selectedUpgrades.length !== 1 ? 's' : ''}`);
    }
    if (calc.selectedProjectPhases.length > 0) {
      parts.push(`${calc.selectedProjectPhases.length} project${calc.selectedProjectPhases.length !== 1 ? 's' : ''}`);
    }
    if (calc.customMaterials.length > 0) {
      parts.push(`${calc.customMaterials.length} custom material${calc.customMaterials.length !== 1 ? 's' : ''}`);
    }
    return parts.join(', ') || 'Empty';
  };

  // Calculate total materials needed
  const calculateMaterials = () => {
    const materials: Record<string, { itemId: string; category: string; quantity: number }> = {};

    // helper: ensure a material entry exists and return it
    const ensureMaterial = (itemId: string, fallbackCategory?: string) => {
      if (!materials[itemId]) {
        const item = getItemFromCache(itemId);
        // Skip items that don't exist in our filtered list
        if (!item) return null;
        
        materials[itemId] = {
          itemId,
          category: item.type ?? (fallbackCategory ?? "Unknown"),
          quantity: 0
        };
      }
      return materials[itemId];
    };
    
    // Add quest requirements
    selectedQuests.forEach(questId => {
      const quest = quests.find(q => q.id === questId);
      quest?.requirements?.forEach((req: { itemId: string; quantity: number }) => {
        if (!req?.itemId) return;
        const mat = ensureMaterial(req.itemId);
        if (mat) mat.quantity += req.quantity ?? 0;
      });
    });

    // Add workstation upgrade requirements
    selectedUpgrades.forEach(upgradeId => {
      const [workstationId, levelStr] = upgradeId.split('-level-');
      const workstation = workstations.find(w => w.id === workstationId);
      const level = parseInt(levelStr ?? "0", 10);
      const levelData = workstation?.levels?.[level];
      
      levelData?.requirements?.forEach((req: { itemId: string; quantity: number }) => {
        if (!req?.itemId) return;
        const mat = ensureMaterial(req.itemId);
        if (mat) mat.quantity += req.quantity ?? 0;
      });
    });

    // Add project phase requirements
    selectedProjectPhases.forEach(phaseId => {
      const [projectId, phaseStr] = phaseId.split('-phase-');
      const project = allProjects.find(p => p.id === projectId);
      const phaseNum = parseInt(phaseStr ?? "0", 10);
      const phase = project?.phases.find(p => p.phase === phaseNum);
      
      phase?.itemRequirements?.forEach((req) => {
        if (!req?.itemId) return;
        const mat = ensureMaterial(req.itemId);
        if (mat) mat.quantity += req.quantity ?? 0;
      });
    });

    // Add custom materials
    customMaterials.forEach(mat => {
      if (!mat?.itemId) return;
      const entry = ensureMaterial(mat.itemId, "Custom");
      if (entry) entry.quantity += mat.quantity ?? 0;
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
  
  // Filter materials by search query
  const filteredMaterialsByCategory = Object.entries(materialsByCategory).reduce((acc, [category, materials]) => {
    const filteredMaterials = Object.values(materials).filter(mat => {
      const item = getItemFromCache(mat.itemId);
      const itemName = item?.name || mat.itemId;
      return getLocalizedText(itemName).toLowerCase().includes(searchQuery.toLowerCase());
    });
    
    if (filteredMaterials.length > 0) {
      acc[category] = filteredMaterials.reduce((matAcc, mat) => {
        matAcc[mat.itemId] = mat;
        return matAcc;
      }, {} as Record<string, { itemId: string; category: string; quantity: number }>);
    }
    
    return acc;
  }, {} as Record<string, Record<string, { itemId: string; category: string; quantity: number }>>);
  
  const hasSelections = selectedQuests.length > 0 || selectedUpgrades.length > 0 || selectedProjectPhases.length > 0 || customMaterials.length > 0;

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-cyan-400 mb-6 flex items-center gap-2">
          <CalcIcon size={32} />
          Material Calculator
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Selections */}
          <div className="lg:col-span-1 space-y-6 ">
            {/* Quests */}
            <Card className="bg-slate-900/50 border-cyan-500/20 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-cyan-300">Select Quests</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleAllQuests}
                  className="text-xs text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10"
                >
                  {selectedQuests.length === quests.length ? 'Deselect All' : 'Select All'}
                </Button>
              </div>
              <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar">
                {quests.map(quest => (
                  <div key={quest.id} className="flex items-center gap-3 p-2 rounded bg-[oklch(var(--card-light))] hover:bg-slate-800/50">
                    <Checkbox
                      checked={selectedQuests.includes(quest.id)}
                      onCheckedChange={() => toggleQuest(quest.id)}
                      className="mt-0.5"
                    />
                    <div className="flex-1">
                      <p className="text-sm text-slate-300">{getLocalizedText(quest.name)}</p>
                      <p className="text-xs text-slate-500">{quest.trader}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Workstation Upgrades */}
            <Card className="bg-slate-900/50 border-cyan-500/20 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-cyan-300">Select Upgrades</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleAllUpgrades}
                  className="text-xs text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10"
                >
                  {selectedUpgrades.length === workstations.flatMap(ws => ws.levels).length ? 'Deselect All' : 'Select All'}
                </Button>
              </div>
              <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar">
                {workstations.map(ws => (
                  <Collapsible key={ws.id} className="bg-[oklch(var(--card-light))] rounded">
                    <CollapsibleTrigger className="flex items-center justify-between w-full p-2 rounded hover:bg-slate-800/50 text-left ">
                      <span className="text-sm text-slate-300">{getLocalizedText(ws.name)}</span>
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

            {/* Projects */}
            <Card className="bg-slate-900/50 border-cyan-500/20 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-cyan-300">Select Projects</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleAllProjectPhases}
                  className="text-xs text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10"
                >
                  {selectedProjectPhases.length === allProjects.flatMap(p => p.phases).length ? 'Deselect All' : 'Select All'}
                </Button>
              </div>
              <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar">
                {allProjects.map(project => (
                  <Collapsible key={project.id} className="bg-[oklch(var(--card-light))] rounded">
                    <CollapsibleTrigger className="flex items-center justify-between w-full p-2 rounded hover:bg-slate-800/50 text-left">
                      <span className="text-sm text-slate-300">{getLocalizedText(project.name)}</span>
                      <ChevronDown size={16} className="text-slate-400" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pl-4 space-y-2 mt-2">
                      {project.phases.map((phase) => {
                        const phaseId = `${project.id}-phase-${phase.phase}`;
                        return (
                          <div key={phase.phase} className="space-y-1">
                            <div className="flex items-center gap-3 p-2 rounded hover:bg-slate-800/30">
                              <Checkbox
                                checked={selectedProjectPhases.includes(phaseId)}
                                onCheckedChange={() => toggleProjectPhase(phaseId)}
                              />
                              <span className="text-xs text-slate-400">
                                Phase {phase.phase}: {getLocalizedText(phase.name)}
                              </span>
                            </div>
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
                    <Popover open={openComboboxIndex === idx} onOpenChange={(open) => setOpenComboboxIndex(open ? idx : null)}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={openComboboxIndex === idx}
                          className="flex-1 justify-between bg-slate-800/50 border-cyan-500/20 text-sm hover:bg-slate-800 min-w-0"
                        >
                          {mat.itemId ? (
                            <span className="flex items-center gap-2 min-w-0 flex-1">
                              <img 
                                src={`https://cdn.arctracker.io/items/${mat.itemId}.png`} 
                                alt="" 
                                className="w-6 h-6 object-cover rounded flex-shrink-0"
                                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                              />
                              <span className="truncate">
                                {getLocalizedText(getItemFromCache(mat.itemId)?.name) || mat.itemId}
                              </span>
                            </span>
                          ) : (
                            "Select item..."
                          )}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[350px] p-0 bg-slate-900 border-cyan-500/20" align="start">
                        <Command className="bg-slate-900">
                          <CommandInput 
                            placeholder="Search items..." 
                            className="h-9 border-cyan-500/20" 
                          />
                          <CommandList className="max-h-[300px]">
                            <CommandEmpty>No item found.</CommandEmpty>
                            <CommandGroup>
                              {allItems
                                .sort((a, b) => getLocalizedText(a.name).localeCompare(getLocalizedText(b.name)))
                                .map((item) => (
                                  <CommandItem
                                    key={item.id}
                                    value={`${item.id}-${getLocalizedText(item.name)}`}
                                    onSelect={() => {
                                      setCustomMaterials(prev => 
                                        prev.map((m, i) => 
                                          i === idx ? { ...m, itemId: item.id } : m
                                        )
                                      );
                                      setOpenComboboxIndex(null);
                                    }}
                                    className="flex items-center gap-2 cursor-pointer hover:bg-slate-800/50"
                                  >
                                    <img 
                                      src={`https://cdn.arctracker.io/items/${item.id}.png`} 
                                      alt="" 
                                      className="w-8 h-8 object-cover rounded flex-shrink-0"
                                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                    />
                                    <span className="flex-1 truncate">{getLocalizedText(item.name)}</span>
                                    <Check
                                      className={cn(
                                        "h-4 w-4 flex-shrink-0",
                                        mat.itemId === item.id ? "opacity-100 text-cyan-400" : "opacity-0"
                                      )}
                                    />
                                  </CommandItem>
                                ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>

                    <Input
                      type="number"
                      value={mat.quantity}
                      onChange={(e) => {
                        const qty = parseInt(e.target.value, 10) || 0;
                        setCustomMaterials(prev => prev.map((m, i) => i === idx ? { ...m, quantity: qty, moduleId: "custom", level: 1 } : m));
                      }}
                      placeholder="Qty"
                      className="w-20 bg-slate-800/50 border-cyan-500/20 text-sm"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCustomMaterials(customMaterials.filter((_, i) => i !== idx))}
                      className="p-2 hover:bg-red-500/10 hover:text-red-400"
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
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <h2 className="text-xl font-semibold text-cyan-300">Required Materials</h2>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <div className="relative flex-1 sm:flex-initial sm:w-64">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                      <Input
                        placeholder="Search materials..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 bg-slate-900/50 border-cyan-500/20"
                        disabled={!hasSelections}
                      />
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="gap-2 flex-shrink-0"
                      onClick={() => setLoadDialogOpen(true)}
                      disabled={savedCalculations.length === 0}
                    >
                      <FolderOpen size={16} />
                      Load
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="gap-2 flex-shrink-0"
                      onClick={() => setSaveDialogOpen(true)}
                      disabled={!hasSelections}
                    >
                      <Save size={16} />
                      Save
                    </Button>
                  </div>
                </div>

                {hasSelections ? (
                  <>
                    {Object.entries(filteredMaterialsByCategory).map(([category, materials]) => (
                    <Collapsible key={category} defaultOpen>
                      <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded bg-slate-800/50 hover:bg-slate-800 transition-colors">
                        <span className="font-medium text-cyan-400">{category}</span>
                        <ChevronDown size={20} className="text-cyan-400" />
                      </CollapsibleTrigger>
                      <CollapsibleContent className="mt-2 space-y-2">
                        {Object.values(materials).map(mat => {
                          const item = getItemFromCache(mat.itemId);
                          const have = 0; // Would come from inventory
                          const deficit = Math.max(0, mat.quantity - have);

                          return (
                            <div key={mat.itemId} className="flex items-center gap-3 p-3 rounded bg-slate-800/30 hover:bg-slate-800/50 transition-colors">
                              {item && (
                                <TooltipProvider delayDuration={300}>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div className={`
                                        bg-slate-800/50 rounded-lg flex items-center justify-center border border-cyan-500/10
                                        cursor-pointer hover:border-cyan-500/30 transition-colors w-16 h-16 flex-shrink-0
                                      `}>
                                        {item.imageFilename ? (
                                          <img src={item.imageFilename} alt={getLocalizedText(item.name)} className="w-full h-full object-cover rounded-lg" />
                                        ) : (
                                          <span className="text-slate-600 text-2xl">?</span>
                                        )}
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent side="right" align="start" className="p-0 border-0 bg-transparent">
                                      <ItemTooltip item={item} />
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-slate-300 font-medium truncate">{getLocalizedText(item?.name) || mat.itemId}</p>
                                <p className="text-xs text-slate-500">
                                  Have: <span className="text-cyan-400">{have}</span> / Need: <span className="text-slate-400 font-medium">{mat.quantity}</span>
                                </p>
                              </div>
                              {deficit > 0 && (
                                <Badge className="bg-red-500/20 text-red-400 border-red-500/30 flex-shrink-0">
                                  -{deficit}
                                </Badge>
                              )}
                              {deficit === 0 && (
                                <Badge className="bg-green-500/20 text-green-400 border-green-500/30 flex-shrink-0">
                                  Complete
                                </Badge>
                              )}
                            </div>
                          );
                        })}
                      </CollapsibleContent>
                    </Collapsible>
                  ))}
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <Package size={64} className="text-slate-600 mb-4" />
                    <h3 className="text-xl font-semibold text-slate-400 mb-2">No Selections</h3>
                    <p className="text-slate-500">
                      Select quests, upgrades, or add custom materials to see the total requirements
                    </p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Save Dialog */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent className="bg-slate-900 border-cyan-500/20">
          <DialogHeader>
            <DialogTitle className="text-cyan-300">Save Calculation</DialogTitle>
            <DialogDescription className="text-slate-400">
              Give your calculation a name to save it for later.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="save-name" className="text-slate-300">Name</Label>
              <Input
                id="save-name"
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                placeholder="e.g., Level 5 Hideout Build"
                className="bg-slate-800/50 border-cyan-500/20"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && saveName.trim()) {
                    saveCalculation();
                  }
                }}
              />
            </div>
            <div className="text-sm text-slate-400 space-y-1">
              <p className="font-medium">Current selections:</p>
              <ul className="list-disc list-inside text-xs space-y-0.5">
                {selectedQuests.length > 0 && <li>{selectedQuests.length} quest{selectedQuests.length !== 1 ? 's' : ''}</li>}
                {selectedUpgrades.length > 0 && <li>{selectedUpgrades.length} upgrade{selectedUpgrades.length !== 1 ? 's' : ''}</li>}
                {selectedProjectPhases.length > 0 && <li>{selectedProjectPhases.length} project phase{selectedProjectPhases.length !== 1 ? 's' : ''}</li>}
                {customMaterials.length > 0 && <li>{customMaterials.length} custom material{customMaterials.length !== 1 ? 's' : ''}</li>}
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setSaveDialogOpen(false);
                setSaveName("");
              }}
              className="border-cyan-500/20"
            >
              Cancel
            </Button>
            <Button
              onClick={saveCalculation}
              disabled={!saveName.trim()}
              className="bg-cyan-600 hover:bg-cyan-500"
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Load Dialog */}
      <Dialog open={loadDialogOpen} onOpenChange={setLoadDialogOpen}>
        <DialogContent className="bg-slate-900 border-cyan-500/20 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-cyan-300">Load Calculation</DialogTitle>
            <DialogDescription className="text-slate-400">
              Select a saved calculation to load.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar">
            {savedCalculations.length === 0 ? (
              <p className="text-center text-slate-500 py-8">No saved calculations yet.</p>
            ) : (
              savedCalculations
                .sort((a, b) => b.timestamp - a.timestamp)
                .map((calc) => (
                  <div
                    key={calc.id}
                    className="flex items-center gap-3 p-3 rounded bg-slate-800/50 hover:bg-slate-800 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-300 font-medium truncate">{calc.name}</p>
                      <p className="text-xs text-slate-500">
                        {new Date(calc.timestamp).toLocaleDateString()} at{' '}
                        {new Date(calc.timestamp).toLocaleTimeString()}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">{getCalculationSummary(calc)}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleLoadClick(calc.id)}
                        className="bg-cyan-600 hover:bg-cyan-500"
                      >
                        Load
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setDeleteConfirmId(calc.id)}
                        className="hover:bg-red-500/10 hover:text-red-400"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteConfirmId !== null} onOpenChange={() => setDeleteConfirmId(null)}>
        <AlertDialogContent className="bg-slate-900 border-cyan-500/20">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-cyan-300">Delete Calculation?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              Are you sure you want to delete &quot;{savedCalculations.find(c => c.id === deleteConfirmId)?.name}&quot;? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-cyan-500/20">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirmId && deleteCalculation(deleteConfirmId)}
              className="bg-red-600 hover:bg-red-500"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
