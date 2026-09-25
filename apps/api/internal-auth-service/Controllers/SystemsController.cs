using Microsoft.AspNetCore.Mvc;
using internal_auth_service.Interfaces.Services;

namespace internal_auth_service.Controllers;

[ApiController]
[Route("api/systems")]
public class SystemsController : ControllerBase
{
    private readonly ISystemService _systemService;

    public SystemsController(ISystemService systemService)
    {
        _systemService = systemService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var systems = await _systemService.GetCatalogAsync();
        return Ok(systems);
    }
}