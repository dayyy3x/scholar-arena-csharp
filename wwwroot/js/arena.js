/* ═══════════════════════════════════════════════════════
   ACADEMICS — THE ARENA (vanilla JS port of AcademicsArena.tsx)
   All interactivity reproduced: 4 study modes, match game,
   keyword-graded WRITE, EXAM scoring, flip cards with missed-card
   resurfacing, Generate Cards, SCHOLAR chat, full calendar model
   + month nav + day detail, work recorder, localStorage persistence.
   Data comes from GET /api/academics/data (C# owns it).
   ═══════════════════════════════════════════════════════ */
(function () {
  "use strict";

  // palette (matches AcademicsArena.tsx)
  const BG = "#0B0B0C", PANEL = "#121214", PANEL2 = "#18181B", LINE = "#232326";
  const INK = "#F4F2EE", DIM = "#8E8C88", MUTE = "#5A5956", REDD = "#E5484D", GOOD = "#63B57F";

  const MODES = ["FLASH", "MATCH", "WRITE", "EXAM"];
  const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const CLASS_META = {
    "CSCI 2200": { color: "#63B57F" }, "CSCI 3110": { color: "#A86DFF" }, "CSCI 3400": { color: "#E5484D" },
    "CSCI 4047": { color: "#E8912A" }, "CSCI 4250": { color: "#D9B15A" }, "BIOL 1110": { color: "#4FB0A2" },
  };
  const KIND_COLOR = { test: "#E5484D", quiz: "#E8912A", lab: "#63B57F", journal: "#A86DFF", assignment: "#E5484D" };
  const LIFE_META = {
    payday: { color: "#3FB950", icon: "💵", label: "Payday" },
    work: { color: "#6E8BB5", icon: "💼", label: "Work" },
    assignment: { color: "#E5484D", icon: "📝", label: "Assignment" },
  };
  const SEM_START = new Date("2026-08-24T00:00:00");
  const SEM_END = new Date("2026-12-10T23:59:59");

  // ── state ──
  let DATA = null; // {term,classes,study,courseDetail,courseInfo,week,lifeEvents}
  let cls = "biology";
  let mode = 0;

  const lsGet = (k, d) => { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch { return d; } };
  const lsSet = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { } };

  const DEFAULT_MASTERY = { unix: 0, web: 0, net: 0, data: 0, softeng: 0, biology: 0 };
  let mastery = Object.assign({}, DEFAULT_MASTERY, lsGet("acadMastery", {}));
  let streak = lsGet("acadStreak", { count: 0, last: "" });
  let missed = lsGet("acadMissed", {});
  let extraCards = lsGet("acadExtra", {});
  let src = (function () { try { return localStorage.getItem("scholarSrc") || "hq"; } catch { return "hq"; } })();

  const now0 = new Date();
  let monthCursor = { y: now0.getFullYear(), m: now0.getMonth() };
  let selDate = isoLocal(now0);

  // flash
  let fIdx = 0, showA = false, genning = false;
  // match
  let tiles = [], sel = null, locked = [], wrong = [];
  // write
  let essay = "", graded = null;
  // exam
  let answers = {}, submitted = false;
  // chat
  let msgs = [{ who: "agent", text: "I'm SCHOLAR, your study coach. Pick a class, then Flash / Match / Write / Exam to drill it, hit Generate Cards for a fresh AI deck, or ask me anything about the material. I run active-recall and never submit work for you." }];
  let draft = "", typing = false;
  // recorder
  let rec = null, task = "", sessions = [], recIv = null;
  // modals
  let openClassCode = null, openDayObj = null;

  // ── helpers ──
  function esc(s) { return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
  function isoLocal(d) { return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); }
  function sameDay(a, b) { return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate(); }
  function fmt(sec) {
    const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), x = sec % 60;
    return h ? h + ":" + String(m).padStart(2, "0") + ":" + String(x).padStart(2, "0") : String(m).padStart(2, "0") + ":" + String(x).padStart(2, "0");
  }
  const classOf = (id) => DATA.classes.find(c => c.id === id);
  const $ = (id) => document.getElementById(id);

  function hbStyle(o) {
    o = o || {};
    const color = o.active ? BG : o.danger ? REDD : INK;
    const bg = o.active ? REDD : "transparent";
    const bc = o.active ? REDD : o.danger ? REDD : INK;
    return "font-family:'Archivo Black',sans-serif;font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:" + color +
      ";background:" + bg + ";border:2px solid " + bc + ";padding:9px 16px;cursor:" + (o.disabled ? "default" : "pointer") +
      ";opacity:" + (o.disabled ? ".35" : "1") + ";transition:transform .12s ease,box-shadow .12s ease,background .15s,color .15s;" + (o.extra || "");
  }

  // ── streak / mastery ──
  function touchStreak() {
    const today = new Date().toLocaleDateString("en-CA");
    if (streak.last === today) return;
    const y = new Date(Date.now() - 864e5).toLocaleDateString("en-CA");
    streak = { count: streak.last === y ? streak.count + 1 : 1, last: today };
    lsSet("acadStreak", streak);
  }
  function bump(d) {
    touchStreak();
    mastery[cls] = Math.max(0, Math.min(100, (mastery[cls] || 0) + d));
    lsSet("acadMastery", mastery);
    renderMastery();
  }
  function markCard(idx, wasMissed) {
    const cur = new Set(missed[cls] || []);
    if (wasMissed) cur.add(idx); else cur.delete(idx);
    missed = Object.assign({}, missed, { [cls]: [...cur] });
    lsSet("acadMissed", missed);
  }

  // ── calendar model ──
  function bioItems() {
    const sched = (DATA.courseDetail.biology && DATA.courseDetail.biology.schedule) || [];
    const out = [];
    sched.forEach(w => w.items.forEach(it => out.push({ name: it.name, kind: it.kind, d: new Date(it.due + "T00:00:00") })));
    return out;
  }
  function eventsForDate(d) {
    const evs = [];
    const wd = d.toLocaleDateString("en-US", { weekday: "long" });
    const wk = DATA.week.find(x => x.day === wd);
    if (wk) for (const c of wk.classes) evs.push({ code: c.code, title: c.code, sub: c.title, time: c.time, room: c.room, color: (CLASS_META[c.code] || {}).color || REDD, kind: "class" });
    for (const it of bioItems()) if (sameDay(it.d, d)) evs.push({ code: "BIOL 1110", title: it.name, sub: "General Biology I · due", time: "11:59p", room: "online", color: KIND_COLOR[it.kind] || "#4FB0A2", kind: it.kind });
    if (wd === "Monday" && d >= SEM_START && d <= SEM_END) evs.push({ code: "CSCI 4047", title: "Quiz + Exercise due", sub: "Data Analytics · online", time: "11:59p", room: "online", color: "#E8912A", kind: "quiz" });
    const iso = isoLocal(d);
    for (const le of DATA.lifeEvents) if (le.date === iso) {
      const m = LIFE_META[le.kind] || {};
      const amt = le.amount != null ? "$" + le.amount.toLocaleString() : "";
      const defSub = le.kind === "payday" ? (amt || "Direct deposit") : le.kind === "work" ? "Shift" : "Due";
      evs.push({ code: le.title, title: ((m.icon || "") + " " + le.title).trim(), sub: le.sub || defSub, time: le.time || "", room: le.kind === "payday" && amt ? amt : "", color: m.color || DIM, kind: le.kind, icon: m.icon });
    }
    const rank = { payday: 0, work: 1, class: 2 };
    return evs.sort((a, b) => (rank[a.kind] != null ? rank[a.kind] : 3) - (rank[b.kind] != null ? rank[b.kind] : 3));
  }
  function nextPayday() {
    return DATA.lifeEvents.filter(le => le.kind === "payday").map(le => ({ le, d: new Date(le.date + "T00:00:00") }))
      .filter(x => x.d >= now0).sort((a, b) => a.d - b.d)[0];
  }

  // ═══ RENDER ═══
  function renderAll() {
    renderStat();
    renderTiles();
    renderCalendar();
    renderMastery();
    renderIntel();
    renderArena();
    renderRecorder();
    renderChat();
    renderTopRec();
  }

  function renderStat() {
    const totalCr = DATA.classes.reduce((a, c) => a + (c.credits || 0), 0);
    const semPct = Math.max(0, Math.min(100, ((now0 - SEM_START) / (SEM_END - SEM_START)) * 100));
    const weeksLeft = Math.max(0, Math.ceil((SEM_END - now0) / (7 * 864e5)));
    $("sa-credits").textContent = DATA.classes.length + " CLASSES · " + totalCr + " HRS";
    $("sa-weeksleft").textContent = (semPct <= 0 ? "starts Aug 24" : weeksLeft + " weeks left") + " · " + DATA.term.name;
    $("sa-sembar").style.width = "calc(" + Math.max(0, semPct) + "% - 3px)";
    // count-up on the big number
    const target = Math.round(semPct);
    const node = $("sa-sempct"), t0 = performance.now(), dur = 900;
    (function tick(t) {
      const p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3), v = Math.round(target * e);
      node.innerHTML = v + '<span style="font-size:46px;color:' + GOOD + '">%</span>';
      if (p < 1) requestAnimationFrame(tick);
    })(t0);
  }

  function renderTiles() {
    const box = $("sa-tiles");
    box.innerHTML = DATA.classes.map((c, i) => {
      const active = c.id === cls;
      return '<div data-tile="' + c.id + '" class="ctile slide" style="animation-delay:' + (i * 70) + 'ms;background:' + (active ? PANEL2 : PANEL) +
        ';border:2px solid ' + (active ? REDD : c.risk ? "rgba(229,72,77,.5)" : LINE) +
        ';box-shadow:' + (active ? "5px 5px 0 rgba(229,72,77,.9)" : "none") +
        ';transform:' + (active ? "translate(-2px,-2px)" : "none") + ';padding:13px 15px;position:relative;">' +
        '<div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:3px;">' +
        '<span class="disp" style="font-size:12px;letter-spacing:.05em;color:' + (active ? INK : DIM) + '">' + esc(c.name) + '</span>' +
        '<span class="disp num" style="font-size:9px;color:' + DIM + '">' + c.credits + '.0 HR</span></div>' +
        '<div style="font-size:11px;color:' + (active ? INK : MUTE) + ';margin-bottom:9px;line-height:1.25;min-height:28px;">' + esc(c.title) + '</div>' +
        '<div style="display:flex;align-items:baseline;gap:8px;">' +
        '<span class="disp num" style="font-size:' + (c.time === "ONLINE" ? 17 : 23) + 'px;letter-spacing:-.02em;">' + esc(c.time) + '</span>' +
        '<span class="disp" style="font-size:13px;color:' + DIM + '">' + esc(c.days) + '</span></div>' +
        '<div style="font-size:10.5px;color:' + MUTE + ';margin-top:7px;line-height:1.45;">' + esc(c.room) + '<br>' + esc(c.prof) + ' · CRN ' + esc(c.crn) + '</div></div>';
    }).join("");
    box.querySelectorAll("[data-tile]").forEach(n => n.onclick = () => switchClass(n.getAttribute("data-tile")));
  }

  function renderCalendar() {
    const firstOfMonth = new Date(monthCursor.y, monthCursor.m, 1);
    const gridStart = new Date(firstOfMonth); gridStart.setDate(1 - firstOfMonth.getDay());
    const calCells = Array.from({ length: 42 }, (_, i) => {
      const d = new Date(gridStart); d.setDate(gridStart.getDate() + i);
      return { d, inMonth: d.getMonth() === monthCursor.m, iso: isoLocal(d), isToday: sameDay(d, now0), events: eventsForDate(d) };
    });
    const np = nextPayday();
    const npDays = np ? Math.ceil((np.d - now0) / 864e5) : null;

    const dowHtml = DOW.map((w, wi) => '<div class="disp" style="font-size:10px;color:' + (wi === 0 || wi === 6 ? "rgba(184,182,177,.4)" : MUTE) + ';text-align:center;letter-spacing:.14em;">' + w.toUpperCase() + '</div>').join("");

    const cellsHtml = calCells.map((cell, i) => {
      const selx = cell.iso === selDate;
      const isPayday = cell.events.some(e => e.kind === "payday");
      const isWork = cell.events.some(e => e.kind === "work");
      const weekend = i % 7 === 0 || i % 7 === 6;
      const bg = isPayday ? "linear-gradient(158deg, rgba(63,185,80,.20), rgba(63,185,80,.03))"
        : cell.isToday ? "linear-gradient(158deg, rgba(229,72,77,.22), rgba(229,72,77,.04))"
          : selx ? "linear-gradient(158deg, " + PANEL2 + ", " + BG + ")"
            : weekend ? "linear-gradient(158deg, " + PANEL + ", " + BG + ")"
              : "linear-gradient(158deg, " + PANEL2 + ", " + BG + ")";
      const pills = cell.events.slice(0, 3).map(e => {
        const label = e.kind === "class" ? e.title.replace("CSCI ", "") : e.kind === "payday" ? "Payday" : e.kind === "work" ? "Work" : e.title.replace(/^[^\w]+\s*/, "");
        return '<div class="evpill" style="background:' + e.color + '1c;box-shadow:inset 2.5px 0 0 ' + e.color + ';">' +
          '<span style="font-size:9px;font-weight:700;color:' + e.color + ';white-space:nowrap;overflow:hidden;text-overflow:ellipsis;letter-spacing:.01em;">' + esc(label) + '</span></div>';
      }).join("");
      const more = cell.events.length > 3 ? '<span style="font-size:8.5px;color:' + MUTE + ';padding-left:4px;letter-spacing:.04em;">+' + (cell.events.length - 3) + ' more</span>' : "";
      return '<div data-cal="' + cell.iso + '" class="calcell' + (isPayday ? " paycell" : "") + '" style="min-height:84px;border-radius:10px;padding:6px 7px;cursor:pointer;position:relative;background:' + bg +
        ';border:' + (selx ? "1.5px solid " + REDD : isPayday ? "1px solid rgba(63,185,80,.45)" : cell.isToday ? "1px solid rgba(229,72,77,.4)" : "1px solid " + LINE) +
        ';opacity:' + (cell.inMonth ? 1 : .3) + ';display:flex;flex-direction:column;gap:3px;overflow:hidden;">' +
        '<div style="display:flex;align-items:center;justify-content:space-between;">' +
        '<span class="' + (cell.isToday ? "disp" : "") + '" style="font-size:' + (cell.isToday ? 13.5 : 12.5) + 'px;font-weight:' + (cell.isToday ? 400 : 600) + ';color:' + (cell.isToday ? REDD : isPayday ? "#4EC16A" : weekend ? MUTE : INK) + ';line-height:1;">' + cell.d.getDate() + '</span>' +
        (isPayday ? '<span style="font-size:11px;line-height:1;">💵</span>' : (isWork ? '<span style="font-size:10px;line-height:1;opacity:.85;">💼</span>' : '')) +
        '</div>' + pills + more + '</div>';
    }).join("");

    const payPill = npDays != null ? '<button data-jumppay="1" title="Jump to next payday" style="margin-left:4px;display:inline-flex;align-items:center;gap:6px;background:rgba(63,185,80,.12);border:1px solid rgba(63,185,80,.4);border-radius:99px;padding:3px 11px;cursor:pointer;color:#3FB950;font-size:11.5px;font-weight:600;font-family:inherit;">💵 ' + (npDays === 0 ? "Payday today" : "Payday in " + npDays + "d") + '</button>' : "";

    const legend = [["💵", "#3FB950", "Payday"], ["💼", "#6E8BB5", "Work shift"], ["📝", "#E5484D", "Assignment / due"], ["🎓", "#A86DFF", "Class"]]
      .map(a => '<span style="display:inline-flex;align-items:center;gap:6px;font-size:10.5px;color:' + MUTE + '"><span style="width:8px;height:8px;border-radius:99px;background:' + a[1] + '"></span>' + a[2] + '</span>').join("");

    const monthPanel = '<div style="background:linear-gradient(180deg,' + PANEL + ',' + BG + ');border:1px solid ' + LINE + ';border-radius:14px;padding:18px 20px 20px;position:relative;overflow:hidden;">' +
      '<div style="position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,' + REDD + ',transparent 70%);opacity:.7;"></div>' +
      '<div style="position:absolute;top:-60px;right:-60px;width:180px;height:180px;border-radius:50%;background:radial-gradient(circle,rgba(63,185,80,.10),transparent 70%);pointer-events:none;"></div>' +
      '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;position:relative;">' +
      '<div style="display:flex;align-items:baseline;gap:8px;">' +
      '<span class="disp" style="font-size:21px;color:' + INK + ';letter-spacing:-.01em;text-transform:uppercase;">' + MONTHS[monthCursor.m] + '</span>' +
      '<span class="disp num" style="font-size:16px;color:' + REDD + '">' + monthCursor.y + '</span>' + payPill + '</div>' +
      '<div style="display:flex;gap:8px;"><button data-mstep="-1" class="calnav">‹</button><button data-today="1" class="caltoday">Today</button><button data-mstep="1" class="calnav">›</button></div>' +
      '</div>' +
      '<div style="display:grid;grid-template-columns:repeat(7,1fr);gap:6px;margin-bottom:8px;">' + dowHtml + '</div>' +
      '<div style="display:grid;grid-template-columns:repeat(7,1fr);gap:6px;">' + cellsHtml + '</div>' +
      '<div style="display:flex;flex-wrap:wrap;gap:8px 16px;margin-top:14px;padding-top:12px;border-top:1px solid ' + LINE + ';">' + legend + '</div></div>';

    $("sa-cal").innerHTML = monthPanel + renderAgendaPanel();
    wireCalendar();
  }

  function renderAgendaPanel() {
    const selDateObj = new Date(selDate + "T12:00:00");
    const selEvents = eventsForDate(selDateObj);
    const list = selEvents.length === 0
      ? '<div style="font-size:12.5px;color:' + MUTE + ';padding:28px 0;text-align:center;line-height:1.5;">Nothing scheduled.<br><span style="color:rgba(184,182,177,.5);">You&apos;re clear.</span></div>'
      : selEvents.map((e, i) => {
        const kindLabel = e.kind === "class" ? "CLASS" : e.kind === "payday" ? "PAYDAY" : e.kind === "work" ? "WORK" : e.kind.toUpperCase();
        const timeRoom = (e.time || e.room) ? '<div style="display:flex;align-items:center;justify-content:space-between;font-size:11px;color:' + MUTE + '">' +
          '<span class="num" style="display:flex;align-items:center;gap:6px;color:' + e.color + ';font-weight:600;"><span style="width:6px;height:6px;border-radius:99px;background:' + e.color + ';box-shadow:0 0 6px ' + e.color + '"></span>' + esc(e.time) + '</span>' +
          '<span>' + esc(e.room) + '</span></div>' : "";
        return '<div ' + (e.kind === "class" ? 'data-openclass="' + esc(e.code) + '"' : '') + ' class="agcard" style="background:linear-gradient(120deg,' + e.color + '14,' + PANEL2 + ' 55%);border-radius:11px;padding:12px 14px 12px 15px;border-left:3px solid ' + e.color + ';box-shadow:inset 0 0 22px -12px ' + e.color + ';cursor:' + (e.kind === "class" ? "pointer" : "default") + ';position:relative;">' +
          '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:3px;">' +
          '<span style="font-size:13.5px;font-weight:700;color:' + INK + '">' + esc(e.kind === "class" ? e.code : e.title) + '</span>' +
          '<span style="font-size:8.5px;font-weight:700;letter-spacing:.12em;color:' + e.color + ';background:' + e.color + '22;padding:2px 6px;border-radius:4px;">' + kindLabel + '</span></div>' +
          '<div style="font-size:11.5px;color:' + DIM + ';margin-bottom:' + ((e.time || e.room) ? 9 : 0) + 'px;line-height:1.35;">' + esc(e.sub) + '</div>' + timeRoom + '</div>';
      }).join("");

    return '<div style="background:linear-gradient(180deg,' + PANEL + ',' + BG + ');border:1px solid ' + LINE + ';border-radius:14px;padding:18px 18px 20px;display:flex;flex-direction:column;position:relative;overflow:hidden;">' +
      '<div style="position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,' + REDD + ',transparent 70%);opacity:.7;"></div>' +
      '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;">' +
      '<span class="disp" style="font-size:15px;color:' + INK + ';letter-spacing:.02em;text-transform:uppercase;">Scheduled</span>' +
      '<div style="display:flex;gap:6px;"><button data-dstep="-1" class="calnav sm">‹</button><button data-dstep="1" class="calnav sm">›</button></div></div>' +
      '<div style="font-size:12px;color:' + DIM + ';margin-bottom:14px;letter-spacing:.02em;">' + selDateObj.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }) + '</div>' +
      '<div style="display:flex;flex-direction:column;gap:11px;overflow-y:auto;max-height:540px;">' + list + '</div></div>';
  }

  function wireCalendar() {
    const box = $("sa-cal");
    const mstep = box.querySelectorAll("[data-mstep]");
    mstep.forEach(n => n.onclick = () => stepMonth(+n.getAttribute("data-mstep")));
    const today = box.querySelector("[data-today]");
    if (today) today.onclick = () => { monthCursor = { y: now0.getFullYear(), m: now0.getMonth() }; selDate = isoLocal(now0); renderCalendar(); };
    const jp = box.querySelector("[data-jumppay]");
    if (jp) jp.onclick = () => { const d = nextPayday().d; monthCursor = { y: d.getFullYear(), m: d.getMonth() }; selDate = isoLocal(d); renderCalendar(); };
    box.querySelectorAll("[data-cal]").forEach(n => n.onclick = () => { selDate = n.getAttribute("data-cal"); renderCalendar(); });
    box.querySelectorAll("[data-dstep]").forEach(n => n.onclick = () => {
      const sel = new Date(selDate + "T12:00:00");
      selDate = isoLocal(new Date(sel.getTime() + (+n.getAttribute("data-dstep")) * 864e5));
      renderCalendar();
    });
    box.querySelectorAll("[data-openclass]").forEach(n => n.onclick = () => { openClassCode = n.getAttribute("data-openclass"); renderModals(); });
  }
  function stepMonth(dir) {
    const nm = monthCursor.m + dir;
    monthCursor = { y: monthCursor.y + Math.floor(nm / 12), m: ((nm % 12) + 12) % 12 };
    renderCalendar();
  }

  function renderMastery() {
    const C = classOf(cls), S = DATA.study[cls];
    const mShown = mastery[cls] || 0;
    $("sa-mastery").innerHTML =
      '<div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:8px;">' +
      '<span style="font-size:11px;letter-spacing:.22em;color:' + DIM + '"><span class="disp" style="color:' + REDD + '">' + esc(C.name) + '</span>&nbsp; MASTERY — WHAT THE AGENT SAYS YOU ACTUALLY KNOW</span>' +
      '<span style="display:inline-flex;align-items:baseline;gap:12px;">' +
      (streak.count > 0 ? '<span class="disp num" style="font-size:11px;letter-spacing:.08em;color:#E8912A" title="Daily study streak — study any day to keep it alive">🔥 ' + streak.count + '-DAY STREAK</span>' : '') +
      '<span class="disp num" style="font-size:15px;">' + mShown + '<span style="font-size:11px;">%</span></span></span></div>' +
      '<div class="polebox" style="height:14px;background:' + PANEL + ';border:2px solid ' + LINE + ';position:relative;transition:border-color .2s;">' +
      '<div class="polefill" style="position:absolute;inset:2px;width:calc(' + mShown + '% - 4px);background:repeating-linear-gradient(-45deg,' + REDD + ' 0 8px,#C43A3F 8px 17px);background-size:34px 34px;transition:width .5s cubic-bezier(.22,1,.36,1);"></div></div>' +
      '<div style="font-size:11.5px;color:' + MUTE + ';margin-top:6px;">weakest front: <span style="color:' + DIM + '">' + esc(S.weak) + '</span> — this class\'s deck is weighted toward it</div>';
  }

  function renderIntel() {
    const C = classOf(cls), detail = DATA.courseDetail[cls];
    const box = $("sa-intel");
    if (!detail) { box.innerHTML = ""; return; }
    const upcoming = (detail.schedule || []).reduce((acc, w) => acc.concat(w.items.map(it => Object.assign({}, it, { week: w.week }))), [])
      .map(it => Object.assign({}, it, { d: new Date(it.due + "T23:59:59") }))
      .filter(it => it.d >= now0).sort((a, b) => a.d - b.d).slice(0, 5);
    const daysUntil = (d) => Math.ceil((d - now0) / 864e5);

    const dueHtml = upcoming.length === 0
      ? '<div style="font-size:12px;color:' + MUTE + '">Nothing upcoming — you&apos;re clear.</div>'
      : upcoming.map((it, i) => {
        const du = daysUntil(it.d), urgent = du <= 2;
        return '<div style="display:flex;align-items:baseline;gap:12px;padding:8px 0;border-bottom:' + (i < upcoming.length - 1 ? "1px solid " + LINE : "none") + ';">' +
          '<span class="disp num" style="font-size:11px;color:' + (urgent ? REDD : GOOD) + ';min-width:62px;letter-spacing:.04em;">' + (du <= 0 ? "TODAY" : "IN " + du + "D") + '</span>' +
          '<span style="flex:1;font-size:12.5px;color:' + INK + ';line-height:1.35;">' + esc(it.name) + '</span>' +
          '<span style="font-size:9.5px;color:' + MUTE + ';text-transform:uppercase;letter-spacing:.1em;flex-shrink:0;">' + esc(it.kind) + '</span></div>';
      }).join("");

    const objectives = (detail.objectives && detail.objectives.length) ? '<div style="margin-top:18px;"><div style="font-size:10.5px;letter-spacing:.18em;color:' + MUTE + ';margin-bottom:8px;">LEARNING OBJECTIVES</div>' +
      detail.objectives.map(o => '<div style="display:flex;gap:8px;font-size:11.5px;color:' + DIM + ';line-height:1.5;padding:3px 0;"><span style="color:' + REDD + ';flex-shrink:0;">▸</span><span>' + esc(o) + '</span></div>').join("") + '</div>' : "";
    const materials = (detail.materials && detail.materials.length) ? '<div style="margin-top:18px;"><div style="font-size:10.5px;letter-spacing:.18em;color:' + MUTE + ';margin-bottom:8px;">MATERIALS</div>' +
      detail.materials.map(m => '<div style="font-size:11.5px;color:' + DIM + ';line-height:1.5;padding:2px 0;">' + esc(m) + '</div>').join("") + '</div>' : "";

    box.innerHTML = '<div class="slide" style="margin-bottom:24px;background:' + PANEL + ';border:2px solid ' + LINE + ';">' +
      '<div style="padding:12px 18px;border-bottom:2px solid ' + INK + ';display:flex;align-items:center;gap:10px;flex-wrap:wrap;">' +
      '<span class="disp" style="font-size:13px;letter-spacing:.04em;transform:skewX(-6deg);">' + esc(C.name) + '<span style="color:' + REDD + '">//</span>INTEL</span>' +
      (detail.term ? '<span class="num" style="margin-left:auto;font-size:10px;color:' + MUTE + ';letter-spacing:.08em;">' + esc(detail.term) + '</span>' : '') + '</div>' +
      '<div style="padding:14px 18px;">' +
      '<div style="font-size:12.5px;color:' + DIM + ';line-height:1.55;margin-bottom:16px;">' + esc(detail.overview) + '</div>' +
      '<div style="font-size:10.5px;letter-spacing:.18em;color:' + MUTE + ';margin-bottom:8px;">WHAT&apos;S DUE NEXT</div>' + dueHtml +
      (detail.latePolicy ? '<div style="margin-top:14px;font-size:11px;color:#E8912A;line-height:1.5;border-left:3px solid #E8912A;padding-left:11px;">⚠ ' + esc(detail.latePolicy) + '</div>' : '') +
      (detail.gradingRule ? '<div style="margin-top:8px;font-size:11px;color:' + MUTE + ';line-height:1.5;border-left:3px solid ' + LINE + ';padding-left:11px;">' + esc(detail.gradingRule) + '</div>' : '') +
      objectives + materials + '</div></div>';
  }

  // ── ARENA ──
  function deckOf() { return (DATA.study[cls].flash).concat(extraCards[cls] || []); }

  function renderArena() {
    const C = classOf(cls), S = DATA.study[cls];
    const modeTabs = '<span class="disp sa-modeclass" style="font-size:12px;letter-spacing:.08em;padding:11px 16px 11px 0;color:' + REDD + ';align-self:center;">' + esc(C.name) + ' ▸</span>' +
      MODES.map((m, i) => '<button data-mode="' + i + '" class="disp modetab' + (mode === i ? " on" : "") + '" style="font-size:12px;letter-spacing:.1em;padding:11px 20px;">' + m + '</button>').join("") +
      '<span class="sa-modehint" style="margin-left:auto;font-size:10.5px;color:' + MUTE + ';align-self:center;letter-spacing:.1em;">FED FROM ITS WEAK TOPICS</span>';

    let body = "";
    if (mode === 0) body = flashHtml(C, S);
    else if (mode === 1) body = matchHtml(C, S);
    else if (mode === 2) body = writeHtml(C, S);
    else body = examHtml(C, S);

    $("sa-arena").innerHTML =
      '<div class="sa-moderow" style="display:flex;gap:0;border-bottom:2px solid ' + INK + ';">' + modeTabs + '</div>' +
      '<div class="drop" style="background:' + PANEL + ';border:2px solid ' + LINE + ';border-top:none;padding:24px 26px;min-height:330px;">' + body + '</div>';

    const box = $("sa-arena");
    box.querySelectorAll("[data-mode]").forEach(n => n.onclick = () => { mode = +n.getAttribute("data-mode"); renderArena(); });
    if (mode === 0) wireFlash();
    else if (mode === 1) wireMatch();
    else if (mode === 2) wireWrite();
    else wireExam();
  }

  function flashHtml(C, S) {
    const deck = deckOf();
    const card = deck[fIdx] || deck[0];
    const missCount = (missed[cls] || []).length;
    const genTag = (extraCards[cls] && extraCards[cls].length > 0 && fIdx >= S.flash.length) ? '<span style="color:#63B57F"> · GENERATED</span>' : '';
    const revTag = (missed[cls] || []).includes(fIdx) ? '<span style="color:#E8912A"> · ↻ REVIEW</span>' : '';
    const buttons = !showA
      ? '<button class="hardbtn" data-act="reveal" style="' + hbStyle({ active: true }) + '">Reveal</button>'
      : '<button class="hardbtn" data-act="missed" style="' + hbStyle({ danger: true }) + '">Missed it</button>' +
        '<button class="hardbtn" data-act="had" style="' + hbStyle({}) + '">Had it</button>';
    return '<div class="slide">' +
      '<div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:14px;">' +
      '<span style="font-size:10.5px;letter-spacing:.18em;color:' + MUTE + '">' + esc(C.name) + ' · CARD ' + (fIdx + 1) + ' / ' + deck.length + genTag + revTag + '</span>' +
      (missCount > 0 ? '<span style="font-size:10.5px;letter-spacing:.14em;color:#E8912A">' + missCount + ' TO REVIEW</span>' : '') + '</div>' +
      '<div style="font-size:17px;line-height:1.5;min-height:86px;font-weight:500;">' + esc(card.q) +
      (showA ? '<div class="slide" style="color:' + DIM + ';margin-top:12px;font-size:14px;font-weight:400;border-left:3px solid ' + REDD + ';padding-left:12px;">' + esc(card.a) + '</div>' : '') + '</div>' +
      '<div style="display:flex;gap:10px;margin-top:18px;align-items:center;">' + buttons +
      '<button data-act="gen" ' + (genning ? 'disabled' : '') + ' title="SCHOLAR writes 8 fresh cards for this class" style="margin-left:auto;background:transparent;border:1.5px solid ' + LINE + ';color:' + (genning ? MUTE : DIM) + ';font-size:11px;letter-spacing:.08em;padding:7px 12px;cursor:' + (genning ? "default" : "pointer") + ';font-family:inherit;">' + (genning ? "GENERATING…" : "＋ GENERATE CARDS") + '</button></div></div>';
  }
  function wireFlash() {
    const box = $("sa-arena");
    const r = box.querySelector('[data-act="reveal"]'); if (r) r.onclick = () => { showA = true; renderArena(); };
    const mi = box.querySelector('[data-act="missed"]'); if (mi) mi.onclick = () => { bump(-2); markCard(fIdx, true); showA = false; nextCard(); renderArena(); };
    const hd = box.querySelector('[data-act="had"]'); if (hd) hd.onclick = () => { bump(+1); markCard(fIdx, false); showA = false; nextCard(); renderArena(); };
    const g = box.querySelector('[data-act="gen"]'); if (g) g.onclick = genDeck;
  }
  function nextCard() {
    const len = DATA.study[cls].flash.length + ((extraCards[cls] && extraCards[cls].length) || 0);
    const pool = (missed[cls] || []).filter(i => i !== fIdx && i < len);
    if (pool.length && Math.random() < 0.55) fIdx = pool[Math.floor(Math.random() * pool.length)];
    else fIdx = (fIdx + 1) % len;
  }
  async function genDeck() {
    if (genning) return;
    genning = true; renderArena();
    try {
      const C = classOf(cls);
      const avoid = DATA.study[cls].flash.concat(extraCards[cls] || []).map(c => c.q);
      const r = await fetch("/api/academics/gen-deck", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ subject: C.name + " " + C.title, count: 8, avoid }) });
      const j = await r.json();
      if (j.cards && j.cards.length) {
        extraCards = Object.assign({}, extraCards, { [cls]: (extraCards[cls] || []).concat(j.cards) });
        lsSet("acadExtra", extraCards);
      }
    } catch (e) { /* ignore */ } finally { genning = false; renderArena(); }
  }

  function makeTiles(pairs) {
    const t = [];
    pairs.forEach((p, i) => { t.push({ id: i + "t", pair: i, text: p[0] }); t.push({ id: i + "d", pair: i, text: p[1] }); });
    for (let i = t.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); const tmp = t[i]; t[i] = t[j]; t[j] = tmp; }
    return t;
  }
  function matchHtml(C, S) {
    const matchDone = locked.length === tiles.length && tiles.length > 0;
    const tilesHtml = tiles.map(t => {
      const isL = locked.includes(t.id), isS = sel && sel.id === t.id, isW = wrong.includes(t.id);
      return '<div data-tileid="' + t.id + '" class="' + (isL ? "" : "ctile") + '" style="padding:16px 12px;font-size:12.5px;line-height:1.4;min-height:76px;display:flex;align-items:center;justify-content:center;text-align:center;' +
        'background:' + (isL ? "#10150F" : isS ? PANEL2 : BG) + ';border:2px solid ' + (isW ? REDD : isL ? GOOD : isS ? INK : LINE) + ';color:' + (isL ? GOOD : INK) + ';opacity:' + (isL ? .65 : 1) + ';cursor:' + (isL ? "default" : "pointer") + ';animation:' + (isW ? "shake .3s" : "none") + ';">' + esc(t.text) + '</div>';
    }).join("");
    return '<div class="slide"><div style="display:flex;justify-content:space-between;margin-bottom:14px;">' +
      '<span style="font-size:10.5px;letter-spacing:.18em;color:' + MUTE + '">' + esc(C.name) + ' · PAIR TERM ↔ DEFINITION</span>' +
      '<span class="disp num" style="font-size:12px;">' + (locked.length / 2) + ' / ' + S.pairs.length + '</span></div>' +
      '<div class="sa-g4">' + tilesHtml + '</div>' +
      (matchDone ? '<div style="margin-top:16px;display:flex;align-items:center;gap:14px;" class="slide"><span class="disp" style="color:' + GOOD + ';font-size:13px;letter-spacing:.06em;">CLEARED.</span><button class="hardbtn" data-act="rematch" style="' + hbStyle({}) + '">Run it back</button></div>' : '') + '</div>';
  }
  function wireMatch() {
    const box = $("sa-arena");
    box.querySelectorAll("[data-tileid]").forEach(n => n.onclick = () => clickTile(n.getAttribute("data-tileid")));
    const rm = box.querySelector('[data-act="rematch"]'); if (rm) rm.onclick = () => { tiles = makeTiles(DATA.study[cls].pairs); locked = []; sel = null; renderArena(); };
  }
  function clickTile(id) {
    const t = tiles.find(x => x.id === id);
    if (!t || locked.includes(t.id) || wrong.length) return;
    if (!sel) { sel = t; renderArena(); return; }
    if (sel.id === t.id) { sel = null; renderArena(); return; }
    if (sel.pair === t.pair) { locked = locked.concat([sel.id, t.id]); sel = null; bump(+1); renderArena(); }
    else { wrong = [sel.id, t.id]; renderArena(); setTimeout(() => { wrong = []; sel = null; renderArena(); }, 420); }
  }

  function writeHtml(C, S) {
    return '<div class="slide"><div style="font-size:10.5px;letter-spacing:.18em;color:' + MUTE + ';margin-bottom:10px;">' + esc(C.name) + ' · CONSTRUCTED RESPONSE</div>' +
      '<div style="font-size:16px;line-height:1.5;margin-bottom:14px;font-weight:500;">' + esc(S.write.prompt) + '</div>' +
      '<textarea id="sa-essay" rows="5" placeholder="Write your answer — the agent grades it against the rubric…" style="width:100%;font-family:inherit;font-size:13.5px;line-height:1.6;color:' + INK + ';background:' + BG + ';border:2px solid ' + LINE + ';padding:13px 15px;">' + esc(essay) + '</textarea>' +
      '<div style="display:flex;gap:14px;margin-top:12px;align-items:center;">' +
      '<button class="hardbtn" data-act="grade" style="' + hbStyle({ active: true, disabled: !essay.trim() }) + '">Submit to agent</button>' +
      (graded ? '<span class="disp num slide" style="font-size:14px;color:' + (parseFloat(graded) >= 7 ? GOOD : REDD) + '">' + graded + ' / 10</span>' : '') + '</div>' +
      (graded ? '<div class="slide" style="margin-top:14px;padding:13px 16px;background:' + BG + ';border-left:3px solid ' + REDD + ';"><div style="font-size:10px;letter-spacing:.18em;color:' + MUTE + ';margin-bottom:6px;">MODEL ANSWER</div><div style="font-size:13px;color:' + DIM + ';line-height:1.6;">' + esc(S.write.model) + '</div></div>' : '') + '</div>';
  }
  function wireWrite() {
    const box = $("sa-arena");
    const ta = box.querySelector("#sa-essay");
    if (ta) ta.oninput = () => { essay = ta.value; const g = box.querySelector('[data-act="grade"]'); if (g) { g.style.opacity = essay.trim() ? "1" : ".35"; } };
    const g = box.querySelector('[data-act="grade"]');
    if (g) g.onclick = () => {
      if (!essay.trim()) return;
      const S = DATA.study[cls];
      const hits = S.write.keys.filter(k => essay.toLowerCase().includes(k)).length;
      const s = Math.min(10, 4 + hits * 1.5);
      graded = s.toFixed(1); bump(Math.round(s / 3)); renderArena();
    };
  }

  function examHtml(C, S) {
    const score = S.exam.reduce((s, q, i) => s + (answers[i] === q.ans ? 1 : 0), 0);
    const qHtml = S.exam.map((q, qi) => {
      const opts = q.opts.map((o, oi) => {
        const chosen = answers[qi] === oi;
        const right = submitted && oi === q.ans;
        const miss = submitted && chosen && oi !== q.ans;
        return '<div ' + (submitted ? '' : 'data-ans="' + qi + ':' + oi + '"') + ' class="qopt" style="padding:10px 14px;font-size:12.5px;cursor:' + (submitted ? "default" : "pointer") +
          ';background:' + (right ? "#10150F" : miss ? "#1A0E0F" : chosen ? PANEL2 : BG) + ';border:2px solid ' + (right ? GOOD : miss ? REDD : chosen ? INK : LINE) + ';color:' + (right ? GOOD : miss ? REDD : INK) + ';">' + esc(o) + '</div>';
      }).join("");
      return '<div style="margin-bottom:20px;"><div style="font-size:14.5px;margin-bottom:9px;font-weight:500;"><span class="disp num" style="color:' + REDD + ';margin-right:10px;font-size:12px;">' + String(qi + 1).padStart(2, "0") + '</span>' + esc(q.q) + '</div>' +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">' + opts + '</div></div>';
    }).join("");
    const footer = !submitted
      ? '<button class="hardbtn" data-act="submitexam" style="' + hbStyle({ active: true, disabled: Object.keys(answers).length < S.exam.length }) + '">Submit exam</button>'
      : '<div style="display:flex;gap:14px;align-items:center;" class="slide"><button class="hardbtn" data-act="retake" style="' + hbStyle({}) + '">Retake</button><span style="font-size:12px;color:' + MUTE + '">missed questions were fed back into this class\'s deck</span></div>';
    return '<div class="slide"><div style="display:flex;justify-content:space-between;margin-bottom:16px;">' +
      '<span style="font-size:10.5px;letter-spacing:.18em;color:' + MUTE + '">' + esc(C.name) + ' · MOCK EXAM — BUILT FROM ITS SYLLABUS</span>' +
      (submitted ? '<span class="disp num slide" style="font-size:15px;color:' + (score === S.exam.length ? GOOD : score >= 2 ? INK : REDD) + '">' + score + ' / ' + S.exam.length + '</span>' : '') + '</div>' +
      qHtml + footer + '</div>';
  }
  function wireExam() {
    const box = $("sa-arena"), S = DATA.study[cls];
    box.querySelectorAll("[data-ans]").forEach(n => n.onclick = () => {
      if (submitted) return;
      const parts = n.getAttribute("data-ans").split(":");
      answers = Object.assign({}, answers, { [parts[0]]: +parts[1] });
      renderArena();
    });
    const se = box.querySelector('[data-act="submitexam"]');
    if (se) se.onclick = () => {
      if (Object.keys(answers).length < S.exam.length) return;
      const score = S.exam.reduce((s, q, i) => s + (answers[i] === q.ans ? 1 : 0), 0);
      submitted = true; bump(score * 2); renderArena();
    };
    const rt = box.querySelector('[data-act="retake"]');
    if (rt) rt.onclick = () => { answers = {}; submitted = false; renderArena(); };
  }

  // ── RECORDER ──
  function todaySecs() {
    const C = classOf(cls);
    return sessions.filter(x => (x.when.indexOf("today") >= 0 || x.when === "just now") && x.cls === C.name).reduce((a, b) => a + b.secs, 0) + (rec && rec.cls === C.name ? rec.secs : 0);
  }
  function renderRecorder() {
    const C = classOf(cls);
    const sessHtml = sessions.slice(0, 3).map(x =>
      '<div class="msgb" style="display:flex;gap:10px;padding:6px 0;font-size:11.5px;align-items:baseline;">' +
      '<span class="disp num" style="color:' + REDD + ';font-size:10px;min-width:44px;">' + fmt(x.secs) + '</span>' +
      '<span style="color:' + INK + ';font-weight:600;white-space:nowrap;">' + esc(x.cls) + '</span>' +
      '<span style="color:' + MUTE + ';overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1;">' + esc(x.task) + '</span>' +
      '<span style="color:' + MUTE + ';font-size:10.5px;white-space:nowrap;">' + esc(x.when) + '</span></div>').join("");

    const inner = !rec
      ? '<div><input id="sa-task" value="' + esc(task) + '" placeholder="what are you working on? (' + esc(C.name) + ')" style="width:100%;font-family:inherit;font-size:12.5px;color:' + INK + ';background:' + BG + ';border:2px solid ' + LINE + ';padding:9px 12px;margin-bottom:10px;" />' +
        '<button class="hardbtn" data-act="startrec" style="' + hbStyle({ active: true, extra: "width:100%;padding:10px 0;" }) + '">● Start recording</button></div>'
      : '<div class="slide"><div style="font-size:11px;color:' + MUTE + ';letter-spacing:.12em;margin-bottom:2px;">' + esc(rec.cls) + ' — ' + esc(rec.task.toUpperCase()) + '</div>' +
        '<div class="disp num" id="sa-rec-timer" style="font-size:40px;letter-spacing:-.02em;line-height:1.1;color:' + (rec.paused ? DIM : INK) + ';">' + fmt(rec.secs) + '</div>' +
        '<div style="display:flex;gap:8px;margin-top:10px;"><button class="hardbtn" data-act="pauserec" style="' + hbStyle({ extra: "flex:1;padding:8px 0;" }) + '">' + (rec.paused ? "Resume" : "Pause") + '</button>' +
        '<button class="hardbtn" data-act="stoprec" style="' + hbStyle({ danger: true, extra: "flex:1;padding:8px 0;" }) + '">■ Stop &amp; log</button></div></div>';

    $("sa-recorder").innerHTML = '<div style="background:' + PANEL + ';border:2px solid ' + (rec ? REDD : LINE) + ';transition:border-color .25s;">' +
      '<div style="padding:12px 18px;border-bottom:2px solid ' + INK + ';display:flex;align-items:center;gap:10px;">' +
      '<span class="disp" style="font-size:13px;letter-spacing:.04em;transform:skewX(-6deg);">WORK<span style="color:' + REDD + '">//</span>LOG</span>' +
      (rec ? '<span style="width:8px;height:8px;background:' + REDD + ';border-radius:99px;animation:stampblink 1s steps(1) infinite;margin-left:auto;"></span>'
        : '<span class="num" style="margin-left:auto;font-size:10.5px;color:' + MUTE + ';letter-spacing:.1em;">TODAY ON ' + esc(C.name) + ': ' + fmt(todaySecs()) + '</span>') +
      '</div><div style="padding:14px 16px;">' + inner +
      '<div style="margin-top:12px;border-top:1px solid ' + LINE + ';padding-top:8px;">' + sessHtml + '</div></div></div>';

    const box = $("sa-recorder");
    const ti = box.querySelector("#sa-task");
    if (ti) { ti.oninput = () => task = ti.value; ti.onkeydown = (e) => { if (e.key === "Enter") startRec(); }; }
    const sr = box.querySelector('[data-act="startrec"]'); if (sr) sr.onclick = startRec;
    const pr = box.querySelector('[data-act="pauserec"]'); if (pr) pr.onclick = () => { rec.paused = !rec.paused; renderRecorder(); };
    const st = box.querySelector('[data-act="stoprec"]'); if (st) st.onclick = stopRec;
  }
  function renderTopRec() {
    const ind = $("sa-rec-indicator");
    if (!ind) return;
    ind.innerHTML = rec ? '<span class="disp num" style="display:flex;align-items:center;gap:7px;color:' + REDD + ';margin-right:16px;"><span style="width:8px;height:8px;background:' + REDD + ';border-radius:99px;animation:stampblink 1s steps(1) infinite;display:inline-block;"></span>REC ' + fmt(rec.secs) + '</span>' : '';
  }
  function startRec() {
    const C = classOf(cls);
    rec = { task: task.trim() || "untitled session", cls: C.name, secs: 0, paused: false };
    task = "";
    if (recIv) clearInterval(recIv);
    recIv = setInterval(() => {
      if (!rec || rec.paused) return;
      rec.secs += 1;
      const tm = $("sa-rec-timer"); if (tm) tm.textContent = fmt(rec.secs);
      renderTopRec();
    }, 1000);
    renderRecorder(); renderTopRec();
  }
  function stopRec() {
    if (rec && rec.secs > 0) sessions = [{ cls: rec.cls, task: rec.task, secs: rec.secs, when: "just now" }].concat(sessions);
    rec = null; task = "";
    if (recIv) { clearInterval(recIv); recIv = null; }
    renderRecorder(); renderTopRec();
  }

  // ── CHAT ──
  function renderChat() {
    const C = classOf(cls);
    const srcToggle = ["laptop", "hq"].map(t => '<button data-src="' + t + '" style="padding:3px 9px;font-size:10px;letter-spacing:.08em;text-transform:uppercase;cursor:pointer;border:none;font-weight:700;background:' + (src === t ? REDD : "transparent") + ';color:' + (src === t ? "#fff" : MUTE) + ';">' + t + '</button>').join("");
    const msgsHtml = msgs.map(m => '<div class="slide" style="margin-bottom:12px;display:flex;justify-content:' + (m.who === "you" ? "flex-end" : "flex-start") + ';">' +
      '<div class="msgb" style="max-width:88%;padding:10px 13px;font-size:12.5px;line-height:1.55;background:' + (m.who === "you" ? INK : BG) + ';color:' + (m.who === "you" ? BG : DIM) + ';border:' + (m.who === "you" ? "none" : "2px solid " + LINE) + ';border-left:' + (m.who === "you" ? "none" : "3px solid " + REDD) + ';">' + esc(m.text) + '</div></div>').join("");
    const typingHtml = typing ? '<div class="slide" style="display:flex;margin-bottom:12px;"><div style="padding:11px 14px;background:' + BG + ';border:2px solid ' + LINE + ';border-left:3px solid ' + REDD + ';display:flex;gap:4px;"><span class="dot"></span><span class="dot" style="animation-delay:.18s"></span><span class="dot" style="animation-delay:.36s"></span></div></div>' : '';

    $("sa-chat").innerHTML =
      '<div style="padding:13px 18px;border-bottom:2px solid ' + INK + ';display:flex;align-items:center;gap:10px;">' +
      '<span class="disp" style="font-size:13px;letter-spacing:.04em;transform:skewX(-6deg);">TUTOR<span style="color:' + REDD + '">//</span>LINE</span>' +
      '<div style="margin-left:auto;display:flex;border:1px solid ' + LINE + ';">' + srcToggle + '</div></div>' +
      '<div id="sa-chat-box" style="flex:1;overflow-y:auto;padding:16px 14px 6px;">' + msgsHtml + typingHtml + '</div>' +
      '<div style="padding:13px;border-top:2px solid ' + LINE + ';display:flex;gap:8px;">' +
      '<input id="sa-chat-input" value="' + esc(draft) + '" placeholder="Talk to him…" style="flex:1;font-family:inherit;font-size:13px;color:' + INK + ';background:' + BG + ';border:2px solid ' + LINE + ';padding:10px 13px;" />' +
      '<button class="hardbtn" data-act="send" style="' + hbStyle({ active: true, extra: "padding:9px 14px;" }) + '">Send</button></div>';

    const box = $("sa-chat");
    box.querySelectorAll("[data-src]").forEach(n => n.onclick = () => { src = n.getAttribute("data-src"); try { localStorage.setItem("scholarSrc", src); } catch { } renderChat(); });
    const inp = box.querySelector("#sa-chat-input");
    if (inp) { inp.oninput = () => draft = inp.value; inp.onkeydown = (e) => { if (e.key === "Enter") send(); }; }
    const sb = box.querySelector('[data-act="send"]'); if (sb) sb.onclick = send;
    const cb = $("sa-chat-box"); if (cb) cb.scrollTop = cb.scrollHeight;
  }
  async function send() {
    const text = draft.trim();
    if (!text || typing) return;
    const C = classOf(cls);
    const history = msgs.map(m => ({ role: m.who === "you" ? "user" : "assistant", content: m.text }));
    msgs = msgs.concat([{ who: "you", text }]); draft = ""; typing = true; renderChat();
    try {
      const r = await fetch("/api/academics/scholar", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ message: text, history, class: C ? C.name : "", target: src }) });
      const j = await r.json();
      msgs = msgs.concat([{ who: "agent", text: j.reply || j.error || "SCHOLAR is offline." }]);
    } catch (e) {
      msgs = msgs.concat([{ who: "agent", text: "Can't reach SCHOLAR right now." }]);
    } finally { typing = false; renderChat(); }
  }

  // ── MODALS ──
  function renderModals() {
    const box = $("sa-modals");
    let html = "";
    if (openClassCode) {
      const info = DATA.courseInfo[openClassCode];
      const body = info
        ? '<div style="padding:18px 20px;display:flex;flex-direction:column;gap:13px;">' +
          '<div><div style="font-size:12.5px;color:' + INK + '">' + esc(info.instructor) + (info.email ? '<span style="color:' + DIM + '"> · ' + esc(info.email) + '</span>' : '') + '</div>' +
          (info.office ? '<div style="font-size:11px;color:' + MUTE + ';margin-top:2px;">' + esc(info.office) + '</div>' : '') +
          '<div class="num" style="font-size:12px;color:' + GOOD + ';margin-top:5px;">' + esc(info.meeting) + (info.room ? ' · ' + esc(info.room) : '') + '</div>' +
          (info.format ? '<div style="font-size:11.5px;color:' + DIM + ';line-height:1.45;margin-top:5px;">' + esc(info.format) + '</div>' : '') + '</div>' +
          '<div><div style="font-size:10px;letter-spacing:.18em;color:' + MUTE + ';margin-bottom:6px;">GRADE BREAKDOWN</div>' +
          info.grading.map((g, gi) => '<div style="display:flex;justify-content:space-between;gap:12px;padding:5px 0;border-bottom:' + (gi < info.grading.length - 1 ? "1px solid " + LINE : "none") + ';"><span style="font-size:12px;color:' + DIM + ';line-height:1.35;">' + esc(g.component) + '</span><span class="disp num" style="font-size:12px;color:' + INK + ';white-space:nowrap;">' + esc(g.weight) + '</span></div>').join("") + '</div>' +
          (info.note ? '<div style="font-size:11px;color:#E8912A;line-height:1.5;border-left:3px solid #E8912A;padding-left:11px;">⚠ ' + esc(info.note) + '</div>' : '') + '</div>'
        : '<div style="padding:18px 20px;font-size:12px;color:' + MUTE + '">No syllabus detail yet.</div>';
      html = '<div data-backdrop="1" style="position:fixed;inset:0;z-index:21;background:rgba(6,6,7,.82);display:flex;align-items:flex-start;justify-content:center;padding:40px 20px;overflow-y:auto;">' +
        '<div data-stop="1" class="drop" style="width:min(560px,100%);background:' + PANEL + ';border:2px solid ' + REDD + ';box-shadow:8px 8px 0 rgba(229,72,77,.55);">' +
        '<div style="padding:14px 20px;border-bottom:2px solid ' + INK + ';display:flex;align-items:center;justify-content:space-between;">' +
        '<span class="disp" style="font-size:16px;letter-spacing:.02em;transform:skewX(-6deg);">' + esc(openClassCode) + '<span style="color:' + REDD + '">//</span>DETAIL</span>' +
        '<button data-close="1" class="hardbtn" style="font-family:\'Archivo Black\',sans-serif;font-size:10px;letter-spacing:.08em;color:' + INK + ';background:transparent;border:2px solid ' + INK + ';padding:6px 12px;cursor:pointer;">✕ CLOSE</button></div>' +
        body + '</div></div>';
    }
    box.innerHTML = html;
    if (openClassCode) {
      const bd = box.querySelector('[data-backdrop]'); if (bd) bd.onclick = () => { openClassCode = null; renderModals(); };
      const stop = box.querySelector('[data-stop]'); if (stop) stop.onclick = (e) => e.stopPropagation();
      const cl = box.querySelector('[data-close]'); if (cl) cl.onclick = () => { openClassCode = null; renderModals(); };
    }
  }

  // ── class switch ──
  function switchClass(id) {
    if (id === cls) return;
    cls = id;
    fIdx = 0; showA = false;
    tiles = makeTiles(DATA.study[id].pairs); sel = null; locked = []; wrong = [];
    essay = ""; graded = null;
    answers = {}; submitted = false;
    renderTiles(); renderMastery(); renderIntel(); renderArena(); renderRecorder();
  }

  // ── boot ──
  async function boot() {
    try {
      const r = await fetch("/api/academics/data");
      DATA = await r.json();
    } catch (e) {
      document.querySelector(".sa-wrap").insertAdjacentHTML("afterbegin",
        '<div style="padding:20px;color:' + REDD + ';">Failed to load course data. Is the server running?</div>');
      return;
    }
    tiles = makeTiles(DATA.study[cls].pairs);
    renderAll();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
