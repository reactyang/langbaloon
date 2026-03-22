import { useCallback, useRef, useEffect } from 'react';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import {
  gameModeAtom,
  gameStateAtom,
  canvasSizeAtom,
} from './atoms';
import {
  createBalloon,
  updateBalloon,
  checkInputMatch,
  popBalloon,
  checkWinCondition,
  checkLoseCondition,
} from '../lib/game';
import { Balloon, DictWord, GameConfig } from '../types';
import { soundManager } from '../lib/audio';

/**
 * Hook for managing the game loop
 */
export function useGameLoop() {
  const [gameMode, setGameMode] = useAtom(gameModeAtom);
  const [gameState, setGameState] = useAtom(gameStateAtom);
  const canvasSize = useAtomValue(canvasSizeAtom);
  
  const animationRef = useRef<number | null>(null);
  const lastSpawnRef = useRef<number>(0);
  
  // Use refs to hold current values for the game loop
  const gameModeRef = useRef(gameMode);
  const gameStateRef = useRef(gameState);
  const canvasSizeRef = useRef(canvasSize);
  
  // Keep refs in sync
  gameModeRef.current = gameMode;
  gameStateRef.current = gameState;
  canvasSizeRef.current = canvasSize;

  // Stable spawnBalloon function using refs
  const spawnBalloonFn = useCallback((wordPool: DictWord[], balloons: Balloon[], config: GameConfig): Balloon | null => {
    // Exclude words from BOTH popped AND active balloons
    const usedWordIds = new Set(balloons.map(b => b.word.id));
    const unusedWords = wordPool.filter(w => !usedWordIds.has(w.id));
    
    if (unusedWords.length === 0) {
      return null;
    }

    const word = unusedWords[Math.floor(Math.random() * unusedWords.length)];
    return createBalloon(word, canvasSizeRef.current.width, config);
  }, []);

  // Game loop using refs (stable, doesn't change)
  const gameLoop = useCallback(() => {
    const currentGameMode = gameModeRef.current;
    const currentGameState = gameStateRef.current;
    const currentCanvasSize = canvasSizeRef.current;
    
    if (currentGameMode !== 'playing' || !currentGameState) {
      // Stop the loop if not playing
      return;
    }

    setGameState(prev => {
      if (!prev) return prev;

      const now = Date.now();

      // Spawn new balloons
      let newBalloons = [...prev.balloons];
      const activeBalloons = newBalloons.filter(b => !b.popped);
      const timeSinceLastSpawn = now - lastSpawnRef.current;
      
      if (timeSinceLastSpawn > prev.config.spawnInterval && 
          activeBalloons.length < prev.config.maxBalloons) {
        const newBalloon = spawnBalloonFn(prev.wordPool, newBalloons, prev.config);
        if (newBalloon) {
          newBalloons.push(newBalloon);
          lastSpawnRef.current = now;
        }
      }

      // Update balloons
      newBalloons = newBalloons
        .map(b => updateBalloon(b, currentCanvasSize.width, currentCanvasSize.height))
        // Only remove popped balloons when they've shrunk away (scale <= 0.05)
        .filter(b => !b.popped || b.scale > 0.05);

      // Check win/lose
      if (checkWinCondition({ balloons: newBalloons, wordPool: prev.wordPool })) {
        soundManager.playCelebration();
        setGameMode('won');
        return { ...prev, balloons: newBalloons };
      }
      if (checkLoseCondition({ lives: prev.lives })) {
        soundManager.playWrong();
        setGameMode('lost');
        return { ...prev, balloons: newBalloons };
      }

      return { ...prev, balloons: newBalloons };
    });

    animationRef.current = requestAnimationFrame(gameLoop);
  }, [spawnBalloonFn, setGameState, setGameMode]);

  // Run game loop - only depends on gameMode
  useEffect(() => {
    if (gameMode === 'playing') {
      lastSpawnRef.current = Date.now();
      animationRef.current = requestAnimationFrame(gameLoop);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gameMode, gameLoop]);

  return { gameMode, gameState, canvasSize };
}

/**
 * Hook for handling user input
 */
export function useGameInput() {
  const [gameState, setGameState] = useAtom(gameStateAtom);
  const gameMode = useAtomValue(gameModeAtom);

  const handleInput = useCallback((input: string) => {
    if (!gameState || gameMode !== 'playing') return;

    const trimmedInput = input.trim();
    if (!trimmedInput) return;

    const { matched, isCorrect } = checkInputMatch(trimmedInput, gameState.balloons);

    if (matched) {
      // Correct match
      const newBalloons = gameState.balloons.map(b => 
        b.id === matched.id ? popBalloon(b) : b
      );
      
      soundManager.playPop();
      setTimeout(() => soundManager.playCelebration(), 100);

      setGameState(prev => prev ? {
        ...prev,
        balloons: newBalloons,
        score: prev.score + 10,
      } : null);
    } else if (isCorrect) {
      // Wrong input
      soundManager.playWrong();
      
      setGameState(prev => prev ? {
        ...prev,
        lives: prev.lives - 1,
      } : null);
    }
  }, [gameState, gameMode, setGameState]);

  return { handleInput };
}

/**
 * Hook for updating canvas size based on container
 */
export function useCanvasSize(containerRef: React.RefObject<HTMLDivElement>) {
  const setCanvasSize = useSetAtom(canvasSizeAtom);

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setCanvasSize({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight - 10,
        });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [containerRef, setCanvasSize]);
}

/**
 * Hook for sound initialization
 */
export function useSoundInit() {
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
}