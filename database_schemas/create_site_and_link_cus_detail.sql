-- Create site table
CREATE TABLE IF NOT EXISTS site (
  siteID INT AUTO_INCREMENT PRIMARY KEY,
  site_code VARCHAR(20) UNIQUE,
  site_name VARCHAR(255) NOT NULL,
  site_name_en VARCHAR(255),
  location VARCHAR(255),
  province VARCHAR(100),
  country VARCHAR(100) DEFAULT 'Thailand',
  site_type ENUM('Branch', 'Warehouse', 'Office', 'Factory', 'Showroom', 'Other') DEFAULT 'Branch',
  manager_name VARCHAR(100),
  contact_phone VARCHAR(50),
  contact_email VARCHAR(255),
  address TEXT,
  is_active TINYINT(1) DEFAULT 1,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_site_code (site_code),
  INDEX idx_site_name (site_name),
  INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add siteID column to cus_detail if not exists
ALTER TABLE cus_detail
ADD COLUMN IF NOT EXISTS siteID INT NULL AFTER cusID,
ADD INDEX idx_siteID (siteID);

-- Add foreign key relationship
ALTER TABLE cus_detail
ADD CONSTRAINT fk_cus_detail_site
FOREIGN KEY (siteID) REFERENCES site(siteID)
ON DELETE SET NULL
ON UPDATE CASCADE;

-- Insert sample site data
INSERT INTO site (site_code, site_name, site_name_en, location, province, site_type, manager_name, contact_phone, contact_email, is_active) VALUES
('HQ-BKK-001', 'สำนักงานใหญ่ กรุงเทพฯ', 'Bangkok Headquarters', 'สุขุมวิท', 'กรุงเทพมหานคร', 'Office', 'คุณสมชาย ผู้จัดการ', '02-123-4567', 'hq@company.com', 1),
('BR-CNX-001', 'สาขาเชียงใหม่', 'Chiang Mai Branch', 'นิมมานเหมินท์', 'เชียงใหม่', 'Branch', 'คุณสมหญิง ผจก.สาขา', '053-123456', 'cnx@company.com', 1),
('BR-PKT-001', 'สาขาภูเก็ต', 'Phuket Branch', 'ป่าตอง', 'ภูเก็ต', 'Branch', 'คุณสมศักดิ์ ผจก.สาขา', '076-123456', 'pkt@company.com', 1),
('WH-AYT-001', 'คลังสินค้าอยุธยา', 'Ayutthaya Warehouse', 'บางปะอิน', 'พระนครศรีอยุธยา', 'Warehouse', 'คุณสมพร หัวหน้าคลัง', '035-123456', 'wh-ayt@company.com', 1),
('FC-RYG-001', 'โรงงานระยอง', 'Rayong Factory', 'มาบตาพุด', 'ระยอง', 'Factory', 'คุณสมบูรณ์ ผู้จัดการโรงงาน', '038-123456', 'fc-ryg@company.com', 1);

-- Show result
SELECT 'Site table created and linked to cus_detail successfully!' as status;
SELECT siteID, site_code, site_name, site_type FROM site;
