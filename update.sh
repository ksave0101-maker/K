#!/bin/bash
cd ~/K || exit
git pull origin main
for f in database_schemas/*.sql; do
  echo "Running $f"
  mysql -u ksystem -p'Ksave2025Admin' ksystem < "$f"
done
