'use client';

import { useState } from 'react';
import {
  SortableContext,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { ListProps } from '@/types';
import EditableText from '@/components/EditableText/EditableText';
import SortableCard from '@/components/Card/SortableCard';
import styles from './List.module.scss';

export default function List({
  list,
  onUpdate,
  onDelete,
  onAddCard,
  onUpdateCard,
  onOpenComments
}: ListProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const { setNodeRef } = useDroppable({
    id: list.id
  });

  const handleTitleChange = (newTitle: string) => {
    onUpdate(list.id, { title: newTitle });
  };

  const handleAddCard = () => {
    onAddCard(list.id);
  };

  const handleDeleteList = () => {
    onDelete(list.id);
    setMenuOpen(false);
  };

  const handleDeleteAllCards = () => {
    onUpdate(list.id, { cards: [] });
    setMenuOpen(false);
  };

  const cardIds = list.cards.map((card) => card.id);

  return (
    <div ref={setNodeRef} className={styles.list}>
      <div className={styles.list__header}>
        <EditableText
          value={list.title}
          onSave={handleTitleChange}
          placeholder='Enter list title...'
          className={styles.list__title}
        />

        <div className={styles.list__menu}>
          <button
            className={styles.list__menuButton}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label='List menu'
          >
            ⋯
          </button>

          {menuOpen && (
            <div className={styles.list__dropdown}>
              <button onClick={handleDeleteAllCards}>Delete All Cards</button>
              <button
                onClick={handleDeleteList}
                className={styles.list__deleteButton}
              >
                Delete List
              </button>
            </div>
          )}
        </div>
      </div>

      <div className={styles.list__cards}>
        <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
          {list.cards.map((card) => (
            <SortableCard
              key={card.id}
              card={card}
              onUpdate={onUpdateCard}
              onOpenComments={onOpenComments}
            />
          ))}
        </SortableContext>
      </div>

      <button className={styles.list__addCard} onClick={handleAddCard}>
        + Add Card
      </button>
    </div>
  );
}
