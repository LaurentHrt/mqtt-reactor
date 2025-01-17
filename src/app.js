import { initializeMQTTClient } from "./mqtt.js";
import { writeToDynamoDB } from "./dynamodb.js";
import { processMessage } from "./processMessage.js";
import { connect } from "mqtt";
import config from "./config.js";

const mqttClient = initializeMQTTClient(
  config,
  connect,
  async (topic, message) => {
    processMessage(topic, message, writeToDynamoDB);
  },
);

process.on("SIGTERM", () => {
  console.log("Service shutting down...");
  mqttClient.end();
  process.exit(0);
});
