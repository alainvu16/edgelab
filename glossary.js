// ===================== GLOSSARY: tap any jargon word for a plain-English meaning =====================
// Terms are underlined automatically in questions, lessons and coach notes (never inside answer buttons, so a tap still answers).
var GL = (function () {
  // [term, aliases (case-sensitive when written in CAPS), area, plain meaning, example]
  var T = [
    // ---- poker: seats ----
    ['UTG', ['UTG', 'under the gun', 'Under the gun'], 'Poker', 'Under the gun: the first player to act before the flop, sitting just left of the big blind. Worst seat, so you play your tightest here.', 'At a 6-player table, UTG opens only about 15% of hands.'],
    ['Button', ['button', 'the button', 'BTN', 'dealer button'], 'Poker', 'The dealer seat. It acts last after the flop, which is the best position at the table.', 'On the button you can play many more hands because you see everyone act first.'],
    ['Cutoff', ['cutoff', 'CO'], 'Poker', 'The seat just right of the button. Second-best position.', 'From the cutoff you can open lots of hands and try to steal the blinds.'],
    ['Hijack', ['hijack', 'HJ'], 'Poker', 'The seat two to the right of the button. Middle-late position.', ''],
    ['Small blind', ['small blind', 'SB'], 'Poker', 'The forced half-bet posted by the player left of the button. Acts first after the flop, so it is a tough seat.', 'Blinds $1/$2: the small blind puts in $1 before cards are dealt.'],
    ['Big blind', ['big blind', 'BB'], 'Poker', 'The forced full bet posted two seats left of the button. Also used as a unit: "100 BB" means 100 big blinds of chips.', 'Blinds $1/$2: the big blind puts in $2.'],
    ['Blinds', ['blinds'], 'Poker', 'The two forced bets (small and big blind) that start every pot so there is something to fight for.', ''],
    ['Position', ['position', 'in position', 'out of position', 'IP', 'OOP'], 'Poker', 'Where you sit relative to the others. "In position" = you act after your opponent (an advantage: you see what they do first). "Out of position" = you act first.', ''],
    ['Early position', ['early position', 'EP'], 'Poker', 'The first seats to act before the flop (UTG and next). Play tight there.', ''],
    ['Late position', ['late position', 'LP'], 'Poker', 'The last seats to act (cutoff and button). You can play more hands there.', ''],
    // ---- poker: streets & actions ----
    ['Preflop', ['preflop', 'pre-flop', 'Preflop'], 'Poker', 'The first betting round, after you get your 2 cards and before any shared cards are dealt.', ''],
    ['Flop', ['flop', 'Flop'], 'Poker', 'The first 3 shared cards, dealt face up in the middle.', ''],
    ['Turn', ['turn card', 'on the turn', 'the turn'], 'Poker', 'The 4th shared card.', ''],
    ['River', ['river', 'River'], 'Poker', 'The 5th and last shared card. After the river betting, hands are shown.', ''],
    ['Board', ['board'], 'Poker', 'The shared cards in the middle that everyone can use.', ''],
    ['Street', ['street', 'streets'], 'Poker', 'One betting round: preflop, flop, turn or river.', ''],
    ['Open / open-raise', ['open-raise', 'open raise', 'open-raising', 'opens'], 'Poker', 'Being the first to raise before the flop (everyone before you folded).', ''],
    ['Limp', ['limp', 'limps', 'limper', 'limping'], 'Poker', 'Just calling the big blind before the flop instead of raising. Usually a weak play.', ''],
    ['3-bet', ['3-bet', '3-bets', '3-betting', 'three-bet'], 'Poker', 'A re-raise before the flop. (The blind is bet 1, the first raise is bet 2, the re-raise is bet 3.)', 'Someone raises to $6, you re-raise to $18: you 3-bet.'],
    ['4-bet', ['4-bet', '4-bets', '4-betting'], 'Poker', 'A re-raise of a 3-bet. Usually a very strong hand or a bold bluff.', ''],
    ['C-bet', ['c-bet', 'continuation bet', 'c-bets'], 'Poker', 'Continuation bet: the player who raised before the flop bets again on the flop, "continuing" the story of a strong hand.', ''],
    ['Check-raise', ['check-raise', 'check-raises'], 'Poker', 'Checking (passing), then raising after your opponent bets. Shows strength or is a bold bluff.', ''],
    ['Value bet', ['value bet', 'value-bet', 'bet for value', 'value'], 'Poker', 'A bet made because you think you have the best hand and want a worse hand to call and pay you.', ''],
    ['Bluff', ['bluff', 'bluffs', 'bluffing'], 'Poker', 'Betting with a weak hand to make a better hand fold.', ''],
    ['Semi-bluff', ['semi-bluff', 'semi-bluffing'], 'Poker', 'Betting with a hand that is behind now but can improve (a draw). Two ways to win: they fold now, or you hit later.', ''],
    ['All-in', ['all-in', 'shove', 'shoves', 'jam'], 'Poker', 'Betting every chip you have.', ''],
    ['Fold equity', ['fold equity'], 'Poker', 'The extra value you get from the chance your opponent folds to your bet.', ''],
    // ---- poker: hands & draws ----
    ['Outs', ['outs', 'out'], 'Poker', 'The unseen cards that would turn your hand into the winner.', 'Four hearts in your hand + board: 9 hearts are left, so 9 outs to make the flush.'],
    ['Draw', ['draw', 'draws', 'drawing'], 'Poker', 'A hand that is not made yet but could become strong with the right card.', ''],
    ['Flush draw', ['flush draw'], 'Poker', 'Four cards of one suit; one more of that suit makes a flush. 9 outs.', ''],
    ['Open-ended straight draw', ['open-ended', 'open-ender', 'OESD'], 'Poker', 'Four cards in a row with both ends open (like 6-7-8-9: a 5 or a 10 completes it). 8 outs.', ''],
    ['Gutshot', ['gutshot', 'gut shot', 'inside straight draw', 'gutter'], 'Poker', 'A straight draw missing one card in the middle (like 5-6-_-8-9, needing a 7). Only 4 outs, so it hits rarely.', 'You hold 9-8 on a 6-5-K board: only a 7 makes your straight. That is a gutshot.'],
    ['Backdoor draw', ['backdoor'], 'Poker', 'A draw that needs BOTH the turn and river to help (like 3 hearts on the flop needing 2 more).', ''],
    ['The nuts', ['the nuts', 'nuts', 'nut flush', 'nut straight'], 'Poker', 'The best possible hand on this board. Nobody can beat it.', ''],
    ['Kicker', ['kicker', 'kickers'], 'Poker', 'Your side card that breaks ties when two players have the same pair.', 'You have A-K, they have A-Q, board has an ace: same pair, your king kicker wins.'],
    ['Set', ['set', 'sets'], 'Poker', 'Three of a kind made with a pair in your hand plus one on the board. Very strong and well hidden.', 'You hold 7-7, the flop has a 7.'],
    ['Trips', ['trips'], 'Poker', 'Three of a kind using a pair on the board plus one card in your hand. Less hidden than a set.', ''],
    ['Overpair', ['overpair'], 'Poker', 'A pocket pair higher than every card on the board.', 'You hold Q-Q on a J-7-3 flop.'],
    ['Top pair', ['top pair'], 'Poker', 'Pairing the highest card on the board.', ''],
    ['Pocket pair', ['pocket pair', 'pocket pairs', 'pocket'], 'Poker', 'Your two private cards are a pair, like 8-8.', ''],
    ['Suited', ['suited', 'offsuit'], 'Poker', 'Suited = your two cards share a suit (written "s", like AKs). Offsuit = different suits ("o").', ''],
    ['Connectors', ['connectors', 'suited connectors'], 'Poker', 'Cards next to each other in rank, like 7-8. They make straights.', ''],
    ['Broadway', ['broadway'], 'Poker', 'The high cards 10, J, Q, K, A. "Broadway straight" = 10 to ace.', ''],
    ['Hole cards', ['hole cards'], 'Poker', 'Your two private cards.', ''],
    ['Dry / wet board', ['dry board', 'wet board', 'dry', 'wet'], 'Poker', 'Dry = few draws possible (like K-7-2 different suits). Wet = many draws (like 9-8-7 with two hearts).', ''],
    ['Texture', ['texture', 'board texture'], 'Poker', 'How the board cards fit together: how many straights, flushes and pairs are possible.', ''],
    ['Coin flip', ['coin flip', 'coinflip', 'flip'], 'Poker', 'A close to 50/50 all-in, like a pair vs two higher cards.', ''],
    ['Cooler', ['cooler'], 'Poker', 'Losing a big pot with a very strong hand to an even stronger one. Nobody played badly.', ''],
    // ---- poker: math & ideas ----
    ['Pot odds', ['pot odds'], 'Poker', 'The price of a call: what you pay versus what you can win. If you must call $20 to win $80, you need to win at least 20 / 100 = 20% of the time.', ''],
    ['Equity', ['equity'], 'Poker', 'Your share of the pot if all cards were dealt out: your chance to win right now.', 'A flush draw on the flop has about 35% equity.'],
    ['Implied odds', ['implied odds'], 'Poker', 'Extra money you expect to win on later streets when you hit your draw, on top of what is in the pot now.', ''],
    ['EV', ['EV', '+EV', '-EV', 'expected value'], 'Poker · Trading', 'Expected value: what a decision earns on average if you repeated it many times. +EV = profitable long-term.', ''],
    ['Range', ['range', 'ranges'], 'Poker', 'All the hands a player could have in a spot, not just one guess.', 'A tight player\'s raise range from UTG: big pairs and strong aces.'],
    ['Combos', ['combos', 'combo', 'combinations'], 'Poker', 'How many card combinations make a hand. Each pocket pair has 6 combos; each unpaired hand like A-K has 16.', ''],
    ['Blockers', ['blocker', 'blockers'], 'Poker', 'Cards in your hand that make some hands impossible for your opponent.', 'Holding the A♥ means nobody else can have the ace-high heart flush.'],
    ['Polarized', ['polarized', 'polar'], 'Poker', 'A betting range made of very strong hands and bluffs, with few medium hands.', ''],
    ['Nit', ['nit', 'nits'], 'Poker', 'A very tight, cautious player who only plays strong hands.', ''],
    ['Calling station', ['calling station', 'station'], 'Poker', 'A player who calls too much and rarely folds. Don\'t bluff them; value bet them.', ''],
    ['TAG / LAG', ['TAG', 'LAG', 'tight-aggressive', 'loose-aggressive'], 'Poker', 'TAG = tight-aggressive: few hands, played hard (the winning default). LAG = loose-aggressive: many hands, played hard.', ''],
    ['Tilt', ['tilt', 'tilted', 'tilting'], 'Poker · Trading', 'Playing worse because you are upset after losses.', ''],
    ['Rake', ['rake'], 'Poker', 'The fee the house takes from each pot.', ''],
    ['ICM', ['ICM'], 'Poker', 'Independent Chip Model: in tournaments, chips are not worth money 1-for-1, so you avoid big risks near the prize places.', ''],
    ['SPR', ['SPR', 'stack-to-pot'], 'Poker', 'Stack-to-pot ratio: chips behind ÷ pot size. Low SPR = you are pot-committed with a good hand.', ''],
    ['Stack', ['stack', 'stacks', 'effective stack'], 'Poker', 'How many chips a player has. "Effective stack" = the smaller of the two stacks, the most that can be won.', ''],
    ['Heads-up', ['heads-up', 'heads up'], 'Poker', 'Just two players in the hand or game.', ''],
    ['Showdown', ['showdown'], 'Poker', 'When players show their cards at the end to see who wins.', ''],
    ['Exploit', ['exploit', 'exploitative', 'exploiting'], 'Poker', 'Changing your play to take advantage of a specific opponent\'s mistakes.', ''],
    ['GTO', ['GTO'], 'Poker', 'Game-theory optimal: a balanced strategy that can\'t be exploited. Exploiting a weak player often wins more.', ''],
    // ---- trading ----
    ['ETF', ['ETF', 'ETFs'], 'Trading', 'Exchange-traded fund: one stock that holds a basket of stocks, like a whole sector.', 'XLK holds the big tech companies.'],
    ['Sector', ['sector', 'sectors'], 'Trading', 'A group of companies in the same business, like tech, energy or banks.', ''],
    ['Momentum', ['momentum'], 'Trading', 'The tendency of things that have been rising to keep rising for a while (and fallers to keep falling).', ''],
    ['Relative strength', ['relative strength', 'RS'], 'Trading', 'How a stock or sector is doing compared with the market. Leaders have high relative strength.', ''],
    ['RSI', ['RSI'], 'Trading', 'Relative Strength Index: a 0 to 100 gauge of how fast price moved recently. Above 70 = stretched up, below 30 = stretched down.', ''],
    ['Moving average', ['moving average', 'moving averages', '200-day', '50-day', '10-month'], 'Trading', 'The average price over the last N days, drawn as a smooth line. Price above it = uptrend.', ''],
    ['Breakout', ['breakout', 'breakouts', 'breaks out'], 'Trading', 'Price pushing above a level where it kept stalling before, often with heavy volume.', ''],
    ['Support / resistance', ['support', 'resistance'], 'Trading', 'Support = a price where buyers kept stepping in. Resistance = a price where sellers kept showing up.', ''],
    ['Volume', ['volume'], 'Trading', 'How many shares traded. Big moves on big volume are more trustworthy.', ''],
    ['Stop-loss', ['stop-loss', 'stop loss', 'stop'], 'Trading', 'A preset price where you sell to cap your loss.', 'Buy at $50 with a stop at $46: the most you lose is $4 a share.'],
    ['Position size', ['position size', 'position sizing', 'sizing'], 'Trading', 'How much you buy. Set it so a hit to your stop loses only a small, fixed slice of your account (like 0.5–1%).', ''],
    ['Drawdown', ['drawdown', 'drawdowns', 'max drawdown'], 'Trading', 'The drop from a peak to a low in your account or a strategy.', ''],
    ['Backtest', ['backtest', 'backtests', 'backtested'], 'Trading', 'Testing a trading rule on past data to see how it would have done.', ''],
    ['Yield', ['yield', 'yields', '10-year yield'], 'Trading', 'The interest rate a bond pays. When yields rise, bond prices fall.', ''],
    ['Yield curve', ['yield curve'], 'Trading', 'A line comparing short-term and long-term interest rates. "Inverted" (short above long) has often come before recessions.', ''],
    ['The Fed', ['the Fed', 'Fed', 'FOMC'], 'Trading', 'The U.S. central bank. It sets short-term interest rates; markets move on its every hint.', ''],
    ['CPI', ['CPI', 'inflation'], 'Trading', 'Consumer Price Index: the main measure of inflation (how fast prices rise).', ''],
    ['Earnings', ['earnings', 'EPS'], 'Trading', 'A company\'s profit. EPS = earnings per share. Stocks jump or drop on earnings vs expectations.', ''],
    ['P/E', ['P/E', 'PE ratio'], 'Trading', 'Price ÷ earnings per share: how many years of today\'s profit you pay for the stock.', ''],
    ['Bull / bear', ['bull market', 'bear market', 'bullish', 'bearish'], 'Trading', 'Bull = rising market or expecting a rise. Bear = falling market or expecting a fall.', ''],
    ['Long / short', ['go long', 'short', 'shorting', 'short selling'], 'Trading', 'Long = you own it and profit if it rises. Short = you borrowed and sold it, profiting if it falls (risky).', ''],
    ['Bid / ask', ['bid', 'ask', 'bid-ask', 'spread'], 'Trading', 'Bid = highest price buyers offer now. Ask = lowest price sellers accept. The gap is the spread.', ''],
    ['Limit order', ['limit order', 'market order'], 'Trading', 'Limit order = buy or sell only at your price or better. Market order = fill right now at whatever price.', ''],
    ['Volatility', ['volatility', 'volatile'], 'Trading', 'How much and how fast a price swings.', ''],
    ['VIX', ['VIX'], 'Trading', 'The "fear gauge": expected stock-market swings over the next month. High VIX = scared market.', ''],
    ['Sharpe ratio', ['Sharpe', 'Sharpe ratio'], 'Trading', 'Return per unit of risk. Higher = smoother gains for the bumps you sit through.', ''],
    ['Rotation', ['rotation', 'sector rotation', 'rotate'], 'Trading', 'Money moving from one group of stocks to another as conditions change.', ''],
    ['Risk-on / risk-off', ['risk-on', 'risk-off'], 'Trading', 'Risk-on = investors buying riskier assets (tech, small caps). Risk-off = fleeing to safety (bonds, gold, utilities).', ''],
    ['Dollar-cost averaging', ['dollar-cost averaging', 'DCA'], 'Trading', 'Investing a fixed amount on a schedule, no matter the price.', ''],
    ['Paper trading', ['paper trade', 'paper trading', 'paperMoney'], 'Trading', 'Practice trading with fake money and real prices (like Schwab thinkorswim paperMoney).', ''],
    ['Options', ['option', 'options', 'call option', 'put option'], 'Trading', 'Contracts giving the right to buy (call) or sell (put) a stock at a set price by a date. Leveraged and risky.', ''],
    ['Leverage', ['leverage', 'leveraged', 'margin'], 'Trading', 'Using borrowed money to make a bigger bet. Magnifies gains AND losses.', ''],
    ['Liquidity', ['liquidity', 'liquid'], 'Trading', 'How easily you can buy or sell without moving the price.', ''],
    // ---- chess ----
    ['Fork', ['fork', 'forks'], 'Chess', 'One piece attacking two targets at once, so the opponent can only save one.', 'A knight checks the king and attacks the queen.'],
    ['Pin', ['pin', 'pinned', 'pins'], 'Chess', 'A piece that can\'t move (or shouldn\'t) because a more valuable piece is behind it.', ''],
    ['Skewer', ['skewer', 'skewers'], 'Chess', 'Like a pin in reverse: a valuable piece is attacked and when it moves, the piece behind it is taken.', ''],
    ['Discovered attack', ['discovered attack', 'discovered check', 'discovery'], 'Chess', 'Moving one piece out of the way to reveal an attack by another.', ''],
    ['Zwischenzug', ['zwischenzug', 'in-between move'], 'Chess', 'An in-between move: instead of the expected recapture, you first play a stronger move (often a check).', ''],
    ['Tempo', ['tempo', 'tempi'], 'Chess', 'A unit of time: one move. Gaining a tempo = making progress while forcing your opponent to respond.', ''],
    ['Castling', ['castle', 'castling', 'castles'], 'Chess', 'A special king-and-rook move that tucks the king into safety and brings the rook toward the center.', ''],
    ['En passant', ['en passant'], 'Chess', 'A special pawn capture right after an enemy pawn moves two squares past yours.', ''],
    ['Endgame', ['endgame', 'endgames'], 'Chess', 'The last phase, with few pieces left. Kings become fighters.', ''],
    ['Opening', ['opening', 'openings'], 'Chess', 'The first moves: develop pieces, control the center, castle.', ''],
    ['Development', ['develop', 'development', 'developing'], 'Chess', 'Moving pieces off their starting squares into active spots.', ''],
    ['Prophylaxis', ['prophylaxis', 'prophylactic'], 'Chess', 'A move that stops your opponent\'s plan before it starts.', ''],
    ['Back-rank mate', ['back-rank', 'back rank'], 'Chess', 'Checkmate on the last row when the king is boxed in by its own pawns.', ''],
    ['Sacrifice', ['sacrifice', 'sac', 'sacrifices'], 'Chess', 'Giving up material on purpose to gain something bigger (attack, mate, position).', ''],
    ['Material', ['material'], 'Chess', 'The value of your pieces (pawn 1, knight/bishop 3, rook 5, queen 9).', ''],
    ['Elo', ['Elo'], 'Chess', 'A rating number for skill. Beginners ~800, club players ~1500, masters 2200+.', ''],
    // ---- xiangqi ----
    ['Palace', ['palace'], 'Xiangqi', 'The 3×3 box marked with an X on each side. The general and advisors must stay inside it.', ''],
    ['Screen', ['screen', 'cannon screen'], 'Xiangqi', 'The one piece a cannon must jump over to capture.', ''],
    ['Flying general', ['flying general'], 'Xiangqi', 'The rule that the two generals may never face each other on an open file.', ''],
    ['Horse leg', ['horse leg', 'hobbling', 'blocked leg'], 'Xiangqi', 'The point next to a horse. If a piece sits there, the horse can\'t jump that way.', '']
  ];
  var byKey = {}, alts = [];
  T.forEach(function (t, i) { t[1].concat([t[0]]).forEach(function (a) { var k = a.toLowerCase(); if (!byKey[k]) { byKey[k] = i; alts.push(a); } }); });
  alts.sort(function (a, b) { return b.length - a.length; });
  function escRe(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
  // ALL-CAPS abbreviations (UTG, BB, CO, EV…) only match in capitals; everything else ignores case. Word edges so "set" doesn't match "settle".
  var CAPS = {}; alts.forEach(function (x) { if (/^[A-Z0-9+\-\/]{2,}$/.test(x)) CAPS[x.toLowerCase()] = x; });
  var RE = new RegExp('(^|[^A-Za-z0-9+\\-])(' + alts.map(escRe).join('|') + ')(?=$|[^A-Za-z0-9])', 'gi');
  // Some words are too common to underline everywhere: only in the matching area's screens.
  var COMMON = { 'turn': 1, 'value': 1, 'stop': 1, 'short': 1, 'set': 1, 'sets': 1, 'out': 1, 'draw': 1, 'draws': 1, 'drawing': 1, 'board': 1, 'river': 1, 'flop': 1, 'range': 1, 'ranges': 1, 'position': 1, 'stack': 1, 'stacks': 1, 'screen': 1, 'material': 1, 'opening': 1, 'openings': 1, 'develop': 1, 'development': 1, 'developing': 1, 'castle': 1, 'castles': 1, 'support': 1, 'resistance': 1, 'volume': 1, 'yield': 1, 'yields': 1, 'option': 1, 'options': 1, 'spread': 1, 'bid': 1, 'ask': 1, 'liquid': 1, 'margin': 1, 'flip': 1, 'wet': 1, 'dry': 1, 'nuts': 1, 'station': 1, 'pocket': 1, 'value bet': 0, 'rotate': 1, 'sector': 1, 'sectors': 1, 'earnings': 1, 'inflation': 1, 'tilt': 1, 'opens': 1, 'shove': 1, 'jam': 1, 'sac': 1, 'pin': 1, 'pins': 1, 'pinned': 1, 'fork': 1, 'forks': 1, 'tempo': 1, 'endgame': 1, 'endgames': 1, 'palace': 1, 'leverage': 1, 'momentum': 1, 'bluff': 1, 'bluffs': 1, 'bluffing': 1, 'equity': 1, 'outs': 1, 'button': 1, 'blinds': 1, 'kicker': 1, 'kickers': 1, 'the turn': 1, 'on the turn': 1 };
  var AREA_OF_TAB = { poker: 'Poker', mkt: 'Trading', chess: 'Chess', xq: 'Xiangqi' };
  var SKIP = 'button,.opt,a,input,textarea,select,.gl,.pill,.crumb,.eyebrow,svg,canvas,.board,.xboard,.table,.mono,code,.hchip,.qod,.game,.dial,#tabs,#top';
  var done = typeof WeakSet !== 'undefined' ? new WeakSet() : null;
  function currentArea() { var t = document.querySelector('#tabs [aria-current="true"]'); return t ? AREA_OF_TAB[t.dataset.tab] || '' : ''; }
  function wrap(root) {
    if (!root || !root.querySelectorAll) return;
    var area = currentArea(), seen = {};
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, { acceptNode: function (n) {
      if (!n.nodeValue || n.nodeValue.length < 2 || (done && done.has(n))) return NodeFilter.FILTER_REJECT;
      var p = n.parentElement; if (!p || p.closest(SKIP)) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT; } });
    var nodes = []; while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(function (n) {
      if (done) done.add(n);
      var text = n.nodeValue, out = [], last = 0, m, hit = false; RE.lastIndex = 0;
      while ((m = RE.exec(text))) {
        var word = m[2], key = word.toLowerCase(), i = byKey[key];
        if (i == null) continue;
        if (CAPS[key] && word !== CAPS[key]) continue;
        var t = T[i];
        if (COMMON[key] && t[2].indexOf(area) < 0) continue;   // e.g. "value" only on poker screens
        if (seen[i]) continue; seen[i] = 1;                     // underline each term once per screen
        var start = m.index + m[1].length;
        out.push(document.createTextNode(text.slice(last, start)));
        var s = document.createElement('span'); s.className = 'gl'; s.dataset.g = i; s.textContent = word; out.push(s);
        last = start + word.length; hit = true;
      }
      if (!hit) return;
      out.push(document.createTextNode(text.slice(last)));
      var f = document.createDocumentFragment(); out.forEach(function (x) { f.appendChild(x); });
      n.parentNode.replaceChild(f, n);
    });
  }
  function gst() { var g = App.S.gloss; if (!g) g = App.S.gloss = { box: {}, tapped: {}, n: 0, ok: 0 }; return g; }
  function show(i) {
    var t = T[i]; if (!t) return;
    try { var g = gst(); g.tapped[i] = Date.now(); g.box[i] = 0; App.save(); } catch (e) {}
    var old = document.getElementById('glpop'); if (old) old.remove();
    var d = document.createElement('div'); d.id = 'glpop'; d.setAttribute('role', 'dialog');
    d.innerHTML = '<div class="row"><span class="pill acc">' + App.esc(t[2]) + '</span><b class="grow" style="font-size:16px">' + App.esc(t[0]) + '</b><button class="btn sm ghost" id="glx" aria-label="Close">✕</button></div><p>' + App.esc(t[3]) + '</p>' + (t[4] ? '<p class="small mute"><b>Example:</b> ' + App.esc(t[4]) + '</p>' : '') + '<button class="btn sm ghost" id="glall">All ' + App.esc(t[2].split(' ')[0].toLowerCase()) + ' words ›</button>';
    document.body.appendChild(d);
    d.querySelector('#glx').onclick = function () { d.remove(); };
    d.querySelector('#glall').onclick = function () { d.remove(); screen(t[2].split(' ')[0]); };
    clearTimeout(show.t); show.t = setTimeout(function () { if (d.parentNode) d.remove(); }, 15000);
  }
  function screen(area) {
    App.screen('Words to know', function (v) {
      var areas = ['Poker', 'Trading', 'Chess', 'Xiangqi'], cur = area || 'Poker';
      v.innerHTML = '<div><span class="eyebrow">Plain-English dictionary</span><h1>Words to know</h1><p class="mute small">Tap any underlined word anywhere in the app to see its meaning. Here is the full list.</p></div><div class="seg" id="gla">' + areas.map(function (a) { return '<button data-a="' + a + '" aria-pressed="' + (a === cur) + '">' + a + '</button>'; }).join('') + '</div><div class="list" id="gll"></div>';
      function list(a) {
        $$('#gla [data-a]', v).forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.a === a); });
        $('#gll', v).innerHTML = T.filter(function (t) { return t[2].indexOf(a) >= 0; }).map(function (t) { return '<div class="panel" style="gap:4px"><b>' + App.esc(t[0]) + '</b><p class="small">' + App.esc(t[3]) + '</p>' + (t[4] ? '<p class="small mute">' + App.esc(t[4]) + '</p>' : '') + '</div>'; }).join('');
      }
      $$('#gla [data-a]', v).forEach(function (b) { b.onclick = function () { list(b.dataset.a); }; });
      list(cur);
    });
  }
  var $ = App.$, $$ = App.$$;
  // ---------- Words to Know drill: learn the jargon for real, with spaced repetition ----------
  var AREAS = ['Poker', 'Trading', 'Chess', 'Xiangqi'];
  function mask(text, t) { var out = text; t[1].concat([t[0]]).sort(function (a, b) { return b.length - a.length; }).forEach(function (a) { out = out.replace(new RegExp(escRe(a), 'gi'), '____'); }); return out; }
  function short(def) { var m = def.match(/^[^.:]*[.:]/); var cut = m ? m[0] : def; return cut.length > 24 ? cut : def; }
  function dueCount() { var g = gst(); return Object.keys(g.tapped).filter(function (i) { return (g.box[i] || 0) < 3; }).length; }
  function mastered(area) { var g = gst(); return T.filter(function (t, i) { return (!area || t[2].indexOf(area) >= 0) && (g.box[i] || 0) >= 3; }).length; }
  function drill(area) {
    App.screen('Words to Know', function (v) {
      var g = gst(), n = 0, N = 10, right = 0, recent = [], focus = area || 'Poker';
      g.mode = g.mode || {};
      function pool() {
        var idx = T.map(function (t, i) { return i; }).filter(function (i) { return T[i][2].indexOf(focus) >= 0 && recent.indexOf(i) < 0; });
        // tapped words first, then the weakest, then new ones in teaching order
        idx.sort(function (a, b) { var ta = g.tapped[a] && (g.box[a] || 0) < 3 ? -5 : 0, tb = g.tapped[b] && (g.box[b] || 0) < 3 ? -5 : 0; return (ta + (g.box[a] || 0) * 2 + a / 1000 + Math.random() * 1.2) - (tb + (g.box[b] || 0) * 2 + b / 1000 + Math.random() * 1.2); });
        return idx;
      }
      function ask() {
        if (n >= N) {
          v.innerHTML = '<div class="panel"><h2>' + right + ' / ' + N + '</h2><p>' + mastered(focus) + ' of ' + T.filter(function (t) { return t[2].indexOf(focus) >= 0; }).length + ' ' + focus.toLowerCase() + ' words mastered (right 3 times, in different ways).</p><div class="btns"><button class="btn primary" id="ag">Another round</button><button class="btn" id="dn">Done</button></div></div>';
          $('#ag', v).onclick = function () { App.checkpoint(function () { App.back(); drill(focus); }); };
          $('#dn', v).onclick = function () { App.checkpoint(App.back); };
          return;
        }
        var p = pool(), i = p[0], t = T[i]; recent.push(i); if (recent.length > 4) recent.shift();
        var same = T.map(function (x, j) { return j; }).filter(function (j) { return j !== i && T[j][2].indexOf(focus) >= 0; });
        // a missed word comes back in a different way than the one you missed
        var modes = ['def', 'term'].concat(t[4] ? ['ex'] : []).filter(function (m) { return m !== g.mode[i]; });
        var mode = (g.box[i] || 0) === 0 && !g.mode[i] ? 'term' : modes[Math.floor(Math.random() * modes.length)];
        var opts, prompt, label;
        if (mode === 'term') {
          // show the word, pick its meaning; wrong meanings chosen close in length so length gives nothing away
          var L = short(t[3]).length;
          var d = same.slice().sort(function (a, b) { return Math.abs(short(T[a][3]).length - L) - Math.abs(short(T[b][3]).length - L) + (Math.random() - .5) * 20; }).slice(0, 3);
          opts = [i].concat(d).map(function (j) { return { j: j, txt: mask(short(T[j][3]), T[j]) }; });
          label = 'What does it mean?'; prompt = App.esc(t[0]);
        } else {
          var d2 = same.sort(function () { return Math.random() - .5; }).slice(0, 3);
          opts = [i].concat(d2).map(function (j) { return { j: j, txt: T[j][0] }; });
          label = mode === 'def' ? 'Which word is this?' : 'Which word fills the blank?';
          prompt = App.esc(mode === 'def' ? mask(t[3], t) : mask(t[4], t));
        }
        opts.sort(function () { return Math.random() - .5; });
        v.innerHTML = '<div class="row"><span class="pill acc">' + (n + 1) + ' / ' + N + '</span><span class="pill">' + focus + '</span><span class="grow"></span><span class="small mute">' + mastered(focus) + ' mastered</span></div>' +
          '<div class="panel"><span class="eyebrow">' + label + '</span><h2 style="font-size:' + (mode === 'term' ? '24px' : '17px;font-weight:600;line-height:1.4') + '">' + prompt + '</h2></div>' +
          '<div class="list">' + opts.map(function (o, k) { return '<button class="btn opt" data-k="' + k + '">' + App.esc(o.txt) + '</button>'; }).join('') + App.idkBtn('k') + '</div><div id="fb"></div>';
        var answered = false;
        $$('[data-k]', v).forEach(function (b) {
          b.onclick = function () {
            if (answered) return; answered = true;
            var o = opts[+b.dataset.k], ok = !!o && o.j === i;
            g.n++; if (ok) { g.ok++; right++; g.box[i] = Math.min(5, (g.box[i] || 0) + 1); delete g.mode[i]; } else { g.box[i] = 0; g.mode[i] = mode; g.tapped[i] = g.tapped[i] || Date.now(); }
            App.save();
            $$('[data-k]', v).forEach(function (x) { var oo = opts[+x.dataset.k]; if (oo && oo.j === i) x.classList.add('right'); else if (x === b) x.classList.add('wrong'); });
            $('#fb', v).innerHTML = App.coachHTML(ok ? 'right' : 'wrong', '<b>' + App.esc(t[0]) + ':</b> ' + App.esc(t[3]) + (t[4] ? '<br><span class="mute">Example: ' + App.esc(t[4]) + '</span>' : '') + (ok ? '' : '<br><span class="small mute">It comes back in a few questions, asked a different way.</span>')) + '<button class="btn primary" id="nx" style="width:100%">Next</button>';
            $('#nx', v).onclick = function () { n++; ask(); };
          };
        });
      }
      v.innerHTML = '<div><span class="eyebrow">Learn the language</span><h1>Words to Know</h1><p class="mute small">Every term the app uses, drilled three ways: word → meaning, meaning → word, and the word in a real example. Words you tap for help or miss come back first. A word is mastered once you get it right 3 times.</p></div>' +
        '<div class="list">' + AREAS.map(function (a) { var tot = T.filter(function (t) { return t[2].indexOf(a) >= 0; }).length; return '<button class="item" data-area="' + a + '"><span class="grow"><span class="t">' + a + ' words</span><br><span class="s">' + mastered(a) + ' of ' + tot + ' mastered</span></span><span class="end">›</span></button>'; }).join('') + '</div>' +
        '<button class="btn ghost" id="glist">Browse the full dictionary</button>';
      $$('[data-area]', v).forEach(function (b) { b.onclick = function () { focus = b.dataset.area; ask(); }; });
      $('#glist', v).onclick = function () { screen(focus); };
      if (area) ask();
    });
  }

  document.addEventListener('click', function (e) { var g = e.target && e.target.closest && e.target.closest('.gl'); if (g) { e.preventDefault(); e.stopPropagation(); show(+g.dataset.g); } }, true);
  var pend = null;
  var obs = new MutationObserver(function () { if (pend) return; pend = setTimeout(function () { pend = null; try { wrap(document.getElementById('view')); wrap(document.getElementById('modal')); } catch (e) {} }, 40); });
  function start() { var m = document.getElementById('main'), md = document.getElementById('modal'); if (m) obs.observe(m, { childList: true, subtree: true, characterData: false }); if (md) obs.observe(md, { childList: true, subtree: true }); wrap(document.getElementById('view')); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else setTimeout(start, 0);
  return { T: T, screen: screen, wrap: wrap, show: show, drill: drill, dueCount: dueCount, mastered: mastered };
})();
