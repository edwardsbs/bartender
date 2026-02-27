using Bartender.Api.Services.Contracts;
using Bartender.Api.Services.Handlers.Methods;
using MediatR;

namespace Bartender.Api.Services.Handlers.Recipes.Commands.DeleteRecipe;

public record DeleteRecipeRequest(Guid id) : IRequest<Unit>;
public class DeleteRecipeHandler : IRequestHandler<DeleteRecipeRequest, Unit>
{
    private readonly IBartenderContext _context;
    private readonly ILookup _lookup;

    public DeleteRecipeHandler(IBartenderContext context, ILookup lookup)
    {
        _context = context;
        _lookup = lookup;
    }

    public async Task<Unit> Handle(DeleteRecipeRequest request, CancellationToken token)
    {
        var recipe = await _lookup.LoadRecipeGraph(request.id, token);
        if (recipe is null) return Unit.Value;

        _context.Recipes.Remove(recipe);
        await _context.SaveChangesAsync(token);

        return Unit.Value;
    }
}
