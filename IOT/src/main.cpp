#include "ECE140_WIFI.h"
#include "ECE140_MQTT.h"
#include <string>
#include <Arduino.h>
#include <Adafruit_BMP085.h>
#define DEVICE_ID 1
// MQTT client - using descriptive client ID and topic
const char* clientID = CLIENT_ID; 
const char* topicPrefix = TOPIC_PREFIX; 

ECE140_MQTT mqtt(clientID, topicPrefix);
ECE140_WIFI wifi;
// WiFi credentials
const char* ucsdUsername = UCSD_USERNAME;
const char* ucsdPassword = (std::string(UCSD_PASSWORD) + "#").c_str();
const char* wifiSsid = WIFI_SSID;
const char* nonEnterpriseWifiPassword = NON_ENTERPRISE_WIFI_PASSWORD;
unsigned long lastPublish = 0;
Adafruit_BMP085 bmp;
void setup() {
    Serial.begin(115200);
    delay(1000);
    
    if(strlen(ucsdUsername)>1 && strlen(ucsdPassword)>1){
        wifi.connectToWPAEnterprise(wifiSsid, ucsdUsername, ucsdPassword);
    } else {
        wifi.connectToWiFi(wifiSsid,nonEnterpriseWifiPassword);
    }
    if (!bmp.begin()) {
        Serial.println("Could not find a valid BMP085 sensor, check wiring!");
        while (1) {}
    }
}

void loop() {
    mqtt.loop();

    int temp = bmp.readTemperature();
    int pressure = bmp.readPressure();
    // int humidity = bmp.read

    char jsonBuffer[128];

    sprintf(jsonBuffer, "{\"temperature\":%d,\"pressure\":%d,\"device_id\":%d}", temp, pressure,DEVICE_ID);

    mqtt.publishMessage("readings",String(jsonBuffer));

    delay(5001);
}
