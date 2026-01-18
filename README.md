# QuantDApp - 量化交易去中心化应用前端

一个具有区块链社区风格和 Git 风格的量化交易 DApp 前端界面，采用现代化的设计理念和交互体验。

## ✨ 特性

- 🎨 **现代化设计**：深色渐变背景、磨砂玻璃效果、科技感配色
- 📊 **数据可视化**：基于 ECharts 的 K 线图、资产分布图、性能分析图表
- 🌍 **多语言支持**：简体中文、繁体中文（香港）、英语
- 📱 **响应式布局**：适配不同屏幕尺寸
- ⚡ **高性能**：基于 Vue 3 Composition API 和 Vite 构建
- 🎯 **完整功能**：交易、策略管理、资产管理、数据分析

## 🚀 快速开始

### 环境要求

- Node.js >= 16.0.0
- npm >= 7.0.0 或 yarn >= 1.22.0

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

项目将在 `http://localhost:3000` 启动

### 构建生产版本

```bash
npm run build
```

构建产物将输出到 `dist` 目录

### 预览生产构建

```bash
npm run preview
```

## 📁 项目结构

```
quant-trading-dapp/
├── src/
│   ├── App.vue              # 根组件
│   ├── main.js              # 应用入口
│   ├── router/              # 路由配置
│   │   └── index.js
│   ├── views/               # 页面组件
│   │   ├── Dashboard.vue    # 仪表盘
│   │   ├── Trading.vue      # 交易页面
│   │   ├── Strategies.vue   # 策略管理
│   │   ├── Assets.vue        # 资产管理
│   │   ├── Analytics.vue     # 数据分析
│   │   └── Orders.vue        # 订单列表
│   ├── styles/              # 全局样式
│   │   └── main.css
│   └── i18n/                # 国际化配置
│       └── index.js
├── index.html               # HTML 模板
├── vite.config.js           # Vite 配置
└── package.json             # 项目配置
```

## 🎯 功能模块

### 📊 Dashboard（仪表盘）

- 总资产概览
- 24 小时收益统计
- 活跃策略数量
- 资产分布图表
- 最近交易记录
- 策略表现列表
- 系统日志

### 💹 Trading（交易）

- **K 线图表**：支持 15M、1H、4H、1D、1W 多个时间周期
- **订单簿**：实时显示买卖盘深度，支持点击价格快速下单
- **订单面板**：限价单和市价单下单功能
- **持仓管理**：查看当前持仓和未实现盈亏
- **当前订单**：管理活跃订单

### 🤖 Strategies（策略管理）

- 策略列表展示
- 策略代码预览和完整代码查看
- 策略参数配置
- 策略性能指标（总收益、交易次数、胜率、Sharpe 比率）
- 策略启动/停止控制
- 策略编辑、回测、删除功能

### 💰 Assets（资产管理）

- 资产总览（总价值、可用余额、冻结资产）
- 资产列表（支持搜索和筛选）
- 资产分布图表（饼图/柱状图）
- 交易历史记录
- 资产详情查看

### 📈 Analytics（数据分析）

- 性能指标卡片（累计收益率、Sharpe 比率、最大回撤、胜率）
- 资产曲线图表
- 收益分布图表
- 月度收益统计
- 策略表现对比
- 交易时段分析
- 风险指标（波动率、VaR、Beta 系数、相关性）
- 交易统计数据

### 📋 Orders（订单列表）

- 订单列表展示
- 订单筛选和搜索
- 订单状态管理
- 订单取消功能

## 🎨 设计特色

### 视觉风格

- **深色渐变背景**：多层次的深色渐变，营造科技感
- **磨砂玻璃效果**：卡片和面板采用半透明背景和模糊效果
- **科技感配色**：紫色渐变按钮、橙红色危险提示、绿色成功状态
- **线型图标**：SVG 线型图标，选中时显示渐变效果

### 字体

- **中文**：PingFang SC（苹方简体）优先，Noto Sans SC 作为备选
- **英文**：系统默认字体栈
- **代码**：JetBrains Mono

### 交互体验

- 流畅的动画过渡
- 悬停状态反馈
- 点击价格快速填充订单
- 响应式布局适配

## 🌍 国际化

项目支持三种语言：

- 🇨🇳 简体中文（zh-CN）
- 🇭🇰 繁体中文（香港）（zh-HK）
- 🇺🇸 English（en）

语言切换通过顶部导航栏的语言选择器进行，所有页面文本都会实时更新。

## 🛠️ 技术栈

- **框架**：Vue 3 (Composition API)
- **路由**：Vue Router 4
- **状态管理**：Pinia
- **图表库**：ECharts 5
- **构建工具**：Vite 5
- **样式**：原生 CSS（CSS Variables）

## 📦 依赖

### 核心依赖

- `vue`: ^3.4.0
- `vue-router`: ^4.2.5
- `pinia`: ^2.1.7
- `echarts`: ^5.4.3
- `vue-echarts`: ^6.6.1

### 开发依赖

- `@vitejs/plugin-vue`: ^5.0.0
- `vite`: ^5.0.0

## 🔧 配置说明

### Vite 配置

开发服务器默认运行在 `http://localhost:3000`，可在 `vite.config.js` 中修改。

### 路由配置

所有路由定义在 `src/router/index.js` 中，支持以下路由：

- `/` - 仪表盘
- `/trading` - 交易页面
- `/strategies` - 策略管理
- `/assets` - 资产管理
- `/analytics` - 数据分析
- `/orders` - 订单列表

### 样式变量

全局样式变量定义在 `src/styles/main.css` 中，包括：

- 颜色变量（主色、文本色、背景色等）
- 间距变量
- 字体变量
- 圆角变量

## 🚧 开发计划

- [ ] 后端 API 集成
- [ ] WebSocket 实时数据推送
- [ ] 钱包连接功能（MetaMask、WalletConnect）
- [ ] 更多图表类型
- [ ] 策略回测功能
- [ ] 移动端适配优化
- [ ] 单元测试和 E2E 测试

## 📝 开发规范

### 代码风格

- 使用 Vue 3 Composition API
- 组件使用 `<script setup>` 语法
- 样式使用 Scoped CSS
- 遵循 Vue 官方风格指南

### 命名规范

- 组件：PascalCase（如 `Dashboard.vue`）
- 变量/函数：camelCase（如 `selectedPair`）
- 常量：UPPER_SNAKE_CASE（如 `MAX_ORDERS`）
- CSS 类：kebab-case（如 `.order-book`）

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 👨‍💻 作者

github:@lveyond  Built with ❤️ for DeFi

---

**注意**：本项目目前仅包含前端界面，后端功能需要自行实现或集成。
