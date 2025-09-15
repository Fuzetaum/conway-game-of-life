import React, { ReactNode, createContext } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BoardProvider, BoardContext, BoardContextType } from '../context/BoardContext';
import { UseBoardHookType } from '../hooks/useBoard';

export const TestWrapper: React.FC<{ children: ReactNode }> = ({ children }) => (
  <BoardProvider>{children}</BoardProvider>
);

export const mockBoardService = {
  create: jest.fn(),
  update: jest.fn(),
  getById: jest.fn(),
  getNextState: jest.fn(),
  getStateAfterGenerations: jest.fn(),
  getFinalState: jest.fn(),
};

export const mockInitialBoard = {
  id: '',
  generation: 1,
  dimensions: { width: 50, height: 50 },
  livingCells: []
};

export const mockBoardWithCells = {
  id: 'test-board-id',
  generation: 1,
  dimensions: { width: 50, height: 50 },
  livingCells: [
    { Row: 0, Column: 0 },
    { Row: 0, Column: 1 },
    { Row: 1, Column: 0 }
  ]
};

export const defaultBoardContext = {
  board: mockInitialBoard,
  boardId: null as string | null,
  localChanges: false,
  error: null,
  loading: false,
  createCleanBoard: jest.fn(),
  createBoard: jest.fn(),
  toggleSquare: jest.fn(),
  saveBoard: jest.fn(),
  loadBoard: jest.fn(),
  fetchNextState: jest.fn(),
  skipGenerations: jest.fn(),
  getFinalState: jest.fn(),
  createRandomBoard: jest.fn()
};

export const renderWithBoardProvider = async (
  ui: React.ReactElement,
  contextValues: Partial<UseBoardHookType> = {}
) => {
  // Create mocks for all functions if not provided
  const mockFunctions = {
    createCleanBoard: jest.fn().mockImplementation(() => {
      if (contextValues.createCleanBoard) return contextValues.createCleanBoard();
      return Promise.resolve();
    }),
    createBoard: jest.fn().mockImplementation(() => {
      if (contextValues.createBoard) return contextValues.createBoard();
      return Promise.resolve(true);
    }),
    toggleSquare: jest.fn().mockImplementation((coords) => {
      if (contextValues.toggleSquare) return contextValues.toggleSquare(coords);
      return Promise.resolve();
    }),
    saveBoard: jest.fn().mockImplementation(() => {
      if (contextValues.saveBoard) return contextValues.saveBoard();
      return Promise.resolve(true);
    }),
    loadBoard: jest.fn().mockImplementation((id) => {
      if (contextValues.loadBoard) return contextValues.loadBoard(id);
      return Promise.resolve(true);
    }),
    fetchNextState: jest.fn().mockImplementation(() => {
      if (contextValues.fetchNextState) return contextValues.fetchNextState();
      return Promise.resolve();
    }),
    skipGenerations: jest.fn().mockImplementation((generations) => {
      if (contextValues.skipGenerations) return contextValues.skipGenerations(generations);
      return Promise.resolve();
    }),
    getFinalState: jest.fn().mockImplementation((maxGenerations) => {
      if (contextValues.getFinalState) return contextValues.getFinalState(maxGenerations);
      return Promise.resolve();
    })
  };

  // Construct merged context value
  const mockContextValue = {
    ...defaultBoardContext,
    ...contextValues,
    ...mockFunctions
  };

  // Create a mock context provider
  const MockBoardContext = createContext<BoardContextType | null>(null);
  MockBoardContext.Provider = BoardContext.Provider;
  MockBoardContext.Consumer = BoardContext.Consumer;
  
  const TestWrapperWithContext = ({ children }: { children: ReactNode }) => (
    <MockBoardContext.Provider value={mockContextValue}>
      {children}
    </MockBoardContext.Provider>
  );

  const result = render(ui, { wrapper: TestWrapperWithContext });

  // Wait for any state updates to settle
  await new Promise(resolve => setTimeout(resolve, 0));

  return { ...result, ...mockFunctions };
};

// Utility to simulate canvas context
export const mockCanvasContext = () => {
  const clearRect = jest.fn();
  const strokeRect = jest.fn();
  const fillRect = jest.fn();

  // @ts-ignore
  HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
    clearRect,
    strokeRect,
    fillRect,
    strokeStyle: '',
    fillStyle: '',
    lineWidth: 0,
  }));

  return { clearRect, strokeRect, fillRect };
};

export * from '@testing-library/react';