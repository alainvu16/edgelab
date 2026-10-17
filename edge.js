// ===================== KEEP YOUR EDGE: a sharpness score that fades when you stop =====================
// Built for the real pattern: train hard, burn out, drift away, come back. Every graded answer feeds a per-subject
// sharpness (recent accuracy). After 2 days without that subject it starts to fade, halving about every 3 weeks.
// Coming back after 4+ days away offers an Edge check: quick play that starts with the most-faded subjects.
var EG = (function () {
  var $ = App.$, $$ = App.$$, esc = App.esc;
  var SUBJ = [['chess', 'Chess'], ['xq', 'Xiangqi'], ['poker', 'Poker'], ['mkt', 'Markets'], ['words', 'Words'], ['math', 'Quick Math'], ['quotes', 'Quotes']];
  var NAME = {}; SUBJ.forEach(function (s) { NAME[s[0]] = s[1]; });
  var MIN_N = 10;          // answers before a subject gets a score
  var GRACE = 2, HALF = 21; // days before fading starts; days for the score to halve after that
  var AWAY = 4;            // days away that count as "coming back"
  var FULL_DAY = 180;      // graded answers in a day before quick play suggests stopping (once a day)
  function st() { var s = App.S; if (!s.edge) s.edge = { s: {}, days: {} }; return s.edge; }
  function dk(t) { var d = new Date(t); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  // called by the app for every graded answer (k = subject, ok = right or wrong)
  function note(k, ok) {
    if (!NAME[k]) return;
    var e = st(), x = e.s[k] || (e.s[k] = { a: 0, n: 0, t: 0 }), v = typeof ok === 'number' ? ok : ok ? 1 : 0, now = Date.now();
    x.a = x.n < 20 ? (x.a * x.n + v) / (x.n + 1) : x.a * 0.94 + v * 0.06;  // v: 1 right, 0.5 inaccuracy, 0 wrong  // plain average at first, then weighted to recent answers
    x.n++; x.t = now;
    var d = dk(now); if (!e.days[d]) { e.days[d] = 1; var ks = Object.keys(e.days).sort(); while (ks.length > 60) delete e.days[ks.shift()]; }
  }
  function fade(days) { return days <= GRACE ? 1 : Math.pow(0.5, (days - GRACE) / HALF); }
  function info(k) {
    var x = st().s[k]; if (!x || x.n < MIN_N) return null;
    var days = (Date.now() - x.t) / 864e5, peak = Math.round(x.a * 100);
    return { k: k, name: NAME[k], peak: peak, now: Math.round(x.a * 100 * fade(days)), days: days, n: x.n };
  }
  function all() { return SUBJ.map(function (s) { return info(s[0]); }).filter(Boolean); }
  function overall() { var a = all(); if (!a.length) return null; return Math.round(a.reduce(function (t, x) { return t + x.now; }, 0) / a.length); }
  function lastActive() { var t = 0, s = st().s; Object.keys(s).forEach(function (k) { t = Math.max(t, s[k].t || 0); }); return t; }
  function daysAway() { var t = lastActive(); return t ? (Date.now() - t) / 864e5 : 0; }
  // subjects most in need of a re-test first: faded the most from their peak, then lowest now
  function rank() { return all().sort(function (a, b) { return (b.peak - b.now) - (a.peak - a.now) || a.now - b.now; }).map(function (x) { return x.k; }); }
  function daysTrained(n) { var e = st(), c = 0; for (var i = 0; i < n; i++) if (e.days[dk(Date.now() - i * 864e5)]) c++; return c; }
  function ago(d) { return d < 1 ? 'today' : d < 2 ? 'yesterday' : Math.floor(d) + ' days ago'; }
  function color(v) { return v >= 75 ? 'var(--good)' : v >= 55 ? 'var(--accent)' : 'var(--bad)'; }

  // one-line chip for the Home hero
  function chipHTML() {
    var o = overall(); if (o === null) return '';
    var worst = all().sort(function (a, b) { return a.now - b.now; })[0], fading = worst && worst.days > GRACE && worst.now < worst.peak - 4;
    return '<button class="hchip" id="edgechip" style="margin-top:8px;cursor:pointer;display:inline-flex;align-self:flex-start;width:auto">Edge ' + o + (fading ? ' · ' + esc(worst.name) + ' fading' : '') + ' ›</button>';
  }
  // coming back after days away: offer an edge check once per return
  function welcome(start) {
    var e = st(), away = daysAway(), t = lastActive(), tot = 0;
    Object.keys(e.s).forEach(function (k) { tot += e.s[k].n; });
    if (away < AWAY || tot < 30 || e.welcomed === t) return false;
    e.welcomed = t; App.save();
    var a = all(), was = a.length ? Math.round(a.reduce(function (s, x) { return s + x.peak; }, 0) / a.length) : 0, now = overall();
    var sheet = App.modal('<div class="grab"></div><span class="eyebrow">Welcome back</span><h2>' + Math.floor(away) + ' days away</h2><p>Your edge went from <b>' + was + '</b> to <b>' + now + '</b> while you were gone. That’s normal; it comes back fastest with a short re-test, not a marathon.</p><p class="small mute">Edge check: quick play starts with the subjects that faded most, about 10 minutes, then carries on as usual.</p><div class="btns"><button class="btn" id="egl">Later</button><button class="btn primary" id="egs">Start edge check</button></div>', false);
    $('#egl', sheet).onclick = function () { App.closeModal(); };
    $('#egs', sheet).onclick = function () { App.closeModal(); start(); };
    return true;
  }
  // once a day, after a big day, quick play suggests stopping (for the burn out → drift away pattern)
  function fullDay(n) { var e = st(), d = dk(Date.now()); if (n < FULL_DAY || e.full === d) return false; e.full = d; App.save(); return true; }

  function screen(start) {
    App.screen('Keep your edge', function (v) {
      var a = all(), o = overall(), d14 = daysTrained(14);
      v.innerHTML = '<div><span class="eyebrow">Mastery</span><h1>Keep your edge</h1><p class="mute small">Each subject’s score is how sharp your recent answers have been. After ' + GRACE + ' days without it, it starts to fade, halving about every 3 weeks. A little most days beats a lot then nothing.</p></div>' +
        '<div class="panel" style="gap:8px"><div class="row"><span class="pill acc">Edge ' + (o === null ? '—' : o) + '</span><span class="pill">' + d14 + ' of last 14 days trained</span></div>' +
        (a.length ? '<div class="list" style="gap:10px">' + SUBJ.map(function (s) {
          var x = info(s[0]);
          if (!x) return '<div class="row small mute"><span class="grow">' + s[1] + '</span><span>needs ' + MIN_N + ' answers</span></div>';
          return '<div><div class="row small"><span class="grow"><b>' + s[1] + '</b> <span class="mute">· ' + ago(x.days) + '</span></span><span class="mono" style="color:' + color(x.now) + '">' + x.now + (x.now < x.peak ? ' <span class="mute">/ ' + x.peak + '</span>' : '') + '</span></div><div class="bar" aria-hidden="true"><i style="width:' + x.now + '%;background:' + color(x.now) + '"></i></div></div>';
        }).join('') + '</div>' : '<p class="small mute">Answer a few questions in any subject and your scores show up here.</p>') +
        '<button class="btn primary" id="egc" style="width:100%"' + (a.length ? '' : ' disabled') + '>Edge check</button><p class="small mute">Starts quick play with your most-faded subjects first (4 blocks, Quick Math with every question on the clock), then carries on as usual.</p></div>';
      if (a.length) $('#egc', v).onclick = start;
    });
  }
  return { note: note, info: info, all: all, overall: overall, rank: rank, daysAway: daysAway, chipHTML: chipHTML, welcome: welcome, fullDay: fullDay, screen: screen, NAME: NAME, daysTrained: daysTrained };
})();
