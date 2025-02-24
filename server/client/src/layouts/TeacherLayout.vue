<template>
  <el-container class="teacher-layout">
    <el-aside width="200px" class="sidebar">
      <div class="logo">在线课程评价系统</div>
      <el-menu
        :default-active="$route.path"
        router
        class="sidebar-menu"
        background-color="#001529"
        text-color="#ffffff"
        active-text-color="#409EFF"
      >
        <el-menu-item index="/teacher/courses">
          <i class="el-icon-reading"></i>
          <span>我的课程</span>
        </el-menu-item>
        <el-menu-item index="/teacher/evaluations">
          <i class="el-icon-document"></i>
          <span>学生评价</span>
        </el-menu-item>
        <el-menu-item index="/teacher/profile">
          <i class="el-icon-user"></i>
          <span>我的主页</span>
        </el-menu-item>
        <el-menu-item index="/teacher/notifications">
          <i class="el-icon-bell"></i>
          <span>评价通知</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header class="header">
        <div class="header-right">
          <span class="username">{{ userName }}</span>
          <el-dropdown @command="handleCommand">
            <span class="el-dropdown-link">
              <i class="el-icon-setting"></i>
            </span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item command="logout">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div>
      </el-header>
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  name: 'TeacherLayout',
  data () {
    return {
      userName: localStorage.getItem('userName') || ''
    }
  },
  computed: {
    activeMenu () {
      return this.$route.path
    }
  },
  methods: {
    handleCommand (command) {
      if (command === 'logout') {
        localStorage.clear()
        this.$router.push('/login')
      }
    }
  }
}
</script>

<style scoped>
.teacher-layout {
  height: 100vh;
}

.sidebar {
  background-color: #001529;
  height: 100%;
  overflow-x: hidden;
}

.logo {
  height: 60px;
  line-height: 60px;
  text-align: center;
  font-size: 16px;
  font-weight: bold;
  color: #ffffff;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.sidebar-menu {
  border-right: none;
}

.header {
  background-color: #ffffff;
  border-bottom: 1px solid #e6e6e6;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0 20px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 15px;
}

.username {
  font-size: 14px;
  color: #606266;
}

.el-dropdown-link {
  cursor: pointer;
  font-size: 20px;
  color: #606266;
}

.el-dropdown-link:hover {
  color: #409EFF;
}

.el-menu-item {
  font-size: 14px;
}

.el-menu-item i {
  color: #ffffff;
  margin-right: 5px;
  width: 24px;
  text-align: center;
}

/* 激活菜单项的样式 - 增加优先级 */
.el-menu-item.is-active {
  background-color: #1890ff !important;
}

/* 确保激活状态的样式优先级高于hover状态 */
.sidebar-menu .el-menu-item.is-active:hover {
  background-color: #1890ff !important;
}

/* 移除鼠标悬停时的背景色变化 */
:deep(.el-menu-item:not(.is-active):hover) {
  background-color: transparent !important;
}

.el-menu-item.is-active i,
.el-menu-item.is-active span {
  color: #ffffff !important;
}
</style>
