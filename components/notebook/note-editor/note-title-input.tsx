'use client';

import { useState, useEffect, useRef } from 'react';

interface NoteTitleInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function NoteTitleInput({
  value,
  onChange,
  placeholder = 'Untitled',
}: NoteTitleInputProps) {
  const [localValue, setLocalValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync local value with prop changes
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleBlur = () => {
    const trimmed = localValue.trim();
    if (trimmed !== value) {
      onChange(trimmed || 'New Note');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      inputRef.current?.blur();
    }
  };

  return (
    <input
      ref={inputRef}
      type="text"
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      placeholder={placeholder}
      className="text-lg font-semibold bg-transparent border-none focus:outline-none focus:ring-0 w-full placeholder:text-muted-foreground"
    />
  );
}
