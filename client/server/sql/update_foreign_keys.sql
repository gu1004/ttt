-- 先删除原有的外键约束
ALTER TABLE student_courses
DROP FOREIGN KEY student_courses_ibfk_2;

-- 重新添加级联删除的外键约束
ALTER TABLE student_courses
ADD CONSTRAINT student_courses_ibfk_2
FOREIGN KEY (course_id)
REFERENCES courses(id)
ON DELETE CASCADE
ON UPDATE CASCADE;
