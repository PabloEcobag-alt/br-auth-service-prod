using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using internal_auth_service.Data;
using internal_auth_service.Interfaces.Repositories;
using internal_auth_service.Models;

namespace internal_auth_service.Repositories;

public class UserRepository : IUserRepository
{
    private readonly ApplicationDbContext _db;

    public UserRepository(ApplicationDbContext db)
    {
        _db = db;
    }

    public async Task<List<ApplicationUser>> GetAllAsync(bool includeDeleted = false)
    {
        IQueryable<ApplicationUser> query = _db.Users;
        if (!includeDeleted)
        {
            query = query.Where(u => !u.IsDeleted);
        }
        return await query.OrderBy(u => u.UserName).ToListAsync();
    }

    public async Task<ApplicationUser?> GetByIdAsync(string id)
    {
        return await _db.Users
            .Include(u => u.UserPermissions)
                .ThenInclude(up => up.AppModule)
                    .ThenInclude(am => am.SystemDefinition)
            .FirstOrDefaultAsync(u => u.Id == id && !u.IsDeleted);
    }

    public async Task<ApplicationUser?> GetByUsernameAsync(string username)
    {
        return await _db.Users
            .FirstOrDefaultAsync(u => u.UserName == username && !u.IsDeleted);
    }

    public async Task UpdateAsync(ApplicationUser user)
    {
        _db.Entry(user).State = EntityState.Modified;
        await Task.CompletedTask;
    }

    public async Task SaveChangesAsync()
    {
        await _db.SaveChangesAsync();
    }
}
