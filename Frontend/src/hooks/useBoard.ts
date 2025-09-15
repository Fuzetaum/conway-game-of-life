import { useState, useCallback } from 'react';
import { Board } from '@customTypes/api';
import { boardService } from '@services/boardService';

export function useBoard() {
  const [boardId, setBoardId] = useState<string | null>(null);
  const [board, setBoard] = useState<Board | null>(() => ({
    id: '',
    generation: 1,
    dimensions: { width: 50, height: 50 },
    livingCells: []
  }));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [localChanges, setLocalChanges] = useState(false);

  const createNewBoard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const createdBoard = await boardService.create({
        dimensions: { width: 50, height: 50 },
        livingCells: [],
      });

      setBoard(createdBoard);
      setLocalChanges(false);
      setBoardId(createdBoard.id);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create board');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchNextState = useCallback(async () => {
    if (!boardId) return;
    
    try {
      setLoading(true);
      setError(null);
      const newState = await boardService.getNextState(boardId);
      setBoard(newState);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get next state');
    } finally {
      setLoading(false);
    }
  }, [boardId]);

  const skipGenerations = useCallback(async (generations: number) => {
    if (!boardId) return;
    
    try {
      setLoading(true);
      setError(null);
      const newState = await boardService.getStateAfterGenerations(boardId, { maxGenerations: generations });
      setBoard(newState);
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
      const finalState = await boardService.getFinalState(boardId, { maxGenerations });
      setBoard(finalState);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get final state');
    } finally {
      setLoading(false);
    }
  }, [boardId]);

  const toggleSquare = useCallback(({ x, y }: { x: number; y: number }) => {
    setBoard(currentBoard => {
      if (!currentBoard) return currentBoard;

      const isAlive = currentBoard.livingCells.some(cell => cell.x === x && cell.y === y);
      const newLivingCells = isAlive
        ? currentBoard.livingCells.filter(cell => cell.x !== x || cell.y !== y)
        : [...currentBoard.livingCells, { x, y }];

      setLocalChanges(true);
      return {
        ...currentBoard,
        livingCells: newLivingCells
      };
    });
  }, []);

  const saveBoard = useCallback(async () => {
    if (!board) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const updatedBoard = boardId 
        ? await boardService.update(boardId, { livingCells: board.livingCells })
        : await boardService.create({
            dimensions: board.dimensions,
            livingCells: board.livingCells
          });

      setBoard(updatedBoard);
      setLocalChanges(false);
      setBoardId(updatedBoard.id);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save board');
      return false;
    } finally {
      setLoading(false);
    }
  }, [board, boardId]);

  return {
    board,
    boardId,
    loading,
    error,
    localChanges,
    createNewBoard,
    toggleSquare,
    saveBoard,
    fetchNextState,
    skipGenerations,
    getFinalState
  };
}