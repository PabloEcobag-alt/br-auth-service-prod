using System.Threading.Tasks;
using internal_auth_service.Models;

namespace internal_auth_service.Interfaces.Services;

public interface IAccessControlService
{
    Task<(bool isAllowed, string? requiredSystemCode)> CanAccessClientAsync(ApplicationUser user, string? clientId);
}
