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
            <span>教师评分分布</span>
          </div>
          <div class="chart-container">
            <div ref="teacherScoreChart" style="height: 300px"></div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="hover">
          <div slot="header">
            <span>评价关键词云</span>
          </div>
          <div class="chart-container">
            <div ref="wordCloudChart" style="height: 300px"></div>
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
            <div ref="trendChart" style="height: 300px"></div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 课程评分分析 -->
    <el-col :span="24">
      <el-card class="chart-card">
        <div slot="header">
          <span>课程评分分析</span>
        </div>
        <div class="chart-container">
          <div ref="courseChart" style="height: 400px"></div>
        </div>
        <div class="pagination-container">
          <el-pagination
            @current-change="handlePageChange"
            :current-page.sync="currentPage"
            :page-size="pageSize"
            layout="total, prev, pager, next"
            :total="total">
          </el-pagination>
        </div>
      </el-card>
    </el-col>

    <!-- 评分分布 -->
    <el-col :span="24" style="margin-top: 20px">
      <el-card class="chart-card">
        <div slot="header">
          <span>评分分布</span>
        </div>
        <div class="chart-container">
          <div ref="distributionChart" style="height: 400px"></div>
        </div>
      </el-card>
    </el-col>
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
        wordCloud: null,
        trend: null
      },
      courseChart: null,
      distributionChart: null,
      currentPage: 1,
      pageSize: 10,
      total: 0,
      loading: false
    }
  },
  mounted () {
    this.fetchStatistics()
    this.initCharts()
    this.fetchData()
  },
  beforeDestroy () {
    // 销毁图表实例
    Object.values(this.charts).forEach(chart => {
      chart && chart.dispose()
    })
    window.removeEventListener('resize', this.handleResize)
  },
  methods: {
    async fetchStatistics () {
      try {
        const response = await axios.get('/admin/dashboard/statistics')
        this.statistics = response.data
        this.updateCharts()
      } catch (error) {
        this.$message.error('获取统计数据失败')
      }
    },
    initCharts () {
      // 初始化教师评分图表
      this.charts.teacherScore = echarts.init(this.$refs.teacherScoreChart)
      this.charts.wordCloud = echarts.init(this.$refs.wordCloudChart)
      this.charts.trend = echarts.init(this.$refs.trendChart)

      // 监听窗口大小变化
      window.addEventListener('resize', this.handleResize)

      // 初始化图表数据
      this.updateCharts()
    },
    handleResize () {
      Object.values(this.charts).forEach(chart => {
        chart && chart.resize()
      })
      this.courseChart && this.courseChart.resize()
      this.distributionChart && this.distributionChart.resize()
    },
    async updateCharts () {
      try {
        // 获取教师评分数据
        const scoreResponse = await axios.get('/admin/dashboard/teacher-scores')
        this.updateTeacherScoreChart(scoreResponse.data)

        // 获取关键词数据
        const keywordsResponse = await axios.get('/admin/dashboard/keywords')
        this.updateWordCloudChart(keywordsResponse.data)

        // 获取趋势数据
        const trendResponse = await axios.get('/admin/dashboard/trends')
        this.updateTrendChart(trendResponse.data)
      } catch (error) {
        this.$message.error('获取图表数据失败')
      }
    },
    updateTeacherScoreChart (data) {
      const option = {
        title: {
          text: '教师评分分布'
        },
        tooltip: {
          trigger: 'axis'
        },
        xAxis: {
          type: 'category',
          data: ['教学态度', '教学内容', '教学方法', '教学效果']
        },
        yAxis: {
          type: 'value',
          min: 0,
          max: 5
        },
        series: [{
          type: 'bar',
          data: data,
          itemStyle: {
            color: '#409EFF'
          }
        }]
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
      const option = {
        title: {
          text: '评价数量趋势'
        },
        tooltip: {
          trigger: 'axis'
        },
        xAxis: {
          type: 'category',
          data: data.dates
        },
        yAxis: {
          type: 'value'
        },
        series: [{
          type: 'line',
          data: data.counts,
          smooth: true,
          itemStyle: {
            color: '#67C23A'
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
              offset: 0,
              color: 'rgba(103,194,58,0.3)'
            }, {
              offset: 1,
              color: 'rgba(103,194,58,0.1)'
            }])
          }
        }]
      }
      this.charts.trend.setOption(option)
    },
    async fetchData () {
      try {
        this.loading = true
        await Promise.all([
          this.fetchCourseAnalysis(),
          this.fetchScoreDistribution()
        ])
      } finally {
        this.loading = false
      }
    },
    async fetchCourseAnalysis () {
      try {
        const { data } = await axios.get('/admin/course-analysis', {
          params: {
            page: this.currentPage,
            pageSize: this.pageSize
          }
        })

        this.total = data.total
        this.updateCourseChart(data.courses)
      } catch (error) {
        this.$message.error('获取课程分析数据失败')
      }
    },
    async fetchScoreDistribution () {
      try {
        const { data } = await axios.get('/admin/score-distribution')
        this.updateDistributionChart(data)
      } catch (error) {
        this.$message.error('获取评分分布数据失败')
      }
    },
    updateCourseChart (courses) {
      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        legend: {
          data: ['教学内容', '教学方法', '课程设计', '学习效果']
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'value',
          boundaryGap: [0, 0.01]
        },
        yAxis: {
          type: 'category',
          data: courses.map(course => course.courseName)
        },
        series: [
          {
            name: '教学内容',
            type: 'bar',
            data: courses.map(course => course.teaching_content)
          },
          {
            name: '教学方法',
            type: 'bar',
            data: courses.map(course => course.teaching_method)
          },
          {
            name: '课程设计',
            type: 'bar',
            data: courses.map(course => course.course_design)
          },
          {
            name: '学习效果',
            type: 'bar',
            data: courses.map(course => course.learning_effect)
          }
        ]
      }

      this.courseChart.setOption(option)
    },
    updateDistributionChart (distribution) {
      const option = {
        tooltip: {
          trigger: 'item',
          formatter: '{b}: {c} ({d}%)'
        },
        legend: {
          orient: 'vertical',
          left: 'left'
        },
        series: [
          {
            name: '评分分布',
            type: 'pie',
            radius: '50%',
            data: distribution.map(item => ({
              name: item.score_range,
              value: item.count
            })),
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

      this.distributionChart.setOption(option)
    },
    handlePageChange (page) {
      this.currentPage = page
      this.fetchCourseAnalysis()
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

.chart-card {
  margin-bottom: 20px;
}

.pagination-container {
  margin-top: 20px;
  text-align: right;
}
</style>
