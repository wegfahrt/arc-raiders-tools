"use client";

import { useState, useMemo } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Recycle, Database, Search as SearchIcon, GitBranch, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getRecyclableItems } from "~/server/db/queries/items";
import { getLocalizedText } from "~/lib/utils";
import {
  findReverseRecyclingPaths,
  getTerminalMaterials,
  isTerminalMaterial,
} from "~/lib/utils/recycling-calculator";
import type { Item } from "@/lib/types";

// Component imports
import RecyclingDataTable from "~/app/recycling/RecyclingDataTable";
import { MaterialSelector } from "~/app/recycling/MaterialSelector";
import RecyclingPathCard from "~/app/recycling/RecyclingPathCard";
import RecyclingFlowChart from "~/app/recycling/RecyclingFlowChart";
import RecyclingChainList from "~/app/recycling/RecyclingChainList";
import TerminalMaterialsSummary from "~/app/recycling/TerminalMaterialsSummary";

export default function Recycling() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // Read activeTab from URL, default to "database"
  const activeTab = searchParams.get("tab") ?? "database";
  
  // Update URL when tab changes
  const setActiveTab = (tab: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };
  
  // Find Material tab state
  const [selectedMaterialId, setSelectedMaterialId] = useState<string | null>(null);
  const [maxDepth, setMaxDepth] = useState<string>("10");
  const [sortBy, setSortBy] = useState<string>("efficiency");
  const [rarityFilter, setRarityFilter] = useState<string>("all");
  const [minEfficiency, setMinEfficiency] = useState<string>("0");
  
  // Chain Viewer tab state
  const [selectedChainItemId, setSelectedChainItemId] = useState<string | null>(null);
  const [chainViewMode, setChainViewMode] = useState<"tree" | "list">("tree");

  // Fetch items
  const { data: items = [], isLoading } = useQuery({
    queryKey: ['recyclable-items'],
    queryFn: getRecyclableItems,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  // Get recyclable items for chain viewer
  const recyclableItems = useMemo(
    () => items.filter((item) => item.recyclesInto && Object.keys(item.recyclesInto).length > 0),
    [items]
  );

  // Find reverse recycling paths
  const recyclingPaths = useMemo(() => {
    if (!selectedMaterialId) return [];
    let paths = findReverseRecyclingPaths(selectedMaterialId, items, parseInt(maxDepth));
    
    // Apply filters
    paths = paths.filter(path => {
      // Rarity filter
      if (rarityFilter !== "all" && path.sourceItem.rarity !== rarityFilter) return false;
      
      // Min efficiency filter
      if (path.efficiency < parseInt(minEfficiency)) return false;
      
      return true;
    });
    
    // Sort paths
    return paths.sort((a, b) => {
      switch (sortBy) {
        case "efficiency":
          return b.efficiency - a.efficiency;
        case "value":
          return a.totalValueCost - b.totalValueCost;
        case "steps":
          return a.totalSteps - b.totalSteps;
        case "quantity":
          return b.finalQuantity - a.finalQuantity;
        default:
          return 0;
      }
    });
  }, [selectedMaterialId, items, maxDepth, sortBy, rarityFilter, minEfficiency]);

  // Get terminal materials for selected chain item
  const chainTerminalMaterials = useMemo(() => {
    if (!selectedChainItemId) return {};
    return getTerminalMaterials(selectedChainItemId, items);
  }, [selectedChainItemId, items]);

  // Handle item click to navigate to chain viewer
  const handleItemClick = (itemId: string) => {
    setSelectedChainItemId(itemId);
    setActiveTab("chain-viewer");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen p-4 sm:p-6 lg:p-8 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 size={48} className="animate-spin text-cyan-400 mx-auto" />
          <p className="text-slate-400">Loading recycling data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-cyan-400 mb-2 flex items-center gap-2">
            <Recycle size={32} />
            Recycling System
          </h1>
          <p className="text-slate-400">
            Explore recycling chains, find materials, and optimize your resource management
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-slate-900/50 border border-cyan-500/20">
            <TabsTrigger
              value="database"
              className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400"
            >
              <Database size={18} className="mr-2" />
              Database
            </TabsTrigger>
            <TabsTrigger
              value="find-material"
              className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400"
            >
              <SearchIcon size={18} className="mr-2" />
              Find Material
            </TabsTrigger>
            <TabsTrigger
              value="chain-viewer"
              className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400"
            >
              <GitBranch size={18} className="mr-2" />
              Chain Viewer
            </TabsTrigger>
          </TabsList>

          {/* Database Tab */}
          <TabsContent value="database" className="space-y-4">
            <Card className="bg-slate-900/30 border-cyan-500/20 p-6">
              <div className="mb-4">
                <h2 className="text-xl font-bold text-cyan-300 mb-2">
                  Recycling Database
                </h2>
                <p className="text-sm text-slate-400">
                  Browse all items with recycling information. Click any recyclable item to view its full chain.
                </p>
              </div>
              <RecyclingDataTable items={items} onItemClick={handleItemClick} />
            </Card>
          </TabsContent>

          {/* Find Material Tab */}
          <TabsContent value="find-material" className="space-y-4">
            <Card className="bg-slate-900/30 border-cyan-500/20 p-6">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-cyan-300 mb-2">
                  Reverse Material Lookup
                </h2>
                <p className="text-sm text-slate-400 mb-4">
                  Find all items that can be recycled to produce a specific material.
                </p>

                {/* Filters */}
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <MaterialSelector
                      items={items.filter((item) => {
                        // Only show materials that can be produced by recycling
                        return items.some((other) => 
                          other.recyclesInto && 
                          Object.keys(other.recyclesInto).includes(item.id)
                        );
                      })}
                      selectedMaterialId={selectedMaterialId}
                      onSelectMaterial={setSelectedMaterialId}
                      terminalOnly={false}
                      label="Target Material"
                      placeholder="Select a material..."
                    />

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">
                        Source Rarity
                      </label>
                      <Select value={rarityFilter} onValueChange={setRarityFilter}>
                        <SelectTrigger className="bg-slate-900/50 border-cyan-500/20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900 border-cyan-500/30">
                          <SelectItem value="all">All Rarities</SelectItem>
                          <SelectItem value="Common">Common</SelectItem>
                          <SelectItem value="Uncommon">Uncommon</SelectItem>
                          <SelectItem value="Rare">Rare</SelectItem>
                          <SelectItem value="Epic">Epic</SelectItem>
                          <SelectItem value="Legendary">Legendary</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">
                        Sort By
                      </label>
                      <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger className="bg-slate-900/50 border-cyan-500/20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900 border-cyan-500/30">
                          <SelectItem value="efficiency">Efficiency</SelectItem>
                          <SelectItem value="value">Value</SelectItem>
                          <SelectItem value="steps">Steps</SelectItem>
                          <SelectItem value="quantity">Quantity</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Results */}
              {selectedMaterialId ? (
                recyclingPaths.length > 0 ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-slate-300">
                        Found {recyclingPaths.length} path{recyclingPaths.length !== 1 ? 's' : ''}
                      </h3>
                    </div>
                    <div className="space-y-3">
                      {recyclingPaths.map((path, index) => (
                        <RecyclingPathCard
                          key={`${path.sourceItem.id}-${index}`}
                          path={path}
                          index={index}
                          onViewFlowchart={handleItemClick}
                        />
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-slate-400">
                      No recycling paths found for this material.
                    </p>
                  </div>
                )
              ) : (
                <div className="text-center py-12">
                  <p className="text-slate-400">
                    Select a material to find recycling paths.
                  </p>
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Chain Viewer Tab */}
          <TabsContent value="chain-viewer" className="space-y-4">
            <Card className="bg-slate-900/30 border-cyan-500/20 p-6">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-cyan-300">
                      Recycling Chain Viewer
                    </h2>
                    <p className="text-sm text-slate-400">
                      Visualize the complete recycling chain for any item.
                    </p>
                  </div>
                  {/* View Mode Toggle */}
                  <div className="inline-flex rounded-lg border border-cyan-500/20 bg-slate-900/50 p-1">
                    <Button
                      variant={chainViewMode === "tree" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setChainViewMode("tree")}
                      className={chainViewMode === "tree" ? "bg-cyan-500/20 text-cyan-400" : "text-slate-400"}
                    >
                      <GitBranch size={16} className="mr-2" />
                      Tree View
                    </Button>
                    <Button
                      variant={chainViewMode === "list" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setChainViewMode("list")}
                      className={chainViewMode === "list" ? "bg-cyan-500/20 text-cyan-400" : "text-slate-400"}
                    >
                      <Database size={16} className="mr-2" />
                      List View
                    </Button>
                  </div>
                </div>
                  

                {/* Item Selector */}
                <MaterialSelector
                  items={recyclableItems}
                  selectedMaterialId={selectedChainItemId}
                  onSelectMaterial={setSelectedChainItemId}
                  terminalOnly={false}
                  label="Select Item"
                  placeholder="Search recyclable items..."
                />
              </div>

              {selectedChainItemId ? (
                <div className="space-y-4">

                  {chainViewMode === "tree" ? (
                    <RecyclingFlowChart
                      itemId={selectedChainItemId}
                      items={items}
                      onNodeClick={(item) => handleItemClick(item.id)}
                    />
                  ) : (
                    <Card className="bg-slate-900/50 border-cyan-500/20 p-6">
                      <RecyclingChainList
                        itemId={selectedChainItemId}
                        items={items}
                        onItemClick={handleItemClick}
                      />
                    </Card>
                  )}
                  
                  {Object.keys(chainTerminalMaterials).length > 0 && (
                    <TerminalMaterialsSummary
                      terminalMaterials={chainTerminalMaterials}
                      items={items}
                      sourceItemName={getLocalizedText(
                        recyclableItems.find((i) => i.id === selectedChainItemId)?.name || ""
                      )}
                    />
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-slate-400">
                    Select an item to view its recycling chain.
                  </p>
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
