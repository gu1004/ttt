const db = require('../config/db')

const reviewController = {
  // 获取评价列表
  getReviews: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1
      const pageSize = parseInt(req.query.pageSize) || 10
      const status = req.query.status
      const search = req.query.search
      const offset = (page - 1) * pageSize

      let listQuery = `
        SELECT
          e.id,
          '***' as studentName,
          c.name as courseName,
          t.name as teacherName,
          ROUND((e.content_richness + e.content_update + e.content_organization), 1) as teaching_content,
          ROUND((e.teaching_method_diversity + e.teaching_interaction + e.teaching_resource), 1) as teaching_method,
          ROUND((e.teacher_attitude + e.teacher_ability + e.teacher_personality), 1) as teacher_performance,
          ROUND((e.course_objective + e.course_difficulty + e.course_pace), 1) as course_design,
          ROUND((e.knowledge_grasp + e.ability_improvement + e.interest_stimulation), 1) as learning_effect,
          ROUND((
            (e.content_richness + e.content_update + e.content_organization) +
            (e.teaching_method_diversity + e.teaching_interaction + e.teaching_resource) +
            (e.teacher_attitude + e.teacher_ability + e.teacher_personality) +
            (e.course_objective + e.course_difficulty + e.course_pace) +
            (e.knowledge_grasp + e.ability_improvement + e.interest_stimulation)
          ), 1) as total_score,
          e.comment,
          DATE_FORMAT(e.create_time, '%Y-%m-%d %H:%i:%s') as submitTime,
          e.status
        FROM evaluations e
        JOIN courses c ON e.course_id = c.id
        JOIN teachers t ON c.teacher_id = t.id
      `

      let countQuery = `
        SELECT COUNT(*) as total
        FROM evaluations e
        JOIN courses c ON e.course_id = c.id
        JOIN teachers t ON c.teacher_id = t.id
      `

      const conditions = []
      const queryParams = []

      if (status) {
        conditions.push('e.status = ?')
        queryParams.push(status)
      }

      if (search) {
        conditions.push('(c.name LIKE ? OR t.name LIKE ?)')
        queryParams.push(`%${search}%`, `%${search}%`)
      }

      if (conditions.length > 0) {
        const whereClause = ` WHERE ${conditions.join(' AND ')}`
        listQuery += whereClause
        countQuery += whereClause
      }

      // 获取总记录数
      const [totalResult] = await db.query(countQuery, queryParams)
      const total = totalResult[0].total

      // 添加分页
      listQuery += ` ORDER BY e.create_time DESC LIMIT ? OFFSET ?`
      queryParams.push(pageSize, offset)

      // 获取评价列表
      const [reviews] = await db.query(listQuery, queryParams)

      console.log('查询结果:', {
        total,
        currentPage: page,
        pageSize,
        status: status || 'all',
        search: search || '',
        conditions,
        queryParams,
        recordCount: reviews.length
      })

      res.json({
        total,
        data: reviews
      })
    } catch (error) {
      console.error('获取评价列表失败:', error)
      res.status(500).json({ message: '获取评价列表失败' })
    }
  },



  // 获取单个评价的历史记录
  getReviewHistoryById: async (req, res) => {
    try {
      const { id } = req.params
      const [history] = await db.query(`
        SELECT
          rh.id,
          rh.review_id,
          rh.action,
          rh.reason,
          DATE_FORMAT(rh.create_time, '%Y-%m-%d %H:%i:%s') as operateTime,
          a.name as operatorName
        FROM review_history rh
        JOIN administrators a ON rh.operator_id = a.id
        WHERE rh.review_id = ?
        ORDER BY rh.create_time DESC
      `, [id])
      res.json(history)
    } catch (error) {
      console.error('获取评价历史记录失败:', error)
      res.status(500).json({ message: '获取评价历史记录失败' })
    }
  },

  // 通过评价
  approveReview: async (req, res) => {
    try {
      const { id } = req.params
      const operatorId = req.user.id

      await db.query('START TRANSACTION')

      // 更新评价状态
      await db.query(
        'UPDATE evaluations SET status = ? WHERE id = ?',
        ['approved', id]
      )

      // 记录操作历史
      await db.query(
        `INSERT INTO review_history
         (review_id, operator_id, action, create_time)
         VALUES (?, ?, ?, NOW())`,
        [id, operatorId, 'approve']
      )

      await db.query('COMMIT')
      res.json({ message: '评价已通过' })
    } catch (error) {
      await db.query('ROLLBACK')
      console.error('通过评价失败:', error)
      res.status(500).json({ message: '通过评价失败' })
    }
  },



  // 拒绝评价
  rejectReview: async (req, res) => {
    try {
      const { id } = req.params
      const { reason } = req.body
      const operatorId = req.user.id

      await db.query('START TRANSACTION')

      // 更新评价状态
      await db.query(
        'UPDATE evaluations SET status = ? WHERE id = ?',
        ['rejected', id]
      )

      // 记录操作历史
      await db.query(
        `INSERT INTO review_history
         (review_id, operator_id, action, reason, create_time)
         VALUES (?, ?, ?, ?, NOW())`,
        [id, operatorId, 'reject', reason]
      )

      await db.query('COMMIT')
      res.json({ message: '评价已拒绝' })
    } catch (error) {
      await db.query('ROLLBACK')
      console.error('拒绝评价失败:', error)
      res.status(500).json({ message: '拒绝评价失败' })
    }
  },

  // 删除评价
  deleteReview: async (req, res) => {
    try {
      const { id } = req.params
      const operatorId = req.user.id

      await db.query('START TRANSACTION')

      // 更新评价状态
      await db.query(
        'UPDATE evaluations SET status = ? WHERE id = ?',
        ['deleted', id]
      )

      // 记录操作历史
      await db.query(
        `INSERT INTO review_history
         (review_id, operator_id, action, create_time)
         VALUES (?, ?, ?, NOW())`,
        [id, operatorId, 'delete']
      )

      await db.query('COMMIT')
      res.json({ message: '评价已删除' })
    } catch (error) {
      await db.query('ROLLBACK')
      console.error('删除评价失败:', error)
      res.status(500).json({ message: '删除评价失败' })
    }
  },


}

module.exports = reviewController
