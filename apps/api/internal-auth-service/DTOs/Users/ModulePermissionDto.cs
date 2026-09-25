using System.ComponentModel.DataAnnotations;

namespace internal_auth_service.DTOs.Users;

public class ModulePermissionDto
{
    [Required]
    public string ModuleName { get; set; } = string.Empty;

    public bool CanRead { get; set; }
    public bool CanWrite { get; set; }
    public bool CanUpdate { get; set; }
    public bool CanDelete { get; set; }
    public bool CanApprove { get; set; }
    public bool CanExport { get; set; }
}
