<template>
  <div class="user-management">
    <!-- 顶部操作区 -->
    <div class="header-actions">
      <div class="left">
        <el-button type="primary" @click="handleAdd">创建用户</el-button>
        <el-button
          type="warning"
          @click="handleBatchReset"
          :disabled="!selectedUsers.length"
        >批量重置密码</el-button>
        <el-button
          type="danger"
          @click="handleBatchDelete"
          :disabled="!selectedUsers.length"
        >批量删除</el-button>
      </div>
      <div class="right">
        <el-select v-model="filterRole" placeholder="角色筛选" clearable>
          <el-option label="学生" value="student" />
          <el-option label="教师" value="teacher" />
        </el-select>
        <el-select v-model="filterStatus" placeholder="状态筛选" clearable>
          <el-option label="启用" :value="true" />
          <el-option label="禁用" :value="false" />
        </el-select>
        <el-input
          v-model="searchQuery"
          placeholder="搜索用户名/姓名"
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
      <el-table-column prop="email" label="邮箱" min-width="200" show-overflow-tooltip />
      <el-table-column prop="role" label="角色" width="100">
        <template slot-scope="scope">
          {{ scope.row.role === 'student' ? '学生' : '教师' }}
        </template>
      </el-table-column>
      <el-table-column prop="department" label="院系" width="120" />
      <el-table-column label="其他信息" width="120">
        <template slot-scope="scope">
          {{ scope.row.role === 'student' ? scope.row.class_name : scope.row.title }}
        </template>
      </el-table-column>
      <el-table-column prop="active" label="状态" width="180">
        <template slot-scope="scope">
          <div class="switch-wrapper">
            <span class="switch-text">{{ scope.row.active ? '启用' : '禁用' }}</span>
            <el-switch
              v-model="scope.row.active"
              @change="(val) => handleStatusChange(scope.row.id, val, scope.row.role)"
              :active-value="true"
              :inactive-value="false"
            />
          </div>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="250" fixed="right">
        <template slot-scope="scope">
          <el-button
            size="mini"
            @click="handleEdit(scope.row)"
          >编辑</el-button>
          <el-button
            size="mini"
            type="warning"
            @click="handleResetPassword(scope.row)"
          >重置密码</el-button>
          <el-button
            size="mini"
            type="danger"
            @click="handleDelete(scope.row)"
          >删除</el-button>
        </template>
      </el-table-column>
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
        <el-form-item v-if="userForm.role === 'student'" label="班级" prop="class_name">
          <el-input v-model="userForm.class_name" />
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
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="userForm.email" />
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
            v-else
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
        email: '',
        role: 'student',
        department: '',
        class_name: '',
        title: '',
        studentId: '',
        password: ''
      }
    }
  },
  computed: {
    rules () {
      const rules = {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, message: '用户名至少3个字符', trigger: 'blur' }
        ],
        name: [
          { required: true, message: '请输入姓名', trigger: 'blur' }
        ],
        email: [
          { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
        ],
        role: [
          { required: true, message: '请选择角色', trigger: 'change' }
        ],
        department: [
          { required: true, message: '请输入院系', trigger: 'blur' }
        ],
        class_name: [
          { required: true, message: '请输入班级', trigger: 'blur' }
        ]
      }

      // 只在创建用户时添加密码和学号/工号验证
      if (!this.userForm.id) {
        rules.password = [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, message: '密码至少6个字符', trigger: 'blur' }
        ]
        rules.studentId = [
          {
            required: true,
            message: this.userForm.role === 'student' ? '请输入学号' : '请输入工号',
            trigger: 'blur'
          }
        ]
      }

      return rules
    },
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
        this.users = response.data
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
        title: ''
      }
      this.dialogVisible = true
      if (this.$refs.userForm) {
        this.$refs.userForm.resetFields()
      }
    },
    handleEdit (row) {
      this.dialogTitle = '编辑用户'
      this.userForm = { ...row }
      this.dialogVisible = true
    },
    async handleStatusChange (id, status, role) {
      try {
        await axios.put(`/admin/users/${id}/status`, { active: status, role })
        this.$message.success('状态更新成功')
      } catch (error) {
        this.$message.error('状态更新失败')
        // 回滚状态
        const user = this.users.find(u => u.id === id)
        if (user) {
          user.active = !status
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
        if (this.userForm.id) {
          // 编辑用户时，根据角色处理字段
          const userData = {
            role: this.userForm.role,
            name: this.userForm.name,
            email: this.userForm.email,
            department: this.userForm.department
          }

          // 根据角色添加特定字段
          if (this.userForm.role === 'student') {
            userData.class = this.userForm.class_name
          } else {
            userData.title = this.userForm.title
          }

          await axios.put(`/admin/users/${this.userForm.id}`, userData)
          this.$message.success('更新成功')
        } else {
          await axios.post('/admin/users', this.userForm)
          this.$message.success('创建成功')
        }
        this.dialogVisible = false
        this.fetchUsers()
      } catch (error) {
        if (error.errorFields) {
          // 表单验证错误
          return
        }
        this.$message.error('操作失败')
      }
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
  gap: 10px;
}

.search-input {
  width: 200px;
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
</style>
