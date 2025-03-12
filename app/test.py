import threading
from dotenv import load_dotenv
import os
import time
import json
from datetime import datetime
import mysql.connector
from mysql.connector import Error
import paho.mqtt.client as mqtt

load_dotenv()
import threading
import os
import time
import json
from datetime import datetime
import mysql.connector
from mysql.connector import Error
import paho.mqtt.client as mqtt

BROKER = "broker.emqx.io"
PORT = 1883
BASE_TOPIC = str(os.getenv("BASE_TOPIC"))
TOPIC = BASE_TOPIC + "/#"

if (
    BASE_TOPIC
    == "ENTER_SOMETHING_UNIQUE_HERE_THAT_SHOULD_ALSO_MATCH_MAINCPP/ece140/sensors"
):
    print("Please enter a unique topic for your server")
    exit()

last_post_time = 0


# Database connection for MQTT listener (use separate connection details if needed)
def get_connection_mqtt():
    connection = mysql.connector.connect(
        host=os.getenv("MYSQL_HOST", "db"),
        user=os.getenv("MYSQL_USER"),
        password=os.getenv("MYSQL_PASSWORD"),
        database=os.getenv("MYSQL_DATABASE"),
    )
    return connection


# Helper function to insert sensor data via MQTT
def insert_sensor_data(sensor_type, device_id, value, timestamp):
    insert_query = (
        "INSERT INTO readings (device_id, reading, reading_type, timestamp) "
        "VALUES (%s, %s, %s, %s)"
    )
    try:
        connection = get_connection_mqtt()
        cursor = connection.cursor()
        cursor.execute(insert_query, (device_id, float(value), sensor_type, timestamp))
        connection.commit()
        new_id = cursor.lastrowid
        cursor.close()
        connection.close()
        print(f"Data inserted with id: {new_id} for sensor {sensor_type}")
    except Error as e:
        print(f"Database insert error for sensor {sensor_type}: {e}")


def on_connect(client, userdata, flags, rc):
    if rc == 0:
        print("Successfully connected to MQTT broker")
        client.subscribe(TOPIC)
        print(f"Subscribed to {TOPIC}")
    else:
        print(f"Failed to connect with result code {rc}")


def on_message(client, userdata, msg):
    global last_post_time
    try:
        payload = json.loads(msg.payload.decode())
        current_time = datetime.now()
        if msg.topic == BASE_TOPIC + "/readings":
            print(f"[{current_time}] Received sensor data: {payload}")
            if "temperature" in payload and "pressure" in payload:
                if (time.time() - last_post_time) >= 5:
                    last_post_time = time.time()
                    timestamp = current_time.strftime("%Y-%m-%d %H:%M:%S")
                    # Insert temperature and pressure readings directly into the database
                    insert_sensor_data(
                        "temperature",
                        payload["device_id"],
                        payload["temperature"],
                        timestamp,
                    )
                    insert_sensor_data(
                        "pressure", payload["device_id"], payload["pressure"], timestamp
                    )
        else:
            print(f"[{current_time}] Received message on {msg.topic}: {payload}")
    except json.JSONDecodeError:
        print(f"Received non-JSON message on {msg.topic}: {msg.payload.decode()}")


def mqtt_listener():
    print("Creating MQTT client...")
    client = mqtt.Client()
    client.on_connect = on_connect
    client.on_message = on_message
    try:
        print("Connecting to broker...")
        client.connect(BROKER, PORT, 60)
        print("Starting MQTT loop...")
        client.loop_forever()
    except KeyboardInterrupt:
        print("\nDisconnecting from broker...")
        client.disconnect()
        print("Exited successfully")
    except Exception as e:
        print(f"Error: {e}")


# -------------------------------
# Main: Start Webserver & MQTT Listener in Separate Threads
# -------------------------------


if __name__ == "__main__":
    mqtt_thread = threading.Thread(target=mqtt_listener, name="MQTTListenerThread")
    mqtt_thread.start()
