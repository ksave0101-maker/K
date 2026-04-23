-- Remove duplicate records from user_list table
-- Since all duplicate records are identical, we can use DISTINCT

-- First, backup current data (recommended)
CREATE TABLE user_list_backup_before_dedup AS SELECT * FROM user_list;

-- Check duplicates before cleanup
SELECT userId, COUNT(*) as duplicate_count
FROM user_list 
GROUP BY userId 
HAVING COUNT(*) > 1
ORDER BY userId;

-- Method 1: Safe approach - create new table with distinct records
CREATE TABLE user_list_temp AS
SELECT DISTINCT * FROM user_list;

-- Clear original table
TRUNCATE TABLE user_list;

-- Insert back distinct records
INSERT INTO user_list SELECT * FROM user_list_temp;

-- Drop temporary table
DROP TABLE user_list_temp;

-- Method 2: Alternative - delete duplicates keeping one record per userId
-- Uncomment if Method 1 doesn't work:
/*
DELETE t1 FROM user_list t1
INNER JOIN user_list t2 
WHERE t1.userId = t2.userId 
AND t1.create_datetime > t2.create_datetime;
*/

-- Verify cleanup - should show no duplicates
SELECT userId, COUNT(*) as count_after_cleanup
FROM user_list 
GROUP BY userId 
HAVING COUNT(*) > 1;

-- Show final result
SELECT COUNT(*) as total_users_after_cleanup FROM user_list;

SELECT userId, name, email, userName, create_datetime, typeID 
FROM user_list 
ORDER BY userId;

-- Optional: Drop backup table after verification
-- DROP TABLE user_list_backup_before_dedup;
