import { initializeMQTTClient } from "./mqtt.js";
import { initializeDynamoDB } from "./dynamodb.js";
import { processMessage } from "./processMessage.js";
import { connect } from "mqtt";
import config from "./config.js";
import { selectEntryStrategy } from "./selectEntryStrategy.js";

const dynamoDBClient = initializeDynamoDB(config);

const mqttClient = initializeMQTTClient(
  config,
  connect,
  async (topic, message) => {
    processMessage(
      topic,
      message,
      selectEntryStrategy(topic),
      dynamoDBClient.write,
    );
  },
);

process.on("SIGTERM", () => {
  console.log("Service shutting down...");
  mqttClient.end();
  process.exit(0);
});
