"use client";

import { useState } from "react";
import { Globe, Info } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useGameStore } from "@/lib/stores/game-store";
import { SUPPORTED_LANGUAGES, type GameLanguage } from "@/lib/utils/languages";
import { cn } from "@/lib/utils";

interface LanguageSettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LanguageSettings({ open, onOpenChange }: LanguageSettingsProps) {
  const gameLanguage = useGameStore(state => state.preferences.gameLanguage);
  const setPreference = useGameStore(state => state.setPreference);

  const handleLanguageChange = (value: string) => {
    setPreference('gameLanguage', value as GameLanguage);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-slate-900 border-cyan-500/30">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-cyan-400">
            <Globe className="w-5 h-5" />
            Language Settings
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Configure your language preferences for the companion app
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Game Language Setting */}
          <div className="space-y-3">
            <Label htmlFor="game-language" className="text-cyan-300 font-medium">
              Game Language
            </Label>
            <Select value={gameLanguage} onValueChange={handleLanguageChange}>
              <SelectTrigger 
                id="game-language"
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
            <Label htmlFor="ui-language" className="text-slate-400 font-medium">
              UI Language
            </Label>
            <Select disabled value="en">
              <SelectTrigger 
                id="ui-language"
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
      </DialogContent>
    </Dialog>
  );
}
