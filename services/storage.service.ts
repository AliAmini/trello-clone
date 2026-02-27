import { Board } from '@/types';

const STORAGE_KEY = 'trello-clone-board';

// Default board structure
export const DEFAULT_BOARD: Board = {
  id: 'board-1',
  title: 'Demo Board',
  lists: [
    {
      id: 'list-1',
      title: 'To Do',
      order: 0,
      cards: [
        {
          id: 'card-1',
          title: 'Plan project structure',
          listId: 'list-1',
          order: 0,
          comments: [
            {
              id: 'comment-1',
              text: 'Need to define the main components and their relationships',
              createdAt: new Date(Date.now() - 86400000).toISOString() // 1 day ago
            }
          ]
        },
        {
          id: 'card-2',
          title: 'Set up development environment',
          listId: 'list-1',
          order: 1,
          comments: []
        }
      ]
    },
    {
      id: 'list-2',
      title: 'In Progress',
      order: 1,
      cards: [
        {
          id: 'card-3',
          title: 'Implement drag and drop',
          listId: 'list-2',
          order: 0,
          comments: [
            {
              id: 'comment-2',
              text: 'Using @dnd-kit library for better performance',
              createdAt: new Date(Date.now() - 3600000).toISOString() // 1 hour ago
            }
          ]
        }
      ]
    },
    {
      id: 'list-3',
      title: 'Done',
      order: 2,
      cards: [
        {
          id: 'card-4',
          title: 'Create basic layout',
          listId: 'list-3',
          order: 0,
          comments: []
        }
      ]
    }
  ]
};

/**
 * Save board data to localStorage
 */
export function saveBoard(board: Board): void {
  try {
    const serialized = JSON.stringify(board);
    localStorage.setItem(STORAGE_KEY, serialized);
  } catch (error) {
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      console.error('localStorage quota exceeded');
      throw new Error('Storage quota exceeded. Unable to save board data.');
    } else if (
      error instanceof DOMException &&
      error.name === 'SecurityError'
    ) {
      console.error('localStorage access denied');
      throw new Error('Storage access denied. Unable to save board data.');
    } else {
      console.error('Failed to save to localStorage:', error);
      throw new Error('Failed to save board data.');
    }
  }
}

/**
 * Load board data from localStorage
 */
export function loadBoard(): Board {
  try {
    const serialized = localStorage.getItem(STORAGE_KEY);

    if (!serialized) {
      // Initialize with default board if nothing exists
      return DEFAULT_BOARD;
    }

    const board = JSON.parse(serialized) as Board;

    // Validate the structure
    if (!board.id || !board.title || !Array.isArray(board.lists)) {
      console.warn('Invalid board structure in localStorage, using default');
      return DEFAULT_BOARD;
    }

    return board;
  } catch (error) {
    console.error('Failed to load from localStorage:', error);
    // Return default board on error
    return DEFAULT_BOARD;
  }
}

/**
 * Clear board data from localStorage
 */
export function clearBoard(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear localStorage:', error);
  }
}

/**
 * Check if localStorage is available
 */
export function isLocalStorageAvailable(): boolean {
  try {
    const test = '__localStorage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}
