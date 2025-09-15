import { renderHook, act } from '@testing-library/react';
import { useBoard, BoardProvider } from '../BoardContext';
import { mockInitialBoard, mockBoardWithCells } from '../../__tests__/testUtils';
import { boardService } from '@services/boardService';

jest.mock('@services/boardService');

describe('BoardContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <BoardProvider>{children}</BoardProvider>
  );

  it('provides initial board state', () => {
    const { result } = renderHook(() => useBoard(), { wrapper });

    expect(result.current.board).toEqual(mockInitialBoard);
    expect(result.current.boardId).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.localChanges).toBe(false);
  });

  it('creates a clean board', () => {
    const { result } = renderHook(() => useBoard(), { wrapper });

    act(() => {
      result.current.createCleanBoard();
    });

    expect(result.current.board).toEqual(mockInitialBoard);
    expect(result.current.boardId).toBeNull();
    expect(result.current.localChanges).toBe(false);
  });

  it('creates a board on the server', async () => {
    (boardService.create as jest.Mock).mockResolvedValueOnce(mockBoardWithCells);
    const { result } = renderHook(() => useBoard(), { wrapper });

    await act(async () => {
      await result.current.createBoard();
    });

    expect(boardService.create).toHaveBeenCalledWith({
      dimensions: mockInitialBoard.dimensions,
      livingCells: mockInitialBoard.livingCells
    });
    expect(result.current.board).toEqual(mockBoardWithCells);
    expect(result.current.boardId).toBe('test-board-id');
    expect(result.current.localChanges).toBe(false);
  });

  it('handles create board error', async () => {
    const error = new Error('Failed to create board');
    (boardService.create as jest.Mock).mockRejectedValueOnce(error);
    const { result } = renderHook(() => useBoard(), { wrapper });

    await act(async () => {
      await result.current.createBoard();
    });

    expect(result.current.error).toBe('Failed to create board');
    expect(result.current.boardId).toBeNull();
  });

  it('toggles cell state', () => {
    const { result } = renderHook(() => useBoard(), { wrapper });

    act(() => {
      result.current.toggleSquare({ x: 0, y: 0 });
    });

    expect(result.current.board.livingCells).toContainEqual({ x: 0, y: 0 });
    expect(result.current.localChanges).toBe(true);

    act(() => {
      result.current.toggleSquare({ x: 0, y: 0 });
    });

    expect(result.current.board.livingCells).not.toContainEqual({ x: 0, y: 0 });
    expect(result.current.localChanges).toBe(true);
  });

  it('saves board changes', async () => {
    (boardService.update as jest.Mock).mockResolvedValueOnce(mockBoardWithCells);
    (boardService.getById as jest.Mock).mockResolvedValueOnce(mockBoardWithCells);
    const { result } = renderHook(() => useBoard(), { wrapper });

    // First load a board
    await act(async () => {
      await result.current.loadBoard('test-board-id');
    });

    await act(async () => {
      await result.current.saveBoard();
    });

    expect(boardService.update).toHaveBeenCalledWith('test-board-id', {
      livingCells: mockBoardWithCells.livingCells
    });
    expect(result.current.localChanges).toBe(false);
  });

  it('loads an existing board', async () => {
    (boardService.getById as jest.Mock).mockResolvedValueOnce(mockBoardWithCells);
    const { result } = renderHook(() => useBoard(), { wrapper });

    await act(async () => {
      await result.current.loadBoard('test-board-id');
    });

    expect(boardService.getById).toHaveBeenCalledWith('test-board-id');
    expect(result.current.board).toEqual(mockBoardWithCells);
    expect(result.current.boardId).toBe('test-board-id');
    expect(result.current.localChanges).toBe(false);
  });

  it('fetches next board state', async () => {
    const nextState = { ...mockBoardWithCells, generation: 2 };
    (boardService.getNextState as jest.Mock).mockResolvedValueOnce(nextState);
    const { result } = renderHook(() => useBoard(), { wrapper });
    
    // First load a board
    await act(async () => {
      (boardService.getById as jest.Mock).mockResolvedValueOnce(mockBoardWithCells);
      await result.current.loadBoard('test-board-id');
    });

    await act(async () => {
      await result.current.fetchNextState();
    });

    expect(boardService.getNextState).toHaveBeenCalledWith('test-board-id');
    expect(result.current.board).toEqual(nextState);
  });

  it('skips multiple generations', async () => {
    const futureState = { ...mockBoardWithCells, generation: 5 };
    (boardService.getStateAfterGenerations as jest.Mock).mockResolvedValueOnce(futureState);
    const { result } = renderHook(() => useBoard(), { wrapper });

    // First load a board
    await act(async () => {
      (boardService.getById as jest.Mock).mockResolvedValueOnce(mockBoardWithCells);
      await result.current.loadBoard('test-board-id');
    });

    await act(async () => {
      await result.current.skipGenerations(4);
    });

    expect(boardService.getStateAfterGenerations).toHaveBeenCalledWith('test-board-id', { maxGenerations: 4 });
    expect(result.current.board).toEqual(futureState);
  });
});