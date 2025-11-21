/**
 * Language utilities for Arc Raiders Companion App
 * Provides language configuration and helpers for localization
 */

export type GameLanguage = 
  | 'en' 
  | 'de' 
  | 'fr' 
  | 'es' 
  | 'pt' 
  | 'pl' 
  | 'no' 
  | 'da' 
  | 'it' 
  | 'ru' 
  | 'ja' 
  | 'zh-TW' 
  | 'uk' 
  | 'zh-CN' 
  | 'kr' 
  | 'tr' 
  | 'hr' 
  | 'sr';

export interface LanguageOption {
  code: GameLanguage;
  nativeName: string;
  englishName: string;
}

/**
 * All supported languages with native and English names
 * Sorted by English name for easier browsing
 */
export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'zh-CN', nativeName: '简体中文', englishName: 'Chinese (Simplified)' },
  { code: 'zh-TW', nativeName: '繁體中文', englishName: 'Chinese (Traditional)' },
  { code: 'hr', nativeName: 'Hrvatski', englishName: 'Croatian' },
  { code: 'da', nativeName: 'Dansk', englishName: 'Danish' },
  { code: 'en', nativeName: 'English', englishName: 'English' },
  { code: 'fr', nativeName: 'Français', englishName: 'French' },
  { code: 'de', nativeName: 'Deutsch', englishName: 'German' },
  { code: 'it', nativeName: 'Italiano', englishName: 'Italian' },
  { code: 'ja', nativeName: '日本語', englishName: 'Japanese' },
  { code: 'kr', nativeName: '한국어', englishName: 'Korean' },
  { code: 'no', nativeName: 'Norsk', englishName: 'Norwegian' },
  { code: 'pl', nativeName: 'Polski', englishName: 'Polish' },
  { code: 'pt', nativeName: 'Português', englishName: 'Portuguese' },
  { code: 'ru', nativeName: 'Русский', englishName: 'Russian' },
  { code: 'sr', nativeName: 'Српски', englishName: 'Serbian' },
  { code: 'es', nativeName: 'Español', englishName: 'Spanish' },
  { code: 'tr', nativeName: 'Türkçe', englishName: 'Turkish' },
  { code: 'uk', nativeName: 'Українська', englishName: 'Ukrainian' },
];

/**
 * Get language option by code
 */
export function getLanguageByCode(code: GameLanguage): LanguageOption | undefined {
  return SUPPORTED_LANGUAGES.find(lang => lang.code === code);
}

/**
 * Get all available language codes
 */
export function getAvailableLanguageCodes(): GameLanguage[] {
  return SUPPORTED_LANGUAGES.map(lang => lang.code);
}
