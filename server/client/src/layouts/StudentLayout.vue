<template>
  <el-container class="student-layout">
    <!-- 顶部导航栏 -->
    <el-header class="header">
      <div class="header-left">
        <div class="logo-container">
          <img src="@/assets/图标.png" alt="logo" class="logo">
        </div>
        <span class="title">课程评价系统</span>
      </div>
      <el-menu
        :default-active="$route.path"
        mode="horizontal"
        router
        class="nav-menu"
        background-color="transparent"
        text-color="#333"
        active-text-color="#409EFF"
      >
        <el-menu-item index="/student">
          <i class="el-icon-edit-outline"></i>
          <span>学生评价</span>
        </el-menu-item>
        <el-menu-item index="/student/information">
          <i class="el-icon-user"></i>
          <span>个人中心</span>
        </el-menu-item>
        <el-menu-item index="/student/notifications">
          <i class="el-icon-bell"></i>
          <span>我的通知</span>
        </el-menu-item>
      </el-menu>
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

    <!-- 主要内容区域 -->
    <el-main>
      <!-- 首页才显示轮播图 -->
      <div v-if="$route.path === '/student'" class="carousel-container">
        <el-carousel height="400px">
          <el-carousel-item v-for="item in carouselItems" :key="item.id">
            <img :src="item.image" :alt="item.title" class="carousel-image">
          </el-carousel-item>
        </el-carousel>
      </div>
      <router-view></router-view>
    </el-main>
  </el-container>
</template>

<script>
export default {
  name: 'StudentLayout',
  data () {
    return {
      userName: localStorage.getItem('userName') || '同学',
      carouselItems: [
        {
          id: 1,
          image: require('@/assets/carousel/操场.png'),
          title: '校园风光'
        },
        {
          id: 2,
          image: require('@/assets/carousel/教学楼.png'),
          title: '教学楼'
        },
        {
          id: 3,
          image: require('@/assets/carousel/图片3.png'),
          title: '图书馆'
        }
      ]
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
.student-layout {
  min-height: 100vh;
  background-color: #f0f2f5;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: rgba(255, 255, 255, 0.95);
  padding: 0 20px;
  height: 60px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(5px);
}

.header-left {
  display: flex;
  align-items: center;
}

.logo-container {
  width: 40px;
  height: 40px;
  background-color: white;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.logo {
  height: 32px;
  width: 32px;
  object-fit: contain;
}

.title {
  color: #333;
  font-size: 20px;
  font-weight: bold;
}

.nav-menu {
  border: none;
  margin-left: 50px;
  background-color: transparent;
}

.header-right {
  display: flex;
  align-items: center;
  color: #333;
}

.username {
  margin-right: 15px;
  color: #333;
}

.el-dropdown-link {
  color: #333;
  cursor: pointer;
  font-size: 20px;
}

.el-dropdown-link:hover {
  color: #409EFF;
}

/* 导航菜单项样式 */
.el-menu-item {
  font-size: 16px;
  padding: 0 25px;
  color: #333;
}

.el-menu-item i {
  margin-right: 5px;
  font-size: 18px;
  color: #333;
}

/* 激活菜单项的样式 */
.el-menu-item.is-active {
  background-color: rgba(64, 158, 255, 0.1) !important;
  color: #409EFF !important;
}

.el-menu-item.is-active i {
  color: #409EFF !important;
}

/* 鼠标悬停效果 */
.el-menu-item:hover {
  background-color: rgba(64, 158, 255, 0.05) !important;
}

/* 轮播图容器样式调整 */
.carousel-container {
  margin: -20px -20px 20px -20px;
}

.carousel-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.el-main {
  padding: 20px;
}
</style>
