"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchAllItems, fetchItems, getAllItems } from "~/server/db/queries/items";
import { motion } from "framer-motion";
import { useGameStore } from "@/lib/stores/game-store";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Grid3x3, List, Star } from "lucide-react";
import Script from "next/script";
import type { Item } from "~/lib/types";

export default function Items() {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [rarityFilter, setRarityFilter] = useState<string>("all");
  const [lootAreaFilter, setLootAreaFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<"name-asc" | "name-desc" | "value-asc" | "value-desc">("name-asc");

  const { trackedItems, toggleTrackedItem } = useGameStore();

  const { data: items, isLoading, error } = useQuery({
    queryKey: ['items', 'all'],
    queryFn: fetchAllItems,
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  // Get all distinct item types and rarities from items
  const itemTypes = Array.from(new Set(items?.map(item => item.item_type)));
  const itemRarities = Array.from(new Set(items?.map(item => item.rarity)));
  // Get all distinct loot areas from items which are not null or empty strings
  const lootAreas = Array.from(new Set(items?.map(item => item.loot_area).filter(lootArea => lootArea !== null && lootArea !== "")));

  console.log("Loot Areas:", lootAreas);

  const filteredItems = items?.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "all" || item.item_type === typeFilter;
    const matchesRarity = rarityFilter === "all" || item.rarity === rarityFilter;
    const matchesLootArea = lootAreaFilter === "all" || item.loot_area === lootAreaFilter;
    return matchesSearch && matchesType && matchesRarity && matchesLootArea;
  });

  // Sort filtered items
  const sortedItems = filteredItems?.sort((a, b) => {
    switch (sortBy) {
      case "name-asc":
        return a.name.localeCompare(b.name);
      case "name-desc":
        return b.name.localeCompare(a.name);
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
      <Script 
        src="https://cdn.metaforge.app/arcraiders-tooltips.min.js"
        strategy="afterInteractive"
      />
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

function ItemCard({ 
  item, 
  index, 
  viewMode,
  isTracked,
  onToggleTrack,
  rarityColors
}: { 
  item: Item; 
  index: number;
  viewMode: "grid" | "list";
  isTracked: boolean;
  onToggleTrack: () => void;
  rarityColors: Record<string, string>;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: index * 0.02 }}
    >
      <Card className={`
        bg-slate-900/50 border-cyan-500/20 hover:border-cyan-500/40 transition-all duration-300 
        hover:scale-105 hover:shadow-[0_0_20px_rgba(6,182,212,0.2)]
        ${viewMode === "grid" ? "p-4" : "p-4 flex items-center gap-4"}
      `}>
        <div className={viewMode === "grid" ? "space-y-3" : "flex items-center gap-4 flex-1"}>
          {/* Image placeholder */}
          <div className={`
            bg-slate-800/50 rounded-lg flex items-center justify-center border border-cyan-500/10
            ${viewMode === "grid" ? "aspect-square" : "w-16 h-16 flex-shrink-0"}
          `}>
            {item.icon ? (
              <img src={item.icon} alt={item.name} className="w-full h-full object-cover rounded-lg" />
            ) : (
              <span className="text-slate-600 text-2xl">?</span>
            )}
          </div>

          <div className="flex-1 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <a 
                href={`https://metaforge.app/arc-raiders/database/item/${item.id}`}
                className="font-semibold text-cyan-300 hover:text-cyan-200 transition-colors"
              >
                {item.name}
              </a>
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleTrack}
                className="p-1 h-auto"
              >
                <Star 
                  size={16} 
                  className={isTracked ? "fill-yellow-400 text-yellow-400" : "text-slate-400"} 
                />
              </Button>
            </div>

            <p className="text-sm text-slate-400 line-clamp-2">{item.description}</p>

            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="text-xs border-cyan-500/30 text-cyan-400">
                {item.item_type}
              </Badge>
              {item.rarity && (
                <Badge className={`text-xs ${rarityColors[item.rarity]}`}>
                  {item.rarity}
                </Badge>
              )}
              {item.loot_area && (
                <Badge variant="outline" className="text-xs bg-[oklch(0.85_0.17_85)]/20 text-[oklch(0.85_0.17_85)] border-[oklch(0.85_0.17_85)]/30">
                  {item.loot_area}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
