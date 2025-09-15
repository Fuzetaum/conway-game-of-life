import { renderHook, act } from '@testing-library/react';
import { boardService } from '@services/boardService';
import { useBoard } from '../useBoard';

// Mock the boardService
jest.mock('@services/boardService');

describe('useBoard', () => {
  const mockBoardService = boardService as jest.Mocked<typeof boardService>;
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('initializes with default empty board', () => {
    const { result } = renderHook(() => useBoard());
    
    expect(result.current.board).toEqual({
      id: '',
      generation: 1,
      dimensions: { width: 50, height: 50 },
      livingCells: []
    });
    expect(result.current.boardId).toBeNull();
    expect(result.current.loading).toBeFalsy();
    expect(result.current.error).toBeNull();
    expect(result.current.localChanges).toBeFalsy();
  });

  it('creates a new board successfully', async () => {
    const mockBoard = {
      id: 'test-id',
      generation: 1,
      dimensions: { width: 50, height: 50 },
      livingCells: []
    };

    mockBoardService.create.mockResolvedValueOnce(mockBoard);

    const { result } = renderHook(() => useBoard());

    await act(async () => {
      await result.current.createNewBoard();
    });

    expect(result.current.board).toEqual(mockBoard);
    expect(result.current.boardId).toBe('test-id');
    expect(result.current.localChanges).toBeFalsy();
  });

  it('toggles square state locally', () => {
    const { result } = renderHook(() => useBoard());

    act(() => {
      result.current.toggleSquare({ x: 1, y: 1 });
    });

    expect(result.current.board?.livingCells).toContainEqual({ x: 1, y: 1 });
    expect(result.current.localChanges).toBeTruthy();

    act(() => {
      result.current.toggleSquare({ x: 1, y: 1 });
    });

    expect(result.current.board?.livingCells).not.toContainEqual({ x: 1, y: 1 });
  });

  describe('save board changes', () => {
    it('creates new board when no boardId exists', async () => {
      const mockBoard = {
        id: 'test-id',
        generation: 1,
        dimensions: { width: 50, height: 50 },
        livingCells: [{ x: 1, y: 1 }]
      };

      mockBoardService.create.mockResolvedValueOnce(mockBoard);

      const { result } = renderHook(() => useBoard());

      // Toggle a square first
      act(() => {
        result.current.toggleSquare({ x: 1, y: 1 });
      });

      expect(result.current.localChanges).toBeTruthy();

      // Save changes
      await act(async () => {
        await result.current.saveBoard();
      });

      expect(mockBoardService.create).toHaveBeenCalled();
      expect(mockBoardService.update).not.toHaveBeenCalled();
      expect(result.current.board).toEqual(mockBoard);
      expect(result.current.localChanges).toBeFalsy();
    });

    it('updates existing board when boardId exists', async () => {
      const initialBoard = {
        id: 'test-id',
        generation: 1,
        dimensions: { width: 50, height: 50 },
        livingCells: []
      };

      const updatedBoard = {
        id: 'test-id',
        generation: 1,
        dimensions: { width: 50, height: 50 },
        livingCells: [{ x: 1, y: 1 }]
      };

      mockBoardService.create.mockResolvedValueOnce(initialBoard);
      mockBoardService.update.mockResolvedValueOnce(updatedBoard);

      const { result } = renderHook(() => useBoard());

      // First create a board
      await act(async () => {
        await result.current.createNewBoard();
      });

      // Then toggle a square
      act(() => {
        result.current.toggleSquare({ x: 1, y: 1 });
      });

      expect(result.current.localChanges).toBeTruthy();

      // Save changes
      await act(async () => {
        await result.current.saveBoard();
      });

      expect(mockBoardService.create).toHaveBeenCalledTimes(1);
      expect(mockBoardService.update).toHaveBeenCalledTimes(1);
      expect(mockBoardService.update).toHaveBeenCalledWith('test-id', {
        livingCells: [{ x: 1, y: 1 }]
      });
      expect(result.current.board).toEqual(updatedBoard);
      expect(result.current.localChanges).toBeFalsy();
    });
  });

  it('fetches next state successfully', async () => {
    const initialBoard = {
      id: 'test-id',
      generation: 1,
      dimensions: { width: 50, height: 50 },
      livingCells: []
    };

    const mockNextBoard = {
      id: 'test-id',
      generation: 2,
      dimensions: { width: 50, height: 50 },
      livingCells: [{ x: 1, y: 1 }]
    };

    mockBoardService.create.mockResolvedValueOnce(initialBoard);
    mockBoardService.getNextState.mockResolvedValueOnce(mockNextBoard);

    const { result } = renderHook(() => useBoard());

    // First create a board to set the boardId
    await act(async () => {
      await result.current.createNewBoard();
    });

    await act(async () => {
      await result.current.fetchNextState();
    });

    expect(result.current.board).toEqual(mockNextBoard);
  });

  it('handles errors appropriately', async () => {
    const error = new Error('Test error');
    mockBoardService.create.mockRejectedValueOnce(error);

    const { result } = renderHook(() => useBoard());

    await act(async () => {
      await result.current.createNewBoard();
    });

    expect(result.current.error).toBe('Test error');
  });

  it('skips multiple generations successfully', async () => {
    const initialBoard = {
      id: 'test-id',
      generation: 1,
      dimensions: { width: 50, height: 50 },
      livingCells: [{ x: 1, y: 1 }]
    };

    const mockSkippedBoard = {
      id: 'test-id',
      generation: 5,
      dimensions: { width: 50, height: 50 },
      livingCells: [{ x: 2, y: 2 }]
    };

    mockBoardService.create.mockResolvedValueOnce(initialBoard);
    mockBoardService.getStateAfterGenerations.mockResolvedValueOnce(mockSkippedBoard);

    const { result } = renderHook(() => useBoard());
    
    // First create a board to set the boardId
    await act(async () => {
      await result.current.createNewBoard();
    });

    await act(async () => {
      await result.current.skipGenerations(4);
    });

    expect(mockBoardService.getStateAfterGenerations).toHaveBeenCalledWith('test-id', { maxGenerations: 4 });
    expect(result.current.board).toEqual(mockSkippedBoard);
  });
});