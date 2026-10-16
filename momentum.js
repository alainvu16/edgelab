// ===================== MOMENTUM LAB (real market data) =====================
var MO = (function () {
  var $ = App.$, $$ = App.$$, esc = App.esc, D = MKT_DATA;
  var NAMES = { XLK: 'Tech', XLF: 'Financials', XLV: 'Health care', XLE: 'Energy', XLY: 'Discretionary', XLP: 'Staples', XLI: 'Industrials', XLU: 'Utilities', XLB: 'Materials', XLRE: 'Real estate', XLC: 'Communication', SPY: 'S&P 500', QQQ: 'Nasdaq 100', IWM: 'Small caps', TLT: 'Long bonds', GLD: 'Gold', BIL: 'T-bills (cash)' };
  function st() {
    var m = App.S.mkt;
    if (!m.mo) m.mo = { lesson: {}, replays: 0, you: 0, sys: 0, spy: 0, streak: 0, best: 0, lv: 1, stockR: 0 };
    return m.mo;
  }
  var M = D.monthly, W = D.weekly;
  function px(t, i) { return M.px[t][i]; }
  function ret(t, i, back) { var a = px(t, i - back), b = px(t, i); return a && b ? b / a - 1 : null; }
  function mom121(t, i) { var a = px(t, i - 12), b = px(t, i - 1); return a && b ? b / a - 1 : null; } // 12-1
  function sma(t, i, n) { var s = 0, c = 0; for (var k = i - n + 1; k <= i; k++) { var v = px(t, k); if (v == null) return null; s += v; c++; } return s / c; }
  function pct(x, d) { return x == null ? '—' : (x >= 0 ? '+' : '') + (100 * x).toFixed(d == null ? 1 : d) + '%'; }
  function cls(x) { return x == null ? '' : x >= 0 ? 'style="color:var(--good)"' : 'style="color:var(--bad)"'; }
  function monthName(ym) { var p = ym.split('-'); return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][+p[1] - 1] + ' ' + p[0]; }
  function rankSectors(i, fn) {
    return D.sectors.map(function (t) { return { t: t, v: fn(t, i) }; }).filter(function (x) { return x.v != null; }).sort(function (a, b) { return b.v - a.v; });
  }
  function table(rows, cols) {
    return '<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:12.5px;font-variant-numeric:tabular-nums"><thead><tr>' + cols.map(function (c, k) { return '<th style="text-align:' + (k ? 'right' : 'left') + ';padding:6px 4px;border-bottom:1px solid var(--line);color:var(--mute);font-weight:600">' + c + '</th>'; }).join('') + '</tr></thead><tbody>' +
      rows.map(function (r) { return '<tr>' + r.map(function (c, k) { return '<td style="padding:5px 4px;border-bottom:1px solid var(--line);text-align:' + (k ? 'right' : 'left') + '">' + c + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table></div>';
  }

  // ---------- course ----------
  var LESSONS = [
    { id: 'm1', t: 'What momentum actually is', body: ['Momentum is the tendency of things that have been going up to keep going up for a while, and things going down to keep going down. It shows up in stocks, sectors, countries and commodities, and has for over a century.', 'Why it exists: people underreact to news at first, then pile in late. Fund flows chase performance. Nobody wants to sell a winner or admit a loser.', 'You don’t predict. You measure what is already strong and ride it, then step off when it weakens.'],
      q: ['Momentum trading mainly relies on…', ['Measuring recent strength and following it', 'Predicting earnings', 'Buying what fell the most', 'Reading news first'], 'Momentum is about measuring, not forecasting. Rank by past returns, hold the leaders, repeat.'] },
    { id: 'm2', t: 'The lookback: 12-1', body: ['The classic signal is the return over the past 12 months, skipping the most recent month (“12-1”). The skip matters: over 1 month prices tend to snap back, so including it adds noise.', 'Shorter lookbacks (3–6 months) react faster but whipsaw more. Longer ones are smoother but slower to leave a dying trend. Many systems blend them.', 'In Edge Lab the sector tables show 1, 3, 6 and 12-1 month returns so you can see all of them at once.'],
      q: ['Why skip the most recent month in 12-1 momentum?', ['Short-term returns tend to reverse', 'Data isn’t available', 'It lowers taxes', 'Brokers require it'], 'One-month reversal is a real, measured effect. Skipping it makes the ranking more reliable.'] },
    { id: 'm3', t: 'Relative vs absolute momentum', body: ['Relative momentum: rank assets against each other and own the leaders. It tells you WHAT to hold.', 'Absolute momentum: compare an asset to cash or its own trend (for example, is SPY above its 10-month average?). It tells you WHETHER to be invested at all.', 'Dual momentum uses both: pick the strongest, but only hold it if it beats T-bills. In 2008 and 2022 that filter moved disciplined systems to cash while the leaders still fell.'],
      q: ['SPY is below its 10-month moving average. Absolute momentum says…', ['Step aside into cash or bonds', 'Buy more', 'Pick the best sector anyway', 'Short everything'], 'Absolute momentum is the risk switch. Leadership inside a falling market still loses money.'] },
    { id: 'm4', t: 'Sector rotation mechanics', body: ['Monthly routine: on the last trading day, rank the 11 sector ETFs by 12-1 (or a blend). Hold the top 2–3, equal weight. Sell what drops out. That’s the whole system.', 'Rules beat opinions. Write the rule down, size it, and let it run. The day you “just this once” override it is the day the system stops being a system.', 'Costs: monthly turnover is low, so commissions and spreads barely matter with liquid ETFs. Taxes can, in a taxable account.'],
      q: ['A sector you hold falls from rank 2 to rank 6 at month end. The rule says…', ['Sell it and buy the new top-ranked sector', 'Hold until it recovers', 'Double down', 'Wait for news'], 'The rule is the edge. Rotation only works if you actually rotate.'] },
    { id: 'm5', t: 'Volatility and position size', body: ['Two sectors with the same return are not the same trade if one swings twice as much. Volatility-adjusted momentum ranks by return ÷ volatility, favoring smooth climbers.', 'Volatility targeting sizes each position so it contributes similar risk. Energy at 35% volatility gets a smaller slice than staples at 12%.', 'Simple version: risk a fixed % of the account per position using ATR or recent volatility to set the size.'],
      q: ['Volatility-adjusted momentum favors…', ['Steady climbers over jumpy ones', 'The highest raw return', 'The biggest company', 'The cheapest ETF'], 'Dividing return by volatility rewards consistency, which often improves risk-adjusted results.'] },
    { id: 'm6', t: 'Momentum crashes', body: ['Momentum’s weak spot: sharp reversals at market bottoms. In March–April 2009 and April 2020, last year’s losers ripped higher and momentum portfolios lagged badly.', 'Defenses: the absolute-momentum filter, holding more than one sector, rebalancing on schedule, and never adding leverage to a momentum book.', 'Expect them. A strategy you will abandon at the first bad quarter is not a strategy you have.'],
      q: ['When are momentum strategies most likely to get hurt?', ['Sharp rebounds off a market bottom', 'Calm uptrends', 'Low-volume summers', 'Earnings season'], 'Leadership flips violently when the market turns. Diversify and keep the trend filter.'] },
    { id: 'm7', t: 'Reading the tape like a system', body: ['Every month, ask four questions: 1) Is the market above trend? 2) Which sectors lead on 12-1? 3) Did the leaders change? 4) What would the rule do?', 'Only then look at the news. News explains yesterday. Price ranks tomorrow’s holdings.', 'Journal each decision: the rank table, what you held, what you changed and why. Review quarterly.'],
      q: ['First question each month in a rotation routine?', ['Is the market above its trend filter?', 'What did the Fed say?', 'Which stock is in the news?', 'What did I lose last month?'], 'Regime first, selection second. The trend filter decides whether sector picks even matter this month.'] },
    { id: 'm8', t: 'From system to skill', body: ['Rotation Replay in this app shows you real month-end tables from 2013 to today. Pick what the rule would hold, then see what happened. The point is not to beat the system; it is to feel the rhythm of leadership changes until the ranks are obvious at a glance.', 'Stock Momentum does the same with large stocks and 6-month relative strength.', 'Market Now shows the actual current ranks as of the data date, so you can compare your read with reality every time you open the app.'],
      q: ['What should Rotation Replay teach you over time?', ['To recognize leadership shifts quickly and trust the rule', 'To predict news', 'To time the exact top', 'To pick penny stocks'], 'Pattern recognition plus discipline. That’s the skill.'] }
  ];

  (App.X().momentumLessons || []).forEach(function (l) { LESSONS.push(l); });
  function home() {
    App.screen('Momentum Lab', function (v) {
      var m = st(), done = LESSONS.filter(function (l) { return m.lesson[l.id]; }).length;
      var edge = m.replays ? (m.you - m.spy) / m.replays : 0;
      v.innerHTML = '<div><span class="eyebrow">Real data · through ' + monthName(M.dates[M.dates.length - 1]) + '</span><h1>Momentum Lab</h1><p class="mute small">Learn sector rotation, then practice on real month-end tables from 2013 to today.</p></div>' +
        '<div class="btns"><button class="btn primary" id="rp">Rotation Replay</button><button class="btn" id="sk">Stock Momentum</button><button class="btn" id="now">Market Now</button></div>' +
        '<div class="stats"><div class="stat"><span class="v">' + m.replays + '</span><span class="k">Replays</span></div><div class="stat"><span class="v" ' + cls(edge) + '>' + pct(edge) + '</span><span class="k">Your edge vs S&amp;P / month</span></div><div class="stat"><span class="v">' + m.streak + '</span><span class="k">Beat-the-rule streak</span></div><div class="stat"><span class="v">' + m.lv + '</span><span class="k">Replay level</span></div></div>' +
        '<h2>Course · ' + done + '/' + LESSONS.length + '</h2><div class="list">' + LESSONS.map(function (l, i) {
          var open = i === 0 || m.lesson[LESSONS[i - 1].id];
          return '<button class="item' + (open ? '' : ' locked') + (m.lesson[l.id] ? ' done' : '') + '" data-l="' + i + '"><span class="grow"><span class="t">' + (i + 1) + '. ' + esc(l.t) + '</span></span><span class="end">' + (m.lesson[l.id] ? '✓' : open ? '›' : 'locked') + '</span></button>';
        }).join('') + '</div><p class="small mute">Prices are adjusted month-end closes from public market data. Educational use only, not investment advice.</p>';
      $('#rp', v).onclick = replay; $('#sk', v).onclick = stockGame; $('#now', v).onclick = now;
      $$('[data-l]', v).forEach(function (b) { b.onclick = function () { var i = +b.dataset.l; if (i === 0 || st().lesson[LESSONS[i - 1].id]) lesson(i); }; });
    });
  }
  function lesson(i) {
    var l = LESSONS[i];
    App.screen(l.t, function (v) {
      var order = [0, 1, 2, 3].sort(function () { return Math.random() - .5; });
      v.innerHTML = '<h1>' + esc(l.t) + '</h1><div class="prose">' + l.body.map(function (p) { return '<p>' + esc(p) + '</p>'; }).join('') + '</div><h3>Check</h3><p>' + esc(l.q[0]) + '</p><div class="list">' + order.map(function (k) { return '<button class="btn opt" data-k="' + k + '">' + esc(l.q[1][k]) + '</button>'; }).join('') + App.idkBtn('k') + '</div><div id="fb"></div>';
      var done = false;
      $$('[data-k]', v).forEach(function (b) {
        b.onclick = function () {
          if (done) return; done = true;
          var ok = +b.dataset.k === 0;
          $$('[data-k]', v).forEach(function (x) { if (+x.dataset.k === 0) x.classList.add('right'); else if (x === b) x.classList.add('wrong'); });
          if (ok) { st().lesson[l.id] = 1; App.S.mkt.xp = (App.S.mkt.xp || 0) + 30; App.save(); }
          $('#fb', v).innerHTML = App.coachHTML(ok ? 'right' : 'wrong', esc(l.q[2]) + (ok ? '' : ' Read it once more and try again.')) + '<div class="btns">' + (ok ? (i + 1 < LESSONS.length ? '<button class="btn primary" id="nx">Next lesson</button>' : '<button class="btn primary" id="nx">Try Rotation Replay</button>') : '<button class="btn primary" id="ag">Try again</button>') + '</div>';
          if ($('#nx')) $('#nx').onclick = function () { App.back(); if (i + 1 < LESSONS.length) lesson(i + 1); else replay(); };
          if ($('#ag')) $('#ag').onclick = function () { App.back(); lesson(i); };
        };
      });
    });
  }

  // ---------- rotation replay ----------
  function replay() {
    var m = st(), n = M.dates.length;
    var i = 13 + Math.floor(Math.random() * (n - 15)); // decision month index; need i+1 for result
    var lv = m.lv;
    App.screen('Rotation Replay', function (v) {
      var rows = rankSectors(i, mom121);
      var spyAbove = px('SPY', i) > sma('SPY', i, 10);
      var picks = [];
      var need = lv >= 3 ? 3 : lv === 2 ? 2 : 1;
      v.innerHTML = '<div class="row"><span class="pill acc">Month end · ' + monthName(M.dates[i]) + '</span><span class="pill">Level ' + lv + '</span><span class="grow"></span><span class="small mute">Streak ' + m.streak + '</span></div>' +
        '<div class="panel"><div class="row"><span class="eyebrow grow">Regime check</span><span class="pill ' + (spyAbove ? 'good' : 'bad') + '">S&amp;P ' + (spyAbove ? 'above' : 'below') + ' 10-mo avg</span></div><p class="small mute">S&amp;P 500 ' + pct(ret('SPY', i, 12)) + ' over 12 months · 10-month average ' + sma('SPY', i, 10).toFixed(0) + ' vs price ' + px('SPY', i).toFixed(0) + '</p></div>' +
        '<h3>' + (lv === 1 ? 'Which sector would the 12-1 rule hold?' : 'Pick the ' + need + ' sectors the 12-1 rule would hold next month') + '</h3><p class="small mute">Returns to this month end. Tap to select.</p>' +
        '<div id="tb"></div><div class="btns"><button class="btn primary" id="go" disabled>Lock in</button></div><div id="fb"></div>';
      var shown = rows.slice().sort(function () { return Math.random() - .5; });
      function drawTable() {
        $('#tb', v).innerHTML = table(shown.map(function (r) {
          var sel = picks.indexOf(r.t) >= 0;
          return ['<button class="btn sm' + (sel ? ' primary' : '') + '" data-t="' + r.t + '" style="text-align:left;padding:6px 8px;font-size:12px;white-space:nowrap">' + esc(NAMES[r.t]) + '</button>', '<span ' + cls(ret(r.t, i, 1)) + '>' + pct(ret(r.t, i, 1)) + '</span>', '<span ' + cls(ret(r.t, i, 3)) + '>' + pct(ret(r.t, i, 3)) + '</span>', '<span ' + cls(ret(r.t, i, 6)) + '>' + pct(ret(r.t, i, 6)) + '</span>', '<b ' + cls(r.v) + '>' + pct(r.v) + '</b>'];
        }), ['Sector', '1m', '3m', '6m', '12-1']);
        $$('[data-t]', v).forEach(function (b) { b.onclick = function () { var t = b.dataset.t, k = picks.indexOf(t); if (k >= 0) picks.splice(k, 1); else if (picks.length < need) picks.push(t); drawTable(); $('#go', v).disabled = picks.length !== need; }; });
      }
      drawTable();
      $('#go', v).onclick = function () {
        var top = rows.slice(0, need).map(function (r) { return r.t; });
        var hit = picks.filter(function (p) { return top.indexOf(p) >= 0; }).length;
        var fwd = function (t) { return ret(t, i + 1, 1); };
        var youR = picks.reduce(function (s, t) { return s + fwd(t); }, 0) / need, sysR = top.reduce(function (s, t) { return s + fwd(t); }, 0) / need, spyR = fwd('SPY');
        var sysApplied = spyAbove ? sysR : fwd('BIL') || 0;
        var m2 = st(); m2.replays++; m2.you += youR; m2.sys += sysApplied; m2.spy += spyR;
        var exact = hit === need;
        if (exact) { m2.streak++; m2.best = Math.max(m2.best, m2.streak); if (m2.streak % 3 === 0 && m2.lv < 4) { m2.lv++; App.celebrate('level'); } else if (m2.streak >= 3) App.celebrate('mkt'); } else { m2.streak = 0; }
        App.S.mkt.xp = (App.S.mkt.xp || 0) + (exact ? 20 * need : 5); App.save();
        var txt = (exact ? 'Correct: the rule holds <b>' + top.map(function (t) { return NAMES[t]; }).join(', ') + '</b>.' : 'The 12-1 rule would hold <b>' + top.map(function (t) { return NAMES[t]; }).join(', ') + '</b>. You matched ' + hit + ' of ' + need + '. Sort by the 12-1 column; the 1-month column is noise.') +
          '<br><br><b>What happened in ' + monthName(M.dates[i + 1]) + ':</b> your picks ' + pct(youR) + ' · rule ' + pct(sysR) + ' · S&amp;P ' + pct(spyR) + (spyAbove ? '' : ' · regime filter said cash, so a disciplined system sat out (' + pct(fwd('BIL') || 0) + ').') +
          '<br><span class="small mute">One month proves nothing. Over hundreds of months the rule’s edge shows; your job is to apply it without flinching.</span>';
        $('#fb', v).innerHTML = App.coachHTML(exact ? 'right' : 'wrong', txt) + (exact && m2.streak % 3 === 0 && m2.lv <= 4 ? App.coachHTML('info', 'Level ' + m2.lv + '. ' + (m2.lv >= 3 ? 'Now pick the full top 3.' : 'Now pick the top 2.')) : '') + '<div class="btns"><button class="btn primary" id="ag">Next month</button><button class="btn" id="dn">Done</button></div>';
        $$('[data-t]', v).forEach(function (b) { b.disabled = true; if (top.indexOf(b.dataset.t) >= 0) { b.classList.add('primary'); } });
        $('#go', v).disabled = true;
        $('#ag').onclick = function () { App.checkpoint(function () { App.back(); replay(); }); };
        $('#dn').onclick = function () { App.back(); };
        if (m2.lv >= 3 && m2.replays >= 12) WZ.onlineNudge('mkt');
      };
    });
  }

  // ---------- stock momentum ----------
  function stockGame() {
    var n = M.dates.length, i = 13 + Math.floor(Math.random() * (n - 17));
    var pool = D.stocks.filter(function (t) { return px(t, i - 6) && px(t, i + 3); }).sort(function () { return Math.random() - .5; }).slice(0, 5);
    App.screen('Stock Momentum', function (v) {
      var rows = pool.map(function (t) { return { t: t, r6: ret(t, i, 6), rs: ret(t, i, 6) - ret('SPY', i, 6), r12: mom121(t, i) }; }).sort(function (a, b) { return b.rs - a.rs; });
      var shown = rows.slice().sort(function () { return Math.random() - .5; });
      v.innerHTML = '<div class="row"><span class="pill acc">' + monthName(M.dates[i]) + '</span><span class="pill">S&amp;P 6m ' + pct(ret('SPY', i, 6)) + '</span></div><h3>Which stock has the strongest 6-month relative strength vs the S&amp;P?</h3><p class="small mute">Relative strength = stock’s 6-month return minus the index’s. Then we show the next 3 months.</p>' +
        table(shown.map(function (r) { return ['<button class="btn sm" data-t="' + r.t + '" style="min-width:90px">' + r.t + '</button>', '<span ' + cls(r.r6) + '>' + pct(r.r6) + '</span>', '<span ' + cls(r.r12) + '>' + pct(r.r12) + '</span>']; }), ['Stock', '6m', '12-1']) + '<div id="fb"></div>';
      var done = false;
      $$('[data-t]', v).forEach(function (b) {
        b.onclick = function () {
          if (done) return; done = true;
          var t = b.dataset.t, best = rows[0].t, ok = t === best;
          var f = function (x) { return px(x, i + 3) / px(x, i) - 1; };
          var m = st(); m.stockR += f(t) - f('SPY'); App.S.mkt.xp = (App.S.mkt.xp || 0) + (ok ? 25 : 5); App.save();
          $$('[data-t]', v).forEach(function (x) { x.disabled = true; if (x.dataset.t === best) x.classList.add('primary'); });
          $('#fb', v).innerHTML = App.coachHTML(ok ? 'right' : 'wrong', (ok ? 'Right: ' : best + ' had the strongest relative strength (' + pct(rows[0].rs) + ' vs index). ') + '<b>Next 3 months:</b> ' + t + ' ' + pct(f(t)) + ', ' + best + ' ' + pct(f(best)) + ', S&amp;P ' + pct(f('SPY')) + '.<br><span class="small mute">Relative strength picks winners more often than not, never always. Position sizing and stops carry the rest.</span>') +
            '<div class="btns"><button class="btn primary" id="ag">Another</button><button class="btn" id="dn">Done</button></div>';
          $('#ag').onclick = function () { App.checkpoint(function () { App.back(); stockGame(); }); };
          $('#dn').onclick = function () { App.back(); };
        };
      });
    });
  }

  // ---------- market now ----------
  function now() {
    var i = M.dates.length - 1;
    App.screen('Market Now', function (v) {
      var rows = rankSectors(i, mom121), spyAbove = px('SPY', i) > sma('SPY', i, 10);
      var wi = W.dates.length - 1;
      var wk = function (t, b) { var a = W.px[t][wi - b], c = W.px[t][wi]; return a && c ? c / a - 1 : null; };
      v.innerHTML = '<div><span class="eyebrow">Data through ' + D.asof + '</span><h1>' + (spyAbove ? 'Risk on' : 'Risk off') + '</h1><p class="mute small">S&amp;P 500 is ' + (spyAbove ? 'above' : 'below') + ' its 10-month average. ' + (spyAbove ? 'The rule holds the top sectors.' : 'The rule holds cash or bonds.') + ' Prices update when the app is refreshed by Claude; this snapshot is not live.</p></div>' +
        '<h3>Sector ranks by 12-1 momentum</h3>' + table(rows.map(function (r, k) { return ['<b>' + (k + 1) + '</b> ' + esc(NAMES[r.t]) + ' <span class="mute">' + r.t + '</span>', '<span ' + cls(wk(r.t, 4)) + '>' + pct(wk(r.t, 4)) + '</span>', '<span ' + cls(ret(r.t, i, 3)) + '>' + pct(ret(r.t, i, 3)) + '</span>', '<b ' + cls(r.v) + '>' + pct(r.v) + '</b>']; }), ['Sector', '4w', '3m', '12-1']) +
        '<h3>Broad market</h3>' + table(D.bench.map(function (t) { return [esc(NAMES[t]) + ' <span class="mute">' + t + '</span>', '<span ' + cls(ret(t, i, 1)) + '>' + pct(ret(t, i, 1)) + '</span>', '<span ' + cls(ret(t, i, 6)) + '>' + pct(ret(t, i, 6)) + '</span>', '<span ' + cls(ret(t, i, 12)) + '>' + pct(ret(t, i, 12)) + '</span>']; }), ['Asset', '1m', '6m', '12m']) +
        '<h3>Quiz yourself</h3><p class="small">Before you scrolled, which 3 sectors did you think led? Write them in your journal, then compare. Do this every week and your read of the tape sharpens fast.</p>' +
        '<div class="panel"><span class="eyebrow">Journal</span><textarea id="jn" rows="4" style="width:100%;box-sizing:border-box;background:var(--panel2);color:var(--fg);border:1px solid var(--line);border-radius:10px;padding:10px;font:inherit" placeholder="What leads, what lags, what would the rule hold, what I think and why."></textarea><button class="btn sm" id="sv">Save note</button><div id="jl" class="small mute"></div></div>';
      var m = App.S.mkt; m.journal = m.journal || [];
      function showJ() { $('#jl', v).innerHTML = m.journal.slice(-5).reverse().map(function (j) { return '<p><b>' + esc(j.d) + '</b> · ' + esc(j.t) + '</p>'; }).join(''); }
      showJ();
      $('#sv', v).onclick = function () { var t = $('#jn', v).value.trim(); if (!t) return; m.journal.push({ d: new Date().toISOString().slice(0, 10), t: t }); m.journal = m.journal.slice(-60); App.save(); $('#jn', v).value = ''; showJ(); };
    });
  }
  return { home: home, now: now, replay: replay, lesson: lesson, LESSONS: LESSONS, stockGame: stockGame };
})();
