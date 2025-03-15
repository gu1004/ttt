const validateRegistration = (req, res, next) => {
    const { username, password, role, name, phone, email } = req.body
  
    if (!username || !password || !role || !name || !phone) {
      return res.status(400).json({ message: '必填字段不能为空' })
    }
  
    if (role === 'admin') {
      return res.status(400).json({ message: '不能注册管理员账号' })
    }
  
    // 邮箱格式验证（如果提供了邮箱）
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: '邮箱格式不正确' })
      }
    }
    next()
  }

  const validatePhone = (req, res, next) => {
    const { phone } = req.body
    const phoneRegex = /^1[3-9]\d{9}$/
  
    if (!phone || !phoneRegex.test(phone)) {
      return res.status(400).json({ message: '无效的手机号格式' })
    }
  
    next()
  }
  
module.exports = {
  validatePhone,
  validateRegistration
}
