const db = require('../utils/db');
const { Parser } = require('json2csv');
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

const teacherController = {
  // 获取教师课程列表
  getCourses: async (req, res) => {
    try {
      const teacherId = req.user.id
      const [courses] = await db.query(`
        SELECT
          c.id,
          c.name,
          c.description,
          DATE_FORMAT(c.start_date, '%Y-%m-%d') as start_date,
          DATE_FORMAT(c.end_date, '%Y-%m-%d') as end_date,
          (SELECT COUNT(*) FROM student_courses sc WHERE sc.course_id = c.id) as student_count
        FROM courses c
        WHERE c.teacher_id = ?
        ORDER BY c.created_at DESC
      `, [teacherId])

      res.json(courses)
    } catch (error) {
      console.error('获取课程列表失败:', error)
      res.status(500).json({ message: '获取课程列表失败' })
    }
  },

  // 创建课程
  createCourse: async (req, res) => {
    try {
      const teacherId = req.user.id
      const { name, description, startDate, endDate } = req.body

      const [result] = await db.query(
        `INSERT INTO courses (name, description, teacher_id, start_date, end_date)
         VALUES (?, ?, ?, ?, ?)`,
        [name, description, teacherId, startDate, endDate]
      )

      res.json({
        message: '课程创建成功',
        courseId: result.insertId
      })
    } catch (error) {
      console.error('创建课程失败:', error)
      res.status(500).json({ message: '创建课程失败' })
    }
  },

  // 更新课程
  updateCourse: async (req, res) => {
    try {
      const courseId = req.params.id
      const teacherId = req.user.id
      const { name, description, start_date, end_date } = req.body

      // 检查课程是否存在且属于该教师
      const [courses] = await db.query(
        'SELECT * FROM courses WHERE id = ? AND teacher_id = ?',
        [courseId, teacherId]
      )

      if (courses.length === 0) {
        return res.status(404).json({ message: '课程不存在或无权限修改' })
      }

      // 构建更新字段
      const updates = []
      const values = []

      if (name !== undefined) {
        updates.push('name = ?')
        values.push(name)
      }
      if (description !== undefined) {
        updates.push('description = ?')
        values.push(description)
      }
      if (start_date !== undefined && start_date !== null) {
        updates.push('start_date = ?')
        values.push(start_date)
      }
      if (end_date !== undefined && end_date !== null) {
        updates.push('end_date = ?')
        values.push(end_date)
      }

      // 如果没有要更新的字段，直接返回成功
      if (updates.length === 0) {
        return res.json({ message: '更新成功' })
      }

      // 添加查询条件的参数
      values.push(courseId, teacherId)

      // 执行更新
      await db.query(
        `UPDATE courses SET ${updates.join(', ')} WHERE id = ? AND teacher_id = ?`,
        values
      )

      res.json({ message: '更新成功' })
    } catch (error) {
      console.error('更新课程失败:', error)
      res.status(500).json({ message: '更新课程失败' })
    }
  },

  // 删除课程
  deleteCourse: async (req, res) => {
    try {
      const { id } = req.params
      const teacherId = req.user.id

      await db.query(
        'DELETE FROM courses WHERE id = ? AND teacher_id = ?',
        [id, teacherId]
      )

      res.json({ message: '课程删除成功' })
    } catch (error) {
      console.error('删除课程失败:', error)
      res.status(500).json({ message: '删除课程失败' })
    }
  },

  // 获取学生评价
  async getEvaluations(req, res) {
    try {
      const teacherId = req.user.id
      const [evaluations] = await db.query(`
        SELECT
          c.name as courseName,
          ROUND(AVG(content_richness + content_update + content_organization), 1) as teaching_content,
          ROUND(AVG(teaching_method_diversity + teaching_interaction + teaching_resource), 1) as teaching_method,
          ROUND(AVG(teacher_attitude + teacher_ability + teacher_personality), 1) as teacher_performance,
          ROUND(AVG(course_objective + course_difficulty + course_pace), 1) as course_design,
          ROUND(AVG(knowledge_grasp + ability_improvement + interest_stimulation), 1) as learning_effect,
          COUNT(*) as evaluation_count
        FROM evaluations e
        JOIN courses c ON e.course_id = c.id
        WHERE c.teacher_id = ? AND e.status = 'approved'
        GROUP BY c.id, c.name
        ORDER BY evaluation_count DESC
      `, [teacherId])

      res.json(evaluations)
    } catch (error) {
      console.error('获取评价列表失败:', error)
      res.status(500).json({ message: '获取评价列表失败' })
    }
  },

  // 导出评价报告
  async exportEvaluationReport(req, res) {
    let doc = null;
    try {
      const teacherId = req.user.id;
      const courseId = req.query.courseId;

      // 获取课程信息和评价数据
      const [courses] = await db.query(
        `SELECT c.*, t.name as teacherName, t.title as teacherTitle, t.department
         FROM courses c
         JOIN teachers t ON c.teacher_id = t.id
         WHERE c.teacher_id = ? AND c.id = ?`,
        [teacherId, courseId]
      );

      if (courses.length === 0) {
        return res.status(404).json({ message: '未找到课程信息' });
      }

      // 获取评价统计信息
      const [evaluationStats] = await db.query(
        `SELECT
          COUNT(*) as total_evaluations,
          (SELECT COUNT(*) FROM student_courses WHERE course_id = ?) as total_students,
          ROUND(AVG(content_richness), 1) as avg_content_richness,
          ROUND(AVG(content_update), 1) as avg_content_update,
          ROUND(AVG(content_organization), 1) as avg_content_organization,
          ROUND(AVG(teaching_method_diversity), 1) as avg_teaching_method_diversity,
          ROUND(AVG(teaching_interaction), 1) as avg_teaching_interaction,
          ROUND(AVG(teaching_resource), 1) as avg_teaching_resource,
          ROUND(AVG(teacher_attitude), 1) as avg_teacher_attitude,
          ROUND(AVG(teacher_ability), 1) as avg_teacher_ability,
          ROUND(AVG(teacher_personality), 1) as avg_teacher_personality,
          ROUND(AVG(course_objective), 1) as avg_course_objective,
          ROUND(AVG(course_difficulty), 1) as avg_course_difficulty,
          ROUND(AVG(course_pace), 1) as avg_course_pace,
          ROUND(AVG(knowledge_grasp), 1) as avg_knowledge_grasp,
          ROUND(AVG(ability_improvement), 1) as avg_ability_improvement,
          ROUND(AVG(interest_stimulation), 1) as avg_interest_stimulation,
          MIN(create_time) as first_evaluation,
          MAX(create_time) as last_evaluation,
          COUNT(CASE WHEN (
            content_richness + content_update + content_organization +
            teaching_method_diversity + teaching_interaction + teaching_resource +
            teacher_attitude + teacher_ability + teacher_personality +
            course_objective + course_difficulty + course_pace +
            knowledge_grasp + ability_improvement + interest_stimulation
          ) >= 80 THEN 1 END) as excellent_count,
          COUNT(CASE WHEN (
            content_richness + content_update + content_organization +
            teaching_method_diversity + teaching_interaction + teaching_resource +
            teacher_attitude + teacher_ability + teacher_personality +
            course_objective + course_difficulty + course_pace +
            knowledge_grasp + ability_improvement + interest_stimulation
          ) < 60 THEN 1 END) as improvement_count
         FROM evaluations
         WHERE course_id = ? AND status = 'approved'`,
        [courseId, courseId]
      );

      const stats = evaluationStats[0];
      const participationRate = ((stats.total_evaluations / stats.total_students) * 100).toFixed(1);

      // 获取评价内容
      const [evaluations] = await db.query(
        `SELECT
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
          comment,
          create_time,
          (content_richness + content_update + content_organization +
           teaching_method_diversity + teaching_interaction + teaching_resource +
           teacher_attitude + teacher_ability + teacher_personality +
           course_objective + course_difficulty + course_pace +
           knowledge_grasp + ability_improvement + interest_stimulation) as total_score,
          ROUND((content_richness + content_update + content_organization) / 3, 1) as teaching_content,
          ROUND((teaching_method_diversity + teaching_interaction + teaching_resource) / 3, 1) as teaching_method,
          ROUND((teacher_attitude + teacher_ability + teacher_personality) / 3, 1) as teacher_performance,
          ROUND((course_objective + course_difficulty + course_pace) / 3, 1) as course_design,
          ROUND((knowledge_grasp + ability_improvement + interest_stimulation) / 3, 1) as learning_effect
         FROM evaluations
         WHERE course_id = ? AND status = 'approved'
         ORDER BY create_time DESC`,
        [courseId]
      );

      // 创建PDF文档
      doc = new PDFDocument({
        size: 'A4',
        margin: 50,
        info: {
          Title: '教学评价报告',
          Author: courses[0].teacherName
        }
      });

      // 设置响应头
      res.setHeader('Content-Type', 'application/pdf');
      const fileName = `教学评价报告_${courses[0].name}_${Date.now()}.pdf`;
      const encodedFileName = encodeURIComponent(fileName);
      res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodedFileName}`);

      // 将PDF文档pipe到响应流
      doc.pipe(res);

      // 注册黑体字体
      const fontPath = path.join(__dirname, '../fonts/simhei.ttf');
      doc.registerFont('SimHei', fontPath);
      doc.font('SimHei');

      // 1. 封面
      doc.fontSize(24).text('教学评价报告', { align: 'center' });
      doc.moveDown(2);
      doc.fontSize(16);
      doc.text(`课程：${courses[0].name}`, { align: 'center' });
      doc.moveDown();
      doc.text(`教师：${courses[0].teacherName}`, { align: 'center' });
      doc.moveDown();
      doc.text(`日期：${new Date().toLocaleDateString('zh-CN')}`, { align: 'center' });
      doc.addPage();

      // 2. 基本信息
      doc.fontSize(16).text('1. 基本信息', { underline: true });
      doc.moveDown();
      doc.fontSize(12);
      doc.text(`教师姓名：${courses[0].teacherName}`);
      doc.text(`职称：${courses[0].teacherTitle || '未设置'}`);
      doc.text(`所属院系：${courses[0].department || '未设置'}`);
      doc.text(`课程名称：${courses[0].name}`);
      doc.text(`课程描述：${courses[0].description || '无'}`);
      doc.moveDown();

      // 3. 评价概览
      doc.fontSize(16).text('2. 评价概览', { underline: true });
      doc.moveDown();
      doc.fontSize(12);
      doc.text(`参与率：${participationRate}% (${stats.total_evaluations}/${stats.total_students})`);
      doc.text(`评价时间范围：${new Date(stats.first_evaluation).toLocaleDateString('zh-CN')} - ${new Date(stats.last_evaluation).toLocaleDateString('zh-CN')}`);
      doc.moveDown();

      // 4. 评分分析
      doc.fontSize(16).text('3. 评分分析', { underline: true });
      doc.moveDown();
      doc.fontSize(12);

      // 4.1 教学内容
      doc.text('3.1 教学内容', { underline: true });
      doc.text(`★ 内容丰富性：${stats.avg_content_richness}`);
      doc.text(`★ 内容更新性：${stats.avg_content_update}`);
      doc.text(`★ 内容组织：${stats.avg_content_organization}`);
      doc.moveDown();

      // 4.2 教学方法
      doc.text('3.2 教学方法', { underline: true });
      doc.text(`★ 方法多样性：${stats.avg_teaching_method_diversity}`);
      doc.text(`★ 互动性：${stats.avg_teaching_interaction}`);
      doc.text(`★ 资源利用：${stats.avg_teaching_resource}`);
      doc.moveDown();

      // 4.3 教师表现
      doc.text('3.3 教师表现', { underline: true });
      doc.text(`★ 教学态度：${stats.avg_teacher_attitude}`);
      doc.text(`★ 教学能力：${stats.avg_teacher_ability}`);
      doc.text(`★ 亲和力：${stats.avg_teacher_personality}`);
      doc.moveDown();

      // 4.4 课程设计
      doc.text('3.4 课程设计', { underline: true });
      doc.text(`★ 课程目标：${stats.avg_course_objective}`);
      doc.text(`★ 课程难度：${stats.avg_course_difficulty}`);
      doc.text(`★ 课程进度：${stats.avg_course_pace}`);
      doc.moveDown();

      // 4.5 学习效果
      doc.text('3.5 学习效果', { underline: true });
      doc.text(`★ 知识掌握：${stats.avg_knowledge_grasp}`);
      doc.text(`★ 能力提升：${stats.avg_ability_improvement}`);
      doc.text(`★ 兴趣激发：${stats.avg_interest_stimulation}`);
      doc.moveDown(2);

      // 5. 反馈分析
      doc.fontSize(16).text('4. 反馈分析', { underline: true });
      doc.moveDown();
      doc.fontSize(12);

      doc.text(`总评价数：${stats.total_evaluations}条`);
      doc.text(`优秀评价（总分≥80）：${stats.excellent_count}条`);
      doc.text(`待改进（总分<60）：${stats.improvement_count}条`);
      doc.moveDown();

      // 6. 附录：学生评价
      doc.addPage();
      doc.fontSize(16).text('附录：学生评价详情', { underline: true });
      doc.moveDown();
      doc.fontSize(12);

      evaluations.forEach((evaluation, index) => {
        doc.text(`评价 ${index + 1}：`);
        doc.text(`时间：${new Date(evaluation.create_time).toLocaleString('zh-CN')}`);
        doc.text('评分：');
        doc.text(`★ 内容丰富性：${evaluation.content_richness}`);
        doc.text(`★ 内容更新性：${evaluation.content_update}`);
        doc.text(`★ 内容组织：${evaluation.content_organization}`);
        doc.text(`★ 教学方法多样性：${evaluation.teaching_method_diversity}`);
        doc.text(`★ 互动性：${evaluation.teaching_interaction}`);
        doc.text(`★ 教学资源利用：${evaluation.teaching_resource}`);
        doc.text(`★ 教学态度：${evaluation.teacher_attitude}`);
        doc.text(`★ 教学能力：${evaluation.teacher_ability}`);
        doc.text(`★ 亲和力：${evaluation.teacher_personality}`);
        doc.text(`★ 课程目标明确性：${evaluation.course_objective}`);
        doc.text(`★ 课程难度：${evaluation.course_difficulty}`);
        doc.text(`★ 课程进度：${evaluation.course_pace}`);
        doc.text(`★ 知识掌握：${evaluation.knowledge_grasp}`);
        doc.text(`★ 能力提升：${evaluation.ability_improvement}`);
        doc.text(`★ 兴趣激发：${evaluation.interest_stimulation}`);
        if (evaluation.comment) {
          doc.text('评价内容：');
          doc.text(evaluation.comment, { indent: 20 });
        }
        doc.moveDown();
      });

      // 结束文档
      doc.end();

    } catch (error) {
      console.error('导出评价报告失败:', error);

      // 确保在发生错误时正确关闭文档
      if (doc) {
        try {
          if (!doc._ending) {
            doc.end();
          }
        } catch (e) {
          console.error('关闭PDF文档失败:', e);
        }
      }

      // 如果headers还没有发送，返回错误响应
      if (!res.headersSent) {
        res.status(500).json({
          message: '导出评价报告失败: ' + error.message
        });
      }
    }
  },

  // 获取教师个人信息
  getProfile: async (req, res) => {
    try {
      const teacherId = req.user.id
      const [teachers] = await db.query(
        'SELECT id, name, username as teacherId, email, phone, department FROM teachers WHERE id = ?',
        [teacherId]
      )

      if (teachers.length === 0) {
        return res.status(404).json({ message: '教师信息不存在' })
      }

      res.json(teachers[0])
    } catch (error) {
      console.error('获取个人信息失败:', error)
      res.status(500).json({ message: '获取个人信息失败' })
    }
  },

  // 更新教师个人信息
  updateProfile: async (req, res) => {
    try {
      const teacherId = req.user.id
      const { email, phone } = req.body

      await db.query(
        'UPDATE teachers SET email = ?, phone = ? WHERE id = ?',
        [email, phone, teacherId]
      )

      res.json({ message: '个人信息更新成功' })
    } catch (error) {
      console.error('更新个人信息失败:', error)
      res.status(500).json({ message: '更新个人信息失败' })
    }
  },

  // 修改密码
  updatePassword: async (req, res) => {
    try {
      const teacherId = req.user.id
      const { oldPassword, newPassword } = req.body

      // 验证原密码
      const [teachers] = await db.query(
        'SELECT password FROM teachers WHERE id = ?',
        [teacherId]
      )

      if (teachers[0].password !== oldPassword) {
        return res.status(400).json({ message: '原密码错误' })
      }

      // 更新密码
      await db.query(
        'UPDATE teachers SET password = ? WHERE id = ?',
        [newPassword, teacherId]
      )

      res.json({ message: '密码修改成功' })
    } catch (error) {
      console.error('修改密码失败:', error)
      res.status(500).json({ message: '修改密码失败' })
    }
  },

  // 获取教师通知列表
  getNotifications: async (req, res) => {
    try {
      const teacherId = req.user.id
      const [notifications] = await db.query(
        `SELECT n.id, n.title, n.content, n.type, n.course_id,
          n.create_time, c.name as course_name,
          CASE WHEN nr.id IS NOT NULL THEN 1 ELSE 0 END as \`read\`
         FROM notifications n
         LEFT JOIN courses c ON n.course_id = c.id
         LEFT JOIN notification_reads nr ON nr.notification_id = n.id
           AND nr.user_id = ? AND nr.user_type = 'teacher'
         WHERE (n.target_type = 'teachers' AND n.type = 'evaluation_result')
           OR (n.target_type = 'course' AND n.course_id IN (
             SELECT course_id FROM courses WHERE teacher_id = ?
           ))
         ORDER BY n.create_time DESC`,
        [teacherId, teacherId]
      )

      res.json(notifications)
    } catch (error) {
      console.error('获取通知列表失败:', error)
      res.status(500).json({ message: '获取通知列表失败' })
    }
  },

  // 获取评分详情（按课程）
  async getEvaluationDetails(req, res) {
    try {
      const teacherId = req.user.id
      const courseId = req.query.courseId
      const [details] = await db.query(`
        SELECT
          -- 教学内容维度
          MAX(content_richness) as content_richness_max,
          MIN(content_richness) as content_richness_min,
          MAX(content_update) as content_update_max,
          MIN(content_update) as content_update_min,
          MAX(content_organization) as content_organization_max,
          MIN(content_organization) as content_organization_min,

          -- 教学方法维度
          MAX(teaching_method_diversity) as teaching_method_diversity_max,
          MIN(teaching_method_diversity) as teaching_method_diversity_min,
          MAX(teaching_interaction) as teaching_interaction_max,
          MIN(teaching_interaction) as teaching_interaction_min,
          MAX(teaching_resource) as teaching_resource_max,
          MIN(teaching_resource) as teaching_resource_min,

          -- 教师表现维度
          MAX(teacher_attitude) as teacher_attitude_max,
          MIN(teacher_attitude) as teacher_attitude_min,
          MAX(teacher_ability) as teacher_ability_max,
          MIN(teacher_ability) as teacher_ability_min,
          MAX(teacher_personality) as teacher_personality_max,
          MIN(teacher_personality) as teacher_personality_min,

          -- 课程设计维度
          MAX(course_objective) as course_objective_max,
          MIN(course_objective) as course_objective_min,
          MAX(course_difficulty) as course_difficulty_max,
          MIN(course_difficulty) as course_difficulty_min,
          MAX(course_pace) as course_pace_max,
          MIN(course_pace) as course_pace_min,

          -- 学习效果维度
          MAX(knowledge_grasp) as knowledge_grasp_max,
          MIN(knowledge_grasp) as knowledge_grasp_min,
          MAX(ability_improvement) as ability_improvement_max,
          MIN(ability_improvement) as ability_improvement_min,
          MAX(interest_stimulation) as interest_stimulation_max,
          MIN(interest_stimulation) as interest_stimulation_min
        FROM evaluations e
        JOIN courses c ON e.course_id = c.id
        WHERE c.teacher_id = ? AND e.course_id = ? AND e.status = 'approved'
      `, [teacherId, courseId])

      const formattedDetails = {
        content: [
          { name: '内容丰富性', max: details[0].content_richness_max, min: details[0].content_richness_min },
          { name: '内容更新性', max: details[0].content_update_max, min: details[0].content_update_min },
          { name: '内容组织', max: details[0].content_organization_max, min: details[0].content_organization_min }
        ],
        method: [
          { name: '教学方法多样性', max: details[0].teaching_method_diversity_max, min: details[0].teaching_method_diversity_min },
          { name: '互动性', max: details[0].teaching_interaction_max, min: details[0].teaching_interaction_min },
          { name: '教学资源利用', max: details[0].teaching_resource_max, min: details[0].teaching_resource_min }
        ],
        teacher: [
          { name: '教学态度', max: details[0].teacher_attitude_max, min: details[0].teacher_attitude_min },
          { name: '教学能力', max: details[0].teacher_ability_max, min: details[0].teacher_ability_min },
          { name: '亲和力', max: details[0].teacher_personality_max, min: details[0].teacher_personality_min }
        ],
        course: [
          { name: '课程目标明确性', max: details[0].course_objective_max, min: details[0].course_objective_min },
          { name: '课程难度', max: details[0].course_difficulty_max, min: details[0].course_difficulty_min },
          { name: '课程进度', max: details[0].course_pace_max, min: details[0].course_pace_min }
        ],
        effect: [
          { name: '知识掌握', max: details[0].knowledge_grasp_max, min: details[0].knowledge_grasp_min },
          { name: '能力提升', max: details[0].ability_improvement_max, min: details[0].ability_improvement_min },
          { name: '兴趣激发', max: details[0].interest_stimulation_max, min: details[0].interest_stimulation_min }
        ]
      }

      res.json(formattedDetails)
    } catch (error) {
      console.error('获取评分详情失败:', error)
      res.status(500).json({ message: '获取评分详情失败' })
    }
  },

  // 获取评价关键词
  async getEvaluationKeywords(req, res) {
    try {
      const teacherId = req.user.id
      const courseId = req.query.courseId
      const [comments] = await db.query(`
        SELECT comment
        FROM evaluations e
        JOIN courses c ON e.course_id = c.id
        WHERE c.teacher_id = ? AND e.course_id = ? AND e.status = 'approved'
        AND comment IS NOT NULL AND comment != ''
      `, [teacherId, courseId])

      // 简单的关键词提取示例
      const keywords = {}
      comments.forEach(({ comment }) => {
        const words = comment.split(/[,，。！？\s]+/)
        words.forEach(word => {
          if (word.length >= 2) {
            keywords[word] = (keywords[word] || 0) + 1
          }
        })
      })

      const wordCloudData = Object.entries(keywords).map(([name, value]) => ({
        name,
        value: value * 1000
      })).sort((a, b) => b.value - a.value).slice(0, 100)

      res.json(wordCloudData)
    } catch (error) {
      console.error('获取评价关键词失败:', error)
      res.status(500).json({ message: '获取评价关键词失败' })
    }
  },

  // 获取评分平均分
  async getEvaluationAverages(req, res) {
    try {
      const teacherId = req.user.id
      const courseId = req.query.courseId
      const [averages] = await db.query(`
        SELECT
          ROUND(AVG(content_richness), 1) as content_richness_avg,
          ROUND(AVG(content_update), 1) as content_update_avg,
          ROUND(AVG(content_organization), 1) as content_organization_avg,
          ROUND(AVG(teaching_method_diversity), 1) as teaching_method_diversity_avg,
          ROUND(AVG(teaching_interaction), 1) as teaching_interaction_avg,
          ROUND(AVG(teaching_resource), 1) as teaching_resource_avg,
          ROUND(AVG(teacher_attitude), 1) as teacher_attitude_avg,
          ROUND(AVG(teacher_ability), 1) as teacher_ability_avg,
          ROUND(AVG(teacher_personality), 1) as teacher_personality_avg,
          ROUND(AVG(course_objective), 1) as course_objective_avg,
          ROUND(AVG(course_difficulty), 1) as course_difficulty_avg,
          ROUND(AVG(course_pace), 1) as course_pace_avg,
          ROUND(AVG(knowledge_grasp), 1) as knowledge_grasp_avg,
          ROUND(AVG(ability_improvement), 1) as ability_improvement_avg,
          ROUND(AVG(interest_stimulation), 1) as interest_stimulation_avg
        FROM evaluations e
        JOIN courses c ON e.course_id = c.id
        WHERE c.teacher_id = ? AND e.course_id = ? AND e.status = 'approved'
      `, [teacherId, courseId])

      const formattedAverages = [
        { name: '内容丰富性', average: averages[0].content_richness_avg },
        { name: '内容更新性', average: averages[0].content_update_avg },
        { name: '内容组织', average: averages[0].content_organization_avg },
        { name: '教学方法多样性', average: averages[0].teaching_method_diversity_avg },
        { name: '互动性', average: averages[0].teaching_interaction_avg },
        { name: '教学资源利用', average: averages[0].teaching_resource_avg },
        { name: '教学态度', average: averages[0].teacher_attitude_avg },
        { name: '教学能力', average: averages[0].teacher_ability_avg },
        { name: '亲和力', average: averages[0].teacher_personality_avg },
        { name: '课程目标明确性', average: averages[0].course_objective_avg },
        { name: '课程难度', average: averages[0].course_difficulty_avg },
        { name: '课程进度', average: averages[0].course_pace_avg },
        { name: '知识掌握', average: averages[0].knowledge_grasp_avg },
        { name: '能力提升', average: averages[0].ability_improvement_avg },
        { name: '兴趣激发', average: averages[0].interest_stimulation_avg }
      ]

      res.json(formattedAverages)
    } catch (error) {
      console.error('获取评分平均分失败:', error)
      res.status(500).json({ message: '获取评分平均分失败' })
    }
  },

  // 标记通知为已读
  markNotificationRead: async (req, res) => {
    try {
      const teacherId = req.user.id
      const notificationId = req.params.id

      // 插入通知阅读记录
      await db.query(
        `INSERT IGNORE INTO notification_reads
         (notification_id, user_id, user_type, read_time)
         VALUES (?, ?, 'teacher', NOW())`,
        [notificationId, teacherId]
      )

      res.json({ message: '标记成功' })
    } catch (error) {
      console.error('标记通知失败:', error)
      res.status(500).json({ message: '标记通知失败' })
    }
  }
};

module.exports = teacherController;
