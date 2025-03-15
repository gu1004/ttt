const express = require('express');
const router = express.Router();
const studentEvaluationController = require('../controllers/studentEvaluationController');
const studentController = require('../controllers/studentController');

// 评价相关路由
router.get('/pending-courses', studentEvaluationController.getPendingCourses);
router.post('/evaluations/:courseId', studentEvaluationController.submitEvaluation);
router.get('/evaluations/:courseId', studentEvaluationController.getEvaluation);

// 个人信息相关路由
router.get('/info', studentController.getStudentInfo);
router.put('/info', studentController.updateStudentInfo);
router.put('/password', studentController.changePassword);

// 系统通知相关路由
router.get('/notifications', studentController.getNotifications);
router.put('/notifications/:id/read', studentController.markNotificationRead);
router.put('/notifications/read-all', studentController.markAllNotificationsRead);

module.exports = router;
