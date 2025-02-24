/* eslint-disable */
<template>
  <div class="review-management">
    <div class="filter-section">
      <el-input
        v-model="searchQuery"
        placeholder="搜索课程名称或教师名称"
        style="width: 300px"
        @input="handleSearch"
      >
        <el-button slot="append" icon="el-icon-search" @click="fetchReviews"></el-button>
      </el-input>
      <el-select v-model="statusFilter" placeholder="状态筛选" @change="handleFilter">
        <el-option label="全部" value="" />
        <el-option label="待审核" value="pending" />
        <el-option label="已通过" value="approved" />
        <el-option label="已删除" value="rejected" />
      </el-select>
    </div>

    <el-table :data="reviews" style="width: 100%" border height="calc(100vh - 250px)" v-loading="loading">
      <el-table-column prop="studentName" label="学生" width="80" align="center" fixed>
        <template>***</template>
      </el-table-column>
      <el-table-column prop="courseName" label="课程名称" min-width="120" align="center" />
      <el-table-column prop="teacherName" label="教师" width="80" align="center" />
      <el-table-column label="评分" width="400" align="center">
        <template slot-scope="scope">
          <div class="score-item">
            教学内容：{{ scope.row.teaching_content }}
          </div>
          <div class="score-item">
            教学方法：{{ scope.row.teaching_method }}
          </div>
          <div class="score-item">
            教师表现：{{ scope.row.teacher_performance }}
          </div>
          <div class="score-item">
            课程设计：{{ scope.row.course_design }}
          </div>
          <div class="score-item">
            学习效果：{{ scope.row.learning_effect }}
          </div>
          <div class="score-item">
            总分：{{ scope.row.total_score }}
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="comment" label="评价内容" min-width="150" align="center" show-overflow-tooltip />
      <el-table-column prop="submitTime" label="提交时间" width="150" align="center" />
      <el-table-column prop="status" label="状态" width="80" align="center">
        <template slot-scope="scope">
          <el-tag :type="getStatusType(scope.row.status)">
            {{ getStatusText(scope.row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="240" align="center" fixed="right">
        <template slot-scope="scope">
          <div class="operation-buttons">
            <template v-if="scope.row.status === 'pending'">
              <el-button
                size="mini"
                type="success"
                @click="handleApprove(scope.row)"
              >通过</el-button>
              <el-button
                size="mini"
                type="danger"
                @click="handleDelete(scope.row)"
              >删除</el-button>
            </template>
            <el-button
              size="mini"
              type="primary"
              @click="handleView(scope.row)"
            >查看</el-button>
            <el-button
              size="mini"
              type="info"
              @click="showHistory(scope.row)"
            >审核记录</el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>

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

    <!-- 查看评价详情对话框 -->
    <el-dialog title="评价详情" :visible.sync="viewDialogVisible" width="600px">
      <div class="review-detail">
        <div class="detail-item">
          <label>课程名称：</label>
          <span>{{ currentReview.courseName }}</span>
        </div>
        <div class="detail-item">
          <label>授课教师：</label>
          <span>{{ currentReview.teacherName }}</span>
        </div>
        <div class="detail-item">
          <label>提交时间：</label>
          <span>{{ currentReview.submitTime }}</span>
        </div>
        <div class="detail-item">
          <label>评分：</label>
          <div class="scores-detail">
            <div>教学内容：{{ currentReview.teaching_content }}</div>
            <div>教学方法：{{ currentReview.teaching_method }}</div>
            <div>教师表现：{{ currentReview.teacher_performance }}</div>
            <div>课程设计：{{ currentReview.course_design }}</div>
            <div>学习效果：{{ currentReview.learning_effect }}</div>
          </div>
        </div>
        <div class="detail-item">
          <label>评价内容：</label>
          <div class="comment-detail">{{ currentReview.comment }}</div>
        </div>
      </div>
    </el-dialog>

    <!-- 删除评价对话框 -->
    <el-dialog title="删除评价" :visible.sync="deleteDialogVisible" width="500px">
      <el-form :model="deleteForm" ref="deleteForm" :rules="deleteRules">
        <el-form-item label="删除理由" prop="reason" :label-width="'80px'">
          <el-input
            type="textarea"
            v-model="deleteForm.reason"
            :rows="4"
            placeholder="请输入删除此评价的理由"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="deleteDialogVisible = false">取 消</el-button>
        <el-button type="danger" @click="confirmDelete">确 定</el-button>
      </div>
    </el-dialog>

    <!-- 审核历史对话框 -->
    <el-dialog title="审核历史" :visible.sync="historyVisible" width="600px">
      <div v-if="reviewHistory.length > 0">
        <el-timeline>
          <el-timeline-item
            v-for="(history, index) in reviewHistory"
            :key="index"
            :timestamp="history.operateTime"
            :type="getHistoryItemType(history.action)"
          >
            <div class="history-item">
              <div>操作：{{ getActionText(history.action) }}</div>
              <div v-if="history.reason">删除理由：{{ history.reason }}</div>
              <div>操作人：{{ history.operatorName }}</div>
            </div>
          </el-timeline-item>
        </el-timeline>
      </div>
      <div v-else class="no-history">暂无审核记录</div>
    </el-dialog>
  </div>
</template>

<script>
import axios from '@/utils/axios'

export default {
  name: 'ReviewManagement',
  data () {
    return {
      reviews: [],
      searchQuery: '',
      statusFilter: '',
      currentPage: 1,
      pageSize: 10,
      total: 0,
      loading: false,
      viewDialogVisible: false,
      deleteDialogVisible: false,
      historyVisible: false,
      currentReview: {},
      reviewHistory: [],
      deleteForm: {
        reason: ''
      },
      deleteRules: {
        reason: [
          { required: true, message: '请输入删除理由', trigger: 'blur' },
          { min: 5, message: '删除理由至少需要5个字符', trigger: 'blur' }
        ]
      }
    }
  },
  created () {
    this.fetchReviews()
  },
  methods: {
    async fetchReviews () {
      try {
        this.loading = true
        const response = await axios.get('/admin/reviews', {
          params: {
            page: this.currentPage,
            pageSize: this.pageSize,
            status: this.statusFilter || undefined,
            search: this.searchQuery || undefined
          }
        })
        console.log('获取评价列表响应:', response.data)
        this.reviews = response.data.data
        this.total = response.data.total
      } catch (error) {
        console.error('获取评价列表失败:', error)
        this.$message.error('获取评价列表失败')
      } finally {
        this.loading = false
      }
    },
    handleSearch () {
      this.currentPage = 1
      this.fetchReviews()
    },
    handleFilter () {
      this.currentPage = 1
      this.fetchReviews()
    },
    handlePageChange (page) {
      this.currentPage = page
      this.fetchReviews()
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
        rejected: '已删除'
      }
      return texts[status] || status
    },
    handleViewDetails (review) {
      this.currentReview = review
      this.viewDialogVisible = true
    },
    async handleApprove (review) {
      try {
        await axios.put(`/admin/reviews/${review.id}/approve`)
        this.$message.success('评价已通过')
        this.fetchReviews()
      } catch (error) {
        console.error('通过评价失败:', error)
        this.$message.error('通过评价失败')
      }
    },
    handleDelete (review) {
      this.currentReview = review
      this.deleteForm.reason = ''
      this.deleteDialogVisible = true
    },
    async confirmDelete () {
      try {
        await this.$refs.deleteForm.validate()
        await axios.put(`/admin/reviews/${this.currentReview.id}/reject`, {
          reason: this.deleteForm.reason
        })
        this.$message.success('评价已删除')
        this.deleteDialogVisible = false
        this.fetchReviews()
      } catch (error) {
        if (!error.errorFields) {
          this.$message.error('操作失败')
        }
      }
    },
    async showHistory (review) {
      try {
        const response = await axios.get(`/admin/reviews/${review.id}/history`)
        this.reviewHistory = response.data
        this.historyVisible = true
      } catch (error) {
        console.error('获取审核历史失败:', error)
        this.$message.error('获取审核历史失败')
      }
    },
    getHistoryItemType (action) {
      const types = {
        approve: 'success',
        reject: 'danger'
      }
      return types[action] || 'info'
    },
    getActionText (action) {
      const texts = {
        approve: '通过审核',
        reject: '删除评价'
      }
      return texts[action] || action
    },
    handleView (review) {
      this.currentReview = review
      this.viewDialogVisible = true
    }
  }
}
</script>

<style scoped>
.review-management {
  padding: 20px;
}

.filter-section {
  margin-bottom: 20px;
  display: flex;
  gap: 20px;
}

.operation-buttons {
  display: flex;
  justify-content: center;
  gap: 5px;
  flex-wrap: wrap;
}

.operation-buttons .el-button {
  margin: 2px;
}

.score-item {
  font-size: 12px;
  line-height: 1.3;
  margin: 1px 0;
  text-align: left;
  padding-left: 5px;
}

.scores {
  display: flex;
  flex-direction: column;
  gap: 5px;
  text-align: left;
  padding: 0 10px;
}

.scores span {
  white-space: nowrap;
}

.comment-cell {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 10px;
}

.comment-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 300px;
}

.pagination {
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

.history-item {
  margin-bottom: 10px;
}

.no-history {
  text-align: center;
  color: #909399;
  padding: 20px;
}
</style>
