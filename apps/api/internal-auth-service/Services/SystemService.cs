using internal_auth_service.DTOs;
using internal_auth_service.Interfaces.Repositories;
using internal_auth_service.Interfaces.Services;
using internal_auth_service.Mappers;

namespace internal_auth_service.Services;

public class SystemService : ISystemService
{
    private readonly ISystemRepository _systemRepository;

    public SystemService(ISystemRepository systemRepository)
    {
        _systemRepository = systemRepository;
    }

    public async Task<List<SystemDto>> GetCatalogAsync()
    {
        var systems = await _systemRepository.GetAllAsync();
        return SystemMapper.ToDtoList(systems);
    }

    public async Task<List<SystemDto>> GetAccessibleSystemsAsync(IEnumerable<string> systemCodes)
    {
        var codes = systemCodes.ToList();

        if (codes.Count == 0)
        {
            return new List<SystemDto>();
        }

        var systems = await _systemRepository.GetByCodesAsync(codes);
        return SystemMapper.ToDtoList(systems);
    }
}