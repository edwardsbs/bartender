using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Bartender.Api.Domain.Models;

public class RecipeStep
{
    [Key]
    public Guid Id { get; set; }

    [ForeignKey(nameof(Recipe))]
    public Guid RecipeId { get; set; }

    public int StepNumber { get; set; }

    [MaxLength(2000)]
    public string Text { get; set; } = default!;

    public Recipe Recipe { get; set; } = default!;
}
