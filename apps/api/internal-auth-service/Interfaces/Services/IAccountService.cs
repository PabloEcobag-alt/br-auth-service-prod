using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;
using internal_auth_service.Models;

namespace internal_auth_service.Interfaces.Services;

public interface IAccountService
{
    Task<ApplicationUser?> FindActiveUserAsync(string username);
    Task<SignInResult> SignInAsync(ApplicationUser user, string password, bool isPersistent = true);
    Task<ApplicationUser?> GetCurrentUserAsync(ClaimsPrincipal principal);
    Task<(bool success, string? error)> ChangePasswordAsync(ApplicationUser user, string newPassword, string confirmPassword);
    Task<(bool success, string? error)> ChangePasswordWithTokenAsync(string username, string resetToken, string newPassword, string confirmPassword);
    Task<(bool success, string? error)> ResetPasswordAsync(string username);
    Task<(bool success, string? error)> SendOtpAsync(string username);
    Task<(bool success, string? error, string? resetToken)> VerifyOtpAsync(string username, string code);
    Task SignOutAsync();
    string MaskEmail(string email);
}
