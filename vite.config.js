import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [vue()],
    server: {
        port: 3000,
        open: true
    },
    // GitHub Pages 部署配置
    // 如果你的仓库名是 quant-trading-dapp，则 base 应该是 '/quant-trading-dapp/'
    // 如果部署到根域名，则 base 应该是 '/'
    base: process.env.NODE_ENV === 'production' ? '/' : '/',
    build: {
        outDir: 'dist',
        assetsDir: 'assets',
        sourcemap: false
    }
})