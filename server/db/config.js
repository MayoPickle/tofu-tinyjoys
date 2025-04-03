const { Pool } = require('pg');

// 创建数据库连接池
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  max: 20, // 最大连接数
  idleTimeoutMillis: 30000, // 连接在被释放之前可以空闲的毫秒数
  connectionTimeoutMillis: 2000, // 连接超时毫秒数
});

// 添加池错误处理以防止应用崩溃
pool.on('error', (err) => {
  console.error('PostgreSQL 连接池意外错误', err);
});

module.exports = { pool }; 