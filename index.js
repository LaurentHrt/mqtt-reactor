import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { fromSSO } from "@aws-sdk/credential-providers";
import { PutCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import mqtt from "mqtt";
import "dotenv/config";

// Use SSO only for developpement, use Keys for production
const useSSO = process.env.USE_SSO === "true";
const ssoProfile = process.env.SSO_PROFILE || "";

// Configure AWS DynamoDB
const config = {
  region: "eu-west-3",
};
if (useSSO) {
  config.credentials = fromSSO({ profile: ssoProfile });
}
const dynamoDBClient = new DynamoDBClient(config);
const docClient = DynamoDBDocumentClient.from(dynamoDBClient);
const tableName = process.env.DYNAMODB_TABLENAME || "dev-HomeDeviceData";
const mqttHost = process.env.MQTT_HOST || "localhost";
const mqttPort = process.env.MQTT_PORT || 1883;
const mqttUsername = process.env.MQTT_USERNAME || "mosquitto";
const topic = process.env.MQTT_TOPIC || "zigbee2mqtt/home/#";

const deduplicationCache = new Map();

console.log(`Connecting to MQTT broker at ${mqttHost}:${mqttPort}`);
const mqttClient = mqtt.connect(`mqtt://${mqttHost}:${mqttPort}`, {
  username: mqttUsername,
});

mqttClient.on("connect", () => {
  console.log("Connected to MQTT broker");
  console.log(`Subscribing to topic ${topic}`);
  mqttClient.subscribe(topic, (err) => {
    if (err) {
      console.error("Failed to subscribe:", err);
    } else {
      console.log("Subscribed successfully");
    }
  });
});

mqttClient.on("message", async (topic, messageBuffer) => {
  try {
    const message = messageBuffer.toString();
    const parsedPayload = JSON.parse(message);

    const payload = {
      temperature: parsedPayload.temperature,
      humidity: parsedPayload.humidity,
      energy: parsedPayload.energy,
      state: parsedPayload.state,
      occupancy: parsedPayload.occupancy,
      current: parsedPayload.current,
      power: parsedPayload.power,
      moving: parsedPayload.moving,
      position: parsedPayload.position,
    };

    // topic format: zigbee2mqtt/home/ROOM/TYPE/LOCATION
    // example: zigbee2mqtt/home/chambre/lumiere/lit

    const commands = [];
    const [_, __, room, dataType, location] = topic.split("/");

    if (topic === "zigbee2mqtt/home/sdb/lumiere/dual") {
      commands.push({
        deviceId: `${room}-${dataType}-${"plafond"}`,
        ...payload,
        state: parsedPayload.state_l1,
      });
      commands.push({
        deviceId: `${room}-${dataType}-${"miroir"}`,
        ...payload,
        state: parsedPayload.state_l2,
      });
    } else if (topic === "zigbee2mqtt/home/cuisine/lumiere/dual") {
      commands.push({
        deviceId: `${room}-${dataType}-${"planDeTravail"}`,
        ...payload,
        state: parsedPayload.state_l1,
      });
      commands.push({
        deviceId: `${room}-${dataType}-${"plafond"}`,
        ...payload,
        state: parsedPayload.state_l2,
      });
    } else {
      commands.push({
        deviceId: `${room}-${dataType}-${location}`,
        ...payload,
      });
    }

    const filteredCommands = commands.filter(
      (command) => !isDuplicate(command),
    );

    if (filteredCommands.length <= 0) {
      return;
    }

    console.log("Writting to DynamoDB:", topic);
    const commandsExecution = filteredCommands.map((command) =>
      docClient.send(
        new PutCommand({
          TableName: tableName,
          Item: { ...command, timestamp: new Date().toISOString() },
        }),
      ),
    );
    await Promise.all(commandsExecution);
    console.log("Data written to DynamoDB:", topic);
  } catch (err) {
    console.error("Error processing message:", err);
  }
});

function isDuplicate(command) {
  const value = JSON.stringify(command);
  if (deduplicationCache.get(command.deviceId) === value) {
    console.log("Duplicated message ignored:", command.deviceId);
    return true;
  }
  deduplicationCache.set(command.deviceId, value);
  return false;
}
