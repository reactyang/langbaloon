import { describe, it, expect, beforeEach } from 'vitest';
import {
  DictWord,
  DictCategory,
  normalizePinyin,
  createWordId,
  type DictionaryProvider
} from '../src/dict-provider.js';
import {
  words,
  categories,
  builtInDictionary,
  getWordsByCategories,
  getCategoryById,
} from '../src/dict-builtin.js';
import {
  createBalloon,
  updateBalloon,
  checkInputMatch,
  popBalloon,
  initializeGame,
  getRemainingWords,
  checkWinCondition,
  checkLoseCondition,
  defaultConfig,
  type Balloon,
  type GameState
} from '../src/game.js';
import { initializeDictionaries, getDictionary, getAvailableDictionaries } from '../src/dict-factory.js';

describe('Dictionary Provider Interface', () => {
  describe('normalizePinyin', () => {
    it('should convert to lowercase', () => {
      expect(normalizePinyin('YI')).toBe('yi');
      expect(normalizePinyin('SAN')).toBe('san');
    });

    it('should trim whitespace', () => {
      expect(normalizePinyin('  yi  ')).toBe('yi');
    });

    it('should remove internal whitespace', () => {
      expect(normalizePinyin('yi  san')).toBe('yisan');
    });

    it('should handle empty string', () => {
      expect(normalizePinyin('')).toBe('');
    });
  });

  describe('createWordId', () => {
    it('should create unique IDs', () => {
      const id1 = createWordId({ chinese: '一' });
      const id2 = createWordId({ chinese: '一' });
      expect(id1).not.toBe(id2);
    });

    it('should use provided ID if available', () => {
      const id = createWordId({ id: 'test-id', chinese: '一' });
      expect(id).toBe('test-id');
    });
  });
});

describe('BuiltInDictionary', () => {
  beforeEach(() => {
    initializeDictionaries();
  });

  it('should have correct id and name', () => {
    expect(builtInDictionary.id).toBe('builtin');
    expect(builtInDictionary.name).toBe('Built-in Dictionary');
  });

  describe('getCategories', () => {
    it('should return all categories', () => {
      const cats = builtInDictionary.getCategories();
      expect(cats.length).toBeGreaterThan(0);
    });

    it('should have valid category structure', () => {
      const cats = builtInDictionary.getCategories();
      cats.forEach(cat => {
        expect(cat).toHaveProperty('id');
        expect(cat).toHaveProperty('name');
        expect(cat).toHaveProperty('color');
      });
    });
  });

  describe('getWords', () => {
    it('should return all words when no filter', () => {
      const allWords = builtInDictionary.getWords();
      expect(allWords.length).toBeGreaterThan(0);
    });

    it('should filter by category', () => {
      const numberWords = builtInDictionary.getWords(['numbers']);
      numberWords.forEach(w => {
        expect(w.category).toBe('numbers');
      });
    });
  });

  describe('getWordsByDifficulty', () => {
    it('should return easy words', () => {
      const easyWords = builtInDictionary.getWordsByDifficulty('easy');
      easyWords.forEach(w => {
        expect(w.difficulty).toBe('easy');
      });
    });
  });

  describe('getRandomWords', () => {
    it('should return requested count', () => {
      const random = builtInDictionary.getRandomWords(5);
      expect(random).toHaveLength(5);
    });

    it('should not exceed available words', () => {
      const random = builtInDictionary.getRandomWords(1000);
      expect(random.length).toBeLessThanOrEqual(builtInDictionary.getWordCount());
    });
  });

  describe('search', () => {
    it('should find by pinyin', () => {
      const results = builtInDictionary.search('yi');
      expect(results.length).toBeGreaterThan(0);
      expect(results.some(w => w.pinyin === 'yi')).toBe(true);
    });

    it('should find by Chinese', () => {
      const results = builtInDictionary.search('一');
      expect(results.length).toBeGreaterThan(0);
    });

    it('should find by English', () => {
      const results = builtInDictionary.search('dog');
      expect(results.length).toBeGreaterThan(0);
    });
  });
});

describe('Dictionary Factory', () => {
  beforeEach(() => {
    initializeDictionaries();
  });

  it('should register built-in dictionary', () => {
    const dict = getDictionary('builtin');
    expect(dict).toBeDefined();
    expect(dict.id).toBe('builtin');
  });

  it('should return all available dictionaries', () => {
    const available = getAvailableDictionaries();
    expect(available.length).toBeGreaterThan(0);
  });
});

describe('Game Logic', () => {
  let testWord: DictWord;
  let config: typeof defaultConfig;

  beforeEach(() => {
    initializeDictionaries();
    const dict = getDictionary('builtin');
    testWord = dict.getWords()[0];
    config = { ...defaultConfig };
  });

  describe('createBalloon', () => {
    it('should create balloon with correct properties', () => {
      const balloon = createBalloon(testWord, 800, config);
      
      expect(balloon.word).toBe(testWord);
      expect(balloon.x).toBeGreaterThan(80);
      expect(balloon.x).toBeLessThan(720);
      expect(balloon.y).toBe(-60);
      expect(balloon.speed).toBeGreaterThanOrEqual(config.balloonSpeedMin);
      expect(balloon.speed).toBeLessThanOrEqual(config.balloonSpeedMax);
      expect(balloon.popped).toBe(false);
      expect(balloon.scale).toBe(1);
    });
  });

  describe('updateBalloon', () => {
    it('should move balloon up', () => {
      const balloon = createBalloon(testWord, 800, config);
      const initialY = balloon.y;
      const updated = updateBalloon(balloon, 800, 600);
      
      expect(updated.y).toBeGreaterThan(initialY);
    });

    it('should handle popped balloon', () => {
      const balloon = { ...createBalloon(testWord, 800, config), popped: true };
      const updated = updateBalloon(balloon, 800, 600);
      
      expect(updated.scale).toBeLessThan(balloon.scale);
    });
  });

  describe('checkInputMatch', () => {
    let gameState: GameState;

    beforeEach(() => {
      const dict = getDictionary('builtin');
      const wordPool = dict.getWords(['numbers']);
      gameState = initializeGame(wordPool, config);
      const balloon = createBalloon(testWord, 800, config);
      gameState.balloons.push(balloon);
    });

    it('should match correct pinyin', () => {
      const result = checkInputMatch(testWord.pinyin, gameState.balloons);
      
      expect(result.isCorrect).toBe(true);
      expect(result.matched).toBeDefined();
    });

    it('should match case-insensitive', () => {
      const result = checkInputMatch('YI', gameState.balloons);
      
      expect(result.isCorrect).toBe(true);
    });

    it('should return null for empty input', () => {
      const result = checkInputMatch('', gameState.balloons);
      
      expect(result.matched).toBeNull();
    });
  });

  describe('initializeGame', () => {
    it('should create game state with word pool', () => {
      const dict = getDictionary('builtin');
      const wordPool = dict.getWords(['numbers']);
      const state = initializeGame(wordPool, config);
      
      expect(state.wordPool).toBe(wordPool);
      expect(state.balloons).toHaveLength(0);
      expect(state.score).toBe(0);
      expect(state.lives).toBe(config.maxLives);
    });
  });

  describe('getRemainingWords', () => {
    it('should exclude popped words', () => {
      const dict = getDictionary('builtin');
      const wordPool = dict.getWords(['numbers']);
      const state = initializeGame(wordPool, config);
      
      state.balloons.push(popBalloon(createBalloon(testWord, 800, config)));
      
      const remaining = getRemainingWords(state);
      expect(remaining.find(w => w.id === testWord.id)).toBeUndefined();
    });
  });

  describe('checkWinCondition', () => {
    it('should not win initially', () => {
      const dict = getDictionary('builtin');
      const wordPool = dict.getWords(['numbers']);
      const state = initializeGame(wordPool, config);
      
      expect(checkWinCondition(state)).toBe(false);
    });
  });

  describe('checkLoseCondition', () => {
    it('should lose when lives reach zero', () => {
      const dict = getDictionary('builtin');
      const wordPool = dict.getWords(['numbers']);
      const state = initializeGame(wordPool, config);
      state.lives = 0;
      
      expect(checkLoseCondition(state)).toBe(true);
    });
  });
});
