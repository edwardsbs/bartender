using Bartender.Api.Services.Handlers.Models.Dtos;
using Bartender.Api.Services.Handlers.Recipes.Commands.AddRecipe;
using Bartender.Api.Services.Handlers.Recipes.Commands.DeleteRecipe;
using Bartender.Api.Services.Handlers.Recipes.Commands.EditRecipe;
using Bartender.Api.Services.Handlers.Recipes.Queries.GetRecipeByGuid;
using Bartender.Api.Services.Handlers.Recipes.Queries.GetRecipes;
using MediatR;
using Microsoft.AspNetCore.Mvc;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace Bartender.Api.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class RecipeController : ControllerBase
    {
        public IMediator _mediator { get; }

        public RecipeController(IMediator mediator)
        {
            _mediator = mediator;
        }

        // GET: api/<RecipeController>
        [HttpGet("recipes")]
        public async Task<ActionResult> GetAllCocktails()
        {
            return Ok(await _mediator.Send(new GetRecipesRequest()));
        }

        // GET api/<RecipeController>/5
        [HttpGet("recipe/{id}")]
        public async Task<ActionResult> GetCocktailsByGuid(Guid id)
        {
            return Ok(await _mediator.Send(new GetRecipeByGuidRequest(id)));
        }

        // POST api/<RecipeController>
        [HttpPost("add-recipe")]
        public async Task<ActionResult> AddCocktailRecipe([FromBody] UpsertRecipeDto recipe)
        {
            return Ok(await _mediator.Send(new AddRecipeRequest(recipe)));
        }

        // PUT api/<RecipeController>/5
        [HttpPut("edit-recipe/{id}")]
        public async Task<ActionResult> EditCocktailRecipe(Guid id, [FromBody] UpsertRecipeDto dto)
        {
            return Ok(await _mediator.Send(new EditRecipeRequest(id, dto)));
        }

        // DELETE api/<RecipeController>/5
        [HttpDelete("delete-recipe/{id}")]
        public async Task<ActionResult> RemoveRecipe(Guid id)
        {
            return Ok(await _mediator.Send(new DeleteRecipeRequest(id)));
        }
    }
}
