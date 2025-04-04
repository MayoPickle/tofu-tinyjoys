const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// 密码加密
const hashPassword = async (password) => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

// 密码验证
const comparePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

// 创建JWT令牌
const generateToken = (user) => {
  const payload = {
    id: user.id,
    username: user.username,
    email: user.email
  };
  
  return jwt.sign(
    payload, 
    process.env.JWT_SECRET, 
    { expiresIn: '30d' } // 令牌30天有效
  );
};

// 验证JWT令牌
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};

// 授权中间件
const authenticate = (req, res, next) => {
  try {
    // 从请求头获取令牌
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: '未授权', 
        message: '请登录后再试' 
      });
    }

    // 提取令牌
    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ 
        error: '未授权', 
        message: '无效的认证令牌' 
      });
    }

    // 验证令牌
    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ 
        error: '未授权', 
        message: '认证令牌已过期或无效' 
      });
    }

    // 将用户信息添加到请求对象中
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(500).json({ 
      error: '授权错误', 
      message: '处理认证时发生意外错误' 
    });
  }
};

module.exports = {
  hashPassword,
  comparePassword,
  generateToken,
  verifyToken,
  authenticate
}; 