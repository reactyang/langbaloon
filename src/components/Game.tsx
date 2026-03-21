import { useState, useRef, useCallback, useEffect } from 'react';
import { DictWord, GameConfig, Balloon } from '../types';
import { GameCanvas } from './Canvas';
import { GameInput } from './Input';
import { GameStats } from './Stats';
import { Menu } from './Menu';
import { ResultScreen } from './ResultScreen';
import { 
  defaultConfig,
  checkInputMatch,
  popBalloon,
  checkWinCondition,
  checkLoseCondition,
} from '../lib/game';
import { soundManager } from '../lib/audio';
import {
  createBalloon,
  updateBalloon,
} from '../lib/game';
import { builtInDictionary } from '../lib/dict-builtin';

import './Canvas.css';
import './Input.css';
import './Stats.css';

type GameMode = 'menu' | 'playing' | 'won' | 'lost';

export function Game() {
  const [gameMode, setGameMode] = useState<GameMode>('menu');
  const [gameState, setGameState] = useState<{
    balloons: Balloon[];
    score: number;
    lives: number;
    wordPool: DictWord[];
    config: GameConfig;
    startTime: number;
  } | null>(null);

  const canvasRef = useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
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

  const categories = builtInDictionary.getCategories();
  const words = builtInDictionary.getWords();

  // Initialize sound
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

  // Handle canvas resize
  useEffect(() => {
    const updateSize = () => {
      if (canvasRef.current) {
        setCanvasSize({
          width: canvasRef.current.clientWidth,
          height: canvasRef.current.clientHeight - 10,
        });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Stable spawnBalloon function using refs
  const spawnBalloonFn = useCallback((wordPool: DictWord[], balloons: Balloon[], config: GameConfig): Balloon | null => {
    // Exclude words from BOTH popped AND active balloons
    const usedWordIds = new Set(balloons.map(b => b.word.id));
    const unusedWords = wordPool.filter(w => !usedWordIds.has(w.id));
    
    console.log('[spawnBalloon] wordPool length:', wordPool.length, 'unusedWords length:', unusedWords.length, 'usedWords:', balloons.length);
    
    if (unusedWords.length === 0) {
      console.log('[spawnBalloon] No unused words available!');
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
      
      console.log('[gameLoop] timeSinceLastSpawn:', timeSinceLastSpawn, 'spawnInterval:', prev.config.spawnInterval, 'activeBalloons:', activeBalloons.length, 'maxBalloons:', prev.config.maxBalloons);
      
      if (timeSinceLastSpawn > prev.config.spawnInterval && 
          activeBalloons.length < prev.config.maxBalloons) {
        const newBalloon = spawnBalloonFn(prev.wordPool, newBalloons, prev.config);
        if (newBalloon) {
          newBalloons.push(newBalloon);
          lastSpawnRef.current = now;
          console.log('[gameLoop] Added new balloon, total:', newBalloons.length);
        }
      }

      // Update balloons
      newBalloons = newBalloons
        .map(b => updateBalloon(b, currentCanvasSize.width, currentCanvasSize.height))
        // Only remove popped balloons when they've shrunk away (scale <= 0.05)
        // Balloons should stay in the game until popped by correct pinyin input
        .filter(b => !b.popped || b.scale > 0.05);

      // Check win/lose
      const tempState = { ...prev, balloons: newBalloons };
      if (checkWinCondition({ balloons: newBalloons, wordPool: prev.wordPool })) {
        soundManager.playCelebration();
        setGameMode('won');
        return { ...prev, balloons: newBalloons };
      }
      if (checkLoseCondition({ ...tempState, lives: prev.lives })) {
        soundManager.playWrong();
        setGameMode('lost');
        return { ...prev, balloons: newBalloons };
      }

      return { ...prev, balloons: newBalloons };
    });

    animationRef.current = requestAnimationFrame(gameLoop);
  }, [spawnBalloonFn]);

  // Run game loop - only depends on gameMode, not the callback itself
  useEffect(() => {
    if (gameMode === 'playing') {
      lastSpawnRef.current = Date.now();
      console.log('[useEffect] Starting game loop, lastSpawnRef reset');
      animationRef.current = requestAnimationFrame(gameLoop);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gameMode]); // Removed gameLoop from dependencies

  const startGame = (wordPool: DictWord[], config?: Partial<GameConfig>) => {
    const mergedConfig = { ...defaultConfig, ...config };
    setGameState({
      balloons: [],
      score: 0,
      lives: mergedConfig.maxLives,
      wordPool,
      config: mergedConfig,
      startTime: Date.now(),
    });
    setGameMode('playing');
  };

  const handleInput = (input: string) => {
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
  };

  const restartGame = () => {
    setGameMode('menu');
  };

  return (
    <div className="container">
      {gameState && gameMode !== 'menu' && (
        <GameStats 
          score={gameState.score}
          lives={gameState.lives}
          wordPool={gameState.wordPool}
          balloons={gameState.balloons}
          onRestart={restartGame}
        />
      )}
      
      <div className="canvas-container" ref={canvasRef}>
        {gameState && (
          <GameCanvas 
            balloons={gameState.balloons}
            categories={categories}
            canvasWidth={canvasSize.width}
            canvasHeight={canvasSize.height}
          />
        )}
      </div>
      
      {gameMode === 'playing' && (
        <GameInput 
          onSubmit={handleInput}
          disabled={gameMode !== 'playing'}
        />
      )}

      {gameMode === 'menu' && (
        <Menu
          categories={categories}
          words={words}
          onStartGame={startGame}
        />
      )}

      {gameMode === 'won' && gameState && (
        <ResultScreen
          isWon={true}
          score={gameState.score}
          time={Math.floor((Date.now() - gameState.startTime) / 1000)}
          onRestart={restartGame}
        />
      )}

      {gameMode === 'lost' && gameState && (
        <ResultScreen
          isWon={false}
          score={gameState.score}
          onRestart={restartGame}
        />
      )}
    </div>
  );
}