import { initializeMQTTClient } from "./mqtt.js";
import { connect } from "mqtt";

const mqttClient = initializeMQTTClient(connect);

const state = process.argv[2] || "";

if (state !== "ON" && state !== "OFF") {
  process.exit(0);
}

mqttClient
  .publishAsync("mqttreactor/sdb/lumiereauto/set", `{"state": "${state}"}`)
  .then(() => {
    mqttClient.end();
    process.exit(0);
  });
