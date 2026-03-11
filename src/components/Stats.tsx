import { Balloon, DictWord } from '../types';
import './Stats.css';

interface StatsProps {
  score: number;
  lives: number;
  wordPool: DictWord[];
  balloons: Balloon[];
  onRestart?: () => void;
}

export function GameStats({ score, lives, wordPool, balloons, onRestart }: StatsProps) {
  const poppedIds = new Set(balloons.filter(b => b.popped).map(b => b.word.id));
  const remaining = wordPool.filter(w => !poppedIds.has(w.id)).length;

  return (
    <header>
      <h1>🎈 Chinese Balloon Shooter</h1>
      <div className="stats">
        <div className="stat">Score: <span>{score}</span></div>
        <div className="stat">Lives: <span>{lives}</span></div>
        <div className="stat">Remaining: <span>{remaining}</span></div>
        {onRestart && (
          <button className="restart-btn" onClick={onRestart}>Restart</button>
        )}
      </div>
    </header>
  );
}