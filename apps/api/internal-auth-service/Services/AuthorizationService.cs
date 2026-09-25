using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;
using OpenIddict.Abstractions;
using internal_auth_service.Interfaces.Services;
using internal_auth_service.Models;

namespace internal_auth_service.Services;

public class AuthorizationService : IAuthorizationService
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IAuthClaimsService _authClaimsService;
    private readonly IAccessControlService _accessControlService;

    public AuthorizationService(
        UserManager<ApplicationUser> userManager,
        IAuthClaimsService authClaimsService,
        IAccessControlService accessControlService)
    {
        _userManager = userManager;
        _authClaimsService = authClaimsService;
        _accessControlService = accessControlService;
    }

    public async Task<(bool Success, ApplicationUser? User, string? RedirectUrl, string? RequiredSystemCode)> ValidateAuthorizeRequestAsync(
        ClaimsPrincipal principal, string? clientId, string requestPathAndQuery)
    {
        var user = await _userManager.GetUserAsync(principal);
        if (user == null)
        {
            // The cookie is authenticated but its user no longer exists (e.g.
            // the account was deleted or merged during de-duplication). Don't
            // throw a 500 — signal "no user" so the caller can clear the stale
            // cookie and send the visitor back to log in, mirroring how
            // ValidateExchangeRequestAsync already handles a vanished user.
            return (false, null, null, null);
        }

        if (user.MustChangePassword)
        {
            var changePasswordUrl = $"/Account/ChangePassword?returnUrl={Uri.EscapeDataString(requestPathAndQuery)}";
            return (false, user, changePasswordUrl, null);
        }

        var (isAllowed, requiredSystemCode) = await _accessControlService.CanAccessClientAsync(user, clientId);
        if (!isAllowed)
        {
            return (false, user, null, requiredSystemCode);
        }

        return (true, user, null, null);
    }

    public async Task<ClaimsPrincipal> CreatePrincipalForUserAsync(ApplicationUser user, IEnumerable<string> scopes)
    {
        var identity = await _authClaimsService.BuildUserClaimsAsync(user, scopes);
        return new ClaimsPrincipal(identity);
    }

    public async Task<(bool IsValid, ApplicationUser? User, string? Error, string? ErrorDescription)> ValidateExchangeRequestAsync(ClaimsPrincipal principal)
    {
        var userId = principal.GetClaim(OpenIddictConstants.Claims.Subject);
        var user = userId is not null ? await _userManager.FindByIdAsync(userId) : null;
        if (user == null)
        {
            return (false, null, OpenIddictConstants.Errors.InvalidGrant, "The user no longer exists.");
        }

        return (true, user, null, null);
    }

    public async Task<object?> GetUserInfoAsync(ClaimsPrincipal principal)
    {
        var user = await _userManager.GetUserAsync(principal);
        if (user == null)
        {
            return null;
        }

        var roles = await _userManager.GetRolesAsync(user);
        var systemCodes = await _authClaimsService.GetUserSystemCodesAsync(user);

        return new
        {
            sub = user.Id,
            name = user.DisplayName,
            email = user.Email,
            systems = string.Join(",", systemCodes),
            role = System.Linq.Enumerable.ToArray(roles)
        };
    }
}
