import { NextResponse } from "next/server";
import { BinanceExecutionEngine } from "@/lib/binance-engine";

export async function POST(req: Request) {
  try {
    const { action, symbol, amountBRL, apiKey, apiSecret } = await req.json();

    const engine = new BinanceExecutionEngine(apiKey, apiSecret);
    
    // Converte R$ 25 - R$ 30 em proporção de USDT para BTC/USDT
    const tradeSide = action?.includes("COMPRA") ? "BUY" : "SELL";
    const quantity = 0.001; // lote mínimo fracionado

    const result = await engine.executeMarketOrder({
      symbol: symbol || "BTCUSDT",
      side: tradeSide,
      quantity,
    });

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      execution: result,
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}