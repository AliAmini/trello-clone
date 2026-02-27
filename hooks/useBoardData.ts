import { useState, useEffect, useCallback } from 'react';
import { Board, List, Card, UseBoardDataReturn } from '@/types';
import { DEFAULT_BOARD } from '@/services/storage.service';

const STORAGE_KEY = 'trello-clone-board';

/**
 * Custom hook for managing board data with localStorage persistence
 */
export function useBoardData(): UseBoardDataReturn {
  const [board, setBoard] = useState<Board | null>(null);
  const [loading, setLoading] = useState(true);

  // Load board from localStorage on mount
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setBoard(JSON.parse(stored));
      } else {
        setBoard(DEFAULT_BOARD);
      }
    } catch (error) {
      console.error('Failed to load board:', error);
      setBoard(DEFAULT_BOARD);
    } finally {
      setLoading(false);
    }
  }, []);

  // Save board to localStorage whenever it changes
  useEffect(() => {
    if (!loading && board && typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(board));
      } catch (error) {
        console.error('Failed to save board:', error);
      }
    }
  }, [board, loading]);

  // Update board title
  const updateBoardTitle = useCallback((title: string) => {
    setBoard((prev) => (prev ? { ...prev, title } : null));
  }, []);

  // Add a new list
  const addList = useCallback(() => {
    setBoard((prev) => {
      if (!prev) return null;

      const newList: List = {
        id: `list-${Date.now()}`,
        title: 'New List',
        order: prev.lists.length,
        cards: []
      };

      return {
        ...prev,
        lists: [...prev.lists, newList]
      };
    });
  }, []);

  // Update a list
  const updateList = useCallback((listId: string, updates: Partial<List>) => {
    setBoard((prev) => {
      if (!prev) return null;

      return {
        ...prev,
        lists: prev.lists.map((list) =>
          list.id === listId ? { ...list, ...updates } : list
        )
      };
    });
  }, []);

  // Delete a list
  const deleteList = useCallback((listId: string) => {
    setBoard((prev) => {
      if (!prev) return null;

      return {
        ...prev,
        lists: prev.lists.filter((list) => list.id !== listId)
      };
    });
  }, []);

  // Reorder lists
  const reorderLists = useCallback(
    (sourceIndex: number, destinationIndex: number) => {
      setBoard((prev) => {
        if (!prev) return null;

        const newLists = [...prev.lists];
        const [removed] = newLists.splice(sourceIndex, 1);
        newLists.splice(destinationIndex, 0, removed);

        // Update order property
        const reorderedLists = newLists.map((list, index) => ({
          ...list,
          order: index
        }));

        return {
          ...prev,
          lists: reorderedLists
        };
      });
    },
    []
  );

  // Add a card to a list
  const addCard = useCallback((listId: string) => {
    setBoard((prev) => {
      if (!prev) return null;

      return {
        ...prev,
        lists: prev.lists.map((list) => {
          if (list.id === listId) {
            const newCard: Card = {
              id: `card-${Date.now()}`,
              title: '',
              listId,
              order: list.cards.length,
              comments: []
            };

            return {
              ...list,
              cards: [...list.cards, newCard]
            };
          }
          return list;
        })
      };
    });
  }, []);

  // Update a card
  const updateCard = useCallback((cardId: string, updates: Partial<Card>) => {
    setBoard((prev) => {
      if (!prev) return null;

      return {
        ...prev,
        lists: prev.lists.map((list) => ({
          ...list,
          cards: list.cards.map((card) =>
            card.id === cardId ? { ...card, ...updates } : card
          )
        }))
      };
    });
  }, []);

  // Reorder cards (within same list or across lists)
  const reorderCards = useCallback(
    (
      sourceListId: string,
      destListId: string,
      sourceIndex: number,
      destIndex: number
    ) => {
      console.log('reorderCards called:', {
        sourceListId,
        destListId,
        sourceIndex,
        destIndex
      });

      setBoard((prev) => {
        if (!prev) return null;

        const newLists = [...prev.lists];
        const sourceList = newLists.find((l) => l.id === sourceListId);
        const destList = newLists.find((l) => l.id === destListId);

        if (!sourceList || !destList) {
          console.warn('Source or destination list not found');
          return prev;
        }

        console.log(
          'Before move - Source list cards:',
          sourceList.cards.length,
          'Dest list cards:',
          destList.cards.length
        );

        // Validate indices
        if (sourceIndex < 0 || sourceIndex >= sourceList.cards.length) {
          console.warn(
            'Invalid source index:',
            sourceIndex,
            'for list with',
            sourceList.cards.length,
            'cards'
          );
          return prev;
        }

        if (destIndex < 0 || destIndex > destList.cards.length) {
          console.warn(
            'Invalid destination index:',
            destIndex,
            'for list with',
            destList.cards.length,
            'cards'
          );
          return prev;
        }

        // Create deep copies to avoid mutation issues
        const sourceCards = [...sourceList.cards];
        const destCards =
          sourceListId === destListId ? sourceCards : [...destList.cards];

        // Remove card from source list
        const [movedCard] = sourceCards.splice(sourceIndex, 1);

        if (!movedCard) {
          console.warn('No card found at source index:', sourceIndex);
          return prev;
        }

        console.log('Moving card:', movedCard.id);

        // Update card's listId if moving to different list
        if (sourceListId !== destListId) {
          movedCard.listId = destListId;
        }

        // Add card to destination list
        destCards.splice(destIndex, 0, movedCard);

        // Update the lists with new card arrays
        const updatedLists = newLists.map((list) => {
          if (list.id === sourceListId) {
            return {
              ...list,
              cards: sourceCards.map((card, index) => ({
                ...card,
                order: index
              }))
            };
          } else if (list.id === destListId) {
            return {
              ...list,
              cards: destCards.map((card, index) => ({
                ...card,
                order: index
              }))
            };
          }
          return list;
        });

        console.log(
          'After move - Source list cards:',
          updatedLists.find((l) => l.id === sourceListId)?.cards.length,
          'Dest list cards:',
          updatedLists.find((l) => l.id === destListId)?.cards.length
        );

        return {
          ...prev,
          lists: updatedLists
        };
      });
    },
    []
  );

  // Add a comment to a card
  const addComment = useCallback((cardId: string, text: string) => {
    setBoard((prev) => {
      if (!prev) return null;

      return {
        ...prev,
        lists: prev.lists.map((list) => ({
          ...list,
          cards: list.cards.map((card) => {
            if (card.id === cardId) {
              const newComment = {
                id: `comment-${Date.now()}`,
                text,
                createdAt: new Date().toISOString()
              };

              return {
                ...card,
                comments: [...card.comments, newComment]
              };
            }
            return card;
          })
        }))
      };
    });
  }, []);

  return {
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
  };
}
