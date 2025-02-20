const express = require('express')
const router = express.Router()
const db = require('../config/db')
const evaluationController = require('../controllers/evaluationController')
const reviewController = require('../controllers/reviewController')
const { auth } = require('../middleware/auth')
const dashboardController = require('../controllers/dashboardController')
const adminController = require('../controllers/adminController')

// 评价管理路由
router.get('/evaluations', auth, evaluationController.getEvaluationList)
router.put('/evaluations/:id', auth, evaluationController.updateEvaluationTime)

// 评价审核路由
router.get('/reviews', auth, reviewController.getReviews)
router.get('/reviews/history', auth, reviewController.getReviewHistory)
router.get('/reviews/:id/history', auth, reviewController.getReviewHistoryById)
router.put('/reviews/:id/approve', auth, reviewController.approveReview)
router.put('/reviews/batch-approve', auth, reviewController.batchApprove)
router.put('/reviews/:id/reject', auth, reviewController.rejectReview)
router.delete('/reviews/:id', auth, reviewController.deleteReview)
router.delete('/reviews/batch', auth, reviewController.batchDeleteReview)

// 获取课程列表
router.get('/courses', async (req, res) => {
  try {
    const [courses] = await db.query(`
      SELECT c.*, t.name as teacher,
             GROUP_CONCAT(cc.class_name) as classes
      FROM courses c
      LEFT JOIN teachers t ON c.teacher_id = t.id
      LEFT JOIN course_classes cc ON c.id = cc.course_id
      GROUP BY c.id
    `)

    // 处理班级列表
    courses.forEach(course => {
      course.classes = course.classes ? course.classes.split(',') : []
    })

    res.json(courses)
  } catch (error) {
    console.error('获取课程列表失败:', error)
    res.status(500).json({ message: '获取课程列表失败' })
  }
})

// 更新课程信息
router.put('/courses/:id', async (req, res) => {
  try {
    const courseId = req.params.id
    const { name, teacherId, description, startDate, endDate, classes } = req.body

    // 转换日期格式
    const formattedStartDate = new Date(startDate).toISOString().split('T')[0]
    const formattedEndDate = new Date(endDate).toISOString().split('T')[0]

    // 开启事务
    await db.query('START TRANSACTION')

    // 更新课程基本信息
    await db.query(
      `UPDATE courses
       SET name = ?, teacher_id = ?, description = ?, start_date = ?, end_date = ?
       WHERE id = ?`,
      [name, teacherId, description, formattedStartDate, formattedEndDate, courseId]
    )

    // 删除旧的课程-班级关联
    await db.query('DELETE FROM course_classes WHERE course_id = ?', [courseId])

    // 插入新的课程-班级关联
    if (classes && classes.length > 0) {
      const values = classes.map(className => [courseId, className])
      await db.query(
        `INSERT INTO course_classes (course_id, class_name) VALUES ?`,
        [values]
      )
    }

    // 提交事务
    await db.query('COMMIT')

    res.json({ message: '更新成功' })
  } catch (error) {
    // 回滚事务
    await db.query('ROLLBACK')
    console.error('更新课程失败:', error)
    res.status(500).json({ message: '更新课程失败' })
  }
})

// 获取教师列表
router.get('/teachers', async (req, res) => {
  try {
    const [teachers] = await db.query('SELECT id, name FROM teachers')
    res.json(teachers)
  } catch (error) {
    console.error('获取教师列表失败:', error)
    res.status(500).json({ message: '获取教师列表失败' })
  }
})

// 删除课程
router.delete('/courses/:id', async (req, res) => {
  try {
    const { id } = req.params

    // 删除课程
    await db.query('DELETE FROM courses WHERE id = ?', [id])

    res.json({ message: '删除成功' })
  } catch (error) {
    console.error('删除课程失败:', error)
    res.status(500).json({ message: '删除课程失败' })
  }
})

// 添加课程
router.post('/courses', async (req, res) => {
  try {
    const { name, teacherId, description, startDate, endDate, classes } = req.body

    // 转换日期格式
    const formattedStartDate = new Date(startDate).toISOString().split('T')[0]
    const formattedEndDate = new Date(endDate).toISOString().split('T')[0]

    // 开启事务
    await db.query('START TRANSACTION')

    // 插入新课程
    const [result] = await db.query(
      `INSERT INTO courses (name, teacher_id, description, start_date, end_date)
       VALUES (?, ?, ?, ?, ?)`,
      [name, teacherId, description, formattedStartDate, formattedEndDate]
    )

    const courseId = result.insertId

    // 插入课程-班级关联
    if (classes && classes.length > 0) {
      const values = classes.map(className => [courseId, className])
      await db.query(
        `INSERT INTO course_classes (course_id, class_name) VALUES ?`,
        [values]
      )
    }

    // 提交事务
    await db.query('COMMIT')

    res.json({
      message: '添加成功',
      courseId: courseId
    })
  } catch (error) {
    // 回滚事务
    await db.query('ROLLBACK')
    console.error('添加课程失败:', error)
    res.status(500).json({ message: '添加课程失败' })
  }
})

// 获取用户列表
router.get('/users', async (req, res) => {
  try {
    // 获取学生列表
    const [students] = await db.query(`
      SELECT
        id,
        username,
        name,
        email,
        'student' as role,
        active,
        department,
        class as class_name
      FROM students`)

    // 获取教师列表
    const [teachers] = await db.query(`
      SELECT
        id,
        username,
        name,
        email,
        'teacher' as role,
        active,
        department,
        title
      FROM teachers`)

    // 合并用户列表
    const users = [...students, ...teachers]
    res.json(users)
  } catch (error) {
    console.error('获取用户列表失败:', error)
    res.status(500).json({ message: '获取用户列表失败' })
  }
})

// 更新用户状态
router.put('/users/:id/status', async (req, res) => {
  try {
    const { id } = req.params
    const { active, role } = req.body
    const table = role === 'student' ? 'students' : 'teachers'

    await db.query(
      `UPDATE ${table} SET active = ? WHERE id = ?`,
      [active, id]
    )

    res.json({ message: '状态更新成功' })
  } catch (error) {
    console.error('更新用户状态失败:', error)
    res.status(500).json({ message: '更新用户状态失败' })
  }
})

// 重置用户密码
router.put('/users/:id/reset-password', async (req, res) => {
  try {
    const { id } = req.params
    const { role } = req.body
    const table = role === 'student' ? 'students' : 'teachers'
    const defaultPassword = '123456' // 默认密码

    await db.query(
      `UPDATE ${table} SET password = ? WHERE id = ?`,
      [defaultPassword, id]
    )

    res.json({ message: '密码重置成功' })
  } catch (error) {
    console.error('重置密码失败:', error)
    res.status(500).json({ message: '重置密码失败' })
  }
})

// 批量重置密码
router.put('/users/batch-reset-password', async (req, res) => {
  try {
    const { userIds, roles } = req.body
    const defaultPassword = '123456' // 默认密码

    await db.query('START TRANSACTION')

    for (let i = 0; i < userIds.length; i++) {
      const table = roles[i] === 'student' ? 'students' : 'teachers'
      await db.query(
        `UPDATE ${table} SET password = ? WHERE id = ?`,
        [defaultPassword, userIds[i]]
      )
    }

    await db.query('COMMIT')
    res.json({ message: '批量重置密码成功' })
  } catch (error) {
    await db.query('ROLLBACK')
    console.error('批量重置密码失败:', error)
    res.status(500).json({ message: '批量重置密码失败' })
  }
})

// 更新用户信息
router.put('/users/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { role, ...userData } = req.body
    const table = role === 'student' ? 'students' : 'teachers'

    const fields = role === 'student'
      ? ['name', 'email', 'department', 'class']
      : ['name', 'email', 'department', 'title']

    const updateFields = fields
      .filter(field => userData[field] !== undefined)
      .map(field => `${field} = ?`)
      .join(', ')

    const values = fields
      .filter(field => userData[field] !== undefined)
      .map(field => userData[field])

    values.push(id)

    await db.query(
      `UPDATE ${table} SET ${updateFields} WHERE id = ?`,
      values
    )

    res.json({ message: '更新成功' })
  } catch (error) {
    console.error('更新用户信息失败:', error)
    res.status(500).json({ message: '更新用户信息失败' })
  }
})

// 批量删除用户
router.delete('/users/batch-delete', async (req, res) => {
  try {
    const { userIds, roles } = req.body

    await db.query('START TRANSACTION')

    for (let i = 0; i < userIds.length; i++) {
      const id = userIds[i]
      const role = roles[i]
      const table = role === 'student' ? 'students' : 'teachers'

      // 如果是学生，先删除相关的记录
      if (role === 'student') {
        // 删除通知阅读记录
        await db.query('DELETE FROM notification_reads WHERE student_id = ?', [id])
        // 删除评价历史记录
        await db.query('DELETE FROM review_history WHERE review_id IN (SELECT id FROM evaluations WHERE student_id = ?)', [id])
        // 删除评价记录
        await db.query('DELETE FROM evaluations WHERE student_id = ?', [id])
        // 删除选课记录
        await db.query('DELETE FROM student_courses WHERE student_id = ?', [id])
      }

      // 删除用户
      await db.query(`DELETE FROM ${table} WHERE id = ?`, [id])
    }

    await db.query('COMMIT')
    res.json({ message: '批量删除成功' })
  } catch (error) {
    await db.query('ROLLBACK')
    console.error('批量删除失败:', error)
    res.status(500).json({ message: '批量删除失败' })
  }
})

// 删除用户
router.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { role } = req.query
    const table = role === 'student' ? 'students' : 'teachers'

    await db.query('START TRANSACTION')

    // 如果是学生，先删除相关的记录
    if (role === 'student') {
      // 删除通知阅读记录
      await db.query('DELETE FROM notification_reads WHERE student_id = ?', [id])
      // 删除评价历史记录
      await db.query('DELETE FROM review_history WHERE review_id IN (SELECT id FROM evaluations WHERE student_id = ?)', [id])
      // 删除评价记录
      await db.query('DELETE FROM evaluations WHERE student_id = ?', [id])
      // 删除选课记录
      await db.query('DELETE FROM student_courses WHERE student_id = ?', [id])
    }

    // 删除用户
    await db.query(`DELETE FROM ${table} WHERE id = ?`, [id])

    await db.query('COMMIT')
    res.json({ message: '删除成功' })
  } catch (error) {
    await db.query('ROLLBACK')
    console.error('删除用户失败:', error)
    res.status(500).json({ message: '删除用户失败' })
  }
})

// 仪表盘相关路由
router.get('/statistics', auth, dashboardController.getStatistics)
router.get('/teacher-scores', auth, dashboardController.getTeacherScores)
router.get('/keywords', auth, dashboardController.getKeywords)
router.get('/trends', auth, dashboardController.getTrends)
router.get('/course-scores', auth, dashboardController.getCourseScores)
router.get('/course-analysis', auth, dashboardController.getCourseAnalysis)
router.get('/score-distribution', auth, dashboardController.getScoreDistribution)
router.get('/course-trends', auth, dashboardController.getCourseTrends)
router.get('/course-scores/:courseId', auth, dashboardController.getCourseScoreDistribution)

// 通知相关路由
router.post('/notifications', auth, adminController.createNotification)
router.get('/notifications', auth, adminController.getNotifications)
router.post('/notifications/evaluation-start', auth, adminController.sendEvaluationStartNotification)
router.post('/notifications/evaluation-due', auth, adminController.sendEvaluationDueNotification)
router.post('/notifications/evaluation-complete', auth, adminController.sendEvaluationCompleteNotification)

// 获取所有班级列表
router.get('/classes', async (req, res) => {
  try {
    const [results] = await db.query(
      `SELECT DISTINCT class as class_name
       FROM students
       WHERE class IS NOT NULL
       ORDER BY class`
    )
    const classes = results.map(row => row.class_name)
    res.json(classes)
  } catch (error) {
    console.error('获取班级列表失败:', error)
    res.status(500).json({ message: '获取班级列表失败' })
  }
})

// 课程相关路由
router.get('/courses', auth, adminController.getCourses)

module.exports = router
