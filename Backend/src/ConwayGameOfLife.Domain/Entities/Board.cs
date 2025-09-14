namespace ConwayGameOfLife.Domain.Entities
{
    public class Board
    {
        public Guid Id { get; set; }
        public int Generation { get; set; }
        public bool[,] State { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }

        public Board()
        {
            Id = Guid.NewGuid();
            CreatedAt = DateTime.UtcNow;
            Generation = 1;
        }

        public void UpdateState(bool[,] newState, int? newGeneration = null)
        {
            State = newState;
            if (newGeneration.HasValue)
                Generation = newGeneration.Value;
            UpdatedAt = DateTime.UtcNow;
        }

        public static bool[,] CalculateNextState(bool[,] currentState)
        {
            int rows = currentState.GetLength(0);
            int cols = currentState.GetLength(1);
            bool[,] nextState = new bool[rows, cols];

            for (int i = 0; i < rows; i++)
            {
                for (int j = 0; j < cols; j++)
                {
                    int liveNeighbors = CountLiveNeighbors(currentState, i, j);
                    bool isAlive = currentState[i, j];

                    nextState[i, j] = (isAlive && (liveNeighbors == 2 || liveNeighbors == 3)) ||
                                    (!isAlive && liveNeighbors == 3);
                }
            }

            return nextState;
        }

        private static int CountLiveNeighbors(bool[,] state, int row, int col)
        {
            int rows = state.GetLength(0);
            int cols = state.GetLength(1);
            int count = 0;

            for (int i = -1; i <= 1; i++)
            {
                for (int j = -1; j <= 1; j++)
                {
                    if (i == 0 && j == 0) continue;

                    int newRow = row + i;
                    int newCol = col + j;

                    if (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < cols)
                    {
                        if (state[newRow, newCol])
                            count++;
                    }
                }
            }

            return count;
        }

        public bool IsFinalState(bool[,] nextState)
        {
            if (State.GetLength(0) != nextState.GetLength(0) || State.GetLength(1) != nextState.GetLength(1))
                return false;

            int rows = State.GetLength(0);
            int cols = State.GetLength(1);

            for (int i = 0; i < rows; i++)
            {
                for (int j = 0; j < cols; j++)
                {
                    if (State[i, j] != nextState[i, j])
                        return false;
                }
            }

            return true;
        }
    }
}