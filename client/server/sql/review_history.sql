CREATE TABLE IF NOT EXISTS review_history (
  id INT PRIMARY KEY AUTO_INCREMENT,
  review_id INT NOT NULL,
  operator_id INT NOT NULL,
  action ENUM('approve', 'reject', 'delete') NOT NULL,
  reason TEXT,
  create_time DATETIME NOT NULL,
  FOREIGN KEY (review_id) REFERENCES evaluations(id) ON DELETE CASCADE,
  FOREIGN KEY (operator_id) REFERENCES administrators(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
