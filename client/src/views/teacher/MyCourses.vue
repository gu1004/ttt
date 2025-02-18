<template>
  <div class="my-courses">

    <!-- 搜索框 -->
    <div class="search-container">
      <el-input
        v-model="searchQuery"
        placeholder="搜索课程名称"
        prefix-icon="el-icon-search"
        clearable
        @input="handleSearch"
        class="search-input"
      />
    </div>

    <!-- 课程列表 -->
    <el-table :data="filteredCourses" style="width: 100%; margin-bottom: 20px;">
      <el-table-column prop="name" label="课程名称" />
      <el-table-column prop="start_date" label="开课时间" />
      <el-table-column prop="end_date" label="结课时间" />
      <el-table-column prop="student_count" label="学生人数" />
      <el-table-column label="操作" width="120">
        <template slot-scope="scope">
          <el-button size="mini" type="primary" @click="editCourse(scope.row)">编辑</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 课程编辑对话框 -->
    <el-dialog :visible.sync="dialogVisible" title="编辑课程">
      <el-form :model="currentCourse" label-width="100px" :rules="rules" ref="courseForm">
        <el-form-item label="课程名称" prop="name">
          <el-input v-model="currentCourse.name" />
        </el-form-item>
        <el-form-item label="课程描述" prop="description">
          <el-input type="textarea" v-model="currentCourse.description" />
        </el-form-item>
        <el-form-item label="开课时间" prop="start_date">
          <el-date-picker v-model="currentCourse.start_date" type="date" placeholder="选择开课时间" />
        </el-form-item>
        <el-form-item label="结课时间" prop="end_date">
          <el-date-picker v-model="currentCourse.end_date" type="date" placeholder="选择结课时间" />
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveCourse">保存</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import axios from '@/utils/axios'

export default {
  name: 'MyCourses',
  data () {
    return {
      courses: [],
      searchQuery: '',
      dialogVisible: false,
      currentCourse: {
        name: '',
        description: '',
        start_date: '',
        end_date: '',
        original: {
          name: '',
          description: '',
          start_date: '',
          end_date: ''
        }
      },
      rules: {
        name: [{ required: true, message: '请输入课程名称', trigger: 'blur' }],
        description: [{ required: true, message: '请输入课程描述', trigger: 'blur' }],
        start_date: [{ required: true, message: '请选择开课时间', trigger: 'change' }],
        end_date: [
          { required: true, message: '请选择结课时间', trigger: 'change' },
          {
            validator: (rule, value, callback) => {
              if (value && this.currentCourse.start_date && value < this.currentCourse.start_date) {
                callback(new Error('结课时间不能早于开课时间'))
              } else {
                callback()
              }
            },
            trigger: 'change'
          }
        ]
      }
    }
  },
  computed: {
    filteredCourses () {
      if (!this.searchQuery) {
        return this.courses
      }
      const query = this.searchQuery.toLowerCase()
      return this.courses.filter(course =>
        course.name.toLowerCase().includes(query)
      )
    }
  },
  methods: {
    async fetchCourses () {
      try {
        const response = await axios.get('/teacher/courses')
        this.courses = response.data
      } catch (error) {
        this.$message.error('获取课程列表失败')
      }
    },
    handleSearch () {
      // 搜索功能通过计算属性 filteredCourses 实现
    },
    editCourse (course) {
      this.currentCourse = {
        id: course.id,
        name: course.name,
        description: course.description,
        start_date: course.start_date ? new Date(course.start_date) : '',
        end_date: course.end_date ? new Date(course.end_date) : '',
        original: {
          name: course.name,
          description: course.description,
          start_date: course.start_date,
          end_date: course.end_date
        }
      }
      this.dialogVisible = true
    },
    async saveCourse () {
      try {
        await this.$refs.courseForm.validate()

        const formData = {}

        if (this.currentCourse.name !== this.currentCourse.original.name) {
          formData.name = this.currentCourse.name
        }
        if (this.currentCourse.description !== this.currentCourse.original.description) {
          formData.description = this.currentCourse.description
        }

        const newStartDate = this.formatDate(this.currentCourse.start_date)
        const newEndDate = this.formatDate(this.currentCourse.end_date)

        if (newStartDate !== this.currentCourse.original.start_date) {
          formData.start_date = newStartDate
        }
        if (newEndDate !== this.currentCourse.original.end_date) {
          formData.end_date = newEndDate
        }

        if (Object.keys(formData).length === 0) {
          this.dialogVisible = false
          return
        }

        await axios.put(`/teacher/courses/${this.currentCourse.id}`, formData)
        this.$message.success('更新成功')
        this.dialogVisible = false
        this.fetchCourses()
      } catch (error) {
        console.error('更新失败:', error)
        this.$message.error(error.response?.data?.message || '更新失败')
      }
    },
    formatDate (date) {
      if (!date) return null
      const d = new Date(date)
      if (isNaN(d.getTime())) return null
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    }
  },
  created () {
    this.fetchCourses()
  }
}
</script>

<style scoped>
.my-courses {
  padding: 20px;
}

.search-container {
  margin-bottom: 20px;
  display: flex;
  justify-content: flex-start;
}

.search-input {
  width: 300px;
}

h2 {
  margin-bottom: 20px;
}
</style>
