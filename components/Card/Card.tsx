'use client';

import { CardProps } from '@/types';
import EditableText from '@/components/EditableText/EditableText';
import styles from './Card.module.scss';

export default function Card({ card, onUpdate, onOpenComments }: CardProps) {
  const handleTitleChange = (newTitle: string) => {
    onUpdate(card.id, { title: newTitle });
  };

  const handleCommentsClick = () => {
    onOpenComments(card);
  };

  const commentCount = card.comments.length;

  return (
    <div className={styles.card}>
      <EditableText
        value={card.title}
        onSave={handleTitleChange}
        placeholder='Enter card title...'
        className={styles.card__title}
      />

      <button
        className={`${styles.card__comments} ${commentCount === 0 ? styles['card__comments--empty'] : ''}`}
        onClick={handleCommentsClick}
        aria-label={`View ${commentCount} comment${commentCount !== 1 ? 's' : ''}`}
      >
        <svg
          width='16'
          height='16'
          viewBox='0 0 16 16'
          fill='none'
          xmlns='http://www.w3.org/2000/svg'
        >
          <path
            d='M2 2h12v9H4.5L2 13.5V2z'
            stroke='currentColor'
            strokeWidth='1.5'
            fill='none'
          />
        </svg>
        <span>{commentCount}</span>
      </button>
    </div>
  );
}
