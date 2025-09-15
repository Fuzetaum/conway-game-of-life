import { useState, useCallback } from 'react';
import { useBoard } from '@hooks/useBoard';

const Controls: React.FC = () => {
  const [isSimulating, setIsSimulating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [skipGenerations, setSkipGenerations] = useState(1);
  const {
    boardId,
    localChanges,
    createNewBoard,
    fetchNextState,
    saveBoard,
    skipGenerations: skipGen,
  } = useBoard();

  const handleCreateBoard = useCallback(async () => {
    try {
      setLoading(true);
      await createNewBoard();
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create board');
    } finally {
      setLoading(false);
    }
  }, [createNewBoard]);

  const handleSaveBoard = useCallback(async () => {
    try {
      setLoading(true);
      await saveBoard();
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save board');
    } finally {
      setLoading(false);
    }
  }, [saveBoard]);

  const handleLoadBoard = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      // The backend doesn't have a "get board" endpoint, so we'll use getNextState
      await fetchNextState();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load board');
    } finally {
      setLoading(false);
    }
  }, [fetchNextState]);

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <button
          onClick={handleCreateBoard}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          New board
        </button>
        <button
          onClick={() => handleSaveBoard()}
          disabled={loading}
          className={`px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 ${localChanges ? 'ring-2 ring-yellow-400' : ''}`}
        >
          Save board
        </button>
      </div>

      <div className="flex gap-4">
        <button
          onClick={() => setIsSimulating(!isSimulating)}
          disabled={!boardId || loading}
          className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
        >
          {isSimulating ? 'Stop' : 'Start'} simulation
        </button>
        <button
          onClick={() => handleLoadBoard(boardId!)}
          disabled={!boardId || loading}
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
        />
        <button
          onClick={() => skipGen(skipGenerations)}
          disabled={!boardId || loading}
          className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 disabled:opacity-50"
        >
          Skip
        </button>
      </div>

      {error && <p className="text-red-600">{error}</p>}
    </div>
  );
};

export default Controls;