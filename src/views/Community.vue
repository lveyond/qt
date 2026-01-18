<template>
  <div class="community">
    <div class="page-header">
      <h1 class="page-title">{{ t('community.title') }}</h1>
      <div class="page-meta">
        <span class="meta-item mono">{{ t('community.lastUpdated') }}: {{ lastUpdate }}</span>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-header">
          <span class="stat-label">{{ t('community.totalUsers') }}</span>
        </div>
        <div class="stat-value">12,458</div>
        <div class="stat-footer mono">+234 {{ t('community.thisWeek') }}</div>
      </div>

      <div class="stat-card">
        <div class="stat-header">
          <span class="stat-label">{{ t('community.sharedStrategies') }}</span>
        </div>
        <div class="stat-value">3,247</div>
        <div class="stat-footer mono">+89 {{ t('community.thisWeek') }}</div>
      </div>

      <div class="stat-card">
        <div class="stat-header">
          <span class="stat-label">{{ t('community.totalSmartMoney') }}</span>
        </div>
        <div class="stat-value">$45.2M</div>
        <div class="stat-footer mono text-success">+12.5% {{ t('common.today') }}</div>
      </div>

      <div class="stat-card">
        <div class="stat-header">
          <span class="stat-label">{{ t('community.totalPoints') }}</span>
        </div>
        <div class="stat-value">2.8M</div>
        <div class="stat-footer mono">{{ t('community.distributed') }}</div>
      </div>
    </div>

    <div class="content-grid">
      <!-- 左侧：策略分享和SmartMoney -->
      <div class="content-left">
        <!-- 策略分享 -->
        <div class="content-card">
          <div class="card-header">
            <h2 class="card-title">{{ t('community.strategySharing') }}</h2>
          </div>
          <div class="card-actions">
            <button class="btn" @click="filterStrategies('all')" :class="{ active: strategyFilter === 'all' }">
              {{ t('common.all') }}
            </button>
            <button class="btn" @click="filterStrategies('hot')" :class="{ active: strategyFilter === 'hot' }">
              {{ t('community.hot') }}
            </button>
            <button class="btn" @click="filterStrategies('latest')" :class="{ active: strategyFilter === 'latest' }">
              {{ t('community.latest') }}
            </button>
          </div>
          <div class="strategy-list">
            <div 
              v-for="strategy in filteredStrategies" 
              :key="strategy.id"
              class="strategy-item"
            >
              <div class="strategy-item-header">
                <div class="user-info">
                  <div class="user-avatar">{{ strategy.author.charAt(0).toUpperCase() }}</div>
                  <div class="user-details">
                    <span class="user-name">{{ strategy.author }}</span>
                    <span class="user-rank" :class="'rank-' + strategy.authorRank">
                      {{ getRankLabel(strategy.authorRank) }}
                    </span>
                  </div>
                </div>
                <div class="strategy-meta">
                  <span class="meta-badge">{{ strategy.category }}</span>
                  <span class="meta-time mono">{{ formatTime(strategy.time) }}</span>
                </div>
              </div>
              <h3 class="strategy-item-title">{{ strategy.title }}</h3>
              <p class="strategy-item-desc">{{ strategy.description }}</p>
              <div class="strategy-stats">
                <div class="stat-badge">
                  <span class="stat-icon">📊</span>
                  <span>{{ strategy.totalReturn >= 0 ? '+' : '' }}{{ strategy.totalReturn }}%</span>
                </div>
                <div class="stat-badge">
                  <span class="stat-icon">📈</span>
                  <span>{{ strategy.winRate }}% {{ t('strategies.winRate') }}</span>
                </div>
                <div class="stat-badge">
                  <span class="stat-icon">👥</span>
                  <span>{{ strategy.followers }} {{ t('community.followers') }}</span>
                </div>
                <div class="stat-badge">
                  <span class="stat-icon">⭐</span>
                  <span>{{ strategy.likes }} {{ t('community.likes') }}</span>
                </div>
              </div>
              <div class="strategy-code-preview">
                <div class="code-preview-header">
                  <span class="mono">{{ t('strategies.code') }}</span>
                  <button class="btn btn-sm" @click="viewStrategy(strategy)">{{ t('common.viewDetails') }}</button>
                </div>
                <div class="code-preview">
                  <pre><code>{{ strategy.codePreview }}</code></pre>
                </div>
              </div>
              <div class="strategy-actions">
                <button class="btn btn-sm" @click="likeStrategy(strategy.id)">
                  <span>👍</span> {{ t('community.like') }}
                </button>
                <button class="btn btn-sm" @click="followStrategy(strategy.id)">
                  <span>👁️</span> {{ t('community.follow') }}
                </button>
                <button class="btn btn-sm" @click="copyStrategy(strategy.id)">
                  <span>📋</span> {{ t('community.copy') }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- SmartMoney 收益 -->
        <div class="content-card">
          <div class="card-header">
            <h2 class="card-title">{{ t('community.smartMoneyPerformance') }}</h2>
          </div>
          <div class="card-actions">
            <select v-model="smartMoneyTimeRange" class="select">
              <option value="24h">{{ t('common.today') }}</option>
              <option value="7d">{{ t('analytics.last7Days') }}</option>
              <option value="30d">{{ t('analytics.last30Days') }}</option>
            </select>
          </div>
          <div class="smartmoney-list">
            <div 
              v-for="(smartmoney, index) in smartMoneyList" 
              :key="smartmoney.id"
              class="smartmoney-item"
            >
              <div class="smartmoney-rank">#{{ index + 1 }}</div>
              <div class="smartmoney-info">
                <div class="smartmoney-header">
                  <div class="user-info">
                    <div class="user-avatar large">{{ smartmoney.name.charAt(0).toUpperCase() }}</div>
                    <div class="user-details">
                      <span class="user-name">{{ smartmoney.name }}</span>
                      <span class="user-address mono">{{ shortenAddress(smartmoney.address) }}</span>
                    </div>
                  </div>
                  <div class="smartmoney-badge" :class="'tier-' + smartmoney.tier">
                    {{ getTierLabel(smartmoney.tier) }}
                  </div>
                </div>
                <div class="smartmoney-stats">
                  <div class="stat-item">
                    <span class="stat-label">{{ t('community.totalAssets') }}</span>
                    <span class="stat-value">${{ formatNumber(smartmoney.totalAssets) }}</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">{{ t('community.return24h') }}</span>
                    <span :class="['stat-value', smartmoney.return24h >= 0 ? 'text-success' : 'text-danger']">
                      {{ smartmoney.return24h >= 0 ? '+' : '' }}{{ smartmoney.return24h }}%
                    </span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">{{ t('community.totalReturn') }}</span>
                    <span :class="['stat-value', smartmoney.totalReturn >= 0 ? 'text-success' : 'text-danger']">
                      {{ smartmoney.totalReturn >= 0 ? '+' : '' }}{{ smartmoney.totalReturn }}%
                    </span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">{{ t('community.activeStrategies') }}</span>
                    <span class="stat-value">{{ smartmoney.activeStrategies }}</span>
                  </div>
                </div>
                <div class="smartmoney-chart">
                  <div ref="smartmoneyChart" :id="'chart-' + smartmoney.id" class="mini-chart"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧：排行榜 -->
      <div class="content-right">
        <!-- 积分排行榜 -->
        <div class="content-card">
          <div class="card-header">
            <h2 class="card-title">{{ t('community.pointsLeaderboard') }}</h2>
          </div>
          <div class="card-actions">
            <select v-model="leaderboardType" class="select">
              <option value="points">{{ t('community.points') }}</option>
              <option value="strategies">{{ t('community.strategies') }}</option>
              <option value="returns">{{ t('community.returns') }}</option>
            </select>
          </div>
          <div class="leaderboard">
            <div 
              v-for="(user, index) in leaderboard" 
              :key="user.id"
              class="leaderboard-item"
              :class="{ 'top-three': index < 3 }"
            >
              <div class="rank-badge" :class="'rank-' + (index + 1)">
                <span v-if="index === 0">🥇</span>
                <span v-else-if="index === 1">🥈</span>
                <span v-else-if="index === 2">🥉</span>
                <span v-else>{{ index + 1 }}</span>
              </div>
              <div class="user-info">
                <div class="user-avatar">{{ user.name.charAt(0).toUpperCase() }}</div>
                <div class="user-details">
                  <span class="user-name">{{ user.name }}</span>
                  <span class="user-level">{{ t('community.level') }} {{ user.level }}</span>
                </div>
              </div>
              <div class="leaderboard-stats">
                <div class="stat-item" v-if="leaderboardType === 'points'">
                  <span class="stat-label">{{ t('community.points') }}</span>
                  <span class="stat-value">{{ formatNumber(user.points) }}</span>
                </div>
                <div class="stat-item" v-if="leaderboardType === 'strategies'">
                  <span class="stat-label">{{ t('community.strategies') }}</span>
                  <span class="stat-value">{{ user.strategies }}</span>
                </div>
                <div class="stat-item" v-if="leaderboardType === 'returns'">
                  <span class="stat-label">{{ t('community.totalReturn') }}</span>
                  <span :class="['stat-value', user.totalReturn >= 0 ? 'text-success' : 'text-danger']">
                    {{ user.totalReturn >= 0 ? '+' : '' }}{{ user.totalReturn }}%
                  </span>
                </div>
              </div>
              <div class="progress-bar">
                <div class="progress-fill" :style="{ width: (user.points / maxPoints * 100) + '%' }"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- 我的积分 -->
        <div class="content-card">
          <div class="card-header">
            <h2 class="card-title">{{ t('community.myPoints') }}</h2>
          </div>
          <div class="my-points">
            <div class="points-display">
              <div class="points-value">{{ formatNumber(myPoints) }}</div>
              <div class="points-label">{{ t('community.points') }}</div>
              <div class="points-level">{{ t('community.level') }} {{ Math.floor(myPoints / 100) + 1 }}</div>
            </div>
            <div class="points-breakdown">
              <div class="breakdown-item">
                <span class="breakdown-label">{{ t('community.strategySharing') }}</span>
                <span class="breakdown-value">+{{ formatNumber(pointsBreakdown.sharing) }}</span>
              </div>
              <div class="breakdown-item">
                <span class="breakdown-label">{{ t('community.dailyCheckin') }}</span>
                <span class="breakdown-value">+{{ formatNumber(pointsBreakdown.checkin) }}</span>
              </div>
              <div class="breakdown-item">
                <span class="breakdown-label">{{ t('community.strategyPerformance') }}</span>
                <span class="breakdown-value">+{{ formatNumber(pointsBreakdown.performance) }}</span>
              </div>
              <div class="breakdown-item">
                <span class="breakdown-label">{{ t('community.communityInteraction') }}</span>
                <span class="breakdown-value">+{{ formatNumber(pointsBreakdown.interaction) }}</span>
              </div>
            </div>
            <button class="btn btn-primary btn-block">{{ t('community.checkinToday') }}</button>
          </div>
        </div>

        <!-- 积分规则和用途 -->
        <div class="content-card">
          <div class="card-header">
            <h2 class="card-title">{{ t('community.pointsRules') }}</h2>
          </div>
          <div class="points-rules">
            <div class="rule-section">
              <h3 class="rule-title">{{ t('community.pointsEarning') }}</h3>
              <ul class="rule-list">
                <li>{{ t('community.ruleGameScore') }}</li>
                <li>{{ t('community.ruleStrategyShare') }}</li>
                <li>{{ t('community.ruleDailyCheckin') }}</li>
                <li>{{ t('community.ruleStrategyPerformance') }}</li>
                <li>{{ t('community.ruleCommunityInteraction') }}</li>
              </ul>
            </div>
            <div class="rule-section">
              <h3 class="rule-title">{{ t('community.levelRules') }}</h3>
              <p class="rule-desc">{{ t('community.levelDesc') }}</p>
              <div class="level-example">
                <span>{{ t('community.levelExample') }}</span>
                <span class="example-text">100积分 = 等级2, 500积分 = 等级6, 1000积分 = 等级11</span>
              </div>
            </div>
            <div class="rule-section">
              <h3 class="rule-title">{{ t('community.rankingRules') }}</h3>
              <p class="rule-desc">{{ t('community.rankingDesc') }}</p>
            </div>
          </div>
        </div>

        <!-- 积分奖励 -->
        <div class="content-card">
          <div class="card-header">
            <h2 class="card-title">{{ t('community.pointsRewards') }}</h2>
          </div>
          <div class="rewards-grid">
            <div class="reward-item" v-for="reward in rewards" :key="reward.id">
              <div class="reward-icon">{{ reward.icon }}</div>
              <div class="reward-info">
                <h4 class="reward-name">{{ reward.name }}</h4>
                <p class="reward-desc">{{ reward.desc }}</p>
                <div class="reward-requirement">
                  <span class="requirement-label">{{ t('community.requirement') }}:</span>
                  <span class="requirement-value">{{ reward.requirement }}</span>
                </div>
              </div>
              <div class="reward-status" :class="{ 'available': reward.available, 'locked': !reward.available }">
                {{ reward.available ? t('community.available') : t('community.locked') }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 策略详情弹窗 -->
    <div 
      class="strategy-modal" 
      v-if="showStrategyModal"
      @click="handleStrategyModalBackdropClick"
    >
      <div class="modal-content strategy-modal-content">
        <div class="modal-header">
          <h2 class="modal-title">{{ currentStrategy?.title }}</h2>
          <button class="btn" @click="closeStrategyModal">×</button>
        </div>
        <div class="modal-body">
          <div class="strategy-full-info">
            <div class="info-section">
              <h3>{{ t('community.author') }}</h3>
              <div class="user-info">
                <div class="user-avatar">{{ currentStrategy?.author.charAt(0).toUpperCase() }}</div>
                <span class="user-name">{{ currentStrategy?.author }}</span>
              </div>
            </div>
            <div class="info-section">
              <h3>{{ t('strategies.code') }}</h3>
              <div class="code-viewer">
                <pre><code>{{ currentStrategy?.fullCode || currentStrategy?.codePreview }}</code></pre>
              </div>
            </div>
            <div class="info-section">
              <h3>{{ t('strategies.params') }}</h3>
              <div class="params-list">
                <div v-for="(value, key) in currentStrategy?.params" :key="key" class="param-item">
                  <span class="param-key mono">{{ key }}</span>
                  <span class="param-value mono">{{ value }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn" @click="closeStrategyModal">{{ t('common.hide') }}</button>
          <button class="btn btn-primary" @click="copyStrategy(currentStrategy?.id)">{{ t('community.copy') }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, inject, watch } from 'vue'
import { getCurrentLanguage, t as translate } from '../i18n'
import * as echarts from 'echarts'

const currentLanguage = inject('language', ref(getCurrentLanguage()))
const t = (key) => translate(key, currentLanguage.value)

const lastUpdate = ref(new Date().toLocaleString())
const strategyFilter = ref('all')
const smartMoneyTimeRange = ref('24h')
const leaderboardType = ref('points')
const showStrategyModal = ref(false)
const currentStrategy = ref(null)

// 策略分享数据
const strategies = ref([
  {
    id: 1,
    author: 'CryptoWhale',
    authorRank: 'diamond',
    title: '高效网格交易策略',
    description: '基于市场波动性的自适应网格交易策略，适用于震荡市场',
    category: '网格交易',
    totalReturn: 45.2,
    winRate: 78.5,
    followers: 1234,
    likes: 567,
    time: Date.now() - 3600000,
    codePreview: `function gridTrading() {
  const gridSize = 0.02;
  const upperPrice = currentPrice * 1.1;
  const lowerPrice = currentPrice * 0.9;
  // ... 网格逻辑
}`,
    fullCode: `function gridTrading() {
  const gridSize = 0.02;
  const upperPrice = currentPrice * 1.1;
  const lowerPrice = currentPrice * 0.9;
  
  for (let price = lowerPrice; price <= upperPrice; price += gridSize) {
    placeOrder(price, amount);
  }
}`,
    params: {
      gridSize: '0.02',
      upperPrice: '1.1x',
      lowerPrice: '0.9x'
    }
  },
  {
    id: 2,
    author: 'DeFiMaster',
    authorRank: 'gold',
    title: '均值回归套利策略',
    description: '利用价格偏离均值的套利机会，风险可控',
    category: '套利',
    totalReturn: 32.8,
    winRate: 82.3,
    followers: 892,
    likes: 423,
    time: Date.now() - 7200000,
    codePreview: `function meanReversion() {
  const mean = calculateMean(prices);
  if (currentPrice < mean * 0.95) {
    buy();
  }
}`,
    fullCode: `function meanReversion() {
  const mean = calculateMean(prices);
  const std = calculateStd(prices);
  
  if (currentPrice < mean - 2 * std) {
    buy();
  } else if (currentPrice > mean + 2 * std) {
    sell();
  }
}`,
    params: {
      lookback: '20',
      stdMultiplier: '2'
    }
  },
  {
    id: 3,
    author: 'TradingPro',
    authorRank: 'platinum',
    title: '趋势跟踪动量策略',
    description: '基于MACD和RSI的趋势跟踪策略，适合趋势市场',
    category: '趋势跟踪',
    totalReturn: 56.7,
    winRate: 75.2,
    followers: 2156,
    likes: 1023,
    time: Date.now() - 1800000,
    codePreview: `function trendFollowing() {
  const macd = calculateMACD();
  if (macd.signal > macd.macd) {
    buy();
  }
}`,
    fullCode: `function trendFollowing() {
  const macd = calculateMACD(12, 26, 9);
  const rsi = calculateRSI(14);
  
  if (macd.signal > macd.macd && rsi < 70) {
    buy();
  } else if (macd.signal < macd.macd && rsi > 30) {
    sell();
  }
}`,
    params: {
      macdFast: '12',
      macdSlow: '26',
      rsiPeriod: '14'
    }
  }
])

// SmartMoney数据
const smartMoneyList = ref([
  {
    id: 1,
    name: 'SmartMoney_001',
    address: '0x1234567890abcdef1234567890abcdef12345678',
    tier: 'diamond',
    totalAssets: 12500000,
    return24h: 3.45,
    totalReturn: 245.8,
    activeStrategies: 12
  },
  {
    id: 2,
    name: 'SmartMoney_002',
    address: '0xabcdef1234567890abcdef1234567890abcdef12',
    tier: 'platinum',
    totalAssets: 8900000,
    return24h: 2.12,
    totalReturn: 189.3,
    activeStrategies: 8
  },
  {
    id: 3,
    name: 'SmartMoney_003',
    address: '0x9876543210fedcba9876543210fedcba98765432',
    tier: 'gold',
    totalAssets: 5600000,
    return24h: 1.87,
    totalReturn: 156.7,
    activeStrategies: 6
  }
])

// 排行榜数据
const leaderboard = ref([
  { id: 1, name: 'CryptoWhale', level: 15, points: 125800, strategies: 24, totalReturn: 245.8 },
  { id: 2, name: 'DeFiMaster', level: 14, points: 112300, strategies: 18, totalReturn: 189.3 },
  { id: 3, name: 'TradingPro', level: 13, points: 98700, strategies: 15, totalReturn: 156.7 },
  { id: 4, name: 'QuantGuru', level: 12, points: 85600, strategies: 12, totalReturn: 134.2 },
  { id: 5, name: 'AlgoTrader', level: 11, points: 72300, strategies: 10, totalReturn: 112.5 },
  { id: 6, name: 'MarketMaker', level: 10, points: 65400, strategies: 9, totalReturn: 98.3 },
  { id: 7, name: 'StrategyKing', level: 9, points: 58900, strategies: 8, totalReturn: 87.6 },
  { id: 8, name: 'ProfitHunter', level: 8, points: 52100, strategies: 7, totalReturn: 76.4 }
])

const pointsBreakdown = ref({
  sharing: 5000,
  checkin: 2345,
  performance: 3000,
  interaction: 2000
})

const myPoints = computed(() => {
  return pointsBreakdown.value.sharing + 
         pointsBreakdown.value.checkin + 
         pointsBreakdown.value.performance + 
         pointsBreakdown.value.interaction
})

const filteredStrategies = computed(() => {
  let filtered = [...strategies.value]
  if (strategyFilter.value === 'hot') {
    filtered.sort((a, b) => b.likes - a.likes)
  } else if (strategyFilter.value === 'latest') {
    filtered.sort((a, b) => b.time - a.time)
  }
  return filtered
})

const maxPoints = computed(() => {
  return Math.max(...leaderboard.value.map(u => u.points))
})

// 积分奖励列表
const rewards = computed(() => {
  const currentLevel = Math.floor(myPoints.value / 100) + 1
  return [
    {
      id: 1,
      icon: '🎁',
      name: t('community.rewardTradingFee'),
      desc: t('community.rewardTradingFeeDesc'),
      requirement: t('community.level') + ' 5',
      available: currentLevel >= 5
    },
    {
      id: 2,
      icon: '⭐',
      name: t('community.rewardPlatformPrivilege'),
      desc: t('community.rewardPlatformPrivilegeDesc'),
      requirement: t('community.level') + ' 10',
      available: currentLevel >= 10
    },
    {
      id: 3,
      icon: '🏆',
      name: t('community.rewardCommunityBadge'),
      desc: t('community.rewardCommunityBadgeDesc'),
      requirement: t('community.level') + ' 15',
      available: currentLevel >= 15
    },
    {
      id: 4,
      icon: '💎',
      name: t('community.rewardExclusiveAccess'),
      desc: t('community.rewardExclusiveAccessDesc'),
      requirement: t('community.level') + ' 20',
      available: currentLevel >= 20
    },
    {
      id: 5,
      icon: '🎯',
      name: t('community.rewardStrategyPriority'),
      desc: t('community.rewardStrategyPriorityDesc'),
      requirement: t('community.points') + ' 50000',
      available: myPoints.value >= 50000
    },
    {
      id: 6,
      icon: '🚀',
      name: t('community.rewardAPIBonus'),
      desc: t('community.rewardAPIBonusDesc'),
      requirement: t('community.points') + ' 100000',
      available: myPoints.value >= 100000
    }
  ]
})

const filterStrategies = (filter) => {
  strategyFilter.value = filter
}

const viewStrategy = (strategy) => {
  currentStrategy.value = strategy
  showStrategyModal.value = true
}

// 阻止点击遮罩层关闭策略弹窗
const handleStrategyModalBackdropClick = (e) => {
  // 如果点击的是遮罩层本身（不是弹窗内容），阻止关闭
  if (e.target === e.currentTarget) {
    e.preventDefault()
    e.stopPropagation()
    // 不执行任何操作，强制用户使用关闭按钮
  }
}

const closeStrategyModal = () => {
  showStrategyModal.value = false
  currentStrategy.value = null
}

const likeStrategy = (id) => {
  const strategy = strategies.value.find(s => s.id === id)
  if (strategy) {
    strategy.likes++
  }
}

const followStrategy = (id) => {
  const strategy = strategies.value.find(s => s.id === id)
  if (strategy) {
    strategy.followers++
  }
}

const copyStrategy = (id) => {
  const strategy = strategies.value.find(s => s.id === id)
  if (strategy) {
    navigator.clipboard.writeText(strategy.fullCode || strategy.codePreview)
    alert(t('community.copied'))
  }
}

const formatTime = (timestamp) => {
  const now = Date.now()
  const diff = now - timestamp
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  
  if (minutes < 60) {
    return `${minutes}${t('community.minutesAgo')}`
  } else if (hours < 24) {
    return `${hours}${t('community.hoursAgo')}`
  } else {
    return `${days}${t('community.daysAgo')}`
  }
}

const formatNumber = (num) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toLocaleString()
}

const shortenAddress = (address) => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

const getRankLabel = (rank) => {
  const labels = {
    diamond: t('community.rankDiamond'),
    platinum: t('community.rankPlatinum'),
    gold: t('community.rankGold'),
    silver: t('community.rankSilver'),
    bronze: t('community.rankBronze')
  }
  return labels[rank] || rank
}

const getTierLabel = (tier) => {
  const labels = {
    diamond: t('community.tierDiamond'),
    platinum: t('community.tierPlatinum'),
    gold: t('community.tierGold'),
    silver: t('community.tierSilver')
  }
  return labels[tier] || tier
}

// 初始化SmartMoney图表
const initSmartMoneyCharts = () => {
  smartMoneyList.value.forEach((smartmoney) => {
    const chartDom = document.getElementById(`chart-${smartmoney.id}`)
    if (chartDom) {
      const myChart = echarts.init(chartDom)
      const option = {
        grid: { left: 0, right: 0, top: 0, bottom: 0 },
        xAxis: { type: 'category', show: false, data: ['1', '2', '3', '4', '5', '6', '7'] },
        yAxis: { type: 'value', show: false },
        series: [{
          data: [100, 102, 105, 103, 108, 110, 112],
          type: 'line',
          smooth: true,
          lineStyle: { color: '#6366f1', width: 2 },
          areaStyle: { color: 'rgba(99, 102, 241, 0.1)' },
          symbol: 'none'
        }]
      }
      myChart.setOption(option)
    }
  })
}

onMounted(() => {
  setTimeout(() => {
    initSmartMoneyCharts()
  }, 100)
})

watch(smartMoneyTimeRange, () => {
  setTimeout(() => {
    initSmartMoneyCharts()
  }, 100)
})
</script>

<style scoped>
.community {
  padding-bottom: var(--spacing-xl);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-xl);
}

.content-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: var(--spacing-xl);
}

.content-left {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
}

.content-right {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
}

.card-header {
  margin-bottom: var(--spacing-md);
}

.card-title {
  font-family: 'PingFang SC', 'PingFang TC', 'Noto Sans SC', 'Microsoft YaHei UI', 'Microsoft YaHei', '微软雅黑', 'SimHei', '黑体', 'Microsoft JhengHei', '微軟正黑體', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 var(--spacing-md) 0;
}

.card-actions {
  display: flex;
  gap: var(--spacing-xs);
  margin-bottom: var(--spacing-lg);
}

.card-actions .btn.active {
  background: var(--tech-primary);
  color: white;
  border-color: var(--tech-primary);
}

.strategy-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.strategy-item {
  padding: var(--spacing-lg);
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  transition: all 0.2s;
}

.strategy-item:hover {
  border-color: var(--border-hover);
  background: var(--bg-tertiary);
}

.strategy-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.user-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--tech-gradient);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
  color: white;
}

.user-avatar.large {
  width: 48px;
  height: 48px;
  font-size: 18px;
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.user-name {
  font-weight: 600;
  color: var(--text-primary);
  font-family: 'PingFang SC', 'PingFang TC', 'Noto Sans SC', 'Microsoft YaHei UI', 'Microsoft YaHei', '微软雅黑', 'SimHei', '黑体', 'Microsoft JhengHei', '微軟正黑體', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
}

.user-rank {
  font-size: 11px;
  padding: 2px 6px;
  border-radius: var(--radius-sm);
  background: var(--bg-tertiary);
  font-family: 'PingFang SC', 'PingFang TC', 'Noto Sans SC', 'Microsoft YaHei UI', 'Microsoft YaHei', '微软雅黑', 'SimHei', '黑体', 'Microsoft JhengHei', '微軟正黑體', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
}

.rank-diamond { color: #b9f2ff; background: rgba(185, 242, 255, 0.1); }
.rank-platinum { color: #e5e4e2; background: rgba(229, 228, 226, 0.1); }
.rank-gold { color: #ffd700; background: rgba(255, 215, 0, 0.1); }
.rank-silver { color: #c0c0c0; background: rgba(192, 192, 192, 0.1); }
.rank-bronze { color: #cd7f32; background: rgba(205, 127, 50, 0.1); }

.user-address {
  font-size: 11px;
  color: var(--text-muted);
}

.user-level {
  font-size: 11px;
  color: var(--text-muted);
  font-family: 'PingFang SC', 'PingFang TC', 'Noto Sans SC', 'Microsoft YaHei UI', 'Microsoft YaHei', '微软雅黑', 'SimHei', '黑体', 'Microsoft JhengHei', '微軟正黑體', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
}

.strategy-meta {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.meta-badge {
  padding: 4px 8px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  font-size: 11px;
  color: var(--text-secondary);
}

.meta-time {
  font-size: 11px;
  color: var(--text-muted);
}

.strategy-item-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--spacing-sm);
  font-family: 'PingFang SC', 'PingFang TC', 'Noto Sans SC', 'Microsoft YaHei UI', 'Microsoft YaHei', '微软雅黑', 'SimHei', '黑体', 'Microsoft JhengHei', '微軟正黑體', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
}

.strategy-item-desc {
  color: var(--text-secondary);
  margin-bottom: var(--spacing-md);
  line-height: 1.6;
  font-family: 'PingFang SC', 'PingFang TC', 'Noto Sans SC', 'Microsoft YaHei UI', 'Microsoft YaHei', '微软雅黑', 'SimHei', '黑体', 'Microsoft JhengHei', '微軟正黑體', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
}

.strategy-stats {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
}

.stat-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  font-size: 12px;
  color: var(--text-secondary);
}

.stat-icon {
  font-size: 14px;
}

.strategy-code-preview {
  margin-bottom: var(--spacing-md);
}

.code-preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-xs);
}

.code-preview {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  padding: var(--spacing-sm);
  overflow-x: auto;
}

.code-preview pre {
  margin: 0;
  font-size: 11px;
  color: var(--text-secondary);
}

.strategy-actions {
  display: flex;
  gap: var(--spacing-sm);
}

.btn-sm {
  padding: var(--spacing-xs) var(--spacing-sm);
  font-size: 12px;
}

.smartmoney-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.smartmoney-item {
  display: flex;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
}

.smartmoney-rank {
  font-size: 24px;
  font-weight: 600;
  color: var(--text-muted);
  min-width: 40px;
}

.smartmoney-info {
  flex: 1;
}

.smartmoney-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.smartmoney-badge {
  padding: 4px 12px;
  border-radius: var(--radius-sm);
  font-size: 12px;
  font-weight: 600;
}

.tier-diamond { background: rgba(185, 242, 255, 0.2); color: #b9f2ff; }
.tier-platinum { background: rgba(229, 228, 226, 0.2); color: #e5e4e2; }
.tier-gold { background: rgba(255, 215, 0, 0.2); color: #ffd700; }
.tier-silver { background: rgba(192, 192, 192, 0.2); color: #c0c0c0; }

.smartmoney-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-md);
}

.smartmoney-stats .stat-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.smartmoney-stats .stat-label {
  font-size: 11px;
  color: var(--text-muted);
}

.smartmoney-stats .stat-value {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.mini-chart {
  width: 100%;
  height: 60px;
}

.leaderboard {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.leaderboard-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  position: relative;
}

.leaderboard-item.top-three {
  background: var(--bg-tertiary);
  border-color: var(--tech-primary);
}

.rank-badge {
  min-width: 32px;
  text-align: center;
  font-weight: 600;
  font-size: 16px;
}

.rank-1 { color: #ffd700; }
.rank-2 { color: #c0c0c0; }
.rank-3 { color: #cd7f32; }

.leaderboard-stats {
  flex: 1;
  display: flex;
  justify-content: flex-end;
}

.leaderboard-stats .stat-item {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
}

.leaderboard-stats .stat-label {
  font-size: 10px;
  color: var(--text-muted);
}

.leaderboard-stats .stat-value {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.progress-bar {
  width: 60px;
  height: 4px;
  background: var(--bg-tertiary);
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--tech-gradient);
  transition: width 0.3s;
}

.my-points {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.points-display {
  text-align: center;
  padding: var(--spacing-xl);
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
}

.points-value {
  font-size: 48px;
  font-weight: 700;
  background: var(--tech-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.points-label {
  font-size: 14px;
  color: var(--text-secondary);
  margin-top: var(--spacing-xs);
}

.points-level {
  font-size: 16px;
  color: var(--tech-primary);
  margin-top: var(--spacing-xs);
  font-weight: 600;
  font-family: 'PingFang SC', 'PingFang TC', 'Noto Sans SC', 'Microsoft YaHei UI', 'Microsoft YaHei', '微软雅黑', 'SimHei', '黑体', 'Microsoft JhengHei', '微軟正黑體', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
}

.points-rules {
  padding: var(--spacing-md);
}

.rule-section {
  margin-bottom: var(--spacing-lg);
}

.rule-section:last-child {
  margin-bottom: 0;
}

.rule-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 var(--spacing-sm) 0;
  font-family: 'PingFang SC', 'PingFang TC', 'Noto Sans SC', 'Microsoft YaHei UI', 'Microsoft YaHei', '微软雅黑', 'SimHei', '黑体', 'Microsoft JhengHei', '微軟正黑體', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
}

.rule-desc {
  color: var(--text-secondary);
  font-size: 14px;
  line-height: 1.6;
  margin: 0 0 var(--spacing-sm) 0;
  font-family: 'PingFang SC', 'PingFang TC', 'Noto Sans SC', 'Microsoft YaHei UI', 'Microsoft YaHei', '微软雅黑', 'SimHei', '黑体', 'Microsoft JhengHei', '微軟正黑體', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
}

.rule-list {
  margin: var(--spacing-sm) 0 0 0;
  padding-left: var(--spacing-lg);
  color: var(--text-secondary);
  font-size: 14px;
  line-height: 1.8;
  font-family: 'PingFang SC', 'PingFang TC', 'Noto Sans SC', 'Microsoft YaHei UI', 'Microsoft YaHei', '微软雅黑', 'SimHei', '黑体', 'Microsoft JhengHei', '微軟正黑體', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
}

.rule-list li {
  margin-bottom: var(--spacing-xs);
}

.level-example {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm);
  background: var(--bg-tertiary);
  border-radius: var(--radius-sm);
  margin-top: var(--spacing-sm);
  font-size: 13px;
  color: var(--text-secondary);
  font-family: 'PingFang SC', 'PingFang TC', 'Noto Sans SC', 'Microsoft YaHei UI', 'Microsoft YaHei', '微软雅黑', 'SimHei', '黑体', 'Microsoft JhengHei', '微軟正黑體', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
}

.example-text {
  color: var(--tech-primary);
  font-weight: 500;
}

.rewards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--spacing-md);
  padding: var(--spacing-md);
}

.reward-item {
  display: flex;
  flex-direction: column;
  padding: var(--spacing-md);
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  border: 2px solid var(--border-color);
  transition: all 0.3s ease;
  position: relative;
}

.reward-item:hover {
  border-color: var(--tech-primary);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
}

.reward-item .reward-icon {
  font-size: 32px;
  margin-bottom: var(--spacing-sm);
}

.reward-info {
  flex: 1;
  margin-bottom: var(--spacing-sm);
}

.reward-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 var(--spacing-xs) 0;
  font-family: 'PingFang SC', 'PingFang TC', 'Noto Sans SC', 'Microsoft YaHei UI', 'Microsoft YaHei', '微软雅黑', 'SimHei', '黑体', 'Microsoft JhengHei', '微軟正黑體', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
}

.reward-desc {
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.6;
  margin: 0 0 var(--spacing-sm) 0;
  font-family: 'PingFang SC', 'PingFang TC', 'Noto Sans SC', 'Microsoft YaHei UI', 'Microsoft YaHei', '微软雅黑', 'SimHei', '黑体', 'Microsoft JhengHei', '微軟正黑體', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
}

.reward-requirement {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: 12px;
  color: var(--text-muted);
  font-family: 'PingFang SC', 'PingFang TC', 'Noto Sans SC', 'Microsoft YaHei UI', 'Microsoft YaHei', '微软雅黑', 'SimHei', '黑体', 'Microsoft JhengHei', '微軟正黑體', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
}

.requirement-value {
  color: var(--tech-primary);
  font-weight: 600;
}

.reward-status {
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-sm);
  font-size: 12px;
  font-weight: 600;
  text-align: center;
  font-family: 'PingFang SC', 'PingFang TC', 'Noto Sans SC', 'Microsoft YaHei UI', 'Microsoft YaHei', '微软雅黑', 'SimHei', '黑体', 'Microsoft JhengHei', '微軟正黑體', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
}

.reward-status.available {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
  border: 1px solid #10b981;
}

.reward-status.locked {
  background: rgba(107, 114, 128, 0.1);
  color: #6b7280;
  border: 1px solid #6b7280;
}

.points-breakdown {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.breakdown-item {
  display: flex;
  justify-content: space-between;
  padding: var(--spacing-sm);
  background: var(--bg-secondary);
  border-radius: var(--radius-sm);
}

.breakdown-label {
  color: var(--text-secondary);
  font-size: 13px;
}

.breakdown-value {
  color: var(--text-success);
  font-weight: 600;
  font-size: 13px;
}

.btn-block {
  width: 100%;
}

.select {
  padding: var(--spacing-xs) var(--spacing-sm);
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-size: 12px;
  cursor: pointer;
}

.card-actions {
  display: flex;
  gap: var(--spacing-xs);
}

.card-actions .btn.active {
  background: var(--tech-primary);
  color: white;
  border-color: var(--tech-primary);
}

.strategy-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xl);
}

.strategy-modal-content {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  width: 90%;
  max-width: 900px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 
    0 20px 60px rgba(0, 0, 0, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: var(--spacing-lg) var(--spacing-lg) var(--spacing-md);
  border-bottom: 1px solid var(--border-color);
  gap: var(--spacing-md);
}

.modal-title {
  font-family: var(--font-mono);
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  flex: 1;
  line-height: 1.4;
}

.modal-header .btn {
  flex-shrink: 0;
  min-width: 32px;
  height: 32px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  line-height: 1;
}

.modal-body {
  padding: var(--spacing-lg);
  overflow-y: auto;
  flex: 1;
}

.strategy-full-info {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
}

.info-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.info-section h3 {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  color: var(--text-primary);
  font-family: var(--font-mono);
}

.info-section .user-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  margin-top: var(--spacing-xs);
}

.info-section .user-avatar {
  width: 40px;
  height: 40px;
  font-size: 16px;
}

.info-section .user-name {
  font-size: 15px;
  font-weight: 500;
  font-family: 'PingFang SC', 'PingFang TC', 'Noto Sans SC', 'Microsoft YaHei UI', 'Microsoft YaHei', '微软雅黑', 'SimHei', '黑体', 'Microsoft JhengHei', '微軟正黑體', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
}

.code-viewer {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  padding: var(--spacing-md);
  overflow-x: auto;
  margin-top: var(--spacing-xs);
}

.code-viewer pre {
  margin: 0;
  font-size: 12px;
  line-height: 1.6;
  font-family: var(--font-mono);
}

.code-viewer code {
  color: var(--text-primary);
}

.params-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-xs);
}

.param-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
}

.param-key {
  color: var(--text-secondary);
  font-size: 13px;
}

.param-value {
  color: var(--text-primary);
  font-size: 13px;
  font-weight: 500;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  border-top: 1px solid var(--border-color);
}

@media (max-width: 1200px) {
  .content-grid {
    grid-template-columns: 1fr;
  }
}
</style>
