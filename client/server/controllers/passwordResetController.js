const db = require('../utils/db')
const { sendVerificationCode } = require('../utils/emailService')
const { generateRandomCode } = require('../utils/helpers')

// 存储验证码和过期时间
const verificationCodes = new Map()

const passwordResetController = {
  // 发送重置密码验证码
  async sendResetCode(req, res) {
    try {
      const { username } = req.body

      // 分别查询各个表
      const [students] = await db.query(
        'SELECT id, email, "student" as role FROM students WHERE username = ?',
        [username]
      )

      const [teachers] = await db.query(
        'SELECT id, email, "teacher" as role FROM teachers WHERE username = ?',
        [username]
      )

      const [admins] = await db.query(
        'SELECT id, email, "admin" as role FROM administrators WHERE username = ?',
        [username]
      )

      // 合并结果
      const users = [...students, ...teachers, ...admins]

      if (users.length === 0) {
        return res.status(404).json({ message: '用户不存在' })
      }

      const user = users[0]
      if (!user.email) {
        return res.status(400).json({ message: '该用户未设置邮箱，请联系管理员' })
      }

      // 生成6位随机验证码
      const code = generateRandomCode()

      // 存储验证码和过期时间（5分钟后过期）
      verificationCodes.set(username, {
        code,
        expireTime: Date.now() + 5 * 60 * 1000,
        userId: user.id,
        userRole: user.role
      })

      // 发送验证码邮件
      const success = await sendVerificationCode(user.email, code)
      if (!success) {
        return res.status(500).json({ message: '发送验证码失败' })
      }

      res.json({ message: '验证码已发送到您的邮箱' })
    } catch (error) {
      console.error('发送重置验证码失败:', error)
      res.status(500).json({ message: '发送验证码失败' })
    }
  },

  // 验证重置密码的验证码
  async verifyResetCode(req, res) {
    try {
      const { username, code } = req.body

      const storedData = verificationCodes.get(username)
      if (!storedData) {
        return res.status(400).json({ message: '验证码已过期，请重新获取' })
      }

      if (Date.now() > storedData.expireTime) {
        verificationCodes.delete(username)
        return res.status(400).json({ message: '验证码已过期，请重新获取' })
      }

      if (storedData.code !== code) {
        return res.status(400).json({ message: '验证码错误' })
      }

      res.json({ message: '验证成功' })
    } catch (error) {
      console.error('验证重置码失败:', error)
      res.status(500).json({ message: '验证失败' })
    }
  },

  // 重置密码
  async resetPassword(req, res) {
    try {
      const { username, code, password } = req.body

      // 再次验证验证码
      const storedData = verificationCodes.get(username)
      if (!storedData || Date.now() > storedData.expireTime || storedData.code !== code) {
        return res.status(400).json({ message: '验证码无效或已过期' })
      }

      // 更新密码
      await db.query('START TRANSACTION')

      let tableName
      switch (storedData.userRole) {
        case 'student':
          tableName = 'students'
          break
        case 'teacher':
          tableName = 'teachers'
          break
        case 'admin':
          tableName = 'administrators'
          break
        default:
          throw new Error('无效的用户角色')
      }

      const [result] = await db.query(
        `UPDATE ${tableName} SET password = ? WHERE id = ?`,
        [password, storedData.userId]
      )

      if (result.affectedRows === 0) {
        await db.query('ROLLBACK')
        return res.status(404).json({ message: '用户不存在' })
      }

      await db.query('COMMIT')

      // 清除验证码
      verificationCodes.delete(username)

      res.json({ message: '密码重置成功' })
    } catch (error) {
      await db.query('ROLLBACK')
      console.error('重置密码失败:', error)
      res.status(500).json({ message: '重置密码失败' })
    }
  }
}

module.exports = passwordResetController
