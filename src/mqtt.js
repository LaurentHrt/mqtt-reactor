export function initializeMQTTClient(config, connect, onMessage) {
  const { host, port, username, topic } = config.mqtt;
  const mqttClient = connect(`mqtt://${host}:${port}`, {
    username,
  });

  mqttClient.on("connect", () => {
    console.log("Connected to MQTT broker");
  });

  mqttClient.on("message", onMessage);

  mqttClient.on("error", (err) => {
    console.error("MQTT error:", err);
  });

  mqttClient.subscribe(topic, (err) => {
    if (err) {
      console.error("Failed to subscribe to MQTT topic:", err);
    } else {
      console.log(`Subscribed to MQTT topic: ${topic}`);
    }
  });

  return mqttClient;
}
