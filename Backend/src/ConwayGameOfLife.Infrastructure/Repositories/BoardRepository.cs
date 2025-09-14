using ConwayGameOfLife.Domain.Entities;
using ConwayGameOfLife.Infrastructure.Data;
using ConwayGameOfLife.Infrastructure.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ConwayGameOfLife.Infrastructure.Repositories
{
    public class BoardRepository : IBoardRepository
    {
        private readonly ConwayGameContext _context;

        public BoardRepository(ConwayGameContext context)
        {
            _context = context;
        }

        public async Task<Board?> GetByIdAsync(Guid id)
        {
            return await _context.Boards.FindAsync(id);
        }

        public async Task<Board> CreateAsync(Board board)
        {
            await _context.Boards.AddAsync(board);
            await _context.SaveChangesAsync();
            return board;
        }

        public async Task<Board> UpdateAsync(Board board)
        {
            _context.Entry(board).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return board;
        }
    }
}