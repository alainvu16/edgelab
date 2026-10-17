// Engine worker: keeps the UI thread free while bots and the coach think.
importScripts('chess.js?v=32', 'engine.js?v=32', 'xq-engine.js?v=32');
onmessage = function (e) {
  var m = e.data, res = null;
  try {
    if (m.game === 'chess') {
      var g = new Chess(m.fen);
      if (m.op === 'best') { var r = ENG.bestTimed(g, m.depth, m.noise, m.ms); res = r && { move: r.move, score: r.score }; }
      else res = ENG.rootScoresTimed(g, m.depth, m.ms).map(function (x) { return { move: x.move, score: x.score }; });
    } else {
      var s = { b: m.b, turn: m.turn, hist: [], ply: m.ply || 0 };
      if (m.op === 'best') { var r2 = XQE.bestTimed(s, m.depth, m.noise, m.ms); res = r2 && { move: { f: r2.move.f, t: r2.move.t, cap: r2.move.cap }, score: r2.score }; }
      else res = XQE.rootScoresTimed(s, m.depth, m.ms).map(function (x) { return { move: { f: x.move.f, t: x.move.t, cap: x.move.cap }, score: x.score }; });
    }
    postMessage({ id: m.id, res: res });
  } catch (err) { postMessage({ id: m.id, err: String(err) }); }
};
