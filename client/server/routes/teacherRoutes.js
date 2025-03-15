const express = require('express')
const router = express.Router()
const teacherController = require('../controllers/teacherController')
const { auth } = require('../middleware/auth')

// 课程相关路由
router.get('/courses', auth, teacherController.getCourses)
router.put('/courses/:id', auth, teacherController.updateCourse)

// 评价相关路由
router.get('/evaluations', auth, teacherController.getEvaluations)
router.get('/evaluations/details', auth, teacherController.getEvaluationDetails)
router.get('/evaluations/keywords', auth, teacherController.getEvaluationKeywords)
router.get('/evaluations/averages', auth, teacherController.getEvaluationAverages)
router.get('/evaluations/report', auth, teacherController.exportEvaluationReport)

// 个人信息相关路由
router.get('/profile', auth, teacherController.getProfile)
router.put('/profile', auth, teacherController.updateProfile)
router.put('/password', auth, teacherController.updatePassword)

// 通知相关路由
router.get('/notifications', auth, teacherController.getNotifications)
router.put('/notifications/:id/read', auth, teacherController.markNotificationRead)

module.exports = router
