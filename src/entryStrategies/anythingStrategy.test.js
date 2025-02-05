import { describe, it, expect } from "vitest";
import { anythingStrategy } from "./anythingStrategy.js";

describe("anythingStrategy", () => {
  it("should handle a single standard topic correctly", () => {
    const topic = "anything2mqtt/elt1/elt2/elt3";
    const payload = {
      hc: 22.5,
      hp: 55,
    };

    const result = anythingStrategy(topic, payload);
    expect(result).toEqual([
      {
        deviceId: "elt1-elt2-elt3",
        hc: 22.5,
        hp: 55,
      },
    ]);
  });
});
