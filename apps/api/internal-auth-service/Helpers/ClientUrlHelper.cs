using System;
using System.Collections.Generic;

namespace internal_auth_service.Helpers;

public static class ClientUrlHelper
{
    public static string GetPortalUrl()
    {
        return Environment.GetEnvironmentVariable("PORTAL_URL") ?? "https://localhost:3000/";
    }

    public static Dictionary<string, string> GetClientUrls()
    {
        return new Dictionary<string, string>
        {
            ["portal-client"] = Environment.GetEnvironmentVariable("PORTAL_URL") ?? "https://localhost:3000/",
            ["hrms-client"] = Environment.GetEnvironmentVariable("HRMS_URL") ?? "https://localhost:3001/",
            ["pos-client"] = Environment.GetEnvironmentVariable("POS_URL") ?? "https://localhost:3002/",
            ["scms-client"] = Environment.GetEnvironmentVariable("SCMS_URL") ?? "https://localhost:3003/",
            ["oos-client"] = Environment.GetEnvironmentVariable("OOS_URL") ?? "https://localhost:3004/",
            ["crms-client"] = Environment.GetEnvironmentVariable("CRMS_URL") ?? "https://localhost:3005/",
        };
    }

    public static Dictionary<string, string> GetClientSystemCodes()
    {
        return new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
        {
            ["hrms-client"] = "HRMS",
            ["pos-client"] = "POS",
            ["scms-client"] = "SCMS",
            ["oos-client"] = "OOS",
            ["crms-client"] = "CRMS"
        };
    }
}
