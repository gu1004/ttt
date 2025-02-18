<template>
  <div class="course-management">
    <!-- 搜索和添加区域 -->
    <div class="header-actions">
      <el-input
        v-model="searchQuery"
        placeholder="搜索课程名称或教师"
        prefix-icon="el-icon-search"
        @input="handleSearch"
        class="search-input"
      />
      <el-button type="primary" @click="handleAdd">添加课程</el-button>
    </div>

    <!-- 课程列表 -->
    <el-table
      :data="paginatedCourses"
      style="width: 100%"
      v-loading="loading"
    >
      <el-table-column label="序号" width="100">
        <template slot-scope="scope">
          {{ (currentPage - 1) * 10 + scope.$index + 1 }}
        </template>
      </el-table-column>
      <el-table-column prop="name" label="课程名称" />
      <el-table-column prop="teacher" label="教师" />
      <el-table-column prop="startDate" label="开课时间" width="180" />
      <el-table-column prop="endDate" label="结课时间" width="180" />
      <el-table-column label="操作" width="200">
        <template slot-scope="scope">
          <el-button
            size="mini"
            @click="handleEdit(scope.row)"
          >编辑</el-button>
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
        :total="filteredCourses.length"
        background
      >
      </el-pagination>
    </div>

    <!-- 添加/编辑课程对话框 -->
    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      width="50%"
    >
      <el-form
        :model="courseForm"
        :rules="rules"
        ref="courseForm"
        label-width="100px"
      >
        <el-form-item label="课程名称" prop="name">
          <el-input v-model="courseForm.name" />
        </el-form-item>
        <el-form-item label="教师" prop="teacherId">
          <el-select v-model="courseForm.teacherId" placeholder="请选择教师">
            <el-option
              v-for="teacher in teachers"
              :key="teacher.id"
              :label="teacher.name"
              :value="teacher.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="课程描述" prop="description">
          <el-input
            type="textarea"
            v-model="courseForm.description"
            :rows="4"
          />
        </el-form-item>
        <el-form-item label="开课时间" prop="startDate">
          <el-date-picker
            v-model="courseForm.startDate"
            type="date"
            placeholder="选择开课时间"
          />
        </el-form-item>
        <el-form-item label="结课时间" prop="endDate">
          <el-date-picker
            v-model="courseForm.endDate"
            type="date"
            placeholder="选择结课时间"
          />
        </el-form-item>
        <el-form-item label="选择班级" prop="classes">
          <el-select
            v-model="courseForm.classes"
            multiple
            filterable
            allow-create
            default-first-option
            placeholder="请选择或输入班级（可多选）"
          >
            <el-option
              v-for="className in existingClasses"
              :key="className"
              :label="className"
              :value="className"
            />
          </el-select>
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
import dayjs from 'dayjs'

export default {
  name: 'CourseManagement',
  data () {
    return {
      searchQuery: '',
      courses: [],
      teachers: [],
      existingClasses: [],
      loading: false,
      dialogVisible: false,
      dialogTitle: '添加课程',
      currentPage: 1,
      courseForm: {
        name: '',
        teacherId: '',
        description: '',
        startDate: '',
        endDate: '',
        classes: []
      },
      rules: {
        name: [
          { required: true, message: '请输入课程名称', trigger: 'blur' }
        ],
        teacherId: [
          { required: true, message: '请选择教师', trigger: 'change' }
        ],
        description: [
          { required: true, message: '请输入课程描述', trigger: 'blur' }
        ],
        startDate: [
          { required: true, message: '请选择开课时间', trigger: 'change' }
        ],
        endDate: [
          { required: true, message: '请选择结课时间', trigger: 'change' },
          {
            validator: (rule, value, callback) => {
              if (value && this.courseForm.startDate && value < this.courseForm.startDate) {
                callback(new Error('结课时间不能早于开课时间'))
              } else {
                callback()
              }
            },
            trigger: 'change'
          }
        ],
        classes: [
          { required: true, message: '请选择至少一个班级', trigger: 'change' }
        ]
      }
    }
  },
  computed: {
    filteredCourses () {
      if (!this.searchQuery) return this.courses
      const query = this.searchQuery.toLowerCase()
      return this.courses.filter(course =>
        course.name.toLowerCase().includes(query) ||
        course.teacher.toLowerCase().includes(query)
      )
    },
    paginatedCourses () {
      const start = (this.currentPage - 1) * 10
      const end = start + 10
      return this.filteredCourses.map(course => ({
        ...course,
        startDate: course.start_date ? dayjs(course.start_date).format('YYYY-MM-DD') : '',
        endDate: course.end_date ? dayjs(course.end_date).format('YYYY-MM-DD') : ''
      })).slice(start, end)
    }
  },
  created () {
    this.fetchCourses()
    this.fetchTeachers()
    this.fetchExistingClasses()
  },
  methods: {
    async fetchCourses () {
      try {
        this.loading = true
        const response = await axios.get('/admin/courses')
        console.log('获取课程列表响应:', response.data) // 添加调试日志
        this.courses = response.data.map(course => ({
          ...course,
          teacherId: course.teacher_id,
          startDate: course.start_date,
          endDate: course.end_date,
          classes: Array.isArray(course.classes)
            ? course.classes
            : (typeof course.classes === 'string' && course.classes
                ? course.classes.split(',')
                : [])
        }))
      } catch (error) {
        console.error('获取课程列表失败:', error) // 添加错误日志
        this.$message.error('获取课程列表失败')
      } finally {
        this.loading = false
      }
    },
    async fetchTeachers () {
      try {
        const response = await axios.get('/admin/teachers')
        this.teachers = response.data
      } catch (error) {
        this.$message.error('获取教师列表失败')
      }
    },
    async fetchExistingClasses () {
      try {
        const response = await axios.get('/admin/classes')
        this.existingClasses = response.data
      } catch (error) {
        this.$message.error('获取班级列表失败')
      }
    },
    handleSearch () {
      // 搜索功能已通过计算属性实现
      this.currentPage = 1 // 重置页码
    },
    handleCurrentChange (val) {
      this.currentPage = val
    },
    handleAdd () {
      this.dialogTitle = '添加课程'
      this.courseForm = {
        name: '',
        teacherId: '',
        description: '',
        startDate: '',
        endDate: '',
        classes: []
      }
      this.dialogVisible = true
    },
    handleEdit (row) {
      console.log('编辑课程数据:', row) // 添加调试日志
      this.dialogTitle = '编辑课程'
      this.courseForm = {
        id: row.id,
        name: row.name,
        teacherId: row.teacher_id,
        description: row.description,
        startDate: row.start_date ? dayjs(row.start_date) : '',
        endDate: row.end_date ? dayjs(row.end_date) : '',
        classes: Array.isArray(row.classes)
          ? row.classes
          : (typeof row.classes === 'string' && row.classes
              ? row.classes.split(',')
              : [])
      }
      this.dialogVisible = true
    },
    async handleDelete (row) {
      try {
        await this.$msgbox({
          title: '删除确认',
          message: `是否确认删除课程"${row.name}"？删除后将同时删除：\n1. 该课程的所有学生选课记录\n2. 该课程的班级关联记录\n3. 该课程的所有评价记录`,
          showCancelButton: true,
          confirmButtonText: '确定删除',
          cancelButtonText: '取消',
          type: 'warning',
          beforeClose: async (action, instance, done) => {
            if (action === 'confirm') {
              instance.confirmButtonLoading = true
              try {
                await axios.delete(`/admin/courses/${row.id}`)
                this.$message.success('删除成功')
                this.fetchCourses()
                done()
              } catch (error) {
                this.$message.error(error.response?.data?.message || '删除失败')
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
        await this.$refs.courseForm.validate()
        const formData = {
          name: this.courseForm.name,
          teacherId: this.courseForm.teacherId,
          description: this.courseForm.description,
          startDate: this.courseForm.startDate ? dayjs(this.courseForm.startDate).format('YYYY-MM-DD') : null,
          endDate: this.courseForm.endDate ? dayjs(this.courseForm.endDate).format('YYYY-MM-DD') : null,
          classes: this.courseForm.classes
        }

        if (this.courseForm.id) {
          await axios.put(`/admin/courses/${this.courseForm.id}`, formData)
          this.$message.success('更新成功')
        } else {
          await axios.post('/admin/courses', formData)
          this.$message.success('添加成功')
        }
        this.dialogVisible = false
        this.fetchCourses()
      } catch (error) {
        this.$message.error('操作失败')
      }
    }
  }
}
</script>

<style scoped>
.course-management {
  background: #fff;
  padding: 20px;
  border-radius: 4px;
}

.header-actions {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.search-input {
  width: 300px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
  padding-right: 20px;
}
</style>
