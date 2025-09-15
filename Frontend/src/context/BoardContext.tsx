import React, { createContext, useContext, useState, useCallback } from 'react';
import { Board } from '@customTypes/api';
import { boardService } from '@services/boardService';

export type BoardContextType = {
  board: Board;
  boardId: string | null;
  loading: boolean;
  error: string | null;
  localChanges: boolean;
  createCleanBoard: () => void;
  createBoard: () => Promise<boolean>;
  toggleSquare: (coords: { x: number; y: number }) => void;
  saveBoard: () => Promise<boolean>;
  fetchNextState: () => Promise<void>;
  loadBoard: (id: string) => Promise<boolean>;
  skipGenerations: (generations: number) => Promise<void>;
  getFinalState: (maxGenerations: number) => Promise<void>;
};

const initialBoard: Board = {
  id: '',
  generation: 1,
  dimensions: { width: 50, height: 50 },
  livingCells: []
};

export const BoardContext = createContext<BoardContextType | null>(null);

export const BoardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [board, setBoard] = useState<Board>(initialBoard);
  const [boardId, setBoardId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [localChanges, setLocalChanges] = useState(false);

  const createCleanBoard = useCallback(() => {
    setBoard(initialBoard);
    setBoardId(null);
    setLocalChanges(false);
    setError(null);
  }, []);

  const createBoard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const newBoard = await boardService.create({
        LivingCells: board.livingCells
      });
      setBoard(newBoard);
      setBoardId(newBoard.id);
      setLocalChanges(false);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create board');
      return false;
    } finally {
      setLoading(false);
    }
  }, [board.dimensions, board.livingCells]);

  const toggleSquare = useCallback(({ x, y }: { x: number; y: number }) => {
    setBoard(currentBoard => {
      const newLivingCells = [...currentBoard.livingCells];
      const existingIndex = newLivingCells.findIndex(cell => cell.Column === x && cell.Row === y);
      
      if (existingIndex >= 0) {
        newLivingCells.splice(existingIndex, 1);
      } else {
        newLivingCells.push({ Column: x, Row: y });
      }

      return { ...currentBoard, livingCells: newLivingCells };
    });
    setLocalChanges(true);
  }, []);

  const saveBoard = useCallback(async () => {
    if (!boardId) return createBoard();

    try {
      setLoading(true);
      setError(null);
      const updatedBoard = await boardService.update(boardId, {
        LivingCells: board.livingCells
      });
      setBoard(updatedBoard);
      setLocalChanges(false);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save board');
      return false;
    } finally {
      setLoading(false);
    }
  }, [boardId, board.livingCells, createBoard]);

  const fetchNextState = useCallback(async () => {
    if (!boardId) return;

    try {
      setLoading(true);
      setError(null);
      const nextBoard = await boardService.getNextState(boardId);
      setBoard(nextBoard);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch next state');
    } finally {
      setLoading(false);
    }
  }, [boardId]);

  const loadBoard = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const loadedBoard = await boardService.getById(id);
      setBoard(loadedBoard);
      setBoardId(loadedBoard.id);
      setLocalChanges(false);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load board');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const skipGenerations = useCallback(async (generations: number) => {
    if (!boardId) return;

    try {
      setLoading(true);
      setError(null);
      const skippedBoard = await boardService.getStateAfterGenerations(boardId, { maxGenerations: generations });
      setBoard(skippedBoard);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to skip generations');
    } finally {
      setLoading(false);
    }
  }, [boardId]);

  const getFinalState = useCallback(async (maxGenerations: number) => {
    if (!boardId) return;

    try {
      setLoading(true);
      setError(null);
      const finalBoard = await boardService.getFinalState(boardId, { maxGenerations });
      setBoard(finalBoard);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get final state');
    } finally {
      setLoading(false);
    }
  }, [boardId]);

  return (
    <BoardContext.Provider
      value={{
        board,
        boardId,
        loading,
        error,
        localChanges,
        createCleanBoard,
        createBoard,
        toggleSquare,
        saveBoard,
        fetchNextState,
        loadBoard,
        skipGenerations,
        getFinalState,
      }}
    >
      {children}
    </BoardContext.Provider>
  );
};

export const useBoard = () => {
  const context = useContext(BoardContext);
  if (context === null) {
    throw new Error('useBoard must be used within a BoardProvider');
  }
  return context;
};