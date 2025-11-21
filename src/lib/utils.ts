import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { TranslatedText } from "./types"
import { useGameStore } from "./stores/game-store"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * React hook that returns a function to get localized text based on the user's language preference
 * @returns A function that takes translatedText and returns the localized string
 * 
 * @example
 * ```tsx
 * const localizeText = useLocalizedText();
 * return <div>{localizeText(item.name)}</div>;
 * ```
 */
export function useLocalizedText() {
  const gameLanguage = useGameStore(state => state.preferences.gameLanguage);
  
  return (translatedText: string | TranslatedText | any): string => {
    // If it's already a plain string, return it
    if (typeof translatedText === 'string') {
      return translatedText;
    }
    
    // If it's null or undefined, return empty string
    if (!translatedText) {
      return '';
    }
    
    // If it's an object with translations
    if (typeof translatedText === 'object') {
      // Try to get the requested locale, fallback to 'en', then any available translation
      return (
        translatedText[gameLanguage as keyof typeof translatedText] || 
        translatedText.en || 
        Object.values(translatedText)[0] || 
        ''
      );
    }
    
    return '';
  };
}

