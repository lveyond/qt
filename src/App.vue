<template>
  <div id="app">
    <nav class="navbar">
      <div class="navbar-brand">
        <span class="brand-icon">⚡</span>
        <span class="brand-text">QuantDApp</span>
        <span class="brand-badge">v1.0.0</span>
      </div>
      <div class="navbar-nav">
        <svg width="0" height="0" style="position: absolute;">
          <defs>
            <linearGradient id="gradient-active" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style="stop-color:#6366f1;stop-opacity:1" />
              <stop offset="50%" style="stop-color:#8b5cf6;stop-opacity:1" />
              <stop offset="100%" style="stop-color:#a855f7;stop-opacity:1" />
            </linearGradient>
          </defs>
        </svg>
        <router-link 
          v-for="item in navItems" 
          :key="item.path"
          :to="item.path"
          class="nav-link"
          :class="{ active: $route.path === item.path }"
        >
          <span class="nav-icon" v-html="item.icon"></span>
          <span class="nav-text">{{ item.name }}</span>
        </router-link>
      </div>
      <div class="navbar-actions">
        <div class="language-selector">
          <select v-model="currentLanguage" @change="changeLanguage" class="language-select">
            <option value="zh-CN">简体中文</option>
            <option value="zh-HK">繁體中文（港）</option>
            <option value="en">English</option>
          </select>
        </div>
        <div class="wallet-status">
          <span class="status-dot"></span>
          <span class="status-text">{{ translate('common.notConnected', currentLanguage) }}</span>
        </div>
        <button class="btn btn-primary">{{ translate('common.connectWallet', currentLanguage) }}</button>
      </div>
    </nav>
    
    <main class="main-content">
      <router-view />
    </main>
    
    <footer class="footer">
      <div class="footer-content">
        <span class="footer-text">GitHub: <a href="https://github.com/lveyond" target="_blank" rel="noopener noreferrer" class="footer-link">@lveyond</a></span>
        <span class="footer-separator">|</span>
        <span class="footer-text">Built with ❤️ for DeFi</span>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, provide } from 'vue'
import { getCurrentLanguage, setCurrentLanguage, t as translate } from './i18n'

const currentLanguage = ref(getCurrentLanguage())

const changeLanguage = (event) => {
  const lang = event.target.value
  setCurrentLanguage(lang)
  currentLanguage.value = lang
  // 触发全局更新
  window.dispatchEvent(new CustomEvent('language-changed', { detail: lang }))
}

// 提供语言和翻译函数给子组件
provide('language', currentLanguage)
provide('t', translate)

const navItems = computed(() => [
  { 
    path: '/', 
    name: translate('nav.dashboard', currentLanguage.value), 
    icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>`
  },
  { 
    path: '/trading', 
    name: translate('nav.trading', currentLanguage.value), 
    icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="2" x2="12" y2="22"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>`
  },
  { 
    path: '/strategies', 
    name: translate('nav.strategies', currentLanguage.value), 
    icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line><line x1="9" y1="9" x2="21" y2="9"></line><line x1="9" y1="15" x2="21" y2="15"></line></svg>`
  },
  { 
    path: '/assets', 
    name: translate('nav.assets', currentLanguage.value), 
    icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12c0 1.66-1.34 3-3 3H6c-1.66 0-3-1.34-3-3s1.34-3 3-3h12c1.66 0 3 1.34 3 3z"></path><path d="M6 8h12"></path><path d="M6 16h12"></path><circle cx="12" cy="12" r="1"></circle></svg>`
  },
  { 
    path: '/analytics', 
    name: translate('nav.analytics', currentLanguage.value), 
    icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 6 13.5 14.5 8.5 9.5 2 16"></polyline><polyline points="16 6 22 6 22 12"></polyline></svg>`
  }
])

// 监听语言变化，更新导航项
window.addEventListener('language-changed', () => {
  // 强制重新渲染
  currentLanguage.value = getCurrentLanguage()
})
</script>

<style scoped>
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
}

#app::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(ellipse at top left, rgba(99, 102, 241, 0.08) 0%, transparent 50%),
    radial-gradient(ellipse at bottom right, rgba(139, 92, 246, 0.06) 0%, transparent 50%),
    linear-gradient(135deg, #050810 0%, #0a0e1a 15%, #0d1117 30%, #0f1419 45%, #11151c 50%, #0f1419 55%, #0d1117 70%, #0a0e1a 85%, #050810 100%);
  background-size: 300% 300%, 300% 300%, 300% 300%;
  animation: gradientShift 20s ease infinite;
  z-index: -1;
  pointer-events: none;
}

@keyframes gradientShift {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-md) var(--spacing-xl);
  background: rgba(22, 27, 34, 0.8);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 1px 0 rgba(255, 255, 255, 0.05);
}

.navbar-brand {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-family: var(--font-mono);
  font-weight: 600;
  font-size: 16px;
}

.brand-icon {
  font-size: 20px;
}

.brand-text {
  color: var(--text-primary);
  font-family: 'PingFang SC', 'PingFang TC', 'Noto Sans SC', 'Microsoft YaHei UI', 'Microsoft YaHei', '微软雅黑', 'SimHei', '黑体', 'Microsoft JhengHei', '微軟正黑體', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif !important;
}

.brand-badge {
  padding: 2px 6px;
  font-size: 11px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
}

.navbar-nav {
  display: flex;
  gap: var(--spacing-sm);
}

.nav-link {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-md);
  font-size: 13px;
  color: var(--text-secondary);
  border-radius: var(--radius-md);
  transition: all 0.2s;
}

.nav-link .nav-text {
  font-family: 'PingFang SC', 'PingFang TC', 'Noto Sans SC', 'Microsoft YaHei UI', 'Microsoft YaHei', '微软雅黑', 'SimHei', '黑体', 'Microsoft JhengHei', '微軟正黑體', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif !important;
}

.nav-link:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
  text-decoration: none;
}

.nav-link.active {
  background: var(--bg-tertiary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.nav-link.active .nav-icon {
  color: #6366f1;
}

.nav-link.active .nav-icon svg {
  stroke: url(#gradient-active);
  filter: drop-shadow(0 0 3px rgba(99, 102, 241, 0.6));
}

.nav-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  color: currentColor;
  transition: all 0.3s;
}

.nav-icon svg {
  width: 100%;
  height: 100%;
  transition: all 0.3s;
}

.nav-link.active .nav-icon svg {
  stroke: url(#gradient-active);
  filter: drop-shadow(0 0 2px rgba(99, 102, 241, 0.5));
}

.navbar-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.language-selector {
  display: flex;
  align-items: center;
}

.language-select {
  padding: var(--spacing-xs) var(--spacing-sm);
  font-size: 12px;
  background: rgba(22, 27, 34, 0.6);
  backdrop-filter: blur(10px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-family: var(--font-mono);
  cursor: pointer;
  transition: all 0.2s;
}

.language-select:hover {
  border-color: rgba(255, 255, 255, 0.2);
  background: rgba(22, 27, 34, 0.8);
}

.language-select:focus {
  outline: none;
  border-color: var(--tech-primary);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.wallet-status {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: 12px;
  color: var(--text-secondary);
}

.wallet-status .status-text {
  font-family: 'PingFang SC', 'PingFang TC', 'Noto Sans SC', 'Microsoft YaHei UI', 'Microsoft YaHei', '微软雅黑', 'SimHei', '黑体', 'Microsoft JhengHei', '微軟正黑體', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif !important;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--danger);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.main-content {
  flex: 1;
  padding: var(--spacing-xl);
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
}

.footer {
  padding: var(--spacing-md) var(--spacing-xl);
  background: rgba(22, 27, 34, 0.6);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.footer-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-md);
  font-size: 11px;
  color: var(--text-muted);
}

.footer-content .footer-text {
  font-family: 'PingFang SC', 'PingFang TC', 'Noto Sans SC', 'Microsoft YaHei UI', 'Microsoft YaHei', '微软雅黑', 'SimHei', '黑体', 'Microsoft JhengHei', '微軟正黑體', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif !important;
}

.footer-content .mono {
  font-family: var(--font-mono) !important;
}

.footer-separator {
  color: var(--border-color);
}

.footer-link {
  color: var(--text-link);
  text-decoration: none;
  transition: color 0.2s, opacity 0.2s;
}

.footer-link:hover {
  color: #79c0ff;
  text-decoration: underline;
  opacity: 0.9;
}
</style>
