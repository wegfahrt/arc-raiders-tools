import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { TranslatedText } from "./types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Helper function to get localized text from a TranslatedText object or plain string
 * @param translatedText - The translated text object or plain string
 * @param locale - The desired language locale (default: 'en')
 * @returns The localized string
 */
export function getLocalizedText(
  translatedText: string | TranslatedText | any,
  locale: string = 'en'
): string {
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
      translatedText[locale as keyof typeof translatedText] || 
      translatedText.en || 
      Object.values(translatedText)[0] || 
      ''
    );
  }
  
  return '';
}
