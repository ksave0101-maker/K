-- Fix quotations table primary key and auto_increment
-- Created: 2026-03-26

-- Modify quoteID to be AUTO_INCREMENT and PRIMARY KEY
ALTER TABLE quotations
  MODIFY COLUMN quoteID INT NOT NULL AUTO_INCREMENT,
  ADD PRIMARY KEY (quoteID);
