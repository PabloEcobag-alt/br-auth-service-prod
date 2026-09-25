using Microsoft.EntityFrameworkCore;
using internal_auth_service.Data;
using internal_auth_service.Interfaces.Repositories;
using internal_auth_service.Models;

namespace internal_auth_service.Repositories;

public class SystemRepository : ISystemRepository
{
    private readonly ApplicationDbContext _db;

    public SystemRepository(ApplicationDbContext db)
    {
        _db = db;
    }

    public async Task<List<SystemDefinition>> GetAllAsync()
    {
        return await _db.SystemDefinitions
            .AsNoTracking()
            .OrderBy(s => s.Name)
            .ToListAsync();
    }

    public async Task<SystemDefinition?> GetByCodeAsync(string code)
    {
        return await _db.SystemDefinitions
            .AsNoTracking()
            .FirstOrDefaultAsync(s => s.Code == code);
    }

    public async Task<List<SystemDefinition>> GetByCodesAsync(IEnumerable<string> codes)
    {
        var codeList = codes.ToList();
        return await _db.SystemDefinitions
            .AsNoTracking()
            .Where(s => codeList.Contains(s.Code))
            .ToListAsync();
    }
}