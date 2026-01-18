<template>
  <div class="dashboard">
    <div class="page-header">
      <h1 class="page-title">{{ t('dashboard.title') }}</h1>
      <div class="page-meta">
        <span class="meta-item mono">Last updated: {{ lastUpdate }}</span>
        <span class="meta-item mono">Network: Ethereum</span>
      </div>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-header">
          <span class="stat-label">{{ t('dashboard.totalAssets') }}</span>
          <span class="stat-badge badge-success">+12.5%</span>
        </div>
        <div class="stat-value">$124,567.89</div>
        <div class="stat-footer mono">≈ 45.23 ETH</div>
      </div>

      <div class="stat-card">
        <div class="stat-header">
          <span class="stat-label">{{ t('dashboard.profit24h') }}</span>
          <span class="stat-badge badge-success">{{ t('common.profit') }}</span>
        </div>
        <div class="stat-value text-success">+$2,345.67</div>
        <div class="stat-footer mono">+1.92%</div>
      </div>

      <div class="stat-card">
        <div class="stat-header">
          <span class="stat-label">{{ t('dashboard.activeStrategies') }}</span>
          <span class="stat-badge">{{ t('strategies.running') }}</span>
        </div>
        <div class="stat-value">8</div>
        <div class="stat-footer mono">3 {{ t('common.pending') }}</div>
      </div>

      <div class="stat-card">
        <div class="stat-header">
          <span class="stat-label">{{ t('dashboard.totalTrades') }}</span>
          <span class="stat-badge">{{ t('common.today') }}</span>
        </div>
        <div class="stat-value">1,247</div>
        <div class="stat-footer mono">{{ t('common.successRate') }} 87.3%</div>
      </div>
    </div>

    <div class="content-grid">
      <div class="content-card">
        <div class="card-header">
          <h2 class="card-title">{{ t('dashboard.assetDistribution') }}</h2>
          <button class="btn" @click="viewAssetDetails">{{ t('common.viewDetails') }}</button>
        </div>
        <div class="chart-container">
          <div ref="assetChart" class="chart"></div>
        </div>
      </div>

      <div class="content-card">
        <div class="card-header">
          <h2 class="card-title">{{ t('dashboard.recentTrades') }}</h2>
          <button class="btn">{{ t('common.all') }}</button>
        </div>
        <div class="table-container">
          <table class="table">
            <thead>
              <tr>
                <th>{{ t('dashboard.time') }}</th>
                <th>{{ t('dashboard.tradingPair') }}</th>
                <th>{{ t('dashboard.type') }}</th>
                <th>{{ t('dashboard.price') }}</th>
                <th>{{ t('dashboard.amount') }}</th>
                <th>{{ t('dashboard.status') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="trade in recentTrades" :key="trade.id">
                <td class="mono">{{ trade.time }}</td>
                <td>
                  <div class="pair-info">
                    <img 
                      :src="getPairIcon(trade.pair)" 
                      :alt="trade.pair"
                      class="pair-icon"
                      @error="handleImageError"
                    />
                    <span>{{ trade.pair }}</span>
                  </div>
                </td>
                <td>
                  <span :class="trade.type === 'buy' ? 'text-success' : 'text-danger'">
                    {{ trade.type === 'buy' ? t('common.buy') : t('common.sell') }}
                  </span>
                </td>
                <td class="mono">${{ trade.price }}</td>
                <td class="mono">{{ trade.amount }}</td>
                <td>
                  <span class="badge badge-success">{{ t('common.completed') }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div class="content-grid">
      <div class="content-card">
        <div class="card-header">
          <h2 class="card-title">{{ t('dashboard.strategyPerformance') }}</h2>
        </div>
        <div class="strategy-list">
          <div v-for="strategy in strategies" :key="strategy.id" class="strategy-item">
            <div class="strategy-info">
              <div class="strategy-name">{{ strategy.name }}</div>
              <div class="strategy-desc mono">{{ strategy.desc }}</div>
            </div>
            <div class="strategy-stats">
              <div class="strategy-stat">
                <span class="stat-label-small">{{ t('strategies.totalReturn') }}</span>
                <span :class="strategy.profit >= 0 ? 'text-success' : 'text-danger'">
                  {{ strategy.profit >= 0 ? '+' : '' }}{{ strategy.profit }}%
                </span>
              </div>
              <div class="strategy-stat">
                <span class="stat-label-small">{{ t('strategies.trades') }}</span>
                <span>{{ strategy.trades }}</span>
              </div>
            </div>
            <div class="strategy-status">
              <span :class="strategy.active ? 'badge badge-success' : 'badge'">
                {{ strategy.active ? t('strategies.running') : t('strategies.stopped') }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div class="content-card">
        <div class="card-header">
          <h2 class="card-title">{{ t('dashboard.systemLogs') }}</h2>
        </div>
        <div class="terminal">
          <div v-for="(log, index) in logs" :key="index" class="terminal-line">
            <span class="terminal-prompt">[{{ log.time }}]</span>
            <span class="terminal-command"> {{ log.level }}</span>
            <span class="terminal-output"> {{ log.message }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, onUnmounted, inject } from 'vue'
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

const formatDateTime = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const seconds = String(now.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

const lastUpdate = ref(formatDateTime())

let updateTimer = null

onMounted(() => {
  // 每秒更新一次时间
  updateTimer = setInterval(() => {
    lastUpdate.value = formatDateTime()
  }, 1000)
})

onUnmounted(() => {
  if (updateTimer) {
    clearInterval(updateTimer)
  }
})

// 统一资产数据（与 Assets 页面一致）
const assets = ref([
  { symbol: 'ETH', name: 'Ethereum', available: 45.23, frozen: 2.5, total: 47.73, value: 131456.78, change24h: 2.45 },
  { symbol: 'BTC', name: 'Bitcoin', available: 2.5, frozen: 0.1, total: 2.6, value: 111456.00, change24h: 1.23 },
  { symbol: 'USDT', name: 'Tether', available: 1500, frozen: 500, total: 2000, value: 2000.00, change24h: 0.01 },
  { symbol: 'USDC', name: 'USD Coin', available: 500, frozen: 200, total: 700, value: 700.00, change24h: 0.01 },
  { symbol: 'SOL', name: 'Solana', available: 120, frozen: 30, total: 150, value: 14700.00, change24h: -1.56 },
  { symbol: 'MATIC', name: 'Polygon', available: 5000, frozen: 1000, total: 6000, value: 4500.00, change24h: 3.21 }
])

// 获取交易对图标（取第一个币种的图标）
const getPairIcon = (pair) => {
  const symbol = pair.split('/')[0]
  return getAssetIcon(symbol)
}

// 获取币种图标URL
const getAssetIcon = (symbol) => {
  const iconMap = {
    'ETH': 'https://assets.coingecko.com/coins/images/279/small/ethereum.png',
    'BTC': 'https://assets.coingecko.com/coins/images/1/small/bitcoin.png',
    'USDT': 'https://assets.coingecko.com/coins/images/325/small/Tether.png',
    'USDC': 'https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png',
    'SOL': 'https://assets.coingecko.com/coins/images/4128/small/solana.png',
    'MATIC': 'https://assets.coingecko.com/coins/images/4713/small/matic-token-icon.png'
  }
  return iconMap[symbol] || `https://assets.coingecko.com/coins/images/1/small/bitcoin.png`
}

// 处理图标加载错误
const handleImageError = (event) => {
  event.target.style.display = 'none'
}

// 统一的资产配色函数（紫红色、紫色、橘色等，不使用灰色）
const getAssetColor = (symbol) => {
  const colors = {
    ETH: '#627EEA',      // 蓝紫色
    BTC: '#F7931A',      // 橘色
    USDT: '#EC4899',     // 紫红色/粉红色
    USDC: '#10B981',     // 绿色（与USDT区分）
    SOL: '#F59E0B',      // 金黄色（与BTC区分）
    MATIC: '#EF4444'     // 红色（与其他颜色区分）
  }
  return colors[symbol] || '#F97316'  // 默认使用橘色，不使用灰色
}

const recentTrades = ref([
  { id: 1, time: '14:32:15', pair: 'ETH/USDT', type: 'buy', price: '2756.23', amount: '0.5' },
  { id: 2, time: '14:28:42', pair: 'BTC/USDT', type: 'sell', price: '42891.50', amount: '0.1' },
  { id: 3, time: '14:25:18', pair: 'ETH/USDT', type: 'buy', price: '2754.10', amount: '1.2' },
  { id: 4, time: '14:20:05', pair: 'SOL/USDT', type: 'buy', price: '98.45', amount: '50' },
  { id: 5, time: '14:15:33', pair: 'BTC/USDT', type: 'sell', price: '42895.20', amount: '0.05' }
])

const strategies = computed(() => [
  { id: 1, name: t('strategies.gridTrading'), desc: 'grid_trading_v2.py', profit: 12.5, trades: 234, active: true },
  { id: 2, name: t('strategies.meanReversion'), desc: 'mean_reversion.py', profit: 8.3, trades: 156, active: true },
  { id: 3, name: t('strategies.trendFollowing'), desc: 'trend_following.py', profit: -2.1, trades: 89, active: false },
  { id: 4, name: t('strategies.arbitrage'), desc: 'arbitrage.py', profit: 15.7, trades: 312, active: true }
])

const logs = computed(() => [
  { time: '14:32:18', level: 'INFO', message: `${t('dashboard.strategy')} grid_trading_v2.py ${t('dashboard.executionCompleted')}, ${t('dashboard.profit')} +$123.45` },
  { time: '14:32:15', level: 'TRADE', message: `${t('common.buy')} ETH/USDT 0.5 @ $2756.23` },
  { time: '14:30:42', level: 'INFO', message: `${t('dashboard.assetBalanceUpdated')}: $124,567.89` },
  { time: '14:28:42', level: 'TRADE', message: `${t('common.sell')} BTC/USDT 0.1 @ $42891.50` },
  { time: '14:25:18', level: 'TRADE', message: `${t('common.buy')} ETH/USDT 1.2 @ $2754.10` }
])

const assetChart = ref(null)

const viewAssetDetails = () => {
  // 跳转到资产页面
  router.push('/assets')
}

onMounted(() => {
  if (assetChart.value) {
    const chart = echarts.init(assetChart.value)
    const option = {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'item',
        textStyle: {
          color: '#c9d1d9',
          fontFamily: 'JetBrains Mono'
        }
      },
      legend: {
        bottom: '5%',
        left: 'center',
        textStyle: {
          color: '#8b949e',
          fontFamily: 'JetBrains Mono',
          fontSize: 12
        }
      },
      series: [
        {
          name: '资产分布',
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 4,
            borderColor: '#0d1117',
            borderWidth: 2
          },
          label: {
            show: false
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 12,
              fontWeight: 'bold',
              color: '#c9d1d9',
              fontFamily: 'JetBrains Mono'
            }
          },
          data: assets.value.map(asset => ({
            value: asset.value,
            name: asset.symbol,
            itemStyle: {
              color: getAssetColor(asset.symbol)
            }
          }))
        }
      ]
    }
    chart.setOption(option)
    
    window.addEventListener('resize', () => {
      chart.resize()
    })
  }
})
</script>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.page-title {
  font-family: var(--font-mono);
  font-size: 24px;
  font-weight: 600;
  color: var(--text-primary);
}

.page-meta {
  display: flex;
  gap: var(--spacing-md);
  font-size: 12px;
  color: var(--text-muted);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-md);
}

.stat-card {
  /* 磨砂玻璃效果已在 main.css 中定义 */
}

.stat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.stat-label {
  font-size: 12px;
  color: var(--text-secondary);
  font-family: var(--font-mono);
}

.stat-badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 500;
  border-radius: var(--radius-sm);
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: var(--text-secondary);
}

.stat-badge.badge-success {
  background: transparent;
  border-color: var(--success);
  color: var(--success);
}

.stat-value {
  font-size: 28px;
  font-weight: 600;
  font-family: var(--font-mono);
  color: var(--text-primary);
  margin-bottom: var(--spacing-xs);
}

.stat-footer {
  font-size: 11px;
  color: var(--text-muted);
}

.pair-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.pair-icon {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  flex-shrink: 0;
  object-fit: cover;
}

.content-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: var(--spacing-lg);
}

.content-card {
  /* 磨砂玻璃效果已在 main.css 中定义 */
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.card-title {
  font-family: var(--font-mono);
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.chart-container {
  height: 300px;
}

.chart {
  width: 100%;
  height: 100%;
}

.table-container {
  overflow-x: auto;
}

.strategy-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.strategy-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
}

.strategy-info {
  flex: 1;
}

.strategy-name {
  font-weight: 600;
  margin-bottom: var(--spacing-xs);
  color: var(--text-primary);
}

.strategy-desc {
  font-size: 11px;
  color: var(--text-muted);
}

.strategy-stats {
  display: flex;
  gap: var(--spacing-lg);
}

.strategy-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-family: var(--font-mono);
  font-size: 12px;
}

.stat-label-small {
  font-size: 10px;
  color: var(--text-muted);
  margin-bottom: var(--spacing-xs);
}

.strategy-status {
  display: flex;
  align-items: center;
}
</style>
