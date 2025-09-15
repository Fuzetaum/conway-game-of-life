import { screen, fireEvent } from '@testing-library/react';
import { renderWithBoardProvider, mockBoardWithCells } from '../../__tests__/testUtils';
import { act } from 'react';
import Controls from '../Controls';

describe('Controls', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all control buttons', async () => {
    await renderWithBoardProvider(<Controls />);

    expect(screen.getByTestId('new-board-button')).toBeInTheDocument();
    expect(screen.getByTestId('save-board-button')).toBeInTheDocument();
    expect(screen.getByTestId('load-board-button')).toBeInTheDocument();
    expect(screen.getByTestId('simulation-button')).toBeInTheDocument();
    expect(screen.getByTestId('next-generation-button')).toBeInTheDocument();
    expect(screen.getByTestId('skip-button')).toBeInTheDocument();
  });

  it('creates a new board when clicking New board button', async () => {
    const createCleanBoard = jest.fn().mockResolvedValue(true);
    
    await renderWithBoardProvider(<Controls />, {
      createCleanBoard
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId('new-board-button'));
    });

    expect(createCleanBoard).toHaveBeenCalled();
  });

  it('creates a board when Save board is clicked without existing board', async () => {
    const createBoard = jest.fn().mockResolvedValue(true);
    
    await renderWithBoardProvider(<Controls />, {
      boardId: null,
      createBoard
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId('save-board-button'));
    });

    expect(createBoard).toHaveBeenCalled();
  });

  it('saves board when Save board is clicked with existing board', async () => {
    const saveBoard = jest.fn().mockResolvedValue(true);
    
    await renderWithBoardProvider(<Controls />, {
      boardId: 'test-id',
      board: mockBoardWithCells,
      saveBoard
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId('save-board-button'));
    });

    expect(saveBoard).toHaveBeenCalled();
  });

  it('loads a board when Load button is clicked with valid ID', async () => {
    const loadBoard = jest.fn().mockResolvedValue(true);
    
    await renderWithBoardProvider(<Controls />, {
      loadBoard
    });

    const input = screen.getByTestId('board-id-input');
    fireEvent.change(input, { target: { value: 'test-board-id' } });
    
    await act(async () => {
      fireEvent.click(screen.getByTestId('load-board-button'));
    });

    expect(loadBoard).toHaveBeenCalledWith('test-board-id');
  });

  it('shows error when trying to load without board ID', async () => {
    await renderWithBoardProvider(<Controls />);

    await act(async () => {
      fireEvent.click(screen.getByTestId('load-board-button'));
    });

    expect(screen.getByTestId('error-message')).toHaveTextContent('Please enter a board ID');
  });

  it('advances to next generation when Next generation button is clicked', async () => {
    const fetchNextState = jest.fn().mockResolvedValue(true);
    
    await renderWithBoardProvider(<Controls />, {
      boardId: 'test-id',
      board: mockBoardWithCells,
      fetchNextState
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId('next-generation-button'));
    });

    expect(fetchNextState).toHaveBeenCalled();
  });

  it('handles simulation start/stop', async () => {
    await renderWithBoardProvider(<Controls />, {
      boardId: 'test-id',
      board: mockBoardWithCells
    });

    const simulationButton = screen.getByTestId('simulation-button');
    expect(simulationButton).not.toBeDisabled();
    
    // Start simulation
    await act(async () => {
      fireEvent.click(simulationButton);
    });
    expect(simulationButton).toHaveTextContent(/Stop simulation/);

    // Stop simulation
    await act(async () => {
      fireEvent.click(simulationButton);
    });
    expect(simulationButton).toHaveTextContent(/Start simulation/);
  });

  it('skips generations when Skip button is clicked', async () => {
    const skipGenerations = jest.fn().mockResolvedValue(true);
    
    await renderWithBoardProvider(<Controls />, {
      boardId: 'test-id',
      board: mockBoardWithCells,
      skipGenerations
    });

    const input = screen.getByTestId('generations-input');
    fireEvent.change(input, { target: { value: '5' } });

    await act(async () => {
      fireEvent.click(screen.getByTestId('skip-button'));
    });

    expect(skipGenerations).toHaveBeenCalledWith(5);
  });

  it('handles loading state', async () => {
    await renderWithBoardProvider(<Controls />, {
      boardId: 'test-id',
      board: mockBoardWithCells,
      loading: true
    });

    const buttons = [
      'new-board-button',
      'save-board-button',
      'load-board-button',
      'next-generation-button',
      'skip-button',
      'simulation-button'
    ];

    buttons.forEach(testId => {
      const button = screen.getByTestId(testId);
      expect(button).toBeDisabled();
    });
  });

  it('shows visual indicator for local changes', async () => {
    await renderWithBoardProvider(<Controls />, {
      boardId: 'test-id',
      board: mockBoardWithCells,
      localChanges: true
    });

    const saveButton = screen.getByTestId('save-board-button');
    expect(saveButton.className).toContain('ring-2');
    expect(saveButton.className).toContain('ring-yellow-400');
  });

  it('handles errors during board operations', async () => {
    const loadBoard = jest.fn().mockRejectedValue(new Error('Failed to load board'));
    
    await renderWithBoardProvider(<Controls />, {
      loadBoard
    });

    const input = screen.getByTestId('board-id-input');
    fireEvent.change(input, { target: { value: 'test-id' } });

    await act(async () => {
      fireEvent.click(screen.getByTestId('load-board-button'));
    });

    expect(screen.getByTestId('error-message')).toHaveTextContent('Failed to load board');
  });
});