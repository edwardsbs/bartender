using Bartender.Api.Services.Handlers.Inventory.Commands.EditInventory;
using Bartender.Api.Services.Handlers.Inventory.Queries.GetInventory;
using Bartender.Api.Services.Handlers.Models.Dtos;
using MediatR;
using Microsoft.AspNetCore.Mvc;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace Bartender.Api.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class InventoryController : ControllerBase
    {
        public IMediator _mediator { get; }

        public InventoryController(IMediator mediator)
        {
            _mediator = mediator;
        }

        // GET: api/<RecipeController>
        [HttpGet("inventory")]
        public async Task<ActionResult> GetAllInventoryItems()
        {
            return Ok(await _mediator.Send(new GetInventoryRequest()));
        }

        // GET api/<InventoryController>/5
        [HttpGet("{id}")]
        public string Get(int id)
        {
            return "value";
        }

        // POST api/<InventoryController>
        [HttpPost]
        public void Post([FromBody] string value)
        {
        }

        // PUT api/<InventoryController>/5
        [HttpPut("edit-inventory/{id}")]
        public async Task<ActionResult> Put(int id, [FromBody] UpsertInventoryDto dto)
        {
            return Ok(await _mediator.Send(new EditInventoryRequest(dto)));
        }

        // DELETE api/<InventoryController>/5
        [HttpDelete("{id}")]
        public void Delete(int id)
        {
        }
    }
}
