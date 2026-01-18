<template>
  <div class="orders-page">
    <div class="page-header">
      <h1 class="page-title">订单列表</h1>
      <div class="page-actions">
        <select v-model="filterStatus" class="input" style="width: 150px;">
          <option value="all">全部状态</option>
          <option value="pending">待成交</option>
          <option value="partial">部分成交</option>
          <option value="filled">已完成</option>
          <option value="cancelled">已取消</option>
        </select>
        <select v-model="filterPair" class="input" style="width: 150px;">
          <option value="all">全部交易对</option>
          <option value="ETH/USDT">ETH/USDT</option>
          <option value="BTC/USDT">BTC/USDT</option>
          <option value="SOL/USDT">SOL/USDT</option>
        </select>
        <button class="btn">导出</button>
      </div>
    </div>

    <div class="orders-content">
      <div class="table-container">
        <table class="table">
          <thead>
            <tr>
              <th>时间</th>
              <th>交易对</th>
              <th>类型</th>
              <th>方向</th>
              <th>价格</th>
              <th>数量</th>
              <th>已成交</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="order in filteredOrders" :key="order.id">
              <td class="mono">{{ order.time }}</td>
              <td>{{ order.pair }}</td>
              <td>
                <span class="badge">{{ order.type }}</span>
              </td>
              <td>
                <span :class="order.side === 'buy' ? 'text-success' : 'text-danger'">
                  {{ order.side === 'buy' ? '买入' : '卖出' }}
                </span>
              </td>
              <td class="mono">${{ order.price }}</td>
              <td class="mono">{{ order.amount }}</td>
              <td class="mono">{{ order.filled }}</td>
              <td>
                <span :class="getStatusClass(order.status)">{{ order.status }}</span>
              </td>
              <td>
                <button 
                  v-if="order.status === '待成交' || order.status === '部分成交'"
                  class="btn btn-cancel"
                  @click="cancelOrder(order.id)"
                >
                  取消
                </button>
                <span v-else class="text-muted mono">-</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="pagination">
        <button class="btn" :disabled="currentPage === 1" @click="currentPage--">上一页</button>
        <span class="pagination-info mono">
          第 {{ currentPage }} / {{ totalPages }} 页
        </span>
        <button class="btn" :disabled="currentPage === totalPages" @click="currentPage++">下一页</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const filterStatus = ref('all')
const filterPair = ref('all')
const currentPage = ref(1)
const pageSize = 20

const orders = ref([
  { id: 1, time: '2024-01-15 14:32:15', pair: 'ETH/USDT', type: '限价', side: 'buy', price: '2750.00', amount: '1.0', filled: '0.0', status: '待成交' },
  { id: 2, time: '2024-01-15 14:28:42', pair: 'ETH/USDT', type: '限价', side: 'sell', price: '2760.00', amount: '0.5', filled: '0.2', status: '部分成交' },
  { id: 3, time: '2024-01-15 14:25:18', pair: 'BTC/USDT', type: '限价', side: 'buy', price: '42850.00', amount: '0.1', filled: '0.1', status: '已完成' },
  { id: 4, time: '2024-01-15 14:20:05', pair: 'SOL/USDT', type: '市价', side: 'buy', price: '98.45', amount: '50', filled: '50', status: '已完成' },
  { id: 5, time: '2024-01-15 14:15:33', pair: 'ETH/USDT', type: '限价', side: 'sell', price: '2755.00', amount: '2.0', filled: '0.0', status: '已取消' },
  { id: 6, time: '2024-01-15 14:10:22', pair: 'BTC/USDT', type: '限价', side: 'buy', price: '42800.00', amount: '0.05', filled: '0.05', status: '已完成' },
  { id: 7, time: '2024-01-15 14:05:11', pair: 'ETH/USDT', type: '限价', side: 'sell', price: '2765.00', amount: '1.5', filled: '0.0', status: '待成交' },
  { id: 8, time: '2024-01-15 14:00:05', pair: 'SOL/USDT', type: '市价', side: 'sell', price: '98.20', amount: '30', filled: '30', status: '已完成' }
])

const filteredOrders = computed(() => {
  let result = orders.value

  if (filterStatus.value !== 'all') {
    const statusMap = {
      pending: '待成交',
      partial: '部分成交',
      filled: '已完成',
      cancelled: '已取消'
    }
    result = result.filter(order => order.status === statusMap[filterStatus.value])
  }

  if (filterPair.value !== 'all') {
    result = result.filter(order => order.pair === filterPair.value)
  }

  const start = (currentPage.value - 1) * pageSize
  const end = start + pageSize
  return result.slice(start, end)
})

const totalPages = computed(() => {
  let count = orders.value.length
  if (filterStatus.value !== 'all') {
    const statusMap = {
      pending: '待成交',
      partial: '部分成交',
      filled: '已完成',
      cancelled: '已取消'
    }
    count = orders.value.filter(order => order.status === statusMap[filterStatus.value]).length
  }
  if (filterPair.value !== 'all') {
    count = orders.value.filter(order => order.pair === filterPair.value).length
  }
  return Math.ceil(count / pageSize)
})

const getStatusClass = (status) => {
  const classes = {
    '待成交': 'badge badge-warning',
    '部分成交': 'badge badge-warning',
    '已完成': 'badge badge-success',
    '已取消': 'badge'
  }
  return classes[status] || 'badge'
}

const cancelOrder = (orderId) => {
  const order = orders.value.find(o => o.id === orderId)
  if (order) {
    order.status = '已取消'
  }
}
</script>

<style scoped>
.orders-page {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.orders-content {
  background: rgba(22, 27, 34, 0.6);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
}

.table-container {
  overflow-x: auto;
  margin-bottom: var(--spacing-lg);
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-md);
  padding-top: var(--spacing-md);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.pagination-info {
  font-size: 12px;
  color: var(--text-muted);
}

.btn-cancel {
  width: auto;
  padding: var(--spacing-xs) var(--spacing-sm);
  font-size: 11px;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: var(--text-secondary);
}

.btn-cancel:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.25);
  color: var(--text-primary);
  transform: none;
}
</style>
