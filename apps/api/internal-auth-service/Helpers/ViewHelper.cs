using System;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;

namespace internal_auth_service.Helpers;

public static class ViewHelper
{
    public static async Task<string> LoadViewAsync(string viewName)
    {
        var path = Path.Combine(AppContext.BaseDirectory, "Views", "Account", viewName);
        if (!File.Exists(path))
        {
            path = Path.Combine(Directory.GetCurrentDirectory(), "Views", "Account", viewName);
        }
        
        if (!File.Exists(path))
        {
            throw new FileNotFoundException($"View file '{viewName}' not found at {path}.");
        }

        return await File.ReadAllTextAsync(path);
    }

    public static string InjectPlaceholders(string html, Dictionary<string, string> replacements)
    {
        foreach (var replacement in replacements)
        {
            html = html.Replace("{{" + replacement.Key + "}}", replacement.Value);
        }
        return html;
    }
}
