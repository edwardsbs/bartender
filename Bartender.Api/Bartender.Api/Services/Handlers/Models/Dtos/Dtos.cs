namespace Bartender.Api.Services.Handlers.Models.Dtos;

public record RecipeDto(
    Guid Id,
    string Name,
    string? Description,
    string[] Categories,
    string? BaseSpirit,
    string? Glass,
    string? Garnish,
    string? Ice,
    string? YieldText,
    string? YoutubeUrl,
    string? ImageUrl,
    string? ImageThumbUrl,
    string? UnsplashPhotoId,
    string? ImageAttributionText,
    string? ImageAttributionUrl,
    DateTime CreatedAtUtc,
    DateTime UpdatedAtUtc,
    IngredientLineDto[] Ingredients,
    RecipeStepDto[] Steps
);

public record IngredientLineDto(
    Guid Id,
    string OriginalLine,
    decimal? Amount,
    string Unit,
    string Item,
    string? Notes,
    bool IsOptional,
    string MeasurementType
);

public record RecipeStepDto(
    Guid Id,
    int StepNumber,
    string Text
);

public record UpsertRecipeDto(
    Guid? Id,
    string Name,
    string? Description,
    string[] Categories,
    string? BaseSpirit,
    string? Glass,
    string? Garnish,
    string? Ice,
    string? YieldText,
    string? YoutubeUrl,
    string? ImageUrl,
    string? ImageThumbUrl,
    string? UnsplashPhotoId,
    string? ImageAttributionText,
    string? ImageAttributionUrl,
    IngredientLineUpsert[] Ingredients,
    StepUpsert[] Steps
);

public record IngredientLineUpsert(
    Guid? Id,
    string OriginalLine,
    decimal? Amount,
    string Unit,
    string Item,
    string? Notes,
    bool IsOptional,
    string MeasurementType
);

public record StepUpsert(
    Guid? Id,
    int StepNumber,
    string Text
);

public record InventoryItemViewModel(
    Guid Id,
    string Key,
    string Name,
    bool Have,
    DateTime UpdatedAtUtc
);

public record UpsertInventoryDto(
    string Key,
    string Name,
    bool Have
);
