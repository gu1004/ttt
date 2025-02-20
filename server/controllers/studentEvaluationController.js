const db = require('../utils/db');

// 获取待评价课程列表
exports.getPendingCourses = async (req, res) => {
  try {
    const studentId = req.user.id;

    const query = `
      SELECT DISTINCT
        c.id,
        c.name,
        t.name as teacherName,
        e.status as evaluation_status,
        c.start_time,
        c.end_time,
        e.total_score,
        CASE
          WHEN e.status = 'pending' THEN '审核中'
          WHEN e.status = 'approved' THEN '已通过'
          WHEN e.status = 'rejected' THEN '已驳回'
          ELSE '待评价'
        END as status_text,
        CASE
          WHEN e.status = 'pending' THEN '查看评价'
          WHEN e.status = 'approved' THEN '查看评价'
          WHEN e.status = 'rejected' AND NOW() <= c.end_time THEN '重新评价'
          WHEN e.status = 'rejected' AND NOW() > c.end_time THEN '已截止'
          WHEN e.status IS NULL AND NOW() <= c.end_time THEN '去评价'
          ELSE '已截止'
        END as button_text,
        CASE
          WHEN (e.status = 'rejected' OR e.status IS NULL) AND NOW() > c.end_time THEN true
          ELSE false
        END as button_disabled
      FROM student_courses sc
      INNER JOIN courses c ON sc.course_id = c.id
      INNER JOIN teachers t ON c.teacher_id = t.id
      LEFT JOIN evaluations e ON e.course_id = c.id AND e.student_id = ?
      WHERE sc.student_id = ?
        AND c.start_time IS NOT NULL
        AND c.end_time IS NOT NULL
      ORDER BY c.end_time DESC, c.id DESC
    `;

    const [courses] = await db.query(query, [studentId, studentId]);

    // 添加调试日志
    console.log('获取待评价课程列表:', courses);

    res.json(courses);
  } catch (error) {
    console.error('获取待评价课程失败:', error);
    res.status(500).json({ message: '获取待评价课程失败' });
  }
};

// 提交课程评价
exports.submitEvaluation = async (req, res) => {
  try {
    const studentId = req.user.id;
    const courseId = req.params.courseId;

    // 1. 首先检查评价时间是否在有效期内
    const [timeCheck] = await db.query(
      `SELECT
        n.start_time,
        n.end_time,
        CASE
          WHEN UTC_TIMESTAMP() < n.start_time THEN 'not_started'
          WHEN UTC_TIMESTAMP() > n.end_time THEN 'expired'
          ELSE 'valid'
        END as time_status
       FROM student_courses sc
       INNER JOIN courses c ON sc.course_id = c.id
       LEFT JOIN notifications n ON n.course_id = c.id
         AND n.type = 'evaluation_start'
       WHERE sc.student_id = ? AND c.id = ?`,
      [studentId, courseId]
    );

    if (timeCheck.length === 0) {
      return res.status(404).json({ message: '未找到该课程' });
    }

    const { time_status, start_time, end_time } = timeCheck[0];

    // 检查评价时间状态
    if (time_status === 'not_started') {
      return res.status(400).json({
        message: `评价还未开始，开始时间：${new Date(start_time).toISOString()}`
      });
    }

    if (time_status === 'expired') {
      return res.status(400).json({
        message: `评价已截止，截止时间：${new Date(end_time).toISOString()}`
      });
    }

    // 2. 检查是否已经评价过
    const [existing] = await db.query(
      'SELECT id, status FROM evaluations WHERE student_id = ? AND course_id = ? AND status IN ("pending", "approved")',
      [studentId, courseId]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: '您已经评价过这门课程' });
    }

    // 3. 提交评价
    const {
      content_richness,
      content_update,
      content_organization,
      teaching_method_diversity,
      teaching_interaction,
      teaching_resource,
      teacher_attitude,
      teacher_ability,
      teacher_personality,
      course_objective,
      course_difficulty,
      course_pace,
      knowledge_grasp,
      ability_improvement,
      interest_stimulation,
      comment
    } = req.body;

    await db.query(
      `INSERT INTO evaluations (
        student_id, course_id,
        content_richness, content_update, content_organization,
        teaching_method_diversity, teaching_interaction, teaching_resource,
        teacher_attitude, teacher_ability, teacher_personality,
        course_objective, course_difficulty, course_pace,
        knowledge_grasp, ability_improvement, interest_stimulation,
        comment, create_time, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), 'pending')`,
      [
        studentId, courseId,
        content_richness, content_update, content_organization,
        teaching_method_diversity, teaching_interaction, teaching_resource,
        teacher_attitude, teacher_ability, teacher_personality,
        course_objective, course_difficulty, course_pace,
        knowledge_grasp, ability_improvement, interest_stimulation,
        comment
      ]
    );

    res.json({ message: '评价提交成功' });
  } catch (error) {
    console.error('提交评价失败:', error);
    res.status(500).json({ message: '提交评价失败' });
  }
};

// 获取评价详情
exports.getEvaluation = async (req, res) => {
  try {
    const studentId = req.user.id;
    const courseId = req.params.courseId;

    console.log('获取评价详情请求:', { studentId, courseId });

    // 查询评价详情
    const [evaluations] = await db.query(
      `SELECT
        content_richness, content_update, content_organization,
        teaching_method_diversity, teaching_interaction, teaching_resource,
        teacher_attitude, teacher_ability, teacher_personality,
        course_objective, course_difficulty, course_pace,
        knowledge_grasp, ability_improvement, interest_stimulation,
        total_score, comment, create_time,
        c.name as course_name,
        t.name as teacher_name
       FROM evaluations e
       JOIN courses c ON e.course_id = c.id
       JOIN teachers t ON c.teacher_id = t.id
       WHERE e.student_id = ? AND e.course_id = ?`,
      [studentId, courseId]
    );

    console.log('查询结果:', evaluations);

    if (evaluations.length === 0) {
      console.log('未找到评价记录');
      return res.status(404).json({ message: '未找到该课程的评价' });
    }

    res.json(evaluations[0]);
  } catch (error) {
    console.error('获取评价详情失败:', error);
    res.status(500).json({
      message: '获取评价详情失败',
      error: error.message
    });
  }
};
