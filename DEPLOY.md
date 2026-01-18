# GitHub Pages 部署指南

## 方法一：使用 GitHub Actions 自动部署（推荐）

### 1. 准备工作

1. **创建 GitHub 仓库**
   - 在 GitHub 上创建一个新仓库（例如：`quant-trading-dapp`）
   - 不要初始化 README、.gitignore 或 license

2. **推送代码到 GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/你的用户名/quant-trading-dapp.git
   git push -u origin main
   ```

### 2. 启用 GitHub Pages

1. 进入仓库的 **Settings** 页面
2. 在左侧菜单中找到 **Pages**
3. 在 **Source** 部分，选择 **GitHub Actions**
4. 保存设置

### 3. 触发部署

- 每次推送到 `main` 分支时，GitHub Actions 会自动构建并部署
- 你也可以在 **Actions** 标签页手动触发部署

### 4. 访问网站

部署完成后，你的网站地址将是：
```
https://你的用户名.github.io/quant-trading-dapp/
```

## 方法二：手动部署

### 1. 构建项目

```bash
npm install
npm run build
```

### 2. 部署到 GitHub Pages

#### 选项 A：使用 gh-pages 分支

1. 安装 gh-pages：
   ```bash
   npm install --save-dev gh-pages
   ```

2. 在 `package.json` 中添加部署脚本：
   ```json
   {
     "scripts": {
       "deploy": "gh-pages -d dist"
     }
   }
   ```

3. 运行部署：
   ```bash
   npm run deploy
   ```

#### 选项 B：手动推送 dist 文件夹

1. 构建项目后，将 `dist` 文件夹的内容推送到 `gh-pages` 分支
2. 在仓库 Settings > Pages 中选择 `gh-pages` 分支作为源

## 注意事项

1. **Base 路径配置**
   - 如果部署到子路径（如 `/quant-trading-dapp/`），需要修改 `vite.config.js` 中的 `base` 配置
   - 如果部署到根域名，保持 `base: '/'`

2. **路由模式**
   - 当前使用的是 `createWebHistory`，这在 GitHub Pages 上需要特殊配置
   - 如果遇到 404 错误，可以考虑：
     - 使用 `createWebHashHistory`（URL 会包含 `#`）
     - 或者配置 404.html 重定向

3. **环境变量**
   - 确保所有必要的环境变量都已配置
   - GitHub Pages 不支持 `.env` 文件，需要在构建时设置

## 故障排除

### 问题：页面显示空白
- 检查浏览器控制台的错误信息
- 确认 `base` 路径配置正确
- 检查资源路径是否正确

### 问题：路由 404 错误
- 考虑使用 Hash 路由模式
- 或者配置 404.html 重定向到 index.html

### 问题：构建失败
- 检查 Node.js 版本（推荐 18+）
- 确保所有依赖都已正确安装
- 查看 GitHub Actions 日志获取详细错误信息

## 更新部署

每次更新代码后：
1. 提交并推送到 `main` 分支
2. GitHub Actions 会自动重新构建和部署
3. 等待几分钟后刷新网站即可看到更新
