#!/bin/bash

# Backup old files
cp departmentGoalsData.ts departmentGoalsData_backup.ts 2>/dev/null
cp departmentMeetingsData.ts departmentMeetingsData_backup.ts 2>/dev/null  
cp evaluationData.ts evaluationData_backup.ts 2>/dev/null

# Define the correct department order (these already exist in branchesData)
CORRECT_DEPTS=(
  "Executive"
  "HR"
  "Production"
  "International Market"
  "Domestic Market"
  "Logistics"
  "Quality Control"
  "After-Sales"
  "Maintenance"
  "R&D"
)

echo "Files backed up. Use *_backup.ts to restore if needed."
echo "Done!"
