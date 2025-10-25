"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { itemsApi } from "@/lib/services/api";
import { useGameStore } from "@/lib/stores/game-store";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Grid3x3, List, Star } from "lucide-react";
import type { Item } from "@/lib/types";
import Script from "next/script";

export default function Items() {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [rarityFilter, setRarityFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const { data: items = [] } = useQuery({
    queryKey: ['items'],
    queryFn: itemsApi.getAll
  });

  const { trackedItems, toggleTrackedItem } = useGameStore();

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "all" || item.type === typeFilter;
    const matchesRarity = rarityFilter === "all" || item.rarity === rarityFilter;
    return matchesSearch && matchesType && matchesRarity;
  });

  const rarityColors = {
    Common: "bg-slate-500/20 text-slate-300 border-slate-500/30",
    Uncommon: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
    Rare: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    Epic: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    Legendary: "bg-orange-500/20 text-orange-300 border-orange-500/30"
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
              variant={viewMode === "grid" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("grid")}
            >
              <Grid3x3 size={16} />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("list")}
            >
              <List size={16} />
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
              <SelectItem value="Ammunition">Ammunition</SelectItem>
              <SelectItem value="Medical">Medical</SelectItem>
              <SelectItem value="Components">Components</SelectItem>
              <SelectItem value="Material">Material</SelectItem>
              <SelectItem value="Weapon Mods">Weapon Mods</SelectItem>
              <SelectItem value="Power">Power</SelectItem>
            </SelectContent>
          </Select>

          <Select value={rarityFilter} onValueChange={setRarityFilter}>
            <SelectTrigger className="bg-slate-900/50 border-cyan-500/20">
              <SelectValue placeholder="Filter by Rarity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Rarities</SelectItem>
              <SelectItem value="Common">Common</SelectItem>
              <SelectItem value="Uncommon">Uncommon</SelectItem>
              <SelectItem value="Rare">Rare</SelectItem>
              <SelectItem value="Epic">Epic</SelectItem>
              <SelectItem value="Legendary">Legendary</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Results count */}
        <p className="text-slate-400 text-sm">
          Showing {filteredItems.length} of {items.length} items
        </p>

        {/* Items Grid/List */}
        <div className={
          viewMode === "grid" 
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
            : "space-y-3"
        }>
          {filteredItems.map((item, index) => (
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
            {item.imageFilename ? (
              <img src={item.imageFilename} alt={item.name} className="w-full h-full object-cover rounded-lg" />
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
                {item.type}
              </Badge>
              {item.rarity && (
                <Badge className={`text-xs ${rarityColors[item.rarity]}`}>
                  {item.rarity}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
