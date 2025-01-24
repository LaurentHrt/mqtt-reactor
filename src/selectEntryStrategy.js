import { pingStrategy } from "./pingStrategy.js";
import { zigbeeStrategy } from "./zigbeeStrategy.js";

export function selectEntryStrategy(topic) {
  if (topic.startsWith("zigbee2mqtt")) {
    return zigbeeStrategy;
  } else if (topic.startsWith("ping2mqtt")) {
    return pingStrategy;
  } else {
    return () => [];
  }
}
