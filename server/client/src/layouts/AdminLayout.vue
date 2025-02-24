<template>
  <el-container class="admin-layout">
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
        <el-menu-item index="/admin">
          <i class="el-icon-s-home"></i>
          <span>首页</span>
        </el-menu-item>
        <el-menu-item index="/admin/courses">
          <i class="el-icon-reading"></i>
          <span>课程管理</span>
        </el-menu-item>
        <el-menu-item index="/admin/evaluations">
          <i class="el-icon-time"></i>
          <span>评价时间设置</span>
        </el-menu-item>
        <el-menu-item index="/admin/users">
          <i class="el-icon-user"></i>
          <span>用户管理</span>
        </el-menu-item>
        <el-menu-item index="/admin/reviews">
          <i class="el-icon-edit"></i>
          <span>评价管理</span>
        </el-menu-item>
        <el-submenu index="notifications">
          <template slot="title">
            <i class="el-icon-message"></i>
            <span>通知管理</span>
          </template>
          <el-menu-item index="/admin/notifications/send">
            <i class="el-icon-s-promotion"></i>
            <span>发送通知</span>
          </el-menu-item>
          <el-menu-item index="/admin/notifications/list">
            <i class="el-icon-document"></i>
            <span>通知列表</span>
          </el-menu-item>
        </el-submenu>
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
  name: 'AdminLayout',
  data () {
    return {
      userName: localStorage.getItem('userName') || '管理员'
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
.admin-layout {
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
  gap: 20px;
}

.username {
  font-size: 14px;
  color: #666;
}

.el-dropdown-link {
  cursor: pointer;
  color: #666;
}

.el-dropdown-link:hover {
  color: #409EFF;
}

.el-main {
  background-color: #f0f2f5;
  padding: 20px;
}
</style>
