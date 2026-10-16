"use client";

import { useState, useEffect } from "react";
import {
  TrendingUp,
  TrendingDown,
  ShieldAlert,
  Zap,
  Activity,
  DollarSign,
  Lock,
  RefreshCw,
  Cpu,
  BarChart3,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

export default function AstraQuantDashboard() {
  const [selectedAsset, setSelectedAsset] = useState("WIN$N (Mini Índice)");
  const [currentPrice, setCurrentPrice] = useState(131250);
  const [vwap, setVwap] = useState(131180);
  const [rsi, setRsi] = useState(42.5);
  const [ema9, setEma9] = useState(131220);
  const [ema21, setEma21] = useState(131150);

  // Metas do dia (R$ 20 a R$ 30)
  const [dailyTarget, setDailyTarget] = useState(25);
  const [dailyStopLoss, setDailyStopLoss] = useState(15);
  const [accumulatedProfit, setAccumulatedProfit] = useState(0);
  const [isLockedForDay, setIsLockedForDay] = useState(false);

  const [loading, setLoading] = useState(false);
  const [signal, setSignal] = useState<any>(null);
  const [executionLog, setExecutionLog] = useState<string[]>([]);

  // Simulação de ticker de preços em tempo real
  useEffect(() => {
    const interval = setInterval(() => {
      const variation = Math.floor(Math.random() * 25) - 12;
      setCurrentPrice((prev) => {
        const next = prev + variation;
        return next;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const triggerAstraAnalysis = async () => {
    if (isLockedForDay) return;
    setLoading(true);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          asset: selectedAsset,
          currentPrice,
          vwap,
          rsi,
          ema9,
          ema21,
          targetProfit: dailyTarget,
          stopLoss: dailyStopLoss,
        }),
      });

      const data = await res.json();
      if (data.success && data.signal) {
        setSignal(data.signal);
        setExecutionLog((prev) => [
          `[${new Date().toLocaleTimeString()}] GPT-6 ASTRA emitiu: ${data.signal.action} @ ${data.signal.entryPrice} (Confiança: ${data.signal.confidence}%)`,
          ...prev.slice(0, 7),
        ]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const simulateExecution = (outcome: "WIN" | "LOSS") => {
    if (outcome === "WIN") {
      const profit = 25;
      const nextTotal = accumulatedProfit + profit;
      setAccumulatedProfit(nextTotal);
      setExecutionLog((prev) => [
        `[${new Date().toLocaleTimeString()}] ✅ TAKE PROFIT EXECUTADO: +R$ ${profit},00! Total do dia: R$ ${nextTotal},00`,
        ...prev,
      ]);
      if (nextTotal >= dailyTarget) {
        setIsLockedForDay(true);
      }
    } else {
      const loss = 15;
      const nextTotal = accumulatedProfit - loss;
      setAccumulatedProfit(nextTotal);
      setExecutionLog((prev) => [
        `[${new Date().toLocaleTimeString()}] 🛑 STOP LOSS RESPEITADO: -R$ ${loss},00. Total do dia: R$ ${nextTotal},00`,
        ...prev,
      ]);
      if (Math.abs(nextTotal) >= dailyStopLoss && nextTotal < 0) {
        setIsLockedForDay(true);
      }
    }
    setSignal(null);
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 p-4 md:p-8 flex flex-col items-center">
      {/* Top Header */}
      <header className="w-full max-w-6xl flex flex-col md:flex-row justify-between items-start md:items-center pb-6 border-b border-slate-800 gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400">
              <Cpu className="w-6 h-6 animate-pulse" />
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              ASTRA QUANT TRADER <span className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 font-mono border border-blue-500/30">GPT-6 ASTRA MAX</span>
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Motor quantitativo de alta frequência e scalping blindado • Alvo Diário: R$ 20,00 – R$ 30,00
          </p>
        </div>

        {/* Status de Meta Diária */}
        <div className="flex items-center gap-4 bg-slate-900/80 border border-slate-800 p-3 rounded-xl">
          <div>
            <div className="text-[10px] uppercase font-semibold text-slate-400">Lucro do Dia</div>
            <div className={`text-xl font-bold ${accumulatedProfit >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
              R$ {accumulatedProfit.toFixed(2)}
            </div>
          </div>
          <div className="h-8 w-px bg-slate-800" />
          <div>
            <div className="text-[10px] uppercase font-semibold text-slate-400">Meta do Dia</div>
            <div className="text-xl font-bold text-white">R$ {dailyTarget.toFixed(2)}</div>
          </div>
          {isLockedForDay && (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 border border-amber-500/40 rounded-lg text-amber-400 text-xs font-semibold">
              <Lock className="w-3.5 h-3.5" />
              TRAVA DE DISCIPLINA ATIVADA
            </div>
          )}
        </div>
      </header>

      {/* Main Grid */}
      <main className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Coluna 1 e 2: Gráfico e Indicadores */}
        <section className="lg:col-span-2 space-y-6">
          {/* Card de Preço em Tempo Real */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 relative overflow-hidden backdrop-blur">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-3">
                <select
                  value={selectedAsset}
                  onChange={(e) => setSelectedAsset(e.target.value)}
                  className="bg-slate-800 text-white text-sm font-semibold rounded-lg px-3 py-1.5 border border-slate-700 outline-none"
                >
                  <option value="WIN$N (Mini Índice)">WIN$N (Mini Índice B3)</option>
                  <option value="WDO$N (Mini Dólar)">WDO$N (Mini Dólar B3)</option>
                  <option value="BTC/USDT (Bitcoin)">BTC/USDT (Crypto Scalp)</option>
                </select>
                <span className="flex items-center gap-1 text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" /> MERCADO AO VIVO
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400">Última Cotação</span>
                <div className="text-2xl font-mono font-bold text-white tracking-wide">
                  {currentPrice.toLocaleString("pt-BR")}
                </div>
              </div>
            </div>

            {/* Grid de Indicadores Institucionais */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                <div className="text-[11px] text-slate-400 font-medium">VWAP Diária</div>
                <div className="text-sm font-mono font-semibold text-blue-400 mt-1">{vwap}</div>
                <div className="text-[10px] text-slate-500">Preço Ponderado</div>
              </div>
              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                <div className="text-[11px] text-slate-400 font-medium">IFR / RSI (14)</div>
                <div className="text-sm font-mono font-semibold text-amber-400 mt-1">{rsi}</div>
                <div className="text-[10px] text-slate-500">Região Neutra/Scalp</div>
              </div>
              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                <div className="text-[11px] text-slate-400 font-medium">EMA 9 (Rápida)</div>
                <div className="text-sm font-mono font-semibold text-purple-400 mt-1">{ema9}</div>
                <div className="text-[10px] text-slate-500">Direção Imediata</div>
              </div>
              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                <div className="text-[11px] text-slate-400 font-medium">EMA 21 (Tendência)</div>
                <div className="text-sm font-mono font-semibold text-emerald-400 mt-1">{ema21}</div>
                <div className="text-[10px] text-slate-500">Tendência Primária</div>
              </div>
            </div>

            {/* Ação de Disparo da IA */}
            <div className="mt-6 pt-4 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-xs text-slate-400 flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-400" />
                <span>Modelo: <strong>GPT-6 Astra</strong> (192M tokens em buffer)</span>
              </div>
              <button
                disabled={loading || isLockedForDay}
                onClick={triggerAstraAnalysis}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 disabled:opacity-50 transition-all cursor-pointer"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Processando Ordem Quântica...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    DISPARAR ANÁLISE QUANT ASTRA
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Card do Sinal Emitido pela IA */}
          {signal && (
            <div className="bg-slate-900/90 border-2 border-blue-500/50 rounded-2xl p-6 shadow-2xl relative">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-[10px] font-bold tracking-widest text-blue-400 uppercase">SINAL QUANTITATIVO ASTRA</span>
                  <h3 className="text-xl font-black mt-1 flex items-center gap-2">
                    {signal.action.includes("COMPRA") && <TrendingUp className="text-emerald-400 w-6 h-6" />}
                    {signal.action.includes("VENDA") && <TrendingDown className="text-rose-400 w-6 h-6" />}
                    <span className={signal.action.includes("COMPRA") ? "text-emerald-400" : signal.action.includes("VENDA") ? "text-rose-400" : "text-amber-400"}>
                      {signal.action}
                    </span>
                  </h3>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-400">Probabilidade Matemática</div>
                  <div className="text-lg font-bold text-white font-mono">{signal.confidence}%</div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 bg-slate-950/80 p-4 rounded-xl border border-slate-800 text-center">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase">Ponto de Entrada</span>
                  <div className="text-sm font-bold text-white font-mono mt-1">{signal.entryPrice}</div>
                </div>
                <div>
                  <span className="text-[10px] text-emerald-400 uppercase font-semibold">Take Profit (+R$ 25)</span>
                  <div className="text-sm font-bold text-emerald-400 font-mono mt-1">{signal.takeProfitPrice}</div>
                </div>
                <div>
                  <span className="text-[10px] text-rose-400 uppercase font-semibold">Stop Loss (-R$ 15)</span>
                  <div className="text-sm font-bold text-rose-400 font-mono mt-1">{signal.stopLossPrice}</div>
                </div>
              </div>

              <p className="text-xs text-slate-300 mt-4 leading-relaxed bg-slate-800/40 p-3 rounded-lg border border-slate-700/50">
                <strong>Análise do Astra:</strong> {signal.rationale}
              </p>

              {/* Dica Psicológica */}
              <div className="mt-3 p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-lg flex items-center gap-2 text-xs text-indigo-300">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{signal.mentalTip}</span>
              </div>

              {/* Botões de Simulação de Execução */}
              <div className="mt-4 pt-4 border-t border-slate-800 flex gap-3">
                <button
                  onClick={() => simulateExecution("WIN")}
                  className="flex-1 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition"
                >
                  Registrar Take Profit (+R$ 25)
                </button>
                <button
                  onClick={() => simulateExecution("LOSS")}
                  className="flex-1 py-2.5 rounded-lg bg-rose-600/80 hover:bg-rose-500 text-white font-semibold text-xs transition"
                >
                  Registrar Stop Loss (-R$ 15)
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Coluna 3: Disciplina e Regras de R$ 20 a R$ 30 */}
        <aside className="space-y-6">
          {/* Card de Regras de Ouro */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              LEIS DA CONSISTÊNCIA (R$ 20-30/DIA)
            </h2>
            <ul className="text-xs text-slate-300 space-y-3 mt-4">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Apenas 1 a 2 operações por dia:</strong> Bateu R$ 20 ou R$ 30? Encerre a tela. O mercado vai tentar tomar o seu lucro de volta.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Stop Loss Inegociável:</strong> Máximo de R$ 15 por operação. Se tomar o stop, não tente "se vingar" do mercado.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>R$ 25 x 20 dias úteis = R$ 500,00 extras no mês:</strong> A consistência vem da disciplina, não de grandes tacadas.</span>
              </li>
            </ul>
          </div>

          {/* Histórico de Execução */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur">
            <h2 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
              <BarChart3 className="w-4 h-4 text-blue-400" />
              LOG DE EXECUÇÃO QUANT
            </h2>
            <div className="space-y-2 max-h-60 overflow-y-auto font-mono text-[11px]">
              {executionLog.length === 0 ? (
                <div className="text-slate-500 italic">Nenhuma ordem executada hoje. Dispare a análise do Astra acima.</div>
              ) : (
                executionLog.map((log, i) => (
                  <div key={i} className="p-2 bg-slate-950/80 border border-slate-800 rounded text-slate-300">
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}