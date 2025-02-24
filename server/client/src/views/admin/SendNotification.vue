/* eslint-disable */
<template>
  <div class="send-notification">
    <h2>发送通知</h2>

    <el-form :model="notificationForm" :rules="rules" ref="notificationForm" label-width="100px">
      <el-form-item label="通知类型" prop="notificationType">
        <el-select v-model="notificationForm.notificationType" placeholder="请选择通知类型" @change="handleNotificationTypeChange">
          <el-option label="评价开始通知" value="evaluation_start"></el-option>
          <el-option label="评价截止通知" value="evaluation_due"></el-option>
          <el-option label="统计结果已出" value="evaluation_result"></el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="选择课程" prop="courseId">
        <el-select v-model="notificationForm.courseId" placeholder="请选择课程" @change="handleCourseChange">
          <el-option
            v-for="course in courses"
            :key="course.id"
            :label="course.name"
            :value="course.id">
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="课程接收方" prop="courseReceiverType">
        <el-select v-model="notificationForm.courseReceiverType" placeholder="请选择接收方">
          <el-option
            v-if="notificationForm.notificationType === 'evaluation_result'"
            label="课程教师"
            value="teacher">
          </el-option>
          <el-option
            v-if="notificationForm.notificationType !== 'evaluation_result'"
            label="课程学生"
            value="student">
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item
        v-if="notificationForm.notificationType !== 'evaluation_result'"
        label="评价开始时间"
        prop="startTime"
        class="time-item">
        <el-date-picker
          v-model="notificationForm.startTime"
          type="datetime"
          placeholder="选择评价开始时间">
        </el-date-picker>
      </el-form-item>

      <el-form-item
        v-if="notificationForm.notificationType !== 'evaluation_result'"
        label="评价截止时间"
        prop="endTime"
        class="time-item">
        <el-date-picker
          v-model="notificationForm.endTime"
          type="datetime"
          placeholder="选择评价截止时间">
        </el-date-picker>
      </el-form-item>

      <el-form-item label="补充说明" prop="content">
        <el-input
          type="textarea"
          v-model="notificationForm.content"
          :rows="4"
          placeholder="请输入补充说明（选填）">
        </el-input>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="submitForm">发送通知</el-button>
        <el-button @click="resetForm">重置</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import axios from '@/utils/axios'
import dayjs from 'dayjs'

export default {
  name: 'SendNotification',
  data () {
    return {
      notificationForm: {
        notificationType: '',
        courseId: null,
        courseReceiverType: '',
        content: '',
        startTime: null,
        endTime: null
      },
      courses: [],
      rules: {
        notificationType: [
          { required: true, message: '请选择通知类型', trigger: 'change' }
        ],
        courseId: [
          { required: true, message: '请选择课程', trigger: 'change' }
        ],
        courseReceiverType: [
          { required: true, message: '请选择课程接收方', trigger: 'change' }
        ],
        startTime: [
          {
            required: true,
            message: '请选择评价开始时间',
            trigger: 'change',
            validator: (rule, value, callback) => {
              if (this.notificationForm.notificationType !== 'evaluation_result' && !value) {
                callback(new Error('请选择评价开始时间'))
              } else {
                callback()
              }
            }
          }
        ],
        endTime: [
          {
            required: true,
            message: '请选择评价截止时间',
            trigger: 'change',
            validator: (rule, value, callback) => {
              if (this.notificationForm.notificationType !== 'evaluation_result' && !value) {
                callback(new Error('请选择评价截止时间'))
              } else if (value && this.notificationForm.startTime && value < this.notificationForm.startTime) {
                callback(new Error('截止时间必须晚于开始时间'))
              } else {
                callback()
              }
            }
          }
        ]
      }
    }
  },
  methods: {
    async fetchCourses () {
      try {
        const response = await axios.get('/admin/courses')
        this.courses = response.data
      } catch (error) {
        this.$message.error('获取课程列表失败')
      }
    },
    async handleCourseChange (courseId) {
      if (!courseId) return

      if (this.notificationForm.notificationType === 'evaluation_start' ||
          this.notificationForm.notificationType === 'evaluation_due') {
        try {
          const response = await axios.get(`/admin/courses/${courseId}/evaluation-time`)
          const { startTime, endTime } = response.data

          this.notificationForm.startTime = startTime ? dayjs(startTime) : null
          this.notificationForm.endTime = endTime ? dayjs(endTime) : null

          if (!startTime || !endTime) {
            this.$message.warning('该课程尚未设置评价时间')
          }
        } catch (error) {
          console.error('获取课程评价时间失败:', error)
        }
      }
    },
    handleNotificationTypeChange () {
      // 重置课程接收方
      this.notificationForm.courseReceiverType = ''

      // 如果是统计结果通知，重置时间相关字段
      if (this.notificationForm.notificationType === 'evaluation_result') {
        this.notificationForm.startTime = null
        this.notificationForm.endTime = null
      } else if (this.notificationForm.courseId) {
        // 如果已选择课程，自动获取评价时间
        this.handleCourseChange(this.notificationForm.courseId)
      }
    },
    async submitForm () {
      try {
        await this.$refs.notificationForm.validate()

        const formData = {
          notificationType: this.notificationForm.notificationType,
          targetType: 'course',
          courseId: this.notificationForm.courseId,
          courseReceiverType: this.notificationForm.courseReceiverType,
          content: this.notificationForm.content,
          startTime: this.notificationForm.startTime ? dayjs(this.notificationForm.startTime).format('YYYY-MM-DD HH:mm:ss') : null,
          endTime: this.notificationForm.endTime ? dayjs(this.notificationForm.endTime).format('YYYY-MM-DD HH:mm:ss') : null,
          sendTime: dayjs().format('YYYY-MM-DD HH:mm:ss')
        }

        await axios.post('/admin/notifications', formData)
        this.$message.success('通知发送成功')
        this.resetForm()
      } catch (error) {
        this.$message.error(error.response?.data?.message || '发送通知失败')
      }
    },
    resetForm () {
      this.$refs.notificationForm.resetFields()
    }
  },
  watch: {
    'notificationForm.courseId': {
      handler: function (newVal) {
        if (newVal) {
          this.handleCourseChange(newVal)
        }
      }
    }
  },
  created () {
    this.fetchCourses()
  }
}
</script>

<style scoped>
.send-notification {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

h2 {
  margin-bottom: 20px;
  text-align: center;
}

.el-form {
  background: #fff;
  padding: 20px;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
}

.time-item {
  margin-bottom: 22px;
}

.time-item .el-date-picker {
  width: 100%;
}
</style>
