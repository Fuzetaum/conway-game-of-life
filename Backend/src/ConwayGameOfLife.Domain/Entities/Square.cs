namespace ConwayGameOfLife.Domain.Entities
{
    public class Square
    {
        public int Row { get; }
        public int Column { get; }
        public bool IsAlive { get; }
        public int LivingNeighbors { get; set; }

        public Square(int row, int column, bool isAlive)
        {
            Row = row;
            Column = column;
            IsAlive = isAlive;
            LivingNeighbors = 0;
        }

        public override bool Equals(object? obj)
        {
            if (obj is not Square other)
                return false;

            return Row == other.Row && Column == other.Column;
        }

        public override int GetHashCode()
        {
            return HashCode.Combine(Row, Column);
        }
    }
}