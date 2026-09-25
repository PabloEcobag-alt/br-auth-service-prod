using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace internal_auth_service.DTOs.Users;

public class CreateUserRequest
{
    [Required]
    public string FirstName { get; set; } = string.Empty;

    [Required]
    public string LastName { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string Role { get; set; } = string.Empty;

    public List<AppPermissionDto> Apps { get; set; } = new();
}
