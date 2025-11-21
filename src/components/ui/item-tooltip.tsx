import { useLocalizedText } from "~/lib/utils";
import type { Item } from "~/lib/types";
import type { ReactNode } from "react";

interface ItemTooltipProps {
  item: Item;
  additionalContent?: ReactNode;
}

export function ItemTooltip({ item, additionalContent }: ItemTooltipProps) {
  const localizeText = useLocalizedText();
  const rarityColors = {
    Common: "bg-[oklch(0.60_0.02_270)] text-white",
    Uncommon: "bg-[oklch(0.92_0.24_130)] text-slate-900",
    Rare: "bg-[oklch(0.91_0.15_195)] text-slate-900",
    Epic: "bg-[oklch(0.65_0.20_290)] text-white",
    Legendary: "bg-[oklch(0.68_0.19_35)] text-white"
  };

  const rarityBadgeClass = item.rarity ? rarityColors[item.rarity as keyof typeof rarityColors] : "";

  // Check if we have valid footer data
  const hasWeight = item.weightKg && item.weightKg !== 0;
  const hasValue = item.value && item.value !== 0;
  const showFooter = hasWeight || hasValue;

  return (
    <div className="w-[280px] bg-[oklch(var(--card-light))] border border-cyan-500/30 rounded-lg overflow-hidden shadow-[0_0_30px_rgba(6,182,212,0.3)]">
      {/* Header with image */}
      <div className="relative bg-gradient-to-b from-slate-800/50 to-transparent p-4">
        <div className="aspect-square w-full rounded-lg bg-slate-800/70 flex items-center justify-center mb-3 border border-cyan-500/20">
          {item.imageFilename ? (
            <img src={item.imageFilename} alt={localizeText(item.name)} className="w-full h-full object-cover rounded-lg" />
          ) : (
            <span className="text-slate-600 text-6xl">?</span>
          )}
        </div>
        
        {/* Rarity badges */}
        <div className="flex gap-2 absolute top-2 left-2 flex-wrap">
          {item.foundIn && item.foundIn.split(',').map((location, index) => (
            <span key={index} className={`px-2 py-0.5 text-xs font-medium rounded ${rarityBadgeClass}`}>
              {location.trim()}
            </span>
          ))}
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
          {localizeText(item.name)}
        </h3>

        {/* Description */}
        {item.description && (
          <p className="text-sm text-slate-300 leading-relaxed">
            {localizeText(item.description)}
          </p>
        )}

        {/* Stats section */}
        {item.effects && (
          <div className="space-y-2 pt-2 border-t border-cyan-500/20">
            {Object.entries(item.effects).map(([key, value]) => (
              <div key={key} className="flex justify-between items-center text-sm">
                <span className="text-slate-400 font-medium">{localizeText(key)}</span>
                <span className="text-cyan-400 font-semibold tabular-nums">{value.value}</span>
              </div>
            ))}
          </div>
        )}

        {/* Footer with weight and value */}
        {(showFooter === true) && (
          <div className="flex justify-between items-center pt-2 border-t border-cyan-500/20">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-slate-400">⚖️</span>
                <span className="text-slate-300 font-medium tabular-nums">
                  {item.weightKg ?? 0} KG
                </span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <span className="text-amber-400">🪙</span>
                <span className="text-amber-400 font-semibold tabular-nums">{item.value}</span>
              </div>
          </div>
        )}

        {/* Additional content */}
        {additionalContent && additionalContent}
      </div>
    </div>
  );
}
