// ===================== TONEBOT SCHOOL: learn the bot you built =====================
// Engine only: the lessons and the bot's nightly facts load privately (see refresh below).
var TB = (function () {
  var $ = App.$, $$ = App.$$, esc = App.esc;
  var TAGS = { proven: ['good', '✅ Proven'], half: ['warn', '🟡 Half-proven'], no: ['bad', '❌ Not proven'], rule: ['ok', '📘 Your rule'] };
  // Lessons and live bot facts are PRIVATE: they load from Alain's private repo (edgelab-data) with the
  // phone's own GitHub key, and are cached on the phone for offline. Nothing ToneBot-specific is in this public file.
  var L = [], T = null, CK = 'edgelab.tb.cache';
  try { var c0 = JSON.parse(localStorage.getItem(CK) || 'null'); if (c0) { L = c0.lessons || []; T = c0.data || null; } } catch (e) {}
  var lastFetch = 0;
  function refresh(done) {
    // at most once every 10 minutes, and only report "changed" when the content really differs (no re-render loops)
    if (!App.ghGetJSON || !App.ghConnected() || Date.now() - lastFetch < 600000) { if (done) done(false); return; }
    lastFetch = Date.now();
    Promise.all([App.ghGetJSON('tonebot-lessons.json'), App.ghGetJSON('tonebot.json')]).then(function (r) {
      var changed = false;
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
        '<h2>Lessons</h2><div class="list">' + L.map(function (l, i) { var tg = TAGS[l.tag]; return '<button class="item" data-l="' + i + '"><span class="grow"><span class="t">' + esc(l.t) + '</span><br><span class="s">' + tg[1] + '</span></span><span class="end">' + (s.done[l.id] ? '✓' : '›') + '</span></button>'; }).join('') + '</div>' +
        '<p class="small mute">Learning only. Nothing here changes what ToneBot trades. Market questions are for learning, not investment advice.</p>';
      $$('[data-l]', v).forEach(function (b) { b.onclick = function () { lesson(+b.dataset.l); }; });
      $('#rr', v).onclick = replay; $('#mc', v).onclick = drill;
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
      '<p class="small"><b>Daily call:</b> ToneBot named the leading theme right on <b>' + hit + ' of ' + c.length + '</b> scored days.' + (mine.length ? ' You: <b>' + myHits + ' of ' + mine.length + '</b> on the same days (bot ' + botHitsSame + ').' : ' Make your own call to compete.') + '</p>' +
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
  function scorecard(r, rec) {
    var b = r.bot, did = r.did, bb = did && did.buys && did.buys.length ? did.buys : [];
    var kd = T.days[r.day] || {}, bbTxt = bb.map(function (t) { return esc(t) + (kd[t] != null ? ' ' + pct(kd[t]) : ''); }).join(', ');
    var closer = b ? (r.gChg === r.bChg ? 'Same group as the bot.' : r.gChg > r.bChg ? 'Your group call was closer than ToneBot’s.' : 'ToneBot’s group call was closer than yours.') : 'No bot morning call logged that day.';
    var t = '<div class="panel"><div class="row"><span class="eyebrow grow">Scorecard · ' + nice(r.day) + '</span><span class="pill ' + (r.score >= 75 ? 'good' : r.score >= 50 ? 'ok' : 'warn') + '">' + r.score + '/100</span></div>' +
      '<div style="overflow-x:auto"><table class="small" style="width:100%;border-collapse:collapse"><tr class="mute"><td></td><td>You</td><td>ToneBot</td><td>Real</td></tr>' +
      '<tr><td>Leading group</td><td>' + esc(r.a.group) + ' ' + pct(r.gChg) + ' ' + yn(r.gBeat) + '</td><td>' + (b ? esc(b.lead) + ' ' + pct(r.bChg) + ' ' + yn(r.bBeat) : '—') + '</td><td>' + esc(r.leader) + ' ' + pct(r.sect[r.leader]) + '</td></tr>' +
      '<tr><td>Red / green</td><td>' + esc(r.a.tape) + ' ' + yn(r.tapeHit) + '</td><td class="mute">—</td><td>' + (r.green ? 'green' : 'red') + '</td></tr>' +
      '<tr><td>10-yr yield</td><td>' + esc(r.a.tnx) + ' ' + yn(r.tnxHit) + '</td><td class="mute">—</td><td>' + (r.tnx > 0 ? 'up' : 'down') + ' ' + pct(r.tnx) + '</td></tr>' +
      '<tr><td>Buy idea</td><td>' + esc(r.a.idea) + ' (' + esc(r.a.mode) + ') ' + (r.iChg == null ? '<span class="mute">price pending</span>' : pct(r.iChg) + ' ' + yn(r.iBeat)) + '</td><td>' + (bbTxt || 'no buys') + '</td><td>SPY ' + pct(r.spy) + '</td></tr>' +
      '<tr><td><b>Points</b></td><td><b>' + r.score + '</b></td><td>' + (b ? (r.bBeat ? 25 : 0) + ' <span class="mute">(group only)</span>' : '—') + '</td><td></td></tr></table></div>' +
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
      var m = App.modal('<span class="eyebrow">ToneBot daily drill</span><h2>4 quick questions</h2><p class="small">Which group leads, red or green, the 10-year, and one buy idea. Lock them by <b>9:25 AM ET</b>, then see ToneBot’s call.</p><div class="btns"><button class="btn primary" id="dgo">Answer now</button><button class="btn" id="dno">Later</button></div>');
      $('#dgo', m).onclick = function () { App.closeModal(); drill(); };
      $('#dno', m).onclick = App.closeModal;
    } catch (e) {}
  }
  setTimeout(prompt, 3500);
  document.addEventListener('visibilitychange', function () { if (!document.hidden) setTimeout(prompt, 800); });
  function recShort() { var r = record(graded()); return r.n ? r.avg + '/100 avg over ' + r.n + ' days' : 'no graded days yet'; }
  function drillStatus() { var day = drillDay(); return ds()[day] ? 'Drill locked for ' + nice(day) : (windowOpen() ? 'Drill open until 9:25 AM ET' : 'Next drill: ' + nice(day)); }

  return { home: home, lesson: lesson, replay: replay, myCall: drill, drill: drill, drillStatus: drillStatus, refresh: refresh, count: function () { return L.length; }, done: function () { return L.filter(function (l) { return st().done[l.id]; }).length; } };
})();
