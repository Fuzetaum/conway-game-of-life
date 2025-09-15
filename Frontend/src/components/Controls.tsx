import { useState, useCallback } from 'react';
import { useBoard } from '@context/BoardContext';

const Controls: React.FC = () => {
  const [isSimulating, setIsSimulating] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [skipGenerations, setSkipGenerations] = useState(1);
  const [boardIdentifier, setBoardIdentifier] = useState('');
  const {
    boardId,
    localChanges,
    loading: contextLoading,
    createCleanBoard,
    createBoard,
    fetchNextState,
    loadBoard,
    saveBoard,
    skipGenerations: skipGen,
  } = useBoard();

  const handleCreateBoard = useCallback(async () => {
    setError(null);
    try {
      await createBoard();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create board');
    }
  }, [createBoard]);

  const handleSaveBoard = useCallback(async () => {
    setError(null);
    try {
      await saveBoard();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save board');
    }
  }, [saveBoard]);

  const handleLoadBoard = useCallback(async (id: string) => {
    if (!id.trim()) {
      setError('Please enter a board ID');
      return;
    }
    setError(null);
    try {
      await loadBoard(id);
      setBoardIdentifier('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load board');
    }
  }, [loadBoard]);

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <button
          onClick={createCleanBoard}
          disabled={contextLoading}
          data-testid="new-board-button"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          New board
        </button>
        <button
          onClick={() => !boardId ? handleCreateBoard() : handleSaveBoard()}
          disabled={contextLoading}
          data-testid="save-board-button"
          className={`px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 ${
            localChanges ? 'ring-2 ring-yellow-400' : ''
          }`}
        >
          Save board
        </button>
      </div>

      <div className="flex gap-4 items-center">
        <input
          type="text"
          placeholder="Board identifier"
          className="px-4 py-2 border rounded"
          value={boardIdentifier}
          onChange={e => setBoardIdentifier(e.target.value)}
          data-testid="board-id-input"
        />
        <button
          onClick={() => handleLoadBoard(boardIdentifier)}
          disabled={contextLoading}
          data-testid="load-board-button"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          Load
        </button>
      </div>

      <div className="flex gap-4">
        <button
          onClick={() => setIsSimulating(!isSimulating)}
          disabled={!boardId || contextLoading}
          data-testid="simulation-button"
          className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
        >
          {isSimulating ? 'Stop' : 'Start'} simulation
        </button>
        <button
          onClick={() => fetchNextState()}
          disabled={!boardId || contextLoading}
          data-testid="next-generation-button"
          className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 disabled:opacity-50"
        >
          Next generation
        </button>
      </div>

      <div className="flex gap-4 items-center">
        <input
          type="number"
          min="1"
          value={skipGenerations}
          onChange={e => setSkipGenerations(parseInt(e.target.value) || 1)}
          placeholder="Generations to skip"
          className="px-4 py-2 border rounded"
          data-testid="generations-input"
        />
        <button
          onClick={() => skipGen(skipGenerations)}
          disabled={!boardId || contextLoading}
          data-testid="skip-button"
          className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 disabled:opacity-50"
        >
          Skip
        </button>
      </div>

      {error && (
        <div data-testid="error-message" className="text-red-600 mt-4">
          {error}
        </div>
      )}
    </div>
  );
};

export default Controls;