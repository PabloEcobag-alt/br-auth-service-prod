using System.Security.Claims;
using internal_auth_service.Models;

namespace internal_auth_service.Interfaces.Services;

public interface IAuthClaimsService
{
    Task<List<string>> GetUserSystemCodesAsync(ApplicationUser user);

    Task<ClaimsIdentity> BuildUserClaimsAsync(ApplicationUser user, IEnumerable<string> scopes);
}