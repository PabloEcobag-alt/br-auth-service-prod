using internal_auth_service.Models;

namespace internal_auth_service.Interfaces.Repositories;

public interface ISystemRepository
{
    Task<List<SystemDefinition>> GetAllAsync();
    Task<SystemDefinition?> GetByCodeAsync(string code);
    Task<List<SystemDefinition>> GetByCodesAsync(IEnumerable<string> codes);
}