<template>
  <div class="strategies">
    <div class="page-header">
      <h1 class="page-title">{{ t('strategies.title') }}</h1>
      <button class="btn btn-primary" @click="openCreateModal">
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
          <button class="btn" @click="openBacktestModal(strategy)">{{ t('strategies.backtest') }}</button>
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

    <!-- 创建策略弹窗 - 可视化向导 -->
    <div 
      class="create-strategy-modal" 
      v-if="showCreateModal"
      @click.self="closeCreateModal"
      @wheel.prevent="handleModalWheel"
    >
      <div class="modal-content create-modal-content">
        <div class="modal-header">
          <h2 class="modal-title">{{ t('strategies.createStrategy') }}</h2>
          <button class="btn btn-close" @click="closeCreateModal" title="关闭">×</button>
        </div>

        <!-- 步骤指示器 -->
        <div class="wizard-steps">
          <div 
            v-for="(step, index) in wizardSteps" 
            :key="index"
            class="step-item"
            :class="{ 
              active: currentStep === index + 1,
              completed: currentStep > index + 1
            }"
          >
            <div class="step-number">{{ index + 1 }}</div>
            <div class="step-label">{{ step.label }}</div>
          </div>
        </div>

        <div class="modal-body create-modal-body">
          <!-- 步骤1: 选择策略模板 -->
          <div v-if="currentStep === 1" class="wizard-step-content">
            <div class="step-header">
              <h3 class="step-title">{{ t('strategies.wizard.step1Title') }}</h3>
              <p class="step-description">{{ t('strategies.wizard.step1Desc') }}</p>
            </div>
            
            <div class="template-grid">
              <div 
                v-for="template in strategyTemplates" 
                :key="template.id"
                class="template-card"
                :class="{ selected: selectedTemplate?.id === template.id }"
                @click="selectTemplate(template)"
              >
                <div class="template-icon" v-html="getTemplateIcon(template.id)"></div>
                <h4 class="template-name">{{ template.name }}</h4>
                <p class="template-desc">{{ template.description }}</p>
                <div class="template-tags">
                  <span 
                    v-for="tag in template.tags" 
                    :key="tag"
                    class="template-tag"
                  >{{ tag }}</span>
                </div>
                <div class="template-stats">
                  <span class="stat-item">
                    <span class="stat-label">{{ t('strategies.wizard.applicableScenario') }}</span>
                    <span class="stat-value">{{ template.scenario }}</span>
                  </span>
                </div>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">
                <span>{{ t('strategies.wizard.strategyName') }}</span>
                <span class="form-required">*</span>
              </label>
              <input 
                v-model="newStrategy.name" 
                type="text" 
                class="input" 
                :placeholder="t('strategies.wizard.strategyNamePlaceholder')"
                @keydown.enter.prevent
              >
            </div>

            <div class="form-group">
              <label class="form-label">{{ t('strategies.wizard.strategyDesc') }}</label>
              <textarea 
                v-model="newStrategy.description" 
                class="input" 
                rows="2" 
                :placeholder="t('strategies.wizard.strategyDescPlaceholder')"
              ></textarea>
            </div>
          </div>

          <!-- 步骤2: 配置参数 -->
          <div v-if="currentStep === 2" class="wizard-step-content">
            <div class="step-header">
              <h3 class="step-title">{{ t('strategies.wizard.step2Title') }}</h3>
              <p class="step-description">{{ t('strategies.wizard.step2Desc') }}</p>
            </div>

            <div v-if="selectedTemplate" class="params-config">
              <div 
                v-for="param in selectedTemplate.params" 
                :key="param.key"
                class="param-config-item"
              >
                <div class="param-info">
                  <label class="param-label">
                    <span>{{ param.label }}</span>
                    <span v-if="param.required" class="form-required">*</span>
                  </label>
                  <p class="param-hint">{{ param.hint }}</p>
                </div>
                
                <div class="param-control">
                  <!-- 滑块类型 -->
                  <div v-if="param.type === 'slider'" class="slider-wrapper">
                    <input 
                      type="range"
                      :min="param.min"
                      :max="param.max"
                      :step="param.step || 1"
                      v-model.number="param.value"
                      class="slider"
                      @input="updateParamValue(param.key, param.value)"
                    >
                    <div class="slider-value">
                      <span>{{ param.value }}{{ param.unit }}</span>
                    </div>
                  </div>

                  <!-- 数字输入 -->
                  <div v-else-if="param.type === 'number'" class="number-input-wrapper">
                    <input 
                      type="number"
                      :min="param.min"
                      :max="param.max"
                      :step="param.step || 1"
                      v-model.number="param.value"
                      class="input"
                      @input="updateParamValue(param.key, param.value)"
                    >
                    <span class="input-unit">{{ param.unit }}</span>
                  </div>

                  <!-- 选择器 -->
                  <div v-else-if="param.type === 'select'" class="select-wrapper">
                    <select 
                      v-model="param.value"
                      class="input"
                      @change="updateParamValue(param.key, param.value)"
                    >
                      <option 
                        v-for="option in param.options" 
                        :key="option.value"
                        :value="option.value"
                      >{{ option.label }}</option>
                    </select>
                  </div>

                  <!-- 文本输入 -->
                  <div v-else class="text-input-wrapper">
                    <input 
                      type="text"
                      v-model="param.value"
                      class="input"
                      :placeholder="param.placeholder"
                      @input="updateParamValue(param.key, param.value)"
                    >
                  </div>
                </div>
              </div>
            </div>

            <!-- 实时预览 -->
            <div class="preview-section">
              <div class="preview-header">
                <span class="preview-title">{{ t('strategies.wizard.realtimePreview') }}</span>
              </div>
              <div class="preview-card">
                <div class="preview-stats">
                  <div class="preview-stat">
                    <span class="preview-stat-label">{{ t('strategies.wizard.strategyType') }}</span>
                    <span class="preview-stat-value">{{ selectedTemplate?.name || '-' }}</span>
                  </div>
                  <div class="preview-stat">
                    <span class="preview-stat-label">{{ t('strategies.wizard.paramCount') }}</span>
                    <span class="preview-stat-value">{{ selectedTemplate?.params?.length || 0 }} {{ t('strategies.wizard.paramUnit') }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 步骤3: 预览确认 -->
          <div v-if="currentStep === 3" class="wizard-step-content">
            <div class="step-header">
              <h3 class="step-title">{{ t('strategies.wizard.step3Title') }}</h3>
              <p class="step-description">{{ t('strategies.wizard.step3Desc') }}</p>
            </div>

            <div class="preview-summary">
              <div class="summary-card">
                <h4 class="summary-title">{{ t('strategies.wizard.summaryInfo') }}</h4>
                <div class="summary-item">
                  <span class="summary-label">{{ t('strategies.wizard.summaryName') }}</span>
                  <span class="summary-value">{{ newStrategy.name || t('strategies.wizard.unnamed') }}</span>
                </div>
                <div class="summary-item">
                  <span class="summary-label">{{ t('strategies.wizard.summaryType') }}</span>
                  <span class="summary-value">{{ selectedTemplate?.name || '-' }}</span>
                </div>
                <div class="summary-item" v-if="newStrategy.description">
                  <span class="summary-label">{{ t('strategies.wizard.summaryDesc') }}</span>
                  <span class="summary-value">{{ newStrategy.description }}</span>
                </div>
              </div>

              <div class="summary-card">
                <h4 class="summary-title">{{ t('strategies.wizard.summaryParams') }}</h4>
                <div class="params-summary">
                  <div 
                    v-for="param in selectedTemplate?.params" 
                    :key="param.key"
                    class="summary-param"
                  >
                    <span class="summary-param-key mono">{{ param.key }}</span>
                    <span class="summary-param-value mono">{{ param.value }}{{ param.unit }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 高级选项：代码编辑器 -->
            <div class="advanced-section">
              <div class="advanced-header">
                <div>
                  <span class="advanced-title">{{ t('strategies.wizard.advancedOptions') }}</span>
                  <span class="advanced-hint">{{ t('strategies.wizard.advancedHint') }}</span>
                </div>
                <button 
                  class="btn btn-sm btn-secondary" 
                  @click.stop="showAdvanced = !showAdvanced"
                  type="button"
                >
                  {{ showAdvanced ? t('strategies.wizard.hideCode') : t('strategies.wizard.showCode') }}
                </button>
              </div>
              <div v-if="showAdvanced" class="code-editor-container">
                <div class="code-editor-wrapper">
                  <div class="code-editor-header">
                    <span class="code-file-name mono">{{ newStrategy.file || 'strategy.py' }}</span>
                    <button class="btn btn-sm" @click.stop="resetCodeTemplate" type="button">{{ t('strategies.wizard.resetTemplate') }}</button>
                  </div>
                  <textarea 
                    v-model="newStrategy.code" 
                    class="code-textarea mono"
                    :placeholder="t('strategies.wizard.codePlaceholder')"
                    spellcheck="false"
                  ></textarea>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn" @click="prevStep" v-if="currentStep > 1">{{ t('strategies.wizard.prevStep') }}</button>
          <button class="btn" @click="closeCreateModal" v-if="currentStep === 1">{{ t('strategies.wizard.cancel') }}</button>
          <button 
            class="btn btn-primary" 
            @click="nextStep" 
            v-if="currentStep < 3"
            :disabled="!canGoNext"
          >
            {{ t('strategies.wizard.nextStep') }}
          </button>
          <button 
            class="btn btn-primary" 
            @click="createStrategy" 
            v-if="currentStep === 3"
            :disabled="!canCreate"
          >
            {{ t('strategies.wizard.create') }}
          </button>
        </div>
      </div>
    </div>

    <!-- 回测弹窗 -->
    <div 
      class="backtest-modal" 
      v-if="showBacktestModal"
      @click.self="closeBacktestModal"
      @wheel.prevent="handleModalWheel"
    >
      <div class="modal-content backtest-modal-content">
        <div class="modal-header">
          <h2 class="modal-title">{{ t('strategies.backtestTitle') }} - {{ currentBacktestStrategy?.name }}</h2>
          <button class="btn btn-close" @click="closeBacktestModal" title="关闭">×</button>
        </div>

        <div class="modal-body backtest-modal-body">
          <!-- 回测配置 -->
          <div v-if="!backtestCompleted" class="backtest-config-section">
            <h3 class="section-title">{{ t('strategies.backtestConfig') }}</h3>
            
            <div class="config-grid">
              <div class="form-group">
                <label class="form-label">{{ t('strategies.backtestTimeRange') }}</label>
                <select v-model="backtestConfig.timeRange" class="input">
                  <option value="7d">{{ t('strategies.backtestLast7Days') }}</option>
                  <option value="30d">{{ t('strategies.backtestLast30Days') }}</option>
                  <option value="90d">{{ t('strategies.backtestLast90Days') }}</option>
                  <option value="1y">{{ t('strategies.backtestLastYear') }}</option>
                  <option value="custom">{{ t('strategies.backtestCustom') }}</option>
                </select>
              </div>

              <div class="form-group" v-if="backtestConfig.timeRange === 'custom'">
                <label class="form-label">{{ t('strategies.backtestStartDate') }}</label>
                <input 
                  v-model="backtestConfig.startDate" 
                  type="date" 
                  class="input"
                >
              </div>

              <div class="form-group" v-if="backtestConfig.timeRange === 'custom'">
                <label class="form-label">{{ t('strategies.backtestEndDate') }}</label>
                <input 
                  v-model="backtestConfig.endDate" 
                  type="date" 
                  class="input"
                >
              </div>

              <div class="form-group">
                <label class="form-label">{{ t('strategies.backtestInitialCapital') }}</label>
                <input 
                  v-model.number="backtestConfig.initialCapital" 
                  type="number" 
                  class="input"
                  :placeholder="t('strategies.backtestPlaceholder')"
                  min="100"
                  step="100"
                >
              </div>

              <div class="form-group">
                <label class="form-label">{{ t('strategies.backtestTradingPair') }}</label>
                <select v-model="backtestConfig.tradingPair" class="input">
                  <option value="ETH/USDT">ETH/USDT</option>
                  <option value="BTC/USDT">BTC/USDT</option>
                  <option value="BNB/USDT">BNB/USDT</option>
                  <option value="SOL/USDT">SOL/USDT</option>
                </select>
              </div>
            </div>
          </div>

          <!-- 回测结果 -->
          <div v-if="backtestCompleted" class="backtest-results-section">
            <h3 class="section-title">{{ t('strategies.backtestResults') }}</h3>

            <!-- 关键指标 -->
            <div class="results-stats">
              <div class="result-stat-card">
                <div class="result-stat-label">{{ t('strategies.backtestTotalReturn') }}</div>
                <div 
                  class="result-stat-value"
                  :class="backtestResults.totalReturn >= 0 ? 'text-success' : 'text-danger'"
                >
                  {{ backtestResults.totalReturn >= 0 ? '+' : '' }}{{ backtestResults.totalReturn.toFixed(2) }}%
                </div>
              </div>

              <div class="result-stat-card">
                <div class="result-stat-label">{{ t('strategies.backtestTotalProfit') }}</div>
                <div 
                  class="result-stat-value"
                  :class="backtestResults.totalProfit >= 0 ? 'text-success' : 'text-danger'"
                >
                  {{ backtestResults.totalProfit >= 0 ? '+' : '' }}${{ backtestResults.totalProfit.toLocaleString() }}
                </div>
              </div>

              <div class="result-stat-card">
                <div class="result-stat-label">{{ t('strategies.backtestMaxDrawdown') }}</div>
                <div class="result-stat-value text-danger">
                  -{{ backtestResults.maxDrawdown.toFixed(2) }}%
                </div>
              </div>

              <div class="result-stat-card">
                <div class="result-stat-label">{{ t('strategies.backtestSharpeRatio') }}</div>
                <div class="result-stat-value">
                  {{ backtestResults.sharpeRatio.toFixed(2) }}
                </div>
              </div>

              <div class="result-stat-card">
                <div class="result-stat-label">{{ t('strategies.backtestWinRate') }}</div>
                <div class="result-stat-value">
                  {{ backtestResults.winRate.toFixed(1) }}%
                </div>
              </div>

              <div class="result-stat-card">
                <div class="result-stat-label">{{ t('strategies.backtestTotalTrades') }}</div>
                <div class="result-stat-value">
                  {{ backtestResults.totalTrades }}
                </div>
              </div>
            </div>

            <!-- 图表区域 -->
            <div class="backtest-charts">
              <div class="chart-container">
                <div class="chart-header">
                  <h4 class="chart-title">{{ t('strategies.backtestEquityCurve') }}</h4>
                </div>
                <div ref="equityChart" class="backtest-chart"></div>
              </div>

              <div class="chart-container">
                <div class="chart-header">
                  <h4 class="chart-title">{{ t('strategies.backtestMonthlyReturn') }}</h4>
                </div>
                <div ref="monthlyChart" class="backtest-chart"></div>
              </div>
            </div>
          </div>

          <!-- 回测中状态 -->
          <div v-if="backtestRunning" class="backtest-loading">
            <div class="loading-spinner"></div>
            <p class="loading-text">{{ t('strategies.backtestRunning') }}</p>
          </div>
        </div>

        <div class="modal-footer">
          <button 
            class="btn" 
            @click="closeBacktestModal"
            v-if="!backtestRunning"
          >
            {{ t('strategies.backtestClose') }}
          </button>
          <button 
            class="btn btn-secondary" 
            @click="resetBacktest"
            v-if="backtestCompleted && !backtestRunning"
          >
            {{ t('strategies.backtestReset') }}
          </button>
          <button 
            class="btn btn-primary" 
            @click="runBacktest"
            v-if="!backtestCompleted && !backtestRunning"
            :disabled="!canRunBacktest"
          >
            {{ t('strategies.backtestRun') }}
          </button>
          <button 
            class="btn btn-primary" 
            @click="exportBacktestReport"
            v-if="backtestCompleted && !backtestRunning"
          >
            {{ t('strategies.backtestExport') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, inject, onMounted, onUnmounted, nextTick } from 'vue'
import { getCurrentLanguage, t as translate } from '../i18n'
import * as echarts from 'echarts'

const currentLanguage = inject('language', ref(getCurrentLanguage()))

// 监听语言变化
window.addEventListener('language-changed', () => {
  currentLanguage.value = getCurrentLanguage()
})

const t = (key) => translate(key, currentLanguage.value)

const showCreateModal = ref(false)
const showCodeModal = ref(false)
const showBacktestModal = ref(false)
const currentStrategy = ref(null)
const currentBacktestStrategy = ref(null)

// 向导步骤
const currentStep = ref(1)
const wizardSteps = computed(() => [
  { label: t('strategies.wizard.step1'), key: 'template' },
  { label: t('strategies.wizard.step2'), key: 'params' },
  { label: t('strategies.wizard.step3'), key: 'preview' }
])

const selectedTemplate = ref(null)
const showAdvanced = ref(false)

const newStrategy = ref({
  name: '',
  file: '',
  description: '',
  code: '',
  params: []
})

// 策略模板定义
// 获取模板图标（线性SVG）
const getTemplateIcon = (templateId) => {
  const icons = {
    // 网格交易 - 网格布局图标
    grid: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="3" y="3" width="7" height="7"></rect>
      <rect x="14" y="3" width="7" height="7"></rect>
      <rect x="14" y="14" width="7" height="7"></rect>
      <rect x="3" y="14" width="7" height="7"></rect>
    </svg>`,
    // 均值回归 - 波浪线回归图标
    mean_reversion: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M3 12h18"></path>
      <path d="M3 6c0 2 2 4 4 4s4-2 4-4c0 2 2 4 4 4s4-2 4-4c0 2 2 4 4 4s4-2 4-4"></path>
      <path d="M3 18c0-2 2-4 4-4s4 2 4 4c0-2 2-4 4-4s4 2 4 4c0-2 2-4 4-4s4 2 4 4"></path>
    </svg>`,
    // 趋势跟踪 - 上升趋势线图标
    trend_following: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
      <polyline points="17 6 23 6 23 12"></polyline>
    </svg>`,
    // 套利 - 双箭头交换图标
    arbitrage: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M7 16V4m0 0L3 8m4-4l4 4"></path>
      <path d="M17 8v12m0 0l4-4m-4 4l-4-4"></path>
      <path d="M3 12h18"></path>
    </svg>`
  }
  return icons[templateId] || ''
}

const strategyTemplates = computed(() => [
  {
    id: 'grid',
    name: t('strategies.templates.grid.name'),
    description: t('strategies.templates.grid.description'),
    scenario: t('strategies.templates.grid.scenario'),
    tags: [
      t('strategies.templates.grid.tags.lowRisk'),
      t('strategies.templates.grid.tags.stableReturn'),
      t('strategies.templates.grid.tags.automation')
    ],
    params: [
      {
        key: 'grid_size',
        label: t('strategies.templates.grid.params.gridSize'),
        type: 'slider',
        value: 0.5,
        min: 0.1,
        max: 5,
        step: 0.1,
        unit: '%',
        hint: t('strategies.templates.grid.params.gridSizeHint'),
        required: true
      },
      {
        key: 'grid_count',
        label: t('strategies.templates.grid.params.gridCount'),
        type: 'slider',
        value: 20,
        min: 5,
        max: 50,
        step: 1,
        unit: t('strategies.templates.grid.params.gridCountUnit'),
        hint: t('strategies.templates.grid.params.gridCountHint'),
        required: true
      },
      {
        key: 'base_asset',
        label: t('strategies.templates.grid.params.baseAsset'),
        type: 'select',
        value: 'ETH',
        options: [
          { label: 'ETH', value: 'ETH' },
          { label: 'BTC', value: 'BTC' },
          { label: 'BNB', value: 'BNB' },
          { label: 'SOL', value: 'SOL' }
        ],
        hint: t('strategies.templates.grid.params.baseAssetHint'),
        required: true
      },
      {
        key: 'quote_asset',
        label: t('strategies.templates.grid.params.quoteAsset'),
        type: 'select',
        value: 'USDT',
        options: [
          { label: 'USDT', value: 'USDT' },
          { label: 'USDC', value: 'USDC' },
          { label: 'BUSD', value: 'BUSD' }
        ],
        hint: t('strategies.templates.grid.params.quoteAssetHint'),
        required: true
      }
    ],
    codeTemplate: `def grid_trading():
    grid_size = {grid_size}  # 网格大小（小数形式，如0.005表示0.5%）
    grid_count = {grid_count}  # 网格数量
    base_price = get_current_price()
    
    for i in range(grid_count):
        buy_price = base_price * (1 - grid_size * i)
        sell_price = base_price * (1 + grid_size * i)
        place_order(buy_price, 'buy')
        place_order(sell_price, 'sell')`
  },
  {
    id: 'mean_reversion',
    name: t('strategies.templates.meanReversion.name'),
    description: t('strategies.templates.meanReversion.description'),
    scenario: t('strategies.templates.meanReversion.scenario'),
    tags: [
      t('strategies.templates.meanReversion.tags.mediumRisk'),
      t('strategies.templates.meanReversion.tags.trendCapture'),
      t('strategies.templates.meanReversion.tags.technicalAnalysis')
    ],
    params: [
      {
        key: 'ma_short',
        label: t('strategies.templates.meanReversion.params.maShort'),
        type: 'slider',
        value: 20,
        min: 5,
        max: 50,
        step: 5,
        unit: t('strategies.templates.meanReversion.params.dayUnit'),
        hint: t('strategies.templates.meanReversion.params.maShortHint'),
        required: true
      },
      {
        key: 'ma_long',
        label: t('strategies.templates.meanReversion.params.maLong'),
        type: 'slider',
        value: 50,
        min: 20,
        max: 200,
        step: 10,
        unit: t('strategies.templates.meanReversion.params.dayUnit'),
        hint: t('strategies.templates.meanReversion.params.maLongHint'),
        required: true
      },
      {
        key: 'deviation',
        label: t('strategies.templates.meanReversion.params.deviation'),
        type: 'slider',
        value: 2,
        min: 0.5,
        max: 5,
        step: 0.5,
        unit: '%',
        hint: t('strategies.templates.meanReversion.params.deviationHint'),
        required: true
      },
      {
        key: 'position_size',
        label: t('strategies.templates.meanReversion.params.positionSize'),
        type: 'slider',
        value: 10,
        min: 5,
        max: 50,
        step: 5,
        unit: '%',
        hint: t('strategies.templates.meanReversion.params.positionSizeHint'),
        required: true
      }
    ],
    codeTemplate: `def mean_reversion():
    price = get_current_price()
    ma_20 = calculate_ma({ma_short})
    ma_50 = calculate_ma({ma_long})
    
    deviation = {deviation}  # 偏离阈值（小数形式）
    
    if price < ma_20 * (1 - deviation):
        place_buy_order(amount={position_size}%)
    elif price > ma_20 * (1 + deviation):
        place_sell_order(amount={position_size}%)`
  },
  {
    id: 'trend_following',
    name: t('strategies.templates.trendFollowing.name'),
    description: t('strategies.templates.trendFollowing.description'),
    scenario: t('strategies.templates.trendFollowing.scenario'),
    tags: [
      t('strategies.templates.trendFollowing.tags.mediumHighRisk'),
      t('strategies.templates.trendFollowing.tags.trendFollowing'),
      t('strategies.templates.trendFollowing.tags.technicalIndicators')
    ],
    params: [
      {
        key: 'rsi_period',
        label: t('strategies.templates.trendFollowing.params.rsiPeriod'),
        type: 'slider',
        value: 14,
        min: 7,
        max: 30,
        step: 1,
        unit: t('strategies.templates.trendFollowing.params.dayUnit'),
        hint: t('strategies.templates.trendFollowing.params.rsiPeriodHint'),
        required: true
      },
      {
        key: 'rsi_oversold',
        label: t('strategies.templates.trendFollowing.params.rsiOversold'),
        type: 'slider',
        value: 30,
        min: 20,
        max: 40,
        step: 5,
        unit: '',
        hint: t('strategies.templates.trendFollowing.params.rsiOversoldHint'),
        required: true
      },
      {
        key: 'rsi_overbought',
        label: t('strategies.templates.trendFollowing.params.rsiOverbought'),
        type: 'slider',
        value: 70,
        min: 60,
        max: 80,
        step: 5,
        unit: '',
        hint: t('strategies.templates.trendFollowing.params.rsiOverboughtHint'),
        required: true
      },
      {
        key: 'macd_fast',
        label: t('strategies.templates.trendFollowing.params.macdFast'),
        type: 'slider',
        value: 12,
        min: 5,
        max: 20,
        step: 1,
        unit: t('strategies.templates.trendFollowing.params.dayUnit'),
        hint: t('strategies.templates.trendFollowing.params.macdFastHint'),
        required: true
      },
      {
        key: 'macd_slow',
        label: t('strategies.templates.trendFollowing.params.macdSlow'),
        type: 'slider',
        value: 26,
        min: 20,
        max: 50,
        step: 2,
        unit: t('strategies.templates.trendFollowing.params.dayUnit'),
        hint: t('strategies.templates.trendFollowing.params.macdSlowHint'),
        required: true
      }
    ],
    codeTemplate: `def trend_following():
    rsi = calculate_rsi({rsi_period})
    macd = calculate_macd({macd_fast}, {macd_slow})
    
    if rsi > {rsi_overbought} and macd > 0:
        place_sell_order()
    elif rsi < {rsi_oversold} and macd < 0:
        place_buy_order()`
  },
  {
    id: 'arbitrage',
    name: t('strategies.templates.arbitrage.name'),
    description: t('strategies.templates.arbitrage.description'),
    scenario: t('strategies.templates.arbitrage.scenario'),
    tags: [
      t('strategies.templates.arbitrage.tags.lowRisk'),
      t('strategies.templates.arbitrage.tags.arbitrage'),
      t('strategies.templates.arbitrage.tags.multiExchange')
    ],
    params: [
      {
        key: 'min_spread',
        label: t('strategies.templates.arbitrage.params.minSpread'),
        type: 'slider',
        value: 0.5,
        min: 0.1,
        max: 2,
        step: 0.1,
        unit: '%',
        hint: t('strategies.templates.arbitrage.params.minSpreadHint'),
        required: true
      },
      {
        key: 'exchange_a',
        label: t('strategies.templates.arbitrage.params.exchangeA'),
        type: 'select',
        value: 'Binance',
        options: [
          { label: 'Binance', value: 'Binance' },
          { label: 'OKX', value: 'OKX' },
          { label: 'Coinbase', value: 'Coinbase' },
          { label: 'Kraken', value: 'Kraken' }
        ],
        hint: t('strategies.templates.arbitrage.params.exchangeAHint'),
        required: true
      },
      {
        key: 'exchange_b',
        label: t('strategies.templates.arbitrage.params.exchangeB'),
        type: 'select',
        value: 'OKX',
        options: [
          { label: 'Binance', value: 'Binance' },
          { label: 'OKX', value: 'OKX' },
          { label: 'Coinbase', value: 'Coinbase' },
          { label: 'Kraken', value: 'Kraken' }
        ],
        hint: t('strategies.templates.arbitrage.params.exchangeBHint'),
        required: true
      },
      {
        key: 'max_position',
        label: t('strategies.templates.arbitrage.params.maxPosition'),
        type: 'number',
        value: 1000,
        min: 100,
        max: 10000,
        step: 100,
        unit: ' USDT',
        hint: t('strategies.templates.arbitrage.params.maxPositionHint'),
        required: true
      }
    ],
    codeTemplate: `def arbitrage():
    price_a = get_price('{exchange_a}')
    price_b = get_price('{exchange_b}')
    spread = abs(price_a - price_b) / price_a
    min_spread = {min_spread}  # 最小价差（小数形式）
    
    if spread > min_spread:
        if price_a < price_b:
            buy_low_exchange('{exchange_a}', price_a)
            sell_high_exchange('{exchange_b}', price_b)
        else:
            buy_low_exchange('{exchange_b}', price_b)
            sell_high_exchange('{exchange_a}', price_a)`
  }
])

const canGoNext = computed(() => {
  if (currentStep.value === 1) {
    return selectedTemplate.value !== null && newStrategy.value.name.trim() !== ''
  }
  if (currentStep.value === 2) {
    return selectedTemplate.value?.params?.every(p => !p.required || p.value !== undefined) ?? false
  }
  return true
})

const canCreate = computed(() => {
  return newStrategy.value.name.trim() !== '' && newStrategy.value.code.trim() !== ''
})

const openCreateModal = () => {
  showCreateModal.value = true
  currentStep.value = 1
  showAdvanced.value = false
  // 禁用主页面滚动
  document.body.style.overflow = 'hidden'
  // 重置表单
  resetForm()
}

const closeCreateModal = () => {
  showCreateModal.value = false
  currentStep.value = 1
  selectedTemplate.value = null
  // 恢复主页面滚动
  document.body.style.overflow = ''
}

const resetForm = () => {
  newStrategy.value = {
    name: '',
    file: '',
    description: '',
    code: '',
    params: []
  }
  selectedTemplate.value = null
}

const nextStep = () => {
  if (currentStep.value === 1 && selectedTemplate.value) {
    // 生成代码
    generateCode()
  }
  if (currentStep.value < 3 && canGoNext.value) {
    currentStep.value++
  }
}

const prevStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

const selectTemplate = (template) => {
  selectedTemplate.value = JSON.parse(JSON.stringify(template)) // 深拷贝
  // 重置参数值
  selectedTemplate.value.params.forEach(param => {
    param.value = param.value || param.min || ''
  })
}

const updateParamValue = (key, value) => {
  // 参数值更新时重新生成代码
  if (currentStep.value === 2) {
    generateCode()
  }
}

const generateCode = () => {
  if (!selectedTemplate.value) return
  
  let code = selectedTemplate.value.codeTemplate
  
  // 替换模板中的参数占位符
  selectedTemplate.value.params.forEach(param => {
    const placeholder = `{${param.key}}`
    let value = param.value
    
    // 处理百分比值
    if (param.unit === '%' && typeof value === 'number') {
      value = value / 100
    }
    
    // 转义特殊字符用于正则表达式
    const escapedPlaceholder = placeholder.replace(/[{}]/g, '\\$&')
    code = code.replace(new RegExp(escapedPlaceholder, 'g'), value)
  })
  
  newStrategy.value.code = code
  
  // 生成参数对象
  const paramsObj = {}
  selectedTemplate.value.params.forEach(param => {
    if (param.value !== undefined && param.value !== '') {
      let displayValue = param.value
      if (param.unit && typeof param.value === 'number') {
        displayValue = param.value + param.unit
      }
      paramsObj[param.key] = displayValue
    }
  })
  
  // 转换为数组格式
  newStrategy.value.params = Object.keys(paramsObj).map(key => ({
    key,
    value: String(paramsObj[key])
  }))
  
  // 生成文件名
  if (!newStrategy.value.file) {
    const timestamp = Date.now()
    const nameSlug = newStrategy.value.name.toLowerCase().replace(/\s+/g, '_') || 'strategy'
    newStrategy.value.file = `${nameSlug}_${timestamp}.py`
  }
}

const resetCodeTemplate = () => {
  generateCode()
}

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
  if (!canCreate.value) {
    return
  }
  
  // 确保代码已生成
  if (!newStrategy.value.code) {
    generateCode()
  }
  
  // 生成文件名（如果未指定）
  if (!newStrategy.value.file.trim()) {
    const timestamp = Date.now()
    newStrategy.value.file = `${newStrategy.value.name.toLowerCase().replace(/\s+/g, '_')}_${timestamp}.py`
  } else if (!newStrategy.value.file.endsWith('.py')) {
    newStrategy.value.file += '.py'
  }
  
  // 构建参数对象
  const paramsObj = {}
  newStrategy.value.params.forEach(param => {
    if (param.key.trim() && param.value.trim()) {
      paramsObj[param.key.trim()] = param.value.trim()
    }
  })
  
  // 这里可以添加实际的创建策略逻辑
  console.log('创建策略:', {
    name: newStrategy.value.name,
    file: newStrategy.value.file,
    description: newStrategy.value.description,
    code: newStrategy.value.code,
    params: paramsObj,
    template: selectedTemplate.value?.id
  })
  
  // 关闭弹窗
  closeCreateModal()
  
  // 可以在这里添加成功提示
  alert('策略创建成功！')
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

// ESC键关闭弹窗
const handleEscape = (e) => {
  if (e.key === 'Escape') {
    if (showCreateModal.value) {
      closeCreateModal()
    } else if (showBacktestModal.value) {
      closeBacktestModal()
    } else if (showCodeModal.value) {
      closeCodeModal()
    }
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleEscape)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleEscape)
  // 确保页面滚动恢复
  document.body.style.overflow = ''
  // 清理图表实例
  if (equityChartInstance) {
    equityChartInstance.dispose()
    equityChartInstance = null
  }
  if (monthlyChartInstance) {
    monthlyChartInstance.dispose()
    monthlyChartInstance = null
  }
})

// 回测相关
const backtestRunning = ref(false)
const backtestCompleted = ref(false)
const backtestConfig = ref({
  timeRange: '30d',
  startDate: '',
  endDate: '',
  initialCapital: 10000,
  tradingPair: 'ETH/USDT'
})

const backtestResults = ref({
  totalReturn: 0,
  totalProfit: 0,
  maxDrawdown: 0,
  sharpeRatio: 0,
  winRate: 0,
  totalTrades: 0,
  avgProfit: 0,
  profitLossRatio: 0,
  equityData: [],
  monthlyData: []
})

const equityChart = ref(null)
const monthlyChart = ref(null)
let equityChartInstance = null
let monthlyChartInstance = null

const canRunBacktest = computed(() => {
  if (backtestConfig.value.timeRange === 'custom') {
    return backtestConfig.value.startDate && backtestConfig.value.endDate && 
           backtestConfig.value.initialCapital >= 100
  }
  return backtestConfig.value.initialCapital >= 100
})

const openBacktestModal = (strategy) => {
  currentBacktestStrategy.value = strategy
  showBacktestModal.value = true
  backtestCompleted.value = false
  backtestRunning.value = false
  
  // 设置默认日期范围
  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - 30)
  
  // 重置配置
  backtestConfig.value = {
    timeRange: '30d',
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
    initialCapital: 10000,
    tradingPair: 'ETH/USDT'
  }
  // 禁用主页面滚动
  document.body.style.overflow = 'hidden'
}

const closeBacktestModal = () => {
  showBacktestModal.value = false
  backtestRunning.value = false
  // 清理图表实例
  if (equityChartInstance) {
    equityChartInstance.dispose()
    equityChartInstance = null
  }
  if (monthlyChartInstance) {
    monthlyChartInstance.dispose()
    monthlyChartInstance = null
  }
  // 恢复主页面滚动
  document.body.style.overflow = ''
}

const resetBacktest = () => {
  backtestCompleted.value = false
  backtestResults.value = {
    totalReturn: 0,
    totalProfit: 0,
    maxDrawdown: 0,
    sharpeRatio: 0,
    winRate: 0,
    totalTrades: 0,
    avgProfit: 0,
    profitLossRatio: 0,
    equityData: [],
    monthlyData: []
  }
  if (equityChartInstance) {
    equityChartInstance.dispose()
    equityChartInstance = null
  }
  if (monthlyChartInstance) {
    monthlyChartInstance.dispose()
    monthlyChartInstance = null
  }
}

const runBacktest = async () => {
  if (!canRunBacktest.value) return
  
  backtestRunning.value = true
  backtestCompleted.value = false

  // 模拟回测过程（实际应该调用后端API）
  await new Promise(resolve => setTimeout(resolve, 2000))

  // 生成模拟回测数据
  generateMockBacktestData()

  backtestRunning.value = false
  backtestCompleted.value = true

  // 初始化图表
  await nextTick()
  initBacktestCharts()
}

const generateMockBacktestData = () => {
  const initialCapital = backtestConfig.value.initialCapital
  
  // 计算回测日期范围
  let startDate, endDate
  if (backtestConfig.value.timeRange === 'custom') {
    startDate = new Date(backtestConfig.value.startDate)
    endDate = new Date(backtestConfig.value.endDate)
  } else {
    endDate = new Date()
    startDate = new Date()
    const days = backtestConfig.value.timeRange === '7d' ? 7 : 
                 backtestConfig.value.timeRange === '30d' ? 30 :
                 backtestConfig.value.timeRange === '90d' ? 90 : 365
    startDate.setDate(startDate.getDate() - days)
  }
  
  const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24))
  
  // 生成净值曲线数据
  const equityData = []
  let currentEquity = initialCapital
  const baseDate = new Date(startDate)

  for (let i = 0; i <= days; i++) {
    const date = new Date(baseDate)
    date.setDate(date.getDate() + i)
    // 模拟价格波动
    const change = (Math.random() - 0.45) * 0.02 // 略微偏向上涨
    currentEquity *= (1 + change)
    equityData.push([date.getTime(), currentEquity])
  }

  // 计算统计数据
  const finalEquity = currentEquity
  const totalReturn = ((finalEquity - initialCapital) / initialCapital) * 100
  const totalProfit = finalEquity - initialCapital

  // 计算最大回撤
  let maxEquity = initialCapital
  let maxDrawdown = 0
  equityData.forEach(([time, equity]) => {
    if (equity > maxEquity) {
      maxEquity = equity
    }
    const drawdown = ((maxEquity - equity) / maxEquity) * 100
    if (drawdown > maxDrawdown) {
      maxDrawdown = drawdown
    }
  })

  // 生成月度收益数据
  const monthlyData = []
  const months = Math.ceil(days / 30)
  for (let i = 0; i < months; i++) {
    const monthStart = i * 30
    const monthEnd = Math.min((i + 1) * 30, days)
    const startEquity = equityData[monthStart]?.[1] || initialCapital
    const endEquity = equityData[monthEnd]?.[1] || finalEquity
    const monthlyReturn = ((endEquity - startEquity) / startEquity) * 100
    monthlyData.push({
      month: `第${i + 1}月`,
      return: monthlyReturn
    })
  }

  // 模拟交易统计
  const totalTrades = Math.floor(days / 3) + Math.floor(Math.random() * 20)
  const winTrades = Math.floor(totalTrades * (0.5 + Math.random() * 0.2))
  const winRate = (winTrades / totalTrades) * 100
  const avgProfit = totalProfit / totalTrades
  const sharpeRatio = totalReturn > 0 ? (totalReturn / Math.max(maxDrawdown, 1)) * 0.8 : 0

  backtestResults.value = {
    totalReturn: totalReturn,
    totalProfit: totalProfit,
    maxDrawdown: maxDrawdown,
    sharpeRatio: sharpeRatio,
    winRate: winRate,
    totalTrades: totalTrades,
    avgProfit: avgProfit,
    profitLossRatio: winRate > 0 ? (winRate / (100 - winRate)) : 0,
    equityData: equityData,
    monthlyData: monthlyData
  }
}

const initBacktestCharts = () => {
  // 初始化净值曲线图
  if (equityChart.value && !equityChartInstance) {
    equityChartInstance = echarts.init(equityChart.value)
    
    const option = {
      backgroundColor: 'transparent',
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'time',
        boundaryGap: false,
        axisLine: {
          lineStyle: {
            color: 'rgba(48, 54, 61, 0.6)',
            width: 1
          }
        },
        axisLabel: {
          color: '#8b949e',
          fontSize: 11,
          fontFamily: 'var(--font-mono)'
        }
      },
      yAxis: {
        type: 'value',
        axisLine: {
          lineStyle: {
            color: 'rgba(48, 54, 61, 0.6)',
            width: 1
          }
        },
        axisLabel: {
          color: '#8b949e',
          fontSize: 11,
          fontFamily: 'var(--font-mono)',
          formatter: (value) => `$${value.toLocaleString()}`
        },
        splitLine: {
          lineStyle: {
            color: 'var(--border-color)',
            type: 'dashed'
          }
        }
      },
      series: [{
        name: '净值',
        type: 'line',
        smooth: true,
        data: backtestResults.value.equityData,
        lineStyle: {
          color: '#3fb950',
          width: 2.5,
          shadowBlur: 4,
          shadowColor: 'rgba(63, 185, 80, 0.3)'
        },
        itemStyle: {
          color: '#3fb950'
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(63, 185, 80, 0.25)' },
              { offset: 0.5, color: 'rgba(63, 185, 80, 0.1)' },
              { offset: 1, color: 'rgba(63, 185, 80, 0.02)' }
            ]
          }
        },
        symbol: 'none',
        emphasis: {
          focus: 'series',
          lineStyle: {
            width: 3
          }
        }
      }],
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(22, 27, 34, 0.95)',
        borderColor: 'rgba(99, 102, 241, 0.3)',
        borderWidth: 1,
        textStyle: {
          color: 'var(--text-primary)',
          fontFamily: 'var(--font-mono)',
          fontSize: 12
        },
        padding: [8, 12],
        formatter: (params) => {
          const date = new Date(params[0].value[0])
          const value = params[0].value[1]
          const change = value - backtestConfig.value.initialCapital
          const changePercent = ((change / backtestConfig.value.initialCapital) * 100).toFixed(2)
          return `
            <div style="font-weight: 600; margin-bottom: 4px;">${date.toLocaleDateString()}</div>
            <div>净值: <span style="color: #3fb950; font-weight: 600;">$${value.toLocaleString()}</span></div>
            <div style="font-size: 11px; color: #8b949e; margin-top: 4px;">
              ${change >= 0 ? '+' : ''}$${change.toLocaleString()} (${changePercent >= 0 ? '+' : ''}${changePercent}%)
            </div>
          `
        }
      }
    }

    equityChartInstance.setOption(option)

    window.addEventListener('resize', () => {
      if (equityChartInstance) {
        equityChartInstance.resize()
      }
    })
  }

  // 初始化月度收益图
  if (monthlyChart.value && !monthlyChartInstance) {
    monthlyChartInstance = echarts.init(monthlyChart.value)
    
    const option = {
      backgroundColor: 'transparent',
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: backtestResults.value.monthlyData.map(d => d.month),
        axisLine: {
          lineStyle: {
            color: 'rgba(48, 54, 61, 0.6)',
            width: 1
          }
        },
        axisLabel: {
          color: '#8b949e',
          fontSize: 11,
          fontFamily: 'var(--font-mono)'
        }
      },
      yAxis: {
        type: 'value',
        axisLine: {
          lineStyle: {
            color: 'rgba(48, 54, 61, 0.6)',
            width: 1
          }
        },
        axisLabel: {
          color: '#8b949e',
          fontSize: 11,
          fontFamily: 'var(--font-mono)',
          formatter: (value) => `${value.toFixed(1)}%`
        },
        splitLine: {
          lineStyle: {
            color: 'rgba(48, 54, 61, 0.5)',
            type: 'dashed',
            width: 1
          }
        }
      },
      series: [{
        name: '月度收益',
        type: 'bar',
        data: backtestResults.value.monthlyData.map(d => ({
          value: d.return,
          itemStyle: {
            color: d.return >= 0 
              ? {
                  type: 'linear',
                  x: 0,
                  y: 0,
                  x2: 0,
                  y2: 1,
                  colorStops: [
                    { offset: 0, color: '#3fb950' },
                    { offset: 1, color: '#238636' }
                  ]
                }
              : {
                  type: 'linear',
                  x: 0,
                  y: 0,
                  x2: 0,
                  y2: 1,
                  colorStops: [
                    { offset: 0, color: '#ff6b4a' },
                    { offset: 1, color: '#da3633' }
                  ]
                },
            borderRadius: [4, 4, 0, 0],
            shadowBlur: 4,
            shadowColor: d.return >= 0 
              ? 'rgba(63, 185, 80, 0.3)' 
              : 'rgba(255, 107, 74, 0.3)'
          }
        })),
        barWidth: '60%',
        emphasis: {
          itemStyle: {
            shadowBlur: 8,
            shadowOffsetY: -2
          }
        }
      }],
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(22, 27, 34, 0.95)',
        borderColor: 'rgba(99, 102, 241, 0.3)',
        borderWidth: 1,
        textStyle: {
          color: 'var(--text-primary)',
          fontFamily: 'var(--font-mono)',
          fontSize: 12
        },
        padding: [8, 12],
        formatter: (params) => {
          const value = params[0].value
          const color = value >= 0 ? '#3fb950' : '#ff6b4a'
          return `
            <div style="font-weight: 600; margin-bottom: 4px;">${params[0].name}</div>
            <div>收益: <span style="color: ${color}; font-weight: 600;">${value >= 0 ? '+' : ''}${value.toFixed(2)}%</span></div>
          `
        }
      }
    }

    monthlyChartInstance.setOption(option)

    window.addEventListener('resize', () => {
      if (monthlyChartInstance) {
        monthlyChartInstance.resize()
      }
    })
  }
}

const exportBacktestReport = () => {
  // 导出回测报告（实际应该生成PDF或CSV）
  const report = {
    strategy: currentBacktestStrategy.value.name,
    config: backtestConfig.value,
    results: backtestResults.value,
    date: new Date().toISOString()
  }
  console.log('导出回测报告:', report)
  alert('回测报告已导出（控制台查看）')
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

/* 创建策略弹窗样式 */
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
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  overflow: hidden;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.create-modal-content {
  background: rgba(22, 27, 34, 0.95);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-lg);
  width: 90%;
  max-width: 900px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 
    0 20px 60px rgba(0, 0, 0, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-lg);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(0, 0, 0, 0.2);
}

.modal-title {
  font-family: var(--font-mono);
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
}

.btn-close {
  width: 32px;
  height: 32px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  line-height: 1;
  border-radius: var(--radius-md);
  transition: all 0.2s ease;
}

.btn-close:hover {
  background: var(--bg-hover);
  transform: rotate(90deg);
}

.create-modal-body {
  padding: var(--spacing-lg);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  flex: 1;
  min-height: 0;
}

.create-modal-body::-webkit-scrollbar {
  width: 8px;
}

.create-modal-body::-webkit-scrollbar-track {
  background: var(--bg-secondary);
  border-radius: 4px;
}

.create-modal-body::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 4px;
}

.create-modal-body::-webkit-scrollbar-thumb:hover {
  background: var(--border-hover);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm);
  padding: var(--spacing-lg);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(0, 0, 0, 0.2);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.form-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.form-required {
  color: var(--danger);
  font-size: 14px;
}

.form-hint {
  font-size: 11px;
  color: var(--text-muted);
  margin-top: -4px;
}

.input {
  width: 100%;
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-size: 13px;
  transition: all 0.2s ease;
}

.input:focus {
  outline: none;
  border-color: var(--tech-primary);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.input::placeholder {
  color: var(--text-muted);
}

textarea.input {
  resize: vertical;
  font-family: var(--font-mono);
  min-height: 80px;
  line-height: 1.6;
}

.code-editor-wrapper {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.code-editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-sm) var(--spacing-md);
  background: rgba(0, 0, 0, 0.3);
  border-bottom: 1px solid var(--border-color);
}

.code-file-name {
  font-size: 11px;
  color: var(--text-muted);
}

.btn-sm {
  padding: var(--spacing-xs) var(--spacing-sm);
  font-size: 11px;
  height: auto;
}

.btn-secondary {
  background: var(--bg-tertiary);
  border-color: var(--border-color);
}

.btn-secondary:hover {
  background: var(--bg-hover);
  border-color: var(--border-hover);
}

.code-textarea {
  width: 100%;
  padding: var(--spacing-md);
  background: var(--bg-primary);
  border: none;
  color: var(--text-primary);
  font-size: 13px;
  line-height: 1.6;
  min-height: 300px;
  resize: vertical;
  font-family: var(--font-mono);
  tab-size: 2;
}

.code-textarea:focus {
  outline: none;
}

.code-textarea::placeholder {
  color: var(--text-muted);
}

.params-section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.params-list-editor {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  background: var(--bg-tertiary);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
}

.param-row {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.param-key {
  flex: 1;
  min-width: 0;
}

.param-separator {
  color: var(--text-muted);
  font-family: var(--font-mono);
  font-size: 14px;
  flex-shrink: 0;
}

.param-value {
  flex: 1;
  min-width: 0;
}

.params-empty {
  padding: var(--spacing-md);
  text-align: center;
}

.text-muted {
  color: var(--text-muted);
  font-size: 12px;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn:disabled:hover {
  transform: none;
  box-shadow: none;
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

/* 向导步骤样式 */
.wizard-steps {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-lg);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(0, 0, 0, 0.2);
}

.step-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-xs);
  flex: 1;
  position: relative;
}

.step-item:not(:last-child)::after {
  content: '';
  position: absolute;
  top: 16px;
  left: 60%;
  right: -40%;
  height: 2px;
  background: var(--border-color);
  z-index: 0;
}

.step-item.completed::after {
  background: var(--tech-primary);
}

.step-number {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  background: var(--bg-tertiary);
  border: 2px solid var(--border-color);
  color: var(--text-muted);
  position: relative;
  z-index: 1;
  transition: all 0.3s ease;
}

.step-item.active .step-number {
  background: var(--tech-primary);
  border-color: var(--tech-primary);
  color: white;
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.2);
}

.step-item.completed .step-number {
  background: var(--success);
  border-color: var(--success);
  color: white;
}

.step-label {
  font-size: 12px;
  color: var(--text-muted);
  transition: color 0.3s ease;
}

.step-item.active .step-label {
  color: var(--text-primary);
  font-weight: 500;
}

/* 向导步骤内容 */
.wizard-step-content {
  animation: fadeInSlide 0.3s ease;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.step-header {
  margin-bottom: 0;
}

@keyframes fadeInSlide {
  from {
    opacity: 0;
    transform: translateX(10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.step-header {
  margin-bottom: var(--spacing-md);
}

.step-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--spacing-xs);
}

.step-description {
  font-size: 13px;
  color: var(--text-muted);
  line-height: 1.6;
}

/* 模板网格 */
.template-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
}

.template-card {
  background: var(--bg-tertiary);
  border: 2px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: var(--spacing-md);
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  min-width: 0;
  min-height: 200px;
  justify-content: flex-start;
}

.template-card:hover {
  border-color: var(--tech-primary);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(99, 102, 241, 0.2);
}

.template-card.selected {
  border-color: var(--tech-primary);
  background: rgba(99, 102, 241, 0.1);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
}

.template-icon {
  width: 28px;
  height: 28px;
  margin-bottom: var(--spacing-xs);
  color: var(--text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.template-icon svg {
  width: 100%;
  height: 100%;
}

.template-card:hover .template-icon {
  color: var(--tech-primary);
  transform: translateY(-2px);
}

.template-card.selected .template-icon {
  color: var(--tech-primary);
}

.template-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  line-height: 1.3;
}

.template-desc {
  font-size: 11px;
  color: var(--text-muted);
  line-height: 1.5;
  flex: 1;
  margin: 0;
  min-height: 48px;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.template-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 3px;
  margin-top: var(--spacing-xs);
}

.template-tag {
  font-size: 9px;
  padding: 2px 6px;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  color: var(--text-muted);
  white-space: nowrap;
}

.template-stats {
  margin-top: var(--spacing-xs);
  padding-top: var(--spacing-xs);
  border-top: 1px solid var(--border-color);
}

.stat-item {
  display: flex;
  justify-content: space-between;
  font-size: 10px;
}

.stat-label {
  color: var(--text-muted);
}

.stat-value {
  color: var(--text-primary);
  font-weight: 500;
}

/* 参数配置 */
.params-config {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-lg);
}

.param-config-item {
  display: flex;
  gap: var(--spacing-lg);
  padding: var(--spacing-lg);
  background: var(--bg-tertiary);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
}

.param-info {
  flex: 1;
  min-width: 200px;
}

.param-label {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: var(--spacing-xs);
}

.param-hint {
  font-size: 12px;
  color: var(--text-muted);
  margin: 0;
}

.param-control {
  flex: 1;
  min-width: 200px;
}

/* 滑块样式 */
.slider-wrapper {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.slider {
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: var(--bg-primary);
  outline: none;
  -webkit-appearance: none;
  appearance: none;
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--tech-primary);
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  transition: all 0.2s ease;
}

.slider::-webkit-slider-thumb:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 8px rgba(99, 102, 241, 0.4);
}

.slider::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--tech-primary);
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.slider-value {
  text-align: right;
  font-size: 14px;
  font-weight: 600;
  color: var(--tech-primary);
  font-family: var(--font-mono);
}

.number-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.number-input-wrapper .input {
  padding-right: 50px;
}

.input-unit {
  position: absolute;
  right: var(--spacing-md);
  font-size: 12px;
  color: var(--text-muted);
  pointer-events: none;
}

.select-wrapper select {
  cursor: pointer;
}

/* 预览区域 */
.preview-section {
  margin-top: var(--spacing-lg);
  padding-top: var(--spacing-lg);
  border-top: 1px solid var(--border-color);
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.preview-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.preview-card {
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: var(--spacing-lg);
}

.preview-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-md);
}

.preview-stat {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.preview-stat-label {
  font-size: 11px;
  color: var(--text-muted);
}

.preview-stat-value {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

/* 预览摘要 */
.preview-summary {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.summary-card {
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: var(--spacing-lg);
}

.summary-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--spacing-md);
  padding-bottom: var(--spacing-sm);
  border-bottom: 1px solid var(--border-color);
}

.summary-item {
  display: flex;
  justify-content: space-between;
  padding: var(--spacing-sm) 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.summary-item:last-child {
  border-bottom: none;
}

.summary-label {
  font-size: 13px;
  color: var(--text-muted);
}

.summary-value {
  font-size: 13px;
  color: var(--text-primary);
  font-weight: 500;
}

.params-summary {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.summary-param {
  display: flex;
  justify-content: space-between;
  padding: var(--spacing-xs) var(--spacing-sm);
  background: var(--bg-primary);
  border-radius: var(--radius-sm);
}

.summary-param-key {
  color: var(--text-muted);
  font-size: 12px;
}

.summary-param-value {
  color: var(--text-primary);
  font-size: 12px;
  font-weight: 500;
}

/* 高级选项 */
.advanced-section {
  margin-top: var(--spacing-lg);
  padding-top: var(--spacing-lg);
  border-top: 1px solid var(--border-color);
}

.advanced-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
  gap: var(--spacing-md);
}

.advanced-header > div {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.code-editor-container {
  margin-top: var(--spacing-md);
  animation: fadeIn 0.3s ease;
}

.advanced-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.advanced-hint {
  font-size: 12px;
  color: var(--text-muted);
}

/* 回测弹窗样式 */
.backtest-modal {
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
  animation: fadeIn 0.2s ease;
}

.backtest-modal-content {
  background: rgba(22, 27, 34, 0.95);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-lg);
  width: 90%;
  max-width: 1200px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 
    0 20px 60px rgba(0, 0, 0, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  animation: slideUp 0.3s ease;
}

.backtest-modal-body {
  padding: var(--spacing-lg);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  flex: 1;
  min-height: 0;
}

.backtest-config-section,
.backtest-results-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  padding-bottom: var(--spacing-sm);
  border-bottom: 1px solid var(--border-color);
}

.config-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-md);
}

.results-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-md);
}

.result-stat-card {
  background: linear-gradient(135deg, var(--bg-tertiary) 0%, rgba(22, 27, 34, 0.8) 100%);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: var(--spacing-md);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.result-stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--tech-primary), transparent);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.result-stat-card:hover {
  border-color: var(--tech-primary);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
}

.result-stat-card:hover::before {
  opacity: 1;
}

.result-stat-label {
  font-size: 12px;
  color: var(--text-muted);
}

.result-stat-value {
  font-size: 22px;
  font-weight: 600;
  font-family: var(--font-mono);
  color: var(--text-primary);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.result-stat-value.text-success {
  color: #3fb950;
  text-shadow: 0 0 8px rgba(63, 185, 80, 0.3);
}

.result-stat-value.text-danger {
  color: #ff6b4a;
  text-shadow: 0 0 8px rgba(255, 107, 74, 0.3);
}

.backtest-charts {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-lg);
}

.chart-container {
  background: linear-gradient(135deg, var(--bg-tertiary) 0%, rgba(22, 27, 34, 0.6) 100%);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: var(--spacing-md);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.chart-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(99, 102, 241, 0.3), transparent);
}

.chart-container:hover {
  border-color: rgba(99, 102, 241, 0.5);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.backtest-chart {
  width: 100%;
  height: 320px;
  min-height: 320px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: var(--radius-sm);
  padding: var(--spacing-sm);
}

.backtest-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xl);
  gap: var(--spacing-md);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--border-color);
  border-top-color: var(--tech-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-text {
  color: var(--text-muted);
  font-size: 14px;
  margin: 0;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .template-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .backtest-charts {
    grid-template-columns: 1fr;
  }
  
  .results-stats {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .template-grid {
    grid-template-columns: 1fr;
  }
  
  .param-config-item {
    flex-direction: column;
  }
  
  .wizard-steps {
    padding: var(--spacing-md);
  }
  
  .step-item:not(:last-child)::after {
    display: none;
  }
  
  .step-label {
    font-size: 10px;
  }
  
  .config-grid {
    grid-template-columns: 1fr;
  }
  
  .results-stats {
    grid-template-columns: 1fr;
  }
}
</style>
