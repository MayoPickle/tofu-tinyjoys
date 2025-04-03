# 豆腐小乐事 (Tofu TinyJoys)

一个可爱的跨平台待办事项应用，支持多设备同步和多种视图模式。

## 功能特点

- 🌈 精美可爱的UI设计
- 📱 全平台支持：Web、iOS、Android
- 🔄 跨设备同步
- 📆 多视图模式：日视图、周视图、月视图
- 🔐 安全的用户认证系统
- 🚀 高性能的PostgreSQL数据存储

## 技术栈

### 后端
- Node.js + Express
- PostgreSQL 数据库
- JWT 认证

### 前端
- React Native (移动端)
- Next.js (Web端)
- TailwindCSS

## 开始使用

### 环境要求
- Node.js 16+
- PostgreSQL
- npm 或 yarn

### 安装与启动

1. 克隆仓库
```
git clone https://github.com/your-username/tofu-tinyjoys.git
cd tofu-tinyjoys
```

2. 安装依赖
```
npm install
cd client && npm install
```

3. 配置环境变量
创建 `.env` 文件并设置以下变量:
```
DB_HOST=192.168.0.100
DB_PORT=5678
DB_USER=nayuta
DB_PASSWORD=y10086Y+1s
DB_NAME=tofu_tinyjoys
JWT_SECRET=your_jwt_secret
```

4. 启动开发服务器
```
npm run dev
```

## 部署

详细的部署指南请参考 [部署文档](./docs/deployment.md)。

## 贡献

欢迎提交 Pull Request 和 Issue！
