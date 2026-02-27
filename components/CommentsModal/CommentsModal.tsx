'use client';

import { useState, useEffect, KeyboardEvent, FormEvent } from 'react';
import { CommentsModalProps } from '@/types';
import styles from './CommentsModal.module.scss';

export default function CommentsModal({
  card,
  isOpen,
  onClose,
  onAddComment
}: CommentsModalProps) {
  const [commentText, setCommentText] = useState('');

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (commentText.trim() && card) {
      onAddComment(card.id, commentText.trim());
      setCommentText('');
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  if (!isOpen || !card) return null;

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.modal}>
        <div className={styles.modal__header}>
          <h2>{card.title || 'Card Comments'}</h2>
          <button
            className={styles.modal__close}
            onClick={onClose}
            aria-label='Close modal'
          >
            ×
          </button>
        </div>

        <div className={styles.modal__content}>
          <h3>Comments</h3>

          {card.comments.length === 0 ? (
            <p className={styles.modal__empty}>No comments yet</p>
          ) : (
            <div className={styles.modal__comments}>
              {card.comments.map((comment) => (
                <div key={comment.id} className={styles.comment}>
                  <div className={styles.comment__text}>{comment.text}</div>
                  <div className={styles.comment__date}>
                    {formatDate(comment.createdAt)}
                  </div>
                </div>
              ))}
            </div>
          )}

          <form className={styles.modal__form} onSubmit={handleSubmit}>
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder='Write a comment...'
              className={styles.modal__textarea}
              rows={3}
            />
            <button
              type='submit'
              className={styles.modal__submit}
              disabled={!commentText.trim()}
            >
              Add Comment
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
