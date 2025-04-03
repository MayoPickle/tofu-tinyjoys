const express = require('express');
const { body, validationResult } = require('express-validator');
const { pool } = require('../db/config');
const { 
  hashPassword, 
  comparePassword, 
  generateToken, 
  authenticate 
} = require('../utils/auth');

const router = express.Router();

// 注册新用户
router.post(
  '/register',
  [
    // 验证请求数据
    body('username')
      .trim()
      .isLength({ min: 3, max: 50 })
      .withMessage('用户名必须在3到50个字符之间')
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage('用户名只能包含字母、数字和下划线'),
    body('email')
      .isEmail()
      .withMessage('请提供有效的电子邮件地址')
      .normalizeEmail(),
    body('password')
      .isLength({ min: 6 })
      .withMessage('密码至少需要6个字符')
  ],
  async (req, res) => {
    try {
      // 检查验证结果
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          error: '验证错误', 
          messages: errors.array().map(e => e.msg) 
        });
      }

      const { username, email, password } = req.body;

      // 检查用户名和电子邮件是否已存在
      const checkResult = await pool.query(
        'SELECT * FROM users WHERE username = $1 OR email = $2',
        [username, email]
      );

      if (checkResult.rowCount > 0) {
        return res.status(409).json({ 
          error: '注册失败', 
          message: '用户名或电子邮件已被使用' 
        });
      }

      // 加密密码
      const passwordHash = await hashPassword(password);

      // 创建新用户
      const result = await pool.query(
        'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email, created_at',
        [username, email, passwordHash]
      );

      const newUser = result.rows[0];

      // 生成JWT令牌
      const token = generateToken(newUser);

      // 返回用户信息和令牌
      res.status(201).json({
        message: '注册成功!',
        user: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
          created_at: newUser.created_at
        },
        token
      });
    } catch (error) {
      console.error('注册错误:', error);
      res.status(500).json({ 
        error: '服务器错误', 
        message: '注册过程中发生错误' 
      });
    }
  }
);

// 用户登录
router.post(
  '/login',
  [
    // 验证请求数据
    body('email').isEmail().withMessage('请提供有效的电子邮件地址'),
    body('password').not().isEmpty().withMessage('请提供密码')
  ],
  async (req, res) => {
    try {
      // 检查验证结果
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          error: '验证错误', 
          messages: errors.array().map(e => e.msg) 
        });
      }

      const { email, password } = req.body;

      // 查找用户
      const result = await pool.query(
        'SELECT id, username, email, password_hash FROM users WHERE email = $1',
        [email]
      );

      if (result.rowCount === 0) {
        return res.status(401).json({ 
          error: '登录失败', 
          message: '电子邮件或密码不正确' 
        });
      }

      const user = result.rows[0];

      // 验证密码
      const passwordMatch = await comparePassword(password, user.password_hash);
      if (!passwordMatch) {
        return res.status(401).json({ 
          error: '登录失败', 
          message: '电子邮件或密码不正确' 
        });
      }

      // 生成JWT令牌
      const token = generateToken(user);

      // 返回用户信息和令牌
      res.json({
        message: '登录成功!',
        user: {
          id: user.id,
          username: user.username,
          email: user.email
        },
        token
      });
    } catch (error) {
      console.error('登录错误:', error);
      res.status(500).json({ 
        error: '服务器错误', 
        message: '登录过程中发生错误' 
      });
    }
  }
);

// 获取当前用户信息
router.get('/me', authenticate, async (req, res) => {
  try {
    // 获取用户详细信息
    const result = await pool.query(
      'SELECT id, username, email, avatar_url, created_at, updated_at FROM users WHERE id = $1',
      [req.user.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ 
        error: '未找到', 
        message: '用户不存在' 
      });
    }

    res.json({
      user: result.rows[0]
    });
  } catch (error) {
    console.error('获取用户信息错误:', error);
    res.status(500).json({ 
      error: '服务器错误', 
      message: '获取用户信息时发生错误' 
    });
  }
});

// 更新用户个人资料
router.put('/profile', authenticate, async (req, res) => {
  try {
    const { username, avatar_url } = req.body;
    const userId = req.user.id;

    // 验证数据
    if (username && (username.length < 3 || username.length > 50)) {
      return res.status(400).json({ 
        error: '验证错误', 
        message: '用户名必须在3到50个字符之间' 
      });
    }

    // 准备更新
    const updates = [];
    const values = [];
    let valueIndex = 1;

    if (username) {
      updates.push(`username = $${valueIndex}`);
      values.push(username);
      valueIndex++;
    }

    if (avatar_url) {
      updates.push(`avatar_url = $${valueIndex}`);
      values.push(avatar_url);
      valueIndex++;
    }

    // 如果没有要更新的内容
    if (updates.length === 0) {
      return res.status(400).json({ 
        error: '更新失败', 
        message: '没有提供要更新的内容' 
      });
    }

    // 添加用户ID
    values.push(userId);

    // 执行更新
    const result = await pool.query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = $${valueIndex} RETURNING id, username, email, avatar_url, updated_at`,
      values
    );

    res.json({
      message: '个人资料已更新',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('更新个人资料错误:', error);
    res.status(500).json({ 
      error: '服务器错误', 
      message: '更新个人资料时发生错误' 
    });
  }
});

// 更改密码
router.put(
  '/password',
  authenticate,
  [
    body('currentPassword').not().isEmpty().withMessage('请提供当前密码'),
    body('newPassword')
      .isLength({ min: 6 })
      .withMessage('新密码至少需要6个字符')
  ],
  async (req, res) => {
    try {
      // 检查验证结果
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          error: '验证错误', 
          messages: errors.array().map(e => e.msg) 
        });
      }

      const { currentPassword, newPassword } = req.body;
      const userId = req.user.id;

      // 获取当前用户
      const userResult = await pool.query(
        'SELECT password_hash FROM users WHERE id = $1',
        [userId]
      );

      if (userResult.rowCount === 0) {
        return res.status(404).json({ 
          error: '未找到', 
          message: '用户不存在' 
        });
      }

      const user = userResult.rows[0];

      // 验证当前密码
      const passwordMatch = await comparePassword(
        currentPassword, 
        user.password_hash
      );
      
      if (!passwordMatch) {
        return res.status(401).json({ 
          error: '验证失败', 
          message: '当前密码不正确' 
        });
      }

      // 加密新密码
      const newPasswordHash = await hashPassword(newPassword);

      // 更新密码
      await pool.query(
        'UPDATE users SET password_hash = $1 WHERE id = $2',
        [newPasswordHash, userId]
      );

      res.json({
        message: '密码已成功更新'
      });
    } catch (error) {
      console.error('更改密码错误:', error);
      res.status(500).json({ 
        error: '服务器错误', 
        message: '更改密码时发生错误' 
      });
    }
  }
);

// 注册设备（用于多设备同步）
router.post(
  '/register-device',
  authenticate,
  [
    body('device_name').not().isEmpty().withMessage('请提供设备名称'),
    body('device_id').not().isEmpty().withMessage('请提供设备ID'),
    body('device_type')
      .isIn(['android', 'ios', 'web'])
      .withMessage('设备类型必须是android、ios或web')
  ],
  async (req, res) => {
    try {
      // 检查验证结果
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          error: '验证错误', 
          messages: errors.array().map(e => e.msg) 
        });
      }

      const { device_name, device_id, device_type } = req.body;
      const userId = req.user.id;

      // 检查设备是否已注册
      const checkResult = await pool.query(
        'SELECT * FROM devices WHERE user_id = $1 AND device_id = $2',
        [userId, device_id]
      );

      if (checkResult.rowCount > 0) {
        // 设备已存在，更新最后同步时间
        await pool.query(
          'UPDATE devices SET last_sync_at = CURRENT_TIMESTAMP WHERE user_id = $1 AND device_id = $2',
          [userId, device_id]
        );

        return res.json({
          message: '设备已更新',
          device: checkResult.rows[0]
        });
      }

      // 注册新设备
      const result = await pool.query(
        'INSERT INTO devices (user_id, device_name, device_id, device_type) VALUES ($1, $2, $3, $4) RETURNING *',
        [userId, device_name, device_id, device_type]
      );

      res.status(201).json({
        message: '设备已注册',
        device: result.rows[0]
      });
    } catch (error) {
      console.error('注册设备错误:', error);
      res.status(500).json({ 
        error: '服务器错误', 
        message: '注册设备时发生错误' 
      });
    }
  }
);

module.exports = router; 