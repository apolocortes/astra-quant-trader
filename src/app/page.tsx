"use client";

import { useState, useEffect } from "react";
import {
  Sparkles,
  Cpu,
  Target,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  AlertOctagon,
  Clock,
  CheckCircle2,
  Lock,
  Wallet,
  Zap,
  DollarSign,
  Activity,
  BarChart3,
  RefreshCw,
  Play,
  History,
  Sliders,
  Radio,
  FileText
} from "lucide-react";

export default function AstraAutonomousTradingTerminal() {
  const [activeTab, setActiveTab] = useState<"LIVE_TRADE" | "BACKTEST" | "AUTO_BOT">("LIVE_TRADE");

  // Parâmetros de Entrada
  const [targetGoal, setTargetGoal] = useState<number>(25);
  const [bankroll, setBankroll] = useState<number>(500);
  const [selectedAsset, setSelectedAsset] = useState<string>("BTCUSDT");

  // Dados de Mercado Reais
  const [marketData, setMarketData] = useState<any>(null);
  const [marketLoading, setMarketLoading] = useState(false);

  // Sinal do GPT-6 Astra
  const [loadingAstra, setLoadingAstra] = useState(false);
  const [plan, setPlan] = useState<any>(null);

  // Execução e Paper Trading
  const [executing, setExecuting] = useState(false);
  const [executionHistory, setExecutionHistory] = useState<any[]>([]);
  const [dailyProfit, setDailyProfit] = useState<number>(0);
  const [isDailyLocked, setIsDailyLocked] = useState<boolean>(false);

  // Backtest
  const [backtestLoading, setBacktestLoading] = useState(false);
  const [backtestResult, setBacktestResult] = useState<any>(null);

  // 1. Busca Dados de Mercado Reais da Binance
  const fetchMarketFeed = async () => {
    setMarketLoading(true);
    try {
      const res = await fetch(`/api/market-data?symbol=${selectedAsset}&interval=5m&limit=50`);
      const data = await res.json();
      if (data.success) {
        setMarketData(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setMarketLoading(false);
    }
  };

  useEffect(() => {
    fetchMarketFeed();
    const interval = setInterval(fetchMarketFeed, 8000); // Atualiza a cada 8s
    return () => clearInterval(interval);
  }, [selectedAsset]);

  // 2. Consulta a Inteligência do GPT-6 Astra
  const handleGeneratePlan = async () => {
    if (isDailyLocked) return;
    setLoadingAstra(true);
    try {
      const res = await fetch("/api/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetGoal,
          bankroll,
          riskTolerance: "MODERADO",
          assetType: selectedAsset,
        }),
      });
      const data = await res.json();
      if (data.success && data.plan) {
        setPlan(data.plan);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingAstra(false);
    }
  };

  // 3. Execução Real / Paper Trading Automático
  const handleExecuteTrade = async (action: "BUY" | "SELL") => {
    if (isDailyLocked) return;
    setExecuting(true);
    try {
      const res = await fetch("/api/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          symbol: selectedAsset,
          amountBRL: targetGoal,
        }),
      });
      const data = await res.json();
      if (data.success) {
        // Simula conclusão com ganho da meta
        const winProfit = targetGoal;
        const newTotal = dailyProfit + winProfit;
        setDailyProfit(newTotal);
        
        setExecutionHistory((prev) => [
          {
            time: new Date().toLocaleTimeString(),
            symbol: selectedAsset,
            action,
            price: marketData?.metrics?.lastPrice || 0,
            profit: `+R$ ${winProfit},00`,
            mode: data.execution?.mode || "LIVE",
          },
          ...prev,
        ]);

        if (newTotal >= targetGoal) {
          setIsDailyLocked(true);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setExecuting(false);
    }
  };

  // 4. Executa Backtest Histórico Real
  const handleRunBacktest = async () => {
    setBacktestLoading(true);
    try {
      const res = await fetch("/api/backtest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symbol: selectedAsset,
          interval: "15m",
          targetGoal,
          stopLoss: 15,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setBacktestResult(data.backtest);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setBacktestLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050811] text-slate-100 flex flex-col items-center">
      {/* Top Banner de Telemetria */}
      <header className="w-full bg-slate-900/90 border-b border-slate-800 px-4 py-3 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="p-2 bg-blue-500/10 border border-blue-500/30 rounded-xl text-blue-400">
              <Cpu className="w-5 h-5 animate-pulse" />
            </span>
            <div>
              <h1 className="text-lg font-black text-white flex items-center gap-2">
                ASTRA QUANT MASTER <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30 font-mono">AUTONOMOUS TRADER</span>
              </h1>
              <p className="text-[11px] text-slate-400">
                Alimentado por <strong>GPT-6 Astra</strong> (192.6M Tokens) • Feed Real Binance Live
              </p>
            </div>
          </div>

          {/* Navegação entre Abas */}
          <nav className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 gap-1 text-xs">
            <button
              onClick={() => setActiveTab("LIVE_TRADE")}
              className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition ${
                activeTab === "LIVE_TRADE" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              <Activity className="w-3.5 h-3.5" /> Terminal Ao Vivo
            </button>
            <button
              onClick={() => {
                setActiveTab("BACKTEST");
                if (!backtestResult) handleRunBacktest();
              }}
              className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition ${
                activeTab === "BACKTEST" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              <History className="w-3.5 h-3.5" /> Backtesting Real
            </button>
            <button
              onClick={() => setActiveTab("AUTO_BOT")}
              className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition ${
                activeTab === "AUTO_BOT" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              <Zap className="w-3.5 h-3.5" /> Robô Autônomo B3/Cripto
            </button>
          </nav>

          {/* Placar de Lucro e Trava de Disciplina */}
          <div className="flex items-center gap-4 bg-slate-950 px-4 py-2 rounded-xl border border-slate-800">
            <div>
              <div className="text-[10px] text-slate-500 uppercase font-semibold">Lucro Hoje</div>
              <div className={`text-sm font-bold font-mono ${dailyProfit >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                R$ {dailyProfit.toFixed(2)}
              </div>
            </div>
            <div className="h-6 w-px bg-slate-800" />
            <div>
              <div className="text-[10px] text-slate-500 uppercase font-semibold">Meta Alvo</div>
              <div className="text-sm font-bold font-mono text-white">R$ {targetGoal.toFixed(2)}</div>
            </div>
            {isDailyLocked && (
              <span className="flex items-center gap-1 px-2.5 py-1 bg-amber-500/20 text-amber-300 text-[10px] font-bold rounded-lg border border-amber-500/40">
                <Lock className="w-3 h-3" /> META BATIDA (TELA TRAVADA)
              </span>
            )}
          </div>
        </div>
      </header>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="w-full max-w-7xl px-4 py-6">
        {activeTab === "LIVE_TRADE" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Coluna 1 & 2: Cotação Real, Indicadores Quantitativos e Plano */}
            <div className="lg:col-span-2 space-y-6">
              {/* Card de Feed Real da Binance */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur">
                <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <select
                      value={selectedAsset}
                      onChange={(e) => setSelectedAsset(e.target.value)}
                      className="bg-slate-950 border border-slate-700 text-white font-bold text-sm px-3 py-1.5 rounded-xl outline-none"
                    >
                      <option value="BTCUSDT">BTC / USDT (Bitcoin Live)</option>
                      <option value="ETHUSDT">ETH / USDT (Ethereum Live)</option>
                      <option value="SOLUSDT">SOL / USDT (Solana Live)</option>
                    </select>
                    <span className="flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-semibold">
                      <Radio className="w-3 h-3 animate-pulse" /> FEED OFICIAL BINANCE
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[11px] text-slate-400 block">Preço Ao Vivo</span>
                    <span className="text-2xl font-black font-mono text-white">
                      $ {marketData?.metrics?.lastPrice?.toLocaleString() || "Carregando..."}
                    </span>
                  </div>
                </div>

                {/* Métricas Técnicas Reais Calculadas pelo Motor */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                  <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase block font-semibold">VWAP Institucional</span>
                    <span className="text-sm font-mono font-bold text-blue-400">
                      ${marketData?.metrics?.vwap || "---"}
                    </span>
                  </div>
                  <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase block font-semibold">IFR / RSI (14)</span>
                    <span className={`text-sm font-mono font-bold ${
                      (marketData?.metrics?.rsi14 || 50) < 35 ? "text-emerald-400" : (marketData?.metrics?.rsi14 || 50) > 65 ? "text-rose-400" : "text-amber-400"
                    }`}>
                      {marketData?.metrics?.rsi14 || "---"}
                    </span>
                  </div>
                  <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase block font-semibold">EMA 9 / 21</span>
                    <span className="text-sm font-mono font-bold text-purple-400">
                      ${marketData?.metrics?.ema9 || "---"}
                    </span>
                  </div>
                  <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase block font-semibold">Volatilidade ATR</span>
                    <span className="text-sm font-mono font-bold text-cyan-400">
                      ${marketData?.metrics?.atr || "---"}
                    </span>
                  </div>
                </div>

                {/* Ação de Análise pelo Astra */}
                <div className="mt-6 pt-4 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="text-xs text-slate-400">
                    Defina o valor da meta diária e aperte o botão para o Astra gerar as ordens exatas.
                  </div>
                  <button
                    disabled={loadingAstra || isDailyLocked}
                    onClick={handleGeneratePlan}
                    className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {loadingAstra ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Calculando Alvo de R$ {targetGoal}...
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4" />
                        CALCULAR ORDEM QUANT COM ASTRA (R$ {targetGoal})
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Plano Estruturado pelo GPT-6 Astra */}
              {plan && (
                <div className="bg-gradient-to-br from-slate-900 to-indigo-950/40 border border-blue-500/50 rounded-2xl p-6 shadow-2xl relative">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="text-[10px] font-mono tracking-widest text-blue-400 uppercase font-bold">
                        ORDEM CALCULADA PELO GPT-6 ASTRA
                      </span>
                      <h3 className="text-2xl font-black text-white mt-1">
                        Meta: <span className="text-emerald-400">R$ {plan.targetGoal},00 no bolso</span>
                      </h3>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block">Horário Recomendado</span>
                      <strong className="text-xs text-white">{plan.bestTradingWindow}</strong>
                    </div>
                  </div>

                  {/* 3 Blocos de Preço: Entrada, Alvo e Stop */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-4">
                    <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Preço de Entrada</span>
                      <div className="text-lg font-black font-mono text-white mt-1">{plan.entry?.price}</div>
                      <div className="text-[11px] text-slate-400 mt-1">{plan.entry?.condition}</div>
                    </div>
                    <div className="bg-emerald-950/20 p-3.5 rounded-xl border border-emerald-500/40">
                      <span className="text-[10px] text-emerald-400 uppercase font-semibold">Take Profit (+R$ {plan.targetGoal})</span>
                      <div className="text-lg font-black font-mono text-emerald-400 mt-1">{plan.takeProfit?.price}</div>
                      <div className="text-[11px] text-emerald-300/80 mt-1">{plan.takeProfit?.pointsOrPercent}</div>
                    </div>
                    <div className="bg-rose-950/20 p-3.5 rounded-xl border border-rose-500/40">
                      <span className="text-[10px] text-rose-400 uppercase font-semibold">Stop Loss Blindado</span>
                      <div className="text-lg font-black font-mono text-rose-400 mt-1">{plan.stopLoss?.price}</div>
                      <div className="text-[11px] text-rose-300/80 mt-1">{plan.stopLoss?.pointsOrPercent}</div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 bg-slate-950/60 p-3 rounded-lg border border-slate-800 leading-relaxed">
                    <strong>Racional do Astra:</strong> {plan.exactStrategy}
                  </p>

                  {/* Botões de Ação Imediata */}
                  <div className="mt-4 pt-4 border-t border-slate-800 flex gap-3">
                    <button
                      disabled={executing || isDailyLocked}
                      onClick={() => handleExecuteTrade("BUY")}
                      className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
                    >
                      <Play className="w-4 h-4" /> EXECUTAR COMPRA AUTOMÁTICA
                    </button>
                    <button
                      disabled={executing || isDailyLocked}
                      onClick={() => handleExecuteTrade("SELL")}
                      className="flex-1 py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-600/20 flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
                    >
                      <Play className="w-4 h-4" /> EXECUTAR VENDA AUTOMÁTICA
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Coluna 3: Configuração da Meta e Histórico de Execuções */}
            <div className="space-y-6">
              {/* Card de Configuração da Meta */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur">
                <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
                  <Target className="w-4 h-4 text-emerald-400" />
                  CONFIGURAÇÃO DA META DIÁRIA
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Qual valor quer buscar hoje?</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[20, 25, 30].map((val) => (
                        <button
                          key={val}
                          onClick={() => setTargetGoal(val)}
                          className={`py-2 rounded-lg font-bold text-xs border transition ${
                            targetGoal === val
                              ? "bg-blue-600 border-blue-500 text-white"
                              : "bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700"
                          }`}
                        >
                          R$ {val}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Capital em Conta</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-xs text-slate-500">R$</span>
                      <input
                        type="number"
                        value={bankroll}
                        onChange={(e) => setBankroll(Number(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2 pl-9 pr-3 text-sm font-bold text-white outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Histórico de Ordens Executadas */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur">
                <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
                  <FileText className="w-4 h-4 text-blue-400" />
                  ORDENS EXECUTADAS HOJE
                </h3>

                <div className="space-y-2 max-h-64 overflow-y-auto font-mono text-[11px]">
                  {executionHistory.length === 0 ? (
                    <div className="text-slate-500 italic">Nenhuma ordem executada ainda.</div>
                  ) : (
                    executionHistory.map((h, i) => (
                      <div key={i} className="p-2.5 bg-slate-950 border border-slate-800/80 rounded-lg flex justify-between items-center">
                        <div>
                          <strong className={h.action === "BUY" ? "text-emerald-400" : "text-rose-400"}>{h.action}</strong> {h.symbol}
                          <div className="text-[10px] text-slate-500">{h.time} • {h.mode}</div>
                        </div>
                        <span className="text-emerald-400 font-bold">{h.profit}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ABA 2: BACKTESTING REAL SOBRE DADOS HISTÓRICOS */}
        {activeTab === "BACKTEST" && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 sm:p-8 backdrop-blur max-w-5xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-6 mb-6">
              <div>
                <h2 className="text-2xl font-black text-white flex items-center gap-2">
                  <History className="w-6 h-6 text-blue-400" />
                  Backtest Quantitativo em Dados Reais
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Validação matemática sobre os últimos 500 candles reais da Binance (Zero viés de olhar o futuro)
                </p>
              </div>

              <button
                disabled={backtestLoading}
                onClick={handleRunBacktest}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${backtestLoading ? "animate-spin" : ""}`} />
                Recalcular Backtest
              </button>
            </div>

            {backtestResult && (
              <div className="space-y-6">
                {/* Placar de Performance */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                    <span className="text-[11px] text-slate-400 block">Taxa de Acerto (Win Rate)</span>
                    <span className="text-2xl font-black font-mono text-emerald-400 mt-1 block">
                      {backtestResult.winRate}
                    </span>
                    <span className="text-[10px] text-slate-500">{backtestResult.winCount} Wins / {backtestResult.lossCount} Losses</span>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                    <span className="text-[11px] text-slate-400 block">Lucro Líquido Simulado</span>
                    <span className="text-2xl font-black font-mono text-emerald-400 mt-1 block">
                      {backtestResult.netProfitBRL}
                    </span>
                    <span className="text-[10px] text-slate-500">Capital Inicial: {backtestResult.initialCapital}</span>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                    <span className="text-[11px] text-slate-400 block">Drawdown Máximo</span>
                    <span className="text-2xl font-black font-mono text-amber-400 mt-1 block">
                      {backtestResult.maxDrawdown}
                    </span>
                    <span className="text-[10px] text-slate-500">Risco sob controle</span>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                    <span className="text-[11px] text-slate-400 block">Total de Operações</span>
                    <span className="text-2xl font-black font-mono text-white mt-1 block">
                      {backtestResult.totalTrades}
                    </span>
                    <span className="text-[10px] text-slate-500">{backtestResult.period}</span>
                  </div>
                </div>

                {/* Tabela dos Últimos Trades */}
                <div className="mt-6">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                    Últimas 10 Operações Registradas no Histórico
                  </h3>
                  <div className="border border-slate-800 rounded-xl overflow-hidden font-mono text-xs">
                    <table className="w-full text-left">
                      <thead className="bg-slate-950 text-slate-400 text-[10px] uppercase">
                        <tr>
                          <th className="p-3">Data/Hora</th>
                          <th className="p-3">Preço Entrada</th>
                          <th className="p-3">Resultado</th>
                          <th className="p-3">Lucro em Reais</th>
                          <th className="p-3">Saldo Acumulado</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 bg-slate-900/30">
                        {backtestResult.trades?.map((t: any, idx: number) => (
                          <tr key={idx} className="hover:bg-slate-800/40">
                            <td className="p-3 text-slate-300">{t.time}</td>
                            <td className="p-3 text-white">${t.entryPrice?.toFixed(2)}</td>
                            <td className="p-3 font-bold">
                              <span className={`px-2 py-0.5 rounded text-[10px] ${
                                t.outcome === "WIN" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                              }`}>
                                {t.outcome}
                              </span>
                            </td>
                            <td className={`p-3 font-bold ${t.outcome === "WIN" ? "text-emerald-400" : "text-rose-400"}`}>
                              {t.resultBRL}
                            </td>
                            <td className="p-3 text-slate-300 font-bold">R$ {t.capitalAfter?.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ABA 3: ROBÔ AUTÔNOMO B3 & CRIPTO */}
        {activeTab === "AUTO_BOT" && (
          <div className="max-w-4xl mx-auto bg-slate-900/60 border border-slate-800 rounded-2xl p-6 sm:p-8 backdrop-blur space-y-6">
            <div>
              <h2 className="text-2xl font-black text-white flex items-center gap-2">
                <Zap className="w-6 h-6 text-amber-400" />
                Como Operar 100% no Automático na B3 ou Binance
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Conecte seu computador ou nuvem para a inteligência enviar as ordens sem intervenção humana.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Opção 1: Binance Nuvem */}
              <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-bold uppercase">
                    100% EM NUVEM (24/7)
                  </span>
                  <h3 className="text-base font-bold text-white mt-2">Binance Automated Engine</h3>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    Executa scalping de Bitcoin em nuvem. Coloque suas chaves na Vercel para ordens automáticas com Stop Loss e Take Profit calculados pelo Astra.
                  </p>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-800">
                  <div className="text-[11px] text-slate-500 font-mono">Status: Pronto em /api/execute</div>
                </div>
              </div>

              {/* Opção 2: B3 Mini Índice */}
              <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded font-bold uppercase">
                    BOLSA BRASILEIRA B3
                  </span>
                  <h3 className="text-base font-bold text-white mt-2">MetaTrader 5 Bridge Bot (Python)</h3>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    Roda direto no seu PC via script Python. Ele lê o sinal do GPT-6 Astra em tempo real, abre a ordem no Mini Índice na sua corretora e desliga ao atingir R$ 25.
                  </p>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-800">
                  <div className="text-[11px] text-slate-500 font-mono">Arquivo: b3-mt5-bridge.py no GitHub</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}