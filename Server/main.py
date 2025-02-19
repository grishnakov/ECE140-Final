import paho.mqtt.client as mqtt
import json
from datetime import datetime
from collections import deque
import numpy as np

# MQTT Broker settings
BROKER = "broker.hivemq.com"
PORT = 1883
BASE_TOPIC = "lab6espwtf_is_this"
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


def on_message(client, userdata, msg):
    """Callback for when a message is received."""
    try:
        # Parse JSON message
        payload = json.loads(msg.payload.decode())
        current_time = datetime.now()

        # If the topic is exactly BASE_TOPIC/readings, print the payload.
        if msg.topic == BASE_TOPIC + "/readings":
            print(f"[{current_time}] Received sensor data: {payload}")
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

