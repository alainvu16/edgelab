// ===================== STREET SMARTS: learn by doing — a real situation, you choose, then the why =====================
// Data in streetdata.js (STREET rows: [category, principle, rule, situation, best move, worse move, worse move, why, level]).
// Each situation comes at you three ways: what do you do · which principle is this · a true/false second look on a miss.
// New ones arrive a few per round, easiest first, mixed across categories. Progress is keyed by the principle's text.
var ST = (function () {
  var $ = App.$, $$ = App.$$, esc = App.esc;
  var CATS = ['Thinking traps', 'Negotiation', 'Scams & money', 'People & work'];
  var ROUND = 8, NEW_PER_ROUND = 3;
  var GAPS = [0, 30 * 60e3, 6 * 3600e3, 2 * 86400e3, 6 * 86400e3, 14 * 86400e3];
  function hk(t) { var v = 0; for (var i = 0; i < t.length; i++) v = (v * 31 + t.charCodeAt(i)) | 0; return 't' + (v >>> 0).toString(36); }
  var ALL = (typeof STREET !== 'undefined' ? STREET : []).map(function (r) { return { id: hk(r[0] + '|' + r[1]), c: r[0], b: r[1], d: r[2], s: r[3], r: r[4], w: [r[5], r[6]], y: r[7], lv: r[8], g: r[9] }; });
  // learning order: easier first; inside a level, rotate through the categories (a salad, but in order)
  var ORDER = (function () {
    var out = [];
    [1, 2, 3].forEach(function (lv) {
      var by = CATS.map(function (c) { return ALL.filter(function (x) { return x.lv === lv && x.c === c; }); }), i = 0, left = true;
      while (left) { left = false; by.forEach(function (list) { if (list[i]) { out.push(list[i]); left = true; } }); i++; }
    });
    return out;
  })();
  function st() { var s = App.S; if (!s.street) s.street = { box: {}, ways: {}, miss: {}, seen: {} }; return s.street; }
  function shuffle(a) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function learned() { var s = st(); return ORDER.filter(function (x) { return s.seen[x.id]; }); }
  function mastered() { var s = st(); return ORDER.filter(function (x) { return (s.box[x.id] || 0) >= 4; }); }
  function due() { var s = st(), now = Date.now(); return learned().filter(function (x) { var b = s.box[x.id] || 0; return s.miss[x.id] || now - s.seen[x.id] >= GAPS[Math.min(b, 5)]; }); }
  function plan() { // this round's items: what's due or missed first, then a few new ones in order, then the rest
    var s = st(), now = Date.now(), seen = learned(), fresh = ORDER.filter(function (x) { return !s.seen[x.id]; }).slice(0, Math.max(NEW_PER_ROUND, ROUND - seen.length));  // early rounds fill up with new ones
    seen.forEach(function (x) { var b = s.box[x.id] || 0; x._p = (s.miss[x.id] ? -3 : 0) + (now - s.seen[x.id] >= GAPS[Math.min(b, 5)] ? -1 : 0) + b * 0.7 + Math.random() * 1.2; });
    seen.sort(function (a, b) { return a._p - b._p; });
    var out = seen.slice(0, ROUND - fresh.length);
    fresh.forEach(function (x, i) { out.splice(Math.min(out.length, 1 + i * 2), 0, x); });   // new ones spread through the round
    return out.slice(0, ROUND);
  }
  function opts(x, mode) {
    if (mode === 'do') return shuffle([{ t: x.r, ok: true }, { t: x.w[0], ok: false }, { t: x.w[1], ok: false }]);
    var names = shuffle(ALL.filter(function (o) { return o.c === x.c && o.b !== x.b; })).slice(0, 3).map(function (o) { return { t: o.b, ok: false }; });
    return shuffle(names.concat([{ t: x.b, ok: true }]));
  }
  function quiz() {
    App.screen('Street Smarts', function (v) {
      var s = st(), items = plan(), n = 0, right = 0;
      if (!items.length) { v.innerHTML = '<p class="mute">No situations loaded.</p>'; return; }
      v.innerHTML = '<p class="mute small">Real situations. Pick what you’d do; the why comes after. Each one comes back three ways: what you’d do, which principle it is, and a second look if you miss.</p><div id="q"></div>';
      function ask() {
        if (n >= items.length) {
          $('#q', v).innerHTML = App.coachHTML('info', right + ' of ' + items.length + '. ' + (right >= items.length - 1 ? 'Sharp. Watch for one of these in real life this week; spotting it live is the real test.' : 'Read the why on the ones you missed; they’ll come back in a different form.')) + '<div class="btns"><button class="btn primary" id="ag">Another round</button><button class="btn" id="dn">Done</button></div>';
          $('#ag', v).onclick = function () { App.checkpoint(function () { App.back(); quiz(); }); }; $('#dn', v).onclick = function () { App.checkpoint(App.back); }; return;
        }
        var x = items[n], b = s.box[x.id] || 0, ways = s.ways[x.id] || { do: 0, name: 0 }, missed = s.miss[x.id], isNew = !s.seen[x.id];
        var mode;
        if (missed && missed.st === 'tf') mode = 'tf';
        else if (isNew) mode = 'do';                       // first meeting: learn by doing
        else mode = ['do', 'name'].filter(function (k) { return (!missed || k !== missed.a) && !(k === 'name' && x.g); }).sort(function (p, q) { return ways[p] - ways[q] + (Math.random() - .5) * 0.8; })[0];
        var o, label, head = '<span style="font-weight:500">' + esc(x.s) + '</span>';
        if (mode === 'do') { o = opts(x, 'do'); label = 'What do you do?'; }
        else if (mode === 'name') { o = opts(x, 'name'); label = 'Which principle is this?'; }
        else { // second look: is this the best move? (or: is this the principle?) — true or false
          var truth = Math.random() < 0.5;
          head += missed.a === 'name' ? '<br><span class="small">This is <b>' + esc(truth ? x.b : opts(x, 'name').filter(function (q) { return !q.ok; })[0].t) + '</b>.</span>' : '<br><span class="small">Best move: <b>' + esc(truth ? x.r : x.w[Math.floor(Math.random() * 2)]) + '</b></span>';
          o = [{ t: 'True', ok: truth }, { t: 'False', ok: !truth }]; label = 'Second look · true or false?';
        }
        $('#q', v).innerHTML = '<div class="panel"><span class="eyebrow">' + (n + 1) + ' / ' + items.length + ' · ' + esc(x.c) + (isNew ? ' · <span style="color:var(--accent)">New</span>' : '') + '</span><p class="small mute" style="margin:0">' + label + '</p><h2 style="font-size:17px;line-height:1.5;font-weight:500">' + head + '</h2></div><div class="list">' + o.map(function (op, i) { return '<button class="btn opt" data-k="' + i + '" style="text-align:left;font-weight:500">' + esc(op.t) + '</button>'; }).join('') + App.idkBtn('k') + '</div><div id="fb"></div>';
        var done = false;
        $$('[data-k]', v).forEach(function (btn) {
          btn.onclick = function () {
            if (done) return; done = true;
            var ok = !!(o[+btn.dataset.k] || {}).ok; if (ok) right++;
            if (mode === 'tf') { if (ok) s.miss[x.id] = { a: missed.a, st: 'full' }; }
            else if (ok) { ways[mode]++; delete s.miss[x.id]; s.box[x.id] = Math.min(5, b + 1); if (s.box[x.id] >= 4 && !(ways.do && (ways.name || x.g))) s.box[x.id] = 3; }
            else { s.box[x.id] = Math.max(0, b - 1); s.miss[x.id] = { a: mode, st: 'tf' }; }
            s.ways[x.id] = ways; s.seen[x.id] = Date.now(); App.save();
            $$('[data-k]', v).forEach(function (el) { if ((o[+el.dataset.k] || {}).ok) el.classList.add('right'); else if (el === btn) el.classList.add('wrong'); });
            $('#fb', v).innerHTML = App.coachHTML(ok ? 'right' : 'wrong', '<b>' + esc(x.b) + '</b>: ' + esc(x.d) + '<br>Best move: ' + esc(x.r) + '<br><span class="mute">' + esc(x.y) + '</span>') + '<button class="btn primary" id="nx" style="width:100%">Next</button>';
            $('#nx', v).onclick = function () { n++; ask(); };
          };
        });
      }
      ask();
    });
  }
  function home() {
    App.screen('Street Smarts', function (v) {
      var s = st(), l = learned().length, d = due().length;
      v.innerHTML = '<div><span class="eyebrow">Learn by doing</span><h1>Street Smarts</h1><p class="mute small">Negotiating, spotting scams and money traps, reading people at work, and the thinking traps that cost you in games, trades and life. Each round is real situations: you choose, then you get the why. A few new ones arrive each round, basics first.</p></div>' +
        '<div class="panel" style="gap:8px"><div class="row"><span class="pill acc">' + l + ' of ' + ALL.length + ' learned</span><span class="pill">' + mastered().length + ' mastered</span>' + (d ? '<span class="pill">' + d + ' to review</span>' : '') + '</div>' +
        CATS.map(function (c) { var all = ALL.filter(function (x) { return x.c === c; }), got = all.filter(function (x) { return s.seen[x.id]; }).length, m = all.filter(function (x) { return (s.box[x.id] || 0) >= 4; }).length; return '<div><div class="row small"><span class="grow">' + c + '</span><span class="mono">' + got + ' / ' + all.length + (m ? ' · ' + m + ' mastered' : '') + '</span></div><div class="bar" aria-hidden="true"><i style="width:' + (all.length ? Math.round(got / all.length * 100) : 0) + '%"></i></div></div>'; }).join('') +
        '<button class="btn primary" id="sq" style="width:100%">' + (l ? 'Test me' : 'Start') + '</button></div>';
      $('#sq', v).onclick = quiz;
    });
  }
  // for mastery rounds and the monthly test: 'what do you do' on things you've learned (or mastered)
  function provide(n, onlyMastered) {
    var pool = onlyMastered ? mastered() : learned();
    return shuffle(pool.slice()).slice(0, n).map(function (x) { return { k: 'street', head: esc(x.s), label: 'Street Smarts · ' + x.c, o: opts(x, 'do'), why: '<b>' + esc(x.b) + '</b>: ' + esc(x.y), secs: 25 }; });
  }
  function summary() { return learned().length + ' of ' + ALL.length + ' learned'; }
  return { home: home, quiz: quiz, provide: provide, summary: summary, due: function () { return due().length; }, learned: function () { return learned().length; }, ALL: ALL };
})();
