-- เพิ่ม foreign keys เชื่อมกับ Purchase Request และ Production Order
-- Migration: Add PR and PDO links to korea_order_tracking

ALTER TABLE korea_order_tracking
  ADD COLUMN pr_id INT NULL COMMENT 'Link to Purchase Request (optional)',
  ADD COLUMN pdo_id INT NULL COMMENT 'Link to Production Order (optional)',
  ADD KEY idx_pr_id (pr_id),
  ADD KEY idx_pdo_id (pdo_id);

-- Optional: Add foreign key constraints (uncomment if needed)
-- ALTER TABLE korea_order_tracking
--   ADD CONSTRAINT fk_korea_tracking_pr FOREIGN KEY (pr_id) REFERENCES purchase_requests(prID) ON DELETE SET NULL,
--   ADD CONSTRAINT fk_korea_tracking_pdo FOREIGN KEY (pdo_id) REFERENCES production_orders(poID) ON DELETE SET NULL;
