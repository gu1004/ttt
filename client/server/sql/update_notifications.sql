-- 备份原有数据
CREATE TABLE IF NOT EXISTS notifications_backup AS SELECT * FROM notifications;
CREATE TABLE IF NOT EXISTS notification_reads_backup AS SELECT * FROM notification_reads;

-- 删除原有表的外键约束
ALTER TABLE notification_reads DROP FOREIGN KEY notification_reads_ibfk_1;
ALTER TABLE notification_reads DROP FOREIGN KEY notification_reads_ibfk_2;

-- 删除原有表
DROP TABLE IF EXISTS notification_reads;
DROP TABLE IF EXISTS notifications;

-- 重新创建通知表
CREATE TABLE notifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  type VARCHAR(50) NOT NULL,
  target_type ENUM('all', 'students', 'teachers', 'course') NOT NULL,
  course_id INT,
  send_time DATETIME NOT NULL,
  start_time DATETIME,
  end_time DATETIME,
  create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by INT NOT NULL,
  status ENUM('draft', 'scheduled', 'sent') NOT NULL DEFAULT 'draft',
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES administrators(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 重新创建通知阅读记录表
CREATE TABLE notification_reads (
  id INT PRIMARY KEY AUTO_INCREMENT,
  notification_id INT NOT NULL,
  user_id INT NOT NULL,
  user_type ENUM('student', 'teacher', 'admin') NOT NULL,
  read_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (notification_id) REFERENCES notifications(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 恢复通知数据
INSERT INTO notifications (
  id, title, type, target_type, course_id,
  send_time, start_time, end_time, create_time, created_by, status
)
SELECT
  id, title, '课程评价' as type,
  'course' as target_type,
  course_id,
  create_time as send_time,
  start_time, end_time, create_time,
  1 as created_by,
  'sent' as status
FROM notifications_backup;

-- 恢复通知阅读记录
INSERT INTO notification_reads (notification_id, user_id, user_type, read_time)
SELECT
  notification_id,
  student_id as user_id,
  'student' as user_type,
  read_time
FROM notification_reads_backup;

-- 删除备份表
DROP TABLE IF EXISTS notifications_backup;
DROP TABLE IF EXISTS notification_reads_backup;
