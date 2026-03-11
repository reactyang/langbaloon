/**
 * Dictionary Factory
 * 
 * Central place to register and access dictionary providers.
 * To add a new dictionary:
 * 1. Implement DictionaryProvider interface
 * 2. Register it here with a unique ID
 */

import { builtInDictionary } from './dict-builtin.js';

// Registry of available dictionaries
const dictionaries = new Map();

// Default dictionary ID
let defaultDictionaryId = 'builtin';

/**
 * Register a dictionary provider
 */
export function registerDictionary(provider) {
  if (dictionaries.has(provider.id)) {
    console.warn(`Dictionary '${provider.id}' is already registered. Replacing...`);
  }
  dictionaries.set(provider.id, provider);
}

/**
 * Get a dictionary by ID
 */
export function getDictionary(id) {
  const dictId = id || defaultDictionaryId;
  const dict = dictionaries.get(dictId);
  
  if (!dict) {
    console.warn(`Dictionary '${dictId}' not found. Using default.`);
    return dictionaries.get(defaultDictionaryId);
  }
  
  return dict;
}

/**
 * Get default dictionary
 */
export function getDefaultDictionary() {
  return getDictionary(defaultDictionaryId);
}

/**
 * Set default dictionary
 */
export function setDefaultDictionary(id) {
  if (!dictionaries.has(id)) {
    throw new Error(`Dictionary '${id}' is not registered`);
  }
  defaultDictionaryId = id;
}

/**
 * Get all registered dictionary IDs
 */
export function getAvailableDictionaries() {
  return Array.from(dictionaries.values()).map(d => ({ id: d.id, name: d.name }));
}

/**
 * Initialize with built-in dictionary
 * Call this at app startup
 */
export function initializeDictionaries() {
  registerDictionary(builtInDictionary);
}

// Convenience functions that delegate to default dictionary
export const getCategories = () => getDefaultDictionary().getCategories();
export const getWords = (categoryIds) => getDefaultDictionary().getWords(categoryIds);
export const getWordsByDifficulty = (difficulty) => getDefaultDictionary().getWordsByDifficulty(difficulty);
export const getRandomWords = (count, categoryIds) => getDefaultDictionary().getRandomWords(count, categoryIds);
export const searchWords = (query) => getDefaultDictionary().search(query);
export const getWordCount = () => getDefaultDictionary().getWordCount();
