import { expect, it, describe, vi } from "vitest";
import { processMessage } from "./processMessage";

describe("processMessage", () => {
  it("should call writeToDB method once", () => {
    const topic = "zigbee2mqtt/home/sdb/lumiere/location";
    const message = "{}";
    const mock = vi.fn();
    processMessage(topic, message, mock);

    expect(mock).toHaveBeenCalled();
    expect(mock).toHaveBeenCalledOnce();
    expect(mock).toHaveBeenCalledWith([{ deviceId: "sdb-lumiere-location" }]);
  });

  it("should not send bad JSON", () => {
    const topic = "zigbee2mqtt/home/sdb/lumiere/location";
    const message = "BAD JSON";
    const mock = vi.fn();

    processMessage(topic, message, mock);
    expect(mock).not.toHaveBeenCalled();
  });
});
