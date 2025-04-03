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
  try {
    // 检查数据库连接
    const client = await pool.connect();
    console.log('✅ 成功连接到 PostgreSQL 数据库');
    client.release();
    
    // 启动服务器
    app.listen(PORT, () => {
      console.log(`🚀 服务器运行在: http://localhost:${PORT}`);
      console.log(`🌈 豆腐小乐事等待您的使用~`);
    });
  } catch (err) {
    console.error('❌ 无法连接到数据库:', err);
    process.exit(1);
  }
};

startServer(); 