# Integration Guide: Meter Data Display in Monitor Page

## 📝 How to Add Meter Data Display to Monitor Page

### Step 1: Add import in `/app/(kenergy)/monitor/page.tsx`

```tsx
import MeterDataDisplay from "@/components/MeterDataDisplay"
```

### Step 2: Add state variables for meter data

```tsx
const [meterReadings, setMeterReadings] = useState<any[]>([])
const [meterStats, setMeterStats] = useState<any[]>([])
const [meterDataLoading, setMeterDataLoading] = useState(false)
const [meterDataError, setMeterDataError] = useState<string | null>(null)
```

### Step 3: Add fetch function for meter data

```tsx
const fetchMeterData = async () => {
  try {
    setMeterDataLoading(true)
    setMeterDataError(null)
    
    const res = await fetch('/api/meter-data?hours=24&limit=100')
    const json = await res.json()
    
    if (json.success) {
      setMeterReadings(json.data || [])
      setMeterStats(json.stats || [])
    } else {
      setMeterDataError('Failed to fetch meter data')
    }
  } catch (err) {
    console.error('Failed to fetch meter data:', err)
    setMeterDataError('Error loading meter data')
  } finally {
    setMeterDataLoading(false)
  }
}
```

### Step 4: Add to useEffect to fetch data

```tsx
useEffect(() => {
  fetchMeterData()
  
  // Refresh every 30 seconds
  const interval = setInterval(fetchMeterData, 30000)
  return () => clearInterval(interval)
}, [])
```

### Step 5: Add to JSX render

```tsx
{/* Add this section to the monitor page JSX */}
<section className="mb-8">
  <h2 className="text-2xl font-bold text-gray-900 mb-4">
    MQTT Meter Data (PG46)
  </h2>
  <MeterDataDisplay
    meterReadings={meterReadings}
    meterStats={meterStats}
    loading={meterDataLoading}
    error={meterDataError}
  />
</section>
```

## 🎯 Placement Options

### Option A: At the top of monitor page
Place it right after the device selection dropdown

### Option B: As a separate tab
Create tabs for:
1. Device Monitoring (existing)
2. MQTT Meter Data (new)

### Option C: At the bottom
Display below existing monitoring charts

## 📊 Example Integration

```tsx
export default function MonitorPage() {
  // ... existing state ...
  
  const [meterReadings, setMeterReadings] = useState<any[]>([])
  const [meterStats, setMeterStats] = useState<any[]>([])
  const [meterDataLoading, setMeterDataLoading] = useState(false)

  // ... existing useEffect ...
  
  useEffect(() => {
    const fetchMeterData = async () => {
      const res = await fetch('/api/meter-data?hours=24')
      const json = await res.json()
      if (json.success) {
        setMeterReadings(json.data)
        setMeterStats(json.stats)
      }
    }
    
    fetchMeterData()
    const interval = setInterval(fetchMeterData, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div>
      {/* ... existing content ... */}
      
      {/* Add this new section */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">MQTT Meter Monitoring</h2>
        <MeterDataDisplay
          meterReadings={meterReadings}
          meterStats={meterStats}
          loading={meterDataLoading}
          error={meterDataError}
        />
      </div>
    </div>
  )
}
```

## 🔄 Auto-refresh Options

### Every 30 seconds (recommended)
```tsx
const interval = setInterval(fetchMeterData, 30000)
```

### Every 10 seconds (high frequency)
```tsx
const interval = setInterval(fetchMeterData, 10000)
```

### On demand only
Remove the interval and add a refresh button

## 🎨 Styling Customization

The `MeterDataDisplay` component uses Tailwind CSS. To customize:

1. **Card colors** - Modify the bg-blue-100, text-blue-600 classes
2. **Layout** - Change grid-cols-1 md:grid-cols-2 to different breakpoints
3. **Table styling** - Update border and hover colors
4. **Icons** - Replace with different lucide-react icons

## 📱 Responsive Design

The component is fully responsive:
- **Mobile**: Single column layout
- **Tablet**: 1-2 columns
- **Desktop**: 2 columns with full details

## ⚡ Performance Tips

1. **Limit data points**: Use `limit=50` for faster loading
2. **Cache results**: Store in sessionStorage to avoid repeated API calls
3. **Lazy load**: Load meter data only when needed
4. **Batch requests**: Fetch all data in one request instead of multiple calls
