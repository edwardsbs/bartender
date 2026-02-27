using Bartender.Api.Domain.Models;
using Bartender.Api.Services.Contracts;
using Bartender.Api.Services.Handlers.Methods;
using Bartender.Api.Services.Handlers.Models.Dtos;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Bartender.Api.Services.Handlers.Inventory.Commands.EditInventory;

public record EditInventoryRequest(UpsertInventoryDto dto) : IRequest<InventoryItemViewModel>;
public class EditInventoryHandler : IRequestHandler<EditInventoryRequest, InventoryItemViewModel>
{
    private readonly IBartenderContext _context;

    public EditInventoryHandler(IBartenderContext context)
    {
        _context = context;
    }

    public async Task<InventoryItemViewModel> Handle(EditInventoryRequest request, CancellationToken token)
    {
        var key = Normalizing.NormalizeKey(request.dto.Key);
        if (string.IsNullOrWhiteSpace(key)) throw new Exception("Key is required.");

        var now = DateTime.UtcNow;

        var item = await _context.InventoryItems.FirstOrDefaultAsync(i => i.Key == key, token);
        if (item is null)
        {
            item = new InventoryItem
            {
                Id = Guid.NewGuid(),
                Key = key,
                Name = string.IsNullOrWhiteSpace(request.dto.Name) ? request.dto.Key.Trim() : request.dto.Name.Trim(),
                Have = request.dto.Have,
                UpdatedAtUtc = now
            };
            _context.InventoryItems.Add(item);
        }
        else
        {
            item.Name = string.IsNullOrWhiteSpace(request.dto.Name) ? item.Name : request.dto.Name.Trim();
            item.Have = request.dto.Have;
            item.UpdatedAtUtc = now;
        }

        await _context.SaveChangesAsync(token);

        return new InventoryItemViewModel(item.Id, item.Key, item.Name, item.Have, item.UpdatedAtUtc);
    }
}
