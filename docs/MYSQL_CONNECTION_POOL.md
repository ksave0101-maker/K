# MySQL Connection Pool Configuration

## Overview
The application uses a connection pool to manage MySQL database connections efficiently. Proper configuration prevents "Too many connections" errors.

## Configuration

### Environment Variables

You can configure the connection pool using these environment variables in `.env.local`:

```bash
# MySQL Connection Settings
MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306
MYSQL_DATABASE=ksystem
MYSQL_USER=ksystem
MYSQL_PASSWORD=Ksave2025Admin

# Connection Pool Settings
MYSQL_CONNECTION_LIMIT=10    # Maximum number of connections (default: 10)
MYSQL_QUEUE_LIMIT=50         # Maximum queued requests (default: 50)
```

### Default Values

- **Connection Limit**: 10 connections
- **Queue Limit**: 50 queued requests
- **Connect Timeout**: 10 seconds
- **Keep Alive**: Enabled

## Monitoring

### Health Check Endpoint

Check connection pool status:
```bash
curl http://localhost:3001/api/health
```

Response includes:
- Database connectivity status
- Response time
- Active/free connections
- Queue status
- Usage percentage

### Logs

The application logs connection pool warnings when usage exceeds 80%:
```
[MySQL Pool] High connection usage: 9/10 active, 1 free, 0 queued
```

## Troubleshooting

### "Too many connections" Error

**Causes:**
1. Connection pool limit too low
2. Connections not being released properly
3. Too many concurrent requests
4. MySQL server max_connections too low

**Solutions:**

1. **Increase connection pool limit** (via environment variable):
   ```bash
   MYSQL_CONNECTION_LIMIT=20
   ```

2. **Check MySQL max_connections**:
   ```bash
   mysql -u ksystem -pKsave2025Admin -e "SHOW VARIABLES LIKE 'max_connections';"
   ```

3. **Monitor pool usage**:
   ```bash
   curl http://localhost:3001/api/health
   ```

4. **Restart the application** to release stuck connections:
   ```bash
   pkill -f "next dev"
   npm run dev
   ```

5. **Check for connection leaks** - ensure all API routes use the `query()` function from `lib/mysql.ts` which handles connection cleanup automatically

## Best Practices

1. **Always use the `query()` function** - It handles connection acquisition and release automatically
2. **Don't create direct connections** - Use the pool through the query function
3. **Set appropriate limits** - Balance between performance and resource usage
4. **Monitor regularly** - Check the health endpoint periodically
5. **Tune based on load** - Increase limits if you see high queue depths

## Connection Pool Formula

A good starting point for connection pool size:

```
connections = (core_count * 2) + effective_spindle_count
```

For most web applications:
- Minimum: 5 connections
- Recommended: 10-20 connections
- High traffic: 20-50 connections

**Note**: MySQL default max_connections is 151. Ensure your pool limit doesn't exceed this value.

## MySQL Server Configuration

To increase MySQL max_connections (if needed), add to `/etc/mysql/my.cnf`:

```ini
[mysqld]
max_connections = 200
```

Then restart MySQL:
```bash
sudo systemctl restart mysql
```

## Monitoring Commands

```bash
# Check current MySQL connections
mysql -u ksystem -pKsave2025Admin -e "SHOW PROCESSLIST;"

# Count active connections
mysql -u ksystem -pKsave2025Admin -e "SHOW PROCESSLIST;" | wc -l

# Check MySQL connection limit
mysql -u ksystem -pKsave2025Admin -e "SHOW VARIABLES LIKE 'max_connections';"

# Application health check
curl http://localhost:3001/api/health | jq
```
