'use client';

import { useState, useMemo } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent
} from '@dnd-kit/core';
import {
  SortableContext,
  horizontalListSortingStrategy,
  sortableKeyboardCoordinates
} from '@dnd-kit/sortable';
import { useBoardData } from '@/hooks/useBoardData';
import { Card } from '@/types';
import EditableText from '@/components/EditableText/EditableText';
import SortableList from '@/components/List/SortableList';
import CommentsModal from '@/components/CommentsModal/CommentsModal';
import styles from './Board.module.scss';

export default function Board() {
  const {
    board,
    loading,
    updateBoardTitle,
    addList,
    updateList,
    deleteList,
    reorderLists,
    addCard,
    updateCard,
    reorderCards,
    addComment
  } = useBoardData();

  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isDragInProgress, setIsDragInProgress] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3
      }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );

  // Get the current card data from board state (for real-time updates)
  const currentSelectedCard = useMemo(() => {
    if (!selectedCard || !board) return null;

    for (const list of board.lists) {
      const card = list.cards.find((c) => c.id === selectedCard.id);
      if (card) return card;
    }
    return null;
  }, [selectedCard, board]);

  const handleOpenComments = (card: Card) => {
    setSelectedCard(card);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCard(null);
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    setIsDragInProgress(true);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    // Prevent duplicate operations
    if (!isDragInProgress) {
      console.log('Drag operation already in progress, ignoring');
      return;
    }

    // Reset drag state after a short delay to prevent rapid successive operations
    setTimeout(() => {
      setIsDragInProgress(false);
    }, 100);

    if (!over || active.id === over.id) return;

    console.log('Drag end:', { activeId: active.id, overId: over.id });

    // Check if dragging a list
    const activeList = board?.lists.find((list) => list.id === active.id);
    if (activeList) {
      const overList = board?.lists.find((list) => list.id === over.id);
      if (overList) {
        const oldIndex = board!.lists.indexOf(activeList);
        const newIndex = board!.lists.indexOf(overList);
        console.log('Moving list from', oldIndex, 'to', newIndex);
        reorderLists(oldIndex, newIndex);
        return;
      }
    }

    // Check if dragging a card
    const activeCard = board?.lists
      .flatMap((list) => list.cards)
      .find((card) => card.id === active.id);

    if (activeCard) {
      const sourceList = board?.lists.find(
        (list) => list.id === activeCard.listId
      );

      if (!sourceList) {
        console.warn('Source list not found for card:', activeCard.id);
        return;
      }

      console.log('Moving card:', activeCard.id, 'from list:', sourceList.id);

      // Check if dropping over another card
      const overCard = board?.lists
        .flatMap((list) => list.cards)
        .find((card) => card.id === over.id);

      if (overCard) {
        const destList = board?.lists.find(
          (list) => list.id === overCard.listId
        );

        if (destList) {
          const sourceIndex = sourceList.cards.findIndex(
            (card) => card.id === activeCard.id
          );
          const destIndex = destList.cards.findIndex(
            (card) => card.id === overCard.id
          );

          console.log(
            'Dropping over card:',
            overCard.id,
            'at index:',
            destIndex
          );

          if (sourceIndex !== -1 && destIndex !== -1) {
            reorderCards(sourceList.id, destList.id, sourceIndex, destIndex);
          } else {
            console.warn('Invalid card indices:', { sourceIndex, destIndex });
          }
        }
        return;
      }

      // Check if dropping over a list (empty area)
      const overList = board?.lists.find((list) => list.id === over.id);
      if (overList) {
        const sourceIndex = sourceList.cards.findIndex(
          (card) => card.id === activeCard.id
        );
        const destIndex = overList.cards.length; // Add to end of list

        console.log(
          'Dropping over list:',
          overList.id,
          'at end position:',
          destIndex
        );

        if (sourceIndex !== -1) {
          reorderCards(sourceList.id, overList.id, sourceIndex, destIndex);
        } else {
          console.warn('Invalid source index:', sourceIndex);
        }
      }
    }
  };

  if (loading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  if (!board) {
    return <div className={styles.error}>Failed to load board</div>;
  }

  const listIds = board.lists.map((list) => list.id);

  return (
    <div className={styles.board}>
      <div className={styles.board__header}>
        <EditableText
          value={board.title}
          onSave={updateBoardTitle}
          placeholder='Board Title'
          className={styles.board__title}
        />
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className={styles.board__lists}>
          <SortableContext
            items={listIds}
            strategy={horizontalListSortingStrategy}
          >
            {board.lists.map((list) => (
              <SortableList
                key={list.id}
                list={list}
                onUpdate={updateList}
                onDelete={deleteList}
                onAddCard={addCard}
                onUpdateCard={updateCard}
                onOpenComments={handleOpenComments}
              />
            ))}
          </SortableContext>

          <button className={styles.board__addList} onClick={addList}>
            + Add List
          </button>
        </div>

        <DragOverlay>
          {activeId ? (
            <div
              style={{
                opacity: 0.8,
                transform: 'rotate(5deg)',
                pointerEvents: 'none'
              }}
            >
              {/* Render a preview of what's being dragged */}
              <div
                style={{
                  background: '#fff',
                  padding: '8px',
                  borderRadius: '3px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }}
              >
                Dragging...
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <CommentsModal
        card={currentSelectedCard}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onAddComment={addComment}
      />
    </div>
  );
}
