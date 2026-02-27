using System.ComponentModel.DataAnnotations;

namespace Bartender.Api.Domain.Models;

public class InventoryItem
{
    [Key]
    public Guid Id { get; set; }

    // normalized key you already use on the frontend (lowercase, etc.)
    [MaxLength(200)]
    public string Key { get; set; } = default!;

    [MaxLength(200)]
    public string Name { get; set; } = default!;

    public bool Have { get; set; }

    public DateTime UpdatedAtUtc { get; set; }
}
