using Bartender.Api.Domain;
using Bartender.Api.Domain.Models;
using Microsoft.EntityFrameworkCore;

namespace Bartender.Api.Services.Contracts;

public class IBartenderContext : BartenderContext
{
    public IBartenderContext(DbContextOptions<BartenderContext> options) : base(options) { }

    public DbSet<Recipe> Recipes { get; set; }
    public DbSet<RecipeCategory> RecipeCategories { get; set; }
    public DbSet<RecipeIngredient> RecipeIngredients { get; set; }
    public DbSet<RecipeStep> RecipeSteps { get; set; }
    public DbSet<InventoryItem> InventoryItems { get; set; }

}
