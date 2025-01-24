import { initializeMQTTClient } from "./mqtt.js";
import { initializeDynamoDB } from "./dynamodb.js";
import { processMessage } from "./processMessage.js";
import { zigbeeStrategy } from "./zigbeeStrategy.js";
import { pingStrategy } from "./pingStrategy.js";
import { connect } from "mqtt";
import config from "./config.js";

function selectEntryStrategy(topic) {
  if (topic.startsWith("zigbee2mqtt")) {
    return zigbeeStrategy;
  } else if (topic.startsWith("ping2mqtt")) {
    return pingStrategy;
  } else {
    return () => [];
  }
}

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
