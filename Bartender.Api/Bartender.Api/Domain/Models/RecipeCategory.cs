using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Bartender.Api.Domain.Models;

public class RecipeCategory
{
    [Key]
    public Guid Id { get; set; }

    [ForeignKey(nameof(Recipe))]
    public Guid RecipeId { get; set; }

    [MaxLength(80)]
    public string Value { get; set; } = default!;

    public Recipe Recipe { get; set; } = default!;
}
