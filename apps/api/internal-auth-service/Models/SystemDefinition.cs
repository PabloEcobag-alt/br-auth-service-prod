namespace internal_auth_service.Models;

public class SystemDefinition
{
    public int Id { get; set; }

    public string Code { get; set; } = string.Empty;

    public string Name { get; set; } = string.Empty;

    public string Url { get; set; } = string.Empty;

    public string Icon { get; set; } = string.Empty;

    public ICollection<AppModule> Modules { get; set; } = new List<AppModule>();
}