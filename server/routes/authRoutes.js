const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const db = require('../config/db')
const authController = require('../controllers/authController')
const passwordResetController = require('../controllers/passwordResetController')

// 登录路由
router.post('/login', authController.login)

// 密码重置相关路由
router.post('/send-reset-code', passwordResetController.sendResetCode)
router.post('/verify-reset-code', passwordResetController.verifyResetCode)
router.post('/reset-password', passwordResetController.resetPassword)

// 刷新token
router.post('/refresh-token', async (req, res) => {
  const { refreshToken } = req.body

  if (!refreshToken) {
    return res.status(401).json({ message: '需要刷新令牌' })
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET)

    const token = jwt.sign(
      {
        id: decoded.id,
        username: decoded.username,
        role: decoded.role,
        permissions: getPermissionsByRole(decoded.role)
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '24h',
        issuer: 'evaluation-system'
      }
    )

    res.json({ token })
  } catch (error) {
    console.error('刷新token失败:', error)
    res.status(401).json({ message: '无效的刷新令牌' })
  }
})

// 获取角色权限
function getPermissionsByRole(role) {
  switch(role) {
    case 'admin':
      return ['manage_users', 'manage_courses', 'manage_evaluations']
    case 'teacher':
      return ['view_evaluations', 'manage_own_courses']
    case 'student':
      return ['submit_evaluations', 'view_own_evaluations']
    default:
      return []
  }
}

module.exports = router
