const db = require('../config/db')

const evaluationController = {
  // 获取评价列表
  getEvaluationList: async (req, res) => {
    try {
      console.log('开始获取评价列表')
      const query = `
        SELECT
          c.id,
          c.id as courseId,
          c.name as courseName,
          c.start_time,
          c.end_time
        FROM courses c
        ORDER BY c.start_time DESC
      `
      console.log('执行查询:', query)
      const [rows] = await db.query(query)
      console.log('查询结果:', rows)
      res.json(rows)
    } catch (error) {
      console.error('获取评价列表失败:', error)
      res.status(500).json({ message: '获取评价列表失败' })
    }
  },

  // 更新评价时间
  updateEvaluationTime: async (req, res) => {
    try {
      const { id } = req.params
      const { start_time, end_time } = req.body

      console.log('更新评价时间:', { id, start_time, end_time })

      await db.query(
        `UPDATE courses
         SET start_time = STR_TO_DATE(?, '%Y-%m-%d %H:%i:%s'),
             end_time = STR_TO_DATE(?, '%Y-%m-%d %H:%i:%s')
         WHERE id = ?`,
        [start_time, end_time, id]
      )

      res.json({ message: '评价时间更新成功' })
    } catch (error) {
      console.error('更新评价时间失败:', error)
      res.status(500).json({ message: '更新评价时间失败' })
    }
  }
}

module.exports = evaluationController
