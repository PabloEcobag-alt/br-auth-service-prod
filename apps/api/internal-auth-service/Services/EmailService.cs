using System;
using System.Net;
using System.Net.Mail;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using internal_auth_service.Interfaces.Services;

namespace internal_auth_service.Services;

public class EmailService : IEmailService
{
    private readonly IConfiguration _config;

    public EmailService(IConfiguration config)
    {
        _config = config;
    }

    private string ResolveFilePath(string relativePath)
    {
        var path = System.IO.Path.Combine(AppContext.BaseDirectory, relativePath);
        if (!System.IO.File.Exists(path))
        {
            path = System.IO.Path.Combine(Directory.GetCurrentDirectory(), relativePath);
        }
        return path;
    }

    public async Task SendCredentialsAsync(string email, string displayName, string username, string password)
    {
        var host = Environment.GetEnvironmentVariable("SMTP_HOST") ?? _config["Email:SmtpHost"] ?? "smtp-relay.brevo.com";
        var portStr = Environment.GetEnvironmentVariable("SMTP_PORT") ?? _config["Email:SmtpPort"] ?? "587";
        var port = int.Parse(portStr);
        var usernameSmtp = Environment.GetEnvironmentVariable("SMTP_USERNAME") ?? _config["Email:Username"] ?? string.Empty;
        var passwordSmtp = Environment.GetEnvironmentVariable("SMTP_PASSWORD") ?? _config["Email:Password"] ?? string.Empty;
        var fromAddress = Environment.GetEnvironmentVariable("SMTP_FROM") ?? _config["Email:From"] ?? "noreply@brenraphaels.com";
        var fromName = _config["Email:DisplayName"] ?? "Bren Raphael's Support Service";

        using var client = new SmtpClient(host, port)
        {
            Credentials = new NetworkCredential(usernameSmtp, passwordSmtp),
            EnableSsl = true
        };

        var htmlPath = ResolveFilePath(System.IO.Path.Combine("Templates", "AccountCredentials.html"));
        var cssPath = ResolveFilePath(System.IO.Path.Combine("wwwroot", "css", "templates", "AccountCredentials.css"));
        
        var bodyHtml = await System.IO.File.ReadAllTextAsync(htmlPath);
        var cssContent = await System.IO.File.ReadAllTextAsync(cssPath);

        bodyHtml = bodyHtml.Replace("/* {{cssContent}} */", cssContent)
                           .Replace("{{displayName}}", displayName)
                           .Replace("{{username}}", username)
                           .Replace("{{password}}", password)
                           .Replace("{{loginUrl}}", Environment.GetEnvironmentVariable("LOGIN_URL") ?? "https://localhost:5001/Account/Login");

        var mailMessage = new MailMessage
        {
            From = new MailAddress(fromAddress, fromName),
            Subject = "Your Account Credentials",
            Body = bodyHtml,
            IsBodyHtml = true
        };
        mailMessage.To.Add(email);

        try
        {
            await client.SendMailAsync(mailMessage);
        }
        catch (Exception ex)
        {
            // Log or handle mail sending failure gracefully so the user creation doesn't fail catastrophically
            Console.WriteLine($"[Email Service Error] Failed to send email to {email}: {ex.Message}");
        }
    }

    public async Task SendPasswordResetAsync(string email, string displayName, string tempPassword)
    {
        var host = Environment.GetEnvironmentVariable("SMTP_HOST") ?? _config["Email:SmtpHost"] ?? "smtp-relay.brevo.com";
        var portStr = Environment.GetEnvironmentVariable("SMTP_PORT") ?? _config["Email:SmtpPort"] ?? "587";
        var port = int.Parse(portStr);
        var usernameSmtp = Environment.GetEnvironmentVariable("SMTP_USERNAME") ?? _config["Email:Username"] ?? string.Empty;
        var passwordSmtp = Environment.GetEnvironmentVariable("SMTP_PASSWORD") ?? _config["Email:Password"] ?? string.Empty;
        var fromAddress = Environment.GetEnvironmentVariable("SMTP_FROM") ?? _config["Email:From"] ?? "noreply@brenraphaels.com";
        var fromName = _config["Email:DisplayName"] ?? "Bren Raphael's Support Service";

        using var client = new SmtpClient(host, port)
        {
            Credentials = new NetworkCredential(usernameSmtp, passwordSmtp),
            EnableSsl = true
        };

        var htmlPath = ResolveFilePath(System.IO.Path.Combine("Templates", "PasswordReset.html"));
        var cssPath = ResolveFilePath(System.IO.Path.Combine("wwwroot", "css", "templates", "PasswordReset.css"));

        var bodyHtml = await System.IO.File.ReadAllTextAsync(htmlPath);
        var cssContent = await System.IO.File.ReadAllTextAsync(cssPath);

        bodyHtml = bodyHtml.Replace("/* {{cssContent}} */", cssContent)
                           .Replace("{{displayName}}", displayName)
                           .Replace("{{tempPassword}}", tempPassword)
                           .Replace("{{loginUrl}}", Environment.GetEnvironmentVariable("LOGIN_URL") ?? "https://localhost:5001/Account/Login");

        var mailMessage = new MailMessage
        {
            From = new MailAddress(fromAddress, fromName),
            Subject = "Password Reset Request",
            Body = bodyHtml,
            IsBodyHtml = true
        };
        mailMessage.To.Add(email);

        try
        {
            await client.SendMailAsync(mailMessage);
        }
        catch (Exception ex)
        {
            // Log or handle mail sending failure gracefully
            Console.WriteLine($"[Email Service Error] Failed to send email to {email}: {ex.Message}");
        }
    }

    public async Task SendOtpAsync(string email, string displayName, string otpCode)
    {
        var host = Environment.GetEnvironmentVariable("SMTP_HOST") ?? _config["Email:SmtpHost"] ?? "smtp-relay.brevo.com";
        var portStr = Environment.GetEnvironmentVariable("SMTP_PORT") ?? _config["Email:SmtpPort"] ?? "587";
        var port = int.Parse(portStr);
        var usernameSmtp = Environment.GetEnvironmentVariable("SMTP_USERNAME") ?? _config["Email:Username"] ?? string.Empty;
        var passwordSmtp = Environment.GetEnvironmentVariable("SMTP_PASSWORD") ?? _config["Email:Password"] ?? string.Empty;
        var fromAddress = Environment.GetEnvironmentVariable("SMTP_FROM") ?? _config["Email:From"] ?? "noreply@brenraphaels.com";
        var fromName = _config["Email:DisplayName"] ?? "Bren Raphael's Support Service";

        using var client = new SmtpClient(host, port)
        {
            Credentials = new NetworkCredential(usernameSmtp, passwordSmtp),
            EnableSsl = true
        };

        var htmlPath = ResolveFilePath(Path.Combine("Templates", "OtpVerification.html"));
        var cssPath = ResolveFilePath(Path.Combine("wwwroot", "css", "templates", "OtpVerification.css"));

        var bodyHtml = await File.ReadAllTextAsync(htmlPath);
        var cssContent = await File.ReadAllTextAsync(cssPath);

        bodyHtml = bodyHtml.Replace("/* {{cssContent}} */", cssContent)
                           .Replace("{{displayName}}", displayName)
                           .Replace("{{otpCode}}", otpCode);

        var mailMessage = new MailMessage
        {
            From = new MailAddress(fromAddress, fromName),
            Subject = "Your Verification Code",
            Body = bodyHtml,
            IsBodyHtml = true
        };
        mailMessage.To.Add(email);

        try
        {
            await client.SendMailAsync(mailMessage);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[Email Service Error] Failed to send OTP email to {email}: {ex.Message}");
        }
    }
}
