<template>
  <div class="student-home">
    <!-- 待评价课程提醒 -->
    <el-card class="reminder-card">
      <div slot="header">
        <span>待评价课程</span>
        <el-button style="float: right; padding: 3px 0" type="text"
                   @click="$router.push('/student/evaluation')">
          查看全部
        </el-button>
      </div>
      <el-table :data="pendingCourses" style="width: 100%">
        <el-table-column prop="name" label="课程名称"></el-table-column>
        <el-table-column prop="teacherName" label="授课教师"></el-table-column>
        <el-table-column prop="end_time" label="评价截止时间">
          <template slot-scope="scope">
            {{ formatDate(scope.row.end_time) }}
          </template>
        </el-table-column>
        <el-table-column fixed="right" label="操作" width="100">
          <template slot-scope="scope">
            <el-button type="text" @click="goToEvaluation(scope.row)">
              去评价
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
import axios from '@/utils/axios'
import dayjs from 'dayjs'

export default {
  name: 'StudentHome',
  data () {
    return {
      pendingCourses: []
    }
  },
  methods: {
    formatDate (date) {
      return date ? dayjs(date).format('YYYY-MM-DD HH:mm') : '未设置'
    },
    async fetchPendingCourses () {
      try {
        const response = await axios.get('/student/pending-courses')
        this.pendingCourses = response.data.slice(0, 5) // 只显示前5条
      } catch (error) {
        this.$message.error('获取待评价课程失败')
      }
    },
    goToEvaluation (course) {
      this.$router.push('/student/evaluation')
    }
  },
  created () {
    this.fetchPendingCourses()
  }
}
</script>

<style scoped>
.student-home {
  padding: 20px;
}

.function-card {
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
}

.function-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.function-card i {
  font-size: 48px;
  color: #0066b3;
  margin: 20px 0;
}

.function-card h3 {
  margin: 10px 0;
  color: #303133;
}

.function-card p {
  color: #909399;
  font-size: 14px;
}

.reminder-card {
  margin-top: 20px;
}

.el-table {
  margin-top: 10px;
}
</style>
