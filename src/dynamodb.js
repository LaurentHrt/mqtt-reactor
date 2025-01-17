import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { fromSSO } from "@aws-sdk/credential-providers";
import { PutCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

export function initializeDynamoDB(config) {
  const { awsRegion, ssoProfile, useSSO, tableName } = config;
  const awsConfig = {
    region: awsRegion,
  };
  if (useSSO) {
    awsConfig.credentials = fromSSO({ profile: ssoProfile });
  }
  const dynamoDBClient = new DynamoDBClient(awsConfig);
  const docClient = DynamoDBDocumentClient.from(dynamoDBClient);

  async function write(items) {
    try {
      const promises = items.map((item) =>
        docClient
          .send(
            new PutCommand({
              TableName: tableName,
              Item: { ...item, timestamp: new Date().toISOString() },
            }),
          )
          .then(() =>
            console.log("Data written to DynamoDB for device:", item.deviceId),
          ),
      );
      Promise.all(promises);
    } catch (err) {
      console.error("Error writing to DynamoDB:", err);
    }
  }

  return { write };
}
