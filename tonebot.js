// ===================== TONEBOT SCHOOL: learn the bot you built =====================
// Engine only: the lessons and the bot's nightly facts load privately (see refresh below).
var TB = (function () {
  var $ = App.$, $$ = App.$$, esc = App.esc;
  var TAGS = { proven: ['good', '✅ Proven'], half: ['warn', '🟡 Half-proven'], no: ['bad', '❌ Not proven'], rule: ['ok', '📘 Your rule'] };
  // Lessons and live bot facts are PRIVATE: they load from Alain's private repo (edgelab-data) with the
  // phone's own GitHub key, and are cached on the phone for offline. Nothing ToneBot-specific is in this public file.
  var L = [], T = null, CK = 'edgelab.tb.cache', C = null, CCK = 'edgelab.tb.course';
  try { C = JSON.parse(localStorage.getItem(CCK) || 'null'); } catch (e) {}
  try { var c0 = JSON.parse(localStorage.getItem(CK) || 'null'); if (c0) { L = c0.lessons || []; T = c0.data || null; } } catch (e) {}
  var lastFetch = 0;
  function refresh(done) {
    // at most once every 10 minutes, and only report "changed" when the content really differs (no re-render loops)
    if (!App.ghGetJSON || !App.ghConnected() || Date.now() - lastFetch < 600000) { if (done) done(false); return; }
    lastFetch = Date.now();
    Promise.all([App.ghGetJSON('tonebot-lessons.json'), App.ghGetJSON('tonebot.json'), App.ghGetJSON('tonebot-course.json')]).then(function (r) {
      var changed = false;
      if (r[2] && r[2].blocks && r[2].blocks.length && (!C || C.updated !== r[2].updated)) { C = r[2]; changed = true; try { localStorage.setItem(CCK, JSON.stringify(C)); } catch (e) {} }
      if (r[0] && r[0].lessons && r[0].lessons.length && JSON.stringify(r[0].lessons) !== JSON.stringify(L)) { L = r[0].lessons; changed = true; }
      if (r[1] && JSON.stringify(r[1]) !== JSON.stringify(T)) { T = r[1]; changed = true; }
      if (changed) try { localStorage.setItem(CK, JSON.stringify({ lessons: L, data: T, at: Date.now() })); } catch (e) {}
      if (done) done(changed);
    });
  }

  function st() { var s = App.S.tb; if (!s) s = App.S.tb = { done: {}, rr: { you: 0, bot: 0, spy: 0, n: 0 }, my: {} }; s.rr = s.rr || { you: 0, bot: 0, spy: 0, n: 0 }; s.my = s.my || {}; s.done = s.done || {}; return s; }

  // ---------- home ----------
  function home() {
    App.screen('ToneBot School', function (v) {
      var s = st(), n = L.filter(function (l) { return s.done[l.id]; }).length;
      if (!L.length) { v.innerHTML = '<div><span class="eyebrow">Learn the bot you built</span><h1>ToneBot School</h1></div><div class="panel"><p>' + (App.ghConnected() ? (navigator.onLine ? 'Loading your private ToneBot lessons…' : 'Connect to the internet once to download your private ToneBot lessons; after that they work offline.') : 'ToneBot School is private: it loads from your private GitHub backup. Turn on <b>Home → Backups → Auto-backup to your GitHub</b> first.') + '</p></div>'; refresh(function (ch) { if (ch && L.length) { App.back(); home(); } }); return; }
      refresh(function (ch) { if (ch && document.querySelector('.tb-home')) { App.back(); home(); } });
      v.innerHTML = '<div class="tb-home"><span class="eyebrow">Learn the bot you built</span><h1>ToneBot School</h1><p class="mute small">Your momentum + sector-rotation strategy, taught from ToneBot’s own lab results. Every lesson says how proven it is. ' + n + ' of ' + L.length + ' lessons done.</p></div>' +
        botPanel(T, s) +
        '<button class="item" id="mc" style="border-color:var(--accent)"><span class="grow"><span class="t">☀️ Daily drill: you vs ToneBot</span><br><span class="s">' + esc(drillStatus()) + ' · ' + esc(recShort()) + '</span></span><span class="end">›</span></button>' +
                '<div class="btns"><button class="btn" id="rr">Rotation Replay: you vs the bot</button></div>' +
        (hasCourse() ? '<button class="item" id="lc" style="border-color:var(--accent)"><span class="grow"><span class="t">📚 ToneBot course</span><br><span class="s">Read a lesson, then quiz it · ' + courseLessons().filter(lessonDone).length + ' of ' + courseLessons().length + ' lessons done · in order</span></span><span class="end">›</span></button>' : '') +
        '<h2>Lessons</h2><div class="list">' + L.map(function (l, i) { var tg = TAGS[l.tag]; return '<button class="item" data-l="' + i + '"><span class="grow"><span class="t">' + esc(l.t) + '</span><br><span class="s">' + tg[1] + '</span></span><span class="end">' + (s.done[l.id] ? '✓' : '›') + '</span></button>'; }).join('') + '</div>' +
        '<p class="small mute">Learning only. Nothing here changes what ToneBot trades. Market questions are for learning, not investment advice.</p>';
      $$('[data-l]', v).forEach(function (b) { b.onclick = function () { lesson(+b.dataset.l); }; });
      $('#rr', v).onclick = replay; $('#mc', v).onclick = drill; if ($('#lc', v)) $('#lc', v).onclick = course;
    });
  }
  function pct(x) { return x == null ? '—' : (x >= 0 ? '+' : '') + (x * 100).toFixed(1) + '%'; }
  function botPanel(T, s) {
    if (!T) return '<div class="panel"><span class="eyebrow">From your bot</span><p class="small mute">Live calls from ToneBot appear here after the nightly sync.</p></div>';
    var c = (T.calls || []).filter(function (x) { return x.aLead; }), hit = c.filter(function (x) { return x.lead === x.aLead; }).length;
    var last = (T.calls || []).slice(-5).reverse();
    var mine = Object.keys(s.my).map(function (d) { var x = (T.calls || []).find(function (y) { return y.date === d && y.aLead; }); return x ? { d: d, me: s.my[d], c: x } : null; }).filter(Boolean);
    var myHits = mine.filter(function (m) { return m.me.lead === m.c.aLead; }).length, botHitsSame = mine.filter(function (m) { return m.c.lead === m.c.aLead; }).length;
    var f = T.forecast, fr = f && f.rows && f.rows.P1;
    return '<div class="panel"><div class="row"><span class="eyebrow grow">From your bot · synced ' + esc(T.updated || '') + '</span>' + (T.crash ? '<span class="pill">Crash meter: ' + esc(T.crash.zone) + '</span>' : '') + '</div>' +
      '<p class="small"><b>Daily call:</b> ToneBot named the leading theme right on <b>' + hit + ' of ' + c.length + '</b> scored days.' + (mine.length ? ' You: <b>' + myHits + ' of ' + mine.length + '</b> on the same days (bot ' + botHitsSame + ').' : ' Beat it in the Daily drill below.') + '</p>' +
      '<div style="overflow-x:auto"><table class="small" style="width:100%;border-collapse:collapse"><tr class="mute"><td>Day</td><td>Bot said lead</td><td>Actually led</td></tr>' + last.map(function (x) { return '<tr><td class="mono">' + esc(x.date.slice(5)) + '</td><td>' + esc(x.lead) + (x.conf ? ' <span class="mute">' + Math.round(x.conf * 100) + '%</span>' : '') + '</td><td>' + (x.aLead ? esc(x.aLead) + (x.aLead === x.lead ? ' ✓' : '') : '<span class="mute">pending</span>') + '</td></tr>'; }).join('') + '</table></div>' +
      (fr ? '<p class="small"><b>Weekly forecast (' + esc(f.week) + '):</b> Paper 1 expected ' + pct(fr.center) + ' (range ' + pct(fr.lo) + ' to ' + pct(fr.hi) + ')' + (fr.actual != null ? ', actual ' + pct(fr.actual) + (fr.inside ? ' — inside the range' : ' — outside the range') : '') + '.</p>' : '') +
      (T.slump ? '<p class="small mute">' + esc(T.slump) + '</p>' : '') + '</div>';
  }

  // ---------- lesson ----------
  function lesson(i) {
    var l = L[i]; if (!l) return;
    App.screen(l.t, function (v) {
      var tg = TAGS[l.tag], qi = 0, right = 0;
      v.innerHTML = '<span class="pill ' + tg[0] + '" style="align-self:flex-start">' + tg[1] + '</span><h1>' + esc(l.t) + '</h1><div class="prose">' + l.b.map(function (p) { return '<p>' + esc(p) + '</p>'; }).join('') + '</div><h3>Check</h3><div id="qq"></div>';
      function ask() {
        if (qi >= l.q.length) {
          var pass = right >= l.q.length - (l.q.length > 2 ? 1 : 0);
          if (pass) { st().done[l.id] = 1; App.save(); App.celebrate('level'); }
          $('#qq', v).innerHTML = App.coachHTML(pass ? 'right' : 'info', right + ' of ' + l.q.length + '. ' + (pass ? 'Lesson complete.' : 'Read it once more and try again; the order shuffles.')) + '<div class="btns">' + (pass && i + 1 < L.length ? '<button class="btn primary" id="nl">Next lesson</button>' : '<button class="btn primary" id="again">Try again</button>') + '<button class="btn" id="bk2">Back</button></div>';
          if ($('#nl', v).id === 'nl') $('#nl', v).onclick = function () { App.checkpoint(function () { App.back(); lesson(i + 1); }); };
          if ($('#again', v).id === 'again') $('#again', v).onclick = function () { App.back(); lesson(i); };
          $('#bk2', v).onclick = function () { App.checkpoint(App.back); };
          return;
        }
        var q = l.q[qi], order = q[1].map(function (_, k) { return k; }).sort(function () { return Math.random() - .5; }), done = false;
        $('#qq', v).innerHTML = '<p><b>' + (qi + 1) + '/' + l.q.length + '.</b> ' + esc(q[0]) + '</p><div class="list">' + order.map(function (k) { return '<button class="btn opt" data-k="' + k + '">' + esc(q[1][k]) + '</button>'; }).join('') + App.idkBtn('k') + '</div><div id="fb"></div>';
        $$('[data-k]', v).forEach(function (b) {
          b.onclick = function () {
            if (done) return; done = true; var ok = +b.dataset.k === 0; if (ok) right++;
            $$('[data-k]', v).forEach(function (x) { if (+x.dataset.k === 0) x.classList.add('right'); else if (x === b) x.classList.add('wrong'); });
            $('#fb', v).innerHTML = App.coachHTML(ok ? 'right' : 'wrong', esc(q[2])) + '<button class="btn primary" id="nx" style="width:100%">Next</button>';
            $('#nx', v).onclick = function () { qi++; ask(); };
          };
        });
      }
      ask();
    });
  }

  // ---------- Rotation Replay on real monthly data: pick a theme, the bot's rule picks the 3-month leader ----------
  var THEMES = [['Tech', 'QQQ', 'm'], ['Chips', 'SMH', 't'], ['Homebuilders', 'XHB', 't'], ['Small caps', 'IWM', 'm'], ['Gold', 'GLD', 'm'], ['Banks', 'KRE', 't'], ['Energy', 'XLE', 'm'], ['Health care', 'XLV', 'm'], ['Utilities', 'XLU', 'm']];
  function series(th) {
    try {
      if (th[2] === 'm') return { d: MKT_DATA.monthly.dates, p: MKT_DATA.monthly.px[th[1]] };
      return { d: TAPE_DATA.dates, p: TAPE_DATA.px[th[1]] };
    } catch (e) { return null; }
  }
  function priceAt(th, ym) { var s = series(th); if (!s || !s.p) return null; var i = s.d.indexOf(ym); return i >= 0 ? s.p[i] : null; }
  function months() { try { return MKT_DATA.monthly.dates.filter(function (d) { return TAPE_DATA.dates.indexOf(d) >= 0; }); } catch (e) { return []; } }
  function replay() {
    App.screen('Rotation Replay', function (v) {
      var ms = months(), s = st();
      function round() {
        // a random real month with 3 months of history before it and 1 after
        var k = 3 + Math.floor(Math.random() * (ms.length - 5)), m0 = ms[k - 3], m = ms[k], m1 = ms[k + 1];
        var rows = THEMES.map(function (th) {
          var a = priceAt(th, m0), b = priceAt(th, m), c = priceAt(th, m1), spy0 = priceAt(['', 'SPY', 'm'], m), spy1 = priceAt(['', 'SPY', 'm'], m1);
          return { th: th, mom: a && b ? b / a - 1 : null, nxt: b && c ? c / b - 1 : null };
        }).filter(function (r) { return r.mom != null && r.nxt != null; });
        if (rows.length < 6) return round();
        var spyN = priceAt(['', 'SPY', 'm'], m1) / priceAt(['', 'SPY', 'm'], m) - 1;
        var bot = rows.slice().sort(function (a, b) { return b.mom - a.mom; })[0];
        var shown = rows.slice().sort(function () { return Math.random() - .5; });
        var label = new Date(m + '-15').toLocaleDateString(undefined, { month: 'long', year: 'numeric' }), nextLabel = new Date(m1 + '-15').toLocaleDateString(undefined, { month: 'long' });
        v.innerHTML = '<div class="row"><span class="pill acc">End of ' + label + '</span><span class="pill">Round ' + (s.rr.n + 1) + '</span></div>' +
          '<p class="small">Here is how each of your themes did over the last 3 months. Pick ONE to hold through ' + nextLabel + '. ToneBot’s rule buys the strongest 3-month theme.</p>' +
          '<div class="list">' + shown.map(function (r, i) { return '<button class="btn opt" data-i="' + i + '" style="display:flex;justify-content:space-between"><span>' + r.th[0] + ' <span class="mute small">' + r.th[1] + '</span></span><span class="mono">' + pct(r.mom) + '</span></button>'; }).join('') + '</div><div id="fb"></div>';
        var done = false;
        $$('[data-i]', v).forEach(function (b) {
          b.onclick = function () {
            if (done) return; done = true;
            var me = shown[+b.dataset.i], best = rows.slice().sort(function (a, c) { return c.nxt - a.nxt; })[0];
            s.rr.n++; s.rr.you += me.nxt; s.rr.bot += bot.nxt; s.rr.spy += spyN; App.save();
            $$('[data-i]', v).forEach(function (x) { var r = shown[+x.dataset.i]; x.innerHTML = '<span>' + r.th[0] + '</span><span class="mono">next: ' + pct(r.nxt) + '</span>'; if (r === best) x.classList.add('right'); else if (x === b && r !== best) x.classList.add('wrong'); });
            var win = me.nxt >= bot.nxt;
            $('#fb', v).innerHTML = App.coachHTML(win ? 'right' : 'info', '<b>You:</b> ' + me.th[0] + ' ' + pct(me.nxt) + ' · <b>Bot rule:</b> ' + bot.th[0] + ' ' + pct(bot.nxt) + ' · <b>S&amp;P:</b> ' + pct(spyN) + '<br>' + (bot.th === best.th ? 'Momentum held: the 3-month leader kept leading.' : 'Momentum didn’t hold this month: ' + best.th[0] + ' led instead. One month is noise; momentum pays over many months.') +
              '<br><span class="small mute">Running total over ' + s.rr.n + ' rounds: you ' + pct(s.rr.you) + ' · bot rule ' + pct(s.rr.bot) + ' · S&amp;P ' + pct(s.rr.spy) + '</span>') +
              '<div class="btns"><button class="btn primary" id="ag">Next month</button><button class="btn" id="dn">Done</button></div>';
            $('#ag', v).onclick = function () { if (s.rr.n % 8 === 0) App.checkpoint(round); else round(); };
            $('#dn', v).onclick = function () { App.checkpoint(App.back); };
          };
        });
      }
      round();
    });
  }


  // ---------- TONEBOT COURSE (Oct 17): the bot's full course as one learning course — read a lesson, then quiz it ----------
  // Data: tonebot-course.json (blocks = the course text in order, quiz = 294 multiple-choice questions with a 'why' per choice).
  // Order = the course's own order (track → level → lesson). A missed question comes back as a true/false "second look",
  // then once more as the full question; a lesson is done when all its questions are learned.
  function splitT(x) { var m = String(x || '').match(/^(.*?)\s—\s((?:📘|🧪|✅|🔒).*)$/u); return m ? [m[1], m[2]] : [String(x || ''), '']; }
  function courseTracks() {
    var out = [], cur = null;
    ((C && C.blocks) || []).forEach(function (b) { if (b[0] === 'h1') { cur = { t: b[1], b: [] }; out.push(cur); } else if (cur) cur.b.push(b); });
    return out;
  }
  var LS_CACHE = null;
  function courseLessons() {
    if (LS_CACHE && LS_CACHE.c === C) return LS_CACHE.l;
    var out = [], tr = '', tag = '', lv = '', cur = null;
    ((C && C.blocks) || []).forEach(function (b) {
      if (b[0] === 'h1') { var x = splitT(b[1]); tr = x[0]; tag = x[1]; cur = null; }
      else if (b[0] === 'h2') { lv = b[1]; cur = null; }
      else if (b[0] === 'h3') { cur = { i: out.length, track: tr, tag: tag, level: lv, title: b[1], body: [] }; out.push(cur); }
      else if (cur && b[0] === 'p') cur.body.push(b[1]);
    });
    var qs = (C && C.quiz) || [];
    out.forEach(function (l) { l.qs = qs.filter(function (q) { return q.track === l.track && q.lesson === l.title; }); });
    LS_CACHE = { c: C, l: out };
    return out;
  }
  function cqState() { var s = st(); s.cq = s.cq || {}; s.cl = s.cl || {}; return s.cq; }
  function lessonKey(l) { return l.track + ' · ' + l.title; }
  function lessonDone(l) { var cq = cqState(); return l.qs.length ? l.qs.every(function (q) { return (cq[q.id] || {}).s === 'ok'; }) : !!st().cl[lessonKey(l)]; }
  function lessonsOf(start) { return courseLessons().filter(function (l) { return !start || l.track.indexOf(start) === 0; }); }
  function lessonSeen(l) { var cq = cqState(); return l.qs.length ? l.qs.every(function (q) { return !!cq[q.id]; }) : !!st().cl[lessonKey(l)]; }
  function courseProgress(start) { var ls = lessonsOf(start); if (!ls.length) return null; return ls.filter(lessonDone).length / ls.length; }
  function hasCourse() { return !!(C && C.blocks && C.blocks.length && C.quiz && C.quiz.length); }
  function courseNext(start) {
    if (!hasCourse()) { App.screen('ToneBot course', function (v) { v.innerHTML = '<div class="panel"><p>The course downloads from your private backup the next time the app is online.</p></div>'; refresh(); }); return; }
    var ls = lessonsOf(start), l = ls.filter(function (x) { return !lessonSeen(x); })[0];   // next lesson you haven't tried yet, in order
    if (l) { playLesson(l, start); return; }
    var due = dueSecondLooks().filter(function (q) { return !start || q.track.indexOf(start) === 0; });
    if (due.length) runQuiz(due.slice(0, 6).map(function (q) { return { q: q, tf: (cqState()[q.id] || {}).s === 'tf' }; }), 'Second look', function () { courseNext(start); });
    else courseReview(start);
  }
  // one lesson: read it, then answer its questions
  function playLesson(l, start) {
    App.screen('ToneBot course', function (v) {
      var all = lessonsOf(start), pos = all.indexOf(l) + 1;
      v.innerHTML = '<div><span class="eyebrow">' + esc(l.track) + ' · ' + esc(l.level) + '</span><h1>' + esc(l.title) + '</h1><p class="mute small">' + esc(l.tag) + (all.length ? ' · lesson ' + pos + ' of ' + all.length : '') + '</p></div>' +
        '<div class="panel">' + l.body.map(function (p) { var k = p.indexOf(': '); return k > 0 && k < 60 ? '<p class="small"><b>' + esc(p.slice(0, k)) + '.</b> ' + esc(p.slice(k + 2)) + '</p>' : '<p class="small">' + esc(p) + '</p>'; }).join('') + '</div>' +
        '<button class="btn primary" id="qz" style="width:100%">' + (l.qs.length ? 'Quiz me: ' + l.qs.length + ' question' + (l.qs.length > 1 ? 's' : '') : 'Got it — next lesson') + '</button>' +
        '<p class="small mute">Learning only, not advice for real money.</p>';
      $('#qz', v).onclick = function () {
        if (!l.qs.length) { st().cl[lessonKey(l)] = 1; App.save(); App.checkpoint(function () { App.back(); courseNext(start); }); return; }
        App.back(); runQuiz(lessonItems(l), l.title, function () { courseNext(start); });
      };
    });
  }
  function lessonItems(l) {
    var cq = cqState();
    return l.qs.filter(function (q) { return (cq[q.id] || {}).s !== 'ok'; }).map(function (q) { return { q: q, tf: (cq[q.id] || {}).s === 'tf' }; });
  }
  // everything learned in this part: a mixed review of 6 random questions
  function courseReview(start) {
    var qs = []; lessonsOf(start).forEach(function (l) { qs = qs.concat(l.qs); });
    runQuiz(qs.sort(function () { return Math.random() - .5; }).slice(0, 6).map(function (q) { return { q: q, review: true }; }), 'Review', function () { courseNext(start); });
  }
  function runQuiz(items, title, next) {
    App.screen('Course quiz', function (v) {
      var i = 0, right = 0, cq = cqState();
      function ask() {
        if (i >= items.length) {
          App.save();
          v.innerHTML = App.coachHTML('info', right + ' of ' + items.length + ' right on “' + esc(title) + '”.' + (right < items.length ? ' The ones you missed come back later as a second look.' : '')) +
            '<div class="btns"><button class="btn primary" id="more">Next lesson</button><button class="btn" id="dn">Done</button></div>';
          $('#more', v).onclick = function () { App.checkpoint(function () { App.back(); next(); }); };
          $('#dn', v).onclick = function () { App.checkpoint(App.back); };
          return;
        }
        var it = items[i], q = it.q, rec = cq[q.id] || {}, done = false, okK;
        var head = '<span class="eyebrow">' + esc(q.track) + ' · ' + esc(q.lesson) + '</span><p class="small mute" style="margin:2px 0 8px">' + esc(q.tag || '') + (it.tf ? ' · Second look' : it.review ? ' · Review' : '') + '</p>';
        if (it.tf) {
          var wrongs = q.c.map(function (_, k) { return k; }).filter(function (k) { return k !== q.ok; }), showRight = Math.random() < 0.5;
          var shown = showRight ? q.ok : wrongs[Math.floor(Math.random() * wrongs.length)];
          v.innerHTML = head + '<p><b>True or false?</b> ' + esc(q.q) + '</p><p class="panel" style="padding:10px 12px;margin:0 0 10px">Answer: <b>' + esc(q.c[shown]) + '</b></p><div class="list"><button class="btn opt" data-k="1">True</button><button class="btn opt" data-k="0">False</button>' + App.idkBtn('k') + '</div><div id="fb"></div>';
          okK = showRight ? 1 : 0;
        } else {
          var opts = q.c.map(function (_, k) { return k; }).sort(function () { return Math.random() - .5; });
          v.innerHTML = head + '<p><b>' + (i + 1) + '/' + items.length + '.</b> ' + esc(q.q) + '</p><div class="list">' + opts.map(function (k) { return '<button class="btn opt" data-k="' + k + '">' + esc(q.c[k]) + '</button>'; }).join('') + App.idkBtn('k') + '</div><div id="fb"></div>';
          okK = q.ok;
        }
        $$('[data-k]', v).forEach(function (b) {
          b.onclick = function () {
            if (done) return; done = true;
            var k = +b.dataset.k, ok = k === okK;
            $$('[data-k]', v).forEach(function (x) { if (+x.dataset.k === okK) x.classList.add('right'); else if (x === b) x.classList.add('wrong'); });
            if (ok) right++;
            rec.n = (rec.n || 0) + 1;
            rec.s = it.review ? (ok ? 'ok' : 'tf') : ok ? (it.tf ? 'mc2' : 'ok') : 'tf';
            cq[q.id] = rec;
            var why = !ok && !it.tf && k >= 0 && q.cw[k] ? q.cw[k] + ' ' : '';
            $('#fb', v).innerHTML = App.coachHTML(ok ? 'right' : 'wrong', esc(why + (it.tf && !ok ? 'Right answer: ' + q.c[q.ok] + '. ' : '') + q.why)) + '<button class="btn primary" id="nx" style="width:100%">Next</button>';
            App.save();
            $('#nx', v).onclick = function () { i++; ask(); };
          };
        });
      }
      if (!items.length) { next(); return; }
      ask();
    });
  }
  // second looks are due across the whole course: serve them before the next new lesson
  function dueSecondLooks() { var cq = cqState(); return ((C && C.quiz) || []).filter(function (q) { var s = (cq[q.id] || {}).s; return s === 'tf' || s === 'mc2'; }); }
  function report() {
    if (!hasCourse()) return [];
    var due = dueSecondLooks(); if (due.length < 2) return [];
    var by = {}; due.forEach(function (q) { by[q.track] = (by[q.track] || 0) + 1; });
    var tr = Object.keys(by).sort(function (a, b) { return by[b] - by[a]; })[0];
    return [{ sev: Math.min(1, due.length / 10) * 0.9, text: due.length + ' ToneBot course questions you missed' + (tr ? ', mostly in <b>' + esc(splitT(tr)[0]) + '</b>' : '') + '.', action: 'Second look', go: function () { runQuiz(due.slice(0, 6).map(function (q) { return { q: q, tf: (cqState()[q.id] || {}).s === 'tf' }; }), 'Second look', function () { courseNext(''); }); } }];
  }
  function courseContinue(start) {
    var due = dueSecondLooks().filter(function (q) { return !start || q.track.indexOf(start) === 0; });
    if (due.length >= 3) runQuiz(due.slice(0, 4).map(function (q) { return { q: q, tf: (cqState()[q.id] || {}).s === 'tf' }; }), 'Second look', function () { courseNext(start); });
    else courseNext(start);
  }
  // the course map: tracks → lessons (tap one to read + quiz it)
  function course() {
    App.screen('ToneBot course', function (v) {
      var tr = courseTracks(), ls = courseLessons(), done = ls.filter(lessonDone).length;
      v.innerHTML = '<div><span class="eyebrow">ToneBot · updated ' + esc((C && C.updated) || '') + '</span><h1>ToneBot course</h1><p class="mute small">Read a lesson, then answer its questions. 📘 general knowledge · 🧪 UNTESTED: how the bot trades, not proven to win · ✅ PROVEN: passed the bot’s tests.</p></div>' +
        (ls.length ? '<button class="btn primary" id="cont" style="width:100%">' + (ls.filter(lessonSeen).length ? 'Continue · ' + ls.filter(lessonSeen).length + ' of ' + ls.length + ' lessons read · ' + done + ' fully learned' : 'Start lesson 1 of ' + ls.length) + '</button>' : '') +
        '<div class="list">' + tr.map(function (t, i) { var nm = splitT(t.t), mine = ls.filter(function (l) { return l.track === nm[0]; }), d = mine.filter(lessonDone).length; return '<button class="item" data-t="' + i + '"><span class="grow"><span class="t">' + esc(nm[0]) + '</span><br><span class="s">' + esc(nm[1]) + ' · ' + (mine.length ? d + ' of ' + mine.length + ' lessons' : t.b.length + ' entries') + '</span></span><span class="end">›</span></button>'; }).join('') + '</div>' +
        '<p class="small mute">Learning only, not advice for real money.</p>';
      if ($('#cont', v)) $('#cont', v).onclick = function () { courseContinue(''); };
      $$('[data-t]', v).forEach(function (b) { b.onclick = function () { track(tr[+b.dataset.t]); }; });
    });
  }
  function track(t) {
    var nm = splitT(t.t), ls = courseLessons().filter(function (l) { return l.track === nm[0]; });
    App.screen(nm[0].split(' — ')[0], function (v) {
      var h = '<div><span class="eyebrow">ToneBot course</span><h1>' + esc(nm[0]) + '</h1><p class="mute small">' + esc(nm[1]) + '</p></div>';
      if (!ls.length) {   // the glossary: plain reading
        h += '<div class="panel">' + t.b.map(function (b) { return '<p class="small" style="overflow-wrap:anywhere">' + esc(b[1]) + '</p>'; }).join('') + '</div>';
      } else {
        var lv = null;
        ls.forEach(function (l) {
          if (l.level !== lv) { if (lv !== null) h += '</div>'; lv = l.level; h += '<h3 style="margin:14px 0 6px">' + esc(lv) + '</h3><div class="list">'; }
          var d = lessonDone(l);
          h += '<button class="item' + (d ? ' done' : '') + '" data-l="' + l.i + '"><span class="grow"><span class="t">' + esc(l.title) + '</span><br><span class="s">' + (l.qs.length ? l.qs.length + ' question' + (l.qs.length > 1 ? 's' : '') : 'reading') + '</span></span><span class="end">' + (d ? '✓' : '›') + '</span></button>';
        });
        h += '</div>';
      }
      v.innerHTML = h;
      $$('[data-l]', v).forEach(function (b) { b.onclick = function () { playLesson(courseLessons()[+b.dataset.l], nm[0]); }; });
    });
  }

  // ---------- DAILY DRILL (Oct 17): 4 questions before 9:25 AM ET, graded against the real day, you vs ToneBot ----------
  // Same rules as the bot's own drill: 25 pts each — your group beats SPY · tape (2 of SPY/DIA/IWM) right ·
  // 10-year right · your idea beats SPY. The answer key and the bot's trades arrive with the sync (tonebot.json: days, bot).
  var GROUPS0 = { 'Tech': 'XLK', 'Chips': 'SMH', 'Homebuilders': 'XHB', 'Small caps': 'IWM', 'Gold': 'GLD', 'Banks': 'KBE', 'Energy': 'XLE', 'Health care': 'XLV', 'Utilities': 'XLU', 'Staples': 'XLP', 'Industrials': 'XLI', 'Consumer': 'XLY' };
  function groups() { return (T && T.groups && Object.keys(T.groups).length >= 4) ? T.groups : GROUPS0; }
  function etNow() {
    var p = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { p[x.type] = x.value; });
    return { day: p.year + '-' + p.month + '-' + p.day, min: (+p.hour % 24) * 60 + (+p.minute) };
  }
  function ymd(d) { return d.getUTCFullYear() + '-' + String(d.getUTCMonth() + 1).padStart(2, '0') + '-' + String(d.getUTCDate()).padStart(2, '0'); }
  function addDays(day, n) { var d = new Date(day + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return ymd(d); }
  function tradingDay(day) { var w = new Date(day + 'T12:00:00Z').getUTCDay(); return w !== 0 && w !== 6 && ((T && T.holidays) || []).indexOf(day) < 0; }
  var CUTOFF = 9 * 60 + 25;
  function drillDay() { var n = etNow(), d = n.day; if (tradingDay(d) && n.min < CUTOFF) return d; do { d = addDays(d, 1); } while (!tradingDay(d)); return d; }
  function windowOpen() { var n = etNow(); return tradingDay(n.day) && n.min < CUTOFF; }
  function nice(day) { return new Date(day + 'T12:00:00Z').toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC' }); }
  function ds() { var s = st(); s.drill = s.drill || {}; return s.drill; }
  function botCall(day) { return ((T && T.calls) || []).find(function (c) { return c.date === day; }) || null; }

  function gradeDay(day) {
    var a = ds()[day], k = T && T.days && T.days[day], g = groups();
    if (!a || !k || k.SPY == null || k.TNX == null) return null;
    var tape = ['SPY', 'DIA', 'IWM'].filter(function (t) { return k[t] != null; });
    if (tape.length < 3 || k[g[a.group]] == null) return null;
    var spy = k.SPY, green = tape.filter(function (t) { return k[t] >= 0; }).length >= 2;
    var sect = {}; Object.keys(g).forEach(function (n) { if (k[g[n]] != null) sect[n] = k[g[n]]; });
    var names = Object.keys(sect).sort(function (x, y) { return sect[y] - sect[x]; });
    var r = { day: day, a: a, spy: spy, sect: sect, leader: names[0], lagger: names[names.length - 1], green: green, tnx: k.TNX,
      gChg: sect[a.group], gBeat: sect[a.group] > spy, tapeHit: green === (a.tape === 'green'), tnxHit: k.TNX !== 0 && (k.TNX > 0) === (a.tnx === 'up'),
      iChg: k[a.idea] == null ? null : k[a.idea] };
    r.iBeat = r.iChg == null ? null : r.iChg > spy;
    r.score = 25 * [r.gBeat, r.tapeHit, r.tnxHit, r.iBeat].filter(Boolean).length;
    var c = botCall(day);
    if (c && sect[c.lead] != null) { r.bot = c; r.bChg = sect[c.lead]; r.bBeat = sect[c.lead] > spy; }
    r.did = (T.bot || {})[day] || null;
    return r;
  }
  function graded() { return Object.keys(ds()).sort().map(gradeDay).filter(Boolean); }
  function record(rows) {
    var n = rows.length, me = n ? rows.reduce(function (s, r) { return s + r.score; }, 0) / n : 0;
    var both = rows.filter(function (r) { return r.bot; });
    return { n: n, avg: Math.round(me), both: both.length, myG: both.filter(function (r) { return r.gBeat; }).length, botG: both.filter(function (r) { return r.bBeat; }).length,
      myLed: rows.filter(function (r) { return r.a.group === r.leader; }).length, botLed: both.filter(function (r) { return r.bot.lead === r.leader; }).length };
  }
  function recLine(rec) {
    if (!rec.n) return 'No graded days yet. Your first score shows after the day’s close and the next sync.';
    return '<b>You: ' + rec.avg + '/100 avg over ' + rec.n + ' day' + (rec.n > 1 ? 's' : '') + '</b>' + (rec.both ? ' · group beat SPY: you ' + rec.myG + '/' + rec.both + ' vs ToneBot ' + rec.botG + '/' + rec.both + ' · named the leader: you ' + rec.myLed + ' vs bot ' + rec.botLed : '');
  }
  // one short lesson tied to what went wrong (or the next unread one when everything went right)
  function lessonFor(r) {
    var want = !r.iBeat && r.iChg != null ? (r.a.mode === 'dip' ? 'breakout' : 'skew') : !r.gBeat ? 'why' : !r.tapeHit ? 'breaker' : !r.tnxHit ? 'unseen' : null;
    var s = st(), i = want ? L.findIndex(function (l) { return l.id === want; }) : -1;
    if (i < 0) i = L.findIndex(function (l) { return !s.done[l.id]; });
    if (i < 0) i = L.length ? 0 : -1;
    var why = want === 'breakout' ? 'Your dip idea lagged SPY. ToneBot’s one proven edge buys strength, not dips.' : want === 'skew' ? 'Your strength idea lagged SPY. A single loser is normal; see where the money really comes from.' :
      want === 'why' ? 'Your group lagged SPY. Back to how the strategy picks leaders.' : want === 'breaker' ? 'You missed the tape. See how the bot protects itself on red days.' : want === 'unseen' ? 'You missed the 10-year. One day is noise: judge rules on many days.' : 'Clean sweep. Keep going with your next lesson.';
    return i < 0 ? null : { i: i, why: why };
  }
  function yn(x) { return x == null ? '<span class="mute">—</span>' : x ? '✅' : '❌'; }
  function line(ok, label, detail) {
    return '<div style="display:flex;gap:10px;align-items:flex-start;padding:9px 0;border-top:1px solid var(--line)"><span style="width:20px;flex:none">' + yn(ok) + '</span><div class="grow" style="min-width:0"><b class="small">' + label + '</b><div class="small mute" style="overflow-wrap:anywhere">' + detail + '</div></div><span class="mono small" style="flex:none">' + (ok ? '+25' : '0') + '</span></div>';
  }
  function scorecard(r, rec) {
    var b = r.bot, did = r.did, bb = did && did.buys && did.buys.length ? did.buys : [];
    var kd = T.days[r.day] || {}, bbTxt = bb.map(function (t) { return esc(t) + (kd[t] != null ? ' ' + pct(kd[t]) : ''); }).join(', ');
    var closer = b ? (r.gChg === r.bChg ? 'Same group as the bot.' : r.gChg > r.bChg ? 'Your group call was closer than ToneBot’s.' : 'ToneBot’s group call was closer than yours.') : 'No bot morning call logged that day.';
    var t = '<div class="panel"><div class="row"><span class="eyebrow grow">Scorecard · ' + nice(r.day) + '</span><span class="pill ' + (r.score >= 75 ? 'good' : r.score >= 50 ? 'ok' : 'warn') + '">' + r.score + '/100</span></div>' +
      line(r.gBeat, 'Leading group', 'You <b>' + esc(r.a.group) + ' ' + pct(r.gChg) + '</b> · Bot ' + (b ? esc(b.lead) + ' ' + pct(r.bChg) + ' ' + yn(r.bBeat) : '—') + ' · Led: ' + esc(r.leader) + ' ' + pct(r.sect[r.leader]) + ' · SPY ' + pct(r.spy)) +
      line(r.tapeHit, 'Red or green', 'You <b>' + esc(r.a.tape) + '</b> · Real ' + (r.green ? 'green' : 'red')) +
      line(r.tnxHit, '10-year yield', 'You <b>' + esc(r.a.tnx) + '</b> · Real ' + (r.tnx > 0 ? 'up' : 'down') + ' ' + pct(r.tnx)) +
      line(r.iBeat, 'Buy idea', 'You <b>' + esc(r.a.idea) + '</b> (' + esc(r.a.mode) + ') ' + (r.iChg == null ? '<span class="mute">price pending</span>' : pct(r.iChg)) + ' vs SPY ' + pct(r.spy) + ' · Bot bought ' + (bbTxt || 'nothing')) +
      (b ? '<p class="small mute" style="margin-top:6px">ToneBot only makes the group call: ' + (r.bBeat ? 25 : 0) + ' of 25 on it.</p>' : '') +
      '<p class="small"><b>What the bot did:</b> ' + (did ? 'bought ' + (bb.length ? bb.map(esc).join(', ') : 'nothing') + (did.sells && did.sells.length ? ', sold ' + did.sells.map(esc).join(', ') : '') +
        (did.p1Today != null ? ' · Paper 1 ' + pct(did.p1Today) + ' vs S&amp;P ' + pct(r.spy) + ' (since Oct 12 ' + pct(did.p1Since) + ')' : '') + (did.pos ? ' · ' + did.pos.length + ' open positions' : '') : 'no trades synced for that day') + '. ' + closer + '</p>' +
      '<p class="small mute">' + recLine(rec) + '</p></div>';
    return t;
  }

  function drill() {
    App.screen('Daily drill', function (v) {
      var day = drillDay(), a = ds()[day], g = groups(), names = Object.keys(g);
      refresh(function (ch) { if (ch && document.querySelector('.tb-drill')) { App.back(); drill(); } });
      var rows = graded(), rec = record(rows), last = rows[rows.length - 1];
      var top = '<div class="tb-drill"><span class="eyebrow">Drill for ' + nice(day) + ' · lock by 9:25 AM ET</span><h1>Daily drill</h1></div>';
      var tail = '';
      if (last) {
        var ls = lessonFor(last);
        tail = scorecard(last, rec) + (ls ? '<div class="coach ok"><div class="h"><span class="pill ok">2-minute lesson</span></div><p>' + esc(ls.why) + '</p><button class="btn sm" id="dl">' + esc(L[ls.i].t) + ' · ' + TAGS[L[ls.i].tag][1] + ' ›</button></div>' : '') +
          (rows.length > 1 ? '<h3>Past days</h3><div class="list">' + rows.slice(0, -1).reverse().slice(0, 10).map(function (r) { return '<div class="row small"><span class="mono" style="width:86px">' + r.day.slice(5) + '</span><span class="grow">' + esc(r.a.group) + ' · ' + esc(r.a.tape) + ' · 10y ' + esc(r.a.tnx) + ' · ' + esc(r.a.idea) + '</span><b>' + r.score + '</b></div>'; }).join('') + '</div>' : '');
      } else tail = '<p class="small mute">' + recLine(rec) + '</p>';
      tail += '<p class="small mute">Learning only, not advice for real money. ToneBot’s call is hidden until you lock all 4 answers.</p>';
      function wire() { var b = $('#dl', v); if (b) b.onclick = function () { lesson(lessonFor(last).i); }; }
      if (a) {
        var c = botCall(day);
        v.innerHTML = top + '<div class="panel"><span class="eyebrow">Locked ' + new Date(a.at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) + '</span><p><b>' + esc(a.group) + '</b> leads · tape <b>' + esc(a.tape) + '</b> · 10-yr <b>' + esc(a.tnx) + '</b> · idea <b>' + esc(a.idea) + '</b> (' + esc(a.mode) + ')</p>' +
          '<p class="small">' + (c ? '☀️ <b>ToneBot’s call:</b> ' + esc(c.lead) + ' leads, ' + esc(c.lag) + ' lags' + (c.conf ? ' @ ' + Math.round(c.conf * 100) + '%' : '') : 'ToneBot’s morning call shows here once it syncs (around 9:40 AM ET).') + '</p>' +
          '<p class="small mute">Graded after the close, once the evening sync lands.</p></div>' + tail;
        wire(); return;
      }
      var pick = {}, step = 0;
      function ask() {
        var q;
        if (step === 0) q = '<h3>1 of 4 · Which group leads today (beats SPY the most)?</h3><div class="btns">' + names.map(function (n) { return '<button class="btn sm" data-v="' + esc(n) + '">' + esc(n) + ' <span class="mute">' + esc(g[n]) + '</span></button>'; }).join('') + '</div>';
        else if (step === 1) q = '<h3>2 of 4 · Tape: red or green?</h3><p class="small mute">Green = at least 2 of SPY, DIA, IWM close up.</p><div class="btns"><button class="btn" data-v="green">🟢 Green</button><button class="btn" data-v="red">🔴 Red</button></div>';
        else if (step === 2) q = '<h3>3 of 4 · 10-year yield: up or down?</h3><div class="btns"><button class="btn" data-v="up">⬆️ Up</button><button class="btn" data-v="down">⬇️ Down</button></div>';
        else q = '<h3>4 of 4 · One buy idea</h3><p class="small mute">A ticker that will beat SPY today, and why: strength (breakout) or dip.</p>' +
          '<input id="tk" placeholder="Ticker, e.g. XLE" maxlength="6" autocapitalize="characters" autocorrect="off" spellcheck="false" style="width:100%;box-sizing:border-box;background:var(--panel2);color:var(--fg);border:1px solid var(--line);border-radius:10px;padding:10px;font:15px var(--mono, monospace);text-transform:uppercase">' +
          '<div class="btns"><button class="btn" data-v="strength">💪 Strength</button><button class="btn" data-v="dip">🎯 Dip</button></div><p class="small" id="msg"></p>';
        v.innerHTML = top + '<div class="panel">' + q + (step ? '<button class="btn sm ghost" id="bk">‹ Back</button>' : '') + '</div>' + tail;
        wire();
        if ($('#bk', v)) $('#bk', v).onclick = function () { step--; ask(); };
        $$('[data-v]', v).forEach(function (b) {
          b.onclick = function () {
            var val = b.dataset.v;
            if (step === 0) pick.group = val; else if (step === 1) pick.tape = val; else if (step === 2) pick.tnx = val;
            else {
              var tk = ($('#tk', v).value || '').trim().toUpperCase().replace(/^\$/, '');
              if (!/^[A-Z][A-Z.\-]{0,5}$/.test(tk)) { $('#msg', v).textContent = 'Type a ticker first (letters only, like XLE or NVDA).'; return; }
              if (drillDay() !== day) { $('#msg', v).textContent = 'The 9:25 AM cutoff just passed. This drill is closed; the next one is open.'; setTimeout(function () { App.back(); drill(); }, 1500); return; }
              pick.idea = tk; pick.mode = val; pick.at = Date.now(); ds()[day] = pick; App.save(); App.celebrate && App.celebrate('level');
              App.back(); drill(); return;
            }
            step++; ask();
          };
        });
      }
      ask();
    });
  }
  // the in-app reminder: once per trading morning, when the app opens before 9:25 AM ET and today's drill is still blank
  function prompt() {
    try {
      if (!App.S || !windowOpen() || document.querySelector('.tb-drill')) return;
      var day = drillDay(), s = st(); if (ds()[day] || s.asked === day) return;
      s.asked = day; App.save();
      var m = App.modal('<div class="grab"></div><span class="eyebrow">ToneBot daily drill · ' + esc(nice(day)) + '</span><h2>Beat the bot before the open</h2><p class="mute">Four quick calls: which group leads, red or green, the 10-year, and one buy idea. Lock them by 9:25 AM ET, then see ToneBot’s call.</p><div class="btns"><button class="btn" id="dno">Later</button><button class="btn primary" id="dgo">Start the drill</button></div>');
      $('#dgo', m).onclick = function () { App.closeModal(); drill(); };
      $('#dno', m).onclick = App.closeModal;
    } catch (e) {}
  }
  setTimeout(prompt, 3500);
  document.addEventListener('visibilitychange', function () { if (!document.hidden) setTimeout(prompt, 800); });
  function recShort() { var r = record(graded()); return r.n ? r.avg + '/100 avg over ' + r.n + ' days' : 'no graded days yet'; }
  function drillStatus() { var day = drillDay(); return ds()[day] ? 'Drill locked for ' + nice(day) : (windowOpen() ? 'Drill open until 9:25 AM ET' : 'Next drill: ' + nice(day)); }

  return { report: report, home: home, course: course, courseContinue: courseContinue, courseProgress: courseProgress, hasQuiz: hasCourse, lessonsDone: function () { return L.length ? L.filter(function (l) { return st().done[l.id]; }).length / L.length : null; }, nextLesson: function () { var i = L.findIndex(function (l) { return !st().done[l.id]; }); if (i >= 0) lesson(i); }, lesson: lesson, replay: replay, myCall: drill, drill: drill, drillStatus: drillStatus, refresh: refresh, count: function () { return L.length; }, done: function () { return L.filter(function (l) { return st().done[l.id]; }).length; } };
})();
