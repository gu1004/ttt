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

 Date: 21/02/2025 16:15:57
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for review_history
-- ----------------------------
DROP TABLE IF EXISTS `review_history`;
CREATE TABLE `review_history`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `review_id` int NOT NULL,
  `operator_id` int NOT NULL,
  `action` enum('approve','reject','delete') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `reason` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL,
  `create_time` datetime NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `review_id`(`review_id` ASC) USING BTREE,
  INDEX `operator_id`(`operator_id` ASC) USING BTREE,
  CONSTRAINT `review_history_ibfk_1` FOREIGN KEY (`review_id`) REFERENCES `evaluations` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `review_history_ibfk_2` FOREIGN KEY (`operator_id`) REFERENCES `administrators` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 19 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = DYNAMIC;

SET FOREIGN_KEY_CHECKS = 1;
