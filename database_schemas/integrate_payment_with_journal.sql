-- Integrate Payment Vouchers with Accounting Journal
-- Created: 2026-03-26

-- 1. Add Foreign Key from payment vouchers to journal entries
ALTER TABLE acc_payment_vouchers
  ADD CONSTRAINT fk_payment_vouchers_journal_entry
    FOREIGN KEY (entry_id)
    REFERENCES acc_journal_entries(id)
    ON DELETE SET NULL
    ON UPDATE CASCADE;

-- 2. Add index for better performance
ALTER TABLE acc_payment_vouchers
  ADD INDEX idx_entry_id (entry_id);

-- 3. Add accounting codes to payment vouchers for mapping
ALTER TABLE acc_payment_vouchers
  ADD COLUMN debit_account VARCHAR(20) NULL COMMENT 'Chart of accounts code for debit side',
  ADD COLUMN credit_account VARCHAR(20) NULL COMMENT 'Chart of accounts code for credit side (bank/cash)';

-- Common mappings for payment vouchers:
-- Debit Account: Expense or Accounts Payable (2100, 2110, 5xxx)
-- Credit Account: Cash (1100) or Bank (1110)

-- 4. Add indexes for account codes
ALTER TABLE acc_payment_vouchers
  ADD INDEX idx_debit_account (debit_account),
  ADD INDEX idx_credit_account (credit_account);
