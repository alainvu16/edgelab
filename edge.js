// ===================== KEEP YOUR EDGE: a sharpness score that fades when you stop =====================
// Built for the real pattern: train hard, burn out, drift away, come back. Every graded answer feeds a per-subject
// sharpness (recent accuracy). After 2 days without that subject it starts to fade, halving about every 3 weeks.
// Coming back after 4+ days away offers an Edge check: quick play that starts with the most-faded subjects.
var EG = (function () {
  var $ = App.$, $$ = App.$$, esc = App.esc;
  var SUBJ = [['chess', 'Chess'], ['xq', 'Xiangqi'], ['poker', 'Poker'], ['mkt', 'Markets'], ['words', 'Words'], ['math', 'Quick Math'], ['quotes', 'Quotes'], ['street', 'Street Smarts']];
  var NAME = {}; SUBJ.forEach(function (s) { NAME[s[0]] = s[1]; });
  var MIN_N = 10;          // answers before a subject gets a score
  var GRACE = 2, HALF = 21; // days before fading starts; days for the score to halve after that
  var AWAY = 4;            // days away that count as "coming back"
  var FULL_DAY = 180;      // default: graded answers in a day before quick play suggests stopping (once a day); Settings can change it (App.S.fullDay, 0 = off)
  function st() { var s = App.S; if (!s.edge) s.edge = { s: {}, days: {} }; if (!s.edge.seeded) seed(s.edge); return s.edge; }
  // Your history from before the edge score existed counts too: each subject starts from what the app already
  // recorded (right / total), weighted like up to 60 answers, so the score is real from day one. Runs once.
  function seed(e) {
    e.seeded = 1;
    var S = App.S, hist = {};
    function add(k, ok, n) { if (n > 0) { var h = hist[k] || (hist[k] = { ok: 0, n: 0 }); h.ok += ok; h.n += n; } }
    try { var th = (S.chess && S.chess.theme) || {}; Object.keys(th).forEach(function (k) { add('chess', th[k].ok, th[k].n); }); } catch (x) {}
    try { var g = (S.xq && S.xq.games) || {}; add('xq', (g.w || 0) + 0.5 * (g.d || 0), (g.w || 0) + (g.l || 0) + (g.d || 0)); } catch (x) {}
    try { add('poker', S.poker.right || 0, S.poker.total || 0); } catch (x) {}
    try { add('mkt', S.mkt.correct || 0, S.mkt.answered || 0); } catch (x) {}
    try { add('math', S.math.ok || 0, S.math.n || 0); } catch (x) {}
    function boxes(k, bx, max) { var ks = Object.keys(bx || {}); if (ks.length) add(k, ks.reduce(function (t, w) { return t + Math.min(max, bx[w]) / max; }, 0), ks.length); }
    try { boxes('words', S.vocab && S.vocab.box, 4); } catch (x) {}
    try { boxes('words', S.gloss && S.gloss.box, 4); } catch (x) {}
    try { boxes('quotes', S.sage && S.sage.box, 4); } catch (x) {}
    Object.keys(hist).forEach(function (k) {
      var h = hist[k]; if (h.n < 5) return;
      var hn = Math.min(60, h.n), ha = h.ok / h.n, cur = e.s[k] || { a: 0, n: 0, t: 0 };
      e.s[k] = { a: (ha * hn + cur.a * cur.n) / (hn + cur.n), n: hn + cur.n, t: cur.t || Date.now() };
    });
  }
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
  function fullDay(n) { var e = st(), d = dk(Date.now()), lim = App.S.fullDay == null ? FULL_DAY : App.S.fullDay; if (!lim || n < lim || e.full === d) return false; e.full = d; App.save(); return true; }

  // ---------- mastery part 2: harder re-tests of what you've mastered, and a monthly edge test ----------
  // Each provider turns what you already learned in a subject into fresh questions. mastered=true keeps only
  // what you've nailed (for Mastery rounds); false takes anything you've learned (for the monthly test).
  // Question shape: { k: subject, head: html, o: [{ t, ok }], why: html, secs }.
  function shuffle(a) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function four(right, wrongs) { var seen = {}, o = [{ t: right, ok: true }]; seen[right] = 1; shuffle(wrongs.slice()).forEach(function (w) { if (o.length < 4 && w && !seen[w]) { seen[w] = 1; o.push({ t: w, ok: false }); } }); return shuffle(o); }
  function hk(t) { var v = 0; for (var i = 0; i < t.length; i++) v = (v * 31 + t.charCodeAt(i)) | 0; return 's' + (v >>> 0).toString(36); }
  var PROVIDERS = {
    words: function (n, mastered) {
      if (typeof WZ === 'undefined') return [];
      var bx = WZ.vst().box || {}, pool = WZ.WORDS.filter(function (w) { return (bx[w[0]] || 0) >= (mastered ? 4 : 2) && w[3]; });
      return shuffle(pool.slice()).slice(0, n).map(function (w) {
        var re = new RegExp(w[0].replace(/[.*+?^${}()|[\]\\]/g, '\\$&').split(' ').join('\\s+') + '\\w*', 'i'), gap = w[3].replace(re, '_____');
        if (gap === w[3]) return null;
        var others = WZ.WORDS.filter(function (x) { return x !== w && Math.abs(x[1] - w[1]) <= 1; }).map(function (x) { return x[0]; });
        return { k: 'words', head: esc(gap), label: 'Which word fills the gap?', o: four(w[0], others), why: '<b>' + esc(w[0]) + '</b>: ' + esc(w[2]), secs: 15 };
      }).filter(Boolean);
    },
    quotes: function (n, mastered) {
      if (typeof SAGES === 'undefined' || !App.S.sage) return [];
      var bx = App.S.sage.box || {}, got = {}; (App.S.sage.got || []).forEach(function (id) { got[id] = 1; });
      var pool = SAGES.filter(function (r) { var id = hk(r[0]); return got[id] && (bx[id] || 0) >= (mastered ? 4 : 1); });
      return shuffle(pool.slice()).slice(0, n).map(function (r) {
        var others = SAGES.filter(function (x) { return x !== r; }).map(function (x) { return '“' + x[0] + '” — ' + x[1]; });
        return { k: 'quotes', head: esc(r[6]), label: 'Which line fits this moment?', o: four('“' + r[0] + '” — ' + r[1], others), why: esc(r[5]), secs: 25 };
      });
    },
    math: function (n) {
      if (typeof MM === 'undefined') return [];
      var lv = Math.min(5, (MM.st().lv || 1) + 1), out = [];
      for (var i = 0; i < n; i++) { var q = MM.makeQ(lv); out.push({ k: 'math', head: esc(q.q), label: 'Quick Math · level ' + lv, o: q.o, why: esc(q.tip), secs: 12 }); }
      return out;
    },
    mkt: function (n, mastered) {
      if (typeof MK === 'undefined' || !App.S.mkt) return [];
      var qs = App.S.mkt.q || {}, pool = [];
      MK.Q.forEach(function (q, i) { var r = qs[i]; if (r && r.box >= (mastered ? 3 : 1) && (!mastered || q[1] >= 2)) pool.push(q); });
      return shuffle(pool).slice(0, n).map(function (q) { return { k: 'mkt', head: esc(q[2]), label: 'Markets · ' + q[0], o: shuffle(q[3].map(function (t, j) { return { t: t, ok: j === 0 }; })), why: esc(q[4]), secs: 20 }; });
    },
    poker: function (n, mastered) {
      if (typeof PK === 'undefined' || !App.S.poker) return [];
      var kinds = App.S.poker.kinds || {}, ok = Object.keys(kinds).filter(function (k) { var x = kinds[k]; return PK.GEN[k] && x.n >= 5 && x.ok / x.n >= (mastered ? 0.8 : 0.5); });
      var out = [];
      for (var i = 0; i < n && ok.length; i++) {
        var q; try { q = PK.GEN[ok[i % ok.length]](); } catch (e) { continue; }
        var table = (q.vill || (q.board && q.board.length) || q.hero) ? '<div class="table" style="border-radius:18px;margin-top:8px">' + (q.vill ? '<div class="seat"><span class="nm">Villain</span>' + PK.cardsHTML(q.vill) + '</div>' : '') + (q.board && q.board.length ? PK.cardsHTML(q.board) : '') + (q.hero ? '<div class="seat">' + PK.cardsHTML(q.hero, { big: true }) + '<span class="nm">You</span></div>' : '') + '</div>' : '';
        out.push({ k: 'poker', head: q.q + table, raw: true, label: 'Poker', o: shuffle(q.opts.map(function (t) { return { t: String(t), ok: String(t) === String(q.ans), raw: true }; })), why: q.why || '', secs: 25 });
      }
      return out;
    },
    street: function (n, mastered) { return typeof ST !== 'undefined' ? ST.provide(n, mastered) : []; }
  };
  // chess and xiangqi already get harder as your rating climbs; their mastery round is a puzzle run at your level
  var PUZZLE_RUN = { chess: function () { App.tab('chess'); if (typeof CZ !== 'undefined' && CZ.puzzles) CZ.puzzles(); }, xq: function () { App.tab('xq'); if (typeof XQ !== 'undefined' && XQ.puzzles) XQ.puzzles(); } };
  function canMaster(k) { var x = info(k); if (!x || x.peak < 80) return false; return PUZZLE_RUN[k] ? true : (PROVIDERS[k] ? PROVIDERS[k](5, true).length >= 5 : false); }
  // one round of mixed questions, every one on the clock, graded like everything else
  function runRound(title, qs, onEnd) {
    App.screen(title, function (v) {
      var n = 0, right = 0, by = {};
      v.innerHTML = '<div id="q"></div>';
      function ask() {
        if (n >= qs.length) return onEnd(right, qs.length, by, v);
        var q = qs[n], t0 = Date.now(), done = false, tm = null; App.setSubj(q.k);
        $('#q', v).innerHTML = '<div class="panel"><span class="eyebrow">' + (n + 1) + ' / ' + qs.length + ' · ' + esc(q.label || '') + '</span><h2 style="font-size:18px;font-weight:600;line-height:1.45">' + q.head + '</h2><div style="height:4px;border-radius:2px;background:var(--line);overflow:hidden"><div id="bar" style="height:100%;width:100%;background:var(--accent);transition:width .25s linear"></div></div><p class="small mute mono" id="clk">' + q.secs + ' s</p></div><div class="list">' + q.o.map(function (o, i) { return '<button class="btn opt" data-k="' + i + '" style="text-align:left;font-weight:500">' + (o.raw ? o.t : esc(o.t)) + '</button>'; }).join('') + App.idkBtn('k') + '</div><div id="fb"></div>';
        function grade(b) {
          if (done) return; done = true; clearInterval(tm);
          var out = !b, ok = !out && !!(q.o[+b.dataset.k] || {}).ok; if (ok) right++;
          var s = by[q.k] || (by[q.k] = { ok: 0, n: 0 }); s.n++; if (ok) s.ok++;
          $$('[data-k]', v).forEach(function (x) { x.disabled = out; if ((q.o[+x.dataset.k] || {}).ok) x.classList.add('right'); else if (x === b) x.classList.add('wrong'); });
          $('#fb', v).innerHTML = App.coachHTML(ok ? 'right' : 'wrong', (out ? '<b>Time’s up.</b> ' : '') + q.why) + '<button class="btn primary" id="nx" style="width:100%">Next</button>';
          $('#nx', v).onclick = function () { n++; ask(); };
        }
        tm = setInterval(function () { var c = $('#clk', v), bar = $('#bar', v); if (!c || done) { clearInterval(tm); return; } var left = q.secs - (Date.now() - t0) / 1000; c.textContent = Math.max(0, Math.ceil(left)) + ' s'; if (bar) bar.style.width = Math.max(0, left / q.secs * 100) + '%'; if (left <= 0) grade(null); }, 250);
        $$('[data-k]', v).forEach(function (b) { b.onclick = function () { grade(b); }; });
      }
      ask();
    });
  }
  function mastery(k) {
    if (PUZZLE_RUN[k]) { PUZZLE_RUN[k](); return; }
    var qs = PROVIDERS[k](10, true);
    runRound('Mastery · ' + NAME[k], qs, function (r, n, by, v) {
      var e = st(); e.mast = e.mast || {}; e.mast[k] = { r: r, n: n, t: Date.now() }; App.save();
      if (r >= n - 1) App.celebrate('level');
      v.innerHTML = App.coachHTML('info', '<b>' + r + ' / ' + n + '</b> on mastered ' + esc(NAME[k]) + ', all on the clock. ' + (r >= n - 1 ? 'That’s real mastery: you know it cold and fast.' : r >= n * 0.7 ? 'Solid. The ones you missed are slipping; they’ll come back in your normal rounds.' : 'More of this has faded than it looks. A few normal rounds will bring it back.')) + '<div class="btns"><button class="btn primary" id="dn">Done</button></div>';
      $('#dn', v).onclick = function () { App.checkpoint(App.back); };
    });
  }
  // ---- monthly edge test: 20 questions across everything you've learned, once a month ----
  function monthKey(t) { var d = new Date(t || Date.now()); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0'); }
  function monthName(k) { var p = k.split('-'); return new Date(+p[0], +p[1] - 1, 1).toLocaleString('en-US', { month: 'short' }); }
  function testQuestions() {
    var keys = Object.keys(PROVIDERS), per = {}, out = [];
    keys.forEach(function (k) { per[k] = PROVIDERS[k](6, false); });
    for (var round = 0; out.length < 20 && round < 6; round++) keys.forEach(function (k) { if (out.length < 20 && per[k][round]) out.push(per[k][round]); });
    return shuffle(out);
  }
  function monthlyDue() { var e = st(), tot = 0; Object.keys(e.s).forEach(function (k) { tot += e.s[k].n; }); return tot >= 100 && !(e.tests || {})[monthKey()]; }
  function monthlyTest() {
    var qs = testQuestions();
    if (qs.length < 8) { App.toast('Learn a bit more first: the monthly test needs material from a few subjects'); return; }
    runRound('Monthly edge test', qs, function (r, n, by, v) {
      var e = st(); e.tests = e.tests || {}; var res = { score: Math.round(r / n * 100), by: {} };
      Object.keys(by).forEach(function (k) { res.by[k] = Math.round(by[k].ok / by[k].n * 100); });
      var prevK = Object.keys(e.tests).sort().filter(function (k) { return k < monthKey(); }).pop(), prev = prevK ? e.tests[prevK] : null;
      e.tests[monthKey()] = res; App.save();
      var weakest = Object.keys(res.by).sort(function (a, b) { return res.by[a] - res.by[b]; })[0];
      v.innerHTML = App.coachHTML('info', '<b>' + res.score + '%</b> this month' + (prev ? ' (' + monthName(prevK) + ': ' + prev.score + '%)' : '') + '. ' + (weakest ? 'Weakest: <b>' + esc(NAME[weakest]) + '</b> (' + res.by[weakest] + '%). Quick play will lean on it.' : '')) +
        '<div class="panel" style="gap:6px">' + Object.keys(res.by).map(function (k) { return '<div class="row small"><span class="grow">' + esc(NAME[k]) + '</span><span class="mono">' + res.by[k] + '%' + (prev && prev.by[k] != null ? ' <span class="mute">(' + (res.by[k] - prev.by[k] >= 0 ? '+' : '') + (res.by[k] - prev.by[k]) + ')</span>' : '') + '</span></div>'; }).join('') + '</div>' +
        '<div class="btns"><button class="btn primary" id="dn">Done</button></div>';
      if (prev && res.score > prev.score) App.celebrate('level');
      $('#dn', v).onclick = function () { App.checkpoint(App.back); };
    });
  }
  function monthlyOffer() {
    var e = st(); if (!monthlyDue() || e.offered === monthKey()) return false;
    e.offered = monthKey(); App.save();
    var sheet = App.modal('<div class="grab"></div><span class="eyebrow">New month</span><h2>Monthly edge test</h2><p>20 timed questions across everything you’ve learned, about 8 minutes. You’ll see where you stand against last month.</p><div class="btns"><button class="btn" id="mtl">Later</button><button class="btn primary" id="mts">Take it</button></div>', false);
    $('#mtl', sheet).onclick = function () { App.closeModal(); };
    $('#mts', sheet).onclick = function () { App.closeModal(); monthlyTest(); };
    return true;
  }
  function testHistory() { var t = st().tests || {}; return Object.keys(t).sort().slice(-4).map(function (k) { return monthName(k) + ' ' + t[k].score + '%'; }).join(' · '); }

  function screen(start) {
    App.screen('Keep your edge', function (v) {
      var a = all(), o = overall(), d14 = daysTrained(14);
      v.innerHTML = '<div><span class="eyebrow">Mastery</span><h1>Keep your edge</h1><p class="mute small">Each subject’s score is how sharp your recent answers have been. After ' + GRACE + ' days without it, it starts to fade, halving about every 3 weeks. A little most days beats a lot then nothing.</p></div>' +
        '<div class="panel" style="gap:8px"><div class="row"><span class="pill acc">Edge ' + (o === null ? '—' : o) + '</span><span class="pill">' + d14 + ' of last 14 days trained</span></div>' +
        (a.length ? '<div class="list" style="gap:10px">' + SUBJ.map(function (s) {
          var x = info(s[0]);
          if (!x) return '<div class="row small mute"><span class="grow">' + s[1] + '</span><span>needs ' + MIN_N + ' answers</span></div>';
          return '<div><div class="row small"><span class="grow"><b>' + s[1] + '</b> <span class="mute">· ' + ago(x.days) + '</span>' + (canMaster(s[0]) ? ' <button class="btn sm ghost" data-ms="' + s[0] + '" style="padding:2px 8px;min-height:0">Mastery ›</button>' : '') + '</span><span class="mono" style="color:' + color(x.now) + '">' + x.now + (x.now < x.peak ? ' <span class="mute">/ ' + x.peak + '</span>' : '') + '</span></div><div class="bar" aria-hidden="true"><i style="width:' + x.now + '%;background:' + color(x.now) + '"></i></div></div>';
        }).join('') + '</div>' : '<p class="small mute">Answer a few questions in any subject and your scores show up here.</p>') +
        '<button class="btn primary" id="egc" style="width:100%"' + (a.length ? '' : ' disabled') + '>Edge check</button><p class="small mute">Starts quick play with your most-faded subjects first (4 blocks, Quick Math with every question on the clock), then carries on as usual.</p></div>' +
        '<div class="panel" style="gap:8px"><span class="eyebrow">Monthly edge test</span><p class="small mute">20 timed questions across everything you’ve learned, once a month, to see where you stand vs. last month.' + (testHistory() ? ' <b>' + testHistory() + '</b>' : '') + '</p><button class="btn" id="mtest" style="width:100%">' + ((st().tests || {})[monthKey()] ? 'Retake this month’s test' : 'Take this month’s test') + '</button></div>' +
        '<p class="small mute">Mastery appears next to a subject once it has hit 80: ten of the things you’ve already nailed, harder and on the clock. Chess and xiangqi puzzles already get harder as your rating climbs, so theirs is a puzzle run.</p>';
      if (a.length) $('#egc', v).onclick = start;
      $('#mtest', v).onclick = monthlyTest;
      $$('[data-ms]', v).forEach(function (b) { b.onclick = function () { mastery(b.dataset.ms); }; });
    });
  }
  return { mastery: mastery, canMaster: canMaster, monthlyTest: monthlyTest, monthlyOffer: monthlyOffer, PROVIDERS: PROVIDERS, note: note, info: info, all: all, overall: overall, rank: rank, daysAway: daysAway, chipHTML: chipHTML, welcome: welcome, fullDay: fullDay, screen: screen, NAME: NAME, daysTrained: daysTrained };
})();
