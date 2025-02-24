<template>
  <div class="forget-password">
    <div class="form-container">
      <h2>重置密码</h2>

      <el-steps :active="currentStep" finish-status="success" simple style="margin: 20px 0">
        <el-step title="验证身份"></el-step>
        <el-step title="重置密码"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>

      <!-- 步骤1：身份验证 -->
      <el-form v-if="currentStep === 0" :model="emailForm" :rules="emailRules" ref="emailForm" label-width="100px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="emailForm.username" placeholder="请输入用户名"></el-input>
        </el-form-item>
        <el-form-item label="验证码" prop="code">
          <div class="code-input">
            <el-input v-model="emailForm.code" placeholder="请输入验证码"></el-input>
            <el-button
              type="primary"
              :disabled="!!countdown || !emailForm.username"
              @click="sendCode"
            >
              {{ countdown ? `${countdown}秒后重试` : '获取验证码' }}
            </el-button>
          </div>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="verifyCode">下一步</el-button>
          <el-button @click="$router.push('/login')">返回登录</el-button>
        </el-form-item>
      </el-form>

      <!-- 步骤2：重置密码 -->
      <el-form v-if="currentStep === 1" :model="passwordForm" :rules="passwordRules" ref="passwordForm" label-width="100px">
        <el-form-item label="新密码" prop="password">
          <el-input type="password" v-model="passwordForm.password" placeholder="请输入新密码"></el-input>
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input type="password" v-model="passwordForm.confirmPassword" placeholder="请再次输入新密码"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="resetPassword">确认重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 步骤3：完成 -->
      <div v-if="currentStep === 2" class="success-message">
        <i class="el-icon-success"></i>
        <h3>密码重置成功！</h3>
        <el-button type="primary" @click="$router.push('/login')">返回登录</el-button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from '@/utils/axios'

export default {
  name: 'ForgetPassword',
  data () {
    // 验证确认密码
    const validateConfirmPassword = (rule, value, callback) => {
      if (value !== this.passwordForm.password) {
        callback(new Error('两次输入的密码不一致'))
      } else {
        callback()
      }
    }

    return {
      currentStep: 0,
      countdown: 0,
      emailForm: {
        username: '',
        code: ''
      },
      passwordForm: {
        password: '',
        confirmPassword: ''
      },
      emailRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' }
        ],
        code: [
          { required: true, message: '请输入验证码', trigger: 'blur' },
          { len: 6, message: '验证码长度应为6位', trigger: 'blur' }
        ]
      },
      passwordRules: {
        password: [
          { required: true, message: '请输入新密码', trigger: 'blur' },
          { min: 6, message: '密码长度不能小于6位', trigger: 'blur' }
        ],
        confirmPassword: [
          { required: true, message: '请确认密码', trigger: 'blur' },
          { validator: validateConfirmPassword, trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    startCountdown () {
      this.countdown = 60
      const timer = setInterval(() => {
        this.countdown--
        if (this.countdown <= 0) {
          clearInterval(timer)
        }
      }, 1000)
    },
    async sendCode () {
      try {
        await this.$refs.emailForm.validateField('username')
        await axios.post('/auth/send-reset-code', {
          username: this.emailForm.username
        })
        this.$message.success('验证码已发送，请查收邮件')
        this.startCountdown()
      } catch (error) {
        this.$message.error(error.response?.data?.message || '发送验证码失败')
      }
    },
    async verifyCode () {
      try {
        await this.$refs.emailForm.validate()
        await axios.post('/auth/verify-reset-code', {
          username: this.emailForm.username,
          code: this.emailForm.code
        })
        this.currentStep = 1
      } catch (error) {
        this.$message.error(error.response?.data?.message || '验证码验证失败')
      }
    },
    async resetPassword () {
      try {
        await this.$refs.passwordForm.validate()
        await axios.post('/auth/reset-password', {
          username: this.emailForm.username,
          code: this.emailForm.code,
          password: this.passwordForm.password
        })
        this.currentStep = 2
      } catch (error) {
        this.$message.error(error.response?.data?.message || '重置密码失败')
      }
    }
  }
}
</script>

<style scoped>
.forget-password {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f0f2f5;
}

.form-container {
  width: 500px;
  padding: 40px;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

h2 {
  text-align: center;
  margin-bottom: 30px;
  color: #303133;
}

.code-input {
  display: flex;
  gap: 10px;
}

.code-input .el-input {
  flex: 1;
}

.success-message {
  text-align: center;
  padding: 30px 0;
}

.success-message i {
  font-size: 72px;
  color: #67C23A;
  margin-bottom: 20px;
}

.success-message h3 {
  margin-bottom: 20px;
  color: #303133;
}
</style>
