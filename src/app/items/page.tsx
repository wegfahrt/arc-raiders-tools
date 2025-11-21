"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useGameStore } from "@/lib/stores/game-store";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, Grid3x3, List } from "lucide-react";
import { useLocalizedText } from "~/lib/utils";
import { getAllItems } from "~/server/db/queries/items";
import ItemCard from "./ItemCard";

export default function Items() {
  const localizeText = useLocalizedText();
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [rarityFilter, setRarityFilter] = useState<string>("all");
  const [lootAreaFilter, setLootAreaFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<"name-asc" | "name-desc" | "value-asc" | "value-desc">("name-asc");

  const { trackedItems, toggleTrackedItem } = useGameStore();

  const { data: items, isLoading, error } = useQuery({
    queryKey: ['items', 'all'],
    queryFn: getAllItems,
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  // Get all distinct item types and rarities from items
  const itemTypes = Array.from(new Set(items?.map(item => item.type).filter(type => type !== "" && type !== null)));
  const itemRarities = Array.from(new Set(items?.map(item => item.rarity).filter(rarity => rarity !== "" && rarity !== null)));
  // Get all distinct loot areas from items which are not null or empty strings
  const lootAreas = Array.from(new Set(
    items?.flatMap(item => 
      item.foundIn 
        ? item.foundIn.split(',').map(area => area.trim()) 
        : []
    ).filter(lootArea => lootArea !== null && lootArea !== "")
  ));

  console.log("data of advanced-electrical-component", items?.find(i => localizeText(i.description).includes("Lets you craft an Advanced Electrical Component")));

  const filteredItems = items?.filter(item => {
    const matchesSearch = localizeText(item.name).toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "all" || item.type === typeFilter;
    const matchesRarity = rarityFilter === "all" || item.rarity === rarityFilter;
    const matchesLootArea = lootAreaFilter === "all" || 
      (item.foundIn && item.foundIn.split(',').map(area => area.trim()).includes(lootAreaFilter));
    return matchesSearch && matchesType && matchesRarity && matchesLootArea;
  });

  // Sort filtered items
  const sortedItems = filteredItems?.sort((a, b) => {
    switch (sortBy) {
      case "name-asc":
        return localizeText(a.name).localeCompare(localizeText(b.name));
      case "name-desc":
        return localizeText(b.name).localeCompare(localizeText(a.name));
      case "value-asc":
        return (a.value ?? 0) - (b.value ?? 0);
      case "value-desc":
        return (b.value ?? 0) - (a.value ?? 0);
      default:
        return 0;
    }
  });

  const rarityColors = {
    Common: "bg-[oklch(0.60_0.02_270)]/20 text-[oklch(0.60_0.02_270)] border-[oklch(0.60_0.02_270)]/30",
    Uncommon: "bg-[oklch(0.92_0.24_130)]/20 text-[oklch(0.92_0.24_130)] border-[oklch(0.92_0.24_130)]/30",
    Rare: "bg-[oklch(0.91_0.15_195)]/20 text-[oklch(0.91_0.15_195)] border-[oklch(0.91_0.15_195)]/30",
    Epic: "bg-[oklch(0.65_0.20_290)]/20 text-[oklch(0.65_0.20_290)] border-[oklch(0.65_0.20_290)]/30",
    Legendary: "bg-[oklch(0.68_0.19_35)]/20 text-[oklch(0.68_0.19_35)] border-[oklch(0.68_0.19_35)]/30"
  };

  return (
    <>
      <div className="min-h-screen p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h1 className="text-3xl font-bold text-cyan-400">Items</h1>
            <div className="flex gap-2">
              <Button
                variant={viewMode === "grid" ? "outline" : "default"}
                size="sm"
                onClick={() => setViewMode("grid")}
              >
                <Grid3x3 size={16} />
              </Button>
              <Button
                variant={viewMode === "list" ? "outline" : "default"}
                size="sm"
                onClick={() => setViewMode("list")}
              >
                <List size={16} />
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <Input
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-slate-900/50 border-cyan-500/20"
              />
            </div>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="bg-slate-900/50 border-cyan-500/20">
                <SelectValue placeholder="Filter by Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {itemTypes.map((type) => (
                  <SelectItem key={type} value={type ?? "unknown"}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={lootAreaFilter} onValueChange={setLootAreaFilter}>
              <SelectTrigger className="bg-slate-900/50 border-cyan-500/20">
                <SelectValue placeholder="Filter by Loot Area" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Loot Areas</SelectItem>
                {lootAreas.map((lootArea) => (
                  <SelectItem key={lootArea} value={lootArea ?? "unknown"}>{lootArea}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={rarityFilter} onValueChange={setRarityFilter}>
              <SelectTrigger className="bg-slate-900/50 border-cyan-500/20">
                <SelectValue placeholder="Filter by Rarity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Rarities</SelectItem>
                {itemRarities.map((rarity) => (
                  <SelectItem key={rarity} value={rarity ?? "unknown"}>{rarity}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Results count and Sort */}
          <div className="flex justify-between items-center">
            <p className="text-slate-400 text-sm">
              Showing {sortedItems?.length} of {items?.length} items
            </p>
            
            <Select value={sortBy} onValueChange={(value) => setSortBy(value as typeof sortBy)}>
              <SelectTrigger className="w-[180px] bg-slate-900/50 border-cyan-500/20">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                <SelectItem value="value-asc">Value (Low-High)</SelectItem>
                <SelectItem value="value-desc">Value (High-Low)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Items Grid/List */}
          <div className={
            viewMode === "grid" 
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
              : "space-y-3"
          }>
            {sortedItems?.map((item, index) => (
              <ItemCard 
                key={item.id} 
                item={item} 
                index={index}
                viewMode={viewMode}
                isTracked={trackedItems.includes(item.id)}
                onToggleTrack={() => toggleTrackedItem(item.id)}
                rarityColors={rarityColors}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
