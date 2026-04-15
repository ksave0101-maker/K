CREATE TABLE `user_sessions` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `token` varchar(255) NOT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `expires_at` timestamp NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `v_login_log_with_user` (
  `create_by` varchar(255) DEFAULT NULL,
  `email` varchar(150) DEFAULT NULL,
  `login_timestamp` timestamp NULL DEFAULT NULL,
  `page_log` varchar(255) DEFAULT NULL,
  `site` varchar(100) DEFAULT NULL,
  `user_name` varchar(100) DEFAULT NULL,
  `userID` int(11) DEFAULT NULL,
  `username` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `vacation_leave_requests` (
  `vlrID` int(11) NOT NULL AUTO_INCREMENT,
  `vlrNo` varchar(64) NOT NULL,
  `requestDate` date DEFAULT NULL,
  `employeeName` varchar(150) NOT NULL,
  `employeeId` varchar(100) NOT NULL,
  `department` varchar(150) NOT NULL,
  `leaveType` enum('annual_leave','personal_leave','sick_leave','other') DEFAULT 'annual_leave',
  `startDate` date NOT NULL,
  `endDate` date NOT NULL,
  `totalDays` int(11) DEFAULT 0,
  `reason` text DEFAULT NULL,
  `contactPhone` varchar(50) DEFAULT NULL,
  `backupPerson` varchar(150) DEFAULT NULL,
  `approver` varchar(150) DEFAULT NULL,
  `status` enum('pending','approved','rejected','cancelled') DEFAULT 'pending',
  `approved_by` varchar(150) DEFAULT NULL,
  `approved_at` timestamp NULL DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_by` varchar(150) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `branch` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`vlrID`),
  UNIQUE KEY `vlrNo` (`vlrNo`),
  KEY `idx_employee_id` (`employeeId`),
  KEY `idx_department` (`department`),
  KEY `idx_status` (`status`),
  KEY `idx_start_end` (`startDate`,`endDate`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

