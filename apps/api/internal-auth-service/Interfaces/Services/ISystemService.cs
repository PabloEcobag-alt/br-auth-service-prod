using internal_auth_service.DTOs;

namespace internal_auth_service.Interfaces.Services;

public interface ISystemService
{
    Task<List<SystemDto>> GetCatalogAsync();

    Task<List<SystemDto>> GetAccessibleSystemsAsync(IEnumerable<string> systemCodes);
}