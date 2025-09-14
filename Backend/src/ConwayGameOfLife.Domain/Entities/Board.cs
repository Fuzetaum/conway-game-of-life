namespace ConwayGameOfLife.Domain.Entities
{
    public class Board
    {
        private static bool ShouldBeAlive(Square cell)
        {
            return cell.LivingNeighbors == 3 || (cell.IsAlive && cell.LivingNeighbors == 2);
        }

        public Guid Id { get; private set; }
        public int Generation { get; set; }
        public DateTime CreatedAt { get; private set; }
        public DateTime? UpdatedAt { get; private set; }
        public HashSet<Square> LivingCells { get; set; }

        protected Board()
        { 
            // For EF Core
            Id = Guid.NewGuid();
            LivingCells = new HashSet<Square>();
            Generation = 1;
            CreatedAt = DateTime.UtcNow;
        }

        public Board(IEnumerable<Square> initialState)
        {
            Id = Guid.NewGuid();
            Generation = 1;
            CreatedAt = DateTime.UtcNow;
            LivingCells = new HashSet<Square>(initialState.Where(s => s.IsAlive));
        }

        public IEnumerable<Square> GetState()
        {
            return LivingCells.ToList();
        }

        public void UpdateState(IEnumerable<Square> newState)
        {
            LivingCells = new HashSet<Square>(newState.Where(s => s.IsAlive));
            Generation++;
            UpdatedAt = DateTime.UtcNow;
        }

        public void CalculateNextState()
        {
            LivingCells = GetNextGeneration();
            Generation++;
            UpdatedAt = DateTime.UtcNow;
        }

        public bool IsFinalState()
        {
            var nextState = GetNextGeneration();
            return LivingCells.Count == nextState.Count && LivingCells.All(c => nextState.Any(n => n.Row == c.Row && n.Column == c.Column));
        }

        private void CountLivingNeighbors(Dictionary<(int row, int col), Square> squares, Square cell)
        {
            for (int i = cell.Row - 1; i <= cell.Row + 1; i++)
            {
                for (int j = cell.Column - 1; j <= cell.Column + 1; j++)
                {
                    if (i == cell.Row && j == cell.Column) continue;
                    
                    var key = (i, j);
                    if (!squares.ContainsKey(key))
                    {
                        squares[key] = new Square(i, j, false);
                    }
                    squares[key].LivingNeighbors++;
                }
            }
        }

        private HashSet<Square> GetNextGeneration()
        {
            // Track all cells and their neighbor counts in a dictionary to avoid duplicates
            var squares = new Dictionary<(int row, int col), Square>();
            
            // Add all current living cells and track their initial state
            foreach (var cell in LivingCells)
            {
                var key = (cell.Row, cell.Column);
                squares[key] = new Square(cell.Row, cell.Column, true);
            }
            
            // Count neighbors for all cells
            foreach (var cell in LivingCells)
            {
                CountLivingNeighbors(squares, cell);
            }

            // For each cell in the dictionary, determine if it should be alive in the next generation
            return squares.Values
                .Where(ShouldBeAlive)
                .Select(cell => new Square(cell.Row, cell.Column, true))
                .ToHashSet();
        }
    }
}