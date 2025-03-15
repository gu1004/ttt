const pool = require('../config/db')
const dayjs = require('dayjs')

const dashboardController = {
  // 获取基础统计数据
  async getStatistics(req, res) {
    try {
      // 获取学生数量
      const [studentResult] = await pool.query(
        'SELECT COUNT(*) as count FROM students'
      )

      // 获取教师数量
      const [teacherResult] = await pool.query(
        'SELECT COUNT(*) as count FROM teachers'
      )

      // 获取课程数量
      const [courseResult] = await pool.query(
        'SELECT COUNT(*) as count FROM courses'
      )

      // 获取评价数量
      const [reviewResult] = await pool.query(
        'SELECT COUNT(*) as count FROM evaluations WHERE status IN ("pending", "approved")'
      )

      res.json({
        studentCount: studentResult[0].count,
        teacherCount: teacherResult[0].count,
        courseCount: courseResult[0].count,
        reviewCount: reviewResult[0].count
      })
    } catch (error) {
      console.error('Error getting statistics:', error)
      res.status(500).json({ message: '获取统计数据失败' })
    }
  },

  // 获取教师评分分布
  async getTeacherScores(req, res) {
    try {
      const [results] = await pool.query(`
        SELECT
          CASE
            WHEN (content_richness + content_update + content_organization +
                  teaching_method_diversity + teaching_interaction + teaching_resource +
                  teacher_attitude + teacher_ability + teacher_personality +
                  knowledge_grasp + ability_improvement + interest_stimulation) / 12 >= 9 THEN '优秀(90-100)'
            WHEN (content_richness + content_update + content_organization +
                  teaching_method_diversity + teaching_interaction + teaching_resource +
                  teacher_attitude + teacher_ability + teacher_personality +
                  knowledge_grasp + ability_improvement + interest_stimulation) / 12 >= 8 THEN '良好(80-89)'
            WHEN (content_richness + content_update + content_organization +
                  teaching_method_diversity + teaching_interaction + teaching_resource +
                  teacher_attitude + teacher_ability + teacher_personality +
                  knowledge_grasp + ability_improvement + interest_stimulation) / 12 >= 7 THEN '中等(70-79)'
            WHEN (content_richness + content_update + content_organization +
                  teaching_method_diversity + teaching_interaction + teaching_resource +
                  teacher_attitude + teacher_ability + teacher_personality +
                  knowledge_grasp + ability_improvement + interest_stimulation) / 12 >= 6 THEN '及格(60-69)'
            ELSE '不及格(<60)'
          END as score_range,
          COUNT(*) as count
        FROM evaluations
        WHERE status = 'approved'
        GROUP BY
          CASE
            WHEN (content_richness + content_update + content_organization +
                  teaching_method_diversity + teaching_interaction + teaching_resource +
                  teacher_attitude + teacher_ability + teacher_personality +
                  knowledge_grasp + ability_improvement + interest_stimulation) / 12 >= 9 THEN '优秀(90-100)'
            WHEN (content_richness + content_update + content_organization +
                  teaching_method_diversity + teaching_interaction + teaching_resource +
                  teacher_attitude + teacher_ability + teacher_personality +
                  knowledge_grasp + ability_improvement + interest_stimulation) / 12 >= 8 THEN '良好(80-89)'
            WHEN (content_richness + content_update + content_organization +
                  teaching_method_diversity + teaching_interaction + teaching_resource +
                  teacher_attitude + teacher_ability + teacher_personality +
                  knowledge_grasp + ability_improvement + interest_stimulation) / 12 >= 7 THEN '中等(70-79)'
            WHEN (content_richness + content_update + content_organization +
                  teaching_method_diversity + teaching_interaction + teaching_resource +
                  teacher_attitude + teacher_ability + teacher_personality +
                  knowledge_grasp + ability_improvement + interest_stimulation) / 12 >= 6 THEN '及格(60-69)'
            ELSE '不及格(<60)'
          END
        ORDER BY
          CASE score_range
            WHEN '优秀(90-100)' THEN 1
            WHEN '良好(80-89)' THEN 2
            WHEN '中等(70-79)' THEN 3
            WHEN '及格(60-69)' THEN 4
            ELSE 5
          END
      `)

      res.json(results)
    } catch (error) {
      console.error('Error getting teacher scores:', error)
      res.status(500).json({ message: '获取教师评分数据失败' })
    }
  },


  // 获取评价趋势
  async getTrends(req, res) {
    try {
      // 获取最近30天的评价数量趋势
      const [results] = await pool.query(`
        SELECT
          DATE(create_time) as date,
          COUNT(*) as count
        FROM evaluations
        WHERE create_time >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
        GROUP BY DATE(create_time)
        ORDER BY date
      `)

      // 填充没有数据的日期
      const trends = {
        dates: [],
        counts: []
      }

      const today = dayjs()
      for (let i = 29; i >= 0; i--) {
        const date = today.subtract(i, 'day').format('YYYY-MM-DD')
        const record = results.find(r => dayjs(r.date).format('YYYY-MM-DD') === date)

        trends.dates.push(date)
        trends.counts.push(record ? record.count : 0)
      }

      res.json(trends)
    } catch (error) {
      console.error('Error getting trends:', error)
      res.status(500).json({ message: '获取趋势数据失败' })
    }
  },

  // 获取课程评分数据
  async getCourseScores(req, res) {
    try {
      const page = parseInt(req.query.page) || 1
      const pageSize = parseInt(req.query.pageSize) || 10
      const offset = (page - 1) * pageSize

      // 获取分页数据
      const [results] = await pool.query(`
        SELECT
          c.name as courseName,
          ROUND(AVG(content_richness + content_update + content_organization), 1) as teaching_content,
          ROUND(AVG(teaching_method_diversity + teaching_interaction + teaching_resource), 1) as teaching_method,
          ROUND(AVG(teacher_attitude + teacher_ability + teacher_personality), 1) as teacher_performance,
          ROUND(AVG(course_objective + course_difficulty + course_pace), 1) as course_design,
          ROUND(AVG(knowledge_grasp + ability_improvement + interest_stimulation), 1) as learning_effect,
          COUNT(e.id) as evaluationCount
        FROM courses c
        LEFT JOIN evaluations e ON c.id = e.course_id
        WHERE e.status = 'approved'
        GROUP BY c.id, c.name
        HAVING evaluationCount >= 5
        ORDER BY teaching_content DESC
        LIMIT ? OFFSET ?
      `, [pageSize, offset])

      // 获取总数
      const [countResult] = await pool.query(`
        SELECT COUNT(DISTINCT c.id) as total
        FROM courses c
        LEFT JOIN evaluations e ON c.id = e.course_id
        WHERE e.status = 'approved'
        GROUP BY c.id
        HAVING COUNT(e.id) >= 5
      `)

      const total = countResult ? countResult.length : 0

      res.json({
        total,
        data: results
      })
    } catch (error) {
      console.error('Error getting course scores:', error)
      res.status(500).json({ message: '获取课程评分数据失败' })
    }
  },

  // 获取课程分析数据
  async getCourseAnalysis(req, res) {
    try {
      const [results] = await pool.query(`
        SELECT
          ROUND(AVG(content_richness + content_update + content_organization) / 3, 1) as teaching_content_score,
          ROUND(AVG(teaching_method_diversity + teaching_interaction + teaching_resource) / 3, 1) as teaching_method_score,
          ROUND(AVG(teacher_attitude + teacher_ability + teacher_personality) / 3, 1) as teacher_performance_score,
          ROUND(AVG(course_objective + course_difficulty + course_pace) / 3, 1) as course_design_score,
          ROUND(AVG(knowledge_grasp + ability_improvement + interest_stimulation) / 3, 1) as learning_effect_score
        FROM evaluations
        WHERE status = 'approved'
      `)

      res.json(results[0])
    } catch (error) {
      console.error('获取课程分析数据失败:', error)
      res.status(500).json({ message: '获取课程分析数据失败' })
    }
  },

  // 获取评分分布数据
  async getScoreDistribution(req, res) {
    try {
      const courseId = req.query.courseId

      if (!courseId) {
        return res.status(400).json({ message: '请提供课程ID' })
      }

      // 获取指定课程的评分分布数据
      const [distribution] = await pool.query(`
        SELECT
          CASE
            WHEN total_score >= 90 THEN '优秀(>=90)'
            WHEN total_score >= 80 THEN '良好(80-89)'
            WHEN total_score >= 70 THEN '中等(70-79)'
            WHEN total_score >= 60 THEN '及格(60-69)'
            ELSE '不及格(<60)'
          END as score_range,
          COUNT(*) as count
        FROM evaluations
        WHERE course_id = ? AND status = 'approved'
        GROUP BY
          CASE
            WHEN total_score >= 90 THEN '优秀(>=90)'
            WHEN total_score >= 80 THEN '良好(80-89)'
            WHEN total_score >= 70 THEN '中等(70-79)'
            WHEN total_score >= 60 THEN '及格(60-69)'
            ELSE '不及格(<60)'
          END
        ORDER BY score_range
      `, [courseId])

      res.json(distribution)
    } catch (error) {
      console.error('获取评分分布数据失败:', error)
      res.status(500).json({ message: '获取评分分布数据失败' })
    }
  },

  // 获取课程平均分趋势
  async getCourseTrends(req, res) {
    try {
      const page = parseInt(req.query.page) || 1
      const pageSize = parseInt(req.query.pageSize) || 10
      const offset = (page - 1) * pageSize

      // 获取分页数据
      const [rows] = await pool.query(`
        SELECT
          c.name,
          ROUND(AVG(
            content_richness + content_update + content_organization +
            teaching_method_diversity + teaching_interaction + teaching_resource +
            teacher_attitude + teacher_ability + teacher_personality +
            course_objective + course_difficulty + course_pace +
            knowledge_grasp + ability_improvement + interest_stimulation
          ), 1) as average_score,
          COUNT(*) as evaluation_count
        FROM evaluations e
        JOIN courses c ON e.course_id = c.id
        WHERE e.status = 'approved'
        GROUP BY c.id, c.name
        HAVING evaluation_count >= 5
        ORDER BY average_score DESC
        LIMIT ? OFFSET ?
      `, [pageSize, offset])

      // 获取总数
      const [countResult] = await pool.query(`
        SELECT COUNT(DISTINCT c.id) as total
        FROM evaluations e
        JOIN courses c ON e.course_id = c.id
        WHERE e.status = 'approved'
        GROUP BY c.id
        HAVING COUNT(*) >= 5
      `)

      const total = countResult.length

      const result = {
        total,
        data: rows.map(row => ({
          name: row.name,
          average_score: parseFloat(row.average_score) || 0,
          evaluation_count: row.evaluation_count
        }))
      }

      res.json(result)
    } catch (error) {
      console.error('Error getting course trends:', error)
      res.status(500).json({ message: '获取课程平均分趋势失败' })
    }
  },

  // 获取单个课程的评分分布
  async getCourseScoreDistribution(req, res) {
    try {
      const courseId = req.params.courseId

      const query = `
        SELECT
          COUNT(CASE WHEN total_score >= 90 THEN 1 END) as excellent,
          COUNT(CASE WHEN total_score >= 80 AND total_score < 90 THEN 1 END) as good,
          COUNT(CASE WHEN total_score >= 70 AND total_score < 80 THEN 1 END) as average,
          COUNT(CASE WHEN total_score >= 60 AND total_score < 70 THEN 1 END) as pass,
          COUNT(CASE WHEN total_score < 60 THEN 1 END) as fail
        FROM evaluations
        WHERE course_id = ? AND status = 'approved'
      `

      const [result] = await pool.query(query, [courseId])

      res.json(result[0])
    } catch (error) {
      console.error('获取课程评分分布失败:', error)
      res.status(500).json({ message: '获取课程评分分布失败' })
    }
  }
}

module.exports = dashboardController
