// ===================== YOUR PATH TO AN EDGE =====================
// Start-to-finish curriculum per discipline, paced by how fast you actually learn.
var RM = (function () {
  var $ = App.$, $$ = App.$$, esc = App.esc;
  function S() { return App.S; }
  function rm() { var s = S(); if (!s.rm) s.rm = { self: {} }; return s.rm; }
  function cnt(o) { return Object.keys(o || {}).filter(function (k) { return o[k]; }).length; }
  function frac(v, goal) { return Math.max(0, Math.min(1, (v || 0) / goal)); }
  // ToneBot course steps (Oct 17): the bot's own course questions, placed where they fit the order you learn in. No data yet = not a blocker.
  function tbStep(label, start, why) { return { label: label, why: why, p: function () { if (typeof TB === 'undefined' || !TB.hasQuiz()) return 1; var x = TB.courseProgress(start); return x == null ? 1 : x; }, go: function () { TB.courseContinue(start); } }; }
  function tbSchool() { return { label: 'ToneBot School: all 11 lessons', why: 'The bot you built, from its own lab results.', p: function () { var x = typeof TB !== 'undefined' ? TB.lessonsDone() : null; return x == null ? 1 : x; }, go: function () { TB.nextLesson(); } }; }
  function selfStep(id, label, why) { return { id: id, label: label, why: why, self: true, p: function () { return rm().self[id] ? 1 : 0; } }; }

  var TRACKS = {
    mkt: { name: 'Trading', edge: 'A trading edge is a set of rules with positive expectancy that you can follow without flinching: tested on real data, sized so no single loss hurts, and run long enough for the math to show. Most people never get there because they skip the boring parts: risk, testing, and journaling.',
      stages: [
        { t: 'Market basics', why: 'How orders, prices and risk work. Without these, every later lesson leaks money.', steps: [
          { label: 'Reach Markets level 3', p: function () { return frac((S().mkt.level || 1) - 1, 2); }, go: function () { MK.learn(); } },
          { label: 'Risk skill 2.5+ (position sizing, drawdowns)', p: function () { return frac((S().mkt.topic || {}).Risk - 1, 1.5); }, go: function () { MK.learn(); } },
          { label: 'Orders and basics skill 2.5+', p: function () { var t = S().mkt.topic || {}; return (frac((t.Orders || 1) - 1, 1.5) + frac((t.Basics || 1) - 1, 1.5)) / 2; }, go: function () { MK.learn(); } },
          { label: 'Charts skill 2.5+ (trend, support, volume)', p: function () { return frac(((S().mkt.topic || {}).Charts || 1) - 1, 1.5); }, go: function () { MK.learn(); } },
          tbStep('ToneBot course: The stock market', 'The stock market', 'Stocks, ETFs, sectors and indexes — the things the bot trades.')
        ] },
        { t: 'How markets move', why: 'What forces what: rates, the dollar, oil, fear and earnings. This is reading the tape.', steps: [
          { label: 'Tape School: all 8 lessons', p: function () { return frac(cnt(((S().mkt.tp) || {}).lesson), 8); }, go: function () { TP.home(); } },
          { label: 'Macro Desk: all chains', p: function () { return frac(cnt(((S().mkt.mc) || {}).lesson), MC.CHAINS.length); }, go: function () { MC.home(); } },
          { label: 'Read 15 real months (60%+ right)', p: function () { var t = S().mkt.tp || {}; return Math.min(frac(t.reads, 15), t.reads ? frac(t.right / t.reads, 0.6) : 0); }, go: function () { TP.readMonth(); } },
          { label: 'Call 12 historical events', p: function () { return frac(((S().mkt.mc) || {}).total, 12); }, go: function () { MC.eventReplay(); } },
          tbStep('ToneBot course: Your bot', 'Your bot', 'Every rule in ToneBot, one idea at a time (◇ untested: how it trades, not proof it wins).')
        ] },
        { t: 'Strategy', why: 'Momentum and sector rotation: rules, backtests, and why each strategy wins and fails.', steps: [
          { label: 'Momentum Lab: all lessons', p: function () { return frac(cnt(((S().mkt.mo) || {}).lesson), MO.LESSONS.length); }, go: function () { MO.home(); } },
          { label: 'Strategy lab: all 9 strategies checked', p: function () { return frac(cnt(((S().mkt.tp) || {}).strat), 9); }, go: function () { TP.strategies(); } },
          { label: 'Rotation Replay level 3', p: function () { return frac((((S().mkt.mo) || {}).lv || 1) - 1, 2); }, go: function () { MO.replay(); } },
          tbSchool(),
          { label: 'Momentum & Systems skill 3.5+', p: function () { var t = S().mkt.topic || {}; return (frac((t.Momentum || 1) - 1, 2.5) + frac((t['Systems & backtesting'] || 1) - 1, 2.5)) / 2; }, go: function () { MK.learn(); } },
          { label: 'Chart practice: net positive over 20 charts', p: function () { var m = S().mkt; return m.simN >= 20 && m.simR > 0 ? 1 : frac(m.simN, 20) * 0.9; }, go: function () { MK.sim(); } }
        ] },
        { t: 'Build your edge', why: 'Write your rules, paper trade them for 12 weeks, compare with the backtest, then go small with real money only if they hold.', steps: [
          { label: 'Write your trading system', why: 'Universe, signal, filter, rebalance, size, exit. Every field filled.', p: function () { var y = S().mkt.system || {}; return frac(SYS.filter(function (f) { return (y[f[0]] || '').trim().length > 3; }).length, SYS.length); }, go: system },
          { label: 'Paper trade 12 weekly journal entries', why: 'Log what the rules say and what you did, every week (Market Now journal).', p: function () { return frac((S().mkt.journal || []).length, 12); }, go: function () { MO.now(); } },
          tbStep('ToneBot course: How ToneBot is built', 'How ToneBot is built', 'Tech meets trading: data, tests, servers, guardrails.'),
          tbStep('ToneBot course: Uncle school', 'Uncle school', 'His strategy, tested (◇ still in the lab).'),
          selfStep('mkt_review', 'Compare paper results with the backtest', 'Same rules, similar results? If not, find out why before risking money.'),
          selfStep('mkt_small', 'Go live small: risk 1% or less per position', 'Only after the paper results hold. Size so a full losing streak is survivable.')
        ] }
      ] },
    chess: { name: 'Chess', edge: 'In chess your edge is seeing tactics faster, knowing your openings a few moves deeper than opponents, and converting won endgames. Above-average online play (1500+) comes from those three, plus a blunder-check habit every move.',
      stages: [
        { t: 'Basics', why: 'The checklist and the core mating patterns.', steps: [
          { label: 'Curriculum lessons 1–5', p: function () { return frac(CZ.LESSONS.slice(0, 5).filter(CZ.lessonDone).length, 5); }, go: function () { nextChessLesson(); } },
          { label: 'Puzzle rating 900', p: function () { return frac(((S().chess.peak || 800) - 800), 100); }, go: function () { CZ.puzzles({}); } },
          { label: 'Beat the Rookie bot', p: function () { return (S().chess.botLevel || 1) > 1 ? 1 : 0; }, go: function () { CZ.play(1, 'w'); } }
        ] },
        { t: 'Tactics', why: 'Forks, pins, skewers and combinations decide most games below 1600.', steps: [
          { label: 'Tactics lessons complete', p: function () { return frac(CZ.LESSONS.slice(5, 8).filter(CZ.lessonDone).length, 3); }, go: function () { nextChessLesson(); } },
          { label: 'Puzzle rating 1150', p: function () { return frac(((S().chess.peak || 800) - 900), 250); }, go: function () { CZ.puzzles({}); } },
          { label: 'Board vision level 3', p: function () { return frac((S().chess.sqLvl || 1) - 1, 2); }, go: function () { CZ.vision(); } },
          { label: 'Beat the Club bot', p: function () { return (S().chess.botLevel || 1) > 3 ? 1 : frac((S().chess.botLevel || 1) - 1, 3); }, go: function () { CZ.playMenu(); } }
        ] },
        { t: 'Strategy', why: 'Openings with a plan, endgame technique, pawn structure.', steps: [
          { label: '3 openings mastered (3 stars)', p: function () { var o = S().chess.open || {}; return frac(Object.keys(o).filter(function (k) { return o[k] >= 3; }).length, 3); }, go: function () { CZ.openings(); } },
          { label: '5 endgames completed', p: function () { return frac(cnt(S().chess.endg), 5); }, go: function () { CZ.endgameMenu(); } },
          { label: 'Puzzle rating 1350', p: function () { return frac(((S().chess.peak || 800) - 1150), 200); }, go: function () { CZ.puzzles({}); } },
          { label: 'Beat the Strong club bot', p: function () { return (S().chess.botLevel || 1) > 4 ? 1 : 0; }, go: function () { CZ.playMenu(); } }
        ] },
        { t: 'Your edge', why: 'Calculation, creativity and real opponents.', steps: [
          { label: 'Puzzle rating 1500', p: function () { return frac(((S().chess.peak || 800) - 1350), 150); }, go: function () { CZ.puzzles({}); } },
          { label: 'Average game accuracy 75%+', p: function () { var a = (S().chess.acc || []).slice(-5); if (a.length < 3) return frac(a.length, 3) * 0.5; return frac(a.reduce(function (x, y) { return x + y; }, 0) / a.length, 75); }, go: function () { CZ.playMenu(); } },
          { label: 'Beat the Shark bot', p: function () { return (S().chess.botLevel || 1) > 6 ? 1 : 0; }, go: function () { CZ.playMenu(); } },
          selfStep('chess_online', 'Play 20 rated games online (lichess or chess.com)', 'Bots are predictable. Your real rating comes from people.')
        ] }
      ] },
    poker: { name: 'Poker', edge: 'Your poker edge is making better decisions than the people at your table: knowing the price of every call, reading what hands fit their actions, betting for the right reasons, and exploiting each player type. Over thousands of hands, better decisions win.',
      stages: [
        { t: 'Basics', why: 'Hand rankings, who wins, and reading the board.', steps: [
          { label: 'Course: Foundations', p: function () { return courseUnit('Foundations'); }, go: function () { PK.course(); } },
          { label: 'Drill level 4', p: function () { return frac((S().poker.level || 1) - 1, 3); }, go: function () { PK.drills(); } }
        ] },
        { t: 'Reading hands & outs', why: 'What beats you, the nuts, draws and outs.', steps: [
          { label: 'Course: Reading the board', p: function () { return courseUnit('Reading the board'); }, go: function () { PK.course(); } },
          { label: 'Course: Draws & outs', p: function () { return courseUnit('Draws & outs'); }, go: function () { PK.course(); } },
          { label: 'Drill level 7', p: function () { return frac((S().poker.level || 1) - 4, 3); }, go: function () { PK.drills(); } }
        ] },
        { t: 'Betting & strategy', why: 'Pot odds, sizing, why you bet, ranges and the river.', steps: [
          { label: 'Course: The math of betting', p: function () { return courseUnit('The math of betting'); }, go: function () { PK.course(); } },
          { label: 'Course: How to bet + Reading hands', p: function () { return (courseUnit('How to bet') + courseUnit('Reading hands')) / 2; }, go: function () { PK.course(); } },
          { label: 'Bust the first 4 bots', p: function () { return frac((S().poker.bot || 1) - 1, 4); }, go: function () { PK.botMenu(); } },
          { label: 'Drill level 10', p: function () { return frac((S().poker.level || 1) - 7, 3); }, go: function () { PK.drills(); } }
        ] },
        { t: 'Your edge', why: 'Consistent good decisions against every player type, then real tables.', steps: [
          { label: 'Course complete', p: function () { var c = S().poker.course || {}; return frac(cnt(c), PK.COURSE.length); }, go: function () { PK.course(); } },
          { label: '75%+ good decisions over 200 decisions', p: function () { var d = S().poker.dec || { good: 0, all: 0 }; return Math.min(frac(d.all, 200), d.all ? frac(d.good / d.all, 0.75) : 0); }, go: function () { PK.botMenu(); } },
          { label: 'Bust the Pro', p: function () { return (S().poker.busts || {})[8] ? 1 : frac((S().poker.bot || 1) - 1, 7); }, go: function () { PK.botMenu(); } },
          selfStep('poker_online', 'Play 1,000 play-money hands online', 'Real opponents and real variance, with nothing at risk.')
        ] }
      ] },
    xq: { name: 'Xiangqi', edge: 'In xiangqi your edge is reading the pieces instantly, knowing the main openings, and spotting cannon and horse tactics. Most casual players never learn the endgames, so knowing them wins games.',
      stages: [
        { t: 'Basics', why: 'The board, every piece, and reading the characters.', steps: [
          { label: 'Rules lessons (all 7 pieces)', p: function () { return frac(XQ.LESSONS.slice(0, 6).filter(function (l) { return (S().xq.lessons || {})[l.id]; }).length, 6); }, go: function () { nextXqLesson(0, 6); } },
          { label: 'Master 8 piece characters', p: function () { return frac(XQ.CHARS.filter(XQ.mastered).length, 8); }, go: function () { XQ.charsQuiz(); } },
          { label: 'Beat the Village bot', p: function () { return (S().xq.level || 1) > 1 ? 1 : 0; }, go: function () { XQ.play(1); } }
        ] },
        { t: 'Openings & tactics', why: 'Central cannon, screen horses, and the cannon-horse-chariot tactics.', steps: [
          { label: 'Opening and tactics lessons', p: function () { return frac(XQ.LESSONS.slice(6, 14).filter(function (l) { return (S().xq.lessons || {})[l.id]; }).length, 8); }, go: function () { nextXqLesson(6, 14); } },
          { label: 'Puzzle rating 1000', p: function () { return frac((S().xq.prating || 800) - 800, 200); }, go: function () { XQ.puzzles(); } },
          { label: 'Beat the Teahouse bot', p: function () { return (S().xq.level || 1) > 3 ? 1 : frac((S().xq.level || 1) - 1, 3); }, go: function () { XQ.playMenu(); } }
        ] },
        { t: 'Strategy & endgames', why: 'Defense, trades, and the endgames most players never learn.', steps: [
          { label: 'All lessons complete', p: function () { return frac(cnt(S().xq.lessons), XQ.LESSONS.length); }, go: function () { nextXqLesson(0, 99); } },
          { label: 'All 14 characters mastered', p: function () { return frac(XQ.CHARS.filter(XQ.mastered).length, 14); }, go: function () { XQ.charsQuiz(); } },
          { label: 'Beat the Club bot', p: function () { return (S().xq.level || 1) > 4 ? 1 : 0; }, go: function () { XQ.playMenu(); } }
        ] },
        { t: 'Your edge', why: 'Deep calculation and real opponents.', steps: [
          { label: 'Puzzle rating 1300', p: function () { return frac((S().xq.prating || 800) - 1000, 300); }, go: function () { XQ.puzzles(); } },
          { label: 'Beat the Master bot', p: function () { return (S().xq.level || 1) > 6 ? 1 : 0; }, go: function () { XQ.playMenu(); } },
          selfStep('xq_online', 'Play 20 games online (xiangqi.com)', 'Humans play openings and traps the bot never shows you.')
        ] }
      ] }
  };
  function courseUnit(u) { var c = S().poker.course || {}, idx = []; PK.COURSE.forEach(function (x, i) { if (x.u === u) idx.push(i); }); return idx.length ? frac(idx.filter(function (i) { return c[i]; }).length, idx.length) : 1; }
  function nextXqLesson(a, b) { var L = XQ.LESSONS.slice(a, b).filter(function (l) { return !(S().xq.lessons || {})[l.id]; })[0] || XQ.LESSONS.filter(function (l) { return !(S().xq.lessons || {})[l.id]; })[0]; if (L) XQ.lesson(L); else XQ.playMenu(); }
  function nextChessLesson() { for (var i = 0; i < CZ.LESSONS.length; i++) if (!CZ.lessonDone(CZ.LESSONS[i]) && CZ.lessonOpen(i)) { CZ.lesson(i); return; } CZ.puzzles({}); }
  var SYS = [['universe', 'What you trade', 'The 11 S&P sector ETFs'], ['signal', 'Entry signal', 'Top 3 by 12-1 momentum at month end'], ['filter', 'Market filter', 'Only if SPY closes above its 10-month average; else T-bills'], ['rebalance', 'When you act', 'Last trading day of each month'], ['size', 'Position size and risk', 'Equal weight; max 1% account risk per position'], ['exit', 'Exit rule', 'Sell when it leaves the top 3 or closes below its 10-month average'], ['review', 'When you’d stop or change it', 'Pause if drawdown exceeds 20%; review quarterly, never mid-month']];
  function system() {
    App.screen('My trading system', function (v) {
      var y = S().mkt.system = S().mkt.system || {};
      v.innerHTML = '<p class="mute">Write your rules before you risk anything. If you can’t write it down, you can’t test it, and you can’t follow it under pressure. Examples are from the Strategy lab; change them to your own.</p>' +
        SYS.map(function (f) { return '<label class="panel" style="gap:6px"><span class="eyebrow">' + f[1] + '</span><textarea id="sys_' + f[0] + '" data-f="' + f[0] + '" rows="2" style="width:100%;box-sizing:border-box;background:var(--panel2);color:var(--fg);border:1px solid var(--line);border-radius:10px;padding:10px;font:inherit" placeholder="e.g. ' + esc(f[2]) + '">' + esc(y[f[0]] || '') + '</textarea></label>'; }).join('') +
        '<div class="btns"><button class="btn primary" id="sv">Save system</button><button class="btn" id="bt">See it backtested</button></div><p class="small mute" id="msg"></p>';
      $('#sv', v).onclick = function () { $$('[data-f]', v).forEach(function (t) { y[t.dataset.f] = t.value; }); App.save(); $('#msg', v).textContent = 'Saved. Paper trade it in thinkorswim paperMoney and log each week in Market Now.'; };
      $('#bt', v).onclick = function () { TP.strategy(TP.STRATS.filter(function (s) { return s.id === 'rotf'; })[0]); };
    });
  }

  // ---------- pace: how fast you actually move ----------
  function trackStats(k) {
    var tr = TRACKS[k], all = [], doneN = 0, cur = null, curStage = 0;
    tr.stages.forEach(function (st, si) { st.steps.forEach(function (sp) { var p = 0; try { p = sp.p(); } catch (e) {} if (!isFinite(p)) p = 0; sp._p = p; all.push(sp); doneN += p >= 1 ? 1 : p * 0.5; }); });
    for (var si = 0; si < tr.stages.length; si++) { if (tr.stages[si].steps.some(function (sp) { return sp._p < 1; })) { curStage = si; break; } curStage = si + 1; }
    var next = []; for (var s2 = curStage; s2 < tr.stages.length && next.length < 3; s2++) tr.stages[s2].steps.forEach(function (sp) { if (sp._p < 1 && next.length < 3) next.push(sp); });
    var hours = App.hoursOf(k), total = all.length, remaining = Math.max(0, total - doneN);
    var defaultRate = total / 25; // steps per hour if you learn at the planned pace
    var rate = hours >= 0.75 && doneN >= 1.5 ? doneN / hours : defaultRate;
    rate = Math.max(defaultRate * 0.4, Math.min(defaultRate * 3, rate));
    var hoursLeft = remaining / rate, days = App.activeDays(), perDay = days >= 2 ? App.totalHours() / days : 0.5;
    return { stage: Math.min(curStage, tr.stages.length - 1), done: curStage >= tr.stages.length, next: next, hours: hours, hoursLeft: hoursLeft, perDay: Math.max(0.25, perDay / 4), pct: doneN / total, measured: hours >= 0.75 && doneN >= 1.5, rateVsPlan: rate / defaultRate };
  }
  function eta(st) {
    var d = st.hoursLeft / st.perDay, when = new Date(Date.now() + d * 864e5);
    return { hours: st.hoursLeft, days: Math.ceil(d), date: when.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) };
  }
  // Oct 17 ('mixed like a salad, but in order'): stages stay in order; inside the current stage, rotate among its next open steps
  function nextStep(k) { if (!TRACKS[k]) return null; var st = trackStats(k), cur = st.done ? [] : TRACKS[k].stages[st.stage].steps.filter(function (s) { return s.go && s._p < 1; }), open = cur.length ? cur : st.next.filter(function (s) { return s.go; }); return open.length ? open[Math.floor(Math.random() * open.length)] : null; }
  var ORDER = ['mkt', 'chess', 'poker', 'xq'];
  function card(k) {
    var tr = TRACKS[k], st = trackStats(k), e = eta(st);
    return '<button class="item" data-tr="' + k + '" style="flex-direction:column;align-items:stretch;gap:8px"><div class="row"><span class="t grow">' + tr.name + '</span><span class="pill ' + (st.done ? 'good' : 'acc') + '">' + (st.done ? 'Edge stage done' : 'Stage ' + (st.stage + 1) + ': ' + tr.stages[st.stage].t) + '</span></div>' +
      '<div class="row" style="gap:4px">' + tr.stages.map(function (s, i) { return '<div class="bar grow"><i style="width:' + (i < st.stage || st.done ? 100 : i === st.stage ? Math.round(100 * s.steps.reduce(function (a, sp) { return a + Math.min(1, sp._p); }, 0) / s.steps.length) : 0) + '%"></i></div>'; }).join('') + '</div>' +
      '<span class="s">' + (st.done ? 'You’ve reached the edge stage. Keep the habits and take it online.' : 'Next: ' + esc(st.next[0] ? st.next[0].label : '') + ' · ' + (st.measured ? 'at your pace' : 'at the planned pace') + ' about ' + Math.max(1, Math.round(e.hours)) + 'h left (~' + e.date + ')') + '</span></button>';
  }
  function home() {
    App.screen('Path to an edge', function (v) {
      var days = App.activeDays(), tot = App.totalHours();
      v.innerHTML = '<div><span class="eyebrow">Start to finish</span><h1>Your path to an edge</h1><p class="mute small">Each track goes Basics → Fundamentals → Strategy → Your edge. Every step is tied to something you actually do in the app, so progress is earned, not clicked. Time estimates use your real pace once you have about an hour in a track.</p></div>' +
        '<div class="stats"><div class="stat"><span class="v">' + tot.toFixed(1) + 'h</span><span class="k">Trained</span></div><div class="stat"><span class="v">' + days + '</span><span class="k">Active days</span></div><div class="stat"><span class="v">' + (days >= 2 ? Math.round(tot / days * 60) + 'm' : '—') + '</span><span class="k">Per day</span></div></div>' +
        '<div class="list">' + ORDER.map(card).join('') + '</div>' +
        App.coachHTML('info', 'Quick play follows these paths automatically: most of its picks are your next step in order, mixed across subjects, with word reviews and outside-the-box questions in between. Trading gets the most detail because that is where an edge pays the most, and where most people skip the boring parts.');
      $$('[data-tr]', v).forEach(function (b) { b.onclick = function () { track(b.dataset.tr); }; });
    });
  }
  function track(k) {
    var tr = TRACKS[k];
    App.screen(tr.name + ' path', function (v) {
      function draw() {
        var st = trackStats(k), e = eta(st);
        v.innerHTML = '<div><span class="eyebrow">' + tr.name + '</span><h1>' + (st.done ? 'Edge stage reached' : 'Stage ' + (st.stage + 1) + ' of ' + tr.stages.length) + '</h1></div>' +
          '<div class="panel"><span class="eyebrow">What an edge means here</span><p class="small">' + esc(tr.edge) + '</p></div>' +
          '<div class="panel" style="gap:4px"><span class="eyebrow">Your pace</span><p class="small">' + Math.round(st.pct * 100) + '% of the path · ' + st.hours.toFixed(1) + 'h trained here. ' + (st.measured ? 'You are moving at ' + Math.round(st.rateVsPlan * 100) + '% of the planned speed. ' : 'Pace is measured after about an hour here; until then this uses the planned 25-hour path. ') + (st.done ? '' : 'About <b>' + Math.max(1, Math.round(e.hours)) + ' more hours</b>: around <b>' + e.date + '</b> at ' + Math.round(st.perDay * 60) + ' minutes a day on ' + tr.name.toLowerCase() + '. More minutes a day pulls the date in.') + '</p></div>' +
          tr.stages.map(function (s, si) {
            var state = si < st.stage || st.done ? 'done' : si === st.stage ? 'now' : 'later';
            return '<div class="panel" style="gap:8px;' + (state === 'now' ? 'border-color:var(--accent)' : '') + '"><div class="row"><h3 class="grow">' + (si + 1) + '. ' + esc(s.t) + '</h3><span class="pill ' + (state === 'done' ? 'good' : state === 'now' ? 'acc' : '') + '">' + (state === 'done' ? 'done' : state === 'now' ? 'you are here' : 'later') + '</span></div><p class="small mute">' + esc(s.why) + '</p>' +
              s.steps.map(function (sp, j) {
                var done = sp._p >= 1, id = si + '_' + j;
                return '<div class="row" style="align-items:flex-start;gap:10px"><span class="mono small" style="width:40px;flex:none;text-align:right">' + (done ? '✓' : Math.round(sp._p * 100) + '%') + '</span><span class="grow small"><b>' + esc(sp.label) + '</b>' + (sp.why ? '<br><span class="mute">' + esc(sp.why) + '</span>' : '') + '</span>' +
                  (sp.self ? '<button class="btn sm' + (done ? '' : ' primary') + '" data-self="' + sp.id + '">' + (done ? 'Undo' : 'I did this') + '</button>' : (!done && sp.go ? '<button class="btn sm" data-go="' + id + '">Go ›</button>' : '')) + '</div>';
              }).join('') + '</div>';
          }).join('');
        $$('[data-go]', v).forEach(function (b) { b.onclick = function () { var p = b.dataset.go.split('_'); tr.stages[+p[0]].steps[+p[1]].go(); }; });
        $$('[data-self]', v).forEach(function (b) { b.onclick = function () { var r = rm(); r.self[b.dataset.self] = !r.self[b.dataset.self]; App.save(); if (r.self[b.dataset.self]) App.celebrate('level'); draw(); }; });
      }
      draw();
    });
  }
  function summary() { return ORDER.map(function (k) { var st = trackStats(k); return { k: k, name: TRACKS[k].name, stage: st.stage, done: st.done, stageName: TRACKS[k].stages[st.stage].t, pct: st.pct }; }); }
  return { home: home, track: track, nextStep: nextStep, summary: summary, system: system };
})();
