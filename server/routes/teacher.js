const express = require('express');
const router = express.Router();
const teacherController = require('../controllers/teacherController');

// 获取教师负责的课程
router.get('/courses', teacherController.getCourses);

// 获取学生评价
router.get('/evaluations', teacherController.getStudentEvaluations);

// 导出评价报告
router.get('/evaluations/report', teacherController.exportEvaluationReport);

module.exports = router;
