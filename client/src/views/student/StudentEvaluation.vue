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
        <el-table-column
          prop="status_text"
          label="状态"
          width="120"
          align="center"
        >
          <template slot-scope="scope">
            <el-tag :type="getStatusType(scope.row)">
              {{ getStatusText(scope.row) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
          width="120"
          align="center"
        >
          <template slot-scope="scope">
            <el-button
              :type="getButtonType(scope.row)"
              size="mini"
              :disabled="isButtonDisabled(scope.row)"
              @click="handleAction(scope.row)"
            >
              {{ getButtonText(scope.row) }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 评价表单对话框 -->
    <el-dialog
      title="课程评价"
      :visible.sync="dialogVisible"
      width="60%"
      :before-close="handleClose"
    >
      <div v-if="currentCourse" class="evaluation-form">
        <!-- 添加评价时间提示 -->
        <div class="evaluation-time-info">
          <el-alert
            :title="getTimeInfoTitle(currentCourse)"
            :type="getTimeInfoType(currentCourse)"
            :description="getTimeInfoDescription(currentCourse)"
            show-icon
            :closable="false"
            style="margin-bottom: 20px"
              />
            </div>

        <!-- 添加错误提示区域 -->
        <el-alert
          v-if="submitError"
          :title="submitError"
          type="error"
          show-icon
          :closable="true"
          @close="submitError = ''"
          style="margin-bottom: 20px"
        />

        <!-- 评价表单内容 -->
        <el-form
          ref="evaluationForm"
          :model="evaluationForm"
          :rules="rules"
          label-width="120px"
          :disabled="!isInEvaluationPeriod(currentCourse)"
        >
          <!-- 内容维度 (30分) -->
          <div class="evaluation-dimension">
            <span class="dimension-label">课程内容 (30分)</span>
          </div>
          <el-form-item label="内容丰富性" prop="content_richness">
            <el-rate v-model="evaluationForm.content_richness" :max="10" :texts="rateTexts" show-text></el-rate>
          </el-form-item>
          <el-form-item label="内容更新性" prop="content_update">
            <el-rate v-model="evaluationForm.content_update" :max="5" :texts="rateTexts" show-text></el-rate>
          </el-form-item>
          <el-form-item label="内容组织" prop="content_organization">
            <el-rate v-model="evaluationForm.content_organization" :max="5" :texts="rateTexts" show-text></el-rate>
          </el-form-item>

          <!-- 教学方法 (20分) -->
          <div class="evaluation-dimension">
            <span class="dimension-label">教学方法 (20分)</span>
          </div>
          <el-form-item label="教学方法多样性" prop="teaching_method_diversity">
            <el-rate v-model="evaluationForm.teaching_method_diversity" :max="10" :texts="rateTexts" show-text></el-rate>
          </el-form-item>
          <el-form-item label="互动性" prop="teaching_interaction">
            <el-rate v-model="evaluationForm.teaching_interaction" :max="5" :texts="rateTexts" show-text></el-rate>
          </el-form-item>
          <el-form-item label="教学资源利用" prop="teaching_resource">
            <el-rate v-model="evaluationForm.teaching_resource" :max="5" :texts="rateTexts" show-text></el-rate>
              </el-form-item>

          <!-- 教师表现 (20分) -->
          <div class="evaluation-dimension">
            <span class="dimension-label">教师表现 (20分)</span>
                </div>
          <el-form-item label="教学态度" prop="teacher_attitude">
            <el-rate v-model="evaluationForm.teacher_attitude" :max="10" :texts="rateTexts" show-text></el-rate>
          </el-form-item>
          <el-form-item label="教学能力" prop="teacher_ability">
            <el-rate v-model="evaluationForm.teacher_ability" :max="5" :texts="rateTexts" show-text></el-rate>
          </el-form-item>
          <el-form-item label="亲和力" prop="teacher_personality">
            <el-rate v-model="evaluationForm.teacher_personality" :max="5" :texts="rateTexts" show-text></el-rate>
              </el-form-item>

          <!-- 课程特点 (15分) -->
          <div class="evaluation-dimension">
            <span class="dimension-label">课程特点 (15分)</span>
                </div>
          <el-form-item label="课程目标明确性" prop="course_objective">
            <el-rate v-model="evaluationForm.course_objective" :max="5" :texts="rateTexts" show-text></el-rate>
          </el-form-item>
          <el-form-item label="课程难度" prop="course_difficulty">
            <el-rate v-model="evaluationForm.course_difficulty" :max="5" :texts="rateTexts" show-text></el-rate>
          </el-form-item>
          <el-form-item label="课程进度" prop="course_pace">
            <el-rate v-model="evaluationForm.course_pace" :max="5" :texts="rateTexts" show-text></el-rate>
              </el-form-item>

          <!-- 学习效果 (15分) -->
          <div class="evaluation-dimension">
            <span class="dimension-label">学习效果 (15分)</span>
                </div>
          <el-form-item label="知识掌握" prop="knowledge_grasp">
            <el-rate v-model="evaluationForm.knowledge_grasp" :max="5" :texts="rateTexts" show-text></el-rate>
          </el-form-item>
          <el-form-item label="能力提升" prop="ability_improvement">
            <el-rate v-model="evaluationForm.ability_improvement" :max="5" :texts="rateTexts" show-text></el-rate>
          </el-form-item>
          <el-form-item label="兴趣激发" prop="interest_stimulation">
            <el-rate v-model="evaluationForm.interest_stimulation" :max="5" :texts="rateTexts" show-text></el-rate>
              </el-form-item>

          <!-- 评价意见 -->
          <el-form-item label="评价意见" prop="comment">
                <el-input
                  type="textarea"
                  v-model="evaluationForm.comment"
                  :rows="4"
              placeholder="请输入您的具体评价意见">
            </el-input>
              </el-form-item>

          <!-- 总分显示 -->
          <div class="total-score-display">
            <span class="total-score-label">总分：</span>
            <span class="total-score-value">{{ calculateTotal() }} / 100</span>
          </div>
        </el-form>
      </div>

      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button
          type="primary"
          @click="submitEvaluation"
          :disabled="!isInEvaluationPeriod(currentCourse)"
        >
          提交评价
        </el-button>
      </span>
    </el-dialog>

    <!-- 评价详情对话框 -->
    <el-dialog
      title="评价详情"
      :visible.sync="evaluationDetailVisible"
      width="60%"
      :before-close="handleDialogClose"
    >
      <div v-if="evaluationDetail" class="evaluation-detail">
        <div class="course-info">
          <h3>{{ evaluationDetail.course_name }}</h3>
          <p>授课教师：{{ evaluationDetail.teacher_name }}</p>
          <p>评价时间：{{ formatDate(evaluationDetail.create_time) }}</p>
        </div>

        <!-- 总分展示 -->
        <el-card class="total-score-card">
          <div class="total-score-container">
            <div class="total-score-label">总分</div>
            <div class="total-score-value">{{ evaluationDetail.total_score }} / 100</div>
          </div>
        </el-card>

        <!-- 评分项展示 -->
        <el-card class="score-card">
          <!-- 内容维度 (30分) -->
          <div class="score-section">
            <h4>课程内容 (30分)</h4>
            <el-row :gutter="20">
              <el-col :span="8">
                <div class="score-item">
                  <span class="label">内容丰富性 (10分)：</span>
                  <span class="value">{{ evaluationDetail.content_richness }}</span>
                </div>
              </el-col>
              <el-col :span="8">
                <div class="score-item">
                  <span class="label">内容更新性 (10分)：</span>
                  <span class="value">{{ evaluationDetail.content_update }}</span>
                </div>
              </el-col>
              <el-col :span="8">
                <div class="score-item">
                  <span class="label">内容组织 (10分)：</span>
                  <span class="value">{{ evaluationDetail.content_organization }}</span>
                </div>
              </el-col>
            </el-row>
          </div>

          <!-- 教学方法 (20分) -->
          <div class="score-section">
            <h4>教学方法 (20分)</h4>
            <el-row :gutter="20">
              <el-col :span="8">
                <div class="score-item">
                  <span class="label">教学方法多样性 (10分)：</span>
                  <span class="value">{{ evaluationDetail.teaching_method_diversity }}</span>
                </div>
              </el-col>
              <el-col :span="8">
                <div class="score-item">
                  <span class="label">互动性 (5分)：</span>
                  <span class="value">{{ evaluationDetail.teaching_interaction }}</span>
                </div>
              </el-col>
              <el-col :span="8">
                <div class="score-item">
                  <span class="label">教学资源利用 (5分)：</span>
                  <span class="value">{{ evaluationDetail.teaching_resource }}</span>
                </div>
              </el-col>
            </el-row>
          </div>

          <!-- 教师表现 (20分) -->
          <div class="score-section">
            <h4>教师表现 (20分)</h4>
            <el-row :gutter="20">
              <el-col :span="8">
                <div class="score-item">
                  <span class="label">教学态度 (10分)：</span>
                  <span class="value">{{ evaluationDetail.teacher_attitude }}</span>
                </div>
              </el-col>
              <el-col :span="8">
                <div class="score-item">
                  <span class="label">教学能力 (5分)：</span>
                  <span class="value">{{ evaluationDetail.teacher_ability }}</span>
                </div>
              </el-col>
              <el-col :span="8">
                <div class="score-item">
                  <span class="label">亲和力 (5分)：</span>
                  <span class="value">{{ evaluationDetail.teacher_personality }}</span>
                </div>
              </el-col>
            </el-row>
          </div>

          <!-- 课程特点 (15分) -->
          <div class="score-section">
            <h4>课程特点 (15分)</h4>
            <el-row :gutter="20">
              <el-col :span="8">
                <div class="score-item">
                  <span class="label">课程目标明确性 (5分)：</span>
                  <span class="value">{{ evaluationDetail.course_objective }}</span>
                </div>
              </el-col>
              <el-col :span="8">
                <div class="score-item">
                  <span class="label">课程难度 (5分)：</span>
                  <span class="value">{{ evaluationDetail.course_difficulty }}</span>
                </div>
              </el-col>
              <el-col :span="8">
                <div class="score-item">
                  <span class="label">课程进度 (5分)：</span>
                  <span class="value">{{ evaluationDetail.course_pace }}</span>
                </div>
              </el-col>
            </el-row>
          </div>

          <!-- 学习效果 (15分) -->
          <div class="score-section">
            <h4>学习效果 (15分)</h4>
            <el-row :gutter="20">
              <el-col :span="8">
                <div class="score-item">
                  <span class="label">知识掌握 (5分)：</span>
                  <span class="value">{{ evaluationDetail.knowledge_grasp }}</span>
                </div>
              </el-col>
              <el-col :span="8">
                <div class="score-item">
                  <span class="label">能力提升 (5分)：</span>
                  <span class="value">{{ evaluationDetail.ability_improvement }}</span>
                </div>
              </el-col>
              <el-col :span="8">
                <div class="score-item">
                  <span class="label">兴趣激发 (5分)：</span>
                  <span class="value">{{ evaluationDetail.interest_stimulation }}</span>
                </div>
              </el-col>
            </el-row>
          </div>

          <!-- 评价意见 -->
          <div class="comment-section">
            <h4>评价意见</h4>
            <p>{{ evaluationDetail.comment || '暂无评价意见' }}</p>
          </div>
        </el-card>
      </div>
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
      submitError: '',
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
      evaluationDetail: null,
      evaluationDetailVisible: false,
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
      totalScore: 0
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
        // 清除之前的错误信息
        this.submitError = ''

        // 检查评价时间
        if (!this.isInEvaluationPeriod(this.currentCourse)) {
          const now = new Date()
          const startTime = new Date(this.currentCourse.start_time)
          const endTime = new Date(this.currentCourse.end_time)

          console.log('评价提交时间检查:', {
            当前时间: now.toISOString(),
            开始时间: startTime.toISOString(),
            截止时间: endTime.toISOString(),
            是否已开始: now >= startTime,
            是否已结束: now > endTime
          })

          if (now < startTime) {
            this.submitError = `评价还未开始，开始时间：${startTime.toISOString()}`
          } else {
            this.submitError = `评价已截止，截止时间：${endTime.toISOString()}`
          }
          return
        }

        // 检查所有评分是否已填写
        const hasEmptyScores = Object.keys(this.evaluationForm).some(key => {
          return key !== 'comment' && this.evaluationForm[key] === 0
        })

        if (hasEmptyScores) {
          this.submitError = '请为所有评价指标打分'
          return
        }

        if (!this.evaluationForm.comment.trim()) {
          this.submitError = '请填写评价意见'
          return
        }

        // 构建评价数据
        const evaluationData = {
          ...this.evaluationForm,
          comment: this.evaluationForm.comment.trim(),
          total_score: Number(this.calculateTotal()),
          course_id: this.currentCourse.id,
          evaluation_time: new Date().toISOString()
        }

        console.log('提交评价数据:', evaluationData)

        const response = await axios.post(`/student/evaluations/${this.currentCourse.id}`, evaluationData)

        if (response.data.message) {
          this.$message.success(response.data.message)
          this.dialogVisible = false
          this.fetchPendingCourses() // 刷新课程列表
        }
      } catch (error) {
        console.error('评价提交失败:', error)
        this.submitError = error.response?.data?.message || '评价提交失败，请检查评分和评价内容'

        // 输出详细错误信息
        if (error.response) {
          console.log('错误详情:', {
            状态码: error.response.status,
            错误信息: error.response.data,
            请求数据: error.config.data
          })
        }
      }
    },
    handleSearch () {
      // 搜索功能通过计算属性自动实现
    },
    formatDate (date) {
      if (!date) return '未设置'
      return new Date(date).toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      })
    },
    getStatusType (course) {
      if (course.expired && !course.evaluation_status) {
        return 'danger' // 已截止且未评价显示红色
      }
      if (course.evaluation_status === 'approved') {
        return 'success' // 已通过显示绿色
      }
      if (course.evaluation_status === 'pending') {
        return 'info' // 审核中显示蓝色
      }
      if (course.evaluation_status === 'rejected') {
        return 'danger' // 已驳回显示红色
      }
      return 'warning' // 其他情况显示黄色
    },
    getStatusText (course) {
      // 如果未设置评价时间，不显示已截止
      if (!course.start_time || !course.end_time) {
        if (course.evaluation_status === 'approved') {
          return '已通过'
        }
        if (course.evaluation_status === 'pending') {
          return '审核中'
        }
        if (course.evaluation_status === 'rejected') {
          return '已驳回'
        }
        return '待评价'
      }

      if (this.isCourseExpired(course)) {
        if (course.evaluation_status === 'approved') {
          return '已通过'
        }
        if (course.evaluation_status === 'pending') {
          return '审核中'
        }
        if (course.evaluation_status === 'rejected') {
          return '已驳回'
        }
        return '已截止'
      }
      return course.status_text
    },
    getButtonType (course) {
      if (course.evaluation_status === 'approved' || course.evaluation_status === 'pending') {
        return 'success' // 已通过或待审核状态显示绿色
      } else if (this.isCourseExpired(course)) {
        return 'danger' // 已截止显示红色
      } else {
        return 'primary' // 其他状态显示蓝色
      }
    },
    isCourseExpired (course) {
      // 如果未设置评价时间，返回false
      if (!course.start_time || !course.end_time) {
        return false
      }
      const now = new Date()
      const endTime = new Date(course.end_time)
      return now > endTime
    },
    getButtonText (course) {
      if (course.evaluation_status === 'approved' || course.evaluation_status === 'pending') {
        return '查看评价'
      }

      const now = new Date()
      const endTime = course.end_time ? new Date(course.end_time) : null

      if (now > endTime) {
        return '已截止'
      }

      if (course.evaluation_status === 'rejected') {
        return '重新评价'
      }

      return '去评价'
    },
    isButtonDisabled (course) {
      if (course.evaluation_status === 'approved' || course.evaluation_status === 'pending') {
        return false
      }

      const now = new Date()
      const endTime = course.end_time ? new Date(course.end_time) : null

      return now > endTime
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
      // 遍历所有评分项并计算总分
      this.evaluationItems.forEach(item => {
        const score = this.evaluationForm[item.field]
        total += score * (item.standard / 5) // 将5分制转换为对应的标准分
      })
      return Math.round(total) // 四舍五入到整数
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
    },
    async handleAction (course) {
      try {
        // 如果评价状态是已通过或待审核，直接获取评价详情
        if (course.evaluation_status === 'approved' || course.evaluation_status === 'pending') {
          const response = await axios.get(`/student/evaluations/${course.id}`)
          this.evaluationDetail = response.data
          this.evaluationDetailVisible = true
          return
        }

        // 对于其他状态，检查评价时间
        if (course.end_time && new Date(course.end_time) < new Date()) {
          this.$message.warning('评价时间已截止')
          return
        }

        if (course.start_time && new Date(course.start_time) > new Date()) {
          this.$message.warning(`评价还未开始，开始时间：${course.start_time}`)
          return
        }

        // 如果是重新评价或首次评价，打开评价表单
        this.currentCourse = course
        this.resetForm() // 重置表单数据
        this.dialogVisible = true
      } catch (error) {
        console.error('处理评价操作失败:', error)
        this.$message.error(error.response?.data?.message || '操作失败')
      }
    },
    checkEvaluationTime (course) {
      const now = new Date()
      const startTime = new Date(course.start_time)
      const endTime = new Date(course.end_time)

      if (now < startTime) {
        this.$message.warning(`评价还未开始，开始时间：${course.start_time}`)
        return false
      }

      if (now > endTime) {
        return false
      }
    },
    isInEvaluationPeriod (course) {
      if (!course || !course.start_time || !course.end_time) {
        console.log('课程评价时间未设置')
        return false
      }

      const now = new Date()
      const startTime = new Date(course.start_time)
      const endTime = new Date(course.end_time)

      // 记录时间检查日志
      console.log('评价时间检查:', {
        当前时间: now.toISOString(),
        开始时间: startTime.toISOString(),
        截止时间: endTime.toISOString()
      })

      return now >= startTime && now <= endTime
    },
    getTimeInfoTitle (course) {
      if (!course.start_time || !course.end_time) {
        return '评价时间未设置'
      }

      const now = new Date()
      const startTime = new Date(course.start_time)
      const endTime = new Date(course.end_time)

      if (now < startTime) {
        return '评价未开始'
      } else if (now > endTime) {
        return '评价已截止'
      } else {
        return '评价进行中'
      }
    },
    getTimeInfoType (course) {
      if (!course.start_time || !course.end_time) {
        return 'warning'
      }

      const now = new Date()
      const startTime = new Date(course.start_time)
      const endTime = new Date(course.end_time)

      if (now < startTime) {
        return 'warning'
      } else if (now > endTime) {
        return 'error'
      } else {
        return 'success'
      }
    },
    getTimeInfoDescription (course) {
      if (!course.start_time || !course.end_time) {
        return '请联系管理员设置评价时间'
      }

      const startTime = new Date(course.start_time)
      const endTime = new Date(course.end_time)

      return `评价时间：${startTime.toLocaleString('zh-CN', { hour12: false, timeZone: 'Asia/Shanghai' })} 至 ${endTime.toLocaleString('zh-CN', { hour12: false, timeZone: 'Asia/Shanghai' })}`
    },
    handleDialogClose () {
      this.evaluationDetailVisible = false
      this.evaluationDetail = null
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

.course-info {
  margin-bottom: 20px;
}

.course-info h3 {
  margin-bottom: 10px;
  color: #303133;
}

.course-info p {
  margin: 5px 0;
  color: #606266;
}

.total-score-card {
  margin-bottom: 20px;
}

.total-score-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.total-score-label {
  font-size: 24px;
  color: #303133;
  margin-right: 20px;
}

.total-score-value {
  font-size: 36px;
  color: #f56c6c;
  font-weight: bold;
}

.score-section {
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #ebeef5;
}

.score-section h4 {
  margin-bottom: 15px;
  color: #303133;
  border-left: 4px solid #409EFF;
  padding-left: 10px;
}

.score-item {
  margin-bottom: 15px;
}

.score-item .label {
  color: #606266;
}

.score-item .value {
  color: #303133;
  font-weight: bold;
  margin-left: 5px;
}

.comment-section {
  margin-top: 20px;
  padding: 15px;
  background: #f5f7fa;
  border-radius: 4px;
}

.comment-section h4 {
  margin-bottom: 10px;
  color: #303133;
}

.comment-section p {
  color: #606266;
  line-height: 1.6;
}

.total-score-display {
  text-align: right;
  padding: 20px;
  font-size: 18px;
  background-color: #f5f7fa;
  border-radius: 4px;
  margin-top: 20px;
}

.total-score-label {
  font-weight: bold;
  color: #303133;
  margin-right: 10px;
}

.total-score-value {
  color: #f56c6c;
  font-weight: bold;
  font-size: 24px;
}
</style>
