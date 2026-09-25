using System;
using Microsoft.AspNetCore.Mvc;

namespace internal_auth_service.Helpers;

public static class AccountUrlHelper
{
    public static string ResolveRedirectAfterLogin(IUrlHelper urlHelper, string? returnUrl, string? referer)
    {
        if (!string.IsNullOrEmpty(returnUrl))
        {
            if (urlHelper.IsLocalUrl(returnUrl))
            {
                return returnUrl;
            }

            foreach (var client in ClientUrlHelper.GetClientUrls())
            {
                if (returnUrl.Contains($"client_id={client.Key}") || returnUrl.Contains($"client_id%3D{client.Key}"))
                {
                    return client.Value;
                }
            }
        }

        if (!string.IsNullOrEmpty(referer))
        {
            foreach (var client in ClientUrlHelper.GetClientUrls())
            {
                if (referer.StartsWith(client.Value, StringComparison.OrdinalIgnoreCase))
                {
                    return client.Value;
                }
            }
        }

        return ClientUrlHelper.GetPortalUrl();
    }

    public static string LoginWithError(string? returnUrl, string error)
    {
        var url = $"/Account/Login?error={Uri.EscapeDataString(error)}";
        if (!string.IsNullOrEmpty(returnUrl))
        {
            url += $"&returnUrl={Uri.EscapeDataString(returnUrl)}";
        }
        return url;
    }

    public static string ChangePasswordWithError(string? returnUrl, string error)
    {
        var url = $"/Account/ChangePassword?error={Uri.EscapeDataString(error)}";
        if (!string.IsNullOrEmpty(returnUrl))
        {
            url += $"&returnUrl={Uri.EscapeDataString(returnUrl)}";
        }
        return url;
    }

    public static string ForgotPasswordWithError(string? returnUrl, string error)
    {
        var url = $"/Account/ForgotPassword?error={Uri.EscapeDataString(error)}";
        if (!string.IsNullOrEmpty(returnUrl))
        {
            url += $"&returnUrl={Uri.EscapeDataString(returnUrl)}";
        }
        return url;
    }

    public static string VerifyOtpWithError(string? username, string? returnUrl, string error)
    {
        var url = $"/Account/VerifyOtp?error={Uri.EscapeDataString(error)}";
        if (!string.IsNullOrEmpty(username))
        {
            url += $"&username={Uri.EscapeDataString(username)}";
        }
        if (!string.IsNullOrEmpty(returnUrl))
        {
            url += $"&returnUrl={Uri.EscapeDataString(returnUrl)}";
        }
        return url;
    }

    public static string VerifyOtpWithSuccess(string? username, string? returnUrl, string message)
    {
        var url = $"/Account/VerifyOtp?success={Uri.EscapeDataString(message)}";
        if (!string.IsNullOrEmpty(username))
        {
            url += $"&username={Uri.EscapeDataString(username)}";
        }
        if (!string.IsNullOrEmpty(returnUrl))
        {
            url += $"&returnUrl={Uri.EscapeDataString(returnUrl)}";
        }
        return url;
    }
}
