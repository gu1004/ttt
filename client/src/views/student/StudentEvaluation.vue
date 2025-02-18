<template>
  <div class="evaluation-page">
    <!-- 搜索和筛选区域 -->
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item>
          <el-input
            v-model="searchForm.keyword"
            placeholder="搜索课程名或教师"
            prefix-icon="el-icon-search"
            clearable
            @clear="handleSearch"
          />
        </el-form-item>
        <el-form-item>
          <el-select v-model="searchForm.status" placeholder="评价状态" clearable @change="handleSearch">
            <el-option label="待评价" value="none" />
            <el-option label="待审核" value="pending" />
            <el-option label="已通过" value="approved" />
            <el-option label="已驳回" value="rejected" />
          </el-select>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 课程列表 -->
    <el-card class="course-list">
      <el-table :data="filteredCourses" v-loading="loading">
        <el-table-column prop="name" label="课程名称" />
        <el-table-column prop="teacherName" label="授课教师">
          <template slot="header">
          </template>
          <template slot-scope="scope">
            <span>{{ scope.row.teacherName }}</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template slot-scope="scope">
            <el-tag :type="getStatusType(scope.row)">
              {{ getStatusText(scope.row) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120">
          <template slot-scope="scope">
            <el-button
              type="primary"
              size="small"
              @click="handleEvaluate(scope.row)"
              :disabled="isButtonDisabled(scope.row)"
            >
              {{ getButtonText(scope.row) }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 评价表单对话框 -->
    <el-dialog
      :title="dialogTitle"
      width="70%"
      :visible.sync="dialogVisible"
      :before-close="handleClose"
    >
      <!-- 查看评价的内容 -->
      <div v-if="currentCourse.evaluated || currentCourse.expired">
        <div class="evaluation-detail">
          <div class="detail-header">
            <h3>{{ currentCourse.name }}</h3>
            <div class="course-info">
              <span class="info-item">授课教师：{{ currentCourse.teacherName }}</span>
              <span class="info-item" v-if="currentCourse.evaluationStatus === 'pending'">状态：审核中</span>
            </div>
          </div>
          <el-divider></el-divider>
          <div class="detail-content">
            <!-- 教学内容维度 -->
            <div class="evaluation-dimension">
              <span class="dimension-label">教学内容</span>
              <span class="score-label">得分</span>
            </div>
            <div class="score-item">
              <div class="score-label-group">
                <span class="label">内容丰富性</span>
                <span class="standard">(10分)</span>
              </div>
              <span class="score-value">{{ evaluationDetail.content_richness }}</span>
            </div>
            <div class="score-item">
              <div class="score-label-group">
                <span class="label">内容更新性</span>
                <span class="standard">(5分)</span>
              </div>
              <span class="score-value">{{ evaluationDetail.content_update }}</span>
            </div>
            <div class="score-item">
              <div class="score-label-group">
                <span class="label">内容组织</span>
                <span class="standard">(5分)</span>
              </div>
              <span class="score-value">{{ evaluationDetail.content_organization }}</span>
            </div>

            <!-- 教学方法维度 -->
            <div class="evaluation-dimension">
              <span class="dimension-label">教学方法</span>
              <span class="score-label">得分</span>
            </div>
            <div class="score-item">
              <div class="score-label-group">
                <span class="label">教学方法多样性</span>
                <span class="standard">(10分)</span>
              </div>
              <span class="score-value">{{ evaluationDetail.teaching_method_diversity }}</span>
            </div>
            <div class="score-item">
              <div class="score-label-group">
                <span class="label">互动性</span>
                <span class="standard">(5分)</span>
              </div>
              <span class="score-value">{{ evaluationDetail.teaching_interaction }}</span>
            </div>
            <div class="score-item">
              <div class="score-label-group">
                <span class="label">教学资源利用</span>
                <span class="standard">(5分)</span>
              </div>
              <span class="score-value">{{ evaluationDetail.teaching_resource }}</span>
            </div>

            <!-- 教师表现维度 -->
            <div class="evaluation-dimension">
              <span class="dimension-label">教师表现</span>
              <span class="score-label">得分</span>
            </div>
            <div class="score-item">
              <div class="score-label-group">
                <span class="label">教学态度</span>
                <span class="standard">(10分)</span>
              </div>
              <span class="score-value">{{ evaluationDetail.teacher_attitude }}</span>
            </div>
            <div class="score-item">
              <div class="score-label-group">
                <span class="label">教学能力</span>
                <span class="standard">(5分)</span>
              </div>
              <span class="score-value">{{ evaluationDetail.teacher_ability }}</span>
            </div>
            <div class="score-item">
              <div class="score-label-group">
                <span class="label">亲和力</span>
                <span class="standard">(5分)</span>
              </div>
              <span class="score-value">{{ evaluationDetail.teacher_personality }}</span>
            </div>

            <!-- 课程设计维度 -->
            <div class="evaluation-dimension">
              <span class="dimension-label">课程设计</span>
              <span class="score-label">得分</span>
            </div>
            <div class="score-item">
              <div class="score-label-group">
                <span class="label">课程目标明确性</span>
                <span class="standard">(10分)</span>
              </div>
              <span class="score-value">{{ evaluationDetail.course_objective }}</span>
            </div>
            <div class="score-item">
              <div class="score-label-group">
                <span class="label">课程难度</span>
                <span class="standard">(5分)</span>
              </div>
              <span class="score-value">{{ evaluationDetail.course_difficulty }}</span>
            </div>
            <div class="score-item">
              <div class="score-label-group">
                <span class="label">课程进度</span>
                <span class="standard">(5分)</span>
              </div>
              <span class="score-value">{{ evaluationDetail.course_pace }}</span>
            </div>

            <!-- 学习效果维度 -->
            <div class="evaluation-dimension">
              <span class="dimension-label">学习效果</span>
              <span class="score-label">得分</span>
            </div>
            <div class="score-item">
              <div class="score-label-group">
                <span class="label">知识掌握</span>
                <span class="standard">(10分)</span>
              </div>
              <span class="score-value">{{ evaluationDetail.knowledge_grasp }}</span>
            </div>
            <div class="score-item">
              <div class="score-label-group">
                <span class="label">能力提升</span>
                <span class="standard">(5分)</span>
              </div>
              <span class="score-value">{{ evaluationDetail.ability_improvement }}</span>
            </div>
            <div class="score-item">
              <div class="score-label-group">
                <span class="label">兴趣激发</span>
                <span class="standard">(5分)</span>
              </div>
              <span class="score-value">{{ evaluationDetail.interest_stimulation }}</span>
            </div>

            <!-- 总分显示 -->
            <div class="total-score1">
              <span class="total-label1">总分</span>
              <span class="total-value1">{{ evaluationDetail.total_score }} / 100</span>
            </div>

            <div class="comment-section">
              <div class="comment-label">评价内容：</div>
              <div class="comment-content">{{ evaluationDetail.comment }}</div>
            </div>
            <div class="evaluation-time">
              评价时间：{{ formatDate(evaluationDetail.create_time) }}
            </div>
          </div>
        </div>
      </div>

      <!-- 评价表单的内容 -->
      <div v-else>
        <div class="evaluation-form" v-if="currentCourse.id">
          <!-- 错误提示区域 -->
          <el-alert
            v-if="submitError"
            :title="submitError"
            type="error"
            :closable="true"
            show-icon
            style="margin-bottom: 20px;"
            @close="submitError = ''"
          />

          <!-- 课程信息 -->
          <div class="course-info">
            <h3>课程信息</h3>
            <el-descriptions :column="2" border>
              <el-descriptions-item label="课程名称">{{ currentCourse.name }}</el-descriptions-item>
              <el-descriptions-item label="授课教师">{{ currentCourse.teacherName }}</el-descriptions-item>
            </el-descriptions>
          </div>

          <!-- 评分表格 -->
          <div class="evaluation-table">
            <h3>课程评价</h3>
            <el-table
              :data="evaluationItems"
              border
              style="width: 100%"
              :span-method="objectSpanMethod">
              <el-table-column
                prop="dimension"
                label="评价维度"
                width="150">
              </el-table-column>
              <el-table-column
                prop="indicator"
                label="评价指标"
                width="180">
              </el-table-column>
              <el-table-column
                prop="standard"
                label="评分标准(分)"
                width="150"
                align="center">
              </el-table-column>
              <el-table-column
                label="评分"
                width="180"
                align="center">
                <template slot-scope="scope">
                  <el-input-number
                    v-model="evaluationForm[scope.row.field]"
                    :min="0"
                    :max="scope.row.standard"
                    :step="1"
                    @change="calculateTotal"
                    size="small">
                  </el-input-number>
                </template>
              </el-table-column>
              <el-table-column
                prop="remark"
                label="备注"
                show-overflow-tooltip>
              </el-table-column>
            </el-table>

            <!-- 总分显示 -->
            <div class="total-score">
              <span class="total-label">总分</span>
              <span class="total-value">{{ totalScore }} / 100</span>
            </div>

            <!-- 评价意见 -->
            <div class="comment-section">
              <h3>评价意见</h3>
              <el-input
                type="textarea"
                v-model="evaluationForm.comment"
                :rows="4"
                placeholder="请输入您的评价意见（优点、建议等）">
              </el-input>
            </div>
          </div>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">关闭</el-button>
        <el-button
          v-if="!currentCourse.evaluated && !currentCourse.expired"
          type="primary"
          @click="submitEvaluation"
        >
          提交评价
        </el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import axios from '@/utils/axios'

export default {
  name: 'StudentEvaluation',
  data () {
    return {
      loading: false,
      pendingCourses: [],
      dialogVisible: false,
      currentCourse: {},
      evaluationForm: {
        content_richness: 0,
        content_update: 0,
        content_organization: 0,
        teaching_method_diversity: 0,
        teaching_interaction: 0,
        teaching_resource: 0,
        teacher_attitude: 0,
        teacher_ability: 0,
        teacher_personality: 0,
        course_objective: 0,
        course_difficulty: 0,
        course_pace: 0,
        knowledge_grasp: 0,
        ability_improvement: 0,
        interest_stimulation: 0,
        comment: ''
      },
      colors: ['#99A9BF', '#F7BA2A', '#FF9900'],
      rateTexts: ['很差', '较差', '一般', '良好', '优秀'],
      rules: {
        content_richness: [{ required: true, message: '请评价内容丰富性', trigger: 'change' }],
        content_update: [{ required: true, message: '请评价内容更新性', trigger: 'change' }],
        content_organization: [{ required: true, message: '请评价内容组织', trigger: 'change' }],
        teaching_method_diversity: [{ required: true, message: '请评价教学方法多样性', trigger: 'change' }],
        teaching_interaction: [{ required: true, message: '请评价互动性', trigger: 'change' }],
        teaching_resource: [{ required: true, message: '请评价教学资源利用', trigger: 'change' }],
        teacher_attitude: [{ required: true, message: '请评价教学态度', trigger: 'change' }],
        teacher_ability: [{ required: true, message: '请评价教学能力', trigger: 'change' }],
        teacher_personality: [{ required: true, message: '请评价亲和力', trigger: 'change' }],
        course_objective: [{ required: true, message: '请评价课程目标明确性', trigger: 'change' }],
        course_difficulty: [{ required: true, message: '请评价课程难度', trigger: 'change' }],
        course_pace: [{ required: true, message: '请评价课程进度', trigger: 'change' }],
        knowledge_grasp: [{ required: true, message: '请评价知识掌握', trigger: 'change' }],
        ability_improvement: [{ required: true, message: '请评价能力提升', trigger: 'change' }],
        interest_stimulation: [{ required: true, message: '请评价兴趣激发', trigger: 'change' }],
        comment: [{ required: true, message: '请填写具体意见', trigger: 'blur' }]
      },
      searchForm: {
        keyword: '',
        status: ''
      },
      evaluationDetail: {},
      dialogTitle: '',
      evaluationItems: [
        { dimension: '教学内容', indicator: '内容丰富性', standard: 10, field: 'content_richness', remark: '课程内容是否全面、深入，是否涵盖了课程大纲中的所有重要知识点' },
        { dimension: '教学内容', indicator: '内容更新性', standard: 5, field: 'content_update', remark: '课程内容是否及时更新，是否包含学科前沿知识和最新研究成果' },
        { dimension: '教学内容', indicator: '内容组织', standard: 5, field: 'content_organization', remark: '课程内容的组织结构是否合理，知识点的衔接是否流畅，难度递进是否适当' },
        { dimension: '教学方法', indicator: '教学方法多样性', standard: 10, field: 'teaching_method_diversity', remark: '是否采用多样化的教学方法，如讲授、讨论、案例分析、实践等' },
        { dimension: '教学方法', indicator: '互动性', standard: 5, field: 'teaching_interaction', remark: '课堂互动的效果，包括师生互动、生生互动的频率和质量' },
        { dimension: '教学方法', indicator: '教学资源利用', standard: 5, field: 'teaching_resource', remark: '教学资源的使用是否合理有效，包括多媒体、教材、参考资料等' },
        { dimension: '教师表现', indicator: '教学态度', standard: 10, field: 'teacher_attitude', remark: '教师的教学态度是否认真负责，包括备课情况、课堂纪律管理、作业批改及答疑等' },
        { dimension: '教师表现', indicator: '教学能力', standard: 5, field: 'teacher_ability', remark: '教师的专业知识水平、语言表达能力、课堂组织能力等' },
        { dimension: '教师表现', indicator: '亲和力', standard: 5, field: 'teacher_personality', remark: '教师的亲和力，包括与学生的沟通能力、情绪管理、因材施教等' },
        { dimension: '课程设计', indicator: '课程目标明确性', standard: 10, field: 'course_objective', remark: '课程目标是否明确，是否符合专业培养方案的要求' },
        { dimension: '课程设计', indicator: '课程难度', standard: 5, field: 'course_difficulty', remark: '课程整体难度是否适中，是否符合学生的知识基础和接受能力' },
        { dimension: '课程设计', indicator: '课程进度', standard: 5, field: 'course_pace', remark: '课程进度安排是否合理，是否给予学生足够的时间理解和消化知识' },
        { dimension: '学习效果', indicator: '知识掌握', standard: 10, field: 'knowledge_grasp', remark: '是否掌握了预期的知识点和技能，理解程度如何' },
        { dimension: '学习效果', indicator: '能力提升', standard: 5, field: 'ability_improvement', remark: '是否提升了相关能力，如分析问题、解决问题、创新思维等能力' },
        { dimension: '学习效果', indicator: '兴趣激发', standard: 5, field: 'interest_stimulation', remark: '是否激发了对学科的兴趣，是否培养了持续学习的动力' }
      ],
      totalScore: 0,
      submitError: ''
    }
  },
  created () {
    this.fetchPendingCourses()
  },
  computed: {
    filteredCourses () {
      let result = [...this.pendingCourses].map(course => ({
        ...course,
        evaluated: course.evaluation_status === 'pending' || course.evaluation_status === 'approved',
        evaluationStatus: course.evaluation_status
      }))

      // 关键词搜索
      if (this.searchForm.keyword) {
        const keyword = this.searchForm.keyword.toLowerCase()
        result = result.filter(course =>
          course.name.toLowerCase().includes(keyword) ||
          course.teacherName.toLowerCase().includes(keyword)
        )
      }

      // 状态筛选
      if (this.searchForm.status === 'none') {
        // 筛选待评价的课程
        result = result.filter(course => !course.evaluation_status)
      } else if (this.searchForm.status) {
        // 筛选其他状态的课程
        result = result.filter(course => course.evaluation_status === this.searchForm.status)
      }

      return result
    }
  },
  methods: {
    async fetchPendingCourses () {
      try {
        this.loading = true
        const response = await axios.get('/student/pending-courses')
        this.pendingCourses = response.data
      } catch (error) {
        this.$message.error('获取待评价课程失败')
      } finally {
        this.loading = false
      }
    },
    async handleEvaluate (course) {
      this.currentCourse = course
      this.dialogTitle = course.evaluated ? '评价详情' : `课程评价 - ${course.name}`

      if (course.evaluated) {
        try {
          const response = await axios.get(`/student/evaluations/${course.id}`)
          console.log('API返回的原始数据:', response.data)

          // 确保所有评分字段都是数字类型
          const processedData = {}
          this.evaluationItems.forEach(item => {
            const value = response.data[item.field]
            processedData[item.field] = value !== undefined && value !== null ? Number(value) : 0
          })

          this.evaluationDetail = {
            ...response.data,
            ...processedData
          }

          console.log('处理后的评价详情:', this.evaluationDetail)
        } catch (error) {
          console.error('获取评价详情失败:', error.response || error)
          this.$message.error(`获取评价详情失败: ${error.response?.data?.message || error.message}`)
          return
        }
      } else if (course.expired) {
        this.$message.warning('该课程评价已截止')
        return
      } else {
        this.resetForm()
      }

      this.dialogVisible = true
    },
    handleClose () {
      this.dialogVisible = false
      if (!this.currentCourse.evaluated) {
        this.resetForm()
      }
    },
    resetForm () {
      this.evaluationForm = {
        content_richness: 0,
        content_update: 0,
        content_organization: 0,
        teaching_method_diversity: 0,
        teaching_interaction: 0,
        teaching_resource: 0,
        teacher_attitude: 0,
        teacher_ability: 0,
        teacher_personality: 0,
        course_objective: 0,
        course_difficulty: 0,
        course_pace: 0,
        knowledge_grasp: 0,
        ability_improvement: 0,
        interest_stimulation: 0,
        comment: ''
      }
      if (this.$refs.evaluationForm) {
        this.$refs.evaluationForm.resetFields()
      }
    },
    async submitEvaluation () {
      try {
        // 检查所有评分是否已填写
        const hasEmptyScores = Object.keys(this.evaluationForm).some(key => {
          return key !== 'comment' && this.evaluationForm[key] === 0
        })

        if (hasEmptyScores) {
          this.$message.warning('请为所有评价指标打分')
          return
        }

        if (!this.evaluationForm.comment.trim()) {
          this.$message.warning('请填写评价意见')
          return
        }

        await axios.post(`/student/evaluations/${this.currentCourse.id}`, {
          ...this.evaluationForm,
          courseId: this.currentCourse.id
        })

        this.$message.success('评价提交成功')
        this.dialogVisible = false
        this.fetchPendingCourses()
      } catch (error) {
        console.error('评价提交失败:', error)
        this.submitError = error.response?.data?.message || '评价提交失败'
        // 滚动到错误提示区域
        this.$nextTick(() => {
          const alertElement = document.querySelector('.el-alert')
          if (alertElement) {
            alertElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }
        })
      }
    },
    handleSearch () {
      // 搜索功能通过计算属性自动实现
    },
    formatDate (date) {
      if (!date) return ''
      return new Date(date).toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    },
    getStatusType (course) {
      if (course.evaluationStatus === 'deleted') return 'danger'
      if (!course.evaluationStatus) return 'warning'
      const statusMap = {
        pending: 'info',
        approved: 'success',
        rejected: 'danger'
      }
      return statusMap[course.evaluationStatus] || 'warning'
    },
    getStatusText (course) {
      if (course.evaluationStatus === 'deleted') return '已驳回'
      if (!course.evaluationStatus) return '待评价'
      const statusMap = {
        pending: '审核中',
        approved: '已通过',
        rejected: '已驳回'
      }
      return statusMap[course.evaluationStatus] || '待评价'
    },
    getButtonText (course) {
      if (course.evaluationStatus === 'deleted') {
        return course.expired ? '已截止' : '重新评价'
      }
      if (!course.evaluationStatus) return '去评价'
      const buttonMap = {
        pending: '查看评价',
        approved: '查看评价',
        rejected: course.expired ? '已截止' : '重新评价'
      }
      return buttonMap[course.evaluationStatus] || '去评价'
    },
    isButtonDisabled (course) {
      if (course.evaluationStatus === 'rejected' && course.expired) {
        return true
      }
      return false
    },
    objectSpanMethod ({ row, column, rowIndex, columnIndex }) {
      if (columnIndex === 0) {
        const dimension = row.dimension
        const firstIndex = this.evaluationItems.findIndex(item => item.dimension === dimension)
        const count = this.evaluationItems.filter(item => item.dimension === dimension).length
        if (rowIndex === firstIndex) {
          return {
            rowspan: count,
            colspan: 1
          }
        } else {
          return {
            rowspan: 0,
            colspan: 0
          }
        }
      }
    },
    calculateTotal () {
      let total = 0
      // 遍历所有评分项
      this.evaluationItems.forEach(item => {
        const score = Number(this.evaluationForm[item.field] || 0)
        total += score
      })
      this.totalScore = total
    },
    calculateViewTotal () {
      if (!this.evaluationDetail) return 0
      let total = 0

      // 遍历所有评分项并确保转换为数字
      this.evaluationItems.forEach(item => {
        const score = this.evaluationDetail[item.field]
        if (score !== undefined && score !== null) {
          total += Number(score)
        }
      })

      return Number(total.toFixed(1))
    }
  }
}
</script>

<style scoped>
.evaluation-page {
  padding: 20px;
}

.search-card {
  margin-bottom: 20px;
}

.search-form {
  display: flex;
  align-items: center;
}

.search-form .el-form-item {
  margin-bottom: 0;
  margin-right: 20px;
}

.search-form .el-input {
  width: 300px;
}

.search-form .el-select {
  width: 120px;
}

.course-list {
  margin-bottom: 20px;
}

.course-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  font-size: 16px;
  margin-bottom: 20px;
  background-color: #f5f7fa;
  padding: 12px 20px;
  border-radius: 4px;
}

.info-item {
  color: #303133;
}

.info-divider {
  margin: 0 15px;
  color: #909399;
}

.evaluation-dimension {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  background-color: #f5f7fa;
  margin-top: 15px;
  font-weight: bold;
}

.dimension-label {
  color: #303133;
  text-align: left;
}

.score-label {
  color: #303133;
  padding-right: 0;
  text-align: right;
}

.score-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 20px;
  border-bottom: 1px solid #ebeef5;
}

.score-label-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.score-value {
  color: #303133;
  font-weight: 500;
  padding-right: 0;
}

.total-score1 {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  padding: 15px 20px;
  margin-top: 20px;
  border-radius: 4px;
}

.total-label1 {
  font-weight: bold;
  color: #303133;
  margin-right: 20px;
}

.total-value1 {
  color: #67c23a;
  font-weight: bold;
  padding-right: 0;
}
.total-score {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  padding: 15px 20px;
  margin-top: 20px;
  border-radius: 4px;
}

.total-label {
  font-weight: bold;
  color: #303133;
  margin-right: 20px;
}

.total-value {
  color: #67c23a;
  font-weight: bold;
  padding-right: 0;
}
.evaluation-detail {
  padding: 20px;
}

.detail-header {
  margin-bottom: 20px;
}

.detail-header h3 {
  margin: 0;
  font-size: 20px;
  color: #303133;
}

.detail-header p {
  margin: 5px 0;
  color: #606266;
}

.detail-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.total-score-display {
  text-align: right;
  font-size: 18px;
  font-weight: bold;
  color: #303133;
  margin: 20px 0;
  padding: 15px;
  background-color: #f0f9eb;
  border-radius: 4px;
}

.comment-section {
  margin-top: 20px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 4px;
  display: flex;
  align-items: flex-start;
}

.comment-label {
  font-weight: bold;
  color: #303133;
  margin-right: 10px;
  white-space: nowrap;
}

.comment-content {
  color: #606266;
  line-height: 1.6;
  white-space: pre-wrap;
}

.evaluation-time {
  margin-top: 15px;
  text-align: right;
  color: #909399;
  font-size: 14px;
}

.status-text {
  color: #e6a23c;
  font-weight: 500;
}

.evaluation-section {
  margin-bottom: 30px;
  padding: 20px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
}

.evaluation-section h3 {
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #ebeef5;
  color: #303133;
}

.el-rate {
  margin-top: 10px;
}

.el-form-item {
  margin-bottom: 25px;
}

.evaluation-table {
  margin-top: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.05);
}

.evaluation-table h3 {
  padding: 20px;
  margin: 0;
  border-bottom: 1px solid #ebeef5;
  font-size: 18px;
  color: #303133;
}

.evaluation-table :deep(.el-table) {
  border: none;
  border-radius: 8px;
}

.evaluation-table :deep(.el-table th) {
  background-color: #f5f7fa;
  color: #606266;
  font-weight: 600;
  padding: 12px 0;
}

.evaluation-table :deep(.el-table td) {
  padding: 16px 0;
}

.evaluation-table :deep(.el-table--border td:first-child) {
  border-left: none;
}

.evaluation-table :deep(.el-table--border td:last-child) {
  border-right: none;
}

.evaluation-table :deep(.el-input-number) {
  width: 120px;
}

.evaluation-table :deep(.el-input-number .el-input__inner) {
  text-align: center;
}
</style>
