-- 修改评价表，添加状态字段
ALTER TABLE `evaluations`
ADD COLUMN IF NOT EXISTS `status` enum('pending', 'approved', 'rejected', 'deleted') NOT NULL DEFAULT 'pending' AFTER `created_at`;

-- 更新所有评价的状态为待审核
UPDATE evaluations SET status = 'pending' WHERE status NOT IN ('approved', 'rejected', 'deleted');

-- 创建评价历史记录表
CREATE TABLE IF NOT EXISTS `review_history` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `evaluation_id` int(11) NOT NULL,
  `operator_id` int(11) NOT NULL,
  `action` enum('approve', 'delete') NOT NULL,
  `reason` text,
  `operate_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `evaluation_id` (`evaluation_id`),
  KEY `operator_id` (`operator_id`),
  CONSTRAINT `review_history_ibfk_1` FOREIGN KEY (`evaluation_id`) REFERENCES `evaluations` (`id`),
  CONSTRAINT `review_history_ibfk_2` FOREIGN KEY (`operator_id`) REFERENCES `administrators` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 修改评价表结构
ALTER TABLE `evaluations`
DROP COLUMN `teaching_attitude`,
DROP COLUMN `teaching_content`,
DROP COLUMN `teaching_method`,
DROP COLUMN `teaching_effect`;

-- 添加新的评价维度
ALTER TABLE `evaluations`
ADD COLUMN `content_richness` DECIMAL(4,1) DEFAULT NULL COMMENT '内容丰富性(10分)',
ADD COLUMN `content_update` DECIMAL(4,1) DEFAULT NULL COMMENT '内容更新性(5分)',
ADD COLUMN `content_organization` DECIMAL(4,1) DEFAULT NULL COMMENT '内容组织(5分)',
ADD COLUMN `teaching_method_diversity` DECIMAL(4,1) DEFAULT NULL COMMENT '教学方法多样性(10分)',
ADD COLUMN `teaching_interaction` DECIMAL(4,1) DEFAULT NULL COMMENT '互动性(5分)',
ADD COLUMN `teaching_resource` DECIMAL(4,1) DEFAULT NULL COMMENT '教学资源利用(5分)',
ADD COLUMN `teacher_attitude` DECIMAL(4,1) DEFAULT NULL COMMENT '教学态度(10分)',
ADD COLUMN `teacher_ability` DECIMAL(4,1) DEFAULT NULL COMMENT '教学能力(5分)',
ADD COLUMN `teacher_personality` DECIMAL(4,1) DEFAULT NULL COMMENT '亲和力(5分)',
ADD COLUMN `course_objective` DECIMAL(4,1) DEFAULT NULL COMMENT '课程目标明确性(10分)',
ADD COLUMN `course_difficulty` DECIMAL(4,1) DEFAULT NULL COMMENT '课程难度(5分)',
ADD COLUMN `course_pace` DECIMAL(4,1) DEFAULT NULL COMMENT '课程进度(5分)',
ADD COLUMN `knowledge_grasp` DECIMAL(4,1) DEFAULT NULL COMMENT '知识掌握(10分)',
ADD COLUMN `ability_improvement` DECIMAL(4,1) DEFAULT NULL COMMENT '能力提升(5分)',
ADD COLUMN `interest_stimulation` DECIMAL(4,1) DEFAULT NULL COMMENT '兴趣激发(5分)',
ADD COLUMN `total_score` DECIMAL(5,1) GENERATED ALWAYS AS (
  ROUND(
    content_richness + content_update + content_organization +
    teaching_method_diversity + teaching_interaction + teaching_resource +
    teacher_attitude + teacher_ability + teacher_personality +
    course_objective + course_difficulty + course_pace +
    knowledge_grasp + ability_improvement + interest_stimulation,
    1
  )
) STORED COMMENT '总分(100分)';

-- 添加评价维度的索引
ALTER TABLE `evaluations`
ADD INDEX `idx_total_score` (`total_score`),
ADD INDEX `idx_content_score` (`content_richness`, `content_update`, `content_organization`),
ADD INDEX `idx_method_score` (`teaching_method_diversity`, `teaching_interaction`, `teaching_resource`),
ADD INDEX `idx_teacher_score` (`teacher_attitude`, `teacher_ability`, `teacher_personality`),
ADD INDEX `idx_course_score` (`course_objective`, `course_difficulty`, `course_pace`),
ADD INDEX `idx_effect_score` (`knowledge_grasp`, `ability_improvement`, `interest_stimulation`);
