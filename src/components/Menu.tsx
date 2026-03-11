import { useState, useMemo } from 'react';
import { DictCategory, DictWord, GameConfig } from '../types';
import './Menu.css';

interface MenuProps {
  categories: DictCategory[];
  words: DictWord[];
  onStartGame: (wordPool: DictWord[], config: Partial<GameConfig>) => void;
}

export function Menu({ categories, words, onStartGame }: MenuProps) {
  const [gameMode, setGameMode] = useState<'select' | 'random'>('select');
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<Set<string>>(
    new Set(categories.map(c => c.id))
  );
  const [selectedWordIds, setSelectedWordIds] = useState<Set<string>>(new Set());
  const [wordCountMode, setWordCountMode] = useState<'all' | 'custom'>('all');
  const [randomCount, setRandomCount] = useState(10);
  const [maxBalloons, setMaxBalloons] = useState(8);
  const [maxLives, setMaxLives] = useState(3);

  // Filter words by selected categories
  const filteredWords = useMemo(() => {
    if (selectedCategoryIds.size === 0) return [];
    return words.filter(w => w.category && selectedCategoryIds.has(w.category));
  }, [words, selectedCategoryIds]);

  const toggleCategory = (categoryId: string) => {
    const newSelected = new Set(selectedCategoryIds);
    if (newSelected.has(categoryId)) {
      newSelected.delete(categoryId);
    } else {
      newSelected.add(categoryId);
    }
    setSelectedCategoryIds(newSelected);
  };

  const toggleWord = (wordId: string) => {
    const newSelected = new Set(selectedWordIds);
    if (newSelected.has(wordId)) {
      newSelected.delete(wordId);
    } else {
      newSelected.add(wordId);
    }
    setSelectedWordIds(newSelected);
  };

  const selectAllCategories = () => {
    setSelectedCategoryIds(new Set(categories.map(c => c.id)));
  };

  const clearAllCategories = () => {
    setSelectedCategoryIds(new Set());
  };

  const selectAllWords = () => {
    setSelectedWordIds(new Set(filteredWords.map(w => w.id)));
  };

  const clearAllWords = () => {
    setSelectedWordIds(new Set());
  };

  const selectEasyWords = () => {
    const easyWordIds = filteredWords
      .filter(w => w.difficulty === 'easy')
      .map(w => w.id);
    setSelectedWordIds(new Set(easyWordIds));
  };

  const handleStart = () => {
    let wordPool: DictWord[];

    if (gameMode === 'select') {
      wordPool = words.filter(w => selectedWordIds.has(w.id));
      if (wordPool.length === 0) {
        alert('Please select at least one word');
        return;
      }
    } else {
      // Random mode
      if (wordCountMode === 'all') {
        wordPool = words.filter(w => w.category && selectedCategoryIds.has(w.category));
      } else {
        const categoryIds = Array.from(selectedCategoryIds);
        const pool = words.filter(w => w.category && categoryIds.includes(w.category));
        const shuffled = [...pool].sort(() => Math.random() - 0.5);
        wordPool = shuffled.slice(0, Math.min(randomCount, shuffled.length));
      }

      if (wordPool.length === 0) {
        alert('No words available. Please select a category.');
        return;
      }
    }

    onStartGame(wordPool, { maxBalloons, maxLives });
  };

  return (
    <div className="menu-overlay">
      <div className="menu">
        <h2>Select Words to Start</h2>
        
        {/* Game Mode */}
        <div className="menu-section">
          <h3>Game Mode</h3>
          <div className="mode-selector">
            <label className="mode-option">
              <input
                type="radio"
                name="gameMode"
                value="select"
                checked={gameMode === 'select'}
                onChange={() => setGameMode('select')}
              />
              <span>Select Words</span>
            </label>
            <label className="mode-option">
              <input
                type="radio"
                name="gameMode"
                value="random"
                checked={gameMode === 'random'}
                onChange={() => setGameMode('random')}
              />
              <span>Random</span>
            </label>
          </div>
        </div>

        {/* Categories */}
        <div className="menu-section">
          <h3>Categories</h3>
          <div className="category-grid">
            {categories.map(cat => (
              <button
                key={cat.id}
                className={`category-btn ${selectedCategoryIds.has(cat.id) ? 'selected' : ''}`}
                style={{ borderColor: cat.color }}
                onClick={() => toggleCategory(cat.id)}
              >
                {cat.name}
              </button>
            ))}
          </div>
          <div className="quick-actions">
            <button className="quick-btn" onClick={selectAllCategories}>Select All</button>
            <button className="quick-btn" onClick={clearAllCategories}>Clear</button>
          </div>
        </div>

        {/* Random mode options */}
        {gameMode === 'random' && (
          <div className="menu-section">
            <h3>Random Settings</h3>
            <div className="word-count-selector">
              <label>
                <input
                  type="radio"
                  name="wordCountMode"
                  value="all"
                  checked={wordCountMode === 'all'}
                  onChange={() => setWordCountMode('all')}
                />
                <span>All Words</span>
              </label>
              <label>
                <input
                  type="radio"
                  name="wordCountMode"
                  value="custom"
                  checked={wordCountMode === 'custom'}
                  onChange={() => setWordCountMode('custom')}
                />
                <span>Random Count</span>
              </label>
              {wordCountMode === 'custom' && (
                <>
                  <input
                    type="number"
                    min={5}
                    max={50}
                    value={randomCount}
                    onChange={(e) => setRandomCount(parseInt(e.target.value) || 10)}
                  />
                  <span>words</span>
                </>
              )}
            </div>
          </div>
        )}

        {/* Word Selection (for select mode) */}
        {gameMode === 'select' && (
          <div className="menu-section">
            <h3>Select Words</h3>
            <div className="quick-actions">
              <button className="quick-btn" onClick={selectAllWords}>Select All</button>
              <button className="quick-btn" onClick={clearAllWords}>Clear</button>
              <button className="quick-btn" onClick={selectEasyWords}>Easy Only</button>
            </div>
            <div className="word-list">
              {filteredWords.length === 0 ? (
                <div className="empty-state">Please select a category</div>
              ) : (
                filteredWords.map(word => (
                  <label
                    key={word.id}
                    className={`word-item ${selectedWordIds.has(word.id) ? 'selected' : ''}`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedWordIds.has(word.id)}
                      onChange={() => toggleWord(word.id)}
                    />
                    <span className="chinese">{word.chinese}</span>
                    <span className="pinyin">{word.pinyin}</span>
                    <span className="english">{word.english}</span>
                  </label>
                ))
              )}
            </div>
            <div className="selection-stats">
              Selected: {selectedWordIds.size} words
            </div>
          </div>
        )}

        {/* Game Settings */}
        <div className="menu-section">
          <h3>Game Settings</h3>
          <div className="word-count-selector">
            <label>
              <span>Max Balloons: </span>
              <input
                type="number"
                min={3}
                max={15}
                value={maxBalloons}
                onChange={(e) => setMaxBalloons(parseInt(e.target.value) || 8)}
              />
            </label>
            <label>
              <span>Lives: </span>
              <input
                type="number"
                min={1}
                max={10}
                value={maxLives}
                onChange={(e) => setMaxLives(parseInt(e.target.value) || 3)}
              />
            </label>
          </div>
        </div>

        <div className="menu-buttons">
          <button className="btn btn-primary" onClick={handleStart}>
            Start Game
          </button>
        </div>
      </div>
    </div>
  );
}