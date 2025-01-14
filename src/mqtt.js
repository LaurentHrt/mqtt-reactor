import mqtt from "mqtt";
import config from "./config.js";

export function initializeMQTTClient(onMessage) {
  const { host, port, username, topic } = config.mqtt;
  const mqttClient = mqtt.connect(`mqtt://${host}:${port}`, {
    username,
  });

  mqttClient.on("connect", () => {
    console.log("Connected to MQTT broker");
    mqttClient.subscribe(topic, (err) => {
      if (err) {
        console.error("Failed to subscribe to MQTT topic:", err);
      } else {
        console.log(`Subscribed to MQTT topic: ${topic}`);
      }
    });
  });

  mqttClient.on("message", (topic, messageBuffer) => {
    const message = messageBuffer.toString();
    onMessage(topic, message);
  });

  mqttClient.on("error", (err) => {
    console.error("MQTT error:", err);
  });

  return mqttClient;
}
