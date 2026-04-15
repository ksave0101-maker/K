-- Add new user: Accountant84
-- Created: 2026-03-24

INSERT INTO user_list (userId, userName, password, name, email, typeID, site, create_by)
VALUES (14, 'Accountant84', '124884', 'kattarin sukakate', 'kattarin30122526@gmail.com', 6, 'Thailand', 'thailand admin');

-- Verify the user was created
SELECT userId, userName, name, email, typeID, site, create_datetime
FROM user_list
WHERE userId = 14;
