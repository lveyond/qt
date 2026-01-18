<template>
  <div class="assets">
    <div class="page-header">
      <h1 class="page-title">{{ t('assets.title') }}</h1>
      <div class="page-actions">
        <button class="btn">{{ t('common.deposit') }}</button>
        <button class="btn">{{ t('common.withdraw') }}</button>
        <button class="btn btn-primary">{{ t('common.transfer') }}</button>
      </div>
    </div>

    <div class="assets-overview">
      <div class="overview-card">
        <div class="overview-header">
          <span class="overview-label">{{ t('assets.totalValue') }}</span>
          <button class="btn">{{ t('common.hide') }}</button>
        </div>
        <div class="overview-value">$124,567.89</div>
        <div class="overview-change">
          <span class="change-label">{{ t('assets.change24h') }}</span>
          <span class="change-value text-success">+$2,345.67 (+1.92%)</span>
        </div>
      </div>

      <div class="overview-card">
        <div class="overview-header">
          <span class="overview-label">{{ t('assets.availableBalance') }}</span>
        </div>
        <div class="overview-value">$45,123.45</div>
        <div class="overview-footer mono">{{ t('assets.availableForTrading') }}</div>
      </div>

      <div class="overview-card">
        <div class="overview-header">
          <span class="overview-label">{{ t('assets.frozenAssets') }}</span>
        </div>
        <div class="overview-value">$79,444.44</div>
        <div class="overview-footer mono">{{ t('assets.orderOccupied') }}</div>
      </div>
    </div>

    <div class="assets-content">
      <div class="assets-table-section">
        <div class="section-header">
          <h2 class="section-title">{{ t('assets.assetList') }}</h2>
          <div class="section-actions">
            <input 
              v-model="searchQuery" 
              type="text" 
              class="input" 
              :placeholder="t('assets.searchAssets')"
              style="width: 200px;"
            >
            <button class="btn">{{ t('assets.hideSmallAssets') }}</button>
          </div>
        </div>

        <div class="table-container">
          <table class="table">
            <thead>
              <tr>
                <th>{{ t('assets.asset') }}</th>
                <th>{{ t('assets.available') }}</th>
                <th>{{ t('assets.frozen') }}</th>
                <th>{{ t('assets.total') }}</th>
                <th>{{ t('assets.estimatedValue') }}</th>
                <th>{{ t('assets.change24h') }}</th>
                <th>{{ t('assets.operations') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="asset in filteredAssets" :key="asset.symbol">
                <td>
                  <div class="asset-info">
                    <img 
                      :src="getAssetIcon(asset.symbol)" 
                      :alt="asset.symbol"
                      class="asset-icon"
                      @error="handleImageError"
                    />
                    <div class="asset-details">
                      <span class="asset-symbol">{{ asset.symbol }}</span>
                      <span class="asset-name">{{ asset.name }}</span>
                    </div>
                  </div>
                </td>
                <td class="mono">{{ formatNumber(asset.available) }}</td>
                <td class="mono">{{ formatNumber(asset.frozen) }}</td>
                <td class="mono">{{ formatNumber(asset.total) }}</td>
                <td class="mono">${{ formatNumber(asset.value) }}</td>
                <td>
                  <span :class="asset.change24h >= 0 ? 'text-success' : 'text-danger'">
                    {{ asset.change24h >= 0 ? '+' : '' }}{{ asset.change24h }}%
                  </span>
                </td>
                <td>
                  <div class="asset-actions">
                    <button class="btn">{{ t('common.deposit') }}</button>
                    <button class="btn">{{ t('common.withdraw') }}</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="assets-chart-section">
        <div class="section-header">
          <h2 class="section-title">{{ t('assets.assetDistribution') }}</h2>
          <div class="chart-type-selector">
            <button 
              v-for="type in chartTypes"
              :key="type.key"
              class="btn"
              :class="{ 'btn-primary': selectedChartType === type.key }"
              @click="selectedChartType = type.key"
            >
              {{ type.label }}
            </button>
          </div>
        </div>
        <div ref="distributionChart" class="distribution-chart"></div>
      </div>
    </div>

    <div class="transaction-history">
      <div class="section-header">
        <h2 class="section-title">{{ t('assets.transactionHistory') }}</h2>
        <div class="section-actions">
          <select v-model="transactionType" class="input" style="width: 150px;">
            <option value="all">{{ t('common.allTypes') }}</option>
            <option value="deposit">{{ t('common.deposit') }}</option>
            <option value="withdraw">{{ t('common.withdraw') }}</option>
            <option value="trade">{{ t('common.trade') }}</option>
            <option value="transfer">{{ t('common.transfer') }}</option>
          </select>
        </div>
      </div>
      <div class="table-container">
        <table class="table">
          <thead>
            <tr>
              <th>{{ t('dashboard.time') }}</th>
              <th>{{ t('dashboard.type') }}</th>
              <th>{{ t('assets.asset') }}</th>
              <th>{{ t('dashboard.amount') }}</th>
              <th>{{ t('dashboard.status') }}</th>
              <th>{{ t('assets.transactionHash') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="tx in filteredTransactions" :key="tx.id">
              <td class="mono">{{ tx.time }}</td>
              <td>
                <span :class="getTypeClass(tx.type)">{{ getTypeLabel(tx.type) }}</span>
              </td>
              <td>{{ tx.asset }}</td>
              <td class="mono">{{ tx.amount }}</td>
              <td>
                <span :class="getStatusClass(tx.status)">{{ getStatusLabel(tx.status) }}</span>
              </td>
              <td>
                <a :href="`https://etherscan.io/tx/${tx.hash}`" target="_blank" class="mono">
                  {{ shortenHash(tx.hash) }}
                </a>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, inject } from 'vue'
import { getCurrentLanguage, t as translate } from '../i18n'
import * as echarts from 'echarts'

const currentLanguage = inject('language', ref(getCurrentLanguage()))

// 监听语言变化
window.addEventListener('language-changed', () => {
  currentLanguage.value = getCurrentLanguage()
})

const t = (key) => translate(key, currentLanguage.value)

const searchQuery = ref('')
const selectedChartType = ref('pie')
const chartTypes = computed(() => [
  { key: 'pie', label: translate('assets.chartTypes.pie', currentLanguage.value) },
  { key: 'bar', label: translate('assets.chartTypes.bar', currentLanguage.value) }
])
const transactionType = ref('all')

const assets = ref([
  { symbol: 'ETH', name: 'Ethereum', available: 45.23, frozen: 2.5, total: 47.73, value: 131456.78, change24h: 2.45 },
  { symbol: 'BTC', name: 'Bitcoin', available: 2.5, frozen: 0.1, total: 2.6, value: 111456.00, change24h: 1.23 },
  { symbol: 'USDT', name: 'Tether', available: 1500, frozen: 500, total: 2000, value: 2000.00, change24h: 0.01 },
  { symbol: 'USDC', name: 'USD Coin', available: 500, frozen: 200, total: 700, value: 700.00, change24h: 0.01 },
  { symbol: 'SOL', name: 'Solana', available: 120, frozen: 30, total: 150, value: 14700.00, change24h: -1.56 },
  { symbol: 'MATIC', name: 'Polygon', available: 5000, frozen: 1000, total: 6000, value: 4500.00, change24h: 3.21 }
])

const transactions = ref([
  { id: 1, time: '2024-01-15 14:32:18', type: 'trade', asset: 'ETH', amount: '+0.5', status: '已完成', hash: '0x1234567890abcdef1234567890abcdef12345678' },
  { id: 2, time: '2024-01-15 14:28:42', type: 'deposit', asset: 'USDT', amount: '+1000', status: '已完成', hash: '0xabcdef1234567890abcdef1234567890abcdef12' },
  { id: 3, time: '2024-01-15 14:25:18', type: 'withdraw', asset: 'BTC', amount: '-0.1', status: '处理中', hash: '0x9876543210fedcba9876543210fedcba98765432' },
  { id: 4, time: '2024-01-15 14:20:05', type: 'trade', asset: 'SOL', amount: '+50', status: '已完成', hash: '0xfedcba0987654321fedcba0987654321fedcba09' },
  { id: 5, time: '2024-01-15 14:15:33', type: 'transfer', asset: 'ETH', amount: '-1.0', status: '已完成', hash: '0x567890abcdef1234567890abcdef1234567890ab' }
])

const filteredAssets = computed(() => {
  if (!searchQuery.value) return assets.value
  const query = searchQuery.value.toLowerCase()
  return assets.value.filter(asset => 
    asset.symbol.toLowerCase().includes(query) || 
    asset.name.toLowerCase().includes(query)
  )
})

const filteredTransactions = computed(() => {
  if (transactionType.value === 'all') return transactions.value
  return transactions.value.filter(tx => tx.type === transactionType.value)
})

const formatNumber = (num) => {
  if (num >= 1000) {
    return num.toLocaleString('en-US', { maximumFractionDigits: 2 })
  }
  return num.toFixed(4)
}

const getTypeClass = (type) => {
  const classes = {
    deposit: 'badge badge-success',
    withdraw: 'badge badge-danger',
    trade: 'badge',
    transfer: 'badge badge-warning'
  }
  return classes[type] || 'badge'
}

const getTypeLabel = (type) => {
  const labels = {
    deposit: t('common.deposit'),
    withdraw: t('common.withdraw'),
    trade: t('common.trade'),
    transfer: t('common.transfer')
  }
  return labels[type] || type
}

const getStatusClass = (status) => {
  if (status === '已完成') return 'badge badge-success'
  if (status === '处理中') return 'badge badge-warning'
  return 'badge'
}

const getStatusLabel = (status) => {
  if (status === '已完成') return t('common.completed')
  if (status === '处理中') return t('common.processing')
  if (status === '待处理') return t('common.pending')
  return status
}

const shortenHash = (hash) => {
  return `${hash.slice(0, 6)}...${hash.slice(-4)}`
}

const distributionChart = ref(null)
let chartInstance = null

const chartData = computed(() => {
  return assets.value.map(asset => ({
    value: asset.value,
    name: asset.symbol,
    itemStyle: {
      color: getAssetColor(asset.symbol)
    }
  }))
})

const getPieChartOption = () => {
  return {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      textStyle: {
        color: '#c9d1d9',
        fontFamily: 'JetBrains Mono'
      },
      formatter: '{b}: ${c} ({d}%)'
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
        data: chartData.value
      }
    ]
  }
}

const getBarChartOption = () => {
  return {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      textStyle: {
        color: '#c9d1d9',
        fontFamily: 'JetBrains Mono'
      },
      formatter: (params) => {
        const param = params[0]
        return `${param.name}<br/>${param.seriesName}: $${param.value.toLocaleString('en-US', { maximumFractionDigits: 2 })}`
      }
    },
    grid: {
      left: '10%',
      right: '10%',
      bottom: '15%',
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: chartData.value.map(item => item.name),
      axisLine: {
        lineStyle: {
          color: '#30363d'
        }
      },
      axisLabel: {
        color: '#8b949e',
        fontFamily: 'JetBrains Mono',
        fontSize: 11
      }
    },
    yAxis: {
      type: 'value',
      axisLine: {
        lineStyle: {
          color: '#30363d'
        }
      },
      axisLabel: {
        color: '#8b949e',
        fontFamily: 'JetBrains Mono',
        fontSize: 11,
        formatter: (value) => `$${(value / 1000).toFixed(0)}k`
      },
      splitLine: {
        lineStyle: {
          color: '#21262d',
          type: 'dashed'
        }
      }
    },
    series: [
      {
        name: '资产价值',
        type: 'bar',
        data: chartData.value.map(item => ({
          value: item.value,
          itemStyle: {
            color: item.itemStyle.color
          }
        })),
        barWidth: '60%'
      }
    ]
  }
}

const updateChart = () => {
  if (!chartInstance || !distributionChart.value) return
  
  let option
  switch (selectedChartType.value) {
    case 'pie':
      option = getPieChartOption()
      break
    case 'bar':
      option = getBarChartOption()
      break
    default:
      option = getPieChartOption()
  }
  
  chartInstance.setOption(option, true)
}

onMounted(() => {
  if (distributionChart.value) {
    chartInstance = echarts.init(distributionChart.value)
    updateChart()
    
    window.addEventListener('resize', () => {
      if (chartInstance) {
        chartInstance.resize()
      }
    })
  }
})

watch(selectedChartType, () => {
  updateChart()
})

// 获取币种图标URL
const getAssetIcon = (symbol) => {
  // 使用CoinGecko的图标API
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
  // 如果图标加载失败，使用默认占位符或隐藏图标
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
</script>

<style scoped>
.assets {
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

.page-actions {
  display: flex;
  gap: var(--spacing-md);
  align-items: center;
}

.assets-overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--spacing-md);
}

.overview-card {
  /* 磨砂玻璃效果已在 main.css 中定义 */
}

.overview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.overview-label {
  font-size: 12px;
  color: var(--text-muted);
  font-family: var(--font-mono);
}

.overview-value {
  font-size: 32px;
  font-weight: 600;
  font-family: var(--font-mono);
  color: var(--text-primary);
  margin-bottom: var(--spacing-sm);
}

.overview-change {
  display: flex;
  gap: var(--spacing-sm);
  font-size: 12px;
  font-family: var(--font-mono);
}

.change-label {
  color: var(--text-muted);
}

.overview-footer {
  font-size: 11px;
  color: var(--text-muted);
}

.assets-content {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: var(--spacing-lg);
}

.assets-table-section,
.assets-chart-section {
  /* 磨砂玻璃效果已在 main.css 中定义 */
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.section-title {
  font-family: var(--font-mono);
  font-size: 16px;
  font-weight: 600;
}

.section-actions {
  display: flex;
  gap: var(--spacing-sm);
}

.chart-type-selector {
  display: flex;
  gap: var(--spacing-xs);
}

.distribution-chart {
  height: 400px;
}

.asset-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.asset-icon {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  flex-shrink: 0;
  object-fit: cover;
}

.asset-details {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.asset-symbol {
  font-weight: 600;
  font-family: var(--font-mono);
}

.asset-name {
  font-size: 11px;
  color: var(--text-muted);
}

.asset-actions {
  display: flex;
  gap: var(--spacing-xs);
}

.asset-actions .btn {
  padding: var(--spacing-xs) var(--spacing-sm);
  font-size: 11px;
}

.transaction-history {
  /* 磨砂玻璃效果已在 main.css 中定义 */
}
</style>
