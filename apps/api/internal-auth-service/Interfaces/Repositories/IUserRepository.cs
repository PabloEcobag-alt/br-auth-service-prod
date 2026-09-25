using System.Collections.Generic;
using System.Threading.Tasks;
using internal_auth_service.Models;

namespace internal_auth_service.Interfaces.Repositories;

public interface IUserRepository
{
    Task<List<ApplicationUser>> GetAllAsync(bool includeDeleted = false);
    Task<ApplicationUser?> GetByIdAsync(string id);
    Task<ApplicationUser?> GetByUsernameAsync(string username);
    Task UpdateAsync(ApplicationUser user);
    Task SaveChangesAsync();
}
