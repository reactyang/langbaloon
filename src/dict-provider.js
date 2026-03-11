/**
 * Dictionary Provider Interface
 * 
 * Implement this interface to create a new dictionary source.
 * This abstraction allows switching between different dictionary providers
 * without changing the game code.
 */

/**
 * @typedef {Object} DictWord
 * @property {string} id
 * @property {string} chinese
 * @property {string} pinyin
 * @property {string} [english]
 * @property {string} [category]
 * @property {string} [difficulty] - 'easy' | 'medium' | 'hard'
 */

/**
 * @typedef {Object} DictCategory
 * @property {string} id
 * @property {string} name
 * @property {string} color
 * @property {string} [description]
 */

/**
 * @typedef {Object} DictionaryProvider
 * @property {string} id
 * @property {string} name
 * @property {() => DictCategory[]} getCategories
 * @property {(categoryIds?: string[]) => DictWord[]} getWords
 * @property {(difficulty: string) => DictWord[]} getWordsByDifficulty
 * @property {(count: number, categoryIds?: string[]) => DictWord[]} getRandomWords
 * @property {(query: string) => DictWord[]} search
 * @property {() => number} getWordCount
 */

/**
 * Base utility functions for dictionary providers
 */
export function normalizePinyin(pinyin) {
  return pinyin.toLowerCase().replace(/\s+/g, '').trim();
}

export function createWordId(word) {
  return word.id || `${word.chinese}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
