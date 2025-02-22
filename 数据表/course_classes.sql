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

 Date: 21/02/2025 16:15:19
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for course_classes
-- ----------------------------
DROP TABLE IF EXISTS `course_classes`;
CREATE TABLE `course_classes`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `course_id` int NOT NULL,
  `class_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `unique_course_class`(`course_id` ASC, `class_name` ASC) USING BTREE,
  CONSTRAINT `course_classes_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 5 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Triggers structure for table course_classes
-- ----------------------------
DROP TRIGGER IF EXISTS `after_course_class_insert`;
delimiter ;;
CREATE TRIGGER `after_course_class_insert` AFTER INSERT ON `course_classes` FOR EACH ROW BEGIN
  INSERT IGNORE INTO student_courses (student_id, course_id)
  SELECT s.id, NEW.course_id
  FROM students s
  WHERE s.class = NEW.class_name;
END
;;
delimiter ;

-- ----------------------------
-- Triggers structure for table course_classes
-- ----------------------------
DROP TRIGGER IF EXISTS `after_course_class_delete`;
delimiter ;;
CREATE TRIGGER `after_course_class_delete` AFTER DELETE ON `course_classes` FOR EACH ROW BEGIN
  DELETE sc FROM student_courses sc
  INNER JOIN students s ON sc.student_id = s.id
  WHERE sc.course_id = OLD.course_id
  AND s.class = OLD.class_name;
END
;;
delimiter ;

SET FOREIGN_KEY_CHECKS = 1;
