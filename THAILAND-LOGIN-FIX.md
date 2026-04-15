# Thailand Admin Login Fix - Error Resolution

## Problem
When accessing `https://k-energy.ngrok.app/Thailand/Admin-Login`, users encountered:
```
An error occurred during login. Please try again.
```

## Root Cause
The Vercel deployment was attempting direct MySQL connections to `127.0.0.1:3306` from a remote server, which is not possible. Vercel cannot access localhost connections.

## Solution Applied

### 1. **Enable MySQL Proxy** (APPLIED ✅)
Changed `.env.production`:
```diff
- USE_MYSQL_PROXY=false
+ USE_MYSQL_PROXY=true
```

This routes authentication through the internal `/api/auth/mysql-proxy` endpoint instead of direct MySQL connections.

### 2. **Deployment Steps**

#### Option A: Redeploy to Vercel
```bash
# Commit changes
git add .env.production
git commit -m "Fix: Enable MySQL proxy for Vercel deployment"

# Push to trigger Vercel deployment
git push origin main
```

#### Option B: Manual Environment Variable Update
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add/Update:
   - `USE_MYSQL_PROXY` = `true`
   - Ensure `NEXT_PUBLIC_API_URL` = `https://k-energy.ngrok.app`

### 3. **Verify the Fix**
After deployment:
1. Try logging in at `https://k-energy.ngrok.app/Thailand/Admin-Login`
2. Check Vercel Function Logs for any errors
3. Verify MySQL database is running and accessible

## Database Requirements

Ensure your MySQL database has:
- Table: `user_list` with columns: `userId`, `userName`, `name`, `email`, `site`, `password`, `typeID`
- Table: `cus_type` with columns: `typeID`, `departmentID`
- Table: `U_log_login` for login logging

## Troubleshooting

### If login still fails after applying the fix:

1. **Check Vercel Logs**
   ```bash
   vercel logs --tail
   ```

2. **Verify MySQL Connection**
   - Ensure MySQL is running
   - Check credentials in environment variables
   - Test connection: `mysql -h 127.0.0.1 -u ksystem -p ksystem`

3. **Check User Credentials**
   ```sql
   SELECT userId, userName, site FROM user_list WHERE userName = 'your_username' LIMIT 1;
   ```

4. **Enable Debug Mode**
   - Set `NODE_ENV=development` in environment variables
   - Check browser console and Vercel logs for detailed error messages

## HTTP API Proxy Endpoints

The MySQL proxy provides these authentication endpoints:
- **Primary**: `/api/user/login` - Uses proxy if `USE_MYSQL_PROXY=true`
- **Proxy**: `/api/auth/mysql-proxy` - Direct proxy endpoint
- **Admin**: `/api/admin/login` - Admin-specific login

## Architecture Notes

- **Direct Connection** (`USE_MYSQL_PROXY=false`): 
  - Only works for local/on-premise deployments
  - Cannot be used on Vercel

- **Proxy Connection** (`USE_MYSQL_PROXY=true`):
  - Works on Vercel and remote deployments
  - Routes through Next.js API handler
  - More reliable for serverless environments

## Configuration Files Updated

- ✅ `/home/pavinee/K/.env.production` - `USE_MYSQL_PROXY` changed to `true`
- ✅ `/home/pavinee/K/app/api/user/login/route.ts` - Enhanced error logging

## Related Endpoints

- Thailand Admin Login: `/Thailand/Admin-Login`
- Korea Login: `/login/[department]`
- Customer Login: `/customer-dashboard-login`
