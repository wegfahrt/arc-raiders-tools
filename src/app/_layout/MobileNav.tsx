"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  ScrollText, 
  Package, 
  Hammer, 
  Calculator,
  Settings
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Globe, Info } from "lucide-react";
import { useGameStore } from "@/lib/stores/game-store";
import { SUPPORTED_LANGUAGES, type GameLanguage } from "@/lib/utils/languages";

const mobileNavItems = [
  { path: "/", icon: LayoutDashboard, label: "Home" },
  { path: "/quests", icon: ScrollText, label: "Quests" },
  { path: "/items", icon: Package, label: "Items" },
  { path: "/workstations", icon: Hammer, label: "Craft" },
  { path: "/calculator", icon: Calculator, label: "Calc" },
];

export function MobileNav() {
  const pathname = usePathname();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const gameLanguage = useGameStore(state => state.preferences.gameLanguage);
  const setPreference = useGameStore(state => state.setPreference);

  const handleLanguageChange = (value: string) => {
    setPreference('gameLanguage', value as GameLanguage);
  };

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-md border-t border-cyan-500/20">
      <div className="flex items-center justify-around px-2 py-3">
        {mobileNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path;
          
          return (
            <Link
              key={item.path}
              href={item.path}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 min-w-[60px]",
                isActive && "bg-cyan-500/20"
              )}
            >
              <Icon 
                className={cn(
                  isActive ? "text-cyan-400" : "text-slate-400"
                )} 
                size={20} 
              />
              <span className={cn(
                "text-xs",
                isActive ? "text-cyan-300 font-medium" : "text-slate-400"
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}

        {/* Settings Sheet */}
        <Sheet open={settingsOpen} onOpenChange={setSettingsOpen}>
          <SheetTrigger asChild>
            <button
              className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 min-w-[60px]"
            >
              <Settings className="text-slate-400" size={20} />
              <span className="text-xs text-slate-400">Settings</span>
            </button>
          </SheetTrigger>
          <SheetContent 
            side="bottom" 
            className="bg-slate-900 border-cyan-500/30 h-[80vh]"
          >
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2 text-cyan-400">
                <Globe className="w-5 h-5" />
                Language Settings
              </SheetTitle>
              <SheetDescription className="text-slate-400">
                Configure your language preferences for the companion app
              </SheetDescription>
            </SheetHeader>

            <div className="space-y-6 py-6">
              {/* Game Language Setting */}
              <div className="space-y-3">
                <Label htmlFor="mobile-game-language" className="text-cyan-300 font-medium">
                  Game Language
                </Label>
                <Select value={gameLanguage} onValueChange={handleLanguageChange}>
                  <SelectTrigger 
                    id="mobile-game-language"
                    className="bg-slate-800 border-cyan-500/30 text-slate-200 focus:border-cyan-500/50"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-cyan-500/30 max-h-[300px]">
                    {SUPPORTED_LANGUAGES.map((lang) => (
                      <SelectItem
                        key={lang.code}
                        value={lang.code}
                        className="text-slate-200 focus:bg-cyan-500/20 focus:text-cyan-300"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{lang.nativeName}</span>
                          <span className="text-xs text-slate-400">({lang.englishName})</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-slate-400">
                  Changes the language for all game content (items, quests, descriptions)
                </p>
              </div>

              {/* UI Language Setting (Disabled) */}
              <div className="space-y-3 opacity-50">
                <Label htmlFor="mobile-ui-language" className="text-slate-400 font-medium">
                  UI Language
                </Label>
                <Select disabled value="en">
                  <SelectTrigger 
                    id="mobile-ui-language"
                    className="bg-slate-800/50 border-slate-700 text-slate-400 cursor-not-allowed"
                  >
                    <SelectValue placeholder="English" />
                  </SelectTrigger>
                </Select>
                <Alert className="bg-slate-800/50 border-orange-500/30">
                  <Info className="h-4 w-4 text-orange-400" />
                  <AlertDescription className="text-sm text-slate-300">
                    Full website translation is planned for a future update. Currently, only game content can be localized.
                  </AlertDescription>
                </Alert>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}
