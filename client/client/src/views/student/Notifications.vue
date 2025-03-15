/* eslint-disable */
<template>
  <div class="notifications">
    <h2>评价通知</h2>

    <el-table :data="notifications" style="width: 100%">
      <el-table-column width="50" align="center">
        <template slot-scope="scope">
          <el-badge is-dot class="unread-badge" v-if="!scope.row.read" />
        </template>
      </el-table-column>
      <el-table-column prop="title" label="通知标题">
        <template slot-scope="scope">
          <span :class="{ 'unread': !scope.row.read }" @click="viewNotification(scope.row)" style="cursor: pointer">{{ scope.row.title }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="course_name" label="课程名称" />
      <el-table-column prop="start_time" label="评价开始时间">
        <template slot-scope="scope">
          {{ formatDate(scope.row.start_time) }}
        </template>
      </el-table-column>
      <el-table-column prop="end_time" label="评价截止时间">
        <template slot-scope="scope">
          {{ formatDate(scope.row.end_time) }}
        </template>
      </el-table-column>
      <el-table-column prop="create_time" label="发布时间">
        <template slot-scope="scope">
          {{ formatDate(scope.row.create_time) }}
        </template>
      </el-table-column>
      <el-table-column prop="read" label="状态" width="100">
        <template slot-scope="scope">
          <el-tag :type="scope.row.read ? 'info' : 'danger'" size="small">
            {{ scope.row.read ? '已读' : '未读' }}
          </el-tag>
        </template>
      </el-table-column>
    </el-table>

    <!-- 通知详情对话框 -->
    <el-dialog
      title="通知详情"
      :visible.sync="dialogVisible"
      width="50%"
      :before-close="handleDialogClose"
      :close-on-click-modal="false">
      <div v-if="currentNotification">
        <h3>{{ currentNotification.title }}</h3>
        <div class="notification-meta">
          <span>发布时间：{{ formatDate(currentNotification.create_time) }}</span>
        </div>
        <div class="notification-content">
          {{ currentNotification.content }}
        </div>
        <div v-if="currentNotification.course_name" class="notification-course">
          <p>相关课程：{{ currentNotification.course_name }}</p>
          <p>评价时间：{{ formatDate(currentNotification.start_time) }} - {{ formatDate(currentNotification.end_time) }}</p>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import dayjs from 'dayjs'
import axios from '@/utils/axios'

export default {
  name: 'StudentNotifications',
  data () {
    return {
      notifications: [],
      dialogVisible: false,
      currentNotification: null
    }
  },
  methods: {
    async fetchNotifications () {
      try {
        const response = await axios.get('/student/notifications')
        this.notifications = response.data
      } catch (error) {
        console.error('获取通知失败:', error)
        this.$message.error('获取通知列表失败')
      }
    },
    formatDate (date) {
      return date ? dayjs(date).format('YYYY-MM-DD HH:mm:ss') : '未设置'
    },
    async viewNotification (notification) {
      try {
        // 仅在通知未读时才标记为已读
        if (!notification.read) {
          await axios.put(`/student/notifications/${notification.id}/read`)
          // 更新本地通知状态
          const index = this.notifications.findIndex(n => n.id === notification.id)
          if (index !== -1) {
            this.$set(this.notifications[index], 'read', true)
            // 更新当前通知的已读状态
            notification.read = true
          }
        }

        // 标记已读完成后再显示对话框
        this.currentNotification = { ...notification }
        this.dialogVisible = true
      } catch (error) {
        console.error('处理通知失败:', error)
        this.$message.error('操作失败，请重试')
      }
    },
    handleDialogClose () {
      this.dialogVisible = false
      this.currentNotification = null
    }
  },
  created () {
    this.fetchNotifications()
  }
}
</script>

<style scoped>
.notifications {
  padding: 20px;
}

h2 {
  margin-bottom: 20px;
}

.unread {
  font-weight: bold;
  color: #303133;
}

.unread-badge {
  margin-right: 10px;
}

.notification-meta {
  color: #909399;
  font-size: 14px;
  margin: 10px 0;
}

.notification-content {
  margin: 20px 0;
  line-height: 1.6;
  white-space: pre-wrap;
}

.notification-course {
  background: #f5f7fa;
  padding: 15px;
  border-radius: 4px;
  margin-top: 20px;
}

.notification-course p {
  margin: 5px 0;
  color: #606266;
}

.el-table .el-badge {
  margin-top: 2px;
}

.el-table .el-badge__content.is-dot {
  background-color: #f56c6c;
}
</style>
