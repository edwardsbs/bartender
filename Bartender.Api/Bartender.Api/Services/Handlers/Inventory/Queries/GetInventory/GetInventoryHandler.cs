using Bartender.Api.Domain.Models;
using Bartender.Api.Services.Contracts;
using Bartender.Api.Services.Handlers.Models.Dtos;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Bartender.Api.Services.Handlers.Inventory.Queries.GetInventory;
 
public record GetInventoryRequest : IRequest<List<InventoryItemViewModel>>;
public class GetInventoryHandler : IRequestHandler<GetInventoryRequest, List<InventoryItemViewModel>>
{
    private readonly IBartenderContext _context;

    public GetInventoryHandler(IBartenderContext context)
    {
        _context = context;
    }

    public async Task<List<InventoryItemViewModel>> Handle(GetInventoryRequest request, CancellationToken token)
    {
        var items = await _context.InventoryItems
            .AsNoTracking()
            .OrderByDescending(i => i.Have)
            .ThenBy(i => i.Name)
            .ToListAsync(token);

        return items.Select(i => new InventoryItemViewModel(i.Id, i.Key, i.Name, i.Have, i.UpdatedAtUtc)).ToList();
    }
}
