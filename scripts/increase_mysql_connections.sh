#!/bin/bash
# Script to increase MySQL max_connections permanently
# Created: 2026-03-24

echo "================================================"
echo "  Increase MySQL max_connections to 500"
echo "================================================"
echo ""

# Backup original config
echo "1. Creating backup of 50-server.cnf..."
sudo cp /etc/mysql/mariadb.conf.d/50-server.cnf /etc/mysql/mariadb.conf.d/50-server.cnf.backup.$(date +%Y%m%d)

# Check if max_connections already exists
if grep -q "^max_connections" /etc/mysql/mariadb.conf.d/50-server.cnf; then
    echo "2. Updating existing max_connections setting..."
    sudo sed -i 's/^max_connections.*/max_connections        = 500/' /etc/mysql/mariadb.conf.d/50-server.cnf
elif grep -q "^#max_connections" /etc/mysql/mariadb.conf.d/50-server.cnf; then
    echo "2. Uncommenting and updating max_connections..."
    sudo sed -i 's/^#max_connections.*100/max_connections        = 500/' /etc/mysql/mariadb.conf.d/50-server.cnf
else
    echo "2. Adding max_connections setting..."
    sudo sed -i '/\[mysqld\]/a max_connections        = 500' /etc/mysql/mariadb.conf.d/50-server.cnf
fi

echo "3. Restarting MariaDB service..."
sudo systemctl restart mariadb

echo ""
echo "4. Verifying new setting..."
sleep 2
mysql -u ksystem -p'Ksave2025Admin' -e "SHOW VARIABLES LIKE 'max_connections';"

echo ""
echo "✅ Done! max_connections has been increased to 500"
echo "================================================"
