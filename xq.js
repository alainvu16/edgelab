// ===================== XIANGQI =====================
var XQ = (function () {
  var $ = App.$, $$ = App.$$, esc = App.esc, E = XQE;
  var HAN = { r: { K: '帥', A: '仕', E: '相', H: '傌', R: '俥', C: '炮', P: '兵' }, b: { K: '將', A: '士', E: '象', H: '馬', R: '車', C: '砲', P: '卒' } };
  var NAME = { K: 'general', A: 'advisor', E: 'elephant', H: 'horse', R: 'chariot', C: 'cannon', P: 'soldier' };
  var LETTER = { K: 'G', A: 'A', E: 'E', H: 'H', R: 'R', C: 'C', P: 'S' };
  var BOTS = [
    { lv: 1, name: 'Village', depth: 1, noise: 260, ms: 200 },
    { lv: 2, name: 'Park bench', depth: 1, noise: 80, ms: 200 },
    { lv: 3, name: 'Teahouse', depth: 2, noise: 30, ms: 500 },
    { lv: 4, name: 'Club', depth: 3, noise: 0, ms: 900 },
    { lv: 5, name: 'Expert', depth: 4, noise: 15, ms: 1500 },
    { lv: 6, name: 'Master', depth: 5, noise: 0, ms: 2500 },
    { lv: 7, name: 'Provincial', depth: 6, noise: 0, ms: 3500 },
    { lv: 8, name: 'National', depth: 7, noise: 0, ms: 5000 }
  ];
  var MAXLV = BOTS.length;
  function winsNeeded(lv) { return lv <= 3 ? 1 : 2; }
  var XP = ((App.X().xqPuzzles) || []).concat(typeof XQ_MORE_PUZ !== 'undefined' ? XQ_MORE_PUZ : []); // Oct 18: mate-in-2 puzzles appended after the originals (progress is keyed by position)
  function st() {
    var x = App.S.xq;
    if (x.level == null) { x.level = 1; x.games = { w: 0, l: 0, d: 0 }; x.labels = true; x.drill = {}; x.lessons = {}; }
    return x;
  }
  // ---------- character memory (Leitner boxes) ----------
  var CHARS = [];
  ['K', 'R', 'H', 'C', 'P', 'E', 'A'].forEach(function (k) { CHARS.push('r' + k); CHARS.push('b' + k); });
  function boxes() { var x = st(); if (!x.han) x.han = {}; return x.han; }
  function mastered(p) { return (boxes()[p] || 0) >= 4; }
  function activeChars() {
    var bx = boxes(), n = 4;
    while (n < CHARS.length && CHARS.slice(0, n).every(function (c) { return (bx[c] || 0) >= 2; })) n += 2;
    return CHARS.slice(0, n);
  }
  function charsQuiz() {
    App.screen('Piece characters', function (v) {
      var n = 0, total = 8, bx = boxes(), recent = [];
      v.innerHTML = '<p class="mute">Learn the characters a few at a time. New ones appear once you know the current set. When you master one, its English letter disappears from the board.</p><div id="q"></div>';
      function ask() {
        var act = activeChars();
        if (n >= total) {
          var m = CHARS.filter(function (c) { return (bx[c] || 0) >= 4; }).length;
          $('#q', v).innerHTML = App.coachNote('right', 'Round done. ' + m + ' of 14 characters mastered, ' + act.length + ' in rotation.') + '<div class="btns"><button class="btn primary" id="ag">Another round</button><button class="btn" id="dn">Done</button></div>';
          $('#ag').onclick = function () { App.checkpoint(function () { App.back(); charsQuiz(); }); };
          $('#dn').onclick = function () { App.checkpoint(App.back); };
          return;
        }
        act.sort(function (a, b) { return (bx[a] || 0) - (bx[b] || 0) + (Math.random() - .5) * 1.5; });
        var fresh = act.filter(function (x) { return recent.indexOf(x) < 0; }); if (fresh.length) act = fresh;
        var c = act[0], k = c[1]; recent.push(c); if (recent.length > 2) recent.shift();
        var opts = ['K', 'A', 'E', 'H', 'R', 'C', 'P'].filter(function (o) { return o !== k; }).sort(function () { return Math.random() - .5; }).slice(0, 3).concat([k]).sort(function () { return Math.random() - .5; });
        $('#q', v).innerHTML = '<div class="panel" style="align-items:center"><span class="eyebrow">' + (n + 1) + ' / ' + total + ' · ' + (c[0] === 'r' ? 'Red' : 'Black') + ' piece</span><span class="xpc ' + c[0] + '" style="width:96px;font-size:52px">' + HAN[c[0]][k] + '</span><span class="small mute">Box ' + (bx[c] || 0) + ' of 4</span></div><div class="list">' +
          opts.map(function (o) { return '<button class="btn opt" data-o="' + o + '">' + cap(NAME[o]) + '</button>'; }).join('') + App.idkBtn('o') + '</div><div id="fb"></div>';
        $$('[data-o]', v).forEach(function (b) {
          b.onclick = function () {
            if ($('#fb', v).innerHTML) return;
            var ok = b.dataset.o === k;
            bx[c] = ok ? Math.min(5, (bx[c] || 0) + 1) : 0; App.save();
            b.classList.add(ok ? 'right' : 'wrong');
            if (!ok) $$('[data-o]', v).forEach(function (x) { if (x.dataset.o === k) x.classList.add('right'); });
            var hint = { K: 'General. Red 帥 / Black 將 both mean “commander”.', A: 'Advisor. 仕 / 士 means scholar or official.', E: 'Elephant. 相 is “minister”, 象 is “elephant”.', H: 'Horse. Both contain 馬, the picture of a horse.', R: 'Chariot. Both contain 車, a cart seen from above.', C: 'Cannon. 炮 has fire (火), 砲 has stone (石): catapult stones.', P: 'Soldier. 兵 is “soldier”, 卒 is “private”.' }[k];
            $('#fb', v).innerHTML = App.coachHTML(ok ? 'right' : 'wrong', hint) + '<button class="btn primary" id="nx" style="width:100%">Next</button>';
            $('#nx').onclick = function () { n++; ask(); };
          };
        });
      }
      ask();
    });
  }
  function sqName(i) { return 'abcdefghi'[i % 9] + (10 - ((i / 9) | 0)); }
  function mvText(s, m) { var p = s.b[m.f]; return cap(NAME[p[1]]) + ' ' + sqName(m.f) + (m.cap ? '×' : '→') + sqName(m.t); }
  function cap(t) { return t.charAt(0).toUpperCase() + t.slice(1); }

  // ---------- plain-English coach ----------
  function isDefended(s, sq) {
    var p = s.b[sq]; if (!p) return false;
    var t = E.clone(s); t.b[sq] = E.opp(p[0]) + 'P'; t.turn = p[0];
    return E.legal(t).some(function (m) { return m.t === sq; });
  }
  function xIdea(s, m, own, opp) {
    own = own || 'your'; opp = opp || 'their';
    var p = s.b[m.f], k = p[1], s2 = E.clone(s); E.make(s2, m);
    var replies = E.legal(s2);
    if (!replies.length) return 'it is checkmate: they have no legal moves left';
    var bits = [];
    if (m.cap) {
      var recap = replies.some(function (x) { return x.t === m.t; });
      var cv = E.VAL[m.cap[1]], pv = E.VAL[k];
      bits.push(!recap ? 'it wins ' + opp + ' ' + NAME[m.cap[1]] + ' for free' : cv > pv ? 'it wins ' + opp + ' ' + NAME[m.cap[1]] + ' for ' + own + ' ' + NAME[k] : cv === pv ? 'it trades ' + NAME[k] + 's' : 'it takes ' + opp + ' ' + NAME[m.cap[1]]);
    }
    var chk = E.inCheck(s2, s2.turn);
    var s3 = E.clone(s2); s3.turn = p[0];
    var at = E.pseudo(s3, p[0]).filter(function (x) { return x.f === m.t && x.cap && x.cap[1] !== 'K'; })
      .filter(function (x) { return E.VAL[x.cap[1]] > E.VAL[k] || !isDefended(s2, x.t); });
    if (chk && at.length) bits.push('it checks ' + opp + ' general and attacks ' + opp + ' ' + NAME[at[0].cap[1]] + ' at the same time');
    else if (at.length >= 2) bits.push('it attacks ' + opp + ' ' + NAME[at[0].cap[1]] + ' and ' + NAME[at[1].cap[1]] + ' at once (a fork)');
    else if (chk) bits.push('it checks ' + opp + ' general');
    else if (at.length === 1) bits.push('it attacks ' + opp + ' ' + NAME[at[0].cap[1]]);
    if (!bits.length) {
      var fr = (m.f / 9) | 0, tr = (m.t / 9) | 0, tc = m.t % 9;
      var home = p[0] === 'r' ? 9 : 0;
      if (k === 'C' && tc === 4) bits.push('it puts ' + own + ' cannon in the center file, aiming at the general');
      else if (k === 'R' && fr === home) bits.push('it brings ' + own + ' chariot out. Chariots are the strongest piece, so activate them early');
      else if (k === 'H' && fr === home) bits.push('it develops ' + own + ' horse and protects the center');
      else if (k === 'P' && (p[0] === 'r' ? tr <= 4 : tr >= 5) && (p[0] === 'r' ? fr >= 5 : fr <= 4)) bits.push('it crosses the river: now this soldier can also move sideways');
      else if (k === 'A' || k === 'E') bits.push('it strengthens the defense around ' + own + ' general');
      else bits.push('it improves ' + own + ' ' + NAME[k]);
    }
    return bits.join(', and ');
  }
  function threat(s) { // best capture for side to move
    var best = null;
    E.legal(s).forEach(function (m) {
      if (!m.cap) return;
      var s2 = E.clone(s), mover = s.b[m.f][1]; E.make(s2, m);
      var rep = E.legal(s2);
      var recap = rep.some(function (x) { return x.t === m.t; });
      var gain = !rep.length ? 9999 : recap ? E.VAL[m.cap[1]] - E.VAL[mover] : E.VAL[m.cap[1]];
      if (gain >= 100 && (!best || gain > best.gain)) best = { m: m, gain: gain, t: m.cap[1], txt: mvText(s, m) };
    });
    return best;
  }
  function analyse(s, m) {
    return App.engine({ game: 'xq', op: 'root', b: s.b, turn: s.turn, ply: s.ply, depth: 3, ms: 800 }).then(function (rs) { return analyseWith(s, m, rs); });
  }
  function analyseWith(s, m, rs) {
    var MATE = E.MATE;
    var best = rs[0], mine = rs.filter(function (x) { return x.move.f === m.f && x.move.t === m.t; })[0];
    var loss = Math.max(0, Math.min(1500, best.score - mine.score));
    var bestMate = best.score > MATE / 2, mineMate = mine.score > MATE / 2;
    var grade = mine === best || loss <= 15 ? 'best' : loss <= 50 ? 'good' : loss <= 120 ? 'inacc' : loss <= 300 ? 'mistake' : 'blunder';
    if (bestMate && !mineMate && grade !== 'blunder') grade = 'mistake';
    if (bestMate && mineMate) grade = 'best';
    var txt = '<b>' + mvText(s, m) + '</b>: ';
    if (grade === 'best' || grade === 'good') {
      txt += xIdea(s, m) + '.';
      if (grade === 'good') txt += ' Slightly stronger: <b>' + mvText(s, best.move) + '</b>, ' + xIdea(s, best.move) + '.';
    } else {
      var s2 = E.clone(s); E.make(s2, m);
      var parts = [];
      if (mine.score < -MATE / 2) parts.push('this lets them force checkmate.');
      else { var t = threat(s2); if (t && t.gain >= 150) parts.push('this leaves your ' + NAME[t.t] + ' hanging. They can play <b>' + t.txt + '</b>.'); }
      parts.push(bestMate ? 'You had a forced checkmate starting with <b>' + mvText(s, best.move) + '</b>.' : 'Better was <b>' + mvText(s, best.move) + '</b>: ' + xIdea(s, best.move) + '.');
      txt += parts.join(' ') + '<br><span class="mute small">Habit: before moving, check every enemy cannon, chariot and horse line toward your pieces.</span>';
    }
    return { grade: grade, loss: loss, text: txt, best: best.move };
  }

  // ---------- board ----------
  var LINES = (function () {
    var s = '';
    for (var r = 0; r < 10; r++) s += '<line x1="0.5" y1="' + (r + .5) + '" x2="8.5" y2="' + (r + .5) + '" stroke-width="0.03"/>';
    for (var c = 0; c < 9; c++) {
      if (c === 0 || c === 8) s += '<line x1="' + (c + .5) + '" y1="0.5" x2="' + (c + .5) + '" y2="9.5" stroke-width="0.03"/>';
      else s += '<line x1="' + (c + .5) + '" y1="0.5" x2="' + (c + .5) + '" y2="4.5" stroke-width="0.03"/><line x1="' + (c + .5) + '" y1="5.5" x2="' + (c + .5) + '" y2="9.5" stroke-width="0.03"/>';
    }
    s += '<path d="M3.5 .5 L5.5 2.5 M5.5 .5 L3.5 2.5 M3.5 7.5 L5.5 9.5 M5.5 7.5 L3.5 9.5" stroke-width="0.03"/>';
    s += '<rect x="0.42" y="0.42" width="8.16" height="9.16" stroke-width="0.06"/>';
    s += '<text x="2.5" y="5.17" font-size="0.5" text-anchor="middle">楚 河</text><text x="6.5" y="5.17" font-size="0.5" text-anchor="middle">漢 界</text>';
    return '<svg viewBox="0 0 9 10" aria-hidden="true">' + s + '</svg>';
  })();
  function boardHTML(s, ui) {
    var html = '<div class="xqwrap"><div class="xqb">' + LINES;
    var chk = E.inCheck(s, s.turn) ? E.kingSq(s.b, s.turn) : -1;
    for (var i = 0; i < 90; i++) {
      var r = (i / 9) | 0, c = i % 9;
      var dr = ui.flip ? 9 - r : r, dc = ui.flip ? 8 - c : c;
      var p = s.b[i], cls = 'xpt';
      if (ui.sel === i) cls += ' sel';
      if (ui.last && (ui.last.f === i || ui.last.t === i)) cls += ' last';
      if (ui.hint && (ui.hint.f === i || ui.hint.t === i)) cls += ' hint';
      if (ui.hint && ui.hint.t === i && ui.hint.t !== ui.hint.f) cls += ' hintTo'; // Oct 18: clear marker on the destination
      if (chk === i) cls += ' chk';
      var inner = '';
      if (p) inner += '<span class="xpc ' + p[0] + '">' + HAN[p[0]][p[1]] + (ui.labels && !mastered(p) ? '<span class="en"><span>' + LETTER[p[1]] + '</span></span>' : '') + '</span>';
      if (ui.targets && ui.targets.indexOf(i) >= 0) inner += '<span class="dot"></span>';
      if (ui.marks && ui.marks[i]) inner += '<span class="dot" style="background:' + (ui.marks[i] === 'right' ? 'rgba(40,160,100,.75)' : 'rgba(220,70,60,.75)') + '"></span>';
      html += '<button class="' + cls + '" data-i="' + i + '" style="left:' + ((dc + .5) / 9 * 100) + '%;top:' + ((dr + .5) / 10 * 100) + '%" aria-label="' + sqName(i) + (p ? ' ' + (p[0] === 'r' ? 'red ' : 'black ') + NAME[p[1]] : '') + '">' + inner + '</button>';
    }
    return html + '</div></div>';
  }
  function mount(el, s, opts) {
    var ui = { flip: !!opts.flip, sel: null, targets: [], last: null, hint: null, labels: st().labels, marks: {} };
    function render() { el.innerHTML = boardHTML(s, ui); }
    el.onclick = function (e) {
      var b = e.target.closest('[data-i]'); if (!b) return;
      var i = +b.dataset.i;
      if (opts.onTap) { opts.onTap(i); return; }
      if (!opts.canMove()) return;
      var p = s.b[i];
      if (ui.sel != null && ui.targets.indexOf(i) >= 0) {
        var m = E.legal(s).filter(function (x) { return x.f === ui.sel && x.t === i; })[0];
        ui.sel = null; ui.targets = []; ui.hint = null; opts.onMove(m); return;
      }
      if (p && p[0] === s.turn) { ui.sel = i; ui.targets = E.legal(s).filter(function (x) { return x.f === i; }).map(function (x) { return x.t; }); }
      else { ui.sel = null; ui.targets = []; }
      render();
    };
    render();
    return { ui: ui, render: render };
  }

  // ---------- lessons ----------
  var LESSONS = [
    { id: 'x1', t: 'Board, river and palace', piece: 'K',
      body: ['Xiangqi is played on the lines, not the squares: 9 files by 10 ranks.', 'The river splits the board. Each side has a 3×3 palace marked with an X.', 'The general (帥/將) moves one point sideways or forward/back and never leaves the palace.', 'The two generals may never face each other on an open file. This “flying general” rule is a real weapon.', 'Red moves first. You win by checkmate, and a player with no legal moves also loses.'] },
    { id: 'x2', t: 'Chariot: the strongest piece', piece: 'R',
      body: ['The chariot (俥/車) moves like a chess rook: any distance along a line.', 'It is worth about two horses. Get it out early, usually along the edge or rank.', 'Chariots on open files attack everything.'] },
    { id: 'x3', t: 'Horse: blocked by its leg', piece: 'H',
      body: ['The horse (傌/馬) moves one point straight, then one diagonal outward, like a chess knight.', 'Unlike a knight, it can be blocked: if the point next to it in the direction it wants to go is occupied, that “leg” is blocked.', 'Block enemy horse legs to shut them down.'] },
    { id: 'x4', t: 'Cannon: jump to capture', piece: 'C',
      body: ['The cannon (炮/砲) moves like a chariot when it is not capturing.', 'To capture, it must jump over exactly one piece (any color), called the screen.', 'The classic first move is putting a cannon in the center file, aiming at the enemy general.'] },
    { id: 'x5', t: 'Advisors and elephants', piece: 'E',
      body: ['Advisors (仕/士) move one point diagonally and stay in the palace.', 'Elephants (相/象) move exactly two points diagonally, can be blocked at the midpoint (“the eye”), and can never cross the river.', 'Both are defenders. Losing them makes your general easier to attack.'] },
    { id: 'x6', t: 'Soldiers', piece: 'P',
      body: ['Soldiers (兵/卒) move one point forward.', 'After crossing the river they can also move one point sideways. They never move backward.', 'Crossed soldiers near the enemy palace are dangerous attackers.'] },
    { id: 'x7', t: 'Openings and plans', piece: null,
      body: ['Central Cannon: move a cannon to the center file on move one. It pressures the center soldier and the general.', 'Answer with Screen Horses: bring both horses out to guard the center soldier.', 'Plan: cannons in the center, horses out, chariots to open files, then attack together. Don’t push soldiers aimlessly.', 'Common tactic: cannon + chariot on the same file gives a deadly check the general can’t escape.'] }
  ];
  (App.X().xqLessons || []).forEach(function (l) { LESSONS.push(l); });
  var DRILL_PIECES = ['K', 'R', 'H', 'C', 'A', 'E', 'P'];
  // parse "b3e3" style coordinates (files a–i from Red's left, ranks 1–10 from Red's side) into board indices
  function sqIdx(s) { var f = 'abcdefghi'.indexOf(s[0]), r = parseInt(s.slice(1), 10); if (f < 0 || !(r >= 1 && r <= 10)) return -1; return (10 - r) * 9 + f; }

  // tap-all-moves drill: random piece with blockers, user taps every legal point
  function makeDrill(kind, level) {
    for (var tries = 0; tries < 200; tries++) {
      var b = new Array(90).fill(null);
      b[4] = 'bK'; b[85] = 'rK';
      var pos;
      if (kind === 'K' || kind === 'A') pos = [66, 67, 68, 75, 76, 77, 84, 86][Math.floor(Math.random() * 8)];
      else if (kind === 'E') pos = [47, 51, 63, 67, 71, 83, 87][Math.floor(Math.random() * 7)];
      else pos = 18 + Math.floor(Math.random() * 63);
      if (b[pos]) continue;
      if (kind === 'K' || kind === 'A') { b[85] = null; b[pos] = 'rK'; if (kind === 'A') { b[pos] = 'rA'; b[85] = pos === 85 ? null : 'rK'; if (!b[85]) b[84] = 'rK'; } }
      else b[pos] = 'r' + kind;
      var extra = 2 + Math.min(6, level);
      for (var k = 0; k < extra; k++) {
        var q = Math.floor(Math.random() * 90);
        if (b[q] || q === 4) continue;
        var kinds = ['P', 'P', 'H', 'R', 'C'];
        var col = Math.random() < 0.5 ? 'r' : 'b';
        var kk = kinds[Math.floor(Math.random() * kinds.length)];
        var r = (q / 9) | 0;
        if (kk === 'P' && ((col === 'r' && r > 6) || (col === 'b' && r < 3))) continue;
        b[q] = col + kk;
      }
      var s = { b: b, turn: 'r', hist: [], ply: 0 };
      if (E.inCheck(s, 'r') || E.inCheck({ b: b, turn: 'b', hist: [], ply: 0 }, 'b')) continue;
      var piecePos = kind === 'A' ? b.indexOf('rA') : kind === 'K' ? b.indexOf('rK') : pos;
      var ans = E.legal(s).filter(function (m) { return m.f === piecePos; }).map(function (m) { return m.t; });
      if (ans.length < 1) continue;
      return { s: s, at: piecePos, ans: ans, kind: kind };
    }
  }

  // Oct 18: real rating (App.rate, Glicko). Bots rated by level; puzzles count at 0.2 weight; guided and assisted games don't count.
  var LV_ELO = [500, 750, 1000, 1200, 1400, 1650, 1850, 2000];
  function seedR() { var x = st(), g = x.games.w + x.games.l + x.games.d; return { r: Math.max(300, LV_ELO[Math.min(LV_ELO.length, x.level) - 1] - (g && x.games.w / g < 0.3 ? 150 : 0)), rd: g ? 250 : 300, from: 'your bot level and record so far' }; }
  function estElo() { var i = App.ratingInfo('xq', seedR); return { elo: i.r, lo: i.lo, hi: i.hi, conf: i.conf, prov: i.prov, games: i.games }; }
  function home() {
    App.root('Xiangqi', function (v) {
      var x = st(), ee = estElo();
      v.innerHTML = '<div><span class="eyebrow">Xiangqi · Chinese chess</span><h1>Rating ' + ee.elo + '</h1><p class="mute small">Likely ' + ee.lo + '–' + ee.hi + ' · ' + ee.games + ' rated game' + (ee.games === 1 ? '' : 's') + (ee.prov ? ' · provisional' : '') + ' · Bot level ' + x.level + ' · ' + x.games.w + 'W ' + x.games.l + 'L ' + x.games.d + 'D</p></div>' + App.playNowBtn('xq') +
        (function () { var r = report()[0]; return '<div class="coach ok"><div class="h"><span class="pill ok">Coach</span></div><p>' + r.text + '</p><button class="btn sm" id="repgo">' + r.action + ' ›</button></div>'; })() +
        '<div class="btns"><button class="btn" id="pl">Play bot</button><button class="btn" id="dr">Move trainer</button><button class="btn" id="ch">Characters</button>' + (XP.length ? '<button class="btn" id="pz">Puzzles</button>' : '') + (BOOK.length ? '<button class="btn" id="ob">Opening book</button>' : '') + '</div>' +
        '<div class="row"><label class="row small"><input type="checkbox" id="lb"' + (x.labels ? ' checked' : '') + '> Show English letters on pieces</label></div>' +
        '<h2>Learn the game</h2><div class="list">' + LESSONS.map(function (l, i) {
          var d = x.lessons[l.id];
          return '<button class="item' + (d ? ' done' : '') + '" data-l="' + i + '"><span class="grow"><span class="t">' + esc(l.t) + '</span><br><span class="s">' + (l.piece ? 'Rules + tap-the-moves drill' : 'Strategy') + '</span></span><span class="end">' + (d ? '✓' : '›') + '</span></button>';
        }).join('') + '</div>';
      $('#lb', v).onchange = function () { st().labels = this.checked; App.save(); };
      App.wirePlayNow(v, 'xq');
      $('#pl', v).onclick = playMenu;
      if ($('#ob', v)) $('#ob', v).onclick = book;
      $('#repgo', v).onclick = report()[0].go;
      $('#dr', v).onclick = function () { drill(null); };
      $('#ch', v).onclick = charsQuiz;
      if ($('#pz', v)) $('#pz', v).onclick = puzzles;
      $$('[data-l]', v).forEach(function (b) { b.onclick = function () { lesson(LESSONS[+b.dataset.l]); }; });
    });
  }
  function lesson(l) {
    App.screen(l.t, function (v) {
      var hasQ = l.q && l.q.length === 3;
      v.innerHTML = '<h1>' + esc(l.t) + '</h1><div class="prose"><ul>' + l.body.map(function (b) { return '<li>' + esc(b) + '</li>'; }).join('') + '</ul></div>' +
        (l.piece ? '<button class="btn primary" id="go">Practice: tap every legal move</button>' : '<div id="bd"></div><div id="dm" class="btns"></div>' + (hasQ ? '<h3>Check</h3><p>' + esc(l.q[0]) + '</p><div class="list" id="qq"></div><div id="fb"></div>' : '<button class="btn primary" id="go">Got it. Play the bot</button>'));
      if (!l.piece) {
        var s = E.start(), demo = [], di = 0;
        if (l.demo && l.demo.length) { var t = E.clone(s); for (var k = 0; k < l.demo.length; k++) { var f = sqIdx(l.demo[k].slice(0, 2)), to = sqIdx(l.demo[k].slice(2, 4)); var mv = E.legal(t).filter(function (m) { return m.f === f && m.t === to; })[0]; if (!mv) break; demo.push(mv); E.make(t, mv); } }
        if (!demo.length && !l.demo) { demo = [{ f: 64, t: 67, cap: null }, { f: 1, t: 20, cap: null }, { f: 82, t: 65, cap: null }]; }
        var B = mount($('#bd', v), s, { canMove: function () { return false; }, onMove: function () {} });
        if (demo.length) {
          $('#dm', v).innerHTML = '<button class="btn" id="pv">‹ Back</button><button class="btn" id="nx">Next move ›</button>';
          $('#nx', v).onclick = function () { if (di < demo.length) { E.make(s, demo[di]); B.ui.last = demo[di]; di++; B.render(); } };
          $('#pv', v).onclick = function () { if (di > 0) { E.undo(s); di--; B.ui.last = di ? demo[di - 1] : null; B.render(); } };
        }
        if (hasQ) {
          var order = [0, 1, 2, 3].sort(function () { return Math.random() - .5; }), done = false;
          $('#qq', v).innerHTML = order.map(function (k) { return '<button class="btn opt" data-k="' + k + '">' + esc(l.q[1][k]) + '</button>'; }).join('') + App.idkBtn('k');
          $$('[data-k]', v).forEach(function (b) { b.onclick = function () { if (done) return; done = true; var ok = +b.dataset.k === 0; $$('[data-k]', v).forEach(function (y) { if (+y.dataset.k === 0) y.classList.add('right'); else if (y === b) y.classList.add('wrong'); }); if (ok) { st().lessons[l.id] = 1; App.save(); } $('#fb', v).innerHTML = App.coachHTML(ok ? 'right' : 'wrong', esc(l.q[2])) + '<button class="btn primary" id="go" style="width:100%">' + (ok ? 'Done' : 'Read again') + '</button>'; $('#go', v).onclick = function () { App.back(); if (!ok) lesson(l); }; }; });
        } else $('#go', v).onclick = function () { st().lessons[l.id] = 1; App.save(); playMenu(); };
      } else $('#go', v).onclick = function () { drill(l); };
    });
  }
  var MOVE_WHY = { K: 'The general moves one point along a line and must stay in the palace. It also can’t step onto a file facing the other general.', A: 'Advisors move one point diagonally, only inside the palace.', E: 'Elephants move two points diagonally, can’t cross the river, and are blocked if the midpoint is occupied.', H: 'The horse goes one straight then one diagonal. If the straight point is occupied, that direction is blocked.', R: 'The chariot slides any distance until it hits a piece. It can capture the first enemy piece it meets.', C: 'The cannon slides like a chariot, but to capture it must jump exactly one piece.', P: 'Soldiers move forward one point; after crossing the river they may also step sideways.' };
  function drill(l) {
    App.screen(l ? 'Drill: ' + NAME[l.piece] : 'Move trainer', function (v) {
      var x = st(), streak = 0, need = 3, d, picked, done; x.moveSeen = x.moveSeen || {}; // Oct 18: learn first, then 3 in a row (was 5)
      v.innerHTML = '<div class="row"><span class="pill acc" id="pk"></span><span class="pill" id="sk"></span></div><p class="mute small">Tap every point the highlighted piece can move to, then press Check.</p><div id="bd"></div><div id="co"></div><div class="btns"><button class="btn primary" id="ck">Check</button></div>';
      var co = $('#co', v);
      function next() {
        var kind = l ? l.piece : DRILL_PIECES[Math.floor(Math.random() * DRILL_PIECES.length)];
        var lvl = x.drill[kind] || 0;
        d = makeDrill(kind, lvl); picked = []; done = false;
        $('#pk', v).textContent = cap(NAME[kind]) + ' · difficulty ' + (lvl + 1);
        $('#sk', v).textContent = 'Streak ' + streak + '/' + need;
        draw(); co.innerHTML = '';
        $('#ck', v).textContent = 'Check';
        if (!x.moveSeen[kind]) { // first time with this piece: show every legal move before asking
          done = true; B.ui.targets = []; B.ui.marks = {}; d.ans.forEach(function (a) { B.ui.marks[a] = 'right'; }); B.render();
          co.innerHTML = App.coachHTML('info', '<b>Learn it first: the ' + NAME[kind] + '.</b> The green dots are every point it can move to from here. ' + MOVE_WHY[kind] + ' Your turn next.');
          $('#ck', v).textContent = 'Got it, my turn';
          x.moveSeen[kind] = 1; App.save();
        }
      }
      var B;
      function draw() {
        B = mount($('#bd', v), d.s, { onTap: function (i) { if (done) return; var k = picked.indexOf(i); if (k >= 0) picked.splice(k, 1); else if (i !== d.at) picked.push(i); draw(); } });
        B.ui.sel = d.at; B.ui.targets = picked.slice(); B.render();
      }
      $('#ck', v).onclick = function () {
        if (done) { App.checkpoint(next); return; }
        done = true;
        var missed = d.ans.filter(function (a) { return picked.indexOf(a) < 0; });
        var extra = picked.filter(function (a) { return d.ans.indexOf(a) < 0; });
        B.ui.targets = []; B.ui.marks = {};
        d.ans.forEach(function (a) { B.ui.marks[a] = 'right'; }); extra.forEach(function (a) { B.ui.marks[a] = 'wrong'; });
        B.render();
        var ok = !missed.length && !extra.length;
        if (ok) { streak++; x.drill[d.kind] = Math.min(6, (x.drill[d.kind] || 0) + 1); }
        else { streak = 0; x.drill[d.kind] = Math.max(0, (x.drill[d.kind] || 0) - 1); }
        App.save();
        var why = MOVE_WHY[d.kind];
        co.innerHTML = App.coachHTML(ok ? 'right' : 'wrong', (ok ? 'All ' + d.ans.length + ' moves found. ' : 'Green dots are the legal moves' + (extra.length ? ', red ones were not legal' : '') + '. ') + why);
        $('#sk', v).textContent = 'Streak ' + streak + '/' + need;
        if (l && streak >= need) { st().lessons[l.id] = 1; App.save(); co.innerHTML += App.coachNote('right', 'Lesson complete. You know how the ' + NAME[l.piece] + ' moves.'); }
        $('#ck', v).textContent = 'Next';
      };
      next();
    });
  }
  // mate-in-2 helpers (Oct 18): accept any first move that forces mate, then any mating move
  function mateIn1(s0) { return E.legal(s0).filter(function (m) { var t = E.clone(s0); E.make(t, m); return !E.legal(t).length; }); }
  function forcesMate2(s0, m) { var t = E.clone(s0); E.make(t, m); var rep = E.legal(t); if (!rep.length) return true; return rep.every(function (r) { var u = E.clone(t); E.make(u, r); return mateIn1(u).length > 0; }); }
  function puzzles(opt) {
    opt = opt || {};
    var x = st(); x.prating = x.prating || 800; x.psolved = x.psolved || {};
    var all = XP.map(function (p, i) { return { p: p, i: i }; }).filter(function (o) { return !opt.kind || o.p.kind === opt.kind; });
    var pool = all.filter(function (o) { return !x.psolved[o.i]; });
    if (!pool.length) { all.forEach(function (o) { delete x.psolved[o.i]; }); pool = all; }
    pool.sort(function (a, b) { return Math.abs(a.p.rating - x.prating - 60) - Math.abs(b.p.rating - x.prating - 60); });
    var pick = opt.only != null ? { p: XP[opt.only], i: opt.only } : pool[Math.floor(Math.random() * Math.min(4, pool.length))], p = pick.p, two = p.kind === 'mate2';
    var LABEL = { mate: 'Mate in 1', win: 'Win material', mate2: (p.end ? 'Endgame · ' : '') + 'Mate in 2' };
    App.screen(opt.title || 'Xiangqi puzzles', function (v) {
      var s = { b: p.b.slice(), turn: p.turn, hist: [], ply: 0 }, done = false, first = true, stage = 0;
      v.innerHTML = '<div class="row"><span class="pill acc">' + (p.turn === 'r' ? 'Red' : 'Black') + ' to move</span><span class="pill">' + LABEL[p.kind] + ' · ~' + p.rating + '</span><span class="grow"></span><span class="mono small mute">Rating ' + x.prating + '</span></div><div id="bd"></div><div id="co"></div><div class="btns"><button class="btn" id="hn">Hint</button><button class="btn ghost" id="sol">Show solution</button></div>';
      var co = $('#co', v), start = { b: p.b, turn: p.turn, hist: [], ply: 0 };
      function solved(m, pos) {
        if (opt.onResult) { var clean = first; done = true; if (first) { x.prating = App.elo(x.prating, p.rating, 1, 36); } x.psolved[pick.i] = 1; App.save(); co.innerHTML = App.coachMove('right', (two ? 'Checkmate. ' : '') + '<b>' + mvText(pos, m) + '</b>: ' + xIdea(pos, m) + '.'); return finishBL(clean); }
        done = true; if (first) { x.prating = App.elo(x.prating, p.rating, 1, 36); App.rate('xq', p.rating, 1, { weight: 0.2, oppRD: 150, seed: seedR, why: 'puzzle' }); } x.psolved[pick.i] = 1; App.save();
        co.innerHTML = App.coachMove('right', (two ? 'Checkmate. ' : '') + '<b>' + mvText(pos, m) + '</b>: ' + xIdea(pos, m) + '.', '<span class="mono small">→ ' + x.prating + '</span>');
        nextBtn();
      }
      function finishBL(ok) { done = true; $('.btns', v).innerHTML = '<button class="btn primary" id="blnx" style="width:100%">Next</button>'; $('#blnx', v).onclick = function () { App.back(); opt.onResult(ok); }; }
      function nextBtn() { if (opt.onResult) return finishBL(true); $('.btns', v).innerHTML = '<button class="btn primary" id="nx">Next puzzle</button>'; $('#nx').onclick = function () { App.checkpoint(function () { App.back(); puzzles(opt); }); }; }
      function reply() { // the defender answers (any reply loses), then you finish it
        var rs = E.legal(s), r = rs[Math.floor(Math.random() * rs.length)], before = E.clone(s);
        setTimeout(function () { E.make(s, r); B.ui.last = r; B.render(); stage = 1; co.innerHTML = App.coachMove('right', 'Good: that forces it. They answered <b>' + mvText(before, r) + '</b>. Now finish: checkmate in one.'); }, 550);
      }
      var B = mount($('#bd', v), s, { flip: p.turn === 'b', canMove: function () { return !done && s.turn === p.turn; }, onMove: function (m) {
        var pos = E.clone(s), ok;
        if (two && stage === 0) ok = forcesMate2(s, m);
        else if (two) { var t1 = E.clone(s); E.make(t1, m); ok = !E.legal(t1).length; }
        else { var sol = p.sol[0]; ok = m.f === sol.f && m.t === sol.t; if (!ok) { var t2 = E.clone(s); E.make(t2, m); ok = p.kind === 'mate' && !E.legal(t2).length; } }
        if (ok) {
          E.make(s, m); B.ui.last = m; B.ui.hint = null; B.render();
          if (two && stage === 0 && E.legal(s).length) { co.innerHTML = '<div class="thinking">They look for a defense</div>'; reply(); return; }
          solved(m, pos);
        } else { if (opt.onResult) { if (first) x.prating = App.elo(x.prating, p.rating, 0, 36); first = false; B.render(); co.innerHTML = App.coachMove('wrong', '<b>' + mvText(s, m) + '</b> doesn’t do it.'); return finishBL(false); } if (first) { x.prating = App.elo(x.prating, p.rating, 0, 36); App.rate('xq', p.rating, 0, { weight: 0.2, oppRD: 150, seed: seedR, why: 'puzzle' }); App.save(); } first = false; B.render(); co.innerHTML = App.coachMove('wrong', '<b>' + mvText(s, m) + '</b> doesn’t do it. ' + (p.kind === 'win' ? 'Look for a capture or fork that wins material by force.' : two && stage === 0 ? 'Mate in 2 starts with a forcing move, usually a check, that leaves every defense losing.' : 'Look for a move after which the general has no escape and nothing can block or capture.') + ' Try again.'); }
      } });
      co.innerHTML = App.coachHTML('info', p.kind === 'mate' ? 'Find the checkmate in one move.' : two ? 'Checkmate in two moves: find a forcing first move. Whatever they answer, you mate next.' : 'Find the move that wins material.');
      function hintMove() { return two && stage === 1 ? mateIn1(s)[0] : two ? (E.legal(s).filter(function (m) { return forcesMate2(s, m); })[0] || p.sol[0]) : p.sol[0]; }
      if (opt.onResult) { $('.btns', v).innerHTML = '<button class="btn" id="bidk" style="width:100%">I don’t know</button>'; $('#bidk', v).onclick = function () { if (done) return; first = false; co.innerHTML = App.coachNote('info', 'The idea: ' + xIdea(start, p.sol[0]) + '.'); finishBL(false); }; }
      $('#hn', v).onclick = function () { if (done) return; first = false; var h = hintMove(); B.ui.hint = { f: h.f, t: h.f }; B.render(); co.innerHTML = App.coachHTML('info', 'Move the highlighted piece.'); };
      $('#sol', v).onclick = function () {
        if (done) return; first = false; done = true;
        var m1 = hintMove(), pos = E.clone(s); E.make(s, m1); B.ui.last = m1; B.render();
        var txt = '<b>' + mvText(pos, m1) + '</b>: ' + xIdea(pos, m1) + '.';
        if (two && stage === 0 && E.legal(s).length) { var r = E.legal(s)[0], pr = E.clone(s); E.make(s, r); var m3 = mateIn1(s)[0], p3 = E.clone(s); E.make(s, m3); B.ui.last = m3; B.render(); txt += ' If they answer <b>' + mvText(pr, r) + '</b>, <b>' + mvText(p3, m3) + '</b> is mate.'; }
        co.innerHTML = App.coachHTML('info', txt); nextBtn();
      };
    });
  }
  function playMenu() {
    App.screen('Play the bot', function (v) {
      var x = st();
      v.innerHTML = '<p class="mute">You play Red and move first. Every move gets graded and explained.</p><div class="seg" id="md"><button aria-pressed="' + (!ready()) + '" data-m="guided">Guided</button><button aria-pressed="' + ready() + '" data-m="coach">Coached</button><button aria-pressed="false" data-m="casual">Just play</button></div><div class="list">' + BOTS.map(function (b) {
        var open = b.lv <= x.level;
        return '<button class="item' + (open ? '' : ' locked') + (b.lv < x.level ? ' done' : '') + '" data-b="' + b.lv + '"><span class="grow"><span class="t">' + b.lv + '. ' + b.name + '</span><br><span class="s">Looks ' + b.depth + ' move' + (b.depth > 1 ? 's' : '') + ' ahead</span></span><span class="end">' + (b.lv < x.level ? '✓ beaten' : open ? 'play ›' : 'locked') + '</span></button>';
      }).join('') + '</div>';
      var mode = ready() ? 'coach' : 'guided';
      $$('[data-m]', v).forEach(function (b) { b.onclick = function () { mode = b.dataset.m; $$('[data-m]', v).forEach(function (q) { q.setAttribute('aria-pressed', q === b); }); $$('[data-b]', v).forEach(function (q) { q.classList.toggle('locked', mode === 'coach' && +q.dataset.b > st().level); }); }; });
      $$('[data-b]', v).forEach(function (b) { b.onclick = function () { var lv = +b.dataset.b; if (mode !== 'coach' || lv <= st().level) play(lv, mode === 'casual', mode === 'guided'); }; });
    });
  }
  // Oct 18 (Alain: "I barely know how to play … it won't teach me how to actually play before playing the bot"):
  // guided games suggest a good move every turn with the reason; they don't count toward your record.
  // Regular bot games come into quick play only once you're ready: rules lessons, 10 puzzles, 2 guided games.
  function ready() { var x = st(); return LESSONS.slice(0, 6).every(function (l) { return x.lessons[l.id]; }) && Object.keys(x.psolved || {}).length >= 10 && (x.guided || 0) >= 2; }
  function play(lv, casual, guided) {
    var bot = BOTS[lv - 1]; if (guided) casual = false;
    App.screen(bot.name + ' bot' + (guided ? ' · guided' : casual ? ' · just play' : ''), function (v) {
      var s = E.start(), busy = false, over = false, log = [], reps = {};
      v.innerHTML = '<div class="row"><span class="pill acc">You: Red</span><span class="pill">Bot Lv ' + lv + ' ~' + LV_ELO[lv - 1] + '</span>' + (casual || guided ? '' : '<span class="pill" id="rt"></span>') + '<span class="grow"></span><span class="mono small mute" id="pc"></span></div><div id="bd"></div><div id="watch"></div><div id="co"></div><div id="op" class="small mute"></div>' +
        '<div class="btns" id="bt"><button class="btn" id="hn">Hint</button><button class="btn" id="tb">Take back</button><button class="btn ghost" id="rs">Resign</button></div>' + (casual || guided ? '' : '<button class="btn sm ghost" id="ind" style="width:100%"></button>');
      var co = $('#co', v), opEl = $('#op', v);
      var B = mount($('#bd', v), s, { canMove: function () { return !busy && !over && s.turn === 'r'; }, onMove: onMove });
      co.innerHTML = casual ? '' : App.coachHTML('info', guided ? '<b>Guided game.</b> Every turn the coach marks a good move (ringed piece, green dot where it goes) and says why. Follow it, or try your own: either way you get graded, and this game doesn’t count toward your record.' : 'Your move. A classic start: cannon to the center file (b3 or h3 to e3).');
      var xs = st(); if (xs.ind === undefined) xs.ind = true;
      var assisted = false; function ratedPill(why) { if (why) assisted = assisted || why; var p0 = v.querySelector('#rt'); if (p0) p0.textContent = assisted ? 'Unrated · ' + assisted : 'Rated'; }
      function indLabel() { var b = v.querySelector('#ind'); if (b) b.textContent = 'Best-move indicator: ' + (xs.ind ? 'On' : 'Off'); }
      if (!casual && !guided) { indLabel(); v.querySelector('#ind').onclick = function () { xs.ind = !xs.ind; App.save(); indLabel(); if (xs.ind) suggest(); else { B.ui.hint = null; B.render(); var sg = v.querySelector('#sg'); if (sg) sg.innerHTML = ''; } }; }
      ratedPill(); showWatch(); suggest();
      function suggest() { // guided games, or the best-move indicator in coached games: highlight a good move with the reason
        if (!(guided || (!casual && xs.ind)) || over || s.turn !== 'r') return;
        App.engine({ game: 'xq', op: 'best', b: s.b, turn: s.turn, ply: s.ply, depth: 3, ms: 700 }).then(function (r) {
          if (over || s.turn !== 'r' || !r || !r.move || !(guided || xs.ind)) return; B.ui.hint = r.move; if (!guided) ratedPill('indicator on'); B.render(); try {
          var note = '<b>Suggested: ' + mvText(s, r.move) + '</b> (ringed piece → green dot): ' + xIdea(s, r.move, 'your', 'their') + '.';
          var sg = v.querySelector('#sg'); if (!sg) { sg = document.createElement('div'); sg.id = 'sg'; $('#watch', v).before(sg); } sg.innerHTML = App.coachHTML('info', note); } catch (e) {} // note: App.$ returns a blank div when nothing matches
        });
      }
      function onMove(m) {
        var before = E.clone(s);
        E.make(s, m); B.ui.last = m; B.ui.hint = null; B.render(); busy = true; $('#watch', v).innerHTML = ''; if (v.querySelector('#sg')) v.querySelector('#sg').innerHTML = '';
        co.innerHTML = casual ? '' : '<div class="thinking">Coach is checking your move</div>'; opEl.textContent = '';
        analyse(before, m).then(function (a) {
          log.push(a);
          if (!casual && (a.grade === 'mistake' || a.grade === 'blunder')) { var xx = st(); xx.err = xx.err || { hang: 0, mate: 0, other: 0 }; xx.err[/hanging/.test(a.text) ? 'hang' : /checkmate/.test(a.text) ? 'mate' : 'other']++; App.save(); }
          if (over) return;
          if (!casual) co.innerHTML = App.coachMove(a.grade, a.text, null, !!(assisted || guided));
          $('#pc', v).textContent = 'Move ' + Math.ceil(s.ply / 2);
          if (checkEnd()) return;
          setTimeout(botMove, 150);
        });
      }
      function botMove() {
        opEl.innerHTML = '<span class="thinking">Bot is thinking</span>';
        var before = E.clone(s);
        App.engine({ game: 'xq', op: 'best', b: s.b, turn: s.turn, ply: s.ply, depth: bot.depth, noise: bot.noise, ms: bot.ms }).then(function (r) {
          if (over) return;
          E.make(s, r.move); B.ui.last = r.move; B.render();
          var t = threat(s);
          opEl.innerHTML = casual ? 'Bot played <b>' + mvText(before, r.move) + '</b>.' : 'Bot played <b>' + mvText(before, r.move) + '</b>: ' + xIdea(before, r.move, 'their', 'your') + '.' + (t && t.gain >= 300 ? ' <b>Watch your ' + NAME[t.t] + '.</b>' : '');
          busy = false;
          if (!checkEnd()) { showWatch(); suggest(); }
        });
      }
      function showWatch() {
        var w = $('#watch', v); if (casual || over) { w.innerHTML = ''; return; }
        var cues = [], s2 = E.clone(s); s2.turn = 'b';
        var tt = threat(s2); if (tt && tt.gain >= 100) cues.push('<b>Danger:</b> they threaten <b>' + tt.txt + '</b>. Check every cannon screen and chariot line toward that piece.');
        var checks = E.legal(s).filter(function (m) { var t = E.clone(s); E.make(t, m); return E.inCheck(t, 'b'); });
        var mates = checks.filter(function (m) { var t = E.clone(s); E.make(t, m); return !E.legal(t).length; });
        if (mates.length) cues.push('<b>Look:</b> there is a checkmate on the board.');
        else if (checks.length) cues.push('<b>Checks:</b> you have ' + checks.length + ' (' + checks.slice(0, 2).map(function (m) { return mvText(s, m); }).join(', ') + '). Look at each.');
        var mine = threat(s); if (mine && mine.gain >= 100) cues.push('<b>Opportunity:</b> ' + mine.txt + ' wins material. Make sure it isn’t a trap.');
        if (!cues.length) cues.push('<b>Quiet position.</b> Get your chariots to open files, and ask what their last move is preparing.');
        w.innerHTML = '<div class="panel" style="gap:4px;padding:10px 12px"><span class="eyebrow">Pay attention to</span>' + cues.map(function (c) { return '<div class="small">' + c + '</div>'; }).join('') + '</div>';
      }
      function checkEnd() {
        var key = s.b.join(',') + s.turn; reps[key] = (reps[key] || 0) + 1;
        if (!E.legal(s).length) { finish(s.turn === 'r' ? 'l' : 'w'); return true; }
        if (reps[key] >= 3 || s.ply >= 300) { finish('d'); return true; }
        return false;
      }
      function finish(res) {
        over = true; busy = false;
        var x = st();
        if (casual) {
          x.casual = x.casual || { w: 0, l: 0, d: 0 }; x.casual[res]++; App.save(); if (res === 'w') App.celebrate('xq');
          co.innerHTML = '<div class="panel"><h2>' + (res === 'w' ? 'You won!' : res === 'l' ? 'Bot won' : 'Draw') + '</h2><p>Casual game: nothing counted.</p></div>' + WZ.card(res === 'w' ? 'win' : 'loss', true); opEl.textContent = '';
          $('#bt', v).innerHTML = '<button class="btn primary" id="ag">Play again</button><button class="btn" id="dn">Done</button>';
          $('#ag').onclick = function () { App.checkpoint(function () { App.back(); play(lv, true); }); };
          $('#dn').onclick = function () { App.checkpoint(App.back); };
          return;
        }
        if (guided) { // practice: not on the record, no level change
          x.guided = (x.guided || 0) + 1; App.save(); if (res === 'w') App.celebrate('xq');
          co.innerHTML = '<div class="panel"><h2>' + (res === 'w' ? 'You won!' : res === 'l' ? 'Bot won' : 'Draw') + '</h2><p>Guided game ' + x.guided + ' done. Not counted on your record. ' + (ready() ? 'You’re ready for regular games: same bot, no suggestions.' : 'Keep going: the coach teaches the plan while you play.') + '</p></div>'; opEl.textContent = '';
          $('#bt', v).innerHTML = '<button class="btn primary" id="ag">' + (ready() ? 'Play a regular game' : 'Another guided game') + '</button><button class="btn" id="dn">Done</button>';
          $('#ag').onclick = function () { App.checkpoint(function () { App.back(); play(lv, false, !ready()); }); };
          $('#dn').onclick = function () { App.checkpoint(App.back); };
          return;
        }
        x.games[res]++;
        var rr = assisted ? null : App.rate('xq', LV_ELO[lv - 1], res === 'w' ? 1 : res === 'd' ? 0.5 : 0, { seed: seedR, why: (res === 'w' ? 'Win' : res === 'd' ? 'Draw' : 'Loss') + ' vs ' + bot.name });
        var rateNote = rr ? 'Rating ' + rr.before + ' → <b>' + rr.after + '</b> (' + (rr.delta >= 0 ? '+' : '') + rr.delta + '). ' : 'Not rated: ' + assisted + '. ';
        x.winsAt = x.winsAt || {}; if (res === 'w') x.winsAt[lv] = (x.winsAt[lv] || 0) + 1;
        var lvUp = res === 'w' && lv === x.level && lv < MAXLV && x.winsAt[lv] >= winsNeeded(lv);
        if (lvUp) x.level = Math.max(x.level, Math.min(MAXLV, lv + 1));
        if (res === 'w') App.celebrate(lvUp ? 'level' : 'xq');
        App.save();
        var accs = log.map(function (a) { return 100 * Math.exp(-a.loss / 300); });
        var acc = accs.length ? Math.round(accs.reduce(function (p, q) { return p + q; }, 0) / accs.length) : 0;
        x.acc = (x.acc || []).concat([acc]).slice(-20); App.save();
        var worst = log.slice().sort(function (a, b) { return b.loss - a.loss; })[0];
        co.innerHTML = '<div class="panel"><h2>' + (res === 'w' ? 'You won!' : res === 'l' ? 'Bot won' : 'Draw') + '</h2><div class="stats"><div class="stat"><span class="v">' + acc + '%</span><span class="k">Accuracy</span></div><div class="stat"><span class="v">' + log.length + '</span><span class="k">Your moves</span></div></div><p>' +
          rateNote + (lvUp ? 'Level ' + (lv + 1) + ' unlocked. It looks deeper, so slow down on captures.' : res === 'w' ? (lv === x.level && lv < MAXLV ? 'One more win here unlocks level ' + (lv + 1) + '.' : 'Try a higher level.') : 'Read your biggest swing below and run it back.') + '</p></div>' +
          (worst && worst.loss > 50 ? App.coachNote(worst.grade, '<b>Biggest swing:</b> ' + worst.text) : '') + WZ.card(res === 'w' ? (lvUp ? 'level' : 'win') : 'loss', true);
        opEl.textContent = '';
        $('#bt', v).innerHTML = '<button class="btn primary" id="ag">' + (lvUp ? 'Play level ' + (lv + 1) : 'Play again') + '</button><button class="btn" id="dn">Done</button>';
        $('#ag').onclick = function () { App.checkpoint(function () { App.back(); play(lvUp ? lv + 1 : lv); }); };
        $('#dn').onclick = function () { App.checkpoint(App.back); };
        if (lvUp && lv + 1 >= 4) WZ.onlineNudge('xq');
      }
      $('#hn', v).onclick = function () {
        if (busy || over || s.turn !== 'r') return; ratedPill('hint used');
        busy = true; co.innerHTML = '<div class="thinking">Looking for the best move</div>';
        App.engine({ game: 'xq', op: 'best', b: s.b, turn: s.turn, ply: s.ply, depth: 3, ms: 700 }).then(function (r) { if (over) return; B.ui.hint = r.move; B.render(); busy = false; co.innerHTML = App.coachHTML('info', 'Try <b>' + mvText(s, r.move) + '</b>: ' + xIdea(s, r.move) + '.'); });
      };
      $('#tb', v).onclick = function () {
        if (busy || over || s.hist.length < 2) return;
        ratedPill('take-back used'); E.undo(s); E.undo(s); log.pop(); B.ui.last = null; B.ui.hint = null; B.render(); co.innerHTML = App.coachHTML('info', 'Taken back. Your move.'); opEl.textContent = ''; suggest();
      };
      $('#rs', v).onclick = function () { if (!over) finish('l'); };
    });
  }
  function place() {
    App.screen('Xiangqi placement', function (v) {
      v.innerHTML = '<h2>Have you played xiangqi before?</h2><div class="list"><button class="btn opt" data-e="0">Never, teach me from zero</button><button class="btn opt" data-e="1">I know how the pieces move</button><button class="btn opt" data-e="2">I play sometimes</button></div>';
      $$('[data-e]', v).forEach(function (b) {
        b.onclick = function () {
          var e = +b.dataset.e, x = st();
          if (e === 0) { x.placed = 1; App.save(); App.tab('xq'); return; }
          check(e);
        };
      });
      function check(e) {
        var kinds = ['H', 'C', 'E'], k = 0, right = 0;
        function one() {
          if (k >= kinds.length) return done();
          var d = makeDrill(kinds[k], 2), picked = [];
          v.innerHTML = '<div class="row"><span class="pill acc">Rules check ' + (k + 1) + ' / 3</span></div><p>Tap every point this <b>' + NAME[kinds[k]] + '</b> can move to, then Check.</p><div id="bd"></div><div id="co"></div><button class="btn primary" id="ck" style="width:100%">Check</button>';
          var B;
          function draw() { B = mount($('#bd', v), d.s, { onTap: function (i) { var j = picked.indexOf(i); if (j >= 0) picked.splice(j, 1); else if (i !== d.at) picked.push(i); draw(); } }); B.ui.sel = d.at; B.ui.targets = picked.slice(); B.ui.labels = true; B.render(); }
          draw();
          $('#ck', v).onclick = function () {
            if (this.dataset.done) { k++; one(); return; }
            var ok = d.ans.length === picked.length && d.ans.every(function (a) { return picked.indexOf(a) >= 0; });
            if (ok) right++;
            B.ui.targets = []; B.ui.marks = {}; d.ans.forEach(function (a) { B.ui.marks[a] = 'right'; }); B.render();
            $('#co', v).innerHTML = App.coachHTML(ok ? 'right' : 'wrong', ok ? 'Correct.' : 'Green dots show the legal moves.');
            this.dataset.done = 1; this.textContent = 'Next';
          };
        }
        function done() {
          var x = st(); x.placed = 1;
          if (right === 3) { ['x1', 'x2', 'x3', 'x4', 'x5', 'x6'].forEach(function (id) { x.lessons[id] = 1; }); x.level = Math.max(x.level, e === 2 ? 3 : 2); }
          App.save();
          v.innerHTML = '<div class="panel"><span class="eyebrow">Placement done</span><h2>' + right + ' / 3 rules checks</h2><p>' + (right === 3 ? 'You know the rules. Bot level ' + x.level + ' unlocked. Start with the Characters trainer to read the pieces without English letters.' : 'Let’s lock in the rules first: the lessons and move trainer will get you there fast.') + '</p><button class="btn primary" id="gh">Go to xiangqi</button></div>';
          $('#gh', v).onclick = function () { App.tab('xq'); };
        }
        one();
      }
    });
  }
  function report() {
    var x = st(), out = [], e = x.err || {}, n = (e.hang || 0) + (e.mate || 0) + (e.other || 0);
    if (n >= 3) { var top = Object.keys(e).sort(function (a, b) { return e[b] - e[a]; })[0]; out.push({ sev: e[top] / n, text: ({ hang: 'You leave pieces on lines that cannons and chariots can reach', mate: 'You miss checkmates and let your general get trapped', other: 'Your mistakes are about piece activity, not blunders' }[top]) + ': ' + e[top] + ' of ' + n + ' mistakes.', action: top === 'other' ? 'Lessons' : 'Puzzles', go: top === 'other' ? home : (XP.length ? puzzles : home) }); }
    var dr = x.drill || {}, weakest = ['H', 'C', 'E', 'K', 'A', 'P', 'R'].sort(function (a, b) { return (dr[a] || 0) - (dr[b] || 0); })[0];
    if (Object.keys(dr).length) out.push({ sev: 0.4 - (dr[weakest] || 0) * 0.06, text: 'Move trainer: your weakest piece is the <b>' + NAME[weakest] + '</b> (difficulty ' + ((dr[weakest] || 0) + 1) + ').', action: 'Move trainer', go: function () { drill(null); } });
    var m = 0; CHARS.forEach(function (c) { if (mastered(c)) m++; }); if (m < 14) out.push({ sev: 0.3 - m * 0.02, text: m + ' of 14 characters mastered. Reading the pieces without letters is what makes real boards playable.', action: 'Characters', go: charsQuiz });
    if (!out.length) out.push({ sev: 0, text: 'Play a few games and run the move trainer; the coach will map what to fix.', action: 'Play bot', go: playMenu });
    return out.sort(function (a, b) { return b.sev - a.sev; });
  }
  // ---------- opening book: standard openings in WXF notation, walked through and drilled on the board ----------
  // WXF: piece letter + file + (+ forward, - back, . sideways) + number. Files count 1–9 from each player's own right.
  // Rooks, cannons, pawns, king: the number is ranks moved (or the new file when sideways); horse, elephant, advisor: the new file.
  var WXF_P = { K: 'K', G: 'K', A: 'A', E: 'E', B: 'E', H: 'H', N: 'H', R: 'R', C: 'C', P: 'P' };
  function wxf(s, str) {
    var t = String(str).trim().toUpperCase(), side = s.turn, front = null, L, file = null, op, num;
    var m1 = t.match(/^([KGAEBHNRCP])([1-9])([+\-.=])([1-9])$/), m2 = t.match(/^([+\-])([KGAEBHNRCP])([+\-.=])([1-9])$/);
    if (m1) { L = WXF_P[m1[1]]; file = +m1[2]; op = m1[3]; num = +m1[4]; }
    else if (m2) { front = m2[1] === '+'; L = WXF_P[m2[2]]; op = m2[3]; num = +m2[4]; }
    else return null;
    if (op === '=') op = '.';
    var colOf = function (f) { return side === 'r' ? 9 - f : f - 1; }, dir = side === 'r' ? -1 : 1;
    var legal = E.legal(s).filter(function (m) { return s.b[m.f] === side + L; });
    if (file != null) legal = legal.filter(function (m) { return m.f % 9 === colOf(file); });
    else { // tandem pieces on one file: + is the one further forward
      var cols = {}; legal.forEach(function (m) { var c = m.f % 9; (cols[c] = cols[c] || []).push((m.f / 9) | 0); });
      var c = Object.keys(cols).filter(function (k) { return cols[k].filter(function (r, i, a) { return a.indexOf(r) === i; }).length >= 2; })[0]; if (c == null) return null;
      var rows = cols[c].filter(function (r, i, a) { return a.indexOf(r) === i; }).sort(function (a, b) { return (a - b) * dir; });
      var pick = front ? rows[rows.length - 1] : rows[0];
      legal = legal.filter(function (m) { return m.f % 9 === +c && ((m.f / 9) | 0) === pick; });
    }
    var hits = legal.filter(function (m) {
      var fr = (m.f / 9) | 0, fc = m.f % 9, tr = (m.t / 9) | 0, tc = m.t % 9;
      if ('RCPK'.indexOf(L) >= 0) { if (op === '.') return tr === fr && tc === colOf(num); return tc === fc && tr === fr + (op === '+' ? dir : -dir) * num; }
      if (op === '.') return false;
      return tc === colOf(num) && (tr - fr) * dir * (op === '+' ? 1 : -1) > 0;
    });
    return hits.length === 1 ? hits[0] : null;
  }
  function bookLine(line) { // turn a WXF line into engine moves; null if any move doesn't parse to exactly one legal move
    var s = E.start(), out = [];
    for (var i = 0; i < line.moves.length; i++) { var m = wxf(s, line.moves[i]); if (!m) return null; out.push(m); E.make(s, m); }
    return out;
  }
  // lines that don't parse to legal moves are dropped (the build checks them too)
  var BOOK = (typeof XQ_BOOK !== 'undefined' ? XQ_BOOK : []).map(function (o) { o.lines = o.lines.filter(function (l) { l.mv = bookLine(l); return !!l.mv; }); return o; }).filter(function (o) { return o.lines.length; });
  function bst() { var x = st(); x.book = x.book || {}; return x.book; }
  function book() {
    App.screen('Opening book', function (v) {
      var bk = bst();
      v.innerHTML = '<p class="mute small">The openings strong players actually use. Read the idea, walk through the moves, then drill your side until you can play it clean. Moves are shown in WXF notation (piece, file, direction, number) so you can follow books and videos.</p>' +
        [['r', 'As Red'], ['b', 'As Black']].map(function (g) {
          var list = BOOK.filter(function (o) { return o.side === g[0]; }); if (!list.length) return '';
          return '<span class="eyebrow">' + g[1] + '</span><div class="list">' + list.map(function (o) {
            var stars = o.lines.reduce(function (t, l, k) { return t + Math.min(3, bk[o.id + ':' + k] || 0); }, 0), max = o.lines.length * 3;
            return '<button class="item' + (stars >= max ? ' done' : '') + '" data-o="' + o.id + '"><span class="grow"><span class="t">' + esc(o.name) + ' <span class="mute" style="font-family:var(--han)">' + esc(o.zh || '') + '</span></span><br><span class="s">' + o.lines.length + ' lines · ' + stars + '/' + max + ' stars</span></span><span class="end">›</span></button>';
          }).join('') + '</div>';
        }).join('');
      $$('[data-o]', v).forEach(function (b) { b.onclick = function () { bookOpening(BOOK.filter(function (o) { return o.id === b.dataset.o; })[0]); }; });
    });
  }
  function bookOpening(o) {
    App.screen(o.name, function (v) {
      var li = 0;
      function draw() {
        var line = o.lines[li], mv = line.mv, s = E.start(), i = 0;
        v.innerHTML = '<div class="prose"><p>' + esc(o.idea) + '</p><ul>' + o.keys.map(function (k) { return '<li>' + esc(k) + '</li>'; }).join('') + '</ul></div>' +
          (o.lines.length > 1 ? '<div class="seg" id="ls">' + o.lines.map(function (l, k) { return '<button aria-pressed="' + (k === li) + '" data-li="' + k + '">' + esc(l.name) + '</button>'; }).join('') + '</div>' : '') +
          '<div id="bd"></div><div id="co"></div><div class="btns"><button class="btn" id="pv">‹ Back</button><button class="btn" id="nx">Next ›</button><button class="btn primary" id="dr">Drill it</button></div>';
        var B = mount($('#bd', v), s, { flip: o.side === 'b', canMove: function () { return false; }, onMove: function () {} });
        function show() {
          var co = $('#co', v);
          if (!i) { co.innerHTML = App.coachHTML('info', 'Tap Next to walk through ' + esc(line.name) + '. You play ' + (o.side === 'r' ? 'Red' : 'Black') + '.'); return; }
          var who = (i - 1) % 2 === 0 ? 'Red' : 'Black', note = (line.notes || {})[i - 1];
          co.innerHTML = App.coachHTML('info', '<b>' + Math.ceil(i / 2) + '. ' + esc(line.moves[i - 1]) + '</b> (' + who + ')' + (note ? '. ' + esc(note) : '.'));
        }
        function replay(k) { s = E.start(); for (var j = 0; j < k; j++) E.make(s, mv[j]); B = mount($('#bd', v), s, { flip: o.side === 'b', canMove: function () { return false; }, onMove: function () {} }); B.ui.last = k ? mv[k - 1] : null; B.render(); }
        $('#nx', v).onclick = function () { if (i < mv.length) { i++; replay(i); show(); if (i === mv.length) { var bw = bst(); bw['walk:' + o.id + ':' + li] = bw['walk:' + o.id + ':' + li] || Date.now(); App.save(); } } };
        $('#pv', v).onclick = function () { if (i > 0) { i--; replay(i); show(); } };
        $('#dr', v).onclick = function () { bookDrill(o, li); };
        $$('[data-li]', v).forEach(function (b) { b.onclick = function () { li = +b.dataset.li; draw(); }; });
        show();
      }
      draw();
    });
  }
  function bookDrill(o, li) {
    App.screen('Drill: ' + o.name, function (v) {
      var line = o.lines[li], mv = line.mv, s = E.start(), i = 0, misses = 0, busy = false, wrong = 0, my = o.side;
      // Oct 18: learn a line with arrows and explanations first; play it from memory after that
      var bk0 = bst(), wkey = 'walk:' + o.id + ':' + li, learn = !bk0[wkey] && !(bk0[o.id + ':' + li] > 0);
      function hintNext() { if (learn && i < mv.length && s.turn === my) { B.ui.hint = mv[i]; B.render(); var note = (line.notes || {})[i]; co.innerHTML = App.coachHTML('info', '<b>Learn it first.</b> Your move: <b>' + esc(line.moves[i]) + '</b> (follow the highlight)' + (note ? '. ' + esc(note) : '.')); } }
      v.innerHTML = '<div class="row"><span class="pill acc">You play ' + (my === 'r' ? 'Red' : 'Black') + '</span><span class="pill" id="pg">0/' + mv.length + '</span></div><div id="bd"></div><div id="co"></div><div class="btns" id="bt"></div>';
      var co = $('#co', v), B = mount($('#bd', v), s, { flip: my === 'b', canMove: function () { return !busy && s.turn === my && i < mv.length; }, onMove: onMove });
      co.innerHTML = App.coachHTML('info', learn ? '<b>New line: learn it first.</b> Follow the highlighted moves; next time you play ' + esc(line.name) + ' from memory.' : 'Play ' + esc(line.name) + ' from memory. The other side is played for you.');
      function same(a, b) { return a.f === b.f && a.t === b.t; }
      function auto() {
        if (i < mv.length && s.turn !== my) { busy = true; setTimeout(function () { E.make(s, mv[i]); B.ui.last = mv[i]; i++; B.render(); $('#pg', v).textContent = i + '/' + mv.length; busy = false; if (i >= mv.length) finish(); else hintNext(); }, learn ? 700 : 450); }
      }
      function onMove(m) {
        if (same(m, mv[i])) {
          E.make(s, m); B.ui.last = m; B.ui.hint = null; i++; wrong = 0; B.render(); $('#pg', v).textContent = i + '/' + mv.length;
          var note = (line.notes || {})[i - 1];
          co.innerHTML = App.coachMove('right', '<b>' + esc(line.moves[i - 1]) + '</b>' + (note ? '. ' + esc(note) : '.'), null, learn);
          if (i >= mv.length) finish(); else auto();
        } else {
          if (learn) { hintNext(); return; }
          misses++; wrong++;
          if (wrong >= 2) { B.ui.hint = mv[i]; B.render(); }
          co.innerHTML = App.coachMove('wrong', 'Not the book move here. ' + (wrong >= 2 ? 'It’s <b>' + esc(line.moves[i]) + '</b> (highlighted).' : 'Think about the plan: ' + esc(o.keys[0]) + '.'));
        }
      }
      function finish() {
        var bk = bst(), key = o.id + ':' + li;
        if (learn) {
          bk[wkey] = Date.now(); App.save();
          co.innerHTML = App.coachNote('right', 'Line learned: <b>' + esc(line.name) + '</b>. Now play it from memory, no highlights.');
          $('#bt', v).innerHTML = '<button class="btn primary" id="mem">Play it from memory</button><button class="btn" id="dn">Later</button>';
          $('#mem', v).onclick = function () { App.back(); bookDrill(o, li); };
          $('#dn', v).onclick = function () { App.checkpoint(App.back); };
          return;
        }
        if (!misses) bk[key] = Math.min(3, (bk[key] || 0) + 1);
        App.save();
        co.innerHTML = App.coachNote(misses ? 'good' : 'right', misses ? 'Line done with ' + misses + ' slip' + (misses > 1 ? 's' : '') + '. Run it clean for a star.' : 'Clean run! ' + (bk[key] >= 3 ? 'Mastered.' : 'Star earned (' + bk[key] + '/3).'));
        $('#bt', v).innerHTML = '<button class="btn primary" id="ag">Again</button><button class="btn" id="dn">Done</button>';
        $('#ag', v).onclick = function () { App.checkpoint(function () { App.back(); bookDrill(o, li); }); };
        $('#dn', v).onclick = function () { App.checkpoint(App.back); };
      }
      if (my === s.turn) hintNext(); auto();
    });
  }
  function bookNext() { var bk = bst(), best = null; BOOK.forEach(function (o) { o.lines.forEach(function (l, k) { var b = bk[o.id + ':' + k] || 0; if (b < 3 && (!best || b < best.b || (b === best.b && o.lv < best.o.lv))) best = { o: o, k: k, b: b }; }); }); return best; }

  function quick() {
    var x = st(), out = [], rep = report()[0];
    var nl = LESSONS.filter(function (l) { return !x.lessons[l.id]; })[0];
    if (nl) out.push({ label: 'Xiangqi lesson: ' + nl.t, why: 'Next step in the course.', go: function () { lesson(nl); }, quota: 2, w: ready() ? 1.5 : 4 /* beginners: lessons first */ });
    var bn = BOOK.length && x.level >= 2 ? bookNext() : null;
    if (bn) out.push({ label: 'Opening book: ' + bn.o.name, why: 'Drill ' + bn.o.lines[bn.k].name + ' until you can play it clean three times.', go: function () { bookDrill(bn.o, bn.k); }, quota: 1, w: 1 });
    if (XP.length) out.push({ label: 'Xiangqi puzzles', why: 'Rated tactics from real positions.', go: function () { puzzles(); }, quota: 5, w: 2.6 });
    if (XP.some(function (p) { return p.kind === 'mate2'; }) && Object.keys(x.psolved || {}).length >= 15) out.push({ label: 'Xiangqi: mate in 2', why: 'A forcing first move, then the finish. Builds the calculation real games need.', go: function () { puzzles({ kind: 'mate2' }); }, quota: 4, w: 1.4 }); // Oct 18: Alain wants more puzzles and play
    if (ready()) out.push({ label: 'Coached game vs ' + BOTS[x.level - 1].name, why: 'Every move graded in plain English.', go: function () { play(x.level); }, quota: 1, w: 2 });
    else if (Object.keys(x.psolved || {}).length >= 5) out.push({ label: 'Guided game: learn to play', why: 'The coach highlights a good move every turn and says why. Doesn’t count toward your record.', go: function () { play(1, false, true); }, quota: 1, w: 1.4 });
    if (CHARS.filter(mastered).length < CHARS.length) out.push({ label: 'Piece characters', why: rep.text.indexOf('characters') >= 0 ? rep.text : 'Read the pieces without English letters.', go: charsQuiz, quota: 1, w: .8 });
    // Oct 18: Move trainer is no longer in quick play ("not guessing where pieces can move"); it stays under Pick it myself
    return out;
  }
  // ---------- baseline test (Oct 18): part 1 = how each of the 7 pieces moves (tap every point; pass = that rules lesson counts as done);
  // part 2 = 6 puzzles that adapt to find your level. One try each, no hints. Saves a dated report.
  function pieceQ(kind, title, cb) {
    App.screen(title, function (v) {
      var d = makeDrill(kind, 1), picked = [], over = false, B;
      v.innerHTML = '<p class="mute small">Tap every point the highlighted <b>' + NAME[kind] + '</b> can move to, then press Check.</p><div id="bd"></div><div id="co"></div><div class="btns"><button class="btn primary" id="ck">Check</button><button class="btn" id="bidk">I don’t know</button></div>';
      function draw() { B = mount($('#bd', v), d.s, { onTap: function (i) { if (over) return; var k = picked.indexOf(i); if (k >= 0) picked.splice(k, 1); else if (i !== d.at) picked.push(i); draw(); } }); B.ui.sel = d.at; B.ui.targets = picked.slice(); B.render(); }
      function finish(ok) {
        over = true; B.ui.targets = []; B.ui.marks = {}; d.ans.forEach(function (a) { B.ui.marks[a] = 'right'; }); picked.filter(function (a) { return d.ans.indexOf(a) < 0; }).forEach(function (a) { B.ui.marks[a] = 'wrong'; }); B.render();
        $('#co', v).innerHTML = App.coachMove(ok ? 'right' : 'wrong', (ok ? 'All ' + d.ans.length + ' moves found. ' : 'Green dots are its legal moves. ') + MOVE_WHY[kind]);
        $('.btns', v).innerHTML = '<button class="btn primary" id="blnx" style="width:100%">Next</button>'; $('#blnx', v).onclick = function () { App.back(); cb(ok); };
      }
      draw();
      $('#ck', v).onclick = function () { if (over) return; finish(d.ans.every(function (a) { return picked.indexOf(a) >= 0; }) && picked.every(function (a) { return d.ans.indexOf(a) >= 0; })); };
      $('#bidk', v).onclick = function () { if (!over) finish(false); };
    });
  }
  function baseline() {
    var x = st(), kinds = ['K', 'A', 'E', 'H', 'R', 'C', 'P'], ki = 0, known = {}, stair = null, n2 = 0, used = {};
    App.screen('Xiangqi baseline', function (v) {
      v.innerHTML = '<div><span class="eyebrow">Baseline · about 5 minutes</span><h1>Find your xiangqi level</h1></div><div class="prose"><ul><li><b>Part 1:</b> how each of the 7 pieces moves. Get one right and its rules lesson counts as done.</li><li><b>Part 2:</b> 6 puzzles that get harder when you’re right and easier when you miss.</li><li>One try each, no hints. “I don’t know” is fine: it places you where you’ll learn it.</li></ul></div><button class="btn primary" id="blgo" style="width:100%">Start</button>';
      $('#blgo', v).onclick = function () { App.back(); part1(); };
    });
    function part1() {
      if (ki >= kinds.length) return part2();
      var k = kinds[ki];
      pieceQ(k, 'Baseline 1 · the ' + NAME[k] + ' (' + (ki + 1) + '/7)', function (ok) { if (ok) { known[k] = 1; x.moveSeen = x.moveSeen || {}; x.moveSeen[k] = 1; } ki++; part1(); });
    }
    function part2() {
      if (!stair) stair = App.staircase(750 + 40 * Object.keys(known).length, 200, 50, Math.min.apply(null, XP.map(function (p) { return p.rating; })), Math.max.apply(null, XP.map(function (p) { return p.rating; })));
      if (n2 >= 6) return done();
      var cand = XP.map(function (p, i) { return { p: p, i: i }; }).filter(function (o) { return !used[o.i]; }).sort(function (a, b) { return Math.abs(a.p.rating - stair.at) - Math.abs(b.p.rating - stair.at); });
      var o = cand[Math.floor(Math.random() * 3)]; used[o.i] = 1; n2++;
      puzzles({ only: o.i, title: 'Baseline 2 · puzzle ' + n2 + ' of 6', onResult: function (ok) { stair.answer(ok); part2(); } });
    }
    function done() {
      var lvl = stair.result(); x.prating = lvl;
      LESSONS.forEach(function (l) { if (l.piece && known[l.piece] && (l.piece !== 'E' || known.A)) x.lessons[l.id] = 1; });
      App.save();
      var nk = Object.keys(known).length, nextL = LESSONS.filter(function (l) { return !x.lessons[l.id]; })[0];
      App.baselineSave('xq', { headline: nk + ' of 7 pieces known · puzzle level ~' + lvl, pieces: Object.keys(known), puzzle: lvl,
        lines: ['<b>Pieces you know:</b> ' + (nk ? Object.keys(known).map(function (k) { return NAME[k]; }).join(', ') : 'none yet: the rules lessons come first') + '.', '<b>Puzzle level:</b> about ' + lvl + '.', '<b>Before bot games:</b> ' + (ready() ? 'you’re ready for regular games.' : 'finish the rules lessons, 10 puzzles and 2 guided games; the coach takes you through them.')],
        next: nextL ? 'the lesson <b>' + esc(nextL.t) + '</b>. Play now builds from there.' : (ready() ? 'a coached game against your bot level.' : 'puzzles, then a guided game.') });
      App.baselineReport('xq');
    }
  }
  App.reg('xq', { home: home, place: place, baseline: baseline, report: report, quick: quick });
  if (typeof applyDistract === 'function') applyDistract(LESSONS.filter(function (l) { return l.q && l.q.length === 3; }).map(function (l) { return l.q; }), 0, 1);
  return { baseline: baseline, ready: ready, book: book, bookDrill: bookDrill, wxf: wxf, BOOK: BOOK, estElo: estElo, xIdea: xIdea, analyse: analyse, makeDrill: makeDrill, home: home, lesson: lesson, LESSONS: LESSONS, playMenu: playMenu, play: play, puzzles: puzzles, charsQuiz: charsQuiz, drill: drill, BOTS: BOTS, CHARS: CHARS, mastered: mastered, hasPuzzles: function () { return XP.length > 0; } };
})();
