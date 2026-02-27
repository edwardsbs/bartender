namespace Bartender.Api.Services.Handlers.Methods;

public class Normalizing
{
    public static string NormalizeKey(string? name)
    {
        if (string.IsNullOrWhiteSpace(name)) return "";
        var s = name.Trim().ToLowerInvariant();

        // crude normalization similar to your frontend
        s = s.Replace("(", "").Replace(")", "");
        s = System.Text.RegularExpressions.Regex.Replace(s, @"[^a-z0-9\s-]", "");
        s = System.Text.RegularExpressions.Regex.Replace(s, @"\s+", " ").Trim();

        return s;
    }
}
