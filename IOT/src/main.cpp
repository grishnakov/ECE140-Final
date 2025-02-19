#include "ECE140_WIFI.h"
#include "ECE140_MQTT.h"
#include <string>
#include <Arduino.h>

// MQTT client - using descriptive client ID and topic
#define CLIENT_ID "esp32-sensors"
#define TOPIC_PREFIX "lab6espwtf_is_this"

ECE140_MQTT mqtt(CLIENT_ID, TOPIC_PREFIX);
ECE140_WIFI wifi;
// WiFi credentials
const char* ucsdUsername = UCSD_USERNAME;
const char* ucsdPassword = (std::string(UCSD_PASSWORD) + "#").c_str();
const char* wifiSsid = WIFI_SSID;
const char* nonEnterpriseWifiPassword = NON_ENTERPRISE_WIFI_PASSWORD;
unsigned long lastPublish = 0;
void setup() {
    Serial.begin(115200);
    delay(1000);
    
    if(strlen(ucsdUsername)>1 && strlen(ucsdPassword)>1){
        wifi.connectToWPAEnterprise(wifiSsid, ucsdUsername, ucsdPassword);
    } else {
        wifi.connectToWiFi(wifiSsid,nonEnterpriseWifiPassword);
    }
}

void loop() {
    mqtt.loop();

    int hallValue = hallRead();
    int temp = temperatureRead();
    unsigned long timestamp = millis();

    char jsonBuffer[128];

    sprintf(jsonBuffer, "{\"timestamp\":%lu,\"hall\":%d,\"temperature\":%d}", 
            timestamp, hallValue, temp);

    mqtt.publishMessage("readings", String(jsonBuffer));

    delay(5000);
}