using System.Globalization;
using System.Text;
using ScholarArena.Data;

namespace ScholarArena.Services;

// Ported from scholar/route.ts — buildCourseContext + scholarPersona. Assembles
// the real course facts the tutor must ground its answers in.
public static class ScholarContext
{
    private static readonly CultureInfo Us = CultureInfo.GetCultureInfo("en-US");

    public static string BuildCourseContext(string? klass)
    {
        var today = DateTime.Now;
        var lines = new List<string>
        {
            $"Today is {today.ToString("dddd, MMMM d, yyyy", Us)}.",
        };

        var cls = string.IsNullOrEmpty(klass)
            ? null
            : AcademicsData.Classes.FirstOrDefault(c => c.Name == klass || c.Id == klass);

        if (cls is not null)
        {
            AcademicsData.CourseInfo.TryGetValue(cls.Name, out var info);
            AcademicsData.CourseDetail.TryGetValue(cls.Id, out var detail);

            lines.Add($"Focus class: {cls.Name} — {cls.Title} ({cls.Prof}{(string.IsNullOrEmpty(cls.Crn) ? "" : $", CRN {cls.Crn}")}).");
            if (!string.IsNullOrEmpty(info?.Meeting))
                lines.Add($"Meets: {info!.Meeting}{(string.IsNullOrEmpty(info.Room) ? "" : $" · {info.Room}")}.");

            var grading = detail?.Grading ?? info?.Grading;
            if (grading is { Length: > 0 })
                lines.Add($"Grade weights: {string.Join(" · ", grading.Select(g => $"{g.Component} {g.Weight}"))}.");

            var policy = detail?.LatePolicy ?? info?.Note;
            if (!string.IsNullOrEmpty(policy))
                lines.Add($"Policy: {policy}");

            var up = (detail?.Schedule ?? Array.Empty<Models.ScheduleWeek>())
                .SelectMany(w => w.Items)
                .Select(it => new { it, d = DateTime.Parse(it.Due + "T23:59:59", Us) })
                .Where(x => x.d >= today)
                .OrderBy(x => x.d)
                .Take(6)
                .ToList();

            if (up.Count > 0)
                lines.Add($"Upcoming in this class: {string.Join("; ", up.Select(x => $"{x.it.Name} ({x.it.Kind}, due {x.it.Due})"))}.");
            else
                lines.Add("No graded items are posted for this class yet.");
        }

        var wk = AcademicsData.LifeEvents
            .Where(e => e.Kind == "work")
            .Select(e => new { e, d = DateTime.Parse(e.Date + "T00:00:00", Us) })
            .Where(x => x.d >= today && (x.d - today).TotalMilliseconds < 7 * 864e5)
            .OrderBy(x => x.d)
            .ToList();
        if (wk.Count > 0)
            lines.Add($"Work shifts this week: {string.Join("; ", wk.Select(x => $"{x.d.ToString("ddd", Us)} {x.e.Time ?? ""}".Trim()))}.");

        var nextPay = AcademicsData.LifeEvents
            .Where(e => e.Kind == "payday")
            .Select(e => DateTime.Parse(e.Date + "T00:00:00", Us))
            .Where(d => d >= today)
            .OrderBy(d => d)
            .Cast<DateTime?>()
            .FirstOrDefault();
        if (nextPay is not null)
            lines.Add($"Next payday: {nextPay.Value:yyyy-MM-dd}.");

        return string.Join("\n", lines);
    }

    public static string ScholarPersona(string? klass)
    {
        var parts = new List<string>
        {
            "You are SCHOLAR, the student's academic coach.",
            "Direct, motivating, no fluff. A coach that acts, not a chatbot.",
        };
        if (!string.IsNullOrEmpty(klass))
            parts.Add($"The student is currently working the class: {klass}.");
        parts.Add("Answer concretely and briefly (2-4 sentences unless it needs work shown). If they should study, say exactly what to grind next.");
        parts.Add("You are given the student's real course facts + schedule below — USE them (dates, grade weights, work shifts). Don't invent anything not in that context.");
        parts.Add("You help the student learn — you never do graded work for them or write answers to submit.");
        return string.Join("\n", parts);
    }
}
