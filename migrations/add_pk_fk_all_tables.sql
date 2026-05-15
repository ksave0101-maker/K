-- ============================================================
-- Migration: Remove Duplicates + Add PRIMARY KEYS + FOREIGN KEYS
-- Date: 2026-05-15
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = '';

-- ============================================================
-- PHASE 1: REMOVE DUPLICATES
-- Pattern: CREATE TEMP → TRUNCATE → INSERT DISTINCT → DROP TEMP
-- ============================================================

-- 1. cus_type (72 → 24 unique)
CREATE TABLE _tmp AS SELECT DISTINCT * FROM `cus_type`;
TRUNCATE TABLE `cus_type`;
INSERT INTO `cus_type` SELECT * FROM _tmp;
DROP TABLE _tmp;

-- 2. product _Type (30 → 3 unique)  [table name has space]
CREATE TABLE _tmp AS SELECT DISTINCT * FROM `product _Type`;
TRUNCATE TABLE `product _Type`;
INSERT INTO `product _Type` SELECT * FROM _tmp;
DROP TABLE _tmp;

-- 3. chat_messages (24 → 8 unique)
CREATE TABLE _tmp AS SELECT DISTINCT * FROM `chat_messages`;
TRUNCATE TABLE `chat_messages`;
INSERT INTO `chat_messages` SELECT * FROM _tmp;
DROP TABLE _tmp;

-- 4. pre_installation_images (20 → 10 unique)
CREATE TABLE _tmp AS SELECT DISTINCT * FROM `pre_installation_images`;
TRUNCATE TABLE `pre_installation_images`;
INSERT INTO `pre_installation_images` SELECT * FROM _tmp;
DROP TABLE _tmp;

-- 5. user_list_backup_before_dedup (17 → 9 unique)
CREATE TABLE _tmp AS SELECT DISTINCT * FROM `user_list_backup_before_dedup`;
TRUNCATE TABLE `user_list_backup_before_dedup`;
INSERT INTO `user_list_backup_before_dedup` SELECT * FROM _tmp;
DROP TABLE _tmp;

-- 6. power_records (16 → 8 unique)
--    IMPORTANT: exclude STORED GENERATED columns (energy_reduction, co2_reduction)
CREATE TABLE _tmp AS SELECT DISTINCT
  `id`, `device_id`, `before_meter_no`, `metrics_meter_no`, `record_time`,
  `before_L1`, `before_L2`, `before_L3`, `before_kWh`,
  `before_P`, `before_Q`, `before_S`, `before_PF`, `before_THD`, `before_F`,
  `metrics_L1`, `metrics_L2`, `metrics_L3`, `metrics_kWh`,
  `metrics_P`, `metrics_Q`, `metrics_S`, `metrics_PF`, `metrics_THD`, `metrics_F`,
  `created_at`, `updated_at`, `created_by`, `deviceID`, `series_no`
FROM `power_records`;
TRUNCATE TABLE `power_records`;
INSERT INTO `power_records` (
  `id`, `device_id`, `before_meter_no`, `metrics_meter_no`, `record_time`,
  `before_L1`, `before_L2`, `before_L3`, `before_kWh`,
  `before_P`, `before_Q`, `before_S`, `before_PF`, `before_THD`, `before_F`,
  `metrics_L1`, `metrics_L2`, `metrics_L3`, `metrics_kWh`,
  `metrics_P`, `metrics_Q`, `metrics_S`, `metrics_PF`, `metrics_THD`, `metrics_F`,
  `created_at`, `updated_at`, `created_by`, `deviceID`, `series_no`
) SELECT * FROM _tmp;
DROP TABLE _tmp;

-- 7. devices (15 → 5 unique)
CREATE TABLE _tmp AS SELECT DISTINCT * FROM `devices`;
TRUNCATE TABLE `devices`;
INSERT INTO `devices` SELECT * FROM _tmp;
DROP TABLE _tmp;

-- 8. tax_invoices (10 → 5 unique)
CREATE TABLE _tmp AS SELECT DISTINCT * FROM `tax_invoices`;
TRUNCATE TABLE `tax_invoices`;
INSERT INTO `tax_invoices` SELECT * FROM _tmp;
DROP TABLE _tmp;

-- 9. receipts (10 → 5 unique)
CREATE TABLE _tmp AS SELECT DISTINCT * FROM `receipts`;
TRUNCATE TABLE `receipts`;
INSERT INTO `receipts` SELECT * FROM _tmp;
DROP TABLE _tmp;

-- 10. chat_log (9 → 3 unique)
CREATE TABLE _tmp AS SELECT DISTINCT * FROM `chat_log`;
TRUNCATE TABLE `chat_log`;
INSERT INTO `chat_log` SELECT * FROM _tmp;
DROP TABLE _tmp;

-- 11. purchase_order_items (8 → 4 unique)
CREATE TABLE _tmp AS SELECT DISTINCT * FROM `purchase_order_items`;
TRUNCATE TABLE `purchase_order_items`;
INSERT INTO `purchase_order_items` SELECT * FROM _tmp;
DROP TABLE _tmp;

-- 12. delivery_notes (6 → 2 unique)
CREATE TABLE _tmp AS SELECT DISTINCT * FROM `delivery_notes`;
TRUNCATE TABLE `delivery_notes`;
INSERT INTO `delivery_notes` SELECT * FROM _tmp;
DROP TABLE _tmp;

-- 13. contracts (6 → 2 unique)
CREATE TABLE _tmp AS SELECT DISTINCT * FROM `contracts`;
TRUNCATE TABLE `contracts`;
INSERT INTO `contracts` SELECT * FROM _tmp;
DROP TABLE _tmp;

-- 14. purchase_orders (6 → 3 unique)
CREATE TABLE _tmp AS SELECT DISTINCT * FROM `purchase_orders`;
TRUNCATE TABLE `purchase_orders`;
INSERT INTO `purchase_orders` SELECT * FROM _tmp;
DROP TABLE _tmp;

-- 15. delivery_note_items (6 → 2 unique)
CREATE TABLE _tmp AS SELECT DISTINCT * FROM `delivery_note_items`;
TRUNCATE TABLE `delivery_note_items`;
INSERT INTO `delivery_note_items` SELECT * FROM _tmp;
DROP TABLE _tmp;

-- 16. invoices (6 → 3 unique)
CREATE TABLE _tmp AS SELECT DISTINCT * FROM `invoices`;
TRUNCATE TABLE `invoices`;
INSERT INTO `invoices` SELECT * FROM _tmp;
DROP TABLE _tmp;

-- 17. cus_detail (4 → 2 unique)  [already has FK fk_cus_detail_acc_customer]
CREATE TABLE _tmp AS SELECT DISTINCT * FROM `cus_detail`;
TRUNCATE TABLE `cus_detail`;
INSERT INTO `cus_detail` SELECT * FROM _tmp;
DROP TABLE _tmp;

-- 18. cus_detail_backup (4 → 2 unique)
CREATE TABLE _tmp AS SELECT DISTINCT * FROM `cus_detail_backup`;
TRUNCATE TABLE `cus_detail_backup`;
INSERT INTO `cus_detail_backup` SELECT * FROM _tmp;
DROP TABLE _tmp;

-- 19. quotation_items (4 → 2 unique)
CREATE TABLE _tmp AS SELECT DISTINCT * FROM `quotation_items`;
TRUNCATE TABLE `quotation_items`;
INSERT INTO `quotation_items` SELECT * FROM _tmp;
DROP TABLE _tmp;

-- 20. quotations (4 → 2 unique)
CREATE TABLE _tmp AS SELECT DISTINCT * FROM `quotations`;
TRUNCATE TABLE `quotations`;
INSERT INTO `quotations` SELECT * FROM _tmp;
DROP TABLE _tmp;

-- 21. follow_ups (3 → 1 unique)
CREATE TABLE _tmp AS SELECT DISTINCT * FROM `follow_ups`;
TRUNCATE TABLE `follow_ups`;
INSERT INTO `follow_ups` SELECT * FROM _tmp;
DROP TABLE _tmp;

-- 22. sales_order_items (2 → 1 unique)
CREATE TABLE _tmp AS SELECT DISTINCT * FROM `sales_order_items`;
TRUNCATE TABLE `sales_order_items`;
INSERT INTO `sales_order_items` SELECT * FROM _tmp;
DROP TABLE _tmp;

-- 23. sales_orders (2 → 1 unique)
CREATE TABLE _tmp AS SELECT DISTINCT * FROM `sales_orders`;
TRUNCATE TABLE `sales_orders`;
INSERT INTO `sales_orders` SELECT * FROM _tmp;
DROP TABLE _tmp;

-- 24. power_calculations (2 → 1 unique)
CREATE TABLE _tmp AS SELECT DISTINCT * FROM `power_calculations`;
TRUNCATE TABLE `power_calculations`;
INSERT INTO `power_calculations` SELECT * FROM _tmp;
DROP TABLE _tmp;

-- ============================================================
-- PHASE 2: ADD PRIMARY KEYS (parent tables first)
-- ============================================================

-- Level 0: No FK dependencies
ALTER TABLE `cus_detail`                   ADD PRIMARY KEY (`cusID`);
ALTER TABLE `cus_type`                     ADD PRIMARY KEY (`typeID`);
ALTER TABLE `devices`                      ADD PRIMARY KEY (`deviceID`);
ALTER TABLE `suppliers`                    ADD PRIMARY KEY (`supplier_id`);
ALTER TABLE `chat_messages`                ADD PRIMARY KEY (`id`);
ALTER TABLE `user_list_backup_before_dedup` ADD PRIMARY KEY (`userId`);
ALTER TABLE `cus_detail_backup`            ADD PRIMARY KEY (`cusID`);
ALTER TABLE `product _Type`                ADD PRIMARY KEY (`pro_TypeID`);
ALTER TABLE `quote_sequence`               ADD PRIMARY KEY (`date_key`);

-- Level 1: Reference level-0 tables
ALTER TABLE `quotations`                   ADD PRIMARY KEY (`quoteID`);
ALTER TABLE `sales_orders`                 ADD PRIMARY KEY (`orderID`);
ALTER TABLE `purchase_orders`              ADD PRIMARY KEY (`orderID`);
ALTER TABLE `contracts`                    ADD PRIMARY KEY (`contractID`);
ALTER TABLE `invoices`                     ADD PRIMARY KEY (`invID`);
ALTER TABLE `power_records`                ADD PRIMARY KEY (`id`);
ALTER TABLE `user_sessions`                ADD PRIMARY KEY (`id`);
ALTER TABLE `pre_installation_forms_dedup` ADD PRIMARY KEY (`formID`);
ALTER TABLE `power_calculations`           ADD PRIMARY KEY (`calcID`);
ALTER TABLE `supplier_products_minimal`    ADD PRIMARY KEY (`id`);

-- Level 2: Reference level-1 tables
ALTER TABLE `quotation_items`              ADD PRIMARY KEY (`itemID`);
ALTER TABLE `sales_order_items`            ADD PRIMARY KEY (`itemID`);
ALTER TABLE `purchase_order_items`         ADD PRIMARY KEY (`itemID`);
ALTER TABLE `delivery_notes`               ADD PRIMARY KEY (`deliveryID`);
ALTER TABLE `tax_invoices`                 ADD PRIMARY KEY (`taxID`);
ALTER TABLE `receipts`                     ADD PRIMARY KEY (`receiptID`);
ALTER TABLE `pre_installation_images`      ADD PRIMARY KEY (`id`);
ALTER TABLE `chat_log`                     ADD PRIMARY KEY (`id`);

-- Level 3: Reference level-2 tables
ALTER TABLE `delivery_note_items`          ADD PRIMARY KEY (`itemID`);
ALTER TABLE `follow_ups`                   ADD PRIMARY KEY (`followUpID`);

-- ============================================================
-- PHASE 3: ADD FOREIGN KEYS
-- ============================================================

-- ---- Child Items: ON DELETE CASCADE (items go with parent) ----

ALTER TABLE `quotation_items`
  ADD CONSTRAINT `fk_qi_quotations`
  FOREIGN KEY (`quoteID`) REFERENCES `quotations`(`quoteID`)
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `purchase_order_items`
  ADD CONSTRAINT `fk_poi_purchase_orders`
  FOREIGN KEY (`orderID`) REFERENCES `purchase_orders`(`orderID`)
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `sales_order_items`
  ADD CONSTRAINT `fk_soi_sales_orders`
  FOREIGN KEY (`orderID`) REFERENCES `sales_orders`(`orderID`)
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `delivery_note_items`
  ADD CONSTRAINT `fk_dni_delivery_notes`
  FOREIGN KEY (`deliveryID`) REFERENCES `delivery_notes`(`deliveryID`)
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `pre_installation_images`
  ADD CONSTRAINT `fk_pre_images_forms`
  FOREIGN KEY (`form_id`) REFERENCES `pre_installation_forms_dedup`(`formID`)
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `supplier_products_minimal`
  ADD CONSTRAINT `fk_sup_products_suppliers`
  FOREIGN KEY (`supplier_id`) REFERENCES `suppliers`(`supplier_id`)
  ON DELETE CASCADE ON UPDATE CASCADE;

-- ---- Document Chain: ON DELETE SET NULL ----

ALTER TABLE `receipts`
  ADD CONSTRAINT `fk_receipts_invoices`
  FOREIGN KEY (`invID`) REFERENCES `invoices`(`invID`)
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `tax_invoices`
  ADD CONSTRAINT `fk_tax_inv_invoices`
  FOREIGN KEY (`invID`) REFERENCES `invoices`(`invID`)
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `delivery_notes`
  ADD CONSTRAINT `fk_dn_invoices`
  FOREIGN KEY (`invID`) REFERENCES `invoices`(`invID`)
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `delivery_notes`
  ADD CONSTRAINT `fk_dn_contracts`
  FOREIGN KEY (`contractID`) REFERENCES `contracts`(`contractID`)
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `follow_ups`
  ADD CONSTRAINT `fk_follow_ups_delivery`
  FOREIGN KEY (`deliveryID`) REFERENCES `delivery_notes`(`deliveryID`)
  ON DELETE SET NULL ON UPDATE CASCADE;

-- ---- Customer FKs: ON DELETE SET NULL (all cusID currently NULL = safe) ----

ALTER TABLE `quotations`
  ADD CONSTRAINT `fk_quotations_cus`
  FOREIGN KEY (`cusID`) REFERENCES `cus_detail`(`cusID`)
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `sales_orders`
  ADD CONSTRAINT `fk_sales_orders_cus`
  FOREIGN KEY (`cusID`) REFERENCES `cus_detail`(`cusID`)
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `purchase_orders`
  ADD CONSTRAINT `fk_purchase_orders_cus`
  FOREIGN KEY (`cusID`) REFERENCES `cus_detail`(`cusID`)
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `contracts`
  ADD CONSTRAINT `fk_contracts_cus`
  FOREIGN KEY (`cusID`) REFERENCES `cus_detail`(`cusID`)
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `invoices`
  ADD CONSTRAINT `fk_invoices_cus`
  FOREIGN KEY (`cusID`) REFERENCES `cus_detail`(`cusID`)
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `receipts`
  ADD CONSTRAINT `fk_receipts_cus`
  FOREIGN KEY (`cusID`) REFERENCES `cus_detail`(`cusID`)
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `tax_invoices`
  ADD CONSTRAINT `fk_tax_inv_cus`
  FOREIGN KEY (`cusID`) REFERENCES `cus_detail`(`cusID`)
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `delivery_notes`
  ADD CONSTRAINT `fk_dn_cus`
  FOREIGN KEY (`cusID`) REFERENCES `cus_detail`(`cusID`)
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `power_calculations`
  ADD CONSTRAINT `fk_power_calc_cus`
  FOREIGN KEY (`cusID`) REFERENCES `cus_detail`(`cusID`)
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `pre_installation_forms_dedup`
  ADD CONSTRAINT `fk_pre_inst_cus`
  FOREIGN KEY (`cusID`) REFERENCES `cus_detail`(`cusID`)
  ON DELETE SET NULL ON UPDATE CASCADE;

-- ---- Device/Power: ON DELETE SET NULL ----

ALTER TABLE `power_records`
  ADD CONSTRAINT `fk_power_records_devices`
  FOREIGN KEY (`device_id`) REFERENCES `devices`(`deviceID`)
  ON DELETE SET NULL ON UPDATE CASCADE;

-- ---- User/Session: ON DELETE CASCADE ----

ALTER TABLE `user_sessions`
  ADD CONSTRAINT `fk_user_sessions_user`
  FOREIGN KEY (`user_id`) REFERENCES `user_list`(`userId`)
  ON DELETE CASCADE ON UPDATE CASCADE;

-- ============================================================
SET FOREIGN_KEY_CHECKS = 1;
-- ============================================================
