const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const db = require('../utils/db')

const register = async (req, res) => {
    try {
      const { username, password, role, name, email, phone } = req.body

      // 检查用户是否已存在
      const [existingUsers] = await db.execute(
        'SELECT * FROM users WHERE username = ? OR phone = ? OR email = ?',
        [username, phone, email]
      )

      if (existingUsers.length > 0) {
        return res.status(400).json({
          message: '用户名、邮箱或手机号已被注册'
        })
      }

      // 加密密码
      const hashedPassword = await bcrypt.hash(password, 10)

      // 创建新用户
      await db.execute(
        'INSERT INTO users (username, password, role, name, email, phone) VALUES (?, ?, ?, ?, ?, ?)',
        [username, hashedPassword, role, name, email, phone]
      )

      res.status(201).json({ message: '注册成功' })
    } catch (error) {
      console.error('注册错误:', error)
      res.status(500).json({ message: '服务器错误' })
    }
  }

const authController = {
  async login(req, res) {
    try {
      console.log('登录请求数据:', req.body)
      const { username, password, role } = req.body

      if (!username || !password || !role) {
        return res.status(400).json({ message: '请提供完整的登录信息' })
      }

      let query = ''
      let params = []

      switch (role) {
        case 'student':
          query = `
            SELECT
              id,
              username,
              name,
              password,
              'student' as role,
              active
            FROM students
            WHERE username = ?
          `
          params = [username]
          break

        case 'teacher':
          query = `
            SELECT
              id,
              username,
              name,
              password,
              'teacher' as role,
              active
            FROM teachers
            WHERE username = ?
          `
          params = [username]
          break

        case 'admin':
          query = `
            SELECT
              id,
              username,
              name,
              password,
              'admin' as role
            FROM administrators
            WHERE username = ?
          `
          params = [username]
          break

        default:
          return res.status(400).json({ message: '无效的用户角色' })
      }

      console.log('执行查询:', { query, params })

      const [rows] = await db.query(query, params)
      console.log('查询结果:', rows)

      if (rows.length === 0) {
        console.log('未找到用户记录')
        return res.status(401).json({ message: '用户名或密码错误' })
      }

      const user = rows[0]
      console.log('找到用户:', { ...user, password: '***' })

      // 检查用户是否被禁用
      if (role !== 'admin' && user.active === 0) {
        console.log('用户已被禁用')
        return res.status(403).json({ message: '你的账号被禁用了' })
      }

      // 验证密码
      if (password !== user.password) {
        console.log('密码不匹配')
        return res.status(401).json({ message: '用户名或密码错误' })
      }

      // 生成 token
      const token = jwt.sign(
        {
          id: user.id,
          username: user.username,
          role: user.role,
          name: user.name
        },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      )

      console.log('登录成功，生成token')

      // 返回用户信息和token
      res.json({
        token,
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
          name: user.name
        }
      })
    } catch (error) {
      console.error('登录错误:', error)
      res.status(500).json({
        message: '服务器错误',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    }
  }
}

module.exports = authController
