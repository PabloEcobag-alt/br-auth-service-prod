using System.Collections.Generic;
using System.Threading.Tasks;
using internal_auth_service.DTOs.Users;

namespace internal_auth_service.Interfaces.Services;

public interface IUserManagementService
{
    Task<List<UserListItemDto>> ListUsersAsync(bool includeDeleted = false);
    Task<UserDetailDto?> GetUserByIdAsync(string id);
    Task<UserDetailDto> CreateUserAsync(CreateUserRequest request);
    Task<UserDetailDto?> UpdateUserAsync(string id, UpdateUserRequest request);
    Task<bool> SoftDeleteUserAsync(string id);
    Task<List<string>> ListRolesAsync();
    Task<List<AppPermissionDto>> ListAppsAndModulesAsync();
    Task<bool> EmailExistsAsync(string email, string? excludeUserId = null);
}
