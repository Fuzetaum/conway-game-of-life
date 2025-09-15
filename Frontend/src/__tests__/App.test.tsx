import { screen } from '@testing-library/react';
import { renderWithBoardProvider, mockBoardWithCells } from '../__tests__/testUtils';
import App from '../App';

// Mock the child components
jest.mock('@components/Controls', () => {
  return function MockControls() {
    return <div data-testid="mock-controls">Controls Component</div>;
  };
});

jest.mock('@components/GameBoard', () => {
  return function MockGameBoard() {
    return <div data-testid="mock-gameboard">GameBoard Component</div>;
  };
});

describe('App', () => {
  it('renders the title', async () => {
    await renderWithBoardProvider(<App />);
    expect(screen.getByText("Conway's Game of Life")).toBeInTheDocument();
  });

  it('renders Controls component', async () => {
    await renderWithBoardProvider(<App />);
    expect(screen.getByTestId('mock-controls')).toBeInTheDocument();
  });

  it('renders GameBoard component', async () => {
    await renderWithBoardProvider(<App />);
    expect(screen.getByTestId('mock-gameboard')).toBeInTheDocument();
  });

  it('shows board not created message when no board exists', async () => {
    await renderWithBoardProvider(<App />);
    expect(screen.getByText('Board not yet created')).toBeInTheDocument();
  });

  it('does not show board not created message when board exists', async () => {
    const mockContext = {
      boardId: 'test-id',
      board: mockBoardWithCells,
      error: null,
      loading: false,
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

    await renderWithBoardProvider(<App />, mockContext);
    expect(screen.queryByText('Board not yet created')).not.toBeInTheDocument();
  });

  it('displays error message when there is an error', async () => {
    const mockContext = {
      boardId: null,
      board: undefined,
      error: 'Test error message',
      loading: false,
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
    
    await renderWithBoardProvider(<App />, mockContext);
    expect(screen.getByText('Test error message')).toBeInTheDocument();
  });

  it('applies correct styling classes', async () => {
    const { container } = await renderWithBoardProvider(<App />);
    
    // Check the main container
    const mainContainer = container.firstChild as HTMLElement;
    expect(mainContainer).toHaveClass('min-h-screen', 'bg-gray-100', 'p-8');

    // Check the content wrapper
    const wrapper = mainContainer.firstChild as HTMLElement;
    expect(wrapper).toHaveClass('max-w-6xl', 'mx-auto');

    // Check the board container
    const gameContainer = screen.getByTestId('mock-gameboard')
      .closest('div')  // Gets the mt-6 div
      ?.parentElement  // Gets the parent div with our target classes
      ?.parentElement; // Gets the bg-white container
    expect(gameContainer).toHaveClass('bg-white', 'rounded-lg', 'shadow-lg', 'p-6');
  });
});