using System.Text;
using System.Text.Json;

namespace ScholarArena.Services;

// Thin wrapper over the Anthropic Messages API. Ported from the TS routes that
// used @anthropic-ai/sdk — here we POST to the HTTP endpoint directly so there
// is no SDK dependency. The key never leaves the server.
public class AnthropicClient
{
    private readonly HttpClient _http;
    private readonly IConfiguration _config;

    public AnthropicClient(HttpClient http, IConfiguration config)
    {
        _http = http;
        _config = config;
    }

    public string Model =>
        Environment.GetEnvironmentVariable("SCHOLAR_MODEL")
        ?? _config["SCHOLAR_MODEL"]
        ?? "claude-sonnet-5";

    private string? ApiKey =>
        Environment.GetEnvironmentVariable("ANTHROPIC_API_KEY")
        ?? _config["ANTHROPIC_API_KEY"];

    public record ChatMessage(string Role, string Content);

    // Calls the API and returns the concatenated text blocks. Throws on a missing
    // key or a non-success response so callers can translate it into a 502 + JSON.
    public async Task<string> CreateMessageAsync(
        int maxTokens,
        string system,
        IEnumerable<ChatMessage> messages,
        CancellationToken ct = default)
    {
        var apiKey = ApiKey;
        if (string.IsNullOrWhiteSpace(apiKey))
            throw new InvalidOperationException(
                "ANTHROPIC_API_KEY is not set — copy appsettings.Example.json to appsettings.Development.json (or set the env var) and add your key");

        var payload = new
        {
            model = Model,
            max_tokens = maxTokens,
            system,
            messages = messages.Select(m => new { role = m.Role, content = m.Content }).ToArray(),
        };

        using var req = new HttpRequestMessage(HttpMethod.Post, "https://api.anthropic.com/v1/messages");
        req.Headers.Add("x-api-key", apiKey);
        req.Headers.Add("anthropic-version", "2023-06-01");
        req.Content = new StringContent(
            JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");

        using var resp = await _http.SendAsync(req, ct);
        var body = await resp.Content.ReadAsStringAsync(ct);
        if (!resp.IsSuccessStatusCode)
            throw new InvalidOperationException($"Anthropic API returned {(int)resp.StatusCode}: {Truncate(body, 300)}");

        using var doc = JsonDocument.Parse(body);
        if (!doc.RootElement.TryGetProperty("content", out var content) || content.ValueKind != JsonValueKind.Array)
            throw new InvalidOperationException("Anthropic API response had no content array");

        var sb = new StringBuilder();
        foreach (var block in content.EnumerateArray())
        {
            if (block.TryGetProperty("type", out var type) && type.GetString() == "text"
                && block.TryGetProperty("text", out var text))
            {
                sb.Append(text.GetString());
            }
        }

        return sb.ToString().Trim();
    }

    private static string Truncate(string s, int n) => s.Length <= n ? s : s[..n];
}
