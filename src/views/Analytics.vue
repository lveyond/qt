<template>
  <div class="analytics">
    <div class="page-header">
      <h1 class="page-title">{{ t('analytics.title') }}</h1>
      <div class="page-meta">
        <span class="meta-item">{{ t('analytics.dataRange') }}: {{ dateRange }}</span>
        <button class="btn">{{ t('common.export') }}</button>
      </div>
    </div>

    <div class="analytics-filters">
      <div class="filter-group">
        <label class="filter-label mono">{{ t('analytics.timeRange') }}</label>
        <select v-model="selectedTimeRange" class="input">
          <option value="7d">{{ t('analytics.last7Days') }}</option>
          <option value="30d">{{ t('analytics.last30Days') }}</option>
          <option value="90d">{{ t('analytics.last90Days') }}</option>
          <option value="1y">{{ t('analytics.lastYear') }}</option>
        </select>
      </div>
      <div class="filter-group">
        <label class="filter-label mono">{{ t('analytics.strategyFilter') }}</label>
        <select v-model="selectedStrategy" class="input">
          <option value="all">{{ t('analytics.allStrategies') }}</option>
          <option value="grid">{{ t('analytics.gridTrading') }}</option>
          <option value="mean">{{ t('analytics.meanReversion') }}</option>
          <option value="trend">{{ t('analytics.trendFollowing') }}</option>
          <option value="arbitrage">{{ t('analytics.arbitrage') }}</option>
        </select>
      </div>
      <div class="filter-group">
        <label class="filter-label mono">{{ t('analytics.tradingPair') }}</label>
        <select v-model="selectedPair" class="input">
          <option value="all">{{ t('analytics.allPairs') }}</option>
          <option value="ETH/USDT">ETH/USDT</option>
          <option value="BTC/USDT">BTC/USDT</option>
          <option value="SOL/USDT">SOL/USDT</option>
        </select>
      </div>
    </div>

    <div class="performance-metrics">
      <div class="metric-card">
        <div class="metric-header">
          <span class="metric-label">{{ t('analytics.cumulativeReturn') }}</span>
          <span class="metric-badge badge-success">{{ t('analytics.excellent') }}</span>
        </div>
        <div class="metric-value text-success">+45.67%</div>
        <div class="metric-chart">
          <div ref="returnChart" class="mini-chart"></div>
        </div>
      </div>

      <div class="metric-card">
        <div class="metric-header">
          <span class="metric-label">{{ t('analytics.sharpeRatio') }}</span>
          <span class="metric-badge">{{ t('analytics.good') }}</span>
        </div>
        <div class="metric-value">2.15</div>
        <div class="metric-footer mono">{{ t('analytics.riskAdjustedReturn') }}</div>
      </div>

      <div class="metric-card">
        <div class="metric-header">
          <span class="metric-label">{{ t('analytics.maxDrawdown') }}</span>
          <span class="metric-badge badge-warning">{{ t('analytics.controllable') }}</span>
        </div>
        <div class="metric-value text-danger">-8.23%</div>
        <div class="metric-footer mono">{{ t('analytics.occurredOn') }} 2024-01-10</div>
      </div>

      <div class="metric-card">
        <div class="metric-header">
          <span class="metric-label">{{ t('analytics.winRate') }}</span>
          <span class="metric-badge badge-success">{{ t('analytics.high') }}</span>
        </div>
        <div class="metric-value">68.5%</div>
        <div class="metric-footer mono">{{ t('analytics.profitableTradesRatio') }}</div>
      </div>
    </div>

    <div class="analytics-content">
      <div class="chart-section">
        <div class="section-header">
          <h2 class="section-title">{{ t('analytics.assetCurve') }}</h2>
          <div class="chart-controls">
            <button 
              v-for="view in chartViews"
              :key="view"
              class="btn"
              :class="{ 'btn-primary': selectedView === view }"
              @click="selectedView = view"
            >
              {{ view === '净值' ? t('analytics.netValue') : view === '收益' ? t('analytics.profit') : t('analytics.drawdown') }}
            </button>
          </div>
        </div>
        <div ref="equityChart" class="equity-chart"></div>
      </div>

      <div class="chart-section">
        <div class="section-header">
          <h2 class="section-title">{{ t('analytics.returnDistribution') }}</h2>
        </div>
        <div ref="distributionChart" class="distribution-chart"></div>
      </div>
    </div>

    <div class="analytics-grid">
      <div class="analytics-card">
        <div class="card-header">
          <h2 class="card-title">{{ t('analytics.monthlyReturn') }}</h2>
        </div>
        <div class="table-container">
          <table class="table">
            <thead>
              <tr>
                <th>{{ t('analytics.month') }}</th>
                <th>{{ t('analytics.profit') }}</th>
                <th>{{ t('analytics.profitRate') }}</th>
                <th>{{ t('analytics.trades') }}</th>
                <th>{{ t('analytics.winRate') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="month in monthlyReturns" :key="month.month">
                <td class="mono">{{ month.month }}</td>
                <td :class="['mono', month.return >= 0 ? 'text-success' : 'text-danger']">
                  {{ month.return >= 0 ? '+' : '' }}${{ month.return.toLocaleString() }}
                </td>
                <td :class="['mono', month.returnRate >= 0 ? 'text-success' : 'text-danger']">
                  {{ month.returnRate >= 0 ? '+' : '' }}{{ month.returnRate }}%
                </td>
                <td class="mono">{{ month.trades }}</td>
                <td class="mono">{{ month.winRate }}%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="analytics-card">
        <div class="card-header">
          <h2 class="card-title">{{ t('analytics.strategyComparison') }}</h2>
        </div>
        <div ref="strategyComparisonChart" class="comparison-chart"></div>
      </div>
    </div>

    <div class="analytics-grid">
      <div class="analytics-card">
        <div class="card-header">
          <h2 class="card-title">{{ t('analytics.tradingSessionAnalysis') }}</h2>
        </div>
        <div ref="timeAnalysisChart" class="time-chart"></div>
      </div>

      <div class="analytics-card">
        <div class="card-header">
          <h2 class="card-title">{{ t('analytics.riskIndicators') }}</h2>
        </div>
        <div class="risk-metrics">
          <div class="risk-item">
            <span class="risk-label">{{ t('analytics.volatility') }}</span>
            <span class="risk-value mono">18.5%</span>
            <div class="risk-bar">
              <div class="risk-bar-fill" style="width: 65%"></div>
            </div>
          </div>
          <div class="risk-item">
            <span class="risk-label">{{ t('analytics.var') }}</span>
            <span class="risk-value mono">-$2,450</span>
            <div class="risk-bar">
              <div class="risk-bar-fill" style="width: 45%; background: var(--warning)"></div>
            </div>
          </div>
          <div class="risk-item">
            <span class="risk-label">{{ t('analytics.beta') }}</span>
            <span class="risk-value mono">0.85</span>
            <div class="risk-bar">
              <div class="risk-bar-fill" style="width: 42%"></div>
            </div>
          </div>
          <div class="risk-item">
            <span class="risk-label">{{ t('analytics.correlation') }}</span>
            <span class="risk-value mono">0.72</span>
            <div class="risk-bar">
              <div class="risk-bar-fill" style="width: 72%"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="analytics-card">
      <div class="card-header">
        <h2 class="card-title">{{ t('analytics.tradingStats') }}</h2>
      </div>
      <div class="stats-grid-detailed">
        <div class="stat-detail">
          <span class="stat-detail-label mono">{{ t('analytics.totalTrades') }}</span>
          <span class="stat-detail-value mono">1,247</span>
        </div>
        <div class="stat-detail">
          <span class="stat-detail-label mono">{{ t('analytics.profitableTrades') }}</span>
          <span class="stat-detail-value text-success mono">854</span>
        </div>
        <div class="stat-detail">
          <span class="stat-detail-label mono">{{ t('analytics.losingTrades') }}</span>
          <span class="stat-detail-value text-danger mono">393</span>
        </div>
        <div class="stat-detail">
          <span class="stat-detail-label mono">{{ t('analytics.avgHoldingTime') }}</span>
          <span class="stat-detail-value mono">2.5{{ t('analytics.hours') }}</span>
        </div>
        <div class="stat-detail">
          <span class="stat-detail-label mono">{{ t('analytics.avgProfit') }}</span>
          <span class="stat-detail-value text-success mono">+$156.78</span>
        </div>
        <div class="stat-detail">
          <span class="stat-detail-label mono">{{ t('analytics.avgLoss') }}</span>
          <span class="stat-detail-value text-danger mono">-$89.23</span>
        </div>
        <div class="stat-detail">
          <span class="stat-detail-label mono">{{ t('analytics.profitLossRatio') }}</span>
          <span class="stat-detail-value mono">1.76</span>
        </div>
        <div class="stat-detail">
          <span class="stat-detail-label mono">{{ t('analytics.maxConsecutiveProfit') }}</span>
          <span class="stat-detail-value text-success mono">12{{ t('analytics.times') }}</span>
        </div>
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

const selectedTimeRange = ref('30d')
const selectedStrategy = ref('all')
const selectedPair = ref('all')
const selectedView = ref('净值')
const chartViews = computed(() => ['净值', '收益', '回撤']) // 保持内部标识

const dateRange = computed(() => {
  const ranges = {
    '7d': translate('analytics.last7Days', currentLanguage.value),
    '30d': translate('analytics.last30Days', currentLanguage.value),
    '90d': translate('analytics.last90Days', currentLanguage.value),
    '1y': translate('analytics.lastYear', currentLanguage.value)
  }
  return ranges[selectedTimeRange.value] || translate('analytics.last30Days', currentLanguage.value)
})

const monthlyReturns = ref([
  { month: '2024-01', return: 12456, returnRate: 12.5, trades: 234, winRate: 68.5 },
  { month: '2023-12', return: 9876, returnRate: 9.8, trades: 198, winRate: 65.2 },
  { month: '2023-11', return: 11234, returnRate: 11.2, trades: 245, winRate: 70.1 },
  { month: '2023-10', return: -2345, returnRate: -2.3, trades: 156, winRate: 55.8 },
  { month: '2023-09', return: 8765, returnRate: 8.7, trades: 189, winRate: 62.3 }
])

const equityChart = ref(null)
const distributionChart = ref(null)
const strategyComparisonChart = ref(null)
const timeAnalysisChart = ref(null)
const returnChart = ref(null)

const initEquityChart = () => {
  if (!equityChart.value) return
  
  const chart = echarts.init(equityChart.value)
  
  // 生成模拟净值数据
  const generateEquityData = () => {
    const data = []
    let value = 100000
    for (let i = 0; i < 30; i++) {
      value = value * (1 + (Math.random() - 0.4) * 0.02)
      data.push([i, value])
    }
    return data
  }

  const option = {
    backgroundColor: 'transparent',
    grid: {
      left: '3%',
      right: '3%',
      bottom: '10%',
      top: '5%',
      containLabel: true
    },
    xAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: '#30363d' } },
      axisLabel: { color: '#8b949e', fontFamily: 'JetBrains Mono', fontSize: 11 },
      splitLine: { lineStyle: { color: '#21262d', type: 'dashed' } }
    },
    yAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: '#30363d' } },
      axisLabel: { 
        color: '#8b949e', 
        fontFamily: 'JetBrains Mono', 
        fontSize: 11,
        formatter: (value) => `$${(value / 1000).toFixed(0)}k`
      },
      splitLine: { lineStyle: { color: '#21262d', type: 'dashed' } }
    },
    series: [
      {
        type: 'line',
        data: generateEquityData(),
        smooth: true,
        lineStyle: {
          color: '#3fb950',
          width: 2
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(63, 185, 80, 0.3)' },
              { offset: 1, color: 'rgba(63, 185, 80, 0.05)' }
            ]
          }
        },
        symbol: 'none'
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
        const value = params[0].value[1]
        return `净值: $${value.toLocaleString('en-US', { maximumFractionDigits: 2 })}`
      }
    }
  }
  
  chart.setOption(option)
  
  window.addEventListener('resize', () => {
    chart.resize()
  })
}

const initDistributionChart = () => {
  if (!distributionChart.value) return
  
  const chart = echarts.init(distributionChart.value)
  
  const option = {
    backgroundColor: 'transparent',
    grid: {
      left: '10%',
      right: '10%',
      bottom: '15%',
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['-5%', '-3%', '-1%', '0%', '1%', '3%', '5%', '7%', '10%'],
      axisLine: { lineStyle: { color: '#30363d' } },
      axisLabel: { color: '#8b949e', fontFamily: 'JetBrains Mono', fontSize: 11 }
    },
    yAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: '#30363d' } },
      axisLabel: { color: '#8b949e', fontFamily: 'JetBrains Mono', fontSize: 11 },
      splitLine: { lineStyle: { color: '#21262d', type: 'dashed' } }
    },
    series: [
      {
        type: 'bar',
        data: [5, 12, 28, 45, 38, 25, 18, 10, 5],
        itemStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: '#00BFFF' },  // 高饱和度天蓝色
              { offset: 1, color: '#0066FF' }   // 科技蓝
            ]
          }
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
      borderColor: '#30363d'
    }
  }
  
  chart.setOption(option)
  
  window.addEventListener('resize', () => {
    chart.resize()
  })
}

const initStrategyComparisonChart = () => {
  if (!strategyComparisonChart.value) return
  
  const chart = echarts.init(strategyComparisonChart.value)
  
  const option = {
    backgroundColor: 'transparent',
    grid: {
      left: '15%',
      right: '10%',
      bottom: '15%',
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: '#30363d' } },
      axisLabel: { color: '#8b949e', fontFamily: 'JetBrains Mono', fontSize: 11 }
    },
    yAxis: {
      type: 'category',
      data: [
        t('analytics.arbitrage'),
        t('analytics.trendFollowing'),
        t('analytics.meanReversion'),
        t('analytics.gridTrading')
      ],
      axisLine: { lineStyle: { color: '#30363d' } },
      axisLabel: { color: '#8b949e', fontFamily: 'JetBrains Mono', fontSize: 11 }
    },
    series: [
      {
        type: 'bar',
        data: [15.7, -2.1, 8.3, 12.5],
        itemStyle: {
          color: (params) => {
            return params.value >= 0 ? '#3fb950' : '#ff6b4a'
          }
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
        const value = params[0].value
        return `${params[0].name}: ${value >= 0 ? '+' : ''}${value}%`
      }
    }
  }
  
  chart.setOption(option)
  
  window.addEventListener('resize', () => {
    chart.resize()
  })
}

const initTimeAnalysisChart = () => {
  if (!timeAnalysisChart.value) return
  
  const chart = echarts.init(timeAnalysisChart.value)
  
  const option = {
    backgroundColor: 'transparent',
    grid: {
      left: '10%',
      right: '10%',
      bottom: '15%',
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'],
      axisLine: { lineStyle: { color: '#30363d' } },
      axisLabel: { color: '#8b949e', fontFamily: 'JetBrains Mono', fontSize: 11 }
    },
    yAxis: {
      type: 'value',
      name: t('analytics.trades'),
      nameTextStyle: {
        color: '#8b949e',
        fontFamily: 'JetBrains Mono',
        fontSize: 11
      },
      axisLine: { lineStyle: { color: '#30363d' } },
      axisLabel: { color: '#8b949e', fontFamily: 'JetBrains Mono', fontSize: 11 },
      splitLine: { lineStyle: { color: '#21262d', type: 'dashed' } }
    },
    series: [
      {
        type: 'line',
        data: [45, 32, 78, 125, 98, 67, 52],
        smooth: true,
        lineStyle: {
          color: '#58a6ff',
          width: 2
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(88, 166, 255, 0.3)' },
              { offset: 1, color: 'rgba(88, 166, 255, 0.05)' }
            ]
          }
        },
        symbol: 'circle',
        symbolSize: 6
      }
    ],
    tooltip: {
      trigger: 'axis',
      textStyle: {
        color: '#c9d1d9',
        fontFamily: 'JetBrains Mono'
      },
      backgroundColor: '#161b22',
      borderColor: '#30363d'
    }
  }
  
  chart.setOption(option)
  
  window.addEventListener('resize', () => {
    chart.resize()
  })
}

const initReturnChart = () => {
  if (!returnChart.value) return
  
  const chart = echarts.init(returnChart.value)
  
  const option = {
    backgroundColor: 'transparent',
    grid: {
      left: 0,
      right: 0,
      bottom: 0,
      top: 0
    },
    xAxis: {
      type: 'category',
      show: false
    },
    yAxis: {
      type: 'value',
      show: false
    },
    series: [
      {
        type: 'line',
        data: [0, 2, 5, 8, 12, 15, 18, 22, 25, 30, 35, 40, 45],
        smooth: true,
        lineStyle: {
          color: '#3fb950',
          width: 2
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(63, 185, 80, 0.3)' },
              { offset: 1, color: 'rgba(63, 185, 80, 0.05)' }
            ]
          }
        },
        symbol: 'none'
      }
    ]
  }
  
  chart.setOption(option)
}

onMounted(() => {
  initEquityChart()
  initDistributionChart()
  initStrategyComparisonChart()
  initTimeAnalysisChart()
  initReturnChart()
})

watch([selectedTimeRange, selectedStrategy, selectedPair], () => {
  // 当筛选条件改变时，可以重新加载数据
  initEquityChart()
  initDistributionChart()
})

watch(currentLanguage, () => {
  // 语言变化时重新初始化所有图表
  initEquityChart()
  initDistributionChart()
  initStrategyComparisonChart()
  initTimeAnalysisChart()
  initReturnChart()
})
</script>

<style scoped>
.analytics {
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

.page-meta {
  display: flex;
  gap: var(--spacing-md);
  align-items: center;
}

.meta-item {
  font-size: 12px;
  color: var(--text-muted);
  font-family: 'PingFang SC', 'PingFang TC', 'Noto Sans SC', 'Microsoft YaHei UI', 'Microsoft YaHei', '微软雅黑', 'SimHei', '黑体', 'Microsoft JhengHei', '微軟正黑體', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif !important;
}

.analytics-filters {
  /* 磨砂玻璃效果已在 main.css 中定义 */
  display: flex;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.filter-label {
  font-size: 11px;
  color: var(--text-muted);
}

.performance-metrics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-md);
}

.metric-card {
  /* 磨砂玻璃效果已在 main.css 中定义 */
}

.metric-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.metric-label {
  font-size: 12px;
  color: var(--text-muted);
  font-family: var(--font-mono);
}

.metric-badge {
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

.metric-badge.badge-success {
  background: transparent;
  border-color: var(--success);
  color: var(--success);
}

.metric-badge.badge-warning {
  background: transparent;
  border-color: var(--warning);
  color: var(--warning);
}

.metric-value {
  font-size: 28px;
  font-weight: 600;
  font-family: var(--font-mono);
  margin-bottom: var(--spacing-sm);
}

.metric-footer {
  font-size: 11px;
  color: var(--text-muted);
  font-family: var(--font-mono);
}

.metric-chart {
  height: 60px;
  margin-top: var(--spacing-sm);
}

.mini-chart {
  width: 100%;
  height: 100%;
}

.analytics-content {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: var(--spacing-lg);
}

.chart-section {
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
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.chart-controls {
  display: flex;
  gap: var(--spacing-sm);
  align-items: center;
}

.equity-chart,
.distribution-chart {
  height: 400px;
}

.analytics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
  gap: var(--spacing-lg);
}

.analytics-card {
  /* 磨砂玻璃效果已在 main.css 中定义 */
}

.comparison-chart,
.time-chart {
  height: 300px;
}

.risk-metrics {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.risk-item {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.risk-label {
  font-size: 11px;
  color: var(--text-muted);
  font-family: var(--font-mono);
}

.risk-value {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: var(--spacing-xs);
}

.risk-bar {
  height: 6px;
  background: var(--bg-tertiary);
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.risk-bar-fill {
  height: 100%;
  background: var(--success);
  transition: width 0.3s;
}

.stats-grid-detailed {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-md);
}

.stat-detail {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  padding: var(--spacing-md);
  background: var(--bg-tertiary);
  border-radius: var(--radius-md);
}

.stat-detail-label {
  font-size: 11px;
  color: var(--text-muted);
}

.stat-detail-value {
  font-size: 18px;
  font-weight: 600;
}
</style>
