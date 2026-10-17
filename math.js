// ===================== QUICK MATH: fast mental math for stocks and everyday sharpness =====================
// Every question is generated, so it never runs out. About 4 in 10 are timed ("Beat the clock", a visible countdown;
// time out = a miss with the shortcut shown); the rest have no clock at all, so you can think. Wrong choices are the mistakes people actually make
// (e.g. "down 20% then up 20% is break-even"). Level rises when you're accurate AND quick; falls when you miss a lot.
var MM = (function () {
  var $ = App.$, $$ = App.$$, esc = App.esc;
  var ROUND = 10, MAXLV = 5;
  var TARGET = [0, 15, 13, 12, 10, 9];   // seconds on the clock for timed questions, by level
  var TIMED_SHARE = 0.4;
  function st() { var s = App.S; if (!s.math) s.math = { lv: 1, rounds: 0, n: 0, ok: 0, best: 0, fast: 0 }; return s.math; }
  function R(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  function r1(x) { return Math.round(x * 10) / 10; }
  function r4(x) { return Math.round(x * 10000) / 10000; }
  function pc(x) { x = r1(x); return (x > 0 ? '+' : '') + x + '%'; }
  function num(x) { return Math.round(x * 100) / 100 + ''; }
  function money(x) { var v = Math.round(x * 100) / 100; return '$' + v.toLocaleString('en-US', v % 1 ? { minimumFractionDigits: 2, maximumFractionDigits: 2 } : {}); }
  // build 4 unique choices: the answer plus distractors (common mistakes first, then near misses)
  function choices(ans, wrongs, fmt, near) {
    var seen = {}, out = [{ v: ans, ok: true }]; seen[fmt(ans)] = 1;
    wrongs.concat(near || []).forEach(function (w) { if (out.length < 4 && isFinite(w) && !seen[fmt(w)]) { seen[fmt(w)] = 1; out.push({ v: w, ok: false }); } });
    var k = 1; while (out.length < 4 && k < 40) { var w = ans + (k % 2 ? 1 : -1) * Math.ceil(k / 2) * (Math.abs(ans) >= 20 ? Math.max(1, Math.round(Math.abs(ans) * 0.05)) : 1); if (!seen[fmt(w)]) { seen[fmt(w)] = 1; out.push({ v: w, ok: false }); } k++; }
    for (var i = out.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = out[i]; out[i] = out[j]; out[j] = t; }
    return out.map(function (o) { return { t: fmt(o.v), ok: o.ok }; });
  }

  // ---- stock math ----
  var STOCK = {
    change: function (lv) { // % change from a to b
      var a = pick(lv < 3 ? [20, 40, 50, 80, 100, 200] : [25, 40, 60, 75, 120, 150, 250]), pcts = lv < 3 ? [10, 20, 25, 50] : [5, 12, 15, 20, 30, 40, 60];
      var p = pick(pcts) * (Math.random() < 0.65 ? 1 : -1), b = a * (1 + p / 100);
      if (Math.abs(b - Math.round(b * 100) / 100) > 1e-9) { b = Math.round(b); p = (b - a) / a * 100; }
      return { q: 'A stock goes from ' + money(a) + ' to ' + money(b) + '. What’s the % change?', o: choices(p, [(b - a) / b * 100, (b - a), -p], pc), tip: 'Change ÷ starting price: (' + money(b) + ' − ' + money(a) + ') ÷ ' + money(a) + ' = ' + pc(p) + '. Always divide by where you started, not where you ended.' };
    },
    updown: function (lv) { // down x% then up x%
      var x = pick(lv < 3 ? [10, 20, 50] : [10, 20, 25, 30, 40, 50]), down = Math.random() < 0.6;
      var net = ((1 + (down ? -x : x) / 100) * (1 + (down ? x : -x) / 100) - 1) * 100;
      return { q: 'A stock ' + (down ? 'falls ' + x + '%, then rises ' + x + '%' : 'rises ' + x + '%, then falls ' + x + '%') + '. Where is it vs. the start?', o: choices(net, [0, x / 10, -2 * x / 10, x * x / 100], pc), tip: (down ? (1 - x / 100) + ' × ' + (1 + x / 100) : (1 + x / 100) + ' × ' + (1 - x / 100)) + ' = ' + r4(1 + net / 100) + ', so ' + pc(net) + '. Same % up and down always leaves you lower: you lose x² ÷ 100 percent.' };
    },
    recover: function (lv) { // gain needed after a loss
      var L = pick(lv < 3 ? [10, 20, 25, 50] : [10, 20, 25, 33.3, 40, 50, 60, 75]), g = L / (100 - L) * 100;
      if (L === 33.3) g = 50;
      return { q: 'You’re down ' + L + '% on a position. What gain gets you back to even?', o: choices(g, [L, L * 1.5, L / 2 + L], function (v) { return '+' + r1(v) + '%'; }), tip: 'Loss ÷ what’s left: ' + L + ' ÷ ' + r1(100 - L) + ' = +' + r1(g) + '%. Losses hurt more than gains help, which is why cutting them early matters.' };
    },
    rule72: function (lv) {
      var r = pick([4, 6, 8, 9, 12, 18, 24]), y = 72 / r;
      return { q: 'Money growing ' + r + '% a year doubles in about how many years?', o: choices(y, [100 / r, 72 / r * 2, r], function (v) { return r1(v) + ' yrs'; }), tip: 'Rule of 72: 72 ÷ ' + r + ' ≈ ' + r1(y) + ' years. Quick way to size any growth rate.' };
    },
    stop: function (lv) { // % risk to a stop
      var e = pick([20, 40, 50, 80, 100, 120, 150, 200]), d = pick(lv < 3 ? [5, 8, 10] : [4, 6, 7, 8, 12, 15]), s = Math.round(e * (1 - d / 100) * 100) / 100;
      return { q: 'Buy at ' + money(e) + ', stop at ' + money(s) + '. How much % do you risk?', o: choices(d, [(e - s), (e - s) / s * 100, d * 2], function (v) { return r1(v) + '%'; }), tip: '(' + money(e) + ' − ' + money(s) + ') ÷ ' + money(e) + ' = ' + r1(d) + '%. Know this number before you click buy.' };
    },
    rr: function (lv) { // reward-to-risk multiple
      var e = pick([20, 40, 50, 100]), risk = pick([1, 2, 2.5, 5]) * (e / 50 > 1 ? 2 : 1), m = pick([1.5, 2, 3, 4]), s = e - risk, t = e + risk * m;
      return { q: 'Entry ' + money(e) + ', stop ' + money(s) + ', target ' + money(t) + '. Reward-to-risk?', o: choices(m, [m + 1, 1 / m, (t - s) / risk], function (v) { return r1(v) + ' : 1'; }), tip: 'Reward ' + money(t - e) + ' ÷ risk ' + money(risk) + ' = ' + r1(m) + ' : 1. Above 2 : 1 you can be wrong more than half the time and still come out ahead.' };
    },
    size: function (lv) { // shares from a fixed risk
      var pair = pick([[100, 2], [100, 4], [100, 5], [200, 4], [200, 2.5], [250, 5], [250, 2.5], [500, 4], [500, 2.5], [300, 1.5]]), risk = pair[0], per = pair[1], sh = risk / per;
      return { q: 'You’ll risk ' + money(risk) + ' on a trade, and your stop is ' + money(per) + ' below entry. How many shares?', o: choices(sh, [risk * per, sh * 2, sh / 2], function (v) { return Math.round(v) + ' sh'; }), tip: 'Risk ÷ risk per share: ' + money(risk) + ' ÷ ' + money(per) + ' = ' + Math.round(sh) + ' shares. Size comes from the stop, not from how much you like the stock.' };
    },
    twice: function (lv) { // up x% two years running
      var x = pick([10, 20, 25, 50]), tot = (Math.pow(1 + x / 100, 2) - 1) * 100;
      return { q: 'Up ' + x + '% this year and ' + x + '% next year. Total gain?', o: choices(tot, [2 * x, x * x / 100 + x, 2 * x - x / 10], function (v) { return '+' + r1(v) + '%'; }), tip: (1 + x / 100) + ' × ' + (1 + x / 100) + ' = ' + r4(1 + tot / 100) + ', so +' + r1(tot) + '%. Gains compound: the second ' + x + '% is on a bigger base.' };
    },
    pe: function (lv) {
      var eps = pick([2, 4, 5, 8, 10]), pe = pick([10, 12, 15, 20, 25, 30]), p = eps * pe;
      return { q: 'Price ' + money(p) + ', earnings ' + money(eps) + ' a share. P/E?', o: choices(pe, [eps / p * 100, pe * 2, pe + eps], function (v) { return r1(v) + 'x'; }), tip: money(p) + ' ÷ ' + money(eps) + ' = ' + pe + 'x: you pay ' + pe + ' years of today’s earnings for the stock.' };
    },
    pctof: function (lv) {
      var p = pick(lv < 3 ? [10, 20, 25, 50] : [5, 15, 30, 35, 45, 60, 75]), n = pick(lv < 3 ? [40, 60, 80, 120, 200] : [140, 240, 360, 480, 640]), a = p * n / 100;
      return { q: p + '% of ' + money(n) + '?', o: choices(a, [n / p, a * 10, n - a], money), tip: 'Find 10% (' + money(n / 10) + '), then scale: ' + p + '% = ' + money(a) + '.' };
    }
  };
  // ---- general mental math ----
  var GEN = {
    mul: function (lv) {
      var a = lv < 2 ? R(12, 29) : lv < 4 ? R(13, 49) : R(23, 89), b = lv < 3 ? R(3, 9) : R(11, 19), p = a * b;
      return { q: a + ' × ' + b + ' = ?', o: choices(p, [p + 10, p - 10, p + b], num, [p + 1, p - 1]), tip: 'Split it: ' + a + ' × ' + b + ' = ' + (Math.floor(a / 10) * 10) + ' × ' + b + ' + ' + (a % 10) + ' × ' + b + ' = ' + (Math.floor(a / 10) * 10 * b) + ' + ' + ((a % 10) * b) + ' = ' + p + '.' };
    },
    sq: function (lv) {
      var a = lv < 3 ? pick([15, 25, 35, 45, 55, 65]) : R(21, 79), p = a * a;
      return { q: a + '² = ?', o: choices(p, [p + 10, p - 10, a * 2 * 10], num, [p + 100, p - 100]), tip: (a % 10 === 5 ? 'Ends in 5: ' + Math.floor(a / 10) + ' × ' + (Math.floor(a / 10) + 1) + ' = ' + Math.floor(a / 10) * (Math.floor(a / 10) + 1) + ', then add 25 → ' + p + '.' : 'Round to ' + Math.round(a / 10) * 10 + ': ' + a + '² = (' + Math.round(a / 10) * 10 + ' ' + (a < Math.round(a / 10) * 10 ? '−' : '+') + ' ' + Math.abs(a - Math.round(a / 10) * 10) + ')² = ' + p + '.') };
    },
    add: function (lv) {
      var a = lv < 3 ? R(120, 480) : R(1200, 4800), b = lv < 3 ? R(110, 390) : R(1100, 3900), minus = Math.random() < 0.5, x = minus ? Math.max(a, b) - Math.min(a, b) : a + b;
      return { q: (minus ? Math.max(a, b) + ' − ' + Math.min(a, b) : a + ' + ' + b) + ' = ?', o: choices(x, [x + 10, x - 10, x + 100], num, [x + 1, x - 1]), tip: 'Do the big parts first, then the small: ' + x + '.' };
    },
    div: function (lv) {
      var b = lv < 3 ? R(3, 9) : R(6, 15), q = lv < 3 ? R(12, 40) : R(15, 70), a = b * q;
      return { q: a + ' ÷ ' + b + ' = ?', o: choices(q, [q + 1, q - 1, q + 10], num), tip: 'Check by multiplying back: ' + q + ' × ' + b + ' = ' + a + '.' };
    },
    frac: function (lv) {
      var f = pick(lv < 3 ? [[1, 4], [3, 4], [1, 5], [2, 5], [1, 8], [3, 8]] : [[1, 3], [2, 3], [1, 6], [5, 8], [7, 8], [1, 12], [3, 16]]), x = f[0] / f[1] * 100;
      return { q: f[0] + '/' + f[1] + ' as a percent?', o: choices(x, [f[1] / f[0], x / 10, 100 - x], function (v) { return r1(v) + '%'; }), tip: f[0] + ' ÷ ' + f[1] + ' = ' + r1(x) + '%. Knowing the eighths and thirds by heart makes odds and returns instant.' };
    },
    tip: function (lv) {
      var bill = pick([42, 64, 86, 120, 148, 236]), p = pick([15, 18, 20]), t = bill * p / 100;
      return { q: p + '% tip on ' + money(bill) + '?', o: choices(t, [bill / p, t * 2, bill * 0.1], money), tip: '10% = ' + money(bill / 10) + (p === 20 ? ', double it' : p === 15 ? ', plus half of that' : ', double it and take off 2%') + ' → ' + money(t) + '.' };
    }
  };
  function makeQ(lv, last) {
    var pool = Math.random() < 0.55 ? STOCK : GEN, keys = Object.keys(pool).filter(function (k) { return k !== last; }), k = pick(keys), q = pool[k](lv);
    q.k = k; q.kind = pool === STOCK ? 'Stocks' : 'Sharpener'; return q;
  }

  function drill(opt) {
    opt = opt || {};
    App.screen('Quick Math', function (v) {
      var m = st(), n = 0, right = 0, fastN = 0, timedN = 0, last = null, t0 = 0;
      // which questions get a clock: about 4 of 10, never the first, never three in a row
      var plan = [], k; for (k = 0; k < ROUND; k++) plan.push(k > 0 && Math.random() < TIMED_SHARE && !(plan[k - 1] && plan[k - 2]));
      if (plan.filter(Boolean).length < 2) { plan[3] = true; plan[7] = true; }
      if (opt.allTimed) plan = plan.map(function (x, i) { return i > 0; });  // edge check: every question after the first is on the clock
      v.innerHTML = '<div class="row"><span class="pill acc">Level ' + m.lv + ' of ' + MAXLV + '</span>' + (m.best ? '<span class="pill">Best ' + m.best + ' / ' + ROUND + '</span>' : '') + '</div><p class="mute small">Ten quick ones: stock math you’ll use on every trade, mixed with everyday sharpeners. Some are timed (' + TARGET[m.lv] + ' s on the clock); the rest have no clock, so take your time. Level up by getting 9 of 10 right and beating most clocks.</p><div id="q"></div>';
      function ask() {
        if (n >= ROUND) return finish();
        var q = makeQ(m.lv, last), timed = plan[n]; last = q.k; if (timed) timedN++;
        $('#q', v).innerHTML = '<div class="panel"><span class="eyebrow">' + (n + 1) + ' / ' + ROUND + ' · ' + q.kind + (timed ? ' · <span style="color:var(--accent)">Beat the clock</span>' : '') + '</span><h2 style="font-size:20px;line-height:1.4">' + esc(q.q) + '</h2>' + (timed ? '<div style="height:4px;border-radius:2px;background:var(--line);overflow:hidden"><div id="bar" style="height:100%;width:100%;background:var(--accent);transition:width .25s linear"></div></div><p class="small mute mono" id="clk">' + TARGET[m.lv] + ' s</p>' : '') + '</div><div class="list">' + q.o.map(function (o, i) { return '<button class="btn opt" data-k="' + i + '" style="text-align:left;font-weight:600;font-variant-numeric:tabular-nums">' + esc(o.t) + '</button>'; }).join('') + App.idkBtn('k') + '</div><div id="fb"></div>';
        t0 = Date.now();
        var done = false, clk = null;
        if (timed) clk = setInterval(function () {
          var c = $('#clk', v), bar = $('#bar', v); if (!c || done) { clearInterval(clk); return; }
          var left = TARGET[m.lv] - (Date.now() - t0) / 1000;
          c.textContent = Math.max(0, Math.ceil(left)) + ' s'; if (bar) bar.style.width = Math.max(0, left / TARGET[m.lv] * 100) + '%';
          if (left <= 0) grade(null);
        }, 250);
        function grade(b) {
            if (done) return; done = true; clearInterval(clk);
            var secs = (Date.now() - t0) / 1000, out = !b, ok = !out && !!(q.o[+b.dataset.k] || {}).ok, fast = ok && timed;
            if (ok) right++; if (fast) fastN++;
            m.n++; if (ok) m.ok++; App.save();
            $$('[data-k]', v).forEach(function (x) { x.disabled = out; if ((q.o[+x.dataset.k] || {}).ok) x.classList.add('right'); else if (x === b) x.classList.add('wrong'); });
            $('#fb', v).innerHTML = App.coachHTML(ok ? (fast ? 'best' : 'right') : 'wrong', (out ? '<b>Time’s up.</b> ' : ok && timed ? 'Beat the clock · ' + secs.toFixed(1) + ' s. ' : '') + esc(q.tip)) + '<button class="btn primary" id="nx" style="width:100%">Next</button>';
            $('#nx', v).onclick = function () { n++; ask(); };
        }
        $$('[data-k]', v).forEach(function (b) { b.onclick = function () { grade(b); }; });
      }
      function finish() {
        var old = m.lv;
        m.rounds++; m.best = Math.max(m.best || 0, right); m.fast = Math.max(m.fast || 0, fastN);
        if (right >= 9 && fastN >= Math.ceil(timedN * 0.6) && m.lv < MAXLV) m.lv++;
        else if (right <= 5 && m.lv > 1) m.lv--;
        App.save();
        var up = m.lv > old, down = m.lv < old;
        $('#q', v).innerHTML = App.coachHTML('info', '<b>' + right + ' / ' + ROUND + '</b> · beat the clock ' + fastN + ' of ' + timedN + '. ' + (up ? 'Level up: numbers get harder now.' : down ? 'Back to level ' + m.lv + ' to rebuild speed. Accuracy first, then speed.' : right >= 9 ? 'Sharp. Beat more of the clocks to level up.' : 'Read the shortcut on any you missed; the trick is what makes the next one fast.')) +
          '<div class="btns"><button class="btn primary" id="ag">Another round</button><button class="btn" id="dn">Done</button></div>';
        if (up) App.celebrate('level');
        $('#ag', v).onclick = function () { App.checkpoint(function () { App.back(); drill(opt); }); };
        $('#dn', v).onclick = function () { App.checkpoint(App.back); };
      }
      ask();
    });
  }
  function summary() { var m = st(); return 'Level ' + m.lv + (m.best ? ' · best ' + m.best + '/' + ROUND : ' · stocks + mental math'); }
  return { drill: drill, summary: summary, makeQ: makeQ, st: st };
})();
