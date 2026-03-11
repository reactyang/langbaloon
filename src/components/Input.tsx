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
        placeholder="Enter pinyin..."
        autoComplete="off"
        autoFocus
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
      />
      <div className="instructions">Type pinyin and press Enter to pop balloon</div>
    </div>
  );
}