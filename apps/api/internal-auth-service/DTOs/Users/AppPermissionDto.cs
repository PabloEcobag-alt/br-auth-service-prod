using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace internal_auth_service.DTOs.Users;

public class AppPermissionDto
{
    [Required]
    public string AppName { get; set; } = string.Empty;

    public List<ModulePermissionDto> Modules { get; set; } = new();
}
