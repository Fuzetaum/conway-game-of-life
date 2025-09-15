import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useBoard } from '@hooks/useBoard';
import Controls from '../Controls';

// Mock the useBoard hook
jest.mock('@hooks/useBoard');

describe('Controls', () => {
  const mockUseBoard = useBoard as jest.MockedFunction<typeof useBoard>;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock implementation
    const mockFns = {
      createNewBoard: jest.fn().mockResolvedValue(true),
      saveBoard: jest.fn().mockResolvedValue(true),
      fetchNextState: jest.fn().mockResolvedValue(undefined),
      skipGenerations: jest.fn().mockResolvedValue(undefined),
      getFinalState: jest.fn().mockResolvedValue(undefined),
      toggleSquare: jest.fn()
    };
    
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
      ...mockFns
    });
  });

  it('renders all control buttons', () => {
    render(<Controls />);
    
    expect(screen.getByText('New board')).toBeInTheDocument();
    expect(screen.getByText('Save board')).toBeInTheDocument();
    expect(screen.getByText('Start simulation')).toBeInTheDocument();
    expect(screen.getByText('Next generation')).toBeInTheDocument();
    expect(screen.getByText('Skip')).toBeInTheDocument();
  });

  it('highlights save button when there are local changes', () => {
    mockUseBoard.mockReturnValue({
      ...mockUseBoard(),
      localChanges: true
    });

    render(<Controls />);
    const saveButton = screen.getByText('Save board');
    expect(saveButton).toHaveClass('ring-2', 'ring-yellow-400');
  });

  it('calls createNewBoard when clicking New board button', async () => {
    const mockCreateNewBoard = jest.fn().mockResolvedValue(true);
    mockUseBoard.mockReturnValue({
      ...mockUseBoard(),
      createNewBoard: mockCreateNewBoard
    });

    render(<Controls />);
    fireEvent.click(screen.getByText('New board'));

    await waitFor(() => {
      expect(mockCreateNewBoard).toHaveBeenCalled();
    });
  });

  it('calls saveBoard when clicking Save board button', async () => {
    const mockSaveBoard = jest.fn().mockResolvedValue(true);
    mockUseBoard.mockReturnValue({
      ...mockUseBoard(),
      saveBoard: mockSaveBoard
    });

    render(<Controls />);
    fireEvent.click(screen.getByText('Save board'));

    await waitFor(() => {
      expect(mockSaveBoard).toHaveBeenCalled();
    });
  });

  it('calls fetchNextState when clicking Next generation button', async () => {
    const mockFetchNextState = jest.fn();
    mockUseBoard.mockReturnValue({
      ...mockUseBoard(),
      fetchNextState: mockFetchNextState
    });

    render(<Controls />);
    fireEvent.click(screen.getByText('Next generation'));

    await waitFor(() => {
      expect(mockFetchNextState).toHaveBeenCalled();
    });
  });

  it('disables simulation controls when no board exists', () => {
    mockUseBoard.mockReturnValue({
      ...mockUseBoard(),
      boardId: null
    });

    render(<Controls />);
    
    expect(screen.getByText('Start simulation')).toBeDisabled();
    expect(screen.getByText('Next generation')).toBeDisabled();
    expect(screen.getByText('Skip')).toBeDisabled();
  });

  it('displays error message when an operation fails', async () => {
    const mockCreateNewBoard = jest.fn().mockRejectedValue(new Error('Test error'));
    mockUseBoard.mockReturnValue({
      ...mockUseBoard(),
      createNewBoard: mockCreateNewBoard
    });

    render(<Controls />);
    fireEvent.click(screen.getByText('New board'));

    await waitFor(() => {
      expect(screen.getByText('Test error')).toBeInTheDocument();
    });
  });

  it('updates skip generations input value and calls skipGenerations', async () => {
    const mockSkipGenerations = jest.fn();
    mockUseBoard.mockReturnValue({
      ...mockUseBoard(),
      skipGenerations: mockSkipGenerations
    });

    render(<Controls />);
    const input = screen.getByPlaceholderText('Generations to skip');
    const skipButton = screen.getByText('Skip');
    
    fireEvent.change(input, { target: { value: '5' } });
    expect(input).toHaveValue(5);

    fireEvent.click(skipButton);

    await waitFor(() => {
      expect(mockSkipGenerations).toHaveBeenCalledWith(5);
    });
  });
});