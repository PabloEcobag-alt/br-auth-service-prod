using System.Threading.Tasks;

namespace internal_auth_service.Interfaces.Services;

public interface IEmailService
{
    Task SendCredentialsAsync(string email, string displayName, string username, string password);
    Task SendPasswordResetAsync(string email, string displayName, string tempPassword);
    Task SendOtpAsync(string email, string displayName, string otpCode);
}
