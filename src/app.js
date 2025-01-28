import { initializeMQTTClient } from "./mqtt.js";
import { processMessage } from "./processMessage.js";
import { connect } from "mqtt";
import config from "./config.js";
import { selectEntryStrategy } from "./selectEntryStrategy.js";
import { selectDBStrategy } from "./selectDBStrategy.js";

const dbStrategy = await selectDBStrategy();

const mqttClient = initializeMQTTClient(
  config,
  connect,
  async (topic, message) => {
    processMessage(
      topic,
      message,
      selectEntryStrategy(topic),
      dbStrategy.write,
    );
  },
);

function shutDown() {
  console.log("Service shutting down...");
  dbStrategy.end();
  mqttClient.end();
  process.exit(0);
}

process.on("SIGTERM", shutDown);
process.on("SIGINT", shutDown);
