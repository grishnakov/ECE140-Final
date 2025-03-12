import paho.mqtt.client as mqtt
import json
from datetime import datetime
from collections import deque
import numpy as np
import os
from dotenv import load_dotenv
import time
import requests

load_dotenv()
# MQTT Broker settings
BROKER = "broker.emqx.io"
PORT = 1883
BASE_TOPIC = os.getenv("BASE_TOPIC")
TOPIC = BASE_TOPIC + "/#"

if (
    BASE_TOPIC
    == "ENTER_SOMETHING_UNIQUE_HERE_THAT_SHOULD_ALSO_MATCH_MAINCPP/ece140/sensors"
):
    print("Please enter a unique topic for your server")
    exit()


def on_connect(client, userdata, flags, rc):
    """Callback for when the client connects to the broker."""
    if rc == 0:
        print("Successfully connected to MQTT broker")
        client.subscribe(TOPIC)
        print(f"Subscribed to {TOPIC}")
    else:
        print(f"Failed to connect with result code {rc}")


last_post_time = 0


def on_message(client, userdata, msg):
    """Callback for when a message is received."""
    global last_post_time
    try:
        payload = json.loads(msg.payload.decode())
        current_time = datetime.now()

        if msg.topic == BASE_TOPIC + "/readings":
            print(f"[{current_time}] Received sensor data: {payload}")

            if "temperature" in payload:
                if (time.time() - last_post_time) >= 5:
                    last_post_time = time.time()

                    post_data_temp = {
                        "device_id": payload["device_id"],
                        "value": payload["temperature"],
                        "unit": "celcius",
                        "timestamp": current_time.strftime("%Y-%m-%d %H:%M:%S"),
                    }

                    url = "http://localhost:6543/api/sensors/temperature"

                    try:
                        response = requests.post(url, json=post_data_temp)
                        if response.status_code == 200:
                            print("POST request successful, temperature data inserted!")
                        else:
                            print(
                                f"POST request failed with status {response.status_code}: {response.text}"
                            )
                    except Exception as e:
                        print("Error sending POST request:", e)

                    post_data_press = {
                        "device_id": payload["device_id"],
                        "value": payload["pressure"],
                        "unit": "Pa",
                        "timestamp": current_time.strftime("%Y-%m-%d %H:%M:%S"),
                    }

                    url = "http://localhost:6543/api/sensors/pressure"

                    try:
                        response = requests.post(url, json=post_data_press)
                        if response.status_code == 200:
                            print("POST request successful, pressure data inserted!")
                        else:
                            print(
                                f"POST request failed with status {response.status_code}: {response.text}"
                            )
                    except Exception as e:
                        print("Error sending POST request:", e)

        else:
            print(f"[{current_time}] Received message on {msg.topic}: {payload}")

    except json.JSONDecodeError:
        print(f"\nReceived non-JSON message on {msg.topic}:")
        print(f"Payload: {msg.payload.decode()}")


def mqtt_listener():
    print("Creating MQTT client...")
    client = mqtt.Client()

    print("Setting callback functions...")
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


if __name__ == "__main__":
    main()
