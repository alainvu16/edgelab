// ===================== TAPE SCHOOL + STRATEGY LAB (real data) =====================
var TP = (function () {
  var $ = App.$, $$ = App.$$, esc = App.esc, M = MKT_DATA.monthly, T = TAPE_DATA;
  var NAMES = { XLK: 'Tech', XLF: 'Financials', XLV: 'Health care', XLE: 'Energy', XLY: 'Discretionary', XLP: 'Staples', XLI: 'Industrials', XLU: 'Utilities', XLB: 'Materials', XLRE: 'Real estate', XLC: 'Communication', SPY: 'S&P 500', QQQ: 'Nasdaq 100', IWM: 'Small caps', TLT: 'Long bonds', GLD: 'Gold', BIL: 'Cash', SMH: 'Semiconductors', KRE: 'Regional banks', XHB: 'Homebuilders', JETS: 'Airlines', IYT: 'Transports', EEM: 'Emerging mkts', DBC: 'Commodities', USO: 'Oil', UUP: 'US dollar', HYG: 'Junk bonds', CPER: 'Copper', TNX: '10-yr yield', VIX: 'VIX' };
  var ASSETS = ['XLK', 'XLF', 'XLV', 'XLE', 'XLY', 'XLP', 'XLI', 'XLU', 'XLB', 'XLRE', 'XLC', 'SPY', 'QQQ', 'IWM', 'TLT', 'GLD', 'SMH', 'KRE', 'XHB', 'JETS', 'IYT', 'EEM', 'DBC'];
  // align tape dates to the monthly index
  var TI = {}; T.dates.forEach(function (d, k) { TI[d] = k; });
  function px(t, i) { if (M.px[t]) return M.px[t][i]; var k = TI[M.dates[i]]; return k == null || !T.px[t] ? null : T.px[t][k]; }
  function r1(t, i) { var a = px(t, i - 1), b = px(t, i); return a && b ? b / a - 1 : null; }
  function rN(t, i, n) { var a = px(t, i - n), b = px(t, i); return a && b ? b / a - 1 : null; }
  function sma(t, i, n) { var s = 0; for (var k = i - n + 1; k <= i; k++) { var v = px(t, k); if (v == null) return null; s += v; } return s / n; }
  function pct(x, d) { return x == null || !isFinite(x) ? '—' : (x >= 0 ? '+' : '') + (100 * x).toFixed(d == null ? 1 : d) + '%'; }
  function cls(x) { return x == null ? '' : x >= 0 ? 'style="color:var(--good)"' : 'style="color:var(--bad)"'; }
  function mname(ym) { var p = ym.split('-'); return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][+p[1] - 1] + ' ' + p[0]; }
  function st() { var m = App.S.mkt; if (!m.tp) m.tp = { lesson: {}, reads: 0, right: 0, strat: {} }; return m.tp; }
  var LAST = M.dates.length - 1; // last index (may be a partial month)

  // ---------- the drivers: what forces what ----------
  function dYield(i) { var a = px('TNX', i - 1), b = px('TNX', i); return a && b ? b - a : null; }
  var DRIVERS = [
    { id: 'yup', t: 'Yields jump', test: function (i) { var d = dYield(i); return d != null && d >= 0.25; }, show: function (i) { return '10-yr yield ' + (dYield(i) >= 0 ? '+' : '') + (dYield(i) * 100).toFixed(0) + ' bp'; },
      why: 'Higher yields make future profits worth less today, so long-duration growth and bond-like stocks (utilities, real estate, homebuilders) fall. Banks earn more on loans, so financials often hold up or rise.' },
    { id: 'ydn', t: 'Yields drop', test: function (i) { var d = dYield(i); return d != null && d <= -0.25; }, show: function (i) { return '10-yr yield ' + (dYield(i) * 100).toFixed(0) + ' bp'; },
      why: 'Falling yields lift long bonds and rate-sensitive stocks (utilities, real estate, homebuilders) and help growth. Sometimes yields fall because growth fears rise, which hurts cyclicals.' },
    { id: 'dup', t: 'Dollar rallies', test: function (i) { var r = r1('UUP', i); return r != null && r >= 0.02; }, show: function (i) { return 'Dollar ' + pct(r1('UUP', i)); },
      why: 'A strong dollar pushes down commodities, gold and emerging markets (their dollar debts get heavier) and trims overseas profits of US multinationals.' },
    { id: 'ddn', t: 'Dollar slides', test: function (i) { var r = r1('UUP', i); return r != null && r <= -0.02; }, show: function (i) { return 'Dollar ' + pct(r1('UUP', i)); },
      why: 'A weak dollar lifts commodities, gold, materials and emerging markets, and boosts foreign earnings of US exporters.' },
    { id: 'oup', t: 'Oil spikes', test: function (i) { var r = r1('USO', i); return r != null && r >= 0.10; }, show: function (i) { return 'Oil ' + pct(r1('USO', i)); },
      why: 'Energy producers earn more; airlines, transports and consumers pay more. Oil spikes also lift inflation expectations, which pushes yields up.' },
    { id: 'odn', t: 'Oil crashes', test: function (i) { var r = r1('USO', i); return r != null && r <= -0.10; }, show: function (i) { return 'Oil ' + pct(r1('USO', i)); },
      why: 'Energy falls hardest. Cheap fuel helps airlines and consumers, but a crash often signals weak global demand, which hurts cyclicals too.' },
    { id: 'fear', t: 'Fear spikes', test: function (i) { var a = px('VIX', i - 1), b = px('VIX', i); return a && b && b / a - 1 >= 0.35 && b >= 20; }, show: function (i) { return 'VIX ' + px('VIX', i).toFixed(0) + ' (' + pct(px('VIX', i) / px('VIX', i - 1) - 1, 0) + ')'; },
      why: 'When fear jumps, investors sell what they can: high-beta and cyclical stocks fall most, long bonds, gold and staples hold up. Correlations rise toward 1.' },
    { id: 'credit', t: 'Credit cracks', test: function (i) { var r = r1('HYG', i); return r != null && r <= -0.02; }, show: function (i) { return 'Junk bonds ' + pct(r1('HYG', i)); },
      why: 'Junk bonds falling means lenders demand more to lend to risky companies. Small caps, regional banks and cyclicals feel it first; treasuries and defensives hold.' },
    { id: 'copper', t: 'Copper rips', test: function (i) { var r = r1('CPER', i); return r != null && r >= 0.06; }, show: function (i) { return 'Copper ' + pct(r1('CPER', i)); },
      why: 'Copper goes into everything built, so a strong month often signals growth: materials, industrials, emerging markets and transports tend to lead.' }
  ];
  var STATS = null;
  function stats() {
    if (STATS) return STATS;
    STATS = {};
    DRIVERS.forEach(function (d) {
      var months = []; for (var i = 13; i < LAST; i++) if (d.test(i)) months.push(i);
      var rows = ASSETS.map(function (a) {
        var rs = months.map(function (i) { return r1(a, i); }).filter(function (x) { return x != null; });
        var avg = rs.length ? rs.reduce(function (s, x) { return s + x; }, 0) / rs.length : null;
        return { a: a, avg: avg, up: rs.length ? rs.filter(function (x) { return x > 0; }).length / rs.length : null, n: rs.length };
      }).filter(function (r) { return r.n >= 3 && r.avg != null; }).sort(function (x, y) { return y.avg - x.avg; });
      STATS[d.id] = { months: months, rows: rows };
    });
    return STATS;
  }

  // ---------- lessons ----------
  var LESSONS = [
    { t: 'What “the tape” really is', b: ['The tape is the record of what money is actually doing: prices, volume, and which groups lead or lag. News is what people say; the tape is what they do.', 'Reading it means asking three things: what is going up, what is going down, and what is reacting differently than the news says it should.', 'Pros start every day with the same handful of numbers so the picture builds in their head over years.'], q: ['The tape tells you…', ['What money is doing right now', 'What will happen next week', 'What analysts think', 'Which company has the best product'], 'Price and volume are decisions with money behind them. That is why traders trust the tape over headlines.'] },
    { t: 'The drivers: what forces what', b: ['A few big forces push almost everything: interest rates, the dollar, oil, fear (VIX), credit, and growth signals like copper.', 'Each force has winners and losers. Rates up: banks over utilities. Dollar up: US over emerging markets and gold. Oil up: energy over airlines.', 'In Driver Map you can see the real averages since 2012 for every one of these: what rose and what fell in the months that force fired.'], q: ['Oil spikes 15% in a month. Usual first losers?', ['Airlines and transports', 'Energy producers', 'Gold miners', 'Long bonds'], 'Fuel is a major cost for airlines and truckers. Energy producers are the winners of the same move.'] },
    { t: 'Rates move everything', b: ['The 10-year yield is the price of money for the whole economy. When it rises fast, everything priced on future cash (growth stocks, real estate, utilities, homebuilders) gets cheaper.', 'Banks are the main beneficiary: they lend at higher rates. Watch financials vs utilities as a quick read on what rates are doing to stocks.', 'Speed matters more than level: a 50 bp jump in a month hurts more than the same rise over a year.'], q: ['Yields jump 40 bp in a month. Which group usually suffers most?', ['Utilities and real estate', 'Banks', 'Energy', 'Cash'], 'Utilities and REITs trade like bonds: when bond yields rise, their dividends look less attractive and prices fall.'] },
    { t: 'The dollar and commodities', b: ['Commodities are priced in dollars. A stronger dollar makes them more expensive for the rest of the world, so demand and prices fall.', 'Emerging markets often borrow in dollars, so a rising dollar squeezes them twice.', 'A weak dollar is a tailwind for gold, materials, energy and emerging markets.'], q: ['The dollar falls 3% in a month. Likely winners?', ['Gold, materials, emerging markets', 'Utilities only', 'Long bonds only', 'Nothing changes'], 'A weaker dollar raises the price of everything priced in dollars and eases pressure on dollar borrowers abroad.'] },
    { t: 'Fear, credit and correlation', b: ['The VIX measures expected volatility. When it spikes, investors dump risk first and ask questions later.', 'Junk bonds (HYG) falling is often the earlier warning: lenders get nervous before stock investors do.', 'In stress, almost everything falls together. Long bonds, gold, staples and cash are where money hides.'], q: ['Junk bonds fall 3% while stocks are flat. What does that often warn?', ['Stress building beneath the surface', 'A big rally is guaranteed', 'Oil will rise', 'Nothing'], 'Credit markets are full of professionals who price default risk. When they get nervous, equity investors often follow.'] },
    { t: 'Growth signals and confirmation', b: ['Copper, transports, small caps and semiconductors are early growth signals. When they lead, the economy is usually heating up.', 'Dow theory idea: if industrial stocks make new highs, transports should confirm. If goods are being made, they must be shipped.', 'When the index rises but these growth signals lag, the rally is narrow and fragile.'], q: ['The S&P makes a new high but transports and small caps fall. This is called…', ['A divergence: weak confirmation', 'A breakout', 'A buy signal', 'Normal'], 'Healthy rallies are broad. Divergences don’t time tops, but they tell you to tighten risk.'] },
    { t: 'Reaction beats news', b: ['The most important tape skill: watch how price reacts to news, not the news itself.', 'Good news and the stock falls = it was priced in, or sellers are in control. Bad news and the stock rises = the worst is priced in.', 'Leaders that stop going up on good earnings are often topping. Laggards that stop falling on bad news are often bottoming.'], q: ['A company beats earnings and raises guidance, but the stock closes down 6%. The tape is saying…', ['Expectations were higher; sellers are in control', 'The stock is a buy', 'The news was bad', 'Nothing useful'], 'Price reaction is the verdict. When great news can’t lift a stock, the buyers are exhausted.'] },
    { t: 'From tape to idea: research, then rules', b: ['Process: 1) Which force is moving? 2) Who historically benefits? 3) Is that group also in a price uptrend with strong momentum? 4) What would prove you wrong?', 'Only when the driver, the trend and the momentum agree does an idea go on the research list.', 'Then define the trade before you take it: entry, stop, size (risk 1% or less), and exit. Research list is not a buy list; rules turn ideas into trades.'], q: ['Yields are falling fast and homebuilders are above their 10-month average with strong momentum. The next step is…', ['Define entry, stop and size before acting', 'Buy immediately with everything', 'Wait for a news article', 'Short them'], 'Driver + trend + momentum line up, so it earns research. Rules and risk come before any order.'] }
  ];

  // ---------- screens ----------
  function home() {
    App.screen('Tape School', function (v) {
      var s = st(), done = LESSONS.filter(function (l, i) { return s.lesson[i]; }).length;
      v.innerHTML = '<div><span class="eyebrow">Real data · 2012 to ' + mname(M.dates[LAST]) + '</span><h1>Tape School</h1><p class="mute small">Learn what forces what, prove it with real numbers, then turn it into research ideas and rules.</p></div>' +
        '<div class="btns"><button class="btn primary" id="rd">Read the month</button><button class="btn" id="dm">Driver map</button><button class="btn" id="now">Research list</button></div>' +
        '<div class="stats"><div class="stat"><span class="v">' + s.right + '/' + s.reads + '</span><span class="k">Months read right</span></div><div class="stat"><span class="v">' + done + '/' + LESSONS.length + '</span><span class="k">Lessons</span></div></div>' +
        '<h2>Lessons</h2><div class="list">' + LESSONS.map(function (l, i) { var open = i === 0 || s.lesson[i - 1]; return '<button class="item' + (open ? '' : ' locked') + (s.lesson[i] ? ' done' : '') + '" data-l="' + i + '"><span class="grow"><span class="t">' + (i + 1) + '. ' + esc(l.t) + '</span></span><span class="end">' + (s.lesson[i] ? '✓' : open ? '›' : 'locked') + '</span></button>'; }).join('') + '</div>' +
        '<p class="small mute">Educational. The research list is a systematic screen, not a recommendation to buy anything.</p>';
      $('#rd', v).onclick = readMonth; $('#dm', v).onclick = driverMap; $('#now', v).onclick = research;
      $$('[data-l]', v).forEach(function (b) { b.onclick = function () { var i = +b.dataset.l; if (i === 0 || st().lesson[i - 1]) lesson(i); }; });
    });
  }
  function lesson(i) {
    var l = LESSONS[i];
    App.screen(l.t, function (v) {
      var order = [0, 1, 2, 3].sort(function () { return Math.random() - .5; }), done = false;
      v.innerHTML = '<h1>' + esc(l.t) + '</h1><div class="prose">' + l.b.map(function (p) { return '<p>' + esc(p) + '</p>'; }).join('') + '</div><h3>Check</h3><p>' + esc(l.q[0]) + '</p><div class="list">' + order.map(function (k) { return '<button class="btn opt" data-k="' + k + '">' + esc(l.q[1][k]) + '</button>'; }).join('') + App.idkBtn('k') + '</div><div id="fb"></div>';
      $$('[data-k]', v).forEach(function (b) {
        b.onclick = function () {
          if (done) return; done = true; var ok = +b.dataset.k === 0;
          $$('[data-k]', v).forEach(function (x) { if (+x.dataset.k === 0) x.classList.add('right'); else if (x === b) x.classList.add('wrong'); });
          if (ok) { st().lesson[i] = 1; App.S.mkt.xp = (App.S.mkt.xp || 0) + 30; App.save(); }
          $('#fb', v).innerHTML = App.coachHTML(ok ? 'right' : 'wrong', esc(l.q[2])) + '<div class="btns">' + (ok ? '<button class="btn primary" id="nx">' + (i + 1 < LESSONS.length ? 'Next lesson' : 'Read a real month') + '</button>' : '<button class="btn primary" id="ag">Read again</button>') + '</div>';
          if ($('#nx')) $('#nx').onclick = function () { App.back(); if (i + 1 < LESSONS.length) lesson(i + 1); else readMonth(); };
          if ($('#ag')) $('#ag').onclick = function () { App.back(); lesson(i); };
        };
      });
    });
  }
  function tbl(rows, cols) {
    return '<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:12.5px;font-variant-numeric:tabular-nums"><thead><tr>' + cols.map(function (c, k) { return '<th style="text-align:' + (k ? 'right' : 'left') + ';padding:5px 4px;border-bottom:1px solid var(--line);color:var(--mute);font-weight:600">' + c + '</th>'; }).join('') + '</tr></thead><tbody>' + rows.map(function (r) { return '<tr>' + r.map(function (c, k) { return '<td style="padding:5px 4px;border-bottom:1px solid var(--line);text-align:' + (k ? 'right' : 'left') + '">' + c + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table></div>';
  }
  function driverMap() {
    App.screen('Driver map', function (v) {
      var S = stats();
      v.innerHTML = '<p class="mute">Every month since 2012 where each force fired, and what actually happened that same month: average return and how often each group was up. This is “what forces what,” measured.</p>' +
        DRIVERS.map(function (d) {
          var s = S[d.id]; if (!s || s.months.length < 3) return '';
          var top = s.rows.slice(0, 4), bot = s.rows.slice(-4).reverse();
          return '<div class="panel"><div class="row"><h3 class="grow">' + d.t + '</h3><span class="pill">' + s.months.length + ' months</span></div><p class="small">' + esc(d.why) + '</p>' +
            tbl(top.map(function (r) { return [NAMES[r.a], '<b ' + cls(r.avg) + '>' + pct(r.avg) + '</b>', Math.round(r.up * 100) + '%']; }), ['Best performers', 'Avg month', 'Up']) +
            tbl(bot.map(function (r) { return [NAMES[r.a], '<b ' + cls(r.avg) + '>' + pct(r.avg) + '</b>', Math.round(r.up * 100) + '%']; }), ['Worst performers', 'Avg month', 'Up']) +
            '<p class="small mute">Last time: ' + mname(M.dates[s.months[s.months.length - 1]]) + '. Averages are same-month moves, not predictions.</p></div>';
        }).join('');
    });
  }
  var SECT = ['XLK', 'XLF', 'XLV', 'XLE', 'XLY', 'XLP', 'XLI', 'XLU', 'XLB', 'XLRE', 'XLC', 'TLT', 'GLD', 'IWM', 'SMH', 'KRE', 'XHB', 'JETS', 'EEM'];
  function readMonth() {
    var S = stats(), cand = [];
    DRIVERS.forEach(function (d) { S[d.id].months.forEach(function (i) { cand.push({ i: i, d: d }); }); });
    var c, opts, best;
    for (var t = 0; t < 200; t++) {
      c = cand[Math.floor(Math.random() * cand.length)];
      var avail = SECT.filter(function (a) { return r1(a, c.i) != null; });
      var ranked = avail.map(function (a) { return { a: a, r: r1(a, c.i) }; }).sort(function (x, y) { return y.r - x.r; });
      best = ranked[0];
      var others = ranked.slice(3).sort(function () { return Math.random() - .5; }).slice(0, 3);
      if (best.r - others.reduce(function (m, o) { return Math.max(m, o.r); }, -1) < 0.025) continue;
      opts = others.concat([best]).sort(function () { return Math.random() - .5; });
      break;
    }
    App.screen('Read the month', function (v) {
      var i = c.i, fired = DRIVERS.filter(function (d) { return d.test(i); });
      var tape = [['10-yr yield', (dYield(i) >= 0 ? '+' : '') + (dYield(i) * 100).toFixed(0) + ' bp'], ['US dollar', pct(r1('UUP', i))], ['Oil', pct(r1('USO', i))], ['VIX (level)', px('VIX', i) ? px('VIX', i).toFixed(0) : '—'], ['Junk bonds', pct(r1('HYG', i))], ['Copper', pct(r1('CPER', i))], ['S&P 500', pct(r1('SPY', i))]];
      v.innerHTML = '<div class="row"><span class="pill acc">' + mname(M.dates[i]) + '</span>' + fired.map(function (d) { return '<span class="pill warn">' + d.t + '</span>'; }).join('') + '</div>' +
        '<div class="panel"><span class="eyebrow">The tape this month</span>' + tbl(tape.map(function (r) { return [r[0], r[1]]; }), ['Driver', 'Move']) + '</div>' +
        '<h3>Given these forces, which of these most likely led this month?</h3><div class="list">' + opts.map(function (o) { return '<button class="btn opt" data-a="' + o.a + '">' + NAMES[o.a] + ' <span class="mute">' + o.a + '</span></button>'; }).join('') + App.idkBtn('a') + '</div><div id="fb"></div>';
      var done = false;
      $$('[data-a]', v).forEach(function (b) {
        b.onclick = function () {
          if (done) return; done = true;
          var ok = b.dataset.a === best.a, s = st(); s.reads++; if (ok) s.right++; App.S.mkt.xp = (App.S.mkt.xp || 0) + (ok ? 30 : 8); App.save();
          $$('[data-a]', v).forEach(function (x) { if (x.dataset.a === best.a) x.classList.add('right'); else if (x === b) x.classList.add('wrong'); });
          var res = opts.slice().sort(function (x, y) { return y.r - x.r; }).map(function (o) { return NAMES[o.a] + ' <b ' + cls(o.r) + '>' + pct(o.r) + '</b>'; }).join(' · ');
          var d = c.d, sd = S[d.id], rank = sd.rows.findIndex(function (r) { return r.a === best.a; });
          $('#fb', v).innerHTML = App.coachHTML(ok ? 'right' : 'wrong', '<b>Actual:</b> ' + res + '<br><br><b>' + d.t + ':</b> ' + esc(d.why) + (rank >= 0 ? ' Across all ' + sd.months.length + ' such months, ' + NAMES[best.a] + ' averaged ' + pct(sd.rows[rank].avg) + ' (rank ' + (rank + 1) + ' of ' + sd.rows.length + ').' : '') + '<br><span class="small mute">Single months are noisy. The skill is knowing which way the forces lean, then letting the tape confirm.</span>') +
            '<div class="btns"><button class="btn primary" id="ag">Next month</button><button class="btn" id="dn">Done</button></div>';
          $('#ag').onclick = function () { App.checkpoint(function () { App.back(); readMonth(); }); };
          $('#dn').onclick = function () { App.back(); };
        };
      });
    });
  }
  // systematic research screen: driver + trend + momentum must agree
  function research() {
    App.screen('Research list', function (v) {
      var i = LAST - 1 >= 13 ? (M.dates[LAST] && r1('SPY', LAST) != null ? LAST : LAST - 1) : LAST, S = stats();
      var recent = []; DRIVERS.forEach(function (d) { for (var k = i; k > i - 3; k--) if (d.test(k)) { recent.push({ d: d, k: k }); break; } });
      var cands = ['XLK', 'XLF', 'XLV', 'XLE', 'XLY', 'XLP', 'XLI', 'XLU', 'XLB', 'XLRE', 'XLC', 'SMH', 'KRE', 'XHB', 'IYT', 'EEM', 'GLD', 'TLT'].map(function (a) {
        var m12 = rN(a, i - 1, 11), above = px(a, i) > sma(a, i, 10), tail = 0, why = [];
        recent.forEach(function (x) { var row = S[x.d.id].rows, k = row.findIndex(function (r) { return r.a === a; }); if (k < 0) return; if (k < 5 && row[k].avg > 0.005) { tail++; why.push(x.d.t.toLowerCase()); } else if (k >= row.length - 5 && row[k].avg < -0.005) { tail--; why.push('hurt by ' + x.d.t.toLowerCase()); } });
        return { a: a, m12: m12, above: above, tail: tail, why: why };
      }).filter(function (c) { return c.m12 != null; });
      var ranked = cands.slice().sort(function (x, y) { return y.m12 - x.m12; }); ranked.forEach(function (c, k) { c.rank = k + 1; });
      var spyOk = px('SPY', i) > sma('SPY', i, 10);
      var ideas = ranked.filter(function (c) { return c.above && c.rank <= 6 && c.tail >= 0; }).slice(0, 4);
      var avoid = ranked.filter(function (c) { return !c.above || c.tail < 0; }).sort(function (x, y) { return x.m12 - y.m12; }).slice(0, 3);
      v.innerHTML = '<div><span class="eyebrow">As of ' + mname(M.dates[i]) + (i === LAST ? ' (month in progress)' : '') + '</span><h1>' + (spyOk ? 'Trend: up' : 'Trend: down') + '</h1><p class="mute small">S&amp;P 500 is ' + (spyOk ? 'above' : 'below') + ' its 10-month average. ' + (spyOk ? 'Momentum ideas are allowed.' : 'The rule says stay defensive; any idea below needs extra caution.') + '</p></div>' +
        '<div class="panel"><span class="eyebrow">Forces that fired in the last 3 months</span>' + (recent.length ? recent.map(function (x) { return '<div class="small"><b>' + x.d.t + '</b> · ' + mname(M.dates[x.k]) + ': ' + x.d.show(x.k) + '</div>'; }).join('') : '<div class="small mute">No big driver moves: the tape is calm. Leadership is decided by momentum alone.</div>') + '</div>' +
        '<h3>Worth researching</h3><p class="small mute">Passes all three: top-6 momentum (12-1), above its 10-month average, and no recent force working against it.</p>' +
        (ideas.length ? ideas.map(function (c) { return '<div class="panel" style="gap:6px"><div class="row"><h3 class="grow">' + NAMES[c.a] + ' <span class="mute small">' + c.a + '</span></h3><span class="pill good">#' + c.rank + ' momentum</span></div><p class="small">12-1 momentum ' + pct(c.m12) + ' · above 10-month average' + (c.why.length ? ' · tailwind: ' + c.why.join(', ') : '') + '.</p><p class="small mute">What would prove it wrong: a monthly close below the 10-month average (' + sma(c.a, i, 10).toFixed(2) + '), or dropping out of the top 6. Plan the stop and size before anything else.</p></div>'; }).join('') : '<div class="panel small mute">Nothing passes all three right now. Sitting out is a position.</div>') +
        '<h3>Facing headwinds</h3>' + tbl(avoid.map(function (c) { return [NAMES[c.a], pct(c.m12), c.above ? 'above' : 'below', c.why.join(', ') || '—']; }), ['Group', '12-1', '10-mo avg', 'Force']) +
        '<p class="small mute">This is a systematic screen to practice the process, not investment advice. Paper trade it first (thinkorswim paperMoney), and check your own research before risking money.</p>';
    });
  }

  // ---------- strategy lab: rules + real backtests ----------
  function rotate(i, list, n, fn) { return list.map(function (t) { return { t: t, v: fn(t, i) }; }).filter(function (x) { return x.v != null; }).sort(function (a, b) { return b.v - a.v; }).slice(0, n).map(function (x) { return x.t; }); }
  function m121(t, i) { var a = px(t, i - 12), b = px(t, i - 1); return a && b ? b / a - 1 : null; }
  var SECTORS = MKT_DATA.sectors, STOCKS = MKT_DATA.stocks;
  var STRATS = [
    { id: 'bh', t: 'Buy and hold S&P 500', idea: 'The benchmark. Buy the index and never sell. Every strategy below has to beat this after costs and taxes, or it isn’t worth the effort.', rules: ['Entry: buy SPY.', 'Exit: never.', 'Risk: you sit through every crash in full.'], works: 'Long bull markets.', fails: 'Deep bear markets (2022: −25%), and your nerves.', hold: function (i) { return [['SPY', 1]]; },
      q: ['Why test every strategy against buy-and-hold?', ['It’s the free, effortless alternative you must beat', 'It always loses', 'Brokers require it', 'It has no risk'], 'If a strategy can’t beat holding the index after costs, the extra work and taxes aren’t paying you.'] },
    { id: 'trend', t: 'Trend filter (10-month)', idea: 'Own stocks only while the market is in an uptrend; otherwise sit in cash. You give up a little upside to skip most of the big crashes.', rules: ['Signal: at month end, is SPY above its 10-month average?', 'Yes: hold SPY next month. No: hold T-bills (BIL).', 'Check once a month only. Ignore the daily noise.'], works: 'Long bear markets (2008, 2022).', fails: 'Choppy, sideways years: you get whipsawed in and out.', hold: function (i) { var s = sma('SPY', i, 10); return px('SPY', i) > s ? [['SPY', 1]] : [['BIL', 1]]; },
      q: ['Main benefit of a 10-month trend filter?', ['Cutting the deepest drawdowns', 'Beating the market every year', 'Never losing money', 'Picking the best stocks'], 'It doesn’t predict; it reacts. Missing the worst of a 30–50% crash matters more than the small whipsaw costs.'] },
    { id: 'rot', t: 'Sector rotation (top 3, 12-1)', idea: 'Each month, own the three sectors with the strongest 12-1 momentum. Ride leadership, drop laggards.', rules: ['Rank the 11 sectors by 12-month return, skipping the last month.', 'Hold the top 3, equal weight. Rebalance monthly.', 'Sell any sector that drops out of the top 3.'], works: 'Trending markets with clear leaders (2020–21 tech, 2022 energy).', fails: 'Sharp reversals where last year’s losers lead (late 2020).', hold: function (i) { return rotate(i, SECTORS, 3, m121).map(function (t) { return [t, 1 / 3]; }); },
      q: ['Why skip the most recent month in the ranking?', ['One-month returns tend to reverse', 'Data arrives late', 'Taxes', 'It doesn’t matter'], 'Short-term reversal is a measured effect; skipping it makes the ranking more reliable.'] },
    { id: 'rotf', t: 'Rotation + trend filter', idea: 'Sector rotation, but only while the market is above its 10-month average. Otherwise cash. Combines picking leaders with stepping aside in bear markets.', rules: ['Regime: SPY above 10-month average? If not, hold BIL.', 'If yes: hold the top 3 sectors by 12-1.', 'Rebalance monthly; same rules every month.'], works: 'Both trending bull markets and long bear markets.', fails: 'V-shaped crashes and recoveries (2020): out at the bottom, late back in.', hold: function (i) { if (!(px('SPY', i) > sma('SPY', i, 10))) return [['BIL', 1]]; return rotate(i, SECTORS, 3, m121).map(function (t) { return [t, 1 / 3]; }); },
      q: ['What does the trend filter add to rotation?', ['A way to step aside when even leaders fall', 'More trades per month', 'Higher leverage', 'Better stock picks'], 'In a bear market the “best” sector can still lose a lot. The filter moves you to cash.'] },
    { id: 'dual', t: 'Dual momentum (stocks / bonds / cash)', idea: 'Own stocks when their 12-month return beats cash; otherwise own long bonds or cash, whichever is stronger.', rules: ['If SPY 12-month return > BIL 12-month return: hold SPY.', 'Else: hold whichever of TLT or BIL has the better 12-month return.', 'Check monthly.'], works: 'Long trends in either direction.', fails: '2022, when stocks and bonds fell together.', hold: function (i) { var s = rN('SPY', i, 12), b = rN('BIL', i, 12), t = rN('TLT', i, 12); if (s > b) return [['SPY', 1]]; return [[t > b ? 'TLT' : 'BIL', 1]]; },
      q: ['Absolute momentum compares an asset with…', ['Cash (T-bills)', 'Other stocks', 'Its P/E ratio', 'Analyst targets'], 'If stocks can’t beat cash over a year, the trend is weak enough to step aside.'] },
    { id: 'brk', t: 'Breakout (new 12-month highs)', idea: 'Own sectors that just closed at a 12-month high, as long as they stay above their 10-month average. Strength begets strength.', rules: ['Buy any sector closing at its highest month-end in 12 months.', 'Hold while above its 10-month average; sell on a close below.', 'Equal weight; cash if nothing qualifies.'], works: 'Broad bull markets with many groups at highs.', fails: 'Failed breakouts in choppy markets.', state: true, hold: null,
      q: ['A breakout on weak volume is generally…', ['Less reliable', 'More reliable', 'A sure sell', 'The same as strong volume'], 'Volume shows conviction. Weak-volume breakouts fail more often.'] },
    { id: 'mr', t: 'Mean reversion (buy last month’s loser)', idea: 'Buy the worst sector of the last month, betting on a snap-back. It shows why short-term reversal and long-term momentum are different animals.', rules: ['Hold the single worst sector of the last month for one month.', 'Rebalance monthly.', 'No stops in the test (that’s part of the lesson).'], works: 'Range-bound markets after overreactions.', fails: 'Trending markets: losers keep losing.', hold: function (i) { return rotate(i, SECTORS, 1, function (t, k) { var r = r1(t, k); return r == null ? null : -r; }).map(function (t) { return [t, 1]; }); },
      q: ['Why does buying last month’s loser behave differently from 12-1 momentum?', ['Short horizons revert, longer horizons trend', 'It is the same thing', 'Losers are cheaper', 'Volume'], 'Over a month prices tend to snap back; over 3–12 months they tend to keep going. Know which horizon you are trading.'] },
    { id: 'sixty', t: '60/40 stocks and bonds', idea: 'The classic balanced portfolio: 60% S&P 500, 40% long bonds, rebalanced monthly. Bonds usually cushion stock crashes.', rules: ['Hold 60% SPY and 40% TLT.', 'Rebalance monthly back to 60/40.', 'No signals.'], works: 'Crashes driven by growth fears (2008, 2020), when bonds rally.', fails: 'Inflation shocks (2022), when stocks and bonds fall together.', hold: function (i) { return [['SPY', .6], ['TLT', .4]]; },
      q: ['When does 60/40 struggle most?', ['When inflation pushes stocks and bonds down together', 'In calm bull markets', 'When the Fed cuts', 'Never'], 'Bonds protect when yields fall. When inflation forces yields up, both legs can lose at once.'] },
    { id: 'rs', t: 'Stock relative strength (top 3 of 15)', idea: 'Own the three large stocks with the strongest 6-month returns. Fun to see, but this test has a big flaw on purpose.', rules: ['Rank 15 well-known large stocks by 6-month return.', 'Hold the top 3, monthly rebalance.', 'Flaw: these 15 were chosen because they are big winners today (survivorship bias).'], works: 'On paper here, because of hindsight in the stock list.', fails: 'In real life, the list must be picked without knowing the future. Expect far less.', bias: true, hold: function (i) { return rotate(i, STOCKS, 3, function (t, k) { return rN(t, k, 6); }).map(function (t) { return [t, 1 / 3]; }); },
      q: ['Why are this strategy’s results unreliable?', ['The stocks were picked knowing they became winners', 'Momentum never works', 'Monthly rebalancing', 'Too few trades'], 'Survivorship bias: testing only today’s winners makes any strategy look brilliant. Always ask how the list was chosen.'] }
  ];
  function backtest(s) {
    var start = 13 + 1, eq = [1], spy = [1], rets = [], held = [];
    var brk = {};
    for (var i = start; i < LAST; i++) {
      var h;
      if (s.id === 'brk') {
        SECTORS.forEach(function (t) { var p = px(t, i); if (p == null) return; var hi = true; for (var k = i - 11; k < i; k++) { var q = px(t, k); if (q == null || q > p) { hi = false; break; } } var smv = sma(t, i, 10); if (hi && smv != null && p > smv) brk[t] = 1; if (brk[t] && !(smv != null && p > smv)) delete brk[t]; });
        var ks = Object.keys(brk); h = ks.length ? ks.map(function (t) { return [t, 1 / ks.length]; }) : [['BIL', 1]];
      } else h = s.hold(i);
      var r = 0, ok = true; h.forEach(function (x) { var q = r1(x[0], i + 1); if (q == null) ok = false; else r += x[1] * q; });
      if (!ok) r = r1('BIL', i + 1) || 0;
      rets.push(r); eq.push(eq[eq.length - 1] * (1 + r)); spy.push(spy[spy.length - 1] * (1 + (r1('SPY', i + 1) || 0))); held.push(h);
    }
    var yrs = rets.length / 12, cagr = Math.pow(eq[eq.length - 1], 1 / yrs) - 1, peak = 1, mdd = 0;
    eq.forEach(function (v) { peak = Math.max(peak, v); mdd = Math.min(mdd, v / peak - 1); });
    var mean = rets.reduce(function (a, b) { return a + b; }, 0) / rets.length, sd = Math.sqrt(rets.reduce(function (a, b) { return a + (b - mean) * (b - mean); }, 0) / rets.length);
    var rf = 0.015 / 12, sharpe = sd ? (mean - rf) / sd * Math.sqrt(12) : 0;
    var spyC = Math.pow(spy[spy.length - 1], 1 / yrs) - 1, sp = 1, smdd = 0; spy.forEach(function (v) { sp = Math.max(sp, v); smdd = Math.min(smdd, v / sp - 1); });
    return { eq: eq, spy: spy, cagr: cagr, mdd: mdd, sharpe: sharpe, worst: Math.min.apply(null, rets), up: rets.filter(function (x) { return x > 0; }).length / rets.length, spyC: spyC, smdd: smdd, from: M.dates[start], to: M.dates[LAST - 1], last: held[held.length - 1], n: rets.length };
  }
  function spark(a, b) {
    var w = 340, h = 120, all = a.concat(b).map(Math.log), lo = Math.min.apply(null, all), hi = Math.max.apply(null, all);
    function path(s) { return s.map(function (v, k) { return (k ? 'L' : 'M') + (6 + k * (w - 12) / (s.length - 1)).toFixed(1) + ' ' + (h - 8 - (Math.log(v) - lo) / (hi - lo || 1) * (h - 16)).toFixed(1); }).join(' '); }
    return '<svg viewBox="0 0 ' + w + ' ' + h + '" style="width:100%;height:auto;display:block" role="img" aria-label="Growth of $1, strategy vs S&P 500"><path d="' + path(b) + '" fill="none" stroke="var(--mute)" stroke-width="1.4" stroke-dasharray="3 3"/><path d="' + path(a) + '" fill="none" stroke="var(--accent)" stroke-width="2"/></svg><div class="small mute row"><span><b style="color:var(--accent)">—</b> strategy</span><span>- - S&amp;P 500</span><span class="grow"></span><span>log scale</span></div>';
  }
  function strategies() {
    App.screen('Strategy lab', function (v) {
      var s = st();
      var all = STRATS.filter(function (x) { return !x.bias; }).map(function (x) { return { x: x, b: backtest(x) }; });
      var bestRet = all.slice().sort(function (p, q) { return q.b.cagr - p.b.cagr; })[0], bestDD = all.slice().sort(function (p, q) { return q.b.mdd - p.b.mdd; })[0], bestSh = all.slice().sort(function (p, q) { return q.b.sharpe - p.b.sharpe; })[0];
      v.innerHTML = '<p class="mute">Nine strategies, each with exact rules and a backtest on real monthly data since 2013. Compare return <i>and</i> pain (max drawdown). Then answer the check to complete it.</p>' +
        App.coachHTML('info', 'Honest scoreboard for this period: highest return <b>' + esc(bestRet.x.t) + '</b> (' + pct(bestRet.b.cagr) + '/yr); smallest worst-drop <b>' + esc(bestDD.x.t) + '</b> (' + pct(bestDD.b.mdd, 0) + '); best return per unit of risk <b>' + esc(bestSh.x.t) + '</b>. 2013 onward was mostly a bull market, which flatters buy-and-hold; filters earn their keep in long bear markets like 2008.') +
        '<div class="list">' + STRATS.map(function (x) { var b = backtest(x); return '<button class="item' + (s.strat[x.id] ? ' done' : '') + '" data-s="' + x.id + '"><span class="grow"><span class="t">' + esc(x.t) + '</span><br><span class="s">' + pct(b.cagr) + '/yr · worst drop ' + pct(b.mdd, 0) + '</span></span><span class="end">' + (s.strat[x.id] ? '✓' : '›') + '</span></button>'; }).join('') + '</div><p class="small mute">Backtests ignore taxes and use month-end prices; real trading adds costs and slippage. Past results don’t guarantee future ones.</p>';
      $$('[data-s]', v).forEach(function (b) { b.onclick = function () { strategy(STRATS.filter(function (x) { return x.id === b.dataset.s; })[0]); }; });
    });
  }
  function strategy(x) {
    App.screen(x.t, function (v) {
      var b = backtest(x), order = [0, 1, 2, 3].sort(function () { return Math.random() - .5; }), done = false;
      v.innerHTML = '<h1>' + esc(x.t) + '</h1><p>' + esc(x.idea) + '</p>' +
        '<div class="panel"><span class="eyebrow">Rules</span><ol style="margin:0;padding-left:20px;display:flex;flex-direction:column;gap:4px">' + x.rules.map(function (r) { return '<li class="small">' + esc(r) + '</li>'; }).join('') + '</ol><p class="small"><b>Works:</b> ' + esc(x.works) + '<br><b>Fails:</b> ' + esc(x.fails) + '</p></div>' +
        '<div class="panel"><span class="eyebrow">Backtest · ' + mname(b.from) + ' to ' + mname(b.to) + '</span>' + spark(b.eq, b.spy) +
        '<div class="stats"><div class="stat"><span class="v">' + pct(b.cagr) + '</span><span class="k">Per year (S&amp;P ' + pct(b.spyC) + ')</span></div><div class="stat"><span class="v">' + pct(b.mdd, 0) + '</span><span class="k">Worst drop (S&amp;P ' + pct(b.smdd, 0) + ')</span></div><div class="stat"><span class="v">' + b.sharpe.toFixed(2) + '</span><span class="k">Sharpe</span></div><div class="stat"><span class="v">' + Math.round(b.up * 100) + '%</span><span class="k">Months up</span></div></div>' +
        '<p class="small">Holding now: ' + b.last.map(function (h) { return (NAMES[h[0]] || h[0]) + (b.last.length > 1 ? ' ' + Math.round(h[1] * 100) + '%' : ''); }).join(', ') + '</p>' + (x.bias ? '<p class="small" style="color:var(--warn)">Survivorship bias: results are inflated by hindsight in the stock list.</p>' : '') + '</div>' +
        '<h3>Check</h3><p>' + esc(x.q[0]) + '</p><div class="list">' + order.map(function (k) { return '<button class="btn opt" data-k="' + k + '">' + esc(x.q[1][k]) + '</button>'; }).join('') + App.idkBtn('k') + '</div><div id="fb"></div>';
      $$('[data-k]', v).forEach(function (bt) {
        bt.onclick = function () {
          if (done) return; done = true; var ok = +bt.dataset.k === 0;
          $$('[data-k]', v).forEach(function (y) { if (+y.dataset.k === 0) y.classList.add('right'); else if (y === bt) y.classList.add('wrong'); });
          if (ok) { st().strat[x.id] = 1; App.S.mkt.xp = (App.S.mkt.xp || 0) + 30; App.save(); }
          $('#fb', v).innerHTML = App.coachHTML(ok ? 'right' : 'wrong', esc(x.q[2]));
        };
      });
    });
  }
  return { home: home, lesson: lesson, LESSONS: LESSONS, strategy: strategy, driverMap: driverMap, readMonth: readMonth, strategies: strategies, research: research, stats: stats, backtest: backtest, STRATS: STRATS, DRIVERS: DRIVERS };
})();
