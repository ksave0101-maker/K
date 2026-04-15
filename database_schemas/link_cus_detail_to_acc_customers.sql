-- Link cus_detail and acc_customers tables with Foreign Key
-- Created: 2026-03-24
-- Purpose: Connect contact/inquiry table (cus_detail) with accounting customer master (acc_customers)

-- Step 1: Add foreign key column to cus_detail
ALTER TABLE cus_detail
ADD COLUMN acc_customer_id INT(11) NULL COMMENT 'Link to acc_customers table'
AFTER cusID;

-- Step 2: Add index on the foreign key column
ALTER TABLE cus_detail
ADD INDEX idx_acc_customer_id (acc_customer_id);

-- Step 3: Create foreign key constraint
ALTER TABLE cus_detail
ADD CONSTRAINT fk_cus_detail_acc_customer
FOREIGN KEY (acc_customer_id) REFERENCES acc_customers(id)
ON DELETE SET NULL
ON UPDATE CASCADE;

-- Step 4: Verify the changes
DESCRIBE cus_detail;

-- Step 5: Show foreign key constraints
SELECT
    CONSTRAINT_NAME,
    TABLE_NAME,
    COLUMN_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM information_schema.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = 'ksystem'
  AND TABLE_NAME = 'cus_detail'
  AND REFERENCED_TABLE_NAME IS NOT NULL;

-- Optional: Try to auto-link existing customers by matching email or phone
-- (Uncomment to run)
/*
UPDATE cus_detail cd
INNER JOIN acc_customers ac ON (
    cd.email = ac.email OR
    cd.phone = ac.phone
)
SET cd.acc_customer_id = ac.id
WHERE cd.acc_customer_id IS NULL
  AND (cd.email IS NOT NULL OR cd.phone IS NOT NULL);
*/

-- Check how many customers are linked
SELECT
    COUNT(*) as total_contacts,
    COUNT(acc_customer_id) as linked_to_accounting,
    COUNT(*) - COUNT(acc_customer_id) as not_linked
FROM cus_detail;
