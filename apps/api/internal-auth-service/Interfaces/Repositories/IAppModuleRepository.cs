using System.Collections.Generic;
using System.Threading.Tasks;
using internal_auth_service.Models;

namespace internal_auth_service.Interfaces.Repositories;

public interface IAppModuleRepository
{
    Task<List<AppModule>> GetAllWithAppsAsync();
    Task<List<AppModule>> GetByNamesAsync(IEnumerable<string> moduleNames);
}
