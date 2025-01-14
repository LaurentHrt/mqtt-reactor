import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { fromSSO } from "@aws-sdk/credential-providers";
import { PutCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import config from "./config.js";

const { awsRegion, ssoProfile, useSSO, tableName } = config;
const awsConfig = {
  region: awsRegion,
};
if (useSSO) {
  awsConfig.credentials = fromSSO({ profile: ssoProfile });
}
const dynamoDBClient = new DynamoDBClient(awsConfig);
const docClient = DynamoDBDocumentClient.from(dynamoDBClient);

export async function writeToDynamoDB(items) {
  try {
    const promises = items.map((item) =>
      docClient.send(
        new PutCommand({
          TableName: tableName,
          Item: { ...item, timestamp: new Date().toISOString() },
        }),
      ),
    );
    return Promise.all(promises);
  } catch (err) {
    console.error("Error writing to DynamoDB:", err);
  }
}
