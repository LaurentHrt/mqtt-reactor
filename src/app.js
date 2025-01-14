import { initializeMQTTClient } from "./mqtt.js";
import { writeToDynamoDB } from "./dynamodb.js";
import { isDuplicate } from "./deduplication.js";
import { prepareDBEntries } from "./prepareDBEntries.js";
import config from "./config.js";

const mqttClient = initializeMQTTClient(async (topic, message) => {
  processMessage(topic, message);
});

async function processMessage(topic, message) {
  try {
    const payload = JSON.parse(message);
    const entries = prepareDBEntries(topic, payload);

    const entriesWithoutDuplicated = entries.filter(
      (command) =>
        !isDuplicate(command.deviceId, command, config.deduplicationTTL),
    );

    if (entriesWithoutDuplicated.length) {
      await writeToDynamoDB(entriesWithoutDuplicated);
      console.log("Data written to DynamoDB for topic:", topic);
    }
  } catch (err) {
    console.error("Error processing message:", err);
  }
}

process.on("SIGTERM", () => {
  console.log("Service shutting down...");
  mqttClient.end();
  process.exit(0);
});
