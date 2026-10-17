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
        '<div class="btns"><button class="btn primary" id="rr">Rotation Replay: you vs the bot</button><button class="btn" id="mc">Make tomorrow’s call</button></div>' +
        '<h2>Lessons</h2><div class="list">' + L.map(function (l, i) { var tg = TAGS[l.tag]; return '<button class="item" data-l="' + i + '"><span class="grow"><span class="t">' + esc(l.t) + '</span><br><span class="s">' + tg[1] + '</span></span><span class="end">' + (s.done[l.id] ? '✓' : '›') + '</span></button>'; }).join('') + '</div>' +
        '<p class="small mute">Learning only. Nothing here changes what ToneBot trades. Market questions are for learning, not investment advice.</p>';
      $$('[data-l]', v).forEach(function (b) { b.onclick = function () { lesson(+b.dataset.l); }; });
      $('#rr', v).onclick = replay; $('#mc', v).onclick = myCall;
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

  // ---------- make tomorrow's call, scored against what really led when ToneBot's next sync arrives ----------
  function nextSession() { var d = new Date(); do { d = new Date(d.getTime() + 864e5); } while (d.getDay() === 0 || d.getDay() === 6); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  function myCall() {
    App.screen('Make the call', function (v) {
      var s = st(), day = nextSession(), names = THEMES.map(function (t) { return t[0]; }), pick = s.my[day] || {};
      v.innerHTML = '<div><span class="eyebrow">For ' + day + '</span><h1>Which theme leads?</h1><p class="mute small">ToneBot makes the same call every morning. Yours gets scored against what actually led once the bot’s results sync. Think: what led recently, what is the 10-year yield doing, what news is coming?</p></div>' +
        '<h3>Leads</h3><div class="btns" id="ld">' + names.map(function (n) { return '<button class="btn sm' + (pick.lead === n ? ' primary' : '') + '" data-n="' + n + '">' + n + '</button>'; }).join('') + '</div>' +
        '<h3>Lags</h3><div class="btns" id="lg">' + names.map(function (n) { return '<button class="btn sm' + (pick.lag === n ? ' primary' : '') + '" data-n="' + n + '">' + n + '</button>'; }).join('') + '</div>' +
        '<button class="btn primary" id="sv" style="width:100%">Lock my call</button><p class="small" id="msg"></p>';
      $$('#ld [data-n]', v).forEach(function (b) { b.onclick = function () { pick.lead = b.dataset.n; $$('#ld [data-n]', v).forEach(function (x) { x.classList.toggle('primary', x === b); }); }; });
      $$('#lg [data-n]', v).forEach(function (b) { b.onclick = function () { pick.lag = b.dataset.n; $$('#lg [data-n]', v).forEach(function (x) { x.classList.toggle('primary', x === b); }); }; });
      $('#sv', v).onclick = function () {
        if (!pick.lead || !pick.lag || pick.lead === pick.lag) { $('#msg', v).textContent = 'Pick one leader and a different laggard.'; return; }
        s.my[day] = { lead: pick.lead, lag: pick.lag, at: Date.now() }; App.save();
        $('#msg', v).textContent = 'Locked for ' + day + '. It gets scored next to ToneBot’s call after that day’s close.';
      };
    });
  }
  return { home: home, lesson: lesson, replay: replay, myCall: myCall, refresh: refresh, count: function () { return L.length; }, done: function () { return L.filter(function (l) { return st().done[l.id]; }).length; } };
})();
