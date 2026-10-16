// ==ENGINE== (shared by app + offline puzzle miner)
var ENG = (function () {
  var PV = { p: 100, n: 310, b: 330, r: 500, q: 900, k: 0 };
  var PST = {
    p: [0,0,0,0,0,0,0,0, 60,60,60,60,60,60,60,60, 20,20,25,35,35,25,20,20, 5,5,10,28,28,10,5,5, 0,0,5,24,24,0,0,0, 5,-5,-8,4,4,-8,-5,5, 5,10,10,-22,-22,10,10,5, 0,0,0,0,0,0,0,0],
    n: [-50,-40,-30,-30,-30,-30,-40,-50, -40,-20,0,5,5,0,-20,-40, -30,5,12,15,15,12,5,-30, -30,0,15,20,20,15,0,-30, -30,5,15,20,20,15,5,-30, -30,0,12,15,15,12,0,-30, -40,-20,0,5,5,0,-20,-40, -50,-35,-30,-30,-30,-30,-35,-50],
    b: [-20,-10,-10,-10,-10,-10,-10,-20, -10,0,0,0,0,0,0,-10, -10,0,5,10,10,5,0,-10, -10,5,5,10,10,5,5,-10, -10,0,10,10,10,10,0,-10, -10,10,10,10,10,10,10,-10, -10,5,0,0,0,0,5,-10, -20,-10,-12,-10,-10,-12,-10,-20],
    r: [0,0,0,0,0,0,0,0, 5,10,10,10,10,10,10,5, -5,0,0,0,0,0,0,-5, -5,0,0,0,0,0,0,-5, -5,0,0,0,0,0,0,-5, -5,0,0,0,0,0,0,-5, -5,0,0,0,0,0,0,-5, 0,0,0,5,5,3,0,0],
    q: [-20,-10,-10,-5,-5,-10,-10,-20, -10,0,0,0,0,0,0,-10, -10,0,5,5,5,5,0,-10, -5,0,5,5,5,5,0,-5, 0,0,5,5,5,5,0,-5, -10,5,5,5,5,5,0,-10, -10,0,5,0,0,0,0,-10, -20,-10,-10,-5,-5,-10,-10,-20],
    k: [-30,-40,-40,-50,-50,-40,-40,-30, -30,-40,-40,-50,-50,-40,-40,-30, -30,-40,-40,-50,-50,-40,-40,-30, -30,-40,-40,-50,-50,-40,-40,-30, -20,-30,-30,-40,-40,-30,-30,-20, -10,-20,-20,-20,-20,-20,-20,-10, 15,15,-5,-5,-5,-5,15,15, 20,35,15,-5,0,-5,35,20]
  };
  var MATE = 100000, nodes = 0, deadline = 0;
  var TIMEOUT = { timeout: true };
  function tick() { if ((++nodes & 1023) === 0 && deadline && Date.now() > deadline) throw TIMEOUT; }
  function evalWhite(g) {
    var b = g.board(), s = 0;
    for (var i = 0; i < 8; i++) for (var j = 0; j < 8; j++) {
      var p = b[i][j]; if (!p) continue;
      var idx = p.color === 'w' ? i * 8 + j : (7 - i) * 8 + j;
      var v = PV[p.type] + PST[p.type][idx];
      s += p.color === 'w' ? v : -v;
    }
    return s;
  }
  function evalSide(g) { return g.turn() === 'w' ? evalWhite(g) : -evalWhite(g); }
  function order(ms) {
    for (var i = 0; i < ms.length; i++) {
      var m = ms[i], k = 0;
      if (m.captured) k += 10 * PV[m.captured] - PV[m.piece] + 1000;
      if (m.promotion) k += 900;
      if (m.san.indexOf('+') >= 0) k += 50;
      m._k = k;
    }
    ms.sort(function (a, b) { return b._k - a._k; });
    return ms;
  }
  function quiesce(g, alpha, beta, qd) {
    tick();
    var stand = evalSide(g);
    if (stand >= beta) return stand;
    if (stand > alpha) alpha = stand;
    if (qd >= 4) return stand;
    var ms = g.moves({ verbose: true }).filter(function (m) { return m.captured || m.promotion; });
    order(ms);
    for (var i = 0; i < ms.length; i++) {
      g.move(ms[i]);
      var sc = -quiesce(g, -beta, -alpha, qd + 1);
      g.undo();
      if (sc >= beta) return sc;
      if (sc > alpha) alpha = sc;
    }
    return alpha;
  }
  function negamax(g, depth, alpha, beta, ply) {
    tick();
    var ms = g.moves({ verbose: true });
    if (!ms.length) return g.in_check() ? -MATE + ply : 0;
    if (g.insufficient_material() || g.in_threefold_repetition()) return 0;
    if (depth <= 0) return quiesce(g, alpha, beta, 0);
    order(ms);
    var best = -Infinity;
    for (var i = 0; i < ms.length; i++) {
      g.move(ms[i]);
      var sc = -negamax(g, depth - 1, -beta, -alpha, ply + 1);
      g.undo();
      if (sc > best) best = sc;
      if (sc > alpha) alpha = sc;
      if (alpha >= beta) break;
    }
    return best;
  }
  // score every root move (full window so scores are comparable)
  function rootScores(g, depth) {
    var ms = order(g.moves({ verbose: true })), out = [];
    for (var i = 0; i < ms.length; i++) {
      g.move(ms[i]);
      var sc = -negamax(g, depth - 1, -Infinity, Infinity, 1);
      g.undo();
      out.push({ move: ms[i], score: sc });
    }
    out.sort(function (a, b) { return b.score - a.score; });
    return out;
  }
  function best(g, depth, noise) {
    var ms = order(g.moves({ verbose: true }));
    if (!ms.length) return null;
    var alpha = -Infinity, bm = ms[0], bs = -Infinity;
    for (var i = 0; i < ms.length; i++) {
      g.move(ms[i]);
      var sc = -negamax(g, depth - 1, -Infinity, -alpha + (noise || 0), 1);
      g.undo();
      if (noise) sc += Math.random() * noise;
      if (sc > bs) { bs = sc; bm = ms[i]; }
      if (sc > alpha) alpha = sc;
    }
    return { move: bm, score: bs };
  }
  // iterative deepening with a time budget; always returns the deepest completed result
  function timed(fn, g, maxDepth, ms) {
    var res = null, fen = g.fen(); deadline = 0;
    res = fn(g, 1);
    deadline = Date.now() + ms;
    for (var d = 2; d <= maxDepth; d++) {
      try { var r = fn(g, d); if (r) res = r; } catch (e) { g.load(fen); if (e !== TIMEOUT) { deadline = 0; throw e; } break; }
    }
    deadline = 0; return res;
  }
  function bestTimed(g, maxDepth, noise, ms) { return timed(function (gg, d) { return best(gg, d, noise); }, g, maxDepth, ms); }
  function rootScoresTimed(g, maxDepth, ms) { return timed(function (gg, d) { return rootScores(gg, d); }, g, maxDepth, ms); }
  return { PV: PV, evalWhite: evalWhite, bestTimed: bestTimed, rootScoresTimed: rootScoresTimed, evalSide: evalSide, negamax: negamax, rootScores: rootScores, best: best, MATE: MATE, nodes: function () { return nodes; } };
})();
if (typeof module !== 'undefined') module.exports = ENG;
// ==/ENGINE==
