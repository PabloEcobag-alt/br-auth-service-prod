using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using OpenIddict.Abstractions;
using internal_auth_service.Data;
using internal_auth_service.Interfaces.Repositories;
using internal_auth_service.Interfaces.Services;
using internal_auth_service.Models;
using internal_auth_service.Repositories;
using internal_auth_service.Seeders;
using internal_auth_service.Services;
using Scalar.AspNetCore;

using System.IO;

var envPath = Path.Combine(Directory.GetCurrentDirectory(), ".env");
if (File.Exists(envPath))
{
    foreach (var line in File.ReadAllLines(envPath))
    {
        if (string.IsNullOrWhiteSpace(line) || line.StartsWith("#")) continue;
        var parts = line.Split('=', 2);
        if (parts.Length == 2)
        {
            Environment.SetEnvironmentVariable(parts[0].Trim(), parts[1].Trim());
        }
    }
}

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<ApplicationDbContext>(options =>
{
    options.UseNpgsql(builder.Configuration.GetConnectionString("Default"));
    options.UseOpenIddict();
});

builder.Services
    .AddIdentity<ApplicationUser, IdentityRole>(options =>
    {
        options.Password.RequireNonAlphanumeric = false;
        options.Password.RequireUppercase = true;
        options.Password.RequiredLength = 8;

        // One account per email. Without this, the same person could be
        // provisioned repeatedly, each time minting a new ApplicationUser.Id.
        // Downstream systems (e.g. CRMS ticket ownership) key on that id via the
        // OIDC `sub`, so a churning id silently breaks "my" tickets across a
        // re-login. Enforcing a unique email keeps the id stable per person.
        options.User.RequireUniqueEmail = true;
    })
    .AddEntityFrameworkStores<ApplicationDbContext>()
    .AddDefaultTokenProviders();

builder.Services.AddScoped<ISystemRepository, SystemRepository>();
builder.Services.AddScoped<ISystemService, SystemService>();
builder.Services.AddScoped<IAuthClaimsService, AuthClaimsService>();
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IAppModuleRepository, AppModuleRepository>();
builder.Services.AddScoped<IUserManagementService, UserManagementService>();
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<IAccountService, AccountService>();
builder.Services.AddScoped<IAccessControlService, AccessControlService>();
builder.Services.AddScoped<IAuthorizationService, AuthorizationService>();

builder.Services.AddOpenIddict()
    .AddCore(options =>
    {
        options.UseEntityFrameworkCore()
               .UseDbContext<ApplicationDbContext>();
    })
    .AddServer(options =>
    {
        options.SetAuthorizationEndpointUris("/connect/authorize")
               .SetTokenEndpointUris("/connect/token")
               .SetUserInfoEndpointUris("/connect/userinfo")
               .SetEndSessionEndpointUris("/connect/logout");

        options.AllowAuthorizationCodeFlow()
               .RequireProofKeyForCodeExchange();

        options.AllowRefreshTokenFlow();

        options.RegisterScopes(
            OpenIddictConstants.Scopes.OpenId,
            OpenIddictConstants.Scopes.Email,
            OpenIddictConstants.Scopes.Profile,
            OpenIddictConstants.Scopes.Roles,
            "systems");

        if (builder.Environment.IsDevelopment())
        {
            options.AddDevelopmentEncryptionCertificate()
                   .AddDevelopmentSigningCertificate();
        }
        else
        {
            options.AddEphemeralEncryptionKey()
                   .AddEphemeralSigningKey();
        }
        
        options.DisableAccessTokenEncryption();

        options.UseAspNetCore()
               .EnableAuthorizationEndpointPassthrough()
               .EnableTokenEndpointPassthrough()
               .EnableUserInfoEndpointPassthrough()
               .EnableEndSessionEndpointPassthrough()
               .EnableStatusCodePagesIntegration();
    })
    .AddValidation(options =>
    {
        options.UseLocalServer();
        options.UseAspNetCore();
    });

builder.Services.AddCors(options =>
{
    options.AddPolicy("ClientApps", policy =>
    {
        var portalOrigin = (Environment.GetEnvironmentVariable("PORTAL_URL") ?? "https://localhost:3000").TrimEnd('/');
        var hrmsOrigin = (Environment.GetEnvironmentVariable("HRMS_URL") ?? "https://localhost:3001").TrimEnd('/');
        var posOrigin = (Environment.GetEnvironmentVariable("POS_URL") ?? "https://localhost:3002").TrimEnd('/');
        var scmsOrigin = (Environment.GetEnvironmentVariable("SCMS_URL") ?? "https://localhost:3003").TrimEnd('/');
        var oosOrigin = (Environment.GetEnvironmentVariable("OOS_URL") ?? "https://localhost:3004").TrimEnd('/');
        var crmsOrigin = (Environment.GetEnvironmentVariable("CRMS_URL") ?? "https://localhost:3005").TrimEnd('/');

        policy.SetIsOriginAllowed(origin => 
                origin == portalOrigin || 
                origin == hrmsOrigin || 
                origin == posOrigin || 
                origin == scmsOrigin || 
                origin == oosOrigin || 
                origin == crmsOrigin || 
                origin.EndsWith(".vercel.app"))
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

builder.Services.AddControllers();
builder.Services.AddOpenApi();

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("AdminOnly", policy =>
        policy.RequireClaim("isSuperUser", "true"));
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
}

var forwardedHeadersOptions = new ForwardedHeadersOptions
{
    ForwardedHeaders = Microsoft.AspNetCore.HttpOverrides.ForwardedHeaders.XForwardedFor | Microsoft.AspNetCore.HttpOverrides.ForwardedHeaders.XForwardedProto | Microsoft.AspNetCore.HttpOverrides.ForwardedHeaders.XForwardedHost
};
forwardedHeadersOptions.KnownNetworks.Clear();
forwardedHeadersOptions.KnownProxies.Clear();
app.UseForwardedHeaders(forwardedHeadersOptions);

app.UseHttpsRedirection();

app.UseStaticFiles();
app.UseCors("ClientApps");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.MapGet("/", () => "br-auth-service is running!");

using (var scope = app.Services.CreateScope())
{
    await DbSeeder.SeedAsync(scope.ServiceProvider);
}

app.Run();