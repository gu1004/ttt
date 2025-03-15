require('dotenv').config()
const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const authRoutes = require('./routes/authRoutes')
const adminRoutes = require('./routes/adminRoutes')
const studentRoutes = require('./routes/student')
const teacherRoutes = require('./routes/teacherRoutes')
const { auth } = require('./middleware/auth')

const app = express()

// CORS 配置
app.use(cors({
  origin: ['http://localhost:8080', 'http://localhost:8081', 'http://localhost:8082'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Authorization'],
  credentials: true
}))

// 中间件
app.use(bodyParser.json())

// 测试路由
app.get('/', (req, res) => {
  res.json({ message: 'API 服务器运行正常' })
})

// 路由
app.use('/api/auth', authRoutes)
app.use('/api/admin', auth, adminRoutes)  // 添加管理员路由，需要认证
app.use('/api/student', auth, studentRoutes)  // 添加学生路由，需要认证
app.use('/api/teacher', teacherRoutes)  // 添加教师路由

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('错误:', err)
  res.status(500).json({ message: '服务器内部错误' })
})

// 处理 404
app.use((req, res) => {
  res.status(404).json({ message: '未找到请求的资源' })
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`)
})

// 处理未捕获的异常
process.on('uncaughtException', (err) => {
  console.error('未捕获的异常:', err)
})

process.on('unhandledRejection', (err) => {
  console.error('未处理的 Promise 拒绝:', err)
})
