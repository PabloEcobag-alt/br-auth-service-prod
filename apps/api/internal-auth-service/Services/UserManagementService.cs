using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using internal_auth_service.Data;
using internal_auth_service.DTOs.Users;
using internal_auth_service.Interfaces.Repositories;
using internal_auth_service.Interfaces.Services;
using internal_auth_service.Mappers;
using internal_auth_service.Models;

namespace internal_auth_service.Services;

public class UserManagementService : IUserManagementService
{
    private readonly ApplicationDbContext _db;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly RoleManager<IdentityRole> _roleManager;
    private readonly IUserRepository _userRepository;
    private readonly IAppModuleRepository _appModuleRepository;
    private readonly IEmailService _emailService;

    public UserManagementService(
        ApplicationDbContext db,
        UserManager<ApplicationUser> userManager,
        RoleManager<IdentityRole> roleManager,
        IUserRepository userRepository,
        IAppModuleRepository appModuleRepository,
        IEmailService emailService)
    {
        _db = db;
        _userManager = userManager;
        _roleManager = roleManager;
        _userRepository = userRepository;
        _appModuleRepository = appModuleRepository;
        _emailService = emailService;
    }

    public async Task<List<UserListItemDto>> ListUsersAsync(bool includeDeleted = false)
    {
        var users = await _userRepository.GetAllAsync(includeDeleted);
        var list = new List<UserListItemDto>();

        foreach (var user in users)
        {
            var roles = await _userManager.GetRolesAsync(user);
            var roleName = roles.FirstOrDefault() ?? "Staff/Employee";
            list.Add(UserMapper.ToListItemDto(user, roleName));
        }

        return list;
    }

    public async Task<UserDetailDto?> GetUserByIdAsync(string id)
    {
        var user = await _userRepository.GetByIdAsync(id);
        if (user == null) return null;

        var roles = await _userManager.GetRolesAsync(user);
        var roleName = roles.FirstOrDefault() ?? "Staff/Employee";

        return UserMapper.ToDetailDto(user, roleName);
    }

    public async Task<UserDetailDto> CreateUserAsync(CreateUserRequest request)
    {
        // 0. Reject a duplicate email up front. One account per person keeps
        // ApplicationUser.Id stable across re-provisioning, which downstream
        // systems (e.g. CRMS ticket ownership) rely on via the OIDC `sub`.
        // RequireUniqueEmail also enforces this at the Identity layer, but a
        // check here yields a clear domain error instead of a validation dump.
        var normalizedEmail = (request.Email ?? string.Empty).Trim();
        if (!string.IsNullOrEmpty(normalizedEmail))
        {
            var existing = await _userManager.FindByEmailAsync(normalizedEmail);
            if (existing != null)
            {
                throw new Exception($"A user with the email '{normalizedEmail}' already exists.");
            }
        }

        // 1. Generate Username in YYYY-II-NNN format
        var year = DateTime.UtcNow.Year;
        var initials = $"{GetInitial(request.FirstName)}{GetInitial(request.LastName)}";
        var nextNumber = await _db.Users.CountAsync() + 1;

        string username;
        do
        {
            username = $"{year}-{initials}-{nextNumber:D3}";
            nextNumber++;
        } while (await _db.Users.AnyAsync(u => u.UserName == username));

        var parsedNumber = int.Parse(username.Split('-')[2]);

        // 2. Generate Temporary Password
        var tempPassword = internal_auth_service.Helpers.PasswordHelper.GenerateTempPassword();

        var user = new ApplicationUser
        {
            UserName = username,
            Email = normalizedEmail,
            FirstName = request.FirstName,
            LastName = request.LastName,
            DisplayName = $"{request.FirstName} {request.LastName}",
            MustChangePassword = true,
            EmployeeNumber = parsedNumber
        };

        // Create User
        var result = await _userManager.CreateAsync(user, tempPassword);
        if (!result.Succeeded)
        {
            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            throw new Exception($"Failed to create user: {errors}");
        }

        // Add Role
        if (!string.IsNullOrEmpty(request.Role))
        {
            var roleToAssign = request.Role == "Super Admin" ? "Staff/Employee" : request.Role;
            if (await _roleManager.RoleExistsAsync(roleToAssign))
            {
                await _userManager.AddToRoleAsync(user, roleToAssign);
            }
            else
            {
                await _userManager.AddToRoleAsync(user, "Staff/Employee");
            }
        }

        // Save Permissions
        await SavePermissionsAsync(user.Id, request.Apps);

        // Send Email
        await _emailService.SendCredentialsAsync(normalizedEmail, user.DisplayName, username, tempPassword);

        // Reload user to get permissions populated
        var createdUser = await _userRepository.GetByIdAsync(user.Id) ?? user;
        var finalRoles = await _userManager.GetRolesAsync(createdUser);
        return UserMapper.ToDetailDto(createdUser, finalRoles.FirstOrDefault() ?? request.Role);
    }

    public async Task<UserDetailDto?> UpdateUserAsync(string id, UpdateUserRequest request)
    {
        var user = await _db.Users
            .Include(u => u.UserPermissions)
            .FirstOrDefaultAsync(u => u.Id == id && !u.IsDeleted);

        if (user == null) return null;

        user.FirstName = request.FirstName;
        user.LastName = request.LastName;
        user.DisplayName = $"{request.FirstName} {request.LastName}";
        user.Email = request.Email;
        user.UserName = user.UserName; // Preserve username

        var updateResult = await _userManager.UpdateAsync(user);
        if (!updateResult.Succeeded)
        {
            var errors = string.Join(", ", updateResult.Errors.Select(e => e.Description));
            throw new Exception($"Failed to update user: {errors}");
        }

        // Update Role
        var currentRoles = await _userManager.GetRolesAsync(user);
        var roleToAssign = request.Role;
        if (currentRoles.Contains("Super Admin"))
        {
            roleToAssign = "Super Admin";
        }
        else if (roleToAssign == "Super Admin")
        {
            roleToAssign = "Staff/Employee";
        }

        if (currentRoles.Count > 0)
        {
            await _userManager.RemoveFromRolesAsync(user, currentRoles);
        }
        if (!string.IsNullOrEmpty(roleToAssign) && await _roleManager.RoleExistsAsync(roleToAssign))
        {
            await _userManager.AddToRoleAsync(user, roleToAssign);
        }

        // Update Permissions: Clear old and insert new
        var existingPerms = _db.UserAppPermissions.Where(p => p.UserId == user.Id);
        _db.UserAppPermissions.RemoveRange(existingPerms);
        await _db.SaveChangesAsync();

        await SavePermissionsAsync(user.Id, request.Apps);

        var updatedUser = await _userRepository.GetByIdAsync(user.Id);
        if (updatedUser == null) return null;

        var roles = await _userManager.GetRolesAsync(updatedUser);
        return UserMapper.ToDetailDto(updatedUser, roles.FirstOrDefault() ?? request.Role);
    }

    public async Task<bool> SoftDeleteUserAsync(string id)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == id && !u.IsDeleted);
        if (user == null) return false;

        user.IsDeleted = true;
        user.DeletedAt = DateTime.UtcNow;
        
        await _userManager.UpdateAsync(user);
        return true;
    }

    public async Task<List<string>> ListRolesAsync()
    {
        return await _roleManager.Roles
            .Where(r => r.Name != "Super Admin")
            .Select(r => r.Name ?? string.Empty)
            .ToListAsync();
    }

    public async Task<List<AppPermissionDto>> ListAppsAndModulesAsync()
    {
        var modules = await _appModuleRepository.GetAllWithAppsAsync();
        var appPerms = new Dictionary<string, AppPermissionDto>();

        foreach (var m in modules)
        {
            var appName = m.SystemDefinition.Code;
            if (!appPerms.TryGetValue(appName, out var appPermDto))
            {
                appPermDto = new AppPermissionDto
                {
                    AppName = appName,
                    Modules = new List<ModulePermissionDto>()
                };
                appPerms[appName] = appPermDto;
            }

            appPermDto.Modules.Add(new ModulePermissionDto
            {
                ModuleName = m.Name,
                CanRead = false,
                CanWrite = false,
                CanUpdate = false,
                CanDelete = false,
                CanApprove = false,
                CanExport = false
            });
        }

        return appPerms.Values.ToList();
    }

    private async Task SavePermissionsAsync(string userId, List<AppPermissionDto> apps)
    {
        if (apps == null || apps.Count == 0) return;

        var allModules = await _appModuleRepository.GetAllWithAppsAsync();

        foreach (var appDto in apps)
        {
            foreach (var modDto in appDto.Modules)
            {
                // Find corresponding AppModule entity
                var appModule = allModules.FirstOrDefault(m => 
                    m.SystemDefinition.Code.Equals(appDto.AppName, StringComparison.OrdinalIgnoreCase) && 
                    m.Name.Equals(modDto.ModuleName, StringComparison.OrdinalIgnoreCase));

                if (appModule == null) continue;

                var perm = new UserAppPermission
                {
                    UserId = userId,
                    AppModuleId = appModule.Id,
                    CanRead = modDto.CanRead,
                    CanWrite = modDto.CanWrite,
                    CanUpdate = modDto.CanUpdate,
                    CanDelete = modDto.CanDelete,
                    CanApprove = modDto.CanApprove,
                    CanExport = modDto.CanExport
                };

                _db.UserAppPermissions.Add(perm);
            }
        }

        await _db.SaveChangesAsync();
    }

    private static char GetInitial(string name)
    {
        return name.Trim().FirstOrDefault(char.IsLetter) is char c ? char.ToUpper(c) : 'X';
    }

    public async Task<bool> EmailExistsAsync(string email, string? excludeUserId = null)
    {
        return await _db.Users.AnyAsync(u =>
            u.Email == email &&
            !u.IsDeleted &&
            (excludeUserId == null || u.Id != excludeUserId));
    }
}
