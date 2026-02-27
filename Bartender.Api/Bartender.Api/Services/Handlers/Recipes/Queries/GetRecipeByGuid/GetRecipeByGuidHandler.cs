using Bartender.Api.Domain.Models;
using Bartender.Api.Services.Contracts;
using MediatR;

namespace Bartender.Api.Services.Handlers.Recipes.Queries.GetRecipeByGuid;

public record GetRecipeByGuidRequest(Guid id) : IRequest<Recipe>;
public class GetRecipeByGuidHandler : IRequestHandler<GetRecipeByGuidRequest, Recipe>
{
    private readonly IBartenderContext _context;

    public GetRecipeByGuidHandler(IBartenderContext context)
    {
        _context = context;
    }

    public async Task<Recipe> Handle(GetRecipeByGuidRequest request, CancellationToken token)
    {
        var recipe = await _context.Recipes.FindAsync(request.id, token);
        
        if (recipe != null)
        {
            return recipe;
        }

        throw new Exception("Did not find.");
    }
}
