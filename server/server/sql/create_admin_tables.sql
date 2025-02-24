-- 创建管理员表
CREATE TABLE IF NOT EXISTS `admins` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `name` varchar(50) NOT NULL,
  `email` varchar(100),
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 插入默认管理员账号
INSERT INTO `admins` (`username`, `password`, `name`, `email`)
VALUES ('admin', '123456', '系统管理员', 'admin@example.com');

-- 修改评价表，添加缺失的字段
ALTER TABLE `evaluations`
ADD COLUMN IF NOT EXISTS `submit_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER `comment`,
ADD COLUMN IF NOT EXISTS `status` enum('pending', 'approved', 'deleted') NOT NULL DEFAULT 'pending' AFTER `submit_time`;

-- 创建评价历史记录表
CREATE TABLE IF NOT EXISTS `review_history` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `evaluation_id` int(11) NOT NULL,
  `operator_id` int(11) NOT NULL,
  `action` enum('approve', 'delete') NOT NULL,
  `reason` text,
  `operate_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `evaluation_id` (`evaluation_id`),
  KEY `operator_id` (`operator_id`),
  CONSTRAINT `review_history_ibfk_1` FOREIGN KEY (`evaluation_id`) REFERENCES `evaluations` (`id`),
  CONSTRAINT `review_history_ibfk_2` FOREIGN KEY (`operator_id`) REFERENCES `admins` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
