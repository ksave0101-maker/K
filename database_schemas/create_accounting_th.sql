-- ============================================================
-- ระบบบัญชี สาขาประเทศไทย — K Energy Save Co., Ltd.
-- Created: 2026-03-20
-- ============================================================

-- ผังบัญชี (Chart of Accounts)
CREATE TABLE IF NOT EXISTS acc_chart_of_accounts (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  code          VARCHAR(20) NOT NULL UNIQUE,
  name_th       VARCHAR(255) NOT NULL,
  name_en       VARCHAR(255),
  account_type  ENUM('asset','liability','equity','income','expense') NOT NULL,
  sub_type      VARCHAR(50),
  is_active     TINYINT(1) DEFAULT 1,
  created_at    DATETIME DEFAULT NOW()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT IGNORE INTO acc_chart_of_accounts (code, name_th, name_en, account_type, sub_type) VALUES
('1100','เงินสด','Cash','asset','current'),
('1110','เงินฝากธนาคา','Bank Deposit','asset','current'),
('1200','ลูกหนี้การค้า','Accounts Receivable','asset','current'),
('1210','ลูกหนี้อื่น','Other Receivables','asset','current'),
('1300','สินค้าคงเหลือ','Inventory','asset','current'),
('1400','สินทรัพย์หมุนเวียนอื่น','Other Current Assets','asset','current'),
('1500','ที่ดิน อาคาร อุปกรณ์','PP&E','asset','non_current'),
('1510','ค่าเสื่อมราคาสะสม','Accumulated Depreciation','asset','non_current'),
('1600','สินทรัพย์ไม่มีตัวตน','Intangible Assets','asset','non_current'),
('2100','เจ้าหนี้การค้า','Accounts Payable','liability','current'),
('2110','เจ้าหนี้อื่น','Other Payables','liability','current'),
('2200','เงินกู้ยืมระยะสั้น','Short-term Loans','liability','current'),
('2300','หนี้สินหมุนเวียนอื่น','Other Current Liabilities','liability','current'),
('2400','เงินกู้ยืมระยะยาว','Long-term Loans','liability','non_current'),
('3100','ทุนจดทะเบียน','Share Capital','equity','equity'),
('3200','กำไรสะสม','Retained Earnings','equity','equity'),
('3300','กำไร(ขาดทุน)สุทธิ','Net Income','equity','equity'),
('4100','รายได้จากการขาย','Sales Revenue','income','revenue'),
('4200','รายได้อื่น','Other Income','income','revenue'),
('5100','ต้นทุนสินค้าที่ขาย','Cost of Goods Sold','expense','cogs'),
('5200','ค่าใช้จ่ายในการขาย','Selling Expenses','expense','operating'),
('5300','ค่าใช้จ่ายในการบริหาร','Administrative Expenses','expense','operating'),
('5400','ค่าใช้จ่ายอื่น','Other Expenses','expense','other');

-- งวดบัญชี (Accounting Periods)
CREATE TABLE IF NOT EXISTS acc_periods (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  year        INT NOT NULL,
  period_num  TINYINT NOT NULL COMMENT '1-12',
  name_th     VARCHAR(50),
  date_start  DATE NOT NULL,
  date_end    DATE NOT NULL,
  is_closed   TINYINT(1) DEFAULT 0,
  closed_at   DATETIME,
  closed_by   INT,
  created_at  DATETIME DEFAULT NOW(),
  UNIQUE KEY uk_period (year, period_num)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ผู้จำหน่าย (Suppliers)
CREATE TABLE IF NOT EXISTS acc_suppliers (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  code          VARCHAR(20) UNIQUE,
  name_th       VARCHAR(255) NOT NULL,
  name_en       VARCHAR(255),
  tax_id        VARCHAR(20),
  contact_name  VARCHAR(255),
  phone         VARCHAR(50),
  email         VARCHAR(255),
  address       TEXT,
  credit_days   INT DEFAULT 30,
  is_active     TINYINT(1) DEFAULT 1,
  created_at    DATETIME DEFAULT NOW(),
  updated_at    DATETIME DEFAULT NOW() ON UPDATE NOW()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ลูกค้า (Customers)
CREATE TABLE IF NOT EXISTS acc_customers (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  code          VARCHAR(20) UNIQUE,
  name_th       VARCHAR(255) NOT NULL,
  name_en       VARCHAR(255),
  tax_id        VARCHAR(20),
  contact_name  VARCHAR(255),
  phone         VARCHAR(50),
  email         VARCHAR(255),
  address       TEXT,
  credit_days   INT DEFAULT 30,
  credit_limit  DECIMAL(15,2) DEFAULT 0,
  is_active     TINYINT(1) DEFAULT 1,
  created_at    DATETIME DEFAULT NOW(),
  updated_at    DATETIME DEFAULT NOW() ON UPDATE NOW()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- บัญชีธนาคาร (Bank Accounts)
CREATE TABLE IF NOT EXISTS acc_bank_accounts (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  account_no    VARCHAR(50) UNIQUE,
  account_name  VARCHAR(255) NOT NULL,
  bank_name     VARCHAR(100),
  branch        VARCHAR(100),
  account_type  ENUM('current','saving') DEFAULT 'current',
  balance       DECIMAL(15,2) DEFAULT 0,
  acc_code      VARCHAR(20) COMMENT 'ref acc_chart_of_accounts.code',
  is_active     TINYINT(1) DEFAULT 1,
  created_at    DATETIME DEFAULT NOW()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- สินค้า (Products / Inventory Items)
CREATE TABLE IF NOT EXISTS acc_products (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  code          VARCHAR(50) UNIQUE,
  name_th       VARCHAR(255) NOT NULL,
  name_en       VARCHAR(255),
  unit          VARCHAR(50),
  cost_price    DECIMAL(15,2) DEFAULT 0,
  sale_price    DECIMAL(15,2) DEFAULT 0,
  qty_onhand    DECIMAL(15,3) DEFAULT 0,
  reorder_level DECIMAL(15,3) DEFAULT 0,
  category      VARCHAR(100),
  is_active     TINYINT(1) DEFAULT 1,
  created_at    DATETIME DEFAULT NOW(),
  updated_at    DATETIME DEFAULT NOW() ON UPDATE NOW()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ใบสั่งซื้อ (Purchase Orders)
CREATE TABLE IF NOT EXISTS acc_purchase_orders (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  doc_no        VARCHAR(30) UNIQUE,
  doc_date      DATE NOT NULL,
  supplier_id   INT,
  status        ENUM('draft','confirmed','received','cancelled') DEFAULT 'draft',
  subtotal      DECIMAL(15,2) DEFAULT 0,
  discount      DECIMAL(15,2) DEFAULT 0,
  vat_amount    DECIMAL(15,2) DEFAULT 0,
  total         DECIMAL(15,2) DEFAULT 0,
  note          TEXT,
  created_by    INT,
  created_at    DATETIME DEFAULT NOW(),
  updated_at    DATETIME DEFAULT NOW() ON UPDATE NOW(),
  FOREIGN KEY (supplier_id) REFERENCES acc_suppliers(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS acc_purchase_order_items (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  po_id       INT NOT NULL,
  product_id  INT,
  description VARCHAR(255),
  qty         DECIMAL(15,3) DEFAULT 1,
  unit        VARCHAR(50),
  unit_price  DECIMAL(15,2) DEFAULT 0,
  amount      DECIMAL(15,2) DEFAULT 0,
  FOREIGN KEY (po_id) REFERENCES acc_purchase_orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES acc_products(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ใบสั่งขาย / ใบกำกับภาษีขาย (Sales Invoices)
CREATE TABLE IF NOT EXISTS acc_sales_invoices (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  doc_no        VARCHAR(30) UNIQUE,
  doc_date      DATE NOT NULL,
  customer_id   INT,
  doc_type      ENUM('order','cash','credit','deposit','return') DEFAULT 'credit',
  status        ENUM('draft','confirmed','paid','cancelled') DEFAULT 'draft',
  due_date      DATE,
  subtotal      DECIMAL(15,2) DEFAULT 0,
  discount      DECIMAL(15,2) DEFAULT 0,
  vat_amount    DECIMAL(15,2) DEFAULT 0,
  total         DECIMAL(15,2) DEFAULT 0,
  paid_amount   DECIMAL(15,2) DEFAULT 0,
  note          TEXT,
  created_by    INT,
  created_at    DATETIME DEFAULT NOW(),
  updated_at    DATETIME DEFAULT NOW() ON UPDATE NOW(),
  FOREIGN KEY (customer_id) REFERENCES acc_customers(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS acc_sales_invoice_items (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  inv_id      INT NOT NULL,
  product_id  INT,
  description VARCHAR(255),
  qty         DECIMAL(15,3) DEFAULT 1,
  unit        VARCHAR(50),
  unit_price  DECIMAL(15,2) DEFAULT 0,
  amount      DECIMAL(15,2) DEFAULT 0,
  FOREIGN KEY (inv_id) REFERENCES acc_sales_invoices(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES acc_products(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- บันทึกบัญชี (Journal Entries)
CREATE TABLE IF NOT EXISTS acc_journal_entries (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  doc_no      VARCHAR(30) UNIQUE,
  doc_date    DATE NOT NULL,
  description TEXT,
  status      ENUM('draft','posted','reversed') DEFAULT 'draft',
  ref_type    VARCHAR(50) COMMENT 'purchase|sales|payment|receipt|etc',
  ref_id      INT,
  created_by  INT,
  created_at  DATETIME DEFAULT NOW(),
  updated_at  DATETIME DEFAULT NOW() ON UPDATE NOW()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS acc_journal_lines (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  entry_id    INT NOT NULL,
  acc_code    VARCHAR(20) NOT NULL,
  description VARCHAR(255),
  debit       DECIMAL(15,2) DEFAULT 0,
  credit      DECIMAL(15,2) DEFAULT 0,
  FOREIGN KEY (entry_id) REFERENCES acc_journal_entries(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- รับชำระเงิน / จ่ายชำระเงิน (Payment/Receipt Vouchers)
CREATE TABLE IF NOT EXISTS acc_payment_vouchers (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  doc_no        VARCHAR(30) UNIQUE,
  doc_date      DATE NOT NULL,
  voucher_type  ENUM('pay','receive') NOT NULL,
  party_type    ENUM('supplier','customer','other') DEFAULT 'other',
  party_id      INT,
  party_name    VARCHAR(255),
  amount        DECIMAL(15,2) DEFAULT 0,
  method        ENUM('cash','transfer','cheque') DEFAULT 'cash',
  bank_acc_id   INT,
  description   TEXT,
  status        ENUM('draft','posted') DEFAULT 'draft',
  entry_id      INT COMMENT 'ref acc_journal_entries',
  created_by    INT,
  created_at    DATETIME DEFAULT NOW()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- สต็อกสินค้า (Inventory Movements)
CREATE TABLE IF NOT EXISTS acc_inventory_movements (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  move_date   DATE NOT NULL,
  move_type   ENUM('in','out','transfer','adjust','count') NOT NULL,
  product_id  INT,
  qty         DECIMAL(15,3) DEFAULT 0,
  unit_cost   DECIMAL(15,2) DEFAULT 0,
  ref_type    VARCHAR(50),
  ref_id      INT,
  note        TEXT,
  created_by  INT,
  created_at  DATETIME DEFAULT NOW(),
  FOREIGN KEY (product_id) REFERENCES acc_products(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
