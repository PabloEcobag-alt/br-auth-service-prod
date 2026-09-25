using System.Collections.Generic;

namespace internal_auth_service.Models;

public class AppModule
{
    public int Id { get; set; }
    public int SystemDefinitionId { get; set; }
    public string Name { get; set; } = string.Empty;

    public SystemDefinition SystemDefinition { get; set; } = null!;
    public ICollection<UserAppPermission> UserPermissions { get; set; } = new List<UserAppPermission>();
}
