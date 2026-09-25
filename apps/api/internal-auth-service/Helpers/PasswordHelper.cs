using System;
using System.Linq;

namespace internal_auth_service.Helpers;

public static class PasswordHelper
{
    public static string GenerateTempPassword()
    {
        var random = new Random();
        const string lower = "abcdefghijklmnopqrstuvwxyz";
        const string upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const string digits = "0123456789";
        const string special = "!@#$%^&*()";

        var chars = new char[12];
        chars[0] = lower[random.Next(lower.Length)];
        chars[1] = upper[random.Next(upper.Length)];
        chars[2] = digits[random.Next(digits.Length)];
        chars[3] = special[random.Next(special.Length)];

        const string all = lower + upper + digits + special;
        for (int i = 4; i < 12; i++)
        {
            chars[i] = all[random.Next(all.Length)];
        }

        // Shuffle the characters
        return new string(chars.OrderBy(_ => random.Next()).ToArray());
    }
}
