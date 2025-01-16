import { initializeMQTTClient } from "./mqtt.js";
import { writeToDynamoDB } from "./dynamodb.js";
import { processMessage } from "./processMessage.js";

const mqttClient = initializeMQTTClient(async (topic, message) => {
  processMessage(topic, message, writeToDynamoDB);
});

process.on("SIGTERM", () => {
  console.log("Service shutting down...");
  mqttClient.end();
  process.exit(0);
});
