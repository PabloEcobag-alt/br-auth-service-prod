using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using internal_auth_service.DTOs.Users;
using internal_auth_service.Interfaces.Services;

using OpenIddict.Validation.AspNetCore;

namespace internal_auth_service.Controllers;

[Authorize(AuthenticationSchemes = OpenIddictValidationAspNetCoreDefaults.AuthenticationScheme, Policy = "AdminOnly")]
[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly IUserManagementService _userManagementService;

    public UsersController(IUserManagementService userManagementService)
    {
        _userManagementService = userManagementService;
    }

    [HttpGet]
    public async Task<ActionResult<List<UserListItemDto>>> GetUsers([FromQuery] bool includeDeleted = false)
    {
        var users = await _userManagementService.ListUsersAsync(includeDeleted);
        return Ok(users);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<UserDetailDto>> GetUser(string id)
    {
        var user = await _userManagementService.GetUserByIdAsync(id);
        if (user == null)
        {
            return NotFound(new { message = $"User with ID {id} not found." });
        }
        return Ok(user);
    }

    [HttpPost]
    public async Task<ActionResult<UserDetailDto>> CreateUser([FromBody] CreateUserRequest request)
    {
        try
        {
            var user = await _userManagementService.CreateUserAsync(request);
            return CreatedAtAction(nameof(GetUser), new { id = user.Id }, user);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("internal")]
    [AllowAnonymous]
    public async Task<ActionResult<UserDetailDto>> CreateUserInternal([FromBody] CreateUserRequest request, [FromHeader(Name = "X-Internal-Token")] string token)
    {
        if (token != "HrAppInternalTokenSecret")
        {
            return Unauthorized(new { message = "Invalid internal token." });
        }
        
        try
        {
            var user = await _userManagementService.CreateUserAsync(request);
            return CreatedAtAction(nameof(GetUser), new { id = user.Id }, user);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<UserDetailDto>> UpdateUser(string id, [FromBody] UpdateUserRequest request)
    {
        try
        {
            var user = await _userManagementService.UpdateUserAsync(id, request);
            if (user == null)
            {
                return NotFound(new { message = $"User with ID {id} not found." });
            }
            return Ok(user);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteUser(string id)
    {
        var succeeded = await _userManagementService.SoftDeleteUserAsync(id);
        if (!succeeded)
        {
            return NotFound(new { message = $"User with ID {id} not found." });
        }
        return NoContent();
    }

    [HttpGet("~/api/roles")]
    public async Task<ActionResult<List<string>>> GetRoles()
    {
        var roles = await _userManagementService.ListRolesAsync();
        return Ok(roles);
    }

    [HttpGet("check-email")]
    public async Task<IActionResult> CheckEmail(
        [FromQuery] string email,
        [FromQuery] string? excludeUserId = null)
    {
        if (string.IsNullOrWhiteSpace(email))
        {
            return BadRequest(new { message = "Email is required." });
        }

        var exists = await _userManagementService.EmailExistsAsync(email, excludeUserId);
        return Ok(new { exists });
    }

    [HttpGet("~/api/apps")]
    public async Task<ActionResult<List<AppPermissionDto>>> GetApps()
    {
        var apps = await _userManagementService.ListAppsAndModulesAsync();
        return Ok(apps);
    }
}
