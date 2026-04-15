-- Fix calcID to be AUTO_INCREMENT primary key
-- This allows automatic ID generation when inserting new records

ALTER TABLE power_calculations
MODIFY COLUMN calcID INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY;
