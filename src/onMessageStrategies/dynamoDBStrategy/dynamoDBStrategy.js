import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { fromSSO } from "@aws-sdk/credential-providers";
import { PutCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { dynamoDBConfig } from "../../config.js";
import { selectEntryStrategy } from "../../entryStrategies/selectEntryStrategy.js";

let docClient;
let dynamoDBClient;
const { tableName } = dynamoDBConfig;

export const dynamoDBStrategy = {
  init: () => {
    const { awsRegion, ssoProfile, useSSO } = dynamoDBConfig;
    const awsConfig = {
      region: awsRegion,
    };
    if (useSSO) {
      awsConfig.credentials = fromSSO({ profile: ssoProfile });
    }
    dynamoDBClient = new DynamoDBClient(awsConfig);
    docClient = DynamoDBDocumentClient.from(dynamoDBClient);
    console.log("DynamoDB strategy initialized");
  },
  end: () => {
    dynamoDBClient.destroy();
    console.log("End dynamoDBStrategy");
  },
  onMessage: (topic, messageBuffer) => {
    try {
      const message = messageBuffer.toString();
      const payload = JSON.parse(message);
      const entryStrategy = selectEntryStrategy(topic);
      const entries = entryStrategy(topic, payload);

      if (entries.length) {
        try {
          const promises = entries.map((item) =>
            docClient
              .send(
                new PutCommand({
                  TableName: tableName,
                  Item: { timestamp: new Date().toISOString(), ...item },
                }),
              )
              .then(() =>
                console.log(
                  "Data written to DynamoDB for device:",
                  item.deviceId,
                ),
              ),
          );
          Promise.all(promises);
        } catch (err) {
          console.error("Error writing to DynamoDB:", err);
        }
      }
    } catch (err) {
      console.error("Error processing message:", err);
    }
  },
};
