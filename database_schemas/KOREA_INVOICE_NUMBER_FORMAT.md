# Korea Invoice Number Format

## Format Structure

```
KR-INV-yyyymmdd-0001
│   │   │       │
│   │   │       └─── Running Number (4 digits, resets daily)
│   │   └─────────── Date (yyyymmdd format)
│   └─────────────── Invoice Type
└─────────────────── Country Code (Korea)
```

## Examples

```
Date: March 26, 2026
  - KR-INV-20260326-0001  (First invoice of the day)
  - KR-INV-20260326-0002  (Second invoice)
  - KR-INV-20260326-0003  (Third invoice)

Date: March 27, 2026
  - KR-INV-20260327-0001  (First invoice of new day)
  - KR-INV-20260327-0002  (Second invoice)
```

## Components

| Component | Description | Format | Example |
|-----------|-------------|--------|---------|
| Prefix | Country Code | KR | KR |
| Type | Invoice Type | INV | INV |
| Date | Issue Date | yyyymmdd | 20260326 |
| Sequence | Daily Running Number | 0001-9999 | 0001 |

## Generation Logic

```javascript
// Get current date
const today = new Date()
const yyyy = today.getFullYear()
const mm = String(today.getMonth() + 1).padStart(2, '0')
const dd = String(today.getDate()).padStart(2, '0')
const dateStr = `${yyyy}${mm}${dd}`

// Get count for today
const prefix = `KR-INV-${dateStr}`
const count = existingInvoices.filter(inv =>
  inv.invoiceNumber.startsWith(prefix)
).length

// Generate new number
const newNumber = `${prefix}-${String(count + 1).padStart(4, '0')}`
// Result: KR-INV-20260326-0001
```

## Benefits

1. **Date Identification**: Invoice date embedded in number
2. **Daily Reset**: Running number resets each day
3. **Unique**: Guaranteed unique within the day
4. **Sortable**: Natural chronological sorting
5. **Searchable**: Easy to find invoices by date

## Migration

Old format: `KR-2026-0001`
New format: `KR-INV-20260301-0001`

Migration completed: 2026-03-26

## Current Invoices

| Old Number | New Number | Issue Date |
|------------|------------|------------|
| KR-2026-0001 | KR-INV-20260301-0001 | 2026-03-01 |
| KR-2026-0002 | KR-INV-20260310-0001 | 2026-03-10 |
| KR-2026-0003 | KR-INV-20260215-0001 | 2026-02-15 |
| KR-2026-0004 | KR-INV-20260320-0001 | 2026-03-20 |

## Implementation

For new invoices, use the generation logic above to create invoice numbers in the new format.
