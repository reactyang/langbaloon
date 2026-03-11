// Dictionary Factory
// Central place to register and access dictionary providers

import { builtInDictionary } from './dict-builtin';
import { DictionaryProvider, DictCategory, DictWord } from '../types';

// Registry of available dictionaries
const dictionaries = new Map<string, DictionaryProvider>();

// Default dictionary ID
let defaultDictionaryId = 'builtin';

/**
 * Register a dictionary provider
 */
export function registerDictionary(provider: DictionaryProvider) {
  if (dictionaries.has(provider.id)) {
    console.warn(`Dictionary '${provider.id}' is already registered. Replacing...`);
  }
  dictionaries.set(provider.id, provider);
}

/**
 * Get a dictionary by ID
 */
export function getDictionary(id?: string): DictionaryProvider {
  const dictId = id || defaultDictionaryId;
  const dict = dictionaries.get(dictId);
  
  if (!dict) {
    console.warn(`Dictionary '${dictId}' not found. Using default.`);
    return dictionaries.get(defaultDictionaryId)!;
  }
  
  return dict;
}

/**
 * Get default dictionary
 */
export function getDefaultDictionary(): DictionaryProvider {
  return getDictionary(defaultDictionaryId);
}

/**
 * Set default dictionary
 */
export function setDefaultDictionary(id: string): void {
  if (!dictionaries.has(id)) {
    throw new Error(`Dictionary '${id}' is not registered`);
  }
  defaultDictionaryId = id;
}

/**
 * Get all registered dictionary IDs
 */
export function getAvailableDictionaries(): Array<{ id: string; name: string }> {
  return Array.from(dictionaries.values()).map(d => ({ id: d.id, name: d.name }));
}

/**
 * Initialize with built-in dictionary
 * Call this at app startup
 */
export function initializeDictionaries(): void {
  registerDictionary(builtInDictionary);
}

// Convenience functions that delegate to default dictionary
export const getCategories = (): DictCategory[] => getDefaultDictionary().getCategories();
export const getWords = (categoryIds?: string[]): DictWord[] => getDefaultDictionary().getWords(categoryIds);
export const getWordsByDifficulty = (difficulty: string): DictWord[] => getDefaultDictionary().getWordsByDifficulty(difficulty);
export const getRandomWords = (count: number, categoryIds?: string[]): DictWord[] => getDefaultDictionary().getRandomWords(count, categoryIds);
export const searchWords = (query: string): DictWord[] => getDefaultDictionary().search(query);
export const getWordCount = (): number => getDefaultDictionary().getWordCount();