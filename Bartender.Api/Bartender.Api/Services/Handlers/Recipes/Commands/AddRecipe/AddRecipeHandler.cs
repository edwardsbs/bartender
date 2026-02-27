using Bartender.Api.Domain.Models;
using Bartender.Api.Services.Contracts;
using Bartender.Api.Services.Handlers.Methods;
using Bartender.Api.Services.Handlers.Models.Dtos;
using Bartender.Api.Services.Handlers.Models.Mapping;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Bartender.Api.Services.Handlers.Recipes.Commands.AddRecipe;

public record AddRecipeRequest(UpsertRecipeDto dto) : IRequest<RecipeDto?>;
public class AddRecipeHandler : IRequestHandler<AddRecipeRequest, RecipeDto?>
{
    private readonly IBartenderContext _context;
    private readonly ILookup _lookup;

    public AddRecipeHandler(IBartenderContext context, ILookup lookup)
    {
        _context = context;
        _lookup = lookup;
    }

    public async Task<RecipeDto?> Handle(AddRecipeRequest request, CancellationToken token)
    {
        var now = DateTime.UtcNow;

        var recipe = new Recipe
        {
            Id = Guid.NewGuid(),
            Name = request.dto.Name.Trim(),
            Description = string.IsNullOrWhiteSpace(request.dto.Description) ? null : request.dto.Description.Trim(),
            BaseSpirit = string.IsNullOrWhiteSpace(request.dto.BaseSpirit) ? null : request.dto.BaseSpirit.Trim(),
            Glass = string.IsNullOrWhiteSpace(request.dto.Glass) ? null : request.dto.Glass.Trim(),
            Garnish = string.IsNullOrWhiteSpace(request.dto.Garnish) ? null : request.dto.Garnish.Trim(),
            Ice = string.IsNullOrWhiteSpace(request.dto.Ice) ? null : request.dto.Ice.Trim(),
            YieldText = string.IsNullOrWhiteSpace(request.dto.YieldText) ? null : request.dto.YieldText.Trim(),
            YoutubeUrl = string.IsNullOrWhiteSpace(request.dto.YoutubeUrl) ? null : request.dto.YoutubeUrl.Trim(),
            ImageUrl = string.IsNullOrWhiteSpace(request.dto.ImageUrl) ? null : request.dto.ImageUrl.Trim(),
            ImageThumbUrl = string.IsNullOrWhiteSpace(request.dto.ImageThumbUrl) ? null : request.dto.ImageThumbUrl.Trim(),
            UnsplashPhotoId = string.IsNullOrWhiteSpace(request.dto.UnsplashPhotoId) ? null : request.dto.UnsplashPhotoId.Trim(),
            ImageAttributionText = string.IsNullOrWhiteSpace(request.dto.ImageAttributionText) ? null : request.dto.ImageAttributionText.Trim(),
            ImageAttributionUrl = string.IsNullOrWhiteSpace(request.dto.ImageAttributionUrl) ? null : request.dto.ImageAttributionUrl.Trim(),
            CreatedAtUtc = now,
            UpdatedAtUtc = now,
        };

        // Categories
        foreach (var c in request.dto.Categories.Distinct(StringComparer.OrdinalIgnoreCase))
        {
            var val = c.Trim();
            if (string.IsNullOrWhiteSpace(val)) continue;
            recipe.Categories.Add(new RecipeCategory { Id = Guid.NewGuid(), RecipeId = recipe.Id, Value = val });
        }

        // Ingredients (preserve input order? if you want order later, add SortOrder column)
        foreach (var ing in request.dto.Ingredients)
        {
            recipe.Ingredients.Add(new RecipeIngredient
            {
                Id = Guid.NewGuid(),
                RecipeId = recipe.Id,
                OriginalLine = ing.OriginalLine.Trim(),
                Amount = ing.Amount,
                Unit = ing.Unit?.Trim() ?? "",
                Item = ing.Item.Trim(),
                Notes = string.IsNullOrWhiteSpace(ing.Notes) ? null : ing.Notes.Trim(),
                IsOptional = ing.IsOptional,
                MeasurementType = string.IsNullOrWhiteSpace(ing.MeasurementType) ? "volume" : ing.MeasurementType.Trim(),
            });
        }

        // Steps
        foreach (var s in request.dto.Steps.OrderBy(x => x.StepNumber))
        {
            recipe.Steps.Add(new RecipeStep
            {
                Id = Guid.NewGuid(),
                RecipeId = recipe.Id,
                StepNumber = s.StepNumber,
                Text = s.Text.Trim(),
            });
        }

        _context.Recipes.Add(recipe);

        // Inventory: ensure ingredient keys exist (best effort)
        foreach (var ing in recipe.Ingredients)
        {
            var key = Normalizing.NormalizeKey(ing.Item);
            if (string.IsNullOrWhiteSpace(key)) continue;

            var exists = await _context.InventoryItems.AnyAsync(x => x.Key == key, token);
            if (!exists)
            {
                _context.InventoryItems.Add(new InventoryItem
                {
                    Id = Guid.NewGuid(),
                    Key = key,
                    Name = ing.Item.Trim(),
                    Have = false,
                    UpdatedAtUtc = now
                });
            }
        }

        await _context.SaveChangesAsync(token);

        // reload full graph
        var created = await _lookup.LoadRecipeGraph(recipe.Id, token);
        return created?.ToDto();
    }
}
