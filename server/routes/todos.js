const express = require('express');
const { body, query, param, validationResult } = require('express-validator');
const { pool } = require('../db/config');
const { authenticate } = require('../utils/auth');

const router = express.Router();

// 获取所有待办事项（支持筛选和分页）
router.get('/', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      completed,
      priority,
      start_date,
      end_date,
      tags,
      search,
      limit = 50,
      offset = 0,
      sort_by = 'created_at',
      sort_order = 'desc'
    } = req.query;

    // 构建查询
    let query = `
      SELECT t.*, 
        ARRAY_AGG(tg.name) FILTER (WHERE tg.id IS NOT NULL) AS tag_names,
        ARRAY_AGG(tg.color) FILTER (WHERE tg.id IS NOT NULL) AS tag_colors,
        ARRAY_AGG(tg.id) FILTER (WHERE tg.id IS NOT NULL) AS tag_ids
      FROM todos t
      LEFT JOIN todo_tags tt ON t.id = tt.todo_id
      LEFT JOIN tags tg ON tt.tag_id = tg.id
      WHERE t.user_id = $1
    `;

    const queryParams = [userId];
    let paramCounter = 2;

    // 应用筛选条件
    if (completed !== undefined) {
      query += ` AND t.completed = $${paramCounter}`;
      queryParams.push(completed === 'true');
      paramCounter++;
    }

    if (priority !== undefined) {
      query += ` AND t.priority = $${paramCounter}`;
      queryParams.push(parseInt(priority));
      paramCounter++;
    }

    if (start_date) {
      query += ` AND t.due_date >= $${paramCounter}`;
      queryParams.push(start_date);
      paramCounter++;
    }

    if (end_date) {
      query += ` AND t.due_date <= $${paramCounter}`;
      queryParams.push(end_date);
      paramCounter++;
    }

    if (search) {
      query += ` AND (t.title ILIKE $${paramCounter} OR t.description ILIKE $${paramCounter})`;
      queryParams.push(`%${search}%`);
      paramCounter++;
    }

    if (tags) {
      const tagIds = Array.isArray(tags) ? tags : [tags];
      query += ` AND t.id IN (
        SELECT todo_id FROM todo_tags 
        WHERE tag_id IN (${tagIds.map((_, i) => `$${paramCounter + i}`).join(',')})
      )`;
      tagIds.forEach(tagId => {
        queryParams.push(parseInt(tagId));
      });
      paramCounter += tagIds.length;
    }

    // 分组以聚合标签
    query += ` GROUP BY t.id`;

    // 排序
    const validSortColumns = ['due_date', 'created_at', 'priority', 'title'];
    const validSortOrders = ['asc', 'desc'];
    
    const sortColumn = validSortColumns.includes(sort_by) ? sort_by : 'created_at';
    const sortDir = validSortOrders.includes(sort_order.toLowerCase()) 
      ? sort_order.toLowerCase() 
      : 'desc';
      
    query += ` ORDER BY t.${sortColumn} ${sortDir}`;

    // 添加分页
    query += ` LIMIT $${paramCounter} OFFSET $${paramCounter + 1}`;
    queryParams.push(parseInt(limit), parseInt(offset));

    // 执行查询
    const result = await pool.query(query, queryParams);

    // 获取总记录数
    const countResult = await pool.query(
      'SELECT COUNT(*) FROM todos WHERE user_id = $1',
      [userId]
    );

    const total = parseInt(countResult.rows[0].count);

    // 格式化响应
    const todos = result.rows.map(todo => ({
      ...todo,
      completed: todo.completed,
      priority: todo.priority,
      tags: todo.tag_ids 
        ? todo.tag_ids.map((id, index) => ({
            id,
            name: todo.tag_names[index],
            color: todo.tag_colors[index]
          }))
        : []
    }));

    // 移除不需要的属性
    todos.forEach(todo => {
      delete todo.tag_ids;
      delete todo.tag_names;
      delete todo.tag_colors;
    });

    res.json({
      todos,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        has_more: total > parseInt(offset) + parseInt(limit)
      }
    });
  } catch (error) {
    console.error('获取待办事项错误:', error);
    res.status(500).json({ 
      error: '服务器错误', 
      message: '获取待办事项列表时发生错误' 
    });
  }
});

// 创建新的待办事项
router.post(
  '/',
  authenticate,
  [
    body('title').trim().notEmpty().withMessage('标题不能为空'),
    body('description').optional(),
    body('due_date').optional().isISO8601().withMessage('日期格式无效'),
    body('priority').optional().isInt({ min: 0, max: 2 }).withMessage('优先级必须是0-2之间的整数'),
    body('color').optional().matches(/^#[0-9A-Fa-f]{6}$/).withMessage('颜色必须是有效的HEX颜色代码'),
    body('icon').optional(),
    body('tags').optional().isArray().withMessage('标签必须是一个数组')
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

      const userId = req.user.id;
      const { 
        title, 
        description, 
        due_date, 
        priority, 
        color, 
        icon, 
        tags 
      } = req.body;

      // 开始数据库事务
      const client = await pool.connect();
      try {
        await client.query('BEGIN');

        // 插入待办事项
        const todoResult = await client.query(
          `INSERT INTO todos 
           (user_id, title, description, due_date, priority, color, icon) 
           VALUES ($1, $2, $3, $4, $5, $6, $7) 
           RETURNING *`,
          [userId, title, description, due_date, priority, color, icon]
        );

        const newTodo = todoResult.rows[0];

        // 处理标签
        if (tags && tags.length > 0) {
          for (const tagId of tags) {
            // 验证标签属于当前用户
            const tagCheck = await client.query(
              'SELECT id FROM tags WHERE id = $1 AND user_id = $2',
              [tagId, userId]
            );

            if (tagCheck.rowCount > 0) {
              // 将标签与待办事项关联
              await client.query(
                'INSERT INTO todo_tags (todo_id, tag_id) VALUES ($1, $2)',
                [newTodo.id, tagId]
              );
            }
          }
        }

        // 提交事务
        await client.query('COMMIT');

        // 获取完整的待办事项和标签信息
        const completeTodoResult = await pool.query(
          `SELECT t.*, 
            ARRAY_AGG(tg.name) FILTER (WHERE tg.id IS NOT NULL) AS tag_names,
            ARRAY_AGG(tg.color) FILTER (WHERE tg.id IS NOT NULL) AS tag_colors,
            ARRAY_AGG(tg.id) FILTER (WHERE tg.id IS NOT NULL) AS tag_ids
          FROM todos t
          LEFT JOIN todo_tags tt ON t.id = tt.todo_id
          LEFT JOIN tags tg ON tt.tag_id = tg.id
          WHERE t.id = $1
          GROUP BY t.id`,
          [newTodo.id]
        );

        if (completeTodoResult.rowCount > 0) {
          const todo = completeTodoResult.rows[0];
          // 格式化标签
          todo.tags = todo.tag_ids 
            ? todo.tag_ids.map((id, index) => ({
                id,
                name: todo.tag_names[index],
                color: todo.tag_colors[index]
              }))
            : [];

          // 移除不需要的属性
          delete todo.tag_ids;
          delete todo.tag_names;
          delete todo.tag_colors;

          res.status(201).json({
            message: '待办事项已创建',
            todo
          });
        } else {
          res.status(201).json({
            message: '待办事项已创建',
            todo: newTodo
          });
        }
      } catch (error) {
        // 事务失败，回滚
        await client.query('ROLLBACK');
        throw error;
      } finally {
        // 释放客户端
        client.release();
      }
    } catch (error) {
      console.error('创建待办事项错误:', error);
      res.status(500).json({ 
        error: '服务器错误', 
        message: '创建待办事项时发生错误' 
      });
    }
  }
);

// 获取单个待办事项
router.get('/:id', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const todoId = req.params.id;

    // 获取待办事项及其标签
    const result = await pool.query(
      `SELECT t.*, 
        ARRAY_AGG(tg.name) FILTER (WHERE tg.id IS NOT NULL) AS tag_names,
        ARRAY_AGG(tg.color) FILTER (WHERE tg.id IS NOT NULL) AS tag_colors,
        ARRAY_AGG(tg.id) FILTER (WHERE tg.id IS NOT NULL) AS tag_ids
      FROM todos t
      LEFT JOIN todo_tags tt ON t.id = tt.todo_id
      LEFT JOIN tags tg ON tt.tag_id = tg.id
      WHERE t.id = $1 AND t.user_id = $2
      GROUP BY t.id`,
      [todoId, userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ 
        error: '未找到', 
        message: '找不到该待办事项' 
      });
    }

    const todo = result.rows[0];
    
    // 格式化标签
    todo.tags = todo.tag_ids 
      ? todo.tag_ids.map((id, index) => ({
          id,
          name: todo.tag_names[index],
          color: todo.tag_colors[index]
        }))
      : [];

    // 移除不需要的属性
    delete todo.tag_ids;
    delete todo.tag_names;
    delete todo.tag_colors;

    res.json({ todo });
  } catch (error) {
    console.error('获取待办事项错误:', error);
    res.status(500).json({ 
      error: '服务器错误', 
      message: '获取待办事项时发生错误' 
    });
  }
});

// 更新待办事项
router.put(
  '/:id',
  authenticate,
  [
    param('id').isInt().withMessage('待办事项ID必须是整数'),
    body('title').optional().trim().notEmpty().withMessage('标题不能为空'),
    body('description').optional(),
    body('due_date').optional().isISO8601().withMessage('日期格式无效'),
    body('completed').optional().isBoolean().withMessage('完成状态必须是布尔值'),
    body('priority').optional().isInt({ min: 0, max: 2 }).withMessage('优先级必须是0-2之间的整数'),
    body('color').optional().matches(/^#[0-9A-Fa-f]{6}$/).withMessage('颜色必须是有效的HEX颜色代码'),
    body('icon').optional(),
    body('tags').optional().isArray().withMessage('标签必须是一个数组')
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

      const userId = req.user.id;
      const todoId = req.params.id;
      const {
        title,
        description,
        due_date,
        completed,
        priority,
        color,
        icon,
        tags
      } = req.body;

      // 检查待办事项是否存在并属于当前用户
      const todoCheck = await pool.query(
        'SELECT * FROM todos WHERE id = $1 AND user_id = $2',
        [todoId, userId]
      );

      if (todoCheck.rowCount === 0) {
        return res.status(404).json({ 
          error: '未找到', 
          message: '找不到该待办事项' 
        });
      }

      // 开始数据库事务
      const client = await pool.connect();
      try {
        await client.query('BEGIN');

        // 准备更新字段
        const updateFields = [];
        const values = [];
        let paramCounter = 1;

        if (title !== undefined) {
          updateFields.push(`title = $${paramCounter}`);
          values.push(title);
          paramCounter++;
        }

        if (description !== undefined) {
          updateFields.push(`description = $${paramCounter}`);
          values.push(description);
          paramCounter++;
        }

        if (due_date !== undefined) {
          updateFields.push(`due_date = $${paramCounter}`);
          values.push(due_date);
          paramCounter++;
        }

        if (completed !== undefined) {
          updateFields.push(`completed = $${paramCounter}`);
          values.push(completed);
          paramCounter++;
        }

        if (priority !== undefined) {
          updateFields.push(`priority = $${paramCounter}`);
          values.push(priority);
          paramCounter++;
        }

        if (color !== undefined) {
          updateFields.push(`color = $${paramCounter}`);
          values.push(color);
          paramCounter++;
        }

        if (icon !== undefined) {
          updateFields.push(`icon = $${paramCounter}`);
          values.push(icon);
          paramCounter++;
        }

        // 如果有要更新的字段
        if (updateFields.length > 0) {
          // 添加用户ID和待办事项ID
          values.push(userId, todoId);

          // 执行更新
          await client.query(
            `UPDATE todos 
             SET ${updateFields.join(', ')} 
             WHERE user_id = $${paramCounter} AND id = $${paramCounter + 1}`,
            values
          );
        }

        // 如果提供了标签，则更新标签关联
        if (tags !== undefined) {
          // 删除现有标签关联
          await client.query(
            'DELETE FROM todo_tags WHERE todo_id = $1',
            [todoId]
          );

          // 添加新的标签关联
          if (tags && tags.length > 0) {
            for (const tagId of tags) {
              // 验证标签属于当前用户
              const tagCheck = await client.query(
                'SELECT id FROM tags WHERE id = $1 AND user_id = $2',
                [tagId, userId]
              );

              if (tagCheck.rowCount > 0) {
                // 将标签与待办事项关联
                await client.query(
                  'INSERT INTO todo_tags (todo_id, tag_id) VALUES ($1, $2)',
                  [todoId, tagId]
                );
              }
            }
          }
        }

        // 提交事务
        await client.query('COMMIT');

        // 获取更新后的待办事项
        const updatedTodoResult = await pool.query(
          `SELECT t.*, 
            ARRAY_AGG(tg.name) FILTER (WHERE tg.id IS NOT NULL) AS tag_names,
            ARRAY_AGG(tg.color) FILTER (WHERE tg.id IS NOT NULL) AS tag_colors,
            ARRAY_AGG(tg.id) FILTER (WHERE tg.id IS NOT NULL) AS tag_ids
          FROM todos t
          LEFT JOIN todo_tags tt ON t.id = tt.todo_id
          LEFT JOIN tags tg ON tt.tag_id = tg.id
          WHERE t.id = $1
          GROUP BY t.id`,
          [todoId]
        );

        const updatedTodo = updatedTodoResult.rows[0];
        
        // 格式化标签
        updatedTodo.tags = updatedTodo.tag_ids 
          ? updatedTodo.tag_ids.map((id, index) => ({
              id,
              name: updatedTodo.tag_names[index],
              color: updatedTodo.tag_colors[index]
            }))
          : [];

        // 移除不需要的属性
        delete updatedTodo.tag_ids;
        delete updatedTodo.tag_names;
        delete updatedTodo.tag_colors;

        res.json({
          message: '待办事项已更新',
          todo: updatedTodo
        });
      } catch (error) {
        // 事务失败，回滚
        await client.query('ROLLBACK');
        throw error;
      } finally {
        // 释放客户端
        client.release();
      }
    } catch (error) {
      console.error('更新待办事项错误:', error);
      res.status(500).json({ 
        error: '服务器错误', 
        message: '更新待办事项时发生错误' 
      });
    }
  }
);

// 删除待办事项
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const todoId = req.params.id;

    // 检查待办事项是否存在并属于当前用户
    const todoCheck = await pool.query(
      'SELECT * FROM todos WHERE id = $1 AND user_id = $2',
      [todoId, userId]
    );

    if (todoCheck.rowCount === 0) {
      return res.status(404).json({ 
        error: '未找到', 
        message: '找不到该待办事项' 
      });
    }

    // 删除待办事项（级联删除会自动删除相关的标签关联）
    await pool.query(
      'DELETE FROM todos WHERE id = $1 AND user_id = $2',
      [todoId, userId]
    );

    res.json({
      message: '待办事项已删除'
    });
  } catch (error) {
    console.error('删除待办事项错误:', error);
    res.status(500).json({ 
      error: '服务器错误', 
      message: '删除待办事项时发生错误' 
    });
  }
});

// 获取标签列表
router.get('/tags', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;

    // 获取用户的所有标签
    const result = await pool.query(
      'SELECT * FROM tags WHERE user_id = $1 ORDER BY name',
      [userId]
    );

    res.json({
      tags: result.rows
    });
  } catch (error) {
    console.error('获取标签错误:', error);
    res.status(500).json({ 
      error: '服务器错误', 
      message: '获取标签列表时发生错误' 
    });
  }
});

// 创建新标签
router.post(
  '/tags',
  authenticate,
  [
    body('name').trim().notEmpty().withMessage('标签名不能为空'),
    body('color').optional().matches(/^#[0-9A-Fa-f]{6}$/).withMessage('颜色必须是有效的HEX颜色代码')
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

      const userId = req.user.id;
      const { name, color } = req.body;

      // 检查标签名是否已存在
      const tagCheck = await pool.query(
        'SELECT * FROM tags WHERE user_id = $1 AND name = $2',
        [userId, name]
      );

      if (tagCheck.rowCount > 0) {
        return res.status(409).json({ 
          error: '创建失败', 
          message: '标签名已存在' 
        });
      }

      // 创建新标签
      const result = await pool.query(
        'INSERT INTO tags (user_id, name, color) VALUES ($1, $2, $3) RETURNING *',
        [userId, name, color || '#CCCCCC']
      );

      res.status(201).json({
        message: '标签已创建',
        tag: result.rows[0]
      });
    } catch (error) {
      console.error('创建标签错误:', error);
      res.status(500).json({ 
        error: '服务器错误', 
        message: '创建标签时发生错误' 
      });
    }
  }
);

// 获取同步日志
router.get('/sync', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { after } = req.query;

    // 查询条件
    let query = 'SELECT * FROM sync_logs WHERE user_id = $1';
    const params = [userId];

    // 如果提供了时间戳，则只获取该时间戳之后的日志
    if (after) {
      query += ' AND timestamp > $2';
      params.push(after);
    }

    // 按时间戳排序
    query += ' ORDER BY timestamp ASC';

    // 执行查询
    const result = await pool.query(query, params);

    res.json({
      sync_logs: result.rows
    });
  } catch (error) {
    console.error('获取同步日志错误:', error);
    res.status(500).json({ 
      error: '服务器错误', 
      message: '获取同步日志时发生错误' 
    });
  }
});

module.exports = router; 