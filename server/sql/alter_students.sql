-- 添加电话字段到学生表
ALTER TABLE students
ADD COLUMN phone VARCHAR(20) DEFAULT NULL AFTER email;

-- 添加active字段到学生表
ALTER TABLE students
ADD COLUMN active TINYINT(1) NOT NULL DEFAULT 1 COMMENT '1: 启用, 0: 禁用' AFTER phone;
