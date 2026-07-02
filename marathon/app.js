/* Marathon Course Converter — client app.
 * All math mirrors code/predict_time.py (verified against goldens.json via ?test=1).
 * Transfer formula: runner FE and year FE cancel when anchoring on an observed time:
 *   log T_target = log T_origin + (FE_t - FE_o) + [poly(age_t) - poly(age_o)]
 * where poly includes the male-interaction terms when gender = M.
 */
"use strict";

let COURSES = [], MODEL = null, BY_ID = new Map();

/* ---------------- math ---------------- */

function agePoly(age, male) {
  const c = MODEL.coefs;
  const a = age, a2 = a * a, a3 = a2 * a, a4 = a3 * a;
  let v = c.aa[0] * a + c.aa[1] * a2 + c.aa[2] * a3 + c.aa[3] * a4;
  if (male) v += c.maa[0] * a + c.maa[1] * a2 + c.maa[2] * a3 + c.maa[3] * a4;
  return v;
}

function transferLog(tOriginSec, feO, feT, ageO, ageT, male) {
  return Math.log(tOriginSec) + (feT - feO) + (agePoly(ageT, male) - agePoly(ageO, male));
}

function speedBand(originSec) {
  const bands = MODEL.bands;
  for (const k in bands) {
    if (originSec >= bands[k].lo_sec && originSec < bands[k].hi_sec) return bands[k];
  }
  return bands.over_500;
}

/* ---------------- formatting ---------------- */

function fmtTime(sec) {
  sec = Math.round(sec);
  const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
  return h + ":" + String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0");
}

function fmtDelta(sec) {
  const sign = sec < 0 ? "−" : "+";
  sec = Math.abs(Math.round(sec));
  const m = Math.floor(sec / 60), s = sec % 60;
  return sign + m + ":" + String(s).padStart(2, "0");
}

function esc(s) {
  return String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
}

/* ---------------- typeahead ---------------- */

function norm(s) {
  return s.toLowerCase().replace(/['’‘`]/g, "").replace(/[^a-z0-9 ]+/g, " ").replace(/\s+/g, " ").trim();
}

function searchCourses(q) {
  q = norm(q);
  if (!q) return [];
  const scored = [];
  for (const c of COURSES) {
    let best = -1;
    const keys = [c._n].concat(c._al);
    for (const k of keys) {
      if (k === q) { best = Math.max(best, 100); }
      else if (k.startsWith(q)) { best = Math.max(best, 80); }
      else if (k.split(" ").some(w => w.startsWith(q))) { best = Math.max(best, 60); }
      else if (k.includes(q)) { best = Math.max(best, 40); }
    }
    if (c._loc && best < 60 && c._loc.includes(q)) best = Math.max(best, 30);
    if (best > 0) scored.push([best, c]);
  }
  scored.sort((x, y) => (y[0] - x[0]) || (y[1].n - x[1].n));
  return scored.slice(0, 12).map(x => x[1]);
}

function makeTypeahead(rootId, onSelect) {
  const root = document.getElementById(rootId);
  const input = root.querySelector("input");
  const list = root.querySelector(".ta-list");
  let items = [], sel = -1, chosen = null;

  function close() { list.hidden = true; sel = -1; }
  function render() {
    if (!items.length) { close(); return; }
    list.innerHTML = items.map((c, i) =>
      `<div class="ta-item${i === sel ? " sel" : ""}" data-i="${i}">
         <span class="nm">${esc(c.name)}</span><span class="lc">${esc(c.loc || c.country || "")}</span>
       </div>`).join("");
    list.hidden = false;
  }
  function choose(c) {
    chosen = c;
    input.value = c.name;
    close();
    onSelect(c);
  }

  input.addEventListener("input", () => {
    chosen = null;
    items = searchCourses(input.value);
    sel = -1;
    render();
  });
  input.addEventListener("focus", () => { if (items.length && !chosen) render(); });
  input.addEventListener("keydown", e => {
    if (list.hidden) return;
    if (e.key === "ArrowDown") { sel = Math.min(sel + 1, items.length - 1); render(); e.preventDefault(); }
    else if (e.key === "ArrowUp") { sel = Math.max(sel - 1, 0); render(); e.preventDefault(); }
    else if (e.key === "Enter") { if (sel >= 0) choose(items[sel]); else if (items.length) choose(items[0]); e.preventDefault(); }
    else if (e.key === "Escape") close();
  });
  list.addEventListener("mousedown", e => {
    const it = e.target.closest(".ta-item");
    if (it) { choose(items[+it.dataset.i]); e.preventDefault(); }
  });
  document.addEventListener("click", e => { if (!root.contains(e.target)) close(); });

  return {
    get: () => chosen,
    set: c => { chosen = c; input.value = c ? c.name : ""; close(); }
  };
}

/* ---------------- plot theming ---------------- */

function theme() {
  const css = getComputedStyle(document.documentElement);
  return {
    ink: css.getPropertyValue("--ink").trim(),
    muted: css.getPropertyValue("--muted").trim(),
    line: css.getPropertyValue("--line").trim(),
    accent: css.getPropertyValue("--accent").trim(),
    slow: css.getPropertyValue("--slow").trim()
  };
}

const PLOT_CFG = { displayModeBar: false, responsive: true };

/* ---------------- section 1: explorer ---------------- */

let exploreCourse = null;

function renderExplorer() {
  if (typeof Plotly === "undefined") return;
  const t = theme();
  const usOnly = document.getElementById("us-only").checked;
  const kde = usOnly ? MODEL.kde.us : MODEL.kde.all;
  const c = exploreCourse;

  const shapes = [{
    type: "line", x0: 0, x1: 0, y0: 0, y1: 1, yref: "paper",
    line: { color: t.muted, width: 1.5, dash: "dot" }
  }];
  const annotations = [{
    x: 0, y: 1.02, yref: "paper", text: "Boston", showarrow: false,
    font: { color: t.muted, size: 12 }, xanchor: "left", xshift: 4
  }];
  if (c) {
    shapes.push({
      type: "line", x0: c.pct, x1: c.pct, y0: 0, y1: 1, yref: "paper",
      line: { color: t.accent, width: 2.5 }
    });
    annotations.push({
      x: c.pct, y: 0.92, yref: "paper", text: "<b>" + esc(c.name) + "</b>",
      showarrow: false, font: { color: t.accent, size: 12 },
      xanchor: c.pct > 4 ? "right" : "left", xshift: c.pct > 4 ? -6 : 6
    });
  }

  Plotly.react("dist-chart", [{
    x: kde.x, y: kde.y, type: "scatter", mode: "lines",
    fill: "tozeroy", line: { color: t.muted, width: 1.5 },
    fillcolor: "rgba(128,128,128,.15)", hoverinfo: "x"
  }], {
    height: 230,
    margin: { l: 10, r: 10, t: 24, b: 38 },
    paper_bgcolor: "rgba(0,0,0,0)", plot_bgcolor: "rgba(0,0,0,0)",
    xaxis: {
      title: { text: "Course speed vs Boston (%) — negative = faster", font: { size: 12, color: t.muted } },
      color: t.muted, gridcolor: "rgba(128,128,128,.12)", zeroline: false
    },
    yaxis: { visible: false },
    shapes, annotations, showlegend: false
  }, PLOT_CFG);
}

function showCourse(c) {
  exploreCourse = c;
  const card = document.getElementById("course-card");
  const head = document.getElementById("course-headline");
  const chips = document.getElementById("course-chips");
  card.hidden = false;

  const faster = c.pct < 0;
  const cls = faster ? "fast" : "slow";
  const word = faster ? "faster" : "slower";
  const where = c.loc ? ` (${esc(c.loc)})` : "";
  if (c.id === 0) {
    head.innerHTML = `<b>${esc(c.name)}</b>${where} is the reference course — every other course is measured against it.`;
  } else {
    head.innerHTML =
      `<b>${esc(c.name)}</b>${where} is <span class="${cls}">${Math.abs(c.pct).toFixed(1)}% ${word}</span>` +
      ` than Boston — about <span class="${cls}">${Math.abs(c.min320).toFixed(0)} minutes</span> for a 3:20 marathoner.`;
  }

  const chipList = [
    `<b>#${c.rank}</b> of ${COURSES.length} (faster than <b>${c.pctile.toFixed(0)}%</b> of courses)`,
    `<b>${c.n.toLocaleString()}</b> finishes`,
    c.years ? `active <b>${esc(c.years)}</b>` : null,
    `precision ±<b>${c.se_pct.toFixed(1)}%</b>`,
    (c.elev_drop != null && c.elev_drop !== 0) ? `net drop <b>${Math.round(c.elev_drop).toLocaleString()} ft</b>` : null
  ].filter(Boolean);
  chips.innerHTML = chipList.map(x => `<span class="chip">${x}</span>`).join("");

  renderExplorer();
}

/* ---------------- section 2: converter ---------------- */

let taOrigin, taTarget;

function getGender() {
  return document.querySelector("#gender-seg .on").dataset.v;
}

function bqCheck(predSec, age, gender) {
  const years = Object.keys(MODEL.bq).sort();
  const yr = years[years.length - 1];
  const rows = MODEL.bq[yr];
  const g = rows.find(r => r.gender === gender && age >= r.age_lo && age <= r.age_hi);
  if (!g) return "";
  const diff = g.std_sec - predSec;
  const grp = `${gender}${g.age_lo}–${g.age_hi}`;
  const std = fmtTime(g.std_sec);
  if (diff >= 0) {
    return `Boston ${yr} qualifying standard for ${grp} is <b>${std}</b> — this prediction beats it by ` +
           `<span class="yes">${fmtDelta(-diff).replace("−", "")}</span>. (Official standard; recent years required a buffer below it.)`;
  }
  return `Boston ${yr} qualifying standard for ${grp} is <b>${std}</b> — this prediction misses it by ` +
         `<span class="no">${fmtDelta(-diff)}</span>.`;
}

function renderAgeChart(predLogAtTarget, ageT, male, targetName) {
  if (typeof Plotly === "undefined") return;
  const t = theme();
  const ages = [], secs = [], labels = [];
  for (let a = 20; a <= 80; a++) {
    ages.push(a);
    const s = Math.exp(predLogAtTarget + agePoly(a, male) - agePoly(ageT, male));
    secs.push(s);
    labels.push(fmtTime(s));
  }
  const yticks = [];
  const lo = Math.min(...secs), hi = Math.max(...secs);
  for (let v = Math.ceil(lo / 900) * 900; v <= hi; v += 900) yticks.push(v);

  Plotly.react("age-chart", [{
    x: ages, y: secs, type: "scatter", mode: "lines",
    line: { color: t.accent, width: 2.5 },
    text: labels, hovertemplate: "age %{x}: <b>%{text}</b><extra></extra>"
  }, {
    x: [ageT], y: [Math.exp(predLogAtTarget)], type: "scatter", mode: "markers",
    marker: { color: t.accent, size: 10 },
    text: [fmtTime(Math.exp(predLogAtTarget))],
    hovertemplate: "you, age %{x}: <b>%{text}</b><extra></extra>"
  }], {
    height: 260,
    margin: { l: 64, r: 10, t: 10, b: 40 },
    paper_bgcolor: "rgba(0,0,0,0)", plot_bgcolor: "rgba(0,0,0,0)",
    xaxis: { title: { text: "Age on race day", font: { size: 12, color: t.muted } }, color: t.muted, gridcolor: "rgba(128,128,128,.12)" },
    yaxis: { tickvals: yticks, ticktext: yticks.map(fmtTime), color: t.muted, gridcolor: "rgba(128,128,128,.12)" },
    showlegend: false
  }, PLOT_CFG);
}

function convert() {
  const err = document.getElementById("conv-err");
  const out = document.getElementById("conv-result");
  err.hidden = true;

  const o = taOrigin.get(), tg = taTarget.get();
  const h = +document.getElementById("t-h").value;
  const m = +document.getElementById("t-m").value;
  const s = +document.getElementById("t-s").value || 0;
  const ageO = +document.getElementById("age-o").value;
  const ageT = +document.getElementById("age-t").value || ageO;
  const male = getGender() === "M" ? 1 : 0;

  const problems = [];
  if (!o) problems.push("pick the race you ran");
  if (!tg) problems.push("pick the race to predict");
  if (!h && h !== 0 || !document.getElementById("t-m").value) problems.push("enter your finish time");
  if (!ageO) problems.push("enter your age");
  if (problems.length) {
    err.textContent = "Please " + problems.join(", ") + ".";
    err.hidden = false;
    out.hidden = true;
    return;
  }
  const tSec = h * 3600 + m * 60 + s;
  if (tSec < 7200 || tSec > 36000) {
    err.textContent = "Finish time should be between 2:00:00 and 10:00:00.";
    err.hidden = false;
    out.hidden = true;
    return;
  }

  const predLog = transferLog(tSec, o.fe, tg.fe, ageO, ageT, male);
  const predSec = Math.exp(predLog);

  // decomposition: course swap at fixed age, then aging at the target course
  const courseDelta = tSec * (Math.exp(tg.fe - o.fe) - 1);
  const ageDelta = predSec - (tSec + courseDelta);

  document.getElementById("pred-race").textContent = tg.name;
  document.getElementById("pred-time").textContent = fmtTime(predSec);

  const chips = [];
  chips.push(`<span class="chip">course: <b>${fmtDelta(courseDelta)}</b></span>`);
  if (Math.abs(ageDelta) >= 0.5) chips.push(`<span class="chip">age ${ageO}→${ageT}: <b>${fmtDelta(ageDelta)}</b></span>`);
  chips.push(`<span class="chip">from <b>${fmtTime(tSec)}</b> at ${esc(o.name)}, age ${ageO}</span>`);
  document.getElementById("pred-chips").innerHTML = chips.join("");

  const band = speedBand(tSec);
  const q = band.q;
  document.getElementById("band50").textContent =
    fmtTime(predSec * Math.exp(q.p25)) + " – " + fmtTime(predSec * Math.exp(q.p75));
  document.getElementById("band90").textContent =
    fmtTime(predSec * Math.exp(q.p5)) + " – " + fmtTime(predSec * Math.exp(q.p95));

  const bqBox = document.getElementById("bq-box");
  const bqHtml = bqCheck(predSec, ageT, getGender());
  bqBox.innerHTML = bqHtml;
  bqBox.hidden = !bqHtml;

  document.getElementById("age-race").textContent = tg.name;
  renderAgeChart(predLog, ageT, male, tg.name);

  out.hidden = false;
  out.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

/* ---------------- self-test (?test=1) ---------------- */

async function selfTest() {
  const el = document.getElementById("selftest");
  try {
    const gs = await (await fetch("data/goldens.json")).json();
    let maxErr = 0;
    for (const g of gs) {
      const got = transferLog(g.t_origin_sec, g.fe_o, g.fe_t, g.age_o, g.age_t, g.male);
      maxErr = Math.max(maxErr, Math.abs(got - g.expect_log_t));
    }
    const ok = maxErr < 1e-9;
    el.textContent = ok
      ? `model verified ✓ (${gs.length} goldens, max err ${maxErr.toExponential(1)})`
      : `MODEL MISMATCH ✗ (max err ${maxErr.toExponential(2)})`;
    el.className = ok ? "ok" : "bad";
  } catch (e) {
    el.textContent = "self-test failed to run: " + e.message;
    el.className = "bad";
  }
}

/* ---------------- init ---------------- */

async function init() {
  const [cj, mj] = await Promise.all([
    fetch("data/courses.json").then(r => r.json()),
    fetch("data/model.json").then(r => r.json())
  ]);
  COURSES = cj.courses;
  MODEL = mj;
  for (const c of COURSES) {
    c._n = norm(c.name);
    c._al = (c.aliases || []).map(norm);
    c._loc = c.loc ? norm(c.loc) : "";
    BY_ID.set(c.id, c);
  }

  document.getElementById("n-courses").textContent = COURSES.length.toLocaleString();
  document.getElementById("vintage").textContent =
    `Data vintage: ${cj.vintage.exported} (index ${cj.vintage.course_index_hash}).`;

  const taExplore = makeTypeahead("ta-explore", showCourse);
  taOrigin = makeTypeahead("ta-origin", () => {});
  taTarget = makeTypeahead("ta-target", () => {});

  document.getElementById("us-only").addEventListener("change", renderExplorer);
  document.getElementById("convert-btn").addEventListener("click", convert);
  document.querySelectorAll("#gender-seg button").forEach(b =>
    b.addEventListener("click", () => {
      document.querySelectorAll("#gender-seg button").forEach(x => x.classList.remove("on"));
      b.classList.add("on");
    }));

  // friendly defaults: NYC in the explorer, Boston as conversion target
  const nyc = COURSES.find(c => c.name === "New York City Marathon");
  if (nyc) { taExplore.set(nyc); showCourse(nyc); } else renderExplorer();
  const bos = BY_ID.get(0);
  if (bos) taTarget.set(bos);

  if (new URLSearchParams(location.search).get("test")) selfTest();
}

init();
