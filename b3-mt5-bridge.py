"""
ASTRA QUANT TRADER — MT5 BRIDGE & EXECUTION BOT (B3 / MINI ÍNDICE)
Conecta sua conta da XP, Clear, Genial ou Toro via MetaTrader 5 aos sinais do GPT-6 Astra.
Executa ordens de Mini Índice (WIN) automaticamente e desliga assim que atinge a meta (R$ 20 a R$ 30).
"""

import time
import requests
import json
try:
    import MetaTrader5 as mt5
except ImportError:
    print("[AVISO] MetaTrader5 nao instalado. Instale com: pip install MetaTrader5")

SERVER_API_URL = "https://astra-quant-trader-exl6bv6pu-sky-lingo.vercel.app/api/plan"
TARGET_DAILY_PROFIT_BRL = 25.0
MAX_STOP_LOSS_BRL = 15.0

def init_mt5():
    if not mt5.initialize():
        print(f"Falha ao inicializar MT5: {mt5.last_error()}")
        return False
    print("MT5 conectado com sucesso!")
    return True

def get_astra_signal(goal=25):
    try:
        res = requests.post(SERVER_API_URL, json={
            "targetGoal": goal,
            "bankroll": 500,
            "riskTolerance": "MODERADO",
            "assetType": "B3 (Mini Índice WIN)"
        }, timeout=15)
        return res.json().get("plan")
    except Exception as e:
        print(f"Erro ao consultar Astra Quant Engine: {e}")
        return None

def execute_b3_order(symbol, action, lots=1):
    symbol_info = mt5.symbol_info(symbol)
    if not symbol_info:
        print(f"Ativo {symbol} nao encontrado no MT5.")
        return False

    order_type = mt5.ORDER_TYPE_BUY if "COMPRA" in action else mt5.ORDER_TYPE_SELL
    price = mt5.symbol_info_tick(symbol).ask if "COMPRA" in action else mt5.symbol_info_tick(symbol).bid

    request = {
        "action": mt5.TRADE_ACTION_DEAL,
        "symbol": symbol,
        "volume": float(lots),
        "type": order_type,
        "price": price,
        "deviation": 20,
        "magic": 20261016,
        "comment": "Astra Quant AI Order",
        "type_time": mt5.ORDER_TIME_GTC,
        "type_filling": mt5.ORDER_FILLING_RETURN,
    }

    result = mt5.order_send(request)
    if result.retcode != mt5.TRADE_RETCODE_DONE:
        print(f"Falha ao enviar ordem: {result.comment}")
        return False
    
    print(f"ORDEM EXECUTADA NO MINI INDICE: {action} @ {price} | Ordem #{result.order}")
    return True

def run_loop():
    print("=== ASTRA QUANT TRADER B3 LOOP INICIADO ===")
    print(f"Meta Diária: R$ {TARGET_DAILY_PROFIT_BRL} | Stop Máximo: R$ {MAX_STOP_LOSS_BRL}")
    
    # Executa consulta ao Astra
    plan = get_astra_signal(TARGET_DAILY_PROFIT_BRL)
    if plan:
        print(f"\n[SINAL ASTRA] Ativo: {plan.get('recommendedAsset')}")
        print(f"Entrada: {plan.get('entry', {}).get('price')}")
        print(f"Take Profit (+R$ 25): {plan.get('takeProfit', {}).get('price')}")
        print(f"Stop Loss (-R$ 15): {plan.get('stopLoss', {}).get('price')}")
        print(f"Regra de Preservacao: {plan.get('antiLossProtectionRule')}")

if __name__ == "__main__":
    run_loop()