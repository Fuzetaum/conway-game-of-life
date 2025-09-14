using ConwayGameOfLife.Domain.Entities;
using FluentAssertions;

namespace ConwayGameOfLife.Tests.Domain
{
    public class BoardTests
    {
        [Fact]
        public void Constructor_ShouldInitializeCorrectly()
        {
            // Act
            var board = new Board();

            // Assert
            board.Id.Should().NotBe(Guid.Empty);
            board.Generation.Should().Be(1);
            board.CreatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
            board.UpdatedAt.Should().BeNull();
        }

        [Fact]
        public void UpdateState_ShouldUpdateStateAndTimestamp()
        {
            // Arrange
            var board = new Board();
            var newState = new bool[3, 3];
            var newGeneration = 2;

            // Act
            board.UpdateState(newState, newGeneration);

            // Assert
            board.State.Should().BeSameAs(newState);
            board.Generation.Should().Be(newGeneration);
            board.UpdatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
        }

        [Fact]
        public void CalculateNextState_EmptyBoard_ShouldRemainEmpty()
        {
            // Arrange
            bool[,] currentState = new bool[3, 3];

            // Act
            var nextState = Board.CalculateNextState(currentState);

            // Assert
            for (int i = 0; i < 3; i++)
                for (int j = 0; j < 3; j++)
                    nextState[i, j].Should().BeFalse();
        }

        [Fact]
        public void CalculateNextState_SingleCell_ShouldDie()
        {
            // Arrange
            bool[,] currentState = new bool[3, 3];
            currentState[1, 1] = true;

            // Act
            var nextState = Board.CalculateNextState(currentState);

            // Assert
            nextState[1, 1].Should().BeFalse("A live cell with fewer than two live neighbors dies");
        }

        [Fact]
        public void CalculateNextState_Block_ShouldRemainStable()
        {
            // Arrange
            bool[,] currentState = new bool[4, 4];
            // Create a block pattern (2x2 square)
            currentState[1, 1] = true;
            currentState[1, 2] = true;
            currentState[2, 1] = true;
            currentState[2, 2] = true;

            // Act
            var nextState = Board.CalculateNextState(currentState);

            // Assert
            nextState[1, 1].Should().BeTrue();
            nextState[1, 2].Should().BeTrue();
            nextState[2, 1].Should().BeTrue();
            nextState[2, 2].Should().BeTrue();
            
            // Check that no other cells became alive
            int liveCount = 0;
            for (int i = 0; i < 4; i++)
                for (int j = 0; j < 4; j++)
                    if (nextState[i, j]) liveCount++;
            liveCount.Should().Be(4);
        }

        [Fact]
        public void CalculateNextState_Blinker_ShouldOscillate()
        {
            // Arrange
            bool[,] currentState = new bool[5, 5];
            // Create a horizontal line
            currentState[2, 1] = true;
            currentState[2, 2] = true;
            currentState[2, 3] = true;

            // Act
            var nextState = Board.CalculateNextState(currentState);

            // Assert
            // Should become a vertical line
            nextState[1, 2].Should().BeTrue();
            nextState[2, 2].Should().BeTrue();
            nextState[3, 2].Should().BeTrue();
            
            // Check that no other cells became alive
            int liveCount = 0;
            for (int i = 0; i < 5; i++)
                for (int j = 0; j < 5; j++)
                    if (nextState[i, j]) liveCount++;
            liveCount.Should().Be(3);
        }

        [Fact]
        public void IsFinalState_SameStates_ShouldReturnTrue()
        {
            // Arrange
            var board = new Board();
            bool[,] state = new bool[3, 3];
            state[1, 1] = true;
            board.State = state;

            // Create an identical state
            bool[,] nextState = new bool[3, 3];
            nextState[1, 1] = true;

            // Act
            var result = board.IsFinalState(nextState);

            // Assert
            result.Should().BeTrue();
        }

        [Fact]
        public void IsFinalState_DifferentStates_ShouldReturnFalse()
        {
            // Arrange
            var board = new Board();
            bool[,] state = new bool[3, 3];
            state[1, 1] = true;
            board.State = state;

            // Create a different state
            bool[,] nextState = new bool[3, 3];
            nextState[1, 2] = true;

            // Act
            var result = board.IsFinalState(nextState);

            // Assert
            result.Should().BeFalse();
        }

        [Fact]
        public void IsFinalState_DifferentSizes_ShouldReturnFalse()
        {
            // Arrange
            var board = new Board();
            board.State = new bool[3, 3];

            // Create a state with different dimensions
            bool[,] nextState = new bool[4, 4];

            // Act
            var result = board.IsFinalState(nextState);

            // Assert
            result.Should().BeFalse();
        }
    }
}