<template>
  <div class="review-delete">
    <el-card>
      <div slot="header">
        <span>评价删除</span>
      </div>

      <!-- 搜索和筛选区域 -->
      <div class="filter-container">
        <el-form :inline="true" :model="filterForm">
          <el-form-item label="课程名称">
            <el-input
              v-model="filterForm.courseName"
              placeholder="请输入课程名称"
              clearable
            />
          </el-form-item>
          <el-form-item label="教师姓名">
            <el-input
              v-model="filterForm.teacherName"
              placeholder="请输入教师姓名"
              clearable
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleFilter">查询</el-button>
            <el-button @click="resetFilter">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 批量操作按钮 -->
      <div class="batch-operation" v-if="selection.length > 0">
        <el-button type="danger" @click="handleBatchDelete">批量删除</el-button>
      </div>

      <!-- 评价列表 -->
      <el-table
        :data="filteredReviews"
        v-loading="loading"
        style="width: 100%"
        border
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="courseName" label="课程名称" />
        <el-table-column prop="teacherName" label="授课教师" />
        <el-table-column label="评分" width="300">
          <template slot-scope="scope">
            <div class="scores">
              <div>教学态度：{{ scope.row.teachingAttitude }}</div>
              <div>教学内容：{{ scope.row.teachingContent }}</div>
              <div>教学方法：{{ scope.row.teachingMethod }}</div>
              <div>教学效果：{{ scope.row.teachingEffect }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="comment" label="评价内容" show-overflow-tooltip />
        <el-table-column prop="createTime" label="提交时间" width="180">
          <template slot-scope="scope">
            {{ formatDate(scope.row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template slot-scope="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template slot-scope="scope">
            <el-button
              size="mini"
              type="primary"
              @click="handleView(scope.row)"
            >
              查看
            </el-button>
            <el-button
              size="mini"
              type="danger"
              @click="handleDelete(scope.row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
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
    </el-card>

    <!-- 查看评价详情对话框 -->
    <el-dialog
      title="评价详情"
      :visible.sync="viewDialogVisible"
      width="600px"
    >
      <div class="review-detail">
        <div class="detail-item">
          <label>课程名称：</label>
          <span>{{ currentReview?.courseName }}</span>
        </div>
        <div class="detail-item">
          <label>授课教师：</label>
          <span>{{ currentReview?.teacherName }}</span>
        </div>
        <div class="detail-item">
          <label>提交时间：</label>
          <span>{{ formatDate(currentReview?.createTime) }}</span>
        </div>
        <div class="detail-item">
          <label>评分：</label>
          <div class="scores-detail">
            <div>教学态度：{{ currentReview?.teachingAttitude }}</div>
            <div>教学内容：{{ currentReview?.teachingContent }}</div>
            <div>教学方法：{{ currentReview?.teachingMethod }}</div>
            <div>教学效果：{{ currentReview?.teachingEffect }}</div>
          </div>
        </div>
        <div class="detail-item">
          <label>评价内容：</label>
          <div class="comment-detail">{{ currentReview?.comment }}</div>
        </div>
      </div>
    </el-dialog>

    <!-- 删除确认对话框 -->
    <el-dialog
      title="删除确认"
      :visible.sync="deleteDialogVisible"
      width="500px"
    >
      <div class="delete-confirm">
        <p>确定要删除这条评价吗？此操作不可恢复。</p>
      </div>
      <div slot="footer">
        <el-button @click="deleteDialogVisible = false">取消</el-button>
        <el-button type="danger" @click="submitDelete">确定</el-button>
      </div>
    </el-dialog>

    <!-- 批量删除确认对话框 -->
    <el-dialog
      title="批量删除确认"
      :visible.sync="batchDeleteDialogVisible"
      width="500px"
    >
      <div class="delete-confirm">
        <p>确定要删除选中的 {{ selection.length }} 条评价吗？此操作不可恢复。</p>
      </div>
      <div slot="footer">
        <el-button @click="batchDeleteDialogVisible = false">取消</el-button>
        <el-button type="danger" @click="submitBatchDelete">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import axios from '@/utils/axios'
import dayjs from 'dayjs'

export default {
  name: 'ReviewDelete',
  data () {
    return {
      loading: false,
      reviews: [],
      filterForm: {
        courseName: '',
        teacherName: ''
      },
      currentPage: 1,
      pageSize: 10,
      selection: [],
      deleteDialogVisible: false,
      batchDeleteDialogVisible: false,
      viewDialogVisible: false,
      currentReview: null
    }
  },
  computed: {
    filteredReviews () {
      let result = [...this.reviews]

      // 课程名称筛选
      if (this.filterForm.courseName) {
        const keyword = this.filterForm.courseName.toLowerCase()
        result = result.filter(review =>
          review.courseName.toLowerCase().includes(keyword)
        )
      }

      // 教师姓名筛选
      if (this.filterForm.teacherName) {
        const keyword = this.filterForm.teacherName.toLowerCase()
        result = result.filter(review =>
          review.teacherName.toLowerCase().includes(keyword)
        )
      }

      return result.slice((this.currentPage - 1) * this.pageSize, this.currentPage * this.pageSize)
    },
    total () {
      let result = [...this.reviews]

      // 课程名称筛选
      if (this.filterForm.courseName) {
        const keyword = this.filterForm.courseName.toLowerCase()
        result = result.filter(review =>
          review.courseName.toLowerCase().includes(keyword)
        )
      }

      // 教师姓名筛选
      if (this.filterForm.teacherName) {
        const keyword = this.filterForm.teacherName.toLowerCase()
        result = result.filter(review =>
          review.teacherName.toLowerCase().includes(keyword)
        )
      }

      return result.length
    }
  },
  created () {
    this.fetchReviews()
  },
  methods: {
    async fetchReviews () {
      try {
        this.loading = true
        const response = await axios.get('/admin/reviews')
        this.reviews = response.data
      } catch (error) {
        this.$message.error('获取评价列表失败')
      } finally {
        this.loading = false
      }
    },
    formatDate (date) {
      return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
    },
    handleFilter () {
      this.currentPage = 1
    },
    resetFilter () {
      this.filterForm = {
        courseName: '',
        teacherName: ''
      }
      this.currentPage = 1
    },
    handleCurrentChange (val) {
      this.currentPage = val
    },
    handleSelectionChange (val) {
      this.selection = val
    },
    getStatusType (status) {
      const types = {
        pending: 'warning',
        approved: 'success',
        rejected: 'danger'
      }
      return types[status] || 'info'
    },
    getStatusText (status) {
      const texts = {
        pending: '待审核',
        approved: '已通过',
        rejected: '已拒绝'
      }
      return texts[status] || status
    },
    handleView (row) {
      this.currentReview = row
      this.viewDialogVisible = true
    },
    handleDelete (row) {
      this.currentReview = row
      this.deleteDialogVisible = true
    },
    async submitDelete () {
      try {
        await axios.delete(`/admin/reviews/${this.currentReview.id}`)
        this.$message.success('删除成功')
        this.deleteDialogVisible = false
        this.fetchReviews()
      } catch (error) {
        this.$message.error('删除失败')
      }
    },
    handleBatchDelete () {
      this.batchDeleteDialogVisible = true
    },
    async submitBatchDelete () {
      try {
        await axios.delete('/admin/reviews/batch', {
          data: {
            ids: this.selection.map(item => item.id)
          }
        })
        this.$message.success('批量删除成功')
        this.batchDeleteDialogVisible = false
        this.selection = []
        this.fetchReviews()
      } catch (error) {
        this.$message.error('批量删除失败')
      }
    }
  }
}
</script>

<style scoped>
.review-delete {
  padding: 20px;
}

.filter-container {
  margin-bottom: 20px;
}

.batch-operation {
  margin-bottom: 20px;
}

.scores {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 5px;
  font-size: 13px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.review-detail {
  padding: 20px;
}

.detail-item {
  margin-bottom: 20px;
}

.detail-item label {
  font-weight: bold;
  margin-right: 10px;
  color: #606266;
}

.scores-detail {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin-top: 10px;
}

.comment-detail {
  margin-top: 10px;
  white-space: pre-wrap;
  line-height: 1.5;
}

.delete-confirm {
  text-align: center;
  color: #606266;
}
</style>
