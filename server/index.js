require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { pool } = require('./db/config');

// 导入路由
const authRoutes = require('./routes/auth');
const todosRoutes = require('./routes/todos');

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// API路由
app.use('/api/auth', authRoutes);
app.use('/api/todos', todosRoutes);

// 健康检查端点
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: '豆腐小乐事服务器运行中' });
});

// 数据库状态检查端点
app.get('/api/db-status', async (req, res) => {
  try {
    const client = await pool.connect();
    client.release();
    res.status(200).json({ status: 'connected', message: '数据库连接正常' });
  } catch (err) {
    console.error('数据库连接失败:', err);
    res.status(500).json({ status: 'disconnected', message: '数据库连接失败' });
  }
});

// 404处理
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: '找不到页面', 
    message: '请确认您访问的API端点是否正确'
  });
});

// 全局错误处理
app.use((err, req, res, next) => {
  console.error('服务器错误:', err);
  res.status(500).json({ 
    error: '服务器内部错误', 
    message: process.env.NODE_ENV === 'production' ? '发生意外错误' : err.message 
  });
});

// 初始化数据库连接并启动服务器
const startServer = async () => {
  // 启动服务器
  app.listen(PORT, () => {
    console.log(`🚀 服务器运行在: http://localhost:${PORT}`);
    console.log(`🌈 豆腐小乐事等待您的使用~`);
  });

  // 检查数据库连接
  try {
    const client = await pool.connect();
    console.log('✅ 成功连接到 PostgreSQL 数据库');
    client.release();
  } catch (err) {
    console.error('❌ 无法连接到数据库，但服务器仍在运行:', err);
    console.log('💡 提示: 请确保数据库已创建，并尝试运行 node server/db/init.js 来初始化数据库');
  }
};

startServer(); 