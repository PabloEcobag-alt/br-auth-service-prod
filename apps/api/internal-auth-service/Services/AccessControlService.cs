using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;
using internal_auth_service.Models;
using internal_auth_service.Interfaces.Services;
using internal_auth_service.Helpers;

namespace internal_auth_service.Services;

public class AccessControlService : IAccessControlService
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IAuthClaimsService _authClaimsService;

    public AccessControlService(
        UserManager<ApplicationUser> userManager,
        IAuthClaimsService authClaimsService)
    {
        _userManager = userManager;
        _authClaimsService = authClaimsService;
    }

    public async Task<(bool isAllowed, string? requiredSystemCode)> CanAccessClientAsync(ApplicationUser user, string? clientId)
    {
        if (string.IsNullOrEmpty(clientId) || string.Equals(clientId, "portal-client", StringComparison.OrdinalIgnoreCase))
        {
            return (true, null);
        }

        var allowedClients = ClientUrlHelper.GetClientSystemCodes();
        if (!allowedClients.TryGetValue(clientId, out var requiredSystemCode))
        {
            // If it's an unknown client that isn't portal, allow it by default or reject it?
            // The original logic just bypassed the block if TryGetValue was false.
            // So we return true.
            return (true, null);
        }

        var roles = await _userManager.GetRolesAsync(user);
        var isSuperUser = roles.Contains("Super Admin") || roles.Contains("CEO");
        
        if (isSuperUser)
        {
            return (true, requiredSystemCode);
        }

        var systemCodes = await _authClaimsService.GetUserSystemCodesAsync(user);
        if (!systemCodes.Contains(requiredSystemCode))
        {
            return (false, requiredSystemCode);
        }

        return (true, requiredSystemCode);
    }
}
