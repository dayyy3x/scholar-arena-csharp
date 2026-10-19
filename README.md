# Scholar Arena (C# / ASP.NET Core)

A gamified academic command center with an AI study tutor. Pick a class, drill
its material four different ways, generate fresh flashcards on demand, and track
your schedule, assignments, and study time — all in one dark, arcade-styled
dashboard.

This is a **C# / ASP.NET Core 9** port of the original Next.js/React app. The
backend owns the data and the two AI endpoints; the frontend is **plain
HTML + CSS + vanilla JavaScript** served from `wwwroot/` — no React, no
TypeScript, no build step.

---

## What it does

Each class is a **"loadout"** you equip. Selecting one loads its deck, its match
set, its written prompt, its mock exam, and its own mastery score.

**Four study modes, per class:**

- **Flash** — flip-card active recall. Cards you miss resurface more often until
  you clear them.
- **Match** — tile-matching between terms and definitions.
- **Write** — a short free-response prompt graded on whether you hit the key
  concepts (keyword scoring, done client-side).
- **Exam** — a multiple-choice mock quiz with scoring.

**AI, server-side (needs a key):**

- **Generate Cards** — the tutor writes brand-new flashcards for the selected
  subject on demand. (`POST /api/academics/gen-deck`)
- **SCHOLAR tutor chat** — an academic coach grounded in your real course data:
  grade weights, due dates, this week's work shifts, next payday. It helps you
  learn — it never does graded work for you. (`POST /api/academics/scholar`)

**Tracking (works with no key):**

- A month **calendar** overlaying classes, assignment due dates, work shifts,
  and paydays, with a jump-to-next-payday control.
- A **work recorder** — clock in on a class, study, and the session is logged.
- **Semester progress**, weeks-left, and total credit hours at a glance.

Mastery, streaks, generated decks, missed cards, and the tutor source are
persisted in `localStorage`, so progress survives a refresh.

---

## How it works

```
ScholarArena.csproj        # net9.0, Microsoft.NET.Sdk.Web
Program.cs                 # minimal-API host: static files + 3 endpoints
appsettings.json           # config (NO key committed here)
appsettings.Example.json   # where the key goes — copy + fill in
Models/Academics.cs        # records for the dataset + STUDY object
Data/AcademicsData.cs      # the course dataset + per-class study decks
Services/
  AnthropicClient.cs       # calls the Anthropic Messages API via HttpClient
  ScholarContext.cs        # buildCourseContext grounding + SCHOLAR persona
wwwroot/
  index.html               # full markup / page shell
  css/arena.css            # all styles (ported from the styled-jsx block)
  js/arena.js              # all interactivity (vanilla JS)
```

- **C# owns the data.** The dataset (classes, schedules, grading, life events)
  and the per-class study decks (flashcards, match pairs, write prompts, exams)
  live in `Data/AcademicsData.cs`. The browser fetches it once from
  `GET /api/academics/data` and renders everything from it.
- **The AI lives entirely in two endpoints.** The browser sends a subject (for
  deck generation) or a message + short history (for the tutor); the server
  calls the Anthropic Messages API (`https://api.anthropic.com/v1/messages`)
  directly over `HttpClient` and returns JSON. **Your key stays on the server.**
- **Grounding** — before the tutor answers, `ScholarContext.BuildCourseContext`
  assembles the focused class's real facts (meeting time, grade weights, late
  policy, the next few due dates, upcoming work shifts, next payday) and passes
  them as system context, so answers are specific to your schedule.

---

## Running it

Requirements: the **.NET 9 SDK** and (for the AI features) an
[Anthropic API key](https://console.anthropic.com/).

```bash
# 1. set your key — either as an environment variable:
#    (PowerShell)  $env:ANTHROPIC_API_KEY = "sk-ant-..."
#    (bash)        export ANTHROPIC_API_KEY=sk-ant-...
#
#    OR copy appsettings.Example.json to appsettings.Development.json and fill it
#    in (that file is gitignored):
cp appsettings.Example.json appsettings.Development.json

# 2. run
dotnet run
#    or pin the port:
dotnet run --urls http://localhost:5199
```

Then open the URL the server prints (e.g. <http://localhost:5199>).

The study modes, calendar, and recorder work with **no key** — only the
**Generate Cards** button and the **tutor chat** need `ANTHROPIC_API_KEY`. If
it's missing, those two endpoints return a clear JSON error with HTTP 502 and
the rest of the app keeps working.

### Configuration

| Setting             | Required | Default           | Purpose                              |
| ------------------- | -------- | ----------------- | ------------------------------------ |
| `ANTHROPIC_API_KEY` | for AI   | —                 | Powers the tutor and deck generator. |
| `SCHOLAR_MODEL`     | no       | `claude-sonnet-5` | Override the model used by both.     |

Both are read from the environment first, then from configuration
(`appsettings.json` / `appsettings.Development.json`).

---

## Privacy & secrets

- **No secrets are committed.** `appsettings.json` ships with an empty key; put
  your real key in an environment variable or in `appsettings.Development.json`,
  which is gitignored.
- All calls to Anthropic happen **server-side** — the key is never sent to the
  browser.
- The shipped dataset is entirely **fictional sample data** — no real people,
  schedules, or contact information.

---

## License

MIT — see [LICENSE](LICENSE).
