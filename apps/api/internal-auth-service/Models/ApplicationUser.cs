using Microsoft.AspNetCore.Identity;

namespace internal_auth_service.Models;

public class ApplicationUser : IdentityUser
{
    public string DisplayName { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public bool MustChangePassword { get; set; } = true;
    public bool IsDeleted { get; set; } = false;
    public DateTime? DeletedAt { get; set; }
    public int EmployeeNumber { get; set; }

    public ICollection<UserAppPermission> UserPermissions { get; set; } = new List<UserAppPermission>();
}