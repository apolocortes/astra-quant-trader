import { NextResponse } from "next/server";

export interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const symbol = searchParams.get("symbol") || "BTCUSDT";
  const interval = searchParams.get("interval") || "5m";
  const limit = parseInt(searchParams.get("limit") || "100", 10);

  try {
    // 1. Coleta dados reais da Binance Spot API pública (Sem autenticação necessária)
    const binanceUrl = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`;
    const res = await fetch(binanceUrl, { next: { revalidate: 5 } });

    if (!res.ok) {
      throw new Error(`Binance public API returned status ${res.status}`);
    }

    const rawData = await res.json();
    const candles: Candle[] = rawData.map((d: any) => ({
      time: Math.floor(d[0] / 1000),
      open: parseFloat(d[1]),
      high: parseFloat(d[2]),
      low: parseFloat(d[3]),
      close: parseFloat(d[4]),
      volume: parseFloat(d[5]),
    }));

    // 2. Cálculo rigoroso de Indicadores Quantitativos Reais
    const closes = candles.map((c) => c.close);
    const lastClose = closes[closes.length - 1];

    // EMA Calculation
    const calcEMA = (period: number, prices: number[]) => {
      const k = 2 / (period + 1);
      let ema = prices.slice(0, period).reduce((a, b) => a + b, 0) / period;
      for (let i = period; i < prices.length; i++) {
        ema = prices[i] * k + ema * (1 - k);
      }
      return ema;
    };

    // RSI (Relative Strength Index - 14)
    const calcRSI = (prices: number[], period = 14) => {
      let gains = 0;
      let losses = 0;
      for (let i = 1; i <= period; i++) {
        const diff = prices[i] - prices[i - 1];
        if (diff >= 0) gains += diff;
        else losses -= diff;
      }
      let avgGain = gains / period;
      let avgLoss = losses / period;

      for (let i = period + 1; i < prices.length; i++) {
        const diff = prices[i] - prices[i - 1];
        if (diff >= 0) {
          avgGain = (avgGain * (period - 1) + diff) / period;
          avgLoss = (avgLoss * (period - 1)) / period;
        } else {
          avgGain = (avgGain * (period - 1)) / period;
          avgLoss = (avgLoss * (period - 1) - diff) / period;
        }
      }

      if (avgLoss === 0) return 100;
      const rs = avgGain / avgLoss;
      return 100 - 100 / (1 + rs);
    };

    // VWAP (Volume Weighted Average Price)
    let cumulativeTPV = 0;
    let cumulativeVol = 0;
    candles.forEach((c) => {
      const typicalPrice = (c.high + c.low + c.close) / 3;
      cumulativeTPV += typicalPrice * c.volume;
      cumulativeVol += c.volume;
    });
    const vwap = cumulativeVol > 0 ? cumulativeTPV / cumulativeVol : lastClose;

    const ema9 = calcEMA(9, closes);
    const ema21 = calcEMA(21, closes);
    const ema200 = closes.length >= 200 ? calcEMA(200, closes) : ema21;
    const rsi14 = calcRSI(closes, 14);

    // ATR (Average True Range - Volatilidade)
    let trSum = 0;
    for (let i = 1; i < candles.length; i++) {
      const highLow = candles[i].high - candles[i].low;
      const highPrevClose = Math.abs(candles[i].high - candles[i - 1].close);
      const lowPrevClose = Math.abs(candles[i].low - candles[i - 1].close);
      trSum += Math.max(highLow, highPrevClose, lowPrevClose);
    }
    const atr = trSum / (candles.length - 1);

    return NextResponse.json({
      success: true,
      symbol,
      interval,
      source: "Binance Public Market API (Real-Time Live Feed)",
      isLive: true,
      timestamp: Date.now(),
      metrics: {
        lastPrice: lastClose,
        vwap: parseFloat(vwap.toFixed(2)),
        ema9: parseFloat(ema9.toFixed(2)),
        ema21: parseFloat(ema21.toFixed(2)),
        ema200: parseFloat(ema200.toFixed(2)),
        rsi14: parseFloat(rsi14.toFixed(2)),
        atr: parseFloat(atr.toFixed(2)),
        volume24h: candles.reduce((acc, c) => acc + c.volume, 0),
      },
      candles: candles.slice(-50), // Últimos 50 candles para visualização
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        isLive: false,
      },
      { status: 500 }
    );
  }
}