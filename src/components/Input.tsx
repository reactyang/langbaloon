import { useState, KeyboardEvent } from 'react';
import './Input.css';

interface InputProps {
  onSubmit: (value: string) => void;
  disabled?: boolean;
}

export function GameInput({ onSubmit, disabled = false }: InputProps) {
  const [value, setValue] = useState('');
  const [shake, setShake] = useState(false);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && value.trim()) {
      onSubmit(value);
      setValue('');
    }
  };

  // Shake setter available for external use in future
  void setShake;

  return (
    <div className="input-area">
      <input
        type="text"
        id="pinyinInput"
        className={shake ? 'shake' : ''}
        placeholder="输入拼音..."
        autoComplete="off"
        autoFocus
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
      />
      <div className="instructions">输入拼音后按 Enter 射击气球</div>
    </div>
  );
}