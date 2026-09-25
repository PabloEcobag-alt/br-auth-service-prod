using System.Security.Claims;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using OpenIddict.Abstractions;
using internal_auth_service.Data;
using internal_auth_service.Interfaces.Services;
using internal_auth_service.Models;

namespace internal_auth_service.Services;

public class AuthClaimsService : IAuthClaimsService
{
    private readonly ApplicationDbContext _db;
    private readonly UserManager<ApplicationUser> _userManager;

    public AuthClaimsService(ApplicationDbContext db, UserManager<ApplicationUser> userManager)
    {
        _db = db;
        _userManager = userManager;
    }

    public async Task<List<string>> GetUserSystemCodesAsync(ApplicationUser user)
    {
        return await _db.UserAppPermissions
            .AsNoTracking()
            .Where(uap => uap.UserId == user.Id && 
                          (uap.CanRead || uap.CanWrite || uap.CanUpdate || uap.CanDelete || uap.CanApprove || uap.CanExport))
            .Select(uap => uap.AppModule.SystemDefinition.Code)
            .Distinct()
            .ToListAsync();
    }

    public async Task<ClaimsIdentity> BuildUserClaimsAsync(ApplicationUser user, IEnumerable<string> scopes)
    {
        var identity = new ClaimsIdentity(
            authenticationType: "OpenIddict",
            nameType: OpenIddictConstants.Claims.Name,
            roleType: OpenIddictConstants.Claims.Role);

        identity.SetClaim(OpenIddictConstants.Claims.Subject, user.Id);
        identity.SetClaim(OpenIddictConstants.Claims.Name, user.DisplayName);
        identity.SetClaim(OpenIddictConstants.Claims.Email, user.Email);

        var roles = await _userManager.GetRolesAsync(user);
        var isSuperUser = roles.Contains("Super Admin") || roles.Contains("CEO");
        
        identity.SetClaim("isSuperUser", isSuperUser.ToString().ToLower());

        foreach (var role in roles)
        {
            identity.AddClaim(OpenIddictConstants.Claims.Role, role);
        }

        // Enforce permissions representation in token
        if (isSuperUser)
        {
            // Super admins and CEOs have access to all system codes
            var allSystems = await _db.SystemDefinitions.Select(sd => sd.Code).ToListAsync();
            identity.SetClaim("systems", string.Join(",", allSystems));
            identity.SetClaim("permissions", "{}");
        }
        else
        {
            var systemCodes = await GetUserSystemCodesAsync(user);
            identity.SetClaim("systems", string.Join(",", systemCodes));

            // Fetch fine-grained permissions
            var permissions = await _db.UserAppPermissions
                .AsNoTracking()
                .Where(uap => uap.UserId == user.Id)
                .Include(uap => uap.AppModule)
                    .ThenInclude(am => am.SystemDefinition)
                .ToListAsync();

            var permMap = new Dictionary<string, Dictionary<string, Dictionary<string, bool>>>();

            foreach (var perm in permissions)
            {
                var appCode = perm.AppModule.SystemDefinition.Code;
                var modName = perm.AppModule.Name;

                if (!permMap.ContainsKey(appCode))
                {
                    permMap[appCode] = new Dictionary<string, Dictionary<string, bool>>();
                }

                permMap[appCode][modName] = new Dictionary<string, bool>
                {
                    { "canRead", perm.CanRead },
                    { "canWrite", perm.CanWrite },
                    { "canUpdate", perm.CanUpdate },
                    { "canDelete", perm.CanDelete },
                    { "canApprove", perm.CanApprove },
                    { "canExport", perm.CanExport }
                };
            }

            var jsonPermissions = System.Text.Json.JsonSerializer.Serialize(permMap);
            identity.SetClaim("permissions", jsonPermissions);
        }

        identity.SetScopes(scopes);
        foreach (var claim in identity.Claims)
        {
            claim.SetDestinations(GetDestinations(claim, identity));
        }

        return identity;
    }

    private static IEnumerable<string> GetDestinations(Claim claim, ClaimsIdentity identity)
    {
        yield return OpenIddictConstants.Destinations.AccessToken;

        // The ID token must carry the identity claims a relying party reads to
        // establish "who is this user" — above all the Subject. Excluding `sub`
        // (and `email`) from the ID token left OIDC clients (e.g. NextAuth in
        // the CRMS app) without a stable subject, so they synthesised their own
        // per-login id — which then didn't match the real user id anywhere,
        // breaking cross-session ownership. Emit Subject and Email to the ID
        // token as well so `sub`/`email` are stable and correct downstream.
        if (claim.Type is OpenIddictConstants.Claims.Subject
            or OpenIddictConstants.Claims.Name
            or OpenIddictConstants.Claims.Email
            or OpenIddictConstants.Claims.Role
            or "systems"
            or "isSuperUser"
            or "permissions")
        {
            yield return OpenIddictConstants.Destinations.IdentityToken;
        }
    }
}