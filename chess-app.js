// ===================== CHESS =====================
var CZ = (function () {
  var $ = App.$, $$ = App.$$, esc = App.esc;
  var N = { p: 'pawn', n: 'knight', b: 'bishop', r: 'rook', q: 'queen', k: 'king' };
  var PV = ENG.PV, MATE = ENG.MATE;
  // Drawn pieces (inline SVG) so they render identically on every phone; font glyphs mis-color on iOS.
  var SHAPES = {
    p: '<circle cx="20" cy="12" r="5.2"/><path d="M15.5 20.5h9l2.5 9h-14z"/><path d="M11 30.5h18v4.5H11z"/>',
    r: '<path d="M11 8h4v4h3V8h4v4h3V8h4v7l-2.5 2.5v11l2.5 2.5v4H11v-4l2.5-2.5v-11L11 15z"/>',
    n: '<path d="M13 35V30c0-5 2.5-8 6-11l-1.5-3.5-3.5 1.5-1-2.2 4-5.3L19.5 6l2 3.5c5.5 0 9.5 4.5 9.5 11.5V35z"/><circle cx="24" cy="13.5" r="1.3" class="eye" stroke="none"/>',
    b: '<circle cx="20" cy="7" r="2.3"/><path d="M20 10c4.5 3.5 7 8 7 12.5 0 3.5-2.5 6-7 6s-7-2.5-7-6c0-4.5 2.5-9 7-12.5z"/><path d="M12 30.5h16v4.5H12z"/><path d="M20 14v9M17 18.5h6" stroke-width="1.6"/>',
    q: '<path d="M9 14l5 12h12l5-12-6 6-5-10-5 10z"/><circle cx="9" cy="12.5" r="2"/><circle cx="20" cy="8.5" r="2"/><circle cx="31" cy="12.5" r="2"/><path d="M12 27.5h16l1 3.5H11z"/><path d="M11 31.5h18v3.5H11z"/>',
    k: '<path d="M18.3 5h3.4v3.3H25v3.2h-3.3v3.5h-3.4v-3.5H15V8.3h3.3z"/><path d="M20 15c-4-3.5-9-1.5-9 3 0 3 3 5 6 8l3 2.5 3-2.5c3-3 6-5 6-8 0-4.5-5-6.5-9-3z"/><path d="M12 28.5h16l1 3H11z"/><path d="M11 31.5h18v3.5H11z"/>'
  };
  function pieceSVG(type, color) {
    var w = color === 'w';
    return '<svg viewBox="0 0 40 40" aria-hidden="true" style="width:84%;height:84%;display:block;overflow:visible"><g fill="' + (w ? '#f8f4ea' : '#2a231d') + '" stroke="' + (w ? '#2a231d' : '#e9dcc2') + '" stroke-width="' + (w ? 1.5 : 1.3) + '" stroke-linejoin="round" stroke-linecap="round" style="paint-order:stroke fill">' + SHAPES[type].replace('class="eye"', 'fill="' + (w ? '#2a231d' : '#e9dcc2') + '"') + '</g></svg>';
  }

  function st() {
    var c = App.S.chess;
    if (c.rating == null) { c.rating = 800; c.solved = {}; c.seen = {}; c.lessons = {}; c.open = {}; c.botLevel = 1; c.games = { w: 0, l: 0, d: 0 }; c.err = { hang: 0, mate: 0, take: 0, other: 0 }; c.peak = 800; c.lossStreak = 0; c.acc = []; }
    return c;
  }

  // ---------------- puzzles ----------------
  var HP = [
    { id: 'free1', r: 450, th: 'Free piece', fen: '4k3/8/8/3n4/8/8/8/3RK3 w - - 0 1', sol: ['Rxd5'], why: 'Their knight has no defender. Anything nobody protects is free: just take it.' },
    { id: 'promo', r: 480, th: 'Promotion', fen: '8/4P3/8/8/8/8/k7/4K3 w - - 0 1', sol: ['e8=Q'], why: 'A pawn that reaches the last row becomes a queen. Nothing can stop this one.' },
    { id: 'br1', r: 560, th: 'Back-rank mate', fen: '6k1/5ppp/8/8/8/8/5PPP/3R2K1 w - - 0 1', sol: ['Rd8#'], why: 'Their king is boxed in by its own pawns. A rook on the back row checks it and every escape square is blocked.' },
    { id: 'br2', r: 600, th: 'Back-rank mate', fen: '3r2k1/5ppp/8/8/8/8/5PPP/6K1 b - - 0 1', sol: ['Rd1#'], why: 'Same pattern from Black’s side: White’s king is stuck behind its own pawns, so a rook on the first row is mate.' },
    { id: 'qk', r: 520, th: 'Queen + king mate', fen: '7k/8/6K1/8/8/8/8/Q7 w - - 0 1', sol: ['Qa8#'], why: 'Your king covers g7, g8’s neighbors and h7. The queen checks along the back row and nothing is left.' },
    { id: 'ladder', r: 540, th: 'Rook mate', fen: 'k7/8/1K6/8/8/8/8/7R w - - 0 1', sol: ['Rh8#'], why: 'Your king takes away a7 and b7. The rook checks on the back row, so the king has nowhere to go.' },
    { id: 'scholar', r: 640, th: 'Opening trap', fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4', sol: ['Qxf7#'], why: 'f7 is only defended by the king at the start. Queen plus bishop both hit it, and the king can’t take a protected queen. This is Scholar’s Mate.' },
    { id: 'fool', r: 560, th: 'Opening trap', fen: 'rnbqkbnr/pppp1ppp/8/4p3/6P1/5P2/PPPPP2P/RNBQKBNR b KQkq g3 0 2', sol: ['Qh4#'], why: 'White opened the diagonal to their own king. The queen checks and the king’s own pieces block every exit. Fool’s Mate, the fastest mate in chess.' },
    { id: 'smother', r: 760, th: 'Smothered mate', fen: '6rk/6pp/7N/8/8/8/8/6K1 w - - 0 1', sol: ['Nf7#'], why: 'The king is surrounded by its own pieces. Knights jump, so nothing can block the check.' },
    { id: 'arab', r: 820, th: 'Rook + knight mate', fen: '7k/7p/5N2/8/8/8/8/6RK w - - 0 1', sol: ['Rg8#'], why: 'The knight protects g8, so the king can’t capture your rook. This pairing is called the Arabian mate.' },
    { id: 'roller', r: 980, th: 'Rook roller', fen: '6k1/8/8/8/8/8/R7/1R4K1 w - - 0 1', sol: ['Ra7', 'Kh8', 'Rb8#'], why: 'One rook builds a wall on the 7th row, the other delivers mate on the 8th. Quiet moves that cut off the king are often stronger than checks.' },
    { id: 'br3', r: 1000, th: 'Back-rank mate in 2', fen: '3rr1k1/5ppp/8/8/8/8/4RPPP/4R1K1 w - - 0 1', sol: ['Rxe8+', 'Rxe8', 'Rxe8#'], why: 'Two rooks beat one defender. Trade on e8 and your second rook lands on the back row with mate.' },
    { id: 'br4', r: 1150, th: 'Queen sacrifice', fen: 'r5k1/5ppp/8/8/8/8/1Q3PPP/1R4K1 w - - 0 1', sol: ['Qb8+', 'Rxb8', 'Rxb8#'], why: 'Give up the queen to drag their rook away from the back row. Your rook then mates. Count the final position, not the pieces you give.' },
    { id: 'philidor', r: 1180, th: 'Smothered mate in 2', fen: 'r6k/6pp/7N/8/2Q5/8/8/6K1 w - - 0 1', sol: ['Qg8+', 'Rxg8', 'Nf7#'], why: 'The queen check forces their rook onto g8, which blocks the king’s last square. Then the knight mates. A famous pattern called Philidor’s legacy.' },
    { id: 'nfork', r: 780, th: 'Knight fork', fen: 'r3k3/8/8/1N6/8/8/8/4K3 w - - 0 1', sol: ['Nc7+', 'Kd7', 'Nxa8'], why: 'The knight checks the king and attacks the rook at once. The king must move, so the rook falls.' },
    { id: 'qfork', r: 850, th: 'Royal fork', fen: 'q3k3/8/8/1N6/8/8/8/4K3 w - - 0 1', sol: ['Nc7+', 'Kd8', 'Nxa8'], why: 'Knight forks are deadliest with check. The king has to step away and you collect the queen.' },
    { id: 'pfork', r: 900, th: 'Pawn fork', fen: '4k3/8/2n1n3/8/3P4/8/8/4K3 w - - 0 1', sol: ['d5', 'Ne5', 'dxe6'], why: 'A pawn attacking two pieces is a nightmare for them: both knights are worth more than the pawn and only one can escape.' },
    { id: 'skewer', r: 950, th: 'Skewer', fen: 'q7/8/8/3k4/8/8/8/4KB2 w - - 0 1', sol: ['Bg2+', 'Kc5', 'Bxa8'], why: 'Check the king along the diagonal. When it steps aside, the queen behind it is exposed. A skewer is a fork in a straight line.' },
    { id: 'petrov', r: 1050, th: 'Discovered attack', fen: 'rnbqkb1r/pppp1ppp/5n2/4N3/8/8/PPPPQPPP/RNB1KB1R w KQkq - 2 5', sol: ['Nc6+', 'Be7', 'Nxd8'], why: 'Moving the knight uncovers your queen’s check on the e-file. They must handle the check, and the knight is already attacking their queen.' },
    { id: 'legal', r: 1200, th: 'Legal’s mate', fen: 'rn1qkbnr/ppp2p1p/3p2p1/4N3/2B1P3/2N5/PPPP1PPP/R1BbK2R w KQkq - 0 6', sol: ['Bxf7+', 'Ke7', 'Nd5#'], why: 'They grabbed your queen, but three minor pieces now hunt the king. Check first, then the knight seals every square.' },
    { id: 'blackburne', r: 1300, th: 'Opening trap', fen: 'r1b1kbnr/pppp1Npp/8/6q1/2BnP3/8/PPPP1PPP/RNBQK2R b KQkq - 0 5', sol: ['Qxg2', 'Rf1', 'Qxe4+', 'Be2', 'Nf3#'], why: 'White got greedy on f7. Your queen and knight crash in on g2 and e4, and the knight finishes on f3 where the e2 bishop blocks the king.' },
    { id: 'englund', r: 1350, th: 'Opening trap', fen: 'r1b1kbnr/pppp1ppp/2n5/4P3/8/2B2N2/PqP1PPPP/RN1QKB1R b KQkq - 1 6', sol: ['Bb4', 'Qd2', 'Bxc3', 'Qxc3', 'Qc1#'], why: 'Pin the c3 bishop, trade it off, and the queen slides to c1 where White’s own pieces block the king.' }
  ];
  var MINED = ((typeof MINED_PUZZLES !== 'undefined') ? MINED_PUZZLES : []).concat(App.X().chessPuzzles || []);
  var ALL = HP.concat(MINED.map(function (p, i) {
    return { id: 'm' + i, r: p.rating, th: p.kind === 'mate' ? 'Mate in ' + p.mateN : 'Win material', fen: p.fen, sol: p.sol, mined: true };
  }));
  var BYID = {}; ALL.forEach(function (p) { BYID[p.id] = p; });
  var CREATIVE = null;
  function creativePool() { if (!CREATIVE) CREATIVE = ALL.filter(function (p) { p.ck = creativeKind(p.fen, p.sol[0]); return !!p.ck; }); return CREATIVE; }

  // ---------------- openings ----------------
  var OPS = [
    { id: 'italian', name: 'Italian Game', side: 'w', eco: 'C50', moves: 'e4 e5 Nf3 Nc6 Bc4 Bc5 c3 Nf6 d3 d6 O-O O-O',
      theory: 'The classic first opening. You grab the center with a pawn, develop knights before bishops, aim the bishop at f7 (the weakest square near Black’s king), then castle.',
      keys: ['Bishop on c4 stares at f7', 'c3 prepares d4 later to take more center', 'Castle early, then build slowly'],
      notes: { 4: 'The bishop points at f7, the one square only Black’s king protects.', 6: 'c3 gets ready to push d4 and kick Black out of the center.', 8: 'A calm move: d3 protects e4 and opens the c1 bishop.' } },
    { id: 'ruy', name: 'Ruy López', side: 'w', eco: 'C84', moves: 'e4 e5 Nf3 Nc6 Bb5 a6 Ba4 Nf6 O-O Be7 Re1 b5 Bb3 d6 c3 O-O',
      theory: 'The most respected e4 opening. Your bishop pressures the knight that defends e5, so Black is always a bit uncomfortable in the center.',
      keys: ['Bb5 attacks the defender of e5', 'Retreat the bishop to a4, then b3, keeping it aimed at f7', 'Re1 and c3 prepare d4'],
      notes: { 4: 'Bb5 hits the knight that guards e5. Indirect pressure.', 6: 'Keep the bishop instead of trading it. It will be strong on b3.', 10: 'The rook protects e4 so your knight is free to move.' } },
    { id: 'scotch', name: 'Scotch Game', side: 'w', eco: 'C45', moves: 'e4 e5 Nf3 Nc6 d4 exd4 Nxd4 Bc5 Be3 Qf6 c3 Nge7',
      theory: 'A direct approach: open the center right away with d4. Your pieces get active fast and the position becomes open.',
      keys: ['d4 on move 3 challenges e5 immediately', 'Recapture with the knight in the center', 'Be3 and c3 keep the d4 knight solid'],
      notes: { 4: 'Strike the center right away.', 8: 'Defend the knight while developing.' } },
    { id: 'qgd', name: 'Queen’s Gambit', side: 'w', eco: 'D53', moves: 'd4 d5 c4 e6 Nc3 Nf6 Bg5 Be7 e3 O-O Nf3 h6 Bh4 b6',
      theory: 'You offer the c-pawn to pull Black’s d5 pawn away from the center. It isn’t a real sacrifice: you can usually win it back. Solid, strategic chess.',
      keys: ['c4 attacks d5 from the side', 'Bg5 pins the knight that defends d5', 'Develop calmly and press on the c-file'],
      notes: { 2: 'The gambit: you attack d5 with a wing pawn.', 6: 'The pin makes the f6 knight a weak defender.' } },
    { id: 'london', name: 'London System', side: 'w', eco: 'D02', moves: 'd4 d5 Bf4 Nf6 e3 e6 Nf3 c5 c3 Nc6 Nbd2 Bd6 Bg3 O-O Bd3',
      theory: 'A system you can play against almost anything. Same setup every game: d4, Bf4, e3, Nf3, c3, Nbd2, Bd3. Great for learning fast.',
      keys: ['Bishop out to f4 before playing e3', 'Pawn triangle c3-d4-e3 is rock solid', 'Bg3 keeps your good bishop when Black offers a trade'],
      notes: { 2: 'Get the bishop out before e3 locks it in.', 12: 'Keep your bishop: Bg3 avoids the trade.' } },
    { id: 'sicilian', name: 'Sicilian Najdorf', side: 'b', eco: 'B90', moves: 'e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 a6',
      theory: 'The fighting answer to e4. You trade a side pawn for White’s center pawn, getting an unbalanced game where you can play to win.',
      keys: ['c5 fights for d4 from the side', 'Trading c-pawn for d-pawn gives you an extra center pawn', '...a6 stops Bb5 and Nb5 and prepares ...e5 or ...b5'],
      notes: { 1: 'Fight for d4 without copying White.', 5: 'Trade your side pawn for their center pawn.', 9: 'The Najdorf move: keeps knights and bishops off b5.' } },
    { id: 'caro', name: 'Caro-Kann', side: 'b', eco: 'B19', moves: 'e4 c6 d4 d5 Nc3 dxe4 Nxe4 Bf5 Ng3 Bg6 h4 h6 Nf3 Nd7',
      theory: 'A rock-solid defense. c6 supports d5 so you can challenge White’s center without weakening yourself. Your light bishop gets out before you play ...e6.',
      keys: ['...c6 then ...d5 for a solid center', 'Develop the bishop to f5 before ...e6', 'Keep the bishop safe from h4-h5 with ...h6'],
      notes: { 1: 'Prepare ...d5 with support.', 7: 'Get this bishop out before ...e6 locks it.', 11: 'Make room so h5 doesn’t trap your bishop.' } },
    { id: 'french', name: 'French Advance', side: 'b', eco: 'C02', moves: 'e4 e6 d4 d5 e5 c5 c3 Nc6 Nf3 Qb6',
      theory: 'You let White build a big center, then attack its base. Every Black move here puts pressure on d4.',
      keys: ['Hit the base of the pawn chain (d4) with ...c5', 'Knight, queen, all aim at d4', 'Play on the queenside, where you have space'],
      notes: { 5: 'Attack the base of the pawn chain.', 9: 'Queen adds pressure on d4 and eyes b2.' } },
    { id: 'kid', name: 'King’s Indian', side: 'b', eco: 'E97', moves: 'd4 Nf6 c4 g6 Nc3 Bg7 e4 d6 Nf3 O-O Be2 e5 O-O Nc6 d5 Ne7',
      theory: 'You let White take the center, castle fast, then hit back with ...e5. Later you attack White’s king with ...f5. Sharp and fun.',
      keys: ['Fianchetto: bishop on g7 controls the long diagonal', 'Castle early, then strike with ...e5', 'When the center locks, attack on the kingside with ...f5'],
      notes: { 3: 'Prepare to put the bishop on the long diagonal.', 11: 'Hit back at the center now that your king is safe.', 15: 'The knight heads to the kingside to support ...f5.' } }
  ];
  (App.X().chessOpenings || []).forEach(function (o) { OPS.push(o); });
  var OPBYID = {}; OPS.forEach(function (o) { OPBYID[o.id] = o; });

  // ---------------- bots ----------------
  var BOTS = [
    { lv: 1, name: 'Rookie', elo: '~400', depth: 1, noise: 260, ms: 200 },
    { lv: 2, name: 'Casual', elo: '~700', depth: 1, noise: 90, ms: 200 },
    { lv: 3, name: 'Club', elo: '~1000', depth: 2, noise: 40, ms: 600 },
    { lv: 4, name: 'Strong club', elo: '~1250', depth: 2, noise: 0, ms: 800 },
    { lv: 5, name: 'Expert', elo: '~1500', depth: 3, noise: 18, ms: 1500 },
    { lv: 6, name: 'Shark', elo: '~1700', depth: 4, noise: 0, ms: 2500 },
    { lv: 7, name: 'Candidate', elo: '~1900', depth: 5, noise: 0, ms: 3500 },
    { lv: 8, name: 'Master', elo: '~2050', depth: 6, noise: 0, ms: 5000 }
  ];
  var MAXLV = BOTS.length;
  // wins needed at each level before the next unlocks: 1 for the first three, then 2
  function winsNeeded(lv) { return lv <= 3 ? 1 : 2; }

  // ---------------- curriculum ----------------
  var UNITS = [
    { t: 'Foundations', lessons: [
      { id: 'L1', t: 'How to think every move', idea: 'Strong players run the same quick checklist every move. That’s the whole secret to not losing pieces.',
        tips: ['What did their last move threaten?', 'For me: any checks, captures or threats?', 'After my move, what can they capture?'],
        drills: [['p', 'free1'], ['p', 'promo'], ['p', 'br1']] } ] },
    { t: 'Checkmate patterns', lessons: [
      { id: 'L2', t: 'The back rank', idea: 'A king behind its own unmoved pawns has no air. A rook or queen on the back row can end the game.',
        tips: ['Look for kings with no escape square', 'Count defenders of the back row', 'Give your own king “luft”: push h3 or g3 later in the game'],
        drills: [['p', 'br1'], ['p', 'br2'], ['p', 'br3'], ['p', 'br4']] },
      { id: 'L3', t: 'Queen and rook mates', idea: 'To mate with a big piece, push the king to the edge and use your own king or a second rook to cut off squares.',
        tips: ['The edge of the board is the king’s enemy', 'One piece cuts off, the other checks', 'Quiet moves can be stronger than checks'],
        drills: [['p', 'qk'], ['p', 'ladder'], ['p', 'roller']] },
      { id: 'L4', t: 'Knight mates', idea: 'Knights jump, so you can’t block them. A king surrounded by its own pieces is a target.',
        tips: ['Cornered king + knight check = smothered mate', 'Knight protects the rook: Arabian mate', 'Sacrifice to force their piece onto the king’s last square'],
        drills: [['p', 'smother'], ['p', 'arab'], ['p', 'philidor']] },
      { id: 'L5', t: 'Opening traps', idea: 'f7 and f2 are the weakest squares early because only the king defends them.',
        tips: ['Don’t open the diagonal to your own king (f3/g4)', 'When you see Qh5 + Bc4, defend f7', 'Greedy captures early often get punished'],
        drills: [['p', 'scholar'], ['p', 'fool'], ['p', 'legal']] } ] },
    { t: 'Tactics', lessons: [
      { id: 'L6', t: 'Forks', idea: 'One piece attacks two things. They can only save one.',
        tips: ['Knights fork best: look at every square your knight can reach', 'Checks make forks unstoppable', 'Pawns fork too, and they’re cheap'],
        drills: [['p', 'nfork'], ['p', 'qfork'], ['p', 'pfork']] },
      { id: 'L7', t: 'Skewers and discovered attacks', idea: 'Line up their pieces, then attack the front one. Or move one piece to unleash another behind it.',
        tips: ['Pieces on the same line or diagonal are a target', 'Moving a piece can reveal an attack from behind', 'A discovered check lets the moving piece do anything'],
        drills: [['p', 'skewer'], ['p', 'petrov']] },
      { id: 'L8', t: 'Combinations', idea: 'Chain forcing moves (checks, captures, threats) so they never get a free move.',
        tips: ['Forcing moves first', 'A sacrifice is fine if the end position wins', 'Calculate to the end of the line, then count'],
        drills: [['p', 'blackburne'], ['p', 'englund'], ['r', 1000]] } ] },
    { t: 'Openings', lessons: [
      { id: 'L9', t: 'Opening principles with 1.e4', idea: 'Center pawns, knights out, bishops out, castle, connect rooks. Every good opening follows this.',
        tips: ['Move each piece once before moving one twice', 'Knights before bishops', 'Don’t bring the queen out early'],
        drills: [['o', 'italian'], ['o', 'ruy'], ['o', 'scotch']] },
      { id: 'L10', t: '1.d4 openings', idea: 'Queen-pawn openings are slower and more strategic. You build a strong setup and squeeze.',
        tips: ['Support d4 with c3/e3 or c4', 'Develop the dark bishop before e3', 'Pins on the f6 knight weaken d5'],
        drills: [['o', 'qgd'], ['o', 'london']] },
      { id: 'L11', t: 'Defenses as Black', idea: 'As Black, pick defenses that fight for the center in their own way instead of copying White.',
        tips: ['Sicilian and King’s Indian: play for a win', 'Caro-Kann and French: solid and strategic', 'Know the plan, not just the moves'],
        drills: [['o', 'sicilian'], ['o', 'caro'], ['o', 'french'], ['o', 'kid']] } ] },
    { t: 'Real games', lessons: [
      { id: 'L12', t: 'Beat your first bots', idea: 'Now use the checklist in a full game. The coach grades each move and shows what you missed.',
        tips: ['Develop and castle before attacking', 'Take free pieces', 'Check what they threaten every move'],
        drills: [['g', 1], ['g', 2]] },
      { id: 'L13', t: 'Club level', idea: 'Club players don’t hang pieces. You win by spotting tactics they allow.',
        tips: ['Look for loose (undefended) pieces', 'Trade when you’re ahead', 'Rooks belong on open files'],
        drills: [['g', 3], ['r', 1150]] },
      { id: 'L14', t: 'Strong club', idea: 'The bot now plays clean tactics. Slow down on critical moves.',
        tips: ['Before a capture, check their recapture', 'Improve your worst piece', 'Push passed pawns in the endgame'],
        drills: [['g', 4], ['r', 1300]] } ] },
    { t: 'The climb', lessons: [
      { id: 'L15', t: 'Expert', idea: 'Above-average play comes from calculation: look two or three moves deep on every forcing line.',
        tips: ['List every check and capture, for both sides', 'Prophylaxis: stop their best idea', 'Convert an advantage by trading down'],
        drills: [['g', 5], ['r', 1450]] },
      { id: 'L16', t: 'Shark', idea: 'The strongest bot here. Beat it and you are well above the average online player.',
        tips: ['Play your prepared openings', 'Avoid weaknesses around your king', 'Patience: small edges add up'],
        drills: [['g', 6], ['r', 1600]] } ] }
  ];
  (App.X().chessLessons || []).forEach(function (l) {
    var u = UNITS.filter(function (x) { return x.t === l.unit; })[0];
    if (!u) { u = { t: l.unit, lessons: [] }; UNITS.push(u); }
    u.lessons.push(l);
  });
  var LESSONS = []; UNITS.forEach(function (u) { u.lessons.forEach(function (l) { l.unit = u.t; LESSONS.push(l); }); });

  function drillDone(d) {
    var c = st();
    if (d[0] === 'p') return !!c.solved[d[1]];
    if (d[0] === 'o') return (c.open[d[1]] || 0) >= 1;
    if (d[0] === 'g') return c.botLevel > d[1];
    if (d[0] === 'r') return (c.peak || c.rating) >= d[1];
    if (d[0] === 'e') return !!(c.endg || {})[d[1]];
  }
  function lessonDone(l) { return l.drills.every(drillDone); }
  function lessonOpen(i) { return i === 0 || lessonDone(LESSONS[i - 1]) || st().lessons[LESSONS[i].id]; }

  // ---------------- chess helpers & plain-English coach ----------------
  function flipTurn(fen, color) { var p = fen.split(' '); p[1] = color; p[3] = '-'; return p.join(' '); }
  function attackedBy(fen, sq) {
    var g = new Chess(fen), pc = g.get(sq); if (!pc) return [];
    var g2 = new Chess(); if (!g2.load(flipTurn(fen, pc.color))) return [];
    return g2.moves({ square: sq, verbose: true }).filter(function (m) { return m.captured; }).map(function (m) { return { sq: m.to, t: m.captured }; });
  }
  function isDefended(fen, sq) {
    var g = new Chess(fen), pc = g.get(sq); if (!pc) return false;
    g.remove(sq); g.put({ type: 'n', color: pc.color === 'w' ? 'b' : 'w' }, sq);
    var g2 = new Chess(); if (!g2.load(flipTurn(g.fen(), pc.color))) return false;
    return g2.moves({ verbose: true }).some(function (m) { return m.to === sq; });
  }
  function listNames(arr, opp) {
    var names = arr.map(function (a) { return a.t === 'k' ? opp + ' king' : opp + ' ' + N[a.t]; });
    return names.length > 1 ? names.slice(0, -1).join(', ') + ' and ' + names[names.length - 1] : names[0];
  }
  // what a move does, in plain words. own/opp = "your"/"their" from the mover's point of view
  function idea(fenBefore, san, own, opp) {
    own = own || 'your'; opp = opp || 'their';
    var g = new Chess(fenBefore); var r = g.move(san); if (!r) return '';
    if (g.in_checkmate()) return 'it is checkmate';
    if (r.flags.indexOf('k') >= 0 || r.flags.indexOf('q') >= 0) return 'it castles: ' + own + ' king gets safe and ' + own + ' rook joins the game';
    var fenA = g.fen(), bits = [];
    if (r.captured) {
      var recap = g.moves({ verbose: true }).some(function (m) { return m.to === r.to; });
      if (!recap) bits.push('it wins ' + opp + ' ' + N[r.captured] + ' for free');
      else if (PV[r.captured] > PV[r.piece]) bits.push('it wins ' + opp + ' ' + N[r.captured] + ' for ' + own + ' ' + N[r.piece]);
      else if (PV[r.captured] === PV[r.piece]) bits.push('it trades ' + N[r.piece] + 's');
      else bits.push('it takes ' + opp + ' ' + N[r.captured]);
    }
    if (r.promotion) bits.push('it turns ' + own + ' pawn into a queen');
    var at = attackedBy(fenA, r.to).filter(function (a) { return a.t === 'k' || PV[a.t] > PV[r.piece] || !isDefended(fenA, a.sq); });
    if (at.length >= 2) bits.push('it attacks ' + listNames(at, opp) + ' at the same time (a fork)');
    else if (g.in_check()) bits.push('it checks ' + opp + ' king, so they must deal with that first');
    else if (at.length === 1 && at[0].t !== 'p') bits.push('it attacks ' + opp + ' ' + N[at[0].t]);
    if (!bits.length) {
      var num = +fenBefore.split(' ')[5];
      var home = r.color === 'w' ? '1' : '8';
      if ((r.piece === 'n' || r.piece === 'b') && r.from[1] === home && num <= 14) bits.push('it develops ' + own + ' ' + N[r.piece] + ' toward the center');
      else if (r.piece === 'p' && 'cdef'.indexOf(r.to[0]) >= 0 && num <= 10) bits.push('it grabs space in the center');
      else if (r.piece === 'r' && openFile(fenA, r.to[0])) bits.push('it puts ' + own + ' rook on an open file');
      else if (r.piece === 'p' && num > 25) bits.push('it pushes a pawn toward promotion');
      else bits.push('it improves ' + own + ' ' + N[r.piece]);
    }
    return bits.join(', and ');
  }
  function openFile(fen, file) {
    var g = new Chess(fen), f = 'abcdefgh'.indexOf(file), b = g.board();
    for (var i = 0; i < 8; i++) { var p = b[i][f]; if (p && p.type === 'p') return false; }
    return true;
  }
  // best capture the side-to-move has against the other side
  function threat(fen) {
    var g = new Chess(fen), best = null;
    g.moves({ verbose: true }).forEach(function (m) {
      if (!m.captured) return;
      g.move(m.san);
      var recap = g.moves({ verbose: true }).some(function (x) { return x.to === m.to; });
      var mate = g.in_checkmate();
      g.undo();
      var gain = recap ? PV[m.captured] - PV[m.piece] : PV[m.captured];
      if (mate) gain = 9999;
      if (gain >= 100 && (!best || gain > best.gain)) best = { san: m.san, sq: m.to, t: m.captured, gain: gain };
    });
    return best;
  }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  // ---------- outside the box: quiet moves and sacrifices ----------
  function creativeKind(fen, san) {
    try {
      var g = new Chess(fen), m = g.move(san); if (!m) return null;
      if (g.in_checkmate()) return null;
      var attacked = g.moves({ verbose: true }).some(function (x) { return x.to === m.to; });
      if (m.captured && PV[m.captured] < PV[m.piece] && attacked) return 'sacrifice';
      if (!m.captured && attacked && m.piece !== 'p' && m.piece !== 'k') return 'sacrifice';
      if (!m.captured && !m.promotion) return 'quiet';
    } catch (e) {}
    return null;
  }
  var CK_TEXT = { quiet: 'a move that captures nothing, yet sets up something they cannot stop', sacrifice: 'a sacrifice: you give up material on purpose for a bigger payoff' };
  // what to pay attention to right now, for the side to move
  function watchCues(fen) {
    var g = new Chess(fen), me = g.turn(), them = me === 'w' ? 'b' : 'w', cues = [];
    var g2 = new Chess(); if (g2.load(flipTurn(fen, them))) { var tt = threat(g2.fen()); if (tt && tt.gain >= 9999) cues.push('<b>Danger:</b> they threaten <b>checkmate</b> with ' + esc(tt.san) + '. Stop it first.'); else if (tt && tt.gain >= 100) cues.push('<b>Danger:</b> they threaten <b>' + esc(tt.san) + '</b>, winning your ' + N[tt.t] + '. Move it, defend it, or counter with something bigger.');
      var mateThreat = g2.moves().filter(function (m) { return m.indexOf('#') >= 0; })[0]; if (mateThreat && !(tt && tt.gain >= 9999)) cues.unshift('<b>Danger:</b> they threaten <b>checkmate</b> with ' + esc(mateThreat) + '. Stop it first.'); }
    var checks = g.moves().filter(function (m) { return m.indexOf('+') >= 0 || m.indexOf('#') >= 0; });
    if (checks.some(function (m) { return m.indexOf('#') >= 0; })) cues.push('<b>Look:</b> there is a checkmate on the board.');
    else if (checks.length) cues.push('<b>Checks:</b> you have ' + checks.length + ' (' + esc(checks.slice(0, 3).join(', ')) + '). Look at each, even the ugly ones.');
    var mine = threat(fen); if (mine && mine.gain >= 100) cues.push('<b>Opportunity:</b> something of theirs is loose: <b>' + esc(mine.san) + '</b> wins their ' + N[mine.t] + '. Check it isn’t a trap.');
    if (!cues.length) cues.push('<b>Quiet position.</b> Find your worst-placed piece and improve it, or ask what their last move wants to do next.');
    return cues;
  }
  function analyse(fenBefore, san) {
    return App.engine({ game: 'chess', op: 'root', fen: fenBefore, depth: 3, ms: 900 }).then(function (rs) { return analyseWith(fenBefore, san, rs); });
  }
  function analyseWith(fenBefore, san, rs) {
    var best = rs[0], mine = rs.filter(function (x) { return x.move.san === san; })[0] || rs[rs.length - 1];
    var loss = Math.max(0, Math.min(1500, best.score - mine.score));
    var bestMate = best.score > MATE / 2, mineMate = mine.score > MATE / 2;
    var grade = mine === best || loss <= 15 ? 'best' : loss <= 50 ? 'good' : loss <= 120 ? 'inacc' : loss <= 300 ? 'mistake' : 'blunder';
    if (bestMate && !mineMate && grade !== 'blunder') grade = 'mistake';
    if (bestMate && mineMate) grade = 'best';
    var text, kind = null;
    if (grade === 'best' || grade === 'good') {
      text = '<b>' + esc(san) + '</b>: ' + idea(fenBefore, san) + '.';
      if (grade === 'good') text += ' Slightly stronger was <b>' + esc(best.move.san) + '</b>: ' + idea(fenBefore, best.move.san) + '.';
    } else {
      var gA = new Chess(fenBefore); gA.move(san);
      var parts = [];
      if (mine.score < -MATE / 2) {
        var rep = ENG.best(gA, 1); parts.push('This lets them checkmate you' + (rep ? ', starting with <b>' + esc(rep.move.san) + '</b>' : '') + '.'); kind = 'hang';
      } else {
        var t = threat(gA.fen());
        if (t && t.gain >= 150) { parts.push('This leaves your ' + N[t.t] + ' on ' + t.sq + ' unprotected: they can take it with <b>' + esc(t.san) + '</b>.'); kind = 'hang'; }
      }
      if (bestMate) { parts.push('You had checkmate starting with <b>' + esc(best.move.san) + '</b>.'); kind = kind || 'mate'; }
      else {
        parts.push('Better was <b>' + esc(best.move.san) + '</b>: ' + idea(fenBefore, best.move.san) + '.');
        if (!kind && best.move.captured) kind = 'take';
      }
      kind = kind || 'other';
      var habit = { hang: 'Habit: before you move, ask “after this, what can they capture?”', mate: 'Habit: look at every check first. Checks are the most forcing moves.', take: 'Habit: scan for loose pieces. Anything undefended is a target.', other: 'Habit: compare two candidate moves before choosing.' }[kind];
      var ck = creativeKind(fenBefore, best.move.san);
      text = parts.join(' ') + '<br><span class="mute small">' + habit + '</span>' + (ck ? '<br><span class="small"><b>Outside the box:</b> the best move was ' + CK_TEXT[ck] + '. When the obvious moves don’t work, look for these.</span>' : '');
    }
    return { grade: grade, loss: loss, text: text, best: best.move, kind: kind, san: san };
  }

  // ---------------- board ----------------
  function boardHTML(g, ui) {
    var b = g.board(), html = '', chk = null;
    if (g.in_check()) {
      for (var i = 0; i < 8; i++) for (var j = 0; j < 8; j++) { var p0 = b[i][j]; if (p0 && p0.type === 'k' && p0.color === g.turn()) chk = 'abcdefgh'[j] + (8 - i); }
    }
    for (var r = 0; r < 8; r++) for (var f = 0; f < 8; f++) {
      var row = ui.flip ? 7 - r : r, col = ui.flip ? 7 - f : f;
      var sq = 'abcdefgh'[col] + (8 - row), p = b[row][col];
      var cls = 'sq ' + ((row + col) % 2 === 0 ? 'l' : 'd');
      if (ui.last && (ui.last.from === sq || ui.last.to === sq)) cls += ' last';
      if (ui.sel === sq) cls += ' sel';
      if (ui.hint && (ui.hint.from === sq || ui.hint.to === sq)) cls += ' hint';
      if (chk === sq) cls += ' chk';
      if (ui.marks && ui.marks[sq]) cls += ' ' + ui.marks[sq];
      var inner = '';
      if (p) inner += '<span class="pc ' + p.color + '">' + pieceSVG(p.type, p.color);
      if (ui.targets && ui.targets.indexOf(sq) >= 0) inner += p ? '<span class="ring"></span>' : '<span class="dot"></span>';
      if (r === 7 && ui.coords !== false) inner += '<span class="co f">' + sq[0] + '</span>';
      if (f === 0 && ui.coords !== false) inner += '<span class="co r">' + sq[1] + '</span>';
      html += '<button class="' + cls + '" data-sq="' + sq + '" aria-label="' + sq + (p ? ' ' + (p.color === 'w' ? 'white ' : 'black ') + N[p.type] : '') + '">' + inner + '</button>';
    }
    return '<div class="cboard">' + html + '</div>';
  }
  function mount(el, g, opts) {
    var ui = { flip: !!opts.flip, sel: null, targets: [], last: null, hint: null, marks: {}, coords: opts.coords != null ? opts.coords : (st().sqLvl || 1) < 3 };
    function render() { el.innerHTML = boardHTML(g, ui); }
    el.onclick = function (e) {
      var b = e.target.closest('[data-sq]'); if (!b || !opts.canMove()) return;
      var sq = b.dataset.sq, p = g.get(sq);
      if (ui.sel && ui.targets.indexOf(sq) >= 0) {
        var mv = { from: ui.sel, to: sq };
        var pm = g.moves({ square: ui.sel, verbose: true }).filter(function (m) { return m.to === sq; })[0];
        if (pm && pm.promotion) mv.promotion = 'q';
        ui.sel = null; ui.targets = []; ui.hint = null;
        opts.onMove(mv); return;
      }
      if (p && p.color === g.turn()) { ui.sel = sq; ui.targets = g.moves({ square: sq, verbose: true }).map(function (m) { return m.to; }); }
      else { ui.sel = null; ui.targets = []; }
      render();
    };
    render();
    return { ui: ui, render: render };
  }
  function later(fn, ms) { setTimeout(fn, ms || 30); }

  // ---------------- estimated Elo ----------------
  var BOT_ELO = [0, 350, 550, 850, 1100, 1350, 1600, 1800];
  function estElo() {
    var c = st(), acc = c.acc && c.acc.length ? c.acc.slice(-5).reduce(function (a, b) { return a + b; }, 0) / Math.min(5, c.acc.length) : null;
    var base = 0.5 * c.rating + 0.5 * BOT_ELO[c.botLevel];
    if (acc != null) base += (acc - 65) * 5;
    var games = c.games.w + c.games.l + c.games.d;
    return { elo: Math.round(Math.max(300, Math.min(2200, base)) / 10) * 10, conf: games < 3 ? 'rough' : games < 10 ? 'fair' : 'good' };
  }
  // ---------------- screens ----------------
  function home() {
    App.root('Chess', function (v) {
      var c = st();
      var nextL = null; for (var i = 0; i < LESSONS.length; i++) if (!lessonDone(LESSONS[i])) { nextL = i; break; }
      var rep = report()[0];
      var ee = estElo();
      v.innerHTML = '<div><span class="eyebrow">Chess</span><h1>Est. Elo ' + ee.elo + '</h1><p class="mute small">Puzzle rating ' + c.rating + ' (peak ' + (c.peak || c.rating) + ') · Bot level ' + c.botLevel + ' · ' + c.games.w + 'W ' + c.games.l + 'L ' + c.games.d + 'D · estimate is ' + ee.conf + (ee.conf === 'rough' ? ', play more games to sharpen it' : '') + '</p></div>' +
        '<div class="coach ok"><div class="h"><span class="pill ok">Coach</span></div><p>' + rep.text + '</p><button class="btn sm" id="repgo">' + esc(rep.action) + ' ›</button></div>' +
        '<div class="btns"><button class="btn primary" id="pz">Puzzles</button><button class="btn" id="pl">Play bot</button><button class="btn" id="op">Openings</button><button class="btn" id="bv">Board vision</button><button class="btn" id="eg">Endgames</button><button class="btn" id="ob">Outside the box</button></div>' +
        '<h2>Curriculum</h2><div class="list" id="ls"></div>';
      var html = '', lastUnit = '';
      LESSONS.forEach(function (l, i) {
        if (l.unit !== lastUnit) { html += '<span class="eyebrow" style="margin-top:6px">' + esc(l.unit) + '</span>'; lastUnit = l.unit; }
        var open = lessonOpen(i), done = lessonDone(l);
        var n = l.drills.filter(drillDone).length;
        html += '<button class="item' + (open ? '' : ' locked') + (done ? ' done' : '') + '" data-l="' + i + '"><span class="grow"><span class="t">' + esc(l.t) + '</span><br><span class="s">' + (i === nextL ? 'Up next · ' : '') + l.drills.length + ' drills</span></span><span class="end">' + (done ? '✓ done' : open ? n + '/' + l.drills.length : 'locked') + '</span></button>';
      });
      $('#ls', v).innerHTML = html;
      $$('[data-l]', v).forEach(function (b) { b.onclick = function () { var i = +b.dataset.l; if (lessonOpen(i)) lesson(i); }; });
      $('#pz', v).onclick = function () { puzzles({}); };
      $('#repgo', v).onclick = rep.go;
      $('#pl', v).onclick = playMenu;
      $('#op', v).onclick = openings;
      $('#bv', v).onclick = vision;
      $('#eg', v).onclick = endgameMenu;
      $('#ob', v).onclick = function () { puzzles({ creative: true }); };
    });
  }

  // ----- endgame trainer -----
  var ENDG = {
    kq: { t: 'Queen vs king', fen: '8/8/8/3k4/8/8/8/4K2Q w - - 0 1', goal: 'mate', moves: 25, goalText: 'Checkmate within 25 moves', tip: 'Use the queen a knight’s move away from the king to shrink its box, bring your king up, then mate on the edge. Never stalemate: always leave the king one legal move until it’s mate.' },
    kr: { t: 'Rook vs king', fen: '8/8/8/3k4/8/8/8/R3K3 w - - 0 1', goal: 'mate', moves: 30, goalText: 'Checkmate within 30 moves', tip: 'Cut the king off with the rook, walk your king up to take the opposition, and check only when the kings face each other. Box method: each check pushes the king one rank toward the edge.' },
    kp: { t: 'King and pawn: win', fen: '3k4/8/3K4/3P4/8/8/8/8 w - - 0 1', goal: 'promote', moves: 12, goalText: 'Promote the pawn', tip: 'Your king is on the 6th rank in front of the pawn: that always wins. Step the king to the side the enemy king doesn’t go, then push.' },
    opposition: { t: 'Opposition', fen: '8/4k3/8/4K3/8/4P3/8/8 w - - 0 1', goal: 'promote', moves: 20, goalText: 'Promote the pawn', tip: 'A king two squares in front of its pawn wins. Use spare pawn moves to hand the opposition to the other side, then outflank.' },
    kp_draw: { t: 'King and pawn: hold the draw', fen: '8/8/4k3/8/4K3/4P3/8/8 w - - 0 1', side: 'b', goal: 'draw', moves: 40, goalText: 'Hold the draw for 40 moves', tip: 'Stay in front of the pawn and take the opposition when the pawn advances. When the pawn reaches the 7th with check, step in front: stalemate.' },
    lucena: { t: 'Lucena: build the bridge', fen: '5K2/5P1k/r7/8/8/8/8/3R4 w - - 0 1', goal: 'promote', moves: 25, goalText: 'Promote the pawn', tip: 'Rook to the 4th rank first (the bridge). Then step the king out; when the checks come, walk toward the rook and block with it.' },
    philidor: { t: 'Philidor: hold the draw', fen: '4k3/R7/1r6/3KP3/8/8/8/8 b - - 0 1', side: 'b', goal: 'draw', moves: 30, goalText: 'Hold the draw for 30 moves', tip: 'Keep your rook on the 6th rank so their king can’t advance. The moment the pawn steps to the 6th, drop your rook to the 1st and check from behind forever.' },
    krp: { t: 'Rook and pawn: convert', fen: '3k4/8/3K4/3P4/8/8/r7/1R6 w - - 0 1', goal: 'promote', moves: 30, goalText: 'Promote or checkmate', tip: 'Use the rook to drive the king off the pawn’s file with check, then shield your king from side checks as the pawn walks home.' },
    two_bishops: { t: 'Two bishops mate', fen: '8/8/8/3k4/8/8/8/2B1KB2 w - - 0 1', goal: 'mate', moves: 50, goalText: 'Checkmate within 50 moves', tip: 'The bishops side by side build a diagonal wall. Push the king to a corner with the wall, bring your king to the knight’s-move square, and finish with alternating bishop checks.' },
    pawn_race: { t: 'Pawn race', fen: '7k/8/8/P6p/8/8/8/K7 w - - 0 1', goal: 'win', moves: 40, goalText: 'Win the race (count first!)', tip: 'Count moves to promotion for both sides before touching a piece. You queen first, and from a8 the queen controls the long diagonal to h1.' }
  };
  function endgameMenu() {
    App.screen('Endgames', function (v) {
      var c = st(); c.endg = c.endg || {};
      v.innerHTML = '<p class="mute">Technique you can’t fake. Each one is a real position against the engine; the coach grades your moves as usual.</p><div class="list">' + Object.keys(ENDG).map(function (k) { var e = ENDG[k]; return '<button class="item' + (c.endg[k] ? ' done' : '') + '" data-e="' + k + '"><span class="grow"><span class="t">' + esc(e.t) + '</span><br><span class="s">' + esc(e.goalText) + (e.side === 'b' ? ' · you play Black' : '') + '</span></span><span class="end">' + (c.endg[k] ? '✓' : '›') + '</span></button>'; }).join('') + '</div>';
      $$('[data-e]', v).forEach(function (b) { b.onclick = function () { endgame(b.dataset.e); }; });
    });
  }
  function endgame(id) {
    var e = ENDG[id], my = e.side || 'w';
    App.screen(e.t, function (v) {
      var g = new Chess(e.fen), busy = false, over = false, start = g.history().length, log = [];
      v.innerHTML = '<div class="row"><span class="pill acc">' + esc(e.goalText) + '</span><span class="pill" id="mc">Move 1 / ' + e.moves + '</span></div><div id="bd"></div><div id="co"></div><div id="op" class="small mute"></div><div class="btns" id="bt"><button class="btn" id="hn">Hint</button><button class="btn" id="tb">Take back</button><button class="btn ghost" id="rs">Give up</button></div>';
      var co = $('#co', v), opEl = $('#op', v);
      var B = mount($('#bd', v), g, { flip: my === 'b', canMove: function () { return !busy && !over && g.turn() === my; }, onMove: onMove });
      co.innerHTML = App.coachHTML('info', esc(e.tip));
      function myMoves() { var h = g.history().length; return Math.ceil((my === 'w' ? h + 1 : h) / 2); }
      function check() {
        var h = g.history({ verbose: true }), lastMine = h.length ? h[h.length - 1] : null;
        if (g.in_checkmate()) return finish(g.turn() !== my);
        if (e.goal === 'promote' && lastMine && lastMine.color === my && lastMine.promotion) return finish(true);
        if (e.goal === 'win' && lastMine && lastMine.color === my && lastMine.promotion) { // won the race if they can't promote next
          var theyPromote = g.moves({ verbose: true }).some(function (m) { return m.promotion; }); if (!theyPromote) return finish(true);
        }
        if (g.in_draw() || g.in_stalemate()) return finish(e.goal === 'draw');
        if (e.goal !== 'draw') {
          // lost the pawn / material means failure for promote/win goals
          var mine = 0; g.board().forEach(function (r) { r.forEach(function (p) { if (p && p.color === my && p.type !== 'k') mine++; }); });
          if (mine === 0) return finish(false);
        }
        if (myMoves() > e.moves) return finish(e.goal === 'draw');
        return false;
      }
      function onMove(mv) {
        var before = g.fen(), r = g.move(mv); if (!r) return;
        B.ui.last = { from: r.from, to: r.to }; B.ui.hint = null; B.render(); busy = true;
        $('#mc', v).textContent = 'Move ' + Math.min(e.moves, myMoves()) + ' / ' + e.moves;
        co.innerHTML = '<div class="thinking">Coach is checking</div>';
        analyse(before, r.san).then(function (a) {
          log.push(a); if (over) return;
          co.innerHTML = App.coachHTML(a.grade, a.text);
          if (check()) return;
          App.engine({ game: 'chess', op: 'best', fen: g.fen(), depth: 3, noise: 0, ms: 900 }).then(function (res) {
            if (over) return; var rr = g.move(res.move.san); B.ui.last = { from: rr.from, to: rr.to }; B.render(); busy = false;
            opEl.innerHTML = 'Engine played <b>' + esc(rr.san) + '</b>.';
            check();
          });
        });
      }
      function finish(ok) {
        over = true; busy = false;
        var c = st(); c.endg = c.endg || {}; if (ok) { c.endg[id] = 1; App.celebrate('chess'); } App.save();
        co.innerHTML = '<div class="panel"><h2>' + (ok ? 'Done. Technique learned.' : 'Not this time.') + '</h2><p>' + (ok ? 'Run it again in a week; endgame technique fades unless you repeat it.' : esc(e.tip)) + '</p></div>' + (ok ? WZ.card('win', true) : '');
        $('#bt', v).innerHTML = '<button class="btn primary" id="ag">' + (ok ? 'Again' : 'Retry') + '</button><button class="btn" id="dn">Done</button>';
        $('#ag').onclick = function () { App.checkpoint(function () { App.back(); endgame(id); }); };
        $('#dn').onclick = function () { App.checkpoint(App.back); };
        return true;
      }
      $('#hn', v).onclick = function () {
        if (busy || over || g.turn() !== my) return; busy = true;
        App.engine({ game: 'chess', op: 'best', fen: g.fen(), depth: 4, ms: 1200 }).then(function (r) { if (over) return; B.ui.hint = { from: r.move.from, to: r.move.to }; B.render(); busy = false; co.innerHTML = App.coachHTML('info', 'Try <b>' + esc(r.move.san) + '</b>: ' + idea(g.fen(), r.move.san) + '.'); });
      };
      $('#tb', v).onclick = function () { if (busy || over || g.history().length < 2) return; g.undo(); g.undo(); log.pop(); B.ui.last = null; B.render(); co.innerHTML = App.coachHTML('info', 'Taken back.'); };
      $('#rs', v).onclick = function () { if (!over) finish(false); };
      if (my === 'b') { busy = true; App.engine({ game: 'chess', op: 'best', fen: g.fen(), depth: 3, ms: 600 }).then(function (res) { var rr = g.move(res.move.san); B.ui.last = { from: rr.from, to: rr.to }; B.render(); busy = false; }); }
    });
  }

  // ----- board vision: memorize the squares -----
  var VLV = [
    null,
    ['Find the square', 'White’s view, labels on the edges.'],
    ['Find the square', 'White’s view, no labels. Use the edges in your head.'],
    ['Find the square', 'Black’s view, no labels. The board is flipped.'],
    ['Name the square', 'A square lights up. Pick its name.'],
    ['Speed round', 'Name the square in 4 seconds, either view.']
  ];
  function vision() {
    App.screen('Board vision', function (v) {
      var c = st(); c.sqLvl = c.sqLvl || 1;
      var lv = c.sqLvl, total = 15, n = 0, right = 0, t0 = 0, times = [], target, flip, tmr = null, locked = false;
      var g = new Chess('8/8/8/8/8/8/8/8 w - - 0 1');
      v.innerHTML = '<div class="row"><span class="pill acc">Level ' + lv + ' / 5</span><span class="pill" id="sc">0/' + total + '</span><span class="grow"></span><span class="mono small" id="tt"></span></div>' +
        '<p class="mute small">' + VLV[lv][1] + ' Get 14 of 15 right, fast, to move up. Board labels disappear from your games once you reach level 3.</p>' +
        '<h1 id="pr" style="text-align:center;font-family:var(--mono)"></h1><div id="bd"></div><div id="ops" class="btns"></div><div id="fb"></div>';
      var B;
      function sqs() { var a = []; for (var f = 0; f < 8; f++) for (var r = 1; r <= 8; r++) a.push('abcdefgh'[f] + r); return a; }
      var ALLSQ = sqs();
      function ask() {
        clearInterval(tmr); locked = false;
        if (n >= total) return done();
        target = ALLSQ[Math.floor(Math.random() * 64)];
        flip = lv === 3 ? true : lv === 5 ? Math.random() < .5 : false;
        B = mount($('#bd', v), g, { flip: flip, coords: lv === 1, canMove: function () { return lv <= 3 && !locked; }, onMove: function () {} });
        $('#ops', v).innerHTML = '';
        if (lv <= 3) {
          $('#pr', v).textContent = target;
          $('#bd', v).onclick = function (e) { var b = e.target.closest('[data-sq]'); if (!b || locked) return; judge(b.dataset.sq === target, b.dataset.sq); };
        } else {
          $('#pr', v).textContent = '?';
          B.ui.marks[target] = 'sel'; B.render();
          $('#bd', v).onclick = null;
          var opts = [target];
          while (opts.length < 4) { var f = 'abcdefgh'.indexOf(target[0]) + Math.floor(Math.random() * 5) - 2, r = +target[1] + Math.floor(Math.random() * 5) - 2; if (f < 0 || f > 7 || r < 1 || r > 8) continue; var s2 = 'abcdefgh'[f] + r; if (opts.indexOf(s2) < 0) opts.push(s2); }
          opts.sort(function () { return Math.random() - .5; });
          $('#ops', v).innerHTML = opts.map(function (o) { return '<button class="btn mono" data-o="' + o + '">' + o + '</button>'; }).join('');
          $$('[data-o]', v).forEach(function (b) { b.onclick = function () { if (!locked) judge(b.dataset.o === target, b.dataset.o); }; });
          if (lv === 5) { var left = 4; $('#tt', v).textContent = left + 's'; tmr = setInterval(function () { left--; $('#tt', v).textContent = left + 's'; if (left <= 0) { clearInterval(tmr); judge(false, null); } }, 1000); }
        }
        t0 = Date.now();
      }
      function judge(ok, picked) {
        locked = true; clearInterval(tmr); n++;
        times.push((Date.now() - t0) / 1000);
        if (ok) right++;
        B.ui.marks = {}; B.ui.marks[target] = 'right'; if (!ok && picked && picked !== target) B.ui.marks[picked] = 'wrong'; B.ui.coords = true; B.render();
        $('#sc', v).textContent = right + '/' + n;
        var f = target[0], r = target[1];
        var color = (('abcdefgh'.indexOf(f) + +r) % 2 === 0) ? 'light' : 'dark';
        $('#fb', v).innerHTML = ok ? '' : App.coachHTML('wrong', '<b>' + target + '</b> is the ' + ('abcdefgh'.indexOf(f) + 1) + (['st', 'nd', 'rd'][('abcdefgh'.indexOf(f))] || 'th') + ' file from White’s left, rank ' + r + ' counting up from White’s side. It’s a ' + color + ' square. Trick: the long diagonal a1–h8 is all dark; d1 (queen’s start) is light for White.');
        setTimeout(function () { $('#fb', v).innerHTML = ''; ask(); }, ok ? 350 : 1600);
      }
      function done() {
        var avg = times.reduce(function (a, b) { return a + b; }, 0) / times.length;
        var pass = right >= 14 && avg < (lv >= 4 ? 3.5 : 3);
        var c2 = st(); if (pass && c2.sqLvl < 5) c2.sqLvl++; App.save();
        $('#bd', v).innerHTML = ''; $('#ops', v).innerHTML = ''; $('#pr', v).textContent = '';
        $('#fb', v).innerHTML = '<div class="panel"><h2>' + right + ' / ' + total + '</h2><p>Average ' + avg.toFixed(1) + 's per square. ' + (pass ? (lv < 5 ? 'Level up! Next: ' + VLV[lv + 1][0].toLowerCase() + '. ' + VLV[lv + 1][1] : 'Top level. Your board vision is sharp.') : 'To pass: 14/15 and under ' + (lv >= 4 ? 3.5 : 3) + 's each.') + '</p><div class="btns"><button class="btn primary" id="ag">Go again</button><button class="btn" id="dn">Done</button></div></div>';
        $('#ag').onclick = function () { App.checkpoint(function () { App.back(); vision(); }); };
        $('#dn').onclick = function () { App.checkpoint(App.back); };
      }
      ask();
    });
  }

  function lesson(i) {
    var l = LESSONS[i];
    App.screen(l.t, function (v) {
      st().lessons[l.id] = 1; App.save();
      v.innerHTML = '<div><span class="eyebrow">' + esc(l.unit) + '</span><h1>' + esc(l.t) + '</h1></div>' +
        '<div class="prose"><p>' + esc(l.idea) + '</p><ul>' + l.tips.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ul></div>' +
        '<h3>Drills</h3><div class="list" id="dl"></div>' +
        (lessonDone(l) && i + 1 < LESSONS.length ? '<button class="btn primary" id="nx">Next lesson: ' + esc(LESSONS[i + 1].t) + '</button>' : '');
      $('#dl', v).innerHTML = l.drills.map(function (d, k) {
        var t, s;
        if (d[0] === 'p') { var p = BYID[d[1]]; t = p.th; s = 'Puzzle · ' + (p.sol.length > 1 ? 'multi-move' : 'one move'); }
        if (d[0] === 'o') { t = OPBYID[d[1]].name; s = 'Play the line once without a mistake'; }
        if (d[0] === 'g') { t = 'Beat the ' + BOTS[d[1] - 1].name + ' bot'; s = 'Level ' + d[1] + ' · ' + BOTS[d[1] - 1].elo; }
        if (d[0] === 'r') { t = 'Reach puzzle rating ' + d[1]; s = 'You are at ' + st().rating; }
        if (d[0] === 'e') { t = 'Endgame: ' + (ENDG[d[1]] ? ENDG[d[1]].t : d[1]); s = ENDG[d[1]] ? ENDG[d[1]].goalText : ''; }
        var done = drillDone(d);
        return '<button class="item' + (done ? ' done' : '') + '" data-k="' + k + '"><span class="grow"><span class="t">' + esc(t) + '</span><br><span class="s">' + s + '</span></span><span class="end">' + (done ? '✓' : '›') + '</span></button>';
      }).join('');
      $$('[data-k]', v).forEach(function (b) {
        b.onclick = function () {
          var d = l.drills[+b.dataset.k];
          if (d[0] === 'p') puzzles({ id: d[1] });
          if (d[0] === 'o') openingDrill(OPBYID[d[1]]);
          if (d[0] === 'g') play(d[1], 'w');
          if (d[0] === 'r') puzzles({});
          if (d[0] === 'e') endgame(d[1]);
        };
      });
      if ($('#nx', v)) $('#nx', v).onclick = function () { App.screen(LESSONS[i + 1].t, function () {}, { replace: true }); App.back(); lesson(i + 1); };
    });
  }

  // ----- puzzles -----
  function pickPuzzle(creative) {
    var c = st(), target = c.rating + 80, base = creative ? creativePool() : ALL;
    var pool = base.filter(function (p) { return !c.solved[p.id]; });
    if (!pool.length) { if (!creative) c.solved = {}; pool = base.slice(); }
    // recently missed puzzles come back after a few others
    var n = Object.keys(c.seen).length;
    pool.sort(function (a, b) {
      var pa = Math.abs(a.r - target) + (c.seen[a.id] && n - c.seen[a.id] < 5 ? 600 : 0);
      var pb = Math.abs(b.r - target) + (c.seen[b.id] && n - c.seen[b.id] < 5 ? 600 : 0);
      return pa - pb;
    });
    var top = pool.slice(0, 6), th = c.theme || {};
    function weak(p) { var t = th[p.th]; return t && t.n >= 3 ? 1 - t.ok / t.n : 0.3; }
    top.sort(function (a, b) { return weak(b) - weak(a); });
    return top[Math.floor(Math.random() * Math.min(3, top.length))];
  }
  function puzzles(opts) {
    var p = opts.id ? BYID[opts.id] : pickPuzzle(opts.creative);
    var g = new Chess(p.fen), step = 0, first = true, busy = false, hints = 0, done = false;
    var youW = g.turn() === 'w';
    App.screen(opts.id ? p.th : opts.creative ? 'Outside the box' : 'Puzzles', function (v) {
      var c = st();
      v.innerHTML = '<div class="row"><span class="pill acc">' + (youW ? 'White' : 'Black') + ' to move</span><span class="pill">~' + p.r + '</span><span class="grow"></span><span class="mono small mute">Your rating ' + c.rating + '</span></div>' +
        '<div id="bd"></div><div id="co"></div>' +
        '<div class="btns"><button class="btn" id="hn">Hint</button><button class="btn ghost" id="sol">Show solution</button></div>';
      var co = $('#co', v);
      var B = mount($('#bd', v), g, { flip: !youW, canMove: function () { return !busy && !done; }, onMove: onMove });
      co.innerHTML = App.coachHTML('info', (opts.creative ? 'The obvious moves don’t work here. Look for a quiet move or a sacrifice. ' : 'Find the best move. ') + (p.sol.length > 1 ? 'This one takes ' + Math.ceil(p.sol.length / 2) + ' moves.' : ''));
      function rate(score) {
        if (!first) return; first = false;
        c.rating = App.elo(c.rating, p.r, score, 36); c.peak = Math.max(c.peak || 0, c.rating);
        c.seen[p.id] = Object.keys(c.seen).length + 1;
        c.theme = c.theme || {}; var th = c.theme[p.th] || { ok: 0, n: 0 }; th.n++; th.ok += score; c.theme[p.th] = th; App.save();
      }
      function onMove(mv) {
        var before = g.fen(); var r = g.move(mv); if (!r) return;
        var ok = r.san === p.sol[step] || g.in_checkmate();
        B.ui.last = { from: r.from, to: r.to };
        if (ok) {
          B.ui.marks = {}; B.ui.marks[r.to] = 'right'; B.render(); step++;
          if (step >= p.sol.length || g.in_checkmate()) return solved();
          busy = true;
          setTimeout(function () {
            var rr = g.move(p.sol[step]); step++; busy = false;
            B.ui.last = { from: rr.from, to: rr.to }; B.ui.marks = {}; B.render();
            if (step >= p.sol.length) solved();
            else co.innerHTML = App.coachHTML('right', 'Good. They replied ' + esc(rr.san) + '. Keep going.');
          }, 550);
        } else {
          B.ui.marks = {}; B.ui.marks[r.to] = 'wrong'; B.render(); busy = true;
          rate(0);
          later(function () {
            var reply = g.game_over() ? null : ENG.best(g, 1);
            var why = esc(r.san) + ' doesn’t work here.';
            if (reply) why += ' They answer <b>' + esc(reply.move.san) + '</b>: ' + idea(g.fen(), reply.move.san, 'their', 'your') + '.';
            why += '<br><span class="mute small">Theme: ' + esc(p.th) + '. Try again.</span>';
            co.innerHTML = App.coachHTML('wrong', why);
            setTimeout(function () { g.undo(); B.ui.marks = {}; B.ui.last = null; B.render(); busy = false; }, 900);
          });
        }
      }
      function explain() {
        if (p.why) return p.why;
        var gg = new Chess(p.fen), out = [];
        p.sol.forEach(function (s, i) { if (i % 2 === 0) out.push('<b>' + esc(s) + '</b>: ' + idea(gg.fen(), s)); gg.move(s); });
        return cap(out.join('. Then ')) + '.';
      }
      function solved() {
        done = true;
        var c2 = st(); var old = c2.rating;
        if (first) rate(1);
        c2.solved[p.id] = 1; App.save();
        var delta = c2.rating - old;
        var ckp = p.ck || creativeKind(p.fen, p.sol[0]);
        co.innerHTML = App.coachHTML('right', explain() + (ckp ? '<br><span class="small"><b>Outside the box:</b> the key was ' + CK_TEXT[ckp] + '.</span>' : ''), '<span class="mono small">' + (delta >= 0 ? '+' : '') + delta + ' → ' + c2.rating + '</span>');
        var bt = $('.btns', v);
        bt.innerHTML = opts.id ? '<button class="btn primary" id="bk2">Back to lesson</button>' : '<button class="btn primary" id="nx">Next puzzle</button>';
        if (opts.id) $('#bk2').onclick = function () { App.checkpoint(App.back); };
        else $('#nx').onclick = function () { App.checkpoint(function () { App.back(); puzzles(opts.creative ? { creative: true } : {}); }); };
      }
      $('#hn', v).onclick = function () {
        if (done || busy) return;
        hints++;
        if (hints === 1) { co.innerHTML = App.coachHTML('info', 'Theme: <b>' + esc(p.th) + '</b>. Start with checks and captures.'); }
        else { var m = new Chess(g.fen()).move(p.sol[step]); B.ui.hint = { from: m.from, to: m.from }; B.render(); co.innerHTML = App.coachHTML('info', 'Move the highlighted piece.'); rate(0); }
      };
      $('#sol', v).onclick = function () {
        if (done || busy) return; rate(0); busy = true;
        (function stepIt() {
          if (step >= p.sol.length) { busy = false; done = true; co.innerHTML = App.coachHTML('info', explain()); var bt = $('.btns', v); bt.innerHTML = '<button class="btn primary" id="nx">' + (opts.id ? 'Try it again' : 'Next puzzle') + '</button>'; $('#nx').onclick = function () { App.checkpoint(function () { App.back(); puzzles(opts.id ? opts : {}); }); }; return; }
          var rr = g.move(p.sol[step]); step++; B.ui.last = { from: rr.from, to: rr.to }; B.render(); setTimeout(stepIt, 700);
        })();
      };
    });
  }

  // ----- openings -----
  function openings() {
    App.screen('Openings', function (v) {
      var c = st();
      v.innerHTML = '<p class="mute">Learn the plan, walk through the moves, then drill your side until you can play it clean three times.</p>' +
        '<span class="eyebrow">As White</span><div class="list" id="w"></div><span class="eyebrow">As Black</span><div class="list" id="b"></div>';
      ['w', 'b'].forEach(function (side) {
        $('#' + side, v).innerHTML = OPS.filter(function (o) { return o.side === side; }).map(function (o) {
          var s = c.open[o.id] || 0;
          return '<button class="item' + (s >= 3 ? ' done' : '') + '" data-o="' + o.id + '"><span class="grow"><span class="t">' + esc(o.name) + '</span><br><span class="s">' + o.eco + ' · ' + o.moves.split(' ').length + ' moves</span></span><span class="end">' + '★★★'.slice(0, s) + '<span class="mute">' + '☆☆☆'.slice(0, 3 - Math.min(3, s)) + '</span></span></button>';
        }).join('');
      });
      $$('[data-o]', v).forEach(function (b) { b.onclick = function () { opening(OPBYID[b.dataset.o]); }; });
    });
  }
  function opening(o) {
    App.screen(o.name, function (v) {
      var g = new Chess(), line = o.moves.split(' '), i = 0;
      v.innerHTML = '<div class="prose"><p>' + esc(o.theory) + '</p><ul>' + o.keys.map(function (k) { return '<li>' + esc(k) + '</li>'; }).join('') + '</ul></div>' +
        '<div id="bd"></div><div id="co"></div><div class="btns"><button class="btn" id="pv">‹ Back</button><button class="btn" id="nx">Next ›</button><button class="btn primary" id="dr">Drill it</button></div>';
      var B = mount($('#bd', v), g, { flip: o.side === 'b', canMove: function () { return false; }, onMove: function () {} });
      var co = $('#co', v);
      function show() {
        if (i === 0) { co.innerHTML = App.coachHTML('info', 'Tap Next to walk through the main line.'); return; }
        var gb = new Chess(); line.slice(0, i - 1).forEach(function (m) { gb.move(m); });
        var who = (i - 1) % 2 === 0 ? 'White' : 'Black';
        var note = o.notes[i - 1] || cap(idea(gb.fen(), line[i - 1])) + '.';
        co.innerHTML = App.coachHTML('info', '<b>' + Math.ceil(i / 2) + (who === 'White' ? '. ' : '… ') + esc(line[i - 1]) + '</b> (' + who + '). ' + esc(note).replace(/&lt;b&gt;|&lt;\/b&gt;/g, ''));
      }
      $('#nx', v).onclick = function () { if (i < line.length) { var r = g.move(line[i]); i++; B.ui.last = { from: r.from, to: r.to }; B.render(); show(); } };
      $('#pv', v).onclick = function () { if (i > 0) { g.undo(); i--; var h = g.history({ verbose: true }); B.ui.last = h.length ? h[h.length - 1] : null; B.render(); show(); } };
      $('#dr', v).onclick = function () { openingDrill(o); };
      show();
    });
  }
  function openingDrill(o) {
    App.screen('Drill: ' + o.name, function (v) {
      var g = new Chess(), line = o.moves.split(' '), i = 0, misses = 0, busy = false, wrongHere = 0;
      var my = o.side;
      v.innerHTML = '<div class="row"><span class="pill acc">You play ' + (my === 'w' ? 'White' : 'Black') + '</span><span class="pill" id="pg">0/' + line.length + '</span></div><div id="bd"></div><div id="co"></div><div class="btns" id="bt"></div>';
      var co = $('#co', v);
      var B = mount($('#bd', v), g, { flip: my === 'b', canMove: function () { return !busy && g.turn() === my && i < line.length; }, onMove: onMove });
      co.innerHTML = App.coachHTML('info', 'Play the main line of the ' + esc(o.name) + '. The other side is played for you.');
      function auto() {
        if (i < line.length && g.turn() !== my) {
          busy = true;
          setTimeout(function () { var r = g.move(line[i]); i++; B.ui.last = { from: r.from, to: r.to }; B.render(); $('#pg', v).textContent = i + '/' + line.length; busy = false; if (i >= line.length) finish(); }, 450);
        }
      }
      function onMove(mv) {
        var before = g.fen(); var r = g.move(mv); if (!r) return;
        if (r.san === line[i]) {
          i++; wrongHere = 0; B.ui.last = { from: r.from, to: r.to }; B.render(); $('#pg', v).textContent = i + '/' + line.length;
          var note = o.notes[i - 1] || cap(idea(before, r.san)) + '.';
          co.innerHTML = App.coachHTML('right', '<b>' + esc(r.san) + '</b>. ' + esc(note));
          if (i >= line.length) finish(); else auto();
        } else {
          g.undo(); misses++; wrongHere++; B.render();
          var m = line[i];
          var msg = '<b>' + esc(r.san) + '</b> isn’t the main line. In this opening the move is <b>' + (wrongHere >= 2 ? esc(m) : 'something else') + '</b>' + (wrongHere >= 2 ? ': ' + idea(before, m) + '.' : '. Think about the plan: ' + esc(o.keys[0].toLowerCase()) + '.');
          if (wrongHere >= 2) { var mm = new Chess(before).move(m); B.ui.hint = { from: mm.from, to: mm.to }; B.render(); }
          co.innerHTML = App.coachHTML('wrong', msg);
        }
      }
      function finish() {
        var c = st();
        if (misses === 0) c.open[o.id] = Math.min(3, (c.open[o.id] || 0) + 1);
        App.save();
        co.innerHTML = App.coachHTML(misses ? 'good' : 'right', misses ? 'Line complete with ' + misses + ' slip' + (misses > 1 ? 's' : '') + '. Run it clean to earn a star.' : 'Clean run! ' + (c.open[o.id] >= 3 ? 'Mastered.' : 'Star earned (' + c.open[o.id] + '/3).'));
        $('#bt', v).innerHTML = '<button class="btn primary" id="ag">Again</button><button class="btn" id="dn">Done</button>';
        $('#ag').onclick = function () { App.checkpoint(function () { App.back(); openingDrill(o); }); };
        $('#dn').onclick = function () { App.checkpoint(App.back); };
      }
      auto();
    });
  }

  // ----- play -----
  function playMenu() {
    App.screen('Play the bot', function (v) {
      var c = st();
      v.innerHTML = '<p class="mute">Every move you make gets graded and explained. Win to unlock the next bot.</p><div class="seg" id="col"><button aria-pressed="true" data-c="w">White</button><button aria-pressed="false" data-c="b">Black</button><button aria-pressed="false" data-c="r">Random</button></div>' +
        '<div class="seg" id="md"><button aria-pressed="true" data-m="coach">Coached</button><button aria-pressed="false" data-m="casual">Just play</button></div><p class="small mute" id="mdnote">Coached: every move graded, wins count toward the ladder.</p><div class="list" id="bl"></div>';
      var color = 'w', mode = 'coach';
      $$('[data-m]', v).forEach(function (b) { b.onclick = function () { mode = b.dataset.m; $$('[data-m]', v).forEach(function (x) { x.setAttribute('aria-pressed', x === b); }); $('#mdnote', v).textContent = mode === 'coach' ? 'Coached: every move graded, wins count toward the ladder.' : 'Just play: no grades during the game, any bot, nothing at stake. A summary comes at the end if you want it.'; }; });
      $$('[data-c]', v).forEach(function (b) { b.onclick = function () { color = b.dataset.c; $$('[data-c]', v).forEach(function (x) { x.setAttribute('aria-pressed', x === b); }); }; });
      $('#bl', v).innerHTML = BOTS.map(function (b) {
        var open = b.lv <= c.botLevel;
        return '<button class="item' + (open ? '' : ' locked') + (b.lv < c.botLevel ? ' done' : '') + '" data-b="' + b.lv + '"><span class="grow"><span class="t">' + b.lv + '. ' + b.name + '</span><br><span class="s">Plays like ' + b.elo + '</span></span><span class="end">' + (b.lv < c.botLevel ? '✓ beaten' : open ? 'play ›' : 'locked') + '</span></button>';
      }).join('');
      $$('[data-b]', v).forEach(function (b) { b.onclick = function () { var lv = +b.dataset.b; if (mode === 'casual' || lv <= st().botLevel) play(lv, color === 'r' ? (Math.random() < .5 ? 'w' : 'b') : color, mode === 'casual'); }; });
      $$('[data-m]', v).forEach(function (b) { var prev = b.onclick; b.onclick = function () { prev(); $$('[data-b]', v).forEach(function (x) { x.classList.toggle('locked', mode !== 'casual' && +x.dataset.b > st().botLevel); }); }; });
    });
  }
  function play(lv, my, casual) {
    var bot = BOTS[lv - 1];
    App.screen(bot.name + ' bot' + (casual ? ' · just play' : ''), function (v) {
      var g = new Chess(), busy = false, over = false, log = [];
      v.innerHTML = '<div class="row"><span class="pill acc">You: ' + (my === 'w' ? 'White' : 'Black') + '</span><span class="pill">Bot Lv ' + lv + ' ' + bot.elo + '</span></div>' +
        '<div id="bd"></div><div id="watch"></div><div id="co"></div><div id="op" class="small mute"></div><div class="moves" id="mv"></div>' +
        '<div class="btns" id="bt"><button class="btn" id="hn">Hint</button><button class="btn" id="tb">Take back</button><button class="btn ghost" id="rs">Resign</button></div>';
      var co = $('#co', v), opEl = $('#op', v);
      var B = mount($('#bd', v), g, { flip: my === 'b', canMove: function () { return !busy && !over && g.turn() === my; }, onMove: onMove });
      co.innerHTML = casual ? '' : App.coachHTML('info', 'Your move. Use the checklist: their threats, your checks and captures, then safety.');
      function moveList() {
        var h = g.history(), html = '', qi = 0;
        for (var k = 0; k < h.length; k++) {
          var mineMv = (k % 2 === 0) === (my === 'w');
          var cls = '';
          if (mineMv && log[qi]) { cls = { best: 'q-good', great: 'q-good', good: 'q-ok', inacc: 'q-warn', mistake: 'q-warn', blunder: 'q-bad' }[log[qi].grade]; qi++; }
          html += (k % 2 === 0 ? '<span class="mute">' + (k / 2 + 1) + '.</span>' : '') + '<span class="' + cls + '">' + esc(h[k]) + '</span>';
        }
        $('#mv', v).innerHTML = html;
      }
      function onMove(mv) {
        var before = g.fen(); var r = g.move(mv); if (!r) return;
        B.ui.last = { from: r.from, to: r.to }; B.ui.hint = null; B.render(); busy = true; $('#watch', v).innerHTML = '';
        co.innerHTML = casual ? '' : '<div class="thinking">Coach is checking your move</div>'; opEl.textContent = '';
        analyse(before, r.san).then(function (a) {
          log.push(a);
          if (!casual && a.kind && a.grade !== 'best' && a.grade !== 'good' && a.grade !== 'inacc') {
            var cc = st(); cc.err[a.kind]++;
            cc.phase = cc.phase || { opening: 0, middlegame: 0, endgame: 0 };
            var mn = g.history().length / 2, pieces = g.board().reduce(function (n, row) { return n + row.filter(function (p) { return p && p.type !== 'p' && p.type !== 'k'; }).length; }, 0);
            cc.phase[mn <= 12 ? 'opening' : pieces <= 6 ? 'endgame' : 'middlegame']++;
          }
          App.save();
          if (over) return;
          if (!casual) { co.innerHTML = App.coachHTML(a.grade, a.text); moveList(); }
          if (g.game_over()) return end();
          later(botMove, 150);
        });
      }
      function botMove() {
        opEl.innerHTML = '<span class="thinking">Bot is thinking</span>';
        var before = g.fen();
        App.engine({ game: 'chess', op: 'best', fen: before, depth: bot.depth, noise: bot.noise, ms: bot.ms }).then(function (res) {
          if (over) return;
          var r = g.move(res.move.san);
          B.ui.last = { from: r.from, to: r.to }; B.render();
          var t = threat(g.fen());
          opEl.innerHTML = casual ? 'Bot played <b>' + esc(r.san) + '</b>.' : 'Bot played <b>' + esc(r.san) + '</b>: ' + idea(before, r.san, 'their', 'your') + '.' + (t && t.gain >= 300 ? ' <b>Careful: it now threatens your ' + N[t.t] + '.</b> Check it.' : '');
          busy = false; if (!casual) { moveList(); showWatch(); }
          if (g.game_over()) end();
        });
      }
      function showWatch() {
        var w = $('#watch', v); if (casual || over || g.game_over()) { w.innerHTML = ''; return; }
        var cues = watchCues(g.fen());
        w.innerHTML = '<div class="panel" style="gap:4px;padding:10px 12px"><span class="eyebrow">Pay attention to</span>' + cues.map(function (c) { return '<div class="small">' + c + '</div>'; }).join('') + '</div>';
      }
      function end() {
        over = true; busy = false;
        var c = st(), res;
        if (g.in_checkmate()) res = g.turn() === my ? 'l' : 'w'; else res = 'd';
        finish(res);
      }
      function finish(res) {
        var c = st(); over = true;
        if (casual) {
          c.casual = c.casual || { w: 0, l: 0, d: 0 }; c.casual[res]++; App.save();
          var accs0 = log.map(function (a) { return 100 * Math.exp(-a.loss / 300); }), acc0 = accs0.length ? Math.round(accs0.reduce(function (x, y) { return x + y; }, 0) / accs0.length) : 0;
          if (res === 'w') App.celebrate('chess');
          co.innerHTML = '<div class="panel"><h2>' + (res === 'w' ? 'You won!' : res === 'l' ? 'Bot won' : 'Draw') + '</h2><p>Casual game: nothing counted. Accuracy was ' + acc0 + '%.</p><button class="btn sm" id="rev">Show the move review</button></div>' + WZ.card(res === 'w' ? 'win' : 'loss', true);
          $('#rev').onclick = function () { moveList(); var worst0 = log.slice().sort(function (a, b) { return b.loss - a.loss; })[0]; co.innerHTML += worst0 ? App.coachHTML(worst0.grade, '<b>Biggest swing:</b> ' + worst0.text) : ''; };
          opEl.textContent = '';
          $('#bt', v).innerHTML = '<button class="btn primary" id="ag">Play again</button><button class="btn" id="dn">Done</button>';
          $('#ag').onclick = function () { App.checkpoint(function () { App.back(); play(lv, my, true); }); };
          $('#dn').onclick = function () { App.checkpoint(App.back); };
          return;
        }
        c.games[res]++;
        var accs = log.map(function (a) { return 100 * Math.exp(-a.loss / 300); });
        var acc = accs.length ? Math.round(accs.reduce(function (x, y) { return x + y; }, 0) / accs.length) : 0;
        c.acc = (c.acc || []).concat([acc]).slice(-20);
        var lvUp = res === 'w' && lv === c.botLevel && lv < MAXLV && ((c.winsAt || {})[lv] || 0) + 1 >= winsNeeded(lv);
        if (res === 'w') App.celebrate(lvUp ? 'level' : 'chess');
        if (res === 'w') { c.winsAt = c.winsAt || {}; c.winsAt[lv] = (c.winsAt[lv] || 0) + 1; if (c.winsAt[lv] >= winsNeeded(lv)) c.botLevel = Math.max(c.botLevel, Math.min(MAXLV, lv + 1)); c.lossStreak = 0; } else if (res === 'l') c.lossStreak = (c.lossStreak || 0) + 1;
        App.save();
        var worst = log.slice().sort(function (a, b) { return b.loss - a.loss; })[0];
        var counts = {}; log.forEach(function (a) { counts[a.grade] = (counts[a.grade] || 0) + 1; });
        var title = res === 'w' ? 'You won!' : res === 'l' ? 'Bot won' : 'Draw';
        var push = res === 'w' ? (lvUp ? 'Level ' + (lv + 1) + ' unlocked. The next bot plays sharper.' : (lv === c.botLevel && lv < MAXLV ? 'One more win here unlocks level ' + (lv + 1) + '.' : 'Try the next level up.')) :
          c.lossStreak >= 2 ? 'Two losses in a row: drop a level or do puzzles on your weakest theme, then come back.' : 'Review your worst move below, then run it back.';
        co.innerHTML = '<div class="panel"><h2>' + title + '</h2><div class="stats"><div class="stat"><span class="v">' + acc + '%</span><span class="k">Accuracy</span></div>' +
          ['best', 'good', 'inacc', 'mistake', 'blunder'].map(function (k) { return '<div class="stat"><span class="v">' + (counts[k] || 0) + '</span><span class="k">' + { best: 'Best', good: 'Good', inacc: 'Inaccuracies', mistake: 'Mistakes', blunder: 'Blunders' }[k] + '</span></div>'; }).join('') +
          '</div><p>' + push + '</p></div>' + (worst && worst.loss > 50 ? App.coachHTML(worst.grade, '<b>Biggest swing:</b> ' + worst.text) : '') + WZ.card(res === 'w' ? (lvUp ? 'level' : 'win') : 'loss', true);
        opEl.textContent = '';
        $('#bt', v).innerHTML = '<button class="btn primary" id="ag">' + (lvUp ? 'Play level ' + (lv + 1) : 'Play again') + '</button><button class="btn" id="dn">Done</button>';
        $('#ag').onclick = function () { App.checkpoint(function () { App.back(); play(lvUp ? lv + 1 : lv, my); }); };
        $('#dn').onclick = function () { App.checkpoint(App.back); };
        if (lvUp && lv + 1 >= 4) WZ.onlineNudge('chess');
      }
      $('#hn', v).onclick = function () {
        if (busy || over || g.turn() !== my) return;
        busy = true; co.innerHTML = '<div class="thinking">Looking for the best move</div>';
        App.engine({ game: 'chess', op: 'best', fen: g.fen(), depth: 3, ms: 800 }).then(function (r) { if (over) return; B.ui.hint = { from: r.move.from, to: r.move.to }; B.render(); busy = false; co.innerHTML = App.coachHTML('info', 'Try <b>' + esc(r.move.san) + '</b>: ' + idea(g.fen(), r.move.san) + '.'); });
      };
      $('#tb', v).onclick = function () {
        if (busy || over) return;
        if (g.turn() === my && g.history().length >= 2) { g.undo(); g.undo(); log.pop(); }
        else if (g.turn() !== my && g.history().length) { g.undo(); log.pop(); }
        B.ui.last = null; B.ui.hint = null; B.render(); moveList(); co.innerHTML = App.coachHTML('info', 'Taken back. Your move.'); opEl.textContent = '';
      };
      $('#rs', v).onclick = function () { if (!over) { co.innerHTML = ''; finish('l'); } };
      if (my === 'b') { busy = true; botMove(); } else showWatch();
    });
  }

  // ----- placement: adaptive puzzle ladder -----
  function place() {
    var target = 800, step = 300, n = 0, total = 7, used = {}, results = [];
    function nextP() {
      var best = null;
      ALL.forEach(function (p) { if (used[p.id]) return; if (!best || Math.abs(p.r - target) < Math.abs(best.r - target)) best = p; });
      used[best.id] = 1; return best;
    }
    App.screen('Chess placement', function (v) {
      function ask() {
        if (n >= total) return finish();
        var p = nextP(), g = new Chess(p.fen), step2 = 0, busy = false, over = false;
        var youW = g.turn() === 'w';
        v.innerHTML = '<div class="row"><span class="pill acc">Placement ' + (n + 1) + ' / ' + total + '</span><span class="pill">' + (youW ? 'White' : 'Black') + ' to move</span></div><div class="bar"><i style="width:' + (n / total * 100) + '%"></i></div><div id="bd"></div><div id="co"></div><div class="btns"><button class="btn ghost" id="idk">I don’t see it</button></div>';
        var co = $('#co', v);
        co.innerHTML = App.coachHTML('info', 'One try. Find the best move.');
        var B = mount($('#bd', v), g, { flip: !youW, coords: true, canMove: function () { return !busy && !over; }, onMove: function (mv) {
          var r = g.move(mv); if (!r) return;
          B.ui.last = { from: r.from, to: r.to };
          var ok = r.san === p.sol[step2] || g.in_checkmate();
          if (!ok) return result(false, r.san);
          step2++; B.render();
          if (step2 >= p.sol.length || g.in_checkmate()) return result(true);
          busy = true;
          setTimeout(function () { var rr = g.move(p.sol[step2]); step2++; B.ui.last = { from: rr.from, to: rr.to }; B.render(); busy = false; if (step2 >= p.sol.length) result(true); }, 500);
        } });
        $('#idk', v).onclick = function () { if (!over) result(false); };
        function result(ok, san) {
          over = true; n++;
          results.push(ok);
          target += ok ? step : -step; step = Math.max(80, Math.round(step * 0.7));
          target = Math.max(400, Math.min(1900, target));
          var gg = new Chess(p.fen);
          co.innerHTML = App.coachHTML(ok ? 'right' : 'wrong', (ok ? 'Correct. ' : (san ? esc(san) + ' misses it. ' : '') + 'The answer was <b>' + esc(p.sol[0]) + '</b>: ' + idea(gg.fen(), p.sol[0]) + '. ') + 'Next one will be ' + (ok ? 'harder.' : 'easier.'));
          $('.btns', v).innerHTML = '<button class="btn primary" id="nx">Next</button>';
          $('#nx').onclick = ask;
        }
      }
      function finish() {
        var c = st();
        c.rating = Math.round(target / 10) * 10; c.peak = Math.max(c.peak || 0, c.rating); c.placed = 1;
        c.botLevel = Math.max(c.botLevel, c.rating < 650 ? 1 : c.rating < 850 ? 2 : c.rating < 1050 ? 3 : c.rating < 1250 ? 4 : c.rating < 1450 ? 5 : 6);
        var openTo = c.rating < 650 ? 0 : c.rating < 850 ? 4 : c.rating < 1050 ? 7 : c.rating < 1250 ? 11 : c.rating < 1450 ? 13 : 14;
        for (var i = 0; i <= openTo && i < LESSONS.length; i++) c.lessons[LESSONS[i].id] = 1;
        if (c.rating >= 1100) c.sqLvl = Math.max(c.sqLvl || 1, 2);
        App.save();
        var where = LESSONS[Math.min(openTo, LESSONS.length - 1)];
        v.innerHTML = '<div class="panel"><span class="eyebrow">Placement done</span><h1>Rating ' + c.rating + '</h1><p>' + results.filter(Boolean).length + ' of ' + total + ' solved. Lessons up to <b>' + esc(where.t) + '</b> are unlocked, and bots up to level ' + c.botLevel + '. Puzzles from here on are pitched just above this level so you keep climbing.</p><button class="btn primary" id="gh">Go to chess</button></div>';
        $('#gh', v).onclick = function () { App.tab('chess'); };
      }
      ask();
    });
  }

  // what the coach has learned about you
  function report() {
    var c = st(), out = [], th = c.theme || {}, ph = c.phase || {}, errs = c.err || {};
    var themes = Object.keys(th).filter(function (k) { return th[k].n >= 3; }).map(function (k) { return { k: k, r: th[k].ok / th[k].n, n: th[k].n }; }).sort(function (a, b) { return a.r - b.r; });
    if (themes.length) out.push({ sev: 1 - themes[0].r, text: 'Weakest puzzle theme: <b>' + esc(themes[0].k) + '</b> (' + Math.round(100 * themes[0].r) + '% first-try). Puzzles now lean toward it.', action: 'Puzzles', go: function () { puzzles({}); } });
    var errTop = Object.keys(errs).sort(function (a, b) { return errs[b] - errs[a]; })[0], errN = Object.keys(errs).reduce(function (n, k) { return n + errs[k]; }, 0);
    if (errN >= 3) { var map = { hang: ['You leave pieces where they can be taken', 'How to think every move', 0], mate: ['You miss checkmates that are on the board', 'The back rank', 1], take: ['You miss free material', 'Forks', 5], other: ['Your mistakes are positional, not tactical', 'Opening principles with 1.e4', 8] }[errTop]; out.push({ sev: errs[errTop] / errN, text: map[0] + ': ' + errs[errTop] + ' of ' + errN + ' mistakes in games.', action: 'Lesson: ' + map[1], go: function () { lesson(map[2]); } }); }
    var phTop = Object.keys(ph).sort(function (a, b) { return ph[b] - ph[a]; })[0], phN = Object.keys(ph).reduce(function (n, k) { return n + ph[k]; }, 0);
    if (phN >= 4) { var pm = { opening: ['Most of your mistakes come in the opening.', 'Openings', openings], middlegame: ['Most of your mistakes come in the middlegame, where tactics decide.', 'Puzzles', function () { puzzles({}); }], endgame: ['Most of your mistakes come in the endgame.', 'Endgames', endgameMenu] }[phTop]; out.push({ sev: ph[phTop] / phN, text: pm[0] + ' (' + ph[phTop] + ' of ' + phN + ')', action: pm[1], go: pm[2] }); }
    if ((c.acc || []).length >= 3) { var a = c.acc.slice(-5), avg = a.reduce(function (x, y) { return x + y; }, 0) / a.length; out.push({ sev: (80 - avg) / 80, text: 'Recent game accuracy ' + Math.round(avg) + '%.' + (avg < 60 ? ' Slow down: use the three-question checklist before every move.' : avg < 75 ? ' Solid. The next jump comes from calculating one move deeper.' : ' Strong. Move up a bot level.'), action: 'Play bot', go: playMenu });
    }
    if (!out.length) out.push({ sev: 0, text: 'Not enough data yet. Play two games and a dozen puzzles and the coach will map your weaknesses.', action: 'Puzzles', go: function () { puzzles({}); } });
    return out.sort(function (a, b) { return b.sev - a.sev; });
  }
  function quick() {
    var c = st(), out = [], rep = report()[0];
    if (rep.sev > 0.15) out.push({ label: 'Chess: ' + rep.action.replace(/^Lesson: /, 'lesson: '), why: rep.text, go: rep.go, quota: 3, w: 2 });
    var nl = -1; for (var i = 0; i < LESSONS.length; i++) if (lessonOpen(i) && !lessonDone(LESSONS[i])) { nl = i; break; }
    if (nl >= 0) out.push({ label: 'Chess lesson: ' + LESSONS[nl].t, why: 'Next step in your curriculum.', go: function () { lesson(nl); }, quota: 3, w: 1.3 });
    out.push({ label: 'Chess puzzles', why: 'Rated puzzles pitched just above your level (' + c.rating + ').', go: function () { puzzles({}); }, quota: 5, w: 1.5 });
    out.push({ label: 'Coached game vs ' + BOTS[c.botLevel - 1].name, why: 'Every move graded. Wins unlock the next bot.', go: function () { play(c.botLevel, Math.random() < .5 ? 'w' : 'b'); }, quota: 1, w: 1 });
    var eg = Object.keys(ENDG).filter(function (k) { return !(c.endg || {})[k]; })[0];
    if (eg && c.rating >= 850) out.push({ label: 'Endgame: ' + ENDG[eg].t, why: ENDG[eg].goalText + '.', go: function () { endgame(eg); }, quota: 1, w: .8 });
    var op = OPS.slice().sort(function (a, b) { return (c.open[a.id] || 0) - (c.open[b.id] || 0); })[0];
    if (op && (c.open[op.id] || 0) < 3) out.push({ label: 'Opening drill: ' + op.name, why: 'Clean runs earn stars; three stars masters the line.', go: function () { openingDrill(op); }, quota: 2, w: .7 });
    out.push({ label: 'Outside-the-box puzzles', why: 'Quiet moves and sacrifices: the moves most players never look at.', go: function () { puzzles({ creative: true }); }, quota: 4, w: .9 });
    out.push({ label: 'Board vision', why: 'Name squares fast; it speeds up every calculation.', go: vision, quota: 1, w: .4 });
    return out;
  }
  App.reg('chess', { home: home, place: place, report: report, quick: quick });
  return { idea: idea, analyse: analyse, threat: threat, ALL: ALL, LESSONS: LESSONS, estElo: estElo, creativePool: creativePool, watchCues: watchCues, puzzles: puzzles, lesson: lesson, lessonDone: lessonDone, lessonOpen: lessonOpen, play: play, playMenu: playMenu, endgame: endgame, endgameMenu: endgameMenu, openings: openings, openingDrill: openingDrill, vision: vision, OPS: OPS, BOTS: BOTS, ENDG: ENDG };
})();
