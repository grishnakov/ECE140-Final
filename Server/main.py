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
BROKER = "broker.hivemq.com"
PORT = 1883
BASE_TOPIC = os.getenv("TOPIC_PREFIX")
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


# def on_message(client, userdata, msg):
#     """Callback for when a message is received."""
#     try:
#         # Parse JSON message
#         payload = json.loads(msg.payload.decode())
#         current_time = datetime.now()
#
#         # If the topic is exactly BASE_TOPIC/readings, print the payload.
#         if msg.topic == BASE_TOPIC + "/readings":
#             print(f"[{current_time}] Received sensor data: {payload}")
#         else:
#             print(f"[{current_time}] Received message on {msg.topic}: {payload}")
#
#     except json.JSONDecodeError:
#         print(f"\nReceived non-JSON message on {msg.topic}:")
#         print(f"Payload: {msg.payload.decode()}")
def on_message(client, userdata, msg):
    """Callback for when a message is received."""
    global last_post_time
    try:
        # Parse JSON message
        payload = json.loads(msg.payload.decode())
        current_time = datetime.now()

        # If the topic is exactly BASE_TOPIC/readings, print the payload.
        if msg.topic == BASE_TOPIC + "/readings":
            print(f"[{current_time}] Received sensor data: {payload}")

            # Only process temperature measurements (ignore pressure)
            if "temperature" in payload:
                # Enforce a 5-second delay between POST requests
                if (time.time() - last_post_time) >= 5:
                    last_post_time = time.time()

                    # Prepare the data for the POST request.
                    # We assume that the temperature reading is under the key "temperature".
                    # Adjust the key names as needed.
                    post_data = {
                        "value": payload["temperature"],
                        "unit": "celcius",
                        "timestamp": current_time.strftime("%Y-%m-%d %H:%M:%S"),
                    }

                    # URL of your FastAPI endpoint for temperature data.
                    url = "http://localhost:6543/api/temperature"

                    try:
                        response = requests.post(url, json=post_data)
                        if response.status_code == 200:
                            print("POST request successful, temperature data inserted!")
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


def main():
    # Create the MQTT client.
    print("Creating MQTT client...")
    client = mqtt.Client()

    # Set the callback functions.
    print("Setting callback functions...")
    client.on_connect = on_connect
    client.on_message = on_message

    try:
        # Connect to the MQTT broker.
        print("Connecting to broker...")
        client.connect(BROKER, PORT, 60)

        # Start the MQTT network loop.
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
