using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Bartender.Api.Migrations
{
    /// <inheritdoc />
    public partial class SortOrderToIngredients : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "SortOrder",
                schema: "bartender",
                table: "RecipeIngredients",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "SortOrder",
                schema: "bartender",
                table: "RecipeIngredients");
        }
    }
}
