// ===================== POP-UP QUESTIONS, MIXED (Oct 18) =====================
// Alain: "the pop up questions ensure all questions are mixed through all quick play and pop ups".
// Every pop-up (the quick question between activities, and the timed break) now rotates through every bank:
// Markets, Quotes (who said it), Street Smarts, Quick Math, Words (due recall or a term), Outside the Box.
// One question per bank in turn, never the same bank twice in a row; every question has "I don't know"; graded answers count
// toward today's total and the right subject's edge via App.coachFor.
var POP = (function () {
  var $ = App.$, $$ = App.$$, esc = App.esc;
  function shuf(a) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }

  // each maker returns { subj, label, q (html), opts: [{t, ok, why?}], teach } or null when the bank has nothing to ask
  var MAKERS = {
    mkt: function () {
      if (typeof MK === 'undefined' || !MK.Q) return null;
      var lv = (App.S.mkt && App.S.mkt.level) || 1, pool = MK.Q.filter(function (r) { return r[1] <= Math.min(5, lv + 1); }), r = App.freshPick('popMkt', pool.length ? pool : MK.Q, function (r) { return r[2].slice(0, 40); }, 80);
      return { subj: 'mkt', label: 'Markets · ' + r[0], q: esc(r[2]), opts: r[3].map(function (t, i) { return { t: t, ok: i === 0 }; }), teach: r[4] || '' };
    },
    quote: function () {
      if (typeof WZ === 'undefined' || !WZ.sageList) return null;
      var got = WZ.sageAll ? WZ.sageAll() : WZ.sageList(); if (got.length < 4) return null; // Oct 18: all quotes (they're all readable in the library), so pop-ups don't loop on the few you've earned
      var x = App.freshPick('popQuote', got, function (y) { return y.id; }, 60), names = shuf(got.map(function (y) { return y.who; }).filter(function (w, i, a) { return w !== x.who && a.indexOf(w) === i; })).slice(0, 3);
      if (names.length < 2) return null;
      return { subj: 'quotes', label: 'Quotes · who said it?', q: '<span style="font-style:italic">“' + esc(x.q) + '”</span>', opts: names.map(function (n) { return { t: n, ok: false }; }).concat([{ t: x.who, ok: true }]), teach: x.who + ' · ' + x.role + '. ' + x.m };
    },
    street: function () {
      if (typeof ST === 'undefined' || !ST.ALL || !ST.ALL.length) return null;
      var x = App.freshPick('popStreet', ST.ALL, function (y) { return y.id; }, 80);
      return { subj: 'street', label: 'Street Smarts · ' + x.c, q: esc(x.s) + '<br><b>What do you do?</b>', opts: [{ t: x.r, ok: true }].concat(x.w.map(function (t) { return { t: t, ok: false }; })), teach: x.b + ': ' + x.y };
    },
    math: function () {
      if (typeof MM === 'undefined' || !MM.makeQ) return null;
      var q = MM.makeQ((MM.st().lv) || 1, null);
      return { subj: 'math', label: 'Quick Math · ' + q.kind, q: esc(q.q), opts: q.o.map(function (o) { return { t: o.t, ok: o.ok, why: o.why }; }), teach: (q.steps || []).join(' ') + (q.trick ? ' Shortcut: ' + q.trick : '') };
    },
    word: function () {
      if (typeof GL === 'undefined' || !GL.T || GL.T.length < 4) return null;
      // Oct 18: follows the same progression as Words to Know — words in progress, the next new word in order, or a due review;
      // never a mastered word that isn't due. Area: one with the most still to do, rotating among those with work.
      var areas = ['Poker', 'Trading', 'Chess', 'Xiangqi', 'Everyday'].filter(function (a) { return GL.left(a) > 0; });
      if (!areas.length) return null;
      var skip = (App.S.recent && App.S.recent.popWord || []).map(Number), notNew = function (i) { return !GL.isNew(i); }, cand = [], start = (App.S.popWA = (App.S.popWA || 0) + 1);
      [skip, null].forEach(function (sk) { // rotate areas, first skipping words asked lately; pop-ups never quiz a word you haven't been shown yet
        for (var a = 0; a < areas.length && !cand.length; a++) cand = GL.plan(areas[(start + a) % areas.length], sk).filter(notNew);
      });
      if (!cand.length) return null;
      var i0 = cand[0]; App.recentAdd('popWord', String(i0), 30);
      var x = GL.T[i0], others = shuf(GL.T.filter(function (y) { return y !== x && y[2] === x[2]; })).slice(0, 3);
      if (others.length < 3) others = shuf(GL.T.filter(function (y) { return y !== x; })).slice(0, 3);
      // hide each term inside its own definition, so the right answer doesn't name the word
      function hide(y) { var t = y[3]; [y[0]].concat(y[1] || []).sort(function (a, b) { return b.length - a.length; }).forEach(function (w) { if (w.length > 1) t = t.replace(new RegExp(w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), '___'); }); return t; }
      return { subj: 'words', label: 'Words to Know · ' + x[2], q: 'What does <b>' + esc(x[0]) + '</b> mean?', opts: [{ t: hide(x), ok: true }].concat(others.map(function (y) { return { t: hide(y), ok: false }; })), teach: x[3] + (x[4] ? ' ' + x[4] : ''), onAnswer: function (ok) { GL.grade(i0, ok, 'term'); } };
    },
    think: function () {
      if (typeof TH === 'undefined' || !TH.Q || !TH.Q.length) return null;
      var r = App.freshPick('popThink', TH.Q, function (y) { return y[1].slice(0, 40); }, 14), subj = { chess: 'chess', xq: 'xq', poker: 'poker', mkt: 'mkt' }[r[0]] || '';
      return { subj: subj, label: 'Outside the Box', q: esc(r[1]), opts: r[2].map(function (t, i) { return { t: t, ok: i === 0 }; }), teach: r[3] || '' };
    }
  };
  var ORDER = ['mkt', 'quote', 'street', 'math', 'word', 'think'];

  function nextBank(skip) {
    var s = App.S, n = ORDER.length;
    for (var k = 0; k < n * 2; k++) {
      s.popI = ((s.popI || 0) + 1) % n;
      var b = ORDER[s.popI];
      if (skip && skip.indexOf(b) >= 0) continue;
      var q = MAKERS[b]();
      if (q) { q.bank = b; return q; }
    }
    return null;
  }

  // draws one question into el; calls after(right) when the person taps Continue
  function ask(el, q, after) {
    var opts = shuf(q.opts.slice());
    el.innerHTML = '<span class="eyebrow">' + esc(q.label) + '</span><h2 style="font-size:18px;line-height:1.4">' + q.q + '</h2><div class="list">' +
      opts.map(function (o, i) { return '<button class="btn opt" data-p="' + i + '" style="text-align:left">' + esc(o.t) + '</button>'; }).join('') + App.idkBtn('p') + '</div><div id="pfb"></div>';
    var over = false;
    $$('[data-p]', el).forEach(function (b) {
      b.onclick = function () {
        if (over) return; over = true;
        var i = +b.dataset.p, o = opts[i], ok = !!(o && o.ok); if (q.onAnswer) q.onAnswer(ok); var right = opts.filter(function (x) { return x.ok; })[0];
        $$('[data-p]', el).forEach(function (x) { var k = +x.dataset.p; if (opts[k] && opts[k].ok) x.classList.add('right'); else if (k === i) x.classList.add('wrong'); x.disabled = true; });
        var text = ok ? (q.teach ? esc(q.teach) : 'Right.') : (i === -9 ? 'The answer: <b>' + esc(right.t) + '</b>. ' : (o && o.why ? esc(o.why) + ' ' : '') + 'The answer: <b>' + esc(right.t) + '</b>. ') + (ok ? '' : esc(q.teach));
        $('#pfb', el).innerHTML = App.coachFor(q.subj, ok ? 'right' : 'wrong', text) + '<button class="btn primary" id="pgo" style="width:100%;margin-top:8px">Continue</button>';
        $('#pgo', el).onclick = function () { after(ok); };
      };
    });
  }

  // one mixed pop-up question between activities (word recall still gets its turn when a word is due)
  function one(done) {
    done = done || function () {};
    if (typeof WZ !== 'undefined' && WZ.recallDue && WZ.recallDue() && (App.S.popI || 0) % ORDER.length === ORDER.indexOf('word') - 1) { App.S.popI = ORDER.indexOf('word'); App.save(); WZ.recallModal(done); return; }
    var q = nextBank(); App.save(); if (!q) { done(); return; }
    var sheet = App.modal('<div class="grab"></div><div id="pq" class="wrap" style="gap:12px"></div>', false);
    ask($('#pq', sheet), q, function () { App.closeModal(); done(); });
  }
  // the timed break: n questions, each from a different bank
  function round(n, done) {
    done = done || function () {};
    var sheet = App.modal('<div class="grab"></div><span class="eyebrow">Break · ' + n + ' mixed questions</span><div id="pq" class="wrap" style="gap:12px"></div>', false), k = 0, right = 0, used = [];
    function step() {
      if (k >= n) {
        $('#pq', sheet).innerHTML = '<h2>' + right + ' / ' + n + '</h2><p class="mute">Back to it.</p><button class="btn primary" id="pqd" style="width:100%">Continue</button>';
        $('#pqd', sheet).onclick = function () { App.closeModal(); done(); };
        return;
      }
      var q = nextBank(used); App.save(); if (!q) { k = n; return step(); }
      used.push(q.bank); k++;
      ask($('#pq', sheet), q, function (ok) { if (ok) right++; step(); });
    }
    step();
  }
  return { one: one, round: round, MAKERS: MAKERS, ORDER: ORDER };
})();
