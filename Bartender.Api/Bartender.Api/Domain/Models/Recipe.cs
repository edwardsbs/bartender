using System.ComponentModel.DataAnnotations;

namespace Bartender.Api.Domain.Models;

public class Recipe
{
    [Key]
    public Guid Id { get; set; }

    [MaxLength(200)]
    public string Name { get; set; } = default!;

    [MaxLength(2000)]
    public string? Description { get; set; }

    // quick metadata
    [MaxLength(100)]
    public string? BaseSpirit { get; set; }

    [MaxLength(100)]
    public string? Glass { get; set; }

    [MaxLength(200)]
    public string? Garnish { get; set; }

    [MaxLength(200)]
    public string? Ice { get; set; }

    [MaxLength(100)]
    public string? YieldText { get; set; }

    // media
    [MaxLength(2048)]
    public string? YoutubeUrl { get; set; }

    [MaxLength(2048)]
    public string? ImageUrl { get; set; }

    [MaxLength(2048)]
    public string? ImageThumbUrl { get; set; }

    [MaxLength(100)]
    public string? UnsplashPhotoId { get; set; }

    [MaxLength(300)]
    public string? ImageAttributionText { get; set; }

    [MaxLength(2048)]
    public string? ImageAttributionUrl { get; set; }

    // timestamps
    public DateTime CreatedAtUtc { get; set; }
    public DateTime UpdatedAtUtc { get; set; }

    public List<RecipeCategory> Categories { get; set; } = new();
    public List<RecipeIngredient> Ingredients { get; set; } = new();
    public List<RecipeStep> Steps { get; set; } = new();
}
