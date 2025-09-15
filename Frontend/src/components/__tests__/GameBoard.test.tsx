import { fireEvent, screen } from '@testing-library/react';
import { renderWithBoardProvider, mockBoardWithCells, mockCanvasContext } from '../../__tests__/testUtils';
import GameBoard from '../GameBoard';

// Add helper to safely get canvas context
const getCanvasContext = (canvas: HTMLElement): CanvasRenderingContext2D | null => {
  if (canvas instanceof HTMLCanvasElement) {
    return canvas.getContext('2d');
  }
  return null;
};

describe('GameBoard', () => {
  let mockToggleSquare: jest.Mock;

  beforeEach(() => {
    mockToggleSquare = jest.fn();
    mockCanvasContext();
  });

  it('renders canvas element', () => {
    renderWithBoardProvider(<GameBoard />);
    const canvas = screen.getByRole('presentation');
    expect(canvas).toBeInTheDocument();
    expect(canvas.tagName.toLowerCase()).toBe('canvas');
  });

  it('displays loading spinner when loading', async () => {
    const mockContext = {
      loading: true,
      board: mockBoardWithCells,
      boardId: 'test-id',
      error: null,
      localChanges: false,
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

    // Wait for the loading state to be reflected in the component
    await renderWithBoardProvider(<GameBoard />, mockContext);
    
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('draws the board when it has cells', async () => {
    // Mock canvas context methods before rendering
    const { clearRect, strokeRect, fillRect } = mockCanvasContext();
    
    const mockContext = {
      board: mockBoardWithCells,
      boardId: 'test-board-id',
      loading: false,
      error: null,
      localChanges: false,
      toggleSquare: jest.fn(),
      createCleanBoard: jest.fn(),
      createBoard: jest.fn(),
      saveBoard: jest.fn(),
      loadBoard: jest.fn(),
      fetchNextState: jest.fn(),
      skipGenerations: jest.fn(),
      getFinalState: jest.fn(),
      createRandomBoard: jest.fn()
    };

    await renderWithBoardProvider(<GameBoard />, mockContext);
    
    const canvas = screen.getByRole('presentation');
    expect(canvas).toBeInTheDocument();

    // Wait for the canvas to be drawn
    await new Promise(resolve => setTimeout(resolve, 0));

    // Verify canvas draw calls
    expect(clearRect).toHaveBeenCalled();
    expect(strokeRect).toHaveBeenCalled();
    expect(fillRect).toHaveBeenCalled();
  });

  it('handles mouse click to toggle cell', async () => {
    const mockToggle = jest.fn();
    renderWithBoardProvider(<GameBoard />, {
      board: mockBoardWithCells,
      boardId: 'test-board-id',
      toggleSquare: mockToggle
    });

    const canvas = screen.getByRole('presentation');
    
    // Mock canvas getBoundingClientRect
    jest.spyOn(canvas, 'getBoundingClientRect').mockImplementation(() => ({
      left: 0,
      top: 0,
      width: 800,
      height: 600,
      x: 0,
      y: 0,
      right: 800,
      bottom: 600,
      toJSON: () => {}
    }));
    
    // Simulate click
    fireEvent.mouseDown(canvas, { clientX: 50, clientY: 50 });

    await new Promise(r => setTimeout(r, 10)); // Short delay to simulate click duration

    fireEvent.mouseUp(canvas, { clientX: 50, clientY: 50 });

    expect(mockToggle).toHaveBeenCalled();
  });

  it('handles zoom with mouse wheel', () => {
    const { clearRect } = mockCanvasContext();
    renderWithBoardProvider(<GameBoard />);
    const canvas = screen.getByRole('presentation');

    // Zoom in
    fireEvent.wheel(canvas, { deltaY: -100 });

    // Zoom out
    fireEvent.wheel(canvas, { deltaY: 100 });

    // Verify canvas is redrawn
    expect(clearRect).toHaveBeenCalled();
  });

  it('handles drag to pan the view', () => {
    renderWithBoardProvider(<GameBoard />);
    const canvas = screen.getByRole('presentation');

    // Start drag
    fireEvent.mouseDown(canvas, { clientX: 100, clientY: 100 });
    
    // Move mouse
    fireEvent.mouseMove(canvas, { clientX: 150, clientY: 150 });
    
    // End drag
    fireEvent.mouseUp(canvas);

    // Verify canvas is redrawn
    const context = getCanvasContext(canvas);
    expect(context?.clearRect).toHaveBeenCalled();
  });

  it('does not toggle cell when dragging', () => {
    renderWithBoardProvider(<GameBoard />, { toggleSquare: mockToggleSquare });
    const canvas = screen.getByRole('presentation');

    // Start drag
    fireEvent.mouseDown(canvas, { clientX: 100, clientY: 100 });
    
    // Move mouse far enough to trigger drag
    fireEvent.mouseMove(canvas, { clientX: 150, clientY: 150 });
    
    // End drag
    fireEvent.mouseUp(canvas);

    // toggleSquare should not be called when dragging
    expect(mockToggleSquare).not.toHaveBeenCalled();
  });

  it('handles mouse leave during drag', () => {
    renderWithBoardProvider(<GameBoard />);
    const canvas = screen.getByRole('presentation');

    // Start drag
    fireEvent.mouseDown(canvas, { clientX: 100, clientY: 100 });
    
    // Move mouse
    fireEvent.mouseMove(canvas, { clientX: 150, clientY: 150 });
    
    // Mouse leaves canvas
    fireEvent.mouseLeave(canvas);

    // Verify canvas is redrawn
    const context = getCanvasContext(canvas);
    expect(context?.clearRect).toHaveBeenCalled();
  });
});