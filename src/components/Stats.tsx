import { Balloon, DictWord } from '../types';
import './Stats.css';

interface StatsProps {
  score: number;
  lives: number;
  wordPool: DictWord[];
  balloons: Balloon[];
}

export function GameStats({ score, lives, wordPool, balloons }: StatsProps) {
  const poppedIds = new Set(balloons.filter(b => b.popped).map(b => b.word.id));
  const remaining = wordPool.filter(w => !poppedIds.has(w.id)).length;

  return (
    <header>
      <h1>🎈 汉语气球射击</h1>
      <div className="stats">
        <div className="stat">分数: <span>{score}</span></div>
        <div className="stat">生命: <span>{lives}</span></div>
        <div className="stat">剩余: <span>{remaining}</span></div>
      </div>
    </header>
  );
}