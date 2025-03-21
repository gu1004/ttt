<template>
  <div class="user-management">
    <!-- 顶部操作区 -->
    <div class="header-actions">
      <div class="left">
        <el-button type="primary" @click="handleAdd" class="action-button">创建用户</el-button>
        <el-button
          type="warning"
          @click="handleBatchReset"
          :disabled="!selectedUsers.length"
          class="action-button"
        >批量重置密码</el-button>
        <el-button
          type="danger"
          @click="handleBatchDelete"
          :disabled="!selectedUsers.length"
          class="action-button"
        >批量删除</el-button>
      </div>
      <div class="right">
        <el-select v-model="filterRole" placeholder="角色筛选" clearable class="filter-select">
          <el-option label="学生" value="student" />
          <el-option label="教师" value="teacher" />
        </el-select>
        <el-select v-model="filterStatus" placeholder="状态筛选" clearable class="filter-select">
          <el-option label="启用" :value="true" />
          <el-option label="禁用" :value="false" />
        </el-select>
        <el-input
          v-model="searchQuery"
          placeholder="搜索用户"
          prefix-icon="el-icon-search"
          class="search-input"
        />
      </div>
    </div>

    <!-- 用户列表 -->
    <el-table
      :data="paginatedUsers"
      @selection-change="handleSelectionChange"
      v-loading="loading"
      :cell-style="{ padding: '8px 0' }"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column label="序号" width="80">
        <template slot-scope="scope">
          {{ (currentPage - 1) * 10 + scope.$index + 1 }}
        </template>
      </el-table-column>
      <el-table-column prop="username" label="用户名" width="120" />
      <el-table-column prop="name" label="姓名" width="100" />
      <el-table-column prop="role" label="角色" width="100">
        <template slot-scope="scope">
          {{ scope.row.role === 'student' ? '学生' : '教师' }}
        </template>
      </el-table-column>
      <el-table-column prop="department" label="院系" width="120" />
      <el-table-column label="其他信息" width="120">
        <template slot-scope="scope">
          <span v-if="scope.row.role === 'student'">
            {{ scope.row.class_name || '未设置' }}
          </span>
          <span v-else>
            {{ scope.row.title || '未设置' }}
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="active" label="状态" width="100" align="center">
        <template slot-scope="scope">
          <el-tooltip :content="scope.row.active ? '点击禁用' : '点击启用'" placement="top">
            <i
              :class="[
                'el-icon-' + (scope.row.active ? 'unlock' : 'lock'),
                'status-icon',
                scope.row.active ? 'active' : 'inactive'
              ]"
              @click="toggleUserStatus(scope.row)"
            ></i>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="270" fixed="right">
        <template slot-scope="scope">
          <el-button
            size="mini"
            class="el-icon-edit"
            @click="handleEdit(scope.row)"
          >编辑</el-button>
          <el-button
            size="mini"
            class="el-icon-refresh"
            type="warning"
            @click="handleResetPassword(scope.row)"
          >重置密码</el-button>
          <el-button
            size="mini"
            class="el-icon-delete"
            type="danger"
            @click="handleDelete(scope.row)"
          >删除</el-button>
        </template>
      </el-table-column>
      <template slot-scope="scope" slot="append">
        <div :data-user-id="scope.row.id"></div>
      </template>
    </el-table>

    <!-- 分页器 -->
    <div class="pagination-container">
      <el-pagination
        @current-change="handleCurrentChange"
        :current-page="currentPage"
        :page-size="10"
        layout="total, prev, pager, next"
        :total="filteredUsers.length"
        background
      >
      </el-pagination>
    </div>

    <!-- 创建/编辑用户对话框 -->
    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible">
      <!-- 创建用户的表单 -->
      <el-form v-if="!userForm.id" :model="userForm" :rules="rules" ref="userForm" label-width="100px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="userForm.username" />
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input v-model="userForm.name" />
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="userForm.role" placeholder="选择角色">
            <el-option label="学生" value="student" />
            <el-option label="教师" value="teacher" />
          </el-select>
        </el-form-item>
        <el-form-item :label="userForm.role === 'student' ? '学号' : '工号'" prop="studentId">
          <el-input v-model="userForm.studentId" />
        </el-form-item>
        <el-form-item label="院系" prop="department">
          <el-input v-model="userForm.department" />
        </el-form-item>
        <el-form-item
          :label="userForm.role === 'student' ? '班级' : '职称'"
          :prop="userForm.role === 'student' ? 'class_name' : 'title'"
        >
          <el-input
            v-if="userForm.role === 'student'"
            v-model="userForm.class_name"
          />
          <el-input
            v-else-if="userForm.role === 'teacher'"
            v-model="userForm.title"
          />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input type="password" v-model="userForm.password" />
        </el-form-item>
      </el-form>

      <!-- 编辑用户的表单 -->
      <el-form v-else :model="userForm" :rules="rules" ref="userForm" label-width="100px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="userForm.username" :disabled="!!userForm.id" />
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input v-model="userForm.name" />
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="userForm.role" placeholder="选择角色" :disabled="!!userForm.id">
            <el-option label="学生" value="student" />
            <el-option label="教师" value="teacher" />
          </el-select>
        </el-form-item>
        <el-form-item label="院系" prop="department">
          <el-input v-model="userForm.department" />
        </el-form-item>
        <el-form-item
          :label="userForm.role === 'student' ? '班级' : '职称'"
          :prop="userForm.role === 'student' ? 'class_name' : 'title'"
        >
          <el-input
            v-if="userForm.role === 'student'"
            v-model="userForm.class_name"
          />
          <el-input
            v-else-if="userForm.role === 'teacher'"
            v-model="userForm.title"
          />
        </el-form-item>
        <el-form-item label="密码" prop="password" v-if="!userForm.id">
          <el-input type="password" v-model="userForm.password" />
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import axios from '@/utils/axios'
import { Message } from 'element-ui'

export default {
  name: 'UserManagement',
  data () {
    return {
      searchQuery: '',
      filterRole: '',
      filterStatus: '',
      users: [],
      selectedUsers: [],
      loading: false,
      dialogVisible: false,
      dialogTitle: '创建用户',
      currentPage: 1,
      userForm: {
        username: '',
        name: '',
        role: 'student',
        studentId: '',
        department: '',
        class_name: '',
        title: '',
        password: '',
        active: true
      },
      rules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' }
        ],
        name: [
          { required: true, message: '请输入姓名', trigger: 'blur' }
        ],
        role: [
          { required: true, message: '请选择角色', trigger: 'change' }
        ],
        studentId: [
          { required: true, message: '请输入学号/工号', trigger: 'blur' }
        ],
        department: [
          { required: true, message: '请输入院系', trigger: 'blur' }
        ],
        class_name: [
          {
            required: true,
            message: '请输入班级',
            trigger: 'blur',
            validator: (rule, value, callback) => {
              if (this.userForm.role === 'student' && !value) {
                callback(new Error('请输入班级'))
              } else {
                callback()
              }
            }
          }
        ],
        title: [
          {
            required: true,
            message: '请输入职称',
            trigger: 'blur',
            validator: (rule, value, callback) => {
              if (this.userForm.role === 'teacher' && !value) {
                callback(new Error('请输入职称'))
              } else {
                callback()
              }
            }
          }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' }
        ]
      },
      statusMap: {
        true: '启用',
        false: '禁用'
      }
    }
  },
  computed: {
    filteredUsers () {
      let result = this.users

      // 角色筛选
      if (this.filterRole) {
        result = result.filter(user => user.role === this.filterRole)
      }

      // 状态筛选
      if (this.filterStatus !== '') {
        result = result.filter(user => user.active === this.filterStatus)
      }

      // 搜索过滤
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase()
        result = result.filter(user =>
          user.username.toLowerCase().includes(query) ||
          user.name.toLowerCase().includes(query)
        )
      }

      return result
    },
    paginatedUsers () {
      const start = (this.currentPage - 1) * 10
      const end = start + 10
      return this.filteredUsers.slice(start, end)
    }
  },
  created () {
    this.fetchUsers()
  },
  methods: {
    async fetchUsers () {
      try {
        this.loading = true
        const response = await axios.get('/admin/users')
        console.log('获取到的用户数据:', response.data)
        this.users = response.data.map(user => ({
          ...user,
          active: Boolean(user.active)
        }))
      } catch (error) {
        this.$message.error('获取用户列表失败')
      } finally {
        this.loading = false
      }
    },
    handleSelectionChange (val) {
      this.selectedUsers = val
    },
    handleCurrentChange (val) {
      this.currentPage = val
    },
    handleAdd () {
      this.dialogTitle = '创建用户'
      this.userForm = {
        username: '',
        name: '',
        role: 'student',
        studentId: '',
        password: '',
        department: '',
        class_name: '',
        title: '',
        active: true
      }
      this.dialogVisible = true
      if (this.$refs.userForm) {
        this.$refs.userForm.resetFields()
      }
    },
    handleEdit (row) {
      this.dialogTitle = '编辑用户'
      this.userForm = {
        id: row.id,
        username: row.username,
        name: row.name,
        role: row.role,
        department: row.department,
        studentId: row.role === 'student' ? row.student_id : row.teacher_id,
        class_name: row.class_name || '',
        title: row.title || '',
        active: row.active
      }
      this.dialogVisible = true
    },
    async toggleUserStatus (row) {
      const newStatus = !row.active
      const icon = document.querySelector(`[data-user-id="${row.id}"] .status-icon`)

      try {
        // 添加旋转动画类
        if (icon) icon.classList.add('rotating')

        // 修改 API 路径，添加用户角色信息
        await axios.put(`/admin/users/${row.id}/toggle-status`, {
          active: newStatus,
          role: row.role
        })

        // 更新本地状态
        this.$set(row, 'active', newStatus)

        Message({
          type: 'success',
          message: `已${newStatus ? '启用' : '禁用'}该用户`,
          duration: 2000
        })
      } catch (error) {
        console.error('状态更新失败:', error)
        Message.error('状态更新失败')
        // 恢复原状态
        this.$set(row, 'active', !newStatus)
      } finally {
        // 动画结束后移除类
        if (icon) {
          setTimeout(() => {
            icon.classList.remove('rotating')
          }, 1000)
        }
      }
    },
    async handleResetPassword (user) {
      try {
        await this.$msgbox({
          title: '重置密码确认',
          message: '是否确认重置此用户的密码？',
          showCancelButton: true,
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
          beforeClose: async (action, instance, done) => {
            if (action === 'confirm') {
              instance.confirmButtonLoading = true
              try {
                await axios.put(`/admin/users/${user.id}/reset-password`, { role: user.role })
                this.$message.success('密码重置成功')
                done()
              } catch (error) {
                this.$message.error('密码重置失败')
              } finally {
                instance.confirmButtonLoading = false
              }
            } else {
              done()
            }
          }
        })
      } catch (error) {
        // 用户取消时不显示错误
      }
    },
    async handleBatchReset () {
      try {
        await this.$msgbox({
          title: '批量重置确认',
          message: '是否确认重置选中用户的密码？',
          showCancelButton: true,
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
          beforeClose: async (action, instance, done) => {
            if (action === 'confirm') {
              instance.confirmButtonLoading = true
              try {
                const userIds = this.selectedUsers.map(user => user.id)
                const roles = this.selectedUsers.map(user => user.role)
                await axios.put('/admin/users/batch-reset-password', { userIds, roles })
                this.$message.success('批量重置密码成功')
                done()
              } catch (error) {
                this.$message.error('批量重置密码失败')
              } finally {
                instance.confirmButtonLoading = false
              }
            } else {
              done()
            }
          }
        })
      } catch (error) {
        // 用户取消时不显示错误
      }
    },
    async handleDelete (user) {
      try {
        await this.$msgbox({
          title: '删除确认',
          message: '是否确认删除此用户？',
          showCancelButton: true,
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
          beforeClose: async (action, instance, done) => {
            if (action === 'confirm') {
              instance.confirmButtonLoading = true
              try {
                await axios.delete(`/admin/users/${user.id}?role=${user.role}`)
                this.$message.success('删除成功')
                this.fetchUsers()
                done()
              } catch (error) {
                this.$message.error('删除失败')
              } finally {
                instance.confirmButtonLoading = false
              }
            } else {
              done()
            }
          }
        })
      } catch (error) {
        // 用户取消时不显示错误
      }
    },
    async handleBatchDelete () {
      try {
        await this.$msgbox({
          title: '批量删除确认',
          message: '是否确认删除选中的用户？',
          showCancelButton: true,
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
          beforeClose: async (action, instance, done) => {
            if (action === 'confirm') {
              instance.confirmButtonLoading = true
              try {
                const userIds = this.selectedUsers.map(user => user.id)
                const roles = this.selectedUsers.map(user => user.role)
                await axios.delete('/admin/users/batch-delete', { data: { userIds, roles } })
                this.$message.success('批量删除成功')
                this.fetchUsers()
                done()
              } catch (error) {
                this.$message.error('批量删除失败')
              } finally {
                instance.confirmButtonLoading = false
              }
            } else {
              done()
            }
          }
        })
      } catch (error) {
        // 用户取消时不显示错误
      }
    },
    async submitForm () {
      try {
        await this.$refs.userForm.validate()

        const formData = {
          username: this.userForm.username,
          name: this.userForm.name,
          role: this.userForm.role,
          department: this.userForm.department,
          password: this.userForm.password,
          active: this.userForm.active
        }

        // 根据角色添加不同的字段
        if (this.userForm.role === 'student') {
          formData.class_name = this.userForm.class_name
          formData.student_id = this.userForm.studentId
        } else {
          formData.title = this.userForm.title
          formData.teacher_id = this.userForm.studentId
        }

        if (this.userForm.id) {
          // 更新用户
          await axios.put(`/admin/users/${this.userForm.id}`, formData)
          this.$message.success('更新成功')
        } else {
          // 创建用户
          await axios.post('/admin/users', formData)
          this.$message.success('创建成功')
        }

        this.dialogVisible = false
        this.fetchUsers() // 重新获取用户列表
      } catch (error) {
        console.error('表单提交失败:', error)
        this.$message.error(error.response?.data?.message || '操作失败')
      }
    },
    resetForm () {
      this.userForm = {
        username: '',
        name: '',
        role: 'student',
        studentId: '',
        department: '',
        class_name: '',
        title: '',
        password: '',
        active: true
      }
      if (this.$refs.userForm) {
        this.$refs.userForm.resetFields()
      }
    },
    handleRoleChange () {
      if (this.userForm.role === 'student') {
        this.userForm.title = ''
      } else if (this.userForm.role === 'teacher') {
        this.userForm.class_name = ''
      }
      if (this.$refs.userForm) {
        this.$refs.userForm.clearValidate()
      }
    },
    async batchUpdateStatus (ids, active) {
      try {
        // 添加动画效果到所有选中的图标
        ids.forEach(id => {
          const icon = document.querySelector(`[data-user-id="${id}"] .status-icon`)
          if (icon) icon.classList.add('rotating')
        })

        await axios.put('/admin/users/batch-status', {
          ids,
          active
        })

        // 更新本地数据
        ids.forEach(id => {
          const index = this.users.findIndex(u => u.id === id)
          if (index !== -1) {
            this.$set(this.users, index, {
              ...this.users[index],
              active
            })
          }
        })

        this.$message.success('批量更新状态成功')
      } catch (error) {
        this.$message.error('批量更新状态失败')
      } finally {
        // 移除所有动画效果
        setTimeout(() => {
          ids.forEach(id => {
            const icon = document.querySelector(`[data-user-id="${id}"] .status-icon`)
            if (icon) icon.classList.remove('rotating')
          })
        }, 1000)
      }
    }
  },
  watch: {
    'userForm.role': {
      handler (newRole) {
        this.handleRoleChange()
      }
    },
    filterStatus: {
      handler (newVal) {
        this.currentPage = 1
      }
    },
    users: {
      handler (newUsers) {
        console.log('用户数据已更新')
      },
      deep: true
    }
  }
}
</script>

<style scoped>
.user-management {
  padding: 20px;
  background: #fff;
}

.header-actions {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.right {
  display: flex;
  gap: 15px;
  align-items: center;
}

.filter-select {
  width: 100px;
}

.search-input {
  width: 300px;
}

.switch-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
  padding-right: 20px;
}

.el-form-item {
  margin-bottom: 20px;
}

.el-select {
  width: 100%;
}

.el-input.is-disabled .el-input__inner {
  background-color: #f5f7fa;
  border-color: #e4e7ed;
  color: #606266;
  cursor: not-allowed;
}

.status-icon {
  font-size: 20px;
  cursor: pointer;
  transition: all 0.3s;
}

.status-icon.active {
  color: #67C23A;
}

.status-icon.inactive {
  color: #F56C6C;
}

.status-icon:hover {
  transform: scale(1.2);
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.status-icon.rotating {
  animation: rotate 1s linear;
}

.left {
  display: flex;
  gap: 10px;
}

.action-button {
  min-width: 90px;
}
</style>
