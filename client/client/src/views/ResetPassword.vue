<template>
  <div class="auth-container">
    <div class="auth-box">
      <!-- 左侧图片区域 -->
      <div class="login-left">
        <div class="image-container">
          <img src="@/assets/login-illustration.png" alt="reset-password">
        </div>
      </div>

      <!-- 右侧表单 -->
      <div class="auth-form">
        <div class="header">
          <h2>在线课程评教系统</h2>
          <span class="sub-title">重置密码</span>
        </div>

        <!-- 新密码输入 -->
        <div class="form-item">
          <input
            type="password"
            v-model="newPassword"
            placeholder="请输入新密码"
          >
        </div>

        <!-- 确认密码 -->
        <div class="form-item">
          <input
            type="password"
            v-model="confirmPassword"
            placeholder="请确认新密码"
          >
        </div>

        <button class="submit-btn" @click="resetPassword">确认修改</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ResetPassword',
  data () {
    return {
      newPassword: '',
      confirmPassword: ''
    }
  },
  methods: {
    async resetPassword () {
      if (!this.newPassword || !this.confirmPassword) {
        alert('请填写完整信息')
        return
      }

      if (this.newPassword !== this.confirmPassword) {
        alert('两次输入的密码不一致')
        return
      }

      try {
        // TODO: 调用后端重置密码接口
        // await this.$api.resetPassword({
        //   phone: this.$route.params.phone,
        //   newPassword: this.newPassword
        // })

        alert('密码重置成功')
        this.$router.push('/login')
      } catch (error) {
        console.error('重置密码失败:', error)
        alert('重置密码失败，请稍后重试')
      }
    }
  }
}
</script>

<style scoped>
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 40px;
}

.sub-title {
  color: #fff;
  font-size: 20px;
}

.submit-btn {
  width: 100%;
  padding: 12px;
  background: #2c42cf;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 20px;
  cursor: pointer;
  margin-top: 20px;
  transition: all 0.3s;
}

.submit-btn:hover {
  opacity: 0.9;
}

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
</style>
