import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { fromSSO } from "@aws-sdk/credential-providers";
import { PutCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import mqtt from "mqtt";

// Configure AWS DynamoDB
const dynamoDBClient = new DynamoDBClient({
  region: "eu-west-3",
  credentials: fromSSO({ profile: "PowerUserAccess-209479277233" }),
});
const docClient = DynamoDBDocumentClient.from(dynamoDBClient);
const tableName = "dev-HomeDeviceData";

// Configure MQTT
const mqttClient = mqtt.connect("mqtt://localhost:1884", {
  username: "mosquitto",
});
const topic = "zigbee2mqtt/home/#";

mqttClient.on("connect", () => {
  console.log("Connected to MQTT broker");
  mqttClient.subscribe(topic, (err) => {
    if (err) {
      console.error("Failed to subscribe:", err);
    } else {
      console.log("Subscribed to:", topic);
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
