using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using OpenIddict.Abstractions;
using internal_auth_service.Data;
using internal_auth_service.Models;

namespace internal_auth_service.Seeders;

public static class DbSeeder
{
    public static async Task SeedAsync(IServiceProvider services)
    {
        var db = services.GetRequiredService<ApplicationDbContext>();
        await db.Database.MigrateAsync();

        await SeedSystemsAsync(db);
        await SeedUsersAsync(services, db);
        await SeedOpenIddictAppsAsync(services);
    }

    private static async Task SeedSystemsAsync(ApplicationDbContext db)
    {
        if (!await db.SystemDefinitions.AnyAsync())
        {
            db.SystemDefinitions.AddRange(
                new SystemDefinition { Code = "HRMS", Name = "HR Management", Url = "https://localhost:3001", Icon = "users" },
                new SystemDefinition { Code = "POS", Name = "Point of Sale", Url = "https://localhost:3002", Icon = "shopping-cart" },
                new SystemDefinition { Code = "SCMS", Name = "Supply Chain", Url = "https://localhost:3003", Icon = "truck" },
                new SystemDefinition { Code = "OOS", Name = "Order & Ops", Url = "https://localhost:3004", Icon = "clipboard" },
                new SystemDefinition { Code = "CRMS", Name = "Customer Relations", Url = "https://localhost:3005", Icon = "phone" }
            );

            await db.SaveChangesAsync();
        }

        if (!await db.AppModules.AnyAsync())
        {
            var apps = await db.SystemDefinitions.ToListAsync();
            var modules = new List<AppModule>();

            var appModulesMap = new Dictionary<string, string[]>
            {
                ["CRMS"] = new[] { "Dashboard", "Customer Profiles", "Campaigns", "Conversations", "Tickets", "Ecommerce", "Automation" },
                ["HRMS"] = new[] { "Dashboard", "Recruitment and Hiring", "Employee Information", "Payroll & ESS", "Attendance Biometrics", "User Management" },
                ["POS"] = new[] { "Dashboard", "Sales Processing", "Order Management", "Product Management/Price Configuration", "Sales Report Analytics", "Location/Branch Management", "Stock Management" },
                ["SCMS"] = new[] { "Dashboard", "Resources & Suppliers", "Orders & Procurement", "Inventory Module", "Production and Quality", "Distribution" },
                ["OOS"] = new[] { "Dashboard", "Order Processing & Fulfillments", "Customers" }
            };

            foreach (var app in apps)
            {
                if (appModulesMap.TryGetValue(app.Code, out var modNames))
                {
                    foreach (var name in modNames)
                    {
                        modules.Add(new AppModule
                        {
                            SystemDefinitionId = app.Id,
                            Name = name
                        });
                    }
                }
            }

            db.AppModules.AddRange(modules);
            await db.SaveChangesAsync();
        }
    }

    private static async Task SeedUsersAsync(IServiceProvider services, ApplicationDbContext db)
    {
        var userManager = services.GetRequiredService<UserManager<ApplicationUser>>();
        var roleManager = services.GetRequiredService<RoleManager<IdentityRole>>();

        var rolesToSeed = new[]
        {
            "Super Admin",
            "CEO",
            "VP",
            "Marketing Manager",
            "Support Assistant",
            "Inventory Manager",
            "Head Cook/Chef",
            "Quality Assurance",
            "Staff/Employee"
        };

        foreach (var roleName in rolesToSeed)
        {
            if (!await roleManager.RoleExistsAsync(roleName))
            {
                await roleManager.CreateAsync(new IdentityRole(roleName));
            }
        }

        // Alice: admin (Super Admin), full access
        var alice = await userManager.FindByEmailAsync("alice@example.com");
        if (alice is null)
        {
            alice = new ApplicationUser
            {
                UserName = "2026-AS-001",
                Email = "alice@example.com",
                DisplayName = "Alice SuperAdmin",
                FirstName = "Alice",
                LastName = "SuperAdmin",
                EmailConfirmed = true,
                MustChangePassword = false,
                EmployeeNumber = 1
            };
            await userManager.CreateAsync(alice, "Passw0rd!123");
        }

        if (!await userManager.IsInRoleAsync(alice, "Super Admin"))
        {
            await userManager.AddToRoleAsync(alice, "Super Admin");
        }

        // Bob: User (Staff/Employee)
        var bob = await userManager.FindByEmailAsync("bob@example.com");
        if (bob is null)
        {
            bob = new ApplicationUser
            {
                UserName = "2026-BE-002",
                Email = "bob@example.com",
                DisplayName = "Bob Employee",
                FirstName = "Bob",
                LastName = "Employee",
                EmailConfirmed = true,
                MustChangePassword = false,
                EmployeeNumber = 2
            };
            await userManager.CreateAsync(bob, "Passw0rd!123");
        }

        if (!await userManager.IsInRoleAsync(bob, "Staff/Employee"))
        {
            await userManager.AddToRoleAsync(bob, "Staff/Employee");
        }

        // Grant Bob read access to POS Dashboard and CRMS Dashboard if they are not already set
        if (!await db.UserAppPermissions.AnyAsync(uap => uap.UserId == bob.Id))
        {
            var posDashboard = await db.AppModules
                .Include(m => m.SystemDefinition)
                .FirstOrDefaultAsync(m => m.SystemDefinition.Code == "POS" && m.Name == "Dashboard");
            if (posDashboard != null)
            {
                db.UserAppPermissions.Add(new UserAppPermission
                {
                    UserId = bob.Id,
                    AppModuleId = posDashboard.Id,
                    CanRead = true
                });
            }

            var crmsDashboard = await db.AppModules
                .Include(m => m.SystemDefinition)
                .FirstOrDefaultAsync(m => m.SystemDefinition.Code == "CRMS" && m.Name == "Dashboard");
            if (crmsDashboard != null)
            {
                db.UserAppPermissions.Add(new UserAppPermission
                {
                    UserId = bob.Id,
                    AppModuleId = crmsDashboard.Id,
                    CanRead = true
                });
            }

            await db.SaveChangesAsync();
        }

        // Carol: second Super Admin
        var carol = await userManager.FindByEmailAsync("carol@example.com");
        if (carol is null)
        {
            carol = new ApplicationUser
            {
                UserName = "2026-CS-003",
                Email = "carol@example.com",
                DisplayName = "Carol SuperAdmin",
                FirstName = "Carol",
                LastName = "SuperAdmin",
                EmailConfirmed = true,
                MustChangePassword = false,
                EmployeeNumber = 3
            };
            await userManager.CreateAsync(carol, "Passw0rd!123");
        }
        if (!await userManager.IsInRoleAsync(carol, "Super Admin"))
        {
            await userManager.AddToRoleAsync(carol, "Super Admin");
        }

        // Derek: CEO
        var derek = await userManager.FindByEmailAsync("derek@example.com");
        if (derek is null)
        {
            derek = new ApplicationUser
            {
                UserName = "2026-DE-004",
                Email = "derek@example.com",
                DisplayName = "Derek Executive",
                FirstName = "Derek",
                LastName = "Executive",
                EmailConfirmed = true,
                MustChangePassword = false,
                EmployeeNumber = 4
            };
            await userManager.CreateAsync(derek, "Passw0rd!123");
        }
        if (!await userManager.IsInRoleAsync(derek, "CEO"))
        {
            await userManager.AddToRoleAsync(derek, "CEO");
        }
    }


    private static async Task SeedOpenIddictAppsAsync(IServiceProvider services)
    {
        var appManager = services.GetRequiredService<IOpenIddictApplicationManager>();

        var clients = new[]
        {
            ("portal-client", "portal-secret", "https://localhost:3000/api/auth/callback/authservice", "https://localhost:3000/"),
            ("hrms-client", "hrms-secret", "https://localhost:3001/api/auth/callback/authservice", "https://localhost:3001/"),
            ("pos-client", "pos-secret", "https://localhost:3002/api/auth/callback/authservice", "https://localhost:3002/"),
            ("scms-client", "scms-secret", "https://localhost:3003/api/auth/callback/authservice", "https://localhost:3003/"),
            ("oos-client", "oos-secret", "https://localhost:3004/api/auth/callback/authservice", "https://localhost:3004/"),
            ("crms-client", "crms-secret", "https://localhost:3005/api/auth/callback/authservice", "https://localhost:3005/")
        };

        foreach (var (clientId, clientSecret, redirectUri, postLogoutUri) in clients)
        {
            if (await appManager.FindByClientIdAsync(clientId) is not null)
            {
                continue;
            }

            var descriptor = new OpenIddictApplicationDescriptor
            {
                ClientId = clientId,
                ClientSecret = clientSecret,
                DisplayName = clientId,
                RedirectUris = { new Uri(redirectUri) },
                PostLogoutRedirectUris = { new Uri(postLogoutUri) },
                Permissions =
                {
                    OpenIddictConstants.Permissions.Endpoints.Authorization,
                    OpenIddictConstants.Permissions.Endpoints.Token,
                    OpenIddictConstants.Permissions.Endpoints.EndSession,
                    OpenIddictConstants.Permissions.GrantTypes.AuthorizationCode,
                    OpenIddictConstants.Permissions.GrantTypes.RefreshToken,
                    OpenIddictConstants.Permissions.ResponseTypes.Code,
                    OpenIddictConstants.Permissions.Scopes.Email,
                    OpenIddictConstants.Permissions.Scopes.Profile,
                    OpenIddictConstants.Permissions.Scopes.Roles,
                    OpenIddictConstants.Permissions.Prefixes.Scope + "systems"
                },
                Requirements =
                {
                    OpenIddictConstants.Requirements.Features.ProofKeyForCodeExchange
                }
            };

            if (clientId == "hrms-client")
            {
                descriptor.RedirectUris.Add(new Uri("https://deploy-web-hrms.vercel.app/api/auth/callback/authservice"));
                descriptor.PostLogoutRedirectUris.Add(new Uri("https://deploy-web-hrms.vercel.app/"));
            }

            await appManager.CreateAsync(descriptor);
        }
    }
}