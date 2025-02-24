<template>
  <div class="dashboard-container">
    <!-- 左侧日历 -->
    <div class="left-section">
      <el-card class="calendar-card">
        <div class="calendar-header">
          <span class="month-text">{{ currentMonth }}</span>
          <div class="calendar-controls">
            <el-button type="text" icon="el-icon-arrow-left" @click="changeMonth(-1)"></el-button>
            <el-button type="text" icon="el-icon-arrow-right" @click="changeMonth(1)"></el-button>
          </div>
        </div>
        <el-calendar v-model="currentDate">
          <!-- 自定义日历单元格 -->
          <template slot="dateCell" slot-scope="{data}">
            <div class="calendar-day" :class="{ 'is-today': isToday(data.day) }">
              {{ data.day.split('-').slice(-1)[0] }}
            </div>
          </template>
        </el-calendar>
      </el-card>
    </div>

    <!-- 右侧个人信息 -->
    <div class="right-section">
      <el-card class="user-info-card">
        <div class="user-profile">
          <div class="avatar-section">
            <el-avatar :size="120" icon="el-icon-user-solid"></el-avatar>
          </div>
          <div class="user-details">
            <h2 class="greeting">{{ greeting }}，{{ userInfo.name }}!</h2>
            <div class="info-list">
              <div class="info-item">
                <i class="el-icon-user"></i>
                <span>学号：{{ userInfo.student_id }}</span>
              </div>
              <div class="info-item">
                <i class="el-icon-office-building"></i>
                <span>院系：{{ userInfo.department }}</span>
              </div>
              <div class="info-item">
                <i class="el-icon-location"></i>
                <span>班级：{{ userInfo.class }}</span>
              </div>
              <div class="info-item">
                <i class="el-icon-message"></i>
                <span>邮箱：{{ userInfo.email || '未设置' }}</span>
              </div>
              <div class="info-item">
                <i class="el-icon-phone"></i>
                <span>电话：{{ userInfo.phone || '未设置' }}</span>
              </div>
            </div>
            <el-button type="primary" size="medium" @click="showEditDialog" class="edit-btn">
              修改信息
            </el-button>
          </div>
        </div>
      </el-card>

      <!-- 添加修改密码区域 -->
      <el-card class="password-card">
        <div class="card-title">修改密码</div>
        <el-form :model="passwordForm" :rules="passwordRules" ref="passwordForm" label-width="100px">
          <el-form-item label="原密码" prop="oldPassword">
            <el-input type="password" v-model="passwordForm.oldPassword"></el-input>
          </el-form-item>
          <el-form-item label="新密码" prop="newPassword">
            <el-input type="password" v-model="passwordForm.newPassword"></el-input>
          </el-form-item>
          <el-form-item label="确认密码" prop="confirmPassword">
            <el-input type="password" v-model="passwordForm.confirmPassword"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="changePassword">修改密码</el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>

    <!-- 添加修改信息对话框 -->
    <el-dialog title="修改个人信息" :visible.sync="editDialogVisible" width="500px">
      <el-form :model="editForm" :rules="editRules" ref="editForm" label-width="80px">
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="editForm.phone"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="updateUserInfo">确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import axios from '@/utils/axios'
import dayjs from 'dayjs'

export default {
  name: 'StudentDashboard',
  data () {
    return {
      currentDate: new Date(),
      userInfo: {
        name: '',
        student_id: '',
        department: '',
        class: '',
        email: '',
        phone: ''
      },
      passwordForm: {
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      },
      passwordRules: {
        oldPassword: [{ required: true, message: '请输入原密码', trigger: 'blur' }],
        newPassword: [{ required: true, message: '请输入新密码', trigger: 'blur' }],
        confirmPassword: [{ required: true, message: '请确认新密码', trigger: 'blur' }]
      },
      editDialogVisible: false,
      editForm: {
        email: '',
        phone: ''
      },
      editRules: {
        email: [
          { required: true, message: '请输入邮箱地址', trigger: 'blur' },
          { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
        ],
        phone: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    currentMonth () {
      return dayjs(this.currentDate).format('YYYY-MM')
    },
    greeting () {
      const hour = new Date().getHours()
      if (hour < 12) {
        return '上午好'
      } else if (hour < 18) {
        return '下午好'
      } else {
        return '晚上好'
      }
    }
  },
  methods: {
    async fetchUserInfo () {
      try {
        const response = await axios.get('/student/info')
        this.userInfo = response.data
      } catch (error) {
        this.$message.error('获取个人信息失败')
      }
    },
    changeMonth (delta) {
      const newDate = dayjs(this.currentDate).add(delta, 'month')
      this.currentDate = newDate.toDate()
    },
    isToday (day) {
      return dayjs(day).format('YYYY-MM-DD') === dayjs().format('YYYY-MM-DD')
    },
    async changePassword () {
      try {
        await this.$refs.passwordForm.validate()
        if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
          return this.$message.error('两次输入的密码不一致')
        }
        await axios.put('/student/password', {
          oldPassword: this.passwordForm.oldPassword,
          newPassword: this.passwordForm.newPassword
        })
        this.$message.success('密码修改成功')
        this.$refs.passwordForm.resetFields()
      } catch (error) {
        this.$message.error('修改密码失败')
      }
    },
    showEditDialog () {
      this.editForm.email = this.userInfo.email
      this.editForm.phone = this.userInfo.phone
      this.editDialogVisible = true
    },
    async updateUserInfo () {
      try {
        await this.$refs.editForm.validate()
        await axios.put('/student/info', {
          email: this.editForm.email,
          phone: this.editForm.phone
        })
        this.$message.success('个人信息更新成功')
        this.editDialogVisible = false
        await this.fetchUserInfo()
      } catch (error) {
        if (error.response && error.response.data && error.response.data.message) {
          this.$message.error(error.response.data.message)
        } else {
          this.$message.error('更新个人信息失败')
        }
      }
    }
  },
  created () {
    this.fetchUserInfo()
  }
}
</script>

<style scoped>
.dashboard-container {
  padding: 20px;
  display: flex;
  gap: 20px;
  min-height: calc(100vh - 120px);
}

.left-section {
  flex: 1;
}

.right-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.calendar-card {
  height: 100%;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.month-text {
  font-size: 18px;
  font-weight: bold;
  color: #303133;
}

.calendar-controls {
  display: flex;
  gap: 10px;
}

.calendar-day {
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-info-card {
  height: auto;
  margin-bottom: 20px;
}

.user-profile {
  display: flex;
  gap: 20px;
  align-items: center;
}

.avatar-section {
  flex-shrink: 0;
  background-color: #f0f2f5;
  border-radius: 50%;
  padding: 10px;
}

.user-details {
  flex: 1;
}

.username {
  margin: 0 0 10px 0;
  font-size: 24px;
  color: #303133;
}

.greeting {
  margin: 0 0 30px 0;
  font-size: 24px;
  color: #409EFF;
}

.info-list {
  margin-bottom: 10px;
}

.info-item {
  font-size: 16px;
  margin-bottom: 15px;
}

.info-item i {
  font-size: 20px;
}

:deep(.el-calendar) {
  background: none;
}

:deep(.el-calendar__header) {
  display: none;
}

:deep(.el-calendar-table) {
  border: 1px solid #EBEEF5;
}

:deep(.el-calendar-day) {
  height: 80px;
  padding: 8px;
  text-align: center;
  font-size: 16px;
}

:deep(.current) {
  background-color: #ecf5ff;
  color: #409EFF;
}

.calendar-day.is-today {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #2c42cf;
  color: #ffffff;
}

.password-card {
  flex: 1;
  margin-top: 0;
}

.card-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 20px;
  color: #303133;
}

.edit-btn {
  margin-top: 20px;
}
</style>
