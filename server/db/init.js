require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const { pool } = require('./config');

// 创建连接到默认数据库的连接池
const defaultPool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: 'postgres', // 连接到默认的postgres数据库
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// 创建连接到目标数据库的连接池
const targetPool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// 读取SQL文件
const sqlFile = fs.readFileSync(path.join(__dirname, 'init.sql'), 'utf8');

// 移除PostgreSQL特定的命令，这些不能通过Node.js的pg执行
let processedSql = sqlFile
  .replace(/CREATE DATABASE IF NOT EXISTS tofu_tinyjoys;/g, '')
  .replace(/\\c tofu_tinyjoys;/g, '');

// 提取创建函数和触发器的SQL语句（完整保留）
const functionPattern = /CREATE OR REPLACE FUNCTION[\s\S]*?LANGUAGE plpgsql;/g;
const functionMatches = processedSql.match(functionPattern) || [];

// 提取创建触发器的SQL语句
const triggerPattern = /CREATE TRIGGER[\s\S]*?update_updated_at\(\);/g;
const triggerMatches = processedSql.match(triggerPattern) || [];

// 移除已提取的函数和触发器
for (const match of [...functionMatches, ...triggerMatches]) {
  processedSql = processedSql.replace(match, '');
}

// 分割其余SQL命令
const tableCommands = processedSql
  .split(';')
  .map(cmd => cmd.trim())
  .filter(cmd => cmd !== '');

// 创建数据库的函数
async function createDatabase() {
  // 创建一个连接到默认数据库的池
  const pgPool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: 'postgres', // 连接到默认的postgres数据库
  });

  try {
    const client = await pgPool.connect();
    try {
      console.log('🔍 检查数据库是否存在...');
      
      // 检查数据库是否已存在
      const checkResult = await client.query(
        `SELECT 1 FROM pg_database WHERE datname = $1`,
        [process.env.DB_NAME]
      );
      
      if (checkResult.rowCount === 0) {
        console.log(`🔧 创建数据库 ${process.env.DB_NAME}...`);
        // 创建数据库
        await client.query(`CREATE DATABASE ${process.env.DB_NAME}`);
        console.log(`✅ 数据库 ${process.env.DB_NAME} 创建成功`);
      } else {
        console.log(`✅ 数据库 ${process.env.DB_NAME} 已存在`);
      }
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('❌ 创建数据库失败:', err);
    throw err;
  } finally {
    await pgPool.end();
  }
}

// 初始化数据库函数
async function initializeDatabase() {
  const client = await pool.connect();
  try {
    console.log('🔧 开始初始化数据库结构...');
    
    // 开始事务
    await client.query('BEGIN');
    
    // 执行创建表的SQL命令
    for (const command of tableCommands) {
      if (command.trim()) {
        await client.query(command);
      }
    }
    
    // 执行创建函数的SQL命令
    for (const functionSql of functionMatches) {
      if (functionSql.trim()) {
        await client.query(functionSql);
      }
    }
    
    // 执行创建触发器的SQL命令
    for (const triggerSql of triggerMatches) {
      if (triggerSql.trim()) {
        await client.query(triggerSql);
      }
    }
    
    // 提交事务
    await client.query('COMMIT');
    
    console.log('✅ 数据库结构初始化成功!');
  } catch (err) {
    // 发生错误时回滚
    await client.query('ROLLBACK');
    console.error('❌ 数据库结构初始化失败:', err);
    throw err;
  } finally {
    // 释放连接
    client.release();
  }
}

// 如果直接运行此文件，则执行初始化
if (require.main === module) {
  (async () => {
    try {
      // 首先创建数据库
      await createDatabase();
      
      // 然后初始化表结构
      await initializeDatabase();
      
      console.log('🎉 数据库设置完成');
      process.exit(0);
    } catch (err) {
      console.error('初始化过程中出错:', err);
      process.exit(1);
    }
  })();
}

module.exports = { initializeDatabase }; 