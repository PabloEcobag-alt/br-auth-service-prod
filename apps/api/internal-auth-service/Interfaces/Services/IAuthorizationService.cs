using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using internal_auth_service.Models;

namespace internal_auth_service.Interfaces.Services;

public interface IAuthorizationService
{
    Task<(bool Success, ApplicationUser? User, string? RedirectUrl, string? RequiredSystemCode)> ValidateAuthorizeRequestAsync(ClaimsPrincipal principal, string? clientId, string requestPathAndQuery);
    Task<ClaimsPrincipal> CreatePrincipalForUserAsync(ApplicationUser user, IEnumerable<string> scopes);
    Task<(bool IsValid, ApplicationUser? User, string? Error, string? ErrorDescription)> ValidateExchangeRequestAsync(ClaimsPrincipal principal);
    Task<object?> GetUserInfoAsync(ClaimsPrincipal principal);
}
