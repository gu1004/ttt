/* eslint-disable */
<template>
  <div class="notification-list">
    <h2>通知列表</h2>

    <!-- 搜索栏 -->
    <div class="filter-section">
      <el-input
        v-model="searchQuery"
        placeholder="搜索通知标题或课程名称"
        style="width: 300px"
        @input="handleSearch"
      />
    </div>

    <el-table :data="filteredNotifications" style="width: 100%">
      <el-table-column prop="title" label="通知标题" />
      <el-table-column prop="target_type" label="接收对象">
        <template slot-scope="scope">
          {{ getTargetTypeText(scope.row.target_type) }}
        </template>
      </el-table-column>
      <el-table-column prop="course_name" label="相关课程" />
      <el-table-column prop="send_time" label="发送时间">
        <template slot-scope="scope">
          {{ formatDate(scope.row.send_time) }}
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态">
        <template slot-scope="scope">
          <el-tag :type="getStatusType(scope.row.status)">
            {{ getStatusText(scope.row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="120">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="primary"
            @click="viewNotification(scope.row)"
          >查看</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页器 -->
    <div class="pagination">
      <el-pagination
        background
        layout="total, prev, pager, next"
        :total="total"
        :page-size="pageSize"
        :current-page.sync="currentPage"
        @current-change="handlePageChange"
      />
    </div>

    <!-- 通知详情对话框 -->
    <el-dialog
      title="通知详情"
      :visible.sync="dialogVisible"
      width="50%"
    >
      <div v-if="currentNotification" class="notification-detail">
        <h3>{{ currentNotification.title }}</h3>
        <div class="meta-info">
          <p>发送时间：{{ formatDate(currentNotification.send_time) }}</p>
          <p>接收对象：{{ getTargetTypeText(currentNotification.target_type) }}</p>
          <p v-if="currentNotification.course_name">相关课程：{{ currentNotification.course_name }}</p>
        </div>
        <div class="content">
          <p>{{ currentNotification.content }}</p>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import axios from '@/utils/axios'
import dayjs from 'dayjs'

export default {
  name: 'NotificationList',
  data () {
    return {
      notifications: [],
      searchQuery: '',
      currentPage: 1,
      pageSize: 10,
      total: 0,
      dialogVisible: false,
      currentNotification: null
    }
  },
  computed: {
    filteredNotifications () {
      return this.notifications
    }
  },
  methods: {
    async fetchNotifications () {
      try {
        const response = await axios.get('/admin/notifications', {
          params: {
            page: this.currentPage,
            pageSize: this.pageSize,
            search: this.searchQuery
          }
        })
        this.notifications = response.data.data
        this.total = response.data.total
      } catch (error) {
        console.error('获取通知列表失败:', error)
        this.$message.error('获取通知列表失败')
      }
    },
    handleSearch () {
      this.currentPage = 1
      this.fetchNotifications()
    },
    handlePageChange (page) {
      this.currentPage = page
      this.fetchNotifications()
    },
    formatDate (date) {
      return date ? dayjs(date).format('YYYY-MM-DD HH:mm:ss') : '未设置'
    },
    getTargetTypeText (type) {
      const types = {
        all: '全部用户',
        students: '所有学生',
        teachers: '所有教师',
        course: '特定课程'
      }
      return types[type] || type
    },
    getStatusType (status) {
      const types = {
        draft: 'info',
        scheduled: 'warning',
        sent: 'success'
      }
      return types[status] || 'info'
    },
    getStatusText (status) {
      const texts = {
        draft: '草稿',
        scheduled: '待发送',
        sent: '已发送'
      }
      return texts[status] || status
    },
    viewNotification (notification) {
      this.currentNotification = notification
      this.dialogVisible = true
    }
  },
  created () {
    this.fetchNotifications()
  }
}
</script>

<style scoped>
.notification-list {
  padding: 20px;
}

h2 {
  margin-bottom: 20px;
}

.filter-section {
  margin-bottom: 20px;
}

.notification-detail {
  padding: 0 20px;
}

.notification-detail h3 {
  margin-bottom: 20px;
  color: #303133;
}

.meta-info {
  background-color: #f5f7fa;
  padding: 15px;
  border-radius: 4px;
  margin-bottom: 20px;
}

.meta-info p {
  margin: 5px 0;
  color: #606266;
}

.content {
  line-height: 1.6;
  color: #303133;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
