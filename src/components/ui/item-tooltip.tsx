import { getLocalizedText } from "~/lib/utils";
import type { Item } from "~/lib/types";

interface ItemTooltipProps {
  item: Item;
}

export function ItemTooltip({ item }: ItemTooltipProps) {
  const rarityColors = {
    Common: "bg-[oklch(0.60_0.02_270)] text-white",
    Uncommon: "bg-[oklch(0.92_0.24_130)] text-slate-900",
    Rare: "bg-[oklch(0.91_0.15_195)] text-slate-900",
    Epic: "bg-[oklch(0.65_0.20_290)] text-white",
    Legendary: "bg-[oklch(0.68_0.19_35)] text-white"
  };

  const rarityBadgeClass = item.rarity ? rarityColors[item.rarity as keyof typeof rarityColors] : "";

  return (
    <div className="w-[280px] bg-[oklch(var(--card-light))] border border-cyan-500/30 rounded-lg overflow-hidden shadow-[0_0_30px_rgba(6,182,212,0.3)]">
      {/* Header with image */}
      <div className="relative bg-gradient-to-b from-slate-800/50 to-transparent p-4">
        <div className="aspect-square w-full rounded-lg bg-slate-800/70 flex items-center justify-center mb-3 border border-cyan-500/20">
          {item.icon ? (
            <img src={item.icon} alt={getLocalizedText(item.name)} className="w-full h-full object-cover rounded-lg" />
          ) : (
            <span className="text-slate-600 text-6xl">?</span>
          )}
        </div>
        
        {/* Rarity badges */}
        <div className="flex gap-2 absolute top-2 left-2">
          {item.loot_area && (
            <span className={`px-2 py-0.5 text-xs font-medium rounded ${rarityBadgeClass}`}>
              {item.loot_area}
            </span>
          )}
          {item.rarity && (
            <span className={`px-2 py-0.5 text-xs font-medium rounded ${rarityBadgeClass}`}>
              {item.rarity}
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-4 space-y-3">
        {/* Title */}
        <h3 className="text-lg font-bold text-cyan-400 uppercase tracking-wide">
          {getLocalizedText(item.name)}
        </h3>

        {/* Description */}
        {item.description && (
          <p className="text-sm text-slate-300 leading-relaxed">
            {getLocalizedText(item.description)}
          </p>
        )}

        {/* Stats section */}
        <div className="space-y-1.5 pt-2 border-t border-cyan-500/20">
          {item.stat_block?.stackSize && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400">Stack Size</span>
              <span className="text-cyan-400 font-semibold">{item.stat_block.stackSize}</span>
            </div>
          )}
          
          {item.stat_block?.useTime && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400">Use Time</span>
              <span className="text-cyan-400 font-semibold">{item.stat_block.useTime}s</span>
            </div>
          )}
          
          {item.stat_block?.stamina && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400">Stamina</span>
              <span className="text-cyan-400 font-semibold">{item.stat_block.stamina}</span>
            </div>
          )}
        </div>

        {/* Footer with weight and value */}
        <div className="flex justify-between items-center pt-2 border-t border-cyan-500/20">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-400">⚖️</span>
            <span className="text-slate-300 font-medium">
              {item.stat_block?.weight ? `${item.stat_block.weight} KG` : "0 KG"}
            </span>
          </div>
          
          {item.value && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-amber-400">🪙</span>
              <span className="text-amber-400 font-semibold">{item.value}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
