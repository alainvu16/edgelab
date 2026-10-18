// ===================== THINK OUTSIDE THE BOX (all games) =====================
var TH = (function () {
  var $ = App.$, $$ = App.$$, esc = App.esc;
  var PRINCIPLES = [
    { k: 'all', t: 'The habits behind creative play', p: ['Flip the board: before choosing, ask what your opponent wants most. Often the best move is the one that ruins their plan.', 'List every candidate, including the ugly ones. Creative moves hide among the moves you dismiss in the first second.', 'Change the question: instead of “what wins?”, ask “what would make their best move fail?”', 'Look for what is NOT happening: the piece that never moved, the sector ignoring good news, the player who suddenly stopped betting.'] },
    { k: 'chess', t: 'Chess', p: ['Quiet moves: no check, no capture, but a threat they cannot meet.', 'Sacrifices: give material to open the king or gain time. Count the final position, not the pieces you give.', 'In-between moves (zwischenzug): before recapturing, is there a check or bigger threat first?', 'Reverse thinking: if your opponent could move twice, what would they do? Stop that.'] },
    { k: 'xq', t: 'Xiangqi', p: ['Cannons need screens: you can create one by moving any piece, even your own, into the line.', 'The flying-general rule makes your general an attacker: it pins pieces on its file.', 'Sacrificing a chariot for a forced mate is normal at master level.', 'Blocking the horse’s leg or the elephant’s eye shuts down a piece without capturing it.'] },
    { k: 'poker', t: 'Poker', p: ['Think in ranges: not “what does he have?” but “what hands would play this way?”', 'Represent a story: your bets should tell a believable story about a hand you could have.', 'Use the board: scary turn and river cards are chances to bluff, not just reasons to fear.', 'Blockers: holding a key card makes certain hands impossible for them, which changes everything.'] },
    { k: 'mkt', t: 'Markets', p: ['Second-order thinking: everyone knows the news. The question is what is not yet in the price.', 'Inversion: before buying, write down exactly what would make you wrong.', 'Watch reactions, not headlines: a stock that rises on bad news is telling you something.', 'Extremes reverse: when everyone agrees, there is no one left to buy (or sell).'] }
  ];
  // [game, question, options (first correct), why]
  var Q = [
    ['chess', 'Every capture you look at loses material. What should you look for next?', ['A quiet move that creates a threat they can’t stop', 'Resign', 'A random pawn push', 'Trade queens immediately'], 'When forcing moves fail, the strongest moves are often quiet ones: improving a piece, cutting off the king, or creating a second threat.'],
    ['chess', 'You can recapture a piece right away. A stronger player first checks…', ['Whether an in-between check or bigger threat exists', 'The clock', 'Nothing; recapture instantly', 'The opening book'], 'An in-between move (zwischenzug) can win extra material or improve your position before you recapture.'],
    ['chess', 'Your opponent’s last move looks harmless. The best question to ask is…', ['What does it want to do next move?', 'Was it a blunder?', 'Can I copy it?', 'Is it theory?'], 'Every move has a purpose. Finding it lets you stop the plan before it lands.'],
    ['chess', 'A queen sacrifice leads to mate in three. Why do most players miss it?', ['They dismiss moves that lose material before calculating', 'Queens can’t be sacrificed', 'Mate in three is too long to exist', 'Engines hide it'], 'Material bias. Train yourself to calculate forcing sacrifices to the end before rejecting them.'],
    ['chess', 'You are worse. Which mindset gives you the best practical chances?', ['Create complications that make them find hard moves', 'Trade everything', 'Play passively and wait', 'Resign early'], 'When behind, simplicity helps your opponent. Complex positions create chances for mistakes.'],
    ['chess', 'Imagine your opponent could move twice in a row. Why is this useful?', ['It reveals their main threat so you can stop it', 'It is a legal rule', 'It speeds up the game', 'It shows your best move directly'], 'Asking what they would do with a free move exposes the threat you must prevent (prophylaxis).'],
    ['xq', 'Your cannon has no screen to capture through. Creative fix?', ['Move a piece into the line to become the screen', 'Give up the attack', 'Move the cannon backward', 'Trade the cannon'], 'Any piece, yours or theirs, can be a screen. Placing one creates a sudden attack.'],
    ['xq', 'The generals are on the same file with one piece between them. That piece is…', ['Pinned: if it moves, the generals face each other illegally', 'Free to move', 'Captured automatically', 'Protected twice'], 'The flying-general rule turns your general into an attacking piece that pins.'],
    ['xq', 'You can trade your chariot for their horse and force mate in 2. Should you?', ['Yes: mate ends the game; material doesn’t matter', 'No: chariots are worth more', 'Only if the cannon is also lost', 'Never trade chariots'], 'Count the result, not the material. A forced mate is worth any sacrifice.'],
    ['xq', 'Their horse is about to fork two pieces. A quiet way to stop it?', ['Block the horse’s leg point', 'Move both pieces', 'Capture something else', 'Check the general'], 'Horses can be blocked. Occupying the point next to the horse kills that jump without a fight.'],
    ['poker', 'Villain bets the river. Instead of asking “what does he have?”, a pro asks…', ['Which hands in his range would bet this way here?', 'Is he looking at me?', 'Did I get unlucky?', 'What did I have last hand?'], 'Ranges, not single hands. List the value hands and the bluffs, then compare with the price.'],
    ['poker', 'A third heart hits the river. You have no heart, but you bet the flop and turn. Creative play?', ['Bet: you can credibly represent the flush', 'Always check and fold', 'Go all-in every time', 'Show your cards'], 'Scare cards are chances. If your betting story fits a flush, a bet can fold out better hands.'],
    ['poker', 'You hold the A♥ on a board with three hearts. Why can that make a bluff better?', ['You block the nut flush, so they hold it less often', 'It gives you a flush', 'Aces win ties', 'It has no effect'], 'Blockers remove combinations from their range. Holding the A♥ means they can never have the ace-high flush.'],
    ['poker', 'A tight player suddenly raises big. What’s the outside-the-box question?', ['What hands would a tight player raise with here?', 'Is he tilting?', 'Should I always call to test him?', 'What’s my lucky number?'], 'Combine player type and action: tight + big raise means a narrow, strong range. Folding good hands is sometimes the creative play.'],
    ['poker', 'You keep losing small pots by playing honestly. Creative adjustment?', ['Vary your play: sometimes bet strong hands small and bluffs big… against the right opponent', 'Never bluff again', 'Only play aces', 'Call everything'], 'Predictability is exploitable. Mix your sizing and lines so good players can’t read you, but keep it simple against calling stations.'],
    ['mkt', 'Great news comes out and the stock falls. Second-order thinking says…', ['The good news was already priced in, or sellers are in control', 'The market is wrong; buy more', 'It’s random', 'The news must be fake'], 'Prices move on surprises versus expectations. The reaction tells you what the market already believed.'],
    ['mkt', 'Everyone you know is bullish on a stock. What should you consider?', ['Who is left to buy if everyone already owns it?', 'Buying more since everyone agrees', 'Shorting immediately', 'Nothing'], 'Consensus is usually priced in. Extremes of agreement often come near turning points.'],
    ['mkt', 'Before entering a trade, inversion means…', ['Writing down what would prove you wrong and where you’d exit', 'Reversing your position daily', 'Buying the opposite sector', 'Ignoring your stop'], 'Inversion protects you from confirmation bias: decide your exit while you are calm.'],
    ['mkt', 'Rates rise and banks rally. Which creative follow-up idea fits?', ['Check other groups that profit from higher rates, like insurers', 'Buy homebuilders', 'Buy long bonds', 'Sell all stocks'], 'When one beneficiary moves, look for its cousins: the same force often lifts several groups.'],
    ['mkt', 'A sector ignores terrible news and holds steady. What might the tape be saying?', ['Selling is exhausted; the bad news may be priced in', 'It will crash tomorrow', 'Nobody reads news', 'Volume is broken'], 'Resilience to bad news is a classic sign that sellers are done. Watch for a turn.'],
    ['all', 'In any game, the most creative players spend extra time on…', ['Moves and options others dismiss quickly', 'The first move that comes to mind', 'Copying the opponent', 'Speed alone'], 'Creativity is mostly patience: giving “impossible” options one real look before rejecting them.']
  ];
  function st() { var t = App.S.think; if (!t) { App.S.think = t = { n: 0, ok: 0 }; } return t; }
  function home() {
    App.screen('Think outside the box', function (v) {
      var t = st();
      v.innerHTML = '<div><span class="eyebrow">All games</span><h1>Think outside the box</h1><p class="mute small">The habits that find the moves most players never consider, in every game you are training. ' + t.ok + '/' + t.n + ' answered right so far.</p></div>' +
        '<div class="btns"><button class="btn primary" id="q">Creative questions</button><button class="btn" id="cp">Chess: quiet moves &amp; sacrifices</button></div>' +
        PRINCIPLES.map(function (s) { return '<div class="panel" style="gap:6px"><h3>' + esc(s.t) + '</h3><ul style="margin:0;padding-left:18px;display:flex;flex-direction:column;gap:4px">' + s.p.map(function (x) { return '<li class="small">' + esc(x) + '</li>'; }).join('') + '</ul></div>'; }).join('');
      $('#q', v).onclick = quiz;
      $('#cp', v).onclick = function () { CZ.puzzles({ creative: true }); };
    });
  }
  function quiz() {
    App.screen('Creative questions', function (v) {
      var n = 0, right = 0, N = 6, pool = Q.slice().sort(function (a, b) { return (App.recentHas('think', a[1].slice(0, 40)) - App.recentHas('think', b[1].slice(0, 40))) || Math.random() - .5; }); // Oct 18: unseen first
      function ask() {
        if (n >= N) {
          v.innerHTML = '<div class="panel"><h2>' + right + ' / ' + N + '</h2><p>' + (right >= 5 ? 'Sharp. Now use one of these habits in your next game.' : 'Reread the principles; then try again. The questions reshuffle.') + '</p><div class="btns"><button class="btn primary" id="ag">Another round</button><button class="btn" id="dn">Done</button></div></div>' + (typeof WZ !== 'undefined' ? WZ.card('home', true) : '');
          $('#ag', v).onclick = function () { App.checkpoint(function () { App.back(); quiz(); }); };
          $('#dn', v).onclick = function () { App.checkpoint(App.back); };
          return;
        }
        var q = pool[n % pool.length]; App.recentAdd('think', q[1].slice(0, 40), 14); var order = [0, 1, 2, 3].sort(function () { return Math.random() - .5; }), done = false;
        v.innerHTML = '<div class="row"><span class="pill acc">' + (n + 1) + ' / ' + N + '</span><span class="pill">' + { chess: 'Chess', xq: 'Xiangqi', poker: 'Poker', mkt: 'Markets', all: 'All games' }[q[0]] + '</span></div><h2>' + esc(q[1]) + '</h2><div class="list">' + order.map(function (k) { return '<button class="btn opt" data-k="' + k + '">' + esc(q[2][k]) + '</button>'; }).join('') + App.idkBtn('k') + '</div><div id="fb"></div>';
        $$('[data-k]', v).forEach(function (b) {
          b.onclick = function () {
            if (done) return; done = true;
            var ok = +b.dataset.k === 0, t = st(); t.n++; if (ok) { t.ok++; right++; } App.save();
            $$('[data-k]', v).forEach(function (x) { if (+x.dataset.k === 0) x.classList.add('right'); else if (x === b) x.classList.add('wrong'); });
            $('#fb', v).innerHTML = App.coachHTML(ok ? 'right' : 'wrong', esc(q[3])) + '<button class="btn primary" id="nx" style="width:100%">Next</button>';
            $('#nx', v).onclick = function () { n++; ask(); };
          };
        });
      }
      ask();
    });
  }
  if (typeof applyDistract === 'function') applyDistract(Q, 1, 2);
  return { home: home, quiz: quiz, Q: Q };
})();
