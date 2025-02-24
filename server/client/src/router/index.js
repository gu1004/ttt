import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../views/Login.vue'
import TeacherLayout from '../layouts/TeacherLayout.vue'
import TeacherDashboard from '../views/teacher/TeacherDashboard.vue'
import StudentLayout from '../layouts/StudentLayout.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/admin',
    component: () => import('@/layouts/AdminLayout.vue'),
    children: [
      {
        path: '',
        name: 'AdminDashboard',
        component: () => import('@/views/admin/AdminDashboard.vue')
      },
      {
        path: 'users',
        name: 'UserManagement',
        component: () => import('@/views/admin/UserManagement.vue')
      },
      {
        path: 'courses',
        name: 'CourseManagement',
        component: () => import('@/views/admin/CourseManagement.vue')
      },
      {
        path: 'evaluations',
        name: 'EvaluationManagement',
        component: () => import('@/views/admin/EvaluationManagement.vue')
      },
      {
        path: 'reviews',
        name: 'ReviewManagement',
        component: () => import('@/views/admin/ReviewManagement.vue')
      },
      {
        path: 'reviews/delete',
        name: 'ReviewDelete',
        component: () => import('@/views/admin/ReviewDelete.vue')
      },
      {
        path: 'notifications/send',
        name: 'SendNotification',
        component: () => import('@/views/admin/SendNotification.vue')
      },
      {
        path: 'notifications/list',
        name: 'NotificationList',
        component: () => import('@/views/admin/NotificationList.vue')
      }
    ]
  },
  {
    path: '/teacher',
    component: TeacherLayout,
    children: [
      {
        path: 'dashboard',
        name: 'TeacherDashboard',
        component: TeacherDashboard,
        meta: { requiresAuth: true, role: 'teacher' }
      },
      {
        path: 'courses',
        name: 'TeacherCourses',
        component: () => import('@/views/teacher/MyCourses.vue'),
        meta: { requiresAuth: true, role: 'teacher' }
      },
      {
        path: 'profile',
        name: 'TeacherProfile',
        component: () => import('@/views/teacher/TeacherProfile.vue'),
        meta: { requiresAuth: true, role: 'teacher' }
      },
      {
        path: 'evaluations',
        name: 'StudentEvaluations',
        component: () => import('@/views/teacher/StudentEvaluations.vue'),
        meta: { requiresAuth: true, role: 'teacher' }
      },
      {
        path: 'notifications',
        name: 'TeacherNotifications',
        component: () => import('@/views/teacher/Notifications.vue'),
        meta: { requiresAuth: true, role: 'teacher' }
      }
    ]
  },
  {
    path: '/student',
    component: StudentLayout,
    children: [
      {
        path: '',
        name: 'StudentHome',
        component: () => import('@/views/student/StudentHome.vue'),
        meta: { requiresAuth: true, role: 'student' }
      },
      {
        path: 'evaluation',
        name: 'StudentEvaluation',
        component: () => import('@/views/student/StudentEvaluation.vue'),
        meta: { requiresAuth: true, role: 'student' }
      },
      {
        path: 'information',
        name: 'StudentDashboard',
        component: () => import('@/views/student/StudentDashboard.vue'),
        meta: { requiresAuth: true, role: 'student' }
      },
      {
        path: 'notifications',
        name: 'StudentNotifications',
        component: () => import('@/views/student/Notifications.vue'),
        meta: { requiresAuth: true, role: 'student' }
      }
    ]
  },
  {
    path: '/forget-password',
    name: 'ForgetPassword',
    component: () => import('../views/ForgetPassword.vue')
  },
  {
    path: '/403',
    name: 'ForbiddenPage',
    component: () => import('../views/403.vue')
  }
]

const router = new VueRouter({
  mode: 'history',
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  const userRole = localStorage.getItem('userRole')

  // 如果没有token但存在userRole，清除所有认证信息
  if (!token && userRole) {
    localStorage.removeItem('token')
    localStorage.removeItem('userRole')
    localStorage.removeItem('userName')
    next('/login')
    return
  }

  // 如果访问登录页且已经登录，则根据角色重定向
  if (to.path === '/login' && token && userRole) {
    switch (userRole) {
      case 'admin':
        next('/admin/courses')
        return
      case 'teacher':
        next('/teacher/dashboard')
        return
      case 'student':
        next('/student/dashboard')
        return
    }
  }

  // 验证需要认证的路由
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!token) {
      next('/login')
    } else if (to.matched.some(record => record.meta.role && record.meta.role !== userRole)) {
      next('/403')
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router
