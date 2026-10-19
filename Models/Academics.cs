namespace ScholarArena.Models;

// Ported from src/lib/academics.ts and the STUDY object in AcademicsArena.tsx.
// Property names are PascalCase; the JSON serializer is configured for camelCase
// output so the browser sees the same shape the React app used.

public record Term(string Name, string School, string Starts, string Ends, int CreditHours);

public record AcademicClass(
    string Id,
    string Name,
    string Title,
    string Time,
    string Days,
    string Room,
    string Prof,
    string Crn,
    int Credits,
    int? Grade,
    string Letter,
    bool Risk,
    int[] Trend);

public record LifeEvent(
    string Date,
    string Kind,
    string Title,
    string? Sub = null,
    string? Time = null,
    int? Amount = null);

public record WeekClass(string Code, string Title, string Time, string Room);

public record WeekDay(string Day, WeekClass[] Classes);

public class GradeComponent
{
    public required string Component { get; init; }
    public required string Weight { get; init; }
    public string? Note { get; init; }
}

public class CourseInfo
{
    public required string Instructor { get; init; }
    public string? Email { get; init; }
    public string? Office { get; init; }
    public required string Meeting { get; init; }
    public string? Room { get; init; }
    public string? Format { get; init; }
    public required GradeComponent[] Grading { get; init; }
    public string? Note { get; init; }
}

public record KeyDate(string Label, string Date);

public record Module(string Title, string[]? Topics = null);

public record ScheduleItem(string Name, string Due, string Kind);

public record ScheduleWeek(int Week, ScheduleItem[] Items);

public record CourseFile(string Name, string Url, string Kind);

public class CourseDetail
{
    public string? School { get; init; }
    public string? Term { get; init; }
    public required string Overview { get; init; }
    public required string Format { get; init; }
    public required string[] Objectives { get; init; }
    public string? Instructor { get; init; }
    public KeyDate[]? KeyDates { get; init; }
    public GradeComponent[]? Grading { get; init; }
    public string? GradingRule { get; init; }
    public Module[]? Modules { get; init; }
    public string[]? Materials { get; init; }
    public CourseFile[]? Files { get; init; }
    public string? LatePolicy { get; init; }
    public ScheduleWeek[]? Schedule { get; init; }
}

// STUDY object (per-class drill content), ported from AcademicsArena.tsx.
public record FlashCard(string Q, string A);

public record WritePrompt(string Prompt, string[] Keys, string Model);

public record ExamQuestion(string Q, string[] Opts, int Ans);

public class StudyDeck
{
    public required string Weak { get; init; }
    public required FlashCard[] Flash { get; init; }
    public required string[][] Pairs { get; init; }
    public required WritePrompt Write { get; init; }
    public required ExamQuestion[] Exam { get; init; }
}
