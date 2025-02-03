import { initializeMQTTClient } from "./mqtt.js";
import { connect } from "mqtt";
import { reactorConfig } from "./config.js";

const mqttClient = initializeMQTTClient(connect);

const state = process.argv[2] || "";

if (state !== "ON" && state !== "OFF") {
  process.exit(0);
}

mqttClient
  .publishAsync(reactorConfig.pubSdbLumiereAuto, `{"state": "${state}"}`)
  .then(() => {
    mqttClient.end();
    process.exit(0);
  });
