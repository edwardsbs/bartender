using Bartender.Api.Domain;
using Bartender.Api.Domain.Models;
using Bartender.Api.Services.Handlers.Models.Dtos;
using Microsoft.EntityFrameworkCore;
using System;
using System.Reflection.Metadata.Ecma335;

namespace Bartender.Api.Services.Handlers.Models.Mapping;

public static class MappingExtensions
{

    public static RecipeDto ToDto(this Recipe r) =>
        new(
            r.Id,
            r.Name,
            r.Description,
            r.Categories.Select(c => c.Value).ToArray(),
            r.BaseSpirit,
            r.Glass,
            r.Garnish,
            r.Ice,
            r.YieldText,
            r.YoutubeUrl,
            r.ImageUrl,
            r.ImageThumbUrl,
            r.UnsplashPhotoId,
            r.ImageAttributionText,
            r.ImageAttributionUrl,
            r.CreatedAtUtc,
            r.UpdatedAtUtc,
            r.Ingredients
                .OrderBy(i => i.Id) // not meaningful; frontend order comes from input
                .Select(i => new IngredientLineDto(i.Id, i.OriginalLine, i.Amount, i.Unit, i.Item, i.Notes, i.IsOptional, i.MeasurementType))
                .ToArray(),
            r.Steps
                .OrderBy(s => s.StepNumber)
                .Select(s => new RecipeStepDto(s.Id, s.StepNumber, s.Text))
                .ToArray()
        );

    public static List<RecipeDto> ToDtos(this List<Recipe> recipes)
    {
        return recipes.Select(r => r.ToDto()).ToList();
    }
              

    public static async Task<Recipe?> LoadRecipeGraph(this BartenderContext db, Guid id, CancellationToken ct)
        => await db.Recipes
            .Include(r => r.Categories)
            .Include(r => r.Ingredients)
            .Include(r => r.Steps)
            .FirstOrDefaultAsync(r => r.Id == id, ct);
}