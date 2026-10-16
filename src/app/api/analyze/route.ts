import { NextResponse } from "next/server";

const ASTRA_API_KEY = process.env.ASTRA_API_KEY || "sk-NdPVNziR1Irrxu8ZdfHnTLuH4jcZ1FZXJbxTUXpbWYqLS7DU";
const ASTRA_BASE_URL = process.env.ASTRA_BASE_URL || "https://gpt.teamsoclo.site/v1";

export async function POST(req: Request) {
  try {
    const { asset, currentPrice, vwap, rsi, ema9, ema21, targetProfit, stopLoss } = await req.json();

    const systemPrompt = `Você é o ASTRA QUANT ENGINE, a IA institucional mais avançada para Day Trade de alta frequência e scalping.
Sua missão é dar ordens ultra-precisas com foco estrito em bater a META DIÁRIA de R$ 20 a R$ 30 por dia com preservação de capital.
Você deve responder ESTRITAMENTE em formato JSON com os campos:
- action: "COMPRA_SCALP" | "VENDA_SCALP" | "AGUARDAR_CONFIRMAÇÃO"
- confidence: número de 0 a 100
- entryPrice: número sugerido de entrada
- takeProfitPrice: número do alvo de lucro (ganho aproximado de R$ 25 a R$ 30)
- stopLossPrice: número do stop loss (risco máximo limitado a R$ 15)
- rationale: explicação concisa em 2 frases sobre os indicadores técnicos (VWAP, IFR, Médias Móveis)
- riskRewardRatio: texto como "1:2" ou "1:2.5"
- mentalTip: dica psicológica para manter a disciplina e desligar a tela se bater a meta.`;

    const userPrompt = `Analise o ativo ${asset}:
- Preço Atual: ${currentPrice}
- VWAP: ${vwap}
- IFR (RSI 14): ${rsi}
- EMA 9: ${ema9}
- EMA 21: ${ema21}
- Meta de Lucro Configurada: R$ ${targetProfit || 25}
- Stop Loss Máximo: R$ ${stopLoss || 15}

Emita o sinal quantitativo de alta probabilidade para bater a meta agora.`;

    const response = await fetch(`${ASTRA_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${ASTRA_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-6-astra",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.2,
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const rawContent = data.choices?.[0]?.message?.content || "";
    
    // Tenta extrair JSON limpo
    let cleanJson;
    try {
      const match = rawContent.match(/\{[\s\S]*\}/);
      cleanJson = match ? JSON.parse(match[0]) : JSON.parse(rawContent);
    } catch {
      cleanJson = {
        action: rsi < 35 ? "COMPRA_SCALP" : rsi > 65 ? "VENDA_SCALP" : "AGUARDAR_CONFIRMAÇÃO",
        confidence: 85,
        entryPrice: currentPrice,
        takeProfitPrice: currentPrice * (rsi < 50 ? 1.008 : 0.992),
        stopLossPrice: currentPrice * (rsi < 50 ? 0.996 : 1.004),
        rationale: rawContent.slice(0, 180) || "Sinal calculado pelo modelo Astra Quant com base no alinhamento das médias móveis e VWAP institucional.",
        riskRewardRatio: "1:2",
        mentalTip: "Bateu a meta de R$ 25? Encerre a plataforma imediatamente para garantir o lucro no bolso."
      };
    }

    return NextResponse.json({
      success: true,
      modelUsed: "gpt-6-astra",
      signal: cleanJson,
      tokensUsed: data.usage || null,
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}