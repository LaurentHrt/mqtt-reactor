import { initializeMQTTClient } from "./mqtt.js";
import { connect } from "mqtt";

const mqttClient = initializeMQTTClient(connect);

const topic = process.argv[2] || "";
const payload = process.argv[3] || "";

mqttClient.publishAsync(topic, payload).then(() => {
  mqttClient.end();
  process.exit(0);
});
