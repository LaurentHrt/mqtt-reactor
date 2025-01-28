import * as fs from "node:fs/promises";
import config from "./config.js";
import { resolve } from "node:path";

export async function initializeFileSystem() {
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

  const file = await fs.open(pathToFile, "a");

  async function write(items) {
    try {
      const string = JSON.stringify(items);
      file.write(string).then(() => {
        console.log(
          "Data written to filesystem for device:",
          items.map((item) => item.deviceId),
        );
      });
    } catch (err) {
      console.error("Error writing to filesystem:", err);
    }
  }

  async function end() {
    file.close();
  }

  console.log("FileSystem initialized");

  return { write, end };
}
