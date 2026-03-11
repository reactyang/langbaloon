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

  const spawnBalloon = useCallback((wordPool: DictWord[], balloons: Balloon[], config: GameConfig): Balloon | null => {
    const poppedIds = new Set(balloons.filter(b => b.popped).map(b => b.word.id));
    const unusedWords = wordPool.filter(w => !poppedIds.has(w.id));
    
    if (unusedWords.length === 0) return null;

    const word = unusedWords[Math.floor(Math.random() * unusedWords.length)];
    return createBalloon(word, canvasSize.width, config);
  }, [canvasSize.width]);

  const gameLoop = useCallback(() => {
    if (gameMode !== 'playing' || !gameState) return;

    setGameState(prev => {
      if (!prev) return prev;

      const now = Date.now();

      // Spawn new balloons
      let newBalloons = [...prev.balloons];
      if (now - lastSpawnRef.current > prev.config.spawnInterval && 
          newBalloons.filter(b => !b.popped).length < prev.config.maxBalloons) {
        const newBalloon = spawnBalloon(prev.wordPool, newBalloons, prev.config);
        if (newBalloon) {
          newBalloons.push(newBalloon);
          lastSpawnRef.current = now;
        }
      }

      // Update balloons
      newBalloons = newBalloons
        .map(b => updateBalloon(b, canvasSize.width, canvasSize.height))
        .filter(b => b.y > -100 && b.scale > 0.1);

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
  }, [gameMode, gameState, canvasSize, spawnBalloon]);

  // Run game loop
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