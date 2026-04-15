-- Add sales order FK to production_orders table
-- Created: 2026-03-26

-- Add sales_orderID column
ALTER TABLE production_orders
  ADD COLUMN IF NOT EXISTS sales_orderID INT NULL AFTER pdoDate,
  ADD INDEX idx_sales_orderID (sales_orderID);

-- Add foreign key constraint
ALTER TABLE production_orders
  ADD CONSTRAINT fk_production_orders_sales_order
    FOREIGN KEY (sales_orderID) REFERENCES sales_orders(orderID)
    ON DELETE SET NULL
    ON UPDATE CASCADE;
