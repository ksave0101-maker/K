# Full Backup Summary - 20260330

Backup completed at: 2026-03-30 19:14:50 KST

## Code Backup
- File: `backups/ksystem_code_full_backup_20260330_191225.tar.gz`
- Size: `11M`
- Scope: Full project snapshot excluding transient folders (`.git`, `node_modules`, `.next`) and previous backup archives/dumps.

## Database Backup
- File: `backups/ksystem_full_backup_20260330_191426.sql`
- Size: `1.2M`
- Database: `ksystem`
- Method: `mysqldump --single-transaction --routines --triggers --events`
- Note: Excluded view `vw_power_records_detail` due to known invalid-view/permission issue.

## Commit/Push Context
- Prepared for commit and push of current executive approval fixes.
