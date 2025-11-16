"use client";

import { useState, useMemo } from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { Item } from "@/lib/types";
import { getLocalizedText } from "~/lib/utils";
import { isTerminalMaterial } from "~/lib/utils/recycling-calculator";

interface MaterialSelectorProps {
  items: Item[];
  selectedMaterialId: string | null;
  onSelectMaterial: (materialId: string) => void;
  terminalOnly?: boolean;
  label?: string;
  placeholder?: string;
}

export function MaterialSelector({
  items,
  selectedMaterialId,
  onSelectMaterial,
  terminalOnly = false,
  label = "Select Material",
  placeholder = "Search materials...",
}: MaterialSelectorProps) {
  const [open, setOpen] = useState(false);

  // Filter materials based on terminalOnly flag
  const materials = useMemo(() => {
    if (terminalOnly) {
      return items.filter((item) => isTerminalMaterial(item.id, items));
    }
    return items;
  }, [items, terminalOnly]);

  // Get selected material
  const selectedMaterial = materials.find(
    (item) => item.id === selectedMaterialId
  );

  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-medium text-slate-300">{label}</label>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between bg-slate-900/50 border-cyan-500/20 hover:border-cyan-500/40 text-slate-300"
          >
            {selectedMaterial ? (
              <div className="flex items-center gap-2">
                {selectedMaterial.imageFilename && (
                  <img
                    src={selectedMaterial.imageFilename}
                    alt={getLocalizedText(selectedMaterial.name)}
                    className="w-6 h-6 object-cover rounded"
                  />
                )}
                <span>{getLocalizedText(selectedMaterial.name)}</span>
              </div>
            ) : (
              <span className="text-slate-500">{placeholder}</span>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0 bg-slate-900 border-cyan-500/30" align="start">
          <Command className="bg-slate-900">
            <CommandInput
              placeholder={placeholder}
              className="text-slate-300"
            />
            <CommandList>
              <CommandEmpty className="text-slate-400 text-center py-6">
                No materials found.
              </CommandEmpty>
              <CommandGroup>
                {materials.map((material) => (
                  <CommandItem
                    key={material.id}
                    value={`${material.id} ${getLocalizedText(material.name)}`}
                    onSelect={() => {
                      onSelectMaterial(material.id);
                      setOpen(false);
                    }}
                    className="cursor-pointer hover:bg-slate-800 aria-selected:bg-slate-800"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      {material.imageFilename && (
                        <img
                          src={material.imageFilename}
                          alt={getLocalizedText(material.name)}
                          className="w-8 h-8 object-cover rounded"
                        />
                      )}
                      <div className="flex-1">
                        <div className="font-medium text-slate-200">
                          {getLocalizedText(material.name)}
                        </div>
                        <div className="text-xs text-slate-400">
                          {material.type} • {material.rarity}
                        </div>
                      </div>
                      <Check
                        className={cn(
                          "h-4 w-4",
                          selectedMaterialId === material.id
                            ? "opacity-100 text-cyan-400"
                            : "opacity-0"
                        )}
                      />
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
