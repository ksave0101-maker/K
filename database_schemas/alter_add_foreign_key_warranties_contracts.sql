-- Add Foreign Key relationship between warranties and contracts
-- Migration: 2026-03-19

USE ksystem;

-- ============================================
-- Step 1: Ensure contracts.contractNo is UNIQUE
-- ============================================

-- Check for duplicate contractNo values first
SELECT
    'Checking for duplicate contractNo...' AS status,
    COUNT(*) - COUNT(DISTINCT contractNo) AS duplicates
FROM contracts;

-- Add UNIQUE constraint to contracts.contractNo
-- Skip if constraint already exists
SET @sql = (
    SELECT IF(
        COUNT(*) = 0,
        'ALTER TABLE contracts ADD UNIQUE KEY uk_contractNo (contractNo)',
        'SELECT "UNIQUE constraint already exists on contracts.contractNo" AS info'
    )
    FROM information_schema.statistics
    WHERE table_schema = 'ksystem'
      AND table_name = 'contracts'
      AND column_name = 'contractNo'
      AND non_unique = 0
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ============================================
-- Step 2: Add Foreign Key warranties → contracts
-- ============================================

-- Check if foreign key already exists
SET @fk_exists = (
    SELECT COUNT(*)
    FROM information_schema.KEY_COLUMN_USAGE
    WHERE TABLE_SCHEMA = 'ksystem'
      AND TABLE_NAME = 'warranties'
      AND CONSTRAINT_NAME = 'fk_warranty_contract'
);

-- Add Foreign Key if not exists
SET @sql_fk = IF(
    @fk_exists = 0,
    'ALTER TABLE warranties
     ADD CONSTRAINT fk_warranty_contract
     FOREIGN KEY (contract_no)
     REFERENCES contracts (contractNo)
     ON DELETE SET NULL
     ON UPDATE CASCADE',
    'SELECT "Foreign Key already exists" AS info'
);

PREPARE stmt_fk FROM @sql_fk;
EXECUTE stmt_fk;
DEALLOCATE PREPARE stmt_fk;

-- ============================================
-- Verification
-- ============================================

-- Show UNIQUE constraint on contracts
SELECT
    'contracts.contractNo' AS table_column,
    IF(COUNT(*) > 0, '✅ UNIQUE', '❌ NOT UNIQUE') AS status
FROM information_schema.statistics
WHERE table_schema = 'ksystem'
  AND table_name = 'contracts'
  AND column_name = 'contractNo'
  AND non_unique = 0;

-- Show Foreign Key constraint
SELECT
    TABLE_NAME,
    COLUMN_NAME,
    CONSTRAINT_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME,
    '✅ EXISTS' AS status
FROM information_schema.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = 'ksystem'
  AND TABLE_NAME = 'warranties'
  AND CONSTRAINT_NAME = 'fk_warranty_contract';

SELECT '✅ Migration completed!' AS result;
