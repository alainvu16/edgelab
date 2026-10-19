// ===================== POKER (Texas Hold'em) =====================
var PK = (function () {
  var $ = typeof App !== 'undefined' ? App.$ : null, $$ = typeof App !== 'undefined' ? App.$$ : null, esc = typeof App !== 'undefined' ? App.esc : function (x) { return x; };
  var SUIT = ['♠', '♥', '♦', '♣'], RCH = { 10: 'T', 11: 'J', 12: 'Q', 13: 'K', 14: 'A' };
  var CAT = ['High card', 'One pair', 'Two pair', 'Three of a kind', 'Straight', 'Flush', 'Full house', 'Four of a kind', 'Straight flush'];
  var CATD = ['no pair, highest card plays', 'two cards of the same rank', 'two different pairs', 'three cards of the same rank', 'five ranks in a row', 'five cards of one suit', 'three of a kind plus a pair', 'all four cards of one rank', 'five in a row, all one suit'];
  function rk(c) { return (c >> 2) + 2; } function su(c) { return c & 3; }
  function rname(r) { return RCH[r] || String(r); }
  function cstr(c) { return rname(rk(c)) + SUIT[su(c)]; }

  // ---------- evaluator: returns comparable number, category = floor(score / 15^5) ----------
  var B = 759375; // 15^5
  function straightHigh(mask) {
    for (var h = 14; h >= 5; h--) { var ok = true; for (var k = 0; k < 5; k++) { var r = h - k; if (r === 1) r = 14; if (!(mask & (1 << r))) { ok = false; break; } } if (ok) return h; }
    return 0;
  }
  function kick(arr) { var s = 0; for (var i = 0; i < 5; i++) s = s * 15 + (arr[i] || 0); return s; }
  function evalHand(cs) {
    var cnt = new Array(15).fill(0), bySuit = [[], [], [], []], mask = 0;
    for (var i = 0; i < cs.length; i++) { var r = rk(cs[i]); cnt[r]++; bySuit[su(cs[i])].push(r); mask |= 1 << r; }
    var fs = -1; for (var s = 0; s < 4; s++) if (bySuit[s].length >= 5) fs = s;
    if (fs >= 0) {
      var fm = 0; bySuit[fs].forEach(function (r) { fm |= 1 << r; });
      var sf = straightHigh(fm); if (sf) return 8 * B + sf;
    }
    var quads = [], trips = [], pairs = [], singles = [];
    for (r = 14; r >= 2; r--) { if (cnt[r] === 4) quads.push(r); else if (cnt[r] === 3) trips.push(r); else if (cnt[r] === 2) pairs.push(r); else if (cnt[r] === 1) singles.push(r); }
    if (quads.length) { var rest = trips.concat(pairs, singles).sort(function (a, b) { return b - a; }); return 7 * B + kick([quads[0], rest[0]]); }
    if (trips.length && (trips.length > 1 || pairs.length)) { var pr = Math.max(trips[1] || 0, pairs[0] || 0); return 6 * B + kick([trips[0], pr]); }
    if (fs >= 0) { var f = bySuit[fs].sort(function (a, b) { return b - a; }); return 5 * B + kick(f.slice(0, 5)); }
    var st = straightHigh(mask); if (st) return 4 * B + st;
    if (trips.length) return 3 * B + kick([trips[0]].concat(singles.slice(0, 2)));
    if (pairs.length >= 2) { var k2 = pairs.slice(2).concat(singles).sort(function (a, b) { return b - a; }); return 2 * B + kick([pairs[0], pairs[1], k2[0]]); }
    if (pairs.length) return 1 * B + kick([pairs[0]].concat(singles.slice(0, 3)));
    return kick(singles.slice(0, 5));
  }
  // Plain-words note on which cards make the hand, and whether they are yours or shared on the board.
  var RNAME = { 2: 'Two', 3: 'Three', 4: 'Four', 5: 'Five', 6: 'Six', 7: 'Seven', 8: 'Eight', 9: 'Nine', 10: 'Ten', 11: 'Jack', 12: 'Queen', 13: 'King', 14: 'Ace' };
  function plural(r) { return RNAME[r] === 'Six' ? 'Sixes' : RNAME[r] + 's'; }
  function bestFiveNote(h, b, c) {
    var all = h.concat(b), best = null, bs = -1;
    for (var i = 0; i < 7; i++) for (var j = i + 1; j < 7; j++) {
      var five = all.filter(function (x, k) { return k !== i && k !== j; }), sc = evalHand(five);
      if (sc > bs) { bs = sc; best = five; }
    }
    var mine = best.filter(function (x) { return h.indexOf(x) >= 0; });
    var cnt = {}; best.forEach(function (x) { cnt[rk(x)] = (cnt[rk(x)] || 0) + 1; });
    var groups = Object.keys(cnt).filter(function (r) { return cnt[r] >= 2; }).map(Number).sort(function (a, z) { return cnt[z] - cnt[a] || z - a; });
    var t = '';
    if (groups.length && c >= 1 && c <= 7 && c !== 4 && c !== 5) {
      var g = groups[0], fromHand = h.filter(function (x) { return rk(x) === g; }).length;
      t = 'Your ' + (c === 2 ? 'pairs are ' + plural(groups[0]) + ' and ' + plural(groups[1]) : c === 6 ? 'full house is ' + plural(g) + ' full of ' + plural(groups[1]) : 'hand is ' + (cnt[g] === 2 ? 'a pair of ' : cnt[g] === 3 ? 'three ' : 'four ') + plural(g)) + '. ';
      if (c === 1 && fromHand === 0) t += 'Both ' + plural(g) + ' are on the board, so everyone shares that pair. ';
    }
    if (c === 0) t = 'Your best card is the ' + RNAME[Math.max.apply(null, best.map(rk))] + '. ';
    if (!mine.length) t += 'Your two cards don’t make it into the best 5: you are playing the board.';
    else if (c >= 1 && c <= 3 && mine.length && mine.every(function (x) { return !groups.length || cnt[rk(x)] === 1; })) t += 'Your ' + mine.map(function (x) { return RNAME[rk(x)]; }).join(' and ') + (mine.length === 1 ? ' only counts as a side card (kicker)' : ' only count as side cards (kickers)') + ' to break ties.';
    return t.trim();
  }
  function cat(score) { return Math.floor(score / B); }
  function deck(exclude) { var d = []; for (var i = 0; i < 52; i++) if (!exclude || exclude.indexOf(i) < 0) d.push(i); return d; }
  function shuffle(a) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }

  // Chen formula: simple preflop strength score (roughly -1..20)
  function chen(h) {
    var a = rk(h[0]), b = rk(h[1]), hi = Math.max(a, b), lo = Math.min(a, b);
    var base = { 14: 10, 13: 8, 12: 7, 11: 6 }[hi] || hi / 2, s;
    if (a === b) { s = Math.max(5, base * 2); return Math.ceil(s); }
    s = base; if (su(h[0]) === su(h[1])) s += 2;
    var gap = hi - lo - 1;
    s -= gap === 0 ? 0 : gap === 1 ? 1 : gap === 2 ? 2 : gap === 3 ? 4 : 5;
    if (gap <= 1 && hi < 12) s += 1;
    return Math.ceil(s);
  }
  function handLabel(h) {
    var a = rk(h[0]), b = rk(h[1]); var hi = Math.max(a, b), lo = Math.min(a, b);
    return rname(hi) + rname(lo) + (a === b ? '' : su(h[0]) === su(h[1]) ? 's' : 'o');
  }

  // equity by Monte Carlo. villainMin = minimum Chen score of villain hands we sample
  // equity(hero, board, iters, villainMin, opps): chance to win against opps random hands (default 1);
  // villainMin (a Chen floor) applies to the first opponent, the one who showed strength
  function equity(hero, board, iters, villainMin, opps) {
    var known = hero.concat(board), d = deck(known), win = 0, tie = 0, n = 0, guard = 0, k = Math.max(1, opps || 1), need = 2 * k + 5 - board.length;
    iters = iters || 600;
    while (n < iters && guard < iters * 20) {
      guard++;
      // partial shuffle
      for (var i = 0; i < need; i++) { var j = i + Math.floor(Math.random() * (d.length - i)); var t = d[i]; d[i] = d[j]; d[j] = t; }
      if (villainMin != null && chen([d[0], d[1]]) < villainMin) continue;
      var bd = board.concat(d.slice(2 * k, need));
      var hs = evalHand(hero.concat(bd)), best = -1;
      for (var o = 0; o < k; o++) { var vs = evalHand([d[2 * o], d[2 * o + 1]].concat(bd)); if (vs > best) { best = vs; } }
      if (hs > best) win++; else if (hs === best) tie++;
      n++;
    }
    return n ? (win + tie / 2) / n : 0.5;
  }
  // outs to a straight-or-better from a hand currently below straight
  function outsInfo(hero, board) {
    var known = hero.concat(board), cur = cat(evalHand(known)), outs = [], fl = 0, stc = 0;
    deck(known).forEach(function (c) {
      var nc = cat(evalHand(known.concat([c])));
      if (nc >= 4 && nc > cur) { outs.push(c); if (nc === 5 || nc === 8) fl++; else if (nc === 4) stc++; }
    });
    return { cur: cur, outs: outs.length, fl: fl, st: stc, list: outs };
  }

  // ---------- hand reading helpers ----------
  function cIn(c) { var red = su(c) === 1 || su(c) === 2; return '<span style="font-weight:700;white-space:nowrap' + (red ? ';color:var(--bad)' : '') + '">' + cstr(c) + '</span>'; }
  function combo(h) { return cIn(h[0]) + ' ' + cIn(h[1]); }
  function allCombos(excl) { var d = deck(excl), out = []; for (var i = 0; i < d.length; i++) for (var j = i + 1; j < d.length; j++) out.push([d[i], d[j]]); return out; }
  // every two-card hand the opponent could hold, and which of them beat you right now
  function beatInfo(hero, board) {
    var hs = evalHand(hero.concat(board)), hc = cat(hs), groups = {}, beat = [], lose = [], tie = 0;
    var cs = allCombos(hero.concat(board));
    cs.forEach(function (v) {
      var vs = evalHand(v.concat(board));
      if (vs > hs) { var vc = cat(vs), key = vc > hc ? CAT[vc] : 'Better ' + CAT[vc].toLowerCase(); groups[key] = (groups[key] || 0) + 1; beat.push(v); }
      else if (vs === hs) tie++; else lose.push(v);
    });
    var g = Object.keys(groups).map(function (k) { return { k: k, n: groups[k] }; }).sort(function (a, b) { return b.n - a.n; });
    return { hc: hc, total: cs.length, beat: beat, lose: lose, tie: tie, groups: g, pct: beat.length / cs.length };
  }
  function nutsInfo(board) {
    var best = -1, nuts = [], all = allCombos(board).map(function (h) { var s = evalHand(h.concat(board)); if (s > best) { best = s; nuts = [h]; } else if (s === best) nuts.push(h); return { h: h, s: s }; });
    return { score: best, cat: cat(best), nuts: nuts, all: all };
  }
  function boardFeatures(b) {
    var sc = [0, 0, 0, 0], rs = {}, ranks = [];
    b.forEach(function (c) { sc[su(c)]++; rs[rk(c)] = (rs[rk(c)] || 0) + 1; ranks.push(rk(c)); });
    var flush = Math.max.apply(null, sc) >= 3, paired = Object.keys(rs).some(function (k) { return rs[k] >= 2; });
    var straight = false, uniq = Object.keys(rs).map(Number); if (rs[14]) uniq.push(1);
    for (var lo = 1; lo <= 10; lo++) { var n = uniq.filter(function (r) { return r >= lo && r <= lo + 4; }).length; if (n >= 3) straight = true; }
    return { flush: flush, paired: paired, straight: straight };
  }
  function checklist(b) {
    var f = boardFeatures(b), parts = [];
    parts.push(f.paired ? 'board is paired, so full houses (and quads) are possible' : 'board is not paired, so no full house is possible');
    parts.push(f.flush ? 'three or more of one suit, so a flush is possible' : 'no three cards of one suit, so no flush');
    parts.push(f.straight ? 'three cards fit inside five ranks, so a straight is possible' : 'no three cards within five ranks, so no straight');
    return 'Checklist: ' + parts.join('; ') + '.';
  }
  function drawInfo(hero, board) {
    var o = outsInfo(hero, board), sc = [0, 0, 0, 0], heroSuit = {};
    hero.concat(board).forEach(function (c) { sc[su(c)]++; }); hero.forEach(function (c) { heroSuit[su(c)] = 1; });
    var fs = sc.indexOf(4), fd = fs >= 0 && heroSuit[fs] && o.fl >= 7;
    var label, n;
    if (o.cur >= 4) { label = 'Already made: ' + CAT[o.cur].toLowerCase(); n = 0; }
    else if (fd && o.st >= 3) { label = 'Flush draw + straight draw (combo)'; n = o.outs; }
    else if (fd) { label = 'Flush draw (9 outs)'; n = o.outs; }
    else if (o.st >= 8) { label = 'Open-ended straight draw (8 outs)'; n = o.st; }
    else if (o.st >= 3) { label = 'Gutshot straight draw (4 outs)'; n = o.st; }
    else { label = 'No real draw'; n = 0; }
    return { o: o, label: label, outs: n, fd: fd, suit: fs };
  }
  function outsText(list) {
    if (!list.length) return 'none';
    var bySuit = [0, 0, 0, 0]; list.forEach(function (c) { bySuit[su(c)]++; });
    var fsuit = bySuit.findIndex(function (n) { return n >= 7; }), parts = [];
    if (fsuit >= 0) parts.push('any ' + SUIT[fsuit] + ' (' + bySuit[fsuit] + ')');
    var rest = list.filter(function (c) { return su(c) !== fsuit; }), byRank = {};
    rest.forEach(function (c) { byRank[rk(c)] = (byRank[rk(c)] || 0) + 1; });
    Object.keys(byRank).sort(function (a, b) { return b - a; }).forEach(function (r) { parts.push(byRank[r] + '× ' + (+r === 10 ? '10' : rname(+r))); });
    return parts.join(', ');
  }
  var READS = [
    ['A tight player raises from early position, then bets big on a K♠ 8♦ 3♣ flop. What is he most likely holding?', ['A strong king or an overpair (AK, KQ, AA, KK)', 'A flush draw', 'A random bluff', 'Small connectors like 6-5'], 'Tight early raisers start with strong hands, and a dry K-high flop hits exactly those. Big bets from tight players mean strength far more often than bluffs.'],
    ['A loose player calls preflop, then check-calls flop and turn as two hearts appear, and bets big when a third heart lands on the river. Most likely?', ['He made the flush', 'He has nothing and is bluffing', 'He has a small pair', 'He has the worst hand possible'], 'Passive calling while hearts come, then sudden aggression when the flush completes, is the classic story of a drawing hand that got there.'],
    ['Villain has checked and called every street. On the river he suddenly raises your bet. What does that usually mean?', ['A very strong hand, often a set or better', 'A bluff', 'A missed draw', 'A medium pair'], 'River raises from a passive player are rarely bluffs. Passive players turn aggressive only with real strength.'],
    ['The board is A♥ A♦ 7♣ 7♠ 2♥. You hold K♠ K♣ and villain bets big. Why is your hand weak here?', ['Any ace or seven beats you, and the board makes your pair a weak two pair', 'Kings are always the best hand', 'Your kings make a full house', 'The board is safe'], 'On a double-paired board everyone has at least two pair. Your kings play as two pair with a king kicker, and any 7 or A in his hand makes a full house.'],
    ['You raise, a nit (super tight player) re-raises you before the flop. His range is roughly?', ['QQ+, AK', 'Any two suited cards', 'Any pair', 'Ace-anything'], 'Nits 3-bet only premiums. Fold most of your hand range and continue with the very top only.'],
    ['The flop is 9♥ 8♥ 7♣. Villain checks, you bet, he check-raises big. What hands make up most of his range?', ['Straights, sets, two pair and big draws', 'Only bluffs', 'Only overpairs', 'Ace-high hands'], 'Connected, two-tone boards hit calling ranges hard. A check-raise here is strong made hands plus strong draws that want to build a pot.'],
    ['A player who bluffs a lot checks to you on the river after betting every earlier street. What does the check most likely mean?', ['He gave up on a bluff or holds a weak showdown hand', 'He holds the nuts', 'He is trapping you', 'Nothing at all'], 'Aggressive players who stop betting usually ran out of story. A thin value bet or a check-back works; big bluffs often get called by his weak pair.'],
    ['Villain limps (just calls the big blind), then calls your raise, then leads out on an A♣ 6♦ 6♥ flop. Most likely?', ['A 6 or a weak ace he wants to protect', 'A flush draw', 'Pocket aces', 'Nothing'], 'Limp-callers rarely hold premiums. Leading on a paired board often means the trip card or a weak ace looking for information.'],
    ['You hold A♠ x on a board with three spades. Villain represents a flush. How does your A♠ change things?', ['It blocks the nut flush, so he holds the very best flush less often', 'It gives you a flush', 'It makes no difference', 'It means he cannot have a flush'], 'A blocker is a card in your hand that removes combinations from his range. Holding the A♠ means he can never have the ace-high flush, which makes bluffs more likely.'],
    ['A tight player calls your flop bet on Q♦ J♦ 4♠ and then checks the turn 2♣. What does his range most likely contain?', ['Medium queens, jacks and diamond draws', 'Sets only', 'Nothing', 'Pocket aces only'], 'Calling then checking marks a medium-strength or drawing hand. Sets and two pair usually raise or bet. Bet again to charge the draws.'],
    ['Villain bets small (1/4 pot) on the river into you. Small river bets most often mean?', ['A weak made hand wanting a cheap showdown, or a blocking bet', 'The nuts', 'A pure bluff', 'A full house'], 'Strong hands want big bets; bluffs need folds, so they bet bigger. Tiny bets often protect a medium hand from facing a bigger bet.'],
    ['Over a long session a player has shown down only premium hands. He suddenly bets big on a scary river card. Your read?', ['Believe him unless you have a very strong hand', 'He is surely bluffing', 'Raise as a bluff', 'Call with any pair'], 'Hand reading starts with the player. Tight, honest players rarely bluff big rivers. Save your calls for the players who do.']
  ];

  // ---------- adaptive drills ----------
  var LV_TYPES = { 1: ['name'], 2: ['name', 'cmp', 'nuts'], 3: ['cmp', 'nuts', 'beats', 'pre'], 4: ['beats', 'draws', 'outs', 'pre'], 5: ['draws', 'outs', 'outcard', 'odds'], 6: ['odds', 'betmath', 'eq', 'texture', 'beats'], 7: ['eq', 'implied', 'betplan', 'range', 'outcard'], 8: ['betplan', 'readrange', 'threebet', 'size', 'betmath'], 9: ['size', 'river', 'readrange', 'implied', 'beats'], 10: ['river', 'icm', 'exploit', 'betplan', 'nuts'], 11: ['threebet', 'river', 'icm', 'exploit', 'concept', 'readrange', 'implied'], 12: ['odds', 'eq', 'range', 'threebet', 'size', 'river', 'icm', 'exploit', 'concept', 'beats', 'betplan', 'readrange', 'implied', 'betmath'] };
  function typesFor(lv) { return LV_TYPES[Math.min(12, lv)] || LV_TYPES[12]; }
  function timerFor(lv) { return lv >= 10 ? Math.max(10, 30 - 4 * (lv - 10)) : 0; }
  var EXTRA_CONCEPTS = (App.X().pokerConcepts || []);
  var TITLES = ['Fish', 'Rec player', 'Regular', 'Grinder', 'Solid reg', 'Shark', 'Crusher', 'High roller', 'Pro', 'Elite', 'Legend', 'Legend+'];
  function title(lv) { return TITLES[Math.min(TITLES.length - 1, lv - 1)]; }

  function rnd(n) { return Math.floor(Math.random() * n); }
  function pick(a) { return a[rnd(a.length)]; }
  function deal(n, excl) { return shuffle(deck(excl)).slice(0, n); }
  function uniq(a) { return a.filter(function (x, i) { return a.indexOf(x) === i; }); }

  var GEN = {
    nuts: function () {
      var n = pick([3, 4, 5]), b = deal(n), info = nutsInfo(b);
      var ans = pick(info.nuts);
      var others = info.all.filter(function (x) { return x.s < info.score; }).sort(function (a, c) { return c.s - a.s; });
      if (others.length < 10 || info.nuts.length > 300) return GEN.nuts();
      var picks = [], seenCat = {};
      for (var i = 0; i < others.length && picks.length < 3; i++) { var o = others[i]; var k = cat(o.s) + ':' + o.s; if (seenCat[k] || Math.random() < 0.6) continue; seenCat[k] = 1; picks.push(o.h); }
      while (picks.length < 3) picks.push(others[rnd(Math.min(80, others.length))].h);
      var opts = shuffle(picks.map(combo).concat([combo(ans)]));
      if (new Set(opts).size < 4) return GEN.nuts();
      return { kind: 'nuts', q: 'What is the best possible hand (the nuts) on this ' + ['', '', '', 'flop', 'turn', 'river'][n] + '? Which hole cards make it?', hero: null, board: b, opts: opts, ans: combo(ans),
        why: 'The nuts here is <b>' + CAT[info.cat].toLowerCase() + '</b>, made by ' + combo(ans) + (info.nuts.length > 1 ? ' (' + info.nuts.length + ' combinations make it)' : '') + '. ' + checklist(b) + ' Always know the nuts: it tells you what a big bet can represent.' };
    },
    beats: function () {
      for (var t = 0; t < 60; t++) {
        var h = deal(2), b = deal(pick([3, 4]), h), bi = beatInfo(h, b);
        if (bi.hc < 1 || bi.pct < 0.01 || bi.pct > 0.6 || bi.lose.length < 3) continue;
        var ans = pick(bi.beat), wrong = shuffle(bi.lose.slice()).slice(0, 3);
        var opts = shuffle(wrong.map(combo).concat([combo(ans)]));
        var top = bi.groups.slice(0, 4).map(function (g) { return g.k.toLowerCase() + ' (' + g.n + ')'; }).join(', ');
        return { kind: 'beats', q: 'You have ' + CAT[bi.hc].toLowerCase() + '. Which of these hands is beating you right now?', hero: h, board: b, opts: opts, ans: combo(ans),
          why: combo(ans) + ' makes ' + CAT[cat(evalHand(ans.concat(b)))].toLowerCase() + '. Hands that beat you now: ' + top + ' — ' + bi.beat.length + ' of ' + bi.total + ' possible hands (' + Math.round(bi.pct * 100) + '%). Reading hands means listing what beats you, then asking which of those your opponent would play this way.' };
      }
      return GEN.name();
    },
    draws: function () {
      var targets = ['Flush draw (9 outs)', 'Open-ended straight draw (8 outs)', 'Gutshot straight draw (4 outs)', 'Flush draw + straight draw (combo)', 'No real draw'];
      var want = pick(targets), d, h, b;
      for (var t = 0; t < 3000; t++) { h = deal(2); b = deal(3, h); d = drawInfo(h, b); if (d.o.cur <= 2 && d.label === want) break; }
      if (d.label !== want || d.o.cur > 2) { for (var t2 = 0; t2 < 500; t2++) { h = deal(2); b = deal(3, h); d = drawInfo(h, b); if (d.o.cur <= 2 && targets.indexOf(d.label) >= 0) break; } }
      if (targets.indexOf(d.label) < 0) return GEN.outs();
      var opts = shuffle(shuffle(targets.filter(function (x) { return x !== d.label; })).slice(0, 3).concat([d.label]));
      var why = { 'Flush draw (9 outs)': 'Four cards of one suit: 13 in the suit minus the 4 you see leaves 9 to complete it.', 'Open-ended straight draw (8 outs)': 'Four in a row, open at both ends: two ranks finish it, 4 cards each = 8.', 'Gutshot straight draw (4 outs)': 'One rank missing from the middle of the straight: only those 4 cards fill it.', 'Flush draw + straight draw (combo)': 'Both draws at once. Combo draws often have 12–15 outs and are favorites against one pair.', 'No real draw': 'No four-to-a-flush and no four-to-a-straight. Backdoor draws (needing two perfect cards) are worth little.' }[d.label];
      return { kind: 'draws', q: 'What draw do you have?', hero: h, board: b, opts: opts, ans: d.label,
        why: why + (d.outs ? ' Your outs: ' + outsText(d.o.list) + ' = ' + d.o.outs + ' cards. Rule of 4 and 2: ≈' + Math.min(100, d.o.outs * 4) + '% by the river, ≈' + d.o.outs * 2 + '% on the next card.' : '') };
    },
    outcard: function () {
      for (var t = 0; t < 2000; t++) {
        var h = deal(2), b = deal(3, h), o = outsInfo(h, b);
        if (o.cur >= 4 || o.outs < 4 || o.outs > 15) continue;
        var outCard = pick(o.list), known = h.concat(b), blanks = shuffle(deck(known).filter(function (c) { return o.list.indexOf(c) < 0; })).slice(0, 3);
        var opts = shuffle(blanks.concat([outCard]).map(cIn));
        return { kind: 'outcard', q: 'Which turn card completes a straight or better for you?', hero: h, board: b, opts: opts, ans: cIn(outCard),
          why: cIn(outCard) + ' makes ' + CAT[cat(evalHand(known.concat([outCard])))].toLowerCase() + '. All your outs: ' + outsText(o.list) + ' (' + o.outs + ' cards). Train your eye to scan each rank and each suit for the cards that finish your hand.' };
      }
      return GEN.outs();
    },
    betmath: function () {
      var v = pick(['size', 'bluff', 'pot', 'mdf']), P = (3 + rnd(28)) * 10;
      var FR = [[1 / 3, 'one-third'], [1 / 2, 'half'], [2 / 3, 'two-thirds'], [3 / 4, 'three-quarters'], [1, 'full'], [1.5, '1.5×']];
      if (v === 'size') {
        var f = pick(FR.slice(0, 5)), ans = Math.round(P * f[0]);
        var opts = uniq(FR.map(function (x) { return '$' + Math.round(P * x[0]); })).filter(function (x) { return x !== '$' + ans; });
        opts = shuffle(shuffle(opts).slice(0, 3).concat(['$' + ans]));
        return { kind: 'betmath', q: 'Pot is <b>$' + P + '</b>. You want to bet ' + f[1] + ' pot. How much?', hero: null, board: null, opts: opts, ans: '$' + ans,
          why: f[1] + ' of $' + P + ' = $' + ans + '. Quick trick: halve the pot first ($' + Math.round(P / 2) + '), then adjust up or down. Fast sizing means your bets carry no hesitation tells.' };
      }
      if (v === 'bluff' || v === 'mdf') {
        var f2 = pick(FR), B = Math.round(P * f2[0]);
        var be = B / (P + B), mdf = P / (P + B);
        var val = v === 'bluff' ? be : mdf;
        var table = FR.map(function (x) { return Math.round(100 * (v === 'bluff' ? x[0] / (1 + x[0]) : 1 / (1 + x[0]))) + '%'; });
        var a2 = Math.round(100 * val) + '%', o2 = shuffle(shuffle(uniq(table).filter(function (x) { return x !== a2; })).slice(0, 3).concat([a2]));
        return { kind: 'betmath', q: v === 'bluff' ? 'You bluff <b>$' + B + '</b> into a <b>$' + P + '</b> pot. How often must they fold for the bluff to break even?' : 'They bet <b>$' + B + '</b> into <b>$' + P + '</b>. How often must you continue (call or raise) so their bluffs can’t profit automatically?', hero: null, board: null, opts: o2, ans: a2,
          why: v === 'bluff' ? 'Risk ÷ (risk + reward) = $' + B + ' ÷ $' + (P + B) + ' ≈ ' + a2 + '. Bigger bluffs need more folds: 1/3 pot needs 25%, half pot 33%, pot-size 50%.' : 'Minimum defense = pot ÷ (pot + bet) = $' + P + ' ÷ $' + (P + B) + ' ≈ ' + a2 + '. Fold more than that and any two cards bluff you profitably. Against players who rarely bluff, fold more anyway.' };
      }
      var B2 = Math.round(P * pick([.5, .66, .75, 1])), pot = P + 2 * B2;
      var o3 = shuffle(uniq(['$' + pot, '$' + (P + B2), '$' + (P + 3 * B2), '$' + (2 * P + B2)]));
      return { kind: 'betmath', q: 'Pot is <b>$' + P + '</b>. They bet <b>$' + B2 + '</b> and you call. How big is the pot now?', hero: null, board: null, opts: o3, ans: '$' + pot,
        why: 'Pot $' + P + ' + their $' + B2 + ' + your $' + B2 + ' = $' + pot + '. Track the pot every street; every bet size and price depends on it.' };
    },
    implied: function () {
      for (var t = 0; t < 200; t++) {
        var D = pick([[9, 'flush draw'], [8, 'open-ended straight draw'], [4, 'gutshot']]), P = (2 + rnd(9)) * 10, B = Math.round(P * pick([.5, .66, .75, 1]) / 5) * 5;
        var e = D[0] / 47, W0 = P + B, need = B / (W0 + B), X = (1 - e) * B / e - W0;
        if (X < 15 || X > 600 || e >= need) continue;
        var ans = Math.round(X / 5) * 5, cand = uniq([ans, Math.round(ans * .4 / 5) * 5, Math.round(ans * 1.8 / 5) * 5, Math.round(ans * 3 / 5) * 5]).filter(function (x) { return x > 0; });
        if (cand.length < 4) continue;
        var opts = shuffle(cand.map(function (x) { return '$' + x; }));
        return { kind: 'implied', q: 'Flop. Pot <b>$' + P + '</b>, they bet <b>$' + B + '</b>. You have a ' + D[1] + ' (' + D[0] + ' outs ≈ ' + Math.round(e * 100) + '% on the turn). The price is too high on its own. About how much more must you win later, when you hit, to make calling right?', hero: null, board: null, opts: opts, ans: '$' + ans,
          why: 'Now: risk $' + B + ' to win $' + W0 + ', which needs ' + Math.round(need * 100) + '%; you have ' + Math.round(e * 100) + '%. Break-even when ' + Math.round(e * 100) + '% × ($' + W0 + ' + extra) = ' + Math.round((1 - e) * 100) + '% × $' + B + ', so extra ≈ $' + ans + '. That’s implied odds: call only if they have the chips and the habit of paying you off.' };
      }
      return GEN.odds();
    },
    betplan: function () {
      for (var t = 0; t < 400; t++) {
        var h = deal(2), b = deal(3, h), d = drawInfo(h, b), e = equity(h, b, 500), draw = d.fd || d.o.st >= 8, cls = null;
        if (d.o.cur >= 4) { if (e > 0.75) cls = 'v'; }
        else if (e >= 0.72) cls = 'v';
        else if (draw && e < 0.58) cls = 's';
        else if (!draw && e >= 0.47 && e < 0.62) cls = 'c';
        else if (!draw && e < 0.32 && d.o.st < 3) cls = 'g';
        if (!cls) continue;
        var L = { v: 'Bet for value', s: 'Semi-bluff: bet with your draw', c: 'Check to keep the pot small', g: 'Give up: check, fold to a bet' };
        var why = { v: 'You win about ' + Math.round(e * 100) + '% against a random hand: you are usually ahead, so bet and let worse hands pay you. Checking gives free cards to draws.', s: 'You have a real draw (' + d.label.toLowerCase() + ', ' + d.o.outs + ' outs) but are behind now (' + Math.round(e * 100) + '%). Betting wins immediately when they fold, and you can still hit when they call: two ways to win.', c: 'About ' + Math.round(e * 100) + '%: a medium hand that beats bluffs but loses to strong hands. Betting folds out worse and gets called by better. Check, keep the pot small, and call reasonable bets.', g: 'Only ' + Math.round(e * 100) + '% with no draw. Bluffing here needs a good story and a folder across the table; against most players, check and let it go.' }[cls];
        return { kind: 'betplan', q: 'You are first to act on the flop, heads-up. What is the best plan with this hand?', hero: h, board: b, opts: shuffle([L.v, L.s, L.c, L.g]), ans: L[cls], why: why + ' ' + d.label + '.' };
      }
      return GEN.size();
    },
    readrange: function () {
      var r = pick(READS);
      return { kind: 'readrange', q: r[0], hero: null, board: null, opts: shuffle(r[1].slice()), ans: r[1][0], why: r[2] + ' Reading hands = start from the player type, then narrow with every action.' };
    },
    name: function () {
      var h = deal(2), b = deal(5, h), c = cat(evalHand(h.concat(b)));
      var opts = uniq([c, Math.max(0, c - 1), Math.min(8, c + 1), rnd(7)]);
      while (opts.length < 4) opts = uniq(opts.concat([rnd(9)]));
      opts = shuffle(opts.slice(0, 4));
      return { kind: 'name', q: 'What is your best hand?', hero: h, board: b, opts: opts.map(function (o) { return CAT[o]; }), ans: CAT[c],
        why: 'You have <b>' + CAT[c].toLowerCase() + '</b>: ' + CATD[c] + '. ' + (bestFiveNote(h, b, c) ? bestFiveNote(h, b, c) + ' ' : '') + 'You always use the best 5 cards out of your 2 plus the 5 on the board.' };
    },
    cmp: function () {
      var h = deal(2), v = deal(2, h), b = deal(5, h.concat(v));
      var hs = evalHand(h.concat(b)), vs = evalHand(v.concat(b));
      var ans = hs > vs ? 'You win' : hs < vs ? 'They win' : 'Split pot';
      var why = 'You have ' + CAT[cat(hs)].toLowerCase() + ', they have ' + CAT[cat(vs)].toLowerCase() + '. ';
      if (cat(hs) === cat(vs)) why += hs === vs ? 'Same five best cards, so the pot is split.' : 'Same hand type, so the higher cards (kickers) decide it.';
      else why += 'Higher hand type wins.';
      return { kind: 'cmp', q: 'Who wins at showdown?', hero: h, vill: v, board: b, opts: ['You win', 'They win', 'Split pot'], ans: ans, why: why };
    },
    pre: function () {
      var POS = [['UTG', 9, 'first to act, five players behind you'], ['Hijack', 8, 'four players still to act'], ['Cutoff', 7, 'only three players left behind you'], ['Button', 6, 'you act last after the flop, the best seat'], ['Small blind', 7, 'you’re out of position after the flop']];
      var p = pick(POS), h = deal(2), c = chen(h);
      if (Math.abs(c - p[1]) > 4 && Math.random() < .6) { h = deal(2); c = chen(h); }
      var ans = c >= p[1] ? 'Raise' : 'Fold';
      return { kind: 'pre', q: '6-handed, everyone folds to you in <b>' + p[0] + '</b>. Raise or fold?', hero: h, board: [], opts: ['Raise', 'Fold'], ans: ans,
        why: handLabel(h) + ' scores ' + c + ' on the Chen scale (pairs, high cards, suited and connected cards score higher). From ' + p[0] + ' (' + p[2] + ') a good rule is to raise ' + p[1] + '+. ' + (ans === 'Raise' ? 'Strong enough: raise.' : 'Too weak here: fold and wait for a better spot.') };
    },
    outs: function () {
      for (var t = 0; t < 400; t++) {
        var h = deal(2), b = deal(3, h), o = outsInfo(h, b);
        if (o.cur < 4 && o.outs >= 4 && o.outs <= 15) {
          var opts = uniq([o.outs, o.outs + 2, Math.max(1, o.outs - 2), o.outs + 4, Math.max(1, o.outs - 4), o.outs + 1]).slice(0, 4);
          opts = shuffle(opts).map(String);
          var type = o.fl && o.st ? 'a flush draw and a straight draw (a combo draw)' : o.fl ? 'a flush draw: 13 cards per suit minus the 4 you see leaves 9' : o.st >= 8 ? 'an open-ended straight draw: two ranks complete it, 4 cards each' : 'a gutshot straight draw: one rank fills the gap, 4 cards';
          return { kind: 'outs', q: 'How many outs do you have to make a straight or better?', hero: h, board: b, opts: opts, ans: String(o.outs),
            why: 'You have ' + type + '. That gives <b>' + o.outs + ' outs</b>. Rule of 4 and 2: on the flop, outs × 4 ≈ your % to hit by the river (' + Math.min(100, o.outs * 4) + '%); with one card to come, outs × 2 (' + o.outs * 2 + '%).' };
        }
      }
      return GEN.name();
    },
    odds: function () {
      for (var t = 0; t < 400; t++) {
        var h = deal(2), b = deal(4, h), o = outsInfo(h, b);
        if (o.cur < 4 && o.outs >= 4 && o.outs <= 15) {
          var pot = (2 + rnd(19)) * 10, bet = Math.round(pot * pick([.33, .5, .75, 1, 1.5]));
          var need = bet / (pot + 2 * bet), eq = o.outs / 46;
          if (Math.abs(eq - need) < .03) continue;
          var ans = eq >= need ? 'Call' : 'Fold';
          return { kind: 'odds', q: 'Turn. Pot is <b>$' + pot + '</b>, they bet <b>$' + bet + '</b>. You have a draw. Call or fold?', hero: h, board: b, opts: ['Call', 'Fold'], ans: ans,
            why: 'You need to put in $' + bet + ' to win $' + (pot + 2 * bet) + ', so you need to win at least <b>' + Math.round(need * 100) + '%</b> of the time. You have ' + o.outs + ' outs with one card to come ≈ <b>' + Math.round(eq * 100) + '%</b> (outs × 2). ' + (ans === 'Call' ? 'Your chance beats the price: call.' : 'The price is too high for your chance: fold.') };
        }
      }
      return GEN.pre();
    },
    eq: function () {
      var h = deal(2), b = deal(3, h), e = equity(h, b, 1500);
      var buckets = ['Under 30%', '30–50%', '50–70%', 'Over 70%'], i = e < .3 ? 0 : e < .5 ? 1 : e < .7 ? 2 : 3;
      return { kind: 'eq', q: 'Against one random hand, how often do you win from here?', hero: h, board: b, opts: buckets, ans: buckets[i],
        why: 'About <b>' + Math.round(e * 100) + '%</b>. You have ' + CAT[cat(evalHand(h.concat(b)))].toLowerCase() + ' right now' + (outsInfo(h, b).outs >= 4 ? ', plus a draw' : '') + '. Any pair is usually ahead of a random hand; top pair or better is strong; nothing at all is usually under 40%.' };
    },
    texture: function () {
      var b = deal(3), info = texture(b);
      var opts = ['Wet: many draws, bet bigger or check', 'Dry: few draws, small bets work', 'Paired: pairs beat most hands', 'Monotone: flush already possible'];
      var ans = info.mono ? opts[3] : info.paired ? opts[2] : info.wet ? opts[0] : opts[1];
      return { kind: 'texture', q: 'Read the flop. What kind of board is this?', hero: null, board: b, opts: shuffle(opts.slice()), ans: ans,
        why: info.why + ' Wet boards favor big bets or checks because many turn cards change who is ahead; dry boards let a small bet do the job.' };
    },
    range: function () {
      var seats = [['UTG', 9, 'tight: roughly the top 15% of hands'], ['Hijack', 8, 'about the top 20%'], ['Cutoff', 7, 'about the top 27%'], ['Button', 5, 'wide: 45% or more, because you act last'], ['Small blind', 6, 'wide-ish, but you are out of position after the flop']];
      var s = pick(seats), hands = [], labels = {};
      for (var t = 0; t < 200 && hands.length < 4; t++) { var h = deal(2); var L = handLabel(h); if (labels[L]) continue; labels[L] = 1; hands.push(h); }
      var scores = hands.map(function (h) { return chen(h); });
      var opens = hands.filter(function (h, i) { return scores[i] >= s[1]; }), folds = hands.filter(function (h, i) { return scores[i] < s[1]; });
      var askOpen = opens.length === 1 || (folds.length !== 1 && Math.random() < .5);
      if (opens.length !== 1 && folds.length !== 1) return GEN.pre();
      var target = askOpen ? opens[0] : folds[0];
      return { kind: 'range', q: 'Folded to you in <b>' + s[0] + '</b> (6-max). Which of these hands is the ' + (askOpen ? 'only one worth opening' : 'one you should fold') + '?', hero: null, board: null, opts: hands.map(handLabel), ans: handLabel(target),
        why: s[0] + ' opens ' + s[2] + '. Chen scores here: ' + hands.map(function (h, i) { return handLabel(h) + '=' + scores[i]; }).join(', ') + '; the cutoff for this seat is about ' + s[1] + '. Pairs, big cards, suited and connected hands score higher.' };
    },
    threebet: function () {
      var h = deal(2), c = chen(h), pos = pick([['Button', 'cutoff'], ['Big blind', 'button'], ['Cutoff', 'hijack']]);
      var ans = c >= 10 ? '3-bet' : (c >= 6 || (su(h[0]) === su(h[1]) && Math.max(rk(h[0]), rk(h[1])) >= 12)) ? 'Call' : 'Fold';
      if (pos[0] === 'Big blind' && ans === 'Fold' && c >= 4) ans = 'Call';
      return { kind: 'threebet', q: 'The <b>' + pos[1] + '</b> opens to 2.5bb. You are in the <b>' + pos[0] + '</b>. What now?', hero: h, board: [], opts: ['3-bet', 'Call', 'Fold'], ans: ans,
        why: handLabel(h) + ' (Chen ' + c + '). Premiums (QQ+, AK, AQs: Chen 10+) 3-bet for value. Medium pairs, suited broadways and suited connectors call to see a flop' + (pos[0] === 'Big blind' ? ', and the big blind defends wider because you already have money in' : '') + '. Weak offsuit hands fold; against a late-position open you can also 3-bet some of them as bluffs, but master the value game first.' };
    },
    size: function () {
      var b = deal(3), info = texture(b), spot = pick(['cbet', 'value', 'bluff']);
      var q, ans, why, opts = ['Small (1/3 pot)', 'Medium (2/3 pot)', 'Large (pot or more)', 'Check'];
      if (spot === 'cbet') { q = 'You raised preflop, one caller, flop comes. You have an overpair. Standard c-bet size?'; ans = info.wet ? opts[1] : opts[0]; why = info.why + ' ' + (info.wet ? 'On wet boards bet bigger: you deny equity to draws and get paid while you are ahead.' : 'On dry boards a small bet gets folds from air and calls from weaker pairs at the lowest price.'); }
      else if (spot === 'value') { q = 'River. You have the nuts and they have shown strength all hand. Best size?'; ans = opts[2]; why = 'When they are strong and you are stronger, go big. A pot-size or overbet value bet gets the most from a hand that will call anyway.'; }
      else { q = 'River bluff on a scary board where their hand is probably medium strength. Which size pressures them most?'; ans = opts[1]; why = 'Medium hands call small bets. A two-thirds pot bet asks them to be right 30% of the time, enough to fold many bluff-catchers. Going huge risks too much for the same fold rate.'; }
      return { kind: 'size', q: q, hero: null, board: spot === 'cbet' ? b : null, opts: shuffle(opts.slice()), ans: ans, why: why };
    },
    river: function () {
      var pot = (4 + rnd(20)) * 10, bet = Math.round(pot * pick([.5, .66, 1, 1.5])), need = bet / (pot + 2 * bet);
      var bluffPct = pick([10, 20, 30, 40, 50]);
      if (Math.abs(bluffPct / 100 - need) < .04) bluffPct += 15;
      var ans = bluffPct / 100 > need ? 'Call' : 'Fold';
      return { kind: 'river', q: 'River. Pot <b>$' + pot + '</b>, they bet <b>$' + bet + '</b>. You hold a bluff-catcher that only beats bluffs. From their history they bluff here about <b>' + bluffPct + '%</b> of the time. Call or fold?', hero: null, board: null, opts: ['Call', 'Fold'], ans: ans,
        why: 'You need to win ' + Math.round(need * 100) + '% ($' + bet + ' to win $' + (pot + bet) + '). They bluff ' + bluffPct + '%. ' + (ans === 'Call' ? 'Calling wins more often than the price requires: call.' : 'Not enough bluffs to pay this price: fold and let it go.') + ' River calls are pure arithmetic on how often they are bluffing.' };
    },
    icm: function () {
      var h = deal(2), c = chen(h), bb = pick([6, 8, 10, 12]), pos = pick([['Button', 4], ['Small blind', 3], ['Cutoff', 6], ['UTG', 8]]);
      var thr = pos[1] + (bb >= 12 ? 1 : 0) - (bb <= 6 ? 1 : 0);
      var ans = c >= thr ? 'Shove all-in' : 'Fold';
      return { kind: 'icm', q: 'Tournament, <b>' + bb + ' big blinds</b> left, folded to you in <b>' + pos[0] + '</b>. Shove or fold?', hero: h, board: [], opts: ['Shove all-in', 'Fold'], ans: ans,
        why: 'Under ~12bb you play push or fold: raising small leaves you no fold equity. ' + handLabel(h) + ' scores ' + c + ' on Chen; from ' + pos[0] + ' with ' + bb + 'bb the shoving threshold is about ' + thr + '. ' + (ans === 'Shove all-in' ? 'Shove: you win the blinds often and have equity when called.' : 'Fold: too weak to risk your tournament life here; wait one more orbit.') };
    },
    exploit: function () {
      var S = [
        ['A player calls every bet to the river with any pair.', 'Value bet thinner and never bluff them', 'Bluff them more', 'Fold more against them', 'Check back your strong hands'],
        ['A player raises nearly every hand preflop and fires every flop.', 'Call down lighter and let them bluff into your medium hands', 'Fold until you have aces', '3-bet only premiums', 'Play more hands from early position'],
        ['A player only enters pots with premium hands and folds to most bets.', 'Steal their blinds and fold when they raise', 'Call their raises with weak hands', 'Bluff them after they show strength', 'Slow-play against them'],
        ['A player checks their strong hands to trap and bets their weak ones.', 'Bet into their checks for value less often; call their bets more', 'Always fold to their bets', 'Bet big into their checks', 'Never check behind'],
        ['A player tilts and triples their bet size after losing a big pot.', 'Tighten up and let them pay you off with strong hands', 'Bluff them immediately', 'Leave the table', 'Match their aggression with any two cards']
      ];
      var s = pick(S);
      return { kind: 'exploit', q: s[0] + ' Best adjustment?', hero: null, board: null, opts: shuffle(s.slice(1)), ans: s[1], why: 'Exploitation means doing the opposite of what their mistake invites. ' + s[1] + '. Against balanced opponents play closer to theory; against these players, lean into their leak.' };
    },
    concept: function () {
      var Q = [
        ['Why is the button the best seat?', ['You act last after the flop', 'You get better cards', 'You pay no blinds', 'You see a card early'], 0, 'Acting last means you see what everyone does before you decide. More information = better decisions.'],
        ['You have the best hand on the river. Should you bet?', ['Yes, so worse hands can pay you', 'No, check to be safe', 'Only if you have the nuts', 'Only if they checked twice'], 0, 'A value bet makes worse hands pay you. Checking a strong hand leaves money on the table.'],
        ['When is a bluff most likely to work?', ['Against a tight player on a scary board', 'Against a player who calls everything', 'When you’ve shown weakness all hand', 'Whenever you have nothing'], 0, 'Bluffs need folds. Tight players fold more, and scary boards (flush or straight cards) make your story believable.'],
        ['What is “tilt”?', ['Playing worse because you’re upset', 'A big all-in move', 'A slow-play', 'A tell'], 0, 'Tilt is emotion taking over. Pros quit or take a break when they feel it.'],
        ['Good bankroll rule for cash games?', ['Keep 20–30 buy-ins for your stake', 'Bring your whole savings', 'One buy-in is enough', 'Double up or quit'], 0, 'A deep bankroll survives normal bad luck so you can keep playing your best.'],
        ['Standard preflop open size?', ['About 2.5–3 big blinds', 'Exactly 1 big blind', 'All-in', '10 big blinds'], 0, 'Around 2.5–3x is big enough to take control and small enough to risk little when you fold.'],
        ['Why fold hands like K8 offsuit from early position?', ['They lose to better kings and are hard to play', 'They never win', 'Kings are bad', 'You should always raise them'], 0, 'Offsuit, weak-kicker hands get dominated: when you hit, someone with a better kicker often beats you.'],
        ['What is a semi-bluff?', ['Betting with a draw that can still improve', 'Betting half pot', 'Bluffing on the river', 'Calling with nothing'], 0, 'You can win right away if they fold, and you can still hit your draw if they call. Two ways to win.'],
        ['You face a pot-sized bet. What % do you need to call?', ['33%', '50%', '25%', '20%'], 0, 'Pot P, bet P: you call P to win 3P. P / 3P = 33%.'],
        ['Their bet is half the pot. What % do you need?', ['25%', '33%', '50%', '10%'], 0, 'Pot 100, bet 50: call 50 to win 200. 50 / 200 = 25%.']
      ];
      var lv = stt().level;
      var pool = EXTRA_CONCEPTS.filter(function (x) { return Math.abs(x[0] - lv) <= 2; });
      if (pool.length && Math.random() < 0.8) { var x = pick(pool); return { kind: 'concept', q: x[1], hero: null, board: null, opts: shuffle(x[2].slice()), ans: x[2][0], why: x[3] }; }
      var q = pick(Q), opts = q[1].slice(), ans = opts[q[2]];
      return { kind: 'concept', q: q[0], hero: null, board: null, opts: shuffle(opts), ans: ans, why: q[3] };
    }
  };
  function texture(b) {
    var rs = b.map(rk).sort(function (a, c) { return a - c; }), ss = b.map(su);
    var mono = ss[0] === ss[1] && ss[1] === ss[2], two = !mono && (ss[0] === ss[1] || ss[1] === ss[2] || ss[0] === ss[2]);
    var paired = rs[0] === rs[1] || rs[1] === rs[2];
    var span = rs[2] - rs[0], conn = span <= 4 && !paired;
    var wet = mono || (two && span <= 6) || conn;
    var why = 'Board ' + b.map(cstr).join(' ') + ': ' + (mono ? 'three of one suit, so a flush is already possible.' : paired ? 'paired, so trips and full houses are live and draws matter less.' : (two ? 'two of a suit' : 'three suits') + ', ranks ' + (conn ? 'close together, so straights and straight draws are everywhere.' : span <= 6 ? 'somewhat connected.' : 'far apart, so few straight draws.'));
    return { mono: mono, two: two, paired: paired, conn: conn, wet: wet, why: why };
  }
  var INTRO = {
    name: ['Hand rankings', 'From best to worst: straight flush, four of a kind, full house, flush, straight, three of a kind, two pair, one pair, high card. You make the best 5-card hand from your 2 cards + 5 shared board cards.'],
    cmp: ['Who wins?', 'Higher hand type wins. If both players have the same type, the higher ranks decide, then the kickers (side cards). Identical best five = split pot.'],
    pre: ['Preflop: position matters', 'Fewer players behind you = you can play more hands. Early seats play tight (big pairs, AK, AQ); the button can raise many more. We use the Chen score as a simple strength number.'],
    outs: ['Outs', 'Outs are unseen cards that improve you to a winning hand. Flush draw = 9, open-ended straight draw = 8, gutshot = 4. Rule of 4 and 2: outs × 4 on the flop, × 2 on the turn ≈ your % to hit.'],
    odds: ['Pot odds', 'Price to call ÷ (pot after you call) = the % you need to win. If your chance to hit is higher than that, call. Half-pot bet needs 25%, pot bet needs 33%.'],
    eq: ['Equity', 'Equity is your share of the pot if all cards were dealt out. Pairs usually beat random hands; strong draws can be 30–50% on the flop.'],
    concept: ['Strategy', 'Position, value betting, bluffing smart, bankroll and tilt control. These separate winners from everyone else.'],
    texture: ['Board texture', 'Wet boards (connected, suited) have many draws, so hands change value fast. Dry boards (disconnected, rainbow) favor whoever has the best made hand now. Texture decides your bet size and whether to c-bet at all.'],
    range: ['Opening ranges', 'Each seat opens a different slice of hands: UTG about 15%, button 45%+. Think in ranges, not single hands: pairs, suited aces, suited broadways, connectors.'],
    threebet: ['3-betting', 'Re-raising before the flop. 3-bet premiums for value, call with playable hands, fold the rest. The big blind defends wider since the money is already in.'],
    size: ['Bet sizing', 'Small bets (1/3) on dry boards, bigger (2/3) on wet ones, big or overbets when you have the nuts and they are strong. Size is a tool, not a habit.'],
    river: ['River decisions', 'On the river there are no more cards: it is value or bluff, call or fold. Bluff-catching is arithmetic: compare the price with how often they bluff.'],
    icm: ['Tournaments', 'Chips change value in tournaments. Under about 12 big blinds you shove or fold. Near the money bubble, survival is worth more than chips.'],
    nuts: ['Finding the nuts', 'The nuts is the best possible hand on the board. Check three things every street: paired board (full house), three of a suit (flush), three cards within five ranks (straight).'],
    beats: ['What beats you', 'List the hands that beat you right now and count how many ways the opponent can hold them. That is the first step of reading hands.'],
    draws: ['Name your draw', 'Flush draw 9 outs, open-ended straight draw 8, gutshot 4, combo draw 12–15.'],
    outcard: ['Spot your outs', 'Scan each suit and each rank for the cards that finish your hand. Those are your outs.'],
    betmath: ['Bet math', 'Bet sizes are fractions of the pot. A bluff of B into P must work B/(P+B) of the time. Defend about P/(P+B) against bets.'],
    implied: ['Implied odds', 'When the price is too high now, you may still call if you will win enough extra later when you hit.'],
    betplan: ['Why bet', 'Value bet when ahead, semi-bluff with real draws, check medium hands, give up weak hands with no draw.'],
    readrange: ['Reading ranges', 'Start from the player type, then remove hands that would not take each action. Blockers remove combinations too.'],
    exploit: ['Exploiting players', 'Calling stations: value bet, never bluff. Maniacs: call lighter. Nits: steal, then fold to their aggression. Read the player, then adjust.']
  };
  var PL = App.X().pokerLessons || {};
  Object.keys(PL).forEach(function (k) { if (INTRO[k] && PL[k] && PL[k].length === 2) INTRO[k] = PL[k]; });
  var LEARN = ['name', 'cmp', 'nuts', 'beats', 'pre', 'draws', 'outs', 'outcard', 'odds', 'betmath', 'eq', 'texture', 'implied', 'betplan', 'range', 'readrange', 'threebet', 'size', 'river', 'icm', 'exploit', 'concept'];

  function stt() {
    var p = App.S.poker;
    if (p.level == null) { p.level = 1; p.streak = 0; p.right = 0; p.total = 0; p.seen = {}; p.bot = 1; p.hands = 0; p.dec = { good: 0, all: 0 }; p.chips = 0; p.wrongRun = 0; }
    return p;
  }

  // ---------- UI pieces ----------
  function cardHTML(c, opts) {
    opts = opts || {};
    if (c == null) return '<span class="pcard back' + (opts.big ? ' big' : '') + '"></span>';
    return '<span class="pcard ' + (su(c) === 1 || su(c) === 2 ? 'red' : 'blk') + (opts.big ? ' big' : '') + (opts.dim ? ' dim' : '') + '" aria-label="' + cstr(c) + '"><span class="r">' + rname(rk(c)) + '</span><span class="s">' + SUIT[su(c)] + '</span></span>';
  }
  function cardsHTML(cs, opts) { return '<div class="cards">' + cs.map(function (c) { return cardHTML(c, opts); }).join('') + '</div>'; }

  function home() {
    App.root('Poker', function (v) {
      var p = stt();
      var acc = p.dec.all ? Math.round(100 * p.dec.good / p.dec.all) : 0;
      v.innerHTML = '<div><span class="eyebrow">Texas Hold’em</span><h1>Level ' + p.level + ' · ' + title(p.level) + '</h1><p class="mute small">Drill streak ' + p.streak + '/5 to level up · ' + p.right + '/' + p.total + ' correct overall</p></div>' +
        '<div class="bar"><i style="width:' + (p.streak / 5 * 100) + '%"></i></div>' + App.playNowBtn('poker') +
        (function () { var r = report()[0]; return '<div class="coach ok"><div class="h"><span class="pill ok">Coach</span></div><p>' + r.text + '</p><button class="btn sm" id="repgo">' + r.action + ' ›</button></div>'; })() +
        '<div class="btns"><button class="btn" id="cs">Course</button><button class="btn" id="dr">Train drills</button><button class="btn" id="pl">Play heads-up</button><button class="btn" id="pt">Play a table</button></div>' +
        (function () { p.course = p.course || {}; var nx = COURSE.findIndex(function (c, i) { return !p.course[i]; }); return nx >= 0 ? '<button class="item" id="cnext"><span class="grow"><span class="t">Next lesson: ' + COURSE[nx].t + '</span><br><span class="s">' + COURSE[nx].u + ' · ' + Object.keys(p.course).length + ' / ' + COURSE.length + ' done</span></span><span class="end">›</span></button>' : ''; })() +
        '<div class="stats"><div class="stat"><span class="v">' + p.hands + '</span><span class="k">Hands played</span></div><div class="stat"><span class="v">' + acc + '%</span><span class="k">Good decisions</span></div><div class="stat"><span class="v">' + (p.chips >= 0 ? '+' : '') + p.chips + '</span><span class="k">Chips won</span></div></div>' +
        '<h2>Quick reference</h2><div class="list">' + LEARN.map(function (k, i) {
          var open = typesFor(p.level).indexOf(k) >= 0 || p.seen[k];
          return '<button class="item' + (open ? '' : ' locked') + '" data-k="' + k + '"><span class="grow"><span class="t">' + INTRO[k][0] + '</span><br><span class="s">' + (open ? 'Tap to read' : 'Unlocks as you level up') + '</span></span><span class="end">' + (open ? '›' : 'locked') + '</span></button>';
        }).join('') + '</div>';
      App.wirePlayNow(v, 'poker');
      $('#dr', v).onclick = drills;
      $('#cs', v).onclick = course;
      if ($('#cnext', v)) $('#cnext', v).onclick = function () { var nx = COURSE.findIndex(function (c, i) { return !stt().course[i]; }); if (courseOpen(nx)) lessonPK(nx); else course(); };
      $('#repgo', v).onclick = report()[0].go;
      $('#pl', v).onclick = botMenu;
      $('#pt', v).onclick = tableMenu;
      $$('[data-k]', v).forEach(function (b) { b.onclick = function () { var k = b.dataset.k; if (typesFor(stt().level).indexOf(k) >= 0 || stt().seen[k]) App.modal('<div class="grab"></div><h2>' + INTRO[k][0] + '</h2><p>' + INTRO[k][1] + '</p>' + (k === 'name' ? rankingsTable() : '') + '<button class="btn" id="cl">Close</button>'), App.$('#cl') && (App.$('#cl').onclick = App.closeModal); }; });
    });
  }
  function rankingsTable() {
    var ex = [[48, 44, 40, 36, 32], [51, 50, 49, 48, 1], [47, 46, 45, 7, 3], [36, 26, 18, 14, 2], [34, 29, 24, 19, 14], [50, 42, 30, 22, 6], [43, 42, 41, 23, 22], [51, 50, 49, 23, 6], [51, 46, 41, 36, 31]];
    // listed best to worst
    var names = [8, 7, 6, 5, 4, 3, 2, 1, 0];
    var demo = [[48, 44, 40, 36, 32], [3, 2, 1, 0, 40], [27, 26, 25, 7, 6], [33, 25, 17, 9, 49], [32, 29, 26, 23, 19], [43, 42, 41, 15, 2], [51, 50, 30, 31, 6], [47, 46, 29, 14, 7], [51, 42, 30, 17, 5]];
    return '<div class="list">' + names.map(function (n, i) { return '<div class="row"><span class="small" style="width:110px">' + CAT[n] + '</span>' + demo[i].map(function (c) { return cardHTML(c); }).join('') + '</div>'; }).join('') + '</div>';
  }

  // Oct 18: plain meanings for the jargon in each question (Words to Know terms), shown right under it
  function KW(texts, max) { return typeof GL !== 'undefined' && GL.keyWords ? GL.keyWords(texts, 'Poker', max) : ''; }
  function drills() {
    App.screen('Poker drills', function (v) {
      var p = stt(), q, answered, tmr = null, left = 0, count = 0;
      v.innerHTML = '<div class="row"><span class="pill acc" id="lv"></span><span class="pill" id="sk"></span><span class="grow"></span><span class="mono small" id="tm"></span></div><div class="bar"><i id="pb"></i></div><div id="qa"></div>';
      function head() {
        $('#lv', v).textContent = 'Lv ' + p.level + ' ' + title(p.level);
        $('#sk', v).textContent = 'Streak ' + p.streak + '/5';
        $('#pb', v).style.width = (p.streak / 5 * 100) + '%';
      }
      function next() {
        clearInterval(tmr); answered = false; head();
        var types = typesFor(p.level);
        if (p.wrongRun >= 2 && p.level > 1) types = typesFor(p.level - 1); // ease off after misses
        p.kinds = p.kinds || {};
        var weighted = []; types.forEach(function (t) { var k = p.kinds[t]; var w = k && k.n >= 3 && k.ok / k.n < 0.7 ? 3 : 1; for (var i = 0; i < w; i++) weighted.push(t); });
        var type = pick(weighted);
        if (!p.seen[type]) { p.seen[type] = 1; App.save(); intro(type); return; }
        q = GEN[type]();
        draw();
        var t = timerFor(p.level);
        if (t) { left = t; $('#tm', v).textContent = left + 's'; tmr = setInterval(function () { left--; var el = $('#tm', v); if (el) el.textContent = left + 's'; if (left <= 0) { clearInterval(tmr); answer(null); } }, 1000); }
        else $('#tm', v).textContent = '';
      }
      function intro(type) {
        $('#qa', v).innerHTML = '<div class="panel"><span class="eyebrow">New skill unlocked</span><h2>' + INTRO[type][0] + '</h2><p>' + INTRO[type][1] + '</p>' + KW([INTRO[type][0], INTRO[type][1]], 6) + (type === 'name' ? rankingsTable() : '') + '<button class="btn primary" id="go">Start</button></div>';
        $('#go', v).onclick = next;
      }
      function draw() {
        var html = '<div class="table" style="border-radius:22px">';
        if (q.vill) html += '<div class="seat"><span class="nm">Villain</span>' + cardsHTML(q.vill) + '</div>';
        if (q.board && q.board.length) html += cardsHTML(q.board);
        if (q.hero) html += '<div class="seat">' + cardsHTML(q.hero, { big: true }) + '<span class="nm">You</span></div>';
        html += '</div>';
        if (!q.hero && !(q.board && q.board.length)) html = '';
        $('#qa', v).innerHTML = html + '<h3>' + q.q + '</h3>' + KW([q.q].concat(q.opts)) + '<div class="list">' + q.opts.map(function (o, i) { return '<button class="btn opt" data-i="' + i + '">' + o + '</button>'; }).join('') + App.idkBtn('i') + '</div><div id="fb"></div>';
        $$('[data-i]', v).forEach(function (b) { b.onclick = function () { answer(q.opts[+b.dataset.i], b); }; });
      }
      function answer(o, btn) {
        if (answered) return; answered = true; clearInterval(tmr);
        var ok = o === q.ans;
        p.total++; if (ok) { p.right++; p.streak++; p.wrongRun = 0; } else { p.streak = 0; p.wrongRun++; }
        p.kinds = p.kinds || {}; var kk = p.kinds[q.kind] || { ok: 0, n: 0 }; kk.n++; if (ok) kk.ok++; p.kinds[q.kind] = kk;
        var up = false;
        if (p.streak >= 5) { p.level++; p.streak = 0; up = true; App.celebrate('level'); }
        App.save();
        $$('[data-i]', v).forEach(function (b) { if (q.opts[+b.dataset.i] === q.ans) b.classList.add('right'); else if (b === btn) b.classList.add('wrong'); });
        $('#fb', v).innerHTML = App.coachHTML(ok ? 'right' : 'wrong', (o === null ? 'Time’s up. ' : '') + q.why) +
          (up ? App.coachHTML('info', '<b>Level up! You’re now level ' + p.level + ' (' + title(p.level) + ').</b> ' + (timerFor(p.level) ? 'Questions are now timed: ' + timerFor(p.level) + 's.' : 'New question types are mixed in.')) + (typeof WZ !== 'undefined' ? WZ.card('level', true) : '') : '') +
          '<button class="btn primary" id="nx" style="width:100%">Next</button>';
        head();
        $('#nx', v).onclick = function () { count++; App.checkpoint(next); };
        $('#nx', v).scrollIntoView({ block: 'nearest' });
      }
      next();
    });
  }

  // ---------- the course: read it, see an example, then drill it ----------
  var COURSE = [
    { u: 'Foundations', t: 'Hand rankings', lv: 1, types: ['name'], body: ['From best to worst: straight flush, four of a kind, full house, flush, straight, three of a kind, two pair, one pair, high card.', 'You always play the best five cards from your two plus the five on the board. You can use both, one, or none of your own cards.', 'Example: you hold A♥ 4♥, board K♥ 9♥ 2♣ 7♥ J♠ — you have an ace-high flush using A♥ plus four hearts on the board.'] },
    { u: 'Foundations', t: 'Who wins at showdown', lv: 1, types: ['cmp'], body: ['Higher category wins. Same category: compare the highest relevant cards, then kickers (side cards).', 'Two players with A-K and A-Q on an A-7-3-9-2 board both have a pair of aces; the king kicker wins.', 'If the five best cards are identical (often when the board plays), the pot is split.'] },
    { u: 'Reading the board', t: 'Finding the nuts', lv: 2, types: ['nuts'], body: ['The nuts is the best hand possible right now. Knowing it tells you what a big bet can represent and how strong your hand really is.', 'Three-question checklist every street: Is the board paired? (full house possible) Three of a suit? (flush possible) Three cards within five ranks? (straight possible)', 'Example: board 9♠ 8♠ 2♦. Not paired, only two spades, and only two cards close together, so no flush or straight is possible yet. The nuts is a set of nines (9-9).'] },
    { u: 'Reading the board', t: 'What beats you?', lv: 3, types: ['beats'], body: ['Before betting or calling, list the hands that beat you right now: higher pairs, two pair, sets, straights, flushes.', 'Then count how many ways the opponent can hold them. Sets need a pocket pair (3 combos each); a specific two-card hand like A-K has 16 combos (4 suited).', 'Example: you hold K♣ Q♣ on K♦ 7♠ 2♥. Beating you: AK, any set (77, 22, KK), K7, K2. That is a small slice of possible hands, so top pair is strong here.'] },
    { u: 'Reading the board', t: 'Board texture', lv: 4, types: ['texture'], body: ['Dry boards (K♠ 7♦ 2♣) change little on later streets: whoever is ahead usually stays ahead.', 'Wet boards (J♥ 10♥ 8♣) are full of draws: hand strength shifts every card, so protect strong hands by betting bigger.', 'Paired and monotone boards shrink the value of one-pair hands and make the nuts easier to hold.'] },
    { u: 'Draws & outs', t: 'Name your draw', lv: 4, types: ['draws'], body: ['Flush draw: four cards of one suit — 9 outs.', 'Open-ended straight draw: four in a row with both ends open — 8 outs. Gutshot: one rank missing inside — 4 outs.', 'Combo draw: flush draw plus straight draw — 12 to 15 outs, often a favorite even against top pair.'] },
    { u: 'Draws & outs', t: 'Counting outs', lv: 5, types: ['outs', 'outcard'], body: ['An out is an unseen card that makes your hand into a likely winner.', 'Count by suit (flush cards left) and by rank (cards that finish the straight). Don’t double-count a card that does both.', 'Discount dirty outs: a heart that completes your straight but also gives the opponent a flush is not a clean out.'] },
    { u: 'Draws & outs', t: 'Rule of 4 and 2', lv: 5, types: ['outs', 'eq'], body: ['On the flop with two cards to come: outs × 4 ≈ your % to hit by the river (if you’ll see both cards).', 'With one card to come: outs × 2 ≈ % to hit on the next card.', 'Example: 9-out flush draw ≈ 36% by the river, ≈ 18% on the turn alone. Exact: 35% and 19.6%.'] },
    { u: 'The math of betting', t: 'Pot odds', lv: 6, types: ['odds'], body: ['Price = call ÷ (pot after your call). That is the % of the time you must win to break even.', 'Half-pot bet → you need 25%. Two-thirds pot → 28.6%. Pot-size bet → 33%.', 'Call when your chance of winning is above the price; fold when below. That single habit separates winners from everyone else.'] },
    { u: 'The math of betting', t: 'Bet math', lv: 6, types: ['betmath'], body: ['Bet sizes are fractions of the pot: 1/3, 1/2, 2/3, pot. Track the pot every street.', 'A bluff of B into a pot of P must work B ÷ (P + B) of the time. Half-pot bluff: 33%. Pot bluff: 50%.', 'Minimum defense: to stop any-two-card bluffs, continue P ÷ (P + B) of the time. Against honest players, fold more.'] },
    { u: 'The math of betting', t: 'Implied odds', lv: 7, types: ['implied'], body: ['Sometimes the price now is too high, but when you hit you will win more later. That future money is implied odds.', 'Good implied odds: deep stacks, hidden draws (gutshots, sets), opponents who pay off. Bad: short stacks, obvious draws, tight opponents.', 'Rule: the bigger the gap between your chance and the price, the more you must win later to justify the call.'] },
    { u: 'How to bet', t: 'Why bet: value, semi-bluff, check', lv: 7, types: ['betplan'], body: ['Value bet: you are usually ahead and worse hands will call. Bet.', 'Semi-bluff: you are behind but have a real draw. Betting wins now if they fold and later if you hit.', 'Check: medium hands that beat bluffs but lose to strong hands. Keep the pot small. Give up: weak hands with no draw, unless the opponent folds a lot.'] },
    { u: 'How to bet', t: 'Bet sizing', lv: 8, types: ['size'], body: ['Small (1/3 pot) on dry boards: cheap, gets calls from worse, folds out air.', 'Bigger (2/3 pot) on wet boards: charge the draws while you are ahead.', 'Big or overbet when you have the nuts and they are likely strong too. Size from the hands you want to call or fold, not from habit.'] },
    { u: 'Reading hands', t: 'Reading ranges from actions', lv: 8, types: ['readrange'], body: ['A range is every hand a player could hold. Start wide, then remove hands that wouldn’t take each action.', 'Start from the player type: tight players raise strong hands; loose ones play everything. Passive players who suddenly bet usually have it.', 'Blockers: cards in your hand remove combinations from theirs. Holding the A♠ on a spade board means they never have the nut flush.'] },
    { u: 'Reading hands', t: 'River decisions', lv: 9, types: ['river'], body: ['No more cards: it is value or bluff, call or fold.', 'Bluff-catching is arithmetic: compare the price with how often this player bluffs here.', 'Value-bet thin against calling stations; check medium hands against aggressive players who bluff.'] },
    { u: 'Preflop & strategy', t: 'Position and opening ranges', lv: 3, types: ['pre', 'range'], body: ['Position = acting last after the flop. It is worth a lot: you see what they do first.', 'Open tight early (about 15% of hands from UTG) and wide late (45%+ on the button).', 'Heads-up, ranges get very wide: most hands are playable from the button.'] },
    { u: 'Preflop & strategy', t: '3-betting', lv: 8, types: ['threebet'], body: ['A 3-bet is a re-raise before the flop. 3-bet premiums for value (QQ+, AK).', 'Call with hands that play well after the flop: medium pairs, suited broadways, suited connectors.', 'The big blind defends wider because money is already in.'] },
    { u: 'Preflop & strategy', t: 'Exploiting player types', lv: 10, types: ['exploit'], body: ['Calling station: value bet thinner and never bluff.', 'Maniac: call down lighter and let them bluff into you.', 'Nit: steal their blinds, fold to their aggression.'] },
    { u: 'Preflop & strategy', t: 'Tournaments and push/fold', lv: 10, types: ['icm'], body: ['Under about 12 big blinds you shove or fold; small raises leave no room to fold.', 'Near the money bubble, survival has extra value: tighten up when you are at risk, attack when others are.', 'Chip value is not linear: doubling your stack doesn’t double your prize equity.'] }
  ];
  (function () {
    var order = ['Foundations', 'Reading the board', 'Draws & outs', 'The math of betting', 'How to bet', 'Reading hands', 'Preflop & strategy'];
    COURSE.forEach(function (c, i) { c._i = i; if (c.t === 'Position and opening ranges') c.u = 'Foundations'; });
    COURSE.sort(function (a, b) { return order.indexOf(a.u) - order.indexOf(b.u) || a.lv - b.lv || a._i - b._i; });
  })();
  function courseOpen(i) { var p = stt(); p.course = p.course || {}; return i === 0 || p.course[i - 1] || p.level >= COURSE[i].lv + 1; }
  function course() {
    App.screen('Poker course', function (v) {
      var p = stt(); p.course = p.course || {};
      var done = COURSE.filter(function (c, i) { return p.course[i]; }).length, last = '';
      v.innerHTML = '<div><span class="eyebrow">Learn it, then drill it</span><h1>' + done + ' / ' + COURSE.length + ' lessons</h1><p class="mute small">Each lesson explains one skill with an example, then gives you 6 questions on it. Pass 5 of 6 to complete it.</p></div><div class="list" id="cl"></div>';
      $('#cl', v).innerHTML = COURSE.map(function (c, i) {
        var hdr = c.u !== last ? '<span class="eyebrow" style="margin-top:6px">' + c.u + '</span>' : ''; last = c.u;
        var open = courseOpen(i);
        return hdr + '<button class="item' + (open ? '' : ' locked') + (p.course[i] ? ' done' : '') + '" data-c="' + i + '"><span class="grow"><span class="t">' + c.t + '</span></span><span class="end">' + (p.course[i] ? '✓' : open ? '›' : 'locked') + '</span></button>';
      }).join('');
      $$('[data-c]', v).forEach(function (b) { b.onclick = function () { var i = +b.dataset.c; if (courseOpen(i)) lessonPK(i); }; });
    });
  }
  function qTable(q) {
    var html = '<div class="table" style="border-radius:22px">';
    if (q.vill) html += '<div class="seat"><span class="nm">Villain</span>' + cardsHTML(q.vill) + '</div>';
    if (q.board && q.board.length) html += cardsHTML(q.board);
    if (q.hero) html += '<div class="seat">' + cardsHTML(q.hero, { big: true }) + '<span class="nm">You</span></div>';
    return (q.hero || (q.board && q.board.length)) ? html + '</div>' : '';
  }
  function lessonPK(i) {
    var c = COURSE[i];
    App.screen(c.t, function (v) {
      var n = 0, right = 0, N = 6;
      v.innerHTML = '<div><span class="eyebrow">' + c.u + '</span><h1>' + c.t + '</h1></div><div class="prose"><ul>' + c.body.map(function (b) { return '<li>' + b + '</li>'; }).join('') + '</ul></div>' + (c.types[0] === 'name' ? rankingsTable() : '') + '<button class="btn primary" id="go">Practice: ' + N + ' questions</button><div id="qa"></div>';
      $('#go', v).onclick = function () { $('#go', v).remove(); ask(); };
      function ask() {
        if (n >= N) return finish();
        var q = GEN[c.types[n % c.types.length]]();
        $('#qa', v).innerHTML = '<div class="row"><span class="pill acc">' + (n + 1) + ' / ' + N + '</span><span class="pill">' + right + ' right</span></div>' + qTable(q) + '<h3>' + q.q + '</h3>' + KW([q.q].concat(q.opts)) + '<div class="list">' + q.opts.map(function (o, k) { return '<button class="btn opt" data-i="' + k + '">' + o + '</button>'; }).join('') + App.idkBtn('i') + '</div><div id="fb"></div>';
        var done = false;
        $$('[data-i]', v).forEach(function (b) {
          b.onclick = function () {
            if (done) return; done = true;
            var ok = q.opts[+b.dataset.i] === q.ans, p = stt(); if (ok) right++;
            p.kinds = p.kinds || {}; var kk = p.kinds[q.kind] || { ok: 0, n: 0 }; kk.n++; if (ok) kk.ok++; p.kinds[q.kind] = kk; p.total++; if (ok) p.right++; App.save();
            $$('[data-i]', v).forEach(function (x) { if (q.opts[+x.dataset.i] === q.ans) x.classList.add('right'); else if (x === b) x.classList.add('wrong'); });
            $('#fb', v).innerHTML = App.coachHTML(ok ? 'right' : 'wrong', q.why) + '<button class="btn primary" id="nx" style="width:100%">' + (n + 1 >= N ? 'See result' : 'Next') + '</button>';
            $('#nx', v).onclick = function () { n++; ask(); };
            $('#nx', v).scrollIntoView({ block: 'nearest' });
          };
        });
        $('#qa', v).scrollIntoView({ block: 'start' });
      }
      function finish() {
        var p = stt(), pass = right >= N - 1; p.course = p.course || {};
        if (pass) { p.course[i] = 1; App.celebrate('poker'); }
        App.save();
        $('#qa', v).innerHTML = '<div class="panel"><h2>' + right + ' / ' + N + '</h2><p>' + (pass ? 'Lesson complete.' + (i + 1 < COURSE.length ? ' Next: ' + COURSE[i + 1].t + '.' : '') : 'Need 5 of 6. Reread the lesson above and run it again; the questions change every time.') + '</p><div class="btns">' + (pass && i + 1 < COURSE.length ? '<button class="btn primary" id="nl">Next lesson</button>' : '<button class="btn primary" id="ag">Try again</button>') + '<button class="btn" id="dn">Back to course</button></div></div>' + (pass && typeof WZ !== 'undefined' ? WZ.card('win', true) : '');
        if ($('#nl', v)) $('#nl', v).onclick = function () { App.checkpoint(function () { App.back(); lessonPK(i + 1); }); };
        if ($('#ag', v)) $('#ag', v).onclick = function () { App.checkpoint(function () { App.back(); lessonPK(i); }); };
        $('#dn', v).onclick = function () { App.checkpoint(App.back); };
      }
    });
  }

  // ---------- table coach: what you see before you act ----------
  function tableCoach(hero, board, tc, pot, villainMin, pos) {
    var rows = [];
    if (!board.length) {
      var c = chen(hero);
      rows.push(['Your hand', handLabel(hero) + ' · Chen score ' + c + ' (pairs, high cards, suited and connected score higher)']);
      if (tc > 0) rows.push(['Price', 'Call $' + tc + ' to win $' + (pot + tc) + ' → you need ' + Math.round(100 * tc / (pot + tc)) + '%']);
      rows.push(['Heads-up guide', 'Raise Chen 5+, play Chen 3–4 cheaply, fold the very worst. Facing a raise: 3-bet Chen 9+, call 4+, fold the rest.']);
      return { rows: rows, pro: function () { var cc = chen(hero); if (tc === 0) return cc >= 6 ? 'Raise: punish the limp with a good hand.' : 'Check and see a free flop.'; if (tc <= 1) return cc >= 5 ? 'Raise to $6: strong enough to take control.' : cc >= 2 ? 'Call (complete) and see a cheap flop.' : 'Fold: among the weakest hands.'; if (tc === 0) return cc >= 6 ? 'Raise: punish the limp with a good hand.' : 'Check and see a free flop.'; return cc >= 9 ? '3-bet: premium hand.' : cc >= 4 ? 'Call: playable hand at a fair price.' : 'Fold: too weak to call a raise.'; } };
    }
    var hs = evalHand(hero.concat(board)), d = drawInfo(hero, board), bi = beatInfo(hero, board), nu = nutsInfo(board);
    var watch = [];
    if (board.length >= 4) {
      var before = boardFeatures(board.slice(0, -1)), after = boardFeatures(board), last = board[board.length - 1];
      if (after.flush && !before.flush) watch.push('the ' + (board.length === 4 ? 'turn' : 'river') + ' ' + cIn(last) + ' put three of a suit on board: flushes are now possible');
      else if (after.paired && !before.paired) watch.push(cIn(last) + ' paired the board: full houses are now possible, and trips got stronger');
      else if (after.straight && !before.straight) watch.push(cIn(last) + ' connected the board: straights are now possible');
    }
    if (tc > 0) { var frac = tc / Math.max(1, pot - tc); watch.push(frac >= 0.9 ? 'a big bet (about pot): usually very strong or a bluff. Ask which hands bet this big here' : frac <= 0.4 ? 'a small bet: often a medium hand or a draw buying a cheap card' : 'a normal-sized bet: it doesn’t say much on its own; use the player type'); }
    if (watch.length) rows.push(['Pay attention', watch.join('; ')]);
    rows.push(['Your hand', CAT[cat(hs)]]);
    if (board.length < 5) rows.push(['Draw', d.outs ? d.label + ' · outs: ' + outsText(d.o.list) + ' (' + d.o.outs + ') ≈ ' + (board.length === 3 ? d.o.outs * 4 + '% by river, ' : '') + d.o.outs * 2 + '% next card' : d.label]);
    rows.push(['Beats you now', bi.beat.length ? bi.groups.slice(0, 3).map(function (g) { return g.k.toLowerCase() + ' (' + g.n + ')'; }).join(', ') + ' — ' + Math.round(bi.pct * 100) + '% of possible hands' : 'Nothing: you have the nuts']);
    rows.push(['The nuts', CAT[nu.cat].toLowerCase() + ', e.g. ' + combo(nu.nuts[0])]);
    if (tc > 0) rows.push(['Price', 'Call $' + tc + ' to win $' + (pot + tc) + ' → need ' + Math.round(100 * tc / (pot + tc)) + '%']);
    return { rows: rows, pro: function () {
      var e = equity(hero, board, 600, villainMin), need = tc / (pot + tc), ep = Math.round(e * 100) + '%', draw = d.fd || d.o.st >= 8;
      if (tc > 0) {
        if (e >= need + 0.2 && e > 0.6) return 'Raise for value: you win about ' + ep + ' against their likely range, well above the ' + Math.round(need * 100) + '% price.';
        if (e >= need) return 'Call: your ' + ep + ' beats the ' + Math.round(need * 100) + '% price.';
        if (draw && board.length < 5) return 'Close: ' + ep + ' vs ' + Math.round(need * 100) + '% needed. Call only if they will pay you off when you hit (implied odds); otherwise fold.';
        return 'Fold: ' + ep + ' is below the ' + Math.round(need * 100) + '% price.';
      }
      if (e > 0.65) return 'Bet about 2/3 pot for value: you win about ' + ep + '.';
      if (draw && board.length < 5) return 'Semi-bluff or take the free card: ' + ep + ' now, with ' + d.o.outs + ' outs.';
      if (e > 0.45) return 'Check: ' + ep + ' is a medium hand. Keep the pot small.';
      return 'Check: only ' + ep + '. Bluff only against a player who folds a lot.';
    } };
  }

  // ---------- heads-up play ----------
  var BOTS = [
    { lv: 1, name: 'Calling Station', blurb: 'Calls almost everything, rarely raises. Don’t bluff, just value bet.', loose: .14, aggr: .82, bluff: 0, raiseThr: 6, callThr: 0, frac: .5 },
    { lv: 2, name: 'The Rock', blurb: 'Only plays strong hands. Steal his blinds; respect his raises.', loose: -.08, aggr: .72, bluff: .02, raiseThr: 10, callThr: 7, frac: .66 },
    { lv: 3, name: 'TAG', blurb: 'Tight and aggressive, like a decent regular. Balanced and tricky.', loose: 0, aggr: .63, bluff: .18, raiseThr: 8, callThr: 5, frac: .7 },
    { lv: 4, name: 'Maniac', blurb: 'Raises constantly with anything. Call him down lighter and let him bluff.', loose: .06, aggr: .48, bluff: .38, raiseThr: 3, callThr: 1, frac: 1 },
    { lv: 5, name: 'Shark', blurb: 'Adapts: bluffs when you look weak, value bets thin.', loose: .02, aggr: .6, bluff: .25, raiseThr: 8, callThr: 5, frac: .75 },
    { lv: 6, name: 'Trapper', blurb: 'Slow-plays monsters and check-raises. Respect sudden aggression after passivity.', loose: .0, aggr: .58, bluff: .15, raiseThr: 9, callThr: 5, frac: .8, trap: .5 },
    { lv: 7, name: 'Pressure', blurb: 'Big sizes, relentless barrels. Pick your spots and call down with the right hands.', loose: .03, aggr: .55, bluff: .3, raiseThr: 7, callThr: 4, frac: 1.1 },
    { lv: 8, name: 'Pro', blurb: 'Balanced and adaptive. Bust this one and you are ready for real tables.', loose: .01, aggr: .57, bluff: .22, raiseThr: 8, callThr: 5, frac: .75, trap: .3, adapt: true }
  ];
  function botMenu() {
    App.screen('Heads-up', function (v) {
      var p = stt();
      v.innerHTML = '<p class="mute">One-on-one, 100 big blinds each (blinds $1/$2). Bust the bot to unlock the next one. Every decision you make gets graded.</p><div class="seg" id="md"><button aria-pressed="true" data-m="coach">Coached</button><button aria-pressed="false" data-m="casual">Just play</button></div><div class="list">' + BOTS.map(function (b) {
        var open = b.lv <= p.bot;
        return '<button class="item' + (open ? '' : ' locked') + (b.lv < p.bot ? ' done' : '') + '" data-b="' + b.lv + '"><span class="grow"><span class="t">' + b.lv + '. ' + b.name + '</span><br><span class="s">' + b.blurb + '</span></span><span class="end">' + (b.lv < p.bot ? '✓' : open ? '›' : 'locked') + '</span></button>';
      }).join('') + '</div><p class="small mute">Tip: turn your phone sideways for a wider table.</p>';
      var mode = 'coach';
      $$('[data-m]', v).forEach(function (b) { b.onclick = function () { mode = b.dataset.m; $$('[data-m]', v).forEach(function (q) { q.setAttribute('aria-pressed', q === b); }); $$('[data-b]', v).forEach(function (q) { q.classList.toggle('locked', mode !== 'casual' && +q.dataset.b > stt().bot); }); }; });
      $$('[data-b]', v).forEach(function (b) { b.onclick = function () { var lv = +b.dataset.b; if (mode === 'casual' || lv <= stt().bot) play(BOTS[lv - 1], mode === 'casual'); }; });
    });
  }

  function play(bot, casual) {
    App.screen(bot.name + (casual ? ' · just play' : ''), function (v) {
      var P = stt();
      var M = { stacks: [200, 200], button: 1, hand: null, decisions: [] };
      if (P.helper === undefined) P.helper = true;
      var helperOn = casual ? false : P.helper;
      v.innerHTML = '<div class="pkplay" style="display:flex;flex-direction:column;gap:12px"><div id="tbl"></div><div class="pkctl"><div id="help"></div><div id="act" class="btns"></div><div id="co"></div><div id="log" class="small mute"></div></div></div>';
      function showHelp() {
        var el = $('#help', v); if (!el) return;
        if (H.done || H.toAct !== 0) { el.innerHTML = ''; return; }
        if (!helperOn) { el.innerHTML = '<button class="btn sm ghost" id="hon">Show table coach</button>'; $('#hon', v).onclick = function () { helperOn = true; if (!casual) { P.helper = true; App.save(); } showHelp(); }; return; }
        var tcv = toCall(0), info = tableCoach(H.hole[0], H.board, tcv, potTotal(), villainMin());
        el.innerHTML = '<div class="panel" style="gap:6px;padding:10px 12px"><div class="row"><span class="eyebrow grow">Table coach</span><button class="btn sm ghost" id="hoff">Hide</button></div>' + info.rows.map(function (r) { return '<div class="small"><b>' + r[0] + ':</b> ' + r[1] + '</div>'; }).join('') + '<div class="row"><button class="btn sm" id="pro">What would a pro do?</button></div><div id="prot" class="small"></div></div>';
        $('#hoff', v).onclick = function () { helperOn = false; if (!casual) { P.helper = false; App.save(); } showHelp(); };
        $('#pro', v).onclick = function () { $('#prot', v).innerHTML = '<b>Pro move:</b> ' + info.pro(); };
      }
      var H;
      function newHand() {
        if (M.stacks[0] <= 0 || M.stacks[1] <= 0) return matchOver();
        M.button = 1 - M.button;
        var d = shuffle(deck());
        H = { deck: d, hole: [[d[0], d[1]], [d[2], d[3]]], board: [], dpos: 4, pot: 0, bets: [0, 0], street: 0, acted: [false, false], lastRaise: 2, done: false, botAgg: 0, heroAgg: 0, decs: [], start: M.stacks.slice(), log: [] };
        var sb = M.button, bb = 1 - M.button;
        post(sb, 1); post(bb, 2);
        H.toAct = sb;
        render(); $('#co', v).innerHTML = ''; $('#log', v).textContent = (sb === 0 ? 'You are on the button (small blind) and act first preflop.' : 'Bot is on the button. You are the big blind.');
        step();
      }
      function post(p, a) { a = Math.min(a, M.stacks[p]); M.stacks[p] -= a; H.bets[p] += a; }
      function potTotal() { return H.pot + H.bets[0] + H.bets[1]; }
      function toCall(p) { return Math.max(0, H.bets[1 - p] - H.bets[p]); }
      function minTo(p) { return Math.min(H.bets[p] + M.stacks[p], H.bets[1 - p] + Math.max(H.lastRaise, 2)); }
      function maxTo(p) { return H.bets[p] + M.stacks[p]; }
      function canRaise(p) { return M.stacks[p] > toCall(p) && M.stacks[1 - p] > 0; }
      function act(p, a) {
        var o = 1 - p, tc = toCall(p), nm = p === 0 ? 'You' : 'Bot';
        if (a.type === 'fold') { H.log.push(nm + ' fold'); return win(o, nm + ' folded.'); }
        if (a.type === 'check') { H.acted[p] = true; H.log.push(nm + ' check'); }
        if (a.type === 'call') { post(p, tc); H.acted[p] = true; H.log.push(nm + ' call $' + tc); }
        if (a.type === 'raise') {
          var to = Math.max(minTo(p), Math.min(maxTo(p), Math.round(a.to)));
          var size = to - H.bets[o]; if (size > H.lastRaise) H.lastRaise = size;
          post(p, to - H.bets[p]); H.acted[p] = true; H.acted[o] = false;
          H.log.push(nm + (tc ? ' raise to $' : ' bet $') + to + (M.stacks[p] === 0 ? ' (all-in)' : ''));
          if (p === 1) H.botAgg++; else H.heroAgg++;
        }
        var lo = H.bets[0] < H.bets[1] ? 0 : 1;
        var settled = H.acted[0] && H.acted[1] && (H.bets[0] === H.bets[1] || M.stacks[lo] === 0);
        if (settled) return endStreet();
        H.toAct = o; render(); step();
      }
      function endStreet() {
        if (H.bets[0] !== H.bets[1]) { var hi = H.bets[0] > H.bets[1] ? 0 : 1, diff = H.bets[hi] - H.bets[1 - hi]; H.bets[hi] -= diff; M.stacks[hi] += diff; }
        H.pot += H.bets[0] + H.bets[1]; H.bets = [0, 0]; H.acted = [false, false]; H.lastRaise = 2;
        var allIn = M.stacks[0] === 0 || M.stacks[1] === 0;
        if (H.street === 3) return showdown();
        if (allIn) { while (H.board.length < 5) H.board.push(H.deck[H.dpos++]); H.street = 3; return showdown(); }
        H.street++;
        var n = H.street === 1 ? 3 : 1; for (var i = 0; i < n; i++) H.board.push(H.deck[H.dpos++]);
        H.toAct = 1 - M.button;
        render(); step();
      }
      function showdown() {
        var hs = evalHand(H.hole[0].concat(H.board)), bs = evalHand(H.hole[1].concat(H.board));
        H.reveal = true;
        if (hs > bs) win(0, 'Your ' + CAT[cat(hs)].toLowerCase() + ' beats ' + CAT[cat(bs)].toLowerCase() + '.');
        else if (bs > hs) win(1, 'Bot’s ' + CAT[cat(bs)].toLowerCase() + ' beats your ' + CAT[cat(hs)].toLowerCase() + '.');
        else { var half = Math.floor(potTotal() / 2); M.stacks[0] += half; M.stacks[1] += potTotal() - half; H.pot = 0; H.bets = [0, 0]; finishHand('Split pot: both ' + CAT[cat(hs)].toLowerCase() + '.'); }
      }
      function win(p, why) { M.stacks[p] += potTotal(); H.pot = 0; H.bets = [0, 0]; finishHand(why); }
      function finishHand(why) {
        H.done = true; P.hands++; if ($('#help', v)) $('#help', v).innerHTML = '';
        var net = M.stacks[0] - H.start[0]; P.chips += net; App.save();
        render();
        var good = H.decs.filter(function (d) { return d.grade === 'best' || d.grade === 'good'; }).length;
        var sum = '<div class="panel"><div class="row"><h3 class="grow">' + (net > 0 ? 'You won $' + net : net < 0 ? 'You lost $' + (-net) : 'Even') + '</h3><span class="pill">' + good + '/' + H.decs.length + ' good decisions</span></div><p class="small">' + why + '</p>' +
          (H.decs.length ? '<div class="list">' + H.decs.map(function (d) { return App.coachHTML(d.grade, d.text, '<span class="small mute">' + d.street + '</span>'); }).join('') + '</div>' : '') +
          '<p class="small mute">Results swing with luck. Judge yourself by the decisions, not the chips.</p></div>';
        $('#co', v).innerHTML = sum;
        $('#act', v).innerHTML = '<button class="btn primary" id="nh">Next hand</button>';
        $('#nh').onclick = function () { App.checkpoint(newHand); };
      }
      function matchOver() {
        var won = M.stacks[1] <= 0, unlocked = false;
        P.busts = P.busts || {}; if (won && !casual) P.busts[bot.lv] = (P.busts[bot.lv] || 0) + 1;
        var need = bot.lv >= 4 ? 2 : 1;
        if (!casual && won && bot.lv === P.bot && P.bot < BOTS.length && P.busts[bot.lv] >= need) { P.bot++; unlocked = true; }
        if (won) App.celebrate(unlocked ? 'level' : 'poker');
        App.save();
        $('#tbl', v).innerHTML = '';
        $('#co', v).innerHTML = '<div class="panel"><h2>' + (won ? 'You busted the ' + bot.name + '!' : 'The ' + bot.name + ' got you') + '</h2><p>' + (unlocked ? 'Next bot unlocked: ' + BOTS[P.bot - 1].name + '. ' + BOTS[P.bot - 1].blurb : won ? (bot.lv === P.bot ? 'Bust this bot once more to unlock the next one.' : 'Try a tougher bot.') : 'Read the coach notes on your big hands and go again. ' + bot.blurb) + '</p></div>';
        $('#act', v).innerHTML = '<button class="btn primary" id="rm">' + (unlocked ? 'Play ' + BOTS[P.bot - 1].name : 'Rematch') + '</button><button class="btn" id="dn">Done</button>';
        $('#rm').onclick = function () { App.checkpoint(function () { App.back(); play(unlocked ? BOTS[P.bot - 1] : bot, casual); }); };
        $('#dn').onclick = function () { App.checkpoint(App.back); };
        if (unlocked && P.bot >= 4 && typeof WZ !== 'undefined') WZ.onlineNudge('poker');
      }
      function streetName() { return ['Preflop', 'Flop', 'Turn', 'River'][H.street]; }
      function render() {
        var hb = H.bets, rv = H.reveal;
        $('#tbl', v).innerHTML = '<div class="table">' +
          '<div class="seat"><span class="nm">' + (M.button === 1 ? '<span class="dealer">D</span>' : '') + bot.name + ' <span class="chips">$' + M.stacks[1] + '</span></span>' + cardsHTML(rv ? H.hole[1] : [null, null]) + (hb[1] ? '<span class="betchip">bet $' + hb[1] + '</span>' : '') + '</div>' +
          '<div class="cards">' + [0, 1, 2, 3, 4].map(function (i) { return H.board[i] != null ? cardHTML(H.board[i]) : '<span class="pcard" style="background:rgba(255,255,255,.07);box-shadow:none"></span>'; }).join('') + '</div>' +
          '<span class="pot">Pot $' + potTotal() + ' · ' + streetName() + '</span>' +
          '<div class="seat">' + (hb[0] ? '<span class="betchip">bet $' + hb[0] + '</span>' : '') + cardsHTML(H.hole[0], { big: true }) + '<span class="nm">' + (M.button === 0 ? '<span class="dealer">D</span>' : '') + 'You <span class="chips">$' + M.stacks[0] + '</span>' + (H.board.length >= 3 ? ' · ' + CAT[cat(evalHand(H.hole[0].concat(H.board)))] : ' · ' + handLabel(H.hole[0])) + '</span></div></div>';
        $('#log', v).textContent = H.log.slice(-4).join(' · ');
      }
      function step() {
        if (H.done) return;
        if (H.toAct === 1) { $('#act', v).innerHTML = '<div class="thinking">' + bot.name + ' is thinking</div>'; setTimeout(botAct, 650); }
        else heroControls();
      }
      function heroControls() {
        var tc = toCall(0), pt = potTotal(), cr = canRaise(0);
        var half = Math.round(H.bets[1] + 0.5 * (pt + tc)), full = Math.round(H.bets[1] + (pt + tc));
        if (H.street === 0 && tc <= 1 && H.bets[1] <= 2) { half = 6; full = 8; } // preflop opens: 3x and 4x
        var mt = minTo(0), mx = maxTo(0);
        function clamp(x) { return Math.max(mt, Math.min(mx, x)); }
        var html = '';
        if (tc > 0) html += '<button class="btn" data-a="fold">Fold</button>';
        html += tc > 0 ? '<button class="btn" data-a="call">Call $' + Math.min(tc, M.stacks[0]) + '</button>' : '<button class="btn" data-a="check">Check</button>';
        if (cr) {
          var label = tc > 0 || H.street === 0 ? 'Raise to $' : 'Bet $';
          var opts = uniq([clamp(half), clamp(full)]).filter(function (x) { return x < mx; });
          opts.forEach(function (x) { html += '<button class="btn" data-a="raise" data-to="' + x + '">' + label + x + '</button>'; });
          html += '<button class="btn primary" data-a="raise" data-to="' + mx + '">All-in $' + mx + '</button>';
        }
        $('#act', v).innerHTML = html;
        $$('[data-a]', v).forEach(function (b) { b.onclick = function () { heroAct({ type: b.dataset.a, to: +b.dataset.to }); }; });
        showHelp();
      }
      function villainMin() { return H.botAgg > 0 ? bot.raiseThr : H.street === 0 ? null : bot.callThr; }
      function heroAct(a) {
        if ($('#help', v)) $('#help', v).innerHTML = '';
        if (casual) { act(0, a); return; }
        $('#act', v).innerHTML = '<div class="thinking">Coach is reviewing</div>';
        var tc = toCall(0), pt = potTotal(), st = streetName();
        setTimeout(function () {
          var e = equity(H.hole[0], H.board, 700, villainMin());
          var d = grade(a, e, tc, pt);
          d.street = st; H.decs.push(d);
          P.dec.all++; var goodD = d.grade === 'best' || d.grade === 'good'; if (goodD) P.dec.good++;
          P.byStreet = P.byStreet || {}; var bs = P.byStreet[st] || { ok: 0, n: 0 }; bs.n++; if (goodD) bs.ok++; P.byStreet[st] = bs;
          P.byAct = P.byAct || {}; var ba = P.byAct[a.type] || { ok: 0, n: 0 }; ba.n++; if (goodD) ba.ok++; P.byAct[a.type] = ba;
          App.save();
          $('#co', v).innerHTML = App.coachHTML(d.grade, d.text, '<span class="small mute">' + st + '</span>');
          act(0, a);
        }, 20);
      }
      function pct(x) { return Math.round(x * 100) + '%'; }
      function grade(a, e, tc, pt) {
        var need = tc / (pt + tc), vs = H.botAgg > 0 ? 'the hands ' + bot.name + ' raises with' : 'a ' + bot.name + ' hand';
        var g, t, head = 'You had about <b>' + pct(e) + '</b> against ' + vs + '. ';
        if (H.street === 0 && H.botAgg === 0) {
          var c = chen(H.hole[0]);
          if (a.type === 'fold') { g = c >= 3 ? 'mistake' : 'good'; t = handLabel(H.hole[0]) + ' (Chen ' + c + '). ' + (c >= 3 ? 'Heads-up, ranges are wide. This hand is worth playing, especially for just $' + tc + ' more.' : 'Very weak hand: folding small blind is fine.'); return { grade: g, text: t }; }
          if (a.type === 'raise') { g = c >= 5 ? 'best' : c >= 3 ? 'good' : 'inacc'; t = handLabel(H.hole[0]) + ' (Chen ' + c + '). ' + (c >= 5 ? 'Strong heads-up hand. Raising builds the pot and takes control.' : c >= 3 ? 'Fine raise heads-up: you take the initiative.' : 'Very weak. A raise works as a bluff sometimes, but folding or checking is cheaper.'); return { grade: g, text: t }; }
          g = c >= 8 ? 'inacc' : 'good'; t = handLabel(H.hole[0]) + ' (Chen ' + c + '). ' + (c >= 8 ? 'Premium hand. Raise so weaker hands pay you more.' : 'Seeing a cheap flop is reasonable.'); return { grade: g, text: t };
        }
        if (tc > 0) {
          head += 'Calling needed <b>' + pct(need) + '</b> (you pay $' + tc + ' to win $' + (pt + tc) + '). ';
          if (a.type === 'fold') { if (e >= need + .07) { g = 'mistake'; t = head + 'You were getting a good price. Folding here gives up money over time.'; } else { g = 'best'; t = head + 'Good fold: your chance was below the price.'; } }
          else if (a.type === 'call') {
            if (e < need - .07) { g = 'mistake'; t = head + 'Too expensive for your chance. Folding saves chips.'; }
            else if (e > .7 && canRaise(0)) { g = 'good'; t = head + 'Calling is fine, but with this much equity a raise makes them pay more.'; }
            else { g = 'best'; t = head + 'Correct: your chance beats the price.'; }
          } else {
            if (e > .6) { g = 'best'; t = head + 'Strong raise for value: you’re usually ahead and they pay you.'; }
            else if (e >= need) { g = 'good'; t = head + 'A raise works: you have enough equity even when called, and they may fold.'; }
            else { g = bot.lv === 1 ? 'mistake' : 'inacc'; t = head + 'That’s a bluff-raise. ' + (bot.lv === 1 ? 'The Calling Station almost never folds, so bluffs lose money against him.' : 'It can work against tight players, but it’s risky here.'); }
          }
        } else {
          if (a.type === 'check') {
            if (e > .7) { g = 'inacc'; t = head + 'You’re likely ahead. Betting gets worse hands to pay you. Checking gives them a free card.'; }
            else { g = 'good'; t = head + 'Checking with a medium or weak hand keeps the pot small. Fine.'; }
          } else {
            var frac = (a.to - H.bets[1]) / pt;
            if (e > .55) { g = 'best'; t = head + 'Value bet: worse hands can call you.' + (frac > 1.2 ? ' Huge size though: smaller bets get called by more worse hands.' : ''); }
            else if (e < .35) { g = bot.lv === 1 ? 'mistake' : 'good'; t = head + 'That’s a bluff. ' + (bot.lv === 1 ? 'Don’t bluff a Calling Station: he calls with almost anything.' : bot.lv === 2 ? 'Good target: the Rock folds a lot.' : 'Bluffs need a believable story. Use them sometimes, not every hand.'); }
            else { g = 'good'; t = head + 'A middle-strength bet. Okay, but checking is often fine with hands like this.'; }
          }
        }
        return { grade: g, text: t };
      }
      function botAct() {
        if (H.done) return;
        var tc = toCall(1), pt = potTotal();
        var heroRange = H.heroAgg > 0 ? 5 : null;
        var e = equity(H.hole[1], H.board, 350, heroRange) + bot.loose;
        if ((bot.lv === 5 || bot.adapt) && H.heroAgg === 0 && H.street > 0) e += .06; // smells weakness
        if (bot.adapt && P.dec.all > 20) { var g = P.dec.good / P.dec.all; e += (g > .7 ? -.03 : .03); }
        var need = tc / (pt + tc), r = Math.random();
        var betTo = function (f) { return H.bets[0] + f * (pt + tc); };
        var a;
        if (H.street === 0 && tc <= 1 && H.bets[0] <= 2) { // first decision preflop on the button
          a = e > bot.aggr - .1 || r < bot.bluff ? { type: 'raise', to: 6 } : e > .38 - bot.loose ? { type: 'call' } : { type: 'fold' };
        } else if (tc > 0) {
          if (canRaise(1) && (e > bot.aggr + .05 || (r < bot.bluff * .4 && H.street < 3))) a = { type: 'raise', to: betTo(bot.frac + .3) };
          else if (e >= need - .02 || (H.street === 0 && tc <= 4 && e > .33)) a = { type: 'call' };
          else a = { type: 'fold' };
        } else {
          if (canRaise(1) && (e > bot.aggr - .05 || r < bot.bluff) && !(bot.trap && e > .85 && r < bot.trap && H.street < 3)) a = { type: 'raise', to: betTo(bot.frac) };
          else a = { type: 'check' };
        }
        if (a.type === 'raise' && !canRaise(1)) a = tc ? { type: 'call' } : { type: 'check' };
        act(1, a);
      }
      newHand();
    });
  }

  // ---------- multiway table: you and 2–5 bots, real positions, side pots, a coach on every decision ----------
  var POS_NAMES = { 3: ['BTN', 'SB', 'BB'], 4: ['BTN', 'SB', 'BB', 'CO'], 5: ['BTN', 'SB', 'BB', 'UTG', 'CO'], 6: ['BTN', 'SB', 'BB', 'UTG', 'HJ', 'CO'] };
  var POS_FULL = { BTN: 'Button', SB: 'Small blind', BB: 'Big blind', UTG: 'Under the gun', HJ: 'Hijack', CO: 'Cutoff' };
  var OPEN_CHEN = { UTG: 9, HJ: 8, CO: 7, BTN: 6, SB: 7, BB: 7 };   // first in: raise this Chen score or better from each seat
  function tableMenu() {
    App.screen('Poker table', function (v) {
      var p = stt(); p.multi = p.multi || { hands: 0, net: 0, size: 6 };
      v.innerHTML = '<p class="mute">A full ring: you against 2 to 5 bots, blinds $1/$2, 100 big blinds each. Position matters now: the later you act, the more hands you can play. Every decision is graded against how many players are still in.</p>' +
        '<span class="eyebrow">Players at the table</span><div class="seg" id="sz">' + [3, 4, 6].map(function (n) { return '<button aria-pressed="' + (p.multi.size === n) + '" data-n="' + n + '">' + n + (n === 6 ? '-max' : ' players') + '</button>'; }).join('') + '</div>' +
        '<div class="stats"><div class="stat"><span class="v">' + p.multi.hands + '</span><span class="k">Table hands</span></div><div class="stat"><span class="v">' + (p.multi.net >= 0 ? '+$' : '−$') + Math.abs(p.multi.net) + '</span><span class="k">Net at tables</span></div></div>' +
        '<p class="small mute">The bots are the personalities you have unlocked in heads-up, mixed at random. Busted bots rebuy, so the game keeps going.</p><button class="btn primary" id="go" style="width:100%">Sit down</button>';
      $$('[data-n]', v).forEach(function (b) { b.onclick = function () { p.multi.size = +b.dataset.n; App.save(); $$('[data-n]', v).forEach(function (q) { q.setAttribute('aria-pressed', q === b); }); }; });
      $('#go', v).onclick = function () { playMulti(p.multi.size); };
    });
  }
  // small cards for the bots' seats so six players fit on a phone
  function miniCards(cs) {
    return '<span style="display:inline-flex;gap:3px">' + cs.map(function (c) {
      var base = 'display:inline-flex;align-items:center;justify-content:center;width:26px;height:36px;border-radius:5px;font:700 12px/1 var(--mono);';
      if (c == null) return '<span style="' + base + 'background:repeating-linear-gradient(45deg,#8e2a2a 0 3px,#a83636 3px 6px);border:2px solid #f4efe6"></span>';
      return '<span style="' + base + 'flex-direction:column;background:#f8f5ee;color:' + (su(c) === 1 || su(c) === 2 ? '#c0322b' : '#151925') + '" aria-label="' + cstr(c) + '">' + rname(rk(c)) + '<span style="font-size:11px">' + SUIT[su(c)] + '</span></span>';
    }).join('') + '</span>';
  }
  function playMulti(n) {
    App.screen(n + '-player table', function (v) {
      var P = stt(); P.multi = P.multi || { hands: 0, net: 0, size: n };
      var pool = BOTS.filter(function (b) { return b.lv <= Math.max(2, P.bot); }), used = {};
      var seats = [{ name: 'You', bot: null }];
      var deal = shuffle(pool.slice());   // different personalities first; repeats only when the table is bigger than the pool
      for (var i = 1; i < n; i++) { var b = deal[(i - 1) % deal.length]; used[b.name] = (used[b.name] || 0) + 1; seats.push({ name: b.name + (used[b.name] > 1 ? ' ' + used[b.name] : ''), bot: b }); }
      var M = { stacks: seats.map(function () { return 200; }), button: Math.floor(Math.random() * n), rebuys: 0 };
      var H, helperOn = P.helper !== false;
      v.innerHTML = '<div class="pkplay" style="display:flex;flex-direction:column;gap:12px"><div id="tbl"></div><div class="pkctl"><div id="help"></div><div id="act" class="btns"></div><div id="co"></div><div id="log" class="small mute"></div></div></div>';
      function nx(i) { return (i + 1) % n; }
      function pos(i) { return POS_NAMES[n][(i - M.button + n) % n]; }
      function live(i) { return !H.folded[i]; }
      function canAct(i) { return !H.folded[i] && M.stacks[i] > 0; }
      function inHand() { var c = 0; for (var i = 0; i < n; i++) if (live(i)) c++; return c; }
      function nextToAct(i) { for (var k = 1; k <= n; k++) { var j = (i + k) % n; if (canAct(j)) return j; } return -1; }
      function potTotal() { return H.pot + H.bets.reduce(function (a, b) { return a + b; }, 0); }
      function toCall(p) { return Math.max(0, H.cur - H.bets[p]); }
      function post(p, a) { a = Math.min(a, M.stacks[p]); M.stacks[p] -= a; H.bets[p] += a; H.contrib[p] += a; }
      function newHand() {
        if (M.stacks[0] <= 0) return busted();
        for (var i = 1; i < n; i++) if (M.stacks[i] <= 0) { M.stacks[i] = 200; }   // bots rebuy
        M.button = nx(M.button);
        var d = shuffle(deck()), hole = [];
        for (i = 0; i < n; i++) hole.push([d[2 * i], d[2 * i + 1]]);
        H = { deck: d, dpos: 2 * n, hole: hole, board: [], pot: 0, bets: seats.map(function () { return 0; }), contrib: seats.map(function () { return 0; }), folded: seats.map(function () { return false; }), acted: seats.map(function () { return false; }), street: 0, cur: 2, lastRaise: 2, raised: false, aggr: -1, done: false, decs: [], start: M.stacks.slice(), log: [] };
        var sb = nx(M.button), bb = nx(sb);
        post(sb, 1); post(bb, 2);
        H.toAct = nextToAct(bb);
        $('#co', v).innerHTML = ''; render();
        $('#log', v).textContent = 'You are ' + POS_FULL[pos(0)] + ' (' + pos(0) + ').';
        step();
      }
      function act(p, a) {
        var nm = seats[p].name, tc = toCall(p);
        if (a.type === 'fold') { H.folded[p] = true; H.log.push(nm + ' fold'); }
        else if (a.type === 'check') { H.log.push(nm + ' check'); }
        else if (a.type === 'call') { post(p, tc); H.log.push(nm + ' call $' + Math.min(tc, H.bets[p])); }
        else {
          var to = Math.max(Math.min(H.bets[p] + M.stacks[p], H.cur + H.lastRaise), Math.min(H.bets[p] + M.stacks[p], Math.round(a.to)));
          if (to - H.cur > H.lastRaise) H.lastRaise = to - H.cur;
          post(p, to - H.bets[p]);
          if (H.bets[p] > H.cur) { H.cur = H.bets[p]; H.raised = true; H.aggr = p; for (var i = 0; i < n; i++) if (i !== p) H.acted[i] = false; }
          H.log.push(nm + (tc ? ' raise to $' : ' bet $') + H.bets[p] + (M.stacks[p] === 0 ? ' (all-in)' : ''));
        }
        H.acted[p] = true;
        if (inHand() === 1) { for (var w = 0; w < n; w++) if (live(w)) return win([w], seats[w].name === 'You' ? 'Everyone folded to you.' : 'Everyone else folded.'); }
        var open = false; for (var j = 0; j < n; j++) if (canAct(j) && (!H.acted[j] || H.bets[j] < H.cur)) open = true;
        if (!open) return endStreet();
        H.toAct = nextToAct(p); render(); step();
      }
      function endStreet() {
        H.pot += H.bets.reduce(function (a, b) { return a + b; }, 0); H.bets = H.bets.map(function () { return 0; }); H.cur = 0; H.lastRaise = 2; H.raised = false; H.aggr = -1;
        H.acted = H.acted.map(function () { return false; });
        var withChips = 0; for (var i = 0; i < n; i++) if (canAct(i)) withChips++;
        if (H.street === 3) return showdown();
        if (withChips <= 1) { while (H.board.length < 5) H.board.push(H.deck[H.dpos++]); H.street = 3; return showdown(); }
        H.street++;
        var k = H.street === 1 ? 3 : 1; for (i = 0; i < k; i++) H.board.push(H.deck[H.dpos++]);
        H.toAct = nextToAct(M.button); render(); step();
      }
      // side pots: each contribution level is its own pot, won by the best hand among players who put in that much
      function showdown() {
        H.reveal = true;
        var score = seats.map(function (s, i) { return live(i) ? evalHand(H.hole[i].concat(H.board)) : -1; });
        var levels = H.contrib.filter(function (c, i) { return c > 0; }).sort(function (a, b) { return a - b; }).filter(function (x, i, a) { return a.indexOf(x) === i; });
        var prev = 0, won = seats.map(function () { return 0; }), lines = [];
        levels.forEach(function (L) {
          var amt = 0; H.contrib.forEach(function (c) { amt += Math.max(0, Math.min(c, L) - Math.min(c, prev)); });
          var elig = []; for (var i = 0; i < n; i++) if (live(i) && H.contrib[i] >= L) elig.push(i);
          if (!elig.length) { var hi = -1; for (i = 0; i < n; i++) if (live(i) && (hi < 0 || H.contrib[i] > H.contrib[hi])) hi = i; elig = [hi]; }
          var best = Math.max.apply(null, elig.map(function (i) { return score[i]; })), ws = elig.filter(function (i) { return score[i] === best; });
          var share = Math.floor(amt / ws.length); ws.forEach(function (w, k) { won[w] += share + (k === 0 ? amt - share * ws.length : 0); });
          if (amt) lines.push((lines.length ? 'Side pot' : 'Main pot') + ' $' + amt + ' → ' + ws.map(function (w) { return seats[w].name; }).join(' & ') + ' (' + CAT[cat(best)].toLowerCase() + ')');
          prev = L;
        });
        won.forEach(function (x, i) { M.stacks[i] += x; });
        finishHand(lines.join('. ') + '.');
      }
      function win(ws, why) { M.stacks[ws[0]] += H.pot + H.bets.reduce(function (a, b) { return a + b; }, 0); H.pot = 0; H.bets = H.bets.map(function () { return 0; }); finishHand(why); }
      function finishHand(why) {
        H.done = true; P.multi.hands++; P.hands++;
        var net = M.stacks[0] - H.start[0]; P.multi.net += net; P.chips += net; App.save();
        if ($('#help', v)) $('#help', v).innerHTML = '';
        render();
        var good = H.decs.filter(function (d) { return d.grade === 'best' || d.grade === 'good'; }).length;
        $('#co', v).innerHTML = '<div class="panel"><div class="row"><h3 class="grow">' + (net > 0 ? 'You won $' + net : net < 0 ? 'You lost $' + (-net) : 'Even') + '</h3><span class="pill">' + good + '/' + H.decs.length + ' good decisions</span></div><p class="small">' + esc(why) + '</p>' +
          (H.decs.length ? '<div class="list">' + H.decs.map(function (d) { return App.coachHTML(d.grade, d.text, '<span class="small mute">' + d.street + '</span>'); }).join('') + '</div>' : '') +
          '<p class="small mute">With more players, someone has a strong hand more often. Play tighter early, looser late.</p></div>';
        $('#act', v).innerHTML = '<button class="btn primary" id="nh">Next hand</button><button class="btn" id="lv">Leave table</button>';
        $('#nh', v).onclick = function () { App.checkpoint(newHand); };
        $('#lv', v).onclick = function () { App.checkpoint(App.back); };
      }
      function busted() {
        $('#tbl', v).innerHTML = ''; $('#help', v).innerHTML = '';
        $('#co', v).innerHTML = '<div class="panel"><h2>You’re out of chips</h2><p>Look back at the hands where you put the most in: was it the right price for how many players were still in? Rebuy and keep going.</p></div>';
        $('#act', v).innerHTML = '<button class="btn primary" id="rb">Rebuy $200</button><button class="btn" id="lv">Leave table</button>';
        $('#rb', v).onclick = function () { M.stacks[0] = 200; M.rebuys++; P.multi.net -= 0; newHand(); };
        $('#lv', v).onclick = function () { App.checkpoint(App.back); };
      }
      function streetName() { return ['Preflop', 'Flop', 'Turn', 'River'][H.street]; }
      function render() {
        var rv = H.reveal;
        var bots = seats.map(function (s, i) {
          if (i === 0) return '';
          var st = H.folded[i] ? 'Folded' : M.stacks[i] === 0 && H.contrib[i] ? 'All-in' : '';
          return '<div class="seat" style="gap:3px;opacity:' + (H.folded[i] ? .45 : 1) + ';' + (H.toAct === i && !H.done ? 'outline:2px solid var(--accent);outline-offset:3px;border-radius:10px' : '') + '"><span class="nm" style="font-size:11px;gap:4px">' + (M.button === i ? '<span class="dealer" style="width:16px;height:16px;line-height:16px;font-size:9px">D</span>' : '') + esc(s.name) + '</span><span class="small mono" style="font-size:11px;color:#e9e3d6">' + pos(i) + ' · $' + M.stacks[i] + '</span>' +
            miniCards(rv && !H.folded[i] ? H.hole[i] : [null, null]) +
            '<span class="betchip" style="font-size:11px;min-height:14px">' + (H.bets[i] ? '$' + H.bets[i] : st) + '</span></div>';
        }).join('');
        $('#tbl', v).innerHTML = '<div class="table" style="gap:8px;padding:10px">' +
          '<div style="display:grid;grid-template-columns:repeat(' + Math.min(3, n - 1) + ',minmax(0,1fr));gap:6px;width:100%">' + bots + '</div>' +
          '<div class="cards">' + [0, 1, 2, 3, 4].map(function (i) { return H.board[i] != null ? cardHTML(H.board[i]) : '<span class="pcard" style="background:rgba(255,255,255,.07);box-shadow:none"></span>'; }).join('') + '</div>' +
          '<span class="pot">Pot $' + potTotal() + ' · ' + streetName() + ' · ' + inHand() + ' in</span>' +
          '<div class="seat">' + (H.bets[0] ? '<span class="betchip">bet $' + H.bets[0] + '</span>' : '') + cardsHTML(H.hole[0], { big: true }) + '<span class="nm">' + (M.button === 0 ? '<span class="dealer">D</span>' : '') + 'You · ' + pos(0) + ' <span class="chips">$' + M.stacks[0] + '</span>' + (H.board.length >= 3 ? ' · ' + CAT[cat(evalHand(H.hole[0].concat(H.board)))] : ' · ' + handLabel(H.hole[0])) + '</span></div></div>';
        $('#log', v).textContent = H.log.slice(-5).join(' · ');
      }
      function step() {
        if (H.done) return;
        if (H.toAct !== 0) { $('#act', v).innerHTML = '<div class="thinking">' + esc(seats[H.toAct].name) + ' is thinking</div>'; setTimeout(botAct, 550); }
        else heroControls();
      }
      function opps() { return inHand() - 1; }
      function aggrMin() { return H.aggr > 0 && seats[H.aggr].bot ? seats[H.aggr].bot.raiseThr : null; }
      function heroControls() {
        var tc = toCall(0), pt = potTotal(), mx = H.bets[0] + M.stacks[0], mt = Math.min(mx, H.cur + H.lastRaise);
        var half = Math.round(H.cur + 0.5 * (pt + tc)), full = Math.round(H.cur + (pt + tc));
        if (H.street === 0 && !H.raised) { half = 6; full = 8; }
        function clamp(x) { return Math.max(mt, Math.min(mx, x)); }
        var html = '';
        if (tc > 0) html += '<button class="btn" data-a="fold">Fold</button>';
        html += tc > 0 ? '<button class="btn" data-a="call">Call $' + Math.min(tc, M.stacks[0]) + '</button>' : '<button class="btn" data-a="check">Check</button>';
        if (M.stacks[0] > tc) {
          var label = tc > 0 || H.street === 0 ? 'Raise to $' : 'Bet $';
          uniq([clamp(half), clamp(full)]).filter(function (x) { return x < mx; }).forEach(function (x) { html += '<button class="btn" data-a="raise" data-to="' + x + '">' + label + x + '</button>'; });
          html += '<button class="btn primary" data-a="raise" data-to="' + mx + '">All-in $' + mx + '</button>';
        }
        $('#act', v).innerHTML = html;
        $$('[data-a]', v).forEach(function (b) { b.onclick = function () { heroAct({ type: b.dataset.a, to: +b.dataset.to }); }; });
        showHelp();
      }
      function showHelp() {
        var el = $('#help', v); if (!el) return;
        if (H.done || H.toAct !== 0) { el.innerHTML = ''; return; }
        if (!helperOn) { el.innerHTML = '<button class="btn sm ghost" id="hon">Show table coach</button>'; $('#hon', v).onclick = function () { helperOn = true; showHelp(); }; return; }
        var tc = toCall(0), pt = potTotal(), rows = [['Seat', POS_FULL[pos(0)] + ' · ' + opps() + ' opponent' + (opps() === 1 ? '' : 's') + ' still in']];
        if (!H.board.length) rows.push(['Your hand', handLabel(H.hole[0]) + ' · Chen ' + chen(H.hole[0]) + (H.raised && H.cur > 2 ? '' : ' · open from ' + pos(0) + ' with Chen ' + OPEN_CHEN[pos(0)] + '+')]);
        else rows.push(['Your hand', CAT[cat(evalHand(H.hole[0].concat(H.board)))]]);
        if (tc > 0) rows.push(['Price', 'Call $' + tc + ' to win $' + (pt + tc) + ' → need ' + Math.round(100 * tc / (pt + tc)) + '%']);
        rows.push(['Multiway rule', opps() >= 3 ? 'Against 3+ players, bluffs rarely work and one pair is often beaten. Bet strong hands, draw cheaply, fold the rest.' : 'Fewer players: medium hands go up in value; position helps you steal.']);
        el.innerHTML = '<div class="panel" style="gap:6px;padding:10px 12px"><div class="row"><span class="eyebrow grow">Table coach</span><button class="btn sm ghost" id="hoff">Hide</button></div>' + rows.map(function (r) { return '<div class="small"><b>' + r[0] + ':</b> ' + r[1] + '</div>'; }).join('') + '<div class="row"><button class="btn sm" id="pro">What would a pro do?</button></div><div id="prot" class="small"></div></div>';
        $('#hoff', v).onclick = function () { helperOn = false; showHelp(); };
        $('#pro', v).onclick = function () { var e = equity(H.hole[0], H.board, 500, aggrMin(), opps()), need = tc / (pt + tc); $('#prot', v).innerHTML = '<b>Pro move:</b> ' + (tc > 0 ? (e >= need + 0.15 && e * (opps() + 1) > 1.6 ? 'Raise for value: ' : e >= need ? 'Call: ' : 'Fold: ') : (e * (opps() + 1) > 1.5 ? 'Bet for value: ' : 'Check: ')) + 'you win about ' + Math.round(e * 100) + '% against ' + opps() + ' player' + (opps() === 1 ? '' : 's') + (tc > 0 ? ' and need ' + Math.round(need * 100) + '%.' : '.'); };
      }
      function heroAct(a) {
        if ($('#help', v)) $('#help', v).innerHTML = '';
        $('#act', v).innerHTML = '<div class="thinking">Coach is reviewing</div>';
        var tc = toCall(0), pt = potTotal(), st = streetName();
        setTimeout(function () {
          var e = equity(H.hole[0], H.board, 600, aggrMin(), opps()), d = grade(a, e, tc, pt);
          d.street = st + ' · ' + pos(0); H.decs.push(d);
          P.dec.all++; var good = d.grade === 'best' || d.grade === 'good'; if (good) P.dec.good++;
          P.byStreet = P.byStreet || {}; var bs = P.byStreet[st] || { ok: 0, n: 0 }; bs.n++; if (good) bs.ok++; P.byStreet[st] = bs;
          App.save();
          $('#co', v).innerHTML = App.coachHTML(d.grade, d.text, '<span class="small mute">' + d.street + '</span>');
          act(0, a);
        }, 20);
      }
      function grade(a, e, tc, pt) {
        var o = opps(), need = tc / (pt + tc), fair = 1 / (o + 1), pc = function (x) { return Math.round(x * 100) + '%'; };
        var head = 'Against ' + o + ' player' + (o === 1 ? '' : 's') + ' you had about <b>' + pc(e) + '</b> (an average hand here wins ' + pc(fair) + '). ';
        if (H.street === 0) {
          var c = chen(H.hole[0]), ps = pos(0), open = OPEN_CHEN[ps], facing = H.raised && H.cur > 2;
          if (!facing) {
            if (a.type === 'fold') return tc === 0 ? { grade: 'inacc', text: 'You could check for free in the big blind. Never fold when checking costs nothing.' } : { grade: c >= open ? 'mistake' : 'good', text: handLabel(H.hole[0]) + ' (Chen ' + c + ') from ' + POS_FULL[ps] + '. ' + (c >= open ? 'Strong enough to open from this seat (Chen ' + open + '+ here).' : 'Fine fold: from ' + ps + ' you open Chen ' + open + '+.') };
            if (a.type === 'raise') return { grade: c >= open ? 'best' : c >= open - 2 ? 'inacc' : 'mistake', text: handLabel(H.hole[0]) + ' (Chen ' + c + ') from ' + POS_FULL[ps] + '. ' + (c >= open ? 'Good open: raising takes the initiative.' : 'Too loose for this seat: with ' + (n - 1) + ' opponents, open Chen ' + open + '+ from ' + ps + '. Later seats can play more hands.') };
            return { grade: tc === 0 ? (c >= 8 ? 'inacc' : 'good') : c >= open ? 'inacc' : c >= open - 2 ? 'good' : 'mistake', text: handLabel(H.hole[0]) + ' (Chen ' + c + '). ' + (tc === 0 ? (c >= 8 ? 'Strong hand: raise the limpers instead of checking.' : 'Checking your option is fine.') : c >= open ? 'Raise rather than limp: limping invites everyone in cheaply.' : 'Limping into a multiway pot with a weak hand loses money over time.') };
          }
          var callT = OPEN_CHEN[ps] + 1, threeT = 10;
          if (a.type === 'fold') return { grade: c >= callT ? 'mistake' : 'good', text: handLabel(H.hole[0]) + ' (Chen ' + c + ') facing a raise. ' + (c >= callT ? 'Too strong to fold here.' : 'Good fold: vs a raise with players behind, you need Chen ' + callT + '+ to continue.') };
          if (a.type === 'raise') return { grade: c >= threeT ? 'best' : c >= callT + 1 ? 'good' : 'mistake', text: handLabel(H.hole[0]) + ' (Chen ' + c + '). ' + (c >= threeT ? 'Strong 3-bet: premium hands want a big pot.' : c >= callT + 1 ? 'A 3-bet works, though calling is fine too.' : 'Too weak to re-raise into a raiser with others still to act.') };
          return { grade: c >= threeT ? 'inacc' : c >= callT ? 'good' : 'mistake', text: handLabel(H.hole[0]) + ' (Chen ' + c + '). ' + (c >= threeT ? 'Premium hand: 3-bet so worse hands pay more.' : c >= callT ? 'Reasonable call.' : 'Calling a raise with a weak hand, out of line with players behind, bleeds chips.') };
        }
        if (tc > 0) {
          head += 'Calling needed <b>' + pc(need) + '</b>. ';
          if (a.type === 'fold') return e >= need + .06 ? { grade: 'mistake', text: head + 'The price was good: folding gives up money over time.' } : { grade: 'best', text: head + 'Good fold: below the price.' };
          if (a.type === 'call') return e < need - .06 ? { grade: 'mistake', text: head + 'Too expensive for your chance.' } : e > fair * 1.8 ? { grade: 'good', text: head + 'Fine, but you are well ahead of the field: raise to charge the draws.' } : { grade: 'best', text: head + 'Correct: your chance beats the price.' };
          return e > fair * 1.6 ? { grade: 'best', text: head + 'Strong raise: you are well ahead of an average hand here.' } : e >= need ? { grade: 'good', text: head + 'The raise is okay; calling keeps the pot smaller.' } : { grade: 'mistake', text: head + 'A bluff-raise into ' + o + ' players rarely works: someone usually has something.' };
        }
        if (a.type === 'check') return e > fair * 1.7 ? { grade: 'inacc', text: head + 'You are well ahead: bet so the others pay to draw.' } : { grade: 'good', text: head + 'Checking a medium hand in a multiway pot is fine.' };
        return e > fair * 1.4 ? { grade: 'best', text: head + 'Value bet: plenty of worse hands can call.' } : o >= 2 && e < fair ? { grade: 'mistake', text: head + 'A bluff into ' + o + ' players: with this many, someone usually calls.' } : { grade: 'good', text: head + 'Okay bet. With weaker hands, checking keeps the pot small.' };
      }
      function botAct() {
        if (H.done) return;
        var p = H.toAct, b = seats[p].bot, tc = toCall(p), pt = potTotal(), o = opps(), r = Math.random();
        var need = tc / (pt + tc), a;
        if (H.street === 0) {
          var c = chen(H.hole[p]) + b.loose * 20, ps = pos(p), open = OPEN_CHEN[ps];
          if (!H.raised || H.cur <= 2) a = c >= open || r < b.bluff * .5 ? { type: 'raise', to: 6 + 2 * (n - 3 > 0 ? 1 : 0) } : tc === 0 ? { type: 'check' } : (ps === 'SB' && c >= open - 2) ? { type: 'call' } : { type: 'fold' };
          else a = c >= b.raiseThr + 2 && r < .7 ? { type: 'raise', to: H.cur * 3 } : c >= Math.max(b.callThr, open - 1) ? { type: 'call' } : { type: 'fold' };
        } else {
          var e = equity(H.hole[p], H.board, 220, H.aggr >= 0 && H.aggr !== p ? 7 : null, o) + b.loose, rel = e * (o + 1);
          if (tc > 0) a = rel > 1.9 && M.stacks[p] > tc ? { type: 'raise', to: H.cur + b.frac * (pt + tc) } : e >= need - .02 ? { type: 'call' } : { type: 'fold' };
          else a = rel > 1.35 || (o <= 1 && r < b.bluff) ? { type: 'raise', to: Math.max(2, Math.round(b.frac * pt)) } : { type: 'check' };
        }
        if (a.type === 'raise' && M.stacks[p] <= tc) a = { type: 'call' };
        if (a.type === 'check' && tc > 0) a = { type: 'call' };
        act(p, a);
      }
      window.__mw = function () { return { stacks: M.stacks.slice(), start: H.start.slice(), pot: potTotal(), done: H.done }; };   // read-only peek for the test suite
      newHand();
    });
  }

  function place() {
    var order = ['name', 'cmp', 'pre', 'outs', 'odds', 'eq', 'concept', 'odds'], i = 0, miss = 0, passed = 0;
    App.screen('Poker placement', function (v) {
      function ask() {
        if (i >= order.length || miss >= 2) return done();
        var q = GEN[order[i]]();
        var html = q.hero ? '<div class="table" style="border-radius:22px">' + (q.vill ? '<div class="seat"><span class="nm">Villain</span>' + cardsHTML(q.vill) + '</div>' : '') + (q.board && q.board.length ? cardsHTML(q.board) : '') + '<div class="seat">' + cardsHTML(q.hero, { big: true }) + '<span class="nm">You</span></div></div>' : '';
        v.innerHTML = '<div class="row"><span class="pill acc">Placement ' + (i + 1) + ' / ' + order.length + '</span><span class="pill">' + INTRO[order[i]][0] + '</span></div>' + html + '<h3>' + q.q + '</h3><div class="list">' + q.opts.map(function (o, k) { return '<button class="btn opt" data-k="' + k + '">' + o + '</button>'; }).join('') + App.idkBtn('k') + '<button class="btn ghost" data-k="-1">Not sure</button></div><div id="fb"></div>';
        var done1 = false;
        $$('[data-k]', v).forEach(function (b) {
          b.onclick = function () {
            if (done1) return; done1 = true;
            var ok = +b.dataset.k >= 0 && q.opts[+b.dataset.k] === q.ans;
            if (ok) passed = i + 1; else miss++;
            $$('[data-k]', v).forEach(function (x) { if (q.opts[+x.dataset.k] === q.ans) x.classList.add('right'); else if (x === b) x.classList.add('wrong'); });
            $('#fb', v).innerHTML = App.coachHTML(ok ? 'right' : 'wrong', q.why) + '<button class="btn primary" id="nx" style="width:100%">Next</button>';
            $('#nx', v).onclick = function () { i++; ask(); };
          };
        });
      }
      function done() {
        var p = stt(); p.placed = 1;
        p.level = Math.max(p.level, Math.min(8, 1 + passed));
        order.slice(0, passed).forEach(function (t) { p.seen[t] = 1; });
        if (p.level >= 5) p.bot = Math.max(p.bot, 2);
        if (p.level >= 7) p.bot = Math.max(p.bot, 3);
        App.save();
        v.innerHTML = '<div class="panel"><span class="eyebrow">Placement done</span><h1>Level ' + p.level + ' · ' + title(p.level) + '</h1><p>You cleared ' + passed + ' skill' + (passed === 1 ? '' : 's') + ' in a row. Drills start here and level you up after 5 correct in a row.</p><button class="btn primary" id="gh">Go to poker</button></div>';
        $('#gh', v).onclick = function () { App.tab('poker'); };
      }
      ask();
    });
  }
  function report() {
    var p = stt(), out = [];
    var kinds = Object.keys(p.kinds || {}).filter(function (k) { return p.kinds[k].n >= 3; }).map(function (k) { return { k: k, r: p.kinds[k].ok / p.kinds[k].n }; }).sort(function (a, b) { return a.r - b.r; });
    if (kinds.length && kinds[0].r < 0.8) out.push({ sev: 1 - kinds[0].r, text: 'Weakest drill: <b>' + (INTRO[kinds[0].k] ? INTRO[kinds[0].k][0] : kinds[0].k) + '</b> (' + Math.round(100 * kinds[0].r) + '%). It now shows up three times as often.', action: 'Train drills', go: drills });
    var streets = Object.keys(p.byStreet || {}).filter(function (k) { return p.byStreet[k].n >= 5; }).map(function (k) { return { k: k, r: p.byStreet[k].ok / p.byStreet[k].n }; }).sort(function (a, b) { return a.r - b.r; });
    if (streets.length && streets[0].r < 0.75) out.push({ sev: 1 - streets[0].r, text: 'Your decisions are weakest on the <b>' + streets[0].k.toLowerCase() + '</b> (' + Math.round(100 * streets[0].r) + '% good). ' + ({ Preflop: 'Review opening ranges and 3-betting.', Flop: 'Think about board texture before you act.', Turn: 'Count outs and compare with the price before calling.', River: 'River is arithmetic: value or bluff-catch, nothing in between.' }[streets[0].k] || ''), action: 'Play heads-up', go: botMenu });
    var acts = Object.keys(p.byAct || {}).filter(function (k) { return p.byAct[k].n >= 5; }).map(function (k) { return { k: k, r: p.byAct[k].ok / p.byAct[k].n }; }).sort(function (a, b) { return a.r - b.r; });
    if (acts.length && acts[0].r < 0.7) out.push({ sev: 1 - acts[0].r, text: ({ fold: 'You fold too often when the price is right.', call: 'You call too often without the equity.', raise: 'Your raises are often bluffs that do not add up.', check: 'You check strong hands and give free cards.' }[acts[0].k] || '') + ' (' + Math.round(100 * acts[0].r) + '% of your ' + acts[0].k + 's were good.)', action: 'Learn: Pot odds', go: function () { App.modal('<div class="grab"></div><h2>' + INTRO.odds[0] + '</h2><p>' + INTRO.odds[1] + '</p><button class="btn" id="cl">Close</button>'); App.$('#cl').onclick = App.closeModal; } });
    if (!out.length) out.push({ sev: 0, text: p.total < 10 ? 'Not enough data yet. Do a dozen drills and a few hands and the coach will map your leaks.' : 'No glaring leak right now. Keep leveling the drills and move up a bot.', action: 'Train drills', go: drills });
    return out.sort(function (a, b) { return b.sev - a.sev; });
  }
  function quick() {
    var P = stt(), out = [], rep = report()[0]; P.course = P.course || {};
    var nx = COURSE.findIndex(function (c, i) { return !P.course[i]; });
    if (nx >= 0 && courseOpen(nx)) out.push({ label: 'Poker lesson: ' + COURSE[nx].t, why: COURSE[nx].u + ' · read it, then 6 questions.', go: function () { lessonPK(nx); }, quota: 1, w: 1.8 });
    out.push({ label: 'Poker drills', why: rep.sev > 0.15 ? rep.text : 'Level ' + P.level + ' mix; your weakest types come up more.', go: drills, quota: 8, w: 1.4 });
    if (P.bot >= 2) out.push({ label: (P.multi && P.multi.size || 6) + '-player table', why: 'Real positions and side pots: open tight early, wider late, and price your draws against the whole field.', go: function () { playMulti((P.multi && P.multi.size) || 6); }, quota: 6, w: 0.9 });
    out.push({ label: 'Heads-up vs ' + BOTS[Math.min(P.bot, BOTS.length) - 1].name, why: 'Table coach on: outs, odds and what beats you before every decision.', go: function () { play(BOTS[Math.min(P.bot, BOTS.length) - 1], false); }, quota: 6, w: 1.1 });
    return out;
  }
  // ---------- baseline test (Oct 18): climbs the 12 drill levels one question at a time; a miss gets one more try at that level,
  // two misses at a level stop it. Levels you clear set your drill level, mark their skills seen and their course lessons done.
  function baseline() {
    var lv = 1, missHere = 0, cleared = 0, n = 0, usedT = {};
    App.screen('Poker baseline', function (v) {
      v.innerHTML = '<div><span class="eyebrow">Baseline · about 5 minutes</span><h1>Find your poker level</h1></div><div class="prose"><ul><li>Questions climb from hand rankings to pot odds, ranges and bet sizing.</li><li>Clear a level and its lessons count as done. Two misses on one level and the test stops there: that’s where you start.</li><li>Every question lists the poker words in it. “I don’t know” is fine.</li></ul></div><button class="btn primary" id="blgo" style="width:100%">Start</button>';
      $('#blgo', v).onclick = ask;
      function ask() {
        if (lv > 12 || missHere >= 2) return done();
        var types = typesFor(lv), fresh = types.filter(function (t) { return !usedT[lv + t]; }), t = pick(fresh.length ? fresh : types); usedT[lv + t] = 1; n++;
        var q = GEN[t]();
        v.innerHTML = '<div class="row"><span class="pill acc">Baseline · level ' + lv + '</span><span class="pill">' + INTRO[t][0] + '</span><span class="grow"></span><span class="small mute">' + n + '</span></div>' + qTable(q) + '<h3>' + q.q + '</h3>' + KW([q.q].concat(q.opts)) + '<div class="list">' + q.opts.map(function (o, k) { return '<button class="btn opt" data-k="' + k + '">' + o + '</button>'; }).join('') + App.idkBtn('k') + '</div><div id="fb"></div>';
        var answered = false;
        $$('[data-k]', v).forEach(function (b) {
          b.onclick = function () {
            if (answered) return; answered = true;
            var ok = +b.dataset.k >= 0 && q.opts[+b.dataset.k] === q.ans;
            $$('[data-k]', v).forEach(function (x) { if (q.opts[+x.dataset.k] === q.ans) x.classList.add('right'); else if (x === b) x.classList.add('wrong'); });
            $('#fb', v).innerHTML = App.coachHTML(ok ? 'right' : 'wrong', q.why) + '<button class="btn primary" id="nx" style="width:100%">Next</button>';
            $('#nx', v).onclick = function () { if (ok) { cleared = lv; lv++; missHere = 0; } else missHere++; ask(); };
            $('#nx', v).scrollIntoView({ block: 'nearest' });
          };
        });
      }
      function done() {
        var P = stt(); P.course = P.course || {};
        P.level = Math.max(1, Math.min(12, cleared + 1)); P.streak = 0; P.wrongRun = 0;
        for (var l = 1; l <= cleared; l++) typesFor(l).forEach(function (t) { P.seen[t] = 1; });
        var tested = 0; COURSE.forEach(function (c, i) { if (c.lv <= cleared && !P.course[i]) { P.course[i] = 1; tested++; } });
        if (P.level >= 5) P.bot = Math.max(P.bot, 2); if (P.level >= 7) P.bot = Math.max(P.bot, 3);
        App.save();
        var nx = COURSE.findIndex(function (c, i) { return !P.course[i]; });
        App.baselineSave('poker', { headline: 'Level ' + P.level + ' · ' + title(P.level) + ' · cleared ' + cleared + ' of 12', level: P.level, cleared: cleared,
          lines: ['<b>Levels cleared:</b> ' + cleared + ' of 12 (' + (cleared ? typesFor(cleared).map(function (t) { return INTRO[t][0]; }).join(', ') + ' and everything before' : 'start from hand rankings') + ').', '<b>Drill level:</b> ' + P.level + ' · ' + title(P.level) + '.', '<b>Course lessons already known:</b> ' + tested + '.'],
          next: nx >= 0 ? 'the lesson <b>' + COURSE[nx].t + '</b> (' + COURSE[nx].u + '). Play now builds from there.' : 'drills at your level and the table coach.' });
        App.back(); App.baselineReport('poker');
      }
    });
  }
  if (typeof App !== 'undefined') App.reg('poker', { home: home, place: place, baseline: baseline, report: report, quick: quick });
  if (typeof applyDistract === 'function') { applyDistract(EXTRA_CONCEPTS, 1, 2); applyDistract(READS, 0, 1); }
  return { baseline: baseline, tableMenu: tableMenu, playMulti: playMulti, cardsHTML: cardsHTML, evalHand: evalHand, cat: cat, chen: chen, equity: equity, outsInfo: outsInfo, GEN: GEN, CAT: CAT, course: course, lessonPK: lessonPK, COURSE: COURSE, drills: drills, botMenu: botMenu, play: play, BOTS: BOTS, courseOpen: courseOpen };
})();
if (typeof module !== 'undefined') module.exports = PK;
