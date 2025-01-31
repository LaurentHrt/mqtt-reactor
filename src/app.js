import { initializeMQTTClient } from "./mqtt.js";
import { connect } from "mqtt";
import config from "./config.js";
import { saveStrat } from "./onMessageStrategies/saveStrategy/saveStrategy.js";

console.log("Starting service...");

const mqttClient = initializeMQTTClient(config, connect);

const onMessageStrategies = [saveStrat];
for (const strategy of onMessageStrategies) {
  strategy.init();
  mqttClient.on("message", strategy.onMessage);
}

function shutDown() {
  console.log("Service shutting down...");
  mqttClient.end();
  for (const strategy of onMessageStrategies) {
    strategy.end();
  }
  process.exit(0);
}

process.on("SIGTERM", shutDown);
process.on("SIGINT", shutDown);
