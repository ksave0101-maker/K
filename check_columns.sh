#!/bin/bash

echo "=== Columns in INSERT statement ==="
grep -A 20 "INSERT INTO power_calculations" /home/ksystem/K/app/api/power-calculations/route.ts | \
  grep -v "INSERT\|VALUES\|query" | \
  tr ',' '\n' | \
  sed 's/^[ \t]*//' | \
  sed 's/[ \t]*$//' | \
  grep -v '^$' | \
  sort > /tmp/insert_cols.txt

cat /tmp/insert_cols.txt
wc -l /tmp/insert_cols.txt

echo ""
echo "=== Columns in database (excluding auto fields) ==="
mysql -u ksystem -p'Ksave2025Admin' ksystem -e "DESCRIBE power_calculations;" | \
  awk '{print $1}' | \
  tail -n +2 | \
  grep -v "calcID\|created_at\|updated_at" | \
  sort > /tmp/db_cols.txt

cat /tmp/db_cols.txt
wc -l /tmp/db_cols.txt

echo ""
echo "=== Columns in DB but NOT in INSERT ==="
comm -13 /tmp/insert_cols.txt /tmp/db_cols.txt

echo ""
echo "=== Columns in INSERT but NOT in DB ==="
comm -23 /tmp/insert_cols.txt /tmp/db_cols.txt
