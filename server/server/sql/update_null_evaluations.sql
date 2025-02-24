-- 更新评价表中的空值数据
UPDATE evaluations
SET
  -- 内容维度
  content_richness = COALESCE(content_richness, 7.5),
  content_update = COALESCE(content_update, 7.8),
  content_organization = COALESCE(content_organization, 8.0),

  -- 教学方法维度
  teaching_method_diversity = COALESCE(teaching_method_diversity, 7.5),
  teaching_interaction = COALESCE(teaching_interaction, 7.8),
  teaching_resource = COALESCE(teaching_resource, 8.0),

  -- 教师维度
  teacher_attitude = COALESCE(teacher_attitude, 8.0),
  teacher_ability = COALESCE(teacher_ability, 8.2),
  teacher_personality = COALESCE(teacher_personality, 8.5),

  -- 课程维度
  course_objective = COALESCE(course_objective, 7.5),
  course_difficulty = COALESCE(course_difficulty, 7.8),
  course_pace = COALESCE(course_pace, 8.0),

  -- 学习效果维度
  knowledge_grasp = COALESCE(knowledge_grasp, 7.5),
  ability_improvement = COALESCE(ability_improvement, 7.8),
  interest_stimulation = COALESCE(interest_stimulation, 8.0),

  -- 其他字段
  comment = COALESCE(comment, '课程总体表现良好'),
  status = COALESCE(status, 'pending'),
  create_time = COALESCE(create_time, NOW())
WHERE
  status = 'approved'
  AND (
    content_richness IS NULL
    OR content_update IS NULL
    OR content_organization IS NULL
    OR teaching_method_diversity IS NULL
    OR teaching_interaction IS NULL
    OR teaching_resource IS NULL
    OR teacher_attitude IS NULL
    OR teacher_ability IS NULL
    OR teacher_personality IS NULL
    OR course_objective IS NULL
    OR course_difficulty IS NULL
    OR course_pace IS NULL
    OR knowledge_grasp IS NULL
    OR ability_improvement IS NULL
    OR interest_stimulation IS NULL
  );
