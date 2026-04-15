# K-System Deployment Guide

## Architecture

```
Internet → Vercel (Static Frontend)
              ↓ HTTPS
         ngrok URL (Public Tunnel)
              ↓
    Node.js API Server (localhost:3001)
              ↓
         MySQL Database (local)
         InfluxDB (local)
         Grafana (local)
```

## Prerequisites

1. **GitHub Account** - Repository already set up
2. **Vercel Account** - Sign up at https://vercel.com
3. **ngrok Account** - Sign up at https://ngrok.com
4. **Local Services Running**:
   - Node.js API (port 3001)
   - MySQL (port 3307)
   - InfluxDB (port 8086)
   - Grafana (port 3000)

## Step 1: Setup ngrok Tunnel

### Install ngrok
```bash
# Download and install ngrok
# Visit: https://ngrok.com/download
```

### Start ngrok tunnel
```bash
# Start ngrok on port 3001 (Node.js API)
ngrok http 3001
```

### Get your ngrok URL
After starting ngrok, you'll see output like:
```
Forwarding  https://abc123.ngrok-free.app -> http://localhost:3001
```

**Save this URL** - you'll need it for Vercel environment variables.

### Keep ngrok running
- ngrok must stay running 24/7 for the system to work
- Consider using ngrok's paid plan for:
  - Static domain (no URL changes on restart)
  - Higher request limits
  - Better reliability

## Step 2: Deploy to Vercel

### 1. Connect GitHub Repository

1. Go to https://vercel.com
2. Click "New Project"
3. Import your GitHub repository: `pavinee23/test`
4. Select the `main` branch

### 2. Configure Build Settings

Vercel should auto-detect Next.js. Verify:
- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

### 3. Add Environment Variables

In Vercel project settings, add these environment variables:

#### Required Variables:
```
NEXT_PUBLIC_API_URL=https://your-ngrok-url.ngrok-free.app
API_URL=https://your-ngrok-url.ngrok-free.app
INFLUXDB_URL=http://localhost:8086
INFLUXDB_TOKEN=your-actual-token
INFLUXDB_ORG=your-org
INFLUXDB_BUCKET=power_monitoring
NEXT_PUBLIC_GRAFANA_URL=http://localhost:3000
NEXT_PUBLIC_GRAFANA_DASH_UID=all-power
NEXT_PUBLIC_GRAFANA_PANEL_ID=2
```

**Important**: Replace `https://your-ngrok-url.ngrok-free.app` with your actual ngrok URL.

### 4. Deploy

Click "Deploy" and wait for build to complete.

## Step 3: Test the Deployment

### Frontend URLs (Vercel):
- Homepage: `https://your-project.vercel.app`
- Sites: `https://your-project.vercel.app/sites`
- Thailand Admin: `https://your-project.vercel.app/Thailand/Admin-Login`
- Device Monitoring: `https://your-project.vercel.app/device-monitoring?device=Ksave02`
- Compare Monitoring: `https://your-project.vercel.app/monitor/Compare-Monitoring`

### API Endpoints (via ngrok → local):
- `/api/user/login` - User authentication
- `/api/influx/currents` - Real-time device data
- `/api/influx/device?id=xxx` - Device-specific data
- `/api/contact` - Contact form submission

## Step 4: Local API Server Setup

### Create .env.local file
```bash
cp .env.example .env.local
```

Edit `.env.local` with your actual values:
```env
MYSQL_HOST=localhost
MYSQL_PORT=3307
MYSQL_USER=root
MYSQL_PASSWORD=Zera2025data
MYSQL_DATABASE=user
MYSQL_CUSTOMER_DATABASE=customer
```

### Start the API Server
```bash
npm run dev
```

The API will run on `http://localhost:3001` and be accessible via ngrok.

## Step 5: Keep Services Running

### Services that must run 24/7:

1. **ngrok tunnel**:
```bash
ngrok http 3001
```

2. **Node.js API**:
```bash
npm run dev
# or for production:
npm run build && npm start
```

3. **MySQL** (Docker):
```bash
docker start mysql
```

4. **InfluxDB** (Docker):
```bash
docker start influxdb2
```

5. **Grafana** (Docker):
```bash
docker start grafana
```

## How It Works

### Request Flow:

1. **User visits Vercel URL**: `https://your-project.vercel.app/sites`
2. **Frontend loads** from Vercel's CDN (fast, global)
3. **Frontend makes API call**: `fetch('https://your-ngrok-url.ngrok-free.app/api/influx/currents')`
4. **ngrok tunnels request** to `http://localhost:3001/api/influx/currents`
5. **Node.js API processes request** and queries MySQL/InfluxDB
6. **Response flows back**: API → ngrok → Vercel → User

### Key Points:

- ✅ **Frontend (Vercel)**: Static files, fast CDN delivery
- ✅ **Backend (ngrok + local)**: Direct access to local databases
- ✅ **Security**: ngrok provides HTTPS automatically
- ✅ **Flexibility**: Can update local API without redeploying Vercel

## Production Considerations

### For production deployment, consider:

1. **Static ngrok domain** (paid plan):
   - `https://your-company.ngrok.app` (doesn't change)
   - No need to update Vercel env vars on restart

2. **PM2 for Node.js** (process manager):
```bash
npm install -g pm2
pm2 start npm --name "ksystem-api" -- start
pm2 save
pm2 startup
```

3. **ngrok as a service** (systemd):
```bash
# Create /etc/systemd/system/ngrok.service
[Unit]
Description=ngrok tunnel
After=network.target

[Service]
Type=simple
User=k-system
ExecStart=/usr/local/bin/ngrok http 3001
Restart=always

[Install]
WantedBy=multi-user.target
```

4. **Database backups**:
```bash
# Daily MySQL backup
docker exec mysql mysqldump -u root -pZera2025data --all-databases > backup.sql
```

5. **Monitoring**:
   - Set up uptime monitoring (UptimeRobot, etc.)
   - Monitor ngrok tunnel status
   - Monitor API response times

## Troubleshooting

### Frontend loads but no data:
- Check ngrok is running: `curl https://your-ngrok-url.ngrok-free.app/api/status`
- Check API server is running: `curl http://localhost:3001/api/status`
- Check Vercel env vars are correct

### ngrok tunnel disconnected:
- Restart ngrok: `ngrok http 3001`
- If URL changed, update Vercel env vars
- Consider ngrok paid plan for reliability

### API errors:
- Check MySQL is running: `docker ps | grep mysql`
- Check InfluxDB is running: `docker ps | grep influxdb`
- Check API logs: `npm run dev` output

### CORS errors:
- Verify `NEXT_PUBLIC_API_URL` in Vercel matches ngrok URL
- Check API is allowing Vercel domain

## Support

For issues or questions:
- GitHub Issues: https://github.com/pavinee23/test/issues
- Check logs in Vercel dashboard
- Check ngrok dashboard: https://dashboard.ngrok.com
