<template>
  <div class="strategies">
    <div class="page-header">
      <h1 class="page-title">{{ t('strategies.title') }}</h1>
      <button class="btn btn-primary">
        <span>+</span>
        <span>{{ t('strategies.createStrategy') }}</span>
      </button>
    </div>

    <div class="strategies-grid">
      <div 
        v-for="strategy in strategies" 
        :key="strategy.id"
        class="strategy-card"
        :class="{ active: strategy.active }"
      >
        <div class="strategy-card-header">
          <div class="strategy-meta">
            <h3 class="strategy-name">{{ strategy.name }}</h3>
            <span class="strategy-file mono">{{ strategy.file }}</span>
          </div>
          <div class="strategy-status">
            <span :class="strategy.active ? 'badge badge-success' : 'badge'">
              {{ strategy.active ? t('strategies.running') : t('strategies.stopped') }}
            </span>
          </div>
        </div>

        <div class="strategy-stats">
          <div class="stat-item">
            <span class="stat-label">{{ t('strategies.totalReturn') }}</span>
            <span :class="['stat-value', strategy.totalReturn >= 0 ? 'text-success' : 'text-danger']">
              {{ strategy.totalReturn >= 0 ? '+' : '' }}{{ strategy.totalReturn }}%
            </span>
          </div>
          <div class="stat-item">
            <span class="stat-label">{{ t('strategies.trades') }}</span>
            <span class="stat-value">{{ strategy.trades }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">{{ t('strategies.winRate') }}</span>
            <span class="stat-value">{{ strategy.winRate }}%</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">{{ t('strategies.sharpeRatio') }}</span>
            <span class="stat-value">{{ strategy.sharpe }}</span>
          </div>
        </div>

        <div class="strategy-code">
          <div class="code-header">
            <span class="code-title mono">{{ t('strategies.code') }}</span>
            <button class="btn" @click="viewFullCode(strategy)">{{ t('strategies.viewFullCode') }}</button>
          </div>
          <div class="code-block">
            <pre><code>{{ strategy.codePreview }}</code></pre>
          </div>
        </div>

        <div class="strategy-params">
          <div class="params-header">
            <span class="params-title mono">{{ t('strategies.params') }}</span>
          </div>
          <div class="params-list">
            <div v-for="(value, key) in strategy.params" :key="key" class="param-item">
              <span class="param-key mono">{{ key }}</span>
              <span class="param-value mono">{{ value }}</span>
            </div>
          </div>
        </div>

        <div class="strategy-actions">
          <button 
            v-if="!strategy.active"
            class="btn btn-primary"
            @click="startStrategy(strategy.id)"
          >
            {{ t('strategies.start') }}
          </button>
          <button 
            v-else
            class="btn btn-danger"
            @click="stopStrategy(strategy.id)"
          >
            {{ t('strategies.stop') }}
          </button>
          <button class="btn">{{ t('strategies.edit') }}</button>
          <button class="btn">{{ t('strategies.backtest') }}</button>
          <button class="btn">{{ t('strategies.delete') }}</button>
        </div>
      </div>
    </div>

    <!-- 代码查看弹窗 -->
    <div 
      class="code-view-modal" 
      v-if="showCodeModal" 
      @click.self="closeCodeModal"
      @wheel.prevent="handleModalWheel"
    >
      <div class="modal-content code-modal-content">
        <div class="modal-header">
          <h2 class="modal-title">{{ currentStrategy?.name }} - 完整代码</h2>
          <button class="btn" @click="closeCodeModal">×</button>
        </div>
        <div class="modal-body code-modal-body">
          <div class="code-viewer">
            <div class="code-header-bar">
              <span class="code-file-name mono">{{ currentStrategy?.file }}</span>
              <button class="btn" @click="copyCode">复制代码</button>
            </div>
            <div class="code-content" @wheel.stop>
              <pre><code>{{ currentStrategy?.fullCode || currentStrategy?.codePreview }}</code></pre>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="create-strategy-modal" v-if="showCreateModal">
      <div class="modal-content">
        <div class="modal-header">
          <h2 class="modal-title">创建新策略</h2>
          <button class="btn" @click="showCreateModal = false">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">策略名称</label>
            <input v-model="newStrategy.name" type="text" class="input" placeholder="my_strategy">
          </div>
          <div class="form-group">
            <label class="form-label">策略描述</label>
            <textarea v-model="newStrategy.description" class="input" rows="3" placeholder="策略描述..."></textarea>
          </div>
          <div class="form-group">
            <label class="form-label">策略代码</label>
            <div class="code-editor">
              <pre><code>{{ newStrategy.code }}</code></pre>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn" @click="showCreateModal = false">取消</button>
          <button class="btn btn-primary" @click="createStrategy">创建</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, inject } from 'vue'
import { getCurrentLanguage, t as translate } from '../i18n'

const currentLanguage = inject('language', ref(getCurrentLanguage()))

// 监听语言变化
window.addEventListener('language-changed', () => {
  currentLanguage.value = getCurrentLanguage()
})

const t = (key) => translate(key, currentLanguage.value)

const showCreateModal = ref(false)
const showCodeModal = ref(false)
const currentStrategy = ref(null)

const newStrategy = ref({
  name: '',
  description: '',
  code: `def strategy():
    # 你的策略代码
    pass`
})

const strategies = computed(() => [
  {
    id: 1,
    name: t('strategies.gridTrading'),
    file: 'grid_trading_v2.py',
    active: true,
    totalReturn: 12.5,
    trades: 234,
    winRate: 65.2,
    sharpe: 1.85,
    codePreview: `def grid_trading():
    grid_size = 0.5%
    grid_count = 20
    base_price = get_current_price()
    
    for i in range(grid_count):
        buy_price = base_price * (1 - grid_size * i)
        sell_price = base_price * (1 + grid_size * i)
        place_order(buy_price, 'buy')
        place_order(sell_price, 'sell')`,
    fullCode: `#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
网格交易策略 v2.0
Grid Trading Strategy v2.0
"""

import time
from decimal import Decimal

def grid_trading():
    """
    网格交易策略主函数
    在价格波动中通过网格挂单获取收益
    """
    # 策略参数配置
    grid_size = Decimal('0.005')  # 0.5% 网格大小
    grid_count = 20  # 网格数量
    base_price = get_current_price()  # 获取当前价格
    
    # 初始化网格
    buy_orders = []
    sell_orders = []
    
    # 生成买入和卖出订单
    for i in range(grid_count):
        # 买入价格：低于基准价格
        buy_price = base_price * (Decimal('1') - grid_size * Decimal(str(i)))
        # 卖出价格：高于基准价格
        sell_price = base_price * (Decimal('1') + grid_size * Decimal(str(i)))
        
        # 下单
        buy_order = place_order(buy_price, 'buy', amount=calculate_position_size())
        sell_order = place_order(sell_price, 'sell', amount=calculate_position_size())
        
        buy_orders.append(buy_order)
        sell_orders.append(sell_order)
    
    # 监控订单执行情况
    while True:
        check_orders_status(buy_orders, sell_orders)
        time.sleep(60)  # 每分钟检查一次

def get_current_price():
    """获取当前市场价格"""
    # 实现获取价格的逻辑
    pass

def place_order(price, side, amount):
    """下单函数"""
    # 实现下单逻辑
    pass

def calculate_position_size():
    """计算仓位大小"""
    # 实现仓位计算逻辑
    pass

def check_orders_status(buy_orders, sell_orders):
    """检查订单状态并重新挂单"""
    # 实现订单状态检查逻辑
    pass

if __name__ == '__main__':
    grid_trading()`,
    params: {
      grid_size: '0.5%',
      grid_count: '20',
      base_asset: 'ETH',
      quote_asset: 'USDT'
    }
  },
  {
    id: 2,
    name: t('strategies.meanReversion'),
    file: 'mean_reversion.py',
    active: true,
    totalReturn: 8.3,
    trades: 156,
    winRate: 58.7,
    sharpe: 1.42,
    codePreview: `def mean_reversion():
    price = get_current_price()
    ma_20 = calculate_ma(20)
    ma_50 = calculate_ma(50)
    
    if price < ma_20 * 0.98:
        place_buy_order()
    elif price > ma_20 * 1.02:
        place_sell_order()`,
    fullCode: `#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
均值回归策略
Mean Reversion Strategy
"""

import pandas as pd
import numpy as np

def mean_reversion():
    """
    均值回归策略主函数
    当价格偏离移动平均线时进行反向交易
    """
    # 获取当前价格和历史数据
    price = get_current_price()
    historical_data = get_historical_data(period=50)
    
    # 计算移动平均线
    ma_20 = calculate_ma(historical_data, period=20)
    ma_50 = calculate_ma(historical_data, period=50)
    
    # 计算价格偏离度
    deviation_20 = (price - ma_20) / ma_20
    
    # 交易逻辑
    if price < ma_20 * 0.98:  # 价格低于MA20的2%
        # 买入信号：价格被低估，预期回归均值
        place_buy_order(
            price=price,
            amount=calculate_position_size(deviation_20)
        )
    elif price > ma_20 * 1.02:  # 价格高于MA20的2%
        # 卖出信号：价格被高估，预期回归均值
        place_sell_order(
            price=price,
            amount=calculate_position_size(deviation_20)
        )
    
    # 止损止盈
    check_stop_loss_take_profit()

def calculate_ma(data, period):
    """计算移动平均线"""
    return data['close'].rolling(window=period).mean().iloc[-1]

def get_current_price():
    """获取当前价格"""
    pass

def get_historical_data(period):
    """获取历史数据"""
    pass

def place_buy_order(price, amount):
    """买入订单"""
    pass

def place_sell_order(price, amount):
    """卖出订单"""
    pass

def calculate_position_size(deviation):
    """根据偏离度计算仓位大小"""
    pass

def check_stop_loss_take_profit():
    """检查止损止盈"""
    pass`,
    params: {
      ma_short: '20',
      ma_long: '50',
      deviation: '2%',
      position_size: '10%'
    }
  },
  {
    id: 3,
    name: t('strategies.trendFollowing'),
    file: 'trend_following.py',
    active: false,
    totalReturn: -2.1,
    trades: 89,
    winRate: 45.2,
    sharpe: 0.78,
    codePreview: `def trend_following():
    rsi = calculate_rsi(14)
    macd = calculate_macd()
    
    if rsi > 70 and macd > 0:
        place_sell_order()
    elif rsi < 30 and macd < 0:
        place_buy_order()`,
    fullCode: `#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
趋势跟踪策略
Trend Following Strategy
"""

def trend_following():
    """
    趋势跟踪策略主函数
    使用RSI和MACD指标识别趋势并跟随
    """
    # 计算技术指标
    rsi = calculate_rsi(period=14)
    macd_line, signal_line, histogram = calculate_macd()
    
    # 交易逻辑
    if rsi > 70 and macd_line > signal_line:
        # 超买且MACD向上：卖出信号
        place_sell_order()
    elif rsi < 30 and macd_line < signal_line:
        # 超卖且MACD向下：买入信号
        place_buy_order()
    
    # 趋势确认
    if histogram > 0 and rsi > 50:
        # 上升趋势确认
        increase_position()
    elif histogram < 0 and rsi < 50:
        # 下降趋势确认
        decrease_position()

def calculate_rsi(period):
    """计算RSI指标"""
    pass

def calculate_macd():
    """计算MACD指标"""
    pass

def place_buy_order():
    """买入订单"""
    pass

def place_sell_order():
    """卖出订单"""
    pass

def increase_position():
    """增加仓位"""
    pass

def decrease_position():
    """减少仓位"""
    pass`,
    params: {
      rsi_period: '14',
      rsi_oversold: '30',
      rsi_overbought: '70',
      macd_fast: '12',
      macd_slow: '26'
    }
  },
  {
    id: 4,
    name: t('strategies.arbitrage'),
    file: 'arbitrage.py',
    active: true,
    totalReturn: 15.7,
    trades: 312,
    winRate: 92.3,
    sharpe: 2.15,
    codePreview: `def arbitrage():
    price_a = get_price('exchange_a')
    price_b = get_price('exchange_b')
    spread = abs(price_a - price_b) / price_a
    
    if spread > 0.5%:
        buy_low_exchange()
        sell_high_exchange()`,
    fullCode: `#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
套利策略
Arbitrage Strategy
"""

from decimal import Decimal

def arbitrage():
    """
    套利策略主函数
    在不同交易所之间寻找价差并套利
    """
    # 获取不同交易所的价格
    price_a = get_price('exchange_a')  # 交易所A的价格
    price_b = get_price('exchange_b')  # 交易所B的价格
    
    # 计算价差
    spread = abs(price_a - price_b) / price_a
    min_spread = Decimal('0.005')  # 最小价差0.5%
    
    # 套利逻辑
    if spread > min_spread:
        if price_a < price_b:
            # A交易所价格低，B交易所价格高
            buy_low_exchange('exchange_a', price_a)
            sell_high_exchange('exchange_b', price_b)
        else:
            # B交易所价格低，A交易所价格高
            buy_low_exchange('exchange_b', price_b)
            sell_high_exchange('exchange_a', price_a)
        
        # 计算收益
        profit = calculate_profit(price_a, price_b)
        log_arbitrage_result(profit)

def get_price(exchange):
    """获取指定交易所的价格"""
    pass

def buy_low_exchange(exchange, price):
    """在低价交易所买入"""
    pass

def sell_high_exchange(exchange, price):
    """在高价交易所卖出"""
    pass

def calculate_profit(price_a, price_b):
    """计算套利收益"""
    return abs(price_a - price_b)

def log_arbitrage_result(profit):
    """记录套利结果"""
    pass`,
    params: {
      min_spread: '0.5%',
      exchange_a: 'Binance',
      exchange_b: 'OKX',
      max_position: '1000 USDT'
    }
  }
])

const startStrategy = (id) => {
  const strategy = strategies.value.find(s => s.id === id)
  if (strategy) {
    strategy.active = true
  }
}

const stopStrategy = (id) => {
  const strategy = strategies.value.find(s => s.id === id)
  if (strategy) {
    strategy.active = false
  }
}

const createStrategy = () => {
  // 创建策略逻辑
  showCreateModal.value = false
}

const viewFullCode = (strategy) => {
  currentStrategy.value = strategy
  showCodeModal.value = true
  // 禁用主页面滚动
  document.body.style.overflow = 'hidden'
}

const closeCodeModal = () => {
  showCodeModal.value = false
  // 恢复主页面滚动
  document.body.style.overflow = ''
}

const handleModalWheel = (e) => {
  // 阻止弹窗背景的滚动事件冒泡
  e.stopPropagation()
}

const copyCode = async () => {
  const code = currentStrategy.value?.fullCode || currentStrategy.value?.codePreview
  if (code) {
    try {
      await navigator.clipboard.writeText(code)
      alert('代码已复制到剪贴板')
    } catch (err) {
      console.error('复制失败:', err)
    }
  }
}
</script>

<style scoped>
.strategies {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
}

.page-title {
  font-family: var(--font-mono);
  font-size: 24px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.strategies-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(500px, 1fr));
  gap: var(--spacing-lg);
}

.strategy-card {
  /* 磨砂玻璃效果已在 main.css 中定义 */
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.strategy-card.active {
  border-color: var(--success);
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.1),
    0 0 0 1px var(--success);
}

.strategy-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.strategy-meta {
  flex: 1;
}

.strategy-name {
  font-family: var(--font-mono);
  font-size: 18px;
  font-weight: 600;
  margin-bottom: var(--spacing-xs);
  color: var(--text-primary);
}

.strategy-file {
  font-size: 11px;
  color: var(--text-muted);
}

.strategy-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background: var(--bg-tertiary);
  border-radius: var(--radius-md);
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.stat-label {
  font-size: 10px;
  color: var(--text-muted);
  font-family: var(--font-mono);
}

.stat-value {
  font-size: 16px;
  font-weight: 600;
  font-family: var(--font-mono);
}

.strategy-code {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.code-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.code-title {
  font-size: 11px;
  color: var(--text-muted);
}

.code-block {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: var(--spacing-md);
  overflow-x: auto;
}

.code-block pre {
  margin: 0;
  font-family: var(--font-mono);
  font-size: 11px;
  line-height: 1.6;
  color: var(--text-primary);
}

.code-block code {
  color: var(--text-primary);
}

.strategy-params {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.params-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.params-title {
  font-size: 11px;
  color: var(--text-muted);
}

.params-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm);
  background: var(--bg-tertiary);
  border-radius: var(--radius-md);
}

.param-item {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  font-family: var(--font-mono);
}

.param-key {
  color: var(--text-muted);
}

.param-value {
  color: var(--text-primary);
  font-weight: 500;
}

.strategy-actions {
  display: flex;
  gap: var(--spacing-sm);
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--border-color);
}

.strategy-actions .btn {
  flex: 1;
}

.create-strategy-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--border-color);
}

.modal-title {
  font-family: var(--font-mono);
  font-size: 18px;
  font-weight: 600;
}

.modal-body {
  padding: var(--spacing-lg);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm);
  padding: var(--spacing-lg);
  border-top: 1px solid var(--border-color);
}

.code-editor {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: var(--spacing-md);
  min-height: 200px;
}

.code-editor pre {
  margin: 0;
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--text-primary);
}

textarea.input {
  resize: vertical;
  font-family: var(--font-mono);
}

/* 代码查看弹窗样式 */
.code-view-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  overflow: hidden;
}

.code-modal-content {
  width: 90%;
  max-width: 1000px;
  height: 85vh;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  background: rgba(22, 27, 34, 0.95);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 
    0 20px 60px rgba(0, 0, 0, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.code-modal-body {
  padding: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}

.code-viewer {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  overflow: hidden;
}

.code-header-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(0, 0, 0, 0.2);
}

.code-file-name {
  font-size: 12px;
  color: var(--text-muted);
}

.code-content {
  flex: 1 1 0;
  overflow-y: scroll;
  overflow-x: auto;
  padding: var(--spacing-lg);
  background: var(--bg-primary);
  min-height: 0;
  position: relative;
}

/* 代码内容滚动条样式 */
.code-content::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.code-content::-webkit-scrollbar-track {
  background: var(--bg-secondary);
  border-radius: 4px;
}

.code-content::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 4px;
}

.code-content::-webkit-scrollbar-thumb:hover {
  background: var(--border-hover);
}

.code-content pre {
  margin: 0;
  padding: 0;
  font-family: var(--font-mono);
  font-size: 13px;
  line-height: 1.6;
  color: var(--text-primary);
  white-space: pre;
  word-wrap: normal;
  overflow: visible;
}

.code-content code {
  color: var(--text-primary);
  font-family: var(--font-mono);
}
</style>
