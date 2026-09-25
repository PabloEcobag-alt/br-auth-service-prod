using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using internal_auth_service.Interfaces.Services;
using internal_auth_service.Helpers;

namespace internal_auth_service.Controllers;

public class AccountController : Controller
{
    private readonly IAccountService _accountService;

    public AccountController(IAccountService accountService)
    {
        _accountService = accountService;
    }

    [HttpGet("~/Account/Login")]
    public async Task<IActionResult> Login(string? returnUrl = null, string? error = null)
    {
        Response.Headers["Cache-Control"] = "no-store, no-cache, must-revalidate";
        Response.Headers["Pragma"] = "no-cache";

        var user = await _accountService.GetCurrentUserAsync(User);
        if (user != null)
        {
            if (user.MustChangePassword)
            {
                return RedirectToAction(nameof(ChangePassword), new { returnUrl });
            }
            return Redirect(AccountUrlHelper.ResolveRedirectAfterLogin(Url, returnUrl, null));
        }

        var html = await ViewHelper.LoadViewAsync("Login.html");
        
        var errorHtml = error is not null
            ? $"<p style=\"color:red\">{System.Net.WebUtility.HtmlEncode(error)}</p>"
            : "";

        html = html.Replace("{{errorHtml}}", errorHtml)
                   .Replace("{{returnUrl}}", System.Net.WebUtility.HtmlEncode(returnUrl ?? ""));

        return Content(html, "text/html");
    }

    [HttpPost("~/Account/Login")]
    public async Task<IActionResult> LoginPost(
        [FromForm] string username,
        [FromForm] string password,
        [FromForm] string? returnUrl = null)
    {
        var user = await _accountService.FindActiveUserAsync(username);
        if (user is null)
        {
            return Redirect(AccountUrlHelper.LoginWithError(returnUrl, "Invalid username or password."));
        }

        var result = await _accountService.SignInAsync(user, password);

        if (!result.Succeeded)
        {
            return Redirect(AccountUrlHelper.LoginWithError(returnUrl, "Invalid username or password."));
        }

        if (user.MustChangePassword)
        {
            return Redirect($"/Account/ChangePassword?returnUrl={Uri.EscapeDataString(returnUrl ?? "")}");
        }

        return Redirect(AccountUrlHelper.ResolveRedirectAfterLogin(Url, returnUrl, Request.Headers["Referer"].ToString()));
    }

    [HttpGet("~/Account/ChangePassword")]
    public async Task<IActionResult> ChangePassword(
        string? returnUrl = null,
        string? error = null,
        string? resetToken = null,
        string? username = null)
    {
        // If no reset token, require logged-in user
        if (string.IsNullOrEmpty(resetToken))
        {
            var user = await _accountService.GetCurrentUserAsync(User);
            if (user == null)
            {
                return Redirect($"/Account/Login?returnUrl={Uri.EscapeDataString(returnUrl ?? "")}");
            }
        }

        var html = await ViewHelper.LoadViewAsync("ChangePassword.html");

        var errorHtml = error is not null
            ? $"<p class=\"error\">{System.Net.WebUtility.HtmlEncode(error)}</p>"
            : "";

        html = html.Replace("{{errorHtml}}", errorHtml)
                   .Replace("{{returnUrl}}", System.Net.WebUtility.HtmlEncode(returnUrl ?? ""))
                   .Replace("{{resetToken}}", System.Net.WebUtility.HtmlEncode(resetToken ?? ""))
                   .Replace("{{resetUsername}}", System.Net.WebUtility.HtmlEncode(username ?? ""));

        return Content(html, "text/html");
    }

    [HttpPost("~/Account/ChangePassword")]
    public async Task<IActionResult> ChangePasswordPost(
        [FromForm] string newPassword,
        [FromForm] string confirmPassword,
        [FromForm] string? returnUrl = null,
        [FromForm] string? resetToken = null,
        [FromForm] string? resetUsername = null)
    {
        // Reset token path (OTP-verified user)
        if (!string.IsNullOrEmpty(resetToken) && !string.IsNullOrEmpty(resetUsername))
        {
            var (success, error) = await _accountService.ChangePasswordWithTokenAsync(
                resetUsername, resetToken, newPassword, confirmPassword);

            if (!success)
            {
                var errorUrl = $"/Account/ChangePassword?error={Uri.EscapeDataString(error ?? "An error occurred.")}" +
                    $"&resetToken={Uri.EscapeDataString(resetToken)}" +
                    $"&username={Uri.EscapeDataString(resetUsername)}";
                if (!string.IsNullOrEmpty(returnUrl))
                    errorUrl += $"&returnUrl={Uri.EscapeDataString(returnUrl)}";
                return Redirect(errorUrl);
            }

            return Redirect("/Account/Login");
        }

        // Logged-in user path (original flow)
        var user = await _accountService.GetCurrentUserAsync(User);
        if (user == null)
        {
            return Redirect($"/Account/Login?returnUrl={Uri.EscapeDataString(returnUrl ?? "")}");
        }

        var (changeSuccess, changeError) = await _accountService.ChangePasswordAsync(user, newPassword, confirmPassword);
        
        if (!changeSuccess)
        {
            return Redirect(AccountUrlHelper.ChangePasswordWithError(returnUrl, changeError ?? "An error occurred."));
        }

        return Redirect("/Account/Login");
    }

    [HttpPost("~/Account/Logout")]
    public async Task<IActionResult> Logout()
    {
        await _accountService.SignOutAsync();
        return Redirect("/Account/Login");
    }

    [HttpGet("~/Account/ForgotPassword")]
    public async Task<IActionResult> ForgotPassword(string? returnUrl = null, string? error = null)
    {
        var html = await ViewHelper.LoadViewAsync("ForgotPassword.html");

        var errorHtml = error is not null
            ? $"<p class=\"error\">{System.Net.WebUtility.HtmlEncode(error)}</p>"
            : "";

        html = html.Replace("{{errorHtml}}", errorHtml)
                   .Replace("{{returnUrl}}", System.Net.WebUtility.HtmlEncode(returnUrl ?? ""));

        return Content(html, "text/html");
    }

    [HttpPost("~/Account/ForgotPassword")]
    public async Task<IActionResult> ForgotPasswordPost(
        [FromForm] string username,
        [FromForm] string? returnUrl = null)
    {
        if (string.IsNullOrWhiteSpace(username))
        {
            return Redirect(AccountUrlHelper.ForgotPasswordWithError(returnUrl, "Username is required."));
        }

        var (success, error) = await _accountService.SendOtpAsync(username);

        if (!success)
        {
            return Redirect(AccountUrlHelper.ForgotPasswordWithError(returnUrl, error ?? "An error occurred."));
        }

        return Redirect($"/Account/VerifyOtp?username={Uri.EscapeDataString(username)}&returnUrl={Uri.EscapeDataString(returnUrl ?? "")}");
    }

    [HttpGet("~/Account/VerifyOtp")]
    public async Task<IActionResult> VerifyOtp(
        string? username = null,
        string? returnUrl = null,
        string? error = null,
        string? success = null)
    {
        if (string.IsNullOrEmpty(username))
        {
            return Redirect("/Account/ForgotPassword");
        }

        var html = await ViewHelper.LoadViewAsync("VerifyOtp.html");

        var errorHtml = error is not null
            ? $"<p class=\"error\">{System.Net.WebUtility.HtmlEncode(error)}</p>"
            : "";

        var successHtml = success is not null
            ? $"<p class=\"success\">{System.Net.WebUtility.HtmlEncode(success)}</p>"
            : "";

        // Mask email for display
        var maskedEmail = "your registered email";
        var user = await _accountService.FindActiveUserAsync(username);
        if (user?.Email != null)
        {
            maskedEmail = _accountService.MaskEmail(user.Email);
        }

        html = html.Replace("{{errorHtml}}", errorHtml)
                   .Replace("{{successHtml}}", successHtml)
                   .Replace("{{username}}", System.Net.WebUtility.HtmlEncode(username))
                   .Replace("{{returnUrl}}", System.Net.WebUtility.HtmlEncode(returnUrl ?? ""))
                   .Replace("{{maskedEmail}}", System.Net.WebUtility.HtmlEncode(maskedEmail));

        return Content(html, "text/html");
    }

    [HttpPost("~/Account/VerifyOtp")]
    public async Task<IActionResult> VerifyOtpPost(
        [FromForm] string username,
        [FromForm] string code,
        [FromForm] string? returnUrl = null)
    {
        if (string.IsNullOrWhiteSpace(code))
        {
            return Redirect(AccountUrlHelper.VerifyOtpWithError(username, returnUrl, "Please enter the verification code."));
        }

        var (success, error, resetToken) = await _accountService.VerifyOtpAsync(username, code);

        if (!success)
        {
            return Redirect(AccountUrlHelper.VerifyOtpWithError(username, returnUrl, error ?? "Verification failed."));
        }

        return Redirect($"/Account/ChangePassword?resetToken={Uri.EscapeDataString(resetToken!)}&username={Uri.EscapeDataString(username)}&returnUrl={Uri.EscapeDataString(returnUrl ?? "")}");
    }

    [HttpPost("~/Account/ResendOtp")]
    public async Task<IActionResult> ResendOtp(
        [FromForm] string username,
        [FromForm] string? returnUrl = null)
    {
        var (success, error) = await _accountService.SendOtpAsync(username);

        if (!success)
        {
            return Redirect(AccountUrlHelper.VerifyOtpWithError(username, returnUrl, error ?? "Failed to resend code."));
        }

        return Redirect(AccountUrlHelper.VerifyOtpWithSuccess(username, returnUrl, "A new verification code has been sent to your email."));
    }

    [HttpGet("~/Account/ForgotPasswordConfirmation")]
    public async Task<IActionResult> ForgotPasswordConfirmation(string? returnUrl = null)
    {
        var html = await ViewHelper.LoadViewAsync("ForgotPasswordConfirmation.html");
        
        html = html.Replace("{{returnUrl}}", System.Net.WebUtility.HtmlEncode(returnUrl ?? ""));

        return Content(html, "text/html");
    }
}
