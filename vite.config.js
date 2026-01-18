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
    // 仓库名是 qt，所以 base 应该是 '/qt/'
    base: process.env.NODE_ENV === 'production' ? '/qt/' : '/',
    build: {
        outDir: 'dist',
        assetsDir: 'assets',
        sourcemap: false
    }
})