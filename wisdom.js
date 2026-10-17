// ===================== WISDOM, LIBRARY, VOCABULARY =====================
var WZ = (function () {
  var $ = App.$, $$ = App.$$, esc = App.esc;
  // Original lines. Each is a small story or image, not a slogan.
  // Original lines. Each is a small story or image with what it means on the board and off it.
  var LINES = {
    win: [
      ['The river never argues with the rock. It goes around, and a thousand years later the rock is sand. Win like water.', 'In the game: when a plan is blocked, don’t force it; find the other route and keep the pressure on. In life: persistence that adapts beats force that insists.'],
      ['A sailor doesn’t take credit for the wind. He takes credit for the sail. Tonight the sail was set right.', 'In the game: separate luck from decisions; a win from good moves is yours, a win from their blunder is weather. In life: own your process, not your fortune.'],
      ['The old blacksmith struck the iron a hundred times and nothing happened. The hundred-and-first blow split it. Everyone called it luck.', 'In the game: the breakthrough comes from the hundred unglamorous reps before it. In life: what looks like sudden success is accumulated effort finally showing.'],
      ['A bamboo spends four years growing roots underground before it shows a single inch. Then it grows ninety feet in six weeks. Your roots are showing.', 'In the game: pattern training feels invisible until one day you see tactics instantly. In life: trust the quiet years; they are the growth.'],
      ['The archer who hits the center does not celebrate. She draws the next arrow exactly the same way. That is the whole secret.', 'In the game: after a win, play the next game with the same care, not with swagger. In life: consistency, not peaks, builds a reputation.'],
      ['The tide that lifted you will go out again. Build the boat while the water is high.', 'In the game: use a winning streak to study, not to coast. In markets: a bull run is when you set risk rules, not when you forget them.'],
      ['A mountain does not move toward the climber. Every step was yours.', 'In the game: nobody gives you rating; you take it one solved puzzle at a time. In life: credit for the climb belongs to the climber.'],
      ['Fire is only dangerous to the person who stops respecting it. Win hungry, not full.', 'In the game: overconfidence after a win is where blunders live. In markets: the biggest losses come right after the biggest wins.'],
      ['The master gardener does not pull on the plant to make it grow. She waters it and waits. You watered today.', 'In the game: you cannot rush skill; you can only show up daily. In life: patience with yourself is a form of discipline.'],
      ['A good knife is not sharp because of one grinding. Tonight was one pass on the stone.', 'In the game: one session is one pass; the edge comes from many. In life: small daily work compounds into something sharp.']
    ],
    loss: [
      ['The oak that refuses to bend meets the storm and breaks. The willow bends to the ground and stands up in the morning. Bend.', 'In the game: a loss you learn from is a bend; a loss you rage at is a break. In life: flexibility is strength that survives.'],
      ['A fisherman who pulls up an empty net learns where the fish are not. That is also a map.', 'In the game: a lost game shows exactly which pattern you don’t own yet. In life: failure is information if you read it.'],
      ['Water does not fight the shape of the glass. It fills it, and when poured out, it is still water. Lose like water.', 'In the game: accept the position you have, not the one you wanted, and keep your identity after a loss. In life: circumstances change your shape, not your substance.'],
      ['The potter keeps the cracked bowl on a shelf, not to mourn it, but so the hands remember.', 'In the game: review your worst move until the hands remember. In life: keep your mistakes close enough to learn from, far enough not to drown in.'],
      ['A fire burns hottest just before it needs more wood. Rest. Then bring the wood.', 'In the game: tilt is a fire running out of fuel; stop, then come back. In life: exhaustion is a signal, not a weakness.'],
      ['The chess master lost a thousand games before anyone called her a master. She counted them as tuition.', 'In the game: losses are the fee for skill; pay it gladly. In life: nobody arrives without a bill.'],
      ['The sea does not hurry. It arrives at every shore regardless.', 'In the game: you don’t need to win tonight; you need to keep moving. In life: steady beats fast over any distance that matters.'],
      ['A stumble in the dark teaches the shape of the room. Tomorrow you walk it without a lamp.', 'In the game: the position that beat you today is the one you recognize tomorrow. In life: discomfort is how new ground becomes familiar.'],
      ['Clay is only clay until it is pressed. Pressure is how the shape arrives.', 'In the game: hard opponents shape you; easy ones leave you clay. In life: seek the pressure that forms you.'],
      ['The eagle is not bothered by the headwind. It is the headwind that lifts it.', 'In the game: resistance is the training. In life: the obstacle is often the lift.']
    ],
    home: [
      ['A candle loses nothing by lighting another candle. Teach what you learn and it doubles.', 'In the game: explain a pattern to someone and you own it. In life: generosity with knowledge costs nothing and returns everything.'],
      ['The farmer who checks the seed every hour harvests nothing. Plant, tend, trust the season.', 'In markets: checking prices every hour is not a strategy. In life: some things only grow unwatched.'],
      ['You cannot step twice into the same market. The water has moved on, and so have you.', 'In markets: yesterday’s setup is gone; read today’s. In life: don’t fight the last battle.'],
      ['A compass is useless to the person who won’t decide where they are going. Decide, then let it correct you.', 'In the game: pick a plan, then adjust; no plan means every move is a guess. In life: direction first, then course corrections.'],
      ['The strongest pieces on the board are the ones that have not moved yet. Patience is a kind of power.', 'In the game: develop, don’t rush; held threats are stronger than spent ones. In life: potential kept in reserve is leverage.'],
      ['A bird does not fear the branch breaking. Its trust is in its wings, not the branch.', 'In markets: trust your rules and sizing, not any single position. In life: build skills, not dependence on circumstances.'],
      ['The man who moves the mountain begins with small stones, and never once looks up to measure.', 'In the game: one puzzle, one lesson, one hand; don’t measure the whole distance daily. In life: big goals are moved in small units.'],
      ['Salt dissolves into the water and seems to vanish. Taste it: nothing was lost. Effort is like that.', 'In the game: training you can’t see is still in you. In life: invisible work is still work.'],
      ['An empty cup can be filled. A cup that believes it is full stays stale. Come to the board empty.', 'In the game: assume you don’t know yet; that is how you learn fast. In life: humility is the door knowledge walks through.'],
      ['The river’s power is not in rushing. It is in never stopping.', 'In the game: daily short sessions beat occasional marathons. In life: continuity is the quiet superpower.'],
      ['A lantern in the fog does not reveal the road. It reveals the next step. That is enough.', 'In the game: you can’t calculate to the end; calculate the next forcing move. In life: clarity about the next step is all you ever need.'],
      ['Still water shows the sky clearly. A racing mind shows nothing. Slow down to see.', 'In the game: before a critical move, breathe; the tactic is already there. In life: calm is where judgment lives.'],
      ['The blade that is never used stays sharp and useless. Use yourself.', 'In the game: knowledge unplayed is not skill. In life: apply what you learn or it is decoration.'],
      ['The crane stands on one leg for hours, not because it is tired, but because it is ready.', 'In poker: folding for an hour is not passivity; it is readiness. In life: stillness can be the most active choice.'],
      ['A kite rises against the wind, never with it. Resistance is the thing that lifts you.', 'In the game: play stronger opponents; losing to them lifts you. In life: choose the harder room.']
    ],
    level: [
      ['A snake sheds its skin not because the skin failed, but because the snake grew. Shed.', 'In the game: the habits that got you here may not get you further; drop them without guilt. In life: outgrowing is not failing.'],
      ['The apprentice sweeps the floor for a year and thinks he has learned nothing. Then one day his hands know the shop in the dark.', 'In the game: drills feel pointless until they become instinct. In life: mastery arrives unannounced, built from boring days.'],
      ['Climb high enough and the path you struggled on looks like a thin line in the grass. Keep climbing. Look back only to remember.', 'In the game: today’s hard puzzle will look easy soon. In life: use the view behind you for gratitude, not for stopping.'],
      ['The bell does not choose when it rings. It is simply ready whenever struck. You are more ready than you were.', 'In the game: preparation is what makes opportunity usable. In life: be ready before you are needed.'],
      ['A seed does not announce the tree. It becomes it.', 'In the game: don’t talk about the rating; earn it. In life: let the result speak.']
    ]
  };
  (function () { var ex = App.X().wisdom || {}; var ex2 = App.X().wisdom2 || {}; Object.keys(ex2).forEach(function (k) { ex[k] = (ex[k] || []).concat(ex2[k]); }); Object.keys(ex).forEach(function (k) { if (LINES[k]) ex[k].forEach(function (q) { LINES[k].push(q); }); }); })();
  var ALLQ = []; Object.keys(LINES).forEach(function (k) { LINES[k].forEach(function (q) { ALLQ.push({ k: k, q: q[0], m: q[1] }); }); });
  function dayIndex() { return Math.floor((Date.now() - new Date().getTimezoneOffset() * 60000) / 86400e3); } // changes at your local midnight
  // The day's line repeats all day so it sinks in; other moments draw at random.
  function pickQ(kind) {
    if (kind === 'home') return ALLQ[dayIndex() % ALLQ.length];
    var a = LINES[kind] || LINES.home, q = a[Math.floor(Math.random() * a.length)];
    return { k: kind, q: q[0], m: q[1] };
  }
  function line(kind) { return pickQ(kind).q; }
  var cardN = 0;
  function card(kind, small) {
    var q = pickQ(kind), id = 'wq' + (++cardN);
    setTimeout(function () { var el = document.getElementById(id); if (!el) return; el.onclick = function () { var m = el.querySelector('.wm'); m.hidden = !m.hidden; }; }, 0);
    return '<div id="' + id + '" class="' + (small ? 'small ' : '') + '" style="border-top:1px solid var(--line);padding-top:10px;max-width:65ch;cursor:pointer"><div class="mute" style="font-style:italic">' + esc(q.q) + '</div><div class="wm small mute" hidden style="margin-top:6px;font-style:normal">' + esc(q.m) + '</div><div class="small mute" style="opacity:.6;margin-top:4px">' + (kind === 'home' ? 'Today’s line · ' : '') + 'tap for the meaning</div></div>';
  }
  function wisdomScreen() {
    App.screen('Words of wisdom', function (v) {
      var today = pickQ('home');
      var groups = [['home', 'For the road'], ['win', 'After a win'], ['loss', 'After a loss'], ['level', 'When you level up']];
      v.innerHTML = '<div><span class="eyebrow">Metaphors of the game and of life</span><h1>Words of wisdom</h1><p class="mute small">One line repeats all day on your home screen. The rest appear after wins, losses and level-ups. Each one carries two readings: what it means on the board, and what it means off it. Read them slowly; let the same line find you more than once.</p></div>' +
        '<div class="panel" style="border-color:var(--accent)"><span class="eyebrow">Today</span><p style="font-style:italic;font-size:16px">' + esc(today.q) + '</p><p class="small">' + esc(today.m) + '</p></div>' +
        groups.map(function (g) { return '<h2>' + g[1] + '</h2><div class="list">' + LINES[g[0]].map(function (q) { return '<div class="panel" style="gap:6px"><p style="font-style:italic">' + esc(q[0]) + '</p><p class="small mute">' + esc(q[1]) + '</p></div>'; }).join('') + '</div>'; }).join('');
    });
  }

  // ---------- library ----------
  // hoopla: confirmed AUDIOBOOK editions (checked Oct 17, 2026), borrow instantly, no waitlist.
  // Libby: not on hoopla as audio; the link searches OverDrive's catalog for audiobook editions and shows libraries that own it.
  var BOOKS = [
    { t: 'The Psychology of Money', a: 'Morgan Housel', h: 19484293, len: '5h 54m', nar: 'Chris Hill', why: 'Short chapters on why smart people do dumb things with money. Easy listen, sticks with you.', tag: 'Start here', area: 'Trading' },
    { t: 'Reminiscences of a Stock Operator', a: 'Edwin Lefèvre', h: 13507032, len: '9h 53m', nar: 'Rick Rohan', why: 'A 1923 novel about a legendary speculator. Every momentum lesson is in here a century early.', tag: 'Start here', area: 'Trading' },
    { t: 'The Daily Trading Coach', a: 'Brett Steenbarger', h: 13753346, len: '14h 21m', nar: 'Joel Pierson', why: '101 short lessons from a trading psychologist. One a day pairs perfectly with the app.', area: 'Trading' },
    { t: 'The Little Book of Market Wizards', a: 'Jack Schwager', h: 14338926, len: '3h 49m', nar: 'Danny Campbell', why: 'The lessons from decades of interviews with the best traders, boiled down. Risk control first, always.', area: 'Trading' },
    { t: 'Dual Momentum Investing', a: 'Gary Antonacci', h: 15640228, len: '6h 4m', nar: 'Bob Johnson', why: 'The blueprint for relative + absolute momentum: the sector rotation you practice in the Momentum Lab.', area: 'Trading' },
    { t: 'Fooled by Randomness', a: 'Nassim Taleb', h: 12162308, len: '10h 7m', nar: 'Sean Pratt', why: 'How luck disguises itself as skill in markets. Makes you humble about short streaks, good and bad.', area: 'Trading' },
    { t: 'A Random Walk Down Wall Street', a: 'Burton Malkiel', h: 16956174, len: '13h 14m', nar: 'George Guidall', why: 'The case against beating the market. Know exactly what your edge has to overcome.', area: 'Trading' },
    { t: 'The Intelligent Investor', a: 'Benjamin Graham', h: 11586379, len: '17h 48m', nar: 'Luke Daniels', why: 'Mr. Market, margin of safety, and the temperament that keeps you solvent.', area: 'Trading' },
    { t: 'The Big Short', a: 'Michael Lewis', h: 18726491, len: '9h 43m', nar: 'Michael Lewis', why: 'A handful of outsiders read the tape everyone else ignored. Second-order thinking as a thriller.', area: 'Trading' },
    { t: 'The Theory of Poker', a: 'David Sklansky', h: 17086234, len: '8h 44m', nar: 'Brian Arens', why: 'The fundamental theorem of poker and the math under every bet you make in the drills.', area: 'Poker' },
    { t: 'Molly’s Game', a: 'Molly Bloom', h: 11587345, len: '8h 29m', nar: 'Cassandra Campbell', why: 'Inside the world’s highest-stakes private games. Reads players, pressure and money up close.', area: 'Poker' },
    { t: 'Searching for Bobby Fischer', a: 'Fred Waitzkin', h: 13482361, len: '8h 44m', nar: 'Lloyd James', why: 'A father on raising a chess prodigy (Josh Waitzkin). What real chess improvement looks and feels like.', area: 'Chess' },
    { t: 'Endgame: Bobby Fischer', a: 'Frank Brady', h: 13486828, len: '13h 30m', nar: 'Ray Porter', why: 'The rise and fall of the greatest natural talent in chess. Genius, obsession and their cost.', area: 'Chess' },
    { t: 'The Queen’s Gambit', a: 'Walter Tevis', h: 12238712, len: '11h 53m', nar: 'Amy Landon', why: 'The novel behind the show. Pattern, practice and nerve, and why you study the classics.', area: 'Chess' },
    // Libby (your library)
    { t: 'The Art of Learning', a: 'Josh Waitzkin', libby: true, why: 'A chess prodigy turned martial-arts champion on how to get good at anything. The closest thing to a manual for this app.', tag: 'Start here', area: 'Mind' },
    { t: 'Thinking in Bets', a: 'Annie Duke', libby: true, why: 'A poker pro on deciding when you can’t know the outcome. Good decisions vs. good results.', tag: 'Start here', area: 'Poker · Trading' },
    { t: 'Trading in the Zone', a: 'Mark Douglas', libby: true, why: 'The mental game of trading: hesitation, revenge trades, thinking in probabilities.', area: 'Trading' },
    { t: 'Market Wizards', a: 'Jack Schwager', libby: true, why: 'The original interviews with the great traders. Many ways to win, one way to lose.', area: 'Trading' },
    { t: 'Thinking, Fast and Slow', a: 'Daniel Kahneman', libby: true, why: 'Why your brain misjudges risk. Even the first third shows you your own mistakes coming.', area: 'Mind' },
    { t: 'Mastery', a: 'Robert Greene', libby: true, why: 'How people became great at a craft, and the stages they all passed through.', area: 'Mind' },
    { t: 'The Inner Game of Tennis', a: 'W. Timothy Gallwey', libby: true, why: 'Get your critical voice out of the way so the trained part of you can perform.', area: 'Mind' }
  ];
  function library() {
    App.screen('Audiobooks', function (v) {
      var done = App.S.books = App.S.books || {};
      function card(b) {
        var key = b.t, fin = !!done[key];
        var link = b.h ? '<a class="btn primary sm" href="https://www.hoopladigital.com/title/' + b.h + '" target="_blank" rel="noopener">Borrow on hoopla</a>'
          : '<a class="btn primary sm" href="https://www.overdrive.com/search?q=' + encodeURIComponent(b.t + ' ' + b.a) + '&f-formatClassification=Audiobook" target="_blank" rel="noopener">Find in Libby</a>';
        return '<div class="panel" style="gap:6px' + (fin ? ';opacity:.6' : '') + '"><div class="row"><h3 class="grow">' + esc(b.t) + '</h3>' + (b.tag ? '<span class="pill acc">' + b.tag + '</span>' : '') + '</div>' +
          '<p class="small mute">' + esc(b.a) + ' · ' + esc(b.area) + (b.len ? ' · ' + b.len + ' · read by ' + esc(b.nar) : '') + '</p><p class="small">' + esc(b.why) + '</p>' +
          '<div class="row">' + link + '<button class="btn sm ghost" data-fin="' + esc(key) + '">' + (fin ? '✓ Finished' : 'Mark finished') + '</button></div></div>';
      }
      var hoop = BOOKS.filter(function (b) { return b.h; }), lib = BOOKS.filter(function (b) { return b.libby; });
      var n = BOOKS.filter(function (b) { return done[b.t]; }).length;
      v.innerHTML = '<div><span class="eyebrow">Listen while you train</span><h1>Audiobooks</h1><p class="mute small">' + n + ' of ' + BOOKS.length + ' finished. Every hoopla title below is a confirmed audiobook edition: tap Borrow, sign in with your library card once, and it plays instantly (no waitlist; most libraries allow several hoopla borrows a month).</p></div>' +
        '<h2>Borrow now on hoopla</h2><div class="list">' + hoop.map(card).join('') + '</div>' +
        '<h2>On Libby, through your library</h2><p class="small mute">These aren’t on hoopla as audio. Find in Libby shows the audiobook edition and which libraries near you own it; add it in the Libby app with your card. Popular titles may have a waitlist, so tap Place hold.</p><div class="list">' + lib.map(card).join('') + '</div>' +
        '<div class="btns"><a class="btn" href="https://www.hoopladigital.com" target="_blank" rel="noopener">Open hoopla</a><a class="btn" href="https://libbyapp.com" target="_blank" rel="noopener">Open Libby</a></div>';
      $$('[data-fin]', v).forEach(function (b) { b.onclick = function () { var k = b.dataset.fin; if (done[k]) delete done[k]; else { done[k] = 1; App.celebrate('level'); } App.save(); App.back(); library(); }; });
    });
  }

  // ---------- vocabulary ----------
  // [word, tier 1-4, plain meaning, example in this world]
  var WORDS = [
    ['volatile', 1, 'changes quickly and unpredictably', 'Energy stocks are volatile: up 5% one day, down 4% the next.'],
    ['liquidity', 1, 'how easily something can be bought or sold without moving the price', 'Apple has deep liquidity; a tiny stock may not.'],
    ['leverage', 1, 'using borrowed money to make a bigger bet', 'Leverage turns a 34% drop into a wipeout.'],
    ['tempo', 1, 'a unit of time in chess: one move', 'Checking the king just to retreat wastes a tempo.'],
    ['variance', 1, 'the normal swings of luck around your true skill', 'Five losses in a row at a 55% win rate is variance, not failure.'],
    ['prudent', 1, 'careful and sensible about risk', 'The prudent sizing was 100 shares, not 500.'],
    ['discipline', 1, 'doing what the plan says even when you feel like doing something else', 'Discipline is selling the sector when the rule says sell.'],
    ['equity', 1, 'your share; in poker, your share of the pot on average', 'With a flush draw you have about 35% equity on the flop.'],
    ['conviction', 2, 'a strong belief that you act on', 'High volume shows conviction behind a breakout.'],
    ['asymmetric', 2, 'unequal on the two sides; small risk for big reward', 'A 1:3 trade is asymmetric: lose one, win three.'],
    ['contrarian', 2, 'going against what the crowd is doing', 'Buying fear is contrarian; momentum is the opposite.'],
    ['capitulation', 2, 'giving up; when the last sellers finally sell in panic', 'Capitulation often marks the bottom, and momentum lags right after.'],
    ['prophylaxis', 2, 'in chess, a move that prevents the opponent’s plan before it starts', 'h3 was prophylaxis: it stopped the bishop pin before it happened.'],
    ['initiative', 2, 'being the one making threats, so the other side must respond', 'Raising keeps the initiative; calling gives it away.'],
    ['expectancy', 2, 'the average amount you win or lose per trade or hand', 'Positive expectancy means the system makes money over many trials.'],
    ['drawdown', 2, 'the drop from a peak to a low in your account', 'A 20% drawdown needs a 25% gain to recover.'],
    ['regime', 2, 'the overall condition the market is in', 'In a risk-off regime, even the best sector tends to fall.'],
    ['sanguine', 2, 'calmly optimistic', 'He stayed sanguine through the losing streak because the process was right.'],
    ['cogent', 2, 'clear, logical and convincing', 'Her case for the trade was cogent: trend, rank, and a tight stop.'],
    ['meticulous', 2, 'extremely careful about details', 'A meticulous journal catches mistakes a memory never will.'],
    ['zugzwang', 3, 'a chess position where any move makes things worse', 'In zugzwang, the duty to move is the losing factor.'],
    ['correlation', 3, 'how much two things move together', 'Ten tech stocks have high correlation; that is weak diversification.'],
    ['mean reversion', 3, 'the tendency of extremes to drift back toward average', 'One-month returns show mean reversion, which is why 12-1 skips them.'],
    ['survivorship bias', 3, 'judging only by the winners that survived, forgetting the failures', 'Backtests on today’s S&P stocks have survivorship bias.'],
    ['overfitting', 3, 'tuning a system so closely to past data that it fails on new data', 'Twelve parameters tuned to 2019 is overfitting.'],
    ['convexity', 3, 'a payoff that grows faster than the input; small downside, large upside', 'Long options have convexity: limited loss, open-ended gain.'],
    ['equanimity', 3, 'mental calm under pressure', 'Equanimity at the table is worth more than any single read.'],
    ['heuristic', 3, 'a rule of thumb that is usually right', 'The 4-and-2 rule is a heuristic for drawing odds.'],
    ['attrition', 3, 'slowly wearing something down', 'The endgame was won by attrition, trading piece after piece.'],
    ['incisive', 3, 'sharp, cutting directly to the point', 'An incisive move changes the whole position at once.'],
    ['pragmatic', 3, 'practical rather than idealistic', 'The pragmatic play was to simplify into a won endgame.'],
    ['erudite', 3, 'having deep knowledge from reading and study', 'The erudite analyst quoted the 1923 crash from memory.'],
    ['ephemeral', 3, 'lasting a very short time', 'Intraday noise is ephemeral; the monthly trend is not.'],
    ['nuance', 3, 'a subtle difference in meaning or quality', 'The nuance between a bluff and a semi-bluff is the draw behind it.'],
    ['sagacious', 4, 'wise through experience and sharp judgment', 'A sagacious trader sizes down before the system tells her to.'],
    ['parsimony', 4, 'extreme simplicity; using as few parts as possible', 'Parsimony in a trading rule is a feature: fewer knobs, less overfitting.'],
    ['stochastic', 4, 'random in a way that can be described by probability', 'Markets are stochastic: you plan for a distribution, not a path.'],
    ['antifragile', 4, 'getting stronger from stress and disorder', 'A position-sized momentum book is antifragile to the small shocks that break leveraged ones.'],
    ['ergodic', 4, 'when the average over time equals the average across many tries; markets usually are not', 'Ruin is why betting is non-ergodic: one zero ends the sequence.'],
    ['perspicacious', 4, 'having keen insight, noticing what others miss', 'The perspicacious player saw the rotation before the ranks confirmed it.'],
    ['intransigent', 4, 'refusing to change a position even when wrong', 'An intransigent trader rides a loser to zero to avoid admitting error.'],
    ['circumspect', 4, 'cautious, considering everything before acting', 'Be circumspect after a big win; that is when sizing creeps up.'],
    ['sinecure', 4, 'a job or position that pays without requiring real work', 'Markets offer no sinecure; the edge must be earned every month.'],
    ['obdurate', 4, 'stubbornly refusing to change one’s mind', 'The obdurate defender missed the drawing line because he wanted to win.'],
    ['magnanimous', 4, 'generous, especially toward a defeated rival', 'Be magnanimous in victory; the same opponent sits across from you next week.'],
    ['propitious', 4, 'favorable; a good time for something', 'A risk-on regime with fresh leadership is the propitious moment for rotation.'],
    ['sine qua non', 4, 'the one essential thing without which nothing works', 'Risk control is the sine qua non of every trading career that lasts.'],
    ['recalcitrant', 4, 'stubbornly uncooperative', 'A recalcitrant position that will not move should be closed, not argued with.']
  ];
  (App.X().vocab || []).forEach(function (wd) { WORDS.push(wd); });
  WORDS.sort(function (a, b) { return a[1] - b[1]; });
  function vst() { var m = App.S; if (!m.vocab) m.vocab = { box: {}, n: 0, tier: 1 }; return m.vocab; }
  function active() {
    var vs = vst(), bx = vs.box;
    var tierWords = WORDS.filter(function (w) { return w[1] <= vs.tier; });
    var base = tierWords.filter(function (w) { return w[1] < vs.tier; });
    var cur = tierWords.filter(function (w) { return w[1] === vs.tier; });
    var k = 4; while (k < cur.length && cur.slice(0, k).every(function (w) { return (bx[w[0]] || 0) >= 2; })) k += 2;
    var act = base.concat(cur.slice(0, k));
    if (k >= cur.length && cur.every(function (w) { return (bx[w[0]] || 0) >= 3; }) && vs.tier < 4) { vs.tier++; App.save(); }
    return act;
  }
  // Three ways to know a word: its meaning, the gap it fills in a sentence, and spotting correct use.
  function blank(w) { var re = new RegExp(w[0].replace(/[.*+?^${}()|[\]\\]/g, '\\$&').split(' ').join('\\s+') + '\\w*', 'i'); return w[3].replace(re, '_____'); }
  function misuse(w, other) { // another word's example with this word swapped in: wrong usage
    var re = new RegExp(other[0].replace(/[.*+?^${}()|[\]\\]/g, '\\$&').split(' ').join('\\s+') + '\\w*', 'i');
    return re.test(other[3]) ? other[3].replace(re, w[0]) : null;
  }
  function vocab() {
    App.screen('Vocabulary', function (v) {
      var vs = vst(), n = 0, total = 10, right = 0, recent = []; vs.ways = vs.ways || {};
      var mastered = WORDS.filter(function (w) { return (vs.box[w[0]] || 0) >= 4; }).length;
      v.innerHTML = '<div class="row"><span class="pill acc">Tier ' + vs.tier + ' of 4</span><span class="pill">' + mastered + ' / ' + WORDS.length + ' mastered</span></div><p class="mute small">Each word comes at you three ways: what it means, where it fits in a sentence, and which sentence uses it correctly. A word is mastered only when you can do all three, and it keeps coming back on a schedule so it sticks.</p><div id="q"></div>';
      function ask() {
        var act = active(), bx = vs.box;
        if (n >= total) {
          $('#q', v).innerHTML = App.coachHTML('right', right + ' of ' + total + '. ' + (right >= 8 ? 'Say one of these words out loud in a sentence today. Spoken once, kept forever.' : 'Reread the example sentences; the context is what makes them stick.')) + card('home', true) + '<div class="btns"><button class="btn primary" id="ag">Another round</button><button class="btn" id="dn">Done</button></div>';
          $('#ag').onclick = function () { App.checkpoint(function () { App.back(); vocab(); }); }; $('#dn').onclick = function () { App.checkpoint(App.back); }; return;
        }
        var dueW = recallDue();
        if (dueW && n % 2 === 0 && act.indexOf(dueW) >= 0) { act.splice(act.indexOf(dueW), 1); act.unshift(dueW); }
        else act.sort(function (a, b) { return (bx[a[0]] || 0) - (bx[b[0]] || 0) + (Math.random() - .5) * 1.6; });
        var fresh = act.filter(function (x) { return recent.indexOf(x[0]) < 0; }); if (fresh.length) act = fresh;
        var w = act[0], b = bx[w[0]] || 0, ways = vs.ways[w[0]] || { m: 0, f: 0, u: 0 };
        recent.push(w[0]); if (recent.length > 3) recent.shift();
        // choose the way: meaning first, then fill-in, then usage; prefer the way least practiced
        var mode = b === 0 ? 'm' : ['m', 'f', 'u'].sort(function (p, q) { return ways[p] - ways[q] + (Math.random() - .5); })[0];
        var dis = WORDS.filter(function (x) { return x !== w && Math.abs(x[1] - w[1]) <= 1; }).sort(function () { return Math.random() - .5; });
        var opts, prompt, label, correct;
        if (mode === 'm') { opts = dis.slice(0, 3).concat([w]).sort(function () { return Math.random() - .5; }).map(function (o) { return { t: o[2], ok: o === w }; }); prompt = esc(w[0]); label = 'What does it mean?'; }
        else if (mode === 'f') { opts = dis.slice(0, 3).concat([w]).sort(function () { return Math.random() - .5; }).map(function (o) { return { t: o[0], ok: o === w }; }); prompt = esc(blank(w)); label = 'Which word fills the gap?'; }
        else {
          var wrong = []; for (var i = 0; i < dis.length && wrong.length < 2; i++) { var mu = misuse(w, dis[i]); if (mu) wrong.push(mu); }
          if (wrong.length < 2) { mode = 'm'; opts = dis.slice(0, 3).concat([w]).sort(function () { return Math.random() - .5; }).map(function (o) { return { t: o[2], ok: o === w }; }); prompt = esc(w[0]); label = 'What does it mean?'; }
          else { opts = wrong.map(function (t) { return { t: t, ok: false }; }).concat([{ t: w[3], ok: true }]).sort(function () { return Math.random() - .5; }); prompt = esc(w[0]) + ' <span class="mute small">(' + esc(w[2]) + ')</span>'; label = 'Which sentence uses it correctly?'; }
        }
        $('#q', v).innerHTML = '<div class="panel"><span class="eyebrow">' + (n + 1) + ' / ' + total + ' · ' + label + '</span><h2 style="font-size:' + (mode === 'f' ? '17px;font-weight:600;line-height:1.4' : '22px') + '">' + prompt + '</h2><p class="small mute">Box ' + b + ' of 4 · meaning ' + ways.m + ' · fill-in ' + ways.f + ' · usage ' + ways.u + '</p></div><div class="list">' + opts.map(function (o, k) { return '<button class="btn opt" data-k="' + k + '" style="text-align:left;font-weight:500">' + esc(o.t) + '</button>'; }).join('') + App.idkBtn('k') + '</div><div id="fb"></div>';
        var done = false;
        $$('[data-k]', v).forEach(function (btn) {
          btn.onclick = function () {
            if (done) return; done = true;
            var ok = !!(opts[+btn.dataset.k] || {}).ok; if (ok) right++;
            if (ok) { ways[mode]++; var allWays = ways.m >= 1 && ways.f >= 1 && ways.u >= 1; bx[w[0]] = Math.min(5, b + 1); if (bx[w[0]] >= 4 && !allWays) bx[w[0]] = 3; }
            else bx[w[0]] = Math.max(0, b - 1);
            vs.ways[w[0]] = ways; vs.n++; vs.seen = vs.seen || {}; vs.seen[w[0]] = Date.now(); App.save();
            $$('[data-k]', v).forEach(function (x) { if ((opts[+x.dataset.k] || {}).ok) x.classList.add('right'); else if (x === btn) x.classList.add('wrong'); });
            $('#fb', v).innerHTML = App.coachHTML(ok ? 'right' : 'wrong', '<b>' + esc(w[0]) + '</b>: ' + esc(w[2]) + '<br><span class="mute">“' + esc(w[3]) + '”</span>' + (mode === 'u' && !ok ? '<br><span class="small mute">The other sentences swapped the word into a context where it doesn’t belong. Meaning first, then the company a word keeps.</span>' : '')) + '<button class="btn primary" id="nx" style="width:100%">Next</button>';
            $('#nx').onclick = function () { n++; ask(); };
          };
        });
      }
      ask();
    });
  }
  // ---------- take it online: milestone nudges ----------
  var ONLINE = {
    chess: { t: 'Take it online', body: 'You are beating bots that play like real club players. Bots are predictable; people are not. Make a free account on <b>lichess.org</b> (no ads, strong puzzles) or <b>chess.com</b> and play 10-minute rapid games. Your real rating will settle within about 20 games. Bring your losses back here: the coach will show you what you missed.', links: ['lichess.org', 'chess.com'] },
    xq: { t: 'Play real people', body: 'You know the pieces and you are beating the mid-level bots. Try <b>xiangqi.com</b> or the <b>Pychess</b> variant site; both have free play against humans. Expect to lose a lot at first; humans use openings the bot never shows you.', links: ['xiangqi.com', 'pychess.org'] },
    poker: { t: 'Sit at a real table (play money)', body: 'Your decisions are grading well against the bots. Next step is humans and real variance: free play-money tables on <b>PokerStars</b> or <b>GGPoker</b> apps, or home games with friends. Keep stakes at zero until your win rate holds for a few thousand hands. Judge yourself by decisions, never by one night.', links: [] },
    mkt: { t: 'Paper trade the rule', body: 'You can read a sector table. Now run the rotation rule in the real world with zero risk: use <b>Schwab’s thinkorswim paperMoney</b> (free with your account, real quotes, fake dollars). On the last trading day of each month, rank the sectors, hold the top three if the market is above trend, and log it in your Market Now journal. Three months of this teaches more than thirty articles.', links: [] }
  };
  function onlineNudge(kind, done) {
    var o = ONLINE[kind], key = 'nudge_' + kind; if (!o || App.S[key]) { if (done) done(); return; }
    App.S[key] = 1; App.save();
    var sheet = App.modal('<div class="grab"></div><span class="eyebrow">Milestone</span><h2>' + o.t + '</h2><p>' + o.body + '</p>' + (o.links.length ? '<p class="small mute">' + o.links.map(function (l) { return '<a href="https://' + l + '" target="_blank" rel="noopener" style="color:var(--accent)">' + l + '</a>'; }).join(' · ') + '</p>' : '') + card('level', true) + '<button class="btn primary" id="nok">Got it</button>', false);
    $('#nok', sheet).onclick = function () { App.closeModal(); if (done) done(); };
  }
  // ---------- spaced recall: a quick pop quiz between games ----------
  function recallDue() {
    var vs = vst(), bx = vs.box, seen = vs.seen || (vs.seen = {}), now = Date.now();
    var gaps = [0, 20 * 60e3, 2 * 3600e3, 12 * 3600e3, 2 * 86400e3, 5 * 86400e3]; // by box: how long before it comes back
    var due = WORDS.filter(function (x) { var b = bx[x[0]] || 0; return b >= 1 && now - (seen[x[0]] || 0) >= gaps[Math.min(b, 5)]; });
    due.sort(function (a, b) { return (bx[a[0]] || 0) - (bx[b[0]] || 0); });
    return due[0] || null;
  }
  function recallModal(done) {
    var w = recallDue(); if (!w) { done(); return; }
    var vs = vst(); vs.seen = vs.seen || {}; vs.seen[w[0]] = Date.now();
    var dis = WORDS.filter(function (x) { return x !== w && Math.abs(x[1] - w[1]) <= 1; }).sort(function () { return Math.random() - .5; }).slice(0, 2);
    var opts = dis.concat([w]).sort(function () { return Math.random() - .5; });
    var sheet = App.modal('<div class="grab"></div><span class="eyebrow">Quick recall · 10 seconds</span><h2>' + esc(w[0]) + '</h2><div class="list">' + opts.map(function (o, k) { return '<button class="btn opt" data-r="' + k + '" style="text-align:left">' + esc(o[2]) + '</button>'; }).join('') + App.idkBtn('r') + '</div><div id="rfb"></div>', false);
    var over = false;
    $$('[data-r]', sheet).forEach(function (b) {
      b.onclick = function () {
        if (over) return; over = true;
        var ok = opts[+b.dataset.r] === w;
        vs.box[w[0]] = ok ? Math.min(5, (vs.box[w[0]] || 0) + 1) : Math.max(1, (vs.box[w[0]] || 1) - 1); App.save();
        $$('[data-r]', sheet).forEach(function (x) { if (opts[+x.dataset.r] === w) x.classList.add('right'); else if (x === b) x.classList.add('wrong'); });
        $('#rfb', sheet).innerHTML = App.coachHTML(ok ? 'right' : 'wrong', (ok ? 'Still yours. ' : 'It slipped, so it comes back sooner. ') + '“' + esc(w[3]) + '”') + '<button class="btn primary" id="rok" style="width:100%">Back to it</button>';
        $('#rok').onclick = function () { App.closeModal(); done(); };
      };
    });
  }
  function dueCount() { var vs = vst(), bx = vs.box, seen = vs.seen || {}, now = Date.now(), gaps = [0, 20 * 60e3, 2 * 3600e3, 12 * 3600e3, 2 * 86400e3, 5 * 86400e3]; return WORDS.filter(function (x) { var b = bx[x[0]] || 0; return b >= 1 && now - (seen[x[0]] || 0) >= gaps[Math.min(b, 5)]; }).length; }
  return { today: function () { return pickQ('home'); }, vst: vst, line: line, card: card, library: library, vocab: vocab, WORDS: WORDS, BOOKS: BOOKS, recallModal: recallModal, recallDue: recallDue, dueCount: dueCount, onlineNudge: onlineNudge, wisdomScreen: wisdomScreen };
})();
