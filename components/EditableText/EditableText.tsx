'use client';

import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { EditableTextProps } from '@/types';
import styles from './EditableText.module.scss';

export default function EditableText({
  value,
  onSave,
  placeholder = 'Enter text...',
  className = ''
}: EditableTextProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [currentValue, setCurrentValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  // Update current value when prop changes
  useEffect(() => {
    setCurrentValue(value);
  }, [value]);

  // Focus input when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    if (currentValue.trim() !== value) {
      onSave(currentValue.trim());
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setCurrentValue(value);
    setIsEditing(false);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  };

  const handleBlur = () => {
    handleSave();
  };

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type='text'
        value={currentValue}
        onChange={(e) => setCurrentValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        className={`${styles.input} ${className}`}
        placeholder={placeholder}
      />
    );
  }

  return (
    <div
      onClick={handleEdit}
      className={`${styles.text} ${className}`}
      role='button'
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleEdit();
        }
      }}
    >
      {value || placeholder}
    </div>
  );
}
