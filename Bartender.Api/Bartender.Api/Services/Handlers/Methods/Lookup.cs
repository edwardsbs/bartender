using Bartender.Api.Domain;
using Bartender.Api.Domain.Models;
using Bartender.Api.Services.Contracts;
using Microsoft.EntityFrameworkCore;

namespace Bartender.Api.Services.Handlers.Methods;

public interface ILookup
{
    public Task<Recipe?> LoadRecipeGraph(Guid id, CancellationToken ct);
} 
public class Lookup : ILookup
{
    private readonly IBartenderContext _db;

    public Lookup(IBartenderContext db)
    {
        _db = db;
    }

    public async Task<Recipe?> LoadRecipeGraph(Guid id, CancellationToken ct)
        => await _db.Recipes
            .Include(r => r.Categories)
            .Include(r => r.Ingredients)
            .Include(r => r.Steps)
            .FirstOrDefaultAsync(r => r.Id == id, ct);
}
