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
    Object.entries({
      temperature: payload.temperature,
      humidity: payload.humidity,
      energy: payload.energy,
      state: payload.state,
      occupancy: payload.occupancy,
      current: payload.current,
      power: payload.power,
      moving: payload.moving,
      position: payload.position,
      action: payload.action,
      status: payload.status,
    }).filter(([_, value]) => value !== null && value !== undefined),
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
