require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { pool } = require('./config');

// 读取SQL文件
const sqlFile = fs.readFileSync(path.join(__dirname, 'init.sql'), 'utf8');

// 修改SQL命令适应pg库的执行
const sqlCommands = sqlFile
  .replace(/CREATE DATABASE IF NOT EXISTS tofu_tinyjoys;/g, '')
  .replace(/\\c tofu_tinyjoys;/g, '')
  .split(';')
  .filter(command => command.trim() !== '');

// 初始化数据库函数
async function initializeDatabase() {
  const client = await pool.connect();
  try {
    console.log('🔧 开始初始化数据库...');
    
    // 开始事务
    await client.query('BEGIN');
    
    // 执行每个SQL命令
    for (const command of sqlCommands) {
      await client.query(command);
    }
    
    // 提交事务
    await client.query('COMMIT');
    
    console.log('✅ 数据库初始化成功!');
  } catch (err) {
    // 发生错误时回滚
    await client.query('ROLLBACK');
    console.error('❌ 数据库初始化失败:', err);
    throw err;
  } finally {
    // 释放连接
    client.release();
  }
}

// 如果直接运行此文件，则执行初始化
if (require.main === module) {
  initializeDatabase()
    .then(() => {
      console.log('🎉 数据库设置完成');
      process.exit(0);
    })
    .catch(err => {
      console.error('初始化过程中出错:', err);
      process.exit(1);
    });
}

module.exports = { initializeDatabase }; 