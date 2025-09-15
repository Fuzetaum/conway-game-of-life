import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useBoard } from '@hooks/useBoard';
import GameBoard from '../GameBoard';

// Mock the useBoard hook
jest.mock('@hooks/useBoard');

describe('GameBoard', () => {
  const mockUseBoard = useBoard as jest.MockedFunction<typeof useBoard>;

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Default mock implementation
    mockUseBoard.mockReturnValue({
      board: {
        id: '1',
        generation: 1,
        dimensions: { width: 50, height: 50 },
        livingCells: []
      },
      boardId: '1',
      loading: false,
      error: null,
      localChanges: false,
      toggleSquare: jest.fn(),
      createNewBoard: jest.fn(),
      saveBoard: jest.fn(),
      fetchNextState: jest.fn(),
      skipGenerations: jest.fn(),
      getFinalState: jest.fn()
    });
  });

  it('renders without crashing', () => {
    render(<GameBoard />);
    const canvas = screen.getByRole('presentation');
    expect(canvas).toBeInTheDocument();
  });

  it('displays loading spinner when loading', () => {
    mockUseBoard.mockReturnValue({
      ...mockUseBoard(),
      loading: true
    });

    render(<GameBoard />);
    const loadingSpinner = screen.getByTestId('loading-spinner');
    expect(loadingSpinner).toBeInTheDocument();
  });

  it('handles mouse click to toggle square', async () => {
    const mockToggleSquare = jest.fn();
    mockUseBoard.mockReturnValue({
      ...mockUseBoard(),
      toggleSquare: mockToggleSquare
    });

    render(<GameBoard />);
    const canvas = screen.getByRole('presentation');

    // Simulate a quick click
    fireEvent.mouseDown(canvas, { clientX: 400, clientY: 300 });
    fireEvent.mouseUp(canvas, { clientX: 400, clientY: 300 });

    await waitFor(() => {
      expect(mockToggleSquare).toHaveBeenCalledWith(expect.objectContaining({
        x: expect.any(Number),
        y: expect.any(Number)
      }));
    });
  });

  it('handles mouse drag without toggling square', async () => {
    const mockToggleSquare = jest.fn();
    mockUseBoard.mockReturnValue({
      ...mockUseBoard(),
      toggleSquare: mockToggleSquare
    });

    render(<GameBoard />);
    const canvas = screen.getByRole('presentation');

    // Simulate a drag
    fireEvent.mouseDown(canvas, { clientX: 100, clientY: 100 });
    fireEvent.mouseMove(canvas, { clientX: 150, clientY: 150 });
    fireEvent.mouseUp(canvas, { clientX: 150, clientY: 150 });

    expect(mockToggleSquare).not.toHaveBeenCalled();
  });

  it('handles mouse wheel for zooming', () => {
    render(<GameBoard />);
    const canvas = screen.getByRole('presentation');

    fireEvent.wheel(canvas, { deltaY: -100 }); // Zoom in
    fireEvent.wheel(canvas, { deltaY: 100 }); // Zoom out

    // Since we can't easily test the visual result, we just ensure it doesn't crash
    expect(canvas).toBeInTheDocument();
  });
});