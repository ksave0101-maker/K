import paho.mqtt.client as mqtt
import mysql.connector
import json
import logging
from datetime import datetime

# ตั้งค่า logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

db = mysql.connector.connect(
    host="localhost",
    user="ksystem",
    password="Zera2026Admin",
    database="ksystem"
)
cursor = db.cursor()

def on_message(client, userdata, msg):
    try:
        data = json.loads(msg.payload.decode())
        logger.info(f"รับข้อมูล: {data}")
        
        sql = """INSERT INTO meter_data
        (meter_id, voltage, current, power, timestamp)
        VALUES (%s,%s,%s,%s,%s)"""
        
        val = (
            data.get("meter_id"),
            data.get("voltage"),
            data.get("current"),
            data.get("power"),
            datetime.now()
        )
        
        cursor.execute(sql, val)
        db.commit()
        logger.info(f"บันทึกสำเร็จ - Meter ID: {data.get('meter_id')}")
    except json.JSONDecodeError:
        logger.error("ข้อมูล JSON ไม่ถูกต้อง")
    except Exception as e:
        logger.error(f"ข้อผิดพลาด: {str(e)}")
        db.rollback()

client = mqtt.Client(client_id="pg46_listener")
client.connect("localhost", 1883)

# Subscribe ข้อมูลจากมิเตอร์ 2 ตัว
client.subscribe("factory/meter1/data")
client.subscribe("factory/meter2/data")
logger.info("เชื่อมต่อ MQTT สำเร็จ - รอข้อมูลจากมิเตอร์ 2 ตัว")

client.on_message = on_message

client.loop_forever()
