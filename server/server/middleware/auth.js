const jwt = require('jsonwebtoken')
require('dotenv').config()

// 验证 JWT Token 的中间件
exports.auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '')

    if (!token) {
      return res.status(401).json({ message: '请先登录' })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded
    next()
  } catch (error) {
    console.error('Token验证失败:', error)
    res.status(401).json({ message: '身份验证失败' })
  }
}

// 检查用户角色的中间件
exports.checkRole = (role) => {
  return (req, res, next) => {
    if (req.user && req.user.role === role) {
      next()
    } else {
      res.status(403).json({ message: '没有权限访问此资源' })
    }
  }
}
