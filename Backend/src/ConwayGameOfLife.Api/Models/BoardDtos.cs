using System;

namespace ConwayGameOfLife.Api.Models
{
    public class CreateBoardRequest
    {
        public required IEnumerable<CellDto> LivingCells { get; set; }
    }

    public class UpdateBoardRequest
    {
        public required IEnumerable<CellDto> LivingCells { get; set; }
        public int? Generation { get; set; }
    }

    public class GenerateNextStateRequest
    {
        public Guid BoardId { get; set; }
    }

    public class GenerateStateAfterGenerationsRequest
    {
        public Guid BoardId { get; set; }
        public int Generations { get; set; }
    }

    public class GetFinalStateRequest
    {
        public Guid BoardId { get; set; }
        public required int MaxGenerations { get; set; }
    }

    public class BoardResponse
    {
        public Guid Id { get; set; }
        public int Generation { get; set; }
        public required IEnumerable<CellDto> LivingCells { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    public class CellDto
    {
        public required int Row { get; set; }
        public required int Column { get; set; }
    }

    public class ErrorResponse
    {
        public required string Message { get; set; }
    }
}