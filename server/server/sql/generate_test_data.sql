-- 设置安全更新模式为关闭，以便批量插入数据
SET SQL_SAFE_UPDATES = 0;
SET FOREIGN_KEY_CHECKS = 0;

-- 清空相关表的数据
TRUNCATE TABLE evaluations;
TRUNCATE TABLE student_courses;
TRUNCATE TABLE course_classes;
TRUNCATE TABLE courses;
TRUNCATE TABLE teachers;
TRUNCATE TABLE students;

-- 插入10个教师数据
INSERT INTO teachers (username, password, name, email, phone, department) VALUES
('teacher01', '123456', '张教授', 'zhang@example.com', '13800000001', '计算机科学系'),
('teacher02', '123456', '李教授', 'li@example.com', '13800000002', '软件工程系'),
('teacher03', '123456', '王教授', 'wang@example.com', '13800000003', '信息工程系'),
('teacher04', '123456', '刘教授', 'liu@example.com', '13800000004', '计算机科学系'),
('teacher05', '123456', '陈教授', 'chen@example.com', '13800000005', '软件工程系'),
('teacher06', '123456', '杨教授', 'yang@example.com', '13800000006', '信息工程系'),
('teacher07', '123456', '赵教授', 'zhao@example.com', '13800000007', '计算机科学系'),
('teacher08', '123456', '黄教授', 'huang@example.com', '13800000008', '软件工程系'),
('teacher09', '123456', '周教授', 'zhou@example.com', '13800000009', '信息工程系'),
('teacher10', '123456', '吴教授', 'wu@example.com', '13800000010', '计算机科学系');

SELECT 'Teachers inserted successfully' as message;
SELECT COUNT(*) as teacher_count FROM teachers;

-- 为每个教师创建4个课程
INSERT INTO courses (name, teacher_id, description, start_date, end_date, start_time, end_time)
SELECT
    CONCAT(
        ELT(FLOOR(1 + RAND() * 4), '程序设计', '软件工程', '数据结构', '计算机网络'),
        FLOOR(1 + RAND() * 4),
        '(',
        t.name,
        ')'
    ) as name,
    t.id as teacher_id,
    '这是一门重要的专业课程' as description,
    DATE_ADD('2024-02-20', INTERVAL FLOOR(RAND() * 30) DAY) as start_date,
    DATE_ADD('2024-06-20', INTERVAL FLOOR(RAND() * 30) DAY) as end_date,
    DATE_ADD('2024-02-20', INTERVAL FLOOR(RAND() * 30) DAY) as start_time,
    DATE_ADD('2024-06-20', INTERVAL FLOOR(RAND() * 30) DAY) as end_time
FROM teachers t
CROSS JOIN (SELECT 1 as n UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4) numbers;

SELECT 'Courses inserted successfully' as message;
SELECT COUNT(*) as course_count FROM courses;

-- 创建200个学生数据
INSERT INTO students (username, password, name, student_id, class, department, email, phone)
SELECT
    CONCAT('student', LPAD(numbers.n, 3, '0')) as username,
    '123456' as password,
    CONCAT(
        ELT(FLOOR(1 + RAND() * 10), '张', '李', '王', '刘', '陈', '杨', '赵', '黄', '周', '吴'),
        ELT(FLOOR(1 + RAND() * 10), '小', '大', '明', '华', '强', '伟', '文', '勇', '静', '丽'),
        ELT(FLOOR(1 + RAND() * 10), '明', '华', '平', '军', '国', '英', '文', '武', '志', '玉')
    ) as name,
    CONCAT('2024', LPAD(numbers.n, 4, '0')) as student_id,
    CONCAT('计算机', ELT(FLOOR(1 + RAND() * 4), '2401', '2402', '2403', '2404'), '班') as class,
    ELT(FLOOR(1 + RAND() * 3), '计算机科学系', '软件工程系', '信息工程系') as department,
    CONCAT('student', LPAD(numbers.n, 3, '0'), '@example.com') as email,
    CONCAT('139', LPAD(numbers.n, 8, '0')) as phone
FROM (
    SELECT ROW_NUMBER() OVER () as n
    FROM (SELECT 1 UNION ALL SELECT 1 UNION ALL SELECT 1 UNION ALL SELECT 1 UNION ALL SELECT 1 UNION ALL SELECT 1 UNION ALL SELECT 1 UNION ALL SELECT 1 UNION ALL SELECT 1 UNION ALL SELECT 1) t1
    CROSS JOIN (SELECT 1 UNION ALL SELECT 1 UNION ALL SELECT 1 UNION ALL SELECT 1 UNION ALL SELECT 1 UNION ALL SELECT 1 UNION ALL SELECT 1 UNION ALL SELECT 1 UNION ALL SELECT 1 UNION ALL SELECT 1) t2
    LIMIT 200
) numbers;

SELECT 'Students inserted successfully' as message;
SELECT COUNT(*) as student_count FROM students;

-- 创建课程-班级关联
INSERT INTO course_classes (course_id, class_name)
SELECT
    c.id,
    CONCAT('计算机', FLOOR(1 + RAND() * 4), '0', FLOOR(1 + RAND() * 4), '班')
FROM courses c;

SELECT 'Course classes inserted successfully' as message;
SELECT COUNT(*) as course_class_count FROM course_classes;

-- 创建学生-课程关联
INSERT INTO student_courses (student_id, course_id)
SELECT DISTINCT
    s.id as student_id,
    c.id as course_id
FROM students s
CROSS JOIN courses c
WHERE RAND() < 0.1
LIMIT 800;

SELECT 'Student courses inserted successfully' as message;
SELECT COUNT(*) as student_course_count FROM student_courses;

-- 创建评价数据
INSERT INTO evaluations (
    student_id, course_id,
    content_richness, content_update, content_organization,
    teaching_method_diversity, teaching_interaction, teaching_resource,
    teacher_attitude, teacher_ability, teacher_personality,
    course_objective, course_difficulty, course_pace,
    knowledge_grasp, ability_improvement, interest_stimulation,
    comment, create_time, status
)
SELECT
    sc.student_id,
    sc.course_id,
    5 + RAND() * 5 as content_richness,
    5 + RAND() * 5 as content_update,
    5 + RAND() * 5 as content_organization,
    5 + RAND() * 5 as teaching_method_diversity,
    5 + RAND() * 5 as teaching_interaction,
    5 + RAND() * 5 as teaching_resource,
    5 + RAND() * 5 as teacher_attitude,
    5 + RAND() * 5 as teacher_ability,
    5 + RAND() * 5 as teacher_personality,
    5 + RAND() * 5 as course_objective,
    5 + RAND() * 5 as course_difficulty,
    5 + RAND() * 5 as course_pace,
    5 + RAND() * 5 as knowledge_grasp,
    5 + RAND() * 5 as ability_improvement,
    5 + RAND() * 5 as interest_stimulation,
    ELT(
        FLOOR(1 + RAND() * 5),
        '老师讲课认真负责，课程内容充实',
        '课程设计合理，收获很大',
        '教学方法新颖，很容易理解',
        '老师很有耐心，课堂氛围活跃',
        '整体来说是一门很好的课程'
    ) as comment,
    DATE_SUB(NOW(), INTERVAL FLOOR(RAND() * 30) DAY) as create_time,
    'approved' as status
FROM student_courses sc
WHERE RAND() < 0.8;

SELECT 'Evaluations inserted successfully' as message;
SELECT COUNT(*) as evaluation_count FROM evaluations;

-- 恢复安全设置
SET SQL_SAFE_UPDATES = 1;
SET FOREIGN_KEY_CHECKS = 1;

-- 显示最终的数据统计
SELECT
    (SELECT COUNT(*) FROM teachers) as teacher_count,
    (SELECT COUNT(*) FROM courses) as course_count,
    (SELECT COUNT(*) FROM students) as student_count,
    (SELECT COUNT(*) FROM course_classes) as course_class_count,
    (SELECT COUNT(*) FROM student_courses) as student_course_count,
    (SELECT COUNT(*) FROM evaluations) as evaluation_count;
