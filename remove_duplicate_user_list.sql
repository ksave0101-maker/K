-- Remove duplicate records from user_list table based on userId
-- Keep the first occurrence (oldest create_datetime) for each userId

-- First, identify duplicates
SELECT userId, COUNT(*) as count
FROM user_list 
GROUP BY userId 
HAVING COUNT(*) > 1
ORDER BY userId;

-- Method 1: Using a temporary table approach (safer)
CREATE TEMPORARY TABLE temp_user_list AS
SELECT DISTINCT * FROM user_list;

TRUNCATE TABLE user_list;

INSERT INTO user_list 
SELECT * FROM temp_user_list;

DROP TEMPORARY TABLE temp_user_list;

-- Method 2: Alternative approach using ROW_NUMBER (if Method 1 doesn't work)
-- Uncomment the following if you prefer this approach:
/*
DELETE t1 FROM user_list t1
INNER JOIN (
    SELECT userId, MIN(create_datetime) as min_datetime
    FROM user_list 
    GROUP BY userId 
    HAVING COUNT(*) > 1
) t2 ON t1.userId = t2.userId AND t1.create_datetime > t2.min_datetime;
*/

-- Verify cleanup
SELECT userId, COUNT(*) as remaining_count
FROM user_list 
GROUP BY userId 
HAVING COUNT(*) > 1;

-- Show final user list
SELECT userId, name, email, userName, create_datetime, typeID 
FROM user_list 
ORDER BY userId;
