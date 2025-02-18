const db = require('../utils/db');

// 获取学生个人信息
exports.getStudentInfo = async (req, res) => {
  try {
    const studentId = req.user.id;
    const [students] = await db.query(
      `SELECT id, name, student_id, class, department, email, phone
       FROM students WHERE id = ?`,
      [studentId]
    );

    if (students.length === 0) {
      return res.status(404).json({ message: '学生信息不存在' });
    }

    res.json(students[0]);
  } catch (error) {
    console.error('获取学生信息失败:', error);
    res.status(500).json({ message: '获取学生信息失败' });
  }
};

// 更新学生个人信息
exports.updateStudentInfo = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { email, phone } = req.body;

    // 验证邮箱是否已被其他用户使用
    const [existingEmail] = await db.query(
      'SELECT id FROM students WHERE email = ? AND id != ?',
      [email, studentId]
    );

    if (existingEmail.length > 0) {
      return res.status(400).json({ message: '该邮箱已被使用' });
    }

    // 验证手机号是否已被其他用户使用
    const [existingPhone] = await db.query(
      'SELECT id FROM students WHERE phone = ? AND id != ?',
      [phone, studentId]
    );

    if (existingPhone.length > 0) {
      return res.status(400).json({ message: '该手机号已被使用' });
    }

    // 只更新 email 和 phone 字段
    await db.query(
      `UPDATE students
       SET email = ?, phone = ?
       WHERE id = ?`,
      [email, phone, studentId]
    );

    res.json({ message: '个人信息更新成功' });
  } catch (error) {
    console.error('更新学生信息失败:', error);
    res.status(500).json({ message: '更新学生信息失败' });
  }
};

// 修改密码
exports.changePassword = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { oldPassword, newPassword } = req.body;

    // 验证原密码
    const [students] = await db.query(
      'SELECT password FROM students WHERE id = ?',
      [studentId]
    );

    if (students[0].password !== oldPassword) {
      return res.status(400).json({ message: '原密码错误' });
    }

    // 更新密码
    await db.query(
      'UPDATE students SET password = ? WHERE id = ?',
      [newPassword, studentId]
    );

    res.json({ message: '密码修改成功' });
  } catch (error) {
    console.error('修改密码失败:', error);
    res.status(500).json({ message: '修改密码失败' });
  }
};

// 获取课程评价通知
exports.getNotifications = async (req, res) => {
  try {
    const studentId = req.user.id;
    const [notifications] = await db.query(
      `SELECT n.id, n.title, n.content, n.type, n.course_id,
        n.start_time, n.end_time, n.create_time,
        c.name as course_name,
        CASE WHEN nr.id IS NOT NULL THEN 1 ELSE 0 END as \`read\`
       FROM notifications n
       JOIN courses c ON n.course_id = c.id
       JOIN student_courses sc ON c.id = sc.course_id AND sc.student_id = ?
       LEFT JOIN notification_reads nr ON nr.notification_id = n.id
         AND nr.user_id = ? AND nr.user_type = 'student'
       WHERE n.target_type = 'students'
          OR (n.target_type = 'course' AND n.course_id IN (
             SELECT course_id FROM student_courses WHERE student_id = ?
          ))
       ORDER BY n.create_time DESC`,
      [studentId, studentId, studentId]
    );

    res.json(notifications);
  } catch (error) {
    console.error('获取通知失败:', error);
    res.status(500).json({ message: '获取通知失败' });
  }
};

// 标记通知为已读
exports.markNotificationRead = async (req, res) => {
  try {
    const studentId = req.user.id;
    const notificationId = req.params.id;

    await db.query(
      `INSERT IGNORE INTO notification_reads
       (notification_id, user_id, user_type)
       VALUES (?, ?, 'student')`,
      [notificationId, studentId]
    );

    res.json({ message: '标记成功' });
  } catch (error) {
    console.error('标记通知失败:', error);
    res.status(500).json({ message: '标记通知失败' });
  }
};

// 标记所有通知为已读
exports.markAllNotificationsRead = async (req, res) => {
  try {
    const studentId = req.user.id;

    await db.query(
      `INSERT IGNORE INTO notification_reads (notification_id, user_id, user_type)
       SELECT n.id, ?, 'student'
       FROM notifications n
       JOIN student_courses sc ON n.course_id = sc.course_id
       WHERE sc.student_id = ?
         AND (n.target_type = 'students'
          OR (n.target_type = 'course' AND n.course_id IN (
             SELECT course_id FROM student_courses WHERE student_id = ?
          )))`,
      [studentId, studentId, studentId]
    );

    res.json({ message: '全部标记成功' });
  } catch (error) {
    console.error('标记所有通知失败:', error);
    res.status(500).json({ message: '标记所有通知失败' });
  }
};
