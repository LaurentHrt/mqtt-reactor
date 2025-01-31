export function initializeMQTTClient(config, connect) {
  const { host, port, username, topics } = config.mqtt;
  const mqttClient = connect(`mqtt://${host}:${port}`, {
    username,
  });

  mqttClient.on("connect", () => {
    console.log("Connected to MQTT broker");
  });

  mqttClient.on("error", (err) => {
    console.error("MQTT error:", err);
  });

  mqttClient.subscribe(topics, (err) => {
    if (err) {
      console.error("Failed to subscribe to MQTT topics:", err);
    } else {
      console.log(`Subscribed to MQTT topics: ${topics}`);
    }
  });

  return mqttClient;
}
