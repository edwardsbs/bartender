using Bartender.Api.Domain.Models;
using Bartender.Api.Services.Contracts;
using Bartender.Api.Services.Handlers.Models.Dtos;
using Bartender.Api.Services.Handlers.Models.Mapping;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Net;

namespace Bartender.Api.Services.Handlers.Recipes.Queries.GetRecipes;

public record GetRecipesRequest : IRequest<List<RecipeDto>>;
public class GetRecipesHandler : IRequestHandler<GetRecipesRequest, List<RecipeDto>>
{
    private readonly IBartenderContext _context;

    public GetRecipesHandler(IBartenderContext context)
    {
        _context = context;
    }

    public async Task<List<RecipeDto>> Handle(GetRecipesRequest request, CancellationToken token)
    {
        var recipes = await _context.Recipes
            .AsNoTracking()
            .Include(r => r.Categories)
            .Include(r => r.Ingredients)
            .Include(r => r.Steps)
            .OrderByDescending(r => r.UpdatedAtUtc)
            .ToListAsync(token);

        return recipes.ToDtos();
    }
}
