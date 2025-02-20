-- 添加电话字段到教师表
ALTER TABLE teachers
ADD COLUMN phone VARCHAR(20) DEFAULT NULL AFTER email;

-- 添加active字段到教师表
ALTER TABLE teachers
ADD COLUMN active TINYINT(1) NOT NULL DEFAULT 1 COMMENT '1: 启用, 0: 禁用' AFTER phone;
