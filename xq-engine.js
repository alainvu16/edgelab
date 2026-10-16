// ==XQ ENGINE== Xiangqi rules + search. Board: 90 cells, idx=row*9+col, row 0 = Black's back rank, row 9 = Red's.
var XQE = (function () {
  var VAL = { K: 0, A: 120, E: 120, H: 400, R: 900, C: 450, P: 100 };
  var MATE = 100000, nodes = 0, deadline = 0, TIMEOUT = { timeout: true };
  function tick() { if ((++nodes & 1023) === 0 && deadline && Date.now() > deadline) throw TIMEOUT; }
  function start() {
    var b = new Array(90).fill(null);
    var back = ['R', 'H', 'E', 'A', 'K', 'A', 'E', 'H', 'R'];
    for (var c = 0; c < 9; c++) { b[c] = 'b' + back[c]; b[81 + c] = 'r' + back[c]; }
    b[2 * 9 + 1] = 'bC'; b[2 * 9 + 7] = 'bC'; b[7 * 9 + 1] = 'rC'; b[7 * 9 + 7] = 'rC';
    for (c = 0; c < 9; c += 2) { b[3 * 9 + c] = 'bP'; b[6 * 9 + c] = 'rP'; }
    return { b: b, turn: 'r', hist: [], ply: 0 };
  }
  function clone(s) { return { b: s.b.slice(), turn: s.turn, hist: [], ply: s.ply }; }
  function inPalace(r, c, col) { return r >= 0 && r <= 9 && c >= 3 && c <= 5 && (col === 'r' ? r >= 7 : r <= 2); }
  function onOwnSide(r, col) { return col === 'r' ? r >= 5 : r <= 4; }
  function crossed(r, col) { return col === 'r' ? r <= 4 : r >= 5; }
  function pseudo(s, col) {
    var b = s.b, out = [];
    function add(f, t) { var tp = b[t]; if (tp && tp[0] === col) return; out.push({ f: f, t: t, cap: tp }); }
    for (var i = 0; i < 90; i++) {
      var p = b[i]; if (!p || p[0] !== col) continue;
      var r = (i / 9) | 0, c = i % 9, k = p[1], d, nr, nc, j;
      if (k === 'K') { [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function (d) { var nr = r + d[0], nc = c + d[1]; if (inPalace(nr, nc, col)) add(i, nr * 9 + nc); }); }
      else if (k === 'A') { [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(function (d) { var nr = r + d[0], nc = c + d[1]; if (inPalace(nr, nc, col)) add(i, nr * 9 + nc); }); }
      else if (k === 'E') {
        [[2, 2], [2, -2], [-2, 2], [-2, -2]].forEach(function (d) {
          var nr = r + d[0], nc = c + d[1];
          if (nr < 0 || nr > 9 || nc < 0 || nc > 8 || !onOwnSide(nr, col)) return;
          if (b[(r + d[0] / 2) * 9 + c + d[1] / 2]) return;
          add(i, nr * 9 + nc);
        });
      }
      else if (k === 'H') {
        [[-2, -1, -1, 0], [-2, 1, -1, 0], [2, -1, 1, 0], [2, 1, 1, 0], [-1, -2, 0, -1], [1, -2, 0, -1], [-1, 2, 0, 1], [1, 2, 0, 1]].forEach(function (d) {
          var nr = r + d[0], nc = c + d[1];
          if (nr < 0 || nr > 9 || nc < 0 || nc > 8) return;
          if (b[(r + d[2]) * 9 + c + d[3]]) return;
          add(i, nr * 9 + nc);
        });
      }
      else if (k === 'R' || k === 'C') {
        [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function (d) {
          var nr = r + d[0], nc = c + d[1], screen = false;
          while (nr >= 0 && nr <= 9 && nc >= 0 && nc <= 8) {
            var t = nr * 9 + nc, tp = b[t];
            if (k === 'R') { if (!tp) add(i, t); else { if (tp[0] !== col) add(i, t); break; } }
            else {
              if (!screen) { if (!tp) add(i, t); else screen = true; }
              else if (tp) { if (tp[0] !== col) add(i, t); break; }
            }
            nr += d[0]; nc += d[1];
          }
        });
      }
      else if (k === 'P') {
        var fw = col === 'r' ? -1 : 1;
        nr = r + fw; if (nr >= 0 && nr <= 9) add(i, nr * 9 + c);
        if (crossed(r, col)) { if (c > 0) add(i, r * 9 + c - 1); if (c < 8) add(i, r * 9 + c + 1); }
      }
    }
    return out;
  }
  function kingSq(b, col) { for (var i = 0; i < 90; i++) if (b[i] === col + 'K') return i; return -1; }
  function attacked(b, sq, by) {
    var r = (sq / 9) | 0, c = sq % 9, dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
    for (var di = 0; di < 4; di++) {
      var d = dirs[di], nr = r + d[0], nc = c + d[1], seen = 0;
      while (nr >= 0 && nr <= 9 && nc >= 0 && nc <= 8) {
        var p = b[nr * 9 + nc];
        if (p) {
          if (seen === 0) {
            if (p[0] === by && (p[1] === 'R' || (p[1] === 'K' && d[1] === 0))) return true;
            seen = 1;
          } else { if (p[0] === by && p[1] === 'C') return true; break; }
        }
        nr += d[0]; nc += d[1];
      }
    }
    var diag = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
    for (di = 0; di < 4; di++) {
      var dr = diag[di][0], dc = diag[di][1], lr = r + dr, lc = c + dc;
      if (lr < 0 || lr > 9 || lc < 0 || lc > 8 || b[lr * 9 + lc]) continue;
      var cand = [[r + 2 * dr, c + dc], [r + dr, c + 2 * dc]];
      for (var k = 0; k < 2; k++) { var hr = cand[k][0], hc = cand[k][1]; if (hr >= 0 && hr <= 9 && hc >= 0 && hc <= 8 && b[hr * 9 + hc] === by + 'H') return true; }
    }
    var fw = by === 'r' ? 1 : -1; // enemy soldier sits "behind" relative to its direction
    var pr = r + fw;
    if (pr >= 0 && pr <= 9 && b[pr * 9 + c] === by + 'P') return true;
    if (crossed(r, by)) { if (c > 0 && b[r * 9 + c - 1] === by + 'P') return true; if (c < 8 && b[r * 9 + c + 1] === by + 'P') return true; }
    return false;
  }
  function opp(col) { return col === 'r' ? 'b' : 'r'; }
  function inCheck(s, col) { var k = kingSq(s.b, col); return k < 0 || attacked(s.b, k, opp(col)); }
  function make(s, m) { s.hist.push({ m: m, cap: s.b[m.t] }); s.b[m.t] = s.b[m.f]; s.b[m.f] = null; s.turn = opp(s.turn); s.ply++; }
  function undo(s) { var h = s.hist.pop(); s.b[h.m.f] = s.b[h.m.t]; s.b[h.m.t] = h.cap; s.turn = opp(s.turn); s.ply--; return h.m; }
  function legal(s) {
    var col = s.turn, ms = pseudo(s, col), out = [];
    for (var i = 0; i < ms.length; i++) { make(s, ms[i]); if (!inCheck(s, col)) out.push(ms[i]); undo(s); }
    return out;
  }
  function evalRed(b) {
    var sc = 0;
    for (var i = 0; i < 90; i++) {
      var p = b[i]; if (!p) continue;
      var r = (i / 9) | 0, c = i % 9, col = p[0], k = p[1], v = VAL[k];
      var adv = col === 'r' ? 9 - r : r; // 0 at own back rank
      if (k === 'P') { if (adv >= 5) { v = 190 + (adv <= 8 ? 20 : -40); if (c >= 3 && c <= 5) v += 25; } }
      else if (k === 'H') { v += (4 - Math.abs(c - 4)) * 6 + (adv >= 2 && adv <= 6 ? 15 : 0); }
      else if (k === 'R') { v += (adv >= 1 ? 12 : 0) + (adv >= 5 ? 20 : 0); }
      else if (k === 'C') { v += c === 4 ? 25 : 0; }
      sc += col === 'r' ? v : -v;
    }
    return sc;
  }
  function evalSide(s) { return s.turn === 'r' ? evalRed(s.b) : -evalRed(s.b); }
  function order(s, ms) {
    for (var i = 0; i < ms.length; i++) { var m = ms[i]; m.k = m.cap ? 10 * VAL[m.cap[1]] - VAL[s.b[m.f][1]] + 1000 : 0; if (m.cap && m.cap[1] === 'K') m.k = 99999; }
    ms.sort(function (a, b) { return b.k - a.k; });
    return ms;
  }
  function quiesce(s, a, be, qd) {
    tick();
    var stand = evalSide(s);
    if (stand >= be) return stand; if (stand > a) a = stand; if (qd >= 3) return stand;
    var col = s.turn, ms = order(s, pseudo(s, col).filter(function (m) { return m.cap; }));
    for (var i = 0; i < ms.length; i++) {
      make(s, ms[i]);
      if (inCheck(s, col)) { undo(s); continue; }
      var sc = -quiesce(s, -be, -a, qd + 1); undo(s);
      if (sc >= be) return sc; if (sc > a) a = sc;
    }
    return a;
  }
  function negamax(s, depth, a, be, ply) {
    tick();
    var ms = legal(s);
    if (!ms.length) return -MATE + ply; // no legal moves loses in xiangqi
    if (depth <= 0) return quiesce(s, a, be, 0);
    order(s, ms);
    var best = -Infinity;
    for (var i = 0; i < ms.length; i++) {
      make(s, ms[i]); var sc = -negamax(s, depth - 1, -be, -a, ply + 1); undo(s);
      if (sc > best) best = sc; if (sc > a) a = sc; if (a >= be) break;
    }
    return best;
  }
  function rootScores(s0, depth) {
    var s = clone(s0), ms = order(s, legal(s)), out = [];
    for (var i = 0; i < ms.length; i++) { make(s, ms[i]); out.push({ move: ms[i], score: -negamax(s, depth - 1, -Infinity, Infinity, 1) }); undo(s); }
    out.sort(function (x, y) { return y.score - x.score; });
    return out;
  }
  function best(s0, depth, noise) {
    var s = clone(s0), ms = order(s, legal(s)); if (!ms.length) return null;
    var a = -Infinity, bm = ms[0], bs = -Infinity;
    for (var i = 0; i < ms.length; i++) {
      make(s, ms[i]); var sc = -negamax(s, depth - 1, -Infinity, -a + (noise || 0), 1); undo(s);
      if (noise) sc += Math.random() * noise;
      if (sc > bs) { bs = sc; bm = ms[i]; } if (sc > a) a = sc;
    }
    return { move: bm, score: bs };
  }
  function timed(fn, s, maxDepth, ms) {
    var res = null; deadline = 0;
    res = fn(clone(s), 1);
    deadline = Date.now() + ms;
    for (var d = 2; d <= maxDepth; d++) { try { var r = fn(clone(s), d); if (r) res = r; } catch (e) { if (e !== TIMEOUT) { deadline = 0; throw e; } break; } }
    deadline = 0; return res;
  }
  function bestTimed(s, maxDepth, noise, ms) { return timed(function (ss, d) { return best(ss, d, noise); }, s, maxDepth, ms); }
  function rootScoresTimed(s, maxDepth, ms) { return timed(function (ss, d) { return rootScores(ss, d); }, s, maxDepth, ms); }
  return { bestTimed: bestTimed, rootScoresTimed: rootScoresTimed, start: start, clone: clone, legal: legal, make: make, undo: undo, inCheck: inCheck, attacked: attacked, pseudo: pseudo, rootScores: rootScores, best: best, evalSide: evalSide, VAL: VAL, MATE: MATE, opp: opp, kingSq: kingSq };
})();
if (typeof module !== 'undefined') module.exports = XQE;
