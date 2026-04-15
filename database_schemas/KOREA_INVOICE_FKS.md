# Korea Invoice Foreign Key Relationships

## Overview
Foreign key relationships for Korea headquarters invoices system to maintain data integrity and enable proper tracking of invoices, customers, contracts, and payments.

## Completed Foreign Keys

### 1. Invoice Items → Invoices
```sql
kr_hr_invoice_items.invoiceId -> kr_hr_invoices.id
  ON DELETE CASCADE
  ON UPDATE CASCADE
```
**Purpose**: Links invoice line items to their parent invoice. When an invoice is deleted, all its items are automatically deleted.

### 2. Invoices → Customers
```sql
kr_hr_invoices.customer_id -> kr_customers.id
  ON DELETE SET NULL
  ON UPDATE CASCADE
```
**Purpose**: Links invoices to customer records in the Korea customer database. If a customer is deleted, the invoice remains but customer_id is set to NULL (preserves the customer name in the `customer` text field).

### 3. Payment Vouchers (Accounting) → Invoices
```sql
acc_payment_vouchers.korea_invoice_id -> kr_hr_invoices.id
  ON DELETE SET NULL
  ON UPDATE CASCADE
```
**Purpose**: Tracks which payment vouchers are associated with Korea invoices. Enables payment tracking and reconciliation.

### 4. Payment Vouchers (General) → Invoices
```sql
payment_vouchers.korea_invoice_id -> kr_hr_invoices.id
  ON DELETE SET NULL
  ON UPDATE CASCADE
```
**Purpose**: Links general payment vouchers to Korea invoices for payment tracking.

## Additional Fields (No FK Constraint)

### Contract References
- **Field**: `kr_hr_invoices.contract_id` (INT)
- **Field**: `kr_hr_invoices.contract_type` (ENUM: 'domestic', 'international')
- **Note**: No FK constraint due to polymorphic relationship (can reference either `kr_domestic_contracts` or `kr_int_contracts`)
- **Usage**: Application logic must validate contract_id based on contract_type

## Data Integrity Benefits

1. **Referential Integrity**: Ensures that related records exist
2. **Cascade Deletes**: Automatically cleans up child records when parent is deleted
3. **Payment Tracking**: Links invoices to payment vouchers for accurate payment status
4. **Customer Management**: Maintains relationship between invoices and customer records
5. **Data Consistency**: Prevents orphaned records and invalid references

## Schema Diagram

```
kr_customers
    ↓ (1:N)
kr_hr_invoices ← acc_payment_vouchers (korea_invoice_id)
    ↓ (1:N)    ← payment_vouchers (korea_invoice_id)
kr_hr_invoice_items

Note: contract_id references kr_domestic_contracts OR kr_int_contracts
      based on contract_type (managed by application logic)
```

## Migration Scripts

1. **Initial FK**: [scripts/migrate_kr_invoice_fks.ts](../scripts/migrate_kr_invoice_fks.ts)
2. **Extended FKs**: [scripts/migrate_kr_invoice_extended_fks.ts](../scripts/migrate_kr_invoice_extended_fks.ts)
3. **SQL Schema**: [add_kr_invoice_fks.sql](add_kr_invoice_fks.sql)
4. **Extended SQL**: [add_kr_invoice_extended_fks.sql](add_kr_invoice_extended_fks.sql)

## Implementation Date
2026-03-26
