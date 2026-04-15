import paho.mqtt.client as mqtt
import mysql.connector
import json
import logging
from datetime import datetime
from decimal import Decimal

# ตั้งค่า logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# เชื่อมต่อฐานข้อมูล
db = mysql.connector.connect(
    host="localhost",
    user="ksystem",
    password="Zera2026Admin",
    database="ksystem"
)
cursor = db.cursor()

def calculate_savings(metrics_kwh, before_kwh):
    """คำนวณพลังงานที่ประหยัดได้"""
    if before_kwh and metrics_kwh:
        return float(before_kwh) - float(metrics_kwh)
    return 0

def calculate_co2_reduction(energy_reduction):
    """คำนวณ CO₂ ที่ลดได้ (0.5 kg CO₂ per kWh)"""
    return energy_reduction * 0.5

def convert_to_kw(watts):
    """แปลง Watts เป็น kW"""
    return float(watts) / 1000 if watts else 0

def on_message(client, userdata, msg):
    try:
        data = json.loads(msg.payload.decode())
        logger.info(f"รับข้อมูล: {data}")
        
        # แปลงหน่วย W → kW, VAr → kVAr, VA → kVA
        metrics_p = convert_to_kw(data.get("power", 0))
        metrics_q = convert_to_kw(data.get("reactive_power", 0))
        metrics_s = convert_to_kw(data.get("apparent_power", 0))
        metrics_kwh = convert_to_kw(data.get("energy", 0))
        
        # ค่า before (ถ้ามี) หรือใช้ค่าปัจจุบันเป็น baseline
        before_kwh = data.get("before_kwh", metrics_kwh * 1.1)  # สมมติว่าก่อนหน้าใช้มากกว่า 10%
        before_thd = data.get("before_thd", data.get("thd", 0) * 1.5)  # สมมติ THD ก่อนหน้าสูงกว่า
        
        # คำนวณค่า savings
        energy_reduction = calculate_savings(metrics_kwh, before_kwh)
        co2_reduction = calculate_co2_reduction(energy_reduction)
        
        # SQL สำหรับ power_records
        sql = """INSERT INTO power_records
        (device_id, record_time,
         before_L1, before_L2, before_L3,
         metrics_L1, metrics_L2, metrics_L3,
         metrics_P, metrics_Q, metrics_S,
         metrics_F, metrics_PF,
         metrics_kWh, before_kWh,
         before_THD, metrics_THD,
         energy_reduction, co2_reduction)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)"""
        
        val = (
            data.get("device_id", "meter1"),  # device_id
            datetime.now(),                    # record_time
            # Voltage (before_L1, L2, L3)
            data.get("voltage_l1", 220.0),
            data.get("voltage_l2", 220.0),
            data.get("voltage_l3", 220.0),
            # Current (metrics_L1, L2, L3)
            data.get("current_l1", 0),
            data.get("current_l2", 0),
            data.get("current_l3", 0),
            # Power
            metrics_p,                         # metrics_P (kW)
            metrics_q,                         # metrics_Q (kVAr)
            metrics_s,                         # metrics_S (kVA)
            # Power Quality
            data.get("frequency", 50.0),       # metrics_F (Hz)
            data.get("power_factor", 1.0),     # metrics_PF
            # Energy
            metrics_kwh,                       # metrics_kWh
            before_kwh,                        # before_kWh
            # THD
            before_thd,                        # before_THD (%)
            data.get("thd", 0),                # metrics_THD (%)
            # Savings
            energy_reduction,                  # energy_reduction (kWh)
            co2_reduction                      # co2_reduction (kg)
        )
        
        cursor.execute(sql, val)
        db.commit()
        
        logger.info(f"✅ บันทึกสำเร็จ - Device: {data.get('device_id')} | Power: {metrics_p:.2f} kW | Energy: {metrics_kwh:.2f} kWh | Saved: {energy_reduction:.2f} kWh")
        
    except json.JSONDecodeError:
        logger.error("❌ ข้อมูล JSON ไม่ถูกต้อง")
    except mysql.connector.Error as e:
        logger.error(f"❌ Database Error: {str(e)}")
        db.rollback()
    except Exception as e:
        logger.error(f"❌ ข้อผิดพลาด: {str(e)}")
        db.rollback()

def on_connect(client, userdata, flags, rc):
    if rc == 0:
        logger.info("✅ เชื่อมต่อ MQTT Broker สำเร็จ")
        # Subscribe topics
        client.subscribe("factory/meter1/data")
        client.subscribe("factory/meter2/data")
        logger.info("📡 รอรับข้อมูลจากมิเตอร์ 2 ตัว...")
    else:
        logger.error(f"❌ เชื่อมต่อ MQTT ล้มเหลว - Return code: {rc}")

def on_disconnect(client, userdata, rc):
    if rc != 0:
        logger.warning(f"⚠️ การเชื่อมต่อ MQTT หลุด - กำลังเชื่อมต่อใหม่...")

# สร้าง MQTT Client
client = mqtt.Client(client_id="pg46_power_records_listener")
client.on_connect = on_connect
client.on_message = on_message
client.on_disconnect = on_disconnect

try:
    logger.info("🚀 เริ่มต้น MQTT Listener สำหรับ power_records...")
    client.connect("localhost", 1883, 60)
    client.loop_forever()
except KeyboardInterrupt:
    logger.info("\n⛔ หยุดการทำงานโดยผู้ใช้")
    client.disconnect()
    cursor.close()
    db.close()
except Exception as e:
    logger.error(f"❌ ข้อผิดพลาดร้ายแรง: {str(e)}")
    cursor.close()
    db.close()
