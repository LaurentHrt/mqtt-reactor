import { zigbeeStrategyConfig } from "../config.js";
import { isDuplicate } from "./deduplication.js";

export function zigbeeStrategy(topic, payload) {
  const topicElements = topic.split("/");
  if (topicElements.length !== 5) {
    console.log("Wrong topic naming");
    return [];
  }

  const [, , room, dataType, location] = topicElements;
  const entries = [];

  // Remove null  and undefined values
  const commonData = Object.fromEntries(
    Object.entries(payload)
      .filter(([key, value]) => zigbeeStrategyConfig.deviceKeys.includes(key) && value != null)
  );

  if (topic === "zigbee2mqtt/home/sdb/lumiere/dual") {
    entries.push(
      {
        deviceId: `${room}-${dataType}-plafond`,
        state: payload.state_l1,
      },
      {
        deviceId: `${room}-${dataType}-miroir`,
        state: payload.state_l2,
      },
      {
        deviceId: `${room}-${dataType}-${location}`,
        ...commonData,
      },
    );
  } else if (topic === "zigbee2mqtt/home/cuisine/lumiere/dual") {
    entries.push(
      {
        deviceId: `${room}-${dataType}-planDeTravail`,
        state: payload.state_l1,
      },
      {
        deviceId: `${room}-${dataType}-plafond`,
        state: payload.state_l2,
      },
      {
        deviceId: `${room}-${dataType}-${location}`,
        ...commonData,
      },
    );
  } else {
    entries.push({
      deviceId: `${room}-${dataType}-${location}`,
      ...commonData,
    });
  }

  const entriesWithoutDuplicated = entries.filter(
    (entry) => !isDuplicate(entry.deviceId, entry),
  );

  return entriesWithoutDuplicated;
}
