using System.Collections.Generic;

namespace internal_auth_service.DTOs.Users;

public class UserDetailDto
{
    public string Id { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public bool MustChangePassword { get; set; }
    public List<AppPermissionDto> Apps { get; set; } = new();
}
