-- Increase MySQL max_connections to prevent "Too many connections" error
-- Created: 2026-03-24

-- Check current max_connections
SHOW VARIABLES LIKE 'max_connections';

-- Increase max_connections (run as root or with SUPER privilege)
-- SET GLOBAL max_connections = 500;

-- To make it permanent, add this to /etc/mysql/mariadb.conf.d/50-server.cnf:
-- [mysqld]
-- max_connections = 500
