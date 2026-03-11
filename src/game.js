/**
 * Game Types and Logic
 * 
 * Generic game types that work with any dictionary provider.
 */

import { normalizePinyin } from './dict-provider.js';

export function createBalloon(word, canvasWidth, config) {
  const id = `${word.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const padding = 80;
  const x = padding + Math.random() * (canvasWidth - padding * 2);
  
  return {
    id,
    word,
    x,
    y: -60,
    speed: config.balloonSpeedMin + Math.random() * (config.balloonSpeedMax - config.balloonSpeedMin),
    wobble: Math.random() * Math.PI * 2,
    wobbleSpeed: 0.02 + Math.random() * 0.02,
    popped: false,
    scale: 1,
  };
}

export function updateBalloon(balloon, canvasWidth, canvasHeight) {
  if (balloon.popped) {
    return { ...balloon, y: balloon.y - 5, scale: balloon.scale * 0.9 };
  }

  const newY = balloon.y + balloon.speed;
  const wobbleX = Math.sin(balloon.wobble) * 2;
  const newWobble = balloon.wobble + balloon.wobbleSpeed;

  return {
    ...balloon,
    x: balloon.x + wobbleX,
    y: newY,
    wobble: newWobble,
  };
}

export function checkInputMatch(input, balloons) {
  const normalizedInput = normalizePinyin(input);
  
  if (!normalizedInput) {
    return { matched: null, isCorrect: false };
  }

  // Find matching balloon (prioritize lowest balloon)
  const sortedBalloons = [...balloons]
    .filter(b => !b.popped)
    .sort((a, b) => b.y - a.y);

  for (const balloon of sortedBalloons) {
    const normalizedWord = normalizePinyin(balloon.word.pinyin);
    
    if (normalizedWord === normalizedInput) {
      return { matched: balloon, isCorrect: true };
    }
  }

  // Check if input matches any word partially (wrong attempt)
  const hasAnyMatch = balloons.some(b => 
    !b.popped && normalizePinyin(b.word.pinyin).startsWith(normalizedInput)
  );

  return { matched: null, isCorrect: !hasAnyMatch };
}

export function popBalloon(balloon) {
  return { ...balloon, popped: true };
}

export const defaultConfig = {
  balloonSpeedMin: 0.5,
  balloonSpeedMax: 1.5,
  spawnInterval: 2000,
  maxBalloons: 8,
  maxLives: 3,
};

export function initializeGame(wordPool, config = defaultConfig) {
  return {
    balloons: [],
    score: 0,
    lives: config.maxLives,
    isPlaying: true,
    isPaused: false,
    isWon: false,
    input: '',
    selectedWordIds: wordPool.map(w => w.id),
    selectedCategories: [],
    wordPool,
    startTime: Date.now(),
    correctMatches: 0,
    wrongAttempts: 0,
  };
}

export function getRemainingWords(state) {
  const poppedIds = new Set(state.balloons.filter(b => b.popped).map(b => b.word.id));
  return state.wordPool.filter(w => !poppedIds.has(w.id));
}

export function checkWinCondition(state) {
  const remainingWords = getRemainingWords(state);
  const activeBalloons = state.balloons.filter(b => !b.popped);
  return remainingWords.length === 0 && activeBalloons.length === 0;
}

export function checkLoseCondition(state) {
  return state.lives <= 0;
}
