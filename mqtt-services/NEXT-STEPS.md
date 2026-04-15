# 📋 Next Steps - Monitor Dashboard Setup

## ✅ Completed

You now have:
- ✅ MQTT Listener (`pg46_meter_listener.py`) - Receives PG46 meter data
- ✅ MySQL Schema (`meter_data` table) - Stores readings
- ✅ API Endpoint (`/api/meter-data`) - Retrieves data
- ✅ React Component (`MeterDataDisplay`) - Displays data beautifully
- ✅ Complete Documentation - Setup & integration guides

## 👉 Next Steps (Choose One Path)

### 🟢 Path A: Show Meter Data on Monitor Dashboard (Recommended)

Follow [INTEGRATION-GUIDE.md](./INTEGRATION-GUIDE.md) to:
1. Edit `/app/(kenergy)/monitor/page.tsx`
2. Add meter data section
3. Import `MeterDataDisplay` component
4. Add fetch function for `/api/meter-data`
5. Display readings on monitor page

**Time**: 10-15 minutes
**Result**: Live meter data on dashboard

### 🟡 Path B: Verify System is Working First

1. **Start the listener:**
```bash
python mqtt-services/pg46_meter_listener.py
```

2. **Test the API:**
```bash
curl http://localhost:3001/api/meter-data
```

3. **Check database:**
```bash
mysql -u ksystem -pZera2026Admin ksystem \
  -e "SELECT * FROM meter_data LIMIT 5;"
```

4. **If all works**, proceed to Path A

**Time**: 5 minutes
**Result**: Verified system functionality

### 🔴 Path C: Deploy to Production

When ready to deploy:
1. Move passwords to `.env` file
2. Add error handling & logging
3. Set up process manager (PM2 or systemd)
4. Configure auto-restart
5. Set up monitoring & alerts

See [PRODUCTION-DEPLOYMENT.md](./PRODUCTION-DEPLOYMENT.md) (create this if needed)

---

## 🎯 Most Common Task: Add to Monitor Page

### Quick Integration (5 minutes)

Edit `/app/(kenergy)/monitor/page.tsx`:

```tsx
// Add at top
import MeterDataDisplay from '@/components/MeterDataDisplay'

// Add state
const [meterReadings, setMeterReadings] = useState([])
const [meterStats, setMeterStats] = useState([])
const [meterLoading, setMeterLoading] = useState(false)

// Add function
const fetchMeterData = async () => {
  const res = await fetch('/api/meter-data?hours=24')
  const json = await res.json()
  setMeterReadings(json.data || [])
  setMeterStats(json.stats || [])
}

// Add effect
useEffect(() => {
  fetchMeterData()
  const timer = setInterval(fetchMeterData, 30000)
  return () => clearInterval(timer)
}, [])

// Add to JSX
<div className="mt-8">
  <h2 className="text-2xl font-bold mb-4">MQTT Meter Data</h2>
  <MeterDataDisplay
    meterReadings={meterReadings}
    meterStats={meterStats}
    loading={meterLoading}
  />
</div>
```

---

## 📊 Visual Architecture

```
┌─────────────────────────────────────────────────────────┐
│          Monitor Dashboard (Port 3001)                  │
│  ┌───────────────────────────────────────────────────┐  │
│  │  Device Monitoring (Existing)                     │  │
│  └───────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────┐  │
│  │  MQTT Meter Data (NEW)                            │  │  <- ADD HERE
│  │  ├─ Summary Cards (Meter1, Meter2)                │  │
│  │  ├─ Statistics (Avg Voltage, Current, Power)      │  │
│  │  └─ Latest Readings Table                         │  │
│  └───────────────────────────────────────────────────┘  │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
         /api/meter-data
                 │
    ┌────────────┬────────────┐
    ▼            ▼            ▼
  meter_data  meter_summary  stats
     table       view (Auto refreshed 
               every 30s)
```

---

## 🛠️ Commands Ready to Run

```bash
# 1. Create table
mysql -u ksystem -pZera2026Admin ksystem < database_schemas/create_meter_data_ksystem.sql

# 2. Install Python
pip install -r mqtt-services/requirements.txt

# 3. Run listener
python mqtt-services/pg46_meter_listener.py

# 4. Test API (in another terminal)
curl http://localhost:3001/api/meter-data?latest=true | jq

# 5. Edit monitor page (after Path A steps)
# Open: /app/(kenergy)/monitor/page.tsx
# Add: MeterDataDisplay component
```

---

## 📚 Documentation at a Glance

| Document | Purpose | Read Time |
|----------|---------|-----------|
| [SETUP-GUIDE.md](./SETUP-GUIDE.md) | Installation | 3 min |
| [QUICK-REFERENCE.md](./QUICK-REFERENCE.md) | Commands cheat sheet | 2 min |
| [METER-API-DOCS.md](./METER-API-DOCS.md) | API reference | 5 min |
| [INTEGRATION-GUIDE.md](./INTEGRATION-GUIDE.md) | How to add to monitor | 8 min |
| [README-SUMMARY.md](./README-SUMMARY.md) | System overview | 10 min |
| [NEXT-STEPS.md](./NEXT-STEPS.md) | This file | 3 min |

---

## ❓ FAQ

**Q: When will I see data?**
A: After meter data arrives via MQTT (check broker connection)

**Q: How often does data update?**
A: Every 30 seconds when component is on monitor page

**Q: Can I use without monitor page?**
A: Yes! API works standalone at http://localhost:3001/api/meter-data

**Q: What if listener crashes?**
A: Add systemd service or PM2 for auto-restart

**Q: Is it production-ready?**
A: For testing yes, for production add env variables & auth

---

## 🎯 Success Criteria

You'll know it's working when:

✅ Database table is created
```bash
mysql -u ksystem -pZera2026Admin ksystem -e "SHOW TABLES LIKE 'meter%';"
```

✅ Listener is connected
```bash
ps aux | grep pg46_meter_listener
```

✅ API returns data
```bash
curl http://localhost:3001/api/meter-data | jq '.success'
# Should return: true
```

✅ Monitor page shows meter data
```
Visit: http://localhost:3001/monitor
Look for: "MQTT Meter Data" section
```

---

## 🚀 I'm Ready to Start!

### Timeline

- **Now**: Review this file (3 min)
- **Next**: Run setup commands (5 min)
- **Then**: Start listener (2 min)
- **Finally**: Integrate with monitor page (10 min)

**Total Time**: ~20 minutes

### Start Here:
```bash
# 1. Copy and run this command
mysql -u ksystem -pZera2026Admin ksystem < database_schemas/create_meter_data_ksystem.sql

# 2. Then start listener
python mqtt-services/pg46_meter_listener.py
```

---

## 💬 Need Help?

1. **Check logs**: `tail -f /var/log/mqtt-listener.log`
2. **Read docs**: Start with [QUICK-REFERENCE.md](./QUICK-REFERENCE.md)
3. **Test API**: `curl http://localhost:3001/api/meter-data`
4. **Check database**: `mysql -u ksystem -pZera2026Admin ksystem`

---

**Created**: March 6, 2026
**Status**: Ready for deployment
**Next Action**: Choose your path above! 👆
