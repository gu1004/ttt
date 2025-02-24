/* eslint-disable */
<template>
  <div class="evaluation-management">
    <div class="filter-section">
      <el-input
        v-model="searchQuery"
        placeholder="搜索课程名称或教师名称"
        style="width: 300px"
        @input="handleSearch"
      />
    </div>

    <el-table
      :data="filteredEvaluations"
      style="width: 100%"
      border
    >
      <el-table-column
        type="index"
        label="序号"
        width="80"
        align="center"
      />
      <el-table-column
        prop="courseName"
        label="课程名称"
        align="center"
      />
      <el-table-column
        prop="teacherName"
        label="授课教师"
        align="center"
      />
      <el-table-column
        prop="classNames"
        label="班级"
        align="center">
        <template slot-scope="scope">
          {{ scope.row.classNames ? scope.row.classNames.split(',').join('、') : '未分配班级' }}
        </template>
      </el-table-column>
      <el-table-column
        prop="startTime"
        label="评价开始时间"
        align="center"
      >
        <template slot-scope="scope">
          {{ scope.row.startTime || '未设置' }}
        </template>
      </el-table-column>
      <el-table-column
        prop="endTime"
        label="评价截止时间"
        align="center"
      >
        <template slot-scope="scope">
          {{ scope.row.endTime || '未设置' }}
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        width="120"
        align="center"
      >
        <template slot-scope="scope">
          <el-button
            type="primary"
            size="mini"
            @click="showEditModal(scope.row)"
          >
            编辑时间
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-container">
      <el-pagination
        background
        layout="total, prev, pager, next"
        :total="total"
        :current-page.sync="currentPage"
        :page-size="pageSize"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 编辑时间对话框 -->
    <el-dialog
      title="编辑评价时间"
      :visible.sync="modalVisible"
      :confirmLoading="confirmLoading"
      @ok="handleOk"
      @cancel="handleCancel"
      width="500px"
    >
      <el-form
        ref="formRef"
        :model="editForm"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="课程名称">
          <span>{{ editForm.courseName }}</span>
        </el-form-item>
        <el-form-item label="授课教师">
          <span>{{ editForm.teacherName }}</span>
        </el-form-item>
        <el-form-item label="开始时间" prop="startTime">
          <el-date-picker
            v-model="editForm.startTime"
            type="datetime"
            placeholder="选择开始时间"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="截止时间" prop="endTime">
          <el-date-picker
            v-model="editForm.endTime"
            type="datetime"
            placeholder="选择截止时间"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="modalVisible = false">取消</el-button>
        <el-button type="primary" @click="handleOk" :loading="confirmLoading">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import axios from '@/utils/axios'
import dayjs from 'dayjs'

export default {
  name: 'EvaluationManagement',
  data () {
    return {
      evaluationList: [],
      searchQuery: '',
      currentPage: 1,
      pageSize: 10,
      total: 0,
      modalVisible: false,
      confirmLoading: false,
      editForm: {
        id: null,
        courseId: null,
        courseName: '',
        teacherName: '',
        startTime: null,
        endTime: null
      },
      rules: {
        startTime: [
          { required: true, message: '请选择开始时间' }
        ],
        endTime: [
          { required: true, message: '请选择截止时间' },
          {
            validator: (rule, value, callback) => {
              if (value && this.editForm.startTime && value < this.editForm.startTime) {
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
  computed: {
    filteredEvaluations () {
      let result = [...this.evaluationList]
      if (this.searchQuery) {
        const keyword = this.searchQuery.toLowerCase()
        result = result.filter(item =>
          item.courseName.toLowerCase().includes(keyword) ||
          item.teacherName.toLowerCase().includes(keyword)
        )
      }
      // 计算分页
      const start = (this.currentPage - 1) * this.pageSize
      const end = start + this.pageSize
      return result.slice(start, end)
    }
  },
  created () {
    this.fetchEvaluationList()
  },
  methods: {
    async fetchEvaluationList () {
      try {
        const response = await axios.get('/admin/evaluations')
        this.evaluationList = response.data.map(item => ({
          ...item,
          startTime: item.start_time ? dayjs(item.start_time).format('YYYY-MM-DD HH:mm:ss') : null,
          endTime: item.end_time ? dayjs(item.end_time).format('YYYY-MM-DD HH:mm:ss') : null
        }))
        this.total = this.evaluationList.length
      } catch (error) {
        this.$message.error('获取评价列表失败')
      }
    },
    handleSearch () {
      this.currentPage = 1
    },
    handleCurrentChange (val) {
      this.currentPage = val
    },
    showEditModal (record) {
      this.editForm = {
        id: record.id,
        courseId: record.courseId,
        courseName: record.courseName,
        teacherName: record.teacherName,
        startTime: record.startTime ? dayjs(record.startTime) : null,
        endTime: record.endTime ? dayjs(record.endTime) : null
      }
      this.modalVisible = true
    },
    async handleOk () {
      try {
        this.confirmLoading = true
        await this.$refs.formRef.validate()

        const startTime = this.editForm.startTime ? dayjs(this.editForm.startTime).format('YYYY-MM-DD HH:mm:ss') : null
        const endTime = this.editForm.endTime ? dayjs(this.editForm.endTime).format('YYYY-MM-DD HH:mm:ss') : null

        await axios.put(`/admin/evaluations/${this.editForm.id}`, {
          start_time: startTime,
          end_time: endTime
        })

        this.$message.success('更新成功')
        this.modalVisible = false
        await this.fetchEvaluationList()
      } catch (error) {
        if (!error.errorFields) {
          this.$message.error('更新失败')
        }
      } finally {
        this.confirmLoading = false
      }
    },
    handleCancel () {
      this.$refs.formRef?.resetFields()
      this.modalVisible = false
    }
  }
}
</script>

<style scoped>
.evaluation-management {
  padding: 24px;
  background: #fff;
}

.filter-section {
  margin-bottom: 20px;
  display: flex;
  gap: 20px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
