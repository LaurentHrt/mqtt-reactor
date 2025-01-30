import { isDuplicate } from "../deduplication.js";

export function pingStrategy(topic, payload) {
  const topicElements = topic.split("/");
  if (topicElements.length !== 3) {
    console.log("Wrong topic naming");
    return [];
  }
  const [, device, status] = topicElements;
  const entries = [];

  // Remove null  and undefined values
  const commonData = Object.fromEntries(
    Object.entries({
      status: payload.status,
    }).filter(([_, value]) => value !== null && value !== undefined),
  );

  entries.push({ deviceId: `${device}-${status}`, ...commonData });

  const entriesWithoutDuplicated = entries.filter(
    (entry) => !isDuplicate(entry.deviceId, entry),
  );

  return entriesWithoutDuplicated;
}
