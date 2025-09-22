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
            if (request.LivingCells == null)
                return BadRequest(new ErrorResponse { Message = "Living cells array is required" });

            var squares = request.LivingCells.Select(c => new Square(c.Row, c.Column, true));
            var board = new Board(squares);

            Board created = await _boardRepository.CreateAsync(board);
            BoardResponse response = MapToResponse(created);
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

            //if (request.NewState == null)
            //    return BadRequest(new ErrorResponse { Message = "New state is required" });

            var newSquares = request.LivingCells.Select(c => new Square(c.Row, c.Column, true));
            board.UpdateState(newSquares);
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

            board.CalculateNextState();
            var updated = await _boardRepository.UpdateAsync(board);
            
            return Ok(MapToResponse(updated));
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

            for (int i = 0; i < request.Generations; i++)
            {
                board.CalculateNextState();
            }

            var updated = await _boardRepository.UpdateAsync(board);
            return Ok(MapToResponse(updated));
        }

        [HttpPost("{id}/final")]
        [ProducesResponseType(typeof(BoardResponse), 200)]
        [ProducesResponseType(typeof(ErrorResponse), 400)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> GetFinalState(Guid id, [FromBody] GetFinalStateRequest request)
        {
            var board = await _boardRepository.GetByIdAsync(id);

            if (board == null)
                return NotFound();

            var generationsCount = 0;

            while (generationsCount < request.MaxGenerations)
            {
                if (board.IsFinalState())
                {
                    return Ok(MapToResponse(board));
                }

                board.CalculateNextState();
                generationsCount++;
            }

            return BadRequest(new ErrorResponse 
            { 
                Message = $"The board does not reach a final state after {request.MaxGenerations} generations"
            });
        }

        private static BoardResponse MapToResponse(Board board)
        {
            return new BoardResponse
            {
                Id = board.Id,
                Generation = board.Generation,
                LivingCells = board.GetState().Select(s => new CellDto { Row = s.Row, Column = s.Column }),
                CreatedAt = board.CreatedAt,
                UpdatedAt = board.UpdatedAt
            };
        }
    }
}