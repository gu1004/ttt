<template>
  <div class="auth-container">
    <div class="auth-box">
      <!-- 左侧图片区域 -->
      <div class="login-left">
        <div class="image-container">
          <img src="@/assets/login-illustration.png" alt="login">
        </div>
      </div>

      <!-- 右侧登录表单 -->
      <div class="auth-form">
        <h2>在线课程评价系统</h2>
        <div class="form-item">
          <input
            type="text"
            v-model="loginForm.username"
            placeholder="账号"
          >
        </div>
        <div class="form-item">
          <input
            type="password"
            v-model="loginForm.password"
            placeholder="密码"
          >
        </div>

        <!-- 角色选择 -->
        <div class="role-select">
          <label class="role-item" v-for="roleOption in roleOptions" :key="roleOption.value">
            <input
              type="radio"
              :value="roleOption.value"
              v-model="loginForm.role"
            >
            <span>{{ roleOption.label }}</span>
          </label>
        </div>

        <button class="login-btn" @click="handleLogin">登录</button>

        <!-- 添加链接区域 -->
        <div class="bottom-links">
          <a class="link" @click="$router.push('/forget-password')">忘记密码？</a>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from '@/utils/axios'

export default {
  name: 'UserLogin',
  data () {
    return {
      loginForm: {
        username: '',
        password: '',
        role: 'student'
      },
      roleOptions: [
        { value: 'admin', label: '管理员' },
        { value: 'teacher', label: '教师' },
        { value: 'student', label: '学生' }
      ]
    }
  },
  methods: {
    resetForm () {
      // 只重置密码
      this.loginForm.password = ''
    },
    async handleLogin () {
      try {
        if (!this.loginForm.username || !this.loginForm.password) {
          this.$message.error('请输入用户名和密码')
          return
        }

        console.log('登录表单数据:', this.loginForm)
        const response = await axios.post('/auth/login', this.loginForm)
        console.log('登录响应:', response.data)
        const { token, user } = response.data

        // 存储token和用户信息
        localStorage.setItem('token', token)
        localStorage.setItem('userRole', user.role)
        localStorage.setItem('userName', user.name)
        console.log('存储的token:', localStorage.getItem('token'))

        this.$message.success('登录成功')

        // 根据角色跳转到不同页面
        switch (user.role) {
          case 'admin':
            this.$router.push('/admin')
            break
          case 'teacher':
            this.$router.push('/teacher/courses')
            break
          case 'student':
            this.$router.push('/student')
            break
          default:
            this.$router.push('/login')
        }
      } catch (error) {
        console.error('登录错误:', error.response?.data || error)
        this.$message.error(error.response?.data?.message || '登录失败')
        this.resetForm()
      }
    }
  }
}
</script>

<style scoped>
.login-left {
  flex: 1;
  background: #f0f9eb;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  position: relative;
}

.image-container {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.login-left img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.role-select {
  display: flex;
  justify-content: space-between;
  margin: 25px 0;
  padding: 0 20px;
}

.role-item {
  display: flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
  color: #fff;
  font-size: 20px;
}

.role-item input[type="radio"] {
  margin-right: 8px;
}

.role-item span {
  color: #606266;
}

.login-btn {
  width: 100%;
  padding: 12px;
  background:#2c42cf;
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  font-size: 20px;
  cursor: pointer;
  transition: all 0.3s;
}

.login-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.4);
}

.bottom-links {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
  padding: 0 10px;
}

.link {
  color: rgba(255, 255, 255, 0.8);
  font-size: 16px;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.3s;
}

.link:hover {
  color: #fff;
  text-decoration: underline;
}
</style>
