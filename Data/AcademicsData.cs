using ScholarArena.Models;

namespace ScholarArena.Data;

// Demo course dataset for Scholar Arena — ported verbatim from the React app's
// src/lib/academics.ts (CLASSES, TERM, LIFE_EVENTS, WEEK, COURSE_INFO,
// COURSE_DETAIL) plus the STUDY object seeded in AcademicsArena.tsx.
//
// Sample/placeholder data for a fictional "Fall 2026" term. Nothing here is real
// and no personal information is included.
public static class AcademicsData
{
    public static readonly Term Term = new(
        Name: "Fall 2026",
        School: "Demo University",
        Starts: "Aug 24",
        Ends: "Dec 10",
        CreditHours: 16);

    public static readonly AcademicClass[] Classes =
    {
        new("unix",    "CSCI 2200", "Unix Fundamentals",        "12:40p", "T/R", "Science Hall 120", "Prof. A. Rivera", "10001", 3, null, "", false, Array.Empty<int>()),
        new("web",     "CSCI 3110", "Advanced Web Development",  "10:10a", "T/R", "Science Hall 125", "Prof. J. Chen",   "10002", 3, null, "", false, Array.Empty<int>()),
        new("net",     "CSCI 3400", "Networking Fundamentals",   "5:00p",  "M/W", "Science Hall 137", "Dr. M. Osei",     "10003", 3, null, "", false, Array.Empty<int>()),
        new("data",    "CSCI 4047", "Data Analytics & Viz",      "ONLINE", "—",   "Online · async",   "Prof. L. Park",   "10004", 3, null, "", false, Array.Empty<int>()),
        new("softeng", "CSCI 4250", "Software Engineering I",    "12:35p", "M/W", "Science Hall 215", "Dr. S. Nasser",   "10005", 3, null, "", false, Array.Empty<int>()),
        new("biology", "BIOL 1110", "General Biology I",         "ASYNC",  "—",   "Online · lecture + lab", "Dr. B. Hollis", "10006", 4, null, "", false, Array.Empty<int>()),
    };

    public static readonly LifeEvent[] LifeEvents =
    {
        new("2026-08-26", "payday", "Payday"),
        new("2026-09-09", "payday", "Payday"),
        new("2026-09-23", "payday", "Payday"),
        new("2026-10-07", "payday", "Payday"),
        new("2026-10-21", "payday", "Payday"),
        new("2026-11-04", "payday", "Payday"),

        new("2026-08-29", "work", "Work shift", Sub: "Part-time job", Time: "9:00a – 5:00p"),
        new("2026-09-05", "work", "Work shift", Sub: "Part-time job", Time: "9:00a – 5:00p"),
        new("2026-09-12", "work", "Work shift", Sub: "Part-time job", Time: "9:00a – 5:00p"),
    };

    public static readonly WeekDay[] Week =
    {
        new("Monday", new[]
        {
            new WeekClass("CSCI 4250", "Software Engineering I", "12:35 – 2:35p", "Science Hall 215"),
            new WeekClass("CSCI 3400", "Networking Fundamentals", "5:00 – 6:50p", "Science Hall 137"),
        }),
        new("Tuesday", new[]
        {
            new WeekClass("CSCI 3110", "Advanced Web Development", "10:10a – 12:10p", "Science Hall 125"),
            new WeekClass("CSCI 2200", "Unix Fundamentals", "12:40 – 2:40p", "Science Hall 120"),
        }),
        new("Wednesday", new[]
        {
            new WeekClass("CSCI 4250", "Software Engineering I", "12:35 – 2:35p", "Science Hall 215"),
            new WeekClass("CSCI 3400", "Networking Fundamentals", "5:00 – 6:50p", "Science Hall 137"),
        }),
        new("Thursday", new[]
        {
            new WeekClass("CSCI 3110", "Advanced Web Development", "10:10a – 12:10p", "Science Hall 125"),
            new WeekClass("CSCI 2200", "Unix Fundamentals", "12:40 – 2:40p", "Science Hall 120"),
        }),
        new("Online", new[]
        {
            new WeekClass("CSCI 4047", "Data Analytics & Visualization", "async", "Online"),
            new WeekClass("BIOL 1110", "General Biology I", "async", "Online · lecture + lab"),
        }),
    };

    public static readonly Dictionary<string, CourseInfo> CourseInfo = new()
    {
        ["CSCI 2200"] = new CourseInfo
        {
            Instructor = "Prof. A. Rivera", Email = "instructor@university.edu", Office = "Science Hall 110",
            Meeting = "Tue/Thu 12:40 – 2:40p", Room = "Science Hall 120",
            Format = "In-person · Unix/Linux command line + bash scripting",
            Grading = new[]
            {
                new GradeComponent { Component = "Labs / Homework", Weight = "~400 pts" },
                new GradeComponent { Component = "In-class exercises", Weight = "~120 pts" },
                new GradeComponent { Component = "Exams (midterm + final)", Weight = "300 pts" },
                new GradeComponent { Component = "Quizzes", Weight = "~50 pts" },
            },
            Note = "Work-heavy — labs/homework outweigh exams. Late labs are not accepted.",
        },
        ["CSCI 3400"] = new CourseInfo
        {
            Instructor = "Dr. M. Osei", Email = "instructor@university.edu", Office = "Science Hall 152",
            Meeting = "Mon/Wed 5:00 – 6:50p", Room = "Science Hall 137",
            Format = "In-person lecture · OSI + TCP/IP, protocol-analyzer labs",
            Grading = new[]
            {
                new GradeComponent { Component = "Exams (3)", Weight = "70%" },
                new GradeComponent { Component = "Lab Exploration", Weight = "15%" },
                new GradeComponent { Component = "Conceptual Exercises", Weight = "15%" },
            },
            Note = "Exam-heavy — the 3 exams are 70%. No rounding; late work not accepted.",
        },
        ["CSCI 3110"] = new CourseInfo
        {
            Instructor = "Prof. J. Chen", Email = "instructor@university.edu", Office = "Science Hall 158",
            Meeting = "Tue/Thu 10:10a – 12:10p", Room = "Science Hall 125",
            Format = "In-person · server-side framework, a scripting language, and SQL",
            Grading = new[]
            {
                new GradeComponent { Component = "Tests (3 · in-class)", Weight = "60%" },
                new GradeComponent { Component = "Labs", Weight = "20%" },
                new GradeComponent { Component = "Term Project", Weight = "20%" },
            },
            Note = "Tests are in-class with no make-ups.",
        },
        ["CSCI 4047"] = new CourseInfo
        {
            Instructor = "Prof. L. Park", Email = "instructor@university.edu", Office = "Online",
            Meeting = "Online · asynchronous", Room = "Online",
            Format = "Fully online · data acquisition, analysis, visualization",
            Grading = new[]
            {
                new GradeComponent { Component = "Quizzes (~11)", Weight = "30%" },
                new GradeComponent { Component = "Exercises (~11)", Weight = "30%" },
                new GradeComponent { Component = "Final Exam", Weight = "20%" },
                new GradeComponent { Component = "Midterm Exam", Weight = "10%" },
                new GradeComponent { Component = "Project", Weight = "10%" },
            },
            Note = "Weekly grind — everything due Monday night. Steep late penalty.",
        },
        ["CSCI 4250"] = new CourseInfo
        {
            Instructor = "Dr. S. Nasser", Email = "instructor@university.edu", Office = "Science Hall 215",
            Meeting = "Mon/Wed 12:35 – 2:35p", Room = "Science Hall 215",
            Format = "In-person · full SDLC, team web-app project (Agile, git)",
            Grading = new[]
            {
                new GradeComponent { Component = "Exams (midterm + final)", Weight = "40%" },
                new GradeComponent { Component = "Team Project", Weight = "20%" },
                new GradeComponent { Component = "Class activities", Weight = "20%" },
                new GradeComponent { Component = "Quizzes", Weight = "10%" },
                new GradeComponent { Component = "Homework", Weight = "10%" },
            },
            Note = "Attendance enforced — misses cost a letter grade. Late work by prior approval only.",
        },
        ["BIOL 1110"] = new CourseInfo
        {
            Instructor = "Dr. B. Hollis", Email = "instructor@university.edu", Office = "By appointment",
            Meeting = "Online · asynchronous", Room = "Online · lecture + kit lab",
            Format = "Online · 8-week session · lecture + at-home kit lab",
            Grading = new[]
            {
                new GradeComponent { Component = "Lecture Tests (4)", Weight = "50%" },
                new GradeComponent { Component = "Lecture Assignments", Weight = "20%" },
                new GradeComponent { Component = "Lab Quizzes (6)", Weight = "15%" },
                new GradeComponent { Component = "Lab Assignments", Weight = "15%" },
            },
            Note = "Lecture 70% / Lab 30%, but a lab average below 60% is an automatic F. Fast pace — late = zero.",
        },
    };

    public static readonly Dictionary<string, CourseDetail> CourseDetail = new()
    {
        ["unix"] = new CourseDetail
        {
            School = "Demo University",
            Term = "Fall 2026 · In-person · Tue/Thu 12:40–2:40p",
            Overview = "The usage of UNIX and UNIX-like command environments — core command-line tools, the file system, and a UNIX scripting language (bash). The core of the class is hands-on practice: walk-throughs and problem-solving on a remote Linux server.",
            Format = "In-person lecture + lab. Heavy weekly lab/homework cadence; quizzes + exams online.",
            Instructor = "Prof. A. Rivera",
            Objectives = new[]
            {
                "Apply the basic UNIX command set (ssh, man, pwd, cd, ls, cat, cp, mv, rm, mkdir).",
                "Navigate the file system: permissions, hard & symbolic links, mount points.",
                "Edit files with common UNIX editors (nano & vim).",
                "Transform output with pipes and filters (cut, grep, sort, uniq, wc, tr, awk).",
                "Write bash: variables, selection, looping, functions.",
                "Use regular expressions and recursive directory traversal (find).",
            },
            KeyDates = new[]
            {
                new KeyDate("Term starts", "Aug 24, 2026"),
                new KeyDate("Term ends", "Dec 10, 2026"),
            },
            Grading = new[]
            {
                new GradeComponent { Component = "Labs / Homework (~10)", Weight = "~400 pts", Note = "the biggest chunk — practice-driven" },
                new GradeComponent { Component = "In-class exercises (~5)", Weight = "~120 pts" },
                new GradeComponent { Component = "Exams (midterm + final)", Weight = "300 pts" },
                new GradeComponent { Component = "Quizzes (~10)", Weight = "~50 pts" },
            },
            GradingRule = "Work-heavy — labs/homework outweigh exams.",
            Modules = new[]
            {
                new Module("Command environment", new[] { "Intro to Unix", "Directories", "Working with files", "Common commands" }),
                new Module("Text processing", new[] { "Pipes / filters", "Regular expressions", "find", "awk", "vim" }),
                new Module("Scripting", new[] { "bash scripting", "Formatting CLI output", "Intro to system administration" }),
            },
            Materials = new[] { "The Linux Command Line (Shotts)", "How Linux Works (Ward)" },
            LatePolicy = "Late labs/homework are not accepted. Missed quizzes can't be made up.",
        },
        ["web"] = new CourseDetail
        {
            School = "Demo University",
            Term = "Fall 2026 · In-person · Tue/Thu 10:10a–12:10p",
            Overview = "Advanced web coding: building accessible, modern web applications that integrate current web standards, with a server-side framework, a client-side scripting language, and a relational database.",
            Format = "In-person lecture + lab. Labs every other week; a multi-deliverable term project.",
            Instructor = "Prof. J. Chen",
            Objectives = new[]
            {
                "Understand advanced web coding concepts.",
                "Implement web applications using advanced web-development concepts.",
                "Add usability to a page using a current scripting language or tool.",
                "Create an accessible, modern web application that integrates current web standards.",
            },
            KeyDates = new[]
            {
                new KeyDate("Term starts", "Aug 24, 2026"),
                new KeyDate("Term ends", "Dec 10, 2026"),
            },
            Grading = new[]
            {
                new GradeComponent { Component = "Tests (3 · in-class)", Weight = "60%", Note = "no make-ups" },
                new GradeComponent { Component = "Labs", Weight = "20%" },
                new GradeComponent { Component = "Term Project", Weight = "20%" },
            },
            Modules = new[]
            {
                new Module("Prerequisites", new[] { "Object-oriented programming", "Database concepts", "HTML, CSS" }),
                new Module("Development", new[] { "Server-side framework", "Client-side scripting", "SQL", "An editor/IDE" }),
            },
            Materials = new[] { "Lectures + labs (no textbook)." },
            LatePolicy = "Tests are in-class with no make-ups.",
        },
        ["net"] = new CourseDetail
        {
            School = "Demo University",
            Term = "Fall 2026 · In-person · Mon/Wed 5:00–6:50p",
            Overview = "Study of computer network operation: the OSI and TCP/IP models, network media, LAN theory & practice, switching/routing, and TCP/IP operation. A protocol analyzer is used extensively.",
            Format = "In-person lecture, organized around module-based learning with online content + assessment.",
            Instructor = "Dr. M. Osei",
            Objectives = new[]
            {
                "Describe the basic hardware and software components of networking.",
                "Describe the OSI networking model and each layer's responsibilities.",
                "Demonstrate operation of selected applications/hardware for running networks.",
                "Use network utilities like protocol analyzers to illustrate network operations.",
            },
            KeyDates = new[]
            {
                new KeyDate("Term starts", "Aug 24, 2026"),
                new KeyDate("Term ends", "Dec 10, 2026"),
            },
            Grading = new[]
            {
                new GradeComponent { Component = "Exams (3 · 2 chapters each)", Weight = "70%" },
                new GradeComponent { Component = "Lab Exploration Activities", Weight = "15%" },
                new GradeComponent { Component = "Conceptual Application Exercises", Weight = "15%" },
            },
            GradingRule = "No rounding of calculated grades.",
            Modules = new[]
            {
                new Module("Foundations", new[] { "Networking overview", "OSI & Internet models" }),
                new Module("Upper layers", new[] { "Application (HTTP, DNS)", "Transport (TCP vs UDP)" }),
                new Module("Lower layers", new[] { "Network (IP addressing/routing)", "Data link (Ethernet)", "Physical media" }),
            },
            Materials = new[] { "A standard top-down computer networking textbook.", "A free protocol analyzer (e.g. Wireshark)." },
            LatePolicy = "Exam-heavy. No rounding; late work not accepted.",
        },
        ["softeng"] = new CourseDetail
        {
            School = "Demo University",
            Term = "Fall 2026 · In-person · Mon/Wed 12:35–2:35p",
            Overview = "Software systems development as an engineering discipline. All phases of the SDLC are examined — requirements, design, construction, testing, maintenance — with a realistic team project, automated tooling, and written & oral communication.",
            Format = "In-person. Team project is a web app managed with Agile practices and git.",
            Instructor = "Dr. S. Nasser",
            Objectives = new[]
            {
                "Understand the software development lifecycle and lifecycle models.",
                "Create, evaluate, and use project artifacts in each SDLC phase.",
                "Participate on project teams across the SDLC activities.",
                "Show awareness of legal, professional, and ethical issues in software engineering.",
                "Use tools to track requirements, model design, write code, test, and manage progress.",
            },
            KeyDates = new[]
            {
                new KeyDate("Term starts", "Aug 24, 2026"),
                new KeyDate("Quiz 1 available", "Aug 31, 2026"),
                new KeyDate("Term ends", "Dec 10, 2026"),
            },
            Grading = new[]
            {
                new GradeComponent { Component = "Exams (midterm + final)", Weight = "40%" },
                new GradeComponent { Component = "Class activities", Weight = "20%" },
                new GradeComponent { Component = "Team Project", Weight = "20%" },
                new GradeComponent { Component = "Quizzes", Weight = "10%" },
                new GradeComponent { Component = "Homework", Weight = "10%" },
            },
            Modules = new[]
            {
                new Module("Process & modeling", new[] { "SDLC & lifecycle models", "Requirements analysis", "UML modeling" }),
                new Module("Build", new[] { "Design", "Implementation & refactoring", "Manual & automated testing" }),
                new Module("Delivery", new[] { "Source control", "CI/CD pipeline", "Process models" }),
            },
            Materials = new[] { "No required textbook." },
            LatePolicy = "Attendance is tracked — misses cost a letter grade. Late work needs prior approval.",
            Schedule = new[]
            {
                new ScheduleWeek(1, new[] { new ScheduleItem("Quiz 1", "2026-08-31", "quiz") }),
            },
        },
        ["data"] = new CourseDetail
        {
            School = "Demo University",
            Term = "Fall 2026 · Online · asynchronous",
            Overview = "Data acquisition, cleaning, analysis, and visualization using readily available tools to discover trends and inform decisions. No prior programming required. Topics: data exploration, preprocessing, model selection and evaluation, classification, clustering, and presentation.",
            Format = "Fully online, asynchronous. Lecture videos per module; weekly quizzes + exercises due Monday night.",
            Instructor = "Prof. L. Park",
            Objectives = new[]
            {
                "Define basic concepts in data analytics and list state-of-the-art technologies.",
                "Design applications to conduct data analytics using scientific methods.",
                "Critique data mining techniques and their suitability to a given problem.",
                "Interpret and visualize knowledge extracted from data.",
                "Draw reasonable conclusions and argue for trends in a dataset.",
            },
            KeyDates = new[]
            {
                new KeyDate("Term starts", "Aug 24, 2026"),
                new KeyDate("Week 1 quiz + Exercise 1 due", "Aug 31, 2026"),
                new KeyDate("Term ends", "Dec 10, 2026"),
            },
            Grading = new[]
            {
                new GradeComponent { Component = "Quizzes (~11)", Weight = "30%" },
                new GradeComponent { Component = "Exercises (~11)", Weight = "30%" },
                new GradeComponent { Component = "Final Exam", Weight = "20%" },
                new GradeComponent { Component = "Midterm Exam", Weight = "10%" },
                new GradeComponent { Component = "Project", Weight = "10%" },
            },
            Modules = new[]
            {
                new Module("Foundations", new[] { "What is data analytics", "R vs Python" }),
                new Module("Techniques", new[] { "Classification", "Clustering", "Model evaluation" }),
                new Module("Communication", new[] { "Visualization", "Reporting" }),
            },
            Materials = new[] { "Optional: a standard data-mining / data-analysis textbook." },
            LatePolicy = "Steep late penalty, scaling per day. Everything due Monday night.",
            Schedule = new[]
            {
                new ScheduleWeek(1, new[]
                {
                    new ScheduleItem("Quiz 1 — What is Data Analytics", "2026-08-31", "quiz"),
                    new ScheduleItem("Exercise 1", "2026-08-31", "assignment"),
                }),
            },
        },
        ["biology"] = new CourseDetail
        {
            School = "Demo University",
            Term = "Fall 2026 · 8-week online session",
            Overview = "Principles and concepts of biology — basic biological chemistry, molecular and cellular biology, metabolism and energy, genetics, evolution, and ecology. On completion you should understand life at the molecular and cellular levels.",
            Format = "100% online, asynchronous. Includes an online lab with hands-on kit work (photo-documented submissions).",
            Instructor = "Dr. B. Hollis",
            Objectives = new[]
            {
                "Summarize the role of chemistry in basic biological sciences.",
                "Characterize the role of major molecular groups in biology.",
                "Recognize the components of cells and compare the major cell types.",
                "Apply the rules of energy transfer to metabolism and photosynthesis.",
                "Explain genetic inheritance and its role in evolution.",
                "Demonstrate the basic principles of ecology.",
            },
            KeyDates = new[]
            {
                new KeyDate("Course starts", "Aug 17, 2026"),
                new KeyDate("Withdrawal deadline", "Sep 21, 2026"),
                new KeyDate("Course ends", "Oct 12, 2026"),
            },
            Grading = new[]
            {
                new GradeComponent { Component = "Lecture — Tests (4)", Weight = "50%" },
                new GradeComponent { Component = "Lecture — Assignments", Weight = "20%" },
                new GradeComponent { Component = "Lab — Quizzes (6)", Weight = "15%" },
                new GradeComponent { Component = "Lab — Assignments", Weight = "15%" },
            },
            GradingRule = "Lecture = 70%, Lab = 30%. A lab average below 60% is an automatic F.",
            Materials = new[] { "Required textbook / lab manual + an at-home lab kit." },
            LatePolicy = "The course moves fast — late submissions receive a zero.",
            Schedule = new[]
            {
                new ScheduleWeek(1, new[]
                {
                    new ScheduleItem("Course Entry Assignment", "2026-08-20", "assignment"),
                    new ScheduleItem("Mindset Journal", "2026-08-24", "journal"),
                    new ScheduleItem("Week 1 Quizzes", "2026-08-24", "quiz"),
                    new ScheduleItem("Lab 1 — Getting Started & Lab Safety", "2026-08-31", "lab"),
                    new ScheduleItem("Lab 2 — The Scientific Method", "2026-08-31", "lab"),
                }),
                new ScheduleWeek(2, new[]
                {
                    new ScheduleItem("Week 2 Quizzes", "2026-08-31", "quiz"),
                    new ScheduleItem("Lab Quiz 1", "2026-08-31", "quiz"),
                    new ScheduleItem("Lab 3 — Biological Macromolecules", "2026-08-31", "lab"),
                }),
                new ScheduleWeek(3, new[]
                {
                    new ScheduleItem("Lecture 1 Test", "2026-09-08", "test"),
                    new ScheduleItem("Lab 5 — Cell Membrane Transport", "2026-09-08", "lab"),
                    new ScheduleItem("Lab 6 — Diffusion & Osmosis", "2026-09-08", "lab"),
                }),
                new ScheduleWeek(4, new[]
                {
                    new ScheduleItem("Lab 8 — Cellular Respiration", "2026-09-14", "lab"),
                    new ScheduleItem("Lab 9 — Photosynthesis", "2026-09-14", "lab"),
                }),
                new ScheduleWeek(5, new[]
                {
                    new ScheduleItem("Lecture 2 Test", "2026-09-21", "test"),
                    new ScheduleItem("Lab 10 — Mitosis & Meiosis", "2026-09-21", "lab"),
                }),
                new ScheduleWeek(6, new[]
                {
                    new ScheduleItem("Lab 11 — Mendelian Genetics", "2026-09-28", "lab"),
                    new ScheduleItem("Lab 12 — Population Genetics", "2026-09-28", "lab"),
                }),
                new ScheduleWeek(7, new[]
                {
                    new ScheduleItem("Lecture Test 3", "2026-10-05", "test"),
                    new ScheduleItem("Case Study", "2026-10-05", "assignment"),
                }),
                new ScheduleWeek(8, new[]
                {
                    new ScheduleItem("End of Class Journal", "2026-10-12", "journal"),
                    new ScheduleItem("Lecture Test 4", "2026-10-12", "test"),
                }),
            },
        },
    };

    public static readonly Dictionary<string, StudyDeck> Study = new()
    {
        ["unix"] = new StudyDeck
        {
            Weak = "pipes & permissions",
            Flash = new[]
            {
                new FlashCard("What does chmod 755 grant?", "Owner rwx (7), group r-x (5), others r-x (5). Read+execute for everyone, write for the owner only."),
                new FlashCard("What does the pipe | do?", "Sends stdout of the left command into stdin of the right — chain small tools, e.g. cat log | grep err | wc -l."),
                new FlashCard("grep vs find?", "grep searches file CONTENTS for a pattern; find searches the filesystem for files by name/attributes."),
            },
            Pairs = new[]
            {
                new[] { "ls", "List directory" },
                new[] { "grep", "Search text" },
                new[] { "chmod", "Change permissions" },
                new[] { "|", "Pipe stdout → stdin" },
            },
            Write = new WritePrompt(
                "Explain what `cat access.log | grep 404 | wc -l` does, command by command.",
                new[] { "cat", "grep", "wc", "pipe", "count" },
                "cat prints the file to stdout; the pipe feeds it to grep, which keeps only lines containing 404; that pipes to wc -l, which counts lines. Net: the number of 404 requests in the log."),
            Exam = new[]
            {
                new ExamQuestion("chmod 644 on a file gives others…", new[] { "read+write", "read only", "nothing", "execute" }, 1),
                new ExamQuestion("Which sends output of one command into another?", new[] { "&&", "|", ">>", ";" }, 1),
                new ExamQuestion("To find files named *.log you use…", new[] { "grep", "find", "cat", "chmod" }, 1),
            },
        },
        ["web"] = new StudyDeck
        {
            Weak = "REST & status codes",
            Flash = new[]
            {
                new FlashCard("GET vs POST?", "GET retrieves data and is idempotent/cacheable with no body; POST sends a body to create/change server state and is not idempotent."),
                new FlashCard("404 vs 500?", "404 = client asked for something that isn't there; 500 = the server errored handling a valid request."),
                new FlashCard("What makes an API RESTful?", "Resources addressed by URL, HTTP verbs for actions (GET/POST/PUT/DELETE), stateless requests, standard status codes."),
            },
            Pairs = new[]
            {
                new[] { "GET", "Read a resource" },
                new[] { "POST", "Create a resource" },
                new[] { "404", "Not found" },
                new[] { "500", "Server error" },
            },
            Write = new WritePrompt(
                "A client PUTs to /users/7 and gets 404. Explain what that means and one likely cause.",
                new[] { "put", "404", "not found", "resource", "id" },
                "PUT updates a resource at a known URL; 404 means user 7 doesn't exist on the server, so there's nothing to update. Likely cause: the id is wrong or the record was never created/was deleted."),
            Exam = new[]
            {
                new ExamQuestion("Which verb should create a new resource?", new[] { "GET", "POST", "DELETE", "HEAD" }, 1),
                new ExamQuestion("A 500 status means…", new[] { "Bad client request", "Resource missing", "Server-side error", "Redirect" }, 2),
                new ExamQuestion("REST APIs are…", new[] { "Stateful", "Stateless", "Always XML", "Session-bound" }, 1),
            },
        },
        ["net"] = new StudyDeck
        {
            Weak = "OSI layers & TCP/IP",
            Flash = new[]
            {
                new FlashCard("TCP vs UDP?", "TCP is connection-oriented, ordered, and reliable (handshake + acks); UDP is connectionless and fast with no delivery guarantee — good for streaming/games."),
                new FlashCard("What is a subnet mask?", "It splits an IP into network + host portions, e.g. /24 (255.255.255.0) = 256 addresses, 254 usable hosts."),
                new FlashCard("Name the OSI layers, bottom to top.", "Physical, Data Link, Network, Transport, Session, Presentation, Application."),
            },
            Pairs = new[]
            {
                new[] { "TCP", "Reliable, ordered" },
                new[] { "UDP", "Fast, no guarantee" },
                new[] { "IP", "Network layer address" },
                new[] { "/24", "254 usable hosts" },
            },
            Write = new WritePrompt(
                "Why would a video call use UDP instead of TCP?",
                new[] { "udp", "fast", "retransmit", "latency", "real" },
                "Real-time calls care about low latency, not perfect delivery. TCP would retransmit lost packets and stall the stream; UDP just keeps going, so a dropped frame is better than a frozen call."),
            Exam = new[]
            {
                new ExamQuestion("Which is connectionless?", new[] { "TCP", "UDP", "HTTP", "FTP" }, 1),
                new ExamQuestion("The Transport layer is OSI layer…", new[] { "2", "3", "4", "7" }, 2),
                new ExamQuestion("A /24 subnet has how many usable hosts?", new[] { "256", "254", "128", "512" }, 1),
            },
        },
        ["data"] = new StudyDeck
        {
            Weak = "chart choice & pandas",
            Flash = new[]
            {
                new FlashCard("Bar chart vs line chart — when?", "Bar compares discrete categories; line shows a continuous trend over time. Don't use a line for unordered categories."),
                new FlashCard("What is a pandas DataFrame?", "A 2-D labeled table — rows + named columns — the core structure for tabular analysis in Python."),
                new FlashCard("Why normalize data before comparing?", "Features on different scales (age vs income) distort distance/weight; normalizing puts them on a common 0–1 (or z-score) scale."),
            },
            Pairs = new[]
            {
                new[] { "Bar chart", "Compare categories" },
                new[] { "Line chart", "Trend over time" },
                new[] { "DataFrame", "Labeled table" },
                new[] { "Histogram", "Distribution of one variable" },
            },
            Write = new WritePrompt(
                "You have monthly revenue for 3 years. Which chart, and why not the alternative?",
                new[] { "line", "time", "trend", "continuous", "bar" },
                "A line chart — revenue over time is continuous and ordered, so a line shows the trend and seasonality. A bar chart would work but hides the flow and gets cluttered at 36 points."),
            Exam = new[]
            {
                new ExamQuestion("Best chart for a trend over time?", new[] { "Pie", "Bar", "Line", "Scatter" }, 2),
                new ExamQuestion("A pandas DataFrame is…", new[] { "A 1-D array", "A labeled 2-D table", "A plot", "A database" }, 1),
                new ExamQuestion("A histogram shows…", new[] { "Category totals", "A distribution", "Correlation", "Time trend" }, 1),
            },
        },
        ["softeng"] = new StudyDeck
        {
            Weak = "SDLC & testing",
            Flash = new[]
            {
                new FlashCard("Unit vs integration test?", "A unit test checks one function/class in isolation; an integration test checks that multiple components work together."),
                new FlashCard("What is Agile in one line?", "Iterative delivery in short sprints with continuous feedback, over big up-front planning (waterfall)."),
                new FlashCard("What problem do design patterns solve?", "They're reusable, named solutions to common design problems (e.g. Observer, Factory, Singleton) — shared vocabulary + proven structure."),
            },
            Pairs = new[]
            {
                new[] { "Unit test", "One component, isolated" },
                new[] { "Integration test", "Components together" },
                new[] { "Agile", "Iterative sprints" },
                new[] { "Waterfall", "Sequential phases" },
            },
            Write = new WritePrompt(
                "Explain why you'd write a unit test before fixing a reported bug.",
                new[] { "reproduce", "fail", "test", "regression", "pass" },
                "Write a test that reproduces the bug — it should FAIL first, proving you captured the defect. Fix the code until it passes. The test then stays as a regression guard so the bug can't silently return."),
            Exam = new[]
            {
                new ExamQuestion("Testing one function in isolation is a…", new[] { "Integration test", "Unit test", "Load test", "Smoke test" }, 1),
                new ExamQuestion("Agile favors…", new[] { "Big up-front design", "Iterative sprints", "No planning", "One release" }, 1),
                new ExamQuestion("Singleton is a…", new[] { "Data structure", "Design pattern", "Test type", "Protocol" }, 1),
            },
        },
        ["biology"] = new StudyDeck
        {
            Weak = "energy: photosynthesis vs respiration",
            Flash = new[]
            {
                new FlashCard("Name the four major biological macromolecules and their monomers.", "Carbohydrates (monosaccharides), lipids (fatty acids + glycerol), proteins (amino acids), nucleic acids (nucleotides)."),
                new FlashCard("Prokaryotic vs eukaryotic cell?", "Prokaryotes (bacteria) have NO nucleus or membrane-bound organelles; eukaryotes have a true nucleus + organelles (mitochondria, ER, Golgi)."),
                new FlashCard("What is ATP and why does it matter?", "Adenosine triphosphate — the cell's energy currency. Breaking a phosphate bond (ATP → ADP) releases energy that powers cellular work."),
                new FlashCard("Cellular respiration vs photosynthesis?", "Respiration: glucose + O₂ → CO₂ + H₂O + ATP (releases energy). Photosynthesis: light + CO₂ + H₂O → glucose + O₂ (stores energy). Opposite directions — the products of one feed the other."),
                new FlashCard("Diffusion vs osmosis?", "Diffusion = solutes move high → low concentration. Osmosis = WATER moves across a selectively-permeable membrane toward higher solute concentration."),
                new FlashCard("What do enzymes do?", "Biological catalysts (usually proteins) that speed reactions by lowering activation energy. Each is specific to its substrate."),
                new FlashCard("Mitosis vs meiosis?", "Mitosis → 2 genetically identical diploid cells (growth/repair). Meiosis → 4 genetically varied haploid gametes (sex cells)."),
                new FlashCard("Mendel's law of segregation + genotype vs phenotype?", "Each parent passes one of its two alleles per trait; alleles separate during gamete formation. Genotype = the alleles (e.g. Bb); phenotype = the observable trait (e.g. brown eyes)."),
                new FlashCard("Natural selection in one line?", "Individuals with heritable traits better suited to their environment survive and reproduce more, so those traits become more common over generations."),
            },
            Pairs = new[]
            {
                new[] { "Carbohydrate", "Energy + structure (sugars)" },
                new[] { "Protein", "Enzymes + structure (amino acids)" },
                new[] { "Mitochondria", "Makes ATP (powerhouse)" },
                new[] { "Osmosis", "Water across a membrane" },
                new[] { "Meiosis", "4 varied haploid gametes" },
                new[] { "Enzyme", "Lowers activation energy" },
            },
            Write = new WritePrompt(
                "Explain how photosynthesis and cellular respiration are linked in the flow of energy and matter through living things.",
                new[] { "photosynthesis", "respiration", "glucose", "atp", "oxygen", "co2", "energy" },
                "Photosynthesis uses light energy to build glucose from CO₂ and water, releasing O₂. Cellular respiration then breaks that glucose back down using O₂, releasing CO₂ and water and capturing the energy as ATP. The products of one are the reactants of the other — energy flows in as light and out as ATP + heat, while carbon and oxygen cycle between the two."),
            Exam = new[]
            {
                new ExamQuestion("Which is the cell's main energy currency?", new[] { "DNA", "ATP", "Glucose", "RNA" }, 1),
                new ExamQuestion("Osmosis is the movement of…", new[] { "solutes high→low", "water across a membrane", "ATP into the cell", "oxygen out" }, 1),
                new ExamQuestion("Meiosis produces…", new[] { "2 identical diploid cells", "4 varied haploid gametes", "2 haploid clones", "1 diploid zygote" }, 1),
                new ExamQuestion("Enzymes speed reactions by…", new[] { "adding heat", "lowering activation energy", "raising pH", "breaking the membrane" }, 1),
            },
        },
    };
}
