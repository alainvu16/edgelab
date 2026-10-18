// ===================== QUICK MATH: fast mental math for stocks and everyday sharpness =====================
// Every question is generated, so it never runs out. About 4 in 10 are timed ("Beat the clock", a visible countdown;
// time out = a miss with the shortcut shown); the rest have no clock at all, so you can think. Wrong choices are the mistakes people actually make
// (e.g. "down 20% then up 20% is break-even"). Level rises when you're accurate AND quick; falls when you miss a lot.
var MM = (function () {
  var $ = App.$, $$ = App.$$, esc = App.esc;
  var ROUND = 10, MAXLV = 5;
  var TARGET = [0, 15, 13, 12, 10, 9];   // seconds on the clock for timed questions, by level
  var TIMED_SHARE = 0.4;
  function st() { var s = App.S; if (!s.math) s.math = { lv: 1, rounds: 0, n: 0, ok: 0, best: 0, fast: 0 }; return s.math; }
  function R(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  function r1(x) { return (x < 0 ? -1 : 1) * Math.round(Math.abs(x) * 10) / 10; }   // halves round away from zero, so -6.25 and 6.25 match
  function r4(x) { return Math.round(x * 10000) / 10000; }
  function pc(x) { x = r1(x); return (x > 0 ? '+' : '') + x + '%'; }
  function num(x) { return Math.round(x * 100) / 100 + ''; }
  function money(x) { var v = Math.round(x * 100) / 100; return '$' + v.toLocaleString('en-US', v % 1 ? { minimumFractionDigits: 2, maximumFractionDigits: 2 } : {}); }
  // build 4 unique choices: the answer plus distractors. A distractor is [value, why someone picks it]:
  // the common mistakes come first, then near misses (arithmetic slips), so a wrong pick can be explained.
  function choices(ans, wrongs, fmt, near) {
    var seen = {}, out = [{ v: ans, ok: true }]; seen[fmt(ans)] = 1;
    function add(v, why) { if (out.length < 4 && isFinite(v) && !seen[fmt(v)]) { seen[fmt(v)] = 1; out.push({ v: v, ok: false, why: why }); } }
    wrongs.forEach(function (w) { add(w[0], w[1]); });
    (near || []).forEach(function (w) { add(w, 'Close: a small slip in the arithmetic. Redo the steps above one at a time.'); });
    var k = 1; while (out.length < 4 && k < 40) { add(ans + (k % 2 ? 1 : -1) * Math.ceil(k / 2) * (Math.abs(ans) >= 20 ? Math.max(1, Math.round(Math.abs(ans) * 0.05)) : 1), 'Close, but not exact: estimate first, then check the exact steps.'); k++; }
    for (var i = out.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = out[i]; out[i] = out[j]; out[j] = t; }
    return out.map(function (o) { return { t: fmt(o.v), ok: o.ok, why: o.why }; });
  }
  function done(q) { q.tip = q.steps.join(' ') + ' Shortcut: ' + q.trick; return q; }   // tip = one-line version for mastery rounds and tests

  // ---- stock math ----
  // Each question: q, o (choices), steps (how to work it out), trick (the mental shortcut), use (where it matters).
  var STOCK = {
    change: function (lv) { // % change from a to b
      var a = pick(lv < 3 ? [20, 40, 50, 80, 100, 200] : [25, 40, 60, 75, 120, 150, 250]), pcts = lv < 3 ? [10, 20, 25, 50] : [5, 12, 15, 20, 30, 40, 60];
      var p = pick(pcts) * (Math.random() < 0.65 ? 1 : -1), b = a * (1 + p / 100);
      if (Math.abs(b - Math.round(b * 100) / 100) > 1e-9) { b = Math.round(b); p = (b - a) / a * 100; }
      var d = b - a;
      return done({ q: 'A stock goes from ' + money(a) + ' to ' + money(b) + '. What’s the % change?',
        o: choices(p, [[d / b * 100, 'You divided by the new price (' + money(b) + '). Percent change is always measured from where you started.'], [d, 'That’s the dollar change (' + money(Math.abs(d)) + '), not the percent. Divide it by the starting price.'], [-p, 'Right size, wrong direction: the price went ' + (d > 0 ? 'up' : 'down') + ', so the sign is ' + (d > 0 ? 'plus' : 'minus') + '.']], pc),
        steps: ['1) Dollar change: ' + money(b) + ' − ' + money(a) + ' = ' + (d < 0 ? '−' : '') + money(Math.abs(d)) + '.', '2) Divide by the START price: ' + (d < 0 ? '−' : '') + money(Math.abs(d)) + ' ÷ ' + money(a) + ' = ' + r4(d / a) + '.', '3) As a percent: ' + pc(p) + '.'],
        trick: 'Ask “what fraction of the starting price moved?” ' + money(Math.abs(d)) + ' out of ' + money(a) + ' is ' + r1(Math.abs(p)) + '%.',
        use: 'Every chart, earnings move and P&L is quoted this way. Mixing up the base makes gains look bigger and losses smaller than they are.' });
    },
    updown: function (lv) { // down x% then up x%
      var x = pick(lv < 3 ? [10, 20, 50] : [10, 20, 25, 30, 40, 50]), down = Math.random() < 0.6;
      var f1 = 1 + (down ? -x : x) / 100, f2 = 1 + (down ? x : -x) / 100, net = (f1 * f2 - 1) * 100, mid = 100 * f1;
      return done({ q: 'A stock ' + (down ? 'falls ' + x + '%, then rises ' + x + '%' : 'rises ' + x + '%, then falls ' + x + '%') + '. Where is it vs. the start?',
        o: choices(net, [[0, 'The classic trap: the second ' + x + '% is taken from a different base, so they don’t cancel.'], [x * x / 100, 'Right size, wrong sign: you always end LOWER after equal up and down moves.'], [-2 * x / 10, 'Guess, not math: multiply the two moves to see the real result.']], pc),
        steps: ['1) Start at $100. After the ' + (down ? 'fall' : 'rise') + ': $100 × ' + r4(f1) + ' = $' + r1(mid) + '.', '2) Then ' + (down ? 'up' : 'down') + ' ' + x + '% of $' + r1(mid) + ': $' + r1(mid) + ' × ' + r4(f2) + ' = $' + r1(mid * f2) + '.', '3) From $100 to $' + r1(mid * f2) + ' is ' + pc(net) + '.'],
        trick: 'Equal % down and up always loses x² ÷ 100: ' + x + '² ÷ 100 = ' + r1(x * x / 100) + '%.',
        use: 'This is why big swings hurt even when a stock “comes back”, and why leveraged funds bleed in choppy markets.' });
    },
    recover: function (lv) { // gain needed after a loss
      var L = pick(lv < 3 ? [10, 20, 25, 50] : [10, 20, 25, 33.3, 40, 50, 60, 75]), left = 100 - L, g = L / left * 100;
      if (L === 33.3) { g = 50; left = 66.7; }
      return done({ q: 'You’re down ' + L + '% on a position. What gain gets you back to even?',
        o: choices(g, [[L, 'The trap: after a loss you have less money, so the same % on a smaller amount isn’t enough.'], [L * 1.5, 'Rough guess. Use the formula: loss ÷ what’s left.'], [L / 2 + L, 'Close-ish guess, but the exact answer is loss ÷ what’s left.']], function (v) { return '+' + r1(v) + '%'; }),
        steps: ['1) Start with $100. Down ' + L + '% leaves $' + r1(left) + '.', '2) To get back to $100 you need $' + r1(100 - left) + ' more.', '3) $' + r1(100 - left) + ' ÷ $' + r1(left) + ' = +' + r1(g) + '%.'],
        trick: 'Loss ÷ what’s left. Memorize the big ones: −10% → +11%, −20% → +25%, −33% → +50%, −50% → +100%.',
        use: 'The deeper the hole, the faster the climb out gets impossible. It’s the math behind cutting losses early with a stop.' });
    },
    rule72: function (lv) {
      var r = pick([4, 6, 8, 9, 12, 18, 24]), y = 72 / r;
      return done({ q: 'Money growing ' + r + '% a year doubles in about how many years?',
        o: choices(y, [[100 / r, 'That’s 100 ÷ ' + r + ': simple interest with no compounding. Compounding makes it faster.'], [72 / r * 2, 'That’s how long to quadruple (double twice), not double.'], [r, 'That’s the rate itself, not the time.']], function (v) { return r1(v) + ' yrs'; }),
        steps: ['1) Rule of 72: years to double ≈ 72 ÷ yearly rate.', '2) 72 ÷ ' + r + ' = ' + r1(y) + ' years.'],
        trick: 'It works both ways: to double in ' + r1(y) + ' years you need about 72 ÷ ' + r1(y) + ' = ' + r + '% a year.',
        use: 'Compare any return, fee or inflation rate in your head: at 3% inflation, prices double in about 24 years.' });
    },
    stop: function (lv) { // % risk to a stop
      var e = pick([20, 40, 50, 80, 100, 120, 150, 200]), d = pick(lv < 3 ? [5, 8, 10] : [4, 6, 7, 8, 12, 15]), s = Math.round(e * (1 - d / 100) * 100) / 100, gap = e - s;
      return done({ q: 'Buy at ' + money(e) + ', stop at ' + money(s) + '. How much % do you risk?',
        o: choices(d, [[gap, 'That’s the dollar gap per share (' + money(gap) + '), not the percent. Divide by the entry price.'], [gap / s * 100, 'You divided by the stop price. Risk is measured from your entry.'], [d * 2, 'Double the real risk: check the subtraction first.']], function (v) { return r1(v) + '%'; }),
        steps: ['1) Gap per share: ' + money(e) + ' − ' + money(s) + ' = ' + money(gap) + '.', '2) Divide by the ENTRY: ' + money(gap) + ' ÷ ' + money(e) + ' = ' + r4(gap / e) + '.', '3) That’s ' + r1(d) + '% of every dollar you put in.'],
        trick: 'Find 1% of the entry (' + money(e / 100) + '), then count how many of those fit in the gap: ' + r1(d) + '.',
        use: 'Knowing your % risk before you buy tells you how big the position can be. ToneBot sets its stops the same way.' });
    },
    rr: function (lv) { // reward-to-risk multiple
      var e = pick([20, 40, 50, 100]), risk = pick([1, 2, 2.5, 5]) * (e / 50 > 1 ? 2 : 1), m = pick([1.5, 2, 3, 4]), s = e - risk, t = e + risk * m;
      return done({ q: 'Entry ' + money(e) + ', stop ' + money(s) + ', target ' + money(t) + '. Reward-to-risk?',
        o: choices(m, [[(t - s) / risk, 'You measured the reward from the stop, not from your entry.'], [1 / m, 'Flipped: that’s risk ÷ reward. Reward goes on top.'], [m + 1, 'Off by one: count the reward from the entry, not from the stop.']], function (v) { return r1(v) + ' : 1'; }),
        steps: ['1) Reward = target − entry = ' + money(t) + ' − ' + money(e) + ' = ' + money(t - e) + '.', '2) Risk = entry − stop = ' + money(e) + ' − ' + money(s) + ' = ' + money(risk) + '.', '3) Reward ÷ risk = ' + money(t - e) + ' ÷ ' + money(risk) + ' = ' + r1(m) + ' : 1.'],
        trick: 'Picture the risk as one block; count how many blocks fit between entry and target.',
        use: 'At ' + r1(m) + ' : 1 you only need to be right more than ' + Math.round(100 / (m + 1)) + '% of the time to make money over many trades.' });
    },
    size: function (lv) { // shares from a fixed risk
      var pair = pick([[100, 2], [100, 4], [100, 5], [200, 4], [200, 2.5], [250, 5], [250, 2.5], [500, 4], [500, 2.5], [300, 1.5]]), risk = pair[0], per = pair[1], sh = risk / per;
      return done({ q: 'You’ll risk ' + money(risk) + ' on a trade, and your stop is ' + money(per) + ' below entry. How many shares?',
        o: choices(sh, [[risk * per, 'You multiplied. Shares = total risk ÷ risk per share.'], [sh * 2, 'Twice too many: if the stop hits you’d lose ' + money(risk * 2) + ', double your plan.'], [sh / 2, 'Half the right size: safe, but you’d only risk ' + money(risk / 2) + '.']], function (v) { return Math.round(v) + ' sh'; }),
        steps: ['1) Each share loses ' + money(per) + ' if the stop is hit.', '2) Total you’re willing to lose: ' + money(risk) + '.', '3) ' + money(risk) + ' ÷ ' + money(per) + ' = ' + Math.round(sh) + ' shares. Check: ' + Math.round(sh) + ' × ' + money(per) + ' = ' + money(risk) + '.'],
        trick: 'Always check backwards: shares × stop distance should equal your planned risk.',
        use: 'This is position sizing: the stop decides the size, not how much you like the stock. It keeps one bad trade from becoming a disaster.' });
    },
    twice: function (lv) { // up x% two years running
      var x = pick([10, 20, 25, 50]), f = 1 + x / 100, tot = (f * f - 1) * 100;
      return done({ q: 'Up ' + x + '% this year and ' + x + '% next year. Total gain?',
        o: choices(tot, [[2 * x, 'Adding ignores compounding: the second ' + x + '% grows on a bigger base.'], [2 * x - x / 10, 'Compounding adds, it doesn’t subtract: the total is MORE than ' + 2 * x + '%.'], [x * x / 100 + x, 'Only one year counted fully. Multiply both years.']], function (v) { return '+' + r1(v) + '%'; }),
        steps: ['1) Start at $100. After year 1: $100 × ' + r4(f) + ' = $' + r1(100 * f) + '.', '2) After year 2: $' + r1(100 * f) + ' × ' + r4(f) + ' = $' + r1(100 * f * f) + '.', '3) From $100 to $' + r1(100 * f * f) + ' is +' + r1(tot) + '%.'],
        trick: 'Two equal gains of x% give 2x + x² ÷ 100: ' + 2 * x + ' + ' + r1(x * x / 100) + ' = ' + r1(tot) + '%.',
        use: 'Compounding is why small steady returns beat big erratic ones, and why fees that compound matter so much.' });
    },
    pe: function (lv) {
      var eps = pick([2, 4, 5, 8, 10]), pe = pick([10, 12, 15, 20, 25, 30]), p = eps * pe;
      return done({ q: 'Price ' + money(p) + ', earnings ' + money(eps) + ' a share. P/E?',
        o: choices(pe, [[eps / p * 100, 'That’s earnings ÷ price as a percent (the earnings yield), the P/E flipped.'], [pe * 2, 'Twice too high: recheck the division.'], [pe + eps, 'Added instead of divided. P/E = price ÷ earnings.']], function (v) { return r1(v) + 'x'; }),
        steps: ['1) P/E = price ÷ yearly earnings per share.', '2) ' + money(p) + ' ÷ ' + money(eps) + ' = ' + pe + '.', '3) Flipped, that’s an earnings yield of ' + r1(100 / pe) + '%.'],
        trick: 'P/E is “years to earn back the price” if earnings stayed flat: ' + pe + ' years here.',
        use: 'A high P/E means the market expects growth; if growth disappoints, the price falls hard. A fast way to compare stocks.' });
    },
    pctof: function (lv) {
      var p = pick(lv < 3 ? [10, 20, 25, 50] : [5, 15, 30, 35, 45, 60, 75]), n = pick(lv < 3 ? [40, 60, 80, 120, 200] : [140, 240, 360, 480, 640]), a = p * n / 100;
      return done({ q: p + '% of ' + money(n) + '?',
        o: choices(a, [[n - a, 'That’s what’s LEFT after taking ' + p + '% away, not the ' + p + '% itself.'], [a * 10, 'Decimal slip: you’re off by a factor of 10.'], [n / p, 'You divided by ' + p + ' instead of taking ' + p + '%.']], money),
        steps: ['1) 10% of ' + money(n) + ' = ' + money(n / 10) + ' (move the decimal one place).', '2) ' + p + '% = ' + r1(p / 10) + ' × ' + money(n / 10) + ' = ' + money(a) + '.'],
        trick: 'Build any % from 10%, 5% (half of 10%) and 1%: e.g. 35% = 3 × 10% + 5%.',
        use: 'Position sizes, stop distances, discounts and taxes are all this one move.' });
    }
  };
  // ---- general mental math ----
  var GEN = {
    mul: function (lv) {
      var a = lv < 2 ? R(12, 29) : lv < 4 ? R(13, 49) : R(23, 89), b = lv < 3 ? R(3, 9) : R(11, 19), p = a * b, t = Math.floor(a / 10) * 10, u = a % 10;
      var steps = b < 10 ? ['1) Split ' + a + ' into ' + t + ' + ' + u + '.', '2) ' + t + ' × ' + b + ' = ' + t * b + ' and ' + u + ' × ' + b + ' = ' + u * b + '.', '3) Add: ' + t * b + ' + ' + u * b + ' = ' + p + '.']
        : ['1) Split ' + b + ' into 10 + ' + (b - 10) + '.', '2) ' + a + ' × 10 = ' + a * 10 + ' and ' + a + ' × ' + (b - 10) + ' = ' + a * (b - 10) + '.', '3) Add: ' + a * 10 + ' + ' + a * (b - 10) + ' = ' + p + '.'];
      return done({ q: a + ' × ' + b + ' = ?', o: choices(p, [[p + 10, 'Off by 10: a carry slipped when adding the parts.'], [p - 10, 'Off by 10: a carry slipped when adding the parts.'], [p + b, 'One ' + b + ' too many: you multiplied by ' + (a + 1) + '.']], num, [p + 1, p - 1]),
        steps: steps, trick: 'Split the bigger number into tens and ones, multiply each, then add.', use: 'Fast estimates of position value, pot sizes and totals without reaching for the phone calculator.' });
    },
    sq: function (lv) {
      var a = lv < 3 ? pick([15, 25, 35, 45, 55, 65]) : R(21, 79), p = a * a, r = Math.round(a / 10) * 10, d = a - r, t = Math.floor(a / 10);
      var steps = a % 10 === 5 ? ['1) Take the tens digit (' + t + ') times the next number (' + (t + 1) + '): ' + t * (t + 1) + '.', '2) Write 25 after it: ' + p + '.']
        : ['1) Round to ' + r + ' (' + (d > 0 ? '+' : '−') + Math.abs(d) + ').', '2) (a ± b)² = a² ± 2ab + b²: ' + r * r + ' ' + (d > 0 ? '+' : '−') + ' ' + 2 * r * Math.abs(d) + ' + ' + d * d + '.', '3) = ' + p + '.'];
      return done({ q: a + '² = ?', o: choices(p, [[a * 20, 'That’s ' + a + ' × 20, not ' + a + ' × ' + a + '.'], [p + 10, 'Off by 10: check the middle step.'], [p - 10, 'Off by 10: check the middle step.']], num, [p + 100, p - 100]),
        steps: steps, trick: a % 10 === 5 ? 'Numbers ending in 5: tens × (tens + 1), then 25.' : 'Square the round number, adjust by 2 × round × gap, add the gap squared.', use: 'Squares show up in volatility and in the “equal up and down” trap (x² ÷ 100).' });
    },
    add: function (lv) {
      var a = lv < 3 ? R(120, 480) : R(1200, 4800), b = lv < 3 ? R(110, 390) : R(1100, 3900), minus = Math.random() < 0.5, hi = Math.max(a, b), lo = Math.min(a, b), x = minus ? hi - lo : a + b;
      var big = minus ? Math.floor(lo / 100) * 100 : Math.floor(b / 100) * 100, rest = (minus ? lo : b) - big;
      return done({ q: (minus ? hi + ' − ' + lo : a + ' + ' + b) + ' = ?', o: choices(x, [[x + 10, 'Off by 10: a carry or borrow slipped.'], [x - 10, 'Off by 10: a carry or borrow slipped.'], [x + 100, 'Off by 100: check the hundreds.']], num, [x + 1, x - 1]),
        steps: minus ? ['1) Take away the hundreds first: ' + hi + ' − ' + big + ' = ' + (hi - big) + '.', '2) Then the rest: ' + (hi - big) + ' − ' + rest + ' = ' + x + '.'] : ['1) Add the hundreds first: ' + a + ' + ' + big + ' = ' + (a + big) + '.', '2) Then the rest: ' + (a + big) + ' + ' + rest + ' = ' + x + '.'],
        trick: 'Work left to right in chunks (hundreds, then the rest) instead of carrying digits.', use: 'Keeping a running P&L or a chip count in your head.' });
    },
    div: function (lv) {
      var b = lv < 3 ? R(3, 9) : R(6, 15), q = lv < 3 ? R(12, 40) : R(15, 70), a = b * q, t10 = b * 10 * Math.floor(q / 10);
      return done({ q: a + ' ÷ ' + b + ' = ?', o: choices(q, [[q + 1, 'One too many: ' + (q + 1) + ' × ' + b + ' = ' + (q + 1) * b + ', past ' + a + '.'], [q - 1, 'One short: ' + (q - 1) + ' × ' + b + ' = ' + (q - 1) * b + ', not ' + a + '.'], [q + 10, 'Off by 10: ' + (q + 10) + ' × ' + b + ' = ' + (q + 10) * b + '.']], num),
        steps: ['1) Take out an easy chunk: ' + b + ' × ' + 10 * Math.floor(q / 10) + ' = ' + t10 + '.', '2) What’s left: ' + a + ' − ' + t10 + ' = ' + (a - t10) + ', which is ' + b + ' × ' + (q - 10 * Math.floor(q / 10)) + '.', '3) Add the parts: ' + 10 * Math.floor(q / 10) + ' + ' + (q - 10 * Math.floor(q / 10)) + ' = ' + q + '.'],
        trick: 'Divide in chunks of 10 × the divisor, then check by multiplying back: ' + q + ' × ' + b + ' = ' + a + '.', use: 'Splitting costs, per-share numbers and pot odds.' });
    },
    frac: function (lv) {
      var f = pick(lv < 3 ? [[1, 4], [3, 4], [1, 5], [2, 5], [1, 8], [3, 8]] : [[1, 3], [2, 3], [1, 6], [5, 8], [7, 8], [1, 12], [3, 16]]), x = f[0] / f[1] * 100, unit = 100 / f[1];
      return done({ q: f[0] + '/' + f[1] + ' as a percent?', o: choices(x, [[100 - x, 'That’s the other part: ' + (f[1] - f[0]) + '/' + f[1] + '.'], [f[1] / f[0], 'You divided the wrong way round.'], [x / 10, 'Decimal slip: off by a factor of 10.']], function (v) { return r1(v) + '%'; }),
        steps: ['1) 1/' + f[1] + ' of 100% = ' + r1(unit) + '%.', '2) ' + f[0] + ' of those = ' + f[0] + ' × ' + r1(unit) + '% = ' + r1(x) + '%.'],
        trick: 'Learn the base ones by heart: 1/8 = 12.5%, 1/6 ≈ 16.7%, 1/3 ≈ 33.3%, 1/12 ≈ 8.3%. Everything else is a multiple.',
        use: 'Poker odds and win rates come as fractions (“1 in 4”); converting fast lets you compare them to the price.' });
    },
    tip: function (lv) {
      var bill = pick([42, 64, 86, 120, 148, 236]), p = pick([15, 18, 20]), t = bill * p / 100, ten = bill / 10;
      var steps = p === 20 ? ['1) 10% of ' + money(bill) + ' = ' + money(ten) + '.', '2) 20% = double: ' + money(ten * 2) + '.'] : p === 15 ? ['1) 10% = ' + money(ten) + '.', '2) 5% = half of that: ' + money(ten / 2) + '.', '3) 15% = ' + money(ten) + ' + ' + money(ten / 2) + ' = ' + money(t) + '.'] : ['1) 10% = ' + money(ten) + ', so 20% = ' + money(ten * 2) + '.', '2) 2% = ' + money(ten / 5) + '.', '3) 18% = 20% − 2% = ' + money(t) + '.'];
      return done({ q: p + '% tip on ' + money(bill) + '?', o: choices(t, [[ten, 'That’s only 10%.'], [t * 2, 'Twice too much: recheck the doubling step.'], [bill / p, 'You divided by ' + p + ' instead of taking ' + p + '%.']], money),
        steps: steps, trick: 'Everything starts from 10% (move the decimal), then double, halve or trim.', use: 'Everyday, and the exact same move as sizing a position or a stop.' });
    }
  };
  function makeQ(lv, last) {
    var pool = Math.random() < 0.55 ? STOCK : GEN, keys = Object.keys(pool).filter(function (k) { return k !== last; }), k = pick(keys), q = pool[k](lv);
    q.k = k; q.kind = pool === STOCK ? 'Stocks' : 'Sharpener'; return q;
  }

  function drill(opt) {
    opt = opt || {};
    App.screen('Quick Math', function (v) {
      var m = st(), n = 0, right = 0, fastN = 0, timedN = 0, last = null, t0 = 0;
      // which questions get a clock: about 4 of 10, never the first, never three in a row
      var plan = [], k; for (k = 0; k < ROUND; k++) plan.push(k > 0 && Math.random() < TIMED_SHARE && !(plan[k - 1] && plan[k - 2]));
      if (plan.filter(Boolean).length < 2) { plan[3] = true; plan[7] = true; }
      if (opt.allTimed) plan = plan.map(function (x, i) { return i > 0; });  // edge check: every question after the first is on the clock
      v.innerHTML = '<div class="row"><span class="pill acc">Level ' + m.lv + ' of ' + MAXLV + '</span>' + (m.best ? '<span class="pill">Best ' + m.best + ' / ' + ROUND + '</span>' : '') + '</div><p class="mute small">Ten quick ones: stock math you’ll use on every trade, mixed with everyday sharpeners. Some are timed (' + TARGET[m.lv] + ' s on the clock); the rest have no clock, so take your time. Level up by getting 9 of 10 right and beating most clocks.</p><div id="q"></div>';
      function ask() {
        if (n >= ROUND) return finish();
        var q = makeQ(m.lv, last), timed = plan[n]; last = q.k; if (timed) timedN++;
        $('#q', v).innerHTML = '<div class="panel"><span class="eyebrow">' + (n + 1) + ' / ' + ROUND + ' · ' + q.kind + (timed ? ' · <span style="color:var(--accent)">Beat the clock</span>' : '') + '</span><h2 style="font-size:20px;line-height:1.4">' + esc(q.q) + '</h2>' + (timed ? '<div style="height:4px;border-radius:2px;background:var(--line);overflow:hidden"><div id="bar" style="height:100%;width:100%;background:var(--accent);transition:width .25s linear"></div></div><p class="small mute mono" id="clk">' + TARGET[m.lv] + ' s</p>' : '') + '</div><div class="list">' + q.o.map(function (o, i) { return '<button class="btn opt" data-k="' + i + '" style="text-align:left;font-weight:600;font-variant-numeric:tabular-nums">' + esc(o.t) + '</button>'; }).join('') + App.idkBtn('k') + '</div><div id="fb"></div>';
        t0 = Date.now();
        var done = false, clk = null;
        if (timed) clk = setInterval(function () {
          var c = $('#clk', v), bar = $('#bar', v); if (!c || done) { clearInterval(clk); return; }
          var left = TARGET[m.lv] - (Date.now() - t0) / 1000;
          c.textContent = Math.max(0, Math.ceil(left)) + ' s'; if (bar) bar.style.width = Math.max(0, left / TARGET[m.lv] * 100) + '%';
          if (left <= 0) grade(null);
        }, 250);
        function grade(b) {
            if (done) return; done = true; clearInterval(clk);
            var secs = (Date.now() - t0) / 1000, out = !b, ok = !out && !!(q.o[+b.dataset.k] || {}).ok, fast = ok && timed;
            if (ok) right++; if (fast) fastN++;
            m.n++; if (ok) m.ok++; App.save();
            $$('[data-k]', v).forEach(function (x) { x.disabled = out; if ((q.o[+x.dataset.k] || {}).ok) x.classList.add('right'); else if (x === b) x.classList.add('wrong'); });
            var pickd = b && q.o[+b.dataset.k], mine = pickd && !pickd.ok && pickd.why ? '<br><b>Your answer (' + esc(pickd.t) + '):</b> ' + esc(pickd.why) : '';
            var right1 = q.o.filter(function (o) { return o.ok; })[0];
            $('#fb', v).innerHTML = App.coachHTML(ok ? (fast ? 'best' : 'right') : 'wrong', (out ? '<b>Time’s up.</b> ' : ok && timed ? 'Beat the clock · ' + secs.toFixed(1) + ' s. ' : '') + '<b>Answer: ' + esc(right1.t) + '</b>' + mine +
              '<br><b>How to work it out</b><br>' + q.steps.map(esc).join('<br>') + '<br><b>Shortcut:</b> ' + esc(q.trick) + '<br><span class="mute"><b>Where you’ll use it:</b> ' + esc(q.use) + '</span>') + '<button class="btn primary" id="nx" style="width:100%">Next</button>';
            $('#nx', v).onclick = function () { n++; ask(); };
        }
        $$('[data-k]', v).forEach(function (b) { b.onclick = function () { grade(b); }; });
      }
      function finish() {
        var old = m.lv;
        m.rounds++; m.best = Math.max(m.best || 0, right); m.fast = Math.max(m.fast || 0, fastN);
        if (right >= 9 && fastN >= Math.ceil(timedN * 0.6) && m.lv < MAXLV) m.lv++;
        else if (right <= 5 && m.lv > 1) m.lv--;
        App.save();
        var up = m.lv > old, down = m.lv < old;
        $('#q', v).innerHTML = App.coachHTML('info', '<b>' + right + ' / ' + ROUND + '</b> · beat the clock ' + fastN + ' of ' + timedN + '. ' + (up ? 'Level up: numbers get harder now.' : down ? 'Back to level ' + m.lv + ' to rebuild speed. Accuracy first, then speed.' : right >= 9 ? 'Sharp. Beat more of the clocks to level up.' : 'Read the steps on any you missed; once the method clicks, speed follows.')) +
          '<div class="btns"><button class="btn primary" id="ag">Another round</button><button class="btn" id="dn">Done</button></div>';
        if (up) App.celebrate('level');
        $('#ag', v).onclick = function () { App.checkpoint(function () { App.back(); drill(opt); }); };
        $('#dn', v).onclick = function () { App.checkpoint(App.back); };
      }
      ask();
    });
  }
  function summary() { var m = st(); return 'Level ' + m.lv + (m.best ? ' · best ' + m.best + '/' + ROUND : ' · stocks + mental math'); }
  return { drill: drill, summary: summary, makeQ: makeQ, st: st };
})();
