<template>
  <div class="teacher-profile">
    <h2>个人主页</h2>
    <el-card class="profile-card">
      <el-form :model="profile" label-width="100px">
        <el-form-item label="姓名">
          <el-input v-model="profile.name" disabled></el-input>
        </el-form-item>
        <el-form-item label="工号">
          <el-input v-model="profile.teacherId" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="profile.email"></el-input>
        </el-form-item>
        <el-form-item label="联系电话">
          <el-input v-model="profile.phone"></el-input>
        </el-form-item>
        <el-form-item label="所属院系">
          <el-input v-model="profile.department" disabled></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="updateProfile">保存修改</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="password-card">
      <div slot="header">
        <span>修改密码</span>
      </div>
      <el-form :model="passwordForm" label-width="100px">
        <el-form-item label="原密码">
          <el-input type="password" v-model="passwordForm.oldPassword"></el-input>
        </el-form-item>
        <el-form-item label="新密码">
          <el-input type="password" v-model="passwordForm.newPassword"></el-input>
        </el-form-item>
        <el-form-item label="确认密码">
          <el-input type="password" v-model="passwordForm.confirmPassword"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="changePassword">修改密码</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import axios from '@/utils/axios'

export default {
  name: 'TeacherProfile',
  data () {
    return {
      profile: {
        name: '',
        teacherId: '',
        email: '',
        phone: '',
        department: ''
      },
      passwordForm: {
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      }
    }
  },
  methods: {
    async fetchProfile () {
      try {
        const response = await axios.get('/teacher/profile')
        this.profile = response.data
      } catch (error) {
        this.$message.error('获取个人信息失败')
      }
    },
    async updateProfile () {
      try {
        await axios.put('/teacher/profile', this.profile)
        this.$message.success('个人信息更新成功')
      } catch (error) {
        this.$message.error('更新个人信息失败')
      }
    },
    async changePassword () {
      if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
        this.$message.error('两次输入的密码不一致')
        return
      }
      try {
        await axios.put('/teacher/password', {
          oldPassword: this.passwordForm.oldPassword,
          newPassword: this.passwordForm.newPassword
        })
        this.$message.success('密码修改成功')
        this.passwordForm = {
          oldPassword: '',
          newPassword: '',
          confirmPassword: ''
        }
      } catch (error) {
        this.$message.error('密码修改失败')
      }
    }
  },
  created () {
    this.fetchProfile()
  }
}
</script>

<style scoped>
.teacher-profile {
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.profile-card,
.password-card {
  margin-bottom: 20px;
  max-width: 600px;
  width: 100%;
}

.password-card {
  margin-top: 30px;
}

h2 {
  text-align: center;
  margin-bottom: 20px;
}
</style>
