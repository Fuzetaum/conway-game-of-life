import { createContext, useContext } from 'react';
import { Board } from '@customTypes/api';

export type UseBoardHookType = {
    board: Board,
    boardId: string | null,
    loading: boolean,
    error: string | null,
    localChanges: boolean,
    createCleanBoard: () => void,
    createBoard: () => Promise<boolean>,
    toggleSquare: (coords: { x: number; y: number }) => void,
    saveBoard: () => Promise<boolean | undefined>,
    fetchNextState: () => Promise<void>,
    loadBoard: (id: string) => Promise<boolean>,
    skipGenerations: (generations: number) => Promise<void>,
    getFinalState: (maxGenerations: number) => Promise<void>,
};

export const useBoardContext = createContext<UseBoardHookType>({
  board: {
    id: '',
    generation: 1,
    dimensions: { width: 50, height: 50 },
    livingCells: []
  },
  boardId: null,
  loading: false,
  error: null,
  localChanges: false,
  createCleanBoard: () => {},
  createBoard: async () => true,
  toggleSquare: () => {},
  saveBoard: async () => true,
  fetchNextState: async () => {},
  loadBoard: async () => true,
  skipGenerations: async () => {},
  getFinalState: async () => {},
});

export const useBoard = () => useContext(useBoardContext);