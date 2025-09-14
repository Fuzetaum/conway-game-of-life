using ConwayGameOfLife.Api.Controllers;
using ConwayGameOfLife.Api.Models;
using ConwayGameOfLife.Domain.Entities;
using ConwayGameOfLife.Infrastructure.Interfaces;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Moq;

namespace ConwayGameOfLife.Tests.Api
{
    public class BoardControllerTests
    {
        private readonly Mock<IBoardRepository> _mockRepository;
        private readonly BoardController _controller;

        public BoardControllerTests()
        {
            _mockRepository = new Mock<IBoardRepository>();
            _controller = new BoardController(_mockRepository.Object);
        }

        [Fact]
        public async Task Create_WithValidState_ReturnsCreatedResult()
        {
            // Arrange
            var request = new CreateBoardRequest
            {
                LivingCells = new[] 
                { 
                    new CellDto { Row = 1, Column = 1 }
                }
            };

            var createdBoard = new Board(new[] { new Square(1, 1, true) });

            _mockRepository.Setup(r => r.CreateAsync(It.IsAny<Board>()))
                .ReturnsAsync(createdBoard);

            // Act
            var result = await _controller.Create(request);

            // Assert
            var createdAtResult = result.Should().BeOfType<CreatedAtActionResult>().Subject;
            var response = createdAtResult.Value.Should().BeOfType<BoardResponse>().Subject;
            response.Id.Should().Be(createdBoard.Id);
            response.Generation.Should().Be(1);
            response.LivingCells.Should().ContainSingle(c => c.Row == 1 && c.Column == 1);
        }

        [Fact]
        public async Task GetById_ExistingBoard_ReturnsOk()
        {
            // Arrange
            var board = new Board(new[]
            {
                new Square(1, 1, true)
            });

            _mockRepository.Setup(r => r.GetByIdAsync(board.Id))
                .ReturnsAsync(board);

            // Act
            var result = await _controller.GetById(board.Id);

            // Assert
            var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
            var response = okResult.Value.Should().BeOfType<BoardResponse>().Subject;
            response.Id.Should().Be(board.Id);
            response.LivingCells.Should().ContainSingle(c => c.Row == 1 && c.Column == 1);
        }

        [Fact]
        public async Task GetById_NonExistingBoard_ReturnsNotFound()
        {
            // Arrange
            var id = Guid.NewGuid();
            _mockRepository.Setup(r => r.GetByIdAsync(id))
                .ReturnsAsync((Board?)null);

            // Act
            var result = await _controller.GetById(id);

            // Assert
            result.Should().BeOfType<NotFoundResult>();
        }

        [Fact]
        public async Task Update_ExistingBoard_ReturnsOk()
        {
            // Arrange
            var board = new Board(new[]
            {
                new Square(1, 1, true)
            });

            var request = new UpdateBoardRequest
            {
                LivingCells = new[]
                {
                    new CellDto { Row = 0, Column = 0 }
                }
            };

            var updatedBoard = new Board(new[]
            {
                new Square(0, 0, true)
            });

            _mockRepository.Setup(r => r.GetByIdAsync(board.Id))
                .ReturnsAsync(board);
            _mockRepository.Setup(r => r.UpdateAsync(It.IsAny<Board>()))
                .ReturnsAsync(updatedBoard);

            // Act
            var result = await _controller.Update(board.Id, request);

            // Assert
            var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
            var response = okResult.Value.Should().BeOfType<BoardResponse>().Subject;
            response.Id.Should().Be(updatedBoard.Id);
            response.LivingCells.Should().ContainSingle(c => c.Row == 0 && c.Column == 0);
        }

        [Fact]
        public async Task GenerateNextState_ExistingBoard_ReturnsNextState()
        {
            // Arrange
            var board = new Board(new[]
            {
                new Square(0, 0, true),
                new Square(0, 1, true),
                new Square(1, 0, true)
            });

            var nextState = new Board(new[]
            {
                new Square(0, 0, true),
                new Square(0, 1, true),
                new Square(1, 0, true),
                new Square(1, 1, true)
            })
            { Generation = 2 };

            _mockRepository.Setup(r => r.GetByIdAsync(board.Id))
                .ReturnsAsync(board);
            _mockRepository.Setup(r => r.UpdateAsync(It.IsAny<Board>()))
                .ReturnsAsync(nextState);

            // Act
            var result = await _controller.GenerateNextState(board.Id);

            // Assert
            var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
            var response = okResult.Value.Should().BeOfType<BoardResponse>().Subject;
            response.Id.Should().Be(nextState.Id);
            response.Generation.Should().Be(2);
            response.LivingCells.Should().HaveCount(4);
        }

        [Fact]
        public async Task GetFinalState_WithMaxGenerations_ReturnsOkWhenFinalStateFound()
        {
            // Arrange
            var board = new Board(new[]
            {
                new Square(0, 0, true),
                new Square(0, 1, true),
                new Square(1, 0, true),
                new Square(1, 1, true)
            }); // Block pattern (stable)

            _mockRepository.Setup(r => r.GetByIdAsync(board.Id))
                .ReturnsAsync(board);

            var request = new GetFinalStateRequest { MaxGenerations = 100 };

            // Act
            var result = await _controller.GetFinalState(board.Id, request);

            // Assert
            var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
            var response = okResult.Value.Should().BeOfType<BoardResponse>().Subject;
            response.Generation.Should().Be(1);
            response.LivingCells.Should().HaveCount(4);
        }

        [Fact]
        public async Task GetFinalState_ExceedsMaxGenerations_ReturnsBadRequest()
        {
            // Arrange
            var board = new Board(new[]
            {
                new Square(0, 0, true),
                new Square(0, 1, true),
                new Square(0, 2, true)
            });

            _mockRepository.Setup(r => r.GetByIdAsync(board.Id))
                .ReturnsAsync(board);

            var request = new GetFinalStateRequest { MaxGenerations = 2 };

            // Act
            var result = await _controller.GetFinalState(board.Id, request);

            // Assert
            var badRequestResult = result.Should().BeOfType<BadRequestObjectResult>().Subject;
            var error = badRequestResult.Value.Should().BeOfType<ErrorResponse>().Subject;
            error.Message.Should().Be("The board does not reach a final state after 2 generations");
        }
    }
}