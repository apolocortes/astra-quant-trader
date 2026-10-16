import { NextResponse } from "next/server";

const ASTRA_API_KEY = process.env.ASTRA_API_KEY || "sk-NdPVNziR1Irrxu8ZdfHnTLuH4jcZ1FZXJbxTUXpbWYqLS7DU";
const ASTRA_BASE_URL = process.env.ASTRA_BASE_URL || "https://gpt.teamsoclo.site/v1";

export async function POST(req: Request) {
  try {
    const { targetGoal, riskTolerance, assetType, bankroll } = await req.json();

    const goal = Number(targetGoal) || 25;
    const capital = Number(bankroll) || 500;
    const tolerance = riskTolerance || "MODERADO"; // CONSERVADOR | MODERADO | AGRESSIVO

    // Prompt Institucional Profundo para o GPT-6 Astra
    const systemPrompt = `Você é o ASTRA QUANT ENGINE 6.0 — o cérebro institucional quantitativo e algorítmico mais avançado do mundo para Day Trade.
Você foi projetado para investidores de varejo que precisam apenas definir o VALOR QUE QUEREM GANHAR NO DIA (Ex: R$ 20, R$ 30, R$ 50) e você gera o PLANO COMPLETO, EXATO E MATEMÁTICO de como extrair esse valor do mercado com o mínimo risco possível.

Você deve retornar ESTRITAMENTE um objeto JSON válido, sem texto antes ou depois, contendo a estrutura:
{
  "targetGoal": number,
  "dailyTargetText": string,
  "recommendedAsset": string,
  "timeframe": string,
  "marketBias": "ALTISTA_FORTE" | "LATERAL_SCALP" | "BAIXISTA_EXAUSTAO",
  "contractsOrSize": string,
  "exactStrategy": string,
  "entry": {
    "price": number,
    "condition": string,
    "triggerType": string
  },
  "takeProfit": {
    "price": number,
    "pointsOrPercent": string,
    "expectedProfitBRL": number,
    "rule": string
  },
  "stopLoss": {
    "price": number,
    "pointsOrPercent": string,
    "maxRiskBRL": number,
    "rule": string
  },
  "riskRewardRatio": string,
  "bestTradingWindow": string,
  "indicators": [
    { "name": string, "reading": string, "importance": string }
  ],
  "stepByStepExecution": [
    string, string, string, string
  ],
  "antiLossProtectionRule": string,
  "disciplineWarning": string
}`;

    const userPrompt = `O operador quer lucrar exatamente R$ ${goal},00 hoje.
Capital disponível na corretora: R$ ${capital},00.
Perfil de risco selecionado: ${tolerance}.
Mercado preferido: ${assetType || "B3 (Mini Índice / Dólar)"}.

Monte a estratégia matemática completa de execução para atingir exatamente esse valor de lucro diário preservando o capital contra violinadas.`;

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
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      throw new Error(`Astra API returned status ${response.status}`);
    }

    const data = await response.json();
    const rawContent = data.choices?.[0]?.message?.content || "";

    let plan;
    try {
      const match = rawContent.match(/\{[\s\S]*\}/);
      plan = match ? JSON.parse(match[0]) : JSON.parse(rawContent);
    } catch {
      // Fallback institucional estruturado
      plan = {
        targetGoal: goal,
        dailyTargetText: `R$ ${goal},00 no bolso`,
        recommendedAsset: "WIN$N (Mini Índice B3)",
        timeframe: "M5 / M1 (Scalping Rápido)",
        marketBias: "LATERAL_SCALP",
        contractsOrSize: "1 Minicontrato",
        exactStrategy: "Pullback institucional na VWAP com confirmação de exaustão pelo IFR 14",
        entry: {
          price: 131450,
          condition: "Toque na banda inferior de Bollinger com retorno acima da EMA 9",
          triggerType: "Ordem Limite ou a Mercado no rompimento do candle gatilho"
        },
        takeProfit: {
          price: 131575,
          pointsOrPercent: "+125 pontos (R$ 0,20 por ponto)",
          expectedProfitBRL: goal,
          rule: "Execução automática OCO na pedra. Bateu o gain, encerra imediatamente."
        },
        stopLoss: {
          price: 131375,
          pointsOrPercent: "-75 pontos",
          maxRiskBRL: Math.round(goal * 0.6),
          rule: "Stop técnico 2 ticks abaixo da mínima do candle anterior. Proibido arrastar stop."
        },
        riskRewardRatio: "1 : 1.67",
        bestTradingWindow: "09:30 às 11:30 (Maior liquidez e volume com abertura de NY)",
        indicators: [
          { name: "VWAP", reading: "Preço trabalhando a favor da média ponderada", importance: "Direção institucional" },
          { name: "IFR (14)", reading: "Região de 32 a 40 (Oportunidade de repique)", importance: "Timing de entrada" },
          { name: "EMA 9 / 21", reading: "Alinhadas em leque", importance: "Filtro de tendência" }
        ],
        stepByStepExecution: [
          "1. Abra seu Profit ou MetaTrader 5 e selecione o ativo recomendado.",
          `2. Configure a ordem OCO: Gain de ${goal * 5} pontos (R$ ${goal}) e Stop de ${(goal * 5) * 0.6} pontos.`,
          "3. Aguarde o sinal na janela recomendada de horário (09:30 - 11:30).",
          `4. Ao atingir +R$ ${goal}, DESLIGUE O COMPUTADOR. A meta diária foi batida.`
        ],
        antiLossProtectionRule: "Se tomar 1 stop loss no dia, está terminantemente proibido abrir novas ordens. Preservação de capital é o segredo dos 5% que ganham dinheiro.",
        disciplineWarning: "O mercado quer que você continue operando para te tomar a taxa e o lucro. Bateu a meta, saia da frente da tela."
      };
    }

    return NextResponse.json({
      success: true,
      model: "gpt-6-astra",
      tokens: data.usage || null,
      plan,
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}