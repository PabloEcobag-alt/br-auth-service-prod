using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using internal_auth_service.Models;

namespace internal_auth_service.Data;

public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<SystemDefinition> SystemDefinitions => Set<SystemDefinition>();
    public DbSet<AppModule> AppModules => Set<AppModule>();
    public DbSet<UserAppPermission> UserAppPermissions => Set<UserAppPermission>();
    public DbSet<PasswordResetOtp> PasswordResetOtps => Set<PasswordResetOtp>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder); 

        builder.Entity<AppModule>(entity =>
        {
            entity.HasOne(am => am.SystemDefinition)
                  .WithMany(sd => sd.Modules)
                  .HasForeignKey(am => am.SystemDefinitionId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<UserAppPermission>(entity =>
        {
            entity.HasOne(uap => uap.User)
                  .WithMany(u => u.UserPermissions)
                  .HasForeignKey(uap => uap.UserId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(uap => uap.AppModule)
                  .WithMany(am => am.UserPermissions)
                  .HasForeignKey(uap => uap.AppModuleId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<SystemDefinition>()
            .HasIndex(sd => sd.Code)
            .IsUnique();

        // One account per email, enforced at the database level. Identity's
        // RequireUniqueEmail validates in code, but the default EmailIndex is
        // non-unique; a unique index guarantees the invariant even against
        // direct writes, keeping ApplicationUser.Id stable per person (the OIDC
        // `sub` that downstream systems key ownership on).
        builder.Entity<ApplicationUser>()
            .HasIndex(u => u.NormalizedEmail)
            .HasDatabaseName("EmailIndex")
            .IsUnique();

        builder.Entity<PasswordResetOtp>(entity =>
        {
            entity.HasOne(o => o.User)
                  .WithMany()
                  .HasForeignKey(o => o.UserId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(o => o.UserId);
        });
        
        builder.UseOpenIddict();
    }
}