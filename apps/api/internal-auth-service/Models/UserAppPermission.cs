namespace internal_auth_service.Models;

public class UserAppPermission
{
    public int Id { get; set; }
    public string UserId { get; set; } = string.Empty;
    public int AppModuleId { get; set; }

    public bool CanRead { get; set; }
    public bool CanWrite { get; set; }
    public bool CanUpdate { get; set; }
    public bool CanDelete { get; set; }
    public bool CanApprove { get; set; }
    public bool CanExport { get; set; }

    public ApplicationUser User { get; set; } = null!;
    public AppModule AppModule { get; set; } = null!;
}
