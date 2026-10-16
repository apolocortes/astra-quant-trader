import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { symbol = "BTCUSDT", interval = "15m", targetGoal = 25, stopLoss = 15 } = await req.json();

    // 1. Busca histórico de 500 candles reais na Binance
    const binanceUrl = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=500`;
    const res = await fetch(binanceUrl);
    if (!res.ok) throw new Error("Falha ao coletar dados históricos");

    const data = await res.json();
    const candles = data.map((d: any) => ({
      time: d[0],
      open: parseFloat(d[1]),
      high: parseFloat(d[2]),
      low: parseFloat(d[3]),
      close: parseFloat(d[4]),
      volume: parseFloat(d[5]),
    }));

    // 2. Simulação de Estratégia Quantitativa: Pullback em EMA 9 / EMA 21 com filtro RSI
    let trades = [];
    let capital = 500;
    let peakCapital = 500;
    let maxDrawdown = 0;
    let winCount = 0;
    let lossCount = 0;

    for (let i = 25; i < candles.length - 1; i++) {
      const current = candles[i];
      const prev = candles[i - 1];

      // Cálculo simplificado de média no loop histórico
      const closes = candles.slice(i - 20, i).map((c: any) => c.close);
      const ema9 = closes.slice(-9).reduce((a: number, b: number) => a + b, 0) / 9;
      const ema21 = closes.reduce((a: number, b: number) => a + b, 0) / 20;

      // Condição de compra: Cruzamento de alta + preço acima da EMA 9
      if (prev.close < ema9 && current.close > ema9 && ema9 > ema21) {
        const entryPrice = current.close;
        const takeProfit = entryPrice * 1.008; // Ganho de 0.8% (equivale a ~R$ 25 com alavancagem moderada)
        const stopPrice = entryPrice * 0.995;  // Perda de 0.5% (equivale a ~R$ 15)

        // Verifica os próximos candles até atingir gain ou stop
        let tradeOutcome = "INCONCLUSIVO";
        for (let j = i + 1; j < Math.min(i + 15, candles.length); j++) {
          const future = candles[j];
          if (future.high >= takeProfit) {
            tradeOutcome = "WIN";
            capital += targetGoal;
            winCount++;
            break;
          } else if (future.low <= stopPrice) {
            tradeOutcome = "LOSS";
            capital -= stopLoss;
            lossCount++;
            break;
          }
        }

        if (tradeOutcome !== "INCONCLUSIVO") {
          if (capital > peakCapital) peakCapital = capital;
          const currentDd = ((peakCapital - capital) / peakCapital) * 100;
          if (currentDd > maxDrawdown) maxDrawdown = currentDd;

          trades.push({
            time: new Date(current.time).toLocaleDateString(),
            entryPrice,
            outcome: tradeOutcome,
            resultBRL: tradeOutcome === "WIN" ? `+R$ ${targetGoal}` : `-R$ ${stopLoss}`,
            capitalAfter: capital,
          });
        }
      }
    }

    const totalTrades = winCount + lossCount;
    const winRate = totalTrades > 0 ? ((winCount / totalTrades) * 100).toFixed(1) : 0;
    const netProfit = capital - 500;

    return NextResponse.json({
      success: true,
      backtest: {
        symbol,
        period: "Últimos 500 candles (Dados reais Binance)",
        totalTrades,
        winCount,
        lossCount,
        winRate: `${winRate}%`,
        netProfitBRL: `R$ ${netProfit.toFixed(2)}`,
        maxDrawdown: `${maxDrawdown.toFixed(2)}%`,
        initialCapital: "R$ 500,00",
        finalCapital: `R$ ${capital.toFixed(2)}`,
        trades: trades.slice(-10), // Últimos 10 trades detalhados
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}