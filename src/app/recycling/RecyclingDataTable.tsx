"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ItemTooltip } from "@/components/ui/item-tooltip";
import {
  Search,
  ChevronDown,
  ChevronUp,
  Check,
  X,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ArrowRight,
} from "lucide-react";
import type { Item, RecyclingMetrics } from "@/lib/types";
import { getLocalizedText } from "~/lib/utils";
import { calculateRecyclingMetrics } from "~/lib/utils/recycling-calculator";

interface RecyclingDataTableProps {
  items: Item[];
  onItemClick?: (itemId: string) => void;
}

type SortField = "name" | "efficiency" | "value" | "type" | "rarity";
type SortDirection = "asc" | "desc";

export default function RecyclingDataTable({
  items,
  onItemClick,
}: RecyclingDataTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [rarityFilter, setRarityFilter] = useState<string>("all");
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  // Calculate metrics for all items
  const itemsWithMetrics = useMemo(
    () =>
      items.map((item) => ({
        ...item,
        metrics: calculateRecyclingMetrics(item.id, items),
      })),
    [items]
  );

  // Get unique types and rarities
  const types = useMemo(
    () => Array.from(new Set(items.map((item) => item.type))).sort(),
    [items]
  );
  const rarities = useMemo(
    () => Array.from(new Set(items.map((item) => item.rarity))).sort(),
    [items]
  );

  // Filter and sort items
  const filteredItems = useMemo(() => {
    let filtered = itemsWithMetrics.filter((item) => {
      // Only show recyclable items
      if (!item.metrics.canBeRecycled) return false;

      // Search filter
      const searchLower = searchQuery.toLowerCase();
      const nameMatch = getLocalizedText(item.name)
        .toLowerCase()
        .includes(searchLower);
      const idMatch = item.id.toLowerCase().includes(searchLower);
      if (searchQuery && !nameMatch && !idMatch) return false;

      // Type filter
      if (typeFilter !== "all" && item.type !== typeFilter) return false;

      // Rarity filter
      if (rarityFilter !== "all" && item.rarity !== rarityFilter) return false;

      return true;
    });

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case "name":
          comparison = getLocalizedText(a.name).localeCompare(
            getLocalizedText(b.name)
          );
          break;
        case "efficiency":
          comparison = a.metrics.efficiency - b.metrics.efficiency;
          break;
        case "value":
          comparison = a.value - b.value;
          break;
        case "type":
          comparison = a.type.localeCompare(b.type);
          break;
        case "rarity":
          comparison = a.rarity.localeCompare(b.rarity);
          break;
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });

    return filtered;
  }, [
    itemsWithMetrics,
    searchQuery,
    typeFilter,
    rarityFilter,
    sortField,
    sortDirection,
  ]);

  // Toggle row expansion
  const toggleRow = (itemId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedRows(newExpanded);
  };

  // Handle sort
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Sort icon component
  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown size={14} className="ml-1" />;
    return sortDirection === "asc" ? (
      <ArrowUp size={14} className="ml-1 text-cyan-400" />
    ) : (
      <ArrowDown size={14} className="ml-1 text-cyan-400" />
    );
  };

  // Rarity colors
  const rarityColors: Record<string, string> = {
    Common: "bg-[oklch(0.60_0.02_270)]/20 text-[oklch(0.60_0.02_270)] border-[oklch(0.60_0.02_270)]/50",
    Uncommon: "bg-[oklch(0.92_0.24_130)]/20 text-[oklch(0.92_0.24_130)] border-[oklch(0.92_0.24_130)]/50",
    Rare: "bg-[oklch(0.91_0.15_195)]/20 text-[oklch(0.91_0.15_195)] border-[oklch(0.91_0.15_195)]/50",
    Epic: "bg-[oklch(0.65_0.20_290)]/20 text-[oklch(0.65_0.20_290)] border-[oklch(0.65_0.20_290)]/50",
    Legendary: "bg-[oklch(0.68_0.19_35)]/20 text-[oklch(0.68_0.19_35)] border-[oklch(0.68_0.19_35)]/50",
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search */}
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />
          <Input
            placeholder="Search items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-slate-900/50 border-cyan-500/20 focus:border-cyan-500/40"
          />
        </div>

        {/* Type filter */}
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="bg-slate-900/50 border-cyan-500/20">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent className="bg-slate-900 border-cyan-500/30">
            <SelectItem value="all">All Types</SelectItem>
            {types.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Rarity filter */}
        <Select value={rarityFilter} onValueChange={setRarityFilter}>
          <SelectTrigger className="bg-slate-900/50 border-cyan-500/20">
            <SelectValue placeholder="All Rarities" />
          </SelectTrigger>
          <SelectContent className="bg-slate-900 border-cyan-500/30">
            <SelectItem value="all">All Rarities</SelectItem>
            {rarities.map((rarity) => (
              <SelectItem key={rarity} value={rarity}>
                {rarity}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Results count */}
      <div className="text-sm text-slate-400">
        Showing {filteredItems.length} of {items.length} items
      </div>

      {/* Table */}
      <div className="rounded-lg border border-cyan-500/20 overflow-hidden bg-slate-900/30">
        <Table>
          <TableHeader>
            <TableRow className="border-cyan-500/20 hover:bg-slate-800/30">
              <TableHead className="w-[50px]"></TableHead>
              <TableHead
                className="cursor-pointer hover:text-cyan-400 transition-colors"
                onClick={() => handleSort("name")}
              >
                <div className="flex items-center">
                  Item
                  <SortIcon field="name" />
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer hover:text-cyan-400 transition-colors"
                onClick={() => handleSort("type")}
              >
                <div className="flex items-center">
                  Type
                  <SortIcon field="type" />
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer hover:text-cyan-400 transition-colors"
                onClick={() => handleSort("rarity")}
              >
                <div className="flex items-center">
                  Rarity
                  <SortIcon field="rarity" />
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer hover:text-cyan-400 transition-colors text-center"
                onClick={() => handleSort("efficiency")}
              >
                <div className="flex items-center justify-center">
                  Efficiency
                  <SortIcon field="efficiency" />
                </div>
              </TableHead>
              <TableHead>Produces</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredItems.map((item, index) => (
              <React.Fragment key={item.id}>
                <motion.tr
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.02 }}
                  className="border-cyan-500/10"
                >
                  <TableCell>
                    {item.metrics.canBeRecycled && (
                      <button
                        onClick={() => toggleRow(item.id)}
                        className="text-cyan-400 hover:text-cyan-300 transition-colors"
                      >
                        {expandedRows.has(item.id) ? (
                          <ChevronUp size={18} />
                        ) : (
                          <ChevronDown size={18} />
                        )}
                      </button>
                    )}
                  </TableCell>
                  <TableCell>
                    <TooltipProvider delayDuration={300}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div
                            className="flex items-center gap-2 cursor-pointer hover:text-cyan-400 transition-colors"
                            onClick={() => onItemClick?.(item.id)}
                          >
                            <div className="w-8 h-8 rounded border border-slate-600 bg-slate-800/50 flex items-center justify-center overflow-hidden flex-shrink-0">
                              {item.imageFilename ? (
                                <img
                                  src={item.imageFilename}
                                  alt={getLocalizedText(item.name)}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    const parent = e.currentTarget.parentElement;
                                    if (parent) {
                                      parent.innerHTML = '<span class="text-slate-600 text-xs">?</span>';
                                    }
                                  }}
                                />
                              ) : (
                                <span className="text-slate-600 text-xs">?</span>
                              )}
                            </div>
                            <span className="font-medium">
                              {getLocalizedText(item.name)}
                            </span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="p-0">
                          <ItemTooltip item={item} />
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                  <TableCell className="text-slate-400">{item.type}</TableCell>
                  <TableCell>
                    <Badge className={rarityColors[item.rarity] || ""}>
                      {item.rarity}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    {item.metrics.canBeRecycled ? (
                      <Badge
                        className={
                          item.metrics.efficiency >= 80
                            ? "bg-green-500/20 text-green-400 border-green-500/50"
                            : item.metrics.efficiency >= 50
                            ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/50"
                            : "bg-orange-500/20 text-orange-400 border-orange-500/50"
                        }
                      >
                        {item.metrics.efficiency}%
                      </Badge>
                    ) : (
                      <span className="text-slate-600">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {item.recyclesInto && Object.keys(item.recyclesInto).length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(item.recyclesInto).map(([matId, qty]) => {
                          const material = items.find((i) => i.id === matId);
                          return (
                            <TooltipProvider key={matId} delayDuration={300}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-800/50 border border-slate-700/50 hover:border-cyan-500/30 transition-colors cursor-help">
                                    <div className="w-5 h-5 rounded border border-slate-600 bg-slate-900/50 flex items-center justify-center overflow-hidden flex-shrink-0">
                                      {material?.imageFilename ? (
                                        <img
                                          src={material.imageFilename}
                                          alt={getLocalizedText(material.name)}
                                          className="w-full h-full object-cover"
                                          onError={(e) => {
                                            e.currentTarget.style.display = 'none';
                                            const parent = e.currentTarget.parentElement;
                                            if (parent) {
                                              parent.innerHTML = '<span class="text-slate-600 text-[8px]">?</span>';
                                            }
                                          }}
                                        />
                                      ) : (
                                        <span className="text-slate-600 text-[8px]">?</span>
                                      )}
                                    </div>
                                    <span className="text-xs font-medium text-slate-300">
                                      {material ? getLocalizedText(material.name) : matId}
                                    </span>
                                    <Badge variant="outline" className="text-xs border-cyan-500/30 text-cyan-400 ml-0.5">
                                      {qty}
                                    </Badge>
                                  </div>
                                </TooltipTrigger>
                                {material && (
                                  <TooltipContent side="right" className="p-0">
                                    <ItemTooltip item={material} />
                                  </TooltipContent>
                                )}
                              </Tooltip>
                            </TooltipProvider>
                          );
                        })}
                      </div>
                    ) : (
                      <span className="text-slate-600">-</span>
                    )}
                  </TableCell>
                </motion.tr>

                {/* Expanded Row Content */}
                <AnimatePresence>
                  {expandedRows.has(item.id) && item.metrics.canBeRecycled && (
                    <motion.tr
                      key={`${item.id}-expanded`}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="bg-slate-800/30"
                    >
                      <TableCell colSpan={6} className="p-0">
                        <div className="p-6 space-y-4">
                          {/* Immediate Recycling Output */}
                          <div>
                            <h4 className="text-sm font-semibold text-cyan-400 mb-3 flex items-center gap-2">
                              <ArrowRight size={16} />
                              Immediate Recycling Output
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                              {item.recyclesInto &&
                                Object.entries(item.recyclesInto).map(([matId, qty]) => {
                                  const material = items.find((i) => i.id === matId);
                                  return material ? (
                                    <TooltipProvider key={matId} delayDuration={300}>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-900/50 border border-slate-700/50 hover:border-cyan-500/30 transition-colors cursor-help">
                                            {material.imageFilename && (
                                              <img
                                                src={material.imageFilename}
                                                alt={getLocalizedText(material.name)}
                                                className="w-10 h-10 object-cover rounded border border-slate-600"
                                              />
                                            )}
                                            <div className="flex-1">
                                              <div className="font-medium text-slate-200 text-sm">
                                                {getLocalizedText(material.name)}
                                              </div>
                                              <Badge
                                                variant="outline"
                                                className="text-xs border-cyan-500/30 text-cyan-400 mt-1"
                                              >
                                                x{qty}
                                              </Badge>
                                            </div>
                                          </div>
                                        </TooltipTrigger>
                                        <TooltipContent side="right" className="p-0">
                                          <ItemTooltip item={material} />
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  ) : null;
                                })}
                            </div>
                          </div>

                          {/* Metrics */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-slate-700/50">
                            <div className="text-center p-3 rounded bg-slate-900/30">
                              <div className="text-xs text-slate-400 mb-1">Depth</div>
                              <div className="text-lg font-bold text-cyan-400">
                                {item.metrics.depth}
                              </div>
                            </div>
                            <div className="text-center p-3 rounded bg-slate-900/30">
                              <div className="text-xs text-slate-400 mb-1">Efficiency</div>
                              <div className="text-lg font-bold text-green-400">
                                {item.metrics.efficiency}%
                              </div>
                            </div>
                            <div className="text-center p-3 rounded bg-slate-900/30">
                              <div className="text-xs text-slate-400 mb-1">Value</div>
                              <div className="text-lg font-bold text-amber-400">
                                {item.value}
                              </div>
                            </div>
                            <div className="text-center p-3 rounded bg-slate-900/30">
                              <div className="text-xs text-slate-400 mb-1">Output Value</div>
                              <div className="text-lg font-bold text-amber-400">
                                {item.metrics.totalValue}
                              </div>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                    </motion.tr>
                  )}
                </AnimatePresence>
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
