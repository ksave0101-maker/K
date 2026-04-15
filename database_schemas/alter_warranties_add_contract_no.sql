-- Add contract_no field to warranties table
-- Migration: 2026-03-19

USE ksystem;

-- Add contract_no column
ALTER TABLE `warranties`
ADD COLUMN `contract_no` varchar(64) DEFAULT NULL
COMMENT 'Reference to contract number'
AFTER `wtDate`;

-- Add index for faster lookup
ALTER TABLE `warranties`
ADD INDEX `idx_contract_no` (`contract_no`);

-- Verify the change
DESCRIBE warranties;

SELECT 'ALTER TABLE warranties - contract_no field added successfully!' AS result;
