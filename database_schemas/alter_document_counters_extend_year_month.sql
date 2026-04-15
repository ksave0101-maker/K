-- Extend document_counters.year_month to support YYYYMMDD format
-- Migration: 2026-03-19
-- Purpose: Support daily reset for Warranty numbers (WT-TH-YYYYMMDD-####)

USE ksystem;

-- Extend year_month from varchar(6) to varchar(8)
ALTER TABLE `document_counters`
MODIFY `year_month` varchar(8) NOT NULL
COMMENT 'Format: YYYYMM for most docs, YYYYMMDD for Warranty';

-- Verify
DESCRIBE `document_counters`;

SELECT '✅ document_counters.year_month extended to varchar(8)' AS result;
