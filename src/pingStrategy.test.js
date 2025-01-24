import { describe, it, expect } from "vitest";
import { pingStrategy } from "./pingStrategy";

describe("pingStrategy", () => {
  it("should handle a single standard topic correctly", () => {
    const topic = "ping2mqtt/iphone/status";
    const payload = {
      status: "ON",
    };

    const result = pingStrategy(topic, payload);
    expect(result).toEqual([
      {
        deviceId: "iphone-status",
        status: "ON",
      },
    ]);
  });

  it("should return an empty array for an invalid topic", () => {
    const topic = "invalid/topic/structure/too/long";
    const payload = {
      status: null,
    };

    const result = pingStrategy(topic, payload);
    expect(result).toEqual([]);
  });
});
