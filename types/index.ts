// Core data types
export interface Board {
  id: string;
  title: string;
  lists: List[];
}

export interface List {
  id: string;
  title: string;
  cards: Card[];
  order: number;
}

export interface Card {
  id: string;
  title: string;
  listId: string;
  order: number;
  comments: Comment[];
}

export interface Comment {
  id: string;
  text: string;
  createdAt: string;
}

// Hook return types
export interface UseBoardDataReturn {
  board: Board | null;
  loading: boolean;
  updateBoardTitle: (title: string) => void;
  addList: () => void;
  updateList: (listId: string, updates: Partial<List>) => void;
  deleteList: (listId: string) => void;
  reorderLists: (sourceIndex: number, destinationIndex: number) => void;
  addCard: (listId: string) => void;
  updateCard: (cardId: string, updates: Partial<Card>) => void;
  reorderCards: (
    sourceListId: string,
    destListId: string,
    sourceIndex: number,
    destIndex: number
  ) => void;
  addComment: (cardId: string, text: string) => void;
}

export interface UseLocalStorageReturn<T> {
  value: T | null;
  setValue: (value: T) => void;
  loading: boolean;
  error: Error | null;
}

export interface UseDragAndDropReturn {
  sensors: any[];
  handleDragEnd: (event: any) => void;
  handleDragStart: (event: any) => void;
  handleDragOver: (event: any) => void;
}

// Component prop types
export interface EditableTextProps {
  value: string;
  onSave: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export interface CardProps {
  card: Card;
  onUpdate: (cardId: string, updates: Partial<Card>) => void;
  onOpenComments: (card: Card) => void;
}

export interface ListProps {
  list: List;
  onUpdate: (listId: string, updates: Partial<List>) => void;
  onDelete: (listId: string) => void;
  onAddCard: (listId: string) => void;
  onUpdateCard: (cardId: string, updates: Partial<Card>) => void;
  onOpenComments: (card: Card) => void;
}

export interface CommentsModalProps {
  card: Card | null;
  isOpen: boolean;
  onClose: () => void;
  onAddComment: (cardId: string, text: string) => void;
}
