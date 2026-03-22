import { atom } from 'jotai';
import { DictWord, Balloon, GameConfig } from '../types';
import { defaultConfig } from '../lib/game';

// Types
export type GameMode = 'menu' | 'playing' | 'won' | 'lost';

export interface GameComponentState {
  balloons: Balloon[];
  score: number;
  lives: number;
  wordPool: DictWord[];
  config: GameConfig;
  startTime: number;
}

// Primitive atoms
export const gameModeAtom = atom<GameMode>('menu');

export const gameStateAtom = atom<GameComponentState | null>(null);

export const canvasSizeAtom = atom({ width: 800, height: 600 });

// Derived atoms
export const isPlayingAtom = atom(
  (get) => get(gameModeAtom) === 'playing'
);

export const balloonsAtom = atom(
  (get) => get(gameStateAtom)?.balloons ?? []
);

export const scoreAtom = atom(
  (get) => get(gameStateAtom)?.score ?? 0
);

export const livesAtom = atom(
  (get) => get(gameStateAtom)?.lives ?? 0
);

// Action atoms
export const startGameAtom = atom(
  null,
  (_get, set, payload: { wordPool: DictWord[]; config?: Partial<GameConfig> }) => {
    const mergedConfig = { ...defaultConfig, ...payload.config };
    set(gameStateAtom, {
      balloons: [],
      score: 0,
      lives: mergedConfig.maxLives,
      wordPool: payload.wordPool,
      config: mergedConfig,
      startTime: Date.now(),
    });
    set(gameModeAtom, 'playing');
  }
);

export const resetGameAtom = atom(
  null,
  (_get, set) => {
    set(gameModeAtom, 'menu');
    set(gameStateAtom, null);
  }
);

export const setGameModeAtom = atom(
  null,
  (_get, set, mode: GameMode) => {
    set(gameModeAtom, mode);
  }
);