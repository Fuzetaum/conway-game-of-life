import GameBoard from '@components/GameBoard';
import Controls from '@components/Controls';
import { useBoard } from '@hooks/useBoard';

function App() {
  const { boardId, error } = useBoard();

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">Conway's Game of Life</h1>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <Controls />
          <div className="mt-6">
            {!boardId && <p className="text-gray-600">Board not yet created</p>}
            <GameBoard />
            {error && <p className="text-red-600 mt-4">{error}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;