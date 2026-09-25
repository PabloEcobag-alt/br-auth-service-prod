using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using OpenIddict.Abstractions;
using OpenIddict.Server.AspNetCore;
using internal_auth_service.Helpers;
using internal_auth_service.Interfaces.Services;
using IAuthorizationService = internal_auth_service.Interfaces.Services.IAuthorizationService;

namespace internal_auth_service.Controllers;

public class AuthorizationController : Controller
{
    private readonly IAuthorizationService _authorizationService;

    public AuthorizationController(IAuthorizationService authorizationService)
    {
        _authorizationService = authorizationService;
    }

    [IgnoreAntiforgeryToken]
    [HttpGet("~/connect/authorize")]
    [HttpPost("~/connect/authorize")]
    public async Task<IActionResult> Authorize()
    {
        var request = HttpContext.GetOpenIddictServerRequest()
            ?? throw new InvalidOperationException("The OpenIddict request cannot be retrieved.");

        var result = await HttpContext.AuthenticateAsync(IdentityConstants.ApplicationScheme);

        if (!result.Succeeded || result.Principal is null)
        {
            var returnUrl = Request.PathBase + Request.Path + QueryString.Create(
                Request.HasFormContentType ? Request.Form.ToList() : Request.Query.ToList());

            return Redirect($"/Account/Login?returnUrl={Uri.EscapeDataString(returnUrl)}");
        }

        var requestPathAndQuery = Request.PathBase + Request.Path + QueryString.Create(
            Request.HasFormContentType ? Request.Form.ToList() : Request.Query.ToList());

        var (success, user, redirectUrl, requiredSystemCode) = 
            await _authorizationService.ValidateAuthorizeRequestAsync(result.Principal, request.ClientId, requestPathAndQuery);

        if (!success)
        {
            // Stale cookie: authenticated, but the user no longer exists. Clear
            // the dangling sign-in and bounce to login so the visitor can
            // re-authenticate as a current account (rather than 500-ing or
            // showing a misleading Access Denied page).
            if (user is null)
            {
                await HttpContext.SignOutAsync(IdentityConstants.ApplicationScheme);
                return Redirect($"/Account/Login?returnUrl={Uri.EscapeDataString(requestPathAndQuery)}");
            }

            if (!string.IsNullOrEmpty(redirectUrl))
            {
                return Redirect(redirectUrl);
            }

            var html = await ViewHelper.LoadViewAsync("AccessDenied.html");
            html = html.Replace("{{appName}}", requiredSystemCode ?? string.Empty);
            return Content(html, "text/html");
        }

        var principal = await _authorizationService.CreatePrincipalForUserAsync(user!, request.GetScopes());

        return SignIn(principal, OpenIddictServerAspNetCoreDefaults.AuthenticationScheme);
    }

    [IgnoreAntiforgeryToken]
    [HttpPost("~/connect/token")]
    public async Task<IActionResult> Exchange()
    {
        var request = HttpContext.GetOpenIddictServerRequest()
            ?? throw new InvalidOperationException("The OpenIddict request cannot be retrieved.");

        if (request.IsAuthorizationCodeGrantType() || request.IsRefreshTokenGrantType())
        {
            var result = await HttpContext.AuthenticateAsync(OpenIddictServerAspNetCoreDefaults.AuthenticationScheme);

            if (result.Principal is null)
            {
                return Forbid(
                    authenticationSchemes: OpenIddictServerAspNetCoreDefaults.AuthenticationScheme,
                    properties: new AuthenticationProperties(new Dictionary<string, string?>
                    {
                        [OpenIddictServerAspNetCoreConstants.Properties.Error] = OpenIddictConstants.Errors.InvalidGrant,
                        [OpenIddictServerAspNetCoreConstants.Properties.ErrorDescription] = "The token is no longer valid."
                    }));
            }

            var (isValid, user, error, errorDescription) = await _authorizationService.ValidateExchangeRequestAsync(result.Principal);
            if (!isValid)
            {
                return Forbid(
                    authenticationSchemes: OpenIddictServerAspNetCoreDefaults.AuthenticationScheme,
                    properties: new AuthenticationProperties(new Dictionary<string, string?>
                    {
                        [OpenIddictServerAspNetCoreConstants.Properties.Error] = error,
                        [OpenIddictServerAspNetCoreConstants.Properties.ErrorDescription] = errorDescription
                    }));
            }

            var principal = await _authorizationService.CreatePrincipalForUserAsync(user!, result.Principal.GetScopes());

            return SignIn(principal, OpenIddictServerAspNetCoreDefaults.AuthenticationScheme);
        }

        throw new NotImplementedException("Only authorization_code and refresh_token grant types are supported.");
    }

    [Authorize(AuthenticationSchemes = OpenIddictServerAspNetCoreDefaults.AuthenticationScheme)]
    [HttpGet("~/connect/userinfo")]
    public async Task<IActionResult> Userinfo()
    {
        var userInfo = await _authorizationService.GetUserInfoAsync(User);
        if (userInfo is null)
        {
            return Challenge(OpenIddictServerAspNetCoreDefaults.AuthenticationScheme);
        }

        return Ok(userInfo);
    }

    [IgnoreAntiforgeryToken]
    [HttpGet("~/connect/logout")]
    [HttpPost("~/connect/logout")]
    public async Task<IActionResult> Logout()
    {
        await HttpContext.SignOutAsync(IdentityConstants.ApplicationScheme);

        return SignOut(
            authenticationSchemes: OpenIddictServerAspNetCoreDefaults.AuthenticationScheme,
            properties: new AuthenticationProperties
            {
                RedirectUri = "/"
            });
    }
}