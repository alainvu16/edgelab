// ===================== MARKETS =====================
var MK = (function () {
  var $ = App.$, $$ = App.$$, esc = App.esc;
  // [topic, difficulty 1-5, question, options (first is correct), why]
  var Q = [
    // Basics
    ['Basics', 1, 'What is the bid-ask spread?', ['Gap between the highest buy price and lowest sell price', 'The daily price range', 'The broker’s commission', 'The difference between open and close'], 'Buyers bid, sellers ask. The gap is a hidden cost every time you trade, wider in thinly traded stocks.'],
    ['Basics', 1, 'A stock is “liquid” when…', ['Lots of shares trade with tight spreads', 'It pays a dividend', 'It is cheap per share', 'It is in an index'], 'Liquidity means you can get in and out fast without moving the price. Big caps like AAPL are very liquid.'],
    ['Basics', 1, 'Market cap equals…', ['Share price × shares outstanding', 'Revenue × 10', 'Assets minus debt', 'Daily volume × price'], 'Market cap is what the market values the whole company at.'],
    ['Basics', 1, 'What does an ETF like XLK hold?', ['A basket of stocks in one sector', 'One company', 'Only bonds', 'Cash'], 'Sector ETFs hold a basket. XLK is technology. They’re the building blocks of sector rotation.'],
    ['Basics', 2, 'What does “short selling” mean?', ['Selling borrowed shares, hoping to buy back lower', 'Selling quickly', 'Selling half your position', 'Selling before earnings'], 'You profit if price falls. Risk is theoretically unlimited because price can rise forever.'],
    ['Basics', 2, 'Why do index funds beat most active managers long-term?', ['Low costs and no stock-picking errors', 'They pick better stocks', 'They trade more', 'They use leverage'], 'Fees compound. Most managers underperform their benchmark after costs over 10+ years.'],
    ['Basics', 2, 'A stock splits 2-for-1. Your 100 shares at $200 become…', ['200 shares at $100', '100 shares at $400', '200 shares at $200', '50 shares at $400'], 'Splits change the slice size, not the pie. Your total value stays $20,000.'],
    ['Basics', 3, 'Pre-market and after-hours trading usually have…', ['Lower volume and wider spreads', 'Higher volume', 'No risk', 'Guaranteed fills'], 'Fewer participants means bigger spreads and jumpier prices. Limit orders are a must.'],
    // Orders
    ['Orders', 1, 'A market order…', ['Fills right away at the best available price', 'Fills only at your price', 'Waits until close', 'Can’t be cancelled'], 'Speed over price. Fine for liquid stocks, dangerous in thin ones.'],
    ['Orders', 1, 'A limit buy order at $50 fills…', ['Only at $50 or lower', 'Only at $50 or higher', 'At any price', 'At the close'], 'Limits control price, but you might not get filled.'],
    ['Orders', 2, 'A stop-loss sell at $45 on a $50 stock…', ['Becomes a market sell if price hits $45', 'Sells at exactly $45 guaranteed', 'Buys at $45', 'Sells immediately'], 'Once triggered it’s a market order. On a gap down you can get filled well below $45.'],
    ['Orders', 3, 'Main risk of a stop-limit order?', ['Price can gap past it and never fill', 'It always slips', 'It costs more', 'It triggers early'], 'If price jumps past your limit, you stay in a falling position. That’s the trade-off for price control.'],
    ['Orders', 3, 'A trailing stop of 10%…', ['Follows price up and sells if it drops 10% from the high', 'Sells after a 10% gain', 'Buys after a 10% drop', 'Never moves'], 'It locks in gains in trends. Choose the % from the stock’s normal volatility so noise doesn’t stop you out.'],
    ['Orders', 4, 'Slippage is…', ['The difference between expected and actual fill price', 'A broker fee', 'A tax', 'The spread on options only'], 'Slippage hits hardest in fast markets and small caps. Backtests that ignore it look too good.'],
    // Risk
    ['Risk', 1, 'The “1% rule” means…', ['Risk at most 1% of your account per trade', 'Buy 1% of a company', 'Aim for 1% gains', 'Keep 1% in cash'], 'If your stop is hit you lose 1%. Even 10 losers in a row only cost about 10%.'],
    ['Risk', 2, 'Account $50,000, risk 1%, entry $100, stop $95. Position size?', ['100 shares', '500 shares', '50 shares', '1,000 shares'], 'Risk = $500. Risk per share = $5. $500 ÷ $5 = 100 shares. Size from the stop, not from a gut feeling.'],
    ['Risk', 2, 'You lose 50%. What gain gets you back to even?', ['100%', '50%', '75%', '25%'], 'From $100 to $50 you need to double. Losses hurt more than gains help, so cutting losers early matters.'],
    ['Risk', 2, 'Risk/reward of 1:3 means…', ['You risk $1 to make $3', 'You win 3 of 4 trades', 'You trade 3 times a day', 'You use 3x leverage'], 'At 1:3 you only need to win 25%+ of trades to break even.'],
    ['Risk', 3, 'Win rate 40%, average win 2R, average loss 1R. Expectancy per trade?', ['+0.2R', '-0.2R', '+0.8R', '0R'], '0.4 × 2 − 0.6 × 1 = 0.8 − 0.6 = +0.2R per trade. Positive expectancy is what makes a system worth running.'],
    ['Risk', 3, 'Why is diversifying across 10 tech stocks weak diversification?', ['They tend to move together', 'Too many stocks', 'Tech pays no dividends', 'Fees are too high'], 'Correlation matters more than count. Spread across sectors or assets that don’t move in lockstep.'],
    ['Risk', 3, 'Max drawdown is…', ['The biggest peak-to-trough drop in account value', 'Your largest single loss', 'Your average loss', 'The worst day of the market'], 'It tells you the pain you must sit through. Many traders quit a good system during a drawdown.'],
    ['Risk', 4, 'Using 3x leverage on an index that drops 34%…', ['Can wipe you out', 'Loses 34%', 'Loses 11%', 'Is protected by the broker'], '3 × 34% ≈ 100%. Leverage multiplies losses as fast as gains.'],
    ['Risk', 4, 'Kelly criterion tells you…', ['The bet size that maximizes long-run growth given your edge', 'When to sell', 'Which stocks to pick', 'Your tax rate'], 'Full Kelly is very volatile. Most pros bet a fraction (like half Kelly).'],
    ['Risk', 5, 'Why do backtests usually overstate real results?', ['Overfitting, ignored costs and survivorship bias', 'Computers are wrong', 'Markets are random', 'Taxes'], 'Tuning to past data, skipping slippage and only testing stocks that still exist all make results look better than reality.'],
    // Charts
    ['Charts', 1, 'An uptrend is a series of…', ['Higher highs and higher lows', 'Lower highs and lower lows', 'Equal highs', 'Gaps up'], 'Trend structure is the first thing to read on any chart.'],
    ['Charts', 1, 'Support is a price level where…', ['Buyers have stepped in before', 'Sellers always win', 'The stock always reverses', 'Volume is zero'], 'Support often holds because traders remember the level. When it breaks, it often becomes resistance.'],
    ['Charts', 2, 'A breakout on high volume is generally…', ['More reliable than on low volume', 'Less reliable', 'Meaningless', 'A sell signal'], 'Volume shows conviction. Low-volume breakouts fail more often.'],
    ['Charts', 2, 'The 200-day moving average is often used to…', ['Judge the long-term trend', 'Time intraday entries', 'Measure volume', 'Value a company'], 'Above the 200-day = long-term uptrend for many traders and funds.'],
    ['Charts', 2, 'A “golden cross” is when…', ['The 50-day MA crosses above the 200-day', 'Price hits all-time highs', 'Gold rallies', 'RSI hits 50'], 'A slow trend signal. It lags, but it keeps you on the right side of big moves.'],
    ['Charts', 3, 'RSI above 70 suggests…', ['Overbought, but strong trends can stay there', 'Always sell', 'Oversold', 'Low volume'], 'In strong momentum stocks RSI can live above 70. It’s a warning, not a sell button.'],
    ['Charts', 3, 'A long lower wick on a daily candle shows…', ['Sellers pushed price down but buyers drove it back up', 'Heavy selling into the close', 'A gap', 'No trading'], 'Rejection of lower prices. More meaningful at support.'],
    ['Charts', 3, 'Support broke and price came back up to it. What’s that level likely to act as?', ['Resistance', 'Support', 'Nothing', 'A gap'], 'Old support often becomes new resistance (“role reversal”).'],
    ['Charts', 4, 'ATR (Average True Range) is best used for…', ['Sizing stops to the stock’s normal volatility', 'Finding the trend', 'Valuation', 'Predicting earnings'], 'A stop at 2× ATR adapts to how much a stock normally moves, so noise doesn’t shake you out.'],
    ['Charts', 4, 'Bearish divergence is…', ['Price makes a higher high while RSI makes a lower high', 'Price and RSI both rise', 'Price falls on low volume', 'A gap down'], 'Momentum is fading under the surface. Confirm with price before acting.'],
    // Momentum & rotation
    ['Momentum', 1, 'Momentum investing is based on…', ['Winners tend to keep winning for a while', 'Buying the biggest losers', 'Buying only dividends', 'Random picks'], 'One of the most studied effects in markets: recent 3–12 month winners tend to keep outperforming for a time.'],
    ['Momentum', 2, 'Classic momentum lookback?', ['Past 12 months, skipping the most recent month', 'Past 1 day', 'Past 10 years', 'Next quarter'], 'The “12-1” measure. Skipping the last month avoids short-term reversal noise.'],
    ['Momentum', 2, 'Sector rotation means…', ['Moving money into the sectors leading the market', 'Owning every sector equally forever', 'Trading only tech', 'Rotating brokers'], 'Money flows between sectors as the economy changes. Rotation strategies ride the leaders and drop the laggards.'],
    ['Momentum', 3, 'Early in an economic recovery, which sectors often lead?', ['Financials, industrials, consumer discretionary', 'Utilities and staples', 'Only healthcare', 'Gold miners'], 'Cyclical sectors gain most as growth picks up. Defensives tend to lead late in the cycle and in recessions.'],
    ['Momentum', 3, 'Biggest known risk of momentum strategies?', ['Sharp “momentum crashes” when leadership flips', 'Too few trades', 'Dividends', 'Low volatility'], 'When the market snaps back from a bottom, last year’s losers can surge and momentum gets hit hard. Risk controls matter.'],
    ['Momentum', 3, 'Relative strength compares…', ['A stock or sector’s performance to a benchmark', 'RSI to 50', 'Price to earnings', 'Volume to average'], 'XLK vs SPY rising = tech is leading. Rotation models rank sectors by relative strength.'],
    ['Momentum', 4, 'Why add a trend filter (e.g., price above 200-day) to a rotation system?', ['To step aside in bear markets', 'To trade more', 'To avoid taxes', 'To increase leverage'], 'Even the “best” sector can fall in a bear market. A filter moves you to cash or bonds when everything is weak.'],
    ['Momentum', 4, 'Rebalancing a rotation strategy monthly vs daily mainly trades off…', ['Responsiveness vs costs and whipsaw', 'Taxes vs dividends', 'Nothing', 'Leverage vs cash'], 'Daily reacts fast but churns. Monthly is cheaper and smoother but slower to exit.'],
    ['Momentum', 5, 'Volatility-adjusted momentum ranks assets by…', ['Return divided by volatility', 'Return only', 'Volume', 'Price level'], 'It favors steady climbers over jumpy ones, often with smoother results.'],
    // Macro
    ['Macro', 1, 'When the Fed raises interest rates, bond prices usually…', ['Fall', 'Rise', 'Stay the same', 'Double'], 'New bonds pay more, so existing lower-yield bonds lose value.'],
    ['Macro', 2, 'CPI measures…', ['Changes in consumer prices (inflation)', 'Company profits', 'Unemployment', 'Stock prices'], 'Hot CPI prints can push yields up and growth stocks down.'],
    ['Macro', 2, 'Higher rates tend to hurt which stocks most?', ['Long-duration growth stocks', 'Banks', 'Energy', 'Cash'], 'Growth stock value sits far in the future. Higher rates shrink what future cash is worth today.'],
    ['Macro', 3, 'An inverted yield curve (2-year above 10-year) has historically…', ['Preceded many recessions', 'Meant stocks always rise', 'Meant nothing', 'Caused inflation'], 'It signals the market expects rate cuts and slower growth ahead. Timing is unreliable.'],
    ['Macro', 3, 'The VIX measures…', ['Expected 30-day S&P 500 volatility from options', 'Trading volume', 'Interest rates', 'Inflation'], 'High VIX = fear and big swings. It tends to spike when stocks fall.'],
    ['Macro', 4, 'A strong US dollar usually hurts…', ['US multinationals’ overseas earnings', 'Importers', 'US tourists abroad', 'Nobody'], 'Foreign revenue converts into fewer dollars, and US exports get pricier.'],
    // Options
    ['Options', 2, 'A call option gives you…', ['The right to buy at the strike price', 'The obligation to buy', 'The right to sell', 'A dividend'], 'Buyers have rights, sellers have obligations. Max loss for a call buyer is the premium.'],
    ['Options', 2, 'A put option gains value when the stock…', ['Falls', 'Rises', 'Pays a dividend', 'Splits'], 'Puts are like insurance against a drop.'],
    ['Options', 3, 'Theta is…', ['Time decay: options lose value as expiration nears', 'Sensitivity to price', 'Sensitivity to volatility', 'Interest rate sensitivity'], 'Time works against option buyers and for sellers.'],
    ['Options', 3, 'Delta of 0.50 means the option moves about…', ['$0.50 for each $1 the stock moves', '$5 per $1', '50% per day', 'Nothing'], 'At-the-money options sit near 0.50 delta.'],
    ['Options', 4, 'IV crush after earnings means…', ['Option prices drop as uncertainty disappears', 'The stock always falls', 'Volume dies', 'Delta goes to 1'], 'You can be right on direction and still lose if implied volatility collapses.'],
    ['Options', 4, 'Covered call trade-off?', ['Extra income, but capped upside', 'Unlimited upside', 'No risk', 'Guaranteed profit'], 'You sell someone your upside above the strike in exchange for the premium.'],
    // Fundamentals
    ['Valuation', 2, 'P/E ratio is…', ['Price divided by earnings per share', 'Profit divided by expenses', 'Price times earnings', 'Equity per share'], 'How many dollars you pay for $1 of yearly profit. Compare within a sector.'],
    ['Valuation', 3, 'Free cash flow is…', ['Operating cash flow minus capital spending', 'Net income', 'Revenue minus cost of goods', 'Dividends paid'], 'Cash the business actually generates after keeping itself running. Harder to fake than earnings.'],
    ['Valuation', 3, 'A stock drops after beating earnings. Most likely reason?', ['Guidance or expectations disappointed', 'A data error', 'The market is rigged', 'Dividends'], 'Price reacts to surprises vs expectations, and to forward guidance more than the past quarter.'],
    ['Valuation', 4, 'PEG ratio adjusts P/E for…', ['Expected earnings growth', 'Debt', 'Dividends', 'Volatility'], 'P/E ÷ growth rate. Around 1 is often called fair, but estimates can be wrong.'],
    // Psychology
    ['Psychology', 1, 'Revenge trading is…', ['Trading bigger or faster to win back a loss', 'Shorting a stock you hate', 'Copying a friend', 'Holding long term'], 'It’s tilt, just like in poker. Step away after a big loss.'],
    ['Psychology', 2, 'Why keep a trading journal?', ['To find patterns in your mistakes', 'For taxes only', 'Brokers require it', 'It’s not useful'], 'You can’t fix what you don’t measure. Note setup, reason, emotion and result.'],
    ['Psychology', 2, 'Loss aversion makes traders…', ['Hold losers too long and sell winners too early', 'Cut losses fast', 'Buy only winners', 'Trade less'], 'The pain of a loss feels about twice the pleasure of a gain. Rules beat feelings.'],
    ['Psychology', 3, 'FOMO buying after a huge run usually means…', ['Buying late with a poor risk/reward', 'Getting the best entry', 'Lower risk', 'Guaranteed profits'], 'Chasing puts your stop far away or nowhere. Wait for a setup or a pullback.'],
    ['Psychology', 3, 'A system has a 55% win rate. Five losses in a row is…', ['Normal and will happen over time', 'Proof the system is broken', 'Impossible', 'A reason to double size'], 'Streaks are normal in randomness. Judge a system over many trades, not five.'],
    ['Psychology', 4, 'Best response when your automated system hits a rule-based drawdown limit?', ['Pause and review per your plan', 'Double the position size', 'Turn off the stops', 'Switch strategies immediately'], 'Pre-planned limits protect you from emotional decisions in the moment.'],
    ['Basics', 3, 'What does “float” mean for a stock?', ['Shares available for public trading', 'Total shares ever issued', 'The daily range', 'Short interest'], 'Low-float stocks can move violently because few shares change hands.'],
    ['Basics', 4, 'High short interest plus rising price can trigger…', ['A short squeeze', 'A dividend cut', 'A stock split', 'Delisting'], 'Shorts are forced to buy back, which pushes price even higher.'],
    ['Orders', 4, 'Why do many traders avoid market orders at the open?', ['Spreads and volatility are widest then', 'Markets are closed', 'They are illegal', 'Fees are higher'], 'The first minutes are chaotic. Limit orders or waiting a few minutes avoid ugly fills.'],
    ['Orders', 5, 'A VWAP execution algorithm aims to…', ['Trade at the volume-weighted average price over a period', 'Buy at the low of the day', 'Hide your order completely', 'Avoid all slippage'], 'Big funds use VWAP to blend in with normal volume instead of moving the price.'],
    ['Risk', 5, 'Two strategies have the same return; A has half the volatility of B. A has the higher…', ['Sharpe ratio', 'Drawdown', 'Beta', 'Turnover'], 'Sharpe = excess return ÷ volatility. Same return with less risk = better Sharpe.'],
    ['Risk', 5, 'Why can correlations be dangerous in a crash?', ['They tend to jump toward 1, so diversification fails when needed most', 'They drop to zero', 'They become negative', 'They stop mattering'], 'In panics, investors sell everything. Plan for assets moving together.'],
    ['Risk', 4, 'Beta of 1.5 means the stock historically moved…', ['About 1.5× the market’s moves', '1.5% per day', '50% less than the market', 'Opposite the market'], 'High-beta stocks amplify market swings in both directions.'],
    ['Charts', 5, 'Why can a pattern that worked in backtests stop working live?', ['Too many traders exploit it or market regime changed', 'Charts are fake', 'Brokers block it', 'Volume is always wrong'], 'Edges decay when crowded and depend on the market environment. Keep monitoring live results.'],
    ['Charts', 4, 'Price gaps up above resistance and holds all day. This suggests…', ['Strong demand; the old resistance may now be support', 'A guaranteed reversal', 'Weak buyers', 'Low volatility'], 'Gaps that hold show urgency. Gaps that fill quickly show the move was weak.'],
    ['Momentum', 5, 'Dual momentum combines…', ['Relative momentum (pick the strongest) and absolute momentum (is it beating cash?)', 'Two moving averages', 'Two brokers', 'Two time frames of RSI'], 'Pick the leader, but only hold it if it beats T-bills. Otherwise move to safety.'],
    ['Momentum', 4, 'Late in an economic cycle with high inflation, which sectors often lead?', ['Energy and materials', 'Technology only', 'Homebuilders', 'Small-cap growth'], 'Commodity producers benefit from rising prices. Rotation models catch this shift through relative strength.'],
    ['Momentum', 5, 'Why skip the most recent month in a 12-month momentum signal?', ['Short-term returns tend to reverse', 'Data is late', 'Taxes', 'Dividends distort it'], 'Over 1 month, prices often mean-revert. Over 3–12 months they trend.'],
    ['Macro', 4, 'Quantitative tightening (QT) means the central bank…', ['Shrinks its balance sheet, draining liquidity', 'Prints money', 'Cuts rates to zero', 'Buys stocks'], 'Less liquidity tends to pressure risky assets over time.'],
    ['Macro', 5, 'Real yield equals…', ['Nominal yield minus expected inflation', 'Dividend yield plus growth', 'The 10-year minus the 2-year', 'Yield after taxes'], 'Rising real yields have historically weighed on gold and high-growth stocks.'],
    ['Options', 5, 'Selling naked puts is economically similar to…', ['Buying stock with a limit order, with capped upside', 'Buying a call', 'Shorting stock', 'Holding cash'], 'You collect premium and may have to buy the stock at the strike. Big downside if the stock collapses.'],
    ['Options', 5, 'Gamma is highest for options that are…', ['At the money and close to expiration', 'Deep in the money with a year left', 'Far out of the money', 'Already expired'], 'High gamma means delta changes fast, so these options swing wildly.'],
    ['Valuation', 5, 'A DCF valuation is most sensitive to…', ['Discount rate and terminal growth assumptions', 'Last quarter’s revenue', 'The share price', 'Number of employees'], 'Small changes in long-term assumptions swing the value massively. Treat it as a range, not a number.'],
    ['Valuation', 4, 'EV/EBITDA is useful because it…', ['Compares companies regardless of how they’re financed', 'Ignores all costs', 'Measures dividends', 'Uses the share price only'], 'Enterprise value includes debt, so leveraged and debt-free companies compare fairly.'],
    ['Psychology', 5, 'Process vs outcome: a good trade is one that…', ['Followed your edge and risk plan, win or lose', 'Made money', 'Was large', 'Felt right'], 'Like poker, judge decisions, not single results. Good process wins over hundreds of trades.'],
    ['Psychology', 4, 'Confirmation bias in trading looks like…', ['Only reading news that supports your position', 'Using stops', 'Keeping a journal', 'Sizing small'], 'Actively look for the case against your trade. It saves you from big losses.']
  ];
  (App.X().mktQuestions || []).forEach(function (q) { Q.push(q); });
  if (typeof applyDistract === 'function') applyDistract(Q, 2, 3);
  var TOPICS = ['Basics', 'Orders', 'Risk', 'Charts', 'Momentum', 'Macro', 'Options', 'Valuation', 'Psychology'];
  Q.forEach(function (q) { if (TOPICS.indexOf(q[0]) < 0) TOPICS.push(q[0]); });
  var TITLES = ['Rookie', 'Intern', 'Analyst', 'Associate', 'Trader', 'Senior trader', 'Portfolio manager', 'Head of desk', 'Market wizard'];

  function st() {
    var m = App.S.mkt;
    if (m.level == null) { m.level = 1; m.xp = 0; m.topic = {}; m.q = {}; m.best = 0; m.day = ''; m.today = 0; m.goal = 15; m.simR = 0; m.simN = 0; m.sim = 1; m.answered = 0; m.correct = 0; }
    var d = new Date().toDateString(); if (m.day !== d) { m.day = d; m.today = 0; }
    return m;
  }
  function xpFor(lv) { return 60 * lv * lv; }
  function topicSkill(t) { var m = st(); return m.topic[t] || 1; } // 1..5
  var recentQ = []; // the last questions shown, never repeated back-to-back even when the pool is small
  function pickQ() {
    var m = st(), cap = Math.min(5, 1 + Math.floor((m.level - 1) / 1.5));
    var fresh = function (i) { return recentQ.indexOf(i) < 0; };
    var due = Q.map(function (q, i) { return i; }).filter(function (i) {
      var r = m.q[i]; var q = Q[i];
      if (!fresh(i)) return false;
      if (q[1] > Math.min(cap, topicSkill(q[0]) + 1)) return false;
      if (!r) return true;
      return r.box < 4 && (m.answered - r.at) >= [3, 4, 8, 15][r.box];
    });
    // too few due (e.g. after several misses in a row): widen to anything at your level you haven't just seen
    if (due.length < 4) due = due.concat(Q.map(function (q, i) { return i; }).filter(function (i) { return fresh(i) && due.indexOf(i) < 0 && Q[i][1] <= Math.max(2, cap) && !(m.q[i] && m.answered - m.q[i].at < 4); }));
    if (!due.length) due = Q.map(function (q, i) { return i; }).filter(function (i) { return fresh(i) && Q[i][1] <= Math.max(2, cap); });
    // prefer missed ones (once they're due), then weakest topics, then new
    due.sort(function (a, b) {
      var ra = m.q[a], rb = m.q[b];
      var sa = (ra && ra.box === 0 ? -3 : 0) + topicSkill(Q[a][0]) + (ra ? 1 : 0) + Math.random() * 1.5;
      var sb = (rb && rb.box === 0 ? -3 : 0) + topicSkill(Q[b][0]) + (rb ? 1 : 0) + Math.random() * 1.5;
      return sa - sb;
    });
    var pick = due[0];
    recentQ.push(pick); if (recentQ.length > 8) recentQ.shift();
    return pick;
  }
  function record(i, ok, combo) {
    var m = st(), q = Q[i];
    m.answered++; m.today++; if (ok) m.correct++; App.S.session.sinceBreak = 0;
    var r = m.q[i] || { box: 0, at: 0 };
    r.box = ok ? Math.min(4, r.box + 1) : 0; r.at = m.answered; if (!ok) r.miss = (r.miss || 0) + 1; m.q[i] = r;
    var t = m.topic[q[0]] || 1;
    m.topic[q[0]] = Math.max(1, Math.min(5, t + (ok ? (q[1] >= t ? .34 : .15) : -.25)));
    var gain = ok ? (10 + 5 * q[1]) * (1 + Math.min(4, combo) * .25) : 0;
    m.xp += Math.round(gain);
    var up = false;
    while (m.xp >= xpFor(m.level)) { m.level++; up = true; }
    if (up) App.celebrate('level');
    App.save();
    return { gain: Math.round(gain), up: up };
  }
  function titleOf(lv) { return TITLES[Math.min(TITLES.length - 1, lv - 1)]; }

  // ---------- question runner ----------
  function runQuiz(container, count, onDone, opts) {
    opts = opts || {};
    var n = 0, combo = 0, right = 0, rapid = !!opts.rapid, timer = null;
    function ask() {
      clearInterval(timer);
      if (count && n >= count) return onDone(right, n);
      var m = st(), i = pickQ(), q = Q[i];
      var order = [0, 1, 2, 3].sort(function () { return Math.random() - .5; });
      // A question you missed before comes back in a different shape (a true/false check of one answer),
      // so you have to know the idea, not remember which button was right.
      var rec = m.q[i], tf = !rapid && rec && rec.miss && rec.box < 2 && Math.random() < 0.6;
      var cand = tf ? (Math.random() < 0.5 ? 0 : 1 + Math.floor(Math.random() * (q[3].length - 1))) : 0;
      var lvPct = Math.round(100 * (m.xp - xpFor(m.level - 1)) / (xpFor(m.level) - xpFor(m.level - 1)));
      container.innerHTML = '<div class="row"><span class="pill acc">' + q[0] + '</span><span class="pill">' + '●'.repeat(q[1]) + '<span class="mute">' + '●'.repeat(5 - q[1]) + '</span></span><span class="grow"></span>' + (combo >= 2 ? '<span class="pill good">×' + (1 + Math.min(4, combo) * .25).toFixed(2) + ' combo</span>' : '') + (rapid ? '<span class="mono small" id="rt"></span>' : '') + '</div>' +
        '<div class="bar"><i style="width:' + Math.max(0, Math.min(100, lvPct)) + '%"></i></div>' +
        '<h2>' + esc(q[2]) + '</h2>' + (tf
          ? '<div class="panel" style="gap:6px"><span class="eyebrow">Second look · is this answer right?</span><p style="font-size:16px">' + esc(q[3][cand]) + '</p></div><div class="list"><button class="btn opt" data-k="' + (cand === 0 ? 0 : 1) + '">Yes, that’s right</button><button class="btn opt" data-k="' + (cand === 0 ? 1 : 0) + '">No, that’s wrong</button>' + App.idkBtn('k') + '</div>'
          : '<div class="list">' + order.map(function (k) { return '<button class="btn opt" data-k="' + k + '">' + esc(q[3][k]) + '</button>'; }).join('') + App.idkBtn('k') + '</div>') + '<div id="fb"></div>' +
        (count ? '<p class="small mute">' + (n + 1) + ' of ' + count + '</p>' : '');
      var answered = false;
      function answer(k, btn) {
        if (answered) return; answered = true; clearInterval(timer);
        var ok = k === 0;
        combo = ok ? combo + 1 : 0; if (ok) right++;
        var res = record(i, ok, combo);
        $$('[data-k]', container).forEach(function (b) { if (+b.dataset.k === 0) b.classList.add('right'); else if (b === btn) b.classList.add('wrong'); });
        var m2 = st();
        if (rapid && combo > m2.best) { m2.best = combo; App.save(); }
        $('#fb', container).innerHTML = App.coachHTML(ok ? 'right' : 'wrong', (tf ? '<b>The right answer:</b> ' + esc(q[3][0]) + '<br>' : '') + esc(q[4]), ok ? '<span class="mono small">+' + res.gain + ' XP</span>' : '<span class="small mute">It’ll come back after a few other questions.</span>') +
          (res.up ? App.coachHTML('info', '<b>Promoted to ' + titleOf(m2.level) + '!</b> Level ' + m2.level + '. Harder questions are now in rotation.') + WZ.card('level', true) : '') +
          (m2.today === m2.goal ? App.coachHTML('info', '<b>Daily goal hit: ' + m2.goal + ' questions.</b> Keep going or bank it.') : '') +
          '<button class="btn primary" id="nq" style="width:100%">' + (count && n + 1 >= count ? 'Finish' : 'Next') + '</button>';
        $('#nq', container).onclick = function () { n++; if (!count && !rapid && n % 10 === 0) App.checkpoint(ask); else ask(); };
        $('#nq', container).scrollIntoView({ block: 'nearest' });
      }
      $$('[data-k]', container).forEach(function (b) { b.onclick = function () { answer(+b.dataset.k, b); }; });
      if (rapid) {
        var left = Math.max(6, 15 - Math.floor(combo / 3));
        var el = $('#rt', container); el.textContent = left + 's';
        timer = setInterval(function () { left--; if (el) el.textContent = left + 's'; if (left <= 0) { clearInterval(timer); answer(-1, null); } }, 1000);
      }
    }
    ask();
  }

  // ---------- chart simulator ----------
  function genChart(kind) {
    var p = 100, out = [], vol = 1.2, drift = 0;
    var regimes = {
      up: [0.35, 0.25], down: [-0.35, -0.25], breakout: [0, 0.6], fail: [0, -0.5], range: [0, 0], pullback: [0.4, 0.35]
    }[kind];
    for (var i = 0; i < 60; i++) {
      drift = i < 40 ? regimes[0] : regimes[1];
      if (kind === 'range' || kind === 'breakout' || kind === 'fail') { if (i < 40) drift = (100 - p) * 0.15; }
      if (kind === 'pullback' && i >= 30 && i < 40) drift = -0.45;
      var o = p, c = p + drift + (Math.random() - .5) * vol * 2;
      if (kind === 'breakout' && i === 40) c = p + 3;
      if (kind === 'fail' && i === 40) c = p + 2.5;
      var h = Math.max(o, c) + Math.random() * vol, l = Math.min(o, c) - Math.random() * vol;
      out.push({ o: o, h: h, l: l, c: c, v: (kind === 'breakout' && i === 40 ? 3 : kind === 'fail' && i === 40 ? 0.8 : 1) * (0.7 + Math.random() * .6) });
      p = c;
    }
    return out;
  }
  function chartSVG(bars, upto, entryIdx) {
    var w = 360, h = 180, vis = bars.slice(0, upto);
    var hi = Math.max.apply(null, bars.map(function (b) { return b.h; })), lo = Math.min.apply(null, bars.map(function (b) { return b.l; }));
    var pad = (hi - lo) * .08; hi += pad; lo -= pad;
    var y = function (p) { return 6 + (h - 40) * (hi - p) / (hi - lo); }, bw = w / bars.length;
    var maxV = Math.max.apply(null, bars.map(function (b) { return b.v; }));
    var s = '<svg class="chart" viewBox="0 0 ' + w + ' ' + h + '" role="img" aria-label="Simulated price chart">';
    for (var g = 0; g < 4; g++) s += '<line class="g" x1="0" x2="' + w + '" y1="' + (6 + g * (h - 40) / 3) + '" y2="' + (6 + g * (h - 40) / 3) + '" stroke-width="1"/>';
    // 20-bar moving average
    var pts = [];
    vis.forEach(function (b, i) { if (i >= 19) { var a = 0; for (var k = i - 19; k <= i; k++) a += bars[k].c; pts.push((i * bw + bw / 2).toFixed(1) + ',' + y(a / 20).toFixed(1)); } });
    vis.forEach(function (b, i) {
      var x = i * bw + bw / 2, upc = b.c >= b.o, col = upc ? 'var(--good)' : 'var(--bad)';
      s += '<line x1="' + x + '" x2="' + x + '" y1="' + y(b.h) + '" y2="' + y(b.l) + '" stroke="' + col + '" stroke-width="1"/>';
      s += '<rect x="' + (x - bw * .32) + '" y="' + y(Math.max(b.o, b.c)) + '" width="' + (bw * .64) + '" height="' + Math.max(1, Math.abs(y(b.o) - y(b.c))) + '" fill="' + col + '"/>';
      s += '<rect x="' + (x - bw * .32) + '" y="' + (h - 4 - 26 * b.v / maxV) + '" width="' + (bw * .64) + '" height="' + (26 * b.v / maxV) + '" fill="var(--mute)" opacity=".45"/>';
    });
    if (pts.length > 1) s += '<polyline points="' + pts.join(' ') + '" fill="none" stroke="var(--accent)" stroke-width="1.6"/>';
    if (entryIdx != null) { var ex = entryIdx * bw + bw / 2; s += '<line x1="' + ex + '" x2="' + ex + '" y1="0" y2="' + (h - 30) + '" stroke="var(--fg)" stroke-dasharray="3 3" stroke-width="1"/>'; }
    return s + '</svg>';
  }
  var SIM = {
    up: ['Long', 'Steady higher highs and higher lows above a rising average. Trend-following says stay with it until structure breaks.'],
    down: ['Short', 'Lower highs and lower lows under a falling average. The path of least resistance is down. Flat is also fine if you can’t short.'],
    breakout: ['Long', 'Price broke out of a tight range on a big volume spike. High-volume breakouts tend to follow through.'],
    fail: ['Flat', 'The breakout came on weak volume. Weak-volume breakouts often fail and fall back into the range. Waiting was the smart play.'],
    range: ['Flat', 'Sideways chop around the average with no trend. Without an edge, standing aside saves you from whipsaw.'],
    pullback: ['Long', 'An uptrend pulled back toward its average and turned up again. Buying pullbacks in uptrends gives a nearby stop and good risk/reward.']
  };
  function simScreen() {
    App.screen('Chart practice', function (v) {
      var m = st();
      var kinds = m.sim < 3 ? ['up', 'down', 'range'] : ['up', 'down', 'range', 'breakout', 'fail', 'pullback'];
      var kind = kinds[Math.floor(Math.random() * kinds.length)];
      var bars = genChart(kind);
      v.innerHTML = '<div class="row"><span class="pill acc">Simulated prices</span><span class="pill">Sim level ' + m.sim + '</span><span class="grow"></span><span class="mono small">Total ' + (m.simR >= 0 ? '+' : '') + m.simR.toFixed(1) + 'R</span></div>' +
        '<p class="mute small">Read the chart: candles, 20-bar average (gold) and volume. Then take a position. Risk is 1R; the next 20 bars decide the result.</p>' +
        '<div class="panel" id="ch">' + chartSVG(bars, 40) + '</div><div class="btns" id="bt"><button class="btn" data-d="Long">Long ↑</button><button class="btn" data-d="Flat">Stay flat</button><button class="btn" data-d="Short">Short ↓</button></div><div id="fb"></div>';
      $$('[data-d]', v).forEach(function (b) {
        b.onclick = function () {
          var d = b.dataset.d, entry = bars[39].c, exit = bars[59].c;
          var risk = 0; for (var i = 30; i < 40; i++) risk += bars[i].h - bars[i].l; risk = Math.max(1, risk / 10 * 1.5);
          var moveR = (exit - entry) / risk, r = d === 'Long' ? moveR : d === 'Short' ? -moveR : 0;
          r = Math.max(-1, Math.min(4, r)); // stop caps the loss at 1R
          var m2 = st(); m2.simR += r; m2.simN++;
          var right = d === SIM[kind][0];
          if (right) m2.sim = Math.min(5, m2.sim + .5); else m2.sim = Math.max(1, m2.sim - .25);
          m2.xp += right ? 25 : 5; App.save();
          $('#ch', v).innerHTML = chartSVG(bars, 60, 39);
          $('#bt', v).innerHTML = '';
          $('#fb', v).innerHTML = App.coachHTML(right ? 'right' : 'wrong', 'You went <b>' + d + '</b>: ' + (r >= 0 ? '+' : '') + r.toFixed(1) + 'R. Best read: <b>' + SIM[kind][0] + '</b>. ' + SIM[kind][1] + (r < 0 && d !== 'Flat' ? ' Your stop kept the loss to 1R or less. That’s the job of a stop.' : '')) +
            '<div class="btns"><button class="btn primary" id="ag">Next chart</button><button class="btn" id="dn">Done</button></div>';
          $('#ag').onclick = function () { App.checkpoint(function () { App.back(); simScreen(); }); };
          $('#dn').onclick = function () { App.back(); };
        };
      });
    });
  }

  // ---------- screens ----------
  function home() {
    App.root('Markets', function (v) {
      var m = st();
      var lvPct = Math.round(100 * (m.xp - xpFor(m.level - 1)) / (xpFor(m.level) - xpFor(m.level - 1)));
      var acc = m.answered ? Math.round(100 * m.correct / m.answered) : 0;
      var weakest = TOPICS.slice().sort(function (a, b) { return topicSkill(a) - topicSkill(b); });
      v.innerHTML = '<div><span class="eyebrow">Markets · level ' + m.level + '</span><h1>' + titleOf(m.level) + '</h1><p class="mute small">' + m.xp + ' XP · ' + (xpFor(m.level) - m.xp) + ' to ' + titleOf(m.level + 1) + '</p></div>' +
        '<div class="bar"><i style="width:' + Math.max(0, Math.min(100, lvPct)) + '%"></i></div>' + App.playNowBtn('mkt') +
        '<div class="panel"><div class="row"><h3 class="grow">Today: ' + m.today + ' / ' + m.goal + ' questions</h3>' + (m.today >= m.goal ? '<span class="pill good">Goal hit</span>' : '') + '</div><div class="bar"><i style="width:' + Math.min(100, m.today / m.goal * 100) + '%;background:var(--good)"></i></div></div>' +
        (function () { var r = report()[0]; return '<div class="coach ok"><div class="h"><span class="pill ok">Coach</span></div><p>' + r.text + '</p><button class="btn sm" id="repgo">' + r.action + ' ›</button></div>'; })() +
        '<div class="btns"><button class="btn" id="go">Keep learning</button><button class="btn" id="rp">Rapid fire</button><button class="btn" id="sm">Chart practice</button></div>' +
        (typeof TB !== 'undefined' ? '<button class="item" id="tbs" style="border-color:var(--accent)"><span class="grow"><span class="t">ToneBot School</span><br><span class="s">' + (TB.count() ? 'Learn your own bot: ' + TB.done() + ' of ' + TB.count() + ' lessons · Rotation Replay · beat its daily call' : 'Learn your own bot · private, loads from your GitHub backup') + '</span></span><span class="end">›</span></button>' : '') +
        '<div class="list"><button class="item" id="mo"><span class="grow"><span class="t">Momentum Lab</span><br><span class="s">Sector rotation course + replay on real data 2013–' + MKT_DATA.asof.slice(0, 4) + '</span></span><span class="end">›</span></button>' +
        '<button class="item" id="mc"><span class="grow"><span class="t">Macro Desk</span><br><span class="s">How world events reach prices · real episodes</span></span><span class="end">›</span></button>' +
        '<button class="item" id="tp"><span class="grow"><span class="t">Tape School</span><br><span class="s">What forces what, measured · read real months · research list</span></span><span class="end">›</span></button>' +
        '<button class="item" id="sl"><span class="grow"><span class="t">Strategy lab</span><br><span class="s">9 strategies with rules and real backtests</span></span><span class="end">›</span></button></div>' +
        '<div class="stats"><div class="stat"><span class="v">' + m.answered + '</span><span class="k">Answered</span></div><div class="stat"><span class="v">' + acc + '%</span><span class="k">Accuracy</span></div><div class="stat"><span class="v">' + m.best + '</span><span class="k">Best rapid streak</span></div><div class="stat"><span class="v">' + (m.simR >= 0 ? '+' : '') + m.simR.toFixed(1) + 'R</span><span class="k">Chart P&amp;L</span></div></div>' +
        '<h2>Skill by topic</h2><div class="list">' + TOPICS.map(function (t) {
          var s = topicSkill(t);
          return '<div class="row"><span style="width:96px" class="small">' + t + '</span><div class="bar grow"><i style="width:' + (s / 5 * 100) + '%"></i></div><span class="mono small mute" style="width:40px;text-align:right">' + s.toFixed(1) + '</span></div>';
        }).join('') + '</div>' +
        '<p class="small mute">Questions adapt: missed ones come back, weak topics show up more, and harder questions unlock as you rank up. Focus now: ' + weakest[0] + ' and ' + weakest[1] + '. Learning material, not investment advice.</p>';
      $('#go', v).onclick = function () { App.screen('Learning', function (vv) { runQuiz(vv, 0, function () {}); }); };
      App.wirePlayNow(v, 'mkt');
      $('#rp', v).onclick = rapid;
      $('#repgo', v).onclick = report()[0].go;
      $('#sm', v).onclick = simScreen;
      if (typeof TB !== 'undefined') $('#tbs', v).onclick = TB.home; $('#mo', v).onclick = MO.home; $('#mc', v).onclick = MC.home; $('#tp', v).onclick = TP.home; $('#sl', v).onclick = TP.strategies;
    });
  }
  function rapid() {
    App.screen('Rapid fire', function (vv) {
      var start = st().best;
      runQuiz(vv, 12, function (right, n) {
        vv.innerHTML = '<div class="panel"><h2>' + right + ' / ' + n + '</h2><p>' + (st().best > start ? 'New best streak: ' + st().best + '!' : 'Best streak: ' + st().best + '. The clock gets shorter as your streak grows.') + '</p><div class="btns"><button class="btn primary" id="ag">Again</button><button class="btn" id="dn">Done</button></div></div>';
        $('#ag').onclick = function () { App.checkpoint(function () { App.back(); rapid(); }); };
        $('#dn').onclick = function () { App.back(); };
      }, { rapid: true });
    });
  }
  // short break shown between games
  function breakQuiz(done) {
    var sheet = App.modal('<div class="grab"></div><span class="eyebrow">Market break · 3 questions</span><div id="bq" class="wrap" style="gap:12px"></div>', false);
    runQuiz(App.$('#bq', sheet), 3, function (right) {
      App.$('#bq', sheet).innerHTML = '<h2>' + right + ' / 3</h2><p class="mute">' + titleOf(st().level) + ' · ' + st().xp + ' XP. Back to your game.</p><button class="btn primary" id="bqd">Continue</button>';
      App.$('#bqd').onclick = function () { App.closeModal(); done(); };
    });
  }
  function place() {
    var t = 0, right = 0, used = {};
    App.screen('Markets placement', function (v) {
      function ask() {
        if (t >= TOPICS.length) return done();
        var topic = TOPICS[t], cand = [];
        Q.forEach(function (q, i) { if (q[0] === topic && q[1] >= 2 && q[1] <= 4 && !used[i]) cand.push(i); });
        cand.sort(function (a, b) { return Math.abs(Q[a][1] - 3) - Math.abs(Q[b][1] - 3) + (Math.random() - .5); });
        var i = cand[0], q = Q[i]; used[i] = 1;
        var order = [0, 1, 2, 3].sort(function () { return Math.random() - .5; });
        v.innerHTML = '<div class="row"><span class="pill acc">' + topic + '</span><span class="pill">' + (t + 1) + ' / ' + TOPICS.length + '</span></div><div class="bar"><i style="width:' + (t / TOPICS.length * 100) + '%"></i></div><h2>' + esc(q[2]) + '</h2><div class="list">' + order.map(function (k) { return '<button class="btn opt" data-k="' + k + '">' + esc(q[3][k]) + '</button>'; }).join('') + App.idkBtn('k') + '<button class="btn ghost" data-k="-1">Not sure</button></div><div id="fb"></div>';
        var done1 = false;
        $$('[data-k]', v).forEach(function (b) {
          b.onclick = function () {
            if (done1) return; done1 = true;
            var ok = +b.dataset.k === 0, m = st();
            if (ok) right++;
            m.topic[topic] = ok ? 2 + q[1] * 0.5 : 1;
            m.q[i] = { box: ok ? 2 : 0, at: 0 };
            $$('[data-k]', v).forEach(function (x) { if (+x.dataset.k === 0) x.classList.add('right'); else if (x === b) x.classList.add('wrong'); });
            $('#fb', v).innerHTML = App.coachHTML(ok ? 'right' : 'wrong', esc(q[4])) + '<button class="btn primary" id="nx" style="width:100%">Next</button>';
            $('#nx', v).onclick = function () { t++; ask(); };
          };
        });
      }
      function done() {
        var m = st(); m.placed = 1;
        m.level = Math.max(m.level, 1 + Math.floor(right / 2));
        m.xp = Math.max(m.xp, xpFor(m.level - 1));
        App.save();
        var weak = TOPICS.filter(function (x) { return (m.topic[x] || 1) < 2; });
        v.innerHTML = '<div class="panel"><span class="eyebrow">Placement done</span><h1>' + titleOf(m.level) + '</h1><p>' + right + ' of ' + TOPICS.length + ' correct. ' + (weak.length ? 'Your questions will lean on: ' + weak.join(', ') + '.' : 'Solid across the board. Harder questions are in rotation.') + '</p><button class="btn primary" id="gh">Go to markets</button></div>';
        $('#gh', v).onclick = function () { App.tab('mkt'); };
      }
      ask();
    });
  }
  function report() {
    var m = st(), out = [];
    var weak = TOPICS.filter(function (t) { return m.topic[t] != null; }).sort(function (a, b) { return topicSkill(a) - topicSkill(b); });
    if (m.answered >= 10 && weak.length) out.push({ sev: 1 - topicSkill(weak[0]) / 5, text: 'Weakest topic' + (weak[1] ? 's' : '') + ': <b>' + weak[0] + '</b>' + (weak[1] ? ' and <b>' + weak[1] + '</b>' : '') + '. Questions lean on them until the skill bars catch up.', action: 'Keep learning', go: function () { App.screen('Learning', function (vv) { runQuiz(vv, 0, function () {}); }); } });
    var missed = Object.keys(m.q || {}).filter(function (i) { return m.q[i].box === 0; }).length;
    if (missed >= 3) out.push({ sev: Math.min(1, missed / 10), text: missed + ' questions you missed are queued to come back until you get them right twice.', action: 'Review now', go: function () { App.screen('Learning', function (vv) { runQuiz(vv, 0, function () {}); }); } });
    if (m.simN >= 5 && m.simR / m.simN < 0) out.push({ sev: 0.5, text: 'Chart practice is net negative (' + m.simR.toFixed(1) + 'R over ' + m.simN + '). Trade less: when the chart is choppy, staying flat is the pro move.', action: 'Chart practice', go: simScreen });
    if (!out.length) out.push({ sev: 0, text: m.answered < 10 ? 'Answer a dozen questions and the coach will show where to focus.' : 'Balanced so far. Push into Momentum Lab and Macro Desk for the real-data work.', action: 'Momentum Lab', go: MO.home });
    return out.sort(function (a, b) { return b.sev - a.sev; });
  }
  function quick() {
    var out = [], rep = report()[0];
    out.push({ label: 'Markets questions', why: rep.sev > 0.15 ? rep.text : 'Adaptive questions; misses come back until they stick.', go: function () { App.screen('Learning', function (vv) { runQuiz(vv, 0, function () {}); }); }, quota: 1, w: 1.5 });
    if (typeof TP !== 'undefined') out.push({ label: 'Read the month (real data)', why: 'See the forces, call the leader, check against reality.', go: TP.readMonth, quota: 4, w: 1.3 });
    if (typeof MO !== 'undefined') out.push({ label: 'Rotation Replay', why: 'Pick what the 12-1 rule holds on a real month.', go: MO.replay, quota: 4, w: 1.2 });
    if (typeof MC !== 'undefined' && MC.eventReplay) out.push({ label: 'Event Replay', why: 'Real market episodes, real outcomes.', go: MC.eventReplay, quota: 3, w: 1 });
    if (typeof TB !== 'undefined' && TB.hasQuiz()) out.push({ label: 'ToneBot course: next lesson', why: 'Read the next lesson of the bot’s course, then quiz it; misses come back as a second look.', go: function () { TB.courseContinue(''); }, quota: 1, w: 1.2 });
    out.push({ label: 'Rapid fire', why: 'Speed round; the clock shrinks as your streak grows.', go: rapid, quota: 1, w: .7 });
    return out;
  }
  App.reg('mkt', { home: home, breakQuiz: breakQuiz, place: place, report: report, quick: quick });
  return { Q: Q, learn: function () { App.screen('Learning', function (vv) { runQuiz(vv, 0, function () {}); }); }, rapid: rapid, sim: simScreen, TOPICS: TOPICS, topicSkill: topicSkill };
})();
