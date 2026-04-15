-- Notifications System Database Schema
-- Created: 2026-03-27

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  type ENUM('alert', 'warning', 'info', 'success') NOT NULL DEFAULT 'info',
  category VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  device_id INT NULL,
  site VARCHAR(50) NULL,
  metadata JSON NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  read_at TIMESTAMP NULL,
  INDEX idx_site (site),
  INDEX idx_read (is_read),
  INDEX idx_created (created_at),
  INDEX idx_device (device_id),
  FOREIGN KEY (device_id) REFERENCES devices(deviceID) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create notification_rules table for automatic notification generation
CREATE TABLE IF NOT EXISTS notification_rules (
  id INT AUTO_INCREMENT PRIMARY KEY,
  rule_name VARCHAR(100) NOT NULL,
  rule_type ENUM('device_offline', 'high_consumption', 'low_power_factor', 'high_thd', 'maintenance', 'report') NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  threshold_value DECIMAL(10,2) NULL,
  check_interval_minutes INT DEFAULT 5,
  site VARCHAR(50) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default notification rules
INSERT INTO notification_rules (rule_name, rule_type, threshold_value, check_interval_minutes, site) VALUES
('Device Offline Alert', 'device_offline', 20, 5, NULL),
('High Consumption Alert - Thailand', 'high_consumption', 100, 15, 'thailand'),
('High Consumption Alert - Korea', 'high_consumption', 100, 15, 'korea'),
('Low Power Factor Warning', 'low_power_factor', 0.85, 30, NULL),
('High THD Warning', 'high_thd', 5.0, 60, NULL);

-- Create device_status_log for tracking status changes
CREATE TABLE IF NOT EXISTS device_status_log (
  id INT AUTO_INCREMENT PRIMARY KEY,
  device_id INT NOT NULL,
  previous_status ENUM('online', 'offline') NOT NULL,
  new_status ENUM('online', 'offline') NOT NULL,
  changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  notification_sent BOOLEAN DEFAULT FALSE,
  INDEX idx_device (device_id),
  INDEX idx_changed (changed_at),
  FOREIGN KEY (device_id) REFERENCES devices(deviceID) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
