<template>
  <div class="register-container">
    <div class="register-box">
      <h2>用户注册</h2>

      <!-- 注册表单 -->
      <div class="form-group">
        <select v-model="registerForm.role" required>
          <option value="">请选择角色</option>
          <option value="student">学生</option>
          <option value="teacher">教师</option>
        </select>
      </div>

      <div class="form-group">
        <input
          type="text"
          v-model="registerForm.username"
          placeholder="用户名"
          required
        >
      </div>

      <div class="form-group">
        <input
          type="password"
          v-model="registerForm.password"
          placeholder="密码"
          required
        >
      </div>

      <div class="form-group">
        <input
          type="password"
          v-model="registerForm.confirmPassword"
          placeholder="确认密码"
          required
        >
      </div>

      <div class="form-group">
        <input
          type="email"
          v-model="registerForm.email"
          placeholder="邮箱"
          required
        >
      </div>

      <div class="form-group">
        <input
          type="tel"
          v-model="registerForm.phone"
          placeholder="手机号"
          required
        >
      </div>

      <button class="register-btn" @click="handleRegister">注册</button>

      <div class="login-link">
        已有账户？<router-link to="/login">立即登录</router-link>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'UserRegister',
  data () {
    return {
      registerForm: {
        role: '',
        username: '',
        password: '',
        confirmPassword: '',
        email: '',
        phone: ''
      }
    }
  },
  methods: {
    async handleRegister () {
      // 表单验证
      if (this.registerForm.password !== this.registerForm.confirmPassword) {
        alert('两次输入的密码不一致')
        return
      }

      try {
        await this.$http.post('/api/auth/register', this.registerForm)
        alert('注册成功')
        this.$router.push('/login')
      } catch (error) {
        alert('注册失败：' + error.message)
      }
    }
  }
}
</script>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f5f5f5;
}

.register-box {
  width: 400px;
  padding: 40px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

h2 {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
}

.form-group {
  margin-bottom: 20px;
}

input, select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.register-btn {
  width: 100%;
  padding: 12px;
  background-color: #409EFF;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

.register-btn:hover {
  background-color: #66b1ff;
}

.login-link {
  text-align: center;
  margin-top: 20px;
}

.login-link a {
  color: #409EFF;
  text-decoration: none;
}

.login-link a:hover {
  text-decoration: underline;
}
</style>
