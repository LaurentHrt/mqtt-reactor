import { mqttBrokerConfig } from "./config.js";

export function initializeMQTTClient(connect) {
  const { host, port, username } = mqttBrokerConfig;
  const mqttClient = connect(`mqtt://${host}:${port}`, {
    username,
  });

  mqttClient.on("connect", () => {
    console.log("Connected to MQTT broker");
  });

  mqttClient.on("error", (err) => {
    console.error("MQTT error:", err);
  });

  return mqttClient;
}
