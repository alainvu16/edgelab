// ===================== MACRO DESK: how world events move markets =====================
var MC = (function () {
  var $ = App.$, $$ = App.$$, esc = App.esc, D = MKT_DATA, M = D.monthly;
  var NAMES = { XLK: 'Tech', XLF: 'Financials', XLV: 'Health care', XLE: 'Energy', XLY: 'Discretionary', XLP: 'Staples', XLI: 'Industrials', XLU: 'Utilities', XLB: 'Materials', XLRE: 'Real estate', XLC: 'Communication', SPY: 'S&P 500', QQQ: 'Nasdaq 100', IWM: 'Small caps', TLT: 'Long bonds', GLD: 'Gold', BIL: 'Cash' };
  function st() { var m = App.S.mkt; if (!m.mc) m.mc = { lesson: {}, events: {}, right: 0, total: 0 }; return m.mc; }
  function idx(ym) { return M.dates.indexOf(ym); }
  function ret(t, i, back) { var a = M.px[t][i - back], b = M.px[t][i]; return a && b ? b / a - 1 : null; }
  function pct(x) { return x == null ? '—' : (x >= 0 ? '+' : '') + (100 * x).toFixed(1) + '%'; }
  function cls(x) { return x == null ? '' : x >= 0 ? 'style="color:var(--good)"' : 'style="color:var(--bad)"'; }

  // The transmission chains a desk trader keeps in their head.
  var CHAINS = [
    { id: 'c1', t: 'The four dials', hook: 'Every headline, no matter how dramatic, reaches stock prices through only four dials: interest rates, the dollar, oil, and expected earnings. Learn to translate news into dial moves and you stop being surprised.',
      body: ['Rates up → future profits are worth less today → long-duration growth stocks (tech) fall first; banks can benefit; bonds fall.', 'Dollar up → US exporters and multinationals earn less abroad; commodities priced in dollars get pricier for the world and often fall.', 'Oil up → energy stocks rise; airlines, truckers and consumers feel a tax; inflation expectations rise, which loops back into rates.', 'Earnings expectations → the only dial that is company-specific. Guidance moves stocks more than the quarter that just happened.'],
      q: ['A surprise hot inflation print hits. First-order move?', ['Rates up, tech down', 'Oil down', 'Dollar collapses', 'Utilities rally'], 'Hot inflation means the Fed stays tight: yields jump, and long-duration growth stocks take the first hit.'] },
    { id: 'c2', t: 'The Fed and the yield curve', hook: 'The Federal Reserve sets the shortest interest rate. The bond market sets the rest. The gap between them, the yield curve, is the market’s opinion of the future, updated every second.',
      body: ['Fed hikes: borrowing costs rise, housing and autos slow, speculative stocks deflate. Fed cuts: the opposite, but cuts often arrive because something broke.', 'Inverted curve (2-year yield above 10-year): investors expect cuts and slower growth. It has preceded most recessions, with long and variable lags.', 'What pros watch: the dot plot, the statement’s wording changes, and the 2-year yield, which moves before the Fed does.', 'Fed days: expect whipsaws in the first hour. Experienced desks wait for the press conference to end.'],
      q: ['The 2-year yield falls sharply while the Fed hasn’t moved. The market is saying…', ['Cuts are coming', 'Hikes are coming', 'Nothing', 'Oil will rise'], 'The 2-year front-runs the Fed. A sharp drop means the bond market expects easing, often because growth is slowing.'] },
    { id: 'c3', t: 'Oil, war and supply shocks', hook: 'Geopolitics reaches your portfolio mostly through oil and shipping. A war far away is a tax on every mile driven and every container shipped.',
      body: ['Supply shock (war, OPEC cut, hurricane): oil spikes → energy stocks up, airlines and consumer stocks down, inflation expectations up → rates up.', 'Demand shock (recession, lockdown): oil collapses → energy stocks crater, consumers get relief, central banks can ease.', 'Shipping chokepoints (Suez, Hormuz, Red Sea) raise freight costs and delay goods; retailers and automakers feel it a quarter later.', 'The first move is often the wrong move. In 2022 energy led all year; in 2020 oil futures briefly went negative. Position for the regime, not the headline.'],
      q: ['A conflict closes a major shipping route. Which sector most likely benefits first?', ['Energy', 'Airlines', 'Retail', 'Real estate'], 'Supply fears lift oil and the producers who sell it. Transport and consumer names pay the bill.'] },
    { id: 'c4', t: 'Earnings season and guidance', hook: 'Four times a year, companies open the books. Stocks move not on the numbers, but on the numbers compared with what everyone expected, and on what management says about next quarter.',
      body: ['Beat and raise = best case. Beat and lower guidance = the stock often falls. Miss but raise = can rally. The future beats the past.', 'The whisper number: the real expectation on trading desks, often above the published consensus for hot stocks.', 'Sector read-through: when one bank reports credit stress, every bank moves. When one chipmaker guides up, the whole supply chain lifts.', 'Pros watch margins, inventory and the tone of the call. Revenue can be bought; margins must be earned.'],
      q: ['A company beats on earnings but guides next quarter lower. Typical reaction?', ['Stock falls', 'Stock soars', 'No move', 'Bonds rally'], 'Markets price the future. Lower guidance means lower future earnings, and that outweighs a past beat.'] },
    { id: 'c5', t: 'Elections, tariffs and policy', hook: 'Politics moves sectors more than it moves the whole market. The index usually shrugs; the winners and losers inside it can be dramatic.',
      body: ['Tariffs: importers and retailers hurt, domestic producers helped, inflation expectations up. Uncertainty itself raises the risk premium, which hits everything briefly.', 'Election outcomes: look at the promised policy and map it to sectors: defense, banks, energy, healthcare, renewables. Then fade the first day; the first move overshoots.', 'Regulation and antitrust: concentrated hits to specific names; rarely a market-wide story.', 'Fiscal spending (infrastructure, chips, defense) is a multi-year tailwind for the sectors named in the bill.'],
      q: ['A surprise tariff announcement. First to suffer?', ['Importers and retailers', 'Domestic steelmakers', 'Utilities', 'Gold'], 'Tariffs raise the cost of imported goods; companies that import and sell them see margins squeezed immediately.'] },
    { id: 'c6', t: 'Fear, credit and the plumbing', hook: 'Markets crash not because of bad news, but because the plumbing seizes: credit stops flowing and everyone sells what they can, not what they want.',
      body: ['Watch the VIX (expected volatility), credit spreads (the extra yield junk bonds pay) and the dollar. All three rising together is the stress signal.', 'Bank failures (2008, 2023): deposits flee, lending tightens, financials fall, and money hides in big tech and treasuries.', 'In a panic, correlations go to one. Diversification fails on the day you need it; only cash and sometimes treasuries hold.', 'The recovery is where momentum systems get hurt: last year’s losers bounce hardest. This is why the trend filter and rules matter more than opinions.'],
      q: ['VIX spikes, credit spreads widen, the dollar jumps. This combination signals…', ['Market stress and forced selling', 'A calm uptrend', 'An oil shock only', 'Good earnings'], 'That trio means risk is being dumped everywhere at once. Step back and let the rules decide.'] },
    { id: 'c7', t: 'What a seasoned trader actually looks at', hook: 'Before the open, the people who last in this business run the same quiet checklist. It is boring, and that is the point.',
      body: ['Overnight: S&P futures, 10-year yield, dollar index, oil, and the VIX. Five numbers, thirty seconds. They tell you which dials moved.', 'Calendar: Fed meetings, CPI, jobs report, earnings for anything you own. Known events are where the biggest gaps happen.', 'Leadership: which sectors and which handful of stocks are making new highs. Breadth: are many stocks rising, or just a few giants?', 'Their own book: what would hurt most today, and is that risk sized so it cannot end the game.', 'Then, and only then, the headlines, read as “which dial does this move, and is it already priced in?”'],
      q: ['The first thing a seasoned trader checks before the open?', ['Futures, yields, dollar, oil, VIX', 'Social media', 'Yesterday’s P&L', 'A hot stock tip'], 'The four dials plus fear. Everything else is commentary.'] }
  ];

  // Real episodes with real returns from the bundled data. s = decision month, e = measured end month.
  var EVENTS = [
    { id: 'taper', t: 'Taper tantrum', when: '2013-05', s: '2013-04', e: '2013-08', story: 'May 2013. The Fed hints it will slow its bond buying. Long-term yields jump a full percentage point in four months.', ask: 'Which did worst over the next 4 months?', opts: ['TLT', 'XLF', 'XLK', 'XLY'], ans: 'TLT', why: 'Rising yields crush long bonds and the stocks that trade like bonds (utilities, real estate). Banks and growth held up better.' },
    { id: 'oil14', t: 'Oil collapse', when: '2014-11', s: '2014-06', e: '2015-01', story: 'Mid-2014. US shale floods the market and OPEC refuses to cut. Crude falls from $105 to under $50.', ask: 'Which sector fell hardest?', opts: ['XLE', 'XLY', 'XLV', 'XLU'], ans: 'XLE', why: 'Energy producers live and die by the price of oil. Consumers got a gas-price tax cut, which helped discretionary.' },
    { id: 'trump16', t: '2016 election', when: '2016-11', s: '2016-10', e: '2017-01', story: 'November 2016. A surprise election result brings promises of tax cuts, deregulation and infrastructure spending.', ask: 'Which sector led in the three months after?', opts: ['XLF', 'XLU', 'XLRE', 'TLT'], ans: 'XLF', why: 'Banks rallied on deregulation hopes and rising yields. Bonds and bond-like sectors (utilities, real estate) lagged.' },
    { id: 'q418', t: 'Q4 2018 selloff', when: '2018-10', s: '2018-09', e: '2018-12', story: 'Autumn 2018. The Fed keeps hiking, trade-war headlines escalate, and the S&P drops nearly 20% into Christmas Eve.', ask: 'Which held up best?', opts: ['XLU', 'XLE', 'XLK', 'IWM'], ans: 'XLU', why: 'Defensive sectors (utilities, staples, health care) fall less when growth fears rise. Energy and small caps got hit hardest.' },
    { id: 'covid', t: 'COVID crash', when: '2020-03', s: '2020-01', e: '2020-03', story: 'February–March 2020. A pandemic shuts the world down. The fastest 30% drop in history.', ask: 'Which fell the most?', opts: ['XLE', 'XLK', 'XLP', 'TLT'], ans: 'XLE', why: 'Demand for oil vanished overnight. Tech, which enabled remote life, fell least; treasuries rose as the safe haven.' },
    { id: 'vax', t: 'Vaccine rotation', when: '2020-11', s: '2020-10', e: '2021-03', story: 'November 2020. Effective vaccines are announced. The reopening trade begins.', ask: 'Which led from here?', opts: ['XLE', 'XLK', 'XLU', 'TLT'], ans: 'XLE', why: 'The most beaten-down reopening sectors (energy, financials, small caps) ripped higher. This is the classic momentum crash: last year’s losers lead.' },
    { id: 'hike22', t: '2022 rate shock', when: '2022-01', s: '2021-12', e: '2022-10', story: 'January 2022. Inflation hits 40-year highs and the Fed begins its fastest hiking cycle in decades.', ask: 'Which was the only major winner?', opts: ['XLE', 'XLK', 'XLC', 'TLT'], ans: 'XLE', why: 'Rising rates and an energy supply shock: energy soared while tech, communication and long bonds all lost 25–35%.' },
    { id: 'svb', t: 'Bank failures 2023', when: '2023-03', s: '2023-02', e: '2023-06', story: 'March 2023. Silicon Valley Bank collapses in 48 hours; two more banks follow. Fear spreads across regional lenders.', ask: 'Where did money hide?', opts: ['XLK', 'XLF', 'XLRE', 'IWM'], ans: 'XLK', why: 'Cash fled small banks into giant, cash-rich tech. Financials, real estate (bank-financed) and small caps lagged.' },
    { id: 'ai23', t: 'AI boom', when: '2023-05', s: '2023-04', e: '2023-12', story: 'Spring 2023. A chipmaker guides revenue far above every estimate. The AI capital-spending wave begins.', ask: 'Which sectors led the rest of the year?', opts: ['XLK', 'XLU', 'XLP', 'XLE'], ans: 'XLK', why: 'Earnings expectations, the fourth dial, exploded higher for anything selling picks and shovels to AI. Defensives were left behind.' },
    { id: 'cut24', t: 'First Fed cut', when: '2024-09', s: '2024-06', e: '2024-11', story: 'September 2024. After two years of tight policy, the Fed cuts by half a point.', ask: 'Which did best around the first cut?', opts: ['XLU', 'XLE', 'TLT', 'XLP'], ans: 'XLU', why: 'Rate-sensitive sectors rallied into the cut, utilities especially, helped by AI power demand. Energy lagged on weak oil.' },
    { id: 'tariff25', t: 'Tariff shock 2025', when: '2025-04', s: '2025-03', e: '2025-06', story: 'April 2025. Sweeping tariffs are announced and the S&P drops over 10% in two days, then rebounds when they are paused.', ask: 'Which did best through the shock and rebound?', opts: ['XLK', 'XLE', 'XLV', 'IWM'], ans: 'XLK', why: 'The first move punished importers and growth; the rebound after the pause went straight back into tech leadership. Fade the first day.' }
  ];
  (App.X().macroChains || []).forEach(function (c) { CHAINS.push(c); });
  (App.X().events || []).forEach(function (e) { EVENTS.push(e); });
  function checkEvents() { // verify answers against data at runtime; drop any that no longer hold
    return EVENTS.filter(function (e) {
      var i0 = idx(e.s), i1 = idx(e.e); if (i0 < 0 || i1 < 0) return false;
      var rs = e.opts.map(function (t) { return { t: t, r: M.px[t][i1] / M.px[t][i0] - 1 }; });
      var worstQ = /worst|hardest|fell the most|most\b/.test(e.ask) && !/best|led|hide|winner|benefited/.test(e.ask);
      rs.sort(function (a, b) { return worstQ ? a.r - b.r : b.r - a.r; });
      e.rs = rs; e.ok = rs[0].t === e.ans;
      return e.ok;
    });
  }

  function home() {
    App.screen('Macro Desk', function (v) {
      var s = st(), ev = checkEvents(), done = CHAINS.filter(function (c) { return s.lesson[c.id]; }).length;
      v.innerHTML = '<div><span class="eyebrow">How the world reaches your P&amp;L</span><h1>Macro Desk</h1><p class="mute small">The transmission chains from headlines to prices, then real episodes from 2013 to 2025 with the actual numbers.</p></div>' +
        '<div class="btns"><button class="btn primary" id="ev">Event Replay</button><button class="btn" id="ck">Pre-market checklist</button></div>' +
        '<div class="stats"><div class="stat"><span class="v">' + s.right + '/' + s.total + '</span><span class="k">Events called</span></div><div class="stat"><span class="v">' + done + '/' + CHAINS.length + '</span><span class="k">Chains learned</span></div></div>' +
        '<h2>The chains</h2><div class="list">' + CHAINS.map(function (c, i) {
          var open = i === 0 || s.lesson[CHAINS[i - 1].id];
          return '<button class="item' + (open ? '' : ' locked') + (s.lesson[c.id] ? ' done' : '') + '" data-l="' + i + '"><span class="grow"><span class="t">' + (i + 1) + '. ' + esc(c.t) + '</span></span><span class="end">' + (s.lesson[c.id] ? '✓' : open ? '›' : 'locked') + '</span></button>';
        }).join('') + '</div>';
      $('#ev', v).onclick = eventReplay; $('#ck', v).onclick = checklist;
      $$('[data-l]', v).forEach(function (b) { b.onclick = function () { var i = +b.dataset.l; if (i === 0 || st().lesson[CHAINS[i - 1].id]) lesson(i); }; });
    });
  }
  function lesson(i) {
    var c = CHAINS[i];
    App.screen(c.t, function (v) {
      var order = [0, 1, 2, 3].sort(function () { return Math.random() - .5; });
      v.innerHTML = '<h1>' + esc(c.t) + '</h1><p style="font-size:16px">' + esc(c.hook) + '</p><div class="prose"><ul>' + c.body.map(function (b) { return '<li>' + esc(b) + '</li>'; }).join('') + '</ul></div><h3>Check</h3><p>' + esc(c.q[0]) + '</p><div class="list">' + order.map(function (k) { return '<button class="btn opt" data-k="' + k + '">' + esc(c.q[1][k]) + '</button>'; }).join('') + '</div><div id="fb"></div>';
      var done = false;
      $$('[data-k]', v).forEach(function (b) {
        b.onclick = function () {
          if (done) return; done = true; var ok = +b.dataset.k === 0;
          $$('[data-k]', v).forEach(function (x) { if (+x.dataset.k === 0) x.classList.add('right'); else if (x === b) x.classList.add('wrong'); });
          if (ok) { st().lesson[c.id] = 1; App.S.mkt.xp = (App.S.mkt.xp || 0) + 30; App.save(); }
          $('#fb', v).innerHTML = App.coachHTML(ok ? 'right' : 'wrong', esc(c.q[2])) + '<div class="btns">' + (ok ? '<button class="btn primary" id="nx">' + (i + 1 < CHAINS.length ? 'Next chain' : 'Try Event Replay') + '</button>' : '<button class="btn primary" id="ag">Read again</button>') + '</div>';
          if ($('#nx')) $('#nx').onclick = function () { App.back(); if (i + 1 < CHAINS.length) lesson(i + 1); else eventReplay(); };
          if ($('#ag')) $('#ag').onclick = function () { App.back(); lesson(i); };
        };
      });
    });
  }
  function eventReplay() {
    var s = st(), ev = checkEvents();
    var pool = ev.filter(function (e) { return !s.events[e.id]; }); if (!pool.length) { s.events = {}; pool = ev; }
    var e = pool[Math.floor(Math.random() * pool.length)];
    App.screen('Event Replay', function (v) {
      var i0 = idx(e.s);
      var before = e.opts.map(function (t) { return [NAMES[t] + ' <span class="mute">' + t + '</span>', '<span ' + cls(ret(t, i0, 3)) + '>' + pct(ret(t, i0, 3)) + '</span>', '<span ' + cls(ret(t, i0, 12)) + '>' + pct(ret(t, i0, 12)) + '</span>']; });
      v.innerHTML = '<div class="row"><span class="pill acc">' + esc(e.t) + '</span><span class="pill">' + e.when.replace('-', ' / ') + '</span></div>' +
        '<div class="panel" style="font-size:15px"><span class="eyebrow">The tape</span><p>' + esc(e.story) + '</p></div>' +
        '<p class="small mute">Where things stood going in (returns to ' + e.s + '):</p>' +
        '<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:13px;font-variant-numeric:tabular-nums"><thead><tr><th style="text-align:left;padding:6px;color:var(--mute);border-bottom:1px solid var(--line)">Asset</th><th style="text-align:right;padding:6px;color:var(--mute);border-bottom:1px solid var(--line)">3m</th><th style="text-align:right;padding:6px;color:var(--mute);border-bottom:1px solid var(--line)">12m</th></tr></thead><tbody>' + before.map(function (r) { return '<tr>' + r.map(function (c, k) { return '<td style="padding:6px;border-bottom:1px solid var(--line);text-align:' + (k ? 'right' : 'left') + '">' + c + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table></div>' +
        '<h3>' + esc(e.ask) + '</h3><div class="list">' + e.opts.map(function (t) { return '<button class="btn opt" data-t="' + t + '">' + NAMES[t] + ' <span class="mute">' + t + '</span></button>'; }).join('') + App.idkBtn('t') + '</div><div id="fb"></div>';
      var done = false;
      $$('[data-t]', v).forEach(function (b) {
        b.onclick = function () {
          if (done) return; done = true;
          var ok = b.dataset.t === e.ans, s2 = st(); s2.total++; if (ok) s2.right++; s2.events[e.id] = 1; App.S.mkt.xp = (App.S.mkt.xp || 0) + (ok ? 40 : 10); App.save();
          $$('[data-t]', v).forEach(function (x) { if (x.dataset.t === e.ans) x.classList.add('right'); else if (x === b) x.classList.add('wrong'); });
          var res = e.rs.map(function (r) { return NAMES[r.t] + ' <b ' + cls(r.r) + '>' + pct(r.r) + '</b>'; }).join(' · ');
          $('#fb', v).innerHTML = App.coachHTML(ok ? 'right' : 'wrong', '<b>' + e.s + ' → ' + e.e + ':</b> ' + res + '<br><br>' + esc(e.why)) + '<div class="btns"><button class="btn primary" id="ag">Next event</button><button class="btn" id="dn">Done</button></div>';
          $('#ag').onclick = function () { App.checkpoint(function () { App.back(); eventReplay(); }); };
          $('#dn').onclick = function () { App.back(); };
        };
      });
    });
  }
  function checklist() {
    App.screen('Pre-market checklist', function (v) {
      var items = ['S&P futures: up or down, and by how much?', '10-year yield: higher or lower than yesterday?', 'Dollar index: strengthening or weakening?', 'Oil: any move over 2%?', 'VIX: under 15 (calm), 15–25 (normal), over 25 (stress)?', 'Calendar today: Fed, CPI, jobs, earnings I own?', 'Leadership: which sectors made new highs this week?', 'My book: what hurts most today, and is it sized to survive?', 'Headlines: which of the four dials does each one move? Already priced?'];
      var m = App.S.mkt; m.ckDone = m.ckDone || {}; var today = new Date().toDateString();
      v.innerHTML = '<p class="mute">The thirty-second routine. Run it with any free finance app before the open, tick each item, and write one line in your journal. Do it for 30 days and the market will start to feel readable.</p><div class="list">' + items.map(function (t, i) { return '<label class="item" style="cursor:pointer"><input type="checkbox" data-i="' + i + '"' + (m.ckDone[today] && m.ckDone[today][i] ? ' checked' : '') + '> <span class="grow small">' + esc(t) + '</span></label>'; }).join('') + '</div><p class="small mute" id="cnt"></p>';
      function cnt() { var d = m.ckDone[today] || {}; var n = Object.keys(d).filter(function (k) { return d[k]; }).length; $('#cnt', v).textContent = n + ' of ' + items.length + ' today' + (n === items.length ? '. Routine complete; now the headlines.' : '.'); }
      $$('[data-i]', v).forEach(function (c) { c.onchange = function () { m.ckDone[today] = m.ckDone[today] || {}; m.ckDone[today][c.dataset.i] = c.checked; Object.keys(m.ckDone).forEach(function (k) { if (k !== today) delete m.ckDone[k]; }); App.save(); cnt(); }; });
      cnt();
    });
  }
  return { home: home, lesson: lesson, CHAINS: CHAINS, checklist: checklist, eventReplay: eventReplay, checkEvents: checkEvents, EVENTS: EVENTS };
})();
