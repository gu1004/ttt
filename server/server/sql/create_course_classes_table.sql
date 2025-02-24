-- 创建课程-班级关联表
CREATE TABLE IF NOT EXISTS course_classes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  course_id INT NOT NULL,
  class_name VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  UNIQUE KEY unique_course_class (course_id, class_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 创建学生-课程关联表（如果不存在）
CREATE TABLE IF NOT EXISTS student_courses (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  course_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  UNIQUE KEY unique_student_course (student_id, course_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 创建触发器：当课程-班级关联被创建时，自动为该班级的所有学生创建课程关联
DELIMITER //
CREATE TRIGGER after_course_class_insert
AFTER INSERT ON course_classes
FOR EACH ROW
BEGIN
  INSERT IGNORE INTO student_courses (student_id, course_id)
  SELECT s.id, NEW.course_id
  FROM students s
  WHERE s.class = NEW.class_name;
END //
DELIMITER ;

-- 创建触发器：当课程-班级关联被删除时，自动删除该班级学生的课程关联
DELIMITER //
CREATE TRIGGER after_course_class_delete
AFTER DELETE ON course_classes
FOR EACH ROW
BEGIN
  DELETE sc FROM student_courses sc
  INNER JOIN students s ON sc.student_id = s.id
  WHERE sc.course_id = OLD.course_id
  AND s.class = OLD.class_name;
END //
DELIMITER ;
