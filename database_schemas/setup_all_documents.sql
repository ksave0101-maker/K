-- ============================================
-- K-System Document Management Setup Script
-- ============================================
-- This script creates all 12 document tables + document_counters table
-- Run this script once to set up the complete document management system
-- ============================================

-- Use ksystem database
USE `ksystem`;

-- ============================================
-- 1. Document Counters Table (for unique numbering)
-- ============================================

CREATE TABLE IF NOT EXISTS `document_counters` (
  `prefix` varchar(10) NOT NULL COMMENT 'Document prefix (CN, GR, PV, etc.)',
  `year_month` varchar(8) NOT NULL COMMENT 'Format: YYYYMMDD (daily reset for all documents)',
  `counter` int NOT NULL DEFAULT 0 COMMENT 'Auto-increment counter',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`prefix`, `year_month`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Stores document number counters for atomic generation';

-- ============================================
-- 2. Credit Notes (CN)
-- ============================================

CREATE TABLE IF NOT EXISTS `credit_notes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `cnNo` varchar(50) NOT NULL UNIQUE COMMENT 'Format: CN-YYYYMMDD-####',
  `cnDate` date NOT NULL,
  `customer_name` varchar(255) NOT NULL,
  `invoice_ref` varchar(50) DEFAULT NULL,
  `reason` text,
  `subtotal` decimal(15,2) DEFAULT 0.00,
  `discount` decimal(15,2) DEFAULT 0.00,
  `vat` decimal(15,2) DEFAULT 0.00,
  `total_amount` decimal(15,2) DEFAULT 0.00,
  `notes` text,
  `status` enum('draft','approved','cancelled') DEFAULT 'draft',
  `created_by` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_cnNo` (`cnNo`),
  INDEX `idx_customer` (`customer_name`),
  INDEX `idx_date` (`cnDate`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `credit_note_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `credit_note_id` int NOT NULL,
  `description` varchar(500) NOT NULL,
  `quantity` decimal(10,2) NOT NULL DEFAULT 1.00,
  `unit_price` decimal(15,2) NOT NULL DEFAULT 0.00,
  `total_price` decimal(15,2) NOT NULL DEFAULT 0.00,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`credit_note_id`) REFERENCES `credit_notes`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 3. Goods Receipts (GR)
-- ============================================

CREATE TABLE IF NOT EXISTS `goods_receipts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `grNo` varchar(50) NOT NULL UNIQUE COMMENT 'Format: GR-YYYYMMDD-####',
  `grDate` date NOT NULL,
  `supplier_name` varchar(255) NOT NULL,
  `po_ref` varchar(50) DEFAULT NULL,
  `warehouse` varchar(100) NOT NULL,
  `receiver_name` varchar(100) NOT NULL,
  `notes` text,
  `status` enum('draft','received','partial','cancelled') DEFAULT 'draft',
  `created_by` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_grNo` (`grNo`),
  INDEX `idx_supplier` (`supplier_name`),
  INDEX `idx_date` (`grDate`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `goods_receipt_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `goods_receipt_id` int NOT NULL,
  `product_code` varchar(100) DEFAULT NULL,
  `product_name` varchar(255) NOT NULL,
  `quantity_ordered` decimal(10,2) DEFAULT 0.00,
  `quantity_received` decimal(10,2) NOT NULL,
  `unit` varchar(50) DEFAULT 'pcs',
  `status` enum('received','partial','pending') DEFAULT 'received',
  PRIMARY KEY (`id`),
  FOREIGN KEY (`goods_receipt_id`) REFERENCES `goods_receipts`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 4. Payment Vouchers (PV)
-- ============================================

CREATE TABLE IF NOT EXISTS `payment_vouchers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `pvNo` varchar(50) NOT NULL UNIQUE COMMENT 'Format: PV-YYYYMMDD-####',
  `pvDate` date NOT NULL,
  `payee_name` varchar(255) NOT NULL,
  `payment_method` enum('cash','bank_transfer','cheque','credit_card') DEFAULT 'bank_transfer',
  `bank_name` varchar(100) DEFAULT NULL,
  `reference_no` varchar(100) DEFAULT NULL,
  `total_amount` decimal(15,2) DEFAULT 0.00,
  `notes` text,
  `status` enum('draft','paid','cancelled') DEFAULT 'draft',
  `created_by` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_pvNo` (`pvNo`),
  INDEX `idx_payee` (`payee_name`),
  INDEX `idx_date` (`pvDate`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `payment_voucher_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `payment_voucher_id` int NOT NULL,
  `description` varchar(500) NOT NULL,
  `invoice_ref` varchar(50) DEFAULT NULL,
  `amount` decimal(15,2) NOT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`payment_voucher_id`) REFERENCES `payment_vouchers`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 5. Warranties (WT)
-- ============================================

CREATE TABLE IF NOT EXISTS `warranties` (
  `id` int NOT NULL AUTO_INCREMENT,
  `wtNo` varchar(50) NOT NULL UNIQUE COMMENT 'Format: WT-TH-YYYYMMDD-####',
  `wtDate` date NOT NULL,
  `customer_name` varchar(255) NOT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `product_name` varchar(255) NOT NULL,
  `serial_number` varchar(100) DEFAULT NULL,
  `purchase_date` date DEFAULT NULL,
  `warranty_start_date` date NOT NULL,
  `warranty_period` int NOT NULL COMMENT 'Period in months',
  `warranty_end_date` date NOT NULL,
  `warranty_type` enum('manufacturer','extended','store') DEFAULT 'manufacturer',
  `coverage_details` text,
  `notes` text,
  `status` enum('active','expired','claimed','cancelled') DEFAULT 'active',
  `created_by` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_wtNo` (`wtNo`),
  INDEX `idx_customer` (`customer_name`),
  INDEX `idx_expiry` (`warranty_end_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 6. Purchase Requests (PR)
-- ============================================

CREATE TABLE IF NOT EXISTS `purchase_requests` (
  `id` int NOT NULL AUTO_INCREMENT,
  `prNo` varchar(50) NOT NULL UNIQUE COMMENT 'Format: PR-YYYYMMDD-####',
  `prDate` date NOT NULL,
  `requester_name` varchar(100) NOT NULL,
  `requested_by` varchar(150) DEFAULT NULL,
  `department` varchar(100) NOT NULL,
  `branch` varchar(50) DEFAULT NULL,
  `purpose` text,
  `required_date` date NOT NULL,
  `notes` text,
  `status` enum('pending','approved','rejected','ordered','cancelled') DEFAULT 'pending',
  `created_by` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_prNo` (`prNo`),
  INDEX `idx_requester` (`requester_name`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `purchase_request_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `purchase_request_id` int NOT NULL,
  `product_code` varchar(100) DEFAULT NULL,
  `product_name` varchar(255) NOT NULL,
  `quantity` decimal(10,2) NOT NULL,
  `unit` varchar(50) DEFAULT 'pcs',
  `estimated_price` decimal(15,2) DEFAULT 0.00,
  `total_price` decimal(15,2) DEFAULT 0.00,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`purchase_request_id`) REFERENCES `purchase_requests`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 7. Supplier Invoices (SI)
-- ============================================

CREATE TABLE IF NOT EXISTS `supplier_invoices` (
  `id` int NOT NULL AUTO_INCREMENT,
  `siNo` varchar(50) NOT NULL UNIQUE COMMENT 'Format: SI-YYYYMMDD-####',
  `siDate` date NOT NULL,
  `supplier_name` varchar(255) NOT NULL,
  `supplier_invoice_no` varchar(100) NOT NULL,
  `po_ref` varchar(50) DEFAULT NULL,
  `due_date` date DEFAULT NULL,
  `amount` decimal(15,2) DEFAULT 0.00,
  `vat` decimal(15,2) DEFAULT 0.00,
  `total_amount` decimal(15,2) DEFAULT 0.00,
  `notes` text,
  `status` enum('draft','pending','paid','overdue','cancelled') DEFAULT 'draft',
  `created_by` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_siNo` (`siNo`),
  INDEX `idx_supplier` (`supplier_name`),
  INDEX `idx_due_date` (`due_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `supplier_invoice_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `supplier_invoice_id` int NOT NULL,
  `product_code` varchar(100) DEFAULT NULL,
  `product_name` varchar(255) NOT NULL,
  `quantity` decimal(10,2) NOT NULL,
  `unit_price` decimal(15,2) NOT NULL,
  `total_price` decimal(15,2) NOT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`supplier_invoice_id`) REFERENCES `supplier_invoices`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 8. Stock Cards (SC)
-- ============================================

CREATE TABLE IF NOT EXISTS `stock_cards` (
  `id` int NOT NULL AUTO_INCREMENT,
  `scNo` varchar(50) NOT NULL UNIQUE COMMENT 'Format: SC-YYYYMMDD-####',
  `scDate` date NOT NULL,
  `product_code` varchar(100) DEFAULT NULL,
  `product_name` varchar(255) NOT NULL,
  `transaction_type` enum('in','out','adjustment') NOT NULL,
  `quantity_in` decimal(10,2) DEFAULT 0.00,
  `quantity_out` decimal(10,2) DEFAULT 0.00,
  `balance` decimal(10,2) DEFAULT 0.00,
  `unit` varchar(50) DEFAULT 'pcs',
  `reference_no` varchar(100) DEFAULT NULL,
  `notes` text,
  `created_by` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_scNo` (`scNo`),
  INDEX `idx_product` (`product_code`),
  INDEX `idx_date` (`scDate`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 9. Stock Transfers (ST)
-- ============================================

CREATE TABLE IF NOT EXISTS `stock_transfers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `stNo` varchar(50) NOT NULL UNIQUE COMMENT 'Format: ST-YYYYMMDD-####',
  `stDate` date NOT NULL,
  `from_warehouse` varchar(100) NOT NULL,
  `to_warehouse` varchar(100) NOT NULL,
  `transfer_by` varchar(100) NOT NULL,
  `approved_by` varchar(100) DEFAULT NULL,
  `notes` text,
  `status` enum('draft','in_transit','completed','cancelled') DEFAULT 'draft',
  `created_by` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_stNo` (`stNo`),
  INDEX `idx_warehouses` (`from_warehouse`, `to_warehouse`),
  INDEX `idx_date` (`stDate`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `stock_transfer_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `stock_transfer_id` int NOT NULL,
  `product_code` varchar(100) DEFAULT NULL,
  `product_name` varchar(255) NOT NULL,
  `quantity` decimal(10,2) NOT NULL,
  `unit` varchar(50) DEFAULT 'pcs',
  PRIMARY KEY (`id`),
  FOREIGN KEY (`stock_transfer_id`) REFERENCES `stock_transfers`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 10. Stock Adjustments (SA)
-- ============================================

CREATE TABLE IF NOT EXISTS `stock_adjustments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `saNo` varchar(50) NOT NULL UNIQUE COMMENT 'Format: SA-YYYYMMDD-####',
  `saDate` date NOT NULL,
  `warehouse` varchar(100) NOT NULL,
  `adjustment_type` enum('increase','decrease','recount') NOT NULL,
  `reason` text NOT NULL,
  `adjusted_by` varchar(100) NOT NULL,
  `notes` text,
  `status` enum('draft','approved','cancelled') DEFAULT 'draft',
  `created_by` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_saNo` (`saNo`),
  INDEX `idx_warehouse` (`warehouse`),
  INDEX `idx_date` (`saDate`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `stock_adjustment_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `stock_adjustment_id` int NOT NULL,
  `product_code` varchar(100) DEFAULT NULL,
  `product_name` varchar(255) NOT NULL,
  `quantity_before` decimal(10,2) NOT NULL DEFAULT 0.00,
  `quantity_adjusted` decimal(10,2) NOT NULL,
  `quantity_after` decimal(10,2) NOT NULL,
  `unit` varchar(50) DEFAULT 'pcs',
  PRIMARY KEY (`id`),
  FOREIGN KEY (`stock_adjustment_id`) REFERENCES `stock_adjustments`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 11. Expense Bills (EB)
-- ============================================

CREATE TABLE IF NOT EXISTS `expense_bills` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ebNo` varchar(50) NOT NULL UNIQUE COMMENT 'Format: EB-YYYYMMDD-####',
  `ebDate` date NOT NULL,
  `expense_type` enum('operational','administrative','marketing','maintenance','utilities','other') NOT NULL,
  `category` varchar(100) NOT NULL,
  `vendor_name` varchar(255) NOT NULL,
  `vendor_invoice_no` varchar(100) DEFAULT NULL,
  `department` varchar(100) NOT NULL,
  `project_code` varchar(50) DEFAULT NULL,
  `payment_method` enum('cash','bank_transfer','cheque','credit_card') DEFAULT 'bank_transfer',
  `payment_status` enum('paid','unpaid','partial') DEFAULT 'unpaid',
  `amount` decimal(15,2) DEFAULT 0.00,
  `vat` decimal(15,2) DEFAULT 0.00,
  `total_amount` decimal(15,2) DEFAULT 0.00,
  `description` text,
  `notes` text,
  `status` enum('draft','approved','paid','cancelled') DEFAULT 'draft',
  `created_by` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_ebNo` (`ebNo`),
  INDEX `idx_vendor` (`vendor_name`),
  INDEX `idx_department` (`department`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `expense_bill_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `expense_bill_id` int NOT NULL,
  `description` varchar(500) NOT NULL,
  `quantity` decimal(10,2) NOT NULL DEFAULT 1.00,
  `unit_price` decimal(15,2) NOT NULL,
  `total_price` decimal(15,2) NOT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`expense_bill_id`) REFERENCES `expense_bills`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 12. Production Orders (PDO)
-- ============================================

CREATE TABLE IF NOT EXISTS `production_orders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `pdoNo` varchar(50) NOT NULL UNIQUE COMMENT 'Format: PDO-YYYYMMDD-####',
  `pdoDate` date NOT NULL,
  `product_code` varchar(100) DEFAULT NULL,
  `product_name` varchar(255) NOT NULL,
  `quantity_ordered` decimal(10,2) NOT NULL,
  `unit` varchar(50) DEFAULT 'pcs',
  `start_date` date NOT NULL,
  `due_date` date NOT NULL,
  `priority` enum('low','normal','high','urgent') DEFAULT 'normal',
  `production_line` varchar(100) NOT NULL,
  `shift` enum('morning','afternoon','night','all_day') DEFAULT 'all_day',
  `supervisor` varchar(100) NOT NULL,
  `notes` text,
  `status` enum('pending','in_progress','completed','cancelled','on_hold') DEFAULT 'pending',
  `created_by` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_pdoNo` (`pdoNo`),
  INDEX `idx_product` (`product_code`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `production_order_materials` (
  `id` int NOT NULL AUTO_INCREMENT,
  `production_order_id` int NOT NULL,
  `material_code` varchar(100) DEFAULT NULL,
  `material_name` varchar(255) NOT NULL,
  `quantity_required` decimal(10,2) NOT NULL,
  `unit` varchar(50) DEFAULT 'pcs',
  PRIMARY KEY (`id`),
  FOREIGN KEY (`production_order_id`) REFERENCES `production_orders`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `production_order_steps` (
  `id` int NOT NULL AUTO_INCREMENT,
  `production_order_id` int NOT NULL,
  `step_number` int NOT NULL,
  `step_name` varchar(255) NOT NULL,
  `description` text,
  `duration_minutes` int NOT NULL,
  `assigned_to` varchar(100) DEFAULT NULL,
  `status` enum('pending','in_progress','completed') DEFAULT 'pending',
  PRIMARY KEY (`id`),
  FOREIGN KEY (`production_order_id`) REFERENCES `production_orders`(`id`) ON DELETE CASCADE,
  INDEX `idx_step_order` (`production_order_id`, `step_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 13. Vacation Leave Requests (VLR)
-- ============================================

CREATE TABLE IF NOT EXISTS `vacation_leave_requests` (
  `vlrID` int NOT NULL AUTO_INCREMENT,
  `vlrNo` varchar(64) NOT NULL UNIQUE COMMENT 'Format: VLR-YYYYMMDD-####',
  `requestDate` date DEFAULT NULL,
  `employeeName` varchar(150) NOT NULL,
  `employeeId` varchar(100) NOT NULL,
  `department` varchar(150) NOT NULL,
  `branch` varchar(50) DEFAULT NULL,
  `leaveType` enum('annual_leave','personal_leave','sick_leave','other') DEFAULT 'annual_leave',
  `startDate` date NOT NULL,
  `endDate` date NOT NULL,
  `totalDays` int DEFAULT 0,
  `reason` text,
  `contactPhone` varchar(50) DEFAULT NULL,
  `backupPerson` varchar(150) DEFAULT NULL,
  `approver` varchar(150) DEFAULT NULL,
  `status` enum('pending','approved','rejected','cancelled') DEFAULT 'pending',
  `approved_by` varchar(150) DEFAULT NULL,
  `approved_at` timestamp NULL DEFAULT NULL,
  `notes` text,
  `created_by` varchar(150) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`vlrID`),
  INDEX `idx_employee_id` (`employeeId`),
  INDEX `idx_department` (`department`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- END OF SETUP SCRIPT
-- ============================================

-- Show created tables
SHOW TABLES LIKE '%credit_notes%';
SHOW TABLES LIKE '%goods_receipts%';
SHOW TABLES LIKE '%payment_vouchers%';
SHOW TABLES LIKE '%warranties%';
SHOW TABLES LIKE '%purchase_requests%';
SHOW TABLES LIKE '%supplier_invoices%';
SHOW TABLES LIKE '%stock_cards%';
SHOW TABLES LIKE '%stock_transfers%';
SHOW TABLES LIKE '%stock_adjustments%';
SHOW TABLES LIKE '%expense_bills%';
SHOW TABLES LIKE '%production_orders%';
SHOW TABLES LIKE '%vacation_leave_requests%';
SHOW TABLES LIKE '%document_counters%';

SELECT '✅ Document Management System database setup completed!' AS status;
