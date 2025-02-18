-- 假设 evaluations 表中已有评价数据，ID 从 1 开始
-- 假设管理员用户的 ID 为 1

-- 评价1的审核历史：先拒绝后通过
INSERT INTO review_history (review_id, operator_id, action, reason, create_time) VALUES
(1, 1, 'reject', '评价内容过于简单，请详细描述您的学习体验', '2024-01-01 10:00:00'),
(1, 1, 'approve', NULL, '2024-01-02 14:30:00');

-- 评价2的审核历史：直接通过
INSERT INTO review_history (review_id, operator_id, action, reason, create_time) VALUES
(2, 1, 'approve', NULL, '2024-01-01 11:15:00');

-- 评价3的审核历史：拒绝
INSERT INTO review_history (review_id, operator_id, action, reason, create_time) VALUES
(3, 1, 'reject', '评价内容包含不当词汇，请修改后重新提交', '2024-01-01 13:45:00');

-- 评价4的审核历史：通过后删除
INSERT INTO review_history (review_id, operator_id, action, reason, create_time) VALUES
(4, 1, 'approve', NULL, '2024-01-01 15:20:00'),
(4, 1, 'delete', '应教师要求删除不当评价', '2024-01-03 09:10:00');

-- 评价5的审核历史：多次修改
INSERT INTO review_history (review_id, operator_id, action, reason, create_time) VALUES
(5, 1, 'reject', '请提供具体的课程建议', '2024-01-01 16:00:00'),
(5, 1, 'reject', '评价内容仍然不够具体', '2024-01-02 10:30:00'),
(5, 1, 'approve', NULL, '2024-01-03 14:20:00');

-- 评价6的审核历史：直接删除
INSERT INTO review_history (review_id, operator_id, action, reason, create_time) VALUES
(6, 1, 'delete', '重复提交的评价', '2024-01-02 11:40:00');

-- 评价7的审核历史：批量审核通过
INSERT INTO review_history (review_id, operator_id, action, create_time) VALUES
(7, 1, 'approve', '2024-01-02 16:00:00'),
(8, 1, 'approve', '2024-01-02 16:00:00'),
(9, 1, 'approve', '2024-01-02 16:00:00');

-- 评价10的审核历史：批量拒绝
INSERT INTO review_history (review_id, operator_id, action, reason, create_time) VALUES
(10, 1, 'reject', '评价内容不符合规范，请参考评价指南', '2024-01-03 10:00:00'),
(11, 1, 'reject', '评价内容不符合规范，请参考评价指南', '2024-01-03 10:00:00'),
(12, 1, 'reject', '评价内容不符合规范，请参考评价指南', '2024-01-03 10:00:00');
