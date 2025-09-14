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
                InitialState = new bool[3, 3]
            };

            var createdBoard = new Board
            {
                Id = Guid.NewGuid(),
                State = request.InitialState,
                Generation = 1
            };

            _mockRepository.Setup(r => r.CreateAsync(It.IsAny<Board>()))
                .ReturnsAsync(createdBoard);

            // Act
            var result = await _controller.Create(request);

            // Assert
            var createdAtResult = result.Should().BeOfType<CreatedAtActionResult>().Subject;
            var response = createdAtResult.Value.Should().BeOfType<BoardResponse>().Subject;
            response.Id.Should().Be(createdBoard.Id);
            response.Generation.Should().Be(1);
        }

        [Fact]
        public async Task Create_WithNullState_ReturnsBadRequest()
        {
            // Arrange
            var request = new CreateBoardRequest
            {
                InitialState = null
            };

            // Act
            var result = await _controller.Create(request);

            // Assert
            var badRequestResult = result.Should().BeOfType<BadRequestObjectResult>().Subject;
            var error = badRequestResult.Value.Should().BeOfType<ErrorResponse>().Subject;
            error.Message.Should().Be("Initial state is required");
        }

        [Fact]
        public async Task GetById_ExistingBoard_ReturnsOk()
        {
            // Arrange
            var board = new Board
            {
                Id = Guid.NewGuid(),
                State = new bool[3, 3],
                Generation = 1
            };

            _mockRepository.Setup(r => r.GetByIdAsync(board.Id))
                .ReturnsAsync(board);

            // Act
            var result = await _controller.GetById(board.Id);

            // Assert
            var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
            var response = okResult.Value.Should().BeOfType<BoardResponse>().Subject;
            response.Id.Should().Be(board.Id);
        }

        [Fact]
        public async Task GetById_NonExistingBoard_ReturnsNotFound()
        {
            // Arrange
            var id = Guid.NewGuid();
            _mockRepository.Setup(r => r.GetByIdAsync(id))
                .ReturnsAsync((Board)null);

            // Act
            var result = await _controller.GetById(id);

            // Assert
            result.Should().BeOfType<NotFoundResult>();
        }

        [Fact]
        public async Task Update_ExistingBoard_ReturnsOk()
        {
            // Arrange
            var board = new Board
            {
                Id = Guid.NewGuid(),
                State = new bool[3, 3],
                Generation = 1
            };

            var request = new UpdateBoardRequest
            {
                NewState = new bool[3, 3],
                Generation = 2
            };

            _mockRepository.Setup(r => r.GetByIdAsync(board.Id))
                .ReturnsAsync(board);
            _mockRepository.Setup(r => r.UpdateAsync(It.IsAny<Board>()))
                .ReturnsAsync(board);

            // Act
            var result = await _controller.Update(board.Id, request);

            // Assert
            var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
            var response = okResult.Value.Should().BeOfType<BoardResponse>().Subject;
            response.Id.Should().Be(board.Id);
        }

        [Fact]
        public async Task GenerateNextState_ExistingBoard_ReturnsNextState()
        {
            // Arrange
            var board = new Board
            {
                Id = Guid.NewGuid(),
                State = new bool[3, 3] { { true, true, false }, { true, false, false }, { false, false, false } },
                Generation = 1
            };

            _mockRepository.Setup(r => r.GetByIdAsync(board.Id))
                .ReturnsAsync(board);

            // Act
            var result = await _controller.GenerateNextState(board.Id);

            // Assert
            var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
            var response = okResult.Value.Should().BeOfType<BoardResponse>().Subject;
            response.Generation.Should().Be(2);
        }

        [Fact]
        public async Task GetFinalState_WithMaxGenerations_ReturnsOkWhenFinalStateFound()
        {
            // Arrange
            var board = new Board
            {
                Id = Guid.NewGuid(),
                State = new bool[2, 2] { { true, true }, { true, true } }, // Block pattern (stable)
                Generation = 1
            };

            _mockRepository.Setup(r => r.GetByIdAsync(board.Id))
                .ReturnsAsync(board);

            var request = new GetFinalStateRequest { MaxGenerations = 100 };

            // Act
            var result = await _controller.GetFinalState(board.Id, request);

            // Assert
            var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
            var response = okResult.Value.Should().BeOfType<BoardResponse>().Subject;
            response.Generation.Should().Be(2);
        }

        [Fact]
        public async Task GetFinalState_WithoutMaxGenerations_ReturnsBadRequest()
        {
            // Arrange
            var request = new GetFinalStateRequest { MaxGenerations = null };

            // Act
            var result = await _controller.GetFinalState(Guid.NewGuid(), request);

            // Assert
            var badRequestResult = result.Should().BeOfType<BadRequestObjectResult>().Subject;
            var error = badRequestResult.Value.Should().BeOfType<ErrorResponse>().Subject;
            error.Message.Should().Be("Maximum number of generations is required");
        }

        [Fact]
        public async Task GetFinalState_ExceedsMaxGenerations_ReturnsBadRequest()
        {
            // Arrange
            var board = new Board
            {
                Id = Guid.NewGuid(),
                State = new bool[3, 3] { { true, true, false }, { true, false, false }, { false, false, false } },
                Generation = 1
            };

            _mockRepository.Setup(r => r.GetByIdAsync(board.Id))
                .ReturnsAsync(board);

            var request = new GetFinalStateRequest { MaxGenerations = 2 };

            // Act
            var result = await _controller.GetFinalState(board.Id, request);

            // Assert
            var badRequestResult = result.Should().BeOfType<BadRequestObjectResult>().Subject;
            var error = badRequestResult.Value.Should().BeOfType<ErrorResponse>().Subject;
            error.Message.Should().Be("Final state not reached");
        }
    }
}