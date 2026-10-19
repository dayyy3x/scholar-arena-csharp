using System.Text.Json;
using ScholarArena.Data;
using ScholarArena.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddHttpClient<AnthropicClient>(c =>
{
    c.Timeout = TimeSpan.FromSeconds(60);
});

// camelCase JSON so the browser sees the same shape the React app used.
// DictionaryKeyPolicy is left unset on purpose — class-code keys like
// "CSCI 2200" and id keys like "unix" must pass through untouched.
builder.Services.ConfigureHttpJsonOptions(o =>
{
    o.SerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
    o.SerializerOptions.DefaultIgnoreCondition =
        System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull;
});

var app = builder.Build();

app.UseDefaultFiles();
app.UseStaticFiles();

// ── Dataset: C# owns the data; the browser fetches this on load and renders. ──
app.MapGet("/api/academics/data", () => Results.Json(new
{
    term = AcademicsData.Term,
    classes = AcademicsData.Classes,
    study = AcademicsData.Study,
    courseDetail = AcademicsData.CourseDetail,
    courseInfo = AcademicsData.CourseInfo,
    week = AcademicsData.Week,
    lifeEvents = AcademicsData.LifeEvents,
}));

// ── gen-deck: SCHOLAR writes fresh flashcards for a subject. ──
app.MapPost("/api/academics/gen-deck", async (GenDeckRequest body, AnthropicClient client, CancellationToken ct) =>
{
    var subject = (body.Subject ?? "").Trim();
    if (string.IsNullOrEmpty(subject))
        return Results.Json(new { error = "no subject" }, statusCode: 400);

    var count = Math.Max(3, Math.Min(20, body.Count ?? 8));
    var avoid = body.Avoid ?? Array.Empty<string>();

    var sys = string.Join("\n",
        "You write accurate, concise study flashcards for an undergraduate student.",
        "Output ONLY a JSON array of {\"q\",\"a\"} objects — no prose, no markdown, no code fences.",
        "Questions are short and specific. Answers are correct and 1-2 sentences. Cover the real fundamentals of the subject.");

    var userLines = new List<string> { $"Generate {count} NEW flashcards for: {subject}." };
    if (avoid.Length > 0)
        userLines.Add($"Do NOT repeat these existing questions: {string.Join(" | ", avoid.Take(30))}.");
    userLines.Add($"Return ONLY the JSON array of {count} {{\"q\",\"a\"}} objects.");
    var user = string.Join("\n", userLines);

    try
    {
        var text = await client.CreateMessageAsync(2048, sys,
            new[] { new AnthropicClient.ChatMessage("user", user) }, ct);
        if (string.IsNullOrEmpty(text)) throw new InvalidOperationException("deck-gen answered empty");

        var match = System.Text.RegularExpressions.Regex.Match(text, @"\[[\s\S]*\]");
        var json = match.Success ? match.Value : text;

        using var doc = JsonDocument.Parse(json);
        var cards = new List<object>();
        if (doc.RootElement.ValueKind == JsonValueKind.Array)
        {
            foreach (var el in doc.RootElement.EnumerateArray())
            {
                if (el.ValueKind != JsonValueKind.Object) continue;
                if (el.TryGetProperty("q", out var q) && q.ValueKind == JsonValueKind.String
                    && el.TryGetProperty("a", out var a) && a.ValueKind == JsonValueKind.String)
                {
                    cards.Add(new { q = q.GetString()!.Trim(), a = a.GetString()!.Trim() });
                }
            }
        }

        if (cards.Count == 0) throw new InvalidOperationException("model returned no valid cards");
        return Results.Json(new { cards });
    }
    catch (Exception e)
    {
        return Results.Json(new { error = $"deck-gen failed: {e.Message}" }, statusCode: 502);
    }
});

// ── scholar: AI tutor chat, grounded in the arena's course data. ──
app.MapPost("/api/academics/scholar", async (ScholarRequest body, AnthropicClient client, CancellationToken ct) =>
{
    if (string.IsNullOrWhiteSpace(body.Message))
        return Results.Json(new { error = "no message" }, statusCode: 400);

    var context = ScholarContext.BuildCourseContext(body.Class);

    try
    {
        var msgs = new List<AnthropicClient.ChatMessage>();
        if (body.History is not null)
        {
            foreach (var h in body.History.TakeLast(10))
            {
                if ((h.Role == "user" || h.Role == "assistant") && h.Content is not null)
                    msgs.Add(new AnthropicClient.ChatMessage(h.Role, h.Content));
            }
        }
        msgs.Add(new AnthropicClient.ChatMessage("user", body.Message));

        var system = $"{ScholarContext.ScholarPersona(body.Class)}\n\nREAL CONTEXT (ground your answer in this):\n{context}";
        var reply = await client.CreateMessageAsync(1024, system, msgs, ct);
        if (string.IsNullOrEmpty(reply)) throw new InvalidOperationException("tutor answered empty");
        return Results.Json(new { reply, via = "api" });
    }
    catch (Exception e)
    {
        return Results.Json(new { error = $"SCHOLAR failed: {e.Message}" }, statusCode: 502);
    }
});

// SPA-style fallback: anything not matched above serves the arena shell.
app.MapFallbackToFile("index.html");

app.Run();

// ── request contracts ──
record GenDeckRequest(string? Subject, int? Count, string[]? Avoid);
record ScholarHistoryItem(string? Role, string? Content);
record ScholarRequest(string? Message, ScholarHistoryItem[]? History, string? Class, string? Target);
