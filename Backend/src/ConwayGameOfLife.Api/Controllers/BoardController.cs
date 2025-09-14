using ConwayGameOfLife.Api.Models;
using ConwayGameOfLife.Domain.Entities;
using ConwayGameOfLife.Infrastructure.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace ConwayGameOfLife.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BoardController : ControllerBase
    {
        private readonly IBoardRepository _boardRepository;

        public BoardController(IBoardRepository boardRepository)
        {
            _boardRepository = boardRepository;
        }

        [HttpPost]
        [ProducesResponseType(typeof(BoardResponse), 201)]
        [ProducesResponseType(typeof(ErrorResponse), 400)]
        public async Task<IActionResult> Create([FromBody] CreateBoardRequest request)
        {
            if (request.InitialState == null)
                return BadRequest(new ErrorResponse { Message = "Initial state is required" });

            var board = new Board
            {
                State = request.InitialState
            };

            var created = await _boardRepository.CreateAsync(board);
            var response = MapToResponse(created);

            return CreatedAtAction(nameof(GetById), new { id = response.Id }, response);
        }

        [HttpGet("{id}")]
        [ProducesResponseType(typeof(BoardResponse), 200)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> GetById(Guid id)
        {
            var board = await _boardRepository.GetByIdAsync(id);
            if (board == null)
                return NotFound();

            return Ok(MapToResponse(board));
        }

        [HttpPut("{id}")]
        [ProducesResponseType(typeof(BoardResponse), 200)]
        [ProducesResponseType(404)]
        [ProducesResponseType(typeof(ErrorResponse), 400)]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateBoardRequest request)
        {
            var board = await _boardRepository.GetByIdAsync(id);
            if (board == null)
                return NotFound();

            if (request.NewState == null)
                return BadRequest(new ErrorResponse { Message = "New state is required" });

            board.UpdateState(request.NewState, request.Generation);
            var updated = await _boardRepository.UpdateAsync(board);

            return Ok(MapToResponse(updated));
        }

        [HttpPost("{id}/next")]
        [ProducesResponseType(typeof(BoardResponse), 200)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> GenerateNextState(Guid id)
        {
            var board = await _boardRepository.GetByIdAsync(id);
            if (board == null)
                return NotFound();

            var nextState = Board.CalculateNextState(board.State);
            return Ok(new BoardResponse
            {
                Id = board.Id,
                Generation = board.Generation + 1,
                State = nextState,
                CreatedAt = board.CreatedAt,
                UpdatedAt = DateTime.UtcNow
            });
        }

        [HttpPost("{id}/advance")]
        [ProducesResponseType(typeof(BoardResponse), 200)]
        [ProducesResponseType(404)]
        [ProducesResponseType(typeof(ErrorResponse), 400)]
        public async Task<IActionResult> GenerateStateAfterGenerations(Guid id, [FromBody] GenerateStateAfterGenerationsRequest request)
        {
            var board = await _boardRepository.GetByIdAsync(id);
            if (board == null)
                return NotFound();

            if (request.Generations <= 0)
                return BadRequest(new ErrorResponse { Message = "Number of generations must be positive" });

            var currentState = board.State;
            var currentGeneration = board.Generation;

            for (int i = 0; i < request.Generations; i++)
            {
                currentState = Board.CalculateNextState(currentState);
                currentGeneration++;
            }

            return Ok(new BoardResponse
            {
                Id = board.Id,
                Generation = currentGeneration,
                State = currentState,
                CreatedAt = board.CreatedAt,
                UpdatedAt = DateTime.UtcNow
            });
        }

        [HttpPost("{id}/final")]
        [ProducesResponseType(typeof(BoardResponse), 200)]
        [ProducesResponseType(404)]
        [ProducesResponseType(typeof(ErrorResponse), 400)]
        public async Task<IActionResult> GetFinalState(Guid id, [FromBody] GetFinalStateRequest request)
        {
            var board = await _boardRepository.GetByIdAsync(id);
            if (!request.MaxGenerations.HasValue)
                return BadRequest(new ErrorResponse { Message = "Maximum number of generations is required" });

            if (board == null)
                return NotFound();

            var currentState = board.State;
            var currentGeneration = board.Generation;
            var maxGenerations = request.MaxGenerations.Value;
            var generationsCount = 0;

            while (generationsCount < maxGenerations)
            {
                var nextState = Board.CalculateNextState(currentState);
                generationsCount++;
                currentGeneration++;

                if (board.IsFinalState(nextState))
                {
                    return Ok(new BoardResponse
                    {
                        Id = board.Id,
                        Generation = currentGeneration,
                        State = nextState,
                        CreatedAt = board.CreatedAt,
                        UpdatedAt = DateTime.UtcNow
                    });
                }

                currentState = nextState;
            }

            return BadRequest(new ErrorResponse 
            { 
                Message = "Final state not reached",
                Details = $"The board does not reach a final state after {maxGenerations} generations"
            });
        }

        private static BoardResponse MapToResponse(Board board)
        {
            return new BoardResponse
            {
                Id = board.Id,
                Generation = board.Generation,
                State = board.State,
                CreatedAt = board.CreatedAt,
                UpdatedAt = board.UpdatedAt
            };
        }

        private static bool AreStatesEqual(bool[,] state1, bool[,] state2)
        {
            if (state1.GetLength(0) != state2.GetLength(0) || state1.GetLength(1) != state2.GetLength(1))
                return false;

            int rows = state1.GetLength(0);
            int cols = state1.GetLength(1);

            for (int i = 0; i < rows; i++)
            {
                for (int j = 0; j < cols; j++)
                {
                    if (state1[i, j] != state2[i, j])
                        return false;
                }
            }

            return true;
        }
    }
}