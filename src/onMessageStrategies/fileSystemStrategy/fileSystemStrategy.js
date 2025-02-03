import * as fs from "node:fs/promises";
import { config } from "../../config.js";
import { resolve } from "node:path";
import { selectEntryStrategy } from "../../entryStrategies/selectEntryStrategy.js";

let file;

export const fileSystemStrategy = {
  init: async () => {
    const path = resolve(process.cwd(), config.dbDirectory);
    const pathToFile = resolve(path, config.dbFilename);

    try {
      const dir = await fs.opendir(path);
      await dir.close();
    } catch (err) {
      if (err.code === "ENOENT") {
        console.log("DB directory does not exist. Initializing...");
        await fs.mkdir(path);
      } else {
        throw err;
      }
    }

    file = await fs.open(pathToFile, "a");
    console.log("FileSystem strategy initialized");
  },
  end: () => {
    file.close();
  },
  onMessage: (topic, messageBuffer) => {
    try {
      const message = messageBuffer.toString();
      const payload = JSON.parse(message);
      const entryStrategy = selectEntryStrategy(topic);
      const entries = entryStrategy(topic, payload);

      if (entries.length) {
        try {
          const string = JSON.stringify(entries);
          file.write(string).then(() => {
            console.log(
              "Data written to filesystem for device:",
              entries.map((entry) => entry.deviceId),
            );
          });
        } catch (err) {
          console.error("Error writing to filesystem:", err);
        }
      }
    } catch (err) {
      console.error("Error processing message:", err);
    }
  },
};
