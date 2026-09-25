using System.Collections.Generic;
using System.Linq;
using internal_auth_service.DTOs.Users;
using internal_auth_service.Models;

namespace internal_auth_service.Mappers;

public static class UserMapper
{
    public static UserListItemDto ToListItemDto(ApplicationUser user, string role)
    {
        return new UserListItemDto
        {
            Id = user.Id,
            Username = user.UserName ?? string.Empty,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Email = user.Email ?? string.Empty,
            Role = role,
            MustChangePassword = user.MustChangePassword,
            IsDeleted = user.IsDeleted
        };
    }

    public static UserDetailDto ToDetailDto(ApplicationUser user, string role)
    {
        var appPerms = new Dictionary<string, AppPermissionDto>();

        foreach (var up in user.UserPermissions.Where(x => x.AppModule?.SystemDefinition != null))
        {
            var appName = up.AppModule.SystemDefinition.Code;
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
                ModuleName = up.AppModule.Name,
                CanRead = up.CanRead,
                CanWrite = up.CanWrite,
                CanUpdate = up.CanUpdate,
                CanDelete = up.CanDelete,
                CanApprove = up.CanApprove,
                CanExport = up.CanExport
            });
        }

        return new UserDetailDto
        {
            Id = user.Id,
            Username = user.UserName ?? string.Empty,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Email = user.Email ?? string.Empty,
            Role = role,
            MustChangePassword = user.MustChangePassword,
            Apps = appPerms.Values.ToList()
        };
    }
}
