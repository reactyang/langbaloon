export { Game } from './components/Game';
export { Menu } from './components/Menu';
export { GameCanvas } from './components/Canvas';
export { GameInput } from './components/Input';
export { GameStats } from './components/Stats';
export { ResultScreen } from './components/ResultScreen';

// Legacy hook (deprecated, use Jotai hooks instead)
export { useGame } from './hooks/useGame';

// Jotai state management
export * from './store';

// Types and utilities
export * from './types';
export * from './lib/game';
export * from './lib/dict-factory';