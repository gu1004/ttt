/*
 Navicat Premium Dump SQL

 Source Server         : gu
 Source Server Type    : MySQL
 Source Server Version : 90100 (9.1.0)
 Source Host           : localhost:3306
 Source Schema         : course_evaluation

 Target Server Type    : MySQL
 Target Server Version : 90100 (9.1.0)
 File Encoding         : 65001

 Date: 21/02/2025 16:15:39
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for evaluations
-- ----------------------------
DROP TABLE IF EXISTS `evaluations`;
CREATE TABLE `evaluations`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `student_id` int NOT NULL,
  `course_id` int NOT NULL,
  `comment` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `create_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `status` enum('pending','approved','rejected') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending' COMMENT '?????????????????????????',
  `content_richness` decimal(4, 1) NULL DEFAULT NULL COMMENT '内容丰富性(10分)',
  `content_update` decimal(4, 1) NULL DEFAULT NULL COMMENT '内容更新性(5分)',
  `content_organization` decimal(4, 1) NULL DEFAULT NULL COMMENT '内容组织(5分)',
  `teaching_method_diversity` decimal(4, 1) NULL DEFAULT NULL COMMENT '教学方法多样性(10分)',
  `teaching_interaction` decimal(4, 1) NULL DEFAULT NULL COMMENT '互动性(5分)',
  `teaching_resource` decimal(4, 1) NULL DEFAULT NULL COMMENT '教学资源利用(5分)',
  `teacher_attitude` decimal(4, 1) NULL DEFAULT NULL COMMENT '教学态度(10分)',
  `teacher_ability` decimal(4, 1) NULL DEFAULT NULL COMMENT '教学能力(5分)',
  `teacher_personality` decimal(4, 1) NULL DEFAULT NULL COMMENT '亲和力(5分)',
  `course_objective` decimal(4, 1) NULL DEFAULT NULL COMMENT '课程目标明确性(10分)',
  `course_difficulty` decimal(4, 1) NULL DEFAULT NULL COMMENT '课程难度(5分)',
  `course_pace` decimal(4, 1) NULL DEFAULT NULL COMMENT '课程进度(5分)',
  `knowledge_grasp` decimal(4, 1) NULL DEFAULT NULL COMMENT '知识掌握(10分)',
  `ability_improvement` decimal(4, 1) NULL DEFAULT NULL COMMENT '能力提升(5分)',
  `interest_stimulation` decimal(4, 1) NULL DEFAULT NULL COMMENT '兴趣激发(5分)',
  `total_score` decimal(5, 1) GENERATED ALWAYS AS (round(((((((((((((((`content_richness` + `content_update`) + `content_organization`) + `teaching_method_diversity`) + `teaching_interaction`) + `teaching_resource`) + `teacher_attitude`) + `teacher_ability`) + `teacher_personality`) + `course_objective`) + `course_difficulty`) + `course_pace`) + `knowledge_grasp`) + `ability_improvement`) + `interest_stimulation`),1)) STORED COMMENT '总分(100分)' NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `student_id`(`student_id` ASC) USING BTREE,
  INDEX `course_id`(`course_id` ASC) USING BTREE,
  INDEX `idx_content_score`(`content_richness` ASC, `content_update` ASC, `content_organization` ASC) USING BTREE,
  INDEX `idx_method_score`(`teaching_method_diversity` ASC, `teaching_interaction` ASC, `teaching_resource` ASC) USING BTREE,
  INDEX `idx_teacher_score`(`teacher_attitude` ASC, `teacher_ability` ASC, `teacher_personality` ASC) USING BTREE,
  INDEX `idx_course_score`(`course_objective` ASC, `course_difficulty` ASC, `course_pace` ASC) USING BTREE,
  INDEX `idx_effect_score`(`knowledge_grasp` ASC, `ability_improvement` ASC, `interest_stimulation` ASC) USING BTREE,
  CONSTRAINT `evaluations_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `evaluations_ibfk_2` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 130 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = DYNAMIC;

SET FOREIGN_KEY_CHECKS = 1;
