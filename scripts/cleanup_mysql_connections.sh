#!/bin/bash
# Script to cleanup stuck MySQL connections
# Run this if you encounter "Too many connections" error
# Created: 2026-03-24

echo "================================================"
echo "  MySQL Connection Cleanup Tool"
echo "================================================"
echo ""

echo "📊 Current MySQL status:"
mysql -u ksystem -p'Ksave2025Admin' -e "SHOW STATUS LIKE 'Threads_connected';" 2>&1
mysql -u ksystem -p'Ksave2025Admin' -e "SHOW STATUS LIKE 'Max_used_connections';" 2>&1
mysql -u ksystem -p'Ksave2025Admin' -e "SHOW VARIABLES LIKE 'max_connections';" 2>&1

echo ""
echo "🔍 Active connections by user:"
mysql -u ksystem -p'Ksave2025Admin' -e "SELECT user, host, COUNT(*) as connections FROM information_schema.processlist GROUP BY user, host ORDER BY connections DESC;" 2>&1

echo ""
echo "⏱️  Long-running queries (>60 seconds):"
mysql -u ksystem -p'Ksave2025Admin' -e "SELECT id, user, host, db, command, time, state, LEFT(info, 50) as query FROM information_schema.processlist WHERE time > 60 AND command != 'Sleep' ORDER BY time DESC;" 2>&1

echo ""
echo "💤 Sleeping connections:"
mysql -u ksystem -p'Ksave2025Admin' -e "SELECT user, host, COUNT(*) as count FROM information_schema.processlist WHERE command = 'Sleep' GROUP BY user, host ORDER BY count DESC;" 2>&1

echo ""
read -p "Do you want to kill sleeping connections older than 300 seconds? (y/N): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🔪 Killing old sleeping connections..."
    mysql -u ksystem -p'Ksave2025Admin' -e "
    SELECT CONCAT('KILL ', id, ';')
    FROM information_schema.processlist
    WHERE command = 'Sleep'
    AND time > 300
    AND user != 'system user'
    INTO OUTFILE '/tmp/kill_sleep.sql';
    " 2>&1 || echo "Note: May fail if file exists, continuing..."

    if [ -f /tmp/kill_sleep.sql ]; then
        mysql -u ksystem -p'Ksave2025Admin' < /tmp/kill_sleep.sql 2>&1
        rm /tmp/kill_sleep.sql
        echo "✅ Killed sleeping connections"
    else
        echo "ℹ️  No connections to kill or unable to create file"
    fi
fi

echo ""
echo "================================================"
echo "✅ Cleanup complete!"
echo "================================================"
