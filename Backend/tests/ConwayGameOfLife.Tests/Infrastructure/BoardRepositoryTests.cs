using ConwayGameOfLife.Domain.Entities;
using ConwayGameOfLife.Infrastructure.Data;
using ConwayGameOfLife.Infrastructure.Repositories;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;

namespace ConwayGameOfLife.Tests.Infrastructure
{
    public class BoardRepositoryTests : IDisposable
    {
        private readonly ConwayGameContext _context;
        private readonly BoardRepository _repository;

        public BoardRepositoryTests()
        {
            var options = new DbContextOptionsBuilder<ConwayGameContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _context = new ConwayGameContext(options);
            _repository = new BoardRepository(_context);
        }

        [Fact]
        public async Task CreateAsync_ShouldAddBoardToDatabase()
        {
            // Arrange
            var board = new Board
            {
                State = new bool[3, 3]
            };

            // Act
            var result = await _repository.CreateAsync(board);

            // Assert
            result.Should().NotBeNull();
            result.Id.Should().NotBe(Guid.Empty);
            var savedBoard = await _context.Boards.FindAsync(result.Id);
            savedBoard.Should().NotBeNull();
            savedBoard!.Generation.Should().Be(1);
        }

        [Fact]
        public async Task GetByIdAsync_ExistingBoard_ShouldReturnBoard()
        {
            // Arrange
            var board = new Board
            {
                State = new bool[3, 3]
            };
            _context.Boards.Add(board);
            await _context.SaveChangesAsync();

            // Act
            var result = await _repository.GetByIdAsync(board.Id);

            // Assert
            result.Should().NotBeNull();
            result!.Id.Should().Be(board.Id);
        }

        [Fact]
        public async Task GetByIdAsync_NonExistingBoard_ShouldReturnNull()
        {
            // Act
            var result = await _repository.GetByIdAsync(Guid.NewGuid());

            // Assert
            result.Should().BeNull();
        }

        [Fact]
        public async Task UpdateAsync_ShouldUpdateBoardInDatabase()
        {
            // Arrange
            var board = new Board
            {
                State = new bool[3, 3]
            };
            _context.Boards.Add(board);
            await _context.SaveChangesAsync();

            var newState = new bool[3, 3] { { true, false, false }, { false, true, false }, { false, false, true } };
            board.UpdateState(newState, 2);

            // Act
            var result = await _repository.UpdateAsync(board);

            // Assert
            result.Should().NotBeNull();
            result.Generation.Should().Be(2);
            result.UpdatedAt.Should().NotBeNull();
            result.State.Should().BeEquivalentTo(newState);

            var savedBoard = await _context.Boards.FindAsync(board.Id);
            savedBoard.Should().NotBeNull();
            savedBoard!.Generation.Should().Be(2);
            savedBoard.UpdatedAt.Should().NotBeNull();
            savedBoard.State.Should().BeEquivalentTo(newState);
        }

        public void Dispose()
        {
            _context.Database.EnsureDeleted();
            _context.Dispose();
        }
    }
}