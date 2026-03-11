import { useState, useCallback, useRef, useEffect } from 'react';
import { 
  GameState, 
  GameConfig, 
  DictWord,
  DictCategory 
} from '../types';
import {
  initializeGame,
  createBalloon,
  updateBalloon,
  checkInputMatch,
  popBalloon,
  checkWinCondition,
  checkLoseCondition,
  defaultConfig,
} from '../lib/game';
import { soundManager } from '../lib/audio';

interface UseGameReturn {
  gameState: GameState | null;
  config: GameConfig;
  isMenuOpen: boolean;
  categories: DictCategory[];
  startGame: (wordPool: DictWord[], gameConfig?: Partial<GameConfig>) => void;
  handleInput: (input: string) => void;
  closeMenu: () => void;
  openMenu: () => void;
}

export function useGame(): UseGameReturn {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [config, setConfig] = useState<GameConfig>(defaultConfig);
  const [isMenuOpen, setIsMenuOpen] = useState(true);
  const [categories] = useState<DictCategory[]>([
    { id: 'greetings', name: '问候', color: '#ff6b6b' },
    { id: 'numbers', name: '数字', color: '#ffd93d' },
    { id: 'colors', name: '颜色', color: '#6bcb77' },
    { id: 'family', name: '家庭', color: '#4ecdc4' },
    { id: 'animals', name: '动物', color: '#9b59b6' },
    { id: 'food', name: '食物', color: '#ff8c00' },
    { id: 'time', name: '时间', color: '#3498db' },
    { id: 'nature', name: '自然', color: '#2ecc71' },
  ]);

  const animationRef = useRef<number | null>(null);
  const lastSpawnRef = useRef<number>(0);
  const canvasSizeRef = useRef({ width: 800, height: 600 });

  // Game loop
  const gameLoop = useCallback(() => {
    setGameState(prevState => {
      if (!prevState || !prevState.isPlaying) return prevState;

      const now = Date.now();

      // Spawn new balloons
      let newBalloons = [...prevState.balloons];
      if (now - lastSpawnRef.current > config.spawnInterval && 
          newBalloons.filter(b => !b.popped).length < config.maxBalloons) {
        // Get unused words
        const poppedIds = new Set(newBalloons.filter(b => b.popped).map(b => b.word.id));
        const unusedWords = prevState.wordPool.filter(w => !poppedIds.has(w.id));
        
        if (unusedWords.length > 0) {
          const word = unusedWords[Math.floor(Math.random() * unusedWords.length)];
          const balloon = createBalloon(word, canvasSizeRef.current.width, config);
          newBalloons.push(balloon);
          lastSpawnRef.current = now;
        }
      }

      // Update balloons
      newBalloons = newBalloons
        .map(b => updateBalloon(b, canvasSizeRef.current.width, canvasSizeRef.current.height))
        .filter(b => b.y > -100 && b.scale > 0.1);

      // Check win/lose
      const tempState = { ...prevState, balloons: newBalloons };
      if (checkWinCondition(tempState)) {
        soundManager.playCelebration();
        return { ...prevState, balloons: newBalloons, isPlaying: false, isWon: true };
      }
      if (checkLoseCondition(tempState)) {
        soundManager.playWrong();
        return { ...prevState, balloons: newBalloons, isPlaying: false };
      }

      return { ...prevState, balloons: newBalloons };
    });

    animationRef.current = requestAnimationFrame(gameLoop);
  }, [config]);

  // Start game loop when game state becomes playing
  useEffect(() => {
    if (gameState?.isPlaying) {
      lastSpawnRef.current = Date.now();
      animationRef.current = requestAnimationFrame(gameLoop);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gameState?.isPlaying, gameLoop]);

  // Initialize sound on mount
  useEffect(() => {
    soundManager.init();
    const handleInteraction = () => {
      soundManager.resume();
    };
    document.addEventListener('click', handleInteraction, { once: true });
    return () => {
      document.removeEventListener('click', handleInteraction);
    };
  }, []);

  const startGame = useCallback((wordPool: DictWord[], gameConfig?: Partial<GameConfig>) => {
    const mergedConfig = { ...defaultConfig, ...gameConfig };
    setConfig(mergedConfig);
    
    const state = initializeGame(wordPool, mergedConfig);
    state.isPlaying = true;
    setGameState(state);
    setIsMenuOpen(false);
  }, []);

  const handleInput = useCallback((input: string) => {
    setGameState(prevState => {
      if (!prevState || !prevState.isPlaying) return prevState;

      const trimmedInput = input.trim();
      if (!trimmedInput) return prevState;

      const { matched, isCorrect } = checkInputMatch(trimmedInput, prevState.balloons);

      if (matched) {
        // Correct match
        const newBalloons = prevState.balloons.map(b => 
          b.id === matched.id ? popBalloon(b) : b
        );
        
        soundManager.playPop();
        setTimeout(() => soundManager.playCelebration(), 100);

        return {
          ...prevState,
          balloons: newBalloons,
          score: prevState.score + 10,
          correctMatches: prevState.correctMatches + 1,
        };
      } else if (isCorrect) {
        // Wrong input
        soundManager.playWrong();
        
        return {
          ...prevState,
          lives: prevState.lives - 1,
          wrongAttempts: prevState.wrongAttempts + 1,
        };
      }

      return prevState;
    });
  }, []);

  const closeMenu = useCallback(() => setIsMenuOpen(false), []);
  const openMenu = useCallback(() => setIsMenuOpen(true), []);

  return {
    gameState,
    config,
    isMenuOpen,
    categories,
    startGame,
    handleInput,
    closeMenu,
    openMenu,
  };
}

// Hook to update canvas size
export function useCanvasSize(ref: React.RefObject<HTMLCanvasElement>) {
  const [size, setSize] = useState({ width: 800, height: 600 });

  useEffect(() => {
    const updateSize = () => {
      if (ref.current?.parentElement) {
        setSize({
          width: ref.current.parentElement.clientWidth,
          height: ref.current.parentElement.clientHeight - 10,
        });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [ref]);

  return size;
}