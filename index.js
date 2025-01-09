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
const topic = "zigbee2mqtt/#";

mqttClient.on("connect", () => {
  console.log("Connected to MQTT broker");
  mqttClient.subscribe(topic, (err) => {
    if (err) {
      console.error("Failed to subscribe:", err);
    } else {
      console.log("Subscribed to sensors/test");
    }
  });
});

mqttClient.on("message", async (topic, message) => {
  try {
    const payload = JSON.parse(message.toString());
    const deviceId = topic.split("/").splice(-1).pop();

    const data = {
      deviceId,
      timestamp: new Date().toISOString(),
      dataType: "temperature",
      temperature: payload.temperature,
    };
    const command = new PutCommand({ TableName: tableName, Item: data });

    await docClient.send(command);
    console.log("Data written to DynamoDB:", data);
  } catch (e) {
    console.error("Error processing message:", err);
  }
});
