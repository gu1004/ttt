SELECT
    c.id,
    c.name AS courseName,
    t.name AS teacherName,
    c.start_time AS startTime,
    c.end_time AS endTime
FROM courses c
LEFT JOIN teachers t ON c.teacher_id = t.id
ORDER BY c.id;
