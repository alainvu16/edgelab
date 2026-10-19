// Markets: one 'learn it first' card per topic (Oct 18), shown the first time a question from that topic comes up.
var MKT_CARDS = {
"Basics": {
"idea": "A stock is a slice of a company; ETFs and indexes bundle many stocks, and every trade carries hidden costs like spreads, fees and taxes.",
"points": [
"Market cap = share price × shares outstanding. Float is the shares actually available to trade.",
"Bid-ask spread is the gap between the best buy and sell prices; liquid stocks have heavy volume and tight spreads.",
"ETFs trade all day near their holdings’ value (NAV); sector ETFs like XLK hold one sector’s stocks.",
"The S&P 500 is cap-weighted, so the biggest firms move it most; the Dow is price-weighted.",
"Total return = price change + dividends. Dividend yield = annual dividend ÷ price: $2 on a $50 stock is 4%.",
"US gains held a year or less are taxed as ordinary income; rebuying within 30 days of a loss triggers the wash sale rule.",
"Margin and leverage magnify losses: buy $20,000 with $10,000 and a 25% drop wipes out 50% of your equity."
],
"example": "You buy $10,000 of a $50 ETF with a 0.10% expense ratio: $10 a year in fees. It pays $1.50 in dividends and rises to $53, so total return is ($3 + $1.50) ÷ $50 = 9%."
},
"Orders": {
"idea": "Order types trade price certainty against fill certainty; choosing the right one controls what you pay to get in and out.",
"points": [
"Market order: fills now at the best available price, but the price isn’t guaranteed. Slippage is expected minus actual fill.",
"Limit order: price certainty, not fill certainty. A buy limit at $50 fills only at $50 or lower, possibly partially.",
"Stop order: becomes a market order when hit, so gaps can fill you far past it. A stop-limit may never fill.",
"Buy stops above price enter breakouts; a short position’s stop-loss sits above the entry price.",
"Trailing stop follows the high: an 8% trail on a run from $100 to $125 triggers near $115.",
"Day orders cancel at the close; GTC stays open. OCO pairs a target and stop; fill-or-kill fills everything now or nothing.",
"Spreads are widest at the open; big orders get sliced (VWAP/TWAP); market-on-close uses the deep closing auction."
],
"example": "Stop-loss at $45 on a $50 stock. Bad news breaks overnight and the stock opens at $38. The stop becomes a market order and fills near $38, not $45."
},
"Market structure": {
"idea": "Behind every trade sit market makers, exchanges, rules and share lenders; knowing this plumbing explains spreads, halts, squeezes and index-driven flows.",
"points": [
"Market makers quote both a bid and an ask and earn the spread; spreads widen at the open and around news.",
"US trades settle T+1: cash and shares officially change hands one business day later.",
"Circuit breakers halt all stocks when the S&P 500 falls 7%, 13% or 20% intraday; LULD bands halt single stocks.",
"Shorting requires locating shares to borrow; hard-to-borrow names charge daily fees and carry higher squeeze risk.",
"Short interest of 30% of float, or days-to-cover of 8, marks a crowded short that can squeeze.",
"Level 2 shows the order book; dark pools hide large orders; PFOF means market makers pay brokers for retail orders.",
"Index additions force fund buying; a closing-auction buy imbalance can push price up into the close."
],
"example": "A stock has 10 million shares sold short and trades 1.25 million a day, so days-to-cover is 8. Good news hits, shorts rush to buy back, and price spikes: a short squeeze."
},
"Charts": {
"idea": "Charts show where buyers and sellers have acted; trends, levels, moving averages and indicators summarize that behavior but never guarantee the next move.",
"points": [
"Uptrend: higher highs and higher lows. Downtrend: lower highs and lower lows.",
"Support is where buyers stepped in, resistance where sellers did. Broken support often becomes resistance, and vice versa.",
"Candle body spans open to close; long wicks show rejected prices; a doji (open ≈ close) signals indecision.",
"Moving averages smooth price; an EMA reacts faster than an SMA. The 200-day judges long-term trend; 50 crossing above 200 is a golden cross.",
"RSI above 70 is overbought, below 30 oversold, but strong trends stay overbought. Bearish divergence: price higher high, RSI lower high.",
"Volume confirms moves: high-volume breakouts are more reliable; rising price on falling volume is weak.",
"ATR measures normal daily range, so stops tighter than about 1–2 ATR get hit by noise. ADX above 25 means trending."
],
"example": "A stock’s ATR is $2. A $1 stop gets knocked out by ordinary daily wiggles. A $4 stop (2 ATR) gives room, so you buy fewer shares to keep dollar risk the same."
},
"Risk": {
"idea": "Survival comes first: decide what you can lose before entering, size every trade to that, and judge strategies by expectancy and drawdown.",
"points": [
"The 1% rule: risk at most 1% of the account per trade. $50,000 × 1% = $500 max loss.",
"Position size = risk $ ÷ (entry − stop). $500 ÷ ($100 − $95) = 100 shares.",
"Losses need bigger gains to recover: −20% needs +25%, −50% needs +100%, −75% needs +300%.",
"R is your initial risk per trade; results are R-multiples. At 1:2 reward-to-risk, breakeven win rate is 33%.",
"Expectancy = win% × avg win − loss% × avg loss. 40% × 2R − 60% × 1R = +0.2R per trade.",
"Max drawdown is the biggest peak-to-trough drop: $150k to $120k is 20%. Expect live drawdowns worse than the backtest.",
"Sharpe = (return − risk-free) ÷ volatility. Leverage and correlated holdings hide risk; use half-Kelly or less."
],
"example": "Account $25,000, risk 1% = $250. Entry $40, stop $38 means $2 risk per share, so 125 shares. Stopped out: −1R ($250). Hit a $46 target: +3R ($750)."
},
"Momentum": {
"idea": "Winners tend to keep winning for months; momentum systems rank assets by past returns, hold the leaders and step aside when trends break.",
"points": [
"Relative momentum: is it beating its peers? Absolute (time-series) momentum: is it up, and beating T-bills?",
"Classic score is 12-1: the 12-month return skipping the latest month, because very short-term returns tend to reverse.",
"Momentum return = end ÷ start − 1. XLK from $150 to $180 = +20%.",
"Trend filter: hold only above, say, the 10-month or 200-day average, else go to T-bills. It cuts drawdowns but causes whipsaws.",
"Dual momentum picks the strongest asset, then holds T-bills if that asset’s return is below the T-bill return.",
"Biggest risk: momentum crashes when leadership flips fast, as in 2009; V-shaped bottoms leave it lagging. Volatility scaling helps.",
"A rising XLK/SPY ratio means tech is outperforming. Cost drag = turnover × cost: 200% × 0.2% = 0.4% a year."
],
"example": "12-1 returns: XLE +18%, XLF +12%, XLU +4%, T-bills +5%. Holding the top 2 means XLE and XLF. If XLE were below its 200-day average, the trend filter would skip it."
},
"Sector playbook": {
"idea": "The 11 S&P sectors react differently to the economic cycle, rates and commodities; sector ETFs let a system rotate into whichever is leading.",
"points": [
"Tickers: XLK tech, XLF financials, XLE energy, XLV health care, XLY discretionary, XLP staples, XLU utilities, XLI, XLB, XLRE, XLC.",
"Defensive sectors hold up in recessions: utilities, staples, health care. Cyclicals swing with the economy: industrials, discretionary, materials.",
"Typical cycle: early recovery favors financials, industrials, discretionary; mid-cycle tech and industrials; late cycle energy and materials.",
"Rising rates hurt utilities and real estate (bond-like, debt-heavy) and tech (far-future cash flows); a steepening curve helps banks.",
"Risk-on means tech, discretionary and small caps lead. XLY beating XLP signals confidence; staples leading signals caution.",
"Energy gains from oil spikes and led in 2022; XLE and XLB share a commodity driver, so they’re highly correlated.",
"Markets price the cycle ahead, so the playbook is a tendency, not a rule. XLK is concentrated in a few mega-caps."
],
"example": "2022: inflation high, the Fed hiking fast. Energy (XLE) surged while long-duration tech (XLK) and real estate (XLRE) fell, a classic late-cycle, rising-rate rotation."
},
"Macro": {
"idea": "Growth, inflation and the Fed set the backdrop for every market; interest rates are the price of money, and changing them moves everything.",
"points": [
"The Fed’s dual mandate is stable prices and maximum employment. The FOMC sets the fed funds rate; 25 basis points = 0.25%.",
"CPI and PCE (the Fed’s preferred gauge) measure inflation; core strips food and energy. Disinflation is slowing; deflation is falling prices.",
"Hikes slow the economy with long lags via costlier borrowing; they push bond prices down and hit long-duration growth stocks.",
"Recession warnings: inverted yield curve, widening credit spreads, rising jobless claims, the Sahm rule, ISM PMI below 50.",
"VIX is expected 30-day S&P volatility. One-month move ≈ VIX ÷ √12, so VIX 20 ≈ 5.8%.",
"Real yield = nominal yield − expected inflation. A strong dollar pressures commodities and multinationals’ overseas earnings.",
"When inflation dominates, as in 2022, stocks and bonds can fall together; in pure fear, Treasuries and the dollar usually rally."
],
"example": "A hot jobs report lands mid-hiking cycle. Traders price out rate cuts, the 2-year yield jumps, and rate-sensitive sectors like utilities and real estate slide."
},
"Systems & backtesting": {
"idea": "A backtest replays your rules on history; it’s only worth trusting with honest data, realistic costs and evidence the edge isn’t luck or curve-fitting.",
"points": [
"Look-ahead bias uses data not yet known. Compute the signal on the close and trade the next open to avoid it.",
"Survivorship bias ignores dead companies. Using ETFs before they existed (XLRE 2015, XLC 2018) adds hindsight.",
"Overfitting tunes rules to past noise. If a 10-month filter works but 9 and 11 fail badly, the result is fragile.",
"Use out-of-sample and walk-forward tests. Picking the best of 200 parameter combos inflates results (data snooping).",
"Include costs, slippage and dividend-adjusted data. Profit factor = gross profits ÷ gross losses; MAR = CAGR ÷ max drawdown.",
"Small samples mislead: a monthly system over 20 years makes about 240 decisions. Monte Carlo shows luck’s range of drawdowns.",
"Set stop-the-system limits before going live. A drawdown within the backtest’s range means keep following the rules; log every trade."
],
"example": "Backtest: CAGR 15%, max drawdown 30%, so MAR = 0.5. Paper trading then catches a data bug that bought the wrong ETF, found before any real money was at risk."
},
"Options": {
"idea": "Options are contracts giving the right to buy (call) or sell (put) at a set strike before expiry; their price blends intrinsic value, time and volatility.",
"points": [
"A call gains when the stock rises; a put gains when the stock falls. One US contract covers 100 shares.",
"Buyers’ max loss is the premium paid. Sellers collect premium but must fulfill the contract if assigned.",
"Call intrinsic value = stock − strike, if positive; $110 stock, $100 strike = $10. Out of the money means no intrinsic value.",
"Breakeven at expiry: call = strike + premium; put = strike − premium. A $100 call bought for $4 breaks even at $104.",
"Greeks: delta 0.50 moves $0.50 per $1; gamma peaks at the money near expiry; theta is time decay; vega is IV sensitivity.",
"Implied volatility is the market’s expected volatility. After earnings it collapses (IV crush), cheapening options.",
"Covered call: income, capped upside. Protective put: insurance on stock. Cash-secured put: obligation to buy at the strike."
],
"example": "Buy a $50 put for $3. At expiry the stock is $44: the put is worth $6, so profit is $3 per share, $300 per contract. Above $50, you lose the $300 premium."
},
"Valuation": {
"idea": "Valuation asks what you pay for a company’s profits and cash flow; a high multiple only makes sense if fast growth is expected.",
"points": [
"P/E = price ÷ EPS: $60 ÷ $3 = 20. Forward P/E uses expected next-12-month earnings.",
"PEG = P/E ÷ expected growth: 30 ÷ 15 = 2.0. Price-to-sales helps for companies with no profits yet.",
"Enterprise value = market cap + debt − cash. EV/EBITDA compares companies regardless of how they’re financed.",
"Free cash flow = operating cash flow − capital spending. FCF yield = FCF ÷ market cap.",
"Gross margin = (revenue − COGS) ÷ revenue. ROE = profit ÷ equity; heavy debt can inflate it.",
"Buybacks shrink the share count and lift EPS; issuing new shares dilutes existing owners.",
"DCF value hinges on discount rate and terminal growth. Earnings yield (1 ÷ P/E) minus Treasury yield gauges the equity risk premium."
],
"example": "Revenue $4B at a 25% EBITDA margin = $1B EBITDA. With EV of $20B, EV/EBITDA is 20x: expensive unless strong growth is expected."
},
"Psychology": {
"idea": "Your own biases are the biggest threat to a trading plan; rules decided in advance protect you from yourself in the moment.",
"points": [
"Loss aversion: losses feel about twice as bad as equal gains, driving the disposition effect of selling winners early and holding losers.",
"Pre-commit: set size, stops and exits before looking at the chart, so excitement can’t inflate risk.",
"Recency bias overweights the last few trades. With a 55% win rate, five losses in a row is normal over time.",
"Gambler’s fallacy: you’re never ‘due’ a win. Sunk cost and anchoring keep you in trades whose thesis broke.",
"Revenge trading and FOMO mean bigger or later trades after losses or huge runs, usually with poor risk/reward.",
"Overconfidence after streaks inflates size; confirmation and narrative bias filter out contrary evidence; herding follows the crowd.",
"Judge process, not outcome. Journal every trade and urge, and follow the system when a feeling disagrees."
],
"example": "Your system says sell XLK, but you ‘feel’ a bounce coming. You sell as the rule says and log the urge. Over months, the journal shows whether your gut adds anything."
},
"Bonds & rates": {
"idea": "Bonds pay fixed interest, so their prices move opposite to yields; duration tells you how much a rate change helps or hurts.",
"points": [
"The coupon is the fixed interest payment. When yields rise, existing bond prices fall, because new bonds pay more.",
"Duration ≈ % price change per 1-point yield move: duration 7 loses about 7%; TLT, near 17, loses about 17%.",
"Longer maturities carry more rate risk: a 30-year swings far more than a 2-year. The term premium pays for that risk.",
"2s10s = 10-year minus 2-year yield. When it inverts (goes negative), recessions have often followed.",
"Bear steepener: long yields rise faster than short. Bull steepener: short yields fall faster, often as cuts approach.",
"TIPS adjust principal with CPI. Breakeven inflation = nominal − TIPS yield: 4.5% − 2.0% = 2.5%.",
"Junk bonds pay more for default risk; downgrades raise yields and cut prices. T-bill yields serve as the risk-free rate."
],
"example": "You hold a bond with duration 8. Yields jump from 4% to 5%, so its price falls about 8%, from roughly $1,000 to $920."
},
"Earnings": {
"idea": "Each quarter companies report results; the stock reacts to results and guidance versus expectations, not to whether profits are simply good.",
"points": [
"A beat means results topped consensus. Surprise = (actual − consensus) ÷ consensus: $1.05 vs $1.00 = +5%.",
"Guidance, management’s forecast, often matters more than the quarter; a beat with weak guidance can still sink the stock.",
"Whisper numbers and rising estimates raise the bar. Sandbagging means guiding low so the company can beat later.",
"Quality checks: margins, cash flow vs net income, inventory vs sales. Non-GAAP EPS often excludes stock comp and one-offs.",
"Options price an expected move, then IV crushes. If the actual move is smaller, straddle sellers profit.",
"Gap risk: stops can’t protect against overnight jumps. PEAD: prices often drift in the surprise’s direction for weeks.",
"Read-through: one company’s report hints at peers and suppliers. Operating leverage makes profits grow faster than revenue."
],
"example": "Options imply an 8% move. The company beats EPS by 5% but trims guidance, and the stock gaps down 3%. Straddle sellers profit as implied volatility collapses."
}
};
