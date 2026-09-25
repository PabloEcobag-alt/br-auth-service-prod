using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using internal_auth_service.Data;
using internal_auth_service.Interfaces.Repositories;
using internal_auth_service.Models;

namespace internal_auth_service.Repositories;

public class AppModuleRepository : IAppModuleRepository
{
    private readonly ApplicationDbContext _db;

    public AppModuleRepository(ApplicationDbContext db)
    {
        _db = db;
    }

    public async Task<List<AppModule>> GetAllWithAppsAsync()
    {
        return await _db.AppModules
            .Include(am => am.SystemDefinition)
            .OrderBy(am => am.SystemDefinition.Code)
            .ThenBy(am => am.Name)
            .ToListAsync();
    }

    public async Task<List<AppModule>> GetByNamesAsync(IEnumerable<string> moduleNames)
    {
        var nameList = moduleNames.ToList();
        return await _db.AppModules
            .Include(am => am.SystemDefinition)
            .Where(am => nameList.Contains(am.Name))
            .ToListAsync();
    }
}
