import { selectEntryStrategy } from "../../entryStrategies/selectEntryStrategy.js";
import { selectDBStrategy } from "./selectDBStrategy.js";
import { processMessage } from "./processMessage.js";

let dbStrategy;

export const saveStrat = {
  init: async () => {
    dbStrategy = await selectDBStrategy();
    console.log("SaveStrategy initialized");
  },
  end: () => {
    dbStrategy.end();
    console.log("End SaveStrategy");
  },
  onMessage: (topic, message) => {
    processMessage(
      topic,
      message,
      selectEntryStrategy(topic),
      dbStrategy.write,
    );
  },
};
