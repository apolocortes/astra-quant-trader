import crypto from "crypto";

export interface TradeOrderParams {
  symbol: string; // ex: "BTCUSDT"
  side: "BUY" | "SELL";
  quantity: number;
  takeProfitPrice?: number;
  stopLossPrice?: number;
}

export class BinanceExecutionEngine {
  private apiKey: string;
  private apiSecret: string;
  private baseUrl: string;

  constructor(apiKey?: string, apiSecret?: string, testnet: boolean = false) {
    this.apiKey = apiKey || process.env.BINANCE_API_KEY || "";
    this.apiSecret = apiSecret || process.env.BINANCE_API_SECRET || "";
    this.baseUrl = testnet
      ? "https://testnet.binance.vision"
      : "https://api.binance.com";
  }

  private signQuery(queryString: string): string {
    return crypto
      .createHmac("sha256", this.apiSecret)
      .update(queryString)
      .digest("hex");
  }

  public async getAccountBalance(): Promise<{ usdtFree: number; btcFree: number }> {
    if (!this.apiKey || !this.apiSecret) {
      // Modo Simulado
      return { usdtFree: 150.0, btcFree: 0.002 };
    }

    const timestamp = Date.now();
    const query = `timestamp=${timestamp}`;
    const signature = this.signQuery(query);

    const res = await fetch(`${this.baseUrl}/api/v3/account?${query}&signature=${signature}`, {
      headers: {
        "X-MBX-APIKEY": this.apiKey,
      },
    });

    if (!res.ok) {
      throw new Error(`Binance balance error: ${res.statusText}`);
    }

    const data = await res.json();
    const usdt = data.balances?.find((b: any) => b.asset === "USDT")?.free || 0;
    const btc = data.balances?.find((b: any) => b.asset === "BTC")?.free || 0;

    return {
      usdtFree: parseFloat(usdt),
      btcFree: parseFloat(btc),
    };
  }

  public async executeMarketOrder(params: TradeOrderParams) {
    // Se não tiver chaves reais, executa no modo Paper Trading (Simulado)
    if (!this.apiKey || !this.apiSecret) {
      return {
        mode: "PAPER_TRADING_SIMULATED",
        orderId: `SIM_${Date.now()}`,
        symbol: params.symbol,
        side: params.side,
        executedQty: params.quantity,
        status: "FILLED",
        executedPrice: 65420.50,
        message: "Ordem simulada executada com sucesso! Conecte as chaves da Binance para operar com dinheiro real.",
      };
    }

    const timestamp = Date.now();
    const query = `symbol=${params.symbol}&side=${params.side}&type=MARKET&quantity=${params.quantity}&timestamp=${timestamp}`;
    const signature = this.signQuery(query);

    const res = await fetch(`${this.baseUrl}/api/v3/order`, {
      method: "POST",
      headers: {
        "X-MBX-APIKEY": this.apiKey,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `${query}&signature=${signature}`,
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Binance Order Failed: ${err}`);
    }

    return await res.json();
  }
}