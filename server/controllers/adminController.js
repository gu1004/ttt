const db = require('../utils/db');

const adminController = {
  // 创建新通知
  createNotification: async (req, res) => {
    try {
      const { notificationType, targetType, courseId, courseReceiverType, content, startTime, endTime } = req.body;
      const adminId = req.user.id;

      await db.query('START TRANSACTION');

      if (targetType === 'course' && courseId) {
        // 获取课程信息
        const [courses] = await db.query(
          'SELECT c.name, t.id as teacher_id FROM courses c JOIN teachers t ON c.teacher_id = t.id WHERE c.id = ?',
          [courseId]
        );

        if (courses.length === 0) {
          throw new Error('课程不存在');
        }

        const courseName = courses[0].name;
        const teacherId = courses[0].teacher_id;

        // 根据通知类型和接收方类型创建通知
        if (courseReceiverType === 'student' || courseReceiverType === 'both') {
          let studentTitle, studentContent;
          if (notificationType === 'evaluation_start') {
            studentTitle = `${courseName}课程评价开始`;
            studentContent = `请在${endTime}之前完成${courseName}课程的教学评价。`;
          } else if (notificationType === 'evaluation_due') {
            studentTitle = `${courseName}课程评价即将截止`;
            studentContent = `请注意，${courseName}课程的教学评价即将截止，请尽快完成评价。`;
          }
          if (content) {
            studentContent += `\n\n补充说明：${content}`;
          }

          // 创建学生通知
          await db.query(
            `INSERT INTO notifications
             (title, content, type, target_type, course_id, start_time, end_time, created_by, send_time)
             VALUES (?, ?, ?, 'students', ?, ?, ?, ?, NOW())`,
            [
              studentTitle,
              studentContent,
              notificationType,
              courseId,
              startTime,
              endTime,
              adminId
            ]
          );
        }

        if (courseReceiverType === 'teacher' || courseReceiverType === 'both') {
          let teacherTitle, teacherContent;
          if (notificationType === 'evaluation_start') {
            teacherTitle = `${courseName}课程开始接受评价`;
            teacherContent = `您的课程"${courseName}"已开始接受学生评价，评价时间为：${startTime} 至 ${endTime}。`;
          } else if (notificationType === 'evaluation_due') {
            teacherTitle = `${courseName}课程评价即将截止`;
            teacherContent = `您的课程"${courseName}"的评价即将截止，截止时间为：${endTime}。`;
          } else if (notificationType === 'evaluation_result') {
            teacherTitle = `${courseName}课程评价统计结果已出`;
            teacherContent = `您的课程"${courseName}"的教学评价统计结果已生成，请及时查看。`;
          }
          if (content) {
            teacherContent += `\n\n补充说明：${content}`;
          }

          // 创建教师通知
          await db.query(
            `INSERT INTO notifications
             (title, content, type, target_type, course_id, start_time, end_time, created_by, send_time)
             VALUES (?, ?, ?, 'teachers', ?, ?, ?, ?, NOW())`,
            [
              teacherTitle,
              teacherContent,
              notificationType,
              courseId,
              startTime,
              endTime,
              adminId
            ]
          );
        }
      } else {
        // 处理全局通知（所有学生或所有教师）
        let title, notificationContent;
        if (targetType === 'students') {
          if (notificationType === 'evaluation_start') {
            title = '课程评价开始通知';
            notificationContent = '请注意查看您需要评价的课程，并在规定时间内完成评价。';
          } else if (notificationType === 'evaluation_due') {
            title = '课程评价截止提醒';
            notificationContent = '请注意查看您尚未完成评价的课程，评价即将截止。';
          }
        } else if (targetType === 'teachers' && notificationType === 'evaluation_result') {
          title = '课程评价统计结果通知';
          notificationContent = '您的课程评价统计结果已生成，请及时查看。';
        }

        if (content) {
          notificationContent += `\n\n补充说明：${content}`;
        }

        await db.query(
          `INSERT INTO notifications
           (title, content, type, target_type, created_by, send_time)
           VALUES (?, ?, ?, ?, ?, NOW())`,
          [title, notificationContent, notificationType, targetType, adminId]
        );
      }

      await db.query('COMMIT');
      res.json({ message: '通知发送成功' });
    } catch (error) {
      await db.query('ROLLBACK');
      console.error('发送通知失败:', error);
      res.status(500).json({ message: error.message || '发送通知失败' });
    }
  },

  // 获取通知列表
  getNotifications: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1
      const pageSize = parseInt(req.query.pageSize) || 10
      const search = req.query.search || ''
      const offset = (page - 1) * pageSize

      // 获取总记录数
      const [totalResult] = await db.query(`
        SELECT COUNT(*) as total
        FROM notifications n
        LEFT JOIN courses c ON n.course_id = c.id
        WHERE n.title LIKE ? OR c.name LIKE ?
      `, [`%${search}%`, `%${search}%`])

      const total = totalResult[0].total

      // 获取通知列表
      const [notifications] = await db.query(`
        SELECT
          n.*,
          c.name as course_name,
          a.name as creator_name
        FROM notifications n
        LEFT JOIN courses c ON n.course_id = c.id
        LEFT JOIN administrators a ON n.created_by = a.id
        WHERE n.title LIKE ? OR c.name LIKE ?
        ORDER BY n.create_time DESC
        LIMIT ? OFFSET ?
      `, [`%${search}%`, `%${search}%`, pageSize, offset])

      res.json({
        total,
        data: notifications
      })
    } catch (error) {
      console.error('获取通知列表失败:', error)
      res.status(500).json({ message: '获取通知列表失败' })
    }
  },

  // 发送评价开始通知
  sendEvaluationStartNotification: async (req, res) => {
    try {
      const { courseId, startTime, endTime } = req.body;
      const adminId = req.user.id;

      await db.query('START TRANSACTION');

      // 获取课程信息
      const [courses] = await db.query(
        'SELECT name FROM courses WHERE id = ?',
        [courseId]
      );

      if (courses.length === 0) {
        await db.query('ROLLBACK');
        return res.status(404).json({ message: '课程不存在' });
      }

      const courseName = courses[0].name;

      // 向学生发送开始评价通知
      await db.query(`
        INSERT INTO notifications (
          title, content, type, course_id,
          start_time, end_time, target_type,
          send_time, created_by
        )
        VALUES (?, ?, 'evaluation_start', ?, ?, ?, 'students', NOW(), ?)
      `, [
        `${courseName}课程评价开始`,
        `请在${new Date(endTime).toLocaleString('zh-CN')}之前完成${courseName}课程的教学评价。`,
        courseId,
        startTime,
        endTime,
        adminId
      ]);

      await db.query('COMMIT');
      res.json({ message: '评价开始通知发送成功' });
    } catch (error) {
      await db.query('ROLLBACK');
      console.error('发送评价开始通知失败:', error);
      res.status(500).json({ message: '发送评价开始通知失败' });
    }
  },

  // 发送评价即将截止通知
  sendEvaluationDueNotification: async (req, res) => {
    try {
      const { courseId } = req.body;
      const adminId = req.user.id;

      await db.query('START TRANSACTION');

      // 获取课程信息
      const [courses] = await db.query(
        'SELECT name, end_time FROM courses WHERE id = ?',
        [courseId]
      );

      if (courses.length === 0) {
        await db.query('ROLLBACK');
        return res.status(404).json({ message: '课程不存在' });
      }

      // 向未完成评价的学生发送提醒
      await db.query(`
        INSERT INTO notifications (
          title, content, type, course_id, target_type,
          send_time, created_by
        )
        VALUES (?, ?, 'evaluation_due', ?, 'students', NOW(), ?)
      `, [
        `${courses[0].name}课程评价即将截止`,
        `请尽快完成${courses[0].name}课程的教学评价，截止时间为：${new Date(courses[0].end_time).toLocaleString('zh-CN')}`,
        courseId,
        adminId
      ]);

      await db.query('COMMIT');
      res.json({ message: '评价截止提醒发送成功' });
    } catch (error) {
      await db.query('ROLLBACK');
      console.error('发送评价截止通知失败:', error);
      res.status(500).json({ message: '发送评价截止通知失败' });
    }
  },

  // 发送评价完成通知
  sendEvaluationCompleteNotification: async (req, res) => {
    try {
      const { courseId } = req.body;
      const adminId = req.user.id;

      await db.query('START TRANSACTION');

      // 获取课程信息
      const [courses] = await db.query(
        'SELECT c.name, t.id as teacher_id FROM courses c JOIN teachers t ON c.teacher_id = t.id WHERE c.id = ?',
        [courseId]
      );

      if (courses.length === 0) {
        await db.query('ROLLBACK');
        return res.status(404).json({ message: '课程不存在' });
      }

      // 向教师发送评价完成通知
      await db.query(`
        INSERT INTO notifications (
          title, content, type, course_id, target_type,
          send_time, created_by
        )
        VALUES (?, ?, 'evaluation_complete', ?, 'teachers', NOW(), ?)
      `, [
        `${courses[0].name}课程评价已完成`,
        `${courses[0].name}课程的教学评价已完成，请查看评价报告。`,
        courseId,
        adminId
      ]);

      await db.query('COMMIT');
      res.json({ message: '评价完成通知发送成功' });
    } catch (error) {
      await db.query('ROLLBACK');
      console.error('发送评价完成通知失败:', error);
      res.status(500).json({ message: '发送评价完成通知失败' });
    }
  },

  // 获取课程列表
  getCourses: async (req, res) => {
    try {
      const query = `
        SELECT
          c.id,
          c.name,
          c.description,
          DATE_FORMAT(c.start_date, '%Y-%m-%d') as start_date,
          DATE_FORMAT(c.end_date, '%Y-%m-%d') as end_date,
          t.id as teacher_id,
          t.name as teacher,
          GROUP_CONCAT(DISTINCT cc.class_name) as classes
        FROM courses c
        LEFT JOIN teachers t ON c.teacher_id = t.id
        LEFT JOIN course_classes cc ON c.id = cc.course_id
        GROUP BY c.id, c.name, c.description, c.start_date, c.end_date, t.id, t.name
        ORDER BY c.start_date DESC`

      const [courses] = await db.query(query)
      res.json(courses)
    } catch (error) {
      console.error('获取课程列表失败:', error)
      res.status(500).json({ message: '获取课程列表失败' })
    }
  },

  // 获取课程评价时间
  getCourseEvaluationTime: async (req, res) => {
    try {
      const { courseId } = req.params;

      const [result] = await db.query(
        `SELECT start_time, end_time
         FROM courses
         WHERE id = ?`,
        [courseId]
      );

      if (result.length === 0) {
        return res.status(404).json({ message: '课程不存在' });
      }

      res.json({
        startTime: result[0].start_time,
        endTime: result[0].end_time
      });
    } catch (error) {
      console.error('获取课程评价时间失败:', error);
      res.status(500).json({ message: '获取课程评价时间失败' });
    }
  }
};

module.exports = adminController;
