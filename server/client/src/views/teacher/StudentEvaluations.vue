<template>
  <div class="student-evaluations">
    <!-- 课程选择 -->
    <div class="course-select">
      <div class="header-actions">
        <el-select v-model="selectedCourse" placeholder="请选择课程" @change="handleCourseChange" class="course-select-input">
          <el-option
            v-for="course in courses"
            :key="course.id"
            :label="course.name"
            :value="course.id"
          />
        </el-select>
        <el-button type="primary" @click="exportReport" :loading="exporting">
          导出报告
        </el-button>
      </div>
    </div>

    <!-- 评分雷达图 -->
    <el-row :gutter="20" class="radar-section">
      <el-col :span="24">
        <el-card class="radar-card">
          <div slot="header">
            <span>教学评分维度分析</span>
          </div>
          <div id="radarChart" style="height: 500px"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 评分详情统计卡片 -->
    <el-row :gutter="20" class="score-cards">
      <!-- 教学内容维度 -->
      <el-col :span="8">
        <el-card class="dimension-card">
          <div slot="header">
            <span>教学内容</span>
          </div>
          <div class="score-items">
            <div class="score-item" v-for="item in scoreDetails.content" :key="item.name">
              <div class="item-name">{{ item.name }}</div>
              <div class="score-range">
                <span class="min-score">最低: {{ item.min }}</span>
                <span class="max-score">最高: {{ item.max }}</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
      <!-- 教学方法维度 -->
      <el-col :span="8">
        <el-card class="dimension-card">
          <div slot="header">
            <span>教学方法</span>
          </div>
          <div class="score-items">
            <div class="score-item" v-for="item in scoreDetails.method" :key="item.name">
              <div class="item-name">{{ item.name }}</div>
              <div class="score-range">
                <span class="min-score">最低: {{ item.min }}</span>
                <span class="max-score">最高: {{ item.max }}</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
      <!-- 教师表现维度 -->
      <el-col :span="8">
        <el-card class="dimension-card">
          <div slot="header">
            <span>教师表现</span>
          </div>
          <div class="score-items">
            <div class="score-item" v-for="item in scoreDetails.teacher" :key="item.name">
              <div class="item-name">{{ item.name }}</div>
              <div class="score-range">
                <span class="min-score">最低: {{ item.min }}</span>
                <span class="max-score">最高: {{ item.max }}</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="score-cards">
      <!-- 课程设计维度 -->
      <el-col :span="12">
        <el-card class="dimension-card">
          <div slot="header">
            <span>课程设计</span>
          </div>
          <div class="score-items">
            <div class="score-item" v-for="item in scoreDetails.course" :key="item.name">
              <div class="item-name">{{ item.name }}</div>
              <div class="score-range">
                <span class="min-score">最低: {{ item.min }}</span>
                <span class="max-score">最高: {{ item.max }}</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
      <!-- 学习效果维度 -->
      <el-col :span="12">
        <el-card class="dimension-card">
          <div slot="header">
            <span>学习效果</span>
          </div>
          <div class="score-items">
            <div class="score-item" v-for="item in scoreDetails.effect" :key="item.name">
              <div class="item-name">{{ item.name }}</div>
              <div class="score-range">
                <span class="min-score">最低: {{ item.min }}</span>
                <span class="max-score">最高: {{ item.max }}</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 关键词云 -->
    <el-row :gutter="20" class="word-cloud-section">
      <el-col :span="24">
        <el-card class="word-cloud-card">
          <div slot="header">
            <span>评价关键词云</span>
          </div>
          <div id="wordCloud" style="height: 300px"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 评分平均分柱状图 -->
    <el-row :gutter="20" class="chart-section">
      <el-col :span="24">
        <el-card class="chart-card">
          <div slot="header">
            <span>评分项平均分统计</span>
          </div>
          <div id="avgScoreChart" style="height: 400px"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import axios from '@/utils/axios'
import * as echarts from 'echarts'
import 'echarts-wordcloud'

export default {
  name: 'StudentEvaluations',
  data () {
    return {
      courses: [],
      selectedCourse: '',
      scoreDetails: {
        content: [],
        method: [],
        teacher: [],
        course: [],
        effect: []
      },
      wordCloudChart: null,
      avgScoreChart: null,
      radarChart: null,
      exporting: false
    }
  },
  methods: {
    async fetchCourses () {
      try {
        const response = await axios.get('/teacher/courses')
        this.courses = response.data
        if (this.courses.length > 0) {
          this.selectedCourse = this.courses[0].id
          this.handleCourseChange(this.selectedCourse)
        }
      } catch (error) {
        this.$message.error('获取课程列表失败')
      }
    },
    async handleCourseChange (courseId) {
      await Promise.all([
        this.fetchScoreDetails(courseId),
        this.fetchWordCloudData(courseId),
        this.fetchAverageScores(courseId)
      ])
      // 确保DOM已经渲染完成
      this.$nextTick(() => {
        this.initCharts()
      })
    },
    async fetchScoreDetails (courseId) {
      try {
        const response = await axios.get(`/teacher/evaluations/details?courseId=${courseId}`)
        this.scoreDetails = response.data
        this.initRadarChart(this.scoreDetails)
      } catch (error) {
        this.$message.error('获取评分详情失败')
      }
    },
    async fetchWordCloudData (courseId) {
      try {
        const response = await axios.get(`/teacher/evaluations/keywords?courseId=${courseId}`)
        this.initWordCloud(response.data)
      } catch (error) {
        this.$message.error('获取关键词数据失败')
      }
    },
    async fetchAverageScores (courseId) {
      try {
        const response = await axios.get(`/teacher/evaluations/averages?courseId=${courseId}`)
        this.initAverageScoreChart(response.data)
      } catch (error) {
        this.$message.error('获取平均分数据失败')
      }
    },
    initCharts () {
      if (!this.wordCloudChart) {
        this.wordCloudChart = echarts.init(document.getElementById('wordCloud'))
      }
      if (!this.avgScoreChart) {
        this.avgScoreChart = echarts.init(document.getElementById('avgScoreChart'))
      }
      if (!this.radarChart) {
        this.radarChart = echarts.init(document.getElementById('radarChart'))
      }
    },
    initWordCloud (data) {
      if (!this.wordCloudChart) {
        this.wordCloudChart = echarts.init(document.getElementById('wordCloud'))
      }
      const option = {
        series: [{
          type: 'wordCloud',
          shape: 'circle',
          left: 'center',
          top: 'center',
          width: '90%',
          height: '90%',
          right: null,
          bottom: null,
          sizeRange: [12, 60],
          rotationRange: [-90, 90],
          rotationStep: 45,
          gridSize: 8,
          drawOutOfBound: false,
          textStyle: {
            fontFamily: 'sans-serif',
            fontWeight: 'bold',
            color: function () {
              return 'rgb(' + [
                Math.round(Math.random() * 160),
                Math.round(Math.random() * 160),
                Math.round(Math.random() * 160)
              ].join(',') + ')'
            }
          },
          emphasis: {
            focus: 'self',
            textStyle: {
              shadowBlur: 10,
              shadowColor: '#333'
            }
          },
          data: data
        }]
      }
      this.wordCloudChart.setOption(option)
    },
    initAverageScoreChart (data) {
      if (!this.avgScoreChart) {
        this.avgScoreChart = echarts.init(document.getElementById('avgScoreChart'))
      }
      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'value',
          max: 10
        },
        yAxis: {
          type: 'category',
          data: data.map(item => item.name),
          axisLabel: {
            interval: 0,
            rotate: 30
          }
        },
        series: [{
          name: '平均分',
          type: 'bar',
          data: data.map(item => item.average),
          itemStyle: {
            color: function (params) {
              const colorList = [
                '#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de',
                '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc'
              ]
              return colorList[params.dataIndex % colorList.length]
            }
          },
          label: {
            show: true,
            position: 'right',
            formatter: '{c} 分'
          }
        }]
      }
      this.avgScoreChart.setOption(option)
    },
    initRadarChart (data) {
      if (!this.radarChart) {
        this.radarChart = echarts.init(document.getElementById('radarChart'))
      }

      // 准备雷达图的指标数据
      const indicators = [
        // 教学内容维度
        { name: '内容丰富性', max: 10 },
        { name: '内容更新性', max: 5 },
        { name: '内容组织', max: 5 },
        // 教学方法维度
        { name: '教学方法多样性', max: 10 },
        { name: '互动性', max: 5 },
        { name: '教学资源利用', max: 5 },
        // 教师表现维度
        { name: '教学态度', max: 10 },
        { name: '教学能力', max: 5 },
        { name: '亲和力', max: 5 },
        // 课程设计维度
        { name: '课程目标明确性', max: 10 },
        { name: '课程难度', max: 5 },
        { name: '课程进度', max: 5 },
        // 学习效果维度
        { name: '知识掌握', max: 10 },
        { name: '能力提升', max: 5 },
        { name: '兴趣激发', max: 5 }
      ]

      // 准备最高分和最低分的数据
      const maxScores = [
        ...data.content.map(item => item.max),
        ...data.method.map(item => item.max),
        ...data.teacher.map(item => item.max),
        ...data.course.map(item => item.max),
        ...data.effect.map(item => item.max)
      ]

      const minScores = [
        ...data.content.map(item => item.min),
        ...data.method.map(item => item.min),
        ...data.teacher.map(item => item.min),
        ...data.course.map(item => item.min),
        ...data.effect.map(item => item.min)
      ]

      const option = {
        tooltip: {
          trigger: 'item',
          formatter: function (params) {
            if (params.seriesType === 'radar' && params.value && typeof params.value[params.dimensionIndex] === 'number') {
              const dimensionName = params.name
              const value = params.value[params.dimensionIndex]
              return `${dimensionName}：${value.toFixed(1)}分`
            }
            return ''
          }
        },
        legend: {
          data: ['最高分', '最低分'],
          bottom: 0
        },
        radar: {
          indicator: indicators,
          shape: 'polygon',
          splitNumber: 5,
          center: ['50%', '50%'],
          radius: '65%',
          name: {
            textStyle: {
              color: '#333',
              fontSize: 12
            }
          },
          splitLine: {
            lineStyle: {
              color: [
                'rgba(238, 197, 102, 0.1)', 'rgba(238, 197, 102, 0.2)',
                'rgba(238, 197, 102, 0.4)', 'rgba(238, 197, 102, 0.6)',
                'rgba(238, 197, 102, 0.8)', 'rgba(238, 197, 102, 1)'
              ].reverse()
            }
          },
          splitArea: {
            show: true,
            areaStyle: {
              color: ['rgba(255,255,255,0.3)', 'rgba(200,200,200,0.1)']
            }
          }
        },
        series: [
          {
            name: '评分范围',
            type: 'radar',
            data: [
              {
                value: maxScores,
                name: '最高分',
                symbolSize: 6,
                itemStyle: {
                  color: '#67c23a'
                },
                lineStyle: {
                  width: 2,
                  color: '#67c23a'
                },
                areaStyle: {
                  color: 'rgba(103,194,58,0.2)'
                }
              },
              {
                value: minScores,
                name: '最低分',
                symbolSize: 6,
                itemStyle: {
                  color: '#f56c6c'
                },
                lineStyle: {
                  width: 2,
                  color: '#f56c6c'
                },
                areaStyle: {
                  color: 'rgba(245,108,108,0.2)'
                }
              }
            ]
          }
        ]
      }

      this.radarChart.setOption(option)
    },
    handleResize () {
      this.wordCloudChart?.resize()
      this.avgScoreChart?.resize()
      this.radarChart?.resize()
    },
    async exportReport () {
      if (!this.selectedCourse) {
        this.$message.warning('请先选择课程')
        return
      }

      this.exporting = true
      try {
        const response = await axios.get(`/teacher/evaluations/report?courseId=${this.selectedCourse}`, {
          responseType: 'blob'
        })

        const blob = new Blob([response.data], { type: 'application/pdf' })
        const courseName = this.courses.find(c => c.id === this.selectedCourse)?.name || '未命名'
        const defaultFileName = `教学评价报告_${courseName}_${new Date().toLocaleDateString()}.pdf`

        // 使用showSaveFilePicker API来让用户选择保存位置
        try {
          const handle = await window.showSaveFilePicker({
            suggestedName: defaultFileName,
            types: [{
              description: 'PDF文件',
              accept: { 'application/pdf': ['.pdf'] }
            }]
          })
          const writable = await handle.createWritable()
          await writable.write(blob)
          await writable.close()
          this.$message.success('报告导出成功')
        } catch (err) {
          if (err.name !== 'AbortError') {
            // 如果浏览器不支持showSaveFilePicker，回退到传统下载方式
            const url = window.URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = defaultFileName
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            window.URL.revokeObjectURL(url)
            this.$message.success('报告导出成功')
          }
        }
      } catch (error) {
        this.$message.error('报告导出失败')
        console.error('导出报告失败:', error)
      } finally {
        this.exporting = false
      }
    }
  },
  mounted () {
    this.fetchCourses()
    window.addEventListener('resize', this.handleResize)
  },
  beforeDestroy () {
    window.removeEventListener('resize', this.handleResize)
    this.wordCloudChart?.dispose()
    this.avgScoreChart?.dispose()
    this.radarChart?.dispose()
  }
}
</script>

<style scoped>
.student-evaluations {
  padding: 20px;
}

.course-select {
  margin-bottom: 20px;
}

.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.course-select-input {
  width: 300px;
}

.radar-section {
  margin-bottom: 20px;
}

.radar-card {
  margin-bottom: 20px;
}

.word-cloud-section,
.chart-section {
  margin-bottom: 20px;
}

.chart-card {
  margin-bottom: 20px;
}

.score-cards {
  margin-bottom: 20px;
}

.dimension-card {
  margin-bottom: 20px;
}

.score-items {
  padding: 10px;
}

.score-item {
  margin-bottom: 15px;
  padding: 10px;
  background-color: #f8f9fa;
  border-radius: 4px;
}

.item-name {
  font-weight: bold;
  margin-bottom: 8px;
  color: #303133;
}

.score-range {
  display: flex;
  justify-content: space-between;
  color: #606266;
}

.min-score {
  color: #f56c6c;
}

.max-score {
  color: #67c23a;
}

:deep(.el-card__header) {
  padding: 15px 20px;
  font-weight: bold;
  background-color: #f5f7fa;
}
</style>
