// Game Types
export interface DictWord {
  id: string;
  chinese: string;
  pinyin: string;
  english?: string;
  category?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}

export interface DictCategory {
  id: string;
  name: string;
  color: string;
  description?: string;
}

export interface Balloon {
  id: string;
  word: DictWord;
  x: number;
  y: number;
  speed: number;
  wobble: number;
  wobbleSpeed: number;
  popped: boolean;
  scale: number;
}

export interface GameConfig {
  balloonSpeedMin: number;
  balloonSpeedMax: number;
  spawnInterval: number;
  maxBalloons: number;
  maxLives: number;
}

export interface GameState {
  balloons: Balloon[];
  score: number;
  lives: number;
  isPlaying: boolean;
  isPaused: boolean;
  isWon: boolean;
  input: string;
  selectedWordIds: string[];
  selectedCategories: string[];
  wordPool: DictWord[];
  startTime: number;
  correctMatches: number;
  wrongAttempts: number;
}

export interface DictionaryProvider {
  id: string;
  name: string;
  getCategories: () => DictCategory[];
  getWords: (categoryIds?: string[]) => DictWord[];
  getWordsByDifficulty: (difficulty: string) => DictWord[];
  getRandomWords: (count: number, categoryIds?: string[]) => DictWord[];
  search: (query: string) => DictWord[];
  getWordCount: () => number;
}