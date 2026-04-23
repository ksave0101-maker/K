-- Remove duplicate records from user_list table
-- This script identifies and removes duplicate entries based on email address
-- Keeping the record with the lowest userId (oldest record)

-- First, let's see what duplicates exist
SELECT email, COUNT(*) as count
FROM user_list 
GROUP BY email 
HAVING COUNT(*) > 1;

-- Remove duplicates based on email, keeping the record with smallest userId
DELETE t1 FROM user_list t1
INNER JOIN user_list t2 
WHERE t1.userId > t2.userId 
AND t1.email = t2.email;

-- Alternative: Remove duplicates based on userName, keeping the record with smallest userId
-- Uncomment the following if you want to remove duplicates by userName instead:
/*
DELETE t1 FROM user_list t1
INNER JOIN user_list t2 
WHERE t1.userId > t2.userId 
AND t1.userName = t2.userName;
*/

-- Verify the cleanup
SELECT COUNT(*) as total_records_after_cleanup FROM user_list;
SELECT email, COUNT(*) as remaining_count 
FROM user_list 
GROUP BY email 
HAVING COUNT(*) > 1;
