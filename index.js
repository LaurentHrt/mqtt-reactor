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

console.log(`Connecting to MQTT broker at ${mqttHost}:${mqttPort}`);
// Configure MQTT
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
      console.log("Subscribed");
    }
  });
});

mqttClient.on("message", async (topic, message) => {
  try {
    const payload = JSON.parse(message.toString());

    // topic format: zigbee2mqtt/home/ROOM/TYPE/LOCATION
    // example: zigbee2mqtt/home/chambre/lumiere/lit
    const [_, __, room, dataType, location] = topic.split("/");

    const data = {
      deviceId: `${room}-${dataType}-${location}`,
      timestamp: new Date().toISOString(),
      dataType,
      room,
      temperature: payload.temperature,
      humidity: payload.humidity,
      energy: payload.energy,
      state: payload.state,
    };
    const command = new PutCommand({ TableName: tableName, Item: data });

    await docClient.send(command);
    console.log("Data written to DynamoDB for topic:", topic);
  } catch (err) {
    console.error("Error processing message:", err);
  }
});
