-- Fix Paranya Jantraporn (userId=5): change userName to 'Paranya' and correct typeID to 6 (Branch Manager)
-- Previously: userName='Branch-Manager', typeID=10 (marketing)
-- After:      userName='Paranya',         typeID=6 (Branch Manager)
UPDATE user_list
SET userName = 'Paranya',
    typeID   = 6
WHERE userId = 5;
