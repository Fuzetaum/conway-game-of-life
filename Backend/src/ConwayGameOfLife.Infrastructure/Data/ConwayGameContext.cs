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
                entity.Property(e => e.State)
                    .HasColumnType("jsonb")
                    .HasConversion(
                        v => SerializeBoolArray(v),
                        v => DeserializeBoolArray(v),
                        new Microsoft.EntityFrameworkCore.ChangeTracking.ValueComparer<bool[,]>(
                            (a1, a2) => AreArraysEqual(a1, a2),
                            arr => arr.GetHashCode(),
                            arr => (bool[,])arr.Clone()
                        )
                    );
            });
        }

        private static string SerializeBoolArray(bool[,] array)
        {
            int rows = array.GetLength(0);
            int cols = array.GetLength(1);
            var data = new { Rows = rows, Cols = cols, Values = new bool[rows * cols] };

            for (int i = 0; i < rows; i++)
                for (int j = 0; j < cols; j++)
                    data.Values[i * cols + j] = array[i, j];

            return JsonSerializer.Serialize(data);
        }

        private static bool[,] DeserializeBoolArray(string json)
        {
            var data = JsonSerializer.Deserialize<ArrayData>(json) ?? 
                throw new JsonException("Failed to deserialize array data");
            
            if (data.Values == null)
                throw new JsonException("Array values are missing");

            var result = new bool[data.Rows, data.Cols];

            for (int i = 0; i < data.Rows; i++)
                for (int j = 0; j < data.Cols; j++)
                    result[i, j] = data.Values[i * data.Cols + j];

            return result;
        }

        private class ArrayData
        {
            [JsonPropertyName("rows")]
            public int Rows { get; set; }

            [JsonPropertyName("cols")]
            public int Cols { get; set; }

            [JsonPropertyName("values")]
            public required bool[] Values { get; set; }
        }

        private static bool AreArraysEqual(bool[,]? a1, bool[,]? a2)
        {
            if (ReferenceEquals(a1, a2)) return true;
            if (a1 == null || a2 == null) return false;
            if (a1.GetLength(0) != a2.GetLength(0) || a1.GetLength(1) != a2.GetLength(1)) return false;

            int rows = a1.GetLength(0);
            int cols = a1.GetLength(1);

            for (int i = 0; i < rows; i++)
            {
                for (int j = 0; j < cols; j++)
                {
                    if (a1[i, j] != a2[i, j]) return false;
                }
            }

            return true;
        }
    }
}