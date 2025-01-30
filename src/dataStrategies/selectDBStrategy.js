import { initializeDynamoDB } from "./dynamoDBStrategy.js";
import { initializeFileSystem } from "./fileSystemStrategy.js";
import config from "../config.js";

const DB_STRATEGY = Object.freeze({
  FS: "filesystem",
  DynamoDB: "dynamodb",
  None: "none",
});

export async function selectDBStrategy() {
  const strategy = config.dbStrategy;
  console.log("Selecting DB strategy:", strategy);

  if (strategy === DB_STRATEGY.DynamoDB) {
    return initializeDynamoDB();
  } else if (strategy === DB_STRATEGY.FS) {
    return await initializeFileSystem();
  } else {
    return {
      end: () => {},
      write: () => {
        console.log("No DB strategy, writing is disabled");
      },
    };
  }
}
