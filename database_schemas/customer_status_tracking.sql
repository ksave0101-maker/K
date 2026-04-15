-- Create table for customer status tracking
CREATE TABLE IF NOT EXISTS customer_status_tracking (
  updateID INT AUTO_INCREMENT PRIMARY KEY,
  cusID INT NULL,
  customerName VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  email VARCHAR(255),
  currentStatus VARCHAR(50) NOT NULL,
  previousStatus VARCHAR(50),
  statusDate DATE NOT NULL,
  notes TEXT,
  updatedBy VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_cusID (cusID),
  INDEX idx_currentStatus (currentStatus),
  INDEX idx_statusDate (statusDate),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add some sample data (optional - remove if not needed)
-- INSERT INTO customer_status_tracking
-- (cusID, customerName, phone, email, currentStatus, previousStatus, statusDate, notes, updatedBy)
-- VALUES
-- (1, 'บริษัท ABC จำกัด', '02-123-4567', 'contact@abc.com', 'quoted', 'contacted', '2026-03-20', 'ส่งใบเสนอราคาแผงโซล่าเซลล์ 50kW', 'Admin'),
-- (2, 'คุณสมชาย ใจดี', '081-234-5678', 'somchai@email.com', 'negotiating', 'quoted', '2026-03-21', 'ลูกค้าสนใจแต่ขอเจรจาราคา', 'Sale Team'),
-- (3, 'โรงงาน XYZ', '02-987-6543', 'xyz@factory.com', 'ordered', 'negotiating', '2026-03-22', 'ตกลงราคาแล้ว รอสั่งซื้อ', 'Manager');
