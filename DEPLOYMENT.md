# GitHub Pages 部署指南

## 🚀 自动部署

本项目已配置GitHub Actions自动部署到GitHub Pages。

### 部署流程

1. **推送代码到main分支** - 自动触发构建和部署
2. **GitHub Actions构建** - 安装依赖、构建项目
3. **部署到GitHub Pages** - 自动发布到 `https://ei-ayw.github.io/GitVision/`

### 部署地址

- **生产环境**: https://ei-ayw.github.io/GitVision/
- **仓库地址**: https://github.com/Ei-Ayw/GitVision

## ⚙️ 配置要求

### 1. GitHub仓库设置

在GitHub仓库中需要配置以下设置：

#### GitHub Pages设置
1. 访问仓库的 **Settings** 页面
2. 找到 **Pages** 部分
3. 设置 **Source** 为 **GitHub Actions**

#### Secrets配置
在仓库的 **Settings > Secrets and variables > Actions** 中添加以下secrets：

```
GITHUB_CLIENT_ID=你的GitHub_OAuth_Client_ID
GITHUB_CLIENT_SECRET=你的GitHub_OAuth_Client_Secret
```

### 2. GitHub OAuth应用配置

由于部署到GitHub Pages，需要更新GitHub OAuth应用的回调URL：

1. 访问 [GitHub Developer Settings](https://github.com/settings/applications)
2. 找到你的GitVision应用
3. 更新 **Authorization callback URL** 为：
   ```
   https://ei-ayw.github.io/GitVision/api/auth/github/callback
   ```

### 3. 后端API配置

由于GitHub Pages只能托管静态文件，后端API需要单独部署。建议使用以下服务：

- **Vercel** - 免费，支持Node.js
- **Netlify Functions** - 免费，支持无服务器函数
- **Railway** - 免费额度，支持全栈应用
- **Heroku** - 有免费选项

## 🔧 本地构建测试

在推送之前，可以在本地测试构建：

```bash
# 安装依赖
npm install

# 构建项目
npm run build

# 预览构建结果
npm run preview
```

## 📝 部署日志

部署状态可以在以下位置查看：

1. **GitHub Actions**: https://github.com/Ei-Ayw/GitVision/actions
2. **部署状态**: 在仓库主页的"Environments"部分

## 🐛 常见问题

### 1. 构建失败
- 检查GitHub Actions日志
- 确保所有依赖都在package.json中
- 检查环境变量配置

### 2. 页面无法访问
- 确认GitHub Pages已启用
- 检查仓库设置中的Pages配置
- 等待几分钟让部署生效

### 3. OAuth认证失败
- 确认GitHub OAuth应用的回调URL已更新
- 检查Client ID和Client Secret是否正确
- 确认后端API可以正常访问

## 🔄 手动部署

如果需要手动触发部署：

1. 访问仓库的 **Actions** 页面
2. 选择 **Deploy to GitHub Pages** 工作流
3. 点击 **Run workflow** 按钮
4. 选择分支并点击 **Run workflow**

## 📊 性能优化

构建配置已包含以下优化：

- **代码分割** - 按模块分离vendor、antd、charts
- **资源压缩** - 自动压缩JS、CSS、图片
- **缓存优化** - 静态资源长期缓存
- **Tree Shaking** - 移除未使用的代码

## 🔒 安全注意事项

1. **不要提交敏感信息** - 使用GitHub Secrets存储
2. **定期更新依赖** - 保持安全性
3. **HTTPS强制** - GitHub Pages自动提供HTTPS
4. **CORS配置** - 确保API跨域配置正确
