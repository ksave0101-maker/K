# Quick Start Guide - Deploy to Vercel

## 🎯 Quick Steps

### 1. Start ngrok (on your local machine)
```bash
# Install ngrok first: https://ngrok.com/download
ngrok http 3001
```

**Copy the HTTPS URL** (e.g., `https://abc123.ngrok-free.app`)

### 2. Deploy to Vercel

**Option A: Via Vercel Dashboard**
1. Go to https://vercel.com/new
2. Import your GitHub repo: `pavinee23/test`
3. Add environment variable:
   - `NEXT_PUBLIC_API_URL` = your ngrok URL
   - `API_URL` = your ngrok URL
4. Click Deploy

**Option B: Via Vercel CLI**
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

### 3. Start Local Services
```bash
# Option 1: Use the startup script
./start-all-services.sh

# Option 2: Manual start
docker start mysql influxdb2 grafana
npm run dev
```

## ✅ Verify Deployment

Visit your Vercel URL:
- `https://your-project.vercel.app/sites`
- `https://your-project.vercel.app/Thailand/Admin-Login`

## 📊 Architecture

```
User Browser
     ↓
Vercel (Frontend)
     ↓ HTTPS
ngrok URL
     ↓
localhost:3001 (API)
     ↓
MySQL/InfluxDB (Local)
```

## 🔧 Update ngrok URL

When ngrok restarts with new URL:
```bash
# Update in Vercel dashboard:
vercel env add NEXT_PUBLIC_API_URL
vercel env add API_URL

# Redeploy:
vercel --prod
```

## 💡 Pro Tips

1. **Static ngrok domain** (paid): URL never changes
2. **Keep services running**: Use PM2 or systemd
3. **Monitor uptime**: Use UptimeRobot or similar

Read full guide: `DEPLOYMENT-GUIDE.md`
