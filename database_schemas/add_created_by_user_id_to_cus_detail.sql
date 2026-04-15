-- Add created_by_user_id to cus_detail for proper user tracking
-- Created: 2026-03-24

-- Step 1: Add column for user ID reference
ALTER TABLE cus_detail
ADD COLUMN created_by_user_id INT(11) NULL COMMENT 'FK to user_list.userId'
AFTER created_by;

-- Step 2: Add index
ALTER TABLE cus_detail
ADD INDEX idx_created_by_user_id (created_by_user_id);

-- Step 3: Add foreign key constraint
ALTER TABLE cus_detail
ADD CONSTRAINT fk_cus_detail_created_by_user
FOREIGN KEY (created_by_user_id) REFERENCES user_list(userId)
ON DELETE SET NULL
ON UPDATE CASCADE;

-- Step 4: Try to map existing created_by text to users (best effort)
-- Note: "thailand admin" doesn't match any user, so we'll leave it NULL
-- You can manually update these later

-- Optional: Map "website_contact_form" to a system user if needed
-- UPDATE cus_detail SET created_by_user_id = 1 WHERE created_by = 'website_contact_form';

-- Step 5: Verify
DESCRIBE cus_detail;

-- Step 6: Show which records need manual mapping
SELECT
    created_by,
    COUNT(*) as count,
    GROUP_CONCAT(cusID) as customer_ids
FROM cus_detail
WHERE created_by_user_id IS NULL
GROUP BY created_by;
