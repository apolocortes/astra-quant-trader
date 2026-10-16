"use client";

import { useState } from "react";
import {
  Sparkles,
  Cpu,
  Target,
  ShieldCheck,
  TrendingUp,
  AlertOctagon,
  ArrowRight,
  Clock,
  Layers,
  CheckCircle2,
  Lock,
  Wallet,
  Zap,
  DollarSign,
  Flame,
  ChevronRight,
  BarChart2
} from "lucide-react";

export default function AstraQuantMaster() {
  // Inputs Simples para o Usuário
  const [targetGoal, setTargetGoal] = useState<number>(25);
  const [bankroll, setBankroll] = useState<number>(300);
  const [riskTolerance, setRiskTolerance] = useState<string>("MODERADO");
  const [assetType, setAssetType] = useState<string>("B3 (Mini Índice WIN)");

  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<any>(null);
  const [metaBatida, setMetaBatida] = useState(false);

  const presets = [
    { label: "R$ 20 / dia", value: 20, desc: "Conservador • 100 pontos no Mini Índice" },
    { label: "R$ 25 / dia", value: 25, desc: "Equilibrado • Alvo recomendado da consistência" },
    { label: "R$ 30 / dia", value: 30, desc: "Avançado • 150 pontos ou 2 scalps rápidos" },
    { label: "R$ 50 / dia", value: 50, desc: "Profissional • Exige maior paciência de timing" },
  ];

  const handleGeneratePlan = async (val?: number) => {
    const goalToUse = val !== undefined ? val : targetGoal;
    setLoading(true);
    setMetaBatida(false);
    try {
      const res = await fetch("/api/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetGoal: goalToUse,
          bankroll,
          riskTolerance,
          assetType,
        }),
      });
      const data = await res.json();
      if (data.success && data.plan) {
        setPlan(data.plan);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#060911] text-slate-100 flex flex-col items-center">
      {/* Top Banner IA Status */}
      <div className="w-full bg-gradient-to-r from-blue-950/60 via-indigo-900/40 to-slate-900 border-b border-blue-500/20 py-2.5 px-4">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between text-xs text-slate-300 gap-2">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-semibold text-white">GPT-6 ASTRA QUANT ENGINE</span>
            <span className="text-slate-500">•</span>
            <span className="text-blue-400 font-mono">192.6M Tokens Ativos</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span>Latência média: <strong className="text-emerald-400">1.8s</strong></span>
            <span>Meta Diária Típica: <strong className="text-white">R$ 20 – R$ 30</strong></span>
          </div>
        </div>
      </div>

      <div className="w-full max-w-6xl px-4 py-8 flex flex-col items-center">
        {/* Header Principal */}
        <div className="text-center max-w-2xl mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" /> INTELIGÊNCIA MÁXIMA DE TRADING
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            Quanto você quer lucrar <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">hoje</span>?
          </h1>
          <p className="text-slate-400 text-sm mt-3 leading-relaxed">
            Digite o valor exato da sua meta diária. O <strong>GPT-6 Astra</strong> calcula o ativo, o horário exato, os pontos de entrada, o gain e a trava de risco automática.
          </p>
        </div>

        {/* INPUT CARD — DEFINA APENAS O VALOR */}
        <div className="w-full max-w-3xl bg-slate-900/70 border border-slate-800 rounded-2xl p-6 sm:p-8 backdrop-blur shadow-2xl relative overflow-hidden">
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

          {/* Presets Rápidos */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {presets.map((p) => (
              <button
                key={p.value}
                onClick={() => {
                  setTargetGoal(p.value);
                  handleGeneratePlan(p.value);
                }}
                className={`p-3 rounded-xl border text-left transition-all ${
                  targetGoal === p.value
                    ? "bg-blue-600/20 border-blue-500 shadow-lg shadow-blue-500/10"
                    : "bg-slate-950/60 border-slate-800/80 hover:border-slate-700"
                }`}
              >
                <div className={`text-base font-bold ${targetGoal === p.value ? "text-emerald-400" : "text-white"}`}>
                  {p.label}
                </div>
                <div className="text-[10px] text-slate-400 mt-1 leading-tight">{p.desc}</div>
              </button>
            ))}
          </div>

          {/* Campo de Valor Customizado */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
            <div className="sm:col-span-1">
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-blue-400" /> Meta de Lucro (R$)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-sm font-bold text-slate-500">R$</span>
                <input
                  type="number"
                  value={targetGoal}
                  onChange={(e) => setTargetGoal(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 pl-10 pr-3 text-lg font-bold text-emerald-400 focus:border-blue-500 outline-none"
                />
              </div>
            </div>

            <div className="sm:col-span-1">
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 flex items-center gap-1.5">
                <Wallet className="w-3.5 h-3.5 text-purple-400" /> Capital na Corretora (R$)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-sm font-bold text-slate-500">R$</span>
                <input
                  type="number"
                  value={bankroll}
                  onChange={(e) => setBankroll(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 pl-10 pr-3 text-lg font-bold text-white focus:border-blue-500 outline-none"
                />
              </div>
            </div>

            <div className="sm:col-span-1">
              <button
                disabled={loading}
                onClick={() => handleGeneratePlan()}
                className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Cpu className="w-4 h-4 animate-spin" />
                    Calculando...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    Gerar Plano Completo
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* PLANO DE EXECUÇÃO GERADO PELO ASTRA */}
        {plan && (
          <div className="w-full max-w-4xl mt-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header do Resultado */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/40 border border-blue-500/40 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-6">
                <div>
                  <span className="text-[10px] font-mono tracking-widest text-blue-400 uppercase font-bold">
                    PLANO QUANTITATIVO HOMOLOGADO • GPT-6 ASTRA
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-white mt-1 flex items-center gap-2">
                    Objetivo: <span className="text-emerald-400">R$ {plan.targetGoal},00 no bolso</span>
                  </h2>
                </div>
                <div className="flex items-center gap-3 bg-slate-950/80 border border-slate-800 px-4 py-2 rounded-xl">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <div className="text-xs">
                    <span className="text-slate-400 block text-[10px]">Melhor Janela de Horário</span>
                    <strong className="text-white">{plan.bestTradingWindow}</strong>
                  </div>
                </div>
              </div>

              {/* Grid de 3 Pilares: Entrada, Alvo e Stop */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                {/* Entrada */}
                <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-400">1. Ponto de Entrada</span>
                    <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded font-mono font-bold">
                      {plan.recommendedAsset}
                    </span>
                  </div>
                  <div className="text-2xl font-black font-mono text-white mt-2">
                    {plan.entry?.price}
                  </div>
                  <div className="text-xs text-slate-400 mt-1 leading-relaxed">
                    {plan.entry?.condition}
                  </div>
                </div>

                {/* Take Profit (Ganho da Meta) */}
                <div className="bg-emerald-950/20 border border-emerald-500/40 p-4 rounded-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-emerald-400">2. Take Profit (Alvo)</span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-bold">
                      +R$ {plan.takeProfit?.expectedProfitBRL},00
                    </span>
                  </div>
                  <div className="text-2xl font-black font-mono text-emerald-400 mt-2">
                    {plan.takeProfit?.price}
                  </div>
                  <div className="text-xs text-emerald-300/80 mt-1">
                    {plan.takeProfit?.pointsOrPercent}
                  </div>
                </div>

                {/* Stop Loss (Risco Máximo) */}
                <div className="bg-rose-950/20 border border-rose-500/40 p-4 rounded-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-rose-400">3. Stop Loss Blindado</span>
                    <span className="text-[10px] bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded font-bold">
                      -R$ {plan.stopLoss?.maxRiskBRL},00
                    </span>
                  </div>
                  <div className="text-2xl font-black font-mono text-rose-400 mt-2">
                    {plan.stopLoss?.price}
                  </div>
                  <div className="text-xs text-rose-300/80 mt-1">
                    {plan.stopLoss?.pointsOrPercent}
                  </div>
                </div>
              </div>

              {/* Relação Risco Retorno & Estratégia */}
              <div className="mt-6 bg-slate-950/60 border border-slate-800/80 p-4 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="text-xs text-slate-300">
                  <strong className="text-white block mb-0.5">Estratégia Quantitativa:</strong>
                  {plan.exactStrategy}
                </div>
                <div className="shrink-0 bg-blue-500/10 border border-blue-500/30 px-3 py-1.5 rounded-lg text-xs font-mono font-bold text-blue-300">
                  Risco/Retorno: {plan.riskRewardRatio}
                </div>
              </div>

              {/* Passo a Passo de Execução Simples */}
              <div className="mt-6">
                <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Passo a Passo Para Executar Agora na Sua Corretora:
                </h3>
                <div className="space-y-2">
                  {plan.stepByStepExecution?.map((step: string, idx: number) => (
                    <div key={idx} className="flex items-start gap-3 bg-slate-950/80 border border-slate-800/60 p-3 rounded-lg text-xs text-slate-300">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-600/30 text-blue-400 font-bold text-[10px]">
                        {idx + 1}
                      </span>
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Regra de Preservação e Disciplina */}
              <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-start gap-3 text-xs text-amber-200/90 leading-relaxed">
                <AlertOctagon className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-amber-300 block mb-0.5">TRAVA DE SEGURANÇA MENTAL:</strong>
                  {plan.antiLossProtectionRule}
                </div>
              </div>

              {/* Botão de Conclusão / Meta Batida */}
              <div className="mt-6 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-slate-400">
                  Executou a operação e atingiu o alvo?
                </div>
                <button
                  onClick={() => setMetaBatida(true)}
                  className={`px-6 py-3 rounded-xl font-bold text-xs flex items-center gap-2 transition cursor-pointer ${
                    metaBatida
                      ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/30"
                      : "bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/40"
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {metaBatida ? "META DO DIA BATIDA (+R$ " + plan.targetGoal + ")! DESLIGUE A TELA" : "REGISTRAR META BATIDA HOJE"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}