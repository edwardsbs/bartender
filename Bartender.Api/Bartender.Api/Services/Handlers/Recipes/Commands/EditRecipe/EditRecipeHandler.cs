using Bartender.Api.Domain.Models;
using Bartender.Api.Services.Contracts;
using Bartender.Api.Services.Handlers.Methods;
using Bartender.Api.Services.Handlers.Models.Dtos;
using Bartender.Api.Services.Handlers.Models.Mapping;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Bartender.Api.Services.Handlers.Recipes.Commands.EditRecipe;

public record EditRecipeRequest(Guid id, UpsertRecipeDto dto) : IRequest<RecipeDto?>;
public class EditRecipeHandler : IRequestHandler<EditRecipeRequest, RecipeDto?>
{
    private readonly IBartenderContext _context;
    private readonly ILookup _lookup;

    public EditRecipeHandler(IBartenderContext context, ILookup lookup)
    {
        _context = context;
        _lookup = lookup;
    }

    public async Task<RecipeDto?> Handle(EditRecipeRequest request, CancellationToken token)
    {
        var recipe = await _lookup.LoadRecipeGraph(request.id, token);
        if (recipe is null) return null;

        var now = DateTime.UtcNow;

        recipe.Name = request.dto.Name.Trim();
        recipe.Description = string.IsNullOrWhiteSpace(request.dto.Description) ? null : request.dto.Description.Trim();
        recipe.BaseSpirit = string.IsNullOrWhiteSpace(request.dto.BaseSpirit) ? null : request.dto.BaseSpirit.Trim();
        recipe.Glass = string.IsNullOrWhiteSpace(request.dto.Glass) ? null : request.dto.Glass.Trim();
        recipe.Garnish = string.IsNullOrWhiteSpace(request.dto.Garnish) ? null : request.dto.Garnish.Trim();
        recipe.Ice = string.IsNullOrWhiteSpace(request.dto.Ice) ? null : request.dto.Ice.Trim();
        recipe.YieldText = string.IsNullOrWhiteSpace(request.dto.YieldText) ? null : request.dto.YieldText.Trim();
        recipe.YoutubeUrl = string.IsNullOrWhiteSpace(request.dto.YoutubeUrl) ? null : request.dto.YoutubeUrl.Trim();
        recipe.ImageUrl = string.IsNullOrWhiteSpace(request.dto.ImageUrl) ? null : request.dto.ImageUrl.Trim();
        recipe.ImageThumbUrl = string.IsNullOrWhiteSpace(request.dto.ImageThumbUrl) ? null : request.dto.ImageThumbUrl.Trim();
        recipe.UnsplashPhotoId = string.IsNullOrWhiteSpace(request.dto.UnsplashPhotoId) ? null : request.dto.UnsplashPhotoId.Trim();
        recipe.ImageAttributionText = string.IsNullOrWhiteSpace(request.dto.ImageAttributionText) ? null : request.dto.ImageAttributionText.Trim();
        recipe.ImageAttributionUrl = string.IsNullOrWhiteSpace(request.dto.ImageAttributionUrl) ? null : request.dto.ImageAttributionUrl.Trim();
        recipe.UpdatedAtUtc = now;

        // Replace categories/ingredients/steps (simple + reliable for now)
        _context.RecipeCategories.RemoveRange(recipe.Categories);
        _context.RecipeIngredients.RemoveRange(recipe.Ingredients);
        _context.RecipeSteps.RemoveRange(recipe.Steps);

        await _context.SaveChangesAsync(token);

        recipe.Categories = request.dto.Categories
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .Select(c => c.Trim())
            .Where(c => !string.IsNullOrWhiteSpace(c))
            .Select(c => new RecipeCategory { Id = Guid.NewGuid(), RecipeId = recipe.Id, Value = c })
            .ToList();

        await _context.RecipeCategories.AddRangeAsync(recipe.Categories);
        //await _context.SaveChangesAsync(token);

        recipe.Ingredients = request.dto.Ingredients.Select(ing => new RecipeIngredient
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
        }).ToList();

        await _context.RecipeIngredients.AddRangeAsync(recipe.Ingredients);
        //await _context.SaveChangesAsync(token);

        recipe.Steps = request.dto.Steps
            .OrderBy(s => s.StepNumber)
            .Select(s => new RecipeStep
            {
                Id = Guid.NewGuid(),
                RecipeId = recipe.Id,
                StepNumber = s.StepNumber,
                Text = s.Text.Trim(),
            }).ToList();

        await _context.RecipeSteps.AddRangeAsync(recipe.Steps);
        //await _context.SaveChangesAsync(token);

        // ensure inventory items exist
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

        //_context.Recipes.Update(recipe);
        await _context.SaveChangesAsync(token);

        //var updated = await _lookup.LoadRecipeGraph(recipe.Id, token);
        var updated = recipe.ToDto();
        return updated;
    }

}
