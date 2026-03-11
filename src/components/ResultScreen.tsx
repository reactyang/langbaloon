import './ResultScreen.css';

interface ResultScreenProps {
  isWon: boolean;
  score: number;
  time?: number;
  onRestart: () => void;
}

export function ResultScreen({ isWon, score, time, onRestart }: ResultScreenProps) {
  return (
    <div className="result-overlay">
      <div className={`result ${isWon ? 'won' : 'lost'}`}>
        <h2>{isWon ? '🎉 恭喜获胜' : '💔 游戏结束'}</h2>
        <p>
          {isWon 
            ? '你成功击破了所有气球' 
            : '很遗憾你没有成功...'
          }
        </p>
        <p>
          得分: <span>{score}</span>
          {time !== undefined && (
            <> | 用时: <span>{time}</span>秒</>
          )}
        </p>
        <button className="btn btn-secondary" onClick={onRestart}>
          {isWon ? '再玩一次' : '再试一次'}
        </button>
      </div>
    </div>
  );
}