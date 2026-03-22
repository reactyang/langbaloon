import { useRef } from 'react';
import { useAtom, useAtomValue } from 'jotai';
import { GameCanvas } from './Canvas';
import { GameInput } from './Input';
import { GameStats } from './Stats';
import { Menu } from './Menu';
import { ResultScreen } from './ResultScreen';
import {
  gameModeAtom,
  gameStateAtom,
  startGameAtom,
  resetGameAtom,
  balloonsAtom,
  scoreAtom,
  livesAtom,
  canvasSizeAtom,
} from '../store';
import {
  useGameLoop,
  useGameInput,
  useCanvasSize,
  useSoundInit,
} from '../store';
import { builtInDictionary } from '../lib/dict-builtin';

import './Canvas.css';
import './Input.css';
import './Stats.css';

export function Game() {
  const [gameMode] = useAtom(gameModeAtom);
  const [gameState] = useAtom(gameStateAtom);
  const balloons = useAtomValue(balloonsAtom);
  const score = useAtomValue(scoreAtom);
  const lives = useAtomValue(livesAtom);
  const canvasSize = useAtomValue(canvasSizeAtom);

  const canvasRef = useRef<HTMLDivElement>(null);

  const [, startGame] = useAtom(startGameAtom);
  const [, resetGame] = useAtom(resetGameAtom);

  // Initialize custom hooks
  useGameLoop();
  useCanvasSize(canvasRef);
  useSoundInit();
  
  const { handleInput } = useGameInput();

  const categories = builtInDictionary.getCategories();
  const words = builtInDictionary.getWords();

  const handleStartGame = (wordPool: typeof words, config?: Parameters<typeof startGame>[0]['config']) => {
    startGame({ wordPool, config });
  };

  const handleRestart = () => {
    resetGame();
  };

  return (
    <div className="container">
      {gameState && gameMode !== 'menu' && (
        <GameStats 
          score={score}
          lives={lives}
          wordPool={gameState.wordPool}
          balloons={balloons}
          onRestart={handleRestart}
        />
      )}
      
      <div className="canvas-container" ref={canvasRef}>
        {gameState && (
          <GameCanvas 
            balloons={balloons}
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
          onStartGame={handleStartGame}
        />
      )}

      {gameMode === 'won' && gameState && (
        <ResultScreen
          isWon={true}
          score={score}
          time={Math.floor((Date.now() - gameState.startTime) / 1000)}
          onRestart={handleRestart}
        />
      )}

      {gameMode === 'lost' && gameState && (
        <ResultScreen
          isWon={false}
          score={score}
          onRestart={handleRestart}
        />
      )}
    </div>
  );
}