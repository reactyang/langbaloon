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
        <h2>{isWon ? '🎉 Congratulations!' : '💔 Game Over'}</h2>
        <p>
          {isWon 
            ? 'You popped all the balloons!' 
            : 'Better luck next time...'
          }
        </p>
        <p>
          Score: <span>{score}</span>
          {time !== undefined && (
            <> | Time: <span>{time}</span> seconds</>
          )}
        </p>
        <button className="btn btn-secondary" onClick={onRestart}>
          {isWon ? 'Play Again' : 'Try Again'}
        </button>
      </div>
    </div>
  );
}