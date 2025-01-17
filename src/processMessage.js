import { prepareDBEntries } from "./prepareDBEntries.js";
import { isDuplicate } from "./deduplication.js";

export async function processMessage(topic, messageBuffer, writeToDB) {
  try {
    const message = messageBuffer.toString();
    const payload = JSON.parse(message);
    const entries = prepareDBEntries(topic, payload);

    const entriesWithoutDuplicated = entries.filter(
      (entry) => !isDuplicate(entry.deviceId, entry),
    );

    if (entriesWithoutDuplicated.length) {
      await writeToDB(entriesWithoutDuplicated);
      console.log("Data written to DynamoDB for topic:", topic);
    }
  } catch (err) {
    console.error("Error processing message:", err);
  }
}
