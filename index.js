import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { fromSSO } from "@aws-sdk/credential-providers";
import { PutCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import mqtt from "mqtt";
import "dotenv/config";

// Configuration
const config = {
  useSSO: process.env.USE_SSO === "true",
  ssoProfile: process.env.SSO_PROFILE || "",
  awsRegion: "eu-west-3",
  tableName: process.env.DYNAMODB_TABLENAME || "dev-HomeDeviceData",
  mqtt: {
    host: process.env.MQTT_HOST || "localhost",
    port: process.env.MQTT_PORT || 1883,
    username: process.env.MQTT_USERNAME || "mosquitto",
    topic: process.env.MQTT_TOPIC || "zigbee2mqtt/home/#",
  },
};

// AWS DynamoDB Setup
const awsConfig = {
  region: config.awsRegion,
};
if (config.useSSO) {
  awsConfig.credentials = fromSSO({ profile: config.ssoProfile });
}
const dynamoDBClient = new DynamoDBClient(awsConfig);
const docClient = DynamoDBDocumentClient.from(dynamoDBClient);

// MQTT Setup
const mqttClient = mqtt.connect(
  `mqtt://${config.mqtt.host}:${config.mqtt.port}`,
  {
    username: config.mqttUsername,
  },
);

// Deduplication Cache
const deduplicationCache = new Map();

function initializeMQTT() {
  mqttClient.on("connect", () => {
    console.log("Connected to MQTT broker");
    mqttClient.subscribe(config.mqtt.topic, (err) => {
      if (err) {
        console.error("Failed to subscribe to MQTT topic:", err);
      } else {
        console.log(`Subscribed to MQTT topic: ${config.mqtt.topic}`);
      }
    });
  });

  mqttClient.on("message", handleMessage);

  mqttClient.on("error", (err) => {
    console.error("MQTT error:", err);
  });
}

async function handleMessage(topic, messageBuffer) {
  try {
    const message = messageBuffer.toString();
    const parsedPayload = JSON.parse(message);

    const commands = prepareCommands(topic, parsedPayload);
    const filteredCommands = commands.filter(
      (command) => !isDuplicate(command),
    );

    if (filteredCommands.length > 0) {
      await writeToDynamoDB(filteredCommands, topic);
    }
  } catch (err) {
    console.error("Error processing MQTT message:", err);
  }
}

function prepareCommands(topic, payload) {
  const [, , room, dataType, location] = topic.split("/");
  const commands = [];

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
    commands.push(
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
    commands.push(
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
    commands.push({
      deviceId: `${room}-${dataType}-${location}`,
      ...commonData,
    });
  }

  return commands;
}

async function writeToDynamoDB(commands, topic) {
  try {
    const executions = commands.map((command) =>
      docClient.send(
        new PutCommand({
          TableName: config.tableName,
          Item: { ...command, timestamp: new Date().toISOString() },
        }),
      ),
    );
    await Promise.all(executions);
    console.log("Data written to DynamoDB for topic:", topic);
  } catch (err) {
    console.error("Error writing to DynamoDB:", err);
  }
}

function isDuplicate(command) {
  // No cache for buttons
  if (command.deviceId.includes("bouton")) {
    return false;
  }
  const value = JSON.stringify(command);
  if (deduplicationCache.get(command.deviceId) === value) {
    console.log("Duplicated message ignored:", command.deviceId);
    return true;
  }
  deduplicationCache.set(command.deviceId, value);
  return false;
}

// Start the Service
initializeMQTT();
