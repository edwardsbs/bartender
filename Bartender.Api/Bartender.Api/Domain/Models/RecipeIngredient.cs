using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Bartender.Api.Domain.Models;

public class RecipeIngredient
{
    [Key]
    public Guid Id { get; set; }

    [ForeignKey(nameof(Recipe))]
    public Guid RecipeId { get; set; }

    // keep original line (so parsing can be imperfect)
    [MaxLength(500)]
    public string OriginalLine { get; set; } = default!;

    public decimal? Amount { get; set; }

    [MaxLength(20)]
    public string Unit { get; set; } = ""; // "oz", "ml", etc.

    [MaxLength(200)]
    public string Item { get; set; } = default!; // canonical-ish text for now

    [MaxLength(200)]
    public string? Notes { get; set; }

    public bool IsOptional { get; set; }

    [MaxLength(20)]
    public string MeasurementType { get; set; } = "volume"; // volume|count|special

    public Recipe Recipe { get; set; } = default!;
}
