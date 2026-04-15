# Payment Voucher - Accounting Journal Integration

## Overview
Payment vouchers are now integrated with the accounting journal system (สมุดรายวันจ่าย - Cash Disbursements Journal) and chart of accounts (ผังบัญชี).

## Database Changes

### New Fields in `acc_payment_vouchers`

| Field | Type | Description |
|-------|------|-------------|
| `debit_account` | VARCHAR(20) | Chart of accounts code for debit side |
| `credit_account` | VARCHAR(20) | Chart of accounts code for credit side (bank/cash) |
| `entry_id` | INT(11) | Foreign Key to acc_journal_entries.id |

### Foreign Key Relationship

```sql
acc_payment_vouchers.entry_id -> acc_journal_entries.id
  ON DELETE SET NULL
  ON UPDATE CASCADE
```

## Accounting Flow

### When Making a Payment

```
1. Create Payment Voucher (Draft)
   ├─ Doc No: PV-ddmmyyyy-0001
   ├─ Amount: Amount to pay
   ├─ Party: Supplier/Branch name
   └─ Status: draft

2. Select Accounting Codes
   ├─ Debit Account: Where money goes
   │   └─ 2100: Accounts Payable (เจ้าหนี้การค้า)
   │   └─ 2110: Other Payables (เจ้าหนี้อื่น)
   │   └─ 5xxx: Expenses (ค่าใช้จ่าย)
   └─ Credit Account: Where money comes from
       └─ 1100: Cash (เงินสด)
       └─ 1110: Bank Deposit (เงินฝากธนาคาร)

3. Post Payment Voucher
   └─ Status changes: draft -> posted

4. Automatic Journal Entry Creation
   ├─ Creates acc_journal_entries record
   │   ├─ doc_no: From payment voucher
   │   ├─ doc_date: Payment date
   │   └─ ref_type: 'payment_voucher'
   └─ Creates acc_journal_lines records
       ├─ Line 1 (Debit):
       │   ├─ acc_code: debit_account
       │   ├─ debit: amount
       │   └─ credit: 0
       └─ Line 2 (Credit):
           ├─ acc_code: credit_account
           ├─ debit: 0
           └─ credit: amount
```

## Common Account Codes for Payments

### Debit Accounts (Where money goes)
| Code | Name (TH) | Name (EN) | Type |
|------|-----------|-----------|------|
| 2100 | เจ้าหนี้การค้า | Accounts Payable | Liability |
| 2110 | เจ้าหนี้อื่น | Other Payables | Liability |
| 2111-00 | เจ้าหนี้การค้าในประเทศ | Domestic Trade Payables | Liability |
| 2121-00 | ค่าใช้จ่ายค้างจ่าย | Accrued Expenses | Liability |
| 5000-00 | ค่าใช้จ่าย | Expenses | Expense |

### Credit Accounts (Where money comes from)
| Code | Name (TH) | Name (EN) | Type |
|------|-----------|-----------|------|
| 1100 | เงินสด | Cash | Asset |
| 1110 | เงินฝากธนาคาร | Bank Deposit | Asset |
| 1110-01 | เงินสดย่อย | Petty Cash | Asset |
| 1111-00 | เงินฝากธนาคาร | Bank Deposits | Asset |

## Example: Korea Invoice Payment

### Transaction Details
```
Date: 26/03/2026
PV No: PV-26032026-0001
Amount: ฿1,425,925.90
From Korea Invoice: KR-INV-20260301-0001
Branch: K Energy Save (Thailand) Co., Ltd.
```

### Journal Entry
```
Dr. เจ้าหนี้อื่น (2110)         ฿1,425,925.90
    Cr. เงินฝากธนาคาร (1110)              ฿1,425,925.90
    (ชำระเงินบิลจากเกาหลี KR-INV-20260301-0001)
```

### Database Records

**acc_payment_vouchers**
```sql
id: 1
doc_no: PV-26032026-0001
amount: 1425925.90
korea_invoice_id: KR-INV-20260301-0001
debit_account: 2110
credit_account: 1110
status: posted
entry_id: 1
```

**acc_journal_entries**
```sql
id: 1
doc_no: PV-26032026-0001
doc_date: 2026-03-26
description: Korea HQ Invoice: KR-INV-20260301-0001
status: posted
ref_type: payment_voucher
ref_id: 1
```

**acc_journal_lines**
```sql
Line 1:
  entry_id: 1
  acc_code: 2110
  debit: 1425925.90
  credit: 0.00

Line 2:
  entry_id: 1
  acc_code: 1110
  debit: 0.00
  credit: 1425925.90
```

## Reports & Cash Disbursements Journal

### Cash Disbursements Journal (สมุดรายวันจ่าย)
Query to get all payments:
```sql
SELECT
  pv.doc_no,
  pv.doc_date,
  pv.party_name,
  pv.description,
  pv.debit_account,
  pv.credit_account,
  pv.amount,
  pv.method,
  je.id as journal_entry_id
FROM acc_payment_vouchers pv
LEFT JOIN acc_journal_entries je ON pv.entry_id = je.id
WHERE pv.voucher_type = 'pay'
  AND pv.status = 'posted'
ORDER BY pv.doc_date DESC, pv.doc_no DESC
```

### Journal Entry Report
```sql
SELECT
  je.doc_no,
  je.doc_date,
  je.description,
  jl.acc_code,
  coa.name_th,
  jl.debit,
  jl.credit
FROM acc_journal_entries je
JOIN acc_journal_lines jl ON je.id = jl.entry_id
JOIN acc_chart_of_accounts coa ON jl.acc_code = coa.code
WHERE je.ref_type = 'payment_voucher'
ORDER BY je.doc_date DESC, je.id, jl.id
```

## Next Steps

1. **Update Payment Form**
   - Add dropdown for debit_account selection
   - Add dropdown for credit_account selection
   - Default values based on payment type

2. **Implement Auto-Posting**
   - Create journal entry when status changes to 'posted'
   - Populate journal_entries and journal_lines tables
   - Set entry_id in payment voucher

3. **Create Reports**
   - Cash Disbursements Journal report
   - Payment by Account Code report
   - Korea Invoice Payment report

## Files
- Migration SQL: [integrate_payment_with_journal.sql](integrate_payment_with_journal.sql)
- Migration Script: [../scripts/migrate_payment_journal_integration.ts](../scripts/migrate_payment_journal_integration.ts)
