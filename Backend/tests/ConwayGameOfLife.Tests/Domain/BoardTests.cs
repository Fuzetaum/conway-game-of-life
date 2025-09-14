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
            var board = new Board(Array.Empty<Square>());

            // Assert
            board.Id.Should().NotBe(Guid.Empty);
            board.Generation.Should().Be(1);
            board.CreatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
            board.UpdatedAt.Should().BeNull();
            board.GetState().Should().BeEmpty();
        }

        [Fact]
        public void Constructor_WithInitialState_ShouldInitializeCorrectly()
        {
            // Arrange
            var initialState = new[] { new Square(1, 1, true), new Square(1, 2, true) };

            // Act
            var board = new Board(initialState);

            // Assert
            board.Id.Should().NotBe(Guid.Empty);
            board.Generation.Should().Be(1);
            board.CreatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
            board.UpdatedAt.Should().BeNull();
            
            var state = board.GetState().ToList();
            state.Should().HaveCount(2);
            state.Should().ContainSingle(s => s.Row == 1 && s.Column == 1 && s.IsAlive);
            state.Should().ContainSingle(s => s.Row == 1 && s.Column == 2 && s.IsAlive);
        }

        [Fact]
        public void UpdateState_ShouldUpdateStateAndTimestamp()
        {
            // Arrange
            var board = new Board(Array.Empty<Square>());
            var newState = new[] { new Square(1, 1, true) };

            // Act
            board.UpdateState(newState);

            // Assert
            var state = board.GetState().ToList();
            state.Should().HaveCount(1);
            state[0].Row.Should().Be(1);
            state[0].Column.Should().Be(1);
            state[0].IsAlive.Should().BeTrue();
            board.Generation.Should().Be(2);
            board.UpdatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
        }

        [Fact]
        public void CalculateNextState_EmptyBoard_ShouldRemainEmpty()
        {
            // Arrange
            var board = new Board(Array.Empty<Square>());

            // Act
            board.CalculateNextState();

            // Assert
            board.GetState().Should().BeEmpty();
            board.Generation.Should().Be(2);
        }

        [Fact]
        public void CalculateNextState_SingleCell_ShouldDie()
        {
            // Arrange
            var board = new Board(new[] { new Square(1, 1, true) });

            // Act
            board.CalculateNextState();

            // Assert
            board.GetState().Should().BeEmpty();
            board.Generation.Should().Be(2);
        }

        [Fact]
        public void CalculateNextState_Block_ShouldRemainStable()
        {
            // Arrange
            var board = new Board(new[]
            {
                new Square(1, 1, true),
                new Square(1, 2, true),
                new Square(2, 1, true),
                new Square(2, 2, true)
            });

            // Act
            board.CalculateNextState();

            // Assert
            var state = board.GetState().ToList();
            state.Should().HaveCount(4);
            state.Should().ContainSingle(s => s.Row == 1 && s.Column == 1 && s.IsAlive);
            state.Should().ContainSingle(s => s.Row == 1 && s.Column == 2 && s.IsAlive);
            state.Should().ContainSingle(s => s.Row == 2 && s.Column == 1 && s.IsAlive);
            state.Should().ContainSingle(s => s.Row == 2 && s.Column == 2 && s.IsAlive);
            board.Generation.Should().Be(2);
        }

        [Fact]
        public void CalculateNextState_Blinker_ShouldOscillate()
        {
            // Arrange
            var board = new Board(new[]
            {
                new Square(2, 1, true),
                new Square(2, 2, true),
                new Square(2, 3, true)
            });

            // Act
            board.CalculateNextState();

            // Assert - Should become vertical
            var state = board.GetState().ToList();
            state.Should().HaveCount(3);
            state.Should().ContainSingle(s => s.Row == 1 && s.Column == 2 && s.IsAlive);
            state.Should().ContainSingle(s => s.Row == 2 && s.Column == 2 && s.IsAlive);
            state.Should().ContainSingle(s => s.Row == 3 && s.Column == 2 && s.IsAlive);
            board.Generation.Should().Be(2);

            // Act again
            board.CalculateNextState();

            // Assert - Should return to horizontal
            state = board.GetState().ToList();
            state.Should().HaveCount(3);
            state.Should().ContainSingle(s => s.Row == 2 && s.Column == 1 && s.IsAlive);
            state.Should().ContainSingle(s => s.Row == 2 && s.Column == 2 && s.IsAlive);
            state.Should().ContainSingle(s => s.Row == 2 && s.Column == 3 && s.IsAlive);
            board.Generation.Should().Be(3);
        }

        [Fact]
        public void CalculateNextState_WithGrowingBoard_ShouldReturnTrue()
        {
            // Arrange
            var board = new Board(new[] {
                new Square(0, 0, true),
                new Square(0, 1, true),
                new Square(0, 2, true),
                new Square(1, 0, true),
                new Square(1, 2, true),
                new Square(2, 0, true),
                new Square(2, 1, true),
                new Square(2, 2, true),
            });

            // Act
            board.CalculateNextState();

            // Assert
            var state = board.GetState().ToList();
            state.Should().NotBeEmpty();
            board.Generation.Should().Be(2);
            board.UpdatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
        }

        [Fact]
        public void IsFinalState_ShouldReturnTrueForStablePattern()
        {
            // Arrange - Create a block pattern
            var board = new Board(new[]
            {
                new Square(1, 1, true),
                new Square(1, 2, true),
                new Square(2, 1, true),
                new Square(2, 2, true)
            });

            // Act & Assert
            board.IsFinalState().Should().BeTrue();
        }

        [Fact]
        public void IsFinalState_ShouldReturnFalseForOscillatingPattern()
        {
            // Arrange - Create a blinker pattern
            var board = new Board(new[]
            {
                new Square(2, 1, true),
                new Square(2, 2, true),
                new Square(2, 3, true)
            });

            // Act & Assert
            board.IsFinalState().Should().BeFalse();
        }

        [Theory]
        [InlineData(-1, 0)]
        [InlineData(0, -1)]
        [InlineData(3, 0)]
        [InlineData(0, 3)]
        public void UpdateState_WithCoordinatesOutsideInitialBoard_ShouldWork(int row, int col)
        {
            // Arrange
            var board = new Board(Array.Empty<Square>());
            var newState = new[] { new Square(row, col, true) };

            // Act
            board.UpdateState(newState);

            // Assert
            board.GetState().Should().ContainSingle(s => s.Row == row && s.Column == col && s.IsAlive);
        }
    }
}