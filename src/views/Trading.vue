<template>
  <div class="trading">
    <div class="page-header">
      <h1 class="page-title">{{ t('trading.title') }}</h1>
      <div class="page-meta">
        <span class="meta-item mono">{{ t('trading.gasPrice') }}: 23 Gwei</span>
        <span class="meta-item mono">{{ t('trading.slippage') }}: 0.5%</span>
      </div>
    </div>

    <div class="trading-layout">
      <div class="trading-main">
        <div class="chart-section">
          <div class="chart-header">
            <div class="pair-selector">
              <select v-model="selectedPair" class="input">
                <option value="ETH/USDT">ETH/USDT</option>
                <option value="BTC/USDT">BTC/USDT</option>
                <option value="SOL/USDT">SOL/USDT</option>
              </select>
            </div>
            <div class="chart-controls">
              <button 
                v-for="period in periods" 
                :key="period"
                class="btn"
                :class="{ 'btn-primary': selectedPeriod === period }"
                @click="selectedPeriod = period"
              >
                {{ period }}
              </button>
            </div>
          </div>
          <div ref="priceChart" class="price-chart"></div>
          <div class="chart-info">
            <div class="info-item">
              <span class="info-label">{{ t('trading.latestPrice') }}</span>
              <span class="info-value text-success mono">$2,756.23</span>
            </div>
            <div class="info-item">
              <span class="info-label">{{ t('trading.change24h') }}</span>
              <span class="info-value text-success mono">+2.45%</span>
            </div>
            <div class="info-item">
              <span class="info-label">{{ t('trading.high24h') }}</span>
              <span class="info-value mono">$2,789.50</span>
            </div>
            <div class="info-item">
              <span class="info-label">{{ t('trading.low24h') }}</span>
              <span class="info-value mono">$2,712.30</span>
            </div>
          </div>
        </div>

        <div class="orderbook-section">
          <div class="section-header">
            <h2 class="section-title">{{ t('trading.orderBook') }}</h2>
            <button class="btn" @click="refreshOrderbook">{{ t('common.refresh') }}</button>
          </div>
          <div class="orderbook">
            <!-- 卖单区域（从上到下价格递增） -->
            <div class="orderbook-side">
              <div class="orderbook-header ask-header">
                <span>{{ t('trading.price') }}</span>
                <span>{{ t('trading.quantity') }}</span>
                <span>{{ t('trading.total') }}</span>
              </div>
              <div 
                v-for="(ask, index) in sortedAsks" 
                :key="`ask-${index}`"
                class="orderbook-row ask-row"
                :style="{ opacity: 0.6 + (index / sortedAsks.length) * 0.4 }"
                @click="fillOrderPrice(ask.price, 'sell')"
                :title="`${t('common.clickToFill')} ${ask.price}`"
              >
                <span class="mono text-danger">{{ formatPrice(ask.price) }}</span>
                <span class="mono">{{ formatAmount(ask.amount) }}</span>
                <span class="mono text-muted">{{ formatAmount(ask.total) }}</span>
              </div>
            </div>
            
            <!-- 价差区域 -->
            <div class="orderbook-spread">
              <div class="spread-info">
                <span class="spread-label">{{ t('trading.spread') }}</span>
                <span class="spread-value mono">{{ formatSpread }}</span>
              </div>
              <div class="spread-info">
                <span class="spread-label">{{ t('trading.bestAsk') }}</span>
                <span class="spread-value mono text-danger">{{ formatPrice(bestAsk) }}</span>
              </div>
              <div class="spread-info">
                <span class="spread-label">{{ t('trading.bestBid') }}</span>
                <span class="spread-value mono text-success">{{ formatPrice(bestBid) }}</span>
              </div>
            </div>
            
            <!-- 买单区域（从上到下价格递减） -->
            <div class="orderbook-side">
              <div 
                v-for="(bid, index) in sortedBids" 
                :key="`bid-${index}`"
                class="orderbook-row bid-row"
                :style="{ opacity: 0.6 + (index / sortedBids.length) * 0.4 }"
                @click="fillOrderPrice(bid.price, 'buy')"
                :title="`${t('common.clickToFill')} ${bid.price}`"
              >
                <span class="mono text-success">{{ formatPrice(bid.price) }}</span>
                <span class="mono">{{ formatAmount(bid.amount) }}</span>
                <span class="mono text-muted">{{ formatAmount(bid.total) }}</span>
              </div>
              <div class="orderbook-header bid-header">
                <span>{{ t('trading.price') }}</span>
                <span>{{ t('trading.quantity') }}</span>
                <span>{{ t('trading.total') }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="trading-sidebar">
        <div class="order-panel">
          <div class="panel-tabs">
            <button 
              v-for="tab in orderTabs"
              :key="tab"
              class="tab-btn"
              :class="{ active: activeTab === tab }"
              @click="activeTab = tab"
            >
              {{ tab === '限价' ? t('trading.limitOrder') : t('trading.marketOrder') }}
            </button>
          </div>

          <div v-if="activeTab === '限价'" class="order-form">
            <div class="form-group">
              <label class="form-label">{{ t('trading.price') }} (USDT)</label>
              <input v-model="orderForm.price" type="number" class="input" placeholder="0.00">
            </div>
            <div class="form-group">
              <label class="form-label">{{ t('trading.quantity') }} (ETH)</label>
              <input v-model="orderForm.amount" type="number" class="input" placeholder="0.00">
            </div>
            <div class="form-group">
              <label class="form-label">{{ t('trading.total') }}</label>
              <input :value="totalAmount" type="text" class="input" readonly>
            </div>
            <div class="form-actions">
              <button class="btn btn-primary buy-btn" style="flex: 1;">
                {{ t('common.buy') }} ETH
              </button>
              <button class="btn btn-danger sell-btn" style="flex: 1;">
                {{ t('common.sell') }} ETH
              </button>
            </div>
          </div>

          <div v-if="activeTab === '市价'" class="order-form">
            <div class="form-group">
              <label class="form-label">{{ t('trading.quantity') }} (ETH)</label>
              <input v-model="marketOrder.amount" type="number" class="input" placeholder="0.00">
            </div>
            <div class="form-actions">
              <button class="btn btn-primary buy-btn" style="flex: 1;">
                {{ t('trading.marketBuy') }}
              </button>
              <button class="btn btn-danger sell-btn" style="flex: 1;">
                {{ t('trading.marketSell') }}
              </button>
            </div>
          </div>
        </div>

        <div class="positions-panel">
          <div class="panel-header">
            <h3 class="panel-title">{{ t('trading.positions') }}</h3>
            <button class="btn" @click="router.push('/orders')">{{ t('common.all') }}</button>
          </div>
          <div class="positions-list">
            <div v-for="position in positions" :key="position.id" class="position-item">
              <div class="position-header">
                <span class="position-pair">{{ position.pair }}</span>
                <span :class="position.pnl >= 0 ? 'badge badge-success' : 'badge badge-danger'">
                  {{ position.pnl >= 0 ? '+' : '' }}{{ position.pnl }}%
                </span>
              </div>
              <div class="position-details">
                <div class="detail-row">
                  <span class="detail-label">{{ t('trading.quantity') }}</span>
                  <span class="detail-value mono">{{ position.amount }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">{{ t('trading.avgPrice') }}</span>
                  <span class="detail-value mono">${{ position.avgPrice }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">{{ t('trading.unrealizedPnl') }}</span>
                  <span :class="['detail-value', 'mono', position.pnl >= 0 ? 'text-success' : 'text-danger']">
                    {{ position.pnl >= 0 ? '+' : '' }}${{ position.unrealizedPnl }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="orders-panel">
          <div class="panel-header">
            <h3 class="panel-title">{{ t('trading.activeOrders') }}</h3>
            <button class="btn" @click="router.push('/orders')">{{ t('common.all') }}</button>
          </div>
          <div class="orders-list">
            <div v-for="order in activeOrders" :key="order.id" class="order-item">
              <div class="order-header">
                <span :class="order.side === 'buy' ? 'text-success' : 'text-danger'">
                  {{ order.side === 'buy' ? t('common.buy') : t('common.sell') }}
                </span>
                <span class="order-pair mono">{{ order.pair }}</span>
              </div>
              <div class="order-details">
                <div class="detail-row">
                  <span class="detail-label">{{ t('trading.price') }}</span>
                  <span class="detail-value mono">${{ order.price }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">{{ t('trading.quantity') }}</span>
                  <span class="detail-value mono">{{ order.amount }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">{{ t('dashboard.status') }}</span>
                  <span class="badge">{{ order.status }}</span>
                </div>
              </div>
              <button class="btn btn-cancel">
                {{ t('trading.cancelOrder') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, inject } from 'vue'
import { useRouter } from 'vue-router'
import { getCurrentLanguage, t as translate } from '../i18n'
import * as echarts from 'echarts'

const router = useRouter()
const currentLanguage = inject('language', ref(getCurrentLanguage()))

// 监听语言变化
window.addEventListener('language-changed', () => {
  currentLanguage.value = getCurrentLanguage()
})

const t = (key) => translate(key, currentLanguage.value)

const selectedPair = ref('ETH/USDT')
const selectedPeriod = ref('1H')
const periods = ['15M', '1H', '4H', '1D', '1W']

const activeTab = ref('限价')
const orderTabs = ['限价', '市价']

const orderForm = ref({
  price: '',
  amount: ''
})

const marketOrder = ref({
  amount: ''
})

const totalAmount = computed(() => {
  if (orderForm.value.price && orderForm.value.amount) {
    return (parseFloat(orderForm.value.price) * parseFloat(orderForm.value.amount)).toFixed(2)
  }
  return '0.00'
})

const orderbook = ref({
  asks: [
    { price: '2756.35', amount: '1.2', total: '1.2' },
    { price: '2756.30', amount: '0.8', total: '2.0' },
    { price: '2756.25', amount: '2.5', total: '4.5' },
    { price: '2756.20', amount: '1.5', total: '6.0' },
    { price: '2756.15', amount: '3.0', total: '9.0' }
  ],
  bids: [
    { price: '2756.23', amount: '2.1', total: '2.1' },
    { price: '2756.18', amount: '1.8', total: '3.9' },
    { price: '2756.15', amount: '1.2', total: '5.1' },
    { price: '2756.10', amount: '2.5', total: '7.6' },
    { price: '2756.05', amount: '1.5', total: '9.1' }
  ]
})

// 排序后的订单簿数据
const sortedAsks = computed(() => {
  // 卖单：从最低价到最高价排序（从上到下显示）
  return [...orderbook.value.asks].sort((a, b) => parseFloat(a.price) - parseFloat(b.price))
})

const sortedBids = computed(() => {
  // 买单：从最高价到最低价排序（从上到下显示）
  return [...orderbook.value.bids].sort((a, b) => parseFloat(b.price) - parseFloat(a.price))
})

// 最佳买卖价
const bestAsk = computed(() => {
  return sortedAsks.value.length > 0 ? sortedAsks.value[0].price : '0'
})

const bestBid = computed(() => {
  return sortedBids.value.length > 0 ? sortedBids.value[0].price : '0'
})

// 价差
const formatSpread = computed(() => {
  const ask = parseFloat(bestAsk.value)
  const bid = parseFloat(bestBid.value)
  if (ask > 0 && bid > 0) {
    const spread = ask - bid
    const spreadPercent = ((spread / bid) * 100).toFixed(4)
    return `$${spread.toFixed(2)} (${spreadPercent}%)`
  }
  return '$0.00'
})

// 格式化价格
const formatPrice = (price) => {
  const num = parseFloat(price)
  return num.toFixed(2)
}

// 格式化数量
const formatAmount = (amount) => {
  const num = parseFloat(amount)
  return num.toFixed(4)
}

// 点击价格填充订单表单
const fillOrderPrice = (price, side) => {
  if (activeTab.value === '限价') {
    orderForm.value.price = price
    // 如果当前是买入，自动切换到买入；如果是卖出，保持卖出
    // 这里可以根据需要添加更多逻辑
  }
}

// 刷新订单簿
const refreshOrderbook = () => {
  // 模拟刷新：可以在这里添加实际的API调用
  // 这里只是模拟数据更新
  console.log('Refreshing orderbook...')
  // 实际应用中应该调用API获取最新数据
}

const positions = ref([
  { id: 1, pair: 'ETH/USDT', amount: '5.2', avgPrice: '2734.50', pnl: 0.79, unrealizedPnl: '113.00' },
  { id: 2, pair: 'BTC/USDT', amount: '0.15', avgPrice: '42500.00', pnl: -0.43, unrealizedPnl: '-27.50' }
])

const activeOrders = ref([
  { id: 1, side: 'buy', pair: 'ETH/USDT', price: '2750.00', amount: '1.0', status: '待成交' },
  { id: 2, side: 'sell', pair: 'ETH/USDT', price: '2760.00', amount: '0.5', status: '部分成交' }
])

const priceChart = ref(null)
let chartInstance = null

// 根据周期生成时间轴标签
const generateTimeLabels = (period, count) => {
  const now = new Date()
  const labels = []
  
  // 根据周期计算每个数据点的时间间隔（分钟）
  const periodMinutes = {
    '15M': 15,
    '1H': 60,
    '4H': 240,
    '1D': 1440,
    '1W': 10080
  }
  
  const minutesPerPeriod = periodMinutes[period] || 60
  
  // 计算起始时间（从过去到现在）
  const startTime = new Date(now.getTime() - (count - 1) * minutesPerPeriod * 60 * 1000)
  
  // 为每个数据点生成时间标签
  for (let i = 0; i < count; i++) {
    const time = new Date(startTime.getTime() + i * minutesPerPeriod * 60 * 1000)
    let label = ''
    let shouldShow = false
    
    switch (period) {
      case '15M':
        // 15分钟：显示时间 HH:mm，每4小时显示一次（16根K线）
        shouldShow = (i === 0 || i === count - 1 || (i % 16 === 0))
        if (shouldShow) {
          label = `${String(time.getHours()).padStart(2, '0')}:${String(time.getMinutes()).padStart(2, '0')}`
        }
        break
      case '1H':
        // 1小时：显示日期和时间 MM-DD HH:00，每12小时显示一次
        shouldShow = (i === 0 || i === count - 1 || (i % 12 === 0))
        if (shouldShow) {
          label = `${String(time.getMonth() + 1).padStart(2, '0')}-${String(time.getDate()).padStart(2, '0')} ${String(time.getHours()).padStart(2, '0')}:00`
        }
        break
      case '4H':
        // 4小时：显示日期和时间 MM-DD HH:00，每6根（24小时）显示一次
        shouldShow = (i === 0 || i === count - 1 || (i % 6 === 0))
        if (shouldShow) {
          label = `${String(time.getMonth() + 1).padStart(2, '0')}-${String(time.getDate()).padStart(2, '0')} ${String(time.getHours()).padStart(2, '0')}:00`
        }
        break
      case '1D':
        // 1天：显示日期 MM-DD，每10天显示一次
        shouldShow = (i === 0 || i === count - 1 || (i % 10 === 0))
        if (shouldShow) {
          label = `${String(time.getMonth() + 1).padStart(2, '0')}-${String(time.getDate()).padStart(2, '0')}`
        }
        break
      case '1W':
        // 1周：显示日期 MM-DD，每4周显示一次
        shouldShow = (i === 0 || i === count - 1 || (i % 4 === 0))
        if (shouldShow) {
          label = `${String(time.getMonth() + 1).padStart(2, '0')}-${String(time.getDate()).padStart(2, '0')}`
        }
        break
      default:
        label = ''
    }
    
    labels.push(label)
  }
  
  return labels
}

// 根据周期生成不同形态的K线数据
const generateCandleData = (period) => {
  const data = []
  let basePrice = 2750
  
  // 根据周期决定数据点数量和波动幅度
  const periodConfig = {
    '15M': { count: 96, volatility: 5, trend: 0.1 },    // 15分钟：96根（24小时）
    '1H': { count: 100, volatility: 15, trend: 0.3 },    // 1小时：100根
    '4H': { count: 90, volatility: 30, trend: 0.5 },     // 4小时：90根
    '1D': { count: 60, volatility: 50, trend: 0.8 },     // 1天：60根
    '1W': { count: 52, volatility: 80, trend: 1.2 }       // 1周：52根
  }
  
  const config = periodConfig[period] || periodConfig['1H']
  const { count, volatility, trend } = config
  
  for (let i = 0; i < count; i++) {
    // 添加趋势性
    const trendFactor = Math.sin(i / count * Math.PI * 2) * trend
    const open = basePrice + trendFactor + (Math.random() - 0.5) * volatility
    const close = open + (Math.random() - 0.5) * volatility * 1.5 + trendFactor * 0.5
    const high = Math.max(open, close) + Math.random() * volatility * 0.5
    const low = Math.min(open, close) - Math.random() * volatility * 0.5
    data.push([open, close, low, high])
    basePrice = close
  }
  return data
}

const updateChart = () => {
  if (!chartInstance || !priceChart.value) return
  
  const candleData = generateCandleData(selectedPeriod.value)
  const dataCount = candleData.length
  const timeLabels = generateTimeLabels(selectedPeriod.value, dataCount)
  
  // 计算初始显示范围（显示最后60%的数据）
  const startPercent = Math.max(0, (1 - 60 / dataCount) * 100)
  const endPercent = 100
  
  const option = {
    backgroundColor: 'transparent',
    grid: {
      left: '3%',
      right: '3%',
      bottom: '15%',  // 增加底部空间以容纳 dataZoom
      top: '5%',
      containLabel: true
    },
    dataZoom: [
      {
        type: 'inside',  // 内置型数据区域缩放组件，支持鼠标滚轮缩放
        xAxisIndex: [0],
        start: startPercent,
        end: endPercent,
        zoomOnMouseWheel: true,
        moveOnMouseMove: true,
        moveOnMouseWheel: false
      },
      {
        type: 'slider',  // 滑动条型数据区域缩放组件
        xAxisIndex: [0],
        start: startPercent,
        end: endPercent,
        height: 20,
        bottom: 10,
        handleStyle: {
          color: '#6366f1',
          borderColor: '#6366f1'
        },
        dataBackground: {
          areaStyle: {
            color: 'rgba(99, 102, 241, 0.1)'
          },
          lineStyle: {
            color: '#6366f1',
            opacity: 0.3
          }
        },
        selectedDataBackground: {
          areaStyle: {
            color: 'rgba(99, 102, 241, 0.2)'
          },
          lineStyle: {
            color: '#6366f1',
            opacity: 0.5
          }
        },
        borderColor: '#30363d',
        fillerColor: 'rgba(99, 102, 241, 0.1)',
        textStyle: {
          color: '#8b949e',
          fontFamily: 'JetBrains Mono',
          fontSize: 11
        }
      }
    ],
    xAxis: {
      type: 'category',
      data: timeLabels,
      boundaryGap: false,
      axisLine: { lineStyle: { color: '#30363d' } },
      axisLabel: { 
        color: '#8b949e', 
        fontFamily: 'JetBrains Mono', 
        fontSize: 11,
        showMinLabel: true,
        showMaxLabel: true,
        rotate: 0,
        formatter: (value, index) => {
          // 只显示非空标签
          return value || ''
        },
        interval: 0  // 强制显示所有标签（但formatter会过滤空值）
      }
    },
    yAxis: {
      type: 'value',
      scale: true,
      axisLine: { lineStyle: { color: '#30363d' } },
      axisLabel: { color: '#8b949e', fontFamily: 'JetBrains Mono', fontSize: 11 },
      splitLine: { lineStyle: { color: '#21262d', type: 'dashed' } }
    },
    series: [
      {
        type: 'candlestick',
        data: candleData,
        itemStyle: {
          color: '#3fb950',
          color0: '#ff6b4a',
          borderColor: '#3fb950',
          borderColor0: '#ff6b4a'
        }
      }
    ],
    tooltip: {
      trigger: 'axis',
      textStyle: {
        color: '#c9d1d9',
        fontFamily: 'JetBrains Mono'
      },
      backgroundColor: '#161b22',
      borderColor: '#30363d',
      formatter: (params) => {
        const param = params[0]
        const data = param.data
        const timeIndex = param.dataIndex
        const timeLabel = timeLabels[timeIndex] || `数据点 ${timeIndex + 1}`
        return `
          <div style="font-family: JetBrains Mono; font-size: 12px;">
            <div style="margin-bottom: 4px; color: #8b949e;">${timeLabel}</div>
            <div>开盘: $${data[0].toFixed(2)}</div>
            <div>收盘: $${data[1].toFixed(2)}</div>
            <div>最高: $${data[3].toFixed(2)}</div>
            <div>最低: $${data[2].toFixed(2)}</div>
          </div>
        `
      }
    }
  }
  
  chartInstance.setOption(option, true)
}

onMounted(() => {
  if (priceChart.value) {
    chartInstance = echarts.init(priceChart.value)
    updateChart()
    
    window.addEventListener('resize', () => {
      if (chartInstance) {
        chartInstance.resize()
      }
    })
  }
})

// 监听周期变化，更新图表
watch(selectedPeriod, () => {
  updateChart()
})
</script>

<style scoped>
.trading {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.trading-layout {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: var(--spacing-lg);
}

.trading-main {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.chart-section {
  /* 磨砂玻璃效果已在 main.css 中定义 */
  /* 保留此选择器以保持样式一致性 */
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.pair-selector select {
  width: 150px;
}

.chart-controls {
  display: flex;
  gap: var(--spacing-xs);
}

.price-chart {
  height: 400px;
  margin-bottom: var(--spacing-md);
}

.chart-info {
  display: flex;
  gap: var(--spacing-lg);
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--border-color);
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.info-label {
  font-size: 11px;
  color: var(--text-muted);
  font-family: var(--font-mono);
}

.info-value {
  font-size: 14px;
  font-weight: 600;
}

.orderbook-section {
  /* 磨砂玻璃效果已在 main.css 中定义 */
  /* 保留此选择器以保持样式一致性 */
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.section-title {
  font-family: var(--font-mono);
  font-size: 14px;
  font-weight: 600;
}

.orderbook {
  display: flex;
  flex-direction: column;
}

.orderbook-side {
  display: flex;
  flex-direction: column;
}

.orderbook-header {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  padding: var(--spacing-xs) var(--spacing-sm);
  font-size: 10px;
  color: var(--text-muted);
  font-family: var(--font-mono);
  border-bottom: 1px solid var(--border-color);
}

.orderbook-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  padding: var(--spacing-xs) var(--spacing-sm);
  font-size: 11px;
  font-family: var(--font-mono);
  cursor: pointer;
  transition: background 0.2s;
}

.orderbook-row:hover {
  background: var(--bg-hover);
}

.ask-row {
  text-align: right;
}

.bid-row {
  text-align: left;
}

.orderbook-spread {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm);
  margin: var(--spacing-xs) 0;
  background: var(--bg-tertiary);
  border-radius: var(--radius-sm);
  font-family: var(--font-mono);
  font-size: 11px;
}

.spread-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.spread-label {
  color: var(--text-secondary);
  font-size: 10px;
}

.spread-value {
  font-weight: 600;
  font-size: 11px;
}

.ask-header {
  text-align: right;
}

.bid-header {
  text-align: left;
}

.trading-sidebar {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.order-panel,
.positions-panel,
.orders-panel {
  /* 磨砂玻璃效果已在 main.css 中定义 */
  /* 保留此选择器以保持样式一致性 */
}

.panel-tabs {
  display: flex;
  gap: var(--spacing-xs);
  margin-bottom: var(--spacing-md);
}

.tab-btn {
  flex: 1;
  padding: var(--spacing-sm);
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  font-family: var(--font-mono);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.tab-btn:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.tab-btn.active {
  background: var(--bg-primary);
  border-color: var(--text-link);
  color: var(--text-primary);
}

.order-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.form-label {
  font-size: 11px;
  color: var(--text-muted);
  font-family: var(--font-mono);
}

.form-actions {
  display: flex;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-sm);
}

.buy-btn {
  background: var(--success);
  border-color: var(--success);
}

.buy-btn:hover {
  background: #2ea043;
}

.sell-btn {
  background: var(--danger);
  border-color: var(--danger);
}

.sell-btn:hover {
  background: #ff8566;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.panel-title {
  font-family: var(--font-mono);
  font-size: 14px;
  font-weight: 600;
}

.positions-list,
.orders-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.position-item,
.order-item {
  padding: var(--spacing-md);
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
}

.position-header,
.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-sm);
}

.position-pair,
.order-pair {
  font-weight: 600;
  font-family: var(--font-mono);
}

.position-details,
.order-details {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.detail-row {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
}

.detail-label {
  color: var(--text-muted);
  font-family: var(--font-mono);
}

.detail-value {
  font-family: var(--font-mono);
}

.btn-cancel {
  width: auto;
  padding: var(--spacing-xs) var(--spacing-sm);
  font-size: 11px;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: var(--text-secondary);
  margin-top: var(--spacing-sm);
  align-self: flex-start;
}

.btn-cancel:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.25);
  color: var(--text-primary);
  transform: none;
}
</style>
