using internal_auth_service.DTOs;
using internal_auth_service.Models;

namespace internal_auth_service.Mappers;

public static class SystemMapper
{
    public static SystemDto ToDto(SystemDefinition entity)
    {
        return new SystemDto
        {
            Code = entity.Code,
            Name = entity.Name,
            Url = entity.Url,
            Icon = entity.Icon
        };
    }

    public static List<SystemDto> ToDtoList(IEnumerable<SystemDefinition> entities)
    {
        return entities.Select(ToDto).ToList();
    }
}