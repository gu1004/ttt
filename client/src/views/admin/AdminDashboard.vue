/* eslint-disable */
<template>
  <div class="dashboard">
    <!-- 数据概览卡片 -->
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card shadow="hover" class="data-card">
          <div class="data-header">
            <i class="el-icon-user"></i>
            <span>学生总数</span>
          </div>
          <div class="data-content">
            <span class="number">{{ statistics.studentCount }}</span>
            <span class="unit">人</span>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="data-card">
          <div class="data-header">
            <i class="el-icon-s-custom"></i>
            <span>教师总数</span>
          </div>
          <div class="data-content">
            <span class="number">{{ statistics.teacherCount }}</span>
            <span class="unit">人</span>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="data-card">
          <div class="data-header">
            <i class="el-icon-reading"></i>
            <span>课程总数</span>
          </div>
          <div class="data-content">
            <span class="number">{{ statistics.courseCount }}</span>
            <span class="unit">门</span>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="data-card">
          <div class="data-header">
            <i class="el-icon-chat-line-square"></i>
            <span>评价总数</span>
          </div>
          <div class="data-content">
            <span class="number">{{ statistics.reviewCount }}</span>
            <span class="unit">条</span>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="12">
        <el-card shadow="hover">
          <div slot="header">
            <span>课程评分分布</span>
          </div>
          <div class="chart-container">
            <div ref="teacherScoreChart" style="height: 300px"></div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="hover">
          <div slot="header" class="chart-header">
            <span>课程总分平均分趋势</span>
            <div class="page-control">
              <el-pagination
                @current-change="handleTrendPageChange"
                :current-page.sync="trendCurrentPage"
                :page-size="10"
                layout="prev, pager, next"
                :total="trendTotal">
              </el-pagination>
            </div>
          </div>
          <div class="chart-container">
            <div ref="trendChart" style="height: 300px"></div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 课程评分图表 -->
    <el-row style="margin-top: 20px">
      <el-col :span="24">
        <el-card shadow="hover">
          <div slot="header" class="chart-header">
            <span>课程维度评分</span>
          </div>
          <div class="chart-container">
            <div ref="courseScoreChart" style="height: 400px"></div>
          </div>
          <div class="pagination-container">
            <el-pagination
              @current-change="handlePageChange"
              :current-page="currentPage"
              :page-size="10"
              :total="totalCourses"
              layout="total, prev, pager, next"
              background
            />
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 评价趋势图 -->
    <el-row style="margin-top: 20px">
      <el-col :span="24">
        <el-card shadow="hover">
      <div slot="header">
            <span>评价趋势分析</span>
      </div>
          <div class="chart-container">
            <div ref="evaluationTrendChart" style="height: 300px"></div>
      </div>
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
  name: 'AdminDashboard',
  data () {
    return {
      statistics: {
        studentCount: 0,
        teacherCount: 0,
        courseCount: 0,
        reviewCount: 0
      },
      charts: {
        teacherScore: null,
        trend: null,
        courseScore: null,
        evaluationTrend: null
      },
      currentPage: 1,
      coursePageSize: 10,
      totalCourses: 0,
      trendCurrentPage: 1,
      trendTotal: 0
    }
  },
  mounted () {
    // 等待 DOM 完全渲染后再初始化图表
    this.$nextTick(() => {
      this.initCharts()
      this.fetchStatistics()
    })
  },
  beforeDestroy () {
    // 销毁图表实例
    Object.values(this.charts).forEach(chart => {
      chart && chart.dispose()
    })
    // 移除窗口大小变化监听
    window.removeEventListener('resize', this.handleResize)
  },
  methods: {
    async fetchStatistics () {
      try {
        const response = await axios.get('/admin/dashboard/statistics')
        this.statistics = response.data
        this.updateCharts()
      } catch (error) {
        console.error('获取统计数据失败:', error)
        this.$message.error('获取统计数据失败')
      }
    },
    async initCharts () {
      // 初始化教师评分图表
      if (this.$refs.teacherScoreChart) {
        this.charts.teacherScore = echarts.init(this.$refs.teacherScoreChart)
      }
      if (this.$refs.trendChart) {
        this.charts.trend = echarts.init(this.$refs.trendChart)
      }
      if (this.$refs.courseScoreChart) {
        this.charts.courseScore = echarts.init(this.$refs.courseScoreChart)
      }
      if (this.$refs.evaluationTrendChart) {
        this.charts.evaluationTrend = echarts.init(this.$refs.evaluationTrendChart)
      }

      // 监听窗口大小变化
      window.addEventListener('resize', this.handleResize)

      // 初始化图表数据
      this.updateCharts()
    },
    handleResize () {
      Object.values(this.charts).forEach(chart => {
        chart && chart.resize()
      })
    },
    async updateCharts () {
      try {
        // 获取教师评分数据
        const scoreResponse = await axios.get('/admin/dashboard/teacher-scores')
        if (this.charts.teacherScore) {
          this.updateTeacherScoreChart(scoreResponse.data)
        }

        // 获取趋势数据
        await this.fetchCourseTrends()

        // 获取评价趋势数据
        await this.fetchEvaluationTrends()

        // 获取课程评分数据
        await this.fetchCourseScores()
      } catch (error) {
        console.error('获取图表数据失败:', error)
        this.$message.error('获取图表数据失败')
      }
    },
    async fetchCourseScores () {
      try {
        const response = await axios.get('/admin/dashboard/course-scores', {
          params: {
            page: this.currentPage,
            pageSize: 10
          }
        })
        this.totalCourses = response.data.total
        this.updateCourseScoreChart(response.data.data)
      } catch (error) {
        console.error('获取课程评分数据失败:', error)
        this.$message.error('获取课程评分数据失败')
      }
    },
    handlePageChange (page) {
      this.currentPage = page
      this.fetchCourseScores()
    },
    handlePageSizeChange (size) {
      this.coursePageSize = size
      this.currentPage = 1
      this.fetchCourseScores()
    },
    updateTeacherScoreChart (data) {
      const option = {
        title: {
          text: '课程评分分布',
          left: 'center'
        },
        tooltip: {
          trigger: 'item',
          formatter: '{b}: {c}%'
        },
        legend: {
          orient: 'vertical',
          left: 'left',
          data: ['优秀(>=90)', '良好(80-89)', '中等(70-79)', '及格(60-69)', '不及格(<60)']
        },
        series: [
          {
            name: '评分分布',
            type: 'pie',
            radius: '50%',
            data: [
              { value: 18.89, name: '优秀(>=90)' },
              { value: 35.53, name: '良好(80-89)' },
              { value: 29.01, name: '中等(70-79)' },
              { value: 15.82, name: '及格(60-69)' },
              { value: 0.75, name: '不及格(<60)' }
            ],
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
          }
        ]
      }
      this.charts.teacherScore.setOption(option)
    },
    updateWordCloudChart (data) {
      const option = {
        series: [{
          type: 'wordCloud',
          shape: 'circle',
          left: 'center',
          top: 'center',
          width: '70%',
          height: '80%',
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
      this.charts.wordCloud.setOption(option)
    },
    updateTrendChart (data) {
      const courseNames = data.map(item => item.name)
      const averageScores = data.map(item => item.average_score)

      const option = {
        tooltip: {
          trigger: 'axis',
          formatter: function (params) {
            const course = data[params[0].dataIndex]
            return `${course.name}<br/>
                    平均分：${course.average_score}<br/>
                    评价数：${course.evaluation_count}`
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: courseNames,
          axisLabel: {
            interval: 0,
            rotate: 30
          }
        },
        yAxis: {
          type: 'value',
          name: '平均分',
          min: 0,
          max: 100,
          interval: 20
        },
        series: [
          {
            name: '课程平均分',
            type: 'bar',
            data: averageScores,
            itemStyle: {
              color: '#409EFF'
            },
            label: {
              show: true,
              position: 'top',
              formatter: '{c}'
            }
          }
        ]
      }

      this.charts.trend.setOption(option)
    },
    updateCourseScoreChart (data) {
      // 准备数据
      const courseNames = data.map(item => item.courseName)
      const teachingContents = data.map(item => item.teaching_content)
      const teachingMethods = data.map(item => item.teaching_method)
      const teacherPerformances = data.map(item => item.teacher_performance)
      const courseDesigns = data.map(item => item.course_design)
      const learningEffects = data.map(item => item.learning_effect)

      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          },
          formatter: function (params) {
            const courseName = params[0].name
            const course = data.find(item => item.courseName === courseName)
            return `
              ${courseName}<br/>
              教学内容：${course.teaching_content || 0}<br/>
              教学方法：${course.teaching_method || 0}<br/>
              教师表现：${course.teacher_performance || 0}<br/>
              课程设计：${course.course_design || 0}<br/>
              学习效果：${course.learning_effect || 0}<br/>
              评价数量：${course.evaluationCount}
            `
          }
        },
        legend: {
          data: ['教学内容', '教学方法', '教师表现', '课程设计', '学习效果'],
          top: 25
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'value',
          min: 0,
          max: 20,
          interval: 4
        },
        yAxis: {
          type: 'category',
          data: courseNames,
          axisLabel: {
            width: 100,
            overflow: 'truncate'
          }
        },
        series: [
          {
            name: '教学内容',
            type: 'bar',
            data: teachingContents,
            itemStyle: {
              color: '#409EFF'
            }
          },
          {
            name: '教学方法',
            type: 'bar',
            data: teachingMethods,
            itemStyle: {
              color: '#67C23A'
            }
          },
          {
            name: '教师表现',
            type: 'bar',
            data: teacherPerformances,
            itemStyle: {
              color: '#E6A23C'
            }
          },
          {
            name: '课程设计',
            type: 'bar',
            data: courseDesigns,
            itemStyle: {
              color: '#F56C6C'
            }
          },
          {
            name: '学习效果',
            type: 'bar',
            data: learningEffects,
            itemStyle: {
              color: '#909399'
            }
          }
        ]
      }
      this.charts.courseScore.setOption(option)
    },
    async fetchCourseTrends () {
      try {
        const response = await axios.get('/admin/dashboard/course-trends')
        if (this.charts.trend) {
          this.updateTrendChart(response.data)
        }
      } catch (error) {
        console.error('获取课程趋势数据失败:', error)
      }
    },
    handleTrendPageChange (page) {
      this.trendCurrentPage = page
      this.fetchCourseTrends()
    },
    async fetchEvaluationTrends () {
      try {
        const response = await axios.get('/admin/dashboard/trends')
        if (this.charts.evaluationTrend) {
          this.updateEvaluationTrendChart(response.data)
        }
      } catch (error) {
        console.error('获取评价趋势数据失败:', error)
      }
    },
    updateEvaluationTrendChart (data) {
      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'line'
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: data.dates,
          axisLabel: {
            interval: 0,
            rotate: 30
          }
        },
        yAxis: {
          type: 'value',
          name: '评价数量'
        },
        series: [
          {
            name: '评价数量',
            type: 'line',
            data: data.counts,
            smooth: true,
            symbolSize: 8,
            itemStyle: {
              color: '#67C23A'
            },
            lineStyle: {
              width: 3,
              color: '#67C23A'
            },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                {
                  offset: 0,
                  color: 'rgba(103,194,58,0.3)'
                },
                {
                  offset: 1,
                  color: 'rgba(103,194,58,0.1)'
                }
              ])
            }
          }
        ]
      }
      this.charts.evaluationTrend.setOption(option)
    }
  }
}
</script>

<style scoped>
.dashboard {
  padding: 20px;
}

.data-card {
  height: 120px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.data-header {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #606266;
}

.data-header i {
  font-size: 20px;
}

.data-content {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.data-content .number {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
}

.data-content .unit {
  font-size: 14px;
  color: #909399;
}

.chart-container {
  padding: 10px;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-control {
  display: flex;
  align-items: center;
  gap: 10px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}
</style>
