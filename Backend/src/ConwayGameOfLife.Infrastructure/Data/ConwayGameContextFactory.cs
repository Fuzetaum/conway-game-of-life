using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;

namespace ConwayGameOfLife.Infrastructure.Data
{
    public class ConwayGameContextFactory : IDesignTimeDbContextFactory<ConwayGameContext>
    {
        public ConwayGameContext CreateDbContext(string[] args)
        {
            var configuration = new ConfigurationBuilder()
                .SetBasePath(Directory.GetCurrentDirectory())
                .AddJsonFile("appsettings.json")
                .Build();
            var optionsBuilder = new DbContextOptionsBuilder<ConwayGameContext>();
            optionsBuilder.UseNpgsql(configuration.GetConnectionString("DefaultConnection"));
            return new ConwayGameContext(optionsBuilder.Options);
        }
    }
}