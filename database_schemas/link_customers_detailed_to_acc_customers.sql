-- Link customers_detailed to acc_customers
-- Created: 2026-03-24
-- Purpose: Connect sales tracking customers with accounting customers

-- Add FK column to customers_detailed
ALTER TABLE customers_detailed
ADD COLUMN acc_customer_id INT(11) NULL COMMENT 'Link to accounting customer' AFTER customerID;

-- Add Foreign Key constraint
ALTER TABLE customers_detailed
ADD CONSTRAINT fk_customers_detailed_acc_customer
FOREIGN KEY (acc_customer_id) REFERENCES acc_customers(id)
ON DELETE SET NULL
ON UPDATE CASCADE;

-- Add index for performance
ALTER TABLE customers_detailed
ADD INDEX idx_acc_customer_id (acc_customer_id);

-- Link existing customers by matching company names
UPDATE customers_detailed cd
INNER JOIN acc_customers ac ON (
  cd.customerCompanyName COLLATE utf8mb4_unicode_ci LIKE CONCAT('%', ac.name_th COLLATE utf8mb4_unicode_ci, '%')
  OR ac.name_th COLLATE utf8mb4_unicode_ci LIKE CONCAT('%', cd.customerCompanyName COLLATE utf8mb4_unicode_ci, '%')
)
SET cd.acc_customer_id = ac.id;

-- Show linked results
SELECT
  cd.customerID,
  cd.customerCompanyName,
  cd.acc_customer_id,
  ac.code as acc_code,
  ac.name_th as acc_name
FROM customers_detailed cd
LEFT JOIN acc_customers ac ON cd.acc_customer_id = ac.id
ORDER BY cd.customerID;
