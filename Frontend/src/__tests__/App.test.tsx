import { render, screen } from '@testing-library/react';
import { useBoard } from '@hooks/useBoard';
import App from '../App';

// Mock the useBoard hook and components
jest.mock('@hooks/useBoard');
jest.mock('@components/Controls', () => () => <div data-testid="mock-controls">Controls</div>);
jest.mock('@components/GameBoard', () => () => <div data-testid="mock-gameboard">GameBoard</div>);

describe('App', () => {
  const mockUseBoard = useBoard as jest.MockedFunction<typeof useBoard>;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock implementation
    mockUseBoard.mockReturnValue({
      board: null,
      boardId: null,
      loading: false,
      error: null,
      localChanges: false,
      createNewBoard: jest.fn(),
      saveBoard: jest.fn(),
      fetchNextState: jest.fn(),
      skipGenerations: jest.fn(),
      getFinalState: jest.fn(),
      toggleSquare: jest.fn()
    });
  });

  it('renders main components', () => {
    render(<App />);
    
    expect(screen.getByText("Conway's Game of Life")).toBeInTheDocument();
    expect(screen.getByTestId('mock-controls')).toBeInTheDocument();
    expect(screen.getByTestId('mock-gameboard')).toBeInTheDocument();
  });

  it('displays "Board not yet created" message when no board exists', () => {
    mockUseBoard.mockReturnValue({
      ...mockUseBoard(),
      boardId: null
    });

    render(<App />);
    expect(screen.getByText('Board not yet created')).toBeInTheDocument();
  });

  it('displays error message when there is an error', () => {
    mockUseBoard.mockReturnValue({
      ...mockUseBoard(),
      error: 'Test error message'
    });

    render(<App />);
    expect(screen.getByText('Test error message')).toBeInTheDocument();
  });

  it('does not show board creation message when board exists', () => {
    mockUseBoard.mockReturnValue({
      ...mockUseBoard(),
      boardId: 'test-id'
    });

    render(<App />);
    expect(screen.queryByText('Board not yet created')).not.toBeInTheDocument();
  });
});