using ConwayGameOfLife.Domain.Entities;

namespace ConwayGameOfLife.Infrastructure.Interfaces
{
    public interface IBoardRepository
    {
        Task<Board?> GetByIdAsync(Guid id);
        Task<Board> CreateAsync(Board board);
        Task<Board> UpdateAsync(Board board);
    }
}