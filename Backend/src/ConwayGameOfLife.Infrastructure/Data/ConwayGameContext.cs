using ConwayGameOfLife.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace ConwayGameOfLife.Infrastructure.Data
{
    public class ConwayGameContext : DbContext
    {
        public DbSet<Board> Boards { get; set; }

        public ConwayGameContext(DbContextOptions<ConwayGameContext> options)
            : base(options)
        {
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Board>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Generation).IsRequired();
                entity.Property(e => e.CreatedAt).IsRequired();
                entity.Property(e => e.LivingCells)
                    .HasColumnName("State")
                    .HasColumnType("jsonb")
                    .HasConversion(
                        v => SerializeState(v.ToHashSet()),
                        v => DeserializeState(v)
                    );
            });
        }

        private static string SerializeState(HashSet<Square> state)
        {
            var livingCells = state.Where(s => s.IsAlive).Select(s => new { s.Row, s.Column });
            return JsonSerializer.Serialize(livingCells);
        }

        private static HashSet<Square> DeserializeState(string json)
        {
            var livingCells = JsonSerializer.Deserialize<List<CellCoordinates>>(json) ?? 
                throw new JsonException("Failed to deserialize board state");
            
            return livingCells.Select(c => new Square(c.Row, c.Column, true)).ToHashSet();
        }

        private class CellCoordinates
        {
            [JsonPropertyName("row")]
            public int Row { get; set; }

            [JsonPropertyName("column")]
            public int Column { get; set; }
        }
    }
}