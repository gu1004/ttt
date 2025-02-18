-- Disable foreign key checks
SET FOREIGN_KEY_CHECKS = 0;

-- Clear ALL existing data
TRUNCATE TABLE review_history;
TRUNCATE TABLE evaluations;
TRUNCATE TABLE student_courses;
TRUNCATE TABLE students;
TRUNCATE TABLE courses;
TRUNCATE TABLE teachers;

-- Insert test teacher data
INSERT INTO teachers (id, username, password, name, email, teacher_id, title, department, active) VALUES
(1, 't20230101', '123456', '张三', 'zhang@example.com', 'T20230101', '教授', '计算机系', 1),
(2, 't20230102', '123456', '李四', 'li@example.com', 'T20230102', '教授', '数学系', 1),
(3, 't20230103', '123456', '王五', 'wang@example.com', 'T20230103', '教授', '物理系', 1),
(4, 't20230104', '123456', '刘六', 'liu@example.com', 'T20230104', '教授', '化学系', 1),
(5, 't20230105', '123456', '陈七', 'chen@example.com', 'T20230105', '教授', '生物系', 1),
(6, 't20230106', '123456', '杨八', 'yang@example.com', 'T20230106', '教授', '外语系', 1),
(7, 't20230107', '123456', '赵九', 'zhao@example.com', 'T20230107', '教授', '经济系', 1),
(8, 't20230108', '123456', '孙十', 'sun@example.com', 'T20230108', '教授', '管理系', 1),
(9, 't20230109', '123456', '周一', 'zhou@example.com', 'T20230109', '教授', '艺术系', 1),
(10, 't20230110', '123456', '吴二', 'wu@example.com', 'T20230110', '教授', '医学系', 1);

-- Insert test course data (6 courses)
INSERT INTO courses (id, name, teacher_id, description, start_date, end_date) VALUES
(1, '计算机基础1', 1, '计算机基础课程1', '2024-03-01', '2024-07-01'),
(2, '计算机基础2', 1, '计算机基础课程2', '2024-03-01', '2024-07-01'),
(3, '计算机基础3', 1, '计算机基础课程3', '2024-03-01', '2024-07-01'),
(4, '计算机基础4', 1, '计算机基础课程4', '2024-03-01', '2024-07-01'),
(5, '高等数学1', 2, '高等数学课程1', '2024-03-01', '2024-07-01'),
(6, '高等数学2', 2, '高等数学课程2', '2024-03-01', '2024-07-01'),
(7, '高等数学3', 2, '高等数学课程3', '2024-03-01', '2024-07-01'),
(8, '高等数学4', 2, '高等数学课程4', '2024-03-01', '2024-07-01'),
(9, '物理学1', 3, '物理学课程1', '2024-03-01', '2024-07-01'),
(10, '物理学2', 3, '物理学课程2', '2024-03-01', '2024-07-01'),
(11, '物理学3', 3, '物理学课程3', '2024-03-01', '2024-07-01'),
(12, '物理学4', 3, '物理学课程4', '2024-03-01', '2024-07-01'),
(13, '化学1', 4, '化学课程1', '2024-03-01', '2024-07-01'),
(14, '化学2', 4, '化学课程2', '2024-03-01', '2024-07-01'),
(15, '化学3', 4, '化学课程3', '2024-03-01', '2024-07-01'),
(16, '化学4', 4, '化学课程4', '2024-03-01', '2024-07-01'),
(17, '生物学1', 5, '生物学课程1', '2024-03-01', '2024-07-01'),
(18, '生物学2', 5, '生物学课程2', '2024-03-01', '2024-07-01'),
(19, '生物学3', 5, '生物学课程3', '2024-03-01', '2024-07-01'),
(20, '生物学4', 5, '生物学课程4', '2024-03-01', '2024-07-01'),
(21, '英语1', 6, '英语课程1', '2024-03-01', '2024-07-01'),
(22, '英语2', 6, '英语课程2', '2024-03-01', '2024-07-01'),
(23, '英语3', 6, '英语课程3', '2024-03-01', '2024-07-01'),
(24, '英语4', 6, '英语课程4', '2024-03-01', '2024-07-01'),
(25, '经济学1', 7, '经济学课程1', '2024-03-01', '2024-07-01'),
(26, '经济学2', 7, '经济学课程2', '2024-03-01', '2024-07-01'),
(27, '经济学3', 7, '经济学课程3', '2024-03-01', '2024-07-01'),
(28, '经济学4', 7, '经济学课程4', '2024-03-01', '2024-07-01'),
(29, '管理学1', 8, '管理学课程1', '2024-03-01', '2024-07-01'),
(30, '管理学2', 8, '管理学课程2', '2024-03-01', '2024-07-01'),
(31, '管理学3', 8, '管理学课程3', '2024-03-01', '2024-07-01'),
(32, '管理学4', 8, '管理学课程4', '2024-03-01', '2024-07-01'),
(33, '艺术1', 9, '艺术课程1', '2024-03-01', '2024-07-01'),
(34, '艺术2', 9, '艺术课程2', '2024-03-01', '2024-07-01'),
(35, '艺术3', 9, '艺术课程3', '2024-03-01', '2024-07-01'),
(36, '艺术4', 9, '艺术课程4', '2024-03-01', '2024-07-01'),
(37, '医学1', 10, '医学课程1', '2024-03-01', '2024-07-01'),
(38, '医学2', 10, '医学课程2', '2024-03-01', '2024-07-01'),
(39, '医学3', 10, '医学课程3', '2024-03-01', '2024-07-01'),
(40, '医学4', 10, '医学课程4', '2024-03-01', '2024-07-01');

-- Generate 400 students (100 students per class in 4 different classes)
DELIMITER //
CREATE PROCEDURE generate_students()
BEGIN
    DECLARE i INT DEFAULT 1;
    WHILE i <= 400 DO
        INSERT INTO students (username, password, name, email, department, class) VALUES
        (CONCAT('student', i),
         '123456',
         CONCAT('学生', i),
         CONCAT('student', i, '@example.com'),
         CASE
            WHEN i <= 200 THEN '计算机系'
            WHEN i <= 300 THEN '物理系'
            ELSE '数学系'
         END,
         CASE
            WHEN i <= 100 THEN '计算机2101'
            WHEN i <= 200 THEN '计算机2102'
            WHEN i <= 300 THEN '物理2101'
            ELSE '数学2101'
         END);
        SET i = i + 1;
    END WHILE;
END //
DELIMITER ;

CALL generate_students();
DROP PROCEDURE generate_students;

-- Generate student course relationships
-- Each student takes 4-6 courses
DELIMITER //
CREATE PROCEDURE generate_student_courses()
BEGIN
    DECLARE student_id INT;
    DECLARE course_count INT;
    DECLARE i INT;
    DECLARE j INT;

    SET student_id = 1;

    WHILE student_id <= 400 DO
        SET course_count = 4 + FLOOR(RAND() * 3); -- Random number between 4 and 6
        SET i = 1;

        WHILE i <= course_count DO
            SET j = FLOOR(1 + RAND() * 6); -- Random course_id between 1 and 6

            -- Insert if not exists
            INSERT IGNORE INTO student_courses (student_id, course_id)
            VALUES (student_id, j);

            SET i = i + 1;
        END WHILE;

        SET student_id = student_id + 1;
    END WHILE;
END //
DELIMITER ;

CALL generate_student_courses();
DROP PROCEDURE generate_student_courses;

-- Generate evaluations based on student_courses
DELIMITER //
CREATE PROCEDURE generate_evaluations()
BEGIN
    DECLARE i INT DEFAULT 1;
    DECLARE total_evaluations INT DEFAULT 1460;
    DECLARE student_count INT;
    DECLARE course_count INT;
    DECLARE random_student_id INT;
    DECLARE random_course_id INT;
    DECLARE score_type VARCHAR(20);
    DECLARE base_score_10 DECIMAL(4,1);  -- 10分项的基础分
    DECLARE base_score_5 DECIMAL(4,1);   -- 5分项的基础分
    DECLARE variation DECIMAL(4,1);

    -- 获取学生和课程总数
    SELECT COUNT(*) INTO student_count FROM students;
    SELECT COUNT(*) INTO course_count FROM courses;

    -- 清空评价表
    TRUNCATE TABLE evaluations;

    -- 生成评价数据
    WHILE i <= total_evaluations DO
        -- 随机选择学生和课程
        SET random_student_id = FLOOR(1 + RAND() * student_count);
        SET random_course_id = FLOOR(1 + RAND() * course_count);

        -- 根据概率分配评分类型
        SET score_type = CASE
            WHEN RAND() < 0.20 THEN 'excellent'  -- 20% 优秀
            WHEN RAND() < 0.45 THEN 'good'      -- 25% 良好
            WHEN RAND() < 0.65 THEN 'average'   -- 20% 中等
            WHEN RAND() < 0.95 THEN 'pass'      -- 30% 及格
            ELSE 'fail'                         -- 5% 不及格
        END;

        -- 根据评分类型设置基础分数（10分制）
        SET base_score_10 = CASE score_type
            WHEN 'excellent' THEN 9.0 + (RAND() * 0.8)  -- 9.0-9.8
            WHEN 'good' THEN 8.0 + (RAND() * 0.8)      -- 8.0-8.8
            WHEN 'average' THEN 7.0 + (RAND() * 0.8)   -- 7.0-7.8
            WHEN 'pass' THEN 6.0 + (RAND() * 0.8)      -- 6.0-6.8
            ELSE 5.0 + (RAND() * 0.8)                  -- 5.0-5.8
        END;

        -- 5分制的基础分（将10分制的分数除以2）
        SET base_score_5 = base_score_10 / 2;

        -- 插入评价记录
        INSERT INTO evaluations (
            student_id,
            course_id,
            -- 10分项
            content_richness,
            teaching_method_diversity,
            teacher_attitude,
            course_objective,
            knowledge_grasp,
            -- 5分项
            content_update,
            content_organization,
            teaching_interaction,
            teaching_resource,
            teacher_ability,
            teacher_personality,
            course_difficulty,
            course_pace,
            ability_improvement,
            interest_stimulation,
            comment,
            status,
            create_time
        ) VALUES (
            random_student_id,
            random_course_id,
            -- 10分项（最高10分）
            GREATEST(5.0, LEAST(10.0, base_score_10 + (RAND() * 0.2 - 0.1))),
            GREATEST(5.0, LEAST(10.0, base_score_10 + (RAND() * 0.2 - 0.1))),
            GREATEST(5.0, LEAST(10.0, base_score_10 + (RAND() * 0.2 - 0.1))),
            GREATEST(5.0, LEAST(10.0, base_score_10 + (RAND() * 0.2 - 0.1))),
            GREATEST(5.0, LEAST(10.0, base_score_10 + (RAND() * 0.2 - 0.1))),
            -- 5分项（最高5分）
            GREATEST(2.5, LEAST(5.0, base_score_5 + (RAND() * 0.1 - 0.05))),
            GREATEST(2.5, LEAST(5.0, base_score_5 + (RAND() * 0.1 - 0.05))),
            GREATEST(2.5, LEAST(5.0, base_score_5 + (RAND() * 0.1 - 0.05))),
            GREATEST(2.5, LEAST(5.0, base_score_5 + (RAND() * 0.1 - 0.05))),
            GREATEST(2.5, LEAST(5.0, base_score_5 + (RAND() * 0.1 - 0.05))),
            GREATEST(2.5, LEAST(5.0, base_score_5 + (RAND() * 0.1 - 0.05))),
            GREATEST(2.5, LEAST(5.0, base_score_5 + (RAND() * 0.1 - 0.05))),
            GREATEST(2.5, LEAST(5.0, base_score_5 + (RAND() * 0.1 - 0.05))),
            GREATEST(2.5, LEAST(5.0, base_score_5 + (RAND() * 0.1 - 0.05))),
            GREATEST(2.5, LEAST(5.0, base_score_5 + (RAND() * 0.1 - 0.05))),
            CASE score_type
                WHEN 'excellent' THEN N'课程内容非常充实，老师教学认真负责，让我收获很多。'
                WHEN 'good' THEN N'课程质量很好，教学方式生动有趣，基本达到了学习目标。'
                WHEN 'average' THEN N'课程内容还不错，教学方式尚可，但仍有改进空间。'
                WHEN 'pass' THEN N'课程基本完成教学任务，但教学效果一般，建议改进。'
                ELSE N'课程内容需要优化，教学效果不够理想，希望能够改进。'
            END,
            CASE WHEN RAND() < 0.9 THEN 'approved' ELSE 'pending' END,
            NOW()
        );

        SET i = i + 1;
    END WHILE;
END //
DELIMITER ;

CALL generate_evaluations();
DROP PROCEDURE generate_evaluations;

-- 修正评分数据，确保不超过最高分
UPDATE evaluations
SET
  -- 10分项
  content_richness = CASE WHEN content_richness > 10 THEN 10 ELSE content_richness END,
  teaching_method_diversity = CASE WHEN teaching_method_diversity > 10 THEN 10 ELSE teaching_method_diversity END,
  teacher_attitude = CASE WHEN teacher_attitude > 10 THEN 10 ELSE teacher_attitude END,
  course_objective = CASE WHEN course_objective > 10 THEN 10 ELSE course_objective END,
  knowledge_grasp = CASE WHEN knowledge_grasp > 10 THEN 10 ELSE knowledge_grasp END,

  -- 5分项
  content_update = CASE WHEN content_update > 5 THEN 5 ELSE content_update END,
  content_organization = CASE WHEN content_organization > 5 THEN 5 ELSE content_organization END,
  teaching_interaction = CASE WHEN teaching_interaction > 5 THEN 5 ELSE teaching_interaction END,
  teaching_resource = CASE WHEN teaching_resource > 5 THEN 5 ELSE teaching_resource END,
  teacher_ability = CASE WHEN teacher_ability > 5 THEN 5 ELSE teacher_ability END,
  teacher_personality = CASE WHEN teacher_personality > 5 THEN 5 ELSE teacher_personality END,
  course_difficulty = CASE WHEN course_difficulty > 5 THEN 5 ELSE course_difficulty END,
  course_pace = CASE WHEN course_pace > 5 THEN 5 ELSE course_pace END,
  ability_improvement = CASE WHEN ability_improvement > 5 THEN 5 ELSE ability_improvement END,
  interest_stimulation = CASE WHEN interest_stimulation > 5 THEN 5 ELSE interest_stimulation END
WHERE
  content_richness > 10 OR
  teaching_method_diversity > 10 OR
  teacher_attitude > 10 OR
  course_objective > 10 OR
  knowledge_grasp > 10 OR
  content_update > 5 OR
  content_organization > 5 OR
  teaching_interaction > 5 OR
  teaching_resource > 5 OR
  teacher_ability > 5 OR
  teacher_personality > 5 OR
  course_difficulty > 5 OR
  course_pace > 5 OR
  ability_improvement > 5 OR
  interest_stimulation > 5;

-- 生成评价数据后，为已通过的评价添加审核记录
INSERT INTO review_history (review_id, operator_id, action, create_time)
SELECT id, 1, 'approve', create_time
FROM evaluations
WHERE status = 'approved';

-- 确保评价状态和审核记录一致
UPDATE evaluations e
SET e.status = 'pending'
WHERE e.status = 'approved'
AND NOT EXISTS (
    SELECT 1
    FROM review_history rh
    WHERE rh.review_id = e.id
);

-- Enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;
