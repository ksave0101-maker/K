-- Add intern user to user_list table
-- This script adds a new intern user with appropriate permissions

-- First, check if intern user already exists
SELECT * FROM user_list WHERE userName = 'intern' OR name LIKE '%intern%';

-- Insert new intern user (adjust the details as needed)
INSERT INTO user_list (
  userId, 
  name, 
  name_th, 
  email, 
  site, 
  userName, 
  password, 
  create_datetime, 
  create_by, 
  typeID
) VALUES (
  (SELECT COALESCE(MAX(userId), 0) + 1 FROM user_list), -- Next available userId
  'Intern User', 
  'ผู้ใช้สหกิจ', 
  'intern@kenergy-save.com', 
  'Thailand', 
  'intern', 
  '$2b$10$example.hashed.password.here', -- Replace with proper bcrypt hash
  NOW(), 
  'administrator', 
  2 -- 2 = intern/basic user
);

-- Alternative: If you want to restore a specific intern user from backup
-- Uncomment and modify the following if you have specific user data:
/*
INSERT INTO user_list VALUES (
  16, -- userId
  'Intern Name', 
  'ชื่อสหกิจ', 
  'intern@email.com', 
  'Thailand', 
  'intern', 
  '$2b$10$hashed_password_here', 
  '2026-04-21 00:00:00', 
  'administrator', 
  1 -- typeID
);
*/

-- Verify the user was added
SELECT userId, name, email, userName, create_datetime, typeID 
FROM user_list 
WHERE userName = 'intern' OR name LIKE '%intern%';
