-- 添加电话字段到教师表
ALTER TABLE teachers
ADD COLUMN phone VARCHAR(20) DEFAULT NULL AFTER email;
