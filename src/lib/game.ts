// Game Logic - Core game functions

import { normalizePinyin } from './dict-provider';
import { Balloon, DictWord, GameConfig, GameState } from '../types';

export function createBalloon(word: DictWord, canvasWidth: number, config: GameConfig): Balloon {
  const id = `${word.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const padding = 80;
  const x = padding + Math.random() * (canvasWidth - padding * 2);
  
  // Spawn at bottom of visible canvas area (so balloons appear immediately)
  const canvasHeight = 600;
  const balloonHeight = 110;
  const startY = canvasHeight - balloonHeight - 20; // Start at bottom of visible area
  
  const balloon: Balloon = {
    id,
    word,
    x,
    y: startY,
    // Negative speed to float upward (balloons float up)
    speed: -(config.balloonSpeedMin + Math.random() * (config.balloonSpeedMax - config.balloonSpeedMin)),
    wobble: Math.random() * Math.PI * 2,
    wobbleSpeed: 0.02 + Math.random() * 0.02,
    popped: false,
    scale: 1,
  };

  console.log('[createBalloon] Created balloon:', word.chinese, 'x:', x, 'y:', startY);
  return balloon;
}

export function updateBalloon(balloon: Balloon, canvasWidth: number, canvasHeight: number): Balloon {
  if (balloon.popped) {
    // Popped balloons shrink and fade away, then respawn at bottom
    const newScale = balloon.scale * 0.92;
    let newY = balloon.y - 3;
    
    // When popped balloon shrinks away, respawn it at bottom
    if (newScale <= 0.05) {
      const padding = 80;
      const x = padding + Math.random() * (canvasWidth - padding * 2);
      return {
        ...balloon,
        x,
        y: canvasHeight - 110, // Start at bottom
        scale: 1,
        popped: false,
        wobble: Math.random() * Math.PI * 2,
      };
    }
    
    return { ...balloon, y: newY, scale: newScale };
  }

  // Active balloon floats upward
  let newY = balloon.y + balloon.speed;
  const wobbleX = Math.sin(balloon.wobble) * 2;
  const newWobble = balloon.wobble + balloon.wobbleSpeed;

  // Keep balloon within horizontal bounds
  let newX = balloon.x + wobbleX;
  const balloonWidth = 45;
  if (newX < balloonWidth) {
    newX = balloonWidth;
  } else if (newX > canvasWidth - balloonWidth) {
    newX = canvasWidth - balloonWidth;
  }
  
  // If balloon goes above the canvas, bounce it back to the bottom
  const balloonTop = -55; // Top of balloon (accounting for string)
  if (newY < balloonTop) {
    // Respawn at bottom with new random x position
    const padding = 80;
    newX = padding + Math.random() * (canvasWidth - padding * 2);
    newY = canvasHeight - 110; // Start at bottom
  }
  
  return {
    ...balloon,
    x: newX,
    y: newY,
    wobble: newWobble,
  };
}

export function checkInputMatch(input: string, balloons: Balloon[]): { matched: Balloon | null; isCorrect: boolean } {
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

export function popBalloon(balloon: Balloon): Balloon {
  return { ...balloon, popped: true };
}

export const defaultConfig: GameConfig = {
  balloonSpeedMin: 1.5,
  balloonSpeedMax: 2.5,
  spawnInterval: 2500,
  maxBalloons: 6,
  maxLives: 3,
};

export function initializeGame(wordPool: DictWord[], config: GameConfig = defaultConfig): GameState {
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

export function getRemainingWords(state: { balloons: Balloon[]; wordPool: DictWord[] }): DictWord[] {
  const poppedIds = new Set(state.balloons.filter(b => b.popped).map(b => b.word.id));
  return state.wordPool.filter(w => !poppedIds.has(w.id));
}

export function checkWinCondition(state: { balloons: Balloon[]; wordPool: DictWord[] }): boolean {
  const remainingWords = getRemainingWords(state);
  const activeBalloons = state.balloons.filter(b => !b.popped);
  return remainingWords.length === 0 && activeBalloons.length === 0;
}

export function checkLoseCondition(state: { lives: number }): boolean {
  return state.lives <= 0;
}

// Helper function to lighten a color
export function lightenColor(color: string, percent: number): string {
  const num = parseInt(color.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.min(255, (num >> 16) + amt);
  const G = Math.min(255, ((num >> 8) & 0x00FF) + amt);
  const B = Math.min(255, (num & 0x0000FF) + amt);
  return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
}