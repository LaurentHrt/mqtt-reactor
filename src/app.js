import { initializeMQTTClient } from "./mqtt.js";
import { writeToDynamoDB } from "./dynamodb.js";
import { isDuplicate } from "./deduplication.js";
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

function prepareDBEntries(topic, payload) {
  const [, , room, dataType, location] = topic.split("/");
  const entries = [];

  const commonData = {
    temperature: payload.temperature,
    humidity: payload.humidity,
    energy: payload.energy,
    state: payload.state,
    occupancy: payload.occupancy,
    current: payload.current,
    power: payload.power,
    moving: payload.moving,
    position: payload.position,
    action: payload.action,
  };

  if (topic === "zigbee2mqtt/home/sdb/lumiere/dual") {
    entries.push(
      {
        deviceId: `${room}-${dataType}-plafond`,
        ...commonData,
        state: payload.state_l1,
      },
      {
        deviceId: `${room}-${dataType}-miroir`,
        ...commonData,
        state: payload.state_l2,
      },
    );
  } else if (topic === "zigbee2mqtt/home/cuisine/lumiere/dual") {
    entries.push(
      {
        deviceId: `${room}-${dataType}-planDeTravail`,
        ...commonData,
        state: payload.state_l1,
      },
      {
        deviceId: `${room}-${dataType}-plafond`,
        ...commonData,
        state: payload.state_l2,
      },
    );
  } else {
    entries.push({
      deviceId: `${room}-${dataType}-${location}`,
      ...commonData,
    });
  }

  return entries;
}

process.on("SIGTERM", () => {
  console.log("Service shutting down...");
  mqttClient.end();
  process.exit(0);
});
