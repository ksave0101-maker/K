-- เพิ่มข้อมูลการจัดส่งในไทย สำหรับ korea_order_tracking
-- Migration: Add Thailand local delivery fields

ALTER TABLE korea_order_tracking
  ADD COLUMN thailand_tracking_no VARCHAR(100) NULL COMMENT 'เลขพัสดุในไทย',
  ADD COLUMN thailand_carrier VARCHAR(100) NULL COMMENT 'บริษัทขนส่งในไทย (Kerry, Flash, J&T, SCG, etc.)',
  ADD COLUMN thailand_delivery_status VARCHAR(50) NULL DEFAULT 'pending' COMMENT 'สถานะการจัดส่งในไทย: pending, preparing, in_transit, delivered, failed',
  ADD COLUMN thailand_est_delivery DATE NULL COMMENT 'วันที่กำหนดส่งถึงลูกค้า',
  ADD COLUMN thailand_actual_delivery DATE NULL COMMENT 'วันที่ส่งถึงลูกค้าจริง',
  ADD COLUMN thailand_delivery_address TEXT NULL COMMENT 'ที่อยู่จัดส่งในไทย',
  ADD COLUMN thailand_delivery_notes TEXT NULL COMMENT 'หมายเหตุการจัดส่งในไทย';
