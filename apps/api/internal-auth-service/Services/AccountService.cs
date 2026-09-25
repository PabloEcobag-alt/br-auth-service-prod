using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using internal_auth_service.Data;
using internal_auth_service.Models;
using internal_auth_service.Interfaces.Services;
using internal_auth_service.Helpers;

namespace internal_auth_service.Services;

public class AccountService : IAccountService
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly SignInManager<ApplicationUser> _signInManager;
    private readonly IEmailService _emailService;
    private readonly ApplicationDbContext _db;

    public AccountService(
        UserManager<ApplicationUser> userManager,
        SignInManager<ApplicationUser> signInManager,
        IEmailService emailService,
        ApplicationDbContext db)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _emailService = emailService;
        _db = db;
    }

    public async Task<ApplicationUser?> FindActiveUserAsync(string username)
    {
        var user = await _userManager.FindByNameAsync(username);
        if (user == null || user.IsDeleted)
        {
            return null;
        }
        return user;
    }

    public async Task<SignInResult> SignInAsync(ApplicationUser user, string password, bool isPersistent = true)
    {
        return await _signInManager.PasswordSignInAsync(user, password, isPersistent, lockoutOnFailure: false);
    }

    public async Task<ApplicationUser?> GetCurrentUserAsync(ClaimsPrincipal principal)
    {
        return await _userManager.GetUserAsync(principal);
    }

    public async Task<(bool success, string? error)> ChangePasswordAsync(ApplicationUser user, string newPassword, string confirmPassword)
    {
        if (newPassword != confirmPassword)
        {
            return (false, "New password and confirmation do not match.");
        }

        if (await _userManager.HasPasswordAsync(user))
        {
            var removeResult = await _userManager.RemovePasswordAsync(user);
            if (!removeResult.Succeeded)
            {
                var errors = string.Join(" ", removeResult.Errors.Select(e => e.Description));
                return (false, errors);
            }
        }

        var addResult = await _userManager.AddPasswordAsync(user, newPassword);
        if (!addResult.Succeeded)
        {
            var errors = string.Join(" ", addResult.Errors.Select(e => e.Description));
            return (false, errors);
        }

        user.MustChangePassword = false;
        await _userManager.UpdateAsync(user);
        
        await _signInManager.SignOutAsync();

        return (true, null);
    }

    public async Task<(bool success, string? error)> ChangePasswordWithTokenAsync(
        string username, string resetToken, string newPassword, string confirmPassword)
    {
        if (newPassword != confirmPassword)
        {
            return (false, "New password and confirmation do not match.");
        }

        var user = await FindActiveUserAsync(username);
        if (user == null)
        {
            return (false, "Invalid reset request.");
        }

        var result = await _userManager.ResetPasswordAsync(user, resetToken, newPassword);
        if (!result.Succeeded)
        {
            var errors = string.Join(" ", result.Errors.Select(e => e.Description));
            return (false, errors);
        }

        user.MustChangePassword = false;
        await _userManager.UpdateAsync(user);

        return (true, null);
    }

    public async Task<(bool success, string? error)> ResetPasswordAsync(string username)
    {
        var user = await FindActiveUserAsync(username);
        if (user == null)
        {
            return (true, null);
        }

        var tempPassword = PasswordHelper.GenerateTempPassword();

        if (await _userManager.HasPasswordAsync(user))
        {
            await _userManager.RemovePasswordAsync(user);
        }

        var result = await _userManager.AddPasswordAsync(user, tempPassword);
        if (result.Succeeded)
        {
            user.MustChangePassword = true;
            await _userManager.UpdateAsync(user);

            await _emailService.SendPasswordResetAsync(user.Email!, user.DisplayName, tempPassword);
            return (true, null);
        }
        else
        {
            var errors = string.Join(" ", result.Errors.Select(e => e.Description));
            return (false, errors);
        }
    }

    public async Task<(bool success, string? error)> SendOtpAsync(string username)
    {
        var user = await FindActiveUserAsync(username);
        if (user == null)
        {
            // Don't reveal that the user doesn't exist
            return (true, null);
        }

        if (user.MustChangePassword)
        {
            return (false, "Account not yet activated. Please contact your administrator.");
        }

        // Rate limit: max 3 OTPs per 5-minute window
        var fiveMinutesAgo = DateTime.UtcNow.AddMinutes(-5);
        var recentCount = await _db.PasswordResetOtps
            .CountAsync(o => o.UserId == user.Id && o.CreatedAt > fiveMinutesAgo);

        if (recentCount >= 3)
        {
            return (false, "Too many attempts. Please wait a few minutes before trying again.");
        }

        // Generate 6-digit numeric OTP
        var code = Random.Shared.Next(100000, 999999).ToString();

        var otp = new PasswordResetOtp
        {
            UserId = user.Id,
            Code = code,
            CreatedAt = DateTime.UtcNow,
            ExpiresAt = DateTime.UtcNow.AddMinutes(5)
        };

        _db.PasswordResetOtps.Add(otp);
        await _db.SaveChangesAsync();

        await _emailService.SendOtpAsync(user.Email!, user.DisplayName, code);

        return (true, null);
    }

    public async Task<(bool success, string? error, string? resetToken)> VerifyOtpAsync(string username, string code)
    {
        var user = await FindActiveUserAsync(username);
        if (user == null)
        {
            return (false, "Invalid verification code.", null);
        }

        var otp = await _db.PasswordResetOtps
            .Where(o => o.UserId == user.Id && !o.IsUsed && o.ExpiresAt > DateTime.UtcNow)
            .OrderByDescending(o => o.CreatedAt)
            .FirstOrDefaultAsync();

        if (otp == null)
        {
            return (false, "Code has expired. Please request a new one.", null);
        }

        if (otp.Code != code)
        {
            return (false, "Invalid verification code.", null);
        }

        otp.IsUsed = true;
        await _db.SaveChangesAsync();

        var resetToken = await _userManager.GeneratePasswordResetTokenAsync(user);

        return (true, null, resetToken);
    }

    public async Task SignOutAsync()
    {
        await _signInManager.SignOutAsync();
    }

    public string MaskEmail(string email)
    {
        if (string.IsNullOrEmpty(email)) return "***";

        var parts = email.Split('@');
        if (parts.Length != 2) return "***";

        var localPart = parts[0];
        var domain = parts[1];

        var masked = localPart.Length <= 2
            ? $"{localPart[0]}***"
            : $"{localPart[0]}{new string('*', localPart.Length - 2)}{localPart[^1]}";

        return $"{masked}@{domain}";
    }
}
