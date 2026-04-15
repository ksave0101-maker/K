-- Create branch-specific production order tables
-- Base table reference: production_orders

CREATE TABLE IF NOT EXISTS `production_orders_vietnam` LIKE `production_orders`;
CREATE TABLE IF NOT EXISTS `production_orders_thailand` LIKE `production_orders`;
CREATE TABLE IF NOT EXISTS `production_orders_brunei` LIKE `production_orders`;
CREATE TABLE IF NOT EXISTS `production_orders_malaysia` LIKE `production_orders`;

-- Optional checks
-- SELECT COUNT(*) FROM production_orders_vietnam;
-- SELECT COUNT(*) FROM production_orders_thailand;
-- SELECT COUNT(*) FROM production_orders_brunei;
-- SELECT COUNT(*) FROM production_orders_malaysia;
