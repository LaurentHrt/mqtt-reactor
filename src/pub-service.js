import { initializeMQTTClient } from "./mqtt.js";
import { connect } from "mqtt";

const log = console.log;
console.log = function () {};

const mqttClient = initializeMQTTClient(connect);

const topic = process.argv[2] || "";
const payload = process.argv[3] || "";

mqttClient.publishAsync(topic, payload).then(() => {
  log(`Message successfully published on ${topic} with payload ${payload}`);
  mqttClient.end();
  process.exit(0);
});
