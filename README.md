# GitVision

GitHub仓库智能分析平台 - 为开发者提供自动化仓库分析和智能报告生成服务。

## 🚀 功能特性

- **GitHub OAuth认证** - 安全便捷的GitHub账号登录
- **仓库管理** - 支持单仓库添加和批量导入
- **智能分析** - 自动分析仓库代码结构、语言分布、贡献统计
- **报告生成** - 多种场景化报告模板（面试、团队汇报、开源展示等）
- **多格式输出** - 支持Markdown、PDF、HTML格式导出
- **分享功能** - 私密链接分享、嵌入式代码分享

## 🛠️ 技术栈

### 前端
- **Vue 3** - 渐进式JavaScript框架
- **TypeScript** - 类型安全的JavaScript
- **Ant Design Vue** - 企业级UI组件库
- **Pinia** - Vue状态管理
- **Vue Router** - 官方路由管理器
- **Vite** - 快速的前端构建工具
- **ECharts** - 数据可视化图表库

### 后端
- **Node.js** - JavaScript运行时
- **Express** - Web应用框架
- **JWT** - JSON Web Token认证
- **Axios** - HTTP客户端

## 🌐 在线体验

**GitHub Pages部署**: https://ei-ayw.github.io/GitVision/

> ⚠️ 注意：由于GitHub Pages只能托管静态文件，在线版本需要单独部署后端API服务。

## 📦 安装和运行

### 环境要求
- Node.js >= 16.0.0
- npm >= 8.0.0

### 1. 克隆项目
```bash
git clone git@github.com:Ei-Ayw/GitVision.git
cd GitVision
```

### 2. 安装依赖
```bash
npm install
```

### 3. 配置环境变量
复制 `env.example` 文件为 `.env` 并配置：

```bash
cp env.example .env
```

编辑 `.env` 文件，填入你的GitHub OAuth应用信息：

```env
# GitHub OAuth 配置
VITE_GITHUB_CLIENT_ID=your_github_client_id_here
VITE_GITHUB_CLIENT_SECRET=your_github_client_secret_here
VITE_GITHUB_REDIRECT_URI=http://localhost:3000/api/auth/github/callback

# API 配置
VITE_API_BASE_URL=http://localhost:3000/api

# 应用配置
VITE_APP_NAME=GitVision
VITE_APP_DESCRIPTION=GitHub仓库智能分析平台
```

### 4. 创建GitHub OAuth应用

1. 访问 [GitHub Developer Settings](https://github.com/settings/applications/new)
2. 填写应用信息：
   - **Application name**: GitVision
   - **Homepage URL**: `http://localhost:5173`
   - **Authorization callback URL**: `http://localhost:3000/api/auth/github/callback`
3. 获取 `Client ID` 和 `Client Secret`
4. 更新 `.env` 文件中的对应值

### 5. 启动开发服务器

**启动后端服务器**：
```bash
node server.js
```

**启动前端开发服务器**：
```bash
npm run dev
```

### 6. 访问应用
- 前端：http://localhost:5173
- 后端API：http://localhost:3000/api

## 🏗️ 项目结构

```
GitVision/
├── src/                    # 前端源代码
│   ├── components/         # Vue组件
│   │   └── Layout/        # 布局组件
│   ├── views/             # 页面组件
│   ├── stores/            # Pinia状态管理
│   ├── router/            # 路由配置
│   ├── utils/             # 工具函数
│   ├── styles/            # 样式文件
│   └── types/             # TypeScript类型定义
├── server.js              # 后端服务器
├── package.json           # 项目依赖
├── vite.config.ts         # Vite配置
├── .env.example           # 环境变量示例
└── README.md              # 项目文档
```

## 🔧 开发命令

```bash
# 安装依赖
npm install

# 启动前端开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview

# 代码检查
npm run lint
```

## 🚀 部署

### GitHub Pages自动部署

项目已配置GitHub Actions自动部署：

1. **推送代码到main分支** - 自动触发构建和部署
2. **访问部署地址** - https://ei-ayw.github.io/GitVision/

详细部署说明请查看 [DEPLOYMENT.md](./DEPLOYMENT.md)

### 手动部署

```bash
# 构建项目
npm run build

# 部署到任何静态文件托管服务
# 将 dist/ 目录上传到你的服务器
```

## 📝 使用说明

### 1. 登录
- 点击"通过GitHub账号授权登录"
- 在GitHub页面确认授权
- 自动跳转到仪表盘

### 2. 添加仓库
- 在仪表盘点击"添加仓库"
- 输入GitHub仓库URL
- 系统自动开始分析

### 3. 生成报告
- 在仓库详情页点击"生成报告"
- 选择报告模板
- 配置报告内容
- 导出或分享报告

## 🤝 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 📞 联系方式

- 项目链接：[https://github.com/Ei-Ayw/GitVision](https://github.com/Ei-Ayw/GitVision)
- 问题反馈：[Issues](https://github.com/Ei-Ayw/GitVision/issues)

## 🙏 致谢

感谢所有为这个项目做出贡献的开发者们！

---

⭐ 如果这个项目对你有帮助，请给它一个星标！
